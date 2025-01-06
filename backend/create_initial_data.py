from flask import current_app as app
from backend.models import db,User,Role
from flask_security import SQLAlchemyUserDatastore,hash_password

with app.app_context():
    db.create_all()
    userdatastore:SQLAlchemyUserDatastore=app.security.datastore # getting the datastore instance from the app instance
    userdatastore.find_or_create_role(name='admin',description='super-user')
    userdatastore.find_or_create_role(name='user',description='normal-user')
    
    if(not userdatastore.find_user(email="admin@study.iitm.ac.in")):
        userdatastore.create_user(email="admin@study.iitm.ac.in",password=hash_password("pass"),username="admin",roles=['admin'])
    if(not userdatastore.find_user(email="user01@study.iitm.ac.in")):

        userdatastore.create_user(email="user01@study.iitm.ac.in",password=hash_password("pass"),username="user01",roles=['user'])
        
    db.session.commit()
    