"""
供应商 Schema
"""
import json
from datetime import datetime
from typing import Optional, List, Any
from pydantic import BaseModel, ConfigDict, field_validator


def _parse_tags(v: Any) -> Optional[List[str]]:
    """解析 tags 字段，支持字符串和列表"""
    if v is None:
        return None
    if isinstance(v, list):
        return v
    if isinstance(v, str):
        try:
            return json.loads(v)
        except:
            return [v]
    return None


class SupplierBase(BaseModel):
    name: str
    category: Optional[str] = None  # 服务类型别名
    service_type: Optional[str] = None  # 服务类型
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    last_used: Optional[str] = None
    order_count: Optional[int] = 0
    tags: Optional[List[str]] = None

    @field_validator('tags', mode='before')
    @classmethod
    def parse_tags(cls, v):
        return _parse_tags(v)


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    service_type: Optional[str] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    rating: Optional[float] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    last_used: Optional[str] = None
    order_count: Optional[int] = None
    tags: Optional[List[str]] = None

    @field_validator('tags', mode='before')
    @classmethod
    def parse_tags(cls, v):
        return _parse_tags(v)


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
    reviewer_name: Optional[str] = None


class SupplierReviewCreate(SupplierReviewBase):
    pass


class SupplierReviewResponse(SupplierReviewBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BillBase(BaseModel):
    supplier_id: int
    activity_id: Optional[int] = None
    activity_name: Optional[str] = None
    project_name: Optional[str] = None
    amount: float
    status: str  # 待结算, 已结清
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
