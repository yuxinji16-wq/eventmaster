"""
媒体与传播 Schema
"""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict


# ============ MediaRecord Schema ============

class MediaRecordBase(BaseModel):
    """媒体记录基础字段"""
    activity_id: int
    name: str
    category: str  # media_coop=媒体合作, content_pub=内容发布
    media_type: str  # interview=采访, press_release=通稿, video=视频, wechat=公众号, video_content=视频内容, social=小红书/微博
    media_level: Optional[str] = None  # central=央级, industry=行业, local=地方
    has_interview: Optional[str] = "否"
    has_published: Optional[str] = "否"
    has_video_interview: Optional[str] = "否"
    channel: Optional[str] = None
    url: Optional[str] = None
    publish_date: Optional[str] = None
    views: Optional[int] = 0
    interactions: Optional[int] = 0
    likes: Optional[int] = 0
    comments: Optional[int] = 0
    shares: Optional[int] = 0
    is_key_media: Optional[str] = "否"
    notes: Optional[str] = None


class MediaRecordCreate(MediaRecordBase):
    pass


class MediaRecordUpdate(BaseModel):
    """媒体记录更新字段（全部可选）"""
    name: Optional[str] = None
    category: Optional[str] = None
    media_type: Optional[str] = None
    media_level: Optional[str] = None
    has_interview: Optional[str] = None
    has_published: Optional[str] = None
    has_video_interview: Optional[str] = None
    channel: Optional[str] = None
    url: Optional[str] = None
    publish_date: Optional[str] = None
    views: Optional[int] = None
    interactions: Optional[int] = None
    likes: Optional[int] = None
    comments: Optional[int] = None
    shares: Optional[int] = None
    is_key_media: Optional[str] = None
    notes: Optional[str] = None


class MediaRecordResponse(MediaRecordBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============ PremiumResource Schema ============

class PremiumResourceBase(BaseModel):
    """溢价资源基础字段"""
    activity_id: int
    has_official_interview: Optional[str] = "否"
    has_industry_coverage: Optional[str] = "否"
    has_award_participation: Optional[str] = "否"
    has_contact_list: Optional[str] = "否"
    has_whitepaper: Optional[str] = "否"
    interview_details: Optional[str] = None
    coverage_details: Optional[str] = None
    award_details: Optional[str] = None
    contact_list_details: Optional[str] = None
    whitepaper_details: Optional[str] = None
    notes: Optional[str] = None


class PremiumResourceCreate(PremiumResourceBase):
    pass


class PremiumResourceUpdate(BaseModel):
    """溢价资源更新字段"""
    has_official_interview: Optional[str] = None
    has_industry_coverage: Optional[str] = None
    has_award_participation: Optional[str] = None
    has_contact_list: Optional[str] = None
    has_whitepaper: Optional[str] = None
    interview_details: Optional[str] = None
    coverage_details: Optional[str] = None
    award_details: Optional[str] = None
    contact_list_details: Optional[str] = None
    whitepaper_details: Optional[str] = None
    notes: Optional[str] = None


class PremiumResourceResponse(PremiumResourceBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============ 统计汇总 Schema ============

class MediaStats(BaseModel):
    """媒体与传播统计汇总"""
    activity_id: int
    # 数量统计
    total_media_count: int = 0  # 媒体合作数量
    total_content_count: int = 0  # 内容发布数量
    total_record_count: int = 0  # 总记录数
    # 曝光统计
    total_views: int = 0  # 总曝光量（阅读+播放）
    # 互动统计
    total_interactions: int = 0  # 总互动量
    total_likes: int = 0
    total_comments: int = 0
    total_shares: int = 0
    # 重点媒体
    key_media_count: int = 0  # 重点媒体数量
    # 传播效果评分（0-100）
    effectiveness_score: float = 0.0
    # 溢价资源统计
    premium_has_official_interview: str = "否"
    premium_has_industry_coverage: str = "否"
    premium_has_award_participation: str = "否"
    premium_has_contact_list: str = "否"
    premium_has_whitepaper: str = "否"


class MediaStatsResponse(BaseModel):
    """统计响应"""
    stats: MediaStats
    media_records: List[MediaRecordResponse]
    premium_resource: Optional[PremiumResourceResponse] = None
