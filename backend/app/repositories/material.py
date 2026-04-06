"""
物料 Repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.material import Material, WarehousingLog, WithdrawalLog
from app.repositories.base import BaseRepository


class MaterialRepository(BaseRepository[Material]):
    """物料Repository"""

    def __init__(self):
        self.model = Material

    def get_by_name(self, db: Session, name: str) -> Optional[Material]:
        return db.query(Material).filter(Material.name == name).first()

    def get_by_category(self, db: Session, category: str, skip: int = 0, limit: int = 100) -> List[Material]:
        return db.query(Material).filter(Material.category == category).offset(skip).limit(limit).all()

    def get_low_stock(self, db: Session, skip: int = 0, limit: int = 100) -> List[Material]:
        """获取低库存物料"""
        return db.query(Material).filter(Material.stock < Material.min_stock).offset(skip).limit(limit).all()

    def search(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Material]:
        """搜索物料"""
        keyword_filter = f"%{keyword}%"
        return db.query(Material).filter(
            Material.name.ilike(keyword_filter) | Material.category.ilike(keyword_filter)
        ).offset(skip).limit(limit).all()


class WarehousingLogRepository(BaseRepository[WarehousingLog]):
    """入库记录Repository"""

    def __init__(self):
        self.model = WarehousingLog

    def get_by_material(self, db: Session, material_id: int, skip: int = 0, limit: int = 100) -> List[WarehousingLog]:
        return db.query(WarehousingLog).filter(
            WarehousingLog.material_id == material_id
        ).order_by(WarehousingLog.created_at.desc()).offset(skip).limit(limit).all()


class WithdrawalLogRepository(BaseRepository[WithdrawalLog]):
    """出库记录Repository"""

    def __init__(self):
        self.model = WithdrawalLog

    def get_by_material(self, db: Session, material_id: int, skip: int = 0, limit: int = 100) -> List[WithdrawalLog]:
        return db.query(WithdrawalLog).filter(
            WithdrawalLog.material_id == material_id
        ).order_by(WithdrawalLog.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_activity(self, db: Session, activity_id: int, skip: int = 0, limit: int = 100) -> List[WithdrawalLog]:
        return db.query(WithdrawalLog).filter(
            WithdrawalLog.activity_id == activity_id
        ).order_by(WithdrawalLog.created_at.desc()).offset(skip).limit(limit).all()
