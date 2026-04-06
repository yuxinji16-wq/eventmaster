"""
认证路由
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.user import LoginRequest, LoginResponse, RegisterRequest, UserResponse
from app.services.user import UserService
from app.core.security import create_access_token, get_current_user_id
from app.core.errors import UnauthorizedException

router = APIRouter(prefix="/auth", tags=["认证"])


@router.post("/login", response_model=LoginResponse)
def login(login_data: LoginRequest, db: Session = Depends(get_db)):
    """用户登录"""
    user_service = UserService()
    user = user_service.authenticate(db, login_data.username, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="用户名或密码错误"
        )

    # 创建 token
    token_data = {
        "user_id": user.id,
        "username": user.username,
        "role_id": user.role_id,
        "is_superadmin": user.is_superadmin,
    }
    access_token = create_access_token(token_data)

    return LoginResponse(
        access_token=access_token,
        user=UserResponse.model_validate(user)
    )


@router.post("/register", response_model=UserResponse)
def register(register_data: RegisterRequest, db: Session = Depends(get_db)):
    """注册用户（内部使用）"""
    user_service = UserService()

    # 检查用户名是否存在
    if user_service.get_by_username(db, register_data.username):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="用户名已存在"
        )

    # 检查邮箱是否存在
    if user_service.get_by_email(db, register_data.email):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="邮箱已被注册"
        )

    # 创建用户
    user = user_service.create(db, register_data.model_dump())
    return UserResponse.model_validate(user)


@router.get("/me", response_model=UserResponse)
def get_current_user(
    user_id: int = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """获取当前用户信息"""
    user_service = UserService()
    user = user_service.get(db, user_id)
    if not user:
        raise UnauthorizedException()
    return UserResponse.model_validate(user)
