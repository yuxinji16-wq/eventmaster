"""
任务 API 测试
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session


@pytest.fixture
def test_activity(db_session: Session):
    """创建测试活动"""
    from app.models.activity import Activity
    activity = Activity(
        name="测试活动",
        date="2024-03-01",
        year="2024",
        status="进行中",
        budget=50000
    )
    db_session.add(activity)
    db_session.commit()
    db_session.refresh(activity)
    return activity


class TestTaskAPI:
    """任务 API 测试"""

    def test_create_task(self, client, test_activity):
        """测试创建任务"""
        response = client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "测试任务",
            "description": "任务描述",
            "assignee": "张三",
            "due_date": "2024-03-15",
            "priority": "P1",
            "status": "未开始"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "测试任务"
        assert data["activity_id"] == test_activity.id
        assert data["priority"] == "P1"

    def test_get_tasks_by_activity(self, client, test_activity):
        """测试获取活动的任务列表"""
        # 先创建任务
        client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "任务1",
            "priority": "P0"
        })
        client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "任务2",
            "priority": "P1"
        })

        # 获取任务列表
        response = client.get(f"/api/tasks/activity/{test_activity.id}")
        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 2

    def test_get_task_by_id(self, client, test_activity):
        """测试获取单个任务"""
        # 创建任务
        create_response = client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "测试任务"
        })
        task_id = create_response.json()["id"]

        # 获取任务
        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "测试任务"

    def test_update_task(self, client, test_activity):
        """测试更新任务"""
        # 创建任务
        create_response = client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "原任务名"
        })
        task_id = create_response.json()["id"]

        # 更新任务
        response = client.put(f"/api/tasks/{task_id}", json={
            "name": "新任务名",
            "status": "进行中"
        })
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "新任务名"
        assert data["status"] == "进行中"

    def test_update_task_status(self, client, test_activity):
        """测试更新任务状态"""
        # 创建任务
        create_response = client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "测试任务"
        })
        task_id = create_response.json()["id"]

        # 更新状态
        response = client.patch(f"/api/tasks/{task_id}/status?status=已完成")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "已完成"

    def test_delete_task(self, client, test_activity):
        """测试删除任务"""
        # 创建任务
        create_response = client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "待删除任务"
        })
        task_id = create_response.json()["id"]

        # 删除任务
        response = client.delete(f"/api/tasks/{task_id}")
        assert response.status_code == 200

        # 验证删除
        get_response = client.get(f"/api/tasks/{task_id}")
        assert get_response.status_code == 404

    def test_batch_create_tasks(self, client, test_activity):
        """测试批量创建任务"""
        response = client.post("/api/tasks/batch", json={
            "tasks": [
                {
                    "activity_id": test_activity.id,
                    "name": "批量任务1",
                    "priority": "P0"
                },
                {
                    "activity_id": test_activity.id,
                    "name": "批量任务2",
                    "priority": "P1"
                }
            ]
        })
        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 2

    def test_get_tasks_by_status(self, client, test_activity):
        """测试按状态筛选任务"""
        # 创建不同状态的任务
        client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "未开始任务",
            "status": "未开始"
        })
        client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "已完成任务",
            "status": "已完成"
        })

        # 按状态筛选
        response = client.get(f"/api/tasks/activity/{test_activity.id}?status=未开始")
        assert response.status_code == 200
        tasks = response.json()
        assert len(tasks) == 1
        assert tasks[0]["status"] == "未开始"

    def test_delete_tasks_by_activity(self, client, test_activity):
        """测试删除活动的所有任务"""
        # 创建多个任务
        client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "任务1"
        })
        client.post("/api/tasks/", json={
            "activity_id": test_activity.id,
            "name": "任务2"
        })

        # 删除所有任务
        response = client.delete(f"/api/tasks/activity/{test_activity.id}")
        assert response.status_code == 200

        # 验证
        get_response = client.get(f"/api/tasks/activity/{test_activity.id}")
        assert len(get_response.json()) == 0
