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

       

        # Commit all changes to the database
        db.session.commit()
