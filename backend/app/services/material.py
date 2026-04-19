"""
物料 Service
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.material import Material, WarehousingLog, WithdrawalLog
from app.repositories.material import MaterialRepository, WarehousingLogRepository, WithdrawalLogRepository
from app.services.base import BaseService


class MaterialService(BaseService[Material, MaterialRepository]):
    """物料Service"""

    def __init__(self):
        super().__init__(MaterialRepository())

    def get_by_category(self, db: Session, category: str, skip: int = 0, limit: int = 100) -> List[Material]:
        return self.repository.get_by_category(db, category, skip, limit)

    def get_low_stock(self, db: Session, skip: int = 0, limit: int = 100) -> List[Material]:
        return self.repository.get_low_stock(db, skip, limit)

    def search(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Material]:
        return self.repository.search(db, keyword, skip, limit)

    def update_stock(self, db: Session, id: int, quantity: float) -> Optional[Material]:
        """更新库存"""
        material = self.repository.get(db, id)
        if material:
            material.stock += quantity
            db.commit()
            db.refresh(material)
        return material


class WarehousingLogService(BaseService[WarehousingLog, WarehousingLogRepository]):
    """入库记录Service"""

    def __init__(self):
        super().__init__(WarehousingLogRepository())

    def get_by_material(self, db: Session, material_id: int, skip: int = 0, limit: int = 100) -> List[WarehousingLog]:
        return self.repository.get_by_material(db, material_id, skip, limit)

    def create_warehousing(self, db: Session, data: dict) -> WarehousingLog:
        """创建入库记录并更新库存"""
        # 兼容前端字段名
        quantity = data.get("quantity", data.get("count", 0))
        log = self.repository.create(db, data)
        # 更新库存
        material_repo = MaterialRepository()
        material = material_repo.get(db, data["material_id"])
        if material:
            material.stock += quantity
            db.commit()
        return log


class WithdrawalLogService(BaseService[WithdrawalLog, WithdrawalLogRepository]):
    """出库记录Service"""

    def __init__(self):
        super().__init__(WithdrawalLogRepository())

    def get_by_material(self, db: Session, material_id: int, skip: int = 0, limit: int = 100) -> List[WithdrawalLog]:
        return self.repository.get_by_material(db, material_id, skip, limit)

    def get_by_activity(self, db: Session, activity_id: int, skip: int = 0, limit: int = 100) -> List[WithdrawalLog]:
        return self.repository.get_by_activity(db, activity_id, skip, limit)

    def mark_returned(self, db: Session, log_id: int, return_count: Optional[float] = None) -> Optional[WithdrawalLog]:
        """标记领用记录归还，并恢复库存"""
        log = self.repository.get(db, log_id)
        if not log:
            return None

        from datetime import datetime

        returned_count = return_count if return_count is not None else (log.count or 0)
        log.return_count = (log.return_count or 0) + returned_count
        log.returned_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log.status = "已归还" if (log.return_count or 0) >= (log.count or 0) else "部分归还"

        material_repo = MaterialRepository()
        material = material_repo.get(db, log.material_id)
        if material:
            material.stock += returned_count
        db.commit()
        db.refresh(log)
        return log

    def create_withdrawal(self, db: Session, data: dict) -> WithdrawalLog:
        """创建出库记录并更新库存"""
        # 兼容前端字段名
        quantity = data.get("quantity", data.get("count", 0))
        log = self.repository.create(db, data)
        # 更新库存
        material_repo = MaterialRepository()
        material = material_repo.get(db, data["material_id"])
        if material:
            material.stock -= quantity
            db.commit()
        return log
