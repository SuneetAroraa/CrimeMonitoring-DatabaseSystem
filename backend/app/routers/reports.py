from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
import io
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

from app.database import get_db
from app.auth.jwt import require_role

router = APIRouter(prefix="/reports", tags=["Reports"])

@router.get("/fir/{fir_id}/pdf")
def generate_fir_pdf(fir_id: int, db: Session = Depends(get_db)):
    # DBMS Concept: Reusing our comprehensive view
    query = text("SELECT * FROM fir_full_details WHERE fir_id = :fir_id")
    fir = db.execute(query, {"fir_id": fir_id}).mappings().first()
    
    if not fir:
        raise HTTPException(status_code=404, detail="FIR not found")

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    styles = getSampleStyleSheet()
    Story = []

    title_style = styles['Heading1']
    title_style.alignment = 1 # Center
    
    Story.append(Paragraph(f"First Information Report (FIR) - #{fir['fir_id']}", title_style))
    Story.append(Spacer(1, 12))
    
    Story.append(Paragraph(f"<b>Status:</b> {fir['case_status']}", styles['Normal']))
    Story.append(Paragraph(f"<b>Date:</b> {fir['fir_date']}", styles['Normal']))
    Story.append(Paragraph(f"<b>Location:</b> {fir['city']}, {fir['state']} - {fir['pincode']}", styles['Normal']))
    Story.append(Spacer(1, 12))
    
    Story.append(Paragraph("<b>Crime Details</b>", styles['Heading2']))
    Story.append(Paragraph(f"<b>Type:</b> {fir['crime_name']}", styles['Normal']))
    Story.append(Paragraph(f"<b>Description:</b> {fir['complaint_description']}", styles['Normal']))
    Story.append(Spacer(1, 12))
    
    Story.append(Paragraph("<b>Victim Details</b>", styles['Heading2']))
    Story.append(Paragraph(f"<b>Name:</b> {fir['victim_name']} (Age: {fir['victim_age']}, Gender: {fir['victim_gender']})", styles['Normal']))
    Story.append(Paragraph(f"<b>Contact:</b> {fir['victim_contact']}", styles['Normal']))
    Story.append(Spacer(1, 12))
    
    Story.append(Paragraph("<b>Assigned Officer</b>", styles['Heading2']))
    Story.append(Paragraph(f"<b>Name:</b> {fir['officer_name']} ({fir['officer_rank']})", styles['Normal']))
    Story.append(Paragraph(f"<b>Station:</b> {fir['officer_station']}", styles['Normal']))
    
    doc.build(Story)
    buffer.seek(0)
    
    return StreamingResponse(
        buffer, 
        media_type="application/pdf", 
        headers={"Content-Disposition": f"attachment; filename=FIR_{fir['fir_id']}.pdf"}
    )
