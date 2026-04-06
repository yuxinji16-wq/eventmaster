"""
API Router 导出
"""
from app.routers.activity import router as activity_router
from app.routers.material import router as material_router
from app.routers.supplier import router as supplier_router
from app.routers.budget import router as budget_router
from app.routers.opportunity import router as opportunity_router
from app.routers.review import router as review_router
from app.routers.dashboard import router as dashboard_router

__all__ = [
    "activity_router",
    "material_router",
    "supplier_router",
    "budget_router",
    "opportunity_router",
    "review_router",
    "dashboard_router",
]
