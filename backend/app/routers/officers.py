from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/officers", tags=["Officers"])

@router.get("/")
def get_officers(db: Session = Depends(get_db)):
    # DBMS Concept: JOIN to get user details for the officer
    query = text("""
        SELECT o.*, u.username,
        (SELECT COUNT(*) FROM fir f JOIN case_status cs ON f.fir_id = cs.fir_id WHERE f.officer_id = o.officer_id AND cs.status != 'Closed' AND f.is_deleted = FALSE) as active_cases
        FROM officer o
        LEFT JOIN users u ON o.user_id = u.user_id
    """)
    return db.execute(query).mappings().all()
