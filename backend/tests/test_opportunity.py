"""
商机 API 单元测试
"""
import pytest
from fastapi import status


class TestOpportunityAPI:
    """商机 API 测试类"""

    def test_create_opportunity(self, client, sample_opportunity_data):
        """测试创建商机"""
        response = client.post("/api/opportunities/", json=sample_opportunity_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["client_name"] == sample_opportunity_data["client_name"]
        assert data["company"] == sample_opportunity_data["company"]
        assert "id" in data

    def test_get_opportunity_list(self, client, sample_opportunity_data):
        """测试获取商机列表"""
        client.post("/api/opportunities/", json=sample_opportunity_data)

        response = client.get("/api/opportunities/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_opportunity_by_id(self, client, sample_opportunity_data):
        """测试根据ID获取商机详情"""
        create_response = client.post("/api/opportunities/", json=sample_opportunity_data)
        opportunity_id = create_response.json()["id"]

        response = client.get(f"/api/opportunities/{opportunity_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == opportunity_id

    def test_update_opportunity(self, client, sample_opportunity_data):
        """测试更新商机"""
        create_response = client.post("/api/opportunities/", json=sample_opportunity_data)
        opportunity_id = create_response.json()["id"]

        update_data = {"client_name": "更新后的客户", "status": "中意向"}
        response = client.put(f"/api/opportunities/{opportunity_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["client_name"] == "更新后的客户"
        assert data["status"] == "中意向"

    def test_delete_opportunity(self, client, sample_opportunity_data):
        """测试删除商机"""
        create_response = client.post("/api/opportunities/", json=sample_opportunity_data)
        opportunity_id = create_response.json()["id"]

        response = client.delete(f"/api/opportunities/{opportunity_id}")
        assert response.status_code == status.HTTP_200_OK

        get_response = client.get(f"/api/opportunities/{opportunity_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_filter_by_status(self, client, sample_opportunity_data):
        """测试按状态筛选商机"""
        client.post("/api/opportunities/", json=sample_opportunity_data)

        response = client.get("/api/opportunities/?status=高意向")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        if len(data) > 0:
            assert all(item["status"] == "高意向" for item in data)

    def test_search_opportunities(self, client, sample_opportunity_data):
        """测试搜索商机"""
        client.post("/api/opportunities/", json=sample_opportunity_data)

        response = client.get("/api/opportunities/?keyword=测试")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_get_high_intent_opportunities(self, client, sample_opportunity_data):
        """测试获取高意向商机"""
        client.post("/api/opportunities/", json=sample_opportunity_data)

        response = client.get("/api/opportunities/?high_intent=true")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_convert_opportunity(self, client, sample_opportunity_data):
        """测试转化商机"""
        create_response = client.post("/api/opportunities/", json=sample_opportunity_data)
        opportunity_id = create_response.json()["id"]

        response = client.post(f"/api/opportunities/{opportunity_id}/convert")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "已转化"

    def test_pagination(self, client, sample_opportunity_data):
        """测试分页功能"""
        # 创建多个商机
        for i in range(5):
            data = sample_opportunity_data.copy()
            data["client_name"] = f"客户{i}"
            client.post("/opportunities/", json=data)

        response = client.get("/api/opportunities/?skip=0&limit=2")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) <= 2
