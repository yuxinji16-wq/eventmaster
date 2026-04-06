"""
活动 Repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.activity import Activity
from app.repositories.base import BaseRepository


class ActivityRepository(BaseRepository[Activity]):
    """活动Repository"""

    def __init__(self):
        self.model = Activity

    def get_by_name(self, db: Session, name: str) -> Optional[Activity]:
        """根据名称查询活动"""
        return db.query(Activity).filter(Activity.name == name).first()

    def get_by_year(self, db: Session, year: str, skip: int = 0, limit: int = 100) -> List[Activity]:
        """根据年份查询活动"""
        return db.query(Activity).filter(Activity.year == year).offset(skip).limit(limit).all()

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Activity]:
        """根据状态查询活动"""
        return db.query(Activity).filter(Activity.status == status).offset(skip).limit(limit).all()

    def search(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Activity]:
        """搜索活动（名称、地点、描述）"""
        query = db.query(Activity)
        if keyword:
            keyword_filter = f"%{keyword}%"
            query = query.filter(
                or_(
                    Activity.name.ilike(keyword_filter),
                    Activity.location.ilike(keyword_filter),
                    Activity.description.ilike(keyword_filter)
                )
            )
        return query.offset(skip).limit(limit).all()

    def get_multi_by_ids(self, db: Session, ids: List[int]) -> List[Activity]:
        """根据ID列表批量获取活动"""
        return db.query(Activity).filter(Activity.id.in_(ids)).all()
