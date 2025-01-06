from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db,User,Role
from flask_security import Security,SQLAlchemyUserDatastore,auth_required


def CreateApp():
    app=Flask(__name__,template_folder="frontend",static_folder="frontend",static_url_path="/static") 
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app) # initializing the app with db instance
    datastore= SQLAlchemyUserDatastore(db,User,Role)
    app.security=Security(app,datastore=datastore,register_blueprint=False) # initializing the app with Security instance and passing the app and datastore instance
    app.app_context().push() # pushing the app context to the app instance 
    return app

app=CreateApp()

import backend.create_initial_data

import backend.routes

if __name__=='__main__':
    app.run()