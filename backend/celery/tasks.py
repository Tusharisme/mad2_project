# from celery import shared_task
# from backend.celery.mail_services import send_email
# from backend.models import *
# import os
# import io
# import csv
# import zipfile
# import pandas as pd
# from datetime import datetime
# from flask import jsonify

# @shared_task(ignore_result=True)
# def email_reminder():
#     """
#     Task to send daily reminders to service professionals with Pending service requests.
#     """
#     professionals_with_pending_requests = (
#         ServiceProfessional.query.join(ServiceRequest, ServiceProfessional.id == ServiceRequest.professional_id)
#         .filter(ServiceRequest.service_status == 'requested')
#         .distinct()
#         .all()
#     )

#     for professional in professionals_with_pending_requests:
#         pending_requests = ServiceRequest.query.filter_by(
#             professional_id=professional.id, service_status='requested'
#         ).count()

#         content = f"""
#         Dear {professional.name},
        
#         You have {pending_requests} Pending service requests that need your attention.
#         Please log in to your dashboard to accept or reject these requests.

#         Best regards,
#         Your Service Management Team.
#         """
#         send_email(professional.email, "Daily Reminder: Pending Service Requests", content)

#     return "Daily reminders sent successfully."


# @shared_task(ignore_result=True)
# def send_monthly_report():
#     """
#     Task to generate and send a monthly activity report to all customers.
#     """
#     now = datetime.datetime.now()
#     first_day_of_month = datetime.datetime(now.year, now.month - 1, 1) if now.month > 1 else datetime.datetime(now.year - 1, 12, 1)
#     first_day_of_next_month = datetime.datetime(now.year, now.month, 1)

#     customers = Customer.query.all()

#     for customer in customers:
#         total_requested = ServiceRequest.query.filter(
#             ServiceRequest.customer_id == customer.id,
#             ServiceRequest.requested_date >= first_day_of_month,
#             ServiceRequest.requested_date < first_day_of_next_month,
#         ).count()

#         total_closed = ServiceRequest.query.filter(
#             ServiceRequest.customer_id == customer.id,
#             ServiceRequest.service_status == 'closed',
#             ServiceRequest.requested_date >= first_day_of_month,
#             ServiceRequest.requested_date < first_day_of_next_month,
#         ).count()

#         html_report = f"""
#         <html>
#             <body>
#                 <h1>Monthly Activity Report</h1>
#                 <p>Dear {customer.name},</p>
#                 <p>Your activity summary for {first_day_of_month.strftime('%B %Y')}:</p>
#                 <ul>
#                     <li>Total Services Requested: {total_requested}</li>
#                     <li>Total Services Closed: {total_closed}</li>
#                 </ul>
#                 <p>Thank you!</p>
#             </body>
#         </html>
#         """

#         subject = f"Monthly Activity Report - {first_day_of_month.strftime('%B %Y')}"
#         send_email(customer.email, subject, html_report, content_type='html')

#     return "Monthly reports sent successfully."


# @shared_task(ignore_result=False)
# def create_csv_zip():
#     """
#     Task to create multiple CSV files and return them as a ZIP archive.
#     """
#     output = io.BytesIO()
#     with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zip_file:

#         def add_csv_to_zip(filename, headers, rows):
#             file_output = io.StringIO()
#             writer = csv.writer(file_output)
#             writer.writerow(headers)
#             writer.writerows(rows)
#             zip_file.writestr(filename, file_output.getvalue())

#         # Service Requests
#         service_requests = ServiceRequest.query.all()
#         service_data = [
#             [
#                 sr.id,
#                 Customer.query.get(sr.customer_id).name if sr.customer_id else "N/A",
#                 ServiceProfessional.query.get(sr.professional_id).name if sr.professional_id else "N/A",
#                 Service.query.get(sr.service_id).name if sr.service_id else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.customer_rating or 'N/A',
#                 sr.rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_csv_to_zip("service_requests.csv", ['Service ID', 'Customer Name', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Professional Rating', 'Remarks'], service_data)

#         # Customers
#         customers = Customer.query.all()
#         customer_data = [[c.id, c.name, c.email, c.phone_no, c.address, c.average_rating or 'N/A'] for c in customers]
#         add_csv_to_zip("customers.csv", ['Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Average Rating'], customer_data)

#         # Service Professionals
#         professionals = ServiceProfessional.query.all()
#         professional_data = [[p.id, p.name, p.service_type, p.experience, p.verified_status, p.average_rating or 'N/A'] for p in professionals]
#         add_csv_to_zip("service_professionals.csv", ['Professional ID', 'Name', 'Service Type', 'Experience (Years)', 'Verified Status', 'Average Rating'], professional_data)

#         # Payments
#         payments = Payment.query.all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 Customer.query.get(p.customer_id).name if p.customer_id else "N/A",
#                 ServiceProfessional.query.get(p.professional_id).name if p.professional_id else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_csv_to_zip("payments.csv", ['Payment ID', 'Service ID', 'Customer Name', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallets
#         wallets = Wallet.query.all()
#         wallet_data = [[w.customer_id, Customer.query.get(w.customer_id).name if w.customer_id else "N/A", w.balance] for w in wallets]
#         add_csv_to_zip("wallets.csv", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)

#         # Professional Wallets
#         professional_wallets = ProfessionalWallet.query.all()
#         prof_wallet_data = [
#             [pw.professional_id, ServiceProfessional.query.get(pw.professional_id).name if pw.professional_id else "N/A", pw.balance]
#             for pw in professional_wallets
#         ]
#         add_csv_to_zip("professional_wallets.csv", ['Professional ID', 'Professional Name', 'Balance'], prof_wallet_data)

#     output.seek(0)
#     return output.getvalue()

# @shared_task(ignore_result=False)
# def create_excel():
#     """
#     Task to create an Excel (.xlsx) file with multiple sheets dynamically.
#     """
#     output = io.BytesIO()
#     with pd.ExcelWriter(output, engine='xlsxwriter') as writer:

#         def add_sheet(sheet_name, headers, rows):
#             df = pd.DataFrame(rows, columns=headers)
#             df.to_excel(writer, sheet_name=sheet_name, index=False)

#         # Service Requests
#         service_requests = ServiceRequest.query.all()
#         service_data = [
#             [
#                 sr.id,
#                 Customer.query.get(sr.customer_id).name if sr.customer_id else "N/A",
#                 ServiceProfessional.query.get(sr.professional_id).name if sr.professional_id else "N/A",
#                 Service.query.get(sr.service_id).name if sr.service_id else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.customer_rating or 'N/A',
#                 sr.rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_sheet("Service Requests", ['Service ID', 'Customer Name', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Professional Rating', 'Remarks'], service_data)

#         # Customers
#         customers = Customer.query.all()
#         customer_data = [[c.id, c.name, c.email, c.phone_no, c.address, c.average_rating or 'N/A'] for c in customers]
#         add_sheet("Customers", ['Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Average Rating'], customer_data)

#         # Service Professionals
#         professionals = ServiceProfessional.query.all()
#         professional_data = [[p.id, p.name, p.service_type, p.experience, p.verified_status, p.average_rating or 'N/A'] for p in professionals]
#         add_sheet("Service Professionals", ['Professional ID', 'Name', 'Service Type', 'Experience (Years)', 'Verified Status', 'Average Rating'], professional_data)

#         # Payments
#         payments = Payment.query.all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 Customer.query.get(p.customer_id).name if p.customer_id else "N/A",
#                 ServiceProfessional.query.get(p.professional_id).name if p.professional_id else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_sheet("Payments", ['Payment ID', 'Service ID', 'Customer Name', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)
        
#         # Wallets
#         wallets = Wallet.query.all()
#         wallet_data = [[w.customer_id, Customer.query.get(w.customer_id).name if w.customer_id else "N/A", w.balance] for w in wallets]
#         add_sheet("Wallets", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)
#         # Professional Wallets
#         professional_wallets = ProfessionalWallet.query.all()
#         prof_wallet_data = [
#             [pw.professional_id, ServiceProfessional.query.get(pw.professional_id).name if pw.professional_id else "N/A", pw.balance]
#             for pw in professional_wallets
#         ]
#         add_sheet("Professional Wallets", ['Professional ID', 'Professional Name', 'Balance'], prof_wallet_data)


#     output.seek(0)
#     return output.getvalue()



# @shared_task(ignore_result=False)
# def create_customer_csv_zip(customer_id):
#     """
#     Task to create CSV files for a specific customer and return them as a ZIP archive.
#     """
#     output = io.BytesIO()

#     with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zip_file:

#         def add_csv_to_zip(filename, headers, rows):
#             if not rows:
#                 print(f"[DEBUG] No data for {filename}, skipping...")
#                 return
            
#             file_output = io.StringIO()
#             writer = csv.writer(file_output)
#             writer.writerow(headers)
#             writer.writerows(rows)
            
#             # Debug: Check if data is written
#             file_output.seek(0)
#             print(f"[DEBUG] Writing {filename} with {len(rows)} rows")

#             zip_file.writestr(filename, file_output.getvalue())

#         # Fetch customer details
#         customer = Customer.query.get(customer_id)
#         if not customer:
#             print("[ERROR] Customer not found")
#             return None

#         # Service Requests for the Customer
#         service_requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
#         service_data = [
#             [
#                 sr.id,
#                 sr.professional.name if sr.professional else "N/A",
#                 sr.service.name if sr.service else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.customer_rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_csv_to_zip("customer_service_requests.csv", ['Service ID', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Remarks'], service_data)

#         # Payments for the Customer
#         payments = Payment.query.filter_by(customer_id=customer_id).all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 p.professional.name if p.professional else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_csv_to_zip("customer_payments.csv", ['Payment ID', 'Service ID', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallet details for the Customer
#         wallet = Wallet.query.filter_by(customer_id=customer_id).first()
#         wallet_data = [[wallet.customer_id, customer.name, wallet.balance]] if wallet else []
#         add_csv_to_zip("customer_wallet.csv", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)

#     output.seek(0)
#     return output.getvalue()


# @shared_task(ignore_result=False)
# def create_customer_excel(customer_id):
#     """
#     Task to create an Excel file with multiple sheets for a specific customer.
#     """
#     output = io.BytesIO()

#     with pd.ExcelWriter(output, engine='xlsxwriter') as writer:

#         def add_sheet(sheet_name, headers, rows):
#             if not rows:
#                 print(f"[DEBUG] No data for {sheet_name}, skipping...")
#                 return

#             df = pd.DataFrame(rows, columns=headers)
#             df.to_excel(writer, sheet_name=sheet_name, index=False)
#             print(f"[DEBUG] Writing {sheet_name} with {len(rows)} rows")

#         # Fetch customer details
#         customer = Customer.query.get(customer_id)
#         if not customer:
#             print("[ERROR] Customer not found")
#             return None

#         # Service Requests for the Customer
#         service_requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
#         service_data = [
#             [
#                 sr.id,
#                 sr.professional.name if sr.professional else "N/A",
#                 sr.service.name if sr.service else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.customer_rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_sheet("Service Requests", ['Service ID', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Remarks'], service_data)

#         # Payments for the Customer
#         payments = Payment.query.filter_by(customer_id=customer_id).all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 p.professional.name if p.professional else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_sheet("Payments", ['Payment ID', 'Service ID', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallet details for the Customer
#         wallet = Wallet.query.filter_by(customer_id=customer_id).first()
#         wallet_data = [[wallet.customer_id, customer.name, wallet.balance]] if wallet else []
#         add_sheet("Wallet", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)

#     writer.close()  # Ensure file is written
#     output.seek(0)
#     return output.getvalue()

# @shared_task(ignore_result=False)
# def create_professional_excel(professional_id):
#     """
#     Task to create an Excel file with multiple sheets for a specific professional.
#     """
#     output = io.BytesIO()

#     with pd.ExcelWriter(output, engine='xlsxwriter') as writer:

#         def add_sheet(sheet_name, headers, rows):
#             if not rows:
#                 print(f"[DEBUG] No data for {sheet_name}, skipping...")
#                 return

#             df = pd.DataFrame(rows, columns=headers)
#             df.to_excel(writer, sheet_name=sheet_name, index=False)
#             print(f"[DEBUG] Writing {sheet_name} with {len(rows)} rows")

#         # Fetch professional details
#         professional = ServiceProfessional.query.get(professional_id)
#         if not professional:
#             print("[ERROR] Professional not found")
#             return None

#         # Service Requests handled by the Professional
#         service_requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()
#         service_data = [
#             [
#                 sr.id,
#                 sr.customer.name if sr.customer else "N/A",
#                 sr.service.name if sr.service else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_sheet("Service Requests", ['Service ID', 'Customer Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Rating', 'Remarks'], service_data)

#         # Payments received by the Professional
#         payments = Payment.query.filter_by(professional_id=professional_id).all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 p.customer.name if p.customer else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_sheet("Payments", ['Payment ID', 'Service ID', 'Customer Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallet details for the Professional
#         wallet = ProfessionalWallet.query.filter_by(professional_id=professional_id).first()
#         wallet_data = [[wallet.professional_id, professional.name, wallet.balance]] if wallet else []
#         add_sheet("Wallet", ['Professional ID', 'Professional Name', 'Balance'], wallet_data)

#     writer.close()  # Ensure file is written
#     output.seek(0)
#     return output.getvalue()



# @shared_task(ignore_result=False)
# def create_professional_csv_zip(professional_id):
#     """
#     Task to create CSV files for a specific professional and return them as a ZIP archive.
#     """
#     output = io.BytesIO()

#     with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zip_file:

#         def add_csv_to_zip(filename, headers, rows):
#             if not rows:
#                 print(f"[DEBUG] No data for {filename}, skipping...")
#                 return
            
#             file_output = io.StringIO()
#             writer = csv.writer(file_output)
#             writer.writerow(headers)
#             writer.writerows(rows)
            
#             file_output.seek(0)
#             print(f"[DEBUG] Writing {filename} with {len(rows)} rows")

#             zip_file.writestr(filename, file_output.getvalue())

#         # Fetch professional details
#         professional = ServiceProfessional.query.get(professional_id)
#         if not professional:
#             print("[ERROR] Professional not found")
#             return None

#         # Service Requests handled by the Professional
#         service_requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()
#         service_data = [
#             [
#                 sr.id,
#                 sr.customer.name if sr.customer else "N/A",
#                 sr.service.name if sr.service else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_csv_to_zip("professional_service_requests.csv", ['Service ID', 'Customer Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Rating', 'Remarks'], service_data)

#         # Payments for the Professional
#         payments = Payment.query.filter_by(professional_id=professional_id).all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 p.customer.name if p.customer else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_csv_to_zip("professional_payments.csv", ['Payment ID', 'Service ID', 'Customer Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallet details for the Professional
#         wallet = ProfessionalWallet.query.filter_by(professional_id=professional_id).first()
#         wallet_data = [[wallet.professional_id, professional.name, wallet.balance]] if wallet else []
#         add_csv_to_zip("professional_wallet.csv", ['Professional ID', 'Professional Name', 'Balance'], wallet_data)

#     output.seek(0)
#     return output.getvalue()


# @shared_task(ignore_result=True)
# def send_login_email(user_email, user_name, user_type):
#     subject = "Successful Login Notification - Your Account Activity"

#     content = f"""
#     <html>
#         <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
#             <h2 style="color: #2C3E50;">Hello {user_name},</h2>
#             <p>We noticed a new login to your account as a <b>{user_type.capitalize()}</b>. If this was you, no further action is required.</p>

#             <h3 style="color: #2C3E50;">Login Details:</h3>
#             <ul>
#                 <li><b>Date & Time:</b> {datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')} UTC</li>
#                 <li><b>Account Type:</b> {user_type.capitalize()}</li>
#             </ul>

#             <p>If you did not initiate this login, we strongly recommend taking the following actions immediately:</p>
#             <ul>
#                 <li>Change your account password from the settings page.</li>
#                 <li>Enable two-factor authentication (2FA) for added security.</li>
#                 <li>Contact our support team to report any suspicious activity.</li>
#             </ul>

#             <p>We are committed to keeping your account safe and secure. If you have any concerns, please reach out to our support team.</p>

#             <p>Best Regards,</p>
#             <p><b>Your Platform Team</b></p>
#             <hr>
#             <p style="font-size: 12px; color: #777;">This is an automated email. Please do not reply to this message.</p>
#         </body>
#     </html>
#     """

#     send_email(user_email, subject, content, content_type='html')


# @shared_task
# def send_registration_email(email, name, role):
#     """Send a professional registration confirmation email asynchronously with HTML formatting"""
#     subject = "Welcome to Our Platform – Your Account is Ready!"

#     if role == 'customer':
#         body = f"""
#         <html>
#         <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
#             <h2 style="color: #2C3E50;">Welcome, {name}!</h2>
            
#             <p>We’re thrilled to have you on board as a valued <b>Customer</b>. Your account has been successfully created, and you are now ready to explore a wide range of services from top professionals.</p>

#             <h3 style="color: #2C3E50;">Here’s what you can do next:</h3>
#             <ul>
#                 <li>Browse available services tailored to your needs.</li>
#                 <li>Connect with skilled professionals and request services.</li>
#                 <li>Track your bookings and manage your account effortlessly.</li>
#             </ul>

#             <p>We’re committed to providing you with the best experience possible. If you need any assistance, our support team is just a message away.</p>

#             <p>Enjoy your journey with us!</p>

#             <p>Best Regards,</p>
#             <p><b>Your Platform Team</b></p>
#             <hr>
#             <p style="font-size: 12px; color: #777;">This is an automated email. Please do not reply to this message.</p>
#         </body>
#         </html>
#         """
    
#     elif role == 'professional':
#         body = f"""
#         <html>
#         <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
#             <h2 style="color: #2C3E50;">Welcome, {name}!</h2>
            
#             <p>Congratulations on successfully registering as a <b>Service Professional</b> on our platform! We’re excited to have you join our community of experts.</p>

#             <h3 style="color: #2C3E50;">What happens next?</h3>
#             <ul>
#                 <li>Our team will review your details to ensure a smooth onboarding process.</li>
#                 <li>Once approved, you can start offering your services to customers.</li>
#                 <li>Manage your service requests, update availability, and grow your business.</li>
#             </ul>

#             <p>We’re here to support you every step of the way. If you have any questions, feel free to reach out to our team.</p>

#             <p>We look forward to seeing your success!</p>

#             <p>Best Regards,</p>
#             <p><b>Your Platform Team</b></p>
#             <hr>
#             <p style="font-size: 12px; color: #777;">This is an automated email. Please do not reply to this message.</p>
#         </body>
#         </html>
#         """

#     send_email(email, subject, body, content_type='html')  # ✅ Matches the login email format


# from celery import shared_task
# from backend.celery.mail_services import send_email

# @shared_task
# def send_forgot_password_email(email, username, otp):
#     """Send forgot password OTP email asynchronously"""
#     subject = "Reset Your Password - OTP Verification"

#     body = f"""
#     <html>
#         <body style="font-family: Arial, sans-serif; color: #333;">
#             <h2 style="color: #2C3E50;">Hello {username},</h2>
#             <p>You have requested to reset your password. Please use the OTP below to proceed:</p>
#             <h3 style="color: #E74C3C;">{otp}</h3>
#             <p>This OTP is valid for <b>10 minutes</b>. Do not share it with anyone.</p>
#             <p>If you did not request this, please ignore this email or contact our support.</p>
#             <br>
#             <p>Best Regards,</p>
#             <p><b>Your Platform Team</b></p>
#             <hr>
#             <p style="font-size: 12px; color: #777;">This is an automated email, please do not reply.</p>
#         </body>
#     </html>
#     """

#     send_email(email, subject, body, content_type="html")



from celery import shared_task
from backend.celery.mail_services import send_email
from backend.models import *
import os
import io
import csv
import zipfile
import pandas as pd
from datetime import datetime
from flask import jsonify

@shared_task(ignore_result=True)
def send_booking_confirmation_to_customer(service_request_id):
    """
    Task to send booking confirmation email to the customer.
    """
    try:
        # Fetch the service request with all related details
        service_request = ServiceRequest.query.get(service_request_id)
        
        if not service_request:
            return "Service request not found."
        
        # Properly fetch related objects and handle potential None values
        customer = Customer.query.get(service_request.customer_id)
        if not customer:
            return f"Customer not found for service request {service_request_id}."
        
        professional = ServiceProfessional.query.get(service_request.professional_id)
        if not professional:
            return f"Professional not found for service request {service_request_id}."
        
        service = Service.query.get(service_request.service_id)
        if not service:
            return f"Service not found for service request {service_request_id}."
        
        # Format date and time with error handling
        try:
            requested_date = service_request.requested_date.strftime('%A, %B %d, %Y') if service_request.requested_date else 'Not specified'
            requested_time = service_request.requested_time.strftime('%I:%M %p') if service_request.requested_time else 'Not specified'
        except Exception as e:
            requested_date = 'Not specified'
            requested_time = 'Not specified'
        
        subject = f"Your Service Booking Confirmation - #{service_request_id}"
        
        content = f"""
        <html>
            <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; border-top: 5px solid #4CAF50;">
                    <h2 style="color: #2C3E50; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Booking Confirmation</h2>
                    
                    <p style="font-size: 16px;">Dear <strong>{customer.name}</strong>,</p>
                    
                    <p>Thank you for booking a service with us! Your request has been successfully received and is now pending confirmation from the service professional.</p>
                    
                    <div style="background-color: #f5f5f5; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="color: #2C3E50; margin-top: 0;">Service Details:</h3>
                        <ul style="padding-left: 20px;">
                            <li><strong>Service:</strong> {service.name}</li>
                            <li><strong>Professional:</strong> {professional.name}</li>
                            <li><strong>Date:</strong> {requested_date}</li>
                            <li><strong>Time:</strong> {requested_time}</li>
                            <li><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">Pending Professional Confirmation</span></li>
                        </ul>
                    </div>
                    
                    <p>You will receive another notification once the professional confirms your booking.</p>
                    
                    <p>If you need to make any changes to your booking, please log in to your account or contact our customer support team.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="margin-bottom: 5px;">Thank you for choosing our services!</p>
                        <p style="font-weight: bold; color: #2C3E50;">Your Service Platform Team</p>
                    </div>
                    
                    <div style="margin-top: 30px; font-size: 12px; color: #777; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Send email and catch any exceptions
        try:
            send_email(customer.email, subject, content, content_type='html')
            return f"Booking confirmation email sent to customer {customer.name}"
        except Exception as e:
            return f"Failed to send email to customer: {str(e)}"
            
    except Exception as e:
        return f"Error in send_booking_confirmation_to_customer: {str(e)}"

@shared_task(ignore_result=True)
def send_booking_notification_to_professional(service_request_id):
    """
    Task to send booking notification email to the service professional.
    """
    try:
        # Fetch the service request with all related details
        service_request = ServiceRequest.query.get(service_request_id)
        
        if not service_request:
            return "Service request not found."
        
        # Properly fetch related objects and handle potential None values
        customer = Customer.query.get(service_request.customer_id)
        if not customer:
            return f"Customer not found for service request {service_request_id}."
        
        professional = ServiceProfessional.query.get(service_request.professional_id)
        if not professional:
            return f"Professional not found for service request {service_request_id}."
        
        service = Service.query.get(service_request.service_id)
        if not service:
            return f"Service not found for service request {service_request_id}."
        
        # Format date and time with error handling
        try:
            requested_date = service_request.requested_date.strftime('%A, %B %d, %Y') if service_request.requested_date else 'Not specified'
            requested_time = service_request.requested_time.strftime('%I:%M %p') if service_request.requested_time else 'Not specified'
        except Exception as e:
            requested_date = 'Not specified'
            requested_time = 'Not specified'
        
        subject = f"New Service Request - Action Required (Request #{service_request_id})"
        
        content = f"""
        <html>
            <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; border-top: 5px solid #3498DB;">
                    <h2 style="color: #2C3E50; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">New Service Request</h2>
                    
                    <p style="font-size: 16px;">Dear <strong>{professional.name}</strong>,</p>
                    
                    <p>You have received a new service request! Please review the details below and respond within <strong>24 hours</strong>.</p>
                    
                    <div style="background-color: #f5f5f5; border-left: 4px solid #3498DB; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <h3 style="color: #2C3E50; margin-top: 0;">Request Details:</h3>
                        <ul style="padding-left: 20px;">
                            <li><strong>Customer:</strong> {customer.name}</li>
                            <li><strong>Service:</strong> {service.name}</li>
                            <li><strong>Date:</strong> {requested_date}</li>
                            <li><strong>Time:</strong> {requested_time}</li>
                            <li><strong>Status:</strong> <span style="color: #FF9800; font-weight: bold;">Awaiting Your Confirmation</span></li>
                        </ul>
                    </div>
                    
                    <div style="background-color: #EBF5FB; border-radius: 4px; padding: 15px; margin: 20px 0;">
                        <p style="color: #2471A3; font-weight: bold; margin-top: 0;">Important:</p>
                        <p style="margin-bottom: 0;">Please log in to your account to accept or decline this request. Responding promptly helps maintain high customer satisfaction.</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="margin-bottom: 5px;">Thank you for your continued service excellence!</p>
                        <p style="font-weight: bold; color: #2C3E50;">Your Service Platform Team</p>
                    </div>
                    
                    <div style="margin-top: 30px; font-size: 12px; color: #777; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        # Send email and catch any exceptions
        try:
            send_email(professional.email, subject, content, content_type='html')
            return f"Booking notification email sent to professional {professional.name}"
        except Exception as e:
            return f"Failed to send email to professional: {str(e)}"
            
    except Exception as e:
        return f"Error in send_booking_notification_to_professional: {str(e)}"

# Enhanced version of the existing email_reminder task
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
        ).all()
        
        pending_count = len(pending_requests)
        
        if pending_count == 0:
            continue
            
        subject = f"Action Required: {pending_count} Pending Service Requests"
        
        # Create a formatted list of pending requests
        request_list_html = ""
        for req in pending_requests:
            service_name = Service.query.get(req.service_id).name
            customer_name = Customer.query.get(req.customer_id).name
            requested_date = req.requested_date.strftime('%b %d, %Y') if req.requested_date else 'Not specified'
            
            request_list_html += f"""
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{req.id}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{service_name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{customer_name}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{requested_date}</td>
            </tr>
            """

        content = f"""
        <html>
            <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; border-top: 5px solid #E74C3C;">
                    <h2 style="color: #2C3E50; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Daily Reminder: Pending Requests</h2>
                    
                    <p style="font-size: 16px;">Dear <strong>{professional.name}</strong>,</p>
                    
                    <p>You have <strong style="color: #E74C3C;">{pending_count} pending</strong> service requests that require your attention.</p>
                    
                    <div style="background-color: #FEF9E7; border-left: 4px solid #F39C12; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin-top: 0;"><strong>Reminder:</strong> Please respond to service requests within 24 hours to maintain a high service rating.</p>
                    </div>
                    
                    <h3 style="color: #2C3E50;">Pending Requests Summary:</h3>
                    
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr style="background-color: #f2f2f2;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">ID</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Service</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Customer</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {request_list_html}
                            </tbody>
                        </table>
                    </div>
                    
                    <p>Please log in to your dashboard to accept or reject these requests.</p>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="margin-bottom: 5px;">Thank you for your prompt attention to these requests.</p>
                        <p style="font-weight: bold; color: #2C3E50;">Your Service Management Team</p>
                    </div>
                    
                    <div style="margin-top: 30px; font-size: 12px; color: #777; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
        </html>
        """
        
        send_email(professional.email, subject, content, content_type='html')

    return "Daily reminders sent successfully."

# Enhanced version of the send_monthly_report task
@shared_task(ignore_result=True)
def send_monthly_report():
    """
    Task to generate and send a monthly activity report to all customers.
    """
    now = datetime.now()
    first_day_of_month = datetime(now.year, now.month - 1, 1) if now.month > 1 else datetime(now.year - 1, 12, 1)
    first_day_of_next_month = datetime(now.year, now.month, 1)
    
    month_name = first_day_of_month.strftime('%B %Y')

    customers = Customer.query.all()

    for customer in customers:
        # Get all service requests for the customer in the previous month
        service_requests = ServiceRequest.query.filter(
            ServiceRequest.customer_id == customer.id,
            ServiceRequest.requested_date >= first_day_of_month,
            ServiceRequest.requested_date < first_day_of_next_month,
        ).all()
        
        total_requested = len(service_requests)
        
        total_closed = sum(1 for sr in service_requests if sr.service_status == 'closed')
        total_completed = sum(1 for sr in service_requests if sr.service_status == 'completed')
        total_cancelled = sum(1 for sr in service_requests if sr.service_status == 'cancelled')
        total_pending = sum(1 for sr in service_requests if sr.service_status in ['requested', 'accepted'])
        
        # Calculate total spent
        total_spent = 0
        for sr in service_requests:
            payments = Payment.query.filter_by(service_request_id=sr.id).all()
            for payment in payments:
                if payment.payment_status == 'Completed':
                    total_spent += payment.amount
        
        # Create service list
        service_list_html = ""
        for sr in service_requests:
            service = Service.query.get(sr.service_id)
            professional = ServiceProfessional.query.get(sr.professional_id)
            
            status_color = {
                'requested': '#FF9800',  # Orange
                'accepted': '#2196F3',   # Blue
                'completed': '#4CAF50',  # Green
                'closed': '#4CAF50',     # Green
                'cancelled': '#F44336',  # Red
                'rejected': '#F44336'    # Red
            }.get(sr.service_status, '#757575')  # Default gray
            
            service_list_html += f"""
            <tr>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{service.name if service else 'N/A'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{professional.name if professional else 'N/A'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">{sr.requested_date.strftime('%b %d') if sr.requested_date else 'N/A'}</td>
                <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                    <span style="color: {status_color}; font-weight: bold;">
                        {sr.service_status.title()}
                    </span>
                </td>
            </tr>
            """

        html_report = f"""
        <html>
            <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; border-top: 5px solid #9C27B0;">
                    <h2 style="color: #2C3E50; margin-top: 0; text-align: center;">Monthly Activity Report</h2>
                    <p style="text-align: center; color: #7F8C8D; margin-top: 0;">{month_name}</p>
                    
                    <p style="font-size: 16px;">Dear <strong>{customer.name}</strong>,</p>
                    
                    <p>Here's a summary of your service activity for the past month:</p>
                    
                    <div style="display: flex; justify-content: space-between; margin: 25px 0; text-align: center;">
                        <div style="flex: 1; background-color: #E8F5E9; padding: 15px; border-radius: 8px; margin-right: 5px;">
                            <h3 style="margin-top: 0; color: #4CAF50;">{total_requested}</h3>
                            <p style="margin-bottom: 0;">Total Services</p>
                        </div>
                        <div style="flex: 1; background-color: #E3F2FD; padding: 15px; border-radius: 8px; margin: 0 5px;">
                            <h3 style="margin-top: 0; color: #2196F3;">{total_completed + total_closed}</h3>
                            <p style="margin-bottom: 0;">Completed</p>
                        </div>
                        <div style="flex: 1; background-color: #FFF3E0; padding: 15px; border-radius: 8px; margin-left: 5px;">
                            <h3 style="margin-top: 0; color: #FF9800;">{total_pending}</h3>
                            <p style="margin-bottom: 0;">Pending</p>
                        </div>
                    </div>
                    
                    <div style="background-color: #F3E5F5; border-radius: 8px; padding: 15px; margin: 20px 0; text-align: center;">
                        <h3 style="margin-top: 0; color: #9C27B0;">₹{total_spent:.2f}</h3>
                        <p style="margin-bottom: 0;">Total Amount Spent</p>
                    </div>
                    
                    <h3 style="color: #2C3E50; border-bottom: 1px solid #eee; padding-bottom: 10px;">Your Service History:</h3>
                    
                    {f'''
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                            <thead>
                                <tr style="background-color: #f2f2f2;">
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Service</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Professional</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Date</th>
                                    <th style="padding: 10px; text-align: left; border-bottom: 2px solid #ddd;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {service_list_html}
                            </tbody>
                        </table>
                    </div>
                    ''' if total_requested > 0 else '<p>You have not requested any services this month.</p>'}
                    
                    <div style="background-color: #F9FBE7; border-left: 4px solid #CDDC39; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p style="margin: 0;"><strong>Tip:</strong> Rate your completed services to help other customers find great professionals!</p>
                    </div>
                    
                    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                        <p style="margin-bottom: 5px;">Thank you for choosing our platform!</p>
                        <p style="font-weight: bold; color: #2C3E50;">Your Service Platform Team</p>
                    </div>
                    
                    <div style="margin-top: 30px; font-size: 12px; color: #777; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                        <p>This is an automated email. Please do not reply to this message.</p>
                    </div>
                </div>
            </body>
        </html>
        """

        subject = f"Your Monthly Activity Report - {month_name}"
        send_email(customer.email, subject, html_report, content_type='html')

    return "Monthly reports sent successfully."

# Enhanced version of the send_login_email task
@shared_task(ignore_result=True)
def send_login_email(user_email, user_name, user_type):
    """
    Task to send a login notification email with improved styling.
    """
    current_time = datetime.utcnow().strftime('%Y-%m-%d %H:%M:%S')
    
    subject = "Successful Login Notification - Your Account Activity"

    content = f"""
    <html>
        <body style="font-family: 'Arial', sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 30px; border-top: 5px solid #2196F3;">
                <h2 style="color: #2C3E50; margin-top: 0; border-bottom: 1px solid #eee; padding-bottom: 10px;">Account Login Detected</h2>
                
                <p style="font-size: 16px;">Hello <strong>{user_name}</strong>,</p>
                
                <p>We noticed a new login to your account as a <strong>{user_type.capitalize()}</strong>.</p>
                
                <div style="background-color: #E3F2FD; border-radius: 8px; padding: 20px; margin: 20px 0;">
                    <h3 style="color: #2196F3; margin-top: 0;">Login Details:</h3>
                    <ul style="list-style-type: none; padding-left: 0; margin-bottom: 0;">
                        <li style="padding: 5px 0; border-bottom: 1px solid #BBDEFB;">
                            <strong style="display: inline-block; width: 140px;">Date & Time:</strong> {current_time} UTC
                        </li>
                        <li style="padding: 5px 0;">
                            <strong style="display: inline-block; width: 140px;">Account Type:</strong> {user_type.capitalize()}
                        </li>
                    </ul>
                </div>
                
                <div style="background-color: #FFF8E1; border-left: 4px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin-top: 0;"><strong>Important:</strong> If you did not initiate this login, we strongly recommend taking immediate action to secure your account.</p>
                </div>
                
                <h3 style="color: #2C3E50;">Security Recommendations:</h3>
                <ul style="padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Change your account password from the settings page.</li>
                    <li style="margin-bottom: 8px;">Enable two-factor authentication (2FA) for added security.</li>
                    <li style="margin-bottom: 8px;">Contact our support team to report any suspicious activity.</li>
                </ul>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <p style="margin-bottom: 5px;">We are committed to keeping your account safe and secure.</p>
                    <p style="font-weight: bold; color: #2C3E50;">Your Platform Team</p>
                </div>
                
                <div style="margin-top: 30px; font-size: 12px; color: #777; text-align: center; padding-top: 20px; border-top: 1px solid #eee;">
                    <p>This is an automated email. Please do not reply to this message.</p>
                </div>
            </div>
        </body>
    </html>
    """

    send_email(user_email, subject, content, content_type='html')
    
    return f"Login notification email sent to {user_email}"

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

@shared_task
def send_registration_email(email, name, role):
    """Send a professional registration confirmation email asynchronously with HTML formatting"""
    subject = "Welcome to Our Platform – Your Account is Ready!"

    if role == 'customer':
        body = f"""
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #3498db; margin: 0; font-size: 28px;">Welcome to Our Platform!</h1>
                </div>
                
                <h2 style="color: #2C3E50; font-size: 22px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Hello, {name}!</h2>
                
                <p style="font-size: 16px; margin-top: 20px;">We're thrilled to have you on board as a valued <span style="background-color: #e8f4fc; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #3498db;">Customer</span>. Your account has been successfully created, and you are now ready to explore a wide range of services from top professionals.</p>

                <h3 style="color: #2C3E50; margin-top: 25px; font-size: 18px;">Here's what you can do next:</h3>
                <ul style="background-color: #f5f9fd; padding: 15px 15px 15px 40px; border-radius: 6px; margin: 15px 0;">
                    <li style="margin-bottom: 10px;">Browse available services tailored to your needs.</li>
                    <li style="margin-bottom: 10px;">Connect with skilled professionals and request services.</li>
                    <li style="margin-bottom: 0;">Track your bookings and manage your account effortlessly.</li>
                </ul>

                <p style="font-size: 16px;">We're committed to providing you with the best experience possible. If you need any assistance, our support team is just a message away.</p>

                <p style="margin-top: 25px; font-size: 16px;">Enjoy your journey with us!</p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
                    <p style="margin: 0;">Best Regards,</p>
                    <p style="font-weight: bold; margin: 5px 0 0 0;">Your Platform Team</p>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px 0; color: #777; font-size: 13px;">
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </body>
        </html>
        """
    
    elif role == 'professional':
        body = f"""
        <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #27ae60; margin: 0; font-size: 28px;">Welcome to Our Platform!</h1>
                </div>
                
                <h2 style="color: #2C3E50; font-size: 22px; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">Hello, {name}!</h2>
                
                <p style="font-size: 16px; margin-top: 20px;">Congratulations on successfully registering as a <span style="background-color: #e8f8ef; padding: 2px 6px; border-radius: 4px; font-weight: bold; color: #27ae60;">Service Professional</span> on our platform! We're excited to have you join our community of experts.</p>

                <h3 style="color: #2C3E50; margin-top: 25px; font-size: 18px;">What happens next?</h3>
                <ul style="background-color: #f5fdf9; padding: 15px 15px 15px 40px; border-radius: 6px; margin: 15px 0;">
                    <li style="margin-bottom: 10px;">Our team will review your details to ensure a smooth onboarding process.</li>
                    <li style="margin-bottom: 10px;">Once approved, you can start offering your services to customers.</li>
                    <li style="margin-bottom: 0;">Manage your service requests, update availability, and grow your business.</li>
                </ul>

                <p style="font-size: 16px;">We're here to support you every step of the way. If you have any questions, feel free to reach out to our team.</p>

                <p style="margin-top: 25px; font-size: 16px;">We look forward to seeing your success!</p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
                    <p style="margin: 0;">Best Regards,</p>
                    <p style="font-weight: bold; margin: 5px 0 0 0;">Your Platform Team</p>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px 0; color: #777; font-size: 13px;">
                <p>This is an automated email. Please do not reply to this message.</p>
            </div>
        </body>
        </html>
        """

    send_email(email, subject, body, content_type='html')

from celery import shared_task
from backend.celery.mail_services import send_email

@shared_task
def send_forgot_password_email(email, username, otp):
    """Send forgot password OTP email asynchronously"""
    subject = "Reset Your Password - OTP Verification"

    body = f"""
    <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
            <div style="background-color: #ffffff; border-radius: 8px; padding: 30px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="text-align: center; margin-bottom: 20px;">
                    <h1 style="color: #e74c3c; margin: 0; font-size: 24px;">Password Reset Request</h1>
                </div>
                
                <h2 style="color: #2C3E50; font-size: 20px; margin-top: 20px;">Hello {username},</h2>
                
                <p style="font-size: 16px; margin: 20px 0;">You have requested to reset your password. Please use the OTP below to proceed:</p>
                
                <div style="background-color: #f8f4ff; text-align: center; padding: 15px; border-radius: 6px; margin: 25px 0; border-left: 4px solid #e74c3c;">
                    <h2 style="color: #e74c3c; font-size: 28px; margin: 0; letter-spacing: 3px;">{otp}</h2>
                </div>
                
                <p style="font-size: 15px; background-color: #fff8f8; padding: 10px 15px; border-radius: 4px; border-left: 3px solid #ffcccc;">
                    This OTP is valid for <strong>10 minutes</strong>. Do not share it with anyone.
                </p>
                
                <p style="font-size: 14px; color: #666; margin-top: 25px;">If you did not request this, please ignore this email or contact our support team immediately.</p>

                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea;">
                    <p style="margin: 0;">Best Regards,</p>
                    <p style="font-weight: bold; margin: 5px 0 0 0;">Your Platform Team</p>
                </div>
            </div>
            
            <div style="text-align: center; padding: 20px 0; color: #777; font-size: 13px;">
                <p>This is an automated email, please do not reply.</p>
            </div>
        </body>
    </html>
    """

    send_email(email, subject, body, content_type="html")


# @shared_task(ignore_result=False)
# def create_csv_zip():
#     """
#     Task to create multiple CSV files and return them as a ZIP archive.
#     """
#     output = io.BytesIO()
#     with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zip_file:

#         def add_csv_to_zip(filename, headers, rows):
#             file_output = io.StringIO()
#             writer = csv.writer(file_output)
#             writer.writerow(headers)
#             writer.writerows(rows)
#             zip_file.writestr(filename, file_output.getvalue())

#         # Service Requests
#         service_requests = ServiceRequest.query.all()
#         service_data = [
#             [
#                 sr.id,
#                 Customer.query.get(sr.customer_id).name if sr.customer_id else "N/A",
#                 ServiceProfessional.query.get(sr.professional_id).name if sr.professional_id else "N/A",
#                 Service.query.get(sr.service_id).name if sr.service_id else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.customer_rating or 'N/A',
#                 sr.rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_csv_to_zip("service_requests.csv", ['Service ID', 'Customer Name', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Professional Rating', 'Remarks'], service_data)

#         # Customers
#         customers = Customer.query.all()
#         customer_data = [[c.id, c.name, c.email, c.phone_no, c.address, c.average_rating or 'N/A'] for c in customers]
#         add_csv_to_zip("customers.csv", ['Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Average Rating'], customer_data)

#         # Service Professionals
#         professionals = ServiceProfessional.query.all()
#         professional_data = [[p.id, p.name, p.service_type, p.experience, p.verified_status, p.average_rating or 'N/A'] for p in professionals]
#         add_csv_to_zip("service_professionals.csv", ['Professional ID', 'Name', 'Service Type', 'Experience (Years)', 'Verified Status', 'Average Rating'], professional_data)

#         # Payments
#         payments = Payment.query.all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 Customer.query.get(p.customer_id).name if p.customer_id else "N/A",
#                 ServiceProfessional.query.get(p.professional_id).name if p.professional_id else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_csv_to_zip("payments.csv", ['Payment ID', 'Service ID', 'Customer Name', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallets
#         wallets = Wallet.query.all()
#         wallet_data = [[w.customer_id, Customer.query.get(w.customer_id).name if w.customer_id else "N/A", w.balance] for w in wallets]
#         add_csv_to_zip("wallets.csv", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)

#         # Professional Wallets
#         professional_wallets = ProfessionalWallet.query.all()
#         prof_wallet_data = [
#             [pw.professional_id, ServiceProfessional.query.get(pw.professional_id).name if pw.professional_id else "N/A", pw.balance]
#             for pw in professional_wallets
#         ]
#         add_csv_to_zip("professional_wallets.csv", ['Professional ID', 'Professional Name', 'Balance'], prof_wallet_data)

#     output.seek(0)
#     return output.getvalue()

# @shared_task(ignore_result=False)
# def create_excel():
#     """
#     Task to create an Excel (.xlsx) file with multiple sheets dynamically.
#     """
#     output = io.BytesIO()
#     with pd.ExcelWriter(output, engine='xlsxwriter') as writer:

#         def add_sheet(sheet_name, headers, rows):
#             df = pd.DataFrame(rows, columns=headers)
#             df.to_excel(writer, sheet_name=sheet_name, index=False)

#         # Service Requests
#         service_requests = ServiceRequest.query.all()
#         service_data = [
#             [
#                 sr.id,
#                 Customer.query.get(sr.customer_id).name if sr.customer_id else "N/A",
#                 ServiceProfessional.query.get(sr.professional_id).name if sr.professional_id else "N/A",
#                 Service.query.get(sr.service_id).name if sr.service_id else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.customer_rating or 'N/A',
#                 sr.rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_sheet("Service Requests", ['Service ID', 'Customer Name', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Professional Rating', 'Remarks'], service_data)

#         # Customers
#         customers = Customer.query.all()
#         customer_data = [[c.id, c.name, c.email, c.phone_no, c.address, c.average_rating or 'N/A'] for c in customers]
#         add_sheet("Customers", ['Customer ID', 'Name', 'Email', 'Phone', 'Address', 'Average Rating'], customer_data)

#         # Service Professionals
#         professionals = ServiceProfessional.query.all()
#         professional_data = [[p.id, p.name, p.service_type, p.experience, p.verified_status, p.average_rating or 'N/A'] for p in professionals]
#         add_sheet("Service Professionals", ['Professional ID', 'Name', 'Service Type', 'Experience (Years)', 'Verified Status', 'Average Rating'], professional_data)

#         # Payments
#         payments = Payment.query.all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 Customer.query.get(p.customer_id).name if p.customer_id else "N/A",
#                 ServiceProfessional.query.get(p.professional_id).name if p.professional_id else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_sheet("Payments", ['Payment ID', 'Service ID', 'Customer Name', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)
        
#         # Wallets
#         wallets = Wallet.query.all()
#         wallet_data = [[w.customer_id, Customer.query.get(w.customer_id).name if w.customer_id else "N/A", w.balance] for w in wallets]
#         add_sheet("Wallets", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)
#         # Professional Wallets
#         professional_wallets = ProfessionalWallet.query.all()
#         prof_wallet_data = [
#             [pw.professional_id, ServiceProfessional.query.get(pw.professional_id).name if pw.professional_id else "N/A", pw.balance]
#             for pw in professional_wallets
#         ]
#         add_sheet("Professional Wallets", ['Professional ID', 'Professional Name', 'Balance'], prof_wallet_data)


#     output.seek(0)
#     return output.getvalue()



# @shared_task(ignore_result=False)
# def create_customer_csv_zip(customer_id):
#     """
#     Task to create CSV files for a specific customer and return them as a ZIP archive.
#     """
#     output = io.BytesIO()

#     with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zip_file:

#         def add_csv_to_zip(filename, headers, rows):
#             if not rows:
#                 print(f"[DEBUG] No data for {filename}, skipping...")
#                 return
            
#             file_output = io.StringIO()
#             writer = csv.writer(file_output)
#             writer.writerow(headers)
#             writer.writerows(rows)
            
#             # Debug: Check if data is written
#             file_output.seek(0)
#             print(f"[DEBUG] Writing {filename} with {len(rows)} rows")

#             zip_file.writestr(filename, file_output.getvalue())

#         # Fetch customer details
#         customer = Customer.query.get(customer_id)
#         if not customer:
#             print("[ERROR] Customer not found")
#             return None

#         # Service Requests for the Customer
#         service_requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
#         service_data = [
#             [
#                 sr.id,
#                 sr.professional.name if sr.professional else "N/A",
#                 sr.service.name if sr.service else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.customer_rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_csv_to_zip("customer_service_requests.csv", ['Service ID', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Remarks'], service_data)

#         # Payments for the Customer
#         payments = Payment.query.filter_by(customer_id=customer_id).all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 p.professional.name if p.professional else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_csv_to_zip("customer_payments.csv", ['Payment ID', 'Service ID', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallet details for the Customer
#         wallet = Wallet.query.filter_by(customer_id=customer_id).first()
#         wallet_data = [[wallet.customer_id, customer.name, wallet.balance]] if wallet else []
#         add_csv_to_zip("customer_wallet.csv", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)

#     output.seek(0)
#     return output.getvalue()


# @shared_task(ignore_result=False)
# def create_customer_excel(customer_id):
#     """
#     Task to create an Excel file with multiple sheets for a specific customer.
#     """
#     output = io.BytesIO()

#     with pd.ExcelWriter(output, engine='xlsxwriter') as writer:

#         def add_sheet(sheet_name, headers, rows):
#             if not rows:
#                 print(f"[DEBUG] No data for {sheet_name}, skipping...")
#                 return

#             df = pd.DataFrame(rows, columns=headers)
#             df.to_excel(writer, sheet_name=sheet_name, index=False)
#             print(f"[DEBUG] Writing {sheet_name} with {len(rows)} rows")

#         # Fetch customer details
#         customer = Customer.query.get(customer_id)
#         if not customer:
#             print("[ERROR] Customer not found")
#             return None

#         # Service Requests for the Customer
#         service_requests = ServiceRequest.query.filter_by(customer_id=customer_id).all()
#         service_data = [
#             [
#                 sr.id,
#                 sr.professional.name if sr.professional else "N/A",
#                 sr.service.name if sr.service else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.customer_rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_sheet("Service Requests", ['Service ID', 'Professional Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Customer Rating', 'Remarks'], service_data)

#         # Payments for the Customer
#         payments = Payment.query.filter_by(customer_id=customer_id).all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 p.professional.name if p.professional else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_sheet("Payments", ['Payment ID', 'Service ID', 'Professional Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallet details for the Customer
#         wallet = Wallet.query.filter_by(customer_id=customer_id).first()
#         wallet_data = [[wallet.customer_id, customer.name, wallet.balance]] if wallet else []
#         add_sheet("Wallet", ['Customer ID', 'Customer Name', 'Balance'], wallet_data)

#     writer.close()  # Ensure file is written
#     output.seek(0)
#     return output.getvalue()

# @shared_task(ignore_result=False)
# def create_professional_excel(professional_id):
#     """
#     Task to create an Excel file with multiple sheets for a specific professional.
#     """
#     output = io.BytesIO()

#     with pd.ExcelWriter(output, engine='xlsxwriter') as writer:

#         def add_sheet(sheet_name, headers, rows):
#             if not rows:
#                 print(f"[DEBUG] No data for {sheet_name}, skipping...")
#                 return

#             df = pd.DataFrame(rows, columns=headers)
#             df.to_excel(writer, sheet_name=sheet_name, index=False)
#             print(f"[DEBUG] Writing {sheet_name} with {len(rows)} rows")

#         # Fetch professional details
#         professional = ServiceProfessional.query.get(professional_id)
#         if not professional:
#             print("[ERROR] Professional not found")
#             return None

#         # Service Requests handled by the Professional
#         service_requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()
#         service_data = [
#             [
#                 sr.id,
#                 sr.customer.name if sr.customer else "N/A",
#                 sr.service.name if sr.service else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_sheet("Service Requests", ['Service ID', 'Customer Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Rating', 'Remarks'], service_data)

#         # Payments received by the Professional
#         payments = Payment.query.filter_by(professional_id=professional_id).all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 p.customer.name if p.customer else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_sheet("Payments", ['Payment ID', 'Service ID', 'Customer Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallet details for the Professional
#         wallet = ProfessionalWallet.query.filter_by(professional_id=professional_id).first()
#         wallet_data = [[wallet.professional_id, professional.name, wallet.balance]] if wallet else []
#         add_sheet("Wallet", ['Professional ID', 'Professional Name', 'Balance'], wallet_data)

#     writer.close()  # Ensure file is written
#     output.seek(0)
#     return output.getvalue()



# @shared_task(ignore_result=False)
# def create_professional_csv_zip(professional_id):
#     """
#     Task to create CSV files for a specific professional and return them as a ZIP archive.
#     """
#     output = io.BytesIO()

#     with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as zip_file:

#         def add_csv_to_zip(filename, headers, rows):
#             if not rows:
#                 print(f"[DEBUG] No data for {filename}, skipping...")
#                 return
            
#             file_output = io.StringIO()
#             writer = csv.writer(file_output)
#             writer.writerow(headers)
#             writer.writerows(rows)
            
#             file_output.seek(0)
#             print(f"[DEBUG] Writing {filename} with {len(rows)} rows")

#             zip_file.writestr(filename, file_output.getvalue())

#         # Fetch professional details
#         professional = ServiceProfessional.query.get(professional_id)
#         if not professional:
#             print("[ERROR] Professional not found")
#             return None

#         # Service Requests handled by the Professional
#         service_requests = ServiceRequest.query.filter_by(professional_id=professional_id).all()
#         service_data = [
#             [
#                 sr.id,
#                 sr.customer.name if sr.customer else "N/A",
#                 sr.service.name if sr.service else "N/A",
#                 sr.service_status,
#                 sr.requested_date.strftime('%Y-%m-%d') if sr.requested_date else 'N/A',
#                 sr.date_of_completion.strftime('%Y-%m-%d') if sr.date_of_completion else 'N/A',
#                 sr.rating or 'N/A',
#                 sr.remarks or ''
#             ]
#             for sr in service_requests
#         ]
#         add_csv_to_zip("professional_service_requests.csv", ['Service ID', 'Customer Name', 'Service Name', 'Status', 'Requested Date', 'Completion Date', 'Rating', 'Remarks'], service_data)

#         # Payments for the Professional
#         payments = Payment.query.filter_by(professional_id=professional_id).all()
#         payment_data = [
#             [
#                 p.id,
#                 p.service_request_id,
#                 p.customer.name if p.customer else "N/A",
#                 p.amount,
#                 p.date_of_payment.strftime('%Y-%m-%d') if p.date_of_payment else 'N/A',
#                 p.payment_status
#             ]
#             for p in payments
#         ]
#         add_csv_to_zip("professional_payments.csv", ['Payment ID', 'Service ID', 'Customer Name', 'Amount', 'Payment Date', 'Status'], payment_data)

#         # Wallet details for the Professional
#         wallet = ProfessionalWallet.query.filter_by(professional_id=professional_id).first()
#         wallet_data = [[wallet.professional_id, professional.name, wallet.balance]] if wallet else []
#         add_csv_to_zip("professional_wallet.csv", ['Professional ID', 'Professional Name', 'Balance'], wallet_data)

#     output.seek(0)
#     return output.getvalue()


# @shared_task
# def send_registration_email(email, name, role):
#     """Send a professional registration confirmation email asynchronously with HTML formatting"""
#     subject = "Welcome to Our Platform – Your Account is Ready!"

#     if role == 'customer':
#         body = f"""
#         <html>
#         <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
#             <h2 style="color: #2C3E50;">Welcome, {name}!</h2>
            
#             <p>We’re thrilled to have you on board as a valued <b>Customer</b>. Your account has been successfully created, and you are now ready to explore a wide range of services from top professionals.</p>

#             <h3 style="color: #2C3E50;">Here’s what you can do next:</h3>
#             <ul>
#                 <li>Browse available services tailored to your needs.</li>
#                 <li>Connect with skilled professionals and request services.</li>
#                 <li>Track your bookings and manage your account effortlessly.</li>
#             </ul>

#             <p>We’re committed to providing you with the best experience possible. If you need any assistance, our support team is just a message away.</p>

#             <p>Enjoy your journey with us!</p>

#             <p>Best Regards,</p>
#             <p><b>Your Platform Team</b></p>
#             <hr>
#             <p style="font-size: 12px; color: #777;">This is an automated email. Please do not reply to this message.</p>
#         </body>
#         </html>
#         """
    
#     elif role == 'professional':
#         body = f"""
#         <html>
#         <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
#             <h2 style="color: #2C3E50;">Welcome, {name}!</h2>
            
#             <p>Congratulations on successfully registering as a <b>Service Professional</b> on our platform! We’re excited to have you join our community of experts.</p>

#             <h3 style="color: #2C3E50;">What happens next?</h3>
#             <ul>
#                 <li>Our team will review your details to ensure a smooth onboarding process.</li>
#                 <li>Once approved, you can start offering your services to customers.</li>
#                 <li>Manage your service requests, update availability, and grow your business.</li>
#             </ul>

#             <p>We’re here to support you every step of the way. If you have any questions, feel free to reach out to our team.</p>

#             <p>We look forward to seeing your success!</p>

#             <p>Best Regards,</p>
#             <p><b>Your Platform Team</b></p>
#             <hr>
#             <p style="font-size: 12px; color: #777;">This is an automated email. Please do not reply to this message.</p>
#         </body>
#         </html>
#         """

#     send_email(email, subject, body, content_type='html')  # ✅ Matches the login email format


# from celery import shared_task
# from backend.celery.mail_services import send_email

# @shared_task
# def send_forgot_password_email(email, username, otp):
#     """Send forgot password OTP email asynchronously"""
#     subject = "Reset Your Password - OTP Verification"

#     body = f"""
#     <html>
#         <body style="font-family: Arial, sans-serif; color: #333;">
#             <h2 style="color: #2C3E50;">Hello {username},</h2>
#             <p>You have requested to reset your password. Please use the OTP below to proceed:</p>
#             <h3 style="color: #E74C3C;">{otp}</h3>
#             <p>This OTP is valid for <b>10 minutes</b>. Do not share it with anyone.</p>
#             <p>If you did not request this, please ignore this email or contact our support.</p>
#             <br>
#             <p>Best Regards,</p>
#             <p><b>Your Platform Team</b></p>
#             <hr>
#             <p style="font-size: 12px; color: #777;">This is an automated email, please do not reply.</p>
#         </body>
#     </html>
#     """

#     send_email(email, subject, body, content_type="html")
