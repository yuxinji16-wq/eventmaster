"""
复盘 Repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.review import Review, ReviewFeedback, ReviewConclusion
from app.repositories.base import BaseRepository


class ReviewRepository(BaseRepository[Review]):
    """复盘Repository"""

    def __init__(self):
        self.model = Review

    def get_by_activity(self, db: Session, activity_id: int) -> Optional[Review]:
        return db.query(Review).filter(Review.activity_id == activity_id).first()

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Review]:
        return db.query(Review).filter(Review.status == status).offset(skip).limit(limit).all()


class ReviewFeedbackRepository(BaseRepository[ReviewFeedback]):
    """复盘评价Repository"""

    def __init__(self):
        self.model = ReviewFeedback

    def get_by_review(self, db: Session, review_id: int, skip: int = 0, limit: int = 100) -> List[ReviewFeedback]:
        return db.query(ReviewFeedback).filter(
            ReviewFeedback.review_id == review_id
        ).order_by(ReviewFeedback.created_at.desc()).offset(skip).limit(limit).all()

    def get_by_evaluator(self, db: Session, evaluator_id: str, skip: int = 0, limit: int = 100) -> List[ReviewFeedback]:
        return db.query(ReviewFeedback).filter(
            ReviewFeedback.evaluator_id == evaluator_id
        ).order_by(ReviewFeedback.created_at.desc()).offset(skip).limit(limit).all()

    def get_submitted(self, db: Session, review_id: int, skip: int = 0, limit: int = 100) -> List[ReviewFeedback]:
        """获取已提交的反馈"""
        return db.query(ReviewFeedback).filter(
            ReviewFeedback.review_id == review_id,
            ReviewFeedback.is_submitted == True
        ).offset(skip).limit(limit).all()


class ReviewConclusionRepository(BaseRepository[ReviewConclusion]):
    """复盘结论Repository"""

    def __init__(self):
        self.model = ReviewConclusion

    def get_by_review(self, db: Session, review_id: int) -> Optional[ReviewConclusion]:
        return db.query(ReviewConclusion).filter(ReviewConclusion.review_id == review_id).first()

    def calculate_avg_scores(self, db: Session, review_id: int) -> dict:
        """计算复盘反馈的平均分"""
        feedbacks = db.query(ReviewFeedback).filter(
            ReviewFeedback.review_id == review_id,
            ReviewFeedback.is_submitted == True
        ).all()

        if not feedbacks:
            return {}

        scores = {
            "avg_goal_score": sum(f.goal_score for f in feedbacks) / len(feedbacks),
            "avg_lead_quality_score": sum(f.lead_quality_score for f in feedbacks) / len(feedbacks),
            "avg_execution_score": sum(f.execution_score for f in feedbacks) / len(feedbacks),
            "avg_resource_score": sum(f.resource_score for f in feedbacks) / len(feedbacks),
            "avg_brand_score": sum(f.brand_score for f in feedbacks) / len(feedbacks),
        }
        scores["overall_score"] = (
            scores["avg_goal_score"] + scores["avg_lead_quality_score"] +
            scores["avg_execution_score"] + scores["avg_resource_score"] +
            scores["avg_brand_score"]
        ) / 5

        return scores
