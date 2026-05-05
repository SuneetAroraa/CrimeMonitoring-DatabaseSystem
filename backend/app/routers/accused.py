from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional
from app.database import get_db
from app.auth.jwt import get_current_user, require_role, UserResponse
from app.models.schemas import AccusedCreate, AccusedUpdate, FIRAccusedLink

router = APIRouter(prefix="/accused", tags=["Accused"])

@router.get("/")
def get_all_accused(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    # Returns all accused records with pagination and optional status filter.
    # Subquery counts linked FIRs for each accused.
    query = text("""
        SELECT a.*, 
               (SELECT COUNT(*) FROM fir_accused fa WHERE fa.accused_id = a.accused_id) AS linked_firs_count
        FROM accused a
        WHERE (:status IS NULL OR a.status = :status)
        ORDER BY a.created_at DESC
        LIMIT :limit OFFSET :skip
    """)
    results = db.execute(query, {"status": status, "limit": limit, "skip": skip}).mappings().all()
    
    count_query = text("""
        SELECT COUNT(*) FROM accused a
        WHERE (:status IS NULL OR a.status = :status)
    """)
    total = db.execute(count_query, {"status": status}).scalar()

    return {"data": results, "total": total, "message": "Success"}

@router.get("/{accused_id}")
def get_accused(accused_id: int, db: Session = Depends(get_db)):
    # Returns the full accused record
    accused_query = text("SELECT * FROM accused WHERE accused_id = :id")
    accused_record = db.execute(accused_query, {"id": accused_id}).mappings().first()
    
    if not accused_record:
        raise HTTPException(status_code=404, detail="Accused not found")
        
    # Second query: all FIRs linked to this accused
    linked_firs_query = text("""
        SELECT fa.fir_accused_id, fa.role_in_crime, fa.date_linked,
               f.fir_id, f.fir_date, ct.crime_name,
               o.name AS officer_name, cs.status AS case_status
        FROM fir_accused fa
        JOIN fir f ON fa.fir_id = f.fir_id
        JOIN crime_type ct ON f.crime_id = ct.crime_id
        LEFT JOIN officer o ON f.officer_id = o.officer_id
        JOIN case_status cs ON f.fir_id = cs.fir_id
        WHERE fa.accused_id = :accused_id
    """)
    linked_firs = db.execute(linked_firs_query, {"accused_id": accused_id}).mappings().all()
    
    data = dict(accused_record)
    data["linked_firs"] = linked_firs
    
    return {"data": data, "message": "Success"}

@router.post("/")
def create_accused(
    accused: AccusedCreate, 
    db: Session = Depends(get_db), 
    user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))
):
    if accused.age < 1 or accused.age > 119:
        raise HTTPException(status_code=400, detail="Age must be between 1 and 119")
        
    query = text("""
        CALL add_accused(
            :name, :gender, :age, :address, :contact, :nationality, :status, @p_accused_id
        )
    """)
    try:
        db.execute(query, {
            "name": accused.accused_name,
            "gender": accused.gender,
            "age": accused.age,
            "address": accused.address,
            "contact": accused.contact_no,
            "nationality": accused.nationality,
            "status": accused.status
        })
        new_id = db.execute(text("SELECT @p_accused_id")).scalar()
        db.commit()
        return {"data": {"accused_id": new_id}, "message": "Success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.patch("/{accused_id}")
def update_accused(
    accused_id: int, 
    accused: AccusedUpdate, 
    db: Session = Depends(get_db),
    user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))
):
    update_data = accused.model_dump(exclude_unset=True)
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")
        
    if "age" in update_data and (update_data["age"] < 1 or update_data["age"] > 119):
        raise HTTPException(status_code=400, detail="Age must be between 1 and 119")

    # Build SET clause dynamically
    set_clauses = []
    params = {"id": accused_id}
    for key, value in update_data.items():
        set_clauses.append(f"{key} = :{key}")
        params[key] = value
        
    set_clause_str = ", ".join(set_clauses)
    
    query = text(f"""
        UPDATE accused 
        SET {set_clause_str}
        WHERE accused_id = :id
    """)
    
    try:
        result = db.execute(query, params)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Accused not found")
        db.commit()
        return {"data": {"accused_id": accused_id}, "message": "Success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{accused_id}")
def delete_accused(
    accused_id: int, 
    db: Session = Depends(get_db),
    user: UserResponse = Depends(require_role(["Admin"]))
):
    # Check if linked to any FIR
    check_query = text("SELECT COUNT(*) FROM fir_accused WHERE accused_id = :id")
    linked_count = db.execute(check_query, {"id": accused_id}).scalar()
    
    if linked_count > 0:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete: This accused is linked to one or more active FIRs. Remove all FIR links before deleting."
        )
        
    delete_query = text("DELETE FROM accused WHERE accused_id = :id")
    try:
        result = db.execute(delete_query, {"id": accused_id})
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Accused not found")
        db.commit()
        return {"message": "Success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/link-fir")
def link_accused_to_fir(
    link: FIRAccusedLink, 
    db: Session = Depends(get_db),
    user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))
):
    # Verify FIR exists
    fir_check = db.execute(text("SELECT fir_id FROM fir WHERE fir_id = :id"), {"id": link.fir_id}).scalar()
    if not fir_check:
        raise HTTPException(status_code=404, detail="FIR not found")
        
    # Verify Accused exists
    accused_check = db.execute(text("SELECT accused_id FROM accused WHERE accused_id = :id"), {"id": link.accused_id}).scalar()
    if not accused_check:
        raise HTTPException(status_code=404, detail="Accused not found")
        
    # Insert link
    query = text("""
        INSERT INTO fir_accused (fir_id, accused_id, role_in_crime)
        VALUES (:fir_id, :accused_id, :role_in_crime)
    """)
    try:
        result = db.execute(query, {
            "fir_id": link.fir_id,
            "accused_id": link.accused_id,
            "role_in_crime": link.role_in_crime
        })
        new_id = result.lastrowid
        db.commit()
        return {"data": {"fir_accused_id": new_id}, "message": "Success"}
    except Exception as e:
        db.rollback()
        # Handle UNIQUE constraint violation
        if "unique_fir_accused" in str(e).lower() or "unique" in str(e).lower():
            raise HTTPException(status_code=409, detail="This accused is already linked to this FIR.")
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/unlink-fir/{fir_accused_id}")
def unlink_accused_from_fir(
    fir_accused_id: int, 
    db: Session = Depends(get_db),
    user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))
):
    query = text("DELETE FROM fir_accused WHERE fir_accused_id = :id")
    try:
        result = db.execute(query, {"id": fir_accused_id})
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Link not found")
        db.commit()
        return {"message": "Success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
