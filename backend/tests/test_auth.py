"""
认证 API 测试
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


@pytest.fixture
def admin_user(client: TestClient, db_session: Session):
    """创建超级管理员用户并返回 token"""
    # 注册用户
    response = client.post("/api/auth/register", json={
        "username": "testadmin",
        "email": "testadmin@example.com",
        "password": "admin123"
    })
    assert response.status_code == 200

    # 设置为超级管理员
    from app.models.user import User
    user = db_session.query(User).filter(User.username == "testadmin").first()
    user.is_superadmin = True
    db_session.commit()

    # 登录获取 token
    login_response = client.post("/api/auth/login", json={
        "username": "testadmin",
        "password": "admin123"
    })
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


@pytest.fixture
def normal_user(client: TestClient):
    """创建普通用户并返回 token"""
    response = client.post("/api/auth/register", json={
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "user123"
    })
    assert response.status_code == 200

    login_response = client.post("/api/auth/login", json={
        "username": "testuser",
        "password": "user123"
    })
    assert login_response.status_code == 200
    return login_response.json()["access_token"]


class TestAuthAPI:
    """认证 API 测试"""

    def test_register(self, client: TestClient):
        """测试用户注册"""
        response = client.post("/api/auth/register", json={
            "username": "newuser",
            "email": "newuser@example.com",
            "password": "pass123456"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "newuser"
        assert data["email"] == "newuser@example.com"
        assert data["is_active"] is True
        assert data["is_superadmin"] is False

    def test_register_duplicate_username(self, client: TestClient):
        """测试重复用户名注册"""
        # 先注册一个用户
        client.post("/api/auth/register", json={
            "username": "duplicateuser",
            "email": "dup1@example.com",
            "password": "pass123"
        })
        # 再次注册相同用户名
        response = client.post("/api/auth/register", json={
            "username": "duplicateuser",
            "email": "dup2@example.com",
            "password": "pass123"
        })
        assert response.status_code == 400
        assert "用户名已存在" in response.json()["detail"]

    def test_register_duplicate_email(self, client: TestClient):
        """测试重复邮箱注册"""
        client.post("/api/auth/register", json={
            "username": "emailuser1",
            "email": "sameemail@example.com",
            "password": "pass123"
        })
        response = client.post("/api/auth/register", json={
            "username": "emailuser2",
            "email": "sameemail@example.com",
            "password": "pass123"
        })
        assert response.status_code == 400
        assert "邮箱已被注册" in response.json()["detail"]

    def test_login(self, client: TestClient):
        """测试用户登录"""
        # 先注册用户
        client.post("/api/auth/register", json={
            "username": "loginuser",
            "email": "login@example.com",
            "password": "test123456"
        })
        # 登录
        response = client.post("/api/auth/login", json={
            "username": "loginuser",
            "password": "test123456"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["username"] == "loginuser"

    def test_login_wrong_password(self, client: TestClient):
        """测试密码错误登录"""
        client.post("/api/auth/register", json={
            "username": "wrongpwduser",
            "email": "wrongpwd@example.com",
            "password": "correct123"
        })
        response = client.post("/api/auth/login", json={
            "username": "wrongpwduser",
            "password": "wrongpassword"
        })
        assert response.status_code == 401
        assert "用户名或密码错误" in response.json()["detail"]

    def test_login_user_not_found(self, client: TestClient):
        """测试用户不存在登录"""
        response = client.post("/api/auth/login", json={
            "username": "nonexistent",
            "password": "anypassword"
        })
        assert response.status_code == 401
        assert "用户名或密码错误" in response.json()["detail"]

    def test_get_current_user(self, client: TestClient, admin_user: str):
        """测试获取当前用户"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {admin_user}"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "testadmin"

    def test_get_current_user_no_token(self, client: TestClient):
        """测试无 token 获取当前用户（返回 403 Forbidden）"""
        response = client.get("/api/auth/me")
        # HTTPBearer 在无 token 时返回 403
        assert response.status_code == 403

    def test_register_and_login_flow(self, client: TestClient):
        """测试注册后登录流程"""
        # 注册
        register_response = client.post("/api/auth/register", json={
            "username": "flowuser",
            "email": "flow@example.com",
            "password": "flow123456"
        })
        assert register_response.status_code == 200

        # 登录
        login_response = client.post("/api/auth/login", json={
            "username": "flowuser",
            "password": "flow123456"
        })
        assert login_response.status_code == 200
        token = login_response.json()["access_token"]

        # 使用 token 获取当前用户
        me_response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        assert me_response.status_code == 200
        assert me_response.json()["username"] == "flowuser"
