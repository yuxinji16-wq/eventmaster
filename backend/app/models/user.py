"""
用户和角色模型
"""
from sqlalchemy import Column, Integer, String, Boolean, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.db.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """用户模型"""
    __tablename__ = "users"

    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(200), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True)
    is_superadmin = Column(Boolean, default=False)
    role_id = Column(Integer, ForeignKey("roles.id"), nullable=True)

    # 关系
    role = relationship("Role", back_populates="users")


class Role(Base, TimestampMixin):
    """角色模型"""
    __tablename__ = "roles"

    name = Column(String(100), unique=True, nullable=False, index=True)
    description = Column(String(500))
    permissions = Column(JSON, default=dict)  # 权限规则
    is_default = Column(Boolean, default=False)

    # 关系
    users = relationship("User", back_populates="role")
