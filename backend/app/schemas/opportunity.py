"""
商机 Schema
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class OpportunityBase(BaseModel):
    client_name: str
    company: Optional[str] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    requirement: Optional[str] = None
    contact_person: Optional[str] = None
    estimated_value: Optional[float] = 0
    status: Optional[str] = "高意向"
    create_date: Optional[str] = None
    expected_close_date: Optional[str] = None
    activity_id: Optional[int] = None
    notes: Optional[str] = None


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    client_name: Optional[str] = None
    company: Optional[str] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    requirement: Optional[str] = None
    contact_person: Optional[str] = None
    estimated_value: Optional[float] = None
    status: Optional[str] = None
    create_date: Optional[str] = None
    expected_close_date: Optional[str] = None
    activity_id: Optional[int] = None
    notes: Optional[str] = None


class OpportunityResponse(OpportunityBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
