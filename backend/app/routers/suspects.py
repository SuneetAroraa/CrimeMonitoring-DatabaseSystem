from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.database import get_db
from app.auth.jwt import get_current_user, require_role, UserResponse
from app.models.schemas import SuspectCreate, SuspectUpdate, FIRSuspectLink

router = APIRouter(prefix="/suspects", tags=["Suspects"])

@router.get("/")
def get_all_suspects(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    query = text("""
        SELECT s.*, 
               (SELECT COUNT(*) FROM fir_suspects fs WHERE fs.suspect_id = s.suspect_id) AS linked_firs_count
        FROM suspects s
        WHERE (:status IS NULL OR s.status = :status)
        ORDER BY s.created_at DESC
        LIMIT :limit OFFSET :skip
    """)
    results = db.execute(query, {"status": status, "limit": limit, "skip": skip}).mappings().all()
    
    count_query = text("""
        SELECT COUNT(*) FROM suspects s
        WHERE (:status IS NULL OR s.status = :status)
    """)
    total = db.execute(count_query, {"status": status}).scalar()

    return {"data": results, "total": total, "message": "Success"}

@router.get("/{suspect_id}")
def get_suspect(suspect_id: int, db: Session = Depends(get_db)):
    suspect_query = text("SELECT * FROM suspects WHERE suspect_id = :id")
    suspect_record = db.execute(suspect_query, {"id": suspect_id}).mappings().first()
    
    if not suspect_record:
        raise HTTPException(status_code=404, detail="Suspect not found")
        
    linked_firs_query = text("""
        SELECT fs.fir_suspects_id, fs.reason_for_suspicion, fs.date_linked,
               f.fir_id, f.fir_date, ct.crime_name,
               o.name AS officer_name, cs.status AS case_status
        FROM fir_suspects fs
        JOIN fir f ON fs.fir_id = f.fir_id
        JOIN crime_type ct ON f.crime_id = ct.crime_id
        LEFT JOIN officer o ON f.officer_id = o.officer_id
        JOIN case_status cs ON f.fir_id = cs.fir_id
        WHERE fs.suspect_id = :suspect_id
    """)
    linked_firs = db.execute(linked_firs_query, {"suspect_id": suspect_id}).mappings().all()
    
    data = dict(suspect_record)
    data["linked_firs"] = linked_firs
    
    return {"data": data, "message": "Success"}

@router.post("/")
def create_suspect(
    suspect: SuspectCreate, 
    db: Session = Depends(get_db), 
    user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))
):
    if suspect.age < 1 or suspect.age > 119:
        raise HTTPException(status_code=400, detail="Age must be between 1 and 119")
        
    query = text("""
        CALL add_suspect(
            :name, :gender, :age, :address, :contact, :nationality, :status, @p_suspect_id
        )
    """)
    try:
        db.execute(query, {
            "name": suspect.suspect_name,
            "gender": suspect.gender,
            "age": suspect.age,
            "address": suspect.address,
            "contact": suspect.contact_no,
            "nationality": suspect.nationality,
            "status": suspect.status
        })
        new_id = db.execute(text("SELECT @p_suspect_id")).scalar()
        db.commit()
        return {"data": {"suspect_id": new_id}, "message": "Success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{suspect_id}")
def update_suspect(
    suspect_id: int, 
    suspect: SuspectUpdate, 
    db: Session = Depends(get_db),
    user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))
):
    update_data = suspect.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
        
    if "age" in update_data and (update_data["age"] < 1 or update_data["age"] > 119):
        raise HTTPException(status_code=400, detail="Age must be between 1 and 119")

    set_clauses = []
    params = {"id": suspect_id}
    for key, value in update_data.items():
        set_clauses.append(f"{key} = :{key}")
        params[key] = value
        
    set_clause_str = ", ".join(set_clauses)
    
    query = text(f"""
        UPDATE suspects 
        SET {set_clause_str}
        WHERE suspect_id = :id
    """)
    
    try:
        result = db.execute(query, params)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Suspect not found")
        db.commit()
        return {"data": {"suspect_id": suspect_id}, "message": "Success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{suspect_id}")
def delete_suspect(
    suspect_id: int, 
    db: Session = Depends(get_db),
    user: UserResponse = Depends(require_role(["Admin"]))
):
    check_query = text("SELECT COUNT(*) FROM fir_suspects WHERE suspect_id = :id")
    linked_count = db.execute(check_query, {"id": suspect_id}).scalar()
    
    if linked_count > 0:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete: This suspect is linked to one or more active FIRs. Remove all FIR links before deleting."
        )
        
    delete_query = text("DELETE FROM suspects WHERE suspect_id = :id")
    try:
        result = db.execute(delete_query, {"id": suspect_id})
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Suspect not found")
        db.commit()
        return {"message": "Success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/link-fir")
def link_suspect_to_fir(
    link: FIRSuspectLink, 
    db: Session = Depends(get_db),
    user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))
):
    fir_check = db.execute(text("SELECT fir_id FROM fir WHERE fir_id = :id"), {"id": link.fir_id}).scalar()
    if not fir_check:
        raise HTTPException(status_code=404, detail="FIR not found")
        
    suspect_check = db.execute(text("SELECT suspect_id FROM suspects WHERE suspect_id = :id"), {"id": link.suspect_id}).scalar()
    if not suspect_check:
        raise HTTPException(status_code=404, detail="Suspect not found")
        
    query = text("""
        INSERT INTO fir_suspects (fir_id, suspect_id, reason_for_suspicion)
        VALUES (:fir_id, :suspect_id, :reason_for_suspicion)
    """)
    try:
        result = db.execute(query, {
            "fir_id": link.fir_id,
            "suspect_id": link.suspect_id,
            "reason_for_suspicion": link.reason_for_suspicion
        })
        new_id = result.lastrowid
        db.commit()
        return {"data": {"fir_suspects_id": new_id}, "message": "Success"}
    except Exception as e:
        db.rollback()
        if "unique_fir_suspects" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(status_code=409, detail="This suspect is already linked to this FIR.")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/unlink-fir/{fir_suspects_id}")
def unlink_suspect_from_fir(
    fir_suspects_id: int, 
    db: Session = Depends(get_db),
    user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))
):
    query = text("DELETE FROM fir_suspects WHERE fir_suspects_id = :id")
    try:
        result = db.execute(query, {"id": fir_suspects_id})
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Link not found")
        db.commit()
        return {"message": "Success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
