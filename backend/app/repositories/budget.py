"""
预算 Repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.budget import Budget, BudgetItem, BudgetLog, YearlyQuota
from app.repositories.base import BaseRepository


class BudgetRepository(BaseRepository[Budget]):
    """预算Repository"""

    def __init__(self):
        self.model = Budget

    def get_by_activity(self, db: Session, activity_id: int) -> Optional[Budget]:
        return db.query(Budget).filter(Budget.activity_id == activity_id).first()

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Budget]:
        return db.query(Budget).filter(Budget.status == status).offset(skip).limit(limit).all()


class BudgetItemRepository(BaseRepository[BudgetItem]):
    """预算明细Repository"""

    def __init__(self):
        self.model = BudgetItem

    def get_by_budget(self, db: Session, budget_id: int, skip: int = 0, limit: int = 100) -> List[BudgetItem]:
        return db.query(BudgetItem).filter(BudgetItem.budget_id == budget_id).offset(skip).limit(limit).all()

    def get_over_budget(self, db: Session, skip: int = 0, limit: int = 100) -> List[BudgetItem]:
        """获取超预算项目"""
        return db.query(BudgetItem).filter(BudgetItem.status == "超预算").offset(skip).limit(limit).all()


class BudgetLogRepository(BaseRepository[BudgetLog]):
    """预算日志Repository"""

    def __init__(self):
        self.model = BudgetLog

    def get_by_activity(self, db: Session, activity_id: int, skip: int = 0, limit: int = 100) -> List[BudgetLog]:
        return db.query(BudgetLog).filter(BudgetLog.activity_id == activity_id).offset(skip).limit(limit).all()

    def get_by_type(self, db: Session, type: str, skip: int = 0, limit: int = 100) -> List[BudgetLog]:
        return db.query(BudgetLog).filter(BudgetLog.type == type).offset(skip).limit(limit).all()


class YearlyQuotaRepository(BaseRepository[YearlyQuota]):
    """年度配额Repository"""

    def __init__(self):
        self.model = YearlyQuota

    def get_by_year(self, db: Session, year: str) -> Optional[YearlyQuota]:
        return db.query(YearlyQuota).filter(YearlyQuota.year == year).first()
