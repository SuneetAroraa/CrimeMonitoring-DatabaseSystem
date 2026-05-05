from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db

router = APIRouter(prefix="/victims", tags=["Victims"])

@router.get("/")
def get_victims(db: Session = Depends(get_db)):
    return db.execute(text("SELECT * FROM victim")).mappings().all()
