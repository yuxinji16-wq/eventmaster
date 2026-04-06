"""
商机转化 API
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from database import get_db
from models import Opportunity
from schemas import (
    OpportunityCreate, 
    OpportunityUpdate, 
    OpportunityResponse,
    PipelineStatsResponse
)

router = APIRouter(prefix="/opportunities", tags=["商机转化"])

STAGES = ['初步接触', '方案报价', '商务谈判', '赢单关闭']


@router.get("/", response_model=dict)
def get_opportunities(
    stage: Optional[str] = None,
    activity_id: Optional[int] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取商机列表"""
    query = db.query(Opportunity)
    
    if stage:
        query = query.filter(Opportunity.stage == stage)
    if activity_id:
        query = query.filter(Opportunity.activity_id == activity_id)
    if search:
        query = query.filter(Opportunity.client_name.contains(search))
    
    opportunities = query.order_by(Opportunity.created_at.desc()).all()
    
    # 统计
    total_value = sum(o.value for o in opportunities)
    
    stage_stats = {}
    for stage in STAGES:
        stage_ops = [o for o in opportunities if o.stage == stage]
        stage_stats[stage] = {
            "count": len(stage_ops),
            "total_value": sum(o.value for o in stage_ops)
        }
    
    return {
        "opportunities": opportunities,
        "total": len(opportunities),
        "total_value": total_value,
        "stats": stage_stats
    }


@router.get("/pipeline", response_model=PipelineStatsResponse)
def get_pipeline_stats(db: Session = Depends(get_db)):
    """获取漏斗统计"""
    opportunities = db.query(Opportunity).all()
    
    total_value = sum(o.value for o in opportunities)
    
    stages = []
    for stage in STAGES:
        stage_ops = [o for o in opportunities if o.stage == stage]
        stages.append({
            "stage": stage,
            "count": len(stage_ops),
            "total_value": sum(o.value for o in stage_ops)
        })
    
    # 计算转化率
    conversion_rates = []
    for i in range(len(STAGES) - 1):
        from_count = len([o for o in opportunities if o.stage == STAGES[i]])
        to_count = len([o for o in opportunities if o.stage == STAGES[i + 1]])
        rate = (to_count / from_count * 100) if from_count > 0 else 0
        conversion_rates.append({
            "from": STAGES[i],
            "to": STAGES[i + 1],
            "rate": round(rate, 1)
        })
    
    return {
        "total_value": total_value,
        "stages": stages,
        "conversion_rates": conversion_rates
    }


@router.post("/", response_model=OpportunityResponse)
def create_opportunity(
    opportunity_data: OpportunityCreate,
    db: Session = Depends(get_db)
):
    """创建商机"""
    db_opportunity = Opportunity(**opportunity_data.model_dump())
    db.add(db_opportunity)
    db.commit()
    db.refresh(db_opportunity)
    
    return db_opportunity


@router.put("/{opportunity_id}", response_model=OpportunityResponse)
def update_opportunity(
    opportunity_id: int,
    opportunity_update: OpportunityUpdate,
    db: Session = Depends(get_db)
):
    """更新商机"""
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="商机不存在")
    
    update_data = opportunity_update.model_dump(exclude_unset=True)
    
    for key, value in update_data.items():
        setattr(opportunity, key, value)
    
    opportunity.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(opportunity)
    
    return opportunity


@router.delete("/{opportunity_id}")
def delete_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    """删除商机"""
    opportunity = db.query(Opportunity).filter(
        Opportunity.id == opportunity_id
    ).first()
    if not opportunity:
        raise HTTPException(status_code=404, detail="商机不存在")
    
    db.delete(opportunity)
    db.commit()
    
    return {"message": "删除成功"}
