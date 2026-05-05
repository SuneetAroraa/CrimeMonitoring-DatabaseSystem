from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text

from app.database import get_db

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/crimes-by-type")
def get_crimes_by_type(db: Session = Depends(get_db)):
    # DBMS Concept: GROUP BY with COUNT for aggregation
    query = text("""
        SELECT ct.crime_name as crime_name, COUNT(f.fir_id) as count
        FROM crime_type ct
        LEFT JOIN fir f ON ct.crime_id = f.crime_id AND f.is_deleted = FALSE
        GROUP BY ct.crime_name
    """)
    return db.execute(query).mappings().all()

@router.get("/cases-by-status")
def get_cases_by_status(db: Session = Depends(get_db)):
    # DBMS Concept: Aggregation over case statuses
    query = text("""
        SELECT cs.status as status, COUNT(cs.fir_id) as count
        FROM case_status cs
        JOIN fir f ON cs.fir_id = f.fir_id
        WHERE f.is_deleted = FALSE
        GROUP BY cs.status
    """)
    return db.execute(query).mappings().all()

@router.get("/crimes-by-city")
def get_crimes_by_city(db: Session = Depends(get_db)):
    # DBMS Concept: Querying a predefined VIEW (crime_stats_by_city)
    query = text("SELECT city, total_firs as count FROM crime_stats_by_city ORDER BY total_firs DESC LIMIT 5")
    return db.execute(query).mappings().all()

@router.get("/monthly-trend")
def get_monthly_trend(db: Session = Depends(get_db)):
    # DBMS Concept: Advanced date grouping using TO_CHAR
    query = text("""
        SELECT DATE_FORMAT(f.fir_date, '%b') as month, COUNT(f.fir_id) as count
        FROM fir f
        WHERE YEAR(f.fir_date) = YEAR(CURDATE()) AND f.is_deleted = 0
        GROUP BY month, MONTH(f.fir_date)
        ORDER BY MONTH(f.fir_date)
    """)
    return db.execute(query).mappings().all()

@router.get("/officer-caseload")
def get_officer_caseload(db: Session = Depends(get_db)):
    # DBMS Concept: JOINs with aggregations mapping officers to their active cases
    query = text("""
        SELECT o.name, COUNT(f.fir_id) as caseload
        FROM officer o
        LEFT JOIN fir f ON o.officer_id = f.officer_id AND f.is_deleted = FALSE
        LEFT JOIN case_status cs ON f.fir_id = cs.fir_id
        WHERE cs.status = 'Open' OR cs.status = 'Under Investigation' OR cs.status IS NULL
        GROUP BY o.name
        ORDER BY caseload DESC
    """)
    return db.execute(query).mappings().all()

@router.get("/dashboard-stats")
def get_dashboard_stats(db: Session = Depends(get_db)):
    query = text("""
        SELECT 
            (SELECT COUNT(*) FROM fir WHERE is_deleted = FALSE) as total_firs,
            (SELECT COUNT(*) FROM case_status cs JOIN fir f ON cs.fir_id = f.fir_id WHERE cs.status = 'Open' AND f.is_deleted = FALSE) as open_cases,
            (SELECT COUNT(*) FROM case_status cs JOIN fir f ON cs.fir_id = f.fir_id WHERE cs.status = 'Closed' AND f.is_deleted = FALSE) as closed_cases,
            (SELECT COUNT(*) FROM officer) as officers_active
    """)
    return db.execute(query).mappings().first()
