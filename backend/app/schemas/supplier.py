"""
供应商 Schema
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class SupplierBase(BaseModel):
    name: str
    category: Optional[str] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    description: Optional[str] = None


class SupplierResponse(SupplierBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class SupplierReviewBase(BaseModel):
    supplier_id: int
    quality_score: float  # 质量评分
    delivery_score: float  # 交付评分
    service_score: float  # 服务评分
    price_score: float  # 价格评分
    overall_score: float  # 综合评分
    comments: Optional[str] = None


class SupplierReviewCreate(SupplierReviewBase):
    pass


class SupplierReviewResponse(SupplierReviewBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BillBase(BaseModel):
    supplier_id: int
    activity_id: Optional[int] = None
    amount: float
    status: str  # 待付款, 已付款, 已结算
    due_date: Optional[str] = None
    paid_at: Optional[str] = None
    notes: Optional[str] = None


class BillCreate(BillBase):
    pass


class BillResponse(BillBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
