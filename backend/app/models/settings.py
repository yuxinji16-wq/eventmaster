"""
网站设置模型
"""
from sqlalchemy import Column, String, Integer, Text
from app.db.base import Base, TimestampMixin


class SiteSettings(Base, TimestampMixin):
    """网站设置模型（单例）"""
    __tablename__ = "site_settings"

    site_name = Column(String(200), default="EventMaster Pro")
    site_logo = Column(String(500), nullable=True)  # URL
    contact_email = Column(String(200), nullable=True)
    contact_phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=True)

    # SMTP 设置
    smtp_host = Column(String(200), nullable=True)
    smtp_port = Column(Integer, default=587)
    smtp_username = Column(String(200), nullable=True)
    smtp_password = Column(String(500), nullable=True)  # 加密存储
    smtp_from_email = Column(String(200), nullable=True)

    # 邮件模板
    email_template = Column(Text, nullable=True)
