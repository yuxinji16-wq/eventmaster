"""
复盘 Schema
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


class ReviewBase(BaseModel):
    activity_id: int
    status: Optional[str] = "未开始"
    expected_participants: Optional[int] = 0
    participant_count: Optional[int] = 0
    lead_count: Optional[int] = 0
    confirmed_by: Optional[str] = None
    confirmed_at: Optional[str] = None
    reminded_at: Optional[str] = None
    reminded_count: Optional[int] = 0


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    status: Optional[str] = None
    expected_participants: Optional[int] = None
    participant_count: Optional[int] = None
    lead_count: Optional[int] = None
    confirmed_by: Optional[str] = None
    confirmed_at: Optional[str] = None
    reminded_at: Optional[str] = None
    reminded_count: Optional[int] = None


class ReviewResponse(ReviewBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewFeedbackBase(BaseModel):
    review_id: int
    evaluator_id: str
    evaluator_name: str
    evaluator_role: Optional[str] = None
    goal_score: float  # 目标达成度
    lead_quality_score: float  # 线索质量
    execution_score: float  # 执行稳定性
    resource_score: float  # 资源利用效率
    brand_score: float  # 品牌曝光效果
    successes: Optional[str] = None
    problems: Optional[str] = None
    suggestions: Optional[str] = None
    tags: Optional[List[str]] = None
    is_submitted: Optional[bool] = False
    submitted_at: Optional[str] = None


class ReviewFeedbackCreate(ReviewFeedbackBase):
    pass


class ReviewFeedbackUpdate(BaseModel):
    goal_score: Optional[float] = None
    lead_quality_score: Optional[float] = None
    execution_score: Optional[float] = None
    resource_score: Optional[float] = None
    brand_score: Optional[float] = None
    successes: Optional[str] = None
    problems: Optional[str] = None
    suggestions: Optional[str] = None
    tags: Optional[List[str]] = None
    is_submitted: Optional[bool] = None
    submitted_at: Optional[str] = None


class ReviewFeedbackResponse(ReviewFeedbackBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class ReviewConclusionBase(BaseModel):
    review_id: int
    ai_summary: Optional[str] = None
    key_successes: Optional[List[str]] = None
    common_problems: Optional[List[str]] = None
    action_suggestions: Optional[List[str]] = None
    manager_summary: Optional[str] = None
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None
    avg_goal_score: Optional[float] = None
    avg_lead_quality_score: Optional[float] = None
    avg_execution_score: Optional[float] = None
    avg_resource_score: Optional[float] = None
    avg_brand_score: Optional[float] = None
    overall_score: Optional[float] = None


class ReviewConclusionCreate(ReviewConclusionBase):
    pass


class ReviewConclusionUpdate(BaseModel):
    ai_summary: Optional[str] = None
    key_successes: Optional[List[str]] = None
    common_problems: Optional[List[str]] = None
    action_suggestions: Optional[List[str]] = None
    manager_summary: Optional[str] = None
    manager_id: Optional[str] = None
    manager_name: Optional[str] = None
    avg_goal_score: Optional[float] = None
    avg_lead_quality_score: Optional[float] = None
    avg_execution_score: Optional[float] = None
    avg_resource_score: Optional[float] = None
    avg_brand_score: Optional[float] = None
    overall_score: Optional[float] = None


class ReviewConclusionResponse(ReviewConclusionBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
