"""
数据库会话管理
"""
import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.core.logging import get_db_logger

db_logger = get_db_logger()

# 创建引擎
engine = create_engine(
    settings.DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
    pool_pre_ping=True,
    echo=settings.DEBUG,
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """
    获取数据库会话的依赖注入
    自动处理事务回滚
    用法:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            ...
    """
    db = SessionLocal()
    try:
        yield db
    except Exception as e:
        db_logger.error(
            f"数据库操作异常，执行回滚: {str(e)}",
            extra={
                "extra_data": {
                    "error_type": type(e).__name__,
                    "error_message": str(e)
                }
            }
        )
        db.rollback()
        raise
    finally:
        db.close()
