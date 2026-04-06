"""
数据模型
"""
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean, Text, ForeignKey, Date, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Activity(Base):
    """活动模型"""
    __tablename__ = "activities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    date = Column(String(20), nullable=False)  # 存储日期字符串格式: 2024-03-15
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
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    budget_logs = relationship("BudgetLog", back_populates="activity")
    opportunities = relationship("Opportunity", back_populates="activity")


class Material(Base):
    """物料模型"""
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    category = Column(String(50))  # 产品宣传册, 易拉宝, 会议定制, 礼品, 办公用品, 其他
    type = Column(String(20))  # 常规, 定制
    stock = Column(Integer, default=0)
    unit = Column(String(20))
    status = Column(String(20), default="In Stock")  # In Stock, Low Stock, Out of Stock
    usage_count = Column(Integer, default=0)
    last_updated = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    warehousing_logs = relationship("WarehousingLog", back_populates="material")
    withdrawal_logs = relationship("WithdrawalLog", back_populates="material")


class WarehousingLog(Base):
    """入库记录模型"""
    __tablename__ = "warehousing_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"))
    material_name = Column(String(200))
    count = Column(Integer)
    operator = Column(String(100))
    date = Column(DateTime)
    is_new_type = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    material = relationship("Material", back_populates="warehousing_logs")


class WithdrawalLog(Base):
    """领用记录模型"""
    __tablename__ = "withdrawal_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    material_id = Column(Integer, ForeignKey("materials.id"))
    material_name = Column(String(200))
    count = Column(Integer)
    unit = Column(String(20))
    user = Column(String(100))
    reason = Column(String(500))
    date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    material = relationship("Material", back_populates="withdrawal_logs")


class Supplier(Base):
    """供应商模型"""
    __tablename__ = "suppliers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    service_type = Column(String(50))  # 搭建, 设计, 影音, 礼品, 印刷, 其他
    rating = Column(Float, default=0)
    contact = Column(String(100))
    phone = Column(String(50))
    email = Column(String(100))
    address = Column(String(500))
    bank_name = Column(String(200))
    bank_account = Column(String(100))
    last_used = Column(Date)
    order_count = Column(Integer, default=0)
    tags = Column(JSON)  # 存储为 JSON 数组
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    reviews = relationship("Review", back_populates="supplier")
    bills = relationship("Bill", back_populates="supplier")


class Review(Base):
    """评价模型"""
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    user = Column(String(100))
    date = Column(Date)
    content = Column(Text)
    rating = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    supplier = relationship("Supplier", back_populates="reviews")


class Bill(Base):
    """账单模型"""
    __tablename__ = "bills"
    
    id = Column(Integer, primary_key=True, index=True)
    supplier_id = Column(Integer, ForeignKey("suppliers.id"))
    activity_name = Column(String(200))
    project_name = Column(String(200))
    date = Column(Date)
    status = Column(String(20))  # 已结清, 待结算
    amount = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    supplier = relationship("Supplier", back_populates="bills")


class BudgetLog(Base):
    """预算日志模型"""
    __tablename__ = "budget_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    name = Column(String(200))
    amount = Column(Float)
    category = Column(String(50))  # 展会/展览, 品牌推广, 礼品/物料, 差旅/招待, 场地租用, 物流/运费, 其他
    date = Column(Date)
    notes = Column(Text)
    status = Column(String(20))  # 已结清, 待结算
    type = Column(String(20))  # expense, income
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    activity = relationship("Activity", back_populates="budget_logs")


class Opportunity(Base):
    """商机模型"""
    __tablename__ = "opportunities"
    
    id = Column(Integer, primary_key=True, index=True)
    client_name = Column(String(200), nullable=False, index=True)
    activity_id = Column(Integer, ForeignKey("activities.id"))
    value = Column(Float)
    stage = Column(String(50))  # 初步接触, 方案报价, 商务谈判, 赢单关闭
    probability = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # 关系
    activity = relationship("Activity", back_populates="opportunities")


class YearlyQuota(Base):
    """年度预算配额模型"""
    __tablename__ = "yearly_quotas"
    
    id = Column(Integer, primary_key=True, index=True)
    year = Column(String(4), unique=True, nullable=False)
    quota = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class User(Base):
    """用户模型"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, nullable=False)
    email = Column(String(200), unique=True)
    hashed_password = Column(String(200))
    full_name = Column(String(100))
    role = Column(String(50), default="user")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
