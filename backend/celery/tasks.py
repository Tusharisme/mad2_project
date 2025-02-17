from celery import shared_task
from backend.celery.mail_services import send_email
from backend.models import Service, ServiceProfessional, ServiceRequest, Customer
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

import csv
import io
import zipfile
import pandas as pd
from datetime import datetime
from celery import shared_task
from backend.models import ServiceRequest, Customer, ServiceProfessional, Payment, Wallet, ProfessionalWallet, Service

@shared_task(ignore_result=False)
def create_csv_zip():
    """
    Task to create multiple CSV files and return them as a ZIP archive.
    """
    output = io.BytesIO()
    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zip_file:

        def add_csv_to_zip(filename, headers, rows):
            file_output = io.StringIO()
            writer = csv.writer(file_output)
            writer.writerow(headers)
            writer.writerows(rows)
            zip_file.writestr(filename, file_output.getvalue())

        # Service Requests
        service_requests = ServiceRequest.query.all()
        service_data = [
            [
                sr.id,
                Customer.query.get(sr.customer_id).name if sr.customer_id else "N/A",
                ServiceProfessional.query.get(sr.professional_id).name if sr.professional_id else "N/A",
                Service.query.get(sr.service_id).name if sr.service_id else "N/A",
                sr.service_status,
                sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
                sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
                sr.customer_rating or 'N/A',
                sr.rating or 'N/A',
                sr.remarks or ''
            ]
            for sr in service_requests
        ]
        add_csv_to_zip("service_requests.csv", ['Service ID', 'Customer Name', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Professional Rating', 'Remarks'], service_data)

        # Customers
        customers = Customer.query.all()
        customer_data = [[c.id, c.name, c.email, c.phone_no, c.address, c.average_rating or 'N/A'] for c in customers]
        add_csv_to_zip("customers.csv", ['Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Average Rating'], customer_data)

        # Service Professionals
        professionals = ServiceProfessional.query.all()
        professional_data = [[p.id, p.name, p.service_type, p.experience, p.verified_status, p.average_rating or 'N/A'] for p in professionals]
        add_csv_to_zip("service_professionals.csv", ['Professional ID', 'Name', 'Service Type', 'Experience (Years)', 'Verified Status', 'Average Rating'], professional_data)

        # Payments
        payments = Payment.query.all()
        payment_data = [
            [
                p.id,
                p.service_request_id,
                Customer.query.get(p.customer_id).name if p.customer_id else "N/A",
                ServiceProfessional.query.get(p.professional_id).name if p.professional_id else "N/A",
                p.amount,
                p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
                p.payment_status
            ]
            for p in payments
        ]
        add_csv_to_zip("payments.csv", ['Payment ID', 'Service ID', 'Customer Name', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)

        # Wallets
        wallets = Wallet.query.all()
        wallet_data = [[w.customer_id, Customer.query.get(w.customer_id).name if w.customer_id else "N/A", w.balance] for w in wallets]
        add_csv_to_zip("wallets.csv", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)

        # Professional Wallets
        professional_wallets = ProfessionalWallet.query.all()
        prof_wallet_data = [
            [pw.professional_id, ServiceProfessional.query.get(pw.professional_id).name if pw.professional_id else "N/A", pw.balance]
            for pw in professional_wallets
        ]
        add_csv_to_zip("professional_wallets.csv", ['Professional ID', 'Professional Name', 'Balance'], prof_wallet_data)

    output.seek(0)
    return output.getvalue()

@shared_task(ignore_result=False)
def create_excel():
    """
    Task to create an Excel (.xlsx) file with multiple sheets dynamically.
    """
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:

        def add_sheet(sheet_name, headers, rows):
            df = pd.DataFrame(rows, columns=headers)
            df.to_excel(writer, sheet_name=sheet_name, index=False)

        # Service Requests
        service_requests = ServiceRequest.query.all()
        service_data = [
            [
                sr.id,
                Customer.query.get(sr.customer_id).name if sr.customer_id else "N/A",
                ServiceProfessional.query.get(sr.professional_id).name if sr.professional_id else "N/A",
                Service.query.get(sr.service_id).name if sr.service_id else "N/A",
                sr.service_status,
                sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
                sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
                sr.customer_rating or 'N/A',
                sr.rating or 'N/A',
                sr.remarks or ''
            ]
            for sr in service_requests
        ]
        add_sheet("Service Requests", ['Service ID', 'Customer Name', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Professional Rating', 'Remarks'], service_data)

        # Customers
        customers = Customer.query.all()
        customer_data = [[c.id, c.name, c.email, c.phone_no, c.address, c.average_rating or 'N/A'] for c in customers]
        add_sheet("Customers", ['Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Average Rating'], customer_data)

        # Service Professionals
        professionals = ServiceProfessional.query.all()
        professional_data = [[p.id, p.name, p.service_type, p.experience, p.verified_status, p.average_rating or 'N/A'] for p in professionals]
        add_sheet("Service Professionals", ['Professional ID', 'Name', 'Service Type', 'Experience (Years)', 'Verified Status', 'Average Rating'], professional_data)

        # Payments
        payments = Payment.query.all()
        payment_data = [
            [
                p.id,
                p.service_request_id,
                Customer.query.get(p.customer_id).name if p.customer_id else "N/A",
                ServiceProfessional.query.get(p.professional_id).name if p.professional_id else "N/A",
                p.amount,
                p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
                p.payment_status
            ]
            for p in payments
        ]
        add_sheet("Payments", ['Payment ID', 'Service ID', 'Customer Name', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)
        
        # Wallets
        wallets = Wallet.query.all()
        wallet_data = [[w.customer_id, Customer.query.get(w.customer_id).name if w.customer_id else "N/A", w.balance] for w in wallets]
        add_sheet("Wallets", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)
        # Professional Wallets
        professional_wallets = ProfessionalWallet.query.all()
        prof_wallet_data = [
            [pw.professional_id, ServiceProfessional.query.get(pw.professional_id).name if pw.professional_id else "N/A", pw.balance]
            for pw in professional_wallets
        ]
        add_sheet("Professional Wallets", ['Professional ID', 'Professional Name', 'Balance'], prof_wallet_data)


    output.seek(0)
    return output.getvalue()


from flask import jsonify
from celery import shared_task
import io
import zipfile
import csv
import pandas as pd
from backend.models import ServiceRequest, Payment, Wallet, Customer, ServiceProfessional, Service
import io
import zipfile
import csv
from celery import shared_task

@shared_task(ignore_result=False)
def create_customer_csv_zip(customer_id):
    """
    Task to create CSV files for a specific customer and return them as a ZIP archive.
    """
    output = io.BytesIO()

    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zip_file:

        def add_csv_to_zip(filename, headers, rows):
            if not rows:
                print(f"[DEBUG] No data for {filename}, skipping...")
                return
            
            file_output = io.StringIO()
            writer = csv.writer(file_output)
            writer.writerow(headers)
            writer.writerows(rows)
            
            # Debug: Check if data is written
            file_output.seek(0)
            print(f"[DEBUG] Writing {filename} with {len(rows)} rows")

            zip_file.writestr(filename, file_output.getvalue())

        # Fetch customer details
        customer = Customer.query.get(customer_id)
        if not customer:
            print("[ERROR] Customer not found")
            return None

        # Service Requests for the Customer
        service_requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
        service_data = [
            [
                sr.id,
                sr.professional.name if sr.professional else "N/A",
                sr.service.name if sr.service else "N/A",
                sr.service_status,
                sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
                sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
                sr.customer_rating or 'N/A',
                sr.remarks or ''
            ]
            for sr in service_requests
        ]
        add_csv_to_zip("customer_service_requests.csv", ['Service ID', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Remarks'], service_data)

        # Payments for the Customer
        payments = Payment.query.filter_by(customer_id=customer_id).all()
        payment_data = [
            [
                p.id,
                p.service_request_id,
                p.professional.name if p.professional else "N/A",
                p.amount,
                p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
                p.payment_status
            ]
            for p in payments
        ]
        add_csv_to_zip("customer_payments.csv", ['Payment ID', 'Service ID', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)

        # Wallet details for the Customer
        wallet = Wallet.query.filter_by(customer_id=customer_id).first()
        wallet_data = [[wallet.customer_id, customer.name, wallet.balance]] if wallet else []
        add_csv_to_zip("customer_wallet.csv", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)

    output.seek(0)
    return output.getvalue()

import io
import pandas as pd
from celery import shared_task

@shared_task(ignore_result=False)
def create_customer_excel(customer_id):
    """
    Task to create an Excel file with multiple sheets for a specific customer.
    """
    output = io.BytesIO()

    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:

        def add_sheet(sheet_name, headers, rows):
            if not rows:
                print(f"[DEBUG] No data for {sheet_name}, skipping...")
                return

            df = pd.DataFrame(rows, columns=headers)
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            print(f"[DEBUG] Writing {sheet_name} with {len(rows)} rows")

        # Fetch customer details
        customer = Customer.query.get(customer_id)
        if not customer:
            print("[ERROR] Customer not found")
            return None

        # Service Requests for the Customer
        service_requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
        service_data = [
            [
                sr.id,
                sr.professional.name if sr.professional else "N/A",
                sr.service.name if sr.service else "N/A",
                sr.service_status,
                sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
                sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
                sr.customer_rating or 'N/A',
                sr.remarks or ''
            ]
            for sr in service_requests
        ]
        add_sheet("Service Requests", ['Service ID', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Remarks'], service_data)

        # Payments for the Customer
        payments = Payment.query.filter_by(customer_id=customer_id).all()
        payment_data = [
            [
                p.id,
                p.service_request_id,
                p.professional.name if p.professional else "N/A",
                p.amount,
                p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
                p.payment_status
            ]
            for p in payments
        ]
        add_sheet("Payments", ['Payment ID', 'Service ID', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)

        # Wallet details for the Customer
        wallet = Wallet.query.filter_by(customer_id=customer_id).first()
        wallet_data = [[wallet.customer_id, customer.name, wallet.balance]] if wallet else []
        add_sheet("Wallet", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)

    writer.close()  # Ensure file is written
    output.seek(0)
    return output.getvalue()

@shared_task(ignore_result=False)
def create_professional_excel(professional_id):
    """
    Task to create an Excel file with multiple sheets for a specific professional.
    """
    output = io.BytesIO()

    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:

        def add_sheet(sheet_name, headers, rows):
            if not rows:
                print(f"[DEBUG] No data for {sheet_name}, skipping...")
                return

            df = pd.DataFrame(rows, columns=headers)
            df.to_excel(writer, sheet_name=sheet_name, index=False)
            print(f"[DEBUG] Writing {sheet_name} with {len(rows)} rows")

        # Fetch professional details
        professional = ServiceProfessional.query.get(professional_id)
        if not professional:
            print("[ERROR] Professional not found")
            return None

        # Service Requests handled by the Professional
        service_requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()
        service_data = [
            [
                sr.id,
                sr.customer.name if sr.customer else "N/A",
                sr.service.name if sr.service else "N/A",
                sr.service_status,
                sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
                sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
                sr.rating or 'N/A',
                sr.remarks or ''
            ]
            for sr in service_requests
        ]
        add_sheet("Service Requests", ['Service ID', 'Customer Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Rating', 'Remarks'], service_data)

        # Payments received by the Professional
        payments = Payment.query.filter_by(professional_id=professional_id).all()
        payment_data = [
            [
                p.id,
                p.service_request_id,
                p.customer.name if p.customer else "N/A",
                p.amount,
                p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
                p.payment_status
            ]
            for p in payments
        ]
        add_sheet("Payments", ['Payment ID', 'Service ID', 'Customer Name', 'Amount', 'Payment Date', 'Status'], payment_data)

        # Wallet details for the Professional
        wallet = ProfessionalWallet.query.filter_by(professional_id=professional_id).first()
        wallet_data = [[wallet.professional_id, professional.name, wallet.balance]] if wallet else []
        add_sheet("Wallet", ['Professional ID', 'Professional Name', 'Balance'], wallet_data)

    writer.close()  # Ensure file is written
    output.seek(0)
    return output.getvalue()

import io
import csv
import zipfile
from celery import shared_task
from backend.models import ServiceProfessional, ServiceRequest, Payment, ProfessionalWallet

@shared_task(ignore_result=False)
def create_professional_csv_zip(professional_id):
    """
    Task to create CSV files for a specific professional and return them as a ZIP archive.
    """
    output = io.BytesIO()

    with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zip_file:

        def add_csv_to_zip(filename, headers, rows):
            if not rows:
                print(f"[DEBUG] No data for {filename}, skipping...")
                return
            
            file_output = io.StringIO()
            writer = csv.writer(file_output)
            writer.writerow(headers)
            writer.writerows(rows)
            
            file_output.seek(0)
            print(f"[DEBUG] Writing {filename} with {len(rows)} rows")

            zip_file.writestr(filename, file_output.getvalue())

        # Fetch professional details
        professional = ServiceProfessional.query.get(professional_id)
        if not professional:
            print("[ERROR] Professional not found")
            return None

        # Service Requests handled by the Professional
        service_requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()
        service_data = [
            [
                sr.id,
                sr.customer.name if sr.customer else "N/A",
                sr.service.name if sr.service else "N/A",
                sr.service_status,
                sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
                sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
                sr.rating or 'N/A',
                sr.remarks or ''
            ]
            for sr in service_requests
        ]
        add_csv_to_zip("professional_service_requests.csv", ['Service ID', 'Customer Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Rating', 'Remarks'], service_data)

        # Payments for the Professional
        payments = Payment.query.filter_by(professional_id=professional_id).all()
        payment_data = [
            [
                p.id,
                p.service_request_id,
                p.customer.name if p.customer else "N/A",
                p.amount,
                p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
                p.payment_status
            ]
            for p in payments
        ]
        add_csv_to_zip("professional_payments.csv", ['Payment ID', 'Service ID', 'Customer Name', 'Amount', 'Payment Date', 'Status'], payment_data)

        # Wallet details for the Professional
        wallet = ProfessionalWallet.query.filter_by(professional_id=professional_id).first()
        wallet_data = [[wallet.professional_id, professional.name, wallet.balance]] if wallet else []
        add_csv_to_zip("professional_wallet.csv", ['Professional ID', 'Professional Name', 'Balance'], wallet_data)

    output.seek(0)
    return output.getvalue()