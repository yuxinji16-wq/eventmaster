"""
核心配置模块
"""
import os
import secrets
from functools import lru_cache
from pydantic_settings import BaseSettings


def generate_secret_key() -> str:
    """生成安全的随机密钥"""
    return secrets.token_urlsafe(64)


class Settings(BaseSettings):
    """应用配置"""
    APP_NAME: str = "EventMaster Pro API"
    DEBUG: bool = True
    API_V1_PREFIX: str = "/api/v1"

    # 数据库配置 - SQLite 开发，MySQL 生产切换
    DATABASE_URL: str = "sqlite:///./data/eventmaster.db"

    # JWT 配置
    # SECURITY: 生产环境必须设置环境变量，使用强随机密钥
    SECRET_KEY: str = generate_secret_key()  # 默认值仅用于开发，生产必须通过环境变量覆盖
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # Google Gemini API
    GOOGLE_API_KEY: str = ""

    # CORS 配置 - 仅在开发环境允许所有来源
    # SECURITY: 生产环境必须配置精确的域名列表
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://localhost:5173"]  # 默认仅允许本地开发

    class Config:
        env_file = ".env"
        case_sensitive = True

    def validate_production_settings(self):
        """验证生产环境配置"""
        if not self.DEBUG:
            # 生产环境检查
            if self.SECRET_KEY == generate_secret_key() or "change-in-production" in self.SECRET_KEY:
                raise ValueError(
                    "生产环境必须设置 SECRET_KEY 环境变量，使用强随机密钥"
                )
            if "*" in self.CORS_ORIGINS:
                raise ValueError(
                    "生产环境 CORS_ORIGINS 不能包含通配符 '*'，必须配置精确域名"
                )


@lru_cache()
def get_settings() -> Settings:
    """获取配置单例"""
    return Settings()


settings = get_settings()
