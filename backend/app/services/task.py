"""
任务 Service
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.task import Task
from app.repositories.task import TaskRepository
from app.services.base import BaseService
from app.core.errors import ActivityException


class TaskService(BaseService[Task, TaskRepository]):
    """任务Service"""

    def __init__(self):
        super().__init__(TaskRepository())

    def get_by_activity(self, db: Session, activity_id: int) -> List[Task]:
        """获取活动的所有任务"""
        return self.repository.get_by_activity(db, activity_id)

    def get_by_status(self, db: Session, activity_id: int, status: str) -> List[Task]:
        """获取指定状态的任务"""
        return self.repository.get_by_activity_and_status(db, activity_id, status)

    def get_by_priority(self, db: Session, activity_id: int, priority: str) -> List[Task]:
        """获取指定优先级的任务"""
        return self.repository.get_by_priority(db, activity_id, priority)

    def get_overdue(self, db: Session, activity_id: int) -> List[Task]:
        """获取逾期的任务"""
        return self.repository.get_overdue_tasks(db, activity_id)

    def create_task(self, db: Session, data: dict) -> Task:
        """创建任务"""
        return self.repository.create(db, data)

    def batch_create(self, db: Session, tasks_data: List[dict]) -> List[Task]:
        """批量创建任务"""
        return [self.repository.create(db, task_data) for task_data in tasks_data]

    def update_task(self, db: Session, task_id: int, data: dict) -> Optional[Task]:
        """更新任务"""
        return self.repository.update(db, task_id, data)

    def delete_task(self, db: Session, task_id: int) -> bool:
        """删除任务"""
        return self.repository.delete(db, task_id)

    def delete_by_activity(self, db: Session, activity_id: int) -> int:
        """删除活动的所有任务"""
        return self.repository.delete_by_activity(db, activity_id)

    def update_status(self, db: Session, task_id: int, status: str) -> Optional[Task]:
        """更新任务状态"""
        return self.repository.update(db, task_id, {"status": status})
