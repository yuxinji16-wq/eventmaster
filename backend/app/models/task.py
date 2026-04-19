"""
任务模型
"""
from sqlalchemy import Column, String, Integer, Text, ForeignKey
from app.db.base import Base, TimestampMixin


class Task(Base, TimestampMixin):
    """活动任务模型"""
    __tablename__ = "tasks"

    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    assignee = Column(String(100))
    due_date = Column(String(20))
    priority = Column(String(10), default="P2")  # P0, P1, P2
    status = Column(String(20), default="未开始")  # 未开始, 进行中, 已完成, 阻塞
