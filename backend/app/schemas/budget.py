"""
预算 Schema
"""
from datetime import datetime, date
from typing import Optional
from pydantic import BaseModel, ConfigDict


class BudgetBase(BaseModel):
    activity_id: Optional[int] = None
    total_amount: Optional[float] = 0
    used_amount: Optional[float] = 0
    status: Optional[str] = "草稿"
    approved_by: Optional[str] = None
    approved_at: Optional[date] = None


class BudgetCreate(BudgetBase):
    pass


class BudgetUpdate(BaseModel):
    total_amount: Optional[float] = None
    used_amount: Optional[float] = None
    status: Optional[str] = None
    approved_by: Optional[str] = None
    approved_at: Optional[date] = None


class BudgetResponse(BudgetBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BudgetItemBase(BaseModel):
    budget_id: int
    category: str  # 场地租用, 搭建/展览, 物料制作, etc.
    planned_amount: Optional[float] = 0
    actual_amount: Optional[float] = 0
    status: Optional[str] = "正常"
    notes: Optional[str] = None


class BudgetItemCreate(BudgetItemBase):
    pass


class BudgetItemUpdate(BaseModel):
    category: Optional[str] = None
    planned_amount: Optional[float] = None
    actual_amount: Optional[float] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class BudgetItemResponse(BudgetItemBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class BudgetLogBase(BaseModel):
    activity_id: Optional[int] = None
    name: str
    amount: float
    planned_amount: Optional[float] = 0
    category: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[str] = "待结算"
    type: str  # expense, income


class BudgetLogCreate(BudgetLogBase):
    pass


class BudgetLogUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    planned_amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    type: Optional[str] = None


class BudgetLogResponse(BudgetLogBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class YearlyQuotaBase(BaseModel):
    year: str
    quota: float


class YearlyQuotaCreate(YearlyQuotaBase):
    pass


class YearlyQuotaUpdate(BaseModel):
    quota: Optional[float] = None


class YearlyQuotaResponse(YearlyQuotaBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
