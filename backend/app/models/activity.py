"""
活动模型
"""
from sqlalchemy import Column, String, Float, Integer, Text
from app.db.base import Base, TimestampMixin


class Activity(Base, TimestampMixin):
    """活动模型"""
    __tablename__ = "activities"

    name = Column(String(200), nullable=False, index=True)
    date = Column(String(20), nullable=False)
    year = Column(String(4), nullable=False, index=True)
    location = Column(String(200))
    type = Column(String(50))  # Exhibition, Conference, Webinar, Roadshow
    category = Column(String(50))  # 自办活动, 外部市场活动
    industry = Column(String(100))
    budget = Column(Float, default=0)
    actual_spend = Column(Float, default=0)
    leads = Column(Integer, default=0)
    status = Column(String(20), default="待启动")  # 待启动, 进行中, 已完成, 已取消
    description = Column(Text)
