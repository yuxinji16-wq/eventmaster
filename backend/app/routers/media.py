"""
媒体与传播 API 路由
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.media import (
    MediaRecordCreate, MediaRecordUpdate, MediaRecordResponse,
    PremiumResourceCreate, PremiumResourceUpdate, PremiumResourceResponse,
    MediaStatsResponse
)
from app.services.media import MediaRecordService, PremiumResourceService, MediaService

router = APIRouter(prefix="/media", tags=["媒体与传播"])
media_record_service = MediaRecordService()
premium_resource_service = PremiumResourceService()
media_service = MediaService()


# ============ 媒体记录 API ============

@router.get("/activity/{activity_id}", response_model=List[MediaRecordResponse])
def get_media_records_by_activity(
    activity_id: int,
    category: Optional[str] = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取活动的所有媒体记录"""
    if category:
        return media_record_service.get_by_activity_and_category(db, activity_id, category)
    return media_record_service.get_by_activity(db, activity_id, skip, limit)


@router.get("/activity/{activity_id}/stats", response_model=MediaStatsResponse)
def get_media_stats_by_activity(activity_id: int, db: Session = Depends(get_db)):
    """获取活动的媒体与传播统计汇总"""
    return media_service.get_full_stats(db, activity_id)


@router.get("/{media_id}", response_model=MediaRecordResponse)
def get_media_record(media_id: int, db: Session = Depends(get_db)):
    """获取媒体记录详情"""
    record = media_record_service.get(db, media_id)
    if not record:
        from app.core.errors import ActivityException
        raise ActivityException.not_found(f"媒体记录 {media_id}")
    return record


@router.post("/", response_model=MediaRecordResponse)
def create_media_record(data: MediaRecordCreate, db: Session = Depends(get_db)):
    """创建媒体记录"""
    try:
        payload = data.model_dump()
        return media_record_service.create(db, payload)
    except Exception as e:
        from app.core.errors import ActivityException
        raise ActivityException.creation_failed(reason=str(e))


@router.put("/{media_id}", response_model=MediaRecordResponse)
def update_media_record(media_id: int, data: MediaRecordUpdate, db: Session = Depends(get_db)):
    """更新媒体记录"""
    payload = data.model_dump(exclude_unset=True)
    record = media_record_service.update(db, media_id, payload)
    if not record:
        from app.core.errors import ActivityException
        raise ActivityException.not_found(f"媒体记录 {media_id}")
    return record


@router.delete("/{media_id}")
def delete_media_record(media_id: int, db: Session = Depends(get_db)):
    """删除媒体记录"""
    if not media_record_service.delete(db, media_id):
        from app.core.errors import ActivityException
        raise ActivityException.not_found(f"媒体记录 {media_id}")
    return {"message": "删除成功", "code": "E0000"}


# ============ 溢价资源 API ============

@router.get("/premium/activity/{activity_id}", response_model=PremiumResourceResponse)
def get_premium_resource(activity_id: int, db: Session = Depends(get_db)):
    """获取活动的溢价资源"""
    resource = premium_resource_service.get_by_activity(db, activity_id)
    if not resource:
        from app.core.errors import ActivityException
        raise ActivityException.not_found(f"溢价资源")
    return resource


@router.post("/premium", response_model=PremiumResourceResponse)
def create_or_update_premium_resource(data: PremiumResourceCreate, db: Session = Depends(get_db)):
    """创建或更新溢价资源"""
    try:
        payload = data.model_dump(exclude_unset=True)
        return premium_resource_service.create_or_update(db, data.activity_id, payload)
    except Exception as e:
        from app.core.errors import ActivityException
        raise ActivityException.creation_failed(reason=str(e))


@router.put("/premium/activity/{activity_id}", response_model=PremiumResourceResponse)
def update_premium_resource(activity_id: int, data: PremiumResourceUpdate, db: Session = Depends(get_db)):
    """更新溢价资源"""
    payload = data.model_dump(exclude_unset=True)
    resource = premium_resource_service.create_or_update(db, activity_id, payload)
    if not resource:
        from app.core.errors import ActivityException
        raise ActivityException.not_found(f"溢价资源")
    return resource
