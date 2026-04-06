"""
错误响应 Schema
EventMaster Pro - 全生命周期活动管理平台
"""
from typing import Optional, Dict, Any, List
from pydantic import BaseModel, Field


class ErrorContext(BaseModel):
    """错误上下文信息"""
    resource: Optional[str] = Field(None, description="资源类型")
    id: Optional[Any] = Field(None, description="资源ID")
    field: Optional[str] = Field(None, description="字段名")
    extra: Optional[Dict[str, Any]] = Field(None, description="额外上下文")


class ErrorResponse(BaseModel):
    """标准错误响应"""
    code: str = Field(..., description="错误码 (如 E2001)")
    message: str = Field(..., description="人类可读的错误消息")
    context: Dict[str, Any] = Field(default_factory=dict, description="额外错误上下文")
    request_id: Optional[str] = Field(None, description="请求ID，用于问题追踪")

    class Config:
        json_schema_extra = {
            "example": {
                "code": "E2001",
                "message": "活动不存在",
                "context": {"activity_id": 123},
                "request_id": "req-1712345678901"
            }
        }


class ValidationErrorItem(BaseModel):
    """单个验证错误"""
    field: str = Field(..., description="字段名")
    message: str = Field(..., description="验证错误消息")
    code: str = Field(default="E1006", description="错误码")


class ValidationErrorResponse(BaseModel):
    """验证错误响应（包含字段级详情）"""
    code: str = Field(default="E1006")
    message: str = Field(default="数据验证失败")
    errors: List[ValidationErrorItem] = Field(default_factory=list, description="错误列表")
    request_id: Optional[str] = Field(None, description="请求ID，用于问题追踪")


class ErrorDetail(BaseModel):
    """错误详情（用于嵌套在响应中）"""
    code: str = Field(..., description="错误码")
    message: str = Field(..., description="错误消息")
    context: Optional[Dict[str, Any]] = Field(None, description="上下文")


class ErrorListResponse(BaseModel):
    """错误列表响应"""
    errors: List[ErrorDetail] = Field(..., description="错误列表")
    count: int = Field(..., description="错误数量")
