from datetime import datetime, timezone, date
import cloudinary
from flask_login import current_user
from flask_restful import Resource, Api, fields, marshal, marshal_with
from sqlalchemy import func
from backend.models import *
from flask import Response, abort, current_app as app, request, jsonify, session
from flask_security import auth_required, hash_password
from sqlalchemy.orm import joinedload
from backend.utils import (
    calculate_average_rating_for_customer,
    calculate_average_rating_for_professional,
)


api = Api(prefix="/api")
cache = app.cache

from datetime import datetime


def format_datetime(value):
    return value.strftime("%Y-%m-%d %H:%M:%S") if isinstance(value, datetime) else "N/A"


# Define the fields for marshalling the Customer data
customer_fields = {
    "id": fields.Integer,
    "username": fields.String(
        attribute="user.username"
    ),  # ✅ Explicitly link to User model
    "name": fields.String,
    "email": fields.String,
    "address": fields.String,
    "pin_code": fields.String,
    "phone_no": fields.Integer,
    "gender": fields.String, 
    "profile_pic": fields.String,
    "average_rating": fields.Float,
    "is_blocked": fields.Boolean,
}
# Fields for ProfessionalService
professional_service_fields = {
    "id": fields.Integer,
    "service_id": fields.Integer,
    "custom_price": fields.Integer,
    "custom_description": fields.String,
    "custom_time_required": fields.String,
}
# Define the fields for marshalling the Service Professional data
service_professional_fields = {
    "id": fields.Integer,
    "username": fields.String(attribute="user.username"),
    "name": fields.String,
    "service_type": fields.String,
    "experience": fields.Integer,
    "phone_no": fields.Integer,
    "email": fields.String,
    "address": fields.String,
    "pin_code": fields.String,
    "verified_status": fields.String,
    "gender": fields.String,
    "profile_picture_url": fields.String,
    "average_rating": fields.Float(attribute=lambda x: x.calculated_average_rating),
    "document_url": fields.String,
    "block_status": fields.Boolean,
    "custom_services": fields.List(fields.Nested(professional_service_fields)),
}

# Define the fields for marshalling the Service data
service_fields = {
    "id": fields.Integer,
    "name": fields.String,
    "base_price": fields.Integer,
    "base_time_required": fields.String,
    "description": fields.String,
    "image_url": fields.String,
    "average_rating": fields.Float,
}

# Define a field structure for marshalling service request data
service_request_fields = {
    "id": fields.Integer,
    "service_id": fields.Integer,
    "customer_id": fields.Integer,
    "professional_id": fields.Integer,
    "service_status": fields.String,
    "date_of_request": fields.String,
    "date_of_completion": fields.String,
    # 'date_of_request': fields.FormattedString(lambda sr: format_datetime(sr.date_of_request)),
    # 'date_of_completion': fields.FormattedString(lambda sr: format_datetime(sr.date_of_completion)),
    "remarks": fields.String,
    "rating": fields.Integer,
    "customer_rating": fields.Integer,
    "customer_remarks": fields.String,
    "requested_date": fields.String,
    "requested_time": fields.String,
    "customer": fields.Nested(customer_fields),  # Add nested customer details
    "service": fields.Nested(service_fields),  # Add nested service details
    "professional": fields.Nested(
        service_professional_fields
    ),  # ✅ Add professional details
}

# Extend professional_service_fields to include service details
professional_service_with_details = {
    **professional_service_fields,
    "service": fields.Nested(service_fields),  # Include full service details
}


class CustomerResource(Resource):
    @auth_required("token")
    # @cache.memoize()
    @marshal_with(customer_fields)
    def get(self, customer_id):
        try:
            customer = Customer.query.get_or_404(customer_id)
            return customer
        except Exception as e:
            return {"message": str(e)}, 500

    @auth_required("token")
    def delete(self, customer_id):
        try:
            customer = Customer.query.get_or_404(customer_id)
            user = User.query.get(customer.user_id)
            wallet = Wallet.query.filter_by(customer_id=customer_id).first()
            if wallet:
                db.session.delete(wallet)
             # Perform the delete operation
            if user:
                        # Delete the customer first (this will cascade to service_requests)
                        db.session.delete(customer)
                        # Then delete the user (which will trigger the customer deletion)
                        db.session.delete(user)
            else:
                        db.session.delete(customer)
                        
            db.session.commit()
            return {"message": "Customer deleted successfully"}, 200        
                   
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class ServiceProfessionalResource(Resource):
    @auth_required("token")
    @marshal_with(service_professional_fields)
    def get(self, professional_id):
        try:
            # Fetch professional along with related custom_services
            professional = ServiceProfessional.query.get_or_404(professional_id)
            return professional  # Marshaled with service_professional_fields
        except Exception as e:
            return {"message": str(e)}, 500

    @auth_required("token")
    def delete(self, professional_id):
        try:
            professional = ServiceProfessional.query.get_or_404(professional_id)
            user = User.query.get(professional.user_id)
            prof_wallet = ProfessionalWallet.query.filter_by(professional_id=professional_id).first()
            if prof_wallet:
                db.session.delete(prof_wallet)

            if user:
                db.session.delete(professional)
                db.session.delete(user)
            else:
                db.session.delete(professional)
                
            db.session.commit()
            return {"message": "Service Professional deleted successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class AllCustomersResource(Resource):
    @marshal_with(customer_fields)
    @auth_required("token")
    def get(self):
        try:
            customers = Customer.query.all()
            return customers
        except Exception as e:
            return {"message": str(e)}, 500

    @auth_required("token")
    def post(self):
        try:
            data = request.get_json()
            new_user = User(
                email=data["email"],
                password=hash_password(data["password"]),
                username=data["username"],
                fs_uniquifier=data["username"] + "_unique",
            )
            db.session.add(new_user)
            db.session.commit()

            customer_role = Role.query.filter_by(name="customer").first()
            user_role = UserRoles(user_id=new_user.id, role_id=customer_role.id)
            db.session.add(user_role)
            db.session.commit()

            new_customer = Customer(
                user_id=new_user.id,
                username=data["username"],
                password=hash_password(data["password"]),
                name=data["name"],
                email=data["email"],
                address=data["address"],
                pin_code=data["pin_code"],
                phone_no=data["phone_no"],
                gender=data.get("gender"),
                profile_pic=data.get("profile_pic"),
                average_rating=data.get("average_rating", 0.0),
                is_blocked=data.get("is_blocked", False),
            )
            db.session.add(new_customer)
            db.session.commit()
            return {"message": "Customer created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class AllServiceProfessionalsResource(Resource):
    @auth_required("token")
    @marshal_with(service_professional_fields)
    def get(self):
        try:
            professionals = ServiceProfessional.query.all()
            # Debugging: Check if document_url exists for each professional
            for professional in professionals:
                print(
                    f"Professional ID: {professional.id}, Document URL: {professional.document_url}"
                )
            return professionals
        except Exception as e:
            return {"message": str(e)}, 500

    @auth_required("token")
    def post(self):
        try:
            data = request.get_json()
            new_user = User(
                email=data["email"],
                password=hash_password(data["password"]),
                username=data["username"],
                fs_uniquifier=data["username"] + "_unique",
            )
            db.session.add(new_user)
            db.session.commit()

            professional_role = Role.query.filter_by(name="professional").first()
            user_role = UserRoles(user_id=new_user.id, role_id=professional_role.id)
            db.session.add(user_role)
            db.session.commit()

            new_professional = ServiceProfessional(
                user_id=new_user.id,
                username=data["username"],
                password=hash_password(data["password"]),
                name=data["name"],
                service_type=data["service_type"],
                experience=data["experience"],
                phone_no=data["phone_no"],
                email=data["email"],
                address=data["address"],
                pin_code=data["pin_code"],
                verified_status=data.get("verified_status", "Not verified yet"),
                gender=data.get("gender"),
                profile_pic=data.get("profile_pic"),
                average_rating=data.get("average_rating", 0.0),
                document=data.get("document"),
                block_status=data.get("block_status", False),
            )
            db.session.add(new_professional)

            db.session.commit()
            return {"message": "Service Professional created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class AllServicesResource(Resource):
    @marshal_with(service_fields)
    def get(self):
        try:
            services = Service.query.all()  # Fetch all services
            return services, 200
        except Exception as e:
            return {"message": f"Error fetching services: {str(e)}"}, 500

    @auth_required("token")
    @marshal_with(service_fields)
    def post(self):
        # Get form data
        name = request.form.get("name")
        description = request.form.get("description")
        base_price = request.form.get("base_price")
        base_time_required = request.form.get("base_time_required")

        # Basic validation for required fields
        if not name or not description or not base_price or not base_time_required:
            return {"message": "Missing required fields"}, 400

        try:
            # Convert base_price and base_time_required to correct types
            base_price = float(base_price)
            base_time_required = base_time_required
        except ValueError:
            return {
                "message": "Invalid data types for base_price or base_time_required"
            }, 400

        # Handle picture upload (if any)
        picture = request.files.get("picture")  # Get the uploaded picture

        image_url = None  # Default to None if no picture

        if picture:
            try:
                # Upload to Cloudinary and get the image URL
                upload_result = cloudinary.uploader.upload(
                    picture,
                    folder="services",  # Folder where images will be stored in Cloudinary
                )
                image_url = upload_result[
                    "secure_url"
                ]  # Get the URL of the uploaded image
            except Exception as e:
                return {"message": f"Error uploading image: {str(e)}"}, 500

        # Create a new service entry
        new_service = Service(
            name=name,
            description=description,
            base_price=base_price,
            base_time_required=base_time_required,
            image_url=image_url,  # Store the Cloudinary image URL
        )

        try:
            # Add the new service to the database and commit
            db.session.add(new_service)
            db.session.commit()

            # Return success response
            return {
                "message": "Service added successfully",
                "service_id": new_service.id,
                "image_url": image_url,  # Include image URL in response for confirmation
            }, 200

        except Exception as e:
            db.session.rollback()  # Rollback any changes if there's an error in committing
            return {"message": f"Error adding service: {str(e)}"}, 500


from cloudinary.uploader import upload
from cloudinary.exceptions import Error as CloudinaryError


class ServiceResource(Resource):
    @auth_required("token")
    @marshal_with(service_fields)
    def get(self, service_id):
        try:
            service = Service.query.get_or_404(service_id)
            return service, 200
        except Exception as e:
            return {"message": f"Error fetching service: {str(e)}"}, 500

    @auth_required("token")
    def put(self, service_id):
        try:
            # Fetch the service to update
            service = Service.query.get_or_404(service_id)

            # Get form data (excluding the image)
            name = request.form.get("name", service.name)
            description = request.form.get("description", service.description)
            base_price = request.form.get("base_price", service.base_price)
            base_time_required = request.form.get(
                "base_time_required", service.base_time_required
            )

            # Basic validation for required fields
            if not name or not description or not base_price or not base_time_required:
                return {"message": "Missing required fields"}, 400

            try:
                # Convert base_price and base_time_required to correct types
                base_price = float(base_price)
                base_time_required = base_time_required
            except ValueError:
                return {
                    "message": "Invalid data types for base_price or base_time_required"
                }, 400

            # Update service details
            service.name = name
            service.description = description
            service.base_price = base_price
            service.base_time_required = base_time_required

            # Handle picture upload if included
            picture = request.files.get("picture")  # Get the uploaded picture (if any)
            print(
                f"Picture received: {picture}"
            )  # Check if the picture is being received

            if picture:
                try:
                    # Upload to Cloudinary and get the image URL
                    upload_result = cloudinary.uploader.upload(
                        picture,
                        folder="services",  # Folder where images will be stored in Cloudinary
                    )
                    # Get the URL of the uploaded image
                    service.image_url = upload_result["secure_url"]
                except Exception as e:
                    return {"message": f"Error uploading image: {str(e)}"}, 500

            # Commit the changes to the database
            db.session.commit()

            # Return the updated service details, including the image URL
            return {
                "message": "Service updated successfully",
                "image_url": service.image_url,
            }, 200

        except Exception as e:
            db.session.rollback()  # Rollback any changes if there's an error
            return {"message": f"Error updating service: {str(e)}"}, 500

    @auth_required("token")
    def delete(self, service_id):
        try:
            service = Service.query.get_or_404(service_id)
            db.session.delete(service)
            db.session.commit()
            return {"message": "Service deleted successfully"}, 200
        except Exception as e:
            return {"message": f"Error deleting service: {str(e)}"}, 500


class CheckAvailabilityResource(Resource):
    def post(self):
        try:
            data = request.get_json()
            field_type = data.get("type")
            value = data.get("value")
            current_user_id = data.get("current_user_id")

            if not field_type or not value:
                return {"error": "Invalid request parameters."}, 400

            # Check the appropriate field
            if field_type == "username":
                user = User.query.filter(
                    User.username == value, User.id != current_user_id
                ).first()
                return {
                    "available": user is None,
                    "message": (
                        "Username is available."
                        if user is None
                        else "Username is already taken."
                    ),
                }

            elif field_type == "email":
                user = User.query.filter(
                    User.email == value, User.id != current_user_id
                ).first()
                return {
                    "available": user is None,
                    "message": (
                        "Email is available."
                        if user is None
                        else "Email is already in use."
                    ),
                }

            return {"error": "Invalid field type."}, 400

        except Exception as e:
            return {"error": str(e)}, 500


api.add_resource(CheckAvailabilityResource, "/check-availability")


class ModifyProfessionalStatusResource(Resource):
    @auth_required("token")
    def post(self, action, id):
        print(f"Action: {action}, ID: {id}")

        # Validate the action
        if action not in ["approve", "reject", "block", "unblock"]:
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
            return {
                "message": f"Professional {action}d successfully."
            }, 200  # Use plain dict
        except Exception as e:
            db.session.rollback()
            print(f"Error during {action}: {str(e)}")
            return {
                "message": f"Error updating professional status: {str(e)}"
            }, 500  # Use plain dict


class ProfessionalsByServiceResource(Resource):
    @auth_required("token")
    def get(self, service_id):
        try:
            print(f"Fetching professionals for service_id: {service_id}")

            # Get the base service first
            base_service = Service.query.get(service_id)
            if not base_service:
                return {"message": "Service not found"}, 404

            professionals = (
                ServiceProfessional.query.join(
                    ProfessionalService,
                    ServiceProfessional.id == ProfessionalService.professional_id,
                )
                .join(Service, ProfessionalService.service_id == Service.id)
                .filter(
                    Service.id == service_id,
                    ServiceProfessional.verified_status == "approved",
                    ServiceProfessional.block_status == False,
                )
                .all()
            )

            if not professionals:
                return {"message": "No professionals found for this service."}, 404

            # Prepare the response with custom services data
            results = []
            for professional in professionals:
                prof_dict = marshal(professional, service_professional_fields)
                
                # Add the service name to each professional for frontend usage
                prof_dict["service_name"] = base_service.name

                # Get the professional's custom service details
                custom_services = ProfessionalService.query.filter_by(
                    professional_id=professional.id, service_id=service_id
                ).all()

                # If no custom services or the custom fields are None, use base service values
                if not custom_services:
                    # Create a default service based on the base service
                    prof_dict["custom_services"] = [
                        {
                            "id": None,
                            "custom_price": base_service.base_price,
                            "custom_description": base_service.description,
                            "custom_time_required": base_service.base_time_required,
                        }
                    ]
                else:
                    # Process existing custom services
                    prof_dict["custom_services"] = []
                    for cs in custom_services:
                        custom_service = {
                            "id": cs.id,
                            "custom_price": (
                                cs.custom_price
                                if cs.custom_price is not None
                                else base_service.base_price
                            ),
                            "custom_description": (
                                cs.custom_description
                                if cs.custom_description
                                else base_service.description
                            ),
                            "custom_time_required": (
                                cs.custom_time_required
                                if cs.custom_time_required
                                else base_service.base_time_required
                            ),
                        }
                        prof_dict["custom_services"].append(custom_service)

                results.append(prof_dict)

            return results, 200

        except Exception as e:
            print(f"Error in ProfessionalsByServiceResource: {e}")
            return {"message": str(e)}, 500
        

api.add_resource(
    ProfessionalsByServiceResource, "/professionals-by-service/<int:service_id>"
)

# Register the API route
api.add_resource(
    ModifyProfessionalStatusResource, "/service_professionals/<string:action>/<int:id>"
)


# Add the new resource to the API
api.add_resource(ServiceResource, "/services/<int:service_id>")

# Add the resources to the API
api.add_resource(CustomerResource, "/customers/<int:customer_id>")
api.add_resource(
    ServiceProfessionalResource, "/service_professionals/<int:professional_id>"
)
api.add_resource(AllCustomersResource, "/customers")
api.add_resource(AllServiceProfessionalsResource, "/service_professionals")
api.add_resource(AllServicesResource, "/services")


class ServiceRequestListResource(Resource):

    @auth_required("token")
    @marshal_with(service_request_fields)
    def get(self):
        try:
            service_requests = ServiceRequest.query.all()
            return service_requests, 200
        except Exception as e:
            return {"message": f"Error fetching service requests: {str(e)}"}, 500

    @auth_required("token")
    def post(self):

        try:
            data = request.get_json()
            new_request = ServiceRequest(
                service_id=data["service_id"],
                customer_id=data["customer_id"],
                professional_id=data["professional_id"],
                date_of_request=datetime.now(timezone.utc),
                service_status="requested",
                remarks=data.get("remarks"),
                requested_date=data.get("requested_date"),
                requested_time=data.get("requested_time"),
            )
            db.session.add(new_request)
            db.session.commit()
            return {"message": "Service request created successfully"}, 201
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class SingleServiceRequestResource(Resource):

    @auth_required("token")
    @marshal_with(service_request_fields)
    def get(self, request_id):
        try:
            service_request = ServiceRequest.query.get_or_404(request_id)
            return service_request, 200
        except Exception as e:
            return {"message": str(e)}, 500

    @auth_required("token")
    def patch(self, request_id):

        try:
            data = request.get_json()
            service_request = ServiceRequest.query.get_or_404(request_id)
            if "service_status" in data:
                service_request.service_status = data["service_status"]
            if "remarks" in data:
                service_request.remarks = data["remarks"]
            if "rating" in data:
                service_request.rating = data["rating"]
            db.session.commit()
            return {
                "message": f"Service request {request_id} updated successfully"
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500

    @auth_required("token")
    def delete(self, request_id):

        try:
            service_request = ServiceRequest.query.get_or_404(request_id)
            db.session.delete(service_request)
            db.session.commit()
            return {
                "message": f"Service request {request_id} deleted successfully"
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class AcceptServiceRequestResource(Resource):
    @auth_required("token")
    def post(self, request_id):
        try:
            service_request = ServiceRequest.query.get_or_404(request_id)

            if service_request.service_status != "requested":
                return {
                    "message": 'Cannot accept service request unless it is in "requested" status'
                }, 400

            service_request.service_status = "accepted"

            # Retrieve the payment record
            payment = Payment.query.filter_by(service_request_id=request_id).first()
            if payment:
                payment.is_transferred = True
                payment.payment_status = "Completed"

                # Find the custom price for this service request if it exists
                professional_service = ProfessionalService.query.filter_by(
                    professional_id=service_request.professional_id,
                    service_id=service_request.service_id,
                ).first()

                # Use custom price if set; otherwise, use base price
                amount_to_transfer = (
                    professional_service.custom_price
                    if professional_service and professional_service.custom_price
                    else professional_service.service.base_price
                )

                # Update the payment amount
                payment.amount = amount_to_transfer

                # Fetch or create the professional's wallet
                professional_wallet = ProfessionalWallet.query.filter_by(
                    professional_id=service_request.professional_id
                ).first()

                if not professional_wallet:
                    professional_wallet = ProfessionalWallet(
                        professional_id=service_request.professional_id, balance=0
                    )
                    db.session.add(professional_wallet)

                # Transfer the calculated amount to the professional's wallet
                professional_wallet.balance += amount_to_transfer

            db.session.commit()
            return {
                "message": f"Service request {request_id} accepted and payment transferred"
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class RejectServiceRequestResource(Resource):
    @auth_required("token")
    def post(self, request_id):
        try:
            service_request = ServiceRequest.query.get_or_404(request_id)

            if service_request.service_status != "requested":
                return {
                    "message": 'Cannot reject service request unless it is in "requested" status'
                }, 400

            service_request.service_status = "rejected"

            # Fetch the related payment
            payment = Payment.query.filter_by(service_request_id=request_id).first()

            if payment:
                # Update payment status to "Refunded"
                payment.payment_status = "Refunded"

                # Calculate refund amount (custom price if available, else base price)
                professional_service = ProfessionalService.query.filter_by(
                    professional_id=service_request.professional_id,
                    service_id=service_request.service_id,
                ).first()

                refund_amount = (
                    professional_service.custom_price
                    if professional_service and professional_service.custom_price
                    else professional_service.service.base_price
                )

                # Update customer's wallet balance
                wallet = Wallet.query.filter_by(
                    customer_id=service_request.customer_id
                ).first()
                if wallet:
                    wallet.balance += refund_amount
                else:
                    # Create wallet if it doesn't exist
                    wallet = Wallet(
                        customer_id=service_request.customer_id, balance=refund_amount
                    )
                    db.session.add(wallet)

                # Update the payment amount to reflect the refund
                payment.amount = refund_amount

            db.session.commit()
            return {
                "message": f"Service request {request_id} rejected and payment refunded"
            }, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


class CloseServiceRequestResource(Resource):
    @auth_required("token")
    def post(self, request_id):
        try:
            data = request.get_json()
            rating = data.get("customerRating")
            remarks = data.get("customerRemark")

            service_request = ServiceRequest.query.get_or_404(request_id)

            if service_request.service_status != "accepted":
                return {
                    "message": 'Cannot close a service request unless it is in "accepted" status'
                }, 400

            service_request.service_status = "Completed"
            service_request.date_of_completion = datetime.now(timezone.utc)
            service_request.customer_rating = rating
            service_request.customer_remarks = remarks

            db.session.commit()
            return {"message": f"Service request {request_id} closed successfully"}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


api.add_resource(ServiceRequestListResource, "/service_requests")
api.add_resource(SingleServiceRequestResource, "/service_requests/<int:request_id>")
api.add_resource(
    AcceptServiceRequestResource, "/service_requests/<int:request_id>/accept"
)
api.add_resource(
    RejectServiceRequestResource, "/service_requests/<int:request_id>/reject"
)
api.add_resource(
    CloseServiceRequestResource, "/service_requests/<int:request_id>/close"
)


class ServiceRequestResource(Resource):
    @auth_required("token")
    def post(self):
        try:
            data = request.get_json()
            required_fields = [
                "professional_id",
                "service_id",
                "customer_id",
                "requested_date",
                "requested_time",
            ]

            # Check if all required fields are present
            for field in required_fields:
                if field not in data:
                    return {"message": f"Missing {field} field"}, 400

            # Fetch customer and professional details
            customer = Customer.query.get(data["customer_id"])
            professional = ServiceProfessional.query.get(data["professional_id"])

            # Check if customer or professional is blocked
            if customer.is_blocked:
                return {"message": "Customer account is blocked"}, 403
            if professional.block_status:
                return {"message": "Professional account is blocked"}, 403

            # Validate requested date and time
            try:
                requested_date = datetime.strptime(
                    data["requested_date"], "%Y-%m-%d"
                ).date()
                requested_time = datetime.strptime(
                    data["requested_time"], "%H:%M"
                ).time()
            except ValueError:
                return {"message": "Invalid date or time format"}, 400

            # Ensure the requested date is not in the past
            if requested_date < datetime.utcnow().date():
                return {"message": "Cannot book a service for a past date"}, 400

            # Fetch the service details
            service = Service.query.get(data["service_id"])
            if not service:
                return {"message": "Service not found"}, 404

            # Fetch the professional's custom price for the service
            professional_service = ProfessionalService.query.filter_by(
                professional_id=data["professional_id"], service_id=data["service_id"]
            ).first()

            if not professional_service:
                return {"message": "Professional does not offer this service"}, 404

            amount = (
                professional_service.custom_price
                if professional_service.custom_price
                else service.base_price
            )

            # Create the service request
            new_request = ServiceRequest(
                service_id=data["service_id"],
                customer_id=data["customer_id"],
                professional_id=data["professional_id"],
                date_of_request=datetime.utcnow(),
                service_status="requested",
                requested_date=requested_date,
                requested_time=requested_time,
            )

            db.session.add(new_request)
            db.session.commit()  # Commit to get new_request.id

            # Create the payment record (without updating wallet yet)
            new_payment = Payment(
                service_request_id=new_request.id,
                customer_id=data["customer_id"],
                professional_id=data["professional_id"],
                amount=amount,
                payment_status="Pending",  # Initially Pending
                is_transferred=False,
                date_of_payment=datetime.utcnow(),
            )

            db.session.add(new_payment)
            db.session.commit()

            # Send email notifications (async)
            try:
                from backend.celery.tasks import (
                    send_booking_confirmation_to_customer,
                    send_booking_notification_to_professional
                )
                
                # Queue the email tasks
                send_booking_confirmation_to_customer.delay(new_request.id)
                send_booking_notification_to_professional.delay(new_request.id)
            except Exception as e:
                # Log the error but don't fail the request
                print(f"Error sending notification emails: {str(e)}")

            return {
                "message": "Service request created successfully",
                "id": new_request.id,
            }, 201

        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


# Add this at the bottom of the file
api.add_resource(ServiceRequestResource, "/book-service")

from sqlalchemy.orm import joinedload


class ProfessionalServiceRequestsResource(Resource):
    @auth_required("token")
    def get(self, professional_id):
        try:
            # Fetch service requests for the professional and include customer and service details
            service_requests = (
                ServiceRequest.query.filter_by(professional_id=professional_id)
                .options(joinedload(ServiceRequest.service))
                .options(joinedload(ServiceRequest.customer))
                .all()
            )

            # Marshal and return the data
            return marshal(service_requests, service_request_fields), 200
        except Exception as e:
            return {"message": str(e)}, 500


api.add_resource(
    ProfessionalServiceRequestsResource,
    "/service_requests/professional/<int:professional_id>",
)


class TodayServiceRequestsResource(Resource):
    @auth_required("token")
    def get(self, professional_id):
        try:
            today = date.today()
            service_requests = ServiceRequest.query.filter(
                ServiceRequest.professional_id == professional_id,
                ServiceRequest.requested_date == today,
            ).all()
            return marshal(service_requests, service_request_fields), 200
        except Exception as e:
            return {"message": str(e)}, 500


api.add_resource(
    TodayServiceRequestsResource,
    "/service_requests/professional/<int:professional_id>/today",
)


class CustomerBlockResource(Resource):
    @auth_required("token")
    def post(self, customer_id, action):
        try:
            # Validate action
            if action not in ["block", "unblock"]:
                return {"message": 'Invalid action. Use "block" or "unblock".'}, 400

            # Fetch customer
            customer = Customer.query.get_or_404(customer_id)

            # Update block status
            customer.is_blocked = action == "block"
            db.session.commit()

            return {
                "message": f"Customer successfully {action}ed",
                "customer_id": customer_id,
                "is_blocked": customer.is_blocked,
            }, 200

        except Exception as e:
            db.session.rollback()
            # Log the actual error internally instead of exposing it to the client
            app.logger.error(f"Error updating customer block status: {str(e)}")
            return {
                "message": "An internal error occurred. Please try again later."
            }, 500


# Add these routes to your existing routes
api.add_resource(CustomerBlockResource, "/customers/<string:action>/<int:customer_id>")


class CustomerStatusResource(Resource):
    @auth_required("token")
    def get(self, customer_id):
        try:
            customer = Customer.query.get_or_404(customer_id)
            return {"id": customer.id, "is_blocked": customer.is_blocked}
        except Exception as e:
            return {"message": str(e)}, 500


api.add_resource(CustomerStatusResource, "/customers/<int:customer_id>/status")


class SearchResource(Resource):
    @auth_required("token")
    def get(self):
        try:
            entity = request.args.get("entity")
            query = request.args.get("query", "").strip()
            pincode = request.args.get("pincode")
            rating = request.args.get("rating", "").strip()
            condition = request.args.get("condition")
            service_id = request.args.get(
                "service_id"
            )  # Parameter for service filtering

            if not entity:
                return {"message": "Entity parameter is required"}, 400

            # Base query for professionals
            base_query = ServiceProfessional.query.filter(
                ServiceProfessional.verified_status == "approved"
            ).filter(ServiceProfessional.block_status == False)

            if entity == "service":
                results = Service.query.filter(Service.name.ilike(f"%{query}%")).all()
                return marshal(results, service_fields)

            elif entity == "pincode":
                if not pincode:
                    return {"message": "Pincode is required"}, 400

                # Start with the pincode filter
                professionals_query = base_query.filter(
                    ServiceProfessional.pin_code == pincode
                )

                # If service_id is provided, add service filter
                if service_id:
                    professionals_query = professionals_query.join(
                        ProfessionalService,
                        ProfessionalService.professional_id == ServiceProfessional.id,
                    ).filter(ProfessionalService.service_id == service_id)

                    # If rating filter is also provided
                    if rating:
                        try:
                            rating_value = float(rating)
                        except ValueError:
                            return {
                                "message": "Invalid rating value. Must be a number."
                            }, 400

                        if condition == "high":
                            professionals_query = professionals_query.filter(
                                ServiceProfessional.average_rating >= rating_value
                            )
                        elif condition == "low":
                            professionals_query = professionals_query.filter(
                                ServiceProfessional.average_rating <= rating_value
                            )
                        elif (
                            condition
                        ):  # If condition is provided but not 'high' or 'low'
                            return {
                                "message": 'Invalid condition. Use "high" or "low".'
                            }, 400

                    # Get all professionals matching the criteria
                    professionals = professionals_query.all()

                    # Calculate missing ratings
                    for professional in professionals:
                        if professional.average_rating is None:
                            avg_rating = calculate_average_rating_for_professional(
                                professional.id
                            )
                            professional.average_rating = (
                                avg_rating if avg_rating is not None else 0.0
                            )

                    # Get the base service for default values
                    base_service = Service.query.get(service_id)
                    if not base_service:
                        return {"message": "Service not found"}, 404

                    # Process professionals with custom service details
                    results = []
                    for professional in professionals:
                        prof_dict = marshal(professional, service_professional_fields)

                        # Get the professional's custom service details
                        custom_services = ProfessionalService.query.filter_by(
                            professional_id=professional.id, service_id=service_id
                        ).all()

                        # If no custom services or the custom fields are None, use base service values
                        if not custom_services:
                            # Create a default service based on the base service
                            prof_dict["custom_services"] = [
                                {
                                    "id": None,
                                    "custom_price": base_service.base_price,
                                    "custom_description": base_service.description,
                                    "custom_time_required": base_service.base_time_required,
                                }
                            ]
                        else:
                            # Process existing custom services
                            prof_dict["custom_services"] = []
                            for cs in custom_services:
                                custom_service = {
                                    "id": cs.id,
                                    "custom_price": (
                                        cs.custom_price
                                        if cs.custom_price is not None
                                        else base_service.base_price
                                    ),
                                    "custom_description": (
                                        cs.custom_description
                                        if cs.custom_description
                                        else base_service.description
                                    ),
                                    "custom_time_required": (
                                        cs.custom_time_required
                                        if cs.custom_time_required
                                        else base_service.base_time_required
                                    ),
                                }
                                prof_dict["custom_services"].append(custom_service)

                        results.append(prof_dict)

                    return results, 200
                else:
                    # No service_id, just return services available in that pincode
                    results = (
                        base_query.filter(ServiceProfessional.pin_code == pincode)
                        .join(
                            ProfessionalService,
                            ProfessionalService.professional_id
                            == ServiceProfessional.id,
                        )
                        .join(Service, ProfessionalService.service_id == Service.id)
                        .with_entities(Service)
                        .distinct()
                        .all()
                    )
                    return marshal(results, service_fields)

            elif entity == "rating":
                # Build the query with rating filter
                try:
                    if rating:
                        rating_value = float(rating)
                    else:
                        rating_value = None
                except ValueError:
                    return {"message": "Invalid rating value. Must be a number."}, 400

                # Start with the base query
                professionals_query = base_query

                # Add pincode filter if provided
                if pincode:
                    professionals_query = professionals_query.filter(
                        ServiceProfessional.pin_code == pincode
                    )

                # Add service filter if provided
                if service_id:
                    professionals_query = professionals_query.join(
                        ProfessionalService,
                        ProfessionalService.professional_id == ServiceProfessional.id,
                    ).filter(ProfessionalService.service_id == service_id)

                # Add rating filter if provided
                if rating_value is not None:
                    if condition == "high":
                        professionals_query = professionals_query.filter(
                            ServiceProfessional.average_rating >= rating_value
                        )
                    elif condition == "low":
                        professionals_query = professionals_query.filter(
                            ServiceProfessional.average_rating <= rating_value
                        )
                    else:
                        return {
                            "message": 'Invalid condition. Use "high" or "low".'
                        }, 400

                # Get all professionals matching the criteria
                professionals = professionals_query.all()

                # Calculate missing ratings
                for professional in professionals:
                    if professional.average_rating is None:
                        avg_rating = calculate_average_rating_for_professional(
                            professional.id
                        )
                        professional.average_rating = (
                            avg_rating if avg_rating is not None else 0.0
                        )

                # If service_id is provided, include custom service details
                if service_id:
                    # Get the base service for default values
                    base_service = Service.query.get(service_id)
                    if not base_service:
                        return {"message": "Service not found"}, 404

                    # Process professionals with custom service details
                    results = []
                    for professional in professionals:
                        prof_dict = marshal(professional, service_professional_fields)

                        # Get the professional's custom service details
                        custom_services = ProfessionalService.query.filter_by(
                            professional_id=professional.id, service_id=service_id
                        ).all()

                        # If no custom services or the custom fields are None, use base service values
                        if not custom_services:
                            # Create a default service based on the base service
                            prof_dict["custom_services"] = [
                                {
                                    "id": None,
                                    "custom_price": base_service.base_price,
                                    "custom_description": base_service.description,
                                    "custom_time_required": base_service.base_time_required,
                                }
                            ]
                        else:
                            # Process existing custom services
                            prof_dict["custom_services"] = []
                            for cs in custom_services:
                                custom_service = {
                                    "id": cs.id,
                                    "custom_price": (
                                        cs.custom_price
                                        if cs.custom_price is not None
                                        else base_service.base_price
                                    ),
                                    "custom_description": (
                                        cs.custom_description
                                        if cs.custom_description
                                        else base_service.description
                                    ),
                                    "custom_time_required": (
                                        cs.custom_time_required
                                        if cs.custom_time_required
                                        else base_service.base_time_required
                                    ),
                                }
                                prof_dict["custom_services"].append(custom_service)

                        results.append(prof_dict)

                    return results, 200
                else:
                    # No service_id, just return professionals with rating filter
                    return marshal(professionals, service_professional_fields)

            return {"message": "Invalid search parameters"}, 400

        except Exception as e:
            print(f"Search error: {str(e)}")
            return {"message": str(e)}, 500


class PincodesResource(Resource):
    @auth_required("token")
    def get(self):
        try:
            # Get unique pincodes from professionals
            pincodes = db.session.query(ServiceProfessional.pin_code).distinct().all()

            # Convert tuple of tuples to list
            pincode_list = [pin[0] for pin in pincodes if pin[0]]
            return sorted(pincode_list)

        except Exception as e:
            return {"message": str(e)}, 500


# Register resources with API
api.add_resource(SearchResource, "/search")
api.add_resource(PincodesResource, "/pincodes")


class SearchAdminResource(Resource):
    @auth_required("token")
    def get(self):
        try:
            entity = request.args.get("entity")
            criteria = request.args.get("criteria")
            query = request.args.get("query")
            rating_filter = request.args.get("rating")
            rating_condition = request.args.get("rating_condition")

            if not entity or not criteria:
                return {"message": "Entity and criteria are required."}, 400

            # Map entities to their respective search methods and field definitions
            search_mapping = {
                "service": (self.search_services, service_fields),
                "professional": (
                    self.search_professionals,
                    service_professional_fields,
                ),
                "service_request": (
                    self.search_service_requests,
                    service_request_fields,
                ),
                "customer": (self.search_customers, customer_fields),
            }

            if entity not in search_mapping:
                return {"message": "Invalid entity type."}, 400

            # Call the appropriate search method
            search_method, field_definition = search_mapping[entity]
            results = search_method(criteria, query, rating_filter, rating_condition)

            # Use marshal to serialize results
            serialized_results = marshal(results, field_definition)
            return {"results": serialized_results}, 200

        except Exception as e:
            app.logger.error(f"Error in SearchAdminResource: {e}")
            return {"message": str(e)}, 500

    @auth_required("token")
    def search_services(self, criteria, query, *_):
        if not query:
            return Service.query.all()
        filters = {
            "name": Service.name.ilike(f"%{query}%"),
            "base_price": Service.base_price == query,
            "description": Service.description.ilike(f"%{query}%"),
        }
        return Service.query.filter(filters.get(criteria, True)).all()

    @auth_required("token")
    def search_professionals(self, criteria, query, rating_filter, rating_condition):
        filters = []

        # Build filters based on the query
        if query:
            if "name" == criteria:
                filters.append(ServiceProfessional.name.ilike(f"%{query}%"))
            elif "experience" == criteria:
                filters.append(ServiceProfessional.experience == query)
            elif "verified_status" == criteria:
                filters.append(ServiceProfessional.verified_status.ilike(f"%{query}%"))
            elif "blocked_status" == criteria:
                filters.append(
                    ServiceProfessional.block_status == (query.lower() == "blocked")
                )
            # Don't add any filters for average_rating at this point
            # as ratings may need calculation
        
        # If no filters were applied and criteria isn't average_rating, 
        # we should still filter the results
        if not filters and criteria != "average_rating" and query:
            return []  # No matching criteria found

        # Apply the filters to the query
        query_obj = ServiceProfessional.query
        for filter_condition in filters:
            query_obj = query_obj.filter(filter_condition)

        professionals = query_obj.all()

        # Calculate/update average ratings
        for professional in professionals:
            if professional.average_rating is None:
                avg_rating = calculate_average_rating_for_professional(professional.id)
                if avg_rating is not None:
                    professional.average_rating = avg_rating

            if professional.average_rating is None:
                recent_service_request = (
                    ServiceRequest.query.filter(
                        ServiceRequest.professional_id == professional.id,
                        ServiceRequest.rating.isnot(None),
                    )
                    .order_by(ServiceRequest.date_of_completion.desc())
                    .first()
                )
                if recent_service_request:
                    professional.average_rating = recent_service_request.rating

        # Apply rating filter if criteria is "average_rating" and query is provided
        if criteria == "average_rating" and query:
            try:
                target_rating = float(query)
                
                if rating_condition == "high":
                    professionals = [
                        p
                        for p in professionals
                        if p.average_rating is not None
                        and p.average_rating >= target_rating
                    ]
                else:  # "low" or default
                    professionals = [
                        p
                        for p in professionals
                        if p.average_rating is not None
                        and p.average_rating <= target_rating
                    ]
            except ValueError:
                return []  # Invalid rating value

        return professionals

    @auth_required("token")
    def search_customers(self, criteria, query, rating_filter, rating_condition):
        base_query = Customer.query

        filters = []

        if query:
            if criteria == "name":
                filters.append(Customer.name.ilike(f"%{query}%"))
            elif criteria == "email":
                filters.append(Customer.email.ilike(f"%{query}%"))
            elif criteria == "phone":
                filters.append(Customer.phone_no.ilike(f"%{query}%"))

        target_rating = None
        if criteria == "average_rating":
            try:
                target_rating = float(query) if query else None
            except ValueError:
                return []

        # Apply filters
        for condition in filters:
            base_query = base_query.filter(condition)

        customers = base_query.all()

        for customer in customers:
            if customer.average_rating is None:
                avg_rating = calculate_average_rating_for_customer(customer.id)
                if avg_rating is not None:
                    customer.average_rating = avg_rating

            if customer.average_rating is None:
                recent_service_request = (
                    ServiceRequest.query.filter(
                        ServiceRequest.customer_id == customer.id,
                        ServiceRequest.customer_rating.isnot(None),
                    )
                    .order_by(ServiceRequest.date_of_completion.desc())
                    .first()
                )
                if recent_service_request:
                    customer.average_rating = recent_service_request.customer_rating

        # Apply rating filter if criteria is "average_rating" and target_rating is valid
        if criteria == "average_rating" and target_rating is not None:
            if rating_condition == "high":
                customers = [
                    c
                    for c in customers
                    if c.average_rating is not None
                    and c.average_rating >= target_rating
                ]
            else:
                customers = [
                    c
                    for c in customers
                    if c.average_rating is not None
                    and c.average_rating <= target_rating
                ]

        return customers

    @auth_required("token")
    def search_service_requests(self, criteria, query, *_):
        base_query = (
            ServiceRequest.query.join(
                Customer, ServiceRequest.customer_id == Customer.id
            )
            .join(
                ServiceProfessional,
                ServiceRequest.professional_id == ServiceProfessional.id,
            )
            .join(Service, ServiceRequest.service_id == Service.id)
        )

        filters = {
            "customer_name": Customer.name.ilike(f"%{query}%"),
            "professional_name": ServiceProfessional.name.ilike(f"%{query}%"),
            "service_name": Service.name.ilike(f"%{query}%"),
            "service_status": ServiceRequest.service_status.ilike(f"%{query}%"),
        }

        if criteria in filters:
            base_query = base_query.filter(filters[criteria])

        service_requests = base_query.all()
        return marshal(service_requests, service_request_fields)


# Register the resource
api.add_resource(SearchAdminResource, "/search_admin")


class SearchProfessionalResource(Resource):
    @auth_required("token")
    def get(self):
        try:
            professional_id = request.args.get("professional_id")
            if not professional_id:
                return {"message": "Professional ID is required"}, 400

            try:
                professional_id = int(professional_id)  # Convert to integer
            except ValueError:
                return {"message": "Invalid Professional ID"}, 400

            entity = request.args.get("entity")
            pin_code = request.args.get("pin_code")
            date_of_service = request.args.get("date_of_service")
            date_of_closing = request.args.get("date_of_closing")
            query = request.args.get("query", "").strip()

            if not entity:
                return {"message": "Entity parameter is required"}, 400

            # Base query: Filter service requests for this professional
            base_query = ServiceRequest.query.filter(
                ServiceRequest.professional_id == professional_id
            )

            # Apply search filters
            if entity == "pin_code":
                if not pin_code:
                    return {"message": "Pin Code is required"}, 400
                base_query = base_query.join(Customer).filter(
                    Customer.pin_code == pin_code
                )

            elif entity == "customer_name":
                base_query = base_query.join(Customer)

                if query:
                    base_query = base_query.filter(Customer.name.ilike(f"%{query}%"))
                    service_requests = base_query.all()
                else:
                    # No query? Fetch all service requests associated with the professional
                    service_requests = (
                        db.session.query(ServiceRequest)
                        .join(Customer)
                        .filter(ServiceRequest.professional_id == professional_id)
                        .all()
                    )

                results = [
                    marshal(sr, service_request_fields) for sr in service_requests
                ]
                return jsonify({"results": results})

            elif entity == "date_of_service":
                print(date_of_service)
                print(
                    base_query.filter(ServiceRequest.requested_date == date_of_service)
                )
                if not date_of_service:
                    return {"message": "Please enter a Date of Service."}, 400
                base_query = base_query.filter(
                    ServiceRequest.requested_date == date_of_service
                )

            elif entity == "date_of_closing":
                print(date_of_closing)
                if not date_of_closing:
                    return {"message": "Please enter a Date of Closing."}, 400
                base_query = base_query.filter(
                    func.date(ServiceRequest.date_of_completion) == date_of_closing
                )

            else:
                return {"message": "Invalid entity type."}, 400

            results = base_query.all()
            return {
                "results": marshal(results, service_request_fields)
            }, 200  # Marshal results before returning

        except Exception as e:
            return {"message": str(e)}, 500


# Register the resource
api.add_resource(SearchProfessionalResource, "/search-professionals")


class ProfessionalPincodesResource(Resource):
    @auth_required("token")
    def get(self):
        try:
            professional_id = request.args.get("professional_id")
            print(professional_id)
            if not professional_id:
                return {"message": "Professional ID is required"}, 400

            try:
                professional_id = int(professional_id)  # Ensure it's an integer
            except ValueError:
                return {"message": "Invalid Professional ID"}, 400

            # Ensure the professional has completed at least one service request
            pincodes_query = (
                db.session.query(Customer.pin_code)
                .join(ServiceRequest, ServiceRequest.customer_id == Customer.id)
                .filter(ServiceRequest.professional_id == professional_id)
                .distinct()
                .all()
            )

            # Convert the result from [(123456,), (654321,)] to a list [123456, 654321]
            pincodes_list = [
                pincode[0] for pincode in pincodes_query if pincode[0] is not None
            ]

            return jsonify({"pincodes": pincodes_list})

        except Exception as e:
            return {"message": str(e)}, 500


# Register the API resource
api.add_resource(ProfessionalPincodesResource, "/forprofessional_pincodes")


class CustomerServiceHistoryResource(Resource):
    @auth_required("token")
    def get(self, customer_id):
        try:
            # Fetch service requests for the customer, including service and professional details
            service_requests = (
                ServiceRequest.query.join(
                    ServiceProfessional,
                    ServiceRequest.professional_id == ServiceProfessional.id,
                )
                .join(Service, ServiceRequest.service_id == Service.id)
                .filter(ServiceRequest.customer_id == customer_id)
                .all()
            )  # Join the Service table to get the service name

            # If no service requests found, return a message
            if not service_requests:
                return {"message": "No service history found for this customer."}, 404

            # Marshal the service requests to return the necessary fields
            result = []
            for request in service_requests:
                request_data = marshal(request, service_request_fields)
                # Add professional details to the response
                request_data["professionalName"] = (
                    request.professional.name
                )  # Adjust 'name' to the actual field of professional
                request_data["professionalId"] = request.professional.id
                request_data["serviceName"] = (
                    request.service.name
                )  # Ensure this field is populated from the Service model
                result.append(request_data)

            return result, 200

        except Exception as e:
            print(f"Error fetching service history for customer {customer_id}: {e}")
            return {"message": str(e)}, 500


# Add the resource to your API
api.add_resource(
    CustomerServiceHistoryResource, "/service-history/customer/<int:customer_id>"
)


class ServiceRequestReviewResource(Resource):
    def post(self, service_request_id):
        # Get the request data
        data = request.get_json()
        rating = data.get("customerRating")
        remarks = data.get("customerRemark")

        if not rating or not remarks:
            return {"message": "Rating and remarks are required."}, 400

        # Find the service request
        service_request = ServiceRequest.query.get(service_request_id)

        if not service_request:
            return {"message": "Service request not found."}, 404

        # Check if the service is Completed before accepting feedback
        if service_request.service_status != "Completed":
            return {
                "message": "Service must be Completed before leaving a review."
            }, 400

        # Update the review in the service request
        service_request.rating = rating
        service_request.remarks = remarks

        # Commit the changes to the database
        try:
            db.session.commit()
            return {"message": "Review submitted successfully."}, 200
        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


api.add_resource(
    ServiceRequestReviewResource, "/service_requests/<int:service_request_id>/review"
)


class CustomerServiceSummary(Resource):
    def get(self, user_id):
        try:
            # Retrieve the user
            user = User.query.get(user_id)
            if not user:
                return {"error": "User not found"}, 404

            if not user.customer:
                return {"error": "Customer not found"}, 404

            customer = user.customer

            # Fetch service requests for the customer
            requests = ServiceRequest.query.filter_by(customer_id=customer.id).all()
            # Initialize counters
            status_counts = {"accepted": 0, "rejected": 0, "Completed": 0, "Pending": 0}
            category_counts = {}
            requests_over_time = {}

            for req in requests:
                # Count service statuses
                if req.service_status == "accepted":
                    status_counts["accepted"] += 1
                elif req.service_status == "rejected":
                    status_counts["rejected"] += 1
                elif req.service_status == "Completed":
                    status_counts["Completed"] += 1
                elif req.service_status == "requested":
                    status_counts["Pending"] += 1

                # Count service categories
                if req.service:
                    category = req.service.name
                    category_counts[category] = category_counts.get(category, 0) + 1

                # Count requests over time (grouped by month)
                if req.requested_date:
                    request_month = req.requested_date.strftime("%Y-%m")
                    requests_over_time[request_month] = (
                        requests_over_time.get(request_month, 0) + 1
                    )
            # Prepare the response data
            response_data = {
                "status_data": {
                    "labels": ["Accepted", "Rejected", "Completed", "Pending"],
                    "values": [
                        status_counts["accepted"],
                        status_counts["rejected"],
                        status_counts["Completed"],
                        status_counts["Pending"],
                    ],
                },
                "category_data": {
                    "labels": list(category_counts.keys()),
                    "values": list(category_counts.values()),
                },
                "requests_over_time": {
                    "labels": list(requests_over_time.keys()),
                    "values": list(requests_over_time.values()),
                },
            }

            return jsonify(response_data)

        except Exception as e:
            return {"error": f"An error occurred: {str(e)}"}, 500


# Adding the resource to the API
api.add_resource(CustomerServiceSummary, "/customer-service-summary/<int:user_id>")


class ProfessionalServiceSummary(Resource):
    @auth_required("token")
    def get(self, professional_id):
        try:
            # Retrieve the professional
            professional = ServiceProfessional.query.get(professional_id)
            if not professional:
                return {"error": "Professional not found"}, 404

            # Fetch service requests for the professional
            requests = ServiceRequest.query.filter_by(
                professional_id=professional.id
            ).all()

            # Initialize counters
            status_counts = {"accepted": 0, "rejected": 0, "Completed": 0, "Pending": 0}
            requests_over_time = {}
            ratings_over_time = {}

            for req in requests:
                # Count service statuses
                if req.service_status == "accepted":
                    status_counts["accepted"] += 1
                elif req.service_status == "rejected":
                    status_counts["rejected"] += 1
                elif req.service_status == "Completed":
                    status_counts["Completed"] += 1
                elif req.service_status == "requested":
                    status_counts["Pending"] += 1

                # Count requests over time (grouped by month)
                if req.requested_date:
                    request_month = req.requested_date.strftime("%Y-%m")
                    requests_over_time[request_month] = (
                        requests_over_time.get(request_month, 0) + 1
                    )

                # Track customer ratings over time (average per month)
                if req.rating is not None:
                    rating_month = req.requested_date.strftime("%Y-%m")
                    if rating_month in ratings_over_time:
                        ratings_over_time[rating_month].append(req.rating)
                    else:
                        ratings_over_time[rating_month] = [req.rating]

            # Convert ratings into average values
            avg_ratings_over_time = {
                month: round(sum(ratings) / len(ratings), 2)
                for month, ratings in ratings_over_time.items()
            }

            # Prepare the response data
            response_data = {
                "status_data": {
                    "labels": ["Accepted", "Rejected", "Completed", "Pending"],
                    "values": [
                        status_counts["accepted"],
                        status_counts["rejected"],
                        status_counts["Completed"],
                        status_counts["Pending"],
                    ],
                },
                "requests_over_time": {
                    "labels": sorted(requests_over_time.keys()),
                    "values": [
                        requests_over_time[k] for k in sorted(requests_over_time.keys())
                    ],
                },
                "ratings_over_time": {
                    "labels": sorted(avg_ratings_over_time.keys()),
                    "values": [
                        avg_ratings_over_time[k]
                        for k in sorted(avg_ratings_over_time.keys())
                    ],
                },
            }

            return jsonify(response_data)

        except Exception as e:
            return {"error": f"An error occurred: {str(e)}"}, 500


# Adding the resource to the API
api.add_resource(
    ProfessionalServiceSummary, "/professional-service-summary/<int:professional_id>"
)

from flask import jsonify
from flask_restful import Resource
from sqlalchemy import func
from datetime import datetime, timedelta


# 1. Service Requests Overview
class ServiceRequestStats(Resource):
    def get(self):
        status_counts = (
            db.session.query(
                ServiceRequest.service_status, func.count(ServiceRequest.id)
            )
            .group_by(ServiceRequest.service_status)
            .all()
        )
        return jsonify({status: count for status, count in status_counts})


# 2. Monthly Trends
class ServiceRequestTrends(Resource):
    def get(self):
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        trends = (
            db.session.query(
                func.strftime("%Y-%m", ServiceRequest.date_of_request).label("month"),
                func.count(ServiceRequest.id).label("count"),
            )
            .filter(ServiceRequest.date_of_request >= six_months_ago)
            .group_by("month")
            .order_by("month")
            .all()
        )
        return jsonify(
            {
                "months": [trend.month for trend in trends],
                "counts": [trend.count for trend in trends],
            }
        )


# 3. Top Services
class TopServices(Resource):
    def get(self):
        top_services = (
            db.session.query(Service.name, func.count(ServiceRequest.id).label("count"))
            .join(ServiceRequest, Service.id == ServiceRequest.service_id)
            .group_by(Service.id)
            .order_by(func.count(ServiceRequest.id).desc())
            .limit(5)
            .all()
        )
        return jsonify(
            {
                "services": [service.name for service in top_services],
                "counts": [service.count for service in top_services],
            }
        )


# 4. Professional Ratings
class ProfessionalRatings(Resource):
    def get(self):
        ratings = (
            db.session.query(
                ServiceProfessional.name,
                func.avg(ServiceRequest.rating).label("avg_rating"),
            )
            .join(
                ServiceRequest, ServiceProfessional.id == ServiceRequest.professional_id
            )
            .filter(ServiceRequest.rating.isnot(None))
            .group_by(ServiceProfessional.id)
            .order_by(func.avg(ServiceRequest.rating).desc())
            .limit(10)
            .all()
        )
        return jsonify(
            {
                "professionals": [rating.name for rating in ratings],
                "ratings": [float(rating.avg_rating) for rating in ratings],
            }
        )


# 5. Requests by Pincode
class ServiceRequestsByPincode(Resource):
    def get(self):
        pincode_data = (
            db.session.query(
                Customer.pin_code, func.count(ServiceRequest.id).label("count")
            )
            .join(ServiceRequest, Customer.id == ServiceRequest.customer_id)
            .group_by(Customer.pin_code)
            .order_by(func.count(ServiceRequest.id).desc())
            .limit(10)
            .all()
        )
        return jsonify(
            {
                "pincodes": [data.pin_code for data in pincode_data],
                "counts": [data.count for data in pincode_data],
            }
        )


# Register API Endpoints
api.add_resource(ServiceRequestStats, "/service_requests/stats")
api.add_resource(ServiceRequestTrends, "/service_requests/monthly")
api.add_resource(TopServices, "/services/popular")
api.add_resource(ProfessionalRatings, "/professionals/ratings")
api.add_resource(ServiceRequestsByPincode, "/service_requests/pincode_distribution")


import cloudinary
import cloudinary.uploader
import cloudinary.api


class ProfessionalProfileResource(Resource):
    @auth_required("token")
    @marshal_with(service_professional_fields)
    def get(self, professional_id):
        professional = ServiceProfessional.query.get_or_404(professional_id)
        return professional

    @auth_required("token")
    @marshal_with(service_professional_fields)
    def put(self, professional_id):
        professional = ServiceProfessional.query.get_or_404(professional_id)

        # 🛑 Unauthorized access check
        if professional.user_id != current_user.id:
            return {"error": "Unauthorized access"}, 403

        # ✅ Handle JSON and form-data requests properly
        data = request.get_json() if request.is_json else request.form
        profile_pic = request.files.get("profile_pic")

        # Debugging: Check available attributes
        print(f"Received Data: {data}")
        print(
            f"Before Update - Professional ID: {professional.id}, User ID: {professional.user_id}"
        )
        print(f"Available Attributes: {vars(professional)}")  # Debugging

        # If username or email should be updated, update them in the User model
        if "username" in data or "email" in data:
            user = User.query.get(professional.user_id)  # Fetch related User object
            if "username" in data:
                user.username = data["username"]
            if "email" in data:
                user.email = data["email"]  # Update User email
                professional.email = data["email"]  # Also update Professional email

        # Editable fields in ServiceProfessional model
        editable_fields = ["name", "phone_no", "address", "pin_code", "gender"]
        for field in editable_fields:
            if field in data and data[field]:  # Ensure data is not empty
                setattr(professional, field, data[field])

        # Upload new profile picture if provided
        if profile_pic:
            try:
                upload_result = cloudinary.uploader.upload(
                    profile_pic, folder="professional_profile_pic"
                )
                professional.profile_picture_url = upload_result["secure_url"]
            except Exception as e:
                print(f"Image upload failed: {str(e)}")
                return {"error": "Image upload failed", "details": str(e)}, 500

        try:
            db.session.commit()
            print(f"After Update - Professional ID: {professional.id}")
            return professional
        except Exception as e:
            db.session.rollback()
            print(f"Database commit failed: {str(e)}")
            return {"error": "Database update failed", "details": str(e)}, 500


class ProfessionalServicesResource(Resource):
    @auth_required("token")
    @marshal_with(professional_service_with_details)
    def get(self, professional_id):
        professional = ServiceProfessional.query.get_or_404(professional_id)

        if professional.user_id != current_user.id:
            return {"error": "Unauthorized access"}, 403

        return ProfessionalService.query.filter_by(
            professional_id=professional_id
        ).all()

    @auth_required("token")
    @marshal_with(professional_service_with_details)
    def put(self, professional_id):
        professional = ServiceProfessional.query.get_or_404(professional_id)

        if professional.user_id != current_user.id:
            return {"error": "Unauthorized access"}, 403

        data = request.json
        for service_data in data:
            service = ProfessionalService.query.filter_by(
                professional_id=professional_id, service_id=service_data["service_id"]
            ).first()

            if service:
                service.custom_price = service_data.get(
                    "custom_price", service.custom_price
                )
                service.custom_description = service_data.get(
                    "custom_description", service.custom_description
                )
                service.custom_time_required = service_data.get(
                    "custom_time_required", service.custom_time_required
                )

        db.session.commit()
        return ProfessionalService.query.filter_by(
            professional_id=professional_id
        ).all()


api.add_resource(
    ProfessionalProfileResource, "/professional/profile/<int:professional_id>"
)
api.add_resource(
    ProfessionalServicesResource, "/professional/profile/<int:professional_id>/services"
)


class CustomerProfileResource(Resource):
    @auth_required("token")
    @marshal_with(customer_fields)
    def get(self, customer_id):
        customer = Customer.query.get_or_404(customer_id)
        return customer

    @auth_required("token")
    @marshal_with(customer_fields)
    def put(self, customer_id):
        customer = Customer.query.get_or_404(customer_id)

        # 🛑 Unauthorized access check
        if customer.user_id != current_user.id:
            return {"error": "Unauthorized access"}, 403

        # ✅ Handle JSON and form-data requests properly
        data = request.get_json() if request.is_json else request.form
        profile_pic = request.files.get("profile_pic")

        # Debugging: Check available attributes
        print(f"Received Data: {data}")
        print(
            f"Before Update - Customer ID: {customer.id}, User ID: {customer.user_id}"
        )
        print(f"Available Attributes: {vars(customer)}")  # Debugging

        # If username or email should be updated, update them in the User model
        if "username" in data or "email" in data:
            user = User.query.get(customer.user_id)  # Fetch related User object
            if "username" in data:
                user.username = data["username"]
            if "email" in data:
                user.email = data["email"]  # Update User email
                customer.email = data["email"]  # Also update Customer email

        # Editable fields in Customer model
        editable_fields = ["name", "phone_no", "address", "pin_code", "gender"]
        for field in editable_fields:
            if field in data and data[field]:  # Ensure data is not empty
                setattr(customer, field, data[field])

        # Upload new profile picture if provided
        if profile_pic:
            try:
                upload_result = cloudinary.uploader.upload(
                    profile_pic, folder="customer_profile_pic"
                )
                customer.profile_pic = upload_result["secure_url"]
            except Exception as e:
                print(f"Image upload failed: {str(e)}")
                return {"error": "Image upload failed", "details": str(e)}, 500

        try:
            db.session.commit()
            print(f"After Update - Customer ID: {customer.id}")
            return customer
        except Exception as e:
            db.session.rollback()
            print(f"Database commit failed: {str(e)}")
            return {"error": "Database update failed", "details": str(e)}, 500


api.add_resource(CustomerProfileResource, "/customer/profile/<int:customer_id>")


from flask_restful import Resource, marshal_with, fields
from flask_security import auth_required, current_user
from backend.models import Payment, Wallet

# Define fields for marshalling payments
payment_fields = {
    "id": fields.Integer,
    "amount": fields.Float,
    "date_of_payment": fields.DateTime,
    "payment_status": fields.String,
    "is_transferred": fields.Boolean,
    "service_name": fields.String(attribute="service_request.service.name"),
    "professional_name": fields.String(attribute="service_request.professional.name"),
    "professional_email": fields.String(attribute="service_request.professional.email"),
}

# Define fields for wallet
wallet_fields = {"balance": fields.Float}


class CustomerPaymentResource(Resource):
    @auth_required("token")
    @marshal_with(
        {
            "payments": fields.List(fields.Nested(payment_fields)),
            "wallet": fields.Nested(wallet_fields),
        }
    )
    def get(self):
        # Get the customer from the logged-in user
        customer = current_user.customer
        print(f"Customer ID: {customer.id}")
        if not customer:
            return {"error": "Customer profile not found"}, 404

        # Fetch all payments associated with the customer
        payments = (
            Payment.query.filter_by(customer_id=customer.id)
            .order_by(Payment.date_of_payment.desc())
            .all()
        )

        # Fetch wallet balance
        wallet = Wallet.query.filter_by(customer_id=customer.id).first()

        return {
            "payments": payments,
            "wallet": (
                wallet if wallet else {"balance": 0.0}
            ),  # Default balance if wallet doesn't exist
        }


# Add the resource to the API
api.add_resource(CustomerPaymentResource, "/customer/payments")


class ProfessionalPaymentResource(Resource):
    @auth_required("token")
    @marshal_with(
        {
            "payments": fields.List(fields.Nested(payment_fields)),
            "wallet": fields.Nested(wallet_fields),
        }
    )
    def get(self):
        # Get the professional from the logged-in user
        professional = current_user.service_professional
        if not professional:
            return {"error": "Professional profile not found"}, 404

        # Fetch all payments associated with the professional
        payments = (
            Payment.query.filter_by(professional_id=professional.id)
            .order_by(Payment.date_of_payment.desc())
            .all()
        )

        # Fetch wallet balance
        wallet = ProfessionalWallet.query.filter_by(
            professional_id=professional.id
        ).first()

        return {
            "payments": payments,
            "wallet": (
                wallet if wallet else {"balance": 0.0}
            ),  # Default balance if wallet doesn't exist
        }


# Add the resource to the API
api.add_resource(ProfessionalPaymentResource, "/professional/payments")


class CancelServiceResource(Resource):
    @auth_required("token")
    def post(self, service_request_id):
        try:
            # Fetch the service request
            service_request = ServiceRequest.query.get(service_request_id)

            if not service_request:
                return {"message": "Service request not found"}, 404

            # Ensure only 'requested' services can be cancelled
            if service_request.service_status != "requested":
                return {"message": "Service cannot be cancelled at this stage"}, 400

            # Update service request status
            service_request.service_status = "cancelled"

            # Fetch related payment
            payment = Payment.query.filter_by(
                service_request_id=service_request_id
            ).first()
            if payment:
                # Mark payment as "Cancelled"
                payment.payment_status = "Cancelled"

                # Determine refund amount (custom price if available, otherwise base price)
                professional_service = ProfessionalService.query.filter_by(
                    professional_id=service_request.professional_id,
                    service_id=service_request.service_id,
                ).first()

                refund_amount = (
                    professional_service.custom_price
                    if professional_service and professional_service.custom_price
                    else payment.amount
                )

                # Update customer's wallet balance
                wallet = Wallet.query.filter_by(
                    customer_id=service_request.customer_id
                ).first()
                if wallet:
                    wallet.balance += refund_amount
                else:
                    # Create wallet if it doesn't exist
                    wallet = Wallet(
                        customer_id=service_request.customer_id, balance=refund_amount
                    )
                    db.session.add(wallet)

            db.session.commit()
            return {"message": "Service cancelled and payment refunded"}, 200

        except Exception as e:
            db.session.rollback()
            return {"message": str(e)}, 500


api.add_resource(CancelServiceResource, "/cancel_service/<int:service_request_id>")


from backend.celery.tasks import create_csv_zip, create_excel


class GenerateCSVResource(Resource):
    @auth_required("token")
    def get(self):
        """
        API endpoint to generate and download the CSV file for the admin.
        """
        file_type = request.args.get("file_type", "csv")

        try:
            if file_type == "csv":
                result = create_csv_zip.apply_async()
                zip_content = result.get()
                content_type = "application/zip"
                filename = "Admin_Reports.zip"
            elif file_type == "xlsx":
                result = create_excel.apply_async()
                xlsx_content = result.get()
                content_type = (
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
                filename = "Admin_Reports.xlsx"
            else:
                return {"message": "Invalid file type"}, 400

            return Response(
                zip_content if file_type == "csv" else xlsx_content,
                mimetype=content_type,
                headers={"Content-Disposition": f"attachment; filename={filename}"},
            )

        except Exception as e:
            return {"message": f"Error generating report: {str(e)}"}, 500


api.add_resource(GenerateCSVResource, "/admin/generate_report")


from backend.celery.tasks import create_customer_csv_zip, create_customer_excel
from flask import Response, request
from flask_restful import Resource
from flask_security import auth_required, current_user
from backend.celery.tasks import (
    create_customer_csv_zip,
    create_customer_excel,
    create_professional_csv_zip,
    create_professional_excel,
)


class GenerateCustomerReportResource(Resource):
    @auth_required("token")
    def get(self):
        """
        API endpoint to generate and download the CSV or Excel report for the customer.
        """
        file_type = request.args.get("file_type", "csv")
        customer_id = request.args.get(
            "customer_id"
        )  # 🔹 Get `customer_id` from query params
        if not customer_id:
            return {
                "message": "Customer ID is required"
            }, 400  # Handle missing customer ID

        try:
            if file_type == "csv":
                result = create_customer_csv_zip.apply_async(args=[customer_id])
                zip_content = result.get()
                content_type = "application/zip"
                filename = "Customer_Report.zip"
            elif file_type == "xlsx":
                result = create_customer_excel.apply_async(args=[customer_id])
                xlsx_content = result.get()
                content_type = (
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
                filename = "Customer_Report.xlsx"
            else:
                return {"message": "Invalid file type"}, 400

            return Response(
                zip_content if file_type == "csv" else xlsx_content,
                mimetype=content_type,
                headers={"Content-Disposition": f"attachment; filename={filename}"},
            )

        except Exception as e:
            return {"message": f"Error generating report: {str(e)}"}, 500


# Add to API routes
api.add_resource(GenerateCustomerReportResource, "/customer/generate_report")


class GenerateProfessionalReportResource(Resource):
    @auth_required("token")
    def get(self):
        """
        API endpoint to generate and download the CSV or Excel report for the professional.
        """
        file_type = request.args.get("file_type", "csv")
        professional_id = request.args.get(
            "professional_id"
        )  # Get `professional_id` from query params
        if not professional_id:
            return {
                "message": "Professional ID is required"
            }, 400  # Handle missing professional ID

        try:
            if file_type == "csv":
                result = create_professional_csv_zip.apply_async(args=[professional_id])
                zip_content = result.get()
                content_type = "application/zip"
                filename = "Professional_Report.zip"
            elif file_type == "xlsx":
                result = create_professional_excel.apply_async(args=[professional_id])
                xlsx_content = result.get()
                content_type = (
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                )
                filename = "Professional_Report.xlsx"
            else:
                return {"message": "Invalid file type"}, 400

            return Response(
                zip_content if file_type == "csv" else xlsx_content,
                mimetype=content_type,
                headers={"Content-Disposition": f"attachment; filename={filename}"},
            )

        except Exception as e:
            return {"message": f"Error generating report: {str(e)}"}, 500


# Add to API routes
api.add_resource(GenerateProfessionalReportResource, "/professional/generate_report")

import random
import string
from datetime import timedelta
from flask import request
from flask_restful import Resource
from backend.models import User, Customer, ServiceProfessional, db
from backend.celery.tasks import send_forgot_password_email
from backend.celery.celery_factory import redis_client
from flask_security import hash_password
from flask_cors import CORS

# Enable CORS to allow frontend requests
CORS()


def generate_otp():
    """Generate a 6-digit random OTP"""
    return "".join(random.choices(string.digits, k=6))


class ForgotPasswordResource(Resource):
    def post(self):
        data = request.get_json()
        print("Received request data:", data)

        email_or_phone = data.get("email_or_phone")
        if not email_or_phone:
            return {"message": "Email or phone number is required"}, 400

        user = User.query.filter(
            (User.email == email_or_phone)
            | (User.customer.has(Customer.phone_no == email_or_phone))
            | (
                User.service_professional.has(
                    ServiceProfessional.phone_no == email_or_phone
                )
            )
        ).first()

        if not user:
            print(f"User not found for: {email_or_phone}")
            return {"message": "User not found"}, 404

        otp = generate_otp()
        redis_key = f"otp:{user.id}"
        redis_client.setex(redis_key, timedelta(minutes=10), otp)
        print(f"Stored OTP {otp} for user {user.email} (Redis Key: {redis_key})")

        send_forgot_password_email.delay(user.email, user.username, otp)

        return {"message": "OTP sent to registered email"}, 200


class VerifyOTPResource(Resource):
    def post(self):
        data = request.get_json()
        print("Received request data:", data)

        email_or_phone = data.get("email_or_phone")
        otp = data.get("otp")

        if not email_or_phone or not otp:
            return {"message": "Email and OTP are required"}, 400

        user = User.query.filter(
            (User.email == email_or_phone)
            | (User.customer.has(Customer.phone_no == email_or_phone))
            | (
                User.service_professional.has(
                    ServiceProfessional.phone_no == email_or_phone
                )
            )
        ).first()

        if not user:
            print(f"User not found for: {email_or_phone}")
            return {"message": "User not found"}, 404

        redis_key = f"otp:{user.id}"
        stored_otp = redis_client.get(redis_key)

        if not stored_otp:
            print(f"OTP not found or expired for user {user.email}")
            return {
                "message": "Invalid or expired OTP",
                "success": False,
            }, 200  # ✅ Return 200 instead of 400

        stored_otp = stored_otp.strip()  # Decode Redis bytes to string
        attempt_key = f"otp_attempts:{user.id}"  # Ensure attempt key is always defined

        if stored_otp != otp.strip():
            print(
                f"Invalid OTP entered for {user.email}. Expected: {stored_otp}, Received: {otp}"
            )

            # Track failed attempts in Redis
            attempts = redis_client.get(attempt_key)
            attempts = int(attempts) if attempts else 0
            attempts += 1
            redis_client.setex(attempt_key, timedelta(minutes=10), attempts)

            return {
                "message": "Invalid OTP. Please try again.",
                "success": False,
            }, 200  # ✅ Return 200 instead of 400

        print(f"OTP verified successfully for {user.email}")

        # Reset attempt counter on successful verification
        redis_client.delete(attempt_key)

        return {"message": "OTP verified successfully", "success": True}, 200


class ResetPasswordResource(Resource):
    def post(self):
        data = request.get_json()
        print("Received request data:", data)

        email_or_phone = data.get("email_or_phone")
        otp = data.get("otp")
        new_password = data.get("new_password")

        if not email_or_phone or not otp or not new_password:
            return {"message": "Email/Phone, OTP, and new password are required"}, 400

        # Allow both email and phone for lookup
        user = User.query.filter(
            (User.email == email_or_phone)
            | (User.customer.has(Customer.phone_no == email_or_phone))
            | (
                User.service_professional.has(
                    ServiceProfessional.phone_no == email_or_phone
                )
            )
        ).first()

        if not user:
            print(f"User not found for: {email_or_phone}")
            return {"message": "User not found"}, 404

        redis_key = f"otp:{user.id}"
        stored_otp = redis_client.get(redis_key)

        if not stored_otp:
            print(f"OTP not found or expired for user {user.email}")
            return {"message": "Invalid or expired OTP"}, 400

        stored_otp = stored_otp.strip()

        if stored_otp != otp.strip():
            print(
                f"Invalid OTP entered during password reset for {user.email}. Expected: {stored_otp}, Received: {otp}"
            )
            return {"message": "Invalid OTP"}, 400

        try:
            print(f"Hashing new password for user: {user.email}")
            user.password = hash_password(new_password)
            db.session.commit()
            print(f"Password updated successfully for user: {user.email}")
        except Exception as e:
            db.session.rollback()
            print(f"Error updating password for {user.email}: {str(e)}")
            return {"message": "Error updating password"}, 500

        redis_client.delete(redis_key)
        print(f"OTP {otp} deleted from Redis for user {user.email}")

        return {"message": "Password reset successful"}, 200


# Register API endpoints
api.add_resource(ForgotPasswordResource, "/forgot-password")
api.add_resource(VerifyOTPResource, "/verify-otp")
api.add_resource(ResetPasswordResource, "/reset-password")


from flask import jsonify
from backend.utils import get_professional_count


@app.route("/api/services/<int:service_id>/professional-count", methods=["GET"])
def get_service_professional_count(service_id):
    count = get_professional_count(service_id)
    return jsonify({"count": count})
