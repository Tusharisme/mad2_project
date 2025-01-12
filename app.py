from flask import Flask
from flask_login import login_required
from backend.config import LocalDevelopmentConfig
from backend.models import db, User, Role
from flask_security import Security, SQLAlchemyUserDatastore, auth_required
from flask_caching import Cache
from backend.celery.celery_factory import celery_init_app
from backend.create_initial_data import setup_roles_and_users
import flask_excel as excel
import cloudinary
import cloudinary.uploader


def createApp():
    app = Flask(__name__, template_folder='frontend', static_folder='frontend', static_url_path='/static')

    app.config.from_object(LocalDevelopmentConfig)
     # model init
    db.init_app(app)
    # Cloudinary initialization
    cloudinary.config(
        cloud_name=app.config['CLOUDINARY_CLOUD_NAME'],
        api_key=app.config['CLOUDINARY_API_KEY'],
        api_secret=app.config['CLOUDINARY_API_SECRET']
    )

    # cache init
    cache = Cache(app)


    #flask security
    datastore = SQLAlchemyUserDatastore(db, User, Role)
    app.cache = cache

    app.security = Security(app, datastore=datastore, register_blueprint=False)
    app.app_context().push()
    setup_roles_and_users(app)
    from backend.resources import api
    # flask-restful init
    api.init_app(app)

    return app

app = createApp()

celery_app = celery_init_app(app)

import backend.create_initial_data

import backend.routes

# import backend.celery.celery_schedule

excel.init_excel(app)

if (__name__ == '__main__'):
    # flask-excel
    app.run()
