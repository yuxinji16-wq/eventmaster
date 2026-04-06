"""
仪表盘 API 路由
"""
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db.session import get_db

router = APIRouter(prefix="/dashboard", tags=["仪表盘"])


@router.get("/stats")
def get_dashboard_stats(
    year: str = Query("2026", description="年份"),
    db: Session = Depends(get_db)
):
    """获取仪表盘统计数据"""
    from app.models.activity import Activity
    from app.models.opportunity import Opportunity
    from app.models.budget import Budget, BudgetItem
    from app.models.review import Review

    # 活动统计
    activities = db.query(Activity).filter(Activity.year == year).all()
    total_activities = len(activities)
    completed_activities = len([a for a in activities if a.status == "已完成"])
    ongoing_activities = len([a for a in activities if a.status == "进行中"])

    # 预算统计
    budgets = db.query(Budget).join(Activity).filter(Activity.year == year).all()
    total_budget = sum(b.total_amount for b in budgets)
    used_budget = sum(b.used_amount for b in budgets)

    # 商机统计
    opportunities = db.query(Opportunity).all()
    high_intent = len([o for o in opportunities if o.status == "高意向"])
    total_value = sum(o.estimated_value for o in opportunities if o.estimated_value)

    # 复盘统计
    reviews = db.query(Review).join(Activity).filter(Activity.year == year).all()
    completed_reviews = len([r for r in reviews if r.status == "已完成"])

    # 按月统计活动
    monthly_stats = {}
    for activity in activities:
        if activity.date:
            month = activity.date[:7] if len(activity.date) >= 7 else "未知"
            if month not in monthly_stats:
                monthly_stats[month] = {"count": 0, "budget": 0, "actual_spend": 0}
            monthly_stats[month]["count"] += 1
            monthly_stats[month]["budget"] += activity.budget or 0
            monthly_stats[month]["actual_spend"] += activity.actual_spend or 0

    return {
        "year": year,
        "activities": {
            "total": total_activities,
            "completed": completed_activities,
            "ongoing": ongoing_activities,
            "by_status": {
                "待启动": len([a for a in activities if a.status == "待启动"]),
                "进行中": ongoing_activities,
                "已完成": completed_activities,
                "已取消": len([a for a in activities if a.status == "已取消"]),
            }
        },
        "budget": {
            "total": total_budget,
            "used": used_budget,
            "remaining": total_budget - used_budget,
            "utilization_rate": (used_budget / total_budget * 100) if total_budget > 0 else 0
        },
        "opportunities": {
            "total": len(opportunities),
            "high_intent": high_intent,
            "total_value": total_value
        },
        "reviews": {
            "total": len(reviews),
            "completed": completed_reviews,
            "pending": len(reviews) - completed_reviews
        },
        "monthly": monthly_stats
    }
