"""通知中心 API"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from datetime import datetime
from app.db.session import get_db
from app.core.security import get_current_user_from_token

router = APIRouter(prefix="/notifications", tags=["通知中心"])


class NotificationBase(BaseModel):
    type: str  # info, success, warning, error, system
    title: str
    content: str
    priority: str = "normal"  # low, normal, high, urgent
    module: Optional[str] = None
    action_url: Optional[str] = None
    metadata: Optional[dict] = None


class Notification(NotificationBase):
    id: int
    user_id: int
    is_read: bool = False
    created_at: datetime

    class Config:
        from_attributes = True


# 使用内存存储（生产环境应使用数据库）
notifications_store: List[dict] = [
    {
        "id": 1,
        "user_id": 1,
        "type": "warning",
        "title": "物料库存不足",
        "content": "品牌易拉宝当前库存仅剩 5 个，请及时补充。",
        "priority": "high",
        "module": "material",
        "action_url": "/materials",
        "metadata": {"material_id": 3},
        "is_read": False,
        "created_at": "2026-04-19T10:00:00",
    },
    {
        "id": 2,
        "user_id": 1,
        "type": "info",
        "title": "活动即将开始",
        "content": "2025春季新品发布会将于 3 天后举行。",
        "priority": "normal",
        "module": "activity",
        "action_url": "/activities/7",
        "metadata": {"activity_id": 7},
        "is_read": False,
        "created_at": "2026-04-19T08:00:00",
    },
    {
        "id": 3,
        "user_id": 1,
        "type": "system",
        "title": "系统更新通知",
        "content": "EventMaster Pro 已更新至 v1.1.0。",
        "priority": "low",
        "module": "system",
        "is_read": True,
        "created_at": "2026-04-18T09:00:00",
    },
]

next_id = 4


@router.get("/", response_model=List[dict])
def get_notifications(
    user_data: dict = Depends(get_current_user_from_token),
    db=Depends(get_db)
):
    """获取当前用户的所有通知"""
    return [n for n in notifications_store if n["user_id"] == user_data.get("user_id", 1)]


@router.post("/", response_model=dict)
def create_notification(
    notification: NotificationBase,
    user_data: dict = Depends(get_current_user_from_token),
    db=Depends(get_db)
):
    """创建新通知"""
    global next_id
    new_notif = {
        "id": next_id,
        "user_id": user_data.get("user_id", 1),
        **notification.model_dump(),
        "is_read": False,
        "created_at": datetime.now().isoformat(),
    }
    notifications_store.append(new_notif)
    next_id += 1
    return new_notif


@router.patch("/{notification_id}/read")
def mark_as_read(
    notification_id: int,
    user_data: dict = Depends(get_current_user_from_token),
    db=Depends(get_db)
):
    """标记通知为已读"""
    for n in notifications_store:
        if n["id"] == notification_id and n["user_id"] == user_data.get("user_id", 1):
            n["is_read"] = True
            return {"message": "已标记为已读"}
    raise HTTPException(status_code=404, detail="通知不存在")


@router.patch("/read-all")
def mark_all_as_read(
    user_data: dict = Depends(get_current_user_from_token),
    db=Depends(get_db)
):
    """全部标为已读"""
    for n in notifications_store:
        if n["user_id"] == user_data.get("user_id", 1):
            n["is_read"] = True
    return {"message": "全部已读"}


@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    user_data: dict = Depends(get_current_user_from_token),
    db=Depends(get_db)
):
    """删除通知"""
    global notifications_store
    for i, n in enumerate(notifications_store):
        if n["id"] == notification_id and n["user_id"] == user_data.get("user_id", 1):
            notifications_store.pop(i)
            return {"message": "已删除"}
    raise HTTPException(status_code=404, detail="通知不存在")
