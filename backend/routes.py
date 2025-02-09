from datetime import datetime
import cloudinary
from flask import current_app as app, jsonify, render_template, request, send_file
from flask_login import login_user
from flask_security import auth_required, verify_password, hash_password
from backend.models import Customer, ProfessionalService, Service, ServiceProfessional, db
datastore = app.security.datastore
cache = app.cache
from backend.models import User
# from backend.celery.tasks import add, create_csv
from celery.result import AsyncResult

@app.get('/')
def home():
    return render_template('index.html')

@app.get("/celery")
def celery():
    task = add.delay(1, 2)
    return jsonify({"task_id": task.id})

@app.get("/celery/<task_id>")
def celery_result(task_id):
    task = add.AsyncResult(task_id)
    return jsonify({"task_status": task.status, "task_result": task.result})

@app.get("/create_csv")
def get_create_csv():
    task = create_csv.delay()
    return jsonify({"task_id": task.id}), 200

@app.get("/get_csv/<task_id>")
def get_csv(task_id):
    task = AsyncResult(task_id)
    if task.status == "SUCCESS":
        return send_file(task.result, as_attachment=True)
    return jsonify({"task_status": task.status}), 200

@app.get("/cache")
@cache.cached(timeout=5)
def cache():
    return {"date": str(datetime.now())}


@app.route("/login", methods=['POST'])
def login():
    data = request.get_json()  # Getting the data from the request body
    email = data.get('email')
    password = data.get('password')
    user = datastore.find_user(email=email)  # Finding the user by email
    
    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400
    if user is None:
        return jsonify({'message': 'User not found'}), 404
    if verify_password(password, user.password):
        # Access roles as a list, assuming it's a many-to-many relationship
        role = user.roles[0].name if user.roles else None  # Get the role name, or None if no roles

        if role == 'customer':
            customer = Customer.query.filter_by(user_id=user.id).first()
            if customer:
                return jsonify({
                    "token": user.get_auth_token(),
                    "email": user.email,
                    "role": role,
                    "user_id": user.id,
                    "customer_id": customer.id,  # Directly include customer ID
                    "customer_name": customer.name  # Include customer name
                }), 200
            else:
                return jsonify({'message': 'Customer not found'}), 404
        elif role == 'professional':
            professional = ServiceProfessional.query.filter_by(user_id=user.id).first()
            if professional:
                return jsonify({
                    "token": user.get_auth_token(),
                    "email": user.email,
                    "role": role,
                    "user_id": user.id,
                    "professional_id": professional.id,  # Directly include professional ID
                    "professional_name": professional.name  # Include professional name
                }), 200
            else:
                return jsonify({'message': 'Professional not found'}), 404
        else:
            
            return jsonify({"token": user.get_auth_token(), "email": user.email, "role": user.roles[0].name, "id": user.id}), 200


    return jsonify({'message': 'Invalid credentials'}), 404

@app.route("/register_professional", methods=['POST'])
def register_professional():
    try:
        # Parse form data
        email = request.form.get('email')
        password = request.form.get('pwd')  # Match frontend field names
        username = request.form.get('uname')  # Match frontend field names
        name = request.form.get('full_name')
        phone_no = request.form.get('phone_no')
        gender = request.form.get('gender')
        address = request.form.get('address')
        pin_code = request.form.get('pin_code')
        service_type = request.form.get('service_type')
        experience = request.form.get('experience')
        role = request.form.get('role')
        document = request.files.get('document')  # Professional document

        # Validate input fields
        if not email or not password or role != 'professional':
            return jsonify({'message': 'Email, password, and the role "professional" are required'}), 400
        if not name or not phone_no or not gender or not address or not pin_code or not service_type or not experience:
            return jsonify({'message': 'All fields are required'}), 400
        if not document:
            return jsonify({'message': 'Document upload is required'}), 400

        # Check if the user already exists
        user = datastore.find_user(email=email)
        if user:
            return jsonify({'message': 'User already exists'}), 400

        # Upload the document to Cloudinary
        try:
            document_result = cloudinary.uploader.upload(
                document,
                resource_type="auto",
                folder="professional_documents"
            )
            document_url = document_result['url']
            print("Document uploaded to Cloudinary:", document_url)  # Check if upload was successful
        except Exception as cloudinary_error:
            print("Error uploading document to Cloudinary:", cloudinary_error)
            return jsonify({'message': 'Failed to upload document to Cloudinary'}), 500

        # Create the professional user
        new_user = datastore.create_user(
            email=email,
            password=hash_password(password),
            username=username,
            roles=['professional']
        )
        db.session.add(new_user)
        db.session.commit()
        # Instead of using `service_type`, fetch the Service object
        service = Service.query.filter_by(name=service_type).first()
        if not service:
            return jsonify({'message': 'Invalid service type provided'}), 400
        # Add the professional details in the ServiceProfessional table
        professional = ServiceProfessional(
            user_id=new_user.id,
            name=name,
            phone_no=phone_no,
            gender=gender,
            address=address,
            pin_code=pin_code,
            email=email,
            service_type=service_type,
            experience=experience,
            document_url=document_url
        )
        db.session.add(professional)
        db.session.commit()  # Commit the professional data first

        # Now add the professional_service
        professional_service = ProfessionalService(
            professional_id=professional.id,  # Link the professional via their ID
            service_id=service.id,  # Use the selected service type directly
            custom_price=None,  # You can add custom price and other fields here if needed
            custom_description=None,
        )

        db.session.add(professional_service)  # Add the professional_service to the session
        db.session.commit()  # Commit the professional_service data




        return jsonify({'message': 'Professional successfully registered'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
