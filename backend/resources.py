from datetime import datetime, timezone
import cloudinary
from flask_login import current_user
from flask_restful import Resource, Api, fields, marshal, marshal_with
from backend.models import ProfessionalService, ServiceRequest, db, Customer, ServiceProfessional, User, Role, UserRoles, Service
from flask import current_app as app, request, jsonify
from flask_security import auth_required, hash_password
from sqlalchemy.orm import joinedload

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
# Fields for ProfessionalService
professional_service_fields = {
    'id': fields.Integer,
    'service_id': fields.Integer,
    'custom_price': fields.Integer,
    'custom_description': fields.String,
    'custom_time_required': fields.String,
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
    'custom_services': fields.List(fields.Nested(professional_service_fields)),
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

# Define a field structure for marshalling service request data
service_request_fields = {
    'id': fields.Integer,
    'service_id': fields.Integer,
    'customer_id': fields.Integer,
    'professional_id': fields.Integer,
    'service_status': fields.String,
    'date_of_request': fields.DateTime,
    'date_of_completion': fields.DateTime,
    'remarks': fields.String,
    'rating': fields.Integer,
    'customer_rating': fields.Integer,
    'customer_remarks': fields.String,
    'requested_date': fields.String,
    'requested_time': fields.String,
    'customer': fields.Nested(customer_fields),  # Add nested customer details
    'service': fields.Nested(service_fields),    # Add nested service details
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
    @marshal_with(service_professional_fields)
    def get(self, professional_id):
        try:
            # Fetch professional along with related custom_services
            professional = ServiceProfessional.query.get_or_404(professional_id)
            return professional  # Marshaled with service_professional_fields
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
            services = Service.query.all()  # Fetch all services
            return services, 200
        except Exception as e:
            return {'message': f"Error fetching services: {str(e)}"}, 500
    
    @auth_required('token')
    @marshal_with(service_fields)
    def post(self):
        # Get form data
        name = request.form.get('name')
        description = request.form.get('description')
        base_price = request.form.get('base_price')
        base_time_required = request.form.get('base_time_required')
        
        # Basic validation for required fields
        if not name or not description or not base_price or not base_time_required:
            return {'message': 'Missing required fields'}, 400
        
        try:
            # Convert base_price and base_time_required to correct types
            base_price = float(base_price)
            base_time_required = int(base_time_required)
        except ValueError:
            return {'message': 'Invalid data types for base_price or base_time_required'}, 400
        
        # Handle picture upload (if any)
        picture = request.files.get('picture')  # Get the uploaded picture

        image_url = None  # Default to None if no picture

        if picture:
            try:
                # Upload to Cloudinary and get the image URL
                upload_result = cloudinary.uploader.upload(
                    picture,
                    folder="services"  # Folder where images will be stored in Cloudinary
                )
                image_url = upload_result['secure_url']  # Get the URL of the uploaded image
            except Exception as e:
                return {'message': f"Error uploading image: {str(e)}"}, 500
        
        # Create a new service entry
        new_service = Service(
            name=name,
            description=description,
            base_price=base_price,
            base_time_required=base_time_required,
            image_url=image_url  # Store the Cloudinary image URL
        )
        
        try:
            # Add the new service to the database and commit
            db.session.add(new_service)
            db.session.commit()

            # Return success response
            return {
                'message': 'Service added successfully',
                'service_id': new_service.id,
                'image_url': image_url  # Include image URL in response for confirmation
            }, 200

        except Exception as e:
            db.session.rollback()  # Rollback any changes if there's an error in committing
            return {'message': f"Error adding service: {str(e)}"}, 500
        
        
from cloudinary.uploader import upload
from cloudinary.exceptions import Error as CloudinaryError

class ServiceResource(Resource):
    @auth_required('token')
    @marshal_with(service_fields)
    def get(self, service_id):
        try:
            service = Service.query.get_or_404(service_id)
            return service, 200
        except Exception as e:
            return {'message': f"Error fetching service: {str(e)}"}, 500
        
    @auth_required('token')
    def put(self, service_id):
        try:
            # Fetch the service to update
            service = Service.query.get_or_404(service_id)

            # Get form data (excluding the image)
            name = request.form.get('name', service.name)
            description = request.form.get('description', service.description)
            base_price = request.form.get('base_price', service.base_price)
            base_time_required = request.form.get('base_time_required', service.base_time_required)

            # Basic validation for required fields
            if not name or not description or not base_price or not base_time_required:
                return {'message': 'Missing required fields'}, 400

            try:
                # Convert base_price and base_time_required to correct types
                base_price = float(base_price)
                base_time_required = int(base_time_required)
            except ValueError:
                return {'message': 'Invalid data types for base_price or base_time_required'}, 400

            # Update service details
            service.name = name
            service.description = description
            service.base_price = base_price
            service.base_time_required = base_time_required

            # Handle picture upload if included
            picture = request.files.get('picture')  # Get the uploaded picture (if any)
            print(f"Picture received: {picture}")  # Check if the picture is being received

            if picture:
                try:
                    # Upload to Cloudinary and get the image URL
                    upload_result = cloudinary.uploader.upload(
                        picture,
                        folder="services"  # Folder where images will be stored in Cloudinary
                    )
                    # Get the URL of the uploaded image
                    service.image_url = upload_result['secure_url']
                except Exception as e:
                    return {'message': f"Error uploading image: {str(e)}"}, 500

            # Commit the changes to the database
            db.session.commit()

            # Return the updated service details, including the image URL
            return {'message': 'Service updated successfully', 'image_url': service.image_url}, 200

        except Exception as e:
            db.session.rollback()  # Rollback any changes if there's an error
            return {'message': f"Error updating service: {str(e)}"}, 500


    @auth_required('token')
    def delete(self, service_id):
        try:
            service = Service.query.get_or_404(service_id)
            db.session.delete(service)
            db.session.commit()
            return {'message': 'Service deleted successfully'}, 200
        except Exception as e:
            return {'message': f"Error deleting service: {str(e)}"}, 500
    

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
            return {"message": "Invalid action"}, 400  # Use plain dict

        # Fetch the service professional by id
        professional = ServiceProfessional.query.get(id)
        if not professional:
            return {"message": "Professional not found"}, 404  # Use plain dict

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
            return {"message": f"Professional {action}d successfully."}, 200  # Use plain dict
        except Exception as e:
            db.session.rollback()
            print(f"Error during {action}: {str(e)}")
            return {"message": f"Error updating professional status: {str(e)}"}, 500  # Use plain dict

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
# In resources.py or a similar file where you define your RESTful resources

# from backend.models import ServiceRequest, db
# from datetime import datetime


class ServiceRequestListResource(Resource):
    """
    Use this resource to retrieve all service requests or create a new one.
    Example usage:
      GET /api/service_requests
      POST /api/service_requests
    """
    @auth_required('token')
    @marshal_with(service_request_fields)   
    def get(self):
        try:
            service_requests = ServiceRequest.query.all()
            return service_requests, 200
        except Exception as e:
            return {'message': f"Error fetching service requests: {str(e)}"}, 500

    @auth_required('token')
    def post(self):
        """
        Create a new service request. 
        The request body should include:
        {
            "service_id": ...,
            "customer_id": ...,
            "professional_id": ...,
            "requested_date": "...",
            "requested_time": "...",
            "remarks": "..."
        }
        """
        try:
            data = request.get_json()
            new_request = ServiceRequest(
                service_id=data['service_id'],
                customer_id=data['customer_id'],
                professional_id=data['professional_id'],
                date_of_request=datetime.now(timezone.utc),
                service_status="requested",
                remarks=data.get('remarks'),
                requested_date=data.get('requested_date'),
                requested_time=data.get('requested_time')
            )
            db.session.add(new_request)
            db.session.commit()
            return {'message': 'Service request created successfully'}, 201
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

class SingleServiceRequestResource(Resource):
    """
    Use this resource to retrieve, update, or delete a single service request by ID.
    Example usage:
      GET /api/service_requests/<int:request_id>
      PATCH /api/service_requests/<int:request_id>
      DELETE /api/service_requests/<int:request_id>
    """
    @auth_required('token')
    @marshal_with(service_request_fields)
    def get(self, request_id):
        try:
            service_request = ServiceRequest.query.get_or_404(request_id)
            return service_request, 200
        except Exception as e:
            return {'message': str(e)}, 500

    @auth_required('token')
    def patch(self, request_id):
        """
        You can partially update the service request here. 
        For example, to update the remarks or status:
        {
            "service_status": "...",
            "remarks": "...",
            "rating": ...
        }
        """
        try:
            data = request.get_json()
            service_request = ServiceRequest.query.get_or_404(request_id)
            if 'service_status' in data:
                service_request.service_status = data['service_status']
            if 'remarks' in data:
                service_request.remarks = data['remarks']
            if 'rating' in data:
                service_request.rating = data['rating']
            db.session.commit()
            return {'message': f"Service request {request_id} updated successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

    @auth_required('token')
    def delete(self, request_id):
        """
        Delete a service request by ID.
        """
        try:
            service_request = ServiceRequest.query.get_or_404(request_id)
            db.session.delete(service_request)
            db.session.commit()
            return {'message': f'Service request {request_id} deleted successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

class AcceptServiceRequestResource(Resource):
    """
    POST /api/service_requests/<int:request_id>/accept
    """
    @auth_required('token')
    def post(self, request_id):
        try:
            service_request = ServiceRequest.query.get_or_404(request_id)

            if service_request.service_status != "requested":
                return {'message': 'Cannot accept service request unless it is in "requested" status'}, 400

            service_request.service_status = "accepted"
            db.session.commit()
            return {'message': f'Service request {request_id} accepted'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

class RejectServiceRequestResource(Resource):
    """
    POST /api/service_requests/<int:request_id>/reject
    """
    @auth_required('token')
    def post(self, request_id):
        try:
            service_request = ServiceRequest.query.get_or_404(request_id)

            if service_request.service_status != "requested":
                return {'message': 'Cannot reject service request unless it is in "requested" status'}, 400

            service_request.service_status = "rejected"
            db.session.commit()
            return {'message': f'Service request {request_id} rejected'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500

class CloseServiceRequestResource(Resource):
    """
    POST /api/service_requests/<int:request_id>/close
    This endpoint finalizes a service request by marking it as completed.
    You can also handle rating or remarks in the request body:
    {
      "customerRating": X,
      "customerRemark": "..."
    }
    """
    @auth_required('token')
    def post(self, request_id):
        try:
            data = request.get_json()
            rating = data.get("customerRating")
            remarks = data.get("customerRemark")

            service_request = ServiceRequest.query.get_or_404(request_id)

            if service_request.service_status != "accepted":
                return {'message': 'Cannot close a service request unless it is in "accepted" status'}, 400

            service_request.service_status = "completed"
            service_request.date_of_completion = datetime.now(timezone.utc)
            service_request.customer_rating = rating
            service_request.customer_remarks = remarks

            db.session.commit()
            return {'message': f'Service request {request_id} closed successfully'}, 200
        except Exception as e:
            db.session.rollback()
            return {'message': str(e)}, 500
# In your resources.py or a central file where you register your APIs

# Assuming 'api' is your Api() instance
api.add_resource(ServiceRequestListResource, '/service_requests')
api.add_resource(SingleServiceRequestResource, '/service_requests/<int:request_id>')
api.add_resource(AcceptServiceRequestResource, '/service_requests/<int:request_id>/accept')
api.add_resource(RejectServiceRequestResource, '/service_requests/<int:request_id>/reject')
api.add_resource(CloseServiceRequestResource, '/service_requests/<int:request_id>/close')

# Ensure this resource is properly registered

class ServiceRequestResource(Resource):
    @auth_required('token')
    def post(self):
        try:
            data = request.get_json()
            print("Received data:", data)  # Debug log

            required_fields = ['professional_id', 'service_id', 'customer_id', 'requested_date', 'requested_time']
            for field in required_fields:
                if field not in data:
                    return {'message': f'Missing {field} field'}, 400

            # Convert requested_date to a datetime object
            requested_date = datetime.strptime(data['requested_date'], '%Y-%m-%d').date()

            # Convert requested_time to a time object (optional, based on how your database handles time)
            requested_time = datetime.strptime(data['requested_time'], '%H:%M').time()

            new_request = ServiceRequest(
                service_id=data['service_id'],
                customer_id=data['customer_id'],
                professional_id=data['professional_id'],
                date_of_request=datetime.now(timezone.utc),
                service_status="requested",
                requested_date=requested_date,  # Use converted date
                requested_time=requested_time,  # Use converted time
            )

            db.session.add(new_request)
            db.session.commit()

            return {'message': 'Service request created successfully', 'id': new_request.id}, 201

        except Exception as e:
            db.session.rollback()
            print("Error creating service request:", str(e))
            return {'message': str(e)}, 500

# Add this at the bottom of the file
api.add_resource(ServiceRequestResource, '/book-service')
from sqlalchemy.orm import joinedload

class ProfessionalServiceRequestsResource(Resource):
    @auth_required('token')
    def get(self, professional_id):
        try:
            # Fetch service requests for the professional and include customer and service details
            service_requests = ServiceRequest.query \
                .filter_by(professional_id=professional_id) \
                .options(joinedload(ServiceRequest.service)) \
                .options(joinedload(ServiceRequest.customer)) \
                .all()
            
            # Marshal and return the data
            return marshal(service_requests, service_request_fields), 200
        except Exception as e:
            return {'message': str(e)}, 500

api.add_resource(ProfessionalServiceRequestsResource, '/service_requests/professional/<int:professional_id>')
from datetime import date

class TodayServiceRequestsResource(Resource):
    @auth_required('token')
    def get(self, professional_id):
        try:
            today = date.today()
            service_requests = ServiceRequest.query.filter(
                ServiceRequest.professional_id == professional_id,
                ServiceRequest.requested_date == today
            ).all()
            return marshal(service_requests, service_request_fields), 200
        except Exception as e:
            return {'message': str(e)}, 500

api.add_resource(TodayServiceRequestsResource, '/service_requests/professional/<int:professional_id>/today')

# class ProfessionalServiceRequests(Resource):
#     @auth_required('token')
#     def get(self, professional_id):
#         try:
#             # Verify the professional exists and matches current user
#             if str(current_user.id) != str(professional_id):
#                 return {"message": "Unauthorized access"}, 403

#             # Fetch all service requests for this professional
#             service_requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()
            
#             # Format the response data
#             requests_data = []
#             for request in service_requests:
#                 # Get customer details
#                 customer = User.query.get(request.customer_id)
#                 # Get service details
#                 service = Service.query.get(request.service_id)
                
#                 requests_data.append({
#                     "id": request.id,
#                     "customer_name": f"{customer.name}" if customer else "Unknown Customer",
#                     "service_name": service.name if service else "Unknown Service",
#                     "requested_date": request.requested_date.isoformat() if request.requested_date else None,
#                     "completion_date": request.completion_date.isoformat() if request.completion_date else None,
#                     "service_status": request.service_status,
#                     "completion_notes": request.completion_notes
#                 })

#             return jsonify(requests_data)

#         except Exception as e:
#             db.session.rollback()
#             return {"message": f"Error fetching service requests: {str(e)}"}, 500
        
# api.add_resource(ProfessionalServiceRequests, '/api/professional/<int:professional_id>/service-requests')