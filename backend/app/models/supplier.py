"""
供应商模型
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, Date, Text
from app.db.base import Base, TimestampMixin


class Supplier(Base, TimestampMixin):
    """供应商模型"""
    __tablename__ = "suppliers"

    name = Column(String(200), nullable=False, index=True)
    category = Column(String(50))  # 搭建, 设计, 影音, 礼品, 印刷, 其他
    contact = Column(String(100))
    phone = Column(String(50))
    email = Column(String(100))
    address = Column(String(500))
    description = Column(Text)


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


class Bill(Base, TimestampMixin):
    """账单模型"""
    __tablename__ = "bills"

    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    activity_id = Column(Integer, ForeignKey("activities.id"))
    amount = Column(Float)
    status = Column(String(20))  # 待付款, 已付款, 已结算
    due_date = Column(String(20))
    paid_at = Column(String(20))
    notes = Column(Text)
