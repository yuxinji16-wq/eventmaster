"""
网站设置 Schema
"""
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class SiteSettingsBase(BaseModel):
    site_name: Optional[str] = "EventMaster Pro"
    site_logo: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None
    email_template: Optional[str] = None


class SiteSettingsUpdate(BaseModel):
    site_name: Optional[str] = None
    site_logo: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    address: Optional[str] = None
    smtp_host: Optional[str] = None
    smtp_port: Optional[int] = None
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: Optional[str] = None
    email_template: Optional[str] = None


class SiteSettingsResponse(SiteSettingsBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
