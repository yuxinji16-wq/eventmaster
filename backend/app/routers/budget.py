"""
预算 API 路由
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.budget import (
    BudgetCreate, BudgetUpdate, BudgetResponse,
    BudgetItemCreate, BudgetItemUpdate, BudgetItemResponse,
    BudgetLogCreate, BudgetLogUpdate, BudgetLogResponse,
    YearlyQuotaCreate, YearlyQuotaUpdate, YearlyQuotaResponse
)
from app.services.budget import BudgetService, BudgetItemService, BudgetLogService, YearlyQuotaService
from app.core.errors import BudgetException, ActivityException

router = APIRouter(prefix="/budget", tags=["预算"])
budget_service = BudgetService()
item_service = BudgetItemService()
log_service = BudgetLogService()
quota_service = YearlyQuotaService()


def _sync_activity_actual_spend(db: Session, activity_id: int) -> None:
    """用费用流水同步活动实际支出，保证预算仓库与活动详情同源。"""
    from app.models.activity import Activity
    from app.models.budget import BudgetLog

    total = db.query(BudgetLog).filter(
        BudgetLog.activity_id == activity_id,
        BudgetLog.type == "expense"
    ).all()
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if activity:
        activity.actual_spend = sum(log.amount or 0 for log in total)
        db.commit()


# ===== 特殊端点（必须在 /{id} 路由之前） =====

# 预算日志
@router.get("/logs", response_model=List[BudgetLogResponse])
def list_budget_logs(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    activity_id: Optional[int] = None,
    log_type: Optional[str] = Query(None, alias="type"),
    db: Session = Depends(get_db)
):
    """获取预算日志"""
    if activity_id:
        return log_service.get_by_activity(db, activity_id, skip, limit)
    if log_type:
        return log_service.get_by_type(db, log_type, skip, limit)
    return log_service.get_all(db, skip, limit)


@router.post("/logs", response_model=BudgetLogResponse)
def create_budget_log(data: BudgetLogCreate, db: Session = Depends(get_db)):
    """创建预算日志"""
    log = log_service.create(db, data.model_dump())
    if log.activity_id and log.type == "expense":
        _sync_activity_actual_spend(db, log.activity_id)
        db.refresh(log)
    return log


@router.put("/logs/{log_id}", response_model=BudgetLogResponse)
def update_budget_log(log_id: int, data: BudgetLogUpdate, db: Session = Depends(get_db)):
    """更新预算日志"""
    log = log_service.update(db, log_id, data.model_dump(exclude_unset=True))
    if not log:
        raise HTTPException(status_code=404, detail="预算日志不存在")
    if log.activity_id and log.type == "expense":
        _sync_activity_actual_spend(db, log.activity_id)
        db.refresh(log)
    return log


@router.delete("/logs/{log_id}")
def delete_budget_log(log_id: int, db: Session = Depends(get_db)):
    """删除预算日志"""
    # 直接查询数据库检查记录是否存在
    from app.models.budget import BudgetLog
    log = db.query(BudgetLog).filter(BudgetLog.id == log_id).first()
    if not log:
        raise HTTPException(status_code=404, detail="预算日志不存在")
    activity_id = log.activity_id
    db.delete(log)
    db.commit()
    if activity_id:
        _sync_activity_actual_spend(db, activity_id)
    return {"message": "删除成功"}


# 年度配额
@router.get("/quotas", response_model=List[YearlyQuotaResponse])
def list_quotas(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取年度配额列表"""
    return quota_service.get_all(db, skip, limit)


@router.get("/quotas/year/{year}", response_model=YearlyQuotaResponse)
def get_quota_by_year(year: str, db: Session = Depends(get_db)):
    """获取指定年份配额"""
    quota = quota_service.get_by_year(db, year)
    if not quota:
        raise BudgetException.quota_not_found(year)
    return quota


@router.post("/quotas", response_model=YearlyQuotaResponse)
def create_quota(data: YearlyQuotaCreate, db: Session = Depends(get_db)):
    """创建年度配额"""
    return quota_service.create(db, data.model_dump())


@router.put("/quotas", response_model=YearlyQuotaResponse)
def update_quota_by_year(year: str, data: YearlyQuotaUpdate, db: Session = Depends(get_db)):
    """更新年度配额（按年份）"""
    quota = quota_service.get_by_year(db, year)
    if not quota:
        # 如果不存在，创建新的
        return quota_service.create(db, {"year": year, **data.model_dump(exclude_unset=True)})
    return quota_service.update(db, quota.id, data.model_dump(exclude_unset=True))


# 预算概览（年度）
@router.get("/overview")
def get_budget_overview(year: str = Query(..., description="年份"), db: Session = Depends(get_db)):
    """获取年度预算概览"""
    from app.models.activity import Activity
    from app.models.budget import BudgetLog

    # 获取该年度所有活动
    activities = db.query(Activity).filter(Activity.year == year).all()
    activity_ids = [a.id for a in activities]

    # 统计。预算以活动预算为主，实际支出以费用流水为事实源。
    total_planned = sum(a.budget or 0 for a in activities)
    logs = db.query(BudgetLog).filter(
        BudgetLog.activity_id.in_(activity_ids),
        BudgetLog.type == "expense"
    ).all() if activity_ids else []
    total_used = sum(log.amount or 0 for log in logs)

    category_stats = {}
    for log in logs:
        cat = log.category or "其他"
        if cat not in category_stats:
            category_stats[cat] = {"planned": 0, "actual": 0}
        category_stats[cat]["planned"] += log.planned_amount or 0
        category_stats[cat]["actual"] += log.amount or 0

    quota = quota_service.get_by_year(db, year)

    return {
        "year": year,
        "yearly_quota": quota.quota if quota else total_planned,
        "total_planned": total_planned,
        "total_used": total_used,
        "total_remaining": total_planned - total_used,
        "utilization_rate": (total_used / total_planned * 100) if total_planned > 0 else 0,
        "budget_count": len(activities),
        "activity_count": len(activities),
        "by_category": category_stats,
        "category_stats": [
            {
                "category": category,
                "budget": values["planned"],
                "actual": values["actual"],
                "rate": (values["actual"] / values["planned"] * 100) if values["planned"] > 0 else 0,
            }
            for category, values in category_stats.items()
        ],
    }


# 活动预算列表
@router.get("/activities")
def get_budget_activities(
    year: str = Query(..., description="年份"),
    db: Session = Depends(get_db)
):
    """获取年度所有活动的预算"""
    from app.models.activity import Activity
    from app.models.budget import Budget

    activities = db.query(Activity).filter(Activity.year == year).all()

    result = []
    for activity in activities:
        budget = db.query(Budget).filter(Budget.activity_id == activity.id).first()
        result.append({
            "id": activity.id,
            "name": activity.name,
            "date": activity.date,
            "year": activity.year,
            "location": activity.location,
            "type": activity.type,
            "category": activity.category,
            "industry": activity.industry,
            "budget": activity.budget,
            "actual_spend": activity.actual_spend,
            "leads": activity.leads,
            "status": activity.status,
            "description": activity.description,
            "created_at": activity.created_at,
            "updated_at": activity.updated_at,
            "budget_record": budget,
        })

    return result


# ===== 带参数的路由（必须在最后） =====

# 预算主表
@router.get("/", response_model=List[BudgetResponse])
def list_budgets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    activity_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取预算列表"""
    if activity_id:
        budget = budget_service.get_by_activity(db, activity_id)
        return [budget] if budget else []
    if status:
        return budget_service.get_by_status(db, status, skip, limit)
    return budget_service.get_all(db, skip, limit)


@router.get("/{budget_id}", response_model=BudgetResponse)
def get_budget(budget_id: int, db: Session = Depends(get_db)):
    """获取预算详情"""
    budget = budget_service.get(db, budget_id)
    if not budget:
        raise BudgetException.not_found(budget_id=budget_id)
    return budget


@router.post("/", response_model=BudgetResponse)
def create_budget(data: BudgetCreate, db: Session = Depends(get_db)):
    """创建预算"""
    try:
        return budget_service.create(db, data.model_dump())
    except Exception as e:
        raise BudgetException.creation_failed(reason=str(e))


@router.put("/{budget_id}", response_model=BudgetResponse)
def update_budget(budget_id: int, data: BudgetUpdate, db: Session = Depends(get_db)):
    """更新预算"""
    budget = budget_service.update(db, budget_id, data.model_dump(exclude_unset=True))
    if not budget:
        raise BudgetException.not_found(budget_id=budget_id)
    return budget


# 预算明细
@router.get("/{budget_id}/items", response_model=List[BudgetItemResponse])
def list_budget_items(
    budget_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取预算明细"""
    return item_service.get_by_budget(db, budget_id, skip, limit)


@router.post("/items", response_model=BudgetItemResponse)
def create_budget_item(data: BudgetItemCreate, db: Session = Depends(get_db)):
    """创建预算明细"""
    return item_service.create(db, data.model_dump())


@router.put("/items/{item_id}", response_model=BudgetItemResponse)
def update_budget_item(item_id: int, data: BudgetItemUpdate, db: Session = Depends(get_db)):
    """更新预算明细"""
    item = item_service.update(db, item_id, data.model_dump(exclude_unset=True))
    if not item:
        raise BudgetException.item_not_found(item_id)
    return item


@router.put("/quotas/{quota_id}", response_model=YearlyQuotaResponse)
def update_quota(quota_id: int, data: YearlyQuotaUpdate, db: Session = Depends(get_db)):
    """更新年度配额"""
    quota = quota_service.update(db, quota_id, data.model_dump(exclude_unset=True))
    if not quota:
        raise BudgetException.quota_not_found()
    return quota


# 预算分析
@router.post("/analyze")
def analyze_budget(
    activity_id: int = Query(..., description="活动ID"),
    db: Session = Depends(get_db)
):
    """预算分析"""
    from app.models.activity import Activity
    from app.models.budget import Budget, BudgetItem

    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise ActivityException.not_found(activity_id)

    budget = db.query(Budget).filter(Budget.activity_id == activity_id).first()
    if not budget:
        return {
            "activity_id": activity_id,
            "has_budget": False,
            "message": "该活动暂无预算"
        }

    # 获取预算明细
    items = db.query(BudgetItem).filter(BudgetItem.budget_id == budget.id).all()

    # 计算超支项目
    over_budget_items = [item for item in items if (item.actual_amount or 0) > (item.planned_amount or 0)]

    # 计算执行率
    total_planned = sum(item.planned_amount or 0 for item in items)
    total_actual = sum(item.actual_amount or 0 for item in items)
    execution_rate = (total_actual / total_planned * 100) if total_planned > 0 else 0

    return {
        "activity_id": activity_id,
        "activity_name": activity.name,
        "has_budget": True,
        "total_budget": budget.total_amount,
        "total_planned": total_planned,
        "total_actual": total_actual,
        "remaining": budget.total_amount - budget.used_amount,
        "execution_rate": execution_rate,
        "over_budget_count": len(over_budget_items),
        "over_budget_items": [
            {
                "category": item.category,
                "planned": item.planned_amount,
                "actual": item.actual_amount,
                "overrun": item.actual_amount - item.planned_amount
            }
            for item in over_budget_items
        ] if over_budget_items else None,
        "items_count": len(items)
    }
