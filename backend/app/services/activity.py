"""
活动 Service
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.activity import Activity
from app.repositories.activity import ActivityRepository
from app.services.base import BaseService


class ActivityService(BaseService[Activity, ActivityRepository]):
    """活动Service"""

    def __init__(self):
        super().__init__(ActivityRepository())

    def get_by_name(self, db: Session, name: str) -> Optional[Activity]:
        return self.repository.get_by_name(db, name)

    def get_by_year(self, db: Session, year: str, skip: int = 0, limit: int = 100) -> List[Activity]:
        return self.repository.get_by_year(db, year, skip, limit)

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Activity]:
        return self.repository.get_by_status(db, status, skip, limit)

    def search(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Activity]:
        return self.repository.search(db, keyword, skip, limit)

    def get_detail(self, db: Session, id: int) -> Optional[Activity]:
        """获取活动详情（包含关联数据）"""
        return self.repository.get(db, id)

    def create_activity(self, db: Session, data: dict) -> Activity:
        """创建活动"""
        return self.repository.create(db, data)

    def update_activity(self, db: Session, id: int, data: dict) -> Optional[Activity]:
        """更新活动"""
        return self.repository.update(db, id, data)

    def delete_activity(self, db: Session, id: int) -> bool:
        """删除活动"""
        return self.repository.delete(db, id)

    def get_activities_summary(self, db: Session) -> dict:
        """获取活动统计摘要"""
        total = self.repository.count(db)
        by_status = {}
        for status in ["待启动", "进行中", "已完成", "已取消"]:
            by_status[status] = len(self.repository.get_by_status(db, status))
        return {"total": total, "by_status": by_status}
