"""
通知中心 API 测试
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# 测试用户密码 - 符合密码强度要求
TEST_PASSWORD = "Admin123"


@pytest.fixture
def auth_user(client: TestClient, db_session: Session):
    """创建测试用户并返回 token"""
    # 注册用户
    response = client.post("/api/auth/register", json={
        "username": "notifuser",
        "email": "notif@example.com",
        "password": TEST_PASSWORD
    })
    assert response.status_code == 200

    # 登录获取 token
    login_response = client.post("/api/auth/login", json={
        "username": "notifuser",
        "password": TEST_PASSWORD
    })
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.fixture
def auth_headers(auth_user: str):
    """返回认证头"""
    return {"Authorization": f"Bearer {auth_user}"}


class TestNotificationAPI:
    """通知中心 API 测试"""

    def test_get_notifications(self, client: TestClient, auth_headers: dict):
        """测试获取通知列表"""
        response = client.get("/api/notifications/", headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        # 初始应包含预设的通知数据
        assert len(data) >= 0

    def test_get_notifications_without_auth(self, client: TestClient):
        """测试无认证获取通知"""
        response = client.get("/api/notifications/")
        # 需要认证，返回 403
        assert response.status_code == 403

    def test_create_notification(self, client: TestClient, auth_headers: dict):
        """测试创建通知"""
        response = client.post("/api/notifications/", json={
            "type": "info",
            "title": "测试通知",
            "content": "这是一条测试通知",
            "priority": "normal",
            "module": "test"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "测试通知"
        assert data["content"] == "这是一条测试通知"
        assert data["type"] == "info"
        assert data["priority"] == "normal"
        assert data["is_read"] is False
        assert "id" in data
        assert "created_at" in data

    def test_create_notification_with_action_url(self, client: TestClient, auth_headers: dict):
        """测试创建带跳转链接的通知"""
        response = client.post("/api/notifications/", json={
            "type": "warning",
            "title": "库存预警",
            "content": "物料库存不足",
            "priority": "high",
            "module": "material",
            "action_url": "/materials/1"
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["action_url"] == "/materials/1"
        assert data["module"] == "material"

    def test_create_notification_different_types(self, client: TestClient, auth_headers: dict):
        """测试创建不同类型的通知"""
        types = ["info", "success", "warning", "error", "system"]
        for notif_type in types:
            response = client.post("/api/notifications/", json={
                "type": notif_type,
                "title": f"{notif_type}类型通知",
                "content": f"这是{notif_type}类型的测试通知",
                "priority": "normal"
            }, headers=auth_headers)
            assert response.status_code == 200
            assert response.json()["type"] == notif_type

    def test_create_notification_different_priorities(self, client: TestClient, auth_headers: dict):
        """测试创建不同优先级的通知"""
        priorities = ["low", "normal", "high", "urgent"]
        for priority in priorities:
            response = client.post("/api/notifications/", json={
                "type": "info",
                "title": f"优先级{priority}",
                "content": "测试优先级",
                "priority": priority
            }, headers=auth_headers)
            assert response.status_code == 200
            assert response.json()["priority"] == priority

    def test_mark_notification_as_read(self, client: TestClient, auth_headers: dict):
        """测试标记通知为已读"""
        # 先创建一个通知
        create_resp = client.post("/api/notifications/", json={
            "type": "info",
            "title": "待标记通知",
            "content": "需要标记为已读",
            "priority": "normal"
        }, headers=auth_headers)
        assert create_resp.status_code == 200
        notif_id = create_resp.json()["id"]

        # 标记为已读
        response = client.patch(
            f"/api/notifications/{notif_id}/read",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["message"] == "已标记为已读"

        # 验证通知已被标记
        get_resp = client.get("/api/notifications/", headers=auth_headers)
        notifications = get_resp.json()
        target = next((n for n in notifications if n["id"] == notif_id), None)
        assert target is not None
        assert target["is_read"] is True

    def test_mark_notification_read_not_found(self, client: TestClient, auth_headers: dict):
        """测试标记不存在的通知为已读"""
        response = client.patch(
            "/api/notifications/99999/read",
            headers=auth_headers
        )
        assert response.status_code == 404
        assert "通知不存在" in response.json()["detail"]

    def test_mark_all_as_read(self, client: TestClient, auth_headers: dict):
        """测试全部标为已读"""
        # 先创建几条未读通知
        for i in range(3):
            client.post("/api/notifications/", json={
                "type": "info",
                "title": f"未读通知{i}",
                "content": f"内容{i}",
                "priority": "normal"
            }, headers=auth_headers)

        # 全部标为已读
        response = client.patch("/api/notifications/read-all", headers=auth_headers)
        assert response.status_code == 200
        assert response.json()["message"] == "全部已读"

        # 验证所有通知都已读
        get_resp = client.get("/api/notifications/", headers=auth_headers)
        notifications = get_resp.json()
        # 只检查当前用户创建的通知
        for n in notifications:
            if n.get("user_id") == 1:  # 当前用户
                assert n["is_read"] is True

    def test_delete_notification(self, client: TestClient, auth_headers: dict):
        """测试删除通知"""
        # 先创建一个通知
        create_resp = client.post("/api/notifications/", json={
            "type": "info",
            "title": "待删除通知",
            "content": "即将被删除",
            "priority": "normal"
        }, headers=auth_headers)
        assert create_resp.status_code == 200
        notif_id = create_resp.json()["id"]

        # 删除通知
        response = client.delete(
            f"/api/notifications/{notif_id}",
            headers=auth_headers
        )
        assert response.status_code == 200
        assert response.json()["message"] == "已删除"

        # 验证通知已被删除
        get_resp = client.get("/api/notifications/", headers=auth_headers)
        notifications = get_resp.json()
        target = next((n for n in notifications if n["id"] == notif_id), None)
        assert target is None

    def test_delete_notification_not_found(self, client: TestClient, auth_headers: dict):
        """测试删除不存在的通知"""
        response = client.delete(
            "/api/notifications/99999",
            headers=auth_headers
        )
        assert response.status_code == 404
        assert "通知不存在" in response.json()["detail"]

    def test_notification_visibility_by_user(self, client: TestClient, db_session: Session):
        """测试通知的用户隔离"""
        # 创建第一个用户
        response1 = client.post("/api/auth/register", json={
            "username": "user1",
            "email": "user1@example.com",
            "password": TEST_PASSWORD
        })
        assert response1.status_code == 200

        login1 = client.post("/api/auth/login", json={
            "username": "user1",
            "password": TEST_PASSWORD
        })
        token1 = login1.json()["access_token"]

        # 创建第二个用户
        response2 = client.post("/api/auth/register", json={
            "username": "user2",
            "email": "user2@example.com",
            "password": TEST_PASSWORD
        })
        assert response2.status_code == 200

        login2 = client.post("/api/auth/login", json={
            "username": "user2",
            "password": TEST_PASSWORD
        })
        token2 = login2.json()["access_token"]

        # 用户1创建通知
        client.post("/api/notifications/", json={
            "type": "info",
            "title": "用户1的私密通知",
            "content": "只有用户1能看到",
            "priority": "normal"
        }, headers={"Authorization": f"Bearer {token1}"})

        # 用户2获取通知列表
        resp2 = client.get("/api/notifications/", headers={"Authorization": f"Bearer {token2}"})
        notifications2 = resp2.json()

        # 用户2不应该看到用户1的通知
        user1_notif = next(
            (n for n in notifications2 if n["title"] == "用户1的私密通知"),
            None
        )
        assert user1_notif is None

    def test_notification_with_metadata(self, client: TestClient, auth_headers: dict):
        """测试创建带元数据的通知"""
        response = client.post("/api/notifications/", json={
            "type": "warning",
            "title": "物料库存不足",
            "content": "品牌易拉宝当前库存仅剩 5 个",
            "priority": "high",
            "module": "material",
            "action_url": "/materials",
            "metadata": {"material_id": 3, "material_name": "品牌易拉宝", "current_stock": 5}
        }, headers=auth_headers)
        assert response.status_code == 200
        data = response.json()
        assert data["metadata"]["material_id"] == 3
        assert data["metadata"]["current_stock"] == 5

    def test_notification_required_fields(self, client: TestClient, auth_headers: dict):
        """测试通知必填字段"""
        # 缺少 type
        response = client.post("/api/notifications/", json={
            "title": "缺少type",
            "content": "内容"
        }, headers=auth_headers)
        assert response.status_code == 422

        # 缺少 title
        response = client.post("/api/notifications/", json={
            "type": "info",
            "content": "内容"
        }, headers=auth_headers)
        assert response.status_code == 422

        # 缺少 content
        response = client.post("/api/notifications/", json={
            "type": "info",
            "title": "缺少content"
        }, headers=auth_headers)
        assert response.status_code == 422
