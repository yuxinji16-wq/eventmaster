"""
结构化日志配置
EventMaster Pro - 全生命周期活动管理平台
"""
import logging
import sys
from datetime import datetime
from typing import Optional, Dict, Any
from pathlib import Path
from logging.handlers import RotatingFileHandler


# 日志目录
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# 日志轮转配置
MAX_LOG_SIZE = 10 * 1024 * 1024  # 10MB
BACKUP_COUNT = 5  # 保留5个备份文件


class ErrorCodeFormatter(logging.Formatter):
    """包含错误码的日志格式器"""

    def format(self, record: logging.LogRecord) -> str:
        parts = [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            f"[{record.levelname}]",
            f"[{record.name}]"
        ]

        # 添加错误码（如果存在）
        if hasattr(record, "error_code"):
            parts.append(f"[{record.error_code}]")

        parts.append(record.getMessage())

        # 添加上下文
        if hasattr(record, "extra_data"):
            parts.append(f"context={record.extra_data}")

        # 添加异常信息
        if record.exc_info:
            parts.append(f"exception={record.exc_text}")

        return " ".join(parts)


class DetailedFormatter(logging.Formatter):
    """详细日志格式器"""

    def format(self, record: logging.LogRecord) -> str:
        parts = [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S.%f")[:-3],
            f"[{record.levelname}]",
            f"[{record.name}]",
            f"[{record.module}:{record.funcName}:{record.lineno}]"
        ]

        if hasattr(record, "error_code"):
            parts.append(f"[{record.error_code}]")

        parts.append(record.getMessage())

        if hasattr(record, "extra_data"):
            import json
            parts.append(f"data={json.dumps(record.extra_data, ensure_ascii=False)}")

        return " ".join(parts)


def setup_logging(
    name: str,
    level: int = logging.INFO,
    log_file: Optional[str] = None,
    include_error_context: bool = True
) -> logging.Logger:
    """
    设置结构化日志记录器

    Args:
        name: 日志记录器名称
        level: 日志级别
        log_file: 日志文件名（可选）
        include_error_context: 是否包含错误上下文

    Returns:
        配置好的日志记录器
    """
    logger = logging.getLogger(name)
    logger.setLevel(level)
    logger.handlers.clear()

    # 避免重复添加 handler
    if logger.handlers:
        return logger

    # 控制台处理器
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)
    if include_error_context:
        console_handler.setFormatter(ErrorCodeFormatter())
    else:
        console_handler.setFormatter(
            logging.Formatter("%(asctime)s [%(levelname)s] %(name)s: %(message)s")
        )
    logger.addHandler(console_handler)

    # 文件处理器（使用轮转日志，避免文件无限增长）
    if log_file:
        file_handler = RotatingFileHandler(
            LOG_DIR / log_file,
            maxBytes=MAX_LOG_SIZE,
            backupCount=BACKUP_COUNT,
            encoding="utf-8"
        )
        file_handler.setLevel(level)
        file_handler.setFormatter(DetailedFormatter())
        logger.addHandler(file_handler)

    return logger


def get_logger(name: str, **kwargs) -> logging.Logger:
    """获取预配置的日志记录器"""
    return setup_logging(name, **kwargs)


# ==================== 预配置日志记录器 ====================

def get_app_logger() -> logging.Logger:
    """通用应用日志记录器"""
    return get_logger("app", log_file="app.log")


def get_request_logger() -> logging.Logger:
    """HTTP 请求日志记录器"""
    return get_logger("app.requests", log_file="requests.log")


def get_error_logger() -> logging.Logger:
    """错误专用日志记录器"""
    return get_logger("app.errors", level=logging.ERROR, log_file="errors.log")


def get_db_logger() -> logging.Logger:
    """数据库操作日志记录器"""
    return get_logger("app.db", log_file="db.log")


def get_api_logger() -> logging.Logger:
    """API 调用日志记录器"""
    return get_logger("app.api", log_file="api.log")


# ==================== 日志辅助函数 ====================

def log_request(
    logger: logging.Logger,
    method: str,
    path: str,
    status_code: int = None,
    duration_ms: float = None,
    **kwargs
):
    """记录 API 请求"""
    msg_parts = [f"{method} {path}"]
    if status_code:
        msg_parts.append(f"-> {status_code}")
    if duration_ms:
        msg_parts.append(f"({duration_ms:.2f}ms)")

    extra = {"extra_data": kwargs} if kwargs else None
    if extra:
        logger.info(" ".join(msg_parts), extra=extra)
    else:
        logger.info(" ".join(msg_parts))


def log_error(
    logger: logging.Logger,
    error_code: str,
    message: str,
    **kwargs
):
    """记录错误（带错误码）"""
    extra = {"extra_data": kwargs} if kwargs else None
    extra_data = kwargs if kwargs else {}

    if extra:
        logger.error(message, extra=extra)
    else:
        logger.error(message)


def log_db_operation(
    logger: logging.Logger,
    operation: str,
    table: str,
    record_id: int = None,
    success: bool = True,
    duration_ms: float = None,
    error: str = None
):
    """记录数据库操作"""
    msg_parts = [f"DB {operation} on {table}"]
    if record_id:
        msg_parts.append(f"(id={record_id})")
    if duration_ms:
        msg_parts.append(f"-> {duration_ms:.2f}ms")

    if error:
        msg_parts.append(f"ERROR: {error}")
        logger.error(" ".join(msg_parts))
    elif not success:
        logger.warning(" ".join(msg_parts))
    else:
        logger.info(" ".join(msg_parts))
