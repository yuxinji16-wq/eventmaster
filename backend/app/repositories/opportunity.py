"""
商机 Repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.opportunity import Opportunity
from app.repositories.base import BaseRepository


class OpportunityRepository(BaseRepository[Opportunity]):
    """商机Repository"""

    def __init__(self):
        self.model = Opportunity

    def get_by_client_name(self, db: Session, client_name: str) -> Optional[Opportunity]:
        return db.query(Opportunity).filter(Opportunity.client_name == client_name).first()

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Opportunity]:
        """根据意向状态查询"""
        return db.query(Opportunity).filter(Opportunity.status == status).offset(skip).limit(limit).all()

    def get_by_activity(self, db: Session, activity_id: int, skip: int = 0, limit: int = 100) -> List[Opportunity]:
        """根据活动获取关联商机"""
        return db.query(Opportunity).filter(Opportunity.activity_id == activity_id).offset(skip).limit(limit).all()

    def search(self, db: Session, keyword: str, skip: int = 0, limit: int = 100) -> List[Opportunity]:
        """搜索商机"""
        keyword_filter = f"%{keyword}%"
        return db.query(Opportunity).filter(
            or_(
                Opportunity.client_name.ilike(keyword_filter),
                Opportunity.company.ilike(keyword_filter),
                Opportunity.contact.ilike(keyword_filter),
                Opportunity.contact_person.ilike(keyword_filter),
                Opportunity.phone.ilike(keyword_filter),
                Opportunity.requirement.ilike(keyword_filter),
            )
        ).offset(skip).limit(limit).all()

    def get_high_intent(self, db: Session, skip: int = 0, limit: int = 100) -> List[Opportunity]:
        """获取高意向商机"""
        return db.query(Opportunity).filter(Opportunity.status == "高意向").offset(skip).limit(limit).all()
