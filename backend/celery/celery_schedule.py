from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder, send_monthly_report

celery_app = app.extensions['celery']


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    """
    Set up periodic tasks using Celery's scheduler.
    """
    # Daily reminder task at 6:00 PM (IST)
    sender.add_periodic_task(
        crontab(hour=14, minute=44),
        email_reminder.s(),
        name="daily_service_request_reminders"
    )

    # Monthly report task on the 1st day of every month at midnight (IST)
    sender.add_periodic_task(
        crontab(hour=0, minute=0, day_of_month=1),
        send_monthly_report.s(),
        name="monthly_activity_report"
    )
