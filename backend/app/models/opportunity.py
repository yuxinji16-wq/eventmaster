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
    status = Column(String(20))  # 高意向, 中意向, 低意向, 潜在客户
    create_date = Column(String(20))
    expected_close_date = Column(String(20))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    notes = Column(Text)
    # 新增字段
    field = Column(String(20))  # 民用/军工
    position = Column(String(100))  # 职位
    # 来源信息
    source_type = Column(String(20), default="manual")  # activity=活动获取, manual=自主录入
    source_name = Column(String(200), default="自主录入")  # 活动名称或"自主录入"
    # 销售分配
    region = Column(String(50))  # 所属区域
    owner = Column(String(100))  # 对接人
    lead_level = Column(String(20), default="待评估")
    evaluation_note = Column(Text)
    transferred_to_sales = Column(String(10), default="false")
    transferred_at = Column(String(30))
    converted = Column(String(10), default="false")
    conversion_status = Column(String(20))
    conversion_at = Column(String(30))
    result_note = Column(Text)


class OpportunityActivityLog(Base, TimestampMixin):
    """商机操作记录"""
    __tablename__ = "opportunity_activity_logs"

    opportunity_id = Column(Integer, ForeignKey("opportunities.id"), nullable=False, index=True)
    action = Column(String(50), nullable=False)
    from_value = Column(String(200))
    to_value = Column(String(200))
    operator = Column(String(100), default="系统")
    notes = Column(Text)
