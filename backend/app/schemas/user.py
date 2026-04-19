"""
用户和角色 Schema
"""
import re
from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict, field_validator


# 密码强度验证正则
PASSWORD_PATTERN = re.compile(
    r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$'
)


def validate_password_strength(password: str) -> str:
    """
    验证密码强度
    要求: 至少8位，包含大小写字母和数字
    """
    if len(password) < 8:
        raise ValueError("密码长度至少8位")
    if not re.search(r'[A-Z]', password):
        raise ValueError("密码必须包含至少一个大写字母")
    if not re.search(r'[a-z]', password):
        raise ValueError("密码必须包含至少一个小写字母")
    if not re.search(r'\d', password):
        raise ValueError("密码必须包含至少一个数字")
    return password


# ============ User Schema ============

class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool = True
    is_superadmin: bool = False
    role_id: Optional[int] = None


class UserCreate(UserBase):
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码强度"""
        return validate_password_strength(v)


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: Optional[str]) -> Optional[str]:
        """验证密码强度（仅当提供时验证）"""
        if v is not None:
            return validate_password_strength(v)
        return v


class UserResponse(UserBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UserWithPermissions(UserResponse):
    permissions: Dict[str, dict] = {}


# ============ Role Schema ============

class RoleBase(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: Dict[str, dict] = {}
    is_default: bool = False


class RoleCreate(RoleBase):
    pass


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[Dict[str, dict]] = None
    is_default: Optional[bool] = None


class RoleResponse(RoleBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# ============ Auth Schema ============

class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator('password')
    @classmethod
    def validate_password(cls, v: str) -> str:
        """验证密码强度"""
        return validate_password_strength(v)


# ============ Permission Schema ============

class PermissionCheck(BaseModel):
    module: str
    action: str  # view, create, edit, delete


class PermissionResponse(BaseModel):
    user_id: int
    username: str
    role_id: Optional[int]
    role_name: Optional[str]
    permissions: Dict[str, dict]
    is_superadmin: bool
