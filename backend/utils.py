from sqlalchemy import func

def calculate_average_rating_for_customer(customer_id):
    from backend.models import ServiceRequest,db # Move import inside function

    ratings_count = db.session.query(func.count(ServiceRequest.id))\
        .filter(ServiceRequest.customer_id == customer_id, ServiceRequest.customer_rating.isnot(None))\
        .scalar()

    if ratings_count is None or ratings_count < 7:
        return None

    avg_rating = db.session.query(func.avg(ServiceRequest.customer_rating))\
        .filter(ServiceRequest.customer_id == customer_id, ServiceRequest.customer_rating.isnot(None))\
        .scalar()

    return round(avg_rating, 2) if avg_rating is not None else None

def calculate_average_rating_for_professional(professional_id):
    from backend.models import ServiceRequest,db  # Move import inside function

    ratings_count = db.session.query(func.count(ServiceRequest.id))\
        .filter(ServiceRequest.professional_id == professional_id, ServiceRequest.rating.isnot(None))\
        .scalar()
    
    if ratings_count >= 7:
        avg_rating = db.session.query(func.avg(ServiceRequest.rating))\
            .filter(ServiceRequest.professional_id == professional_id)\
            .scalar()
        return round(avg_rating, 2) if avg_rating else None
    
    return None

def get_professional_count(service_id):
    from backend.models import ProfessionalService,db  # Move import inside function
    return ProfessionalService.query.filter_by(service_id=service_id).count()
