"""
请求日志与错误处理中间件
EventMaster Pro - 全生命周期活动管理平台
"""
import time
import traceback
from typing import Callable
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.logging import get_request_logger, get_error_logger
from app.core.errors import AppException, ErrorCode


request_logger = get_request_logger()
error_logger = get_error_logger()


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """请求日志中间件 - 记录所有入站请求和响应"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("X-Request-ID", f"req-{int(time.time() * 1000)}")
        request.state.request_id = request_id

        start_time = time.time()

        # 记录入站请求
        client_ip = request.client.host if request.client else "unknown"
        request_logger.info(
            f"--> {request.method} {request.url.path}",
            extra={
                "extra_data": {
                    "request_id": request_id,
                    "method": request.method,
                    "path": request.url.path,
                    "query_params": dict(request.query_params),
                    "client_ip": client_ip,
                    "user_agent": request.headers.get("user-agent", "unknown")
                }
            }
        )

        try:
            response = await call_next(request)

            # 记录成功响应
            duration_ms = (time.time() - start_time) * 1000
            request_logger.info(
                f"<-- {request.method} {request.url.path} -> {response.status_code} ({duration_ms:.2f}ms)",
                extra={
                    "extra_data": {
                        "request_id": request_id,
                        "status_code": response.status_code,
                        "duration_ms": round(duration_ms, 2)
                    }
                }
            )

            # 添加请求 ID 到响应头
            response.headers["X-Request-ID"] = request_id
            return response

        except Exception as exc:
            duration_ms = (time.time() - start_time) * 1000
            error_logger.error(
                f"<! {request.method} {request.url.path} -> ERROR ({duration_ms:.2f}ms)",
                extra={
                    "extra_data": {
                        "request_id": request_id,
                        "method": request.method,
                        "path": request.url.path,
                        "duration_ms": round(duration_ms, 2),
                        "error_type": type(exc).__name__,
                        "error_message": str(exc)
                    }
                }
            )
            raise


class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    """错误处理中间件 - 捕获异常并返回结构化错误响应"""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        try:
            return await call_next(request)
        except AppException as exc:
            # 应用自定义异常
            error_logger.error(
                f"[{exc.error_code}] {exc.detail}",
                extra={
                    "extra_data": {
                        "error_code": exc.error_code,
                        "detail": exc.detail,
                        "context": exc.context,
                        "path": request.url.path,
                        "method": request.method
                    }
                }
            )
            return JSONResponse(
                status_code=exc.status_code,
                content={
                    "code": exc.error_code,
                    "message": exc.detail,
                    "context": exc.context,
                    "request_id": getattr(request.state, "request_id", None)
                },
                headers={
                    "X-Request-ID": getattr(request.state, "request_id", "")
                }
            )
        except Exception as exc:
            # 未处理的异常
            tb = traceback.format_exc()
            error_logger.error(
                f"[E1000] 未处理的异常: {str(exc)}",
                extra={
                    "extra_data": {
                        "error_code": ErrorCode.INTERNAL_ERROR,
                        "error_type": type(exc).__name__,
                        "error_message": str(exc),
                        "path": request.url.path,
                        "method": request.method,
                        "traceback": tb
                    }
                }
            )
            return JSONResponse(
                status_code=500,
                content={
                    "code": ErrorCode.INTERNAL_ERROR,
                    "message": "内部服务器错误",
                    "context": {
                        "error_type": type(exc).__name__,
                        "error_id": getattr(request.state, "request_id", None)
                    },
                    "request_id": getattr(request.state, "request_id", None)
                },
                headers={
                    "X-Request-ID": getattr(request.state, "request_id", "")
                }
            )
