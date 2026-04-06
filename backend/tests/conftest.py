"""
后端测试配置文件
"""
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.db.base import Base
from app.db.session import get_db
from app.main import app
from fastapi.testclient import TestClient

# 测试数据库 URL (SQLite 内存数据库)
TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session():
    """创建测试数据库会话"""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """创建测试客户端"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def sample_activity_data():
    """示例活动数据"""
    return {
        "name": "测试活动",
        "date": "2026-04-15",
        "year": "2026",
        "location": "北京",
        "type": "展览",
        "category": "线下活动",
        "budget": 50000.0,
        "actual_spend": 45000.0,
        "leads": 100,
        "status": "已完成",
        "description": "这是一个测试活动"
    }


@pytest.fixture(scope="function")
def sample_material_data():
    """示例物料数据"""
    return {
        "name": "测试物料",
        "category": "宣传品",
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
        "category": "搭建商",
        "contact": "张三",
        "phone": "13800138000",
        "email": "test@supplier.com",
        "address": "北京市朝阳区"
    }


@pytest.fixture(scope="function")
def sample_budget_data():
    """示例预算数据"""
    return {
        "activity_id": 1,
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
def sample_review_data():
    """示例复盘数据"""
    return {
        "activity_id": 1,
        "status": "未开始",
        "expected_participants": 50,
        "participant_count": 0,
        "lead_count": 0
    }
