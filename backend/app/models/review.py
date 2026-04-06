"""
复盘模型
"""
from sqlalchemy import Column, String, Float, Integer, ForeignKey, Text, Boolean, JSON
from app.db.base import Base, TimestampMixin


class Review(Base, TimestampMixin):
    """复盘主表"""
    __tablename__ = "reviews"

    activity_id = Column(Integer, ForeignKey("activities.id"))
    status = Column(String(20))  # 未开始, 进行中, 待确认, 已完成
    expected_participants = Column(Integer, default=0)
    participant_count = Column(Integer, default=0)
    lead_count = Column(Integer, default=0)
    confirmed_by = Column(String(100))
    confirmed_at = Column(String(30))
    reminded_at = Column(String(30))
    reminded_count = Column(Integer, default=0)


class ReviewFeedback(Base, TimestampMixin):
    """复盘评价"""
    __tablename__ = "review_feedbacks"

    review_id = Column(Integer, ForeignKey("reviews.id"))
    evaluator_id = Column(String(36))
    evaluator_name = Column(String(100))
    evaluator_role = Column(String(100))
    goal_score = Column(Float)  # 目标达成度
    lead_quality_score = Column(Float)  # 线索质量
    execution_score = Column(Float)  # 执行稳定性
    resource_score = Column(Float)  # 资源利用效率
    brand_score = Column(Float)  # 品牌曝光效果
    successes = Column(Text)  # 成功经验
    problems = Column(Text)  # 存在问题
    suggestions = Column(Text)  # 优化建议
    tags = Column(JSON)  # 标签列表
    is_submitted = Column(Boolean, default=False)
    submitted_at = Column(String(30))


class ReviewConclusion(Base, TimestampMixin):
    """复盘结论"""
    __tablename__ = "review_conclusions"

    review_id = Column(Integer, ForeignKey("reviews.id"), unique=True)
    ai_summary = Column(Text)
    key_successes = Column(JSON)
    common_problems = Column(JSON)
    action_suggestions = Column(JSON)
    manager_summary = Column(Text)
    manager_id = Column(String(36))
    manager_name = Column(String(100))
    avg_goal_score = Column(Float)
    avg_lead_quality_score = Column(Float)
    avg_execution_score = Column(Float)
    avg_resource_score = Column(Float)
    avg_brand_score = Column(Float)
    overall_score = Column(Float)
