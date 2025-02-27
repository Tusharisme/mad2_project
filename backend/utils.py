# utils.py
from sqlalchemy import func
from backend.models import ServiceRequest,db

def calculate_average_rating_for_customer(customer_id):
    ratings_count = db.session.query(func.count(ServiceRequest.id))\
        .filter(ServiceRequest.customer_id == customer_id, ServiceRequest.customer_rating.isnot(None))\
        .scalar()

    print(f"Customer ID: {customer_id}, Ratings Count: {ratings_count}")  # Debugging output

    if ratings_count is None or ratings_count < 7:
        print(f"Returning None for Customer ID: {customer_id} because rating count < 7")  # Extra debug
        return None

    avg_rating = db.session.query(func.avg(ServiceRequest.customer_rating))\
        .filter(ServiceRequest.customer_id == customer_id, ServiceRequest.customer_rating.isnot(None))\
        .scalar()

    return round(avg_rating, 2) if avg_rating is not None else None



def calculate_average_rating_for_professional(professional_id):
    # Ensure the professional has at least 7 ratings
    ratings_count = db.session.query(func.count(ServiceRequest.id)).filter(ServiceRequest.professional_id == professional_id, ServiceRequest.rating.isnot(None)).scalar()
    
    if ratings_count >= 7:
        # Calculate the average rating for the professional
        avg_rating = db.session.query(func.avg(ServiceRequest.rating)).filter(ServiceRequest.professional_id == professional_id).scalar()
        return round(avg_rating, 2) if avg_rating else None
    
    return None
