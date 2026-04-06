"""
活动管理 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Activity
from schemas import (
    ActivityCreate, 
    ActivityUpdate, 
    ActivityResponse,
    ActivityDetailResponse,
    MarketingInsightResponse
)
from services.ai_service import get_marketing_insight

router = APIRouter(prefix="/activities", tags=["活动管理"])


@router.get("/", response_model=dict)
def get_activities(
    year: Optional[str] = None,
    category: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    db: Session = Depends(get_db)
):
    """获取活动列表"""
    query = db.query(Activity)
    
    if year:
        query = query.filter(Activity.year == year)
    if category:
        query = query.filter(Activity.category == category)
    if status:
        query = query.filter(Activity.status == status)
    if search:
        query = query.filter(
            (Activity.name.contains(search)) | 
            (Activity.description.contains(search))
        )
    
    total = query.count()
    activities = query.order_by(Activity.created_at.desc()).offset(
        (page - 1) * page_size
    ).limit(page_size).all()
    
    return {
        "activities": activities,
        "total": total,
        "page": page,
        "page_size": page_size
    }


@router.get("/{activity_id}", response_model=ActivityDetailResponse)
def get_activity_detail(activity_id: int, db: Session = Depends(get_db)):
    """获取活动详情"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    return activity


@router.post("/", response_model=ActivityResponse)
def create_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    """创建活动"""
    year = str(activity.date.year)
    
    db_activity = Activity(
        **activity.model_dump(),
        year=year,
        actual_spend=0
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    
    return db_activity


@router.put("/{activity_id}", response_model=ActivityResponse)
def update_activity(
    activity_id: int, 
    activity_update: ActivityUpdate, 
    db: Session = Depends(get_db)
):
    """更新活动"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    update_data = activity_update.model_dump(exclude_unset=True)
    
    if 'date' in update_data:
        update_data['year'] = str(update_data['date'].year)
    
    for key, value in update_data.items():
        setattr(activity, key, value)
    
    activity.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(activity)
    
    return activity


@router.delete("/{activity_id}")
def delete_activity(activity_id: int, db: Session = Depends(get_db)):
    """删除活动"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    db.delete(activity)
    db.commit()
    
    return {"message": "活动删除成功"}


@router.post("/{activity_id}/generate-insight", response_model=MarketingInsightResponse)
def generate_activity_insight(
    activity_id: int, 
    db: Session = Depends(get_db)
):
    """生成AI洞察"""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="活动不存在")
    
    prompt = f"""
    分析活动: {activity.name}
    预算: {activity.budget}
    实际支出: {activity.actual_spend}
    获客数: {activity.leads}
    类型: {activity.type}
    
    请给出执行评价和改进建议。
    """
    
    insight = get_marketing_insight(prompt)
    
    return {"insight": insight}
