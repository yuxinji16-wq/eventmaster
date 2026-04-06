"""
预算 Service
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.budget import Budget, BudgetItem, BudgetLog, YearlyQuota
from app.repositories.budget import BudgetRepository, BudgetItemRepository, BudgetLogRepository, YearlyQuotaRepository
from app.services.base import BaseService


class BudgetService(BaseService[Budget, BudgetRepository]):
    """预算Service"""

    def __init__(self):
        super().__init__(BudgetRepository())

    def get_by_activity(self, db: Session, activity_id: int) -> Optional[Budget]:
        return self.repository.get_by_activity(db, activity_id)

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Budget]:
        return self.repository.get_by_status(db, status, skip, limit)


class BudgetItemService(BaseService[BudgetItem, BudgetItemRepository]):
    """预算明细Service"""

    def __init__(self):
        super().__init__(BudgetItemRepository())

    def get_by_budget(self, db: Session, budget_id: int, skip: int = 0, limit: int = 100) -> List[BudgetItem]:
        return self.repository.get_by_budget(db, budget_id, skip, limit)

    def get_over_budget(self, db: Session, skip: int = 0, limit: int = 100) -> List[BudgetItem]:
        return self.repository.get_over_budget(db, skip, limit)


class BudgetLogService(BaseService[BudgetLog, BudgetLogRepository]):
    """预算日志Service"""

    def __init__(self):
        super().__init__(BudgetLogRepository())

    def get_by_activity(self, db: Session, activity_id: int, skip: int = 0, limit: int = 100) -> List[BudgetLog]:
        return self.repository.get_by_activity(db, activity_id, skip, limit)

    def get_by_type(self, db: Session, type: str, skip: int = 0, limit: int = 100) -> List[BudgetLog]:
        return self.repository.get_by_type(db, type, skip, limit)


class YearlyQuotaService(BaseService[YearlyQuota, YearlyQuotaRepository]):
    """年度配额Service"""

    def __init__(self):
        super().__init__(YearlyQuotaRepository())

    def get_by_year(self, db: Session, year: str) -> Optional[YearlyQuota]:
        return self.repository.get_by_year(db, year)

    def get_or_create(self, db: Session, year: str, quota: float = 0) -> YearlyQuota:
        """获取或创建年度配额"""
        existing = self.repository.get_by_year(db, year)
        if existing:
            return existing
        return self.repository.create(db, {"year": year, "quota": quota})
