"""
错误码与自定义异常类
EventMaster Pro - 全生命周期活动管理平台
"""
from typing import Optional, Any, Dict
from fastapi import HTTPException, status


# ==================== 错误码常量 ====================

class ErrorCode:
    """错误码枚举"""
    # 系统错误 (E1000-E1999)
    INTERNAL_ERROR = "E1000"           # 内部服务器错误
    INVALID_PARAMS = "E1001"           # 无效的请求参数
    NOT_FOUND = "E1002"               # 资源不存在
    DUPLICATE_RESOURCE = "E1003"       # 资源已存在
    OPERATION_NOT_PERMITTED = "E1004"  # 操作不被允许
    DATABASE_ERROR = "E1005"           # 数据库操作失败
    VALIDATION_ERROR = "E1006"         # 数据验证失败
    UNAUTHORIZED = "E1007"             # 未授权
    FORBIDDEN = "E1008"                # 禁止访问

    # 活动模块错误 (E2000-E2999)
    ACTIVITY_NOT_FOUND = "E2001"           # 活动不存在
    ACTIVITY_CREATE_FAILED = "E2002"       # 创建活动失败
    ACTIVITY_UPDATE_FAILED = "E2003"       # 更新活动失败
    ACTIVITY_DELETE_FAILED = "E2004"       # 删除活动失败
    ACTIVITY_INVALID_STATUS = "E2005"      # 无效的活动状态转换

    # 物料模块错误 (E3000-E3999)
    MATERIAL_NOT_FOUND = "E3001"            # 物料不存在
    MATERIAL_CREATE_FAILED = "E3002"        # 创建物料失败
    MATERIAL_INSUFFICIENT_STOCK = "E3003"   # 库存不足
    MATERIAL_STOCK_OP_FAILED = "E3004"       # 库存操作失败
    MATERIAL_WITHDRAWAL_FAILED = "E3005"    # 物料领用失败

    # 供应商模块错误 (E4000-E4999)
    SUPPLIER_NOT_FOUND = "E4001"            # 供应商不存在
    SUPPLIER_CREATE_FAILED = "E4002"        # 创建供应商失败
    SUPPLIER_DUPLICATE = "E4003"            # 供应商已存在
    SUPPLIER_HAS_RECORDS = "E4004"         # 供应商有关联记录，无法删除

    # 预算模块错误 (E5000-E5999)
    BUDGET_NOT_FOUND = "E5001"              # 预算不存在
    BUDGET_CREATE_FAILED = "E5002"          # 创建预算失败
    BUDGET_EXCEEDS_QUOTA = "E5003"         # 预算超出年度配额
    BUDGET_ITEM_NOT_FOUND = "E5004"        # 预算明细不存在
    BUDGET_LOG_NOT_FOUND = "E5005"         # 预算日志不存在
    QUOTA_NOT_FOUND = "E5006"              # 年度配额不存在

    # 商机模块错误 (E6000-E6999)
    OPPORTUNITY_NOT_FOUND = "E6001"         # 商机不存在
    OPPORTUNITY_CREATE_FAILED = "E6002"     # 创建商机失败
    OPPORTUNITY_INVALID_STAGE = "E6003"     # 无效的商机阶段
    OPPORTUNITY_CONVERT_FAILED = "E6004"    # 商机转化失败

    # 复盘模块错误 (E7000-E7999)
    REVIEW_NOT_FOUND = "E7001"             # 复盘不存在
    REVIEW_CREATE_FAILED = "E7002"         # 创建复盘失败
    REVIEW_ALREADY_COMPLETED = "E7003"     # 复盘已完成，无法修改
    FEEDBACK_NOT_FOUND = "E7004"          # 反馈不存在
    CONCLUSION_NOT_FOUND = "E7005"         # 复盘结论不存在

    # 集成错误 (E9000-E9999)
    AI_SERVICE_UNAVAILABLE = "E9001"       # AI服务暂时不可用
    EXTERNAL_API_ERROR = "E9002"           # 外部API调用失败
    GEMINI_API_ERROR = "E9003"            # Gemini API 调用失败


# ==================== 错误消息 ====================

ERROR_MESSAGES: Dict[str, str] = {
    # 系统错误
    ErrorCode.INTERNAL_ERROR: "内部服务器错误",
    ErrorCode.INVALID_PARAMS: "无效的请求参数",
    ErrorCode.NOT_FOUND: "资源不存在",
    ErrorCode.DUPLICATE_RESOURCE: "资源已存在",
    ErrorCode.OPERATION_NOT_PERMITTED: "操作不被允许",
    ErrorCode.DATABASE_ERROR: "数据库操作失败",
    ErrorCode.VALIDATION_ERROR: "数据验证失败",
    ErrorCode.UNAUTHORIZED: "请先登录",
    ErrorCode.FORBIDDEN: "权限不足",

    # 活动模块
    ErrorCode.ACTIVITY_NOT_FOUND: "活动不存在",
    ErrorCode.ACTIVITY_CREATE_FAILED: "创建活动失败",
    ErrorCode.ACTIVITY_UPDATE_FAILED: "更新活动失败",
    ErrorCode.ACTIVITY_DELETE_FAILED: "删除活动失败",
    ErrorCode.ACTIVITY_INVALID_STATUS: "无效的活动状态转换",

    # 物料模块
    ErrorCode.MATERIAL_NOT_FOUND: "物料不存在",
    ErrorCode.MATERIAL_CREATE_FAILED: "创建物料失败",
    ErrorCode.MATERIAL_INSUFFICIENT_STOCK: "库存不足",
    ErrorCode.MATERIAL_STOCK_OP_FAILED: "库存操作失败",
    ErrorCode.MATERIAL_WITHDRAWAL_FAILED: "物料领用失败",

    # 供应商模块
    ErrorCode.SUPPLIER_NOT_FOUND: "供应商不存在",
    ErrorCode.SUPPLIER_CREATE_FAILED: "创建供应商失败",
    ErrorCode.SUPPLIER_DUPLICATE: "供应商已存在",
    ErrorCode.SUPPLIER_HAS_RECORDS: "供应商有关联记录，无法删除",

    # 预算模块
    ErrorCode.BUDGET_NOT_FOUND: "预算不存在",
    ErrorCode.BUDGET_CREATE_FAILED: "创建预算失败",
    ErrorCode.BUDGET_EXCEEDS_QUOTA: "预算超出年度配额",
    ErrorCode.BUDGET_ITEM_NOT_FOUND: "预算明细不存在",
    ErrorCode.BUDGET_LOG_NOT_FOUND: "预算日志不存在",
    ErrorCode.QUOTA_NOT_FOUND: "年度配额不存在",

    # 商机模块
    ErrorCode.OPPORTUNITY_NOT_FOUND: "商机不存在",
    ErrorCode.OPPORTUNITY_CREATE_FAILED: "创建商机失败",
    ErrorCode.OPPORTUNITY_INVALID_STAGE: "无效的商机阶段",
    ErrorCode.OPPORTUNITY_CONVERT_FAILED: "商机转化失败",

    # 复盘模块
    ErrorCode.REVIEW_NOT_FOUND: "复盘不存在",
    ErrorCode.REVIEW_CREATE_FAILED: "创建复盘失败",
    ErrorCode.REVIEW_ALREADY_COMPLETED: "复盘已完成，无法修改",
    ErrorCode.FEEDBACK_NOT_FOUND: "反馈不存在",
    ErrorCode.CONCLUSION_NOT_FOUND: "复盘结论不存在",

    # 集成错误
    ErrorCode.AI_SERVICE_UNAVAILABLE: "AI服务暂时不可用",
    ErrorCode.EXTERNAL_API_ERROR: "外部API调用失败",
    ErrorCode.GEMINI_API_ERROR: "Gemini API 调用失败",
}


# ==================== 自定义异常类 ====================

class AppException(HTTPException):
    """应用异常基类"""

    def __init__(
        self,
        error_code: str,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        detail: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ):
        self.error_code = error_code
        self.detail = detail or ERROR_MESSAGES.get(error_code, "未知错误")
        self.context = context or {}
        super().__init__(
            status_code=status_code,
            detail={
                "code": error_code,
                "message": self.detail,
                "context": self.context
            }
        )


class NotFoundException(AppException):
    """资源不存在异常"""

    def __init__(self, resource: str, resource_id: Any = None):
        detail = f"{resource}{' ' + str(resource_id) if resource_id else ''}不存在"
        super().__init__(
            error_code=ErrorCode.NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail=detail,
            context={"resource": resource, "id": resource_id}
        )


class ValidationException(AppException):
    """数据验证异常"""

    def __init__(self, message: str, field: Optional[str] = None):
        super().__init__(
            error_code=ErrorCode.VALIDATION_ERROR,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=message,
            context={"field": field} if field else {}
        )


class DuplicateException(AppException):
    """重复资源异常"""

    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            error_code=ErrorCode.DUPLICATE_RESOURCE,
            status_code=status.HTTP_409_CONFLICT,
            detail=f"{resource}已存在",
            context={"resource": resource, "identifier": identifier}
        )


class UnauthorizedException(AppException):
    """未授权异常"""

    def __init__(self, message: str = "请先登录"):
        super().__init__(
            error_code=ErrorCode.UNAUTHORIZED,
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=message,
            context={}
        )


class ForbiddenException(AppException):
    """禁止访问异常"""

    def __init__(self, message: str = "权限不足"):
        super().__init__(
            error_code=ErrorCode.FORBIDDEN,
            status_code=status.HTTP_403_FORBIDDEN,
            detail=message,
            context={}
        )


# ==================== 模块化异常工厂类 ====================

class ActivityException:
    """活动模块异常"""

    @staticmethod
    def not_found(activity_id: int):
        return AppException(
            error_code=ErrorCode.ACTIVITY_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="活动不存在",
            context={"activity_id": activity_id}
        )

    @staticmethod
    def creation_failed(reason: str = None):
        return AppException(
            error_code=ErrorCode.ACTIVITY_CREATE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "创建活动失败",
            context={"reason": reason} if reason else {}
        )

    @staticmethod
    def update_failed(activity_id: int = None, reason: str = None):
        ctx = {}
        if activity_id:
            ctx["activity_id"] = activity_id
        if reason:
            ctx["reason"] = reason
        return AppException(
            error_code=ErrorCode.ACTIVITY_UPDATE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "更新活动失败",
            context=ctx
        )

    @staticmethod
    def delete_failed(activity_id: int = None, reason: str = None):
        ctx = {}
        if activity_id:
            ctx["activity_id"] = activity_id
        if reason:
            ctx["reason"] = reason
        return AppException(
            error_code=ErrorCode.ACTIVITY_DELETE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "删除活动失败",
            context=ctx
        )

    @staticmethod
    def invalid_status_transition(current: str, target: str):
        return AppException(
            error_code=ErrorCode.ACTIVITY_INVALID_STATUS,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无法从「{current}」转换到「{target}」",
            context={"current_status": current, "target_status": target}
        )


class MaterialException:
    """物料模块异常"""

    @staticmethod
    def not_found(material_id: int):
        return AppException(
            error_code=ErrorCode.MATERIAL_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="物料不存在",
            context={"material_id": material_id}
        )

    @staticmethod
    def creation_failed(reason: str = None):
        return AppException(
            error_code=ErrorCode.MATERIAL_CREATE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "创建物料失败",
            context={"reason": reason} if reason else {}
        )

    @staticmethod
    def insufficient_stock(material_id: int, available: int, requested: int):
        return AppException(
            error_code=ErrorCode.MATERIAL_INSUFFICIENT_STOCK,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"库存不足（可用: {available}, 请求: {requested}）",
            context={
                "material_id": material_id,
                "available_stock": available,
                "requested": requested
            }
        )

    @staticmethod
    def stock_operation_failed(material_id: int = None, reason: str = None):
        ctx = {}
        if material_id:
            ctx["material_id"] = material_id
        if reason:
            ctx["reason"] = reason
        return AppException(
            error_code=ErrorCode.MATERIAL_STOCK_OP_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "库存操作失败",
            context=ctx
        )


class SupplierException:
    """供应商模块异常"""

    @staticmethod
    def not_found(supplier_id: int):
        return AppException(
            error_code=ErrorCode.SUPPLIER_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="供应商不存在",
            context={"supplier_id": supplier_id}
        )

    @staticmethod
    def creation_failed(reason: str = None):
        return AppException(
            error_code=ErrorCode.SUPPLIER_CREATE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "创建供应商失败",
            context={"reason": reason} if reason else {}
        )

    @staticmethod
    def duplicate(name: str):
        return AppException(
            error_code=ErrorCode.SUPPLIER_DUPLICATE,
            status_code=status.HTTP_409_CONFLICT,
            detail=f"供应商「{name}」已存在",
            context={"supplier_name": name}
        )

    @staticmethod
    def has_associated_records(supplier_id: int, record_count: int):
        return AppException(
            error_code=ErrorCode.SUPPLIER_HAS_RECORDS,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"该供应商有关联记录（{record_count}条），无法删除",
            context={"supplier_id": supplier_id, "record_count": record_count}
        )


class BudgetException:
    """预算模块异常"""

    @staticmethod
    def not_found(budget_id: int = None, year: str = None):
        ctx = {}
        if budget_id:
            ctx["budget_id"] = budget_id
        if year:
            ctx["year"] = year
        return AppException(
            error_code=ErrorCode.BUDGET_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预算不存在",
            context=ctx
        )

    @staticmethod
    def creation_failed(reason: str = None):
        return AppException(
            error_code=ErrorCode.BUDGET_CREATE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "创建预算失败",
            context={"reason": reason} if reason else {}
        )

    @staticmethod
    def exceeds_quota(year: str, requested: float, quota: float):
        return AppException(
            error_code=ErrorCode.BUDGET_EXCEEDS_QUOTA,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"预算超出年度配额（请求: {requested}, 配额: {quota}）",
            context={"year": year, "requested": requested, "quota": quota}
        )

    @staticmethod
    def item_not_found(item_id: int = None):
        return AppException(
            error_code=ErrorCode.BUDGET_ITEM_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预算明细不存在",
            context={"item_id": item_id} if item_id else {}
        )

    @staticmethod
    def log_not_found(log_id: int = None):
        return AppException(
            error_code=ErrorCode.BUDGET_LOG_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="预算日志不存在",
            context={"log_id": log_id} if log_id else {}
        )

    @staticmethod
    def quota_not_found(year: str = None):
        return AppException(
            error_code=ErrorCode.QUOTA_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="年度配额不存在",
            context={"year": year} if year else {}
        )


class OpportunityException:
    """商机模块异常"""

    @staticmethod
    def not_found(opportunity_id: int):
        return AppException(
            error_code=ErrorCode.OPPORTUNITY_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="商机不存在",
            context={"opportunity_id": opportunity_id}
        )

    @staticmethod
    def creation_failed(reason: str = None):
        return AppException(
            error_code=ErrorCode.OPPORTUNITY_CREATE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "创建商机失败",
            context={"reason": reason} if reason else {}
        )

    @staticmethod
    def invalid_stage(stage: str):
        return AppException(
            error_code=ErrorCode.OPPORTUNITY_INVALID_STAGE,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"无效的商机阶段: {stage}",
            context={"stage": stage}
        )

    @staticmethod
    def convert_failed(opportunity_id: int = None, reason: str = None):
        ctx = {}
        if opportunity_id:
            ctx["opportunity_id"] = opportunity_id
        if reason:
            ctx["reason"] = reason
        return AppException(
            error_code=ErrorCode.OPPORTUNITY_CONVERT_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "商机转化失败",
            context=ctx
        )


class ReviewException:
    """复盘模块异常"""

    @staticmethod
    def not_found(review_id: int):
        return AppException(
            error_code=ErrorCode.REVIEW_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="复盘不存在",
            context={"review_id": review_id}
        )

    @staticmethod
    def creation_failed(reason: str = None):
        return AppException(
            error_code=ErrorCode.REVIEW_CREATE_FAILED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=reason or "创建复盘失败",
            context={"reason": reason} if reason else {}
        )

    @staticmethod
    def already_completed(review_id: int):
        return AppException(
            error_code=ErrorCode.REVIEW_ALREADY_COMPLETED,
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="复盘已完成，无法修改",
            context={"review_id": review_id}
        )

    @staticmethod
    def feedback_not_found(feedback_id: int = None):
        return AppException(
            error_code=ErrorCode.FEEDBACK_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="反馈不存在",
            context={"feedback_id": feedback_id} if feedback_id else {}
        )

    @staticmethod
    def conclusion_not_found(conclusion_id: int = None):
        return AppException(
            error_code=ErrorCode.CONCLUSION_NOT_FOUND,
            status_code=status.HTTP_404_NOT_FOUND,
            detail="复盘结论不存在",
            context={"conclusion_id": conclusion_id} if conclusion_id else {}
        )


class IntegrationException:
    """集成服务异常"""

    @staticmethod
    def ai_service_unavailable(error_message: str = None):
        return AppException(
            error_code=ErrorCode.AI_SERVICE_UNAVAILABLE,
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=error_message or "AI服务暂时不可用，请稍后再试",
            context={"service": "AI"} if error_message else {}
        )

    @staticmethod
    def external_api_error(service: str, error_message: str = None):
        return AppException(
            error_code=ErrorCode.EXTERNAL_API_ERROR,
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=error_message or f"{service}服务调用失败",
            context={"service": service} if error_message else {"service": service}
        )
