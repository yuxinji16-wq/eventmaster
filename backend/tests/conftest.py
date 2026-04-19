"""
后端测试配置文件
"""
import pytest
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from fastapi.testclient import TestClient

# 测试数据库 URL（文件数据库，StaticPool 确保多线程安全）
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

# SQLite 启用外键约束
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON")
    cursor.close()


def _register_all_models():
    """确保所有模型被注册到 Base.metadata"""
    import app.models.activity
    import app.models.task
    import app.models.material
    import app.models.supplier
    import app.models.budget
    import app.models.opportunity
    import app.models.review
    import app.models.user
    import app.models.settings


@pytest.fixture(scope="function", autouse=False)
def db_session():
    """创建测试数据库会话 - 每个测试函数独立"""
    # 注册所有模型
    _register_all_models()

    # 清理所有表后重建（确保干净状态）
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        # 关闭所有连接
        engine.dispose()


@pytest.fixture(scope="function")
def client(db_session):
    """创建测试客户端"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app, raise_server_exceptions=False) as test_client:
        yield test_client

    app.dependency_overrides.clear()


# ============ 共享测试数据 Fixture ============
# 注意：密码必须满足强度要求（至少8位，包含大小写字母和数字）


@pytest.fixture(scope="function")
def valid_password():
    """有效的测试密码（满足强度要求）"""
    return "TestPass1"


@pytest.fixture(scope="function")
def sample_activity_data():
    """示例活动数据"""
    return {
        "name": "测试活动",
        "date": "2026-04-15",
        "year": "2026",
        "location": "北京",
        "type": "Conference",
        "category": "自办活动",
        "industry": "综合",
        "budget": 50000.0,
        "actual_spend": 45000.0,
        "leads": 100,
        "status": "已完成",
        "description": "这是一个测试活动"
    }


@pytest.fixture(scope="function")
def setup_activity(client, sample_activity_data):
    """创建示例活动（供其他测试依赖）"""
    response = client.post("/api/activities", json=sample_activity_data)
    if response.status_code == 200:
        return response.json()
    # 活动可能已存在，尝试获取列表中的第一个
    list_resp = client.get("/api/activities")
    if list_resp.status_code == 200 and len(list_resp.json()) > 0:
        return list_resp.json()[0]
    return None


@pytest.fixture(scope="function")
def sample_material_data():
    """示例物料数据"""
    return {
        "name": "测试物料",
        "category": "宣传品",
        "type": "常规",
        "unit": "个",
        "stock": 100.0,
        "min_stock": 10.0,
        "location": "仓库A",
        "price": 25.5
    }


@pytest.fixture(scope="function")
def sample_supplier_data():
    """示例供应商数据"""
    return {
        "name": "测试供应商",
        "category": "搭建",
        "contact": "张三",
        "phone": "13800138000",
        "email": "test@supplier.com",
        "address": "北京市朝阳区",
        "rating": 4.5,
        "tags": ["自有工厂", "工艺精湛"]
    }


@pytest.fixture(scope="function")
def sample_budget_data():
    """示例预算数据（不关联活动，避免外键约束失败）"""
    return {
        "total_amount": 100000.0,
        "used_amount": 0.0,
        "status": "草稿"
    }


@pytest.fixture(scope="function")
def sample_opportunity_data():
    """示例商机数据"""
    return {
        "client_name": "测试客户",
        "company": "测试公司",
        "contact": "李四",
        "phone": "13900139000",
        "email": "test@company.com",
        "estimated_value": 50000.0,
        "status": "高意向"
    }


@pytest.fixture(scope="function")
def sample_review_data(setup_activity):
    """示例复盘数据（自动依赖活动创建）"""
    activity = setup_activity
    activity_id = activity["id"] if activity else 1
    return {
        "activity_id": activity_id,
        "status": "未开始",
        "expected_participants": 50,
        "participant_count": 0,
        "lead_count": 0
    }
