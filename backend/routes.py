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

@app.route("/register_customer", methods=['POST'])
def register_customer():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    username = data.get('username')
    name = data.get('full_name')
    phone_no = data.get('phone_no')
    gender = data.get('gender')
    address = data.get('address')
    pin_code = data.get('pin_code')
    role = data.get('role')

    # Validate input fields
    if not email or not password or role != 'customer':
        return jsonify({'message': 'Email, password, and the role "customer" are required'}), 400
    if not name or not phone_no or not gender or not address or not pin_code:
        return jsonify({'message': 'Full name, phone number, gender, address, and pin code are required'}), 400

    # Check if the user already exists
    user = datastore.find_user(email=email)
    if user:
        return jsonify({'message': 'User already exists'}), 400

    # Assign profile picture based on gender
    if gender == "Male":
        profile_pic = "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1739114421/default_pic/ido90awmqkwdtveme9h3.png"
    elif gender == "Female":
        profile_pic = "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1739114431/default_pic/h0kiyvh0a679w4xivqie.jpg"
    # Create the customer user
    try:
        new_user = datastore.create_user(
            email=email,
            password=hash_password(password),
            username=username,
            roles=['customer']
        )
        db.session.add(new_user)
        db.session.commit()

        # Add additional details in the Customer table
        customer = Customer(
            user_id=new_user.id,
            name=name,
            phone_no=phone_no,
            gender=gender,
            address=address,
            pin_code=pin_code,
            email=email,
            profile_pic=profile_pic  # Store the assigned profile picture
        )
        db.session.add(customer)
        db.session.commit()

        return jsonify({'message': 'Customer successfully registered'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500


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
        profile_picture_url = request.form.get('profile_picture_url')  # Handle profile picture

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
        
        # Assign default profile picture based on gender if none is provided
        if not profile_picture_url:
            if gender == "Male":
                profile_picture_url = "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1739114421/default_pic/ido90awmqkwdtveme9h3.png"
            elif gender == "Female":
                profile_picture_url = "https://res.cloudinary.com/dfcpm3kmc/image/upload/v1739114431/default_pic/h0kiyvh0a679w4xivqie.jpg"

        # Upload the document to Cloudinary
        try:
            document_result = cloudinary.uploader.upload(
                document,
                resource_type="auto",
                folder="professional_documents"
            )
            document_url = document_result['url']
            print("Document uploaded to Cloudinary:", document_url)
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
        
        # Fetch the Service object for the provided service_type
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
            document_url=document_url,
            profile_picture_url=profile_picture_url  # Use correct column name here
        )
        
        db.session.add(professional)
        db.session.commit()

        # Add the professional_service entry
        professional_service = ProfessionalService(
            professional_id=professional.id,
            service_id=service.id,
            custom_price=None,
            custom_description=None,
        )
        
        db.session.add(professional_service)
        db.session.commit()
        
        return jsonify({'message': 'Professional successfully registered'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'message': str(e)}), 500
