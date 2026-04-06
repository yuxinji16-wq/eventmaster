"""
活动 API 单元测试
"""
import pytest
from fastapi import status


class TestActivityAPI:
    """活动 API 测试类"""

    def test_create_activity(self, client, sample_activity_data):
        """测试创建活动"""
        response = client.post("/api/activities/", json=sample_activity_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == sample_activity_data["name"]
        assert data["year"] == sample_activity_data["year"]
        assert data["location"] == sample_activity_data["location"]
        assert "id" in data

    def test_get_activity_list(self, client, sample_activity_data):
        """测试获取活动列表"""
        # 先创建一个活动
        client.post("/api/activities/", json=sample_activity_data)

        # 获取列表
        response = client.get("/api/activities/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_activity_by_id(self, client, sample_activity_data):
        """测试根据ID获取活动详情"""
        # 创建活动
        create_response = client.post("/api/activities/", json=sample_activity_data)
        activity_id = create_response.json()["id"]

        # 获取详情
        response = client.get(f"/api/activities/{activity_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == activity_id
        assert data["name"] == sample_activity_data["name"]

    def test_get_activity_not_found(self, client):
        """测试获取不存在的活动"""
        response = client.get("/api/activities/99999")
        assert response.status_code == status.HTTP_404_NOT_FOUND

    def test_update_activity(self, client, sample_activity_data):
        """测试更新活动"""
        # 创建活动
        create_response = client.post("/api/activities/", json=sample_activity_data)
        activity_id = create_response.json()["id"]

        # 更新活动
        update_data = {"name": "更新后的活动名称", "status": "进行中"}
        response = client.put(f"/api/activities/{activity_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "更新后的活动名称"
        assert data["status"] == "进行中"

    def test_delete_activity(self, client, sample_activity_data):
        """测试删除活动"""
        # 创建活动
        create_response = client.post("/api/activities/", json=sample_activity_data)
        activity_id = create_response.json()["id"]

        # 删除活动
        response = client.delete(f"/api/activities/{activity_id}")
        assert response.status_code == status.HTTP_200_OK

        # 确认删除
        get_response = client.get(f"/api/activities/{activity_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_search_activities_by_keyword(self, client, sample_activity_data):
        """测试搜索活动"""
        # 创建活动
        client.post("/api/activities/", json=sample_activity_data)

        # 按关键字搜索
        response = client.get("/api/activities/?keyword=测试")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert any("测试" in item["name"] for item in data)

    def test_filter_activities_by_year(self, client, sample_activity_data):
        """测试按年份筛选活动"""
        # 创建活动
        client.post("/api/activities/", json=sample_activity_data)

        # 按年份筛选
        response = client.get("/api/activities/?year=2026")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert all(item["year"] == "2026" for item in data)

    def test_filter_activities_by_status(self, client, sample_activity_data):
        """测试按状态筛选活动"""
        # 创建活动
        client.post("/api/activities/", json=sample_activity_data)

        # 按状态筛选
        response = client.get("/api/activities/?status=已完成")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_get_activities_summary(self, client, sample_activity_data):
        """测试获取活动统计摘要"""
        # 创建活动
        client.post("/api/activities/", json=sample_activity_data)

        # 获取统计
        response = client.get("/api/activities/summary/stats")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total" in data
        assert "by_status" in data
        assert isinstance(data["by_status"], dict)

    def test_pagination(self, client, sample_activity_data):
        """测试分页功能"""
        # 创建多个活动
        for i in range(5):
            data = sample_activity_data.copy()
            data["name"] = f"活动{i}"
            client.post("/api/activities/", json=data)

        # 测试分页
        response = client.get("/api/activities/?skip=0&limit=2")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) <= 2
