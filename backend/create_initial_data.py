from flask import current_app as app
from backend.models import Customer, Service, ServiceProfessional, ProfessionalService, db, User, Role
from flask_security import SQLAlchemyUserDatastore, hash_password

def setup_roles_and_users(app):
    with app.app_context():
        db.create_all()
        user_datastore = SQLAlchemyUserDatastore(db, User, Role)

        # Create roles
        roles = [
            {"name": "admin", "description": "Administrator with full access"},
            {"name": "customer", "description": "Standard customer role"},
            {"name": "professional", "description": "Service professional role"},
        ]
        for role in roles:
            if not user_datastore.find_role(role["name"]):
                user_datastore.create_role(**role)

        # Create an admin user
        if not user_datastore.find_user(email="admin@study.iitm.ac.in"):
            admin_user = user_datastore.create_user(
                email="admin@study.iitm.ac.in",
                password=hash_password("pass"),
                username="admin",
                roles=["admin"]
            )

        # Create a customer user
        if not user_datastore.find_user(email="user01@study.iitm.ac.in"):
            customer_user = user_datastore.create_user(
                email="user01@study.iitm.ac.in",
                password=hash_password("pass"),
                username="user01",
                roles=["customer"]
            )
            db.session.commit()  # Commit the user to get the user_id

            # Add Customer-specific details
            new_customer = Customer(
                user_id=customer_user.id,
                name="Customer Name",
                address="123 Default Street",
                pin_code="123456",
                phone_no="1234567890",
                email=customer_user.email
            )
            db.session.add(new_customer)

        # Create service professionals for Plumbing and Electrical
        if not user_datastore.find_user(email="pro_plumbing@study.iitm.ac.in"):
            professional_user_plumbing = user_datastore.create_user(
                email="pro_plumbing@study.iitm.ac.in",
                password=hash_password("pass"),
                username="pro_plumbing",
                roles=["professional"]
            )
            db.session.commit()  # Commit the user to get the user_id

            # Add ServiceProfessional-specific details for Plumbing
            new_professional_plumbing = ServiceProfessional(
                user_id=professional_user_plumbing.id,
                name="Plumbing Professional",
                service_type="Plumbing",
                experience=5,
                phone_no="9876543210",
                email=professional_user_plumbing.email,
                address="456 Plumbing Street",
                pin_code="654321"
            )
            db.session.add(new_professional_plumbing)

            # Link to the Plumbing service
            plumbing_service = Service.query.filter_by(name="Plumbing").first()
            if not plumbing_service:
                plumbing_service = Service(
                    name="Plumbing",
                    base_price=100,
                    base_time_required="1 hour",
                    description="Basic plumbing services",
                    image_url=None
                )
                db.session.add(plumbing_service)
                db.session.commit()

            professional_service_plumbing = ProfessionalService(
                professional_id=new_professional_plumbing.id,
                service_id=plumbing_service.id,
                custom_price=120,
                custom_time_required="1.5 hours",
                custom_description="Custom plumbing service"
            )
            db.session.add(professional_service_plumbing)

        if not user_datastore.find_user(email="pro_electrical@study.iitm.ac.in"):
            professional_user_electrical = user_datastore.create_user(
                email="pro_electrical@study.iitm.ac.in",
                password=hash_password("pass"),
                username="pro_electrical",
                roles=["professional"]
            )
            db.session.commit()  # Commit the user to get the user_id

            # Add ServiceProfessional-specific details for Electrical
            new_professional_electrical = ServiceProfessional(
                user_id=professional_user_electrical.id,
                name="Electrical Professional",
                service_type="Electrical",
                experience=5,
                phone_no="9876543210",
                email=professional_user_electrical.email,
                address="456 Electrical Street",
                pin_code="654321"
            )
            db.session.add(new_professional_electrical)

            # Link to the Electrical service
            electrical_service = Service.query.filter_by(name="Electrical").first()
            if not electrical_service:
                electrical_service = Service(
                    name="Electrical",
                    base_price=150,
                    base_time_required="1.5 hours",
                    description="Basic electrical services",
                    image_url=None
                )
                db.session.add(electrical_service)
                db.session.commit()

            professional_service_electrical = ProfessionalService(
                professional_id=new_professional_electrical.id,
                service_id=electrical_service.id,
                custom_price=160,
                custom_description="Custom electrical service"
            )
            db.session.add(professional_service_electrical)

        # Commit all changes to the database
        db.session.commit()
