"""
用户管理路由
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserWithPermissions
from app.services.user import UserService, RoleService
from app.core.security import get_current_user_id, get_current_user_from_token
from app.core.errors import UnauthorizedException, ForbiddenException, NotFoundException

router = APIRouter(prefix="/users", tags=["用户管理"])


def require_admin(user_data: dict = Depends(get_current_user_from_token)):
    """要求是管理员"""
    if not user_data.get("is_superadmin") and not user_data.get("role_id"):
        raise ForbiddenException()
    return user_data


@router.get("", response_model=List[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取用户列表（管理员）"""
    user_service = UserService()
    users = user_service.get_all(db, skip=skip, limit=limit)
    return [UserResponse.model_validate(u) for u in users]


@router.post("", response_model=UserResponse)
def create_user(
    user_data: UserCreate,
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """创建用户（管理员）"""
    user_service = UserService()

    # 检查用户名是否存在
    if user_service.get_by_username(db, user_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )

    # 检查邮箱是否存在
    if user_service.get_by_email(db, user_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )

    user = user_service.create(db, user_data.model_dump())
    return UserResponse.model_validate(user)


@router.get("/{user_id}", response_model=UserWithPermissions)
def get_user(
    user_id: int,
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取用户详情（管理员）"""
    user_service = UserService()
    role_service = RoleService()

    user = user_service.get_with_role(db, user_id)
    if not user:
        raise NotFoundException("用户", user_id)

    # 获取权限
    permissions = {}
    if user.is_superadmin:
        permissions = {  # 超级管理员拥有所有权限
            "activities": {"view": True, "create": True, "edit": True, "delete": True},
            "materials": {"view": True, "create": True, "edit": True, "delete": True},
            "budget": {"view": True, "create": True, "edit": True, "delete": True},
            "suppliers": {"view": True, "create": True, "edit": True, "delete": True},
            "leads": {"view": True, "create": True, "edit": True, "delete": True},
            "reviews": {"view": True, "create": True, "edit": True, "delete": True},
            "account": {"view": True, "create": True, "edit": True, "delete": True},
            "settings": {"view": True, "create": True, "edit": True, "delete": True},
        }
    elif user.role:
        permissions = user.role.permissions or {}

    return UserWithPermissions(
        **UserResponse.model_validate(user).model_dump(),
        permissions=permissions
    )


@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_data: UserUpdate,
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新用户（管理员）"""
    user_service = UserService()

    user = user_service.get(db, user_id)
    if not user:
        raise NotFoundException("用户", user_id)

    # 如果要更新用户名，检查是否重复
    if user_data.username and user_data.username != user.username:
        existing = user_service.get_by_username(db, user_data.username)
        if existing and existing.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )

    # 如果要更新邮箱，检查是否重复
    if user_data.email and user_data.email != user.email:
        existing = user_service.get_by_email(db, user_data.email)
        if existing and existing.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="邮箱已被注册"
            )

    updated = user_service.update(db, user_id, user_data.model_dump(exclude_unset=True))
    return UserResponse.model_validate(updated)


@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """删除用户"""
    user_service = UserService()
    user_service.delete(db, user_id)
    return {"message": "删除成功"}


@router.get("/permissions/me")
def get_my_permissions(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """获取当前用户权限"""
    user_service = UserService()
    role_service = RoleService()

    user = user_service.get_with_role(db, user_id)
    if not user:
        raise NotFoundException("用户", user_id)

    permissions = {}
    role_name = None
    if user.is_superadmin:
        permissions = {
            "activities": {"view": True, "create": True, "edit": True, "delete": True},
            "materials": {"view": True, "create": True, "edit": True, "delete": True},
            "budget": {"view": True, "create": True, "edit": True, "delete": True},
            "suppliers": {"view": True, "create": True, "edit": True, "delete": True},
            "leads": {"view": True, "create": True, "edit": True, "delete": True},
            "reviews": {"view": True, "create": True, "edit": True, "delete": True},
            "account": {"view": True, "create": True, "edit": True, "delete": True},
            "settings": {"view": True, "create": True, "edit": True, "delete": True},
        }
        role_name = "超级管理员"
    elif user.role:
        permissions = user.role.permissions or {}
        role_name = user.role.name
    else:
        # 无角色用户，默认无权限
        permissions = {
            "activities": {"view": False, "create": False, "edit": False, "delete": False},
            "materials": {"view": False, "create": False, "edit": False, "delete": False},
            "budget": {"view": False, "create": False, "edit": False, "delete": False},
            "suppliers": {"view": False, "create": False, "edit": False, "delete": False},
            "leads": {"view": False, "create": False, "edit": False, "delete": False},
            "reviews": {"view": False, "create": False, "edit": False, "delete": False},
            "account": {"view": False, "create": False, "edit": False, "delete": False},
            "settings": {"view": False, "create": False, "edit": False, "delete": False},
        }
        role_name = "无角色"

    return {
        "user_id": user.id,
        "username": user.username,
        "role_id": user.role_id,
        "role_name": role_name,
        "permissions": permissions,
        "is_superadmin": user.is_superadmin,
    }
