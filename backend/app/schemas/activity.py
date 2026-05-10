"""
活动 Schema
"""
from datetime import datetime, date
from typing import Optional, Any, Dict
from pydantic import BaseModel, ConfigDict


class ActivityBase(BaseModel):
    name: str
    date: Optional[str] = None
    year: Optional[str] = None
    location: Optional[str] = None
    type: str  # selfHosted=自办活动, external=外部市场活动
    category: Optional[str] = None
    industry: Optional[str] = None
    budget: Optional[float] = 0
    actual_spend: Optional[float] = 0
    leads: Optional[int] = 0
    status: Optional[str] = "待启动"
    description: Optional[str] = None
    external_event_info: Optional[Dict[str, Any]] = None  # 外部活动详细信息


class ActivityCreate(BaseModel):
    name: str
    date: Optional[str] = None
    year: Optional[str] = None
    location: Optional[str] = None
    type: str  # selfHosted=自办活动, external=外部市场活动，必填
    category: Optional[str] = None
    industry: Optional[str] = None
    budget: Optional[float] = 0
    actual_spend: Optional[float] = 0
    leads: Optional[int] = 0
    status: Optional[str] = "待启动"
    description: Optional[str] = None
    external_event_info: Optional[Dict[str, Any]] = None


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
    external_event_info: Optional[Dict[str, Any]] = None


class ActivityResponse(ActivityBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
