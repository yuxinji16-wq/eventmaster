"""
活动 API 路由
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse
from app.services.activity import ActivityService
from app.core.errors import ActivityException

router = APIRouter(prefix="/activities", tags=["活动"])
service = ActivityService()


# ===== 特殊端点（必须在 /{id} 之前） =====

# 活动统计摘要
@router.get("/summary/stats")
def get_activities_summary(db: Session = Depends(get_db)):
    """获取活动统计"""
    return service.get_activities_summary(db)


@router.get("/summary/task-status")
def get_activities_task_summary(db: Session = Depends(get_db)):
    """获取活动任务摘要，用于活动卡片同步执行进度"""
    from app.models.task import Task
    from sqlalchemy import case, func

    rows = db.query(
        Task.activity_id,
        func.count(Task.id).label("task_count"),
        func.sum(case((Task.status == "已完成", 1), else_=0)).label("completed_task_count"),
    ).group_by(Task.activity_id).all()

    return {
        str(row.activity_id): {
            "task_count": row.task_count or 0,
            "completed_task_count": row.completed_task_count or 0,
        }
        for row in rows
    }


# AI生成活动洞察
@router.post("/{activity_id}/generate-insight")
def generate_activity_insight(activity_id: int, db: Session = Depends(get_db)):
    """生成活动AI洞察"""
    activity = service.get(db, activity_id)
    if not activity:
        raise ActivityException.not_found(activity_id)

    # 简单分析逻辑（实际项目中可调用AI服务）
    budget_efficiency = 0
    if activity.budget and activity.budget > 0:
        budget_efficiency = ((activity.budget - (activity.actual_spend or 0)) / activity.budget) * 100

    insights = []

    # 预算分析
    if activity.actual_spend and activity.budget:
        if budget_efficiency > 10:
            insights.append(f"预算执行良好，节余{budget_efficiency:.1f}%")
        elif budget_efficiency < 0:
            insights.append(f"预算超支{-budget_efficiency:.1f}%")

    # 转化分析
    if activity.leads and activity.leads > 0 and activity.budget:
        cost_per_lead = activity.budget / activity.leads
        insights.append(f"获客成本¥{cost_per_lead:.0f}/人")

    # 状态分析
    if activity.status == "已完成" and not activity.actual_spend:
        insights.append("活动已完成但未记录实际支出")

    return {
        "activity_id": activity_id,
        "activity_name": activity.name,
        "insights": insights if insights else ["数据不足，无法生成洞察"],
        "metrics": {
            "budget": activity.budget,
            "actual_spend": activity.actual_spend,
            "leads": activity.leads,
            "budget_efficiency": budget_efficiency,
            "cost_per_lead": (activity.budget / activity.leads) if activity.leads else 0
        }
    }


@router.get("/", response_model=List[ActivityResponse])
def list_activities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    year: Optional[str] = None,
    status: Optional[str] = None,
    keyword: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取活动列表"""
    if keyword:
        return service.search(db, keyword, skip, limit)
    if year:
        return service.get_by_year(db, year, skip, limit)
    if status:
        return service.get_by_status(db, status, skip, limit)
    return service.get_all(db, skip, limit)


@router.get("/{activity_id}", response_model=ActivityResponse)
def get_activity(activity_id: int, db: Session = Depends(get_db)):
    """获取活动详情"""
    activity = service.get(db, activity_id)
    if not activity:
        raise ActivityException.not_found(activity_id)
    return activity


@router.post("/", response_model=ActivityResponse)
def create_activity(data: ActivityCreate, db: Session = Depends(get_db)):
    """创建活动"""
    try:
        return service.create_activity(db, data.model_dump())
    except Exception as e:
        raise ActivityException.creation_failed(reason=str(e))


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(activity_id: int, data: ActivityUpdate, db: Session = Depends(get_db)):
    """更新活动"""
    activity = service.update_activity(db, activity_id, data.model_dump(exclude_unset=True))
    if not activity:
        raise ActivityException.not_found(activity_id)
    return activity


@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """删除活动"""
    if not service.delete_activity(db, activity_id):
        raise ActivityException.not_found(activity_id)
    return {"message": "删除成功", "code": "E0000"}
