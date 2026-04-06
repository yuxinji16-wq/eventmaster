"""
商机模型
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, Text
from app.db.base import Base, TimestampMixin


class Opportunity(Base, TimestampMixin):
    """商机模型"""
    __tablename__ = "opportunities"

    client_name = Column(String(200), nullable=False, index=True)
    company = Column(String(200))
    contact = Column(String(100))
    phone = Column(String(50))
    email = Column(String(100))
    requirement = Column(Text)
    contact_person = Column(String(100))
    estimated_value = Column(Float, default=0)
    status = Column(String(20))  # 高意向, 中意向, 低意向
    create_date = Column(String(20))
    expected_close_date = Column(String(20))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    notes = Column(Text)
