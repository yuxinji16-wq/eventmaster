"""
商机 API 路由
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.opportunity import OpportunityCreate, OpportunityUpdate, OpportunityResponse, OpportunityActivityLogResponse
from app.services.opportunity import OpportunityService
from app.core.errors import OpportunityException

router = APIRouter(prefix="/opportunities", tags=["商机"])
service = OpportunityService()


# 商机管道视图（必须在 /{id} 之前）
@router.get("/pipeline")
def get_opportunity_pipeline(db: Session = Depends(get_db)):
    """获取商机管道视图（按阶段分组）"""
    from app.models.opportunity import Opportunity

    opportunities = db.query(Opportunity).all()

    # 按状态分组
    pipeline = {
        "高意向": [],
        "中意向": [],
        "低意向": []
    }

    total_value = 0
    for opp in opportunities:
        status = opp.status or "低意向"
        if status in pipeline:
            pipeline[status].append({
                "id": opp.id,
                "client_name": opp.client_name,
                "company": opp.company,
                "estimated_value": opp.estimated_value,
                "contact": opp.contact,
                "expected_close_date": opp.expected_close_date
            })
        total_value += opp.estimated_value or 0

    return {
        "stages": pipeline,
        "counts": {
            "高意向": len(pipeline["高意向"]),
            "中意向": len(pipeline["中意向"]),
            "低意向": len(pipeline["低意向"])
        },
        "total_value": total_value
    }


@router.get("/", response_model=List[OpportunityResponse])
def list_opportunities(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    status: Optional[str] = None,
    activity_id: Optional[int] = None,
    keyword: Optional[str] = None,
    high_intent: bool = False,
    db: Session = Depends(get_db)
):
    """获取商机列表"""
    if high_intent:
        return service.get_high_intent(db, skip, limit)
    if status:
        return service.get_by_status(db, status, skip, limit)
    if activity_id:
        return service.get_by_activity(db, activity_id, skip, limit)
    if keyword:
        return service.search(db, keyword, skip, limit)
    return service.get_all(db, skip, limit)


@router.get("/{opportunity_id}", response_model=OpportunityResponse)
def get_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    """获取商机详情"""
    opportunity = service.get(db, opportunity_id)
    if not opportunity:
        raise OpportunityException.not_found(opportunity_id)
    return opportunity


@router.get("/{opportunity_id}/logs", response_model=List[OpportunityActivityLogResponse])
def get_opportunity_logs(opportunity_id: int, db: Session = Depends(get_db)):
    """获取商机操作记录"""
    from app.models.opportunity import OpportunityActivityLog
    return db.query(OpportunityActivityLog).filter(
        OpportunityActivityLog.opportunity_id == opportunity_id
    ).order_by(OpportunityActivityLog.created_at.desc()).all()


@router.post("/", response_model=OpportunityResponse)
def create_opportunity(data: OpportunityCreate, db: Session = Depends(get_db)):
    """创建商机"""
    try:
        payload = data.model_dump()
        if not payload.get("status") or payload.get("status") == "潜在客户":
            payload["status"] = "未跟进"
        opportunity = service.create(db, payload)
        from app.models.opportunity import OpportunityActivityLog
        db.add(OpportunityActivityLog(
            opportunity_id=opportunity.id,
            action="创建线索",
            to_value=opportunity.status,
        ))
        db.commit()
        db.refresh(opportunity)
        return opportunity
    except Exception as e:
        raise OpportunityException.creation_failed(reason=str(e))


@router.put("/{opportunity_id}", response_model=OpportunityResponse)
def update_opportunity(opportunity_id: int, data: OpportunityUpdate, db: Session = Depends(get_db)):
    """更新商机"""
    old = service.get(db, opportunity_id)
    old_status = old.status if old else None
    payload = data.model_dump(exclude_unset=True)
    opportunity = service.update(db, opportunity_id, payload)
    if not opportunity:
        raise OpportunityException.not_found(opportunity_id)
    if "status" in payload and payload["status"] != old_status:
        from app.models.opportunity import OpportunityActivityLog
        db.add(OpportunityActivityLog(
            opportunity_id=opportunity_id,
            action="状态变更",
            from_value=old_status,
            to_value=payload["status"],
        ))
        db.commit()
        db.refresh(opportunity)
    return opportunity


@router.delete("/{opportunity_id}")
def delete_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    """删除商机"""
    from app.models.opportunity import OpportunityActivityLog
    db.query(OpportunityActivityLog).filter(
        OpportunityActivityLog.opportunity_id == opportunity_id
    ).delete(synchronize_session=False)
    db.commit()
    if not service.delete(db, opportunity_id):
        raise OpportunityException.not_found(opportunity_id)
    return {"message": "删除成功", "code": "E0000"}


@router.post("/{opportunity_id}/convert")
def convert_opportunity(opportunity_id: int, db: Session = Depends(get_db)):
    """转化商机为客户"""
    opportunity = service.convert_to_customer(db, opportunity_id)
    if not opportunity:
        raise OpportunityException.not_found(opportunity_id)
    return opportunity
