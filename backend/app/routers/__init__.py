"""
API Router 导出
"""
from app.routers.activity import router as activity_router
from app.routers.task import router as task_router
from app.routers.material import router as material_router
from app.routers.supplier import router as supplier_router
from app.routers.budget import router as budget_router
from app.routers.opportunity import router as opportunity_router
from app.routers.review import router as review_router
from app.routers.dashboard import router as dashboard_router
from app.routers.auth import router as auth_router
from app.routers.users import router as users_router
from app.routers.roles import router as roles_router
from app.routers.settings import router as settings_router
from app.routers.notification import router as notification_router
from app.routers.media import router as media_router

__all__ = [
    "activity_router",
    "task_router",
    "material_router",
    "supplier_router",
    "budget_router",
    "opportunity_router",
    "review_router",
    "dashboard_router",
    "auth_router",
    "users_router",
    "roles_router",
    "settings_router",
    "notification_router",
    "media_router",
]
