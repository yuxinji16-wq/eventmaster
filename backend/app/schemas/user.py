"""
用户和角色 Schema
"""
from typing import Optional, Dict
from datetime import datetime
from pydantic import BaseModel, EmailStr, ConfigDict


# ============ User Schema ============

class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_active: bool = True
    is_superadmin: bool = False
    role_id: Optional[int] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None
    is_active: Optional[bool] = None
    role_id: Optional[int] = None


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
