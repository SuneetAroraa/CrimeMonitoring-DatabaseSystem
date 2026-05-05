from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import Optional

from app.database import get_db
from app.auth.jwt import get_current_user, require_role, UserResponse
from app.models.schemas import EvidenceUpdate

router = APIRouter(prefix="/evidence", tags=["Evidence"])

@router.put("/{evidence_id}")
def update_evidence(evidence_id: int, update_data: EvidenceUpdate, db: Session = Depends(get_db), user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))):
    # Dynamic update query
    fields = []
    params = {"id": evidence_id}
    
    if update_data.evidence_type is not None:
        fields.append("evidence_type = :type")
        params["type"] = update_data.evidence_type
    if update_data.description is not None:
        fields.append("description = :desc")
        params["desc"] = update_data.description
    if update_data.date_collected is not None:
        fields.append("date_collected = :date")
        params["date"] = update_data.date_collected
    if update_data.collected_by is not None:
        fields.append("collected_by = :by")
        params["by"] = update_data.collected_by
    if update_data.linked_suspect_id is not None:
        fields.append("linked_suspect_id = :suspect_id")
        params["suspect_id"] = update_data.linked_suspect_id
        
    if not fields:
        return {"message": "No fields to update"}
        
    query = text(f"UPDATE evidence SET {', '.join(fields)} WHERE evidence_id = :id")
    
    try:
        result = db.execute(query, params)
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Evidence not found")
        db.commit()
        return {"message": "Evidence updated successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{evidence_id}")
def delete_evidence(evidence_id: int, db: Session = Depends(get_db), user: UserResponse = Depends(require_role(["Admin", "Detective", "Officer"]))):
    query = text("DELETE FROM evidence WHERE evidence_id = :id")
    try:
        result = db.execute(query, {"id": evidence_id})
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Evidence not found")
        db.commit()
        return {"message": "Evidence deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{evidence_id}/suspect/{suspect_id}")
def link_evidence_to_suspect(evidence_id: int, suspect_id: int, db: Session = Depends(get_db), user: UserResponse = Depends(require_role(["Officer", "Detective", "Admin"]))):
    query = text("UPDATE evidence SET linked_suspect_id = :suspect_id WHERE evidence_id = :evidence_id")
    try:
        result = db.execute(query, {"suspect_id": suspect_id, "evidence_id": evidence_id})
        if result.rowcount == 0:
            raise HTTPException(status_code=404, detail="Evidence not found")
        db.commit()
        return {"message": "Evidence linked to suspect successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
