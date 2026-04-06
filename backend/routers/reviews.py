"""
活动复盘 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Activity
from schemas import ReviewSummaryResponse, GenerateSummaryResponse
from services.ai_service import summarize_review

router = APIRouter(prefix="/reviews", tags=["活动复盘"])


@router.get("/activities", response_model=List[dict])
def get_review_activities(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取可复盘的活动列表"""
    query = db.query(Activity)
    
    if status:
        query = query.filter(Activity.status == status)
    else:
        query = query.filter(Activity.status == '已完成')
    
    activities = []
    for a in query.all():
        activities.append({
            "id": a.id,
            "name": a.name,
            "type": a.type,
            "date": a.date,
            "budget": a.budget,
            "actual_spend": a.actual_spend,
            "leads": a.leads
        })
    
    return activities


@router.get("/{activity_id}", response_model=ReviewSummaryResponse)
def get_review_summary(activity_id: int, db: Session = Depends(get_db)):
    """获取复盘摘要"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    budget_efficiency = (activity.actual_spend / activity.budget * 100) if activity.budget > 0 else 0
    cpl = activity.actual_spend / activity.leads if activity.leads > 0 else 0
    roi = activity.leads * 1000 / activity.actual_spend if activity.actual_spend > 0 else 0  # 估算
    
    return {
        "budget_efficiency": round(budget_efficiency, 1),
        "cpl": round(cpl, 0),
        "roi": round(roi, 2)
    }


@router.post("/generate-summary", response_model=GenerateSummaryResponse)
def generate_summary(event_data: dict, db: Session = Depends(get_db)):
    """生成AI复盘摘要"""
    insight = summarize_review(event_data)
    
    # 解析AI返回的内容
    core_achievements = []
    deficiencies = []
    recommendations = []
    
    return {
        "summary": {
            "core_achievements": core_achievements,
            "deficiencies": deficiencies,
            "recommendations": recommendations
        },
        "insight": insight
    }


@router.post("/{activity_id}/generate-summary")
def generate_activity_summary(activity_id: int, db: Session = Depends(get_db)):
    """为活动生成AI复盘摘要"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    event_data = {
        "name": activity.name,
        "budget": activity.budget,
        "actual_spend": activity.actual_spend,
        "leads": activity.leads,
        "type": activity.type
    }
    
    insight = summarize_review(event_data)
    
    return {
        "activity_id": activity_id,
        "insight": insight
    }
