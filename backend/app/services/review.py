"""
复盘 Service
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.review import Review, ReviewFeedback, ReviewConclusion
from app.repositories.review import ReviewRepository, ReviewFeedbackRepository, ReviewConclusionRepository
from app.services.base import BaseService


class ReviewService(BaseService[Review, ReviewRepository]):
    """复盘Service"""

    def __init__(self):
        super().__init__(ReviewRepository())

    def get_by_activity(self, db: Session, activity_id: int) -> Optional[Review]:
        return self.repository.get_by_activity(db, activity_id)

    def get_by_status(self, db: Session, status: str, skip: int = 0, limit: int = 100) -> List[Review]:
        return self.repository.get_by_status(db, status, skip, limit)

    def start_review(self, db: Session, activity_id: int) -> Review:
        """启动复盘"""
        return self.repository.create(db, {"activity_id": activity_id, "status": "进行中"})

    def complete_review(self, db: Session, id: int) -> Optional[Review]:
        """完成复盘"""
        return self.repository.update(db, id, {"status": "已完成"})


class ReviewFeedbackService(BaseService[ReviewFeedback, ReviewFeedbackRepository]):
    """复盘评价Service"""

    def __init__(self):
        super().__init__(ReviewFeedbackRepository())

    def get_by_review(self, db: Session, review_id: int, skip: int = 0, limit: int = 100) -> List[ReviewFeedback]:
        return self.repository.get_by_review(db, review_id, skip, limit)

    def get_by_evaluator(self, db: Session, evaluator_id: str, skip: int = 0, limit: int = 100) -> List[ReviewFeedback]:
        return self.repository.get_by_evaluator(db, evaluator_id, skip, limit)

    def submit_feedback(self, db: Session, id: int, data: dict) -> Optional[ReviewFeedback]:
        """提交评价"""
        from datetime import datetime
        data["is_submitted"] = True
        data["submitted_at"] = datetime.now().isoformat()
        return self.repository.update(db, id, data)


class ReviewConclusionService(BaseService[ReviewConclusion, ReviewConclusionRepository]):
    """复盘结论Service"""

    def __init__(self):
        super().__init__(ReviewConclusionRepository())

    def get_by_review(self, db: Session, review_id: int) -> Optional[ReviewConclusion]:
        return self.repository.get_by_review(db, review_id)

    def calculate_avg_scores(self, db: Session, review_id: int) -> dict:
        return self.repository.calculate_avg_scores(db, review_id)

    def generate_conclusion(self, db: Session, review_id: int, manager_id: str, manager_name: str) -> ReviewConclusion:
        """生成复盘结论（包含AI摘要预留）"""
        # 计算平均分
        avg_scores = self.repository.calculate_avg_scores(db, review_id)

        # 创建结论
        data = {
            "review_id": review_id,
            "manager_id": manager_id,
            "manager_name": manager_name,
            **avg_scores
        }
        return self.repository.create(db, data)
