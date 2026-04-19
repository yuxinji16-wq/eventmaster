"""
供应商模型
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, Date, Text
from app.db.base import Base, TimestampMixin


class Supplier(Base, TimestampMixin):
    """供应商模型"""
    __tablename__ = "suppliers"

    name = Column(String(200), nullable=False, index=True)
    service_type = Column(String(50))  # 搭建, 设计, 影音, 礼品, 印刷, 其他
    # category 是 service_type 的别名，用于 API 兼容
    category = Column(String(50))  # 备用字段
    rating = Column(Float)  # 评分
    contact = Column(String(100))
    phone = Column(String(50))
    email = Column(String(100))
    address = Column(String(500))
    bank_name = Column(String(200))
    bank_account = Column(String(100))
    last_used = Column(String(20))
    order_count = Column(Integer, default=0)
    tags = Column(String(500))  # JSON 字符串


class SupplierReview(Base, TimestampMixin):
    """供应商评价模型"""
    __tablename__ = "supplier_reviews"

    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    quality_score = Column(Float)  # 质量评分
    delivery_score = Column(Float)  # 交付评分
    service_score = Column(Float)  # 服务评分
    price_score = Column(Float)  # 价格评分
    overall_score = Column(Float)  # 综合评分
    comments = Column(Text)
    reviewer_name = Column(String(100))


class Bill(Base, TimestampMixin):
    """账单模型"""
    __tablename__ = "bills"

    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    activity_name = Column(String(200))
    project_name = Column(String(200))
    amount = Column(Float)
    status = Column(String(20))  # 待结算, 已结清
    due_date = Column(String(20))
    paid_at = Column(String(20))
    notes = Column(Text)
