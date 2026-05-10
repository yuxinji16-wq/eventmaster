"""
媒体与传播 Repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.media import MediaRecord, PremiumResource
from app.repositories.base import BaseRepository


class MediaRecordRepository(BaseRepository[MediaRecord]):
    """媒体记录Repository"""

    def __init__(self):
        self.model = MediaRecord

    def get_by_activity(self, db: Session, activity_id: int, skip: int = 0, limit: int = 100) -> List[MediaRecord]:
        """根据活动获取所有媒体记录"""
        return db.query(MediaRecord).filter(
            MediaRecord.activity_id == activity_id
        ).order_by(MediaRecord.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_activity_and_category(
        self, db: Session, activity_id: int, category: str
    ) -> List[MediaRecord]:
        """根据活动和分类获取媒体记录"""
        return db.query(MediaRecord).filter(
            MediaRecord.activity_id == activity_id,
            MediaRecord.category == category
        ).order_by(MediaRecord.created_at.desc()).all()

    def get_stats_by_activity(self, db: Session, activity_id: int) -> dict:
        """获取活动的媒体统计数据"""
        records = db.query(MediaRecord).filter(MediaRecord.activity_id == activity_id).all()

        total_views = sum(r.views or 0 for r in records)
        total_interactions = sum(r.interactions or 0 for r in records)
        total_likes = sum(r.likes or 0 for r in records)
        total_comments = sum(r.comments or 0 for r in records)
        total_shares = sum(r.shares or 0 for r in records)

        media_records = [r for r in records if r.category == "media_coop"]
        content_records = [r for r in records if r.category == "content_pub"]
        key_media_records = [r for r in records if r.is_key_media == "是"]

        return {
            "total_media_count": len(media_records),
            "total_content_count": len(content_records),
            "total_record_count": len(records),
            "total_views": total_views,
            "total_interactions": total_interactions,
            "total_likes": total_likes,
            "total_comments": total_comments,
            "total_shares": total_shares,
            "key_media_count": len(key_media_records),
        }

    def count_by_activity(self, db: Session, activity_id: int) -> int:
        """统计活动的媒体记录数量"""
        return db.query(MediaRecord).filter(MediaRecord.activity_id == activity_id).count()


class PremiumResourceRepository(BaseRepository[PremiumResource]):
    """溢价资源Repository"""

    def __init__(self):
        self.model = PremiumResource

    def get_by_activity(self, db: Session, activity_id: int) -> Optional[PremiumResource]:
        """根据活动获取溢价资源"""
        return db.query(PremiumResource).filter(
            PremiumResource.activity_id == activity_id
        ).first()

    def create_or_update(self, db: Session, activity_id: int, obj_in: dict) -> PremiumResource:
        """创建或更新溢价资源"""
        existing = self.get_by_activity(db, activity_id)
        if existing:
            for key, value in obj_in.items():
                if value is not None:
                    setattr(existing, key, value)
            db.commit()
            db.refresh(existing)
            return existing
        else:
            obj_in["activity_id"] = activity_id
            return self.create(db, obj_in)
