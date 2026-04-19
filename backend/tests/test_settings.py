"""
网站设置 API 测试
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


@pytest.fixture(scope="function")
def admin_token(client: TestClient, db_session: Session) -> str:
    """创建超级管理员用户并返回 token"""
    response = client.post("/api/auth/register", json={
        "username": "settingsadmin",
        "email": "settingsadmin@example.com",
        "password": "AdminTest1"
    })
    assert response.status_code == 200

    from app.models.user import User
    user = db_session.query(User).filter(User.username == "settingsadmin").first()
    user.is_superadmin = True
    db_session.commit()

    login_response = client.post("/api/auth/login", json={
        "username": "settingsadmin",
        "password": "AdminTest1"
    })
    return login_response.json()["access_token"]


@pytest.fixture(scope="function")
def normal_token(client: TestClient) -> str:
    """创建普通用户并返回 token"""
    client.post("/api/auth/register", json={
        "username": "settingsnormal",
        "email": "settingsnormal@example.com",
        "password": "NormalTest1"
    })
    response = client.post("/api/auth/login", json={
        "username": "settingsnormal",
        "password": "NormalTest1"
    })
    return response.json()["access_token"]


class TestSettingsAPI:
    """网站设置 API 测试"""

    def test_get_settings(self, client: TestClient, admin_token: str):
        """测试获取网站设置"""
        response = client.get(
            "/api/settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "site_name" in data
        assert "smtp_host" in data
        assert data["site_name"] == "EventMaster Pro"

    def test_get_settings_no_auth(self, client: TestClient):
        """测试无认证获取设置（返回 403 Forbidden）"""
        response = client.get("/api/settings")
        # HTTPBearer 在无 token 时返回 403
        assert response.status_code == 403

    def test_get_settings_normal_user(self, client: TestClient, normal_token: str):
        """测试普通用户获取设置（应失败）"""
        response = client.get(
            "/api/settings",
            headers={"Authorization": f"Bearer {normal_token}"}
        )
        assert response.status_code == 403

    def test_update_settings(self, client: TestClient, admin_token: str):
        """测试更新网站设置"""
        response = client.put(
            "/api/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "site_name": "测试网站",
                "site_logo": "https://example.com/logo.png",
                "contact_email": "test@example.com",
                "contact_phone": "13800138000",
                "address": "北京市朝阳区"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["site_name"] == "测试网站"
        assert data["site_logo"] == "https://example.com/logo.png"
        assert data["contact_email"] == "test@example.com"
        assert data["contact_phone"] == "13800138000"
        assert data["address"] == "北京市朝阳区"

    def test_update_smtp_settings(self, client: TestClient, admin_token: str):
        """测试更新 SMTP 设置"""
        response = client.put(
            "/api/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "smtp_host": "smtp.example.com",
                "smtp_port": 465,
                "smtp_username": "smtpuser",
                "smtp_password": "smtppass",
                "smtp_from_email": "noreply@example.com"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["smtp_host"] == "smtp.example.com"
        assert data["smtp_port"] == 465
        assert data["smtp_username"] == "smtpuser"
        assert data["smtp_from_email"] == "noreply@example.com"

    def test_update_settings_partial(self, client: TestClient, admin_token: str):
        """测试部分更新设置"""
        # 先更新一些设置
        client.put(
            "/api/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"site_name": "完整网站名"}
        )

        # 再更新另一部分
        response = client.put(
            "/api/settings",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"contact_email": "partial@example.com"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["site_name"] == "完整网站名"
        assert data["contact_email"] == "partial@example.com"

    def test_update_settings_no_auth(self, client: TestClient):
        """测试无认证更新设置（返回 403 Forbidden）"""
        response = client.put(
            "/api/settings",
            json={"site_name": "不应该更新"}
        )
        # HTTPBearer 在无 token 时返回 403
        assert response.status_code == 403

    def test_update_settings_normal_user(self, client: TestClient, normal_token: str):
        """测试普通用户更新设置（应失败）"""
        response = client.put(
            "/api/settings",
            headers={"Authorization": f"Bearer {normal_token}"},
            json={"site_name": "不应该更新"}
        )
        assert response.status_code == 403

    def test_test_email_missing_config(self, client: TestClient, admin_token: str):
        """测试未配置 SMTP 发送测试邮件"""
        response = client.post(
            "/api/settings/test-email?test_email=test@example.com",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        # 应该返回 400 因为 SMTP 未配置
        assert response.status_code == 400
        assert "SMTP 配置不完整" in response.json()["detail"]

    def test_settings_contains_all_fields(self, client: TestClient, admin_token: str):
        """测试设置包含所有必要字段"""
        response = client.get(
            "/api/settings",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        required_fields = [
            "site_name", "site_logo", "contact_email", "contact_phone",
            "address", "smtp_host", "smtp_port", "smtp_username",
            "smtp_password", "smtp_from_email", "email_template"
        ]
        for field in required_fields:
            assert field in data, f"Missing field: {field}"
