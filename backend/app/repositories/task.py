"""
任务 Repository
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.task import Task
from app.repositories.base import BaseRepository


class TaskRepository(BaseRepository[Task]):
    """任务Repository"""

    def __init__(self):
        self.model = Task

    def get_by_activity(self, db: Session, activity_id: int) -> List[Task]:
        """根据活动ID获取所有任务"""
        return db.query(Task).filter(Task.activity_id == activity_id).order_by(Task.created_at.desc()).all()

    def get_by_activity_and_status(self, db: Session, activity_id: int, status: str) -> List[Task]:
        """根据活动ID和状态获取任务"""
        return db.query(Task).filter(
            Task.activity_id == activity_id,
            Task.status == status
        ).all()

    def get_by_priority(self, db: Session, activity_id: int, priority: str) -> List[Task]:
        """根据活动ID和优先级获取任务"""
        return db.query(Task).filter(
            Task.activity_id == activity_id,
            Task.priority == priority
        ).all()

    def get_overdue_tasks(self, db: Session, activity_id: int) -> List[Task]:
        """获取已逾期的任务"""
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        return db.query(Task).filter(
            Task.activity_id == activity_id,
            Task.status != "已完成",
            Task.due_date < today
        ).all()

    def delete_by_activity(self, db: Session, activity_id: int) -> int:
        """删除活动的所有任务"""
        count = db.query(Task).filter(Task.activity_id == activity_id).delete()
        db.commit()
        return count
