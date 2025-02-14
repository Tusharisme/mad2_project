from celery import shared_task
from backend.celery.mail_services import send_email
from backend.models import ServiceProfessional, ServiceRequest, Customer
import datetime
import os


@shared_task(ignore_result=True)
def email_reminder():
    """
    Task to send daily reminders to service professionals with Pending service requests.
    """
    professionals_with_pending_requests = (
        ServiceProfessional.query.join(ServiceRequest, ServiceProfessional.id == ServiceRequest.professional_id)
        .filter(ServiceRequest.service_status == 'requested')
        .distinct()
        .all()
    )

    for professional in professionals_with_pending_requests:
        pending_requests = ServiceRequest.query.filter_by(
            professional_id=professional.id, service_status='requested'
        ).count()

        content = f"""
        Dear {professional.name},
        
        You have {pending_requests} Pending service requests that need your attention.
        Please log in to your dashboard to accept or reject these requests.

        Best regards,
        Your Service Management Team.
        """
        send_email(professional.email, "Daily Reminder: Pending Service Requests", content)

    return "Daily reminders sent successfully."


@shared_task(ignore_result=True)
def send_monthly_report():
    """
    Task to generate and send a monthly activity report to all customers.
    """
    now = datetime.datetime.now()
    first_day_of_month = datetime.datetime(now.year, now.month - 1, 1) if now.month > 1 else datetime.datetime(now.year - 1, 12, 1)
    first_day_of_next_month = datetime.datetime(now.year, now.month, 1)

    customers = Customer.query.all()

    for customer in customers:
        total_requested = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer.id,
            ServiceRequest.requested_date >= first_day_of_month,
            ServiceRequest.requested_date < first_day_of_next_month,
        ).count()

        total_closed = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer.id,
            ServiceRequest.service_status == 'closed',
            ServiceRequest.requested_date >= first_day_of_month,
            ServiceRequest.requested_date < first_day_of_next_month,
        ).count()

        html_report = f"""
        <html>
            <body>
                <h1>Monthly Activity Report</h1>
                <p>Dear {customer.name},</p>
                <p>Your activity summary for {first_day_of_month.strftime('%B %Y')}:</p>
                <ul>
                    <li>Total Services Requested: {total_requested}</li>
                    <li>Total Services Closed: {total_closed}</li>
                </ul>
                <p>Thank you!</p>
            </body>
        </html>
        """

        subject = f"Monthly Activity Report - {first_day_of_month.strftime('%B %Y')}"
        send_email(customer.email, subject, html_report, content_type='html')

    return "Monthly reports sent successfully."


@shared_task(ignore_result=False)
def create_csv():
    """
    Task to create a CSV file containing closed service data.
    """
    import csv

    output_dir = "./backend/celery/user-downloads"
    os.makedirs(output_dir, exist_ok=True)

    output_file = os.path.join(output_dir, "closed_services.csv")

    closed_services = ServiceRequest.query.filter(
        ServiceRequest.service_status == 'Completed',
        ServiceRequest.remarks.isnot(None)  # Ensures customer_remark is not null
    ).all()

    with open(output_file, mode='w', newline='', encoding='utf-8') as csvfile:
        writer = csv.writer(csvfile)
        
        # Write header row
        writer.writerow(['Service ID', 'Customer ID', 'Professional ID', 'Date of Request', 'Remarks'])

        # Write data rows
        for service in closed_services:
            writer.writerow([
                service.id,
                service.customer_id,
                service.professional_id,
                service.requested_date.strftime('%Y-%m-%d'),
                service.remarks or ''
            ])

    return output_file
