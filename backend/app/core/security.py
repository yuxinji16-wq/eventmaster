"""
安全模块 - JWT 认证和密码哈希
"""
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.errors import UnauthorizedException, ForbiddenException

# 密码哈希上下文
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Bearer token 认证
security = HTTPBearer()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """验证密码"""
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """哈希密码"""
    return pwd_context.hash(password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """创建 JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=24)  # 默认24小时
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def decode_access_token(token: str) -> Optional[dict]:
    """解码 JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None


def get_current_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> int:
    """获取当前用户 ID（从 token 中）"""
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise UnauthorizedException()
    user_id: int = payload.get("user_id")
    if user_id is None:
        raise UnauthorizedException()
    return user_id


def get_current_user_from_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """获取当前用户信息（从 token 中）"""
    token = credentials.credentials
    payload = decode_access_token(token)
    if payload is None:
        raise UnauthorizedException()
    return {
        "user_id": payload.get("user_id"),
        "username": payload.get("username"),
        "role_id": payload.get("role_id"),
        "is_superadmin": payload.get("is_superadmin", False),
    }


# 默认权限矩阵
DEFAULT_PERMISSIONS = {
    "activities": {"view": True, "create": True, "edit": True, "delete": True},
    "materials": {"view": True, "create": True, "edit": True, "delete": True},
    "budget": {"view": True, "create": True, "edit": True, "delete": True},
    "suppliers": {"view": True, "create": True, "edit": True, "delete": True},
    "leads": {"view": True, "create": True, "edit": True, "delete": True},
    "reviews": {"view": True, "create": True, "edit": True, "delete": True},
    "account": {"view": True, "create": True, "edit": True, "delete": True},
    "settings": {"view": True, "create": True, "edit": True, "delete": True},
}

# 查看者权限矩阵
VIEWER_PERMISSIONS = {
    "activities": {"view": True, "create": False, "edit": False, "delete": False},
    "materials": {"view": True, "create": False, "edit": False, "delete": False},
    "budget": {"view": True, "create": False, "edit": False, "delete": False},
    "suppliers": {"view": True, "create": False, "edit": False, "delete": False},
    "leads": {"view": True, "create": False, "edit": False, "delete": False},
    "reviews": {"view": True, "create": False, "edit": False, "delete": False},
    "account": {"view": False, "create": False, "edit": False, "delete": False},
    "settings": {"view": False, "create": False, "edit": False, "delete": False},
}
