from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import date, datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str
    role: str

class UserResponse(UserBase):
    user_id: int
    role: str
    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None
    role: Optional[str] = None

class LocationBase(BaseModel):
    state: str
    city: str
    pincode: str

class VictimBase(BaseModel):
    name: str
    age: int
    gender: str
    contact: Optional[str] = None
    address: Optional[str] = None

class ComplaintCreate(BaseModel):
    description: str
    victim_id: int
    crime_id: int
    date: date

class FIRCreateDetailed(BaseModel):
    victim_name: str
    victim_age: int
    victim_gender: str
    victim_contact: Optional[str] = None
    victim_address: Optional[str] = None
    crime_id: int
    location_state: str
    location_city: str
    location_pincode: str
    description: str
    date: date

class StatusUpdate(BaseModel):
    status: str

class EvidenceCreate(BaseModel):
    evidence_type: str
    description: str
    date_collected: Optional[date] = None
    collected_by: Optional[str] = None

class EvidenceUpdate(BaseModel):
    evidence_type: Optional[str] = None
    description: Optional[str] = None
    date_collected: Optional[date] = None
    collected_by: Optional[str] = None
    linked_suspect_id: Optional[int] = None

class OutcomeCreate(BaseModel):
    outcome: str
    remarks: str
    outcome_date: date

class AccusedBase(BaseModel):
    accused_name: str
    gender: Optional[str] = None
    age: int
    address: Optional[str] = None
    contact_no: Optional[str] = None
    nationality: Optional[str] = 'Indian'
    status: Optional[str] = 'At Large'

class AccusedCreate(AccusedBase):
    pass

class AccusedUpdate(BaseModel):
    accused_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    contact_no: Optional[str] = None
    nationality: Optional[str] = None
    status: Optional[str] = None

class SuspectBase(BaseModel):
    suspect_name: str
    gender: Optional[str] = None
    age: int
    address: Optional[str] = None
    contact_no: Optional[str] = None
    nationality: Optional[str] = 'Indian'
    status: Optional[str] = 'Under Surveillance'

class SuspectCreate(SuspectBase):
    pass

class SuspectUpdate(BaseModel):
    suspect_name: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    contact_no: Optional[str] = None
    nationality: Optional[str] = None
    status: Optional[str] = None

class FIRAccusedLink(BaseModel):
    fir_id: int
    accused_id: int
    role_in_crime: Optional[str] = None

class FIRSuspectLink(BaseModel):
    fir_id: int
    suspect_id: int
    reason_for_suspicion: Optional[str] = None
