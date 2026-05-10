"""
物料模型
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin


class Material(Base, TimestampMixin):
    """物料模型"""
    __tablename__ = "materials"

    name = Column(String(200), nullable=False, index=True)
    category = Column(String(50))  # 产品宣传册, 易拉宝, 会议定制, 礼品, 办公用品, 其他
    type = Column(String(50))  # 物料类型
    stock = Column(Float, default=0)
    unit = Column(String(20))
    status = Column(String(20))  # 在库, 低库存, 缺货
    usage_count = Column(Integer, default=0)  # 使用次数
    last_updated = Column(String(20))  # 最后更新时间
    image_url = Column(String(500))  # 物料图片
    location = Column(String(200))  # 库房存放位置


class WarehousingLog(Base, TimestampMixin):
    """入库记录模型"""
    __tablename__ = "warehousing_logs"

    material_id = Column(Integer, ForeignKey("materials.id"))
    material_name = Column(String(200))  # 物料名称冗余存储
    count = Column(Float)  # 入库数量
    operator = Column(String(100))  # 操作人
    date = Column(String(20))  # 入库日期
    is_new_type = Column(String(10))  # 是否为新类型首次入库


class WithdrawalLog(Base, TimestampMixin):
    """出库记录模型"""
    __tablename__ = "withdrawal_logs"

    material_id = Column(Integer, ForeignKey("materials.id"))
    material_name = Column(String(200))  # 物料名称冗余存储
    count = Column(Float)  # 出库数量
    unit = Column(String(20))  # 单位
    user = Column(String(100))  # 领用人
    reason = Column(String(500))  # 领用原因
    date = Column(String(20))  # 出库日期
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=True, index=True)
    status = Column(String(20), default="领用中")  # 领用中, 已归还, 部分归还, 已消耗
    returned_at = Column(String(20))
    return_count = Column(Float, default=0)
