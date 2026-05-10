"""
EventMaster Pro API
全生命周期活动管理平台 - 后端服务
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.middleware import RequestLoggingMiddleware, ErrorHandlingMiddleware
from app.db.init_db import init_db
from app.routers import (
    activity_router,
    task_router,
    material_router,
    supplier_router,
    budget_router,
    opportunity_router,
    review_router,
    dashboard_router,
    auth_router,
    users_router,
    roles_router,
    settings_router,
    notification_router,
    media_router,
)

app = FastAPI(
    title=settings.APP_NAME,
    description="全生命周期活动管理平台 API",
    version="1.0.0",
    redirect_slashes=False,  # 禁用尾部斜杠重定向
)

# CORS配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 请求日志中间件（先注册，先执行）
app.add_middleware(RequestLoggingMiddleware)
# 错误处理中间件（后注册，最后执行）
app.add_middleware(ErrorHandlingMiddleware)


@app.on_event("startup")
def on_startup():
    """应用启动时初始化数据库"""
    init_db()


# 注册路由（统一添加 /api 前缀）
app.include_router(activity_router, prefix="/api")
app.include_router(task_router, prefix="/api")
app.include_router(material_router, prefix="/api")
app.include_router(supplier_router, prefix="/api")
app.include_router(budget_router, prefix="/api")
app.include_router(opportunity_router, prefix="/api")
app.include_router(review_router, prefix="/api")
app.include_router(dashboard_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(users_router, prefix="/api")
app.include_router(roles_router, prefix="/api")
app.include_router(settings_router, prefix="/api")
app.include_router(notification_router, prefix="/api")
app.include_router(media_router, prefix="/api")


@app.get("/")
def root():
    """API根路径"""
    return {
        "name": settings.APP_NAME,
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
def health_check():
    """健康检查"""
    return {"status": "healthy"}
