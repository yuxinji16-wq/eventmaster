"""
网站设置路由
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.settings import SiteSettingsUpdate, SiteSettingsResponse
from app.services.settings import SettingsService
from app.core.security import get_current_user_from_token
from app.core.errors import ForbiddenException
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

router = APIRouter(prefix="/settings", tags=["网站设置"])


def require_admin(user_data: dict = Depends(get_current_user_from_token)):
    """要求是管理员"""
    if not user_data.get("is_superadmin") and not user_data.get("role_id"):
        raise ForbiddenException()
    return user_data


@router.get("", response_model=SiteSettingsResponse)
def get_settings(
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """获取网站设置"""
    settings_service = SettingsService()
    settings = settings_service.get_settings(db)
    return SiteSettingsResponse.model_validate(settings)


@router.put("", response_model=SiteSettingsResponse)
def update_settings(
    settings_data: SiteSettingsUpdate,
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """更新网站设置"""
    settings_service = SettingsService()
    updated = settings_service.update_settings(db, settings_data.model_dump(exclude_unset=True))
    return SiteSettingsResponse.model_validate(updated)


@router.post("/test-email")
def send_test_email(
    test_email: str,
    _: dict = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """发送测试邮件"""
    settings_service = SettingsService()
    settings = settings_service.get_settings(db)

    if not settings.smtp_host or not settings.smtp_username or not settings.smtp_password:
        raise HTTPException(
            status_code=400,
            detail="SMTP 配置不完整，请先配置邮件设置"
        )

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.smtp_from_email or settings.smtp_username
        msg['To'] = test_email
        msg['Subject'] = 'EventMaster Pro - 测试邮件'

        body = '这是一封来自 EventMaster Pro 的测试邮件。如果您收到此邮件，说明邮件配置正确。'
        msg.attach(MIMEText(body, 'plain'))

        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_username, settings.smtp_password)
            server.send_message(msg)

        return {"message": f"测试邮件已发送到 {test_email}"}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"发送失败: {str(e)}"
        )
