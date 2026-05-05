from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
from app.auth.jwt import require_role

router = APIRouter(prefix="/audit", tags=["Audit Log"])

@router.get("/")
def get_audit_logs(db: Session = Depends(get_db), user = Depends(require_role(["Admin"]))):
    # DBMS Concept: Selecting from audit table with JSONB columns
    query = text("SELECT * FROM audit_log ORDER BY changed_at DESC")
    return db.execute(query).mappings().all()
