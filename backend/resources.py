from flask_restful import Resource, Api, fields, marshal_with
from backend.models import ProfessionalService, db, Customer, ServiceProfessional, User, Role, UserRoles, Service
from flask import current_app as app, request, jsonify
from flask_security import auth_required, hash_password

api = Api(prefix='/api')
cache=app.cache
# Define the fields for marshalling the Customer data
customer_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'name': fields.String,
    'email': fields.String,
    'address': fields.String,
    'pin_code': fields.String,
    'phone_no': fields.Integer,
    'gender': fields.String,
    'profile_pic': fields.String,
    'average_rating': fields.Float,
    'is_blocked': fields.Boolean,
}

# Define the fields for marshalling the Service Professional data
service_professional_fields = {
    'id': fields.Integer,
    'username': fields.String,
    'name': fields.String,
    'service_type': fields.String,
    'experience': fields.Integer,
    'phone_no': fields.Integer,
    'email': fields.String,
    'address': fields.String,
    'pin_code': fields.String,
    'verified_status': fields.String,
    'gender': fields.String,
    'profile_pic': fields.String,
    'average_rating': fields.Float,
    'document': fields.String,
    'block_status': fields.Boolean,
}

# Define the fields for marshalling the Service data
service_fields = {
    'id': fields.Integer,
    'name': fields.String,
    'base_price': fields.Integer,
    'base_time_required': fields.String,
    'description': fields.String,
    'image_url': fields.String,
}

class CustomerResource(Resource):
    @auth_required('token')
    # @cache.memoize()
    @marshal_with(customer_fields)
    def get(self, customer_id):
        try:
            customer = Customer.query.get_or_404(customer_id)
            return customer
        except Exception as e:
            return {'message': str(e)}, 500

    @auth_required('token')
    def delete(self, customer_id):
        try:
            customer = Customer.query.get_or_404(customer_id)
            db.session.delete(customer)
            db.session.commit()
            return {'message': 'Customer deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

class ServiceProfessionalResource(Resource):
    @auth_required('token')
    @cache.memoize()
    @marshal_with(service_professional_fields)
    def get(self, professional_id):
        try:
            professional = ServiceProfessional.query.get_or_404(professional_id)
            return professional
        except Exception as e:
            return {'message': str(e)}, 500

    @auth_required('token')
    def delete(self, professional_id):
        try:
            professional = ServiceProfessional.query.get_or_404(professional_id)
            db.session.delete(professional)
            db.session.commit()
            return {'message': 'Service Professional deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

class AllCustomersResource(Resource):
    @marshal_with(customer_fields)
    @auth_required('token')
    def get(self):
        try:
            customers = Customer.query.all()
            return customers
        except Exception as e:
            return {'message': str(e)}, 500

    @auth_required('token')
    def post(self):
        try:
            data = request.get_json()
            new_user = User(
                email=data['email'],
                password=hash_password(data['password']),
                username=data['username'],
                fs_uniquifier=data['username'] + "_unique"
            )
            db.session.add(new_user)
            db.session.commit()

            customer_role = Role.query.filter_by(name='customer').first()
            user_role = UserRoles(user_id=new_user.id, role_id=customer_role.id)
            db.session.add(user_role)
            db.session.commit()

            new_customer = Customer(
                user_id=new_user.id,
                username=data['username'],
                password=hash_password(data['password']),
                name=data['name'],
                email=data['email'],
                address=data['address'],
                pin_code=data['pin_code'],
                phone_no=data['phone_no'],
                gender=data.get('gender'),
                profile_pic=data.get('profile_pic'),
                average_rating=data.get('average_rating', 0.0),
                is_blocked=data.get('is_blocked', False)
            )
            db.session.add(new_customer)
            db.session.commit()
            return {'message': 'Customer created successfully'}, 201
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

class AllServiceProfessionalsResource(Resource):
    @auth_required('token')
    @marshal_with(service_professional_fields)
    def get(self):
        try:
            professionals = ServiceProfessional.query.all()
            return professionals
        except Exception as e:
            return {'message': str(e)}, 500

    @auth_required('token')
    def post(self):
        try:
            data = request.get_json()
            new_user = User(
                email=data['email'],
                password=hash_password(data['password']),
                username=data['username'],
                fs_uniquifier=data['username'] + "_unique"
            )
            db.session.add(new_user)
            db.session.commit()

            professional_role = Role.query.filter_by(name='professional').first()
            user_role = UserRoles(user_id=new_user.id, role_id=professional_role.id)
            db.session.add(user_role)
            db.session.commit()

            new_professional = ServiceProfessional(
                user_id=new_user.id,
                username=data['username'],
                password=hash_password(data['password']),
                name=data['name'],
                service_type=data['service_type'],
                experience=data['experience'],
                phone_no=data['phone_no'],
                email=data['email'],
                address=data['address'],
                pin_code=data['pin_code'],
                verified_status=data.get('verified_status', 'Not verified yet'),
                gender=data.get('gender'),
                profile_pic=data.get('profile_pic'),
                average_rating=data.get('average_rating', 0.0),
                document=data.get('document'),
                block_status=data.get('block_status', False)
            )
            db.session.add(new_professional)
            db.session.commit()
            return {'message': 'Service Professional created successfully'}, 201
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

class AllServicesResource(Resource):
    @marshal_with(service_fields)
    def get(self):
        try:
            services = Service.query.all()  # Ensure this query is correct.
            return services, 200
        except Exception as e:
            return {'message': f"Error fetching services: {str(e)}"}, 500

class ServiceResource(Resource):
    @auth_required('token')
    @marshal_with(service_fields)
    def get(self, service_id):
        try:
            service = Service.query.get_or_404(service_id)
            return service, 200
        except Exception as e:
            return {'message': f"Error fetching service: {str(e)}"}, 500

class CheckUsernameAvailabilityResource(Resource):
    def get(self, username):
        try:
            # Query the database to check if the username exists
            user = User.query.filter_by(username=username).first()
            if user:
                return jsonify({"available": False, "message": "Username is already taken."})
            else:
                return jsonify({"available": True, "message": "Username is available."})
        except Exception as e:
            return jsonify({"message": str(e)}), 500
        
class ModifyProfessionalStatusResource(Resource):
    @auth_required('token')
    def post(self, action, id):
        print(f"Action: {action}, ID: {id}")

        # Validate the action
        if action not in ['approve', 'reject', 'block', 'unblock']:
            return jsonify({"message": "Invalid action"}), 400

        # Fetch the service professional by id
        professional = ServiceProfessional.query.get(id)
        if not professional:
            return jsonify({"message": "Professional not found"}), 404

        # Modify the professional's status based on the action
        try:
            if action == "approve":
                professional.verified_status = "approved"
            elif action == "reject":
                professional.verified_status = "rejected"
            elif action == "block":
                professional.block_status = True
            elif action == "unblock":
                professional.block_status = False

            db.session.commit()
            return jsonify({"message": f"Professional {action}d successfully."}), 200
        except Exception as e:
            db.session.rollback()
            print(f"Error during {action}: {str(e)}")
            return jsonify({"message": f"Error updating professional status: {str(e)}"}), 500

class ProfessionalsByServiceResource(Resource):
    # @auth_required('token')
    @marshal_with(service_professional_fields)
    def get(self, service_id):
        try:
            print(f"Fetching professionals for service_id: {service_id}")  # Debug log
            professionals = (
    ServiceProfessional.query
    .join(ProfessionalService, ServiceProfessional.id == ProfessionalService.professional_id)
    .join(Service, ProfessionalService.service_id == Service.id)
    .filter(Service.id == service_id)
    .all()
)

            print(professionals)  # Debug log
            if not professionals:
                return {'message': 'No professionals found for this service.'}, 404
            return professionals, 200
        except Exception as e:
            print(f"Error in ProfessionalsByServiceResource: {e}")  # Debug log
            return {'message': str(e)}, 500
 
        
api.add_resource(ProfessionalsByServiceResource, '/professionals-by-service/<int:service_id>')

# Register the API route
api.add_resource(ModifyProfessionalStatusResource, '/service_professionals/<string:action>/<int:id>')

# Add the new resource to the API
api.add_resource(CheckUsernameAvailabilityResource, '/check-username/<string:username>')

# Add the new resource to the API
api.add_resource(ServiceResource, '/services/<int:service_id>')

# Add the resources to the API
api.add_resource(CustomerResource, '/customers/<int:customer_id>')
api.add_resource(ServiceProfessionalResource, '/service_professionals/<int:professional_id>')
api.add_resource(AllCustomersResource, '/customers')
api.add_resource(AllServiceProfessionalsResource, '/service_professionals')
api.add_resource(AllServicesResource, '/services')
