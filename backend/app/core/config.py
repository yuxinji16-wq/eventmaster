"""
核心配置模块
"""
import os
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """应用配置"""
    APP_NAME: str = "EventMaster Pro API"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # 数据库配置 - SQLite 开发，MySQL 生产切换
    DATABASE_URL: str = "sqlite:///./data/eventmaster.db"

    # JWT 配置
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google Gemini API
    GOOGLE_API_KEY: str = ""

    # CORS 配置 - 开发环境允许所有来源
    CORS_ORIGINS: list[str] = ["*"]

    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
