from flask import current_app as app, jsonify, render_template, request
from flask_login import login_user
from flask_security import auth_required,verify_password,hash_password
from backend.models import db
datastore=app.security.datastore

from backend.models import User

@app.get('/')
def home():
    return render_template('index.html')
@app.get("/protected")
@auth_required("token")
def protected():
    return "You are in a protected route"

@app.route("/login",methods=['POST'])
def login():
    data=request.get_json() # getting the data from the request body and converting it to json
    email=data.get('email')
    password=data.get('password')
    user=datastore.find_user(email=email) # finding the user by email
    if not email or not password:
        return jsonify({'message':'Email and password are required'}),404
    if user is None:
        return jsonify({'message':'User not found'}),404
    if verify_password(password,user.password):
        return jsonify({"token":user.get_auth_token(),"email":user.email,"role":user.roles[0].name,"id":user.id}),200
    return jsonify({'message':'Invalid credentials'}),404

@app.route("/register",methods=['POST'])
def register():
    data=request.get_json()
    email=data.get('email')
    password=data.get('password')
    username=data.get('username')
    role=data.get('role')
    
    user=datastore.find_user(email=email)
    if user :
        return jsonify({'message':'User already exists'}),404
    if not email or not password or role not in ['admin','user']:
        return jsonify({'message':'Email and password are required'}),404
    try:
        datastore.create_user(email=email,password=hash_password(password),username=username,roles=[role])
        db.session.commit()
        return jsonify({'message':'User got created'}),200
    except Exception as e:
        db.session.rollback() # rollback the session if any error occurs while creating the user 
        return jsonify({'message':str(e)}),404