from celery.schedules import crontab
from flask import current_app as app
from backend.celery.tasks import email_reminder

celery_app=app.extensions['celery']


@celery_app.on_after_configure.connect
def setup_periodic_tasks(sender, **kwargs):
    # at particular hour of the day 
    sender.add_periodic_task(crontab(hour=18,minute=55),email_reminder.s("student@gmail.com","reminder to login","hello kasie hai aap log"))
    
    # after the second
    # sender.add_periodic_task(10.0,email_reminder.s("student@gmail.com","reminder to login","hello kasie hai aap log"),name="daily_reminder")
    
    # at particular week
    # sender.add_periodic_task(crontab(hour=18,minute=55,day_of_week="monday"),email_reminder.s("student@gmail.com","reminder to login","hello kasie hai aap log"),name="weekly_reminder")

