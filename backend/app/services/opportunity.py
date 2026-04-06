"""
商机 Service
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.opportunity import Opportunity
from app.repositories.opportunity import OpportunityRepository
from app.services.base import BaseService


class OpportunityService(BaseService[Opportunity, OpportunityRepository]):
    """商机Service"""

    def __init__(self):
        super().__init__(OpportunityRepository())

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Opportunity]:
        return self.repository.get_by_status(db, status, skip, limit)

    def get_by_activity(self, db: Session, activity_id: int, skip: int = 0, limit: int = 100) -> List[Opportunity]:
        return self.repository.get_by_activity(db, activity_id, skip, limit)

    def search(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Opportunity]:
        return self.repository.search(db, keyword, skip, limit)

    def get_high_intent(self, db: Session, skip: int = 0, limit: int = 100) -> List[Opportunity]:
        return self.repository.get_high_intent(db, skip, limit)

    def convert_to_customer(self, db: Session, id: int) -> Optional[Opportunity]:
        """将高意向商机转换为客户（预留接口）"""
        return self.repository.update(db, id, {"status": "已转化"})
