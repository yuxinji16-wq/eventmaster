"""
供应商 Service
"""
import json
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.supplier import Supplier, SupplierReview, Bill
from app.repositories.supplier import SupplierRepository, SupplierReviewRepository, BillRepository
from app.services.base import BaseService


class SupplierService(BaseService[Supplier, SupplierRepository]):
    """供应商Service"""

    def __init__(self):
        super().__init__(SupplierRepository())

    def create(self, db: Session, obj_in: dict) -> Supplier:
        """创建供应商（处理 tags 字段转换）"""
        # 将 tags 列表转换为 JSON 字符串
        if 'tags' in obj_in and obj_in['tags'] is not None:
            if isinstance(obj_in['tags'], list):
                obj_in['tags'] = json.dumps(obj_in['tags'], ensure_ascii=False)
        return self.repository.create(db, obj_in)

    def update(self, db: Session, id: int, obj_in: dict) -> Optional[Supplier]:
        """更新供应商（处理 tags 字段转换）"""
        # 将 tags 列表转换为 JSON 字符串
        if 'tags' in obj_in and obj_in['tags'] is not None:
            if isinstance(obj_in['tags'], list):
                obj_in['tags'] = json.dumps(obj_in['tags'], ensure_ascii=False)
        return self.repository.update(db, id, obj_in)

    def delete(self, db: Session, id: int) -> bool:
        """删除供应商及其关联的评价和账单"""
        # 先删除关联的评价和账单
        supplier_review_service = SupplierReviewService()
        reviews = supplier_review_service.get_by_supplier(db, id)
        for review in reviews:
            supplier_review_service.repository.delete(db, review.id)

        bill_service = BillService()
        bills = bill_service.get_by_supplier(db, id)
        for bill in bills:
            bill_service.repository.delete(db, bill.id)

        # 再删除供应商
        return self.repository.delete(db, id)

    def get_by_category(self, db: Session, category: str, skip: int = 0, limit: int = 100) -> List[Supplier]:
        return self.repository.get_by_category(db, category, skip, limit)

    def search(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Supplier]:
        return self.repository.search(db, keyword, skip, limit)


class SupplierReviewService(BaseService[SupplierReview, SupplierReviewRepository]):
    """供应商评价Service"""

    def __init__(self):
        super().__init__(SupplierReviewRepository())

    def get_by_supplier(self, db: Session, supplier_id: int, skip: int = 0, limit: int = 100) -> List[SupplierReview]:
        return self.repository.get_by_supplier(db, supplier_id, skip, limit)

    def get_avg_score(self, db: Session, supplier_id: int) -> Optional[float]:
        return self.repository.get_supplier_avg_score(db, supplier_id)


class BillService(BaseService[Bill, BillRepository]):
    """账单Service"""

    def __init__(self):
        super().__init__(BillRepository())

    def get_by_supplier(self, db: Session, supplier_id: int, skip: int = 0, limit: int = 100) -> List[Bill]:
        return self.repository.get_by_supplier(db, supplier_id, skip, limit)

    def get_by_activity(self, db: Session, activity_id: int, skip: int = 0, limit: int = 100) -> List[Bill]:
        return self.repository.get_by_activity(db, activity_id, skip, limit)

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Bill]:
        return self.repository.get_by_status(db, status, skip, limit)

    def get_pending(self, db: Session, skip: int = 0, limit: int = 100) -> List[Bill]:
        return self.repository.get_pending(db, skip, limit)

    def mark_paid(self, db: Session, id: int) -> Optional[Bill]:
        """标记为已付款"""
        return self.repository.update(db, id, {"status": "已付款"})
