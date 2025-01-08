# from flask_sqlalchemy import SQLAlchemy
# from flask_security import UserMixin,RoleMixin # UserMixin and RoleMixin are classes that are used to add some default columns to the User and Role class

# db=SQLAlchemy() # creating an instance of SQLAlchemy class and storing it in db variable 

# class User(db.Model,UserMixin): # creating a class User that inherits from db.Model
#     id=db.Column(db.Integer,primary_key=True)
#     email=db.Column(db.String,unique=True,nullable=False)
#     password=db.Column(db.String,nullable=False)
#     username=db.Column(db.String,unique=True)
#     fs_uniquifier=db.Column(db.String,unique=True,nullable=False) # fs_uniquifier is a unique identifier for the user
#     active=db.Column(db.Boolean,default=True) # default value is True for active column means user is active
#     roles=db.Relationship("Role",backref="bearers",secondary="user_roles") # creating a relationship between User and Role class
#     # first_name=db.Column(db.String)
#     # last_name=db.Column(db.String)
#     # is_active=db.Column(db.Boolean,default=True)
#     # is_admin=db.Column(db.Boolean,default=False)
    
# class Role(db.Model,RoleMixin): # creating a class Role that inherits from db.Model
#     id=db.Column(db.Integer,primary_key=True)
#     name=db.Column(db.String,unique=True,nullable=False)
#     description=db.Column(db.String,nullable=False)
    
    
# class UserRoles(db.Model): # creating a class UserRoles that inherits from db.Model 
#     id=db.Column(db.Integer,primary_key=True)
#     user_id=db.Column(db.Integer,db.ForeignKey('user.id'))
#     role_id=db.Column(db.Integer,db.ForeignKey('role.id'))
# from datetime import datetime
# from flask_sqlalchemy import SQLAlchemy
# from flask_security import UserMixin, RoleMixin

# db = SQLAlchemy()

# class Customer(db.Model):
#     __tablename__ = "customer"
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     username = db.Column(db.String, unique=True, nullable=False)
#     password = db.Column(db.String, nullable=False)
#     name = db.Column(db.String, nullable=False)
#     email = db.Column(db.String, unique=True, nullable=False)
#     address = db.Column(db.String, nullable=False)
#     pin_code = db.Column(db.String, nullable=False)
#     phone_no = db.Column(db.Integer, nullable=False)
#     gender = db.Column(db.String, nullable=True)  # New column for gender (optional)
#     profile_pic = db.Column(db.String, nullable=True)  # New column for profile picture (optional)
#     average_rating = db.Column(db.Float, nullable=True)  # New column for average rating
#     is_blocked = db.Column(db.Boolean, default=False)  # New column to track block status

#     user = db.relationship("User", back_populates="customer", uselist=False)

# class Service_Professional(db.Model):
#     __tablename__ = "service_professional"
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
#     username = db.Column(db.String, unique=True, nullable=False)
#     password = db.Column(db.String, nullable=False)
#     name = db.Column(db.String, nullable=False)
#     service_type = db.Column(db.String, nullable=False)  # nullable true done for some reason
#     experience = db.Column(db.Integer, nullable=False)
#     phone_no = db.Column(db.Integer, nullable=False)
#     email = db.Column(db.String, unique=True, nullable=False)
#     address = db.Column(db.String, nullable=False)
#     pin_code = db.Column(db.String, nullable=False)
#     verified_status = db.Column(db.String, nullable=True, default="Not verified yet")
#     gender = db.Column(db.String, nullable=True)  # New column for gender (optional)
#     profile_pic = db.Column(db.String, nullable=True)  # New column for profile picture (optional)
#     average_rating = db.Column(db.Float, nullable=True)  # New column for average rating
#     document = db.Column(db.String, nullable=True)  # Column to store document path
#     block_status = db.Column(db.Boolean, default=False)  # Block/unblock status

#     user = db.relationship("User", back_populates="service_professional", uselist=False)
#     custom_services = db.relationship("ProfessionalService", back_populates="professional")

# class Service(db.Model):
#     __tablename__ = "service"
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     name = db.Column(db.String, nullable=False)
#     base_price = db.Column(db.Integer, nullable=False)  # Changed 'price' to 'base_price'
#     base_time_required = db.Column(db.String, nullable=True)
#     description = db.Column(db.String, nullable=False)
#     service_pic = db.Column(db.String, nullable=True)  # New column for service picture (optional)

#     professional_services = db.relationship(
#         "ProfessionalService", back_populates="service"
#     )

# class ProfessionalService(db.Model):
#     __tablename__ = "professional_service"
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     professional_id = db.Column(db.Integer, db.ForeignKey("service_professional.id"), nullable=False)
#     service_id = db.Column(db.Integer, db.ForeignKey("service.id"), nullable=False)
#     custom_price = db.Column(db.Integer, nullable=True)
#     custom_description = db.Column(db.String, nullable=True)
#     custom_time_required = db.Column(db.String)  # New field for time required in minutes (or hours)

#     # Use back_populates instead of backref, to avoid conflicts
#     professional = db.relationship("Service_Professional", back_populates="custom_services")
#     service = db.relationship("Service", back_populates="professional_services")

# class Payment(db.Model):
#     __tablename__ = "payment"
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     service_request_id = db.Column(db.Integer, db.ForeignKey("service_request.id"), nullable=False)
#     customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"), nullable=False)
#     professional_id = db.Column(db.Integer, db.ForeignKey("service_professional.id"), nullable=False)
#     amount = db.Column(db.Float, nullable=False)
#     date_of_payment = db.Column(db.DateTime, default=datetime.utcnow)
#     payment_status = db.Column(db.String, nullable=False, default="Pending")  # e.g., 'Pending', 'Completed'
#     is_transferred = db.Column(db.Boolean, default=False)  # Track if the money is transferred

#     # Relationships
#     service_request = db.relationship("Service_Request", back_populates="payments")
#     customer = db.relationship("Customer", backref="payments")
#     professional = db.relationship("Service_Professional", backref="payments")

# class Wallet(db.Model):
#     __tablename__ = "wallet"
#     id = db.Column(db.Integer, primary_key=True)
#     customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"), nullable=False)
#     balance = db.Column(db.Float, default=0.0)
#     customer = db.relationship("Customer", backref="wallet")

# class ProfessionalWallet(db.Model):
#     __tablename__ = "professional_wallet"
#     id = db.Column(db.Integer, primary_key=True)
#     professional_id = db.Column(db.Integer, db.ForeignKey("service_professional.id"), nullable=False)
#     balance = db.Column(db.Float, default=0.0)

# class Service_Request(db.Model):
#     __tablename__ = "service_request"
#     id = db.Column(db.Integer, primary_key=True, autoincrement=True)
#     service_id = db.Column(db.Integer, db.ForeignKey("service.id"), nullable=False)
#     customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"), nullable=False)
#     professional_id = db.Column(db.Integer, db.ForeignKey("service_professional.id"), nullable=False)

#     date_of_request = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
#     date_of_completion = db.Column(db.DateTime)
#     service_status = db.Column(db.String, nullable=False)  # e.g., 'requested', 'assigned', 'closed'
#     remarks = db.Column(db.String, nullable=True)  # ratings given by customer
#     rating = db.Column(db.Integer, nullable=True)  # Added this line for the rating
#     customer_rating = db.Column(db.Integer, nullable=True)  # Rating given by professional
#     customer_remarks = db.Column(db.String, nullable=True)  # Remarks from the professional
#     requested_date = db.Column(db.Date)
#     requested_time = db.Column(db.Time)

#     service = db.relationship("Service", backref=db.backref("service_requests", lazy=True))
#     customer = db.relationship("Customer", backref=db.backref("service_requests", lazy=True))
#     professional = db.relationship("Service_Professional", backref=db.backref("service_requests", lazy=True, cascade="all, delete-orphan"))
#     payments = db.relationship("Payment", back_populates="service_request", lazy=True)

# class User(db.Model, UserMixin):  # creating a class User that inherits from db.Model
#     id = db.Column(db.Integer, primary_key=True)
#     email = db.Column(db.String, unique=True, nullable=False)
#     password = db.Column(db.String, nullable=False)
#     username = db.Column(db.String, unique=True)
#     fs_uniquifier = db.Column(db.String, unique=True, nullable=False)  # fs_uniquifier is a unique identifier for the user
#     active = db.Column(db.Boolean, default=True)  # default value is True for active column means user is active
#     roles = db.relationship("Role", backref="bearers", secondary="user_roles")  # creating a relationship between User and Role class

#     customer = db.relationship("Customer", back_populates="user", uselist=False)
#     service_professional = db.relationship("Service_Professional", back_populates="user", uselist=False)

# class Role(db.Model, RoleMixin):  # creating a class Role that inherits from db.Model
#     id = db.Column(db.Integer, primary_key=True)
#     name = db.Column(db.String, unique=True, nullable=False)
#     description = db.Column(db.String, nullable=False)

# class UserRoles(db.Model):  # creating a class UserRoles that inherits from db.Model
#     id = db.Column(db.Integer, primary_key=True)
#     user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
#     role_id = db.Column(db.Integer, db.ForeignKey('role.id'))
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_security import UserMixin, RoleMixin

db = SQLAlchemy()

# Role and UserRoles Models
class Role(db.Model, RoleMixin):
    __tablename__ = "role"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

class UserRoles(db.Model):
    __tablename__ = "user_roles"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    role_id = db.Column(db.Integer, db.ForeignKey("role.id"))

# Main User Model
class User(db.Model, UserMixin):
    __tablename__ = "user"
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    username = db.Column(db.String(255), unique=True, nullable=True)
    fs_uniquifier = db.Column(db.String(255), unique=True, nullable=False)
    active = db.Column(db.Boolean, default=True)
    roles = db.relationship("Role", secondary="user_roles", backref=db.backref("users", lazy="dynamic"))

    # Relationships to extended models
    customer = db.relationship("Customer", back_populates="user", uselist=False, cascade="all, delete-orphan")
    service_professional = db.relationship("ServiceProfessional", back_populates="user", uselist=False, cascade="all, delete-orphan")

# Customer Model
class Customer(db.Model):
    __tablename__ = "customer"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    address = db.Column(db.String(255), nullable=False)
    pin_code = db.Column(db.String(20), nullable=False)
    phone_no = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    gender = db.Column(db.String(10), nullable=True)
    profile_pic = db.Column(db.String(255), nullable=True)
    average_rating = db.Column(db.Float, nullable=True)
    is_blocked = db.Column(db.Boolean, default=False)

    # Relationship back to User
    user = db.relationship("User", back_populates="customer")

# Service Professional Model
class ServiceProfessional(db.Model):
    __tablename__ = "service_professional"
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    service_type = db.Column(db.String(255), nullable=False)
    experience = db.Column(db.Integer, nullable=False)
    phone_no = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(255), nullable=False, unique=True)
    address = db.Column(db.String(255), nullable=False)
    pin_code = db.Column(db.String(20), nullable=False)
    verified_status = db.Column(db.String(50), nullable=False, default="Not verified yet")
    gender = db.Column(db.String(10), nullable=True)
    profile_pic = db.Column(db.String(255), nullable=True)
    average_rating = db.Column(db.Float, nullable=True)
    document = db.Column(db.String(255), nullable=True)
    block_status = db.Column(db.Boolean, default=False)

    # Relationship back to User
    user = db.relationship("User", back_populates="service_professional")
    custom_services = db.relationship("ProfessionalService", back_populates="professional")

# Service Model
class Service(db.Model):
    __tablename__ = "service"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String, nullable=False)
    base_price = db.Column(db.Integer, nullable=False)
    base_time_required = db.Column(db.String, nullable=True)
    description = db.Column(db.String, nullable=False)
    service_pic = db.Column(db.String, nullable=True)

    professional_services = db.relationship("ProfessionalService", back_populates="service")

# ProfessionalService Model
class ProfessionalService(db.Model):
    __tablename__ = "professional_service"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    professional_id = db.Column(db.Integer, db.ForeignKey("service_professional.id"), nullable=False)
    service_id = db.Column(db.Integer, db.ForeignKey("service.id"), nullable=False)
    custom_price = db.Column(db.Integer, nullable=True)
    custom_description = db.Column(db.String, nullable=True)
    custom_time_required = db.Column(db.String)

    professional = db.relationship("ServiceProfessional", back_populates="custom_services")
    service = db.relationship("Service", back_populates="professional_services")

# Payment Model
class Payment(db.Model):
    __tablename__ = "payment"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_request_id = db.Column(db.Integer, db.ForeignKey("service_request.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey("service_professional.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    date_of_payment = db.Column(db.DateTime, default=datetime.utcnow)
    payment_status = db.Column(db.String, nullable=False, default="Pending")
    is_transferred = db.Column(db.Boolean, default=False)

    service_request = db.relationship("Service_Request", back_populates="payments")
    customer = db.relationship("Customer", backref="payments")
    professional = db.relationship("ServiceProfessional", backref="payments")

# Wallet Model
class Wallet(db.Model):
    __tablename__ = "wallet"
    id = db.Column(db.Integer, primary_key=True)
    customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"), nullable=False)
    balance = db.Column(db.Float, default=0.0)
    customer = db.relationship("Customer", backref="wallet")

# ProfessionalWallet Model
class ProfessionalWallet(db.Model):
    __tablename__ = "professional_wallet"
    id = db.Column(db.Integer, primary_key=True)
    professional_id = db.Column(db.Integer, db.ForeignKey("service_professional.id"), nullable=False)
    balance = db.Column(db.Float, default=0.0)

# Service_Request Model
class Service_Request(db.Model):
    __tablename__ = "service_request"
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    service_id = db.Column(db.Integer, db.ForeignKey("service.id"), nullable=False)
    customer_id = db.Column(db.Integer, db.ForeignKey("customer.id"), nullable=False)
    professional_id = db.Column(db.Integer, db.ForeignKey("service_professional.id"), nullable=False)

    date_of_request = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    date_of_completion = db.Column(db.DateTime)
    service_status = db.Column(db.String, nullable=False)
    remarks = db.Column(db.String, nullable=True)
    rating = db.Column(db.Integer, nullable=True)
    customer_rating = db.Column(db.Integer, nullable=True)
    customer_remarks = db.Column(db.String, nullable=True)
    requested_date = db.Column(db.Date)
    requested_time = db.Column(db.Time)

    service = db.relationship("Service", backref=db.backref("service_requests", lazy=True))
    customer = db.relationship("Customer", backref=db.backref("service_requests", lazy=True))
    professional = db.relationship("ServiceProfessional", backref=db.backref("service_requests", lazy=True, cascade="all, delete-orphan"))
    payments = db.relationship("Payment", back_populates="service_request", lazy=True)