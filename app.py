from flask import Flask
from backend.config import LocalDevelopmentConfig
from backend.models import db,User,Role
from flask_security import Security,SQLAlchemyUserDatastore,auth_required
from backend.celery.celery_factory import celery_init_app

from backend.create_initial_data import setup_roles_and_users
from flask_caching import Cache
import flask_excel as excel

def CreateApp():
    app=Flask(__name__,template_folder="frontend",static_folder="frontend",static_url_path="/static") 
    app.config.from_object(LocalDevelopmentConfig)
    db.init_app(app) # initializing the app with db instance
    cache=Cache(app) # initializing the app with cache instance
    
    datastore= SQLAlchemyUserDatastore(db,User,Role)
    app.cache=cache
    app.security=Security(app,datastore=datastore,register_blueprint=False) # initializing the app with Security instance and passing the app and datastore instance
    app.app_context().push() # pushing the app context to the app instance 
    # Create and populate the database
    setup_roles_and_users(app)
    from backend.resources import api
    api.init_app(app) # initializing the app with flask_restful api instance

    return app

app=CreateApp()
celery_app=celery_init_app(app)

import backend.create_initial_data

import backend.routes

excel.init_excel(app) # initializing the app with excel instance
if __name__=='__main__':
    app.run()