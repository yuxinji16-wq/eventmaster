"""
供应商 Repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.supplier import Supplier, SupplierReview, Bill
from app.repositories.base import BaseRepository


class SupplierRepository(BaseRepository[Supplier]):
    """供应商Repository"""

    def __init__(self):
        self.model = Supplier

    def get_by_name(self, db: Session, name: str) -> Optional[Supplier]:
        return db.query(Supplier).filter(Supplier.name == name).first()

    def get_by_category(self, db: Session, category: str, skip: int = 0, limit: int = 100) -> List[Supplier]:
        return db.query(Supplier).filter(
            (Supplier.category == category) | (Supplier.service_type == category)
        ).offset(skip).limit(limit).all()

    def search(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Supplier]:
        keyword_filter = f"%{keyword}%"
        return db.query(Supplier).filter(
            Supplier.name.ilike(keyword_filter) | Supplier.contact.ilike(keyword_filter)
        ).offset(skip).limit(limit).all()


class SupplierReviewRepository(BaseRepository[SupplierReview]):
    """供应商评价Repository"""

    def __init__(self):
        self.model = SupplierReview

    def get_by_supplier(self, db: Session, supplier_id: int, skip: int = 0, limit: int = 100) -> List[SupplierReview]:
        return db.query(SupplierReview).filter(
            SupplierReview.supplier_id == supplier_id
        ).order_by(SupplierReview.created_at.desc()).offset(skip).limit(limit).all()

    def get_supplier_avg_score(self, db: Session, supplier_id: int) -> Optional[float]:
        """获取供应商平均评分"""
        result = db.query(func.avg(SupplierReview.overall_score)).filter(
            SupplierReview.supplier_id == supplier_id
        ).scalar()
        return float(result) if result else None


class BillRepository(BaseRepository[Bill]):
    """账单Repository"""

    def __init__(self):
        self.model = Bill

    def get_by_supplier(self, db: Session, supplier_id: int, skip: int = 0, limit: int = 100) -> List[Bill]:
        return db.query(Bill).filter(Bill.supplier_id == supplier_id).offset(skip).limit(limit).all()

    def get_by_activity(self, db: Session, activity_id: int, skip: int = 0, limit: int = 100) -> List[Bill]:
        return db.query(Bill).filter(Bill.activity_id == activity_id).offset(skip).limit(limit).all()

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Bill]:
        return db.query(Bill).filter(Bill.status == status).offset(skip).limit(limit).all()

    def get_pending(self, db: Session, skip: int = 0, limit: int = 100) -> List[Bill]:
        """获取待结算账单"""
        return db.query(Bill).filter(Bill.status == "待结算").offset(skip).limit(limit).all()
