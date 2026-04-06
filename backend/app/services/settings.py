"""
网站设置 Service
"""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.settings import SiteSettings
from app.repositories.base import BaseRepository


class SettingsRepository(BaseRepository[SiteSettings]):
    """设置 Repository"""

    def __init__(self):
        super().__init__(SiteSettings)


class SettingsService:
    """设置 Service（单例模式）"""

    def __init__(self):
        self.repository = SettingsRepository()

    def get_settings(self, db: Session) -> Optional[SiteSettings]:
        """获取设置（只有一条）"""
        settings = db.query(SiteSettings).first()
        if not settings:
            # 如果不存在，创建一个默认设置
            settings = SiteSettings()
            db.add(settings)
            db.commit()
            db.refresh(settings)
        return settings

    def update_settings(self, db: Session, data: dict) -> SiteSettings:
        """更新设置"""
        settings = self.get_settings(db)
        for key, value in data.items():
            if value is not None:
                setattr(settings, key, value)
        db.commit()
        db.refresh(settings)
        return settings
