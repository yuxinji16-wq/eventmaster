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
    status: Optional[str] = "潜在客户"
    create_date: Optional[str] = None
    expected_close_date: Optional[str] = None
    activity_id: Optional[int] = None
    notes: Optional[str] = None
    # 新增字段
    field: Optional[str] = None  # 民用/军工
    position: Optional[str] = None  # 职位
    # 来源信息
    source_type: Optional[str] = "manual"  # activity=活动获取, manual=自主录入
    source_name: Optional[str] = "自主录入"  # 活动名称或"自主录入"
    # 销售分配
    region: Optional[str] = None  # 所属区域
    owner: Optional[str] = None  # 对接人
    lead_level: Optional[str] = "待评估"
    evaluation_note: Optional[str] = None
    transferred_to_sales: Optional[str] = "false"
    transferred_at: Optional[str] = None
    converted: Optional[str] = "false"
    conversion_status: Optional[str] = None
    conversion_at: Optional[str] = None
    result_note: Optional[str] = None


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
    # 新增字段
    field: Optional[str] = None
    position: Optional[str] = None
    # 来源信息
    source_type: Optional[str] = None
    source_name: Optional[str] = None
    # 销售分配
    region: Optional[str] = None
    owner: Optional[str] = None
    lead_level: Optional[str] = None
    evaluation_note: Optional[str] = None
    transferred_to_sales: Optional[str] = None
    transferred_at: Optional[str] = None
    converted: Optional[str] = None
    conversion_status: Optional[str] = None
    conversion_at: Optional[str] = None
    result_note: Optional[str] = None


class OpportunityResponse(OpportunityBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class OpportunityActivityLogResponse(BaseModel):
    id: int
    opportunity_id: int
    action: str
    from_value: Optional[str] = None
    to_value: Optional[str] = None
    operator: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
