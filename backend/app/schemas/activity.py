"""
活动 Schema
"""
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class ActivityBase(BaseModel):
    name: str
    date: Optional[str] = None
    year: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    industry: Optional[str] = None
    budget: Optional[float] = 0
    actual_spend: Optional[float] = 0
    leads: Optional[int] = 0
    status: Optional[str] = "待启动"
    description: Optional[str] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[str] = None
    year: Optional[str] = None
    location: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    industry: Optional[str] = None
    budget: Optional[float] = None
    actual_spend: Optional[float] = None
    leads: Optional[int] = None
    status: Optional[str] = None
    description: Optional[str] = None


class ActivityResponse(ActivityBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
