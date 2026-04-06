"""
复盘 API 路由
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.review import (
    ReviewCreate, ReviewUpdate, ReviewResponse,
    ReviewFeedbackCreate, ReviewFeedbackUpdate, ReviewFeedbackResponse,
    ReviewConclusionCreate, ReviewConclusionUpdate, ReviewConclusionResponse
)
from app.services.review import ReviewService, ReviewFeedbackService, ReviewConclusionService
from app.core.errors import ReviewException

router = APIRouter(prefix="/reviews", tags=["复盘"])
review_service = ReviewService()
feedback_service = ReviewFeedbackService()
conclusion_service = ReviewConclusionService()


# ===== 特殊端点（必须在 /{id} 之前） =====

# 获取需要复盘的活动列表
@router.get("/activities")
def get_review_activities(
    status: Optional[str] = Query(None, description="复盘状态筛选"),
    db: Session = Depends(get_db)
):
    """获取需要复盘的活动列表"""
    from app.models.activity import Activity
    from app.models.review import Review

    # 获取已完成但尚未复盘的活动
    if status == "pending":
        completed_activities = db.query(Activity).filter(Activity.status == "已完成").all()
        activity_ids_with_review = db.query(Review.activity_id).distinct().all()
        activity_ids_with_review = [r[0] for r in activity_ids_with_review]

        pending = [a for a in completed_activities if a.id not in activity_ids_with_review]

        return [
            {
                "activity_id": a.id,
                "activity_name": a.name,
                "activity_date": a.date,
                "status": "待复盘"
            }
            for a in pending
        ]

    # 获取已复盘的活动
    if status:
        reviews = review_service.get_by_status(db, status)
    else:
        reviews = review_service.get_all(db)

    result = []
    for review in reviews:
        activity = db.query(Activity).filter(Activity.id == review.activity_id).first()
        if activity:
            result.append({
                "review_id": review.id,
                "activity_id": activity.id,
                "activity_name": activity.name,
                "activity_date": activity.date,
                "status": review.status,
                "created_at": review.created_at
            })

    return result


# 生成AI摘要
@router.post("/{review_id}/generate-summary")
def generate_review_summary(review_id: int, db: Session = Depends(get_db)):
    """生成复盘AI摘要"""
    from app.models.review import ReviewFeedback

    # 获取该复盘的所有反馈
    feedbacks = db.query(ReviewFeedback).filter(
        ReviewFeedback.review_id == review_id,
        ReviewFeedback.is_submitted == True
    ).all()

    if not feedbacks:
        return {
            "summary": "暂无足够的反馈数据生成摘要",
            "key_successes": [],
            "common_problems": [],
            "action_suggestions": []
        }

    # 简单汇总（实际项目中可以调用AI服务）
    successes = []
    problems = []
    suggestions = []

    for fb in feedbacks:
        if fb.successes:
            successes.append(fb.successes)
        if fb.problems:
            problems.append(fb.problems)
        if fb.suggestions:
            suggestions.append(fb.suggestions)

    # 计算平均分
    avg_scores = conclusion_service.calculate_avg_scores(db, review_id)

    return {
        "summary": f"本次复盘共收到{len(feedbacks)}份反馈，平均目标达成度{avg_scores.get('avg_goal_score', 0):.1f}分。",
        "key_successes": list(set(successes))[:5] if successes else [],
        "common_problems": list(set(problems))[:5] if problems else [],
        "action_suggestions": list(set(suggestions))[:5] if suggestions else [],
        "avg_scores": avg_scores
    }


# 复盘主表
@router.get("/", response_model=List[ReviewResponse])
def list_reviews(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    activity_id: Optional[int] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """获取复盘列表"""
    if activity_id:
        review = review_service.get_by_activity(db, activity_id)
        return [review] if review else []
    if status:
        return review_service.get_by_status(db, status, skip, limit)
    return review_service.get_all(db, skip, limit)


@router.get("/{review_id}", response_model=ReviewResponse)
def get_review(review_id: int, db: Session = Depends(get_db)):
    """获取复盘详情"""
    review = review_service.get(db, review_id)
    if not review:
        raise ReviewException.not_found(review_id)
    return review


@router.post("/", response_model=ReviewResponse)
def create_review(data: ReviewCreate, db: Session = Depends(get_db)):
    """创建复盘"""
    try:
        return review_service.create(db, data.model_dump())
    except Exception as e:
        raise ReviewException.creation_failed(reason=str(e))


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(review_id: int, data: ReviewUpdate, db: Session = Depends(get_db)):
    """更新复盘"""
    review = review_service.update(db, review_id, data.model_dump(exclude_unset=True))
    if not review:
        raise ReviewException.not_found(review_id)
    return review


@router.post("/{review_id}/start")
def start_review(review_id: int, db: Session = Depends(get_db)):
    """启动复盘"""
    review = review_service.start_review(db, review_id)
    return review


@router.post("/{review_id}/complete")
def complete_review(review_id: int, db: Session = Depends(get_db)):
    """完成复盘"""
    review = review_service.complete_review(db, review_id)
    if not review:
        raise ReviewException.not_found(review_id)
    return review


# 复盘反馈
@router.get("/{review_id}/feedbacks", response_model=List[ReviewFeedbackResponse])
def list_feedbacks(
    review_id: int,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """获取复盘反馈列表"""
    return feedback_service.get_by_review(db, review_id, skip, limit)


@router.post("/feedbacks", response_model=ReviewFeedbackResponse)
def create_feedback(data: ReviewFeedbackCreate, db: Session = Depends(get_db)):
    """创建复盘反馈"""
    return feedback_service.create(db, data.model_dump())


@router.put("/feedbacks/{feedback_id}", response_model=ReviewFeedbackResponse)
def update_feedback(feedback_id: int, data: ReviewFeedbackUpdate, db: Session = Depends(get_db)):
    """更新复盘反馈"""
    feedback = feedback_service.update(db, feedback_id, data.model_dump(exclude_unset=True))
    if not feedback:
        raise ReviewException.feedback_not_found(feedback_id)
    return feedback


@router.post("/feedbacks/{feedback_id}/submit", response_model=ReviewFeedbackResponse)
def submit_feedback(feedback_id: int, db: Session = Depends(get_db)):
    """提交反馈"""
    feedback = feedback_service.submit_feedback(db, feedback_id, {})
    if not feedback:
        raise ReviewException.feedback_not_found(feedback_id)
    return feedback


# 复盘结论
@router.get("/{review_id}/conclusion", response_model=ReviewConclusionResponse)
def get_conclusion(review_id: int, db: Session = Depends(get_db)):
    """获取复盘结论"""
    conclusion = conclusion_service.get_by_review(db, review_id)
    if not conclusion:
        raise ReviewException.conclusion_not_found()
    return conclusion


@router.post("/conclusions", response_model=ReviewConclusionResponse)
def create_conclusion(data: ReviewConclusionCreate, db: Session = Depends(get_db)):
    """创建复盘结论"""
    return conclusion_service.create(db, data.model_dump())


@router.put("/conclusions/{conclusion_id}", response_model=ReviewConclusionResponse)
def update_conclusion(conclusion_id: int, data: ReviewConclusionUpdate, db: Session = Depends(get_db)):
    """更新复盘结论"""
    conclusion = conclusion_service.update(db, conclusion_id, data.model_dump(exclude_unset=True))
    if not conclusion:
        raise ReviewException.conclusion_not_found(conclusion_id)
    return conclusion


@router.get("/{review_id}/avg-scores")
def get_review_avg_scores(review_id: int, db: Session = Depends(get_db)):
    """获取复盘平均分"""
    return conclusion_service.calculate_avg_scores(db, review_id)
