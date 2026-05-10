"""
媒体与传播 Service
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.media import MediaRecord, PremiumResource
from app.repositories.media import MediaRecordRepository, PremiumResourceRepository
from app.services.base import BaseService
from app.schemas.media import MediaStats, MediaRecordCreate, PremiumResourceCreate


class MediaRecordService(BaseService[MediaRecord, MediaRecordRepository]):
    """媒体记录Service"""

    def __init__(self):
        super().__init__(MediaRecordRepository())

    def get_by_activity(
        self, db: Session, activity_id: int, skip: int = 0, limit: int = 100
    ) -> List[MediaRecord]:
        return self.repository.get_by_activity(db, activity_id, skip, limit)

    def get_by_activity_and_category(
        self, db: Session, activity_id: int, category: str
    ) -> List[MediaRecord]:
        return self.repository.get_by_activity_and_category(db, activity_id, category)

    def get_stats_by_activity(self, db: Session, activity_id: int) -> dict:
        """获取活动的媒体统计数据"""
        stats = self.repository.get_stats_by_activity(db, activity_id)
        return stats

    def create(self, db: Session, obj_in: dict) -> MediaRecord:
        """创建媒体记录"""
        return self.repository.create(db, obj_in)

    def update(self, db: Session, id: int, obj_in: dict) -> Optional[MediaRecord]:
        """更新媒体记录"""
        return self.repository.update(db, id, obj_in)


class PremiumResourceService(BaseService[PremiumResource, PremiumResourceRepository]):
    """溢价资源Service"""

    def __init__(self):
        super().__init__(PremiumResourceRepository())

    def get_by_activity(self, db: Session, activity_id: int) -> Optional[PremiumResource]:
        return self.repository.get_by_activity(db, activity_id)

    def create_or_update(self, db: Session, activity_id: int, obj_in: dict) -> PremiumResource:
        return self.repository.create_or_update(db, activity_id, obj_in)


class MediaService:
    """媒体与传播综合Service - 整合统计和数据"""

    def __init__(self):
        self.media_record_service = MediaRecordService()
        self.premium_resource_service = PremiumResourceService()

    def get_full_stats(
        self, db: Session, activity_id: int
    ) -> dict:
        """
        获取完整的媒体与传播统计数据
        包含：媒体记录列表、统计汇总、溢价资源
        """
        # 获取媒体记录
        media_records = self.media_record_service.get_by_activity(db, activity_id)

        # 获取统计
        stats = self.media_record_service.get_stats_by_activity(db, activity_id)

        # 计算传播效果评分（0-100）
        effectiveness_score = self._calculate_effectiveness_score(stats)
        stats["effectiveness_score"] = effectiveness_score
        stats["activity_id"] = activity_id

        # 获取溢价资源
        premium_resource = self.premium_resource_service.get_by_activity(db, activity_id)

        # 溢价资源统计
        if premium_resource:
            stats.update({
                "premium_has_official_interview": premium_resource.has_official_interview,
                "premium_has_industry_coverage": premium_resource.has_industry_coverage,
                "premium_has_award_participation": premium_resource.has_award_participation,
                "premium_has_contact_list": premium_resource.has_contact_list,
                "premium_has_whitepaper": premium_resource.has_whitepaper,
            })
        else:
            stats.update({
                "premium_has_official_interview": "否",
                "premium_has_industry_coverage": "否",
                "premium_has_award_participation": "否",
                "premium_has_contact_list": "否",
                "premium_has_whitepaper": "否",
            })

        return {
            "stats": stats,
            "media_records": media_records,
            "premium_resource": premium_resource,
        }

    def _calculate_effectiveness_score(self, stats: dict) -> float:
        """
        计算传播效果评分
        基于：曝光量(40%) + 互动量(30%) + 内容数量(20%) + 重点媒体(10%)
        """
        # 曝光评分（最高40分）
        views_score = min(40, stats.get("total_views", 0) / 1000 * 10)

        # 互动评分（最高30分）
        interactions_score = min(30, stats.get("total_interactions", 0) / 100 * 5)

        # 内容数量评分（最高20分）
        content_count = stats.get("total_record_count", 0)
        content_score = min(20, content_count * 4)

        # 重点媒体评分（最高10分）
        key_media_count = stats.get("key_media_count", 0)
        key_media_score = min(10, key_media_count * 5)

        total_score = views_score + interactions_score + content_score + key_media_score
        return round(total_score, 1)
