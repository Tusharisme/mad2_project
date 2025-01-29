import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart


smtp_server = 'localhost'
smtp_port = 1025
sender_email = 'noreply@example.com'
sender_password = ''

def send_email(to, subject, content):
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to
    msg['Subject'] = subject
    msg.attach(MIMEText(content, 'plain'))

    with smtplib.SMTP(host=smtp_server, port=smtp_port) as client:
        client.send_message(msg)
        client.quit()
send_email("tushar@gmail.com","this is a test email","hi welcome to my app have fun!!")