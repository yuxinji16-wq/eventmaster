"""
用户管理 API 测试
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

# 测试用户密码 - 符合密码强度要求
TEST_PASSWORD_STRONG = "Admin123"  # 大写+小写+数字，8位以上


@pytest.fixture(scope="function")
def admin_token(client: TestClient, db_session: Session) -> str:
    """创建超级管理员用户并返回 token"""
    response = client.post("/api/auth/register", json={
        "username": "adminfortest",
        "email": "adminfortest@example.com",
        "password": TEST_PASSWORD_STRONG
    })
    assert response.status_code == 200

    from app.models.user import User
    user = db_session.query(User).filter(User.username == "adminfortest").first()
    user.is_superadmin = True
    db_session.commit()

    login_response = client.post("/api/auth/login", json={
        "username": "adminfortest",
        "password": TEST_PASSWORD_STRONG
    })
    return login_response.json()["access_token"]


@pytest.fixture(scope="function")
def normal_token(client: TestClient) -> str:
    """创建普通用户并返回 token"""
    client.post("/api/auth/register", json={
        "username": "normalfortest",
        "email": "normalfortest@example.com",
        "password": "Normal123"
    })
    response = client.post("/api/auth/login", json={
        "username": "normalfortest",
        "password": "Normal123"
    })
    return response.json()["access_token"]


class TestUsersAPI:
    """用户管理 API 测试"""

    def test_create_user_as_admin(self, client: TestClient, admin_token: str):
        """测试管理员创建用户"""
        response = client.post(
            "/api/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "username": "newtestuser",
                "email": "newtestuser@example.com",
                "password": "Newpass123"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "newtestuser"
        assert data["email"] == "newtestuser@example.com"

    def test_create_user_as_normal_user(self, client: TestClient, normal_token: str):
        """测试普通用户创建用户（应失败）"""
        response = client.post(
            "/api/users",
            headers={"Authorization": f"Bearer {normal_token}"},
            json={
                "username": "shouldfail",
                "email": "shouldfail@example.com",
                "password": "Pass12345"
            }
        )
        assert response.status_code == 403

    def test_create_user_no_auth(self, client: TestClient):
        """测试无认证创建用户（返回 403 Forbidden）"""
        response = client.post(
            "/api/users",
            json={
                "username": "noauthuser",
                "email": "noauth@example.com",
                "password": "Pass12345"
            }
        )
        # HTTPBearer 在无 token 时返回 403
        assert response.status_code == 403

    def test_list_users(self, client: TestClient, admin_token: str):
        """测试获取用户列表"""
        response = client.get(
            "/api/users",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_user_detail(self, client: TestClient, admin_token: str):
        """测试获取用户详情"""
        # 创建用户
        create_response = client.post(
            "/api/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "username": "detailuser",
                "email": "detailuser@example.com",
                "password": "Detail123"
            }
        )
        user_id = create_response.json()["id"]

        # 获取详情
        response = client.get(
            f"/api/users/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "detailuser"
        assert "permissions" in data

    def test_update_user(self, client: TestClient, admin_token: str):
        """测试更新用户"""
        create_response = client.post(
            "/api/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "username": "updateuser",
                "email": "updateuser@example.com",
                "password": "Update123"
            }
        )
        user_id = create_response.json()["id"]

        response = client.put(
            f"/api/users/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "username": "updateduser",
                "email": "updated@example.com"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "updateduser"
        assert data["email"] == "updated@example.com"

    def test_update_user_password(self, client: TestClient, admin_token: str):
        """测试更新用户密码"""
        create_response = client.post(
            "/api/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "username": "pwduser",
                "email": "pwduser@example.com",
                "password": "Oldpass123"
            }
        )
        user_id = create_response.json()["id"]

        client.put(
            f"/api/users/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"password": "Newpass456"}
        )

        # 使用新密码登录
        login_response = client.post("/api/auth/login", json={
            "username": "pwduser",
            "password": "Newpass456"
        })
        assert login_response.status_code == 200

    def test_delete_user(self, client: TestClient, admin_token: str):
        """测试删除用户"""
        create_response = client.post(
            "/api/users",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "username": "deleteuser",
                "email": "deleteuser@example.com",
                "password": "Delete123"
            }
        )
        user_id = create_response.json()["id"]

        response = client.delete(
            f"/api/users/{user_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "删除成功"

    def test_get_my_permissions(self, client: TestClient, normal_token: str):
        """测试获取当前用户权限"""
        response = client.get(
            "/api/users/permissions/me",
            headers={"Authorization": f"Bearer {normal_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "permissions" in data
        assert "role_name" in data
        assert data["username"] == "normalfortest"
        assert data["is_superadmin"] is False

    def test_superadmin_has_all_permissions(self, client: TestClient, admin_token: str):
        """测试超级管理员拥有所有权限"""
        response = client.get(
            "/api/users/permissions/me",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["is_superadmin"] is True
        # 超级管理员应该拥有所有模块的完全权限
        for module in ["activities", "materials", "budget", "suppliers", "leads", "reviews", "account", "settings"]:
            assert module in data["permissions"]
            for action in ["view", "create", "edit", "delete"]:
                assert data["permissions"][module][action] is True
