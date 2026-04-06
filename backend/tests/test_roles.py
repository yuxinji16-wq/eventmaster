"""
角色管理 API 测试
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


@pytest.fixture
def admin_token(client: TestClient, db_session: Session) -> str:
    """创建超级管理员用户并返回 token"""
    response = client.post("/api/auth/register", json={
        "username": "roleadmin",
        "email": "roleadmin@example.com",
        "password": "admin123"
    })
    assert response.status_code == 200

    from app.models.user import User
    user = db_session.query(User).filter(User.username == "roleadmin").first()
    user.is_superadmin = True
    db_session.commit()

    login_response = client.post("/api/auth/login", json={
        "username": "roleadmin",
        "password": "admin123"
    })
    return login_response.json()["access_token"]


@pytest.fixture
def normal_token(client: TestClient) -> str:
    """创建普通用户并返回 token"""
    client.post("/api/auth/register", json={
        "username": "rolenormal",
        "email": "rolenormal@example.com",
        "password": "normal123"
    })
    response = client.post("/api/auth/login", json={
        "username": "rolenormal",
        "password": "normal123"
    })
    return response.json()["access_token"]


class TestRolesAPI:
    """角色管理 API 测试"""

    def test_list_roles(self, client: TestClient, admin_token: str):
        """测试获取角色列表"""
        response = client.get(
            "/api/roles",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)

    def test_create_role(self, client: TestClient, admin_token: str):
        """测试创建角色"""
        response = client.post(
            "/api/roles",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "测试角色",
                "description": "这是一个测试角色",
                "permissions": {
                    "activities": {"view": True, "create": True, "edit": False, "delete": False},
                    "materials": {"view": True, "create": False, "edit": False, "delete": False},
                    "budget": {"view": True, "create": False, "edit": False, "delete": False},
                    "suppliers": {"view": True, "create": False, "edit": False, "delete": False},
                    "leads": {"view": True, "create": False, "edit": False, "delete": False},
                    "reviews": {"view": True, "create": False, "edit": False, "delete": False},
                    "account": {"view": False, "create": False, "edit": False, "delete": False},
                    "settings": {"view": False, "create": False, "edit": False, "delete": False}
                }
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "测试角色"
        assert data["permissions"]["activities"]["view"] is True
        assert data["permissions"]["settings"]["view"] is False

    def test_create_role_duplicate_name(self, client: TestClient, admin_token: str):
        """测试创建重复角色名"""
        client.post("/api/roles", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "name": "重复角色A",
            "description": "第一个"
        })

        response = client.post("/api/roles", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "name": "重复角色A",
            "description": "第二个"
        })
        assert response.status_code == 400
        assert "角色名已存在" in response.json()["detail"]

    def test_get_role_detail(self, client: TestClient, admin_token: str):
        """测试获取角色详情"""
        create_response = client.post("/api/roles", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "name": "详情角色",
            "description": "角色详情测试"
        })
        role_id = create_response.json()["id"]

        response = client.get(
            f"/api/roles/{role_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.json()["name"] == "详情角色"

    def test_update_role(self, client: TestClient, admin_token: str):
        """测试更新角色"""
        create_response = client.post("/api/roles", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "name": "更新前角色",
            "description": "更新前"
        })
        role_id = create_response.json()["id"]

        response = client.put(
            f"/api/roles/{role_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={
                "name": "更新后角色",
                "description": "更新后"
            }
        )
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "更新后角色"
        assert data["description"] == "更新后"

    def test_update_role_permissions(self, client: TestClient, admin_token: str):
        """测试更新角色权限"""
        create_response = client.post("/api/roles", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "name": "权限角色"
        })
        role_id = create_response.json()["id"]

        new_permissions = {
            "activities": {"view": True, "create": True, "edit": True, "delete": True},
            "materials": {"view": True, "create": True, "edit": True, "delete": True},
            "budget": {"view": True, "create": False, "edit": False, "delete": False},
            "suppliers": {"view": True, "create": False, "edit": False, "delete": False},
            "leads": {"view": True, "create": False, "edit": False, "delete": False},
            "reviews": {"view": True, "create": False, "edit": False, "delete": False},
            "account": {"view": False, "create": False, "edit": False, "delete": False},
            "settings": {"view": False, "create": False, "edit": False, "delete": False}
        }
        response = client.put(
            f"/api/roles/{role_id}",
            headers={"Authorization": f"Bearer {admin_token}"},
            json={"permissions": new_permissions}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["permissions"]["activities"]["delete"] is True
        assert data["permissions"]["settings"]["view"] is False

    def test_delete_role(self, client: TestClient, admin_token: str):
        """测试删除角色"""
        create_response = client.post("/api/roles", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "name": "待删除角色"
        })
        role_id = create_response.json()["id"]

        response = client.delete(
            f"/api/roles/{role_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200
        assert response.json()["message"] == "删除成功"

    def test_delete_default_role_fails(self, client: TestClient, admin_token: str):
        """测试删除默认角色失败"""
        create_response = client.post("/api/roles", headers={"Authorization": f"Bearer {admin_token}"}, json={
            "name": "默认角色不可删除",
            "is_default": True
        })
        role_id = create_response.json()["id"]

        response = client.delete(
            f"/api/roles/{role_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 400
        assert "不能删除默认角色" in response.json()["detail"]

    def test_create_role_without_admin(self, client: TestClient, normal_token: str):
        """测试非管理员创建角色（应失败）"""
        response = client.post(
            "/api/roles",
            headers={"Authorization": f"Bearer {normal_token}"},
            json={
                "name": "普通用户角色",
                "description": "不应该创建成功"
            }
        )
        assert response.status_code == 403

    def test_create_role_no_auth(self, client: TestClient):
        """测试无认证创建角色（返回 403 Forbidden）"""
        response = client.post(
            "/api/roles",
            json={
                "name": "无认证角色",
                "description": "不应该创建成功"
            }
        )
        # HTTPBearer 在无 token 时返回 403
        assert response.status_code == 403
