"""
Pydantic 模式定义
"""
from datetime import datetime, date
from typing import List, Optional
from pydantic import BaseModel, Field


# ============ 基础模式 ============

class UserBase(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    password: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class UserResponse(UserBase):
    id: int
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ============ 活动相关模式 ============

class ActivityBase(BaseModel):
    name: str
    date: date
    location: Optional[str] = None
    type: Optional[str] = None
    category: Optional[str] = None
    industry: Optional[str] = None
    budget: Optional[float] = 0
    leads: Optional[int] = 0
    description: Optional[str] = None


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    date: Optional[date] = None
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
    year: str
    actual_spend: float
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ActivityDetailResponse(ActivityResponse):
    associated_materials: List["MaterialResponse"] = []
    associated_suppliers: List["SupplierResponse"] = []
    associated_opportunities: List["OpportunityResponse"] = []
    budget_logs: List["BudgetLogResponse"] = []
    ai_insight: Optional[str] = None


# ============ 预算相关模式 ============

class BudgetLogBase(BaseModel):
    activity_id: int
    name: str
    amount: float
    category: str
    date: date
    notes: Optional[str] = None
    status: str = "已结清"
    type: str = "expense"


class BudgetLogCreate(BudgetLogBase):
    pass


class BudgetLogUpdate(BaseModel):
    name: Optional[str] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    date: Optional[date] = None
    notes: Optional[str] = None
    status: Optional[str] = None


class BudgetLogResponse(BudgetLogBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BudgetOverviewResponse(BaseModel):
    yearly_quota: float
    total_reimbursed: float
    risk_projects: int
    execution_rate: float
    category_stats: List[dict]


class UpdateQuotaRequest(BaseModel):
    year: str
    quota: float


# ============ 物料相关模式 ============

class MaterialBase(BaseModel):
    name: str
    category: str
    type: str
    stock: int
    unit: str


class MaterialCreate(MaterialBase):
    pass


class MaterialUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    type: Optional[str] = None
    stock: Optional[int] = None
    unit: Optional[str] = None


class MaterialResponse(MaterialBase):
    id: int
    status: str
    usage_count: int
    last_updated: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class WarehousingLogBase(BaseModel):
    material_id: int
    material_name: str
    count: int
    operator: str
    is_new_type: bool = False


class WarehousingLogCreate(WarehousingLogBase):
    pass


class WarehousingLogResponse(WarehousingLogBase):
    id: int
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


class WithdrawalLogBase(BaseModel):
    material_id: int
    material_name: str
    count: int
    unit: str
    user: str
    reason: str


class WithdrawalLogCreate(WithdrawalLogBase):
    pass


class WithdrawalLogResponse(WithdrawalLogBase):
    id: int
    date: datetime
    created_at: datetime

    class Config:
        from_attributes = True


# ============ 供应商相关模式 ============

class ReviewBase(BaseModel):
    user: str
    date: date
    content: str
    rating: float


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class BillBase(BaseModel):
    supplier_id: int
    activity_name: str
    project_name: str
    date: date
    status: str
    amount: float


class BillCreate(BillBase):
    pass


class BillResponse(BillBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class SupplierBase(BaseModel):
    name: str
    service_type: str
    rating: float
    contact: str
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    tags: Optional[List[str]] = []


class SupplierCreate(SupplierBase):
    pass


class SupplierUpdate(BaseModel):
    name: Optional[str] = None
    service_type: Optional[str] = None
    rating: Optional[float] = None
    contact: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    bank_name: Optional[str] = None
    bank_account: Optional[str] = None
    tags: Optional[List[str]] = None


class SupplierResponse(SupplierBase):
    id: int
    last_used: Optional[date]
    order_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SupplierDetailResponse(SupplierResponse):
    reviews: List[ReviewResponse] = []
    bills: List[BillResponse] = []


# ============ 商机相关模式 ============

class OpportunityBase(BaseModel):
    client_name: str
    activity_id: int
    value: float
    stage: str
    probability: int


class OpportunityCreate(OpportunityBase):
    pass


class OpportunityUpdate(BaseModel):
    client_name: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    probability: Optional[int] = None


class OpportunityResponse(OpportunityBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PipelineStatsResponse(BaseModel):
    total_value: float
    stages: List[dict]
    conversion_rates: List[dict]


# ============ 复盘相关模式 ============

class ReviewSummaryResponse(BaseModel):
    budget_efficiency: float
    cpl: float
    roi: float


class GenerateSummaryResponse(BaseModel):
    summary: dict
    insight: str


# ============ AI 相关模式 ============

class MarketingInsightRequest(BaseModel):
    prompt: str
    context: Optional[dict] = None


class MarketingInsightResponse(BaseModel):
    insight: str


class SummarizeReviewRequest(BaseModel):
    event_data: dict


class SummarizeReviewResponse(BaseModel):
    summary: str
    core_achievements: List[str]
    deficiencies: List[str]
    recommendations: List[str]


# ============ 仪表盘相关模式 ============

class DashboardStatsResponse(BaseModel):
    yearly_metrics: dict
    monthly_trend: List[dict]
    activity_distribution: List[dict]


class ComparisonResponse(BaseModel):
    current_year: str
    previous_year: str
    budget_growth: float
    leads_growth: float


# ============ 导出相关模式 ============

class ExportRequest(BaseModel):
    type: str
    format: str
    filters: Optional[dict] = None


# 更新 forward references
ActivityDetailResponse.model_rebuild()
