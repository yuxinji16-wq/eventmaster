"""
用户和角色 Repository
"""
from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    """用户 Repository"""

    def __init__(self):
        super().__init__(User)

    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        return db.query(User).filter(User.email == email).first()

    def get_active_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """获取活跃用户"""
        return db.query(User).filter(User.is_active == True).offset(skip).limit(limit).all()

    def get_with_role(self, db: Session, user_id: int) -> Optional[User]:
        """获取用户及其角色"""
        return db.query(User).filter(User.id == user_id).first()


class RoleRepository(BaseRepository[Role]):
    """角色 Repository"""

    def __init__(self):
        super().__init__(Role)

    def get_by_name(self, db: Session, name: str) -> Optional[Role]:
        """根据角色名获取角色"""
        return db.query(Role).filter(Role.name == name).first()

    def get_default_role(self, db: Session) -> Optional[Role]:
        """获取默认角色"""
        return db.query(Role).filter(Role.is_default == True).first()
