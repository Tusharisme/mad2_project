import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuration for SMTP server
smtp_server = 'localhost'
smtp_port = 1025
sender_email = 'noreply@example.com'
sender_password = ''


def send_email(to, subject, content, content_type='plain'):
    """
    Function to send an email using an SMTP server.
    Supports both plain text and HTML content.
    """
    # Create email message
    msg = MIMEMultipart()
    msg['From'] = sender_email
    msg['To'] = to
    msg['Subject'] = subject
    msg.attach(MIMEText(content, content_type))

    # Send the email
    with smtplib.SMTP(host=smtp_server, port=smtp_port) as client:
        client.send_message(msg)
        client.quit()
