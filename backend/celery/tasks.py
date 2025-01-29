from celery import shared_task
import time
import flask_excel
import os
from backend.models import Service
from backend.celery.mail_services import send_email


@shared_task(ignore_result=False)
def add(x, y):
    time.sleep(10)
    return x + y

@shared_task(ignore_result=False)
def create_csv():
    # Ensure the directory exists
    output_dir = "./backend/celery/user-downloads"
    os.makedirs(output_dir, exist_ok=True)
    
    # Define the output file path
    output_file = os.path.join(output_dir, "services.csv")

    # Query the database
    resource = Service.query.all()
    column_names = [column.name for column in Service.__table__.columns]
    
    # Generate the CSV data
    csv_out = flask_excel.make_response_from_query_sets(resource, column_names=column_names, file_type="csv")

    # Write the CSV data to the file
    with open(output_file, "wb") as f:
        f.write(csv_out.data)
    
    return output_file

@shared_task(ignore_result=True)
def email_reminder(to,subject,content):
    send_email(to,subject,content)
