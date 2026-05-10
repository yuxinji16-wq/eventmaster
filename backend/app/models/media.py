"""
媒体与传播模型
"""
from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Text
from app.db.base import Base, TimestampMixin


class MediaRecord(Base, TimestampMixin):
    """媒体记录模型 - 记录单场活动的媒体合作和内容发布"""
    __tablename__ = "media_records"

    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False, index=True)

    # 基本信息
    name = Column(String(200), nullable=False, comment="媒体名称/内容标题")
    category = Column(String(20), nullable=False, comment="分类: media_coop=媒体合作, content_pub=内容发布")
    media_type = Column(String(20), nullable=False, comment="类型: interview=采访, press_release=通稿, video=视频, wechat=公众号, video_content=视频内容, social=小红书/微博")

    # 媒体合作专属字段
    media_level = Column(String(20), comment="媒体级别: central=央级, industry=行业, local=地方")
    has_interview = Column(String(10), default="否", comment="是否有采访")
    has_published = Column(String(10), default="否", comment="是否发布稿件")
    has_video_interview = Column(String(10), default="否", comment="是否视频采访")

    # 发布信息
    channel = Column(String(100), comment="渠道/平台")
    url = Column(String(500), comment="发布链接")
    publish_date = Column(String(20), comment="发布日期")

    # 数据指标
    views = Column(Integer, default=0, comment="阅读/播放量")
    interactions = Column(Integer, default=0, comment="互动量(点赞/评论/转发)")
    likes = Column(Integer, default=0, comment="点赞数")
    comments = Column(Integer, default=0, comment="评论数")
    shares = Column(Integer, default=0, comment="转发数")

    # 标记
    is_key_media = Column(String(10), default="否", comment="是否重点媒体")
    notes = Column(Text, comment="备注")


class PremiumResource(Base, TimestampMixin):
    """溢价资源模型 - 记录活动的溢价资源获取情况"""
    __tablename__ = "premium_resources"

    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False, unique=True, index=True)

    # 溢价资源项
    has_official_interview = Column(String(10), default="否", comment="是否有官方采访")
    has_industry_coverage = Column(String(10), default="否", comment="是否有行业大号联合报道")
    has_award_participation = Column(String(10), default="否", comment="是否参与奖项/标准发布")
    has_contact_list = Column(String(10), default="否", comment="是否获取参会名单")
    has_whitepaper = Column(String(10), default="否", comment="是否获取白皮书")

    # 详情记录
    interview_details = Column(Text, comment="官方采访详情")
    coverage_details = Column(Text, comment="行业报道详情")
    award_details = Column(Text, comment="奖项/标准详情")
    contact_list_details = Column(Text, comment="参会名单详情")
    whitepaper_details = Column(Text, comment="白皮书详情")
    notes = Column(Text, comment="备注")
