from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional, List

from app.database import get_db
from app.auth.jwt import get_current_user, require_role, UserResponse
from app.models.schemas import FIRCreateDetailed, StatusUpdate, EvidenceCreate

router = APIRouter(prefix="/fir", tags=["FIR"])

@router.get("/")
def get_firs(
    status: Optional[str] = None,
    city: Optional[str] = None,
    crime_type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    # DBMS Concept: Using a VIEW (fir_full_details) and parameterized filtering
    base_query = "SELECT * FROM fir_full_details WHERE is_deleted = FALSE"
    params = {}
    
    if status:
        base_query += " AND case_status = :status"
        params['status'] = status
    if city:
        base_query += " AND city LIKE :city"
        params['city'] = f"%{city}%"
    if crime_type:
        base_query += " AND crime_name LIKE :crime_type"
        params['crime_type'] = f"%{crime_type}%"
        
    base_query += " ORDER BY fir_date DESC"
    
    result = db.execute(text(base_query), params).mappings().all()
    return result

@router.post("/")
def create_fir(fir: FIRCreateDetailed, db: Session = Depends(get_db), user: UserResponse = Depends(require_role(["Officer", "Admin"]))):
    try:
        # 1. location ID
        location_query = text("SELECT location_id FROM location WHERE city LIKE :city AND state LIKE :state AND pincode = :pincode")
        loc_res = db.execute(location_query, {
            "city": fir.location_city, "state": fir.location_state, "pincode": fir.location_pincode
        }).fetchone()
        
        if loc_res:
            loc_id = loc_res.location_id
        else:
            ins_loc = text("INSERT INTO location (state, city, pincode) VALUES (:state, :city, :pincode)")
            result = db.execute(ins_loc, {
                "state": fir.location_state, "city": fir.location_city, "pincode": fir.location_pincode
            })
            loc_id = result.lastrowid

        # 2. victim ID
        ins_vic = text("INSERT INTO victim (name, age, gender, contact, address) VALUES (:name, :age, :gender, :contact, :address)")
        result = db.execute(ins_vic, {
            "name": fir.victim_name, "age": fir.victim_age, "gender": fir.victim_gender, "contact": fir.victim_contact, "address": fir.victim_address
        })
        vic_id = result.lastrowid

        # 3. Auto-assign an officer
        off_query = text("SELECT officer_id FROM officer ORDER BY RAND() LIMIT 1")
        off_res = db.execute(off_query).fetchone()
        if not off_res:
            raise Exception("No active officers available for assignment.")
        off_id = off_res.officer_id

        # 4. Call Stored Procedure
        query = text("""
            CALL register_complaint_and_fir(
                :victim_id, :crime_id, :officer_id, :location_id, :description, :date, @p_fir_id
            )
        """)
        db.execute(query, {
            "victim_id": vic_id,
            "crime_id": fir.crime_id,
            "officer_id": off_id,
            "location_id": loc_id,
            "description": fir.description,
            "date": fir.date
        })
        db.commit()
        return {"message": "FIR and Complaint created successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{fir_id}")
def get_fir(fir_id: int, db: Session = Depends(get_db)):
    # DBMS Concept: Utilizing VIEW for complex join representation
    query = text("SELECT * FROM fir_full_details WHERE fir_id = :fir_id AND is_deleted = FALSE")
    result = db.execute(query, {"fir_id": fir_id}).mappings().first()
    
    if not result:
        raise HTTPException(status_code=404, detail="FIR not found")
        
    # Also fetch evidence, suspects, accused
    evidence_query = text("SELECT * FROM evidence WHERE fir_id = :fir_id")
    evidences = db.execute(evidence_query, {"fir_id": fir_id}).mappings().all()
    
    suspects_query = text("""
        SELECT s.* FROM suspects s 
        JOIN fir_suspects fs ON s.suspect_id = fs.suspect_id 
        WHERE fs.fir_id = :fir_id
    """)
    suspects = db.execute(suspects_query, {"fir_id": fir_id}).mappings().all()
    
    accused_query = text("""
        SELECT a.* FROM accused a 
        JOIN fir_accused fa ON a.accused_id = fa.accused_id 
        WHERE fa.fir_id = :fir_id
    """)
    accused = db.execute(accused_query, {"fir_id": fir_id}).mappings().all()
    
    return {
        "fir_details": result,
        "evidence": evidences,
        "suspects": suspects,
        "accused": accused
    }

@router.patch("/{fir_id}/status")
def update_status(fir_id: int, update: StatusUpdate, db: Session = Depends(get_db), user: UserResponse = Depends(require_role(["Detective", "Admin"]))):
    # DBMS Concept: Trigger 'after_case_status_update' will automatically log this to audit_log
    query = text("""
        UPDATE case_status 
        SET status = :status, updated_on_date = CURRENT_DATE 
        WHERE fir_id = :fir_id
    """)
    result = db.execute(query, {"status": update.status, "fir_id": fir_id})
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Case status or FIR not found")
    
    db.commit()
    return {"message": "Status updated successfully"}

@router.delete("/{fir_id}")
def delete_fir(fir_id: int, db: Session = Depends(get_db), user: UserResponse = Depends(require_role(["Admin"]))):
    # DBMS Concept: Soft Delete logic implementation
    query = text("UPDATE fir SET is_deleted = 1 WHERE fir_id = :fir_id")
    result = db.execute(query, {"fir_id": fir_id})
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="FIR not found")
        
    db.commit()
    return {"message": "FIR deleted successfully"}

@router.post("/{fir_id}/evidence")
def add_evidence(fir_id: int, evidence: EvidenceCreate, db: Session = Depends(get_db), user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))):
    query = text("""
        INSERT INTO evidence (fir_id, evidence_type, description, location, date_collected, collected_by)
        VALUES (:fir_id, :type, :desc, :loc, :date, :by)
    """)
    try:
        result = db.execute(query, {
            "fir_id": fir_id,
            "type": evidence.evidence_type,
            "desc": evidence.description,
            "loc": "Crime Scene",
            "date": evidence.date_collected,
            "by": evidence.collected_by
        })
        new_id = result.lastrowid
        db.commit()
        return {"message": "Evidence added successfully", "evidence_id": new_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{fir_id}/evidence")
def list_evidence(fir_id: int, db: Session = Depends(get_db)):
    query = text("SELECT * FROM evidence WHERE fir_id = :fir_id ORDER BY date_collected DESC")
    result = db.execute(query, {"fir_id": fir_id}).mappings().all()
    return result
