"""
物料 Schema
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class MaterialBase(BaseModel):
    name: str
    category: Optional[str] = None
    type: Optional[str] = None
    stock: Optional[float] = 0
    unit: Optional[str] = None
    status: Optional[str] = None
    usage_count: Optional[int] = 0
    last_updated: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[str] = None


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    stock: Optional[float] = None
    unit: Optional[str] = None
    status: Optional[str] = None
    usage_count: Optional[int] = None
    last_updated: Optional[str] = None
    image_url: Optional[str] = None
    location: Optional[str] = None


class MaterialResponse(MaterialBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class WarehousingLogBase(BaseModel):
    material_id: int
    material_name: Optional[str] = None
    count: float
    operator: Optional[str] = None
    date: Optional[str] = None
    is_new_type: Optional[str] = None


class WarehousingLogCreate(WarehousingLogBase):
    pass


class WarehousingLogResponse(WarehousingLogBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class WithdrawalLogBase(BaseModel):
    material_id: int
    material_name: Optional[str] = None
    count: float
    unit: Optional[str] = None
    user: Optional[str] = None
    reason: Optional[str] = None
    date: Optional[str] = None
    activity_id: Optional[int] = None
    status: Optional[str] = "领用中"
    returned_at: Optional[str] = None
    return_count: Optional[float] = 0


class WithdrawalLogCreate(WithdrawalLogBase):
    pass


class WithdrawalLogResponse(WithdrawalLogBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
