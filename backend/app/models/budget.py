"""
预算模型
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, Date, Text
from app.db.base import Base, TimestampMixin


class Budget(Base, TimestampMixin):
    """预算主表"""
    __tablename__ = "budgets"

    activity_id = Column(Integer, ForeignKey("activities.id"))
    total_amount = Column(Float, default=0)
    used_amount = Column(Float, default=0)
    status = Column(String(20))  # 草稿, 已审批, 执行中, 已结项
    approved_by = Column(String(100))
    approved_at = Column(Date)


class BudgetItem(Base, TimestampMixin):
    """预算明细"""
    __tablename__ = "budget_items"

    budget_id = Column(Integer, ForeignKey("budgets.id"))
    category = Column(String(50))  # 场地租用, 搭建/展览, 物料制作, etc.
    planned_amount = Column(Float, default=0)
    actual_amount = Column(Float, default=0)
    status = Column(String(20))  # 正常, 超预算, 未开始
    notes = Column(Text)


class BudgetLog(Base, TimestampMixin):
    """预算日志"""
    __tablename__ = "budget_logs"

    activity_id = Column(Integer, ForeignKey("activities.id"))
    name = Column(String(200))
    amount = Column(Float)
    category = Column(String(50))
    date = Column(Date)
    notes = Column(Text)
    status = Column(String(20))  # 已结清, 待结算
    type = Column(String(20))  # expense, income


class YearlyQuota(Base, TimestampMixin):
    """年度预算配额"""
    __tablename__ = "yearly_quotas"

    year = Column(String(4), unique=True, nullable=False)
    quota = Column(Float)
