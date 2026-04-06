"""
角色管理路由
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import RoleCreate, RoleUpdate, RoleResponse
from app.services.user import RoleService
from app.core.security import get_current_user_from_token, DEFAULT_PERMISSIONS, VIEWER_PERMISSIONS
from app.core.errors import ForbiddenException, NotFoundException

router = APIRouter(prefix="/roles", tags=["角色管理"])


def require_admin(user_data: dict = Depends(get_current_user_from_token)):
    """要求是管理员"""
    if not user_data.get("is_superadmin") and not user_data.get("role_id"):
        raise ForbiddenException()
    return user_data


@router.get("/", response_model=List[RoleResponse])
def list_roles(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取角色列表"""
    role_service = RoleService()
    roles = role_service.get_all(db, skip=skip, limit=limit)
    return [RoleResponse.model_validate(r) for r in roles]


@router.post("/", response_model=RoleResponse)
def create_role(
    role_data: RoleCreate,
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """创建角色"""
    role_service = RoleService()

    # 检查角色名是否存在
    if role_service.get_by_name(db, role_data.name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="角色名已存在"
        )

    role = role_service.create_with_defaults(db, role_data.model_dump())
    return RoleResponse.model_validate(role)


@router.get("/{role_id}", response_model=RoleResponse)
def get_role(
    role_id: int,
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取角色详情"""
    role_service = RoleService()
    role = role_service.get(db, role_id)
    if not role:
        raise NotFoundException("角色", role_id)
    return RoleResponse.model_validate(role)


@router.put("/{role_id}", response_model=RoleResponse)
def update_role(
    role_id: int,
    role_data: RoleUpdate,
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新角色"""
    role_service = RoleService()
    role = role_service.get(db, role_id)
    if not role:
        raise NotFoundException("角色", role_id)

    # 如果要更新角色名，检查是否重复
    if role_data.name and role_data.name != role.name:
        existing = role_service.get_by_name(db, role_data.name)
        if existing and existing.id != role_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="角色名已存在"
            )

    updated = role_service.update(db, role_id, role_data.model_dump(exclude_unset=True))
    return RoleResponse.model_validate(updated)


@router.delete("/{role_id}")
def delete_role(
    role_id: int,
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """删除角色"""
    role_service = RoleService()
    role = role_service.get(db, role_id)
    if not role:
        raise NotFoundException("角色", role_id)

    # 不能删除默认角色
    if role.is_default:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="不能删除默认角色"
        )

    role_service.delete(db, role_id)
    return {"message": "删除成功"}


@router.post("/init-defaults")
def init_default_roles(
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """初始化默认角色"""
    role_service = RoleService()

    # 创建管理员角色
    admin_role = role_service.get_by_name(db, "管理员")
    if not admin_role:
        role_service.create_with_defaults(db, {
            "name": "管理员",
            "description": "系统管理员，拥有所有权限",
            "permissions": DEFAULT_PERMISSIONS,
        })

    # 创建查看者角色
    viewer_role = role_service.get_by_name(db, "查看者")
    if not viewer_role:
        role_service.create_with_defaults(db, {
            "name": "查看者",
            "description": "只读用户，只能查看数据",
            "permissions": VIEWER_PERMISSIONS,
            "is_default": True,
        })

    return {"message": "默认角色初始化成功"}
