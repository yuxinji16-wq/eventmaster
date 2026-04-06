"""
用户和角色 Service
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.repositories.user import UserRepository, RoleRepository
from app.services.base import BaseService
from app.core.security import get_password_hash, verify_password, DEFAULT_PERMISSIONS, VIEWER_PERMISSIONS


class UserService(BaseService[User, UserRepository]):
    """用户 Service"""

    def __init__(self):
        super().__init__(UserRepository())

    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return self.repository.get_by_username(db, username)

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        return self.repository.get_by_email(db, email)

    def get_with_role(self, db: Session, user_id: int) -> Optional[User]:
        """获取用户及其角色"""
        return self.repository.get_with_role(db, user_id)

    def create(self, db: Session, obj_in: dict) -> User:
        """创建用户（密码哈希）"""
        if "password" in obj_in:
            obj_in["password_hash"] = get_password_hash(obj_in.pop("password"))
        return self.repository.create(db, obj_in)

    def update(self, db: Session, id: int, obj_in: dict) -> Optional[User]:
        """更新用户（密码哈希）"""
        if "password" in obj_in:
            obj_in["password_hash"] = get_password_hash(obj_in.pop("password"))
        return self.repository.update(db, id, obj_in)

    def authenticate(self, db: Session, username: str, password: str) -> Optional[User]:
        """验证用户密码"""
        user = self.get_by_username(db, username)
        if not user:
            return None
        if not verify_password(password, user.password_hash):
            return None
        if not user.is_active:
            return None
        return user


class RoleService(BaseService[Role, RoleRepository]):
    """角色 Service"""

    def __init__(self):
        super().__init__(RoleRepository())

    def get_by_name(self, db: Session, name: str) -> Optional[Role]:
        """根据角色名获取角色"""
        return self.repository.get_by_name(db, name)

    def get_default_role(self, db: Session) -> Optional[Role]:
        """获取默认角色"""
        return self.repository.get_default_role(db,)

    def create_with_defaults(self, db: Session, obj_in: dict) -> Role:
        """创建角色（带默认权限）"""
        if "permissions" not in obj_in or not obj_in["permissions"]:
            if obj_in.get("name") == "查看者":
                obj_in["permissions"] = VIEWER_PERMISSIONS
            else:
                obj_in["permissions"] = DEFAULT_PERMISSIONS
        return self.repository.create(db, obj_in)
