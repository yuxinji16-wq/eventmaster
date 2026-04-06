"""
预算 API 单元测试
"""
import pytest
from fastapi import status


class TestBudgetAPI:
    """预算 API 测试类"""

    def test_create_budget(self, client, sample_budget_data):
        """测试创建预算"""
        response = client.post("/api/budget/", json=sample_budget_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_amount"] == sample_budget_data["total_amount"]
        assert data["status"] == sample_budget_data["status"]
        assert "id" in data

    def test_get_budget_list(self, client, sample_budget_data):
        """测试获取预算列表"""
        client.post("/api/budget/", json=sample_budget_data)

        response = client.get("/api/budget/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_get_budget_by_id(self, client, sample_budget_data):
        """测试根据ID获取预算详情"""
        create_response = client.post("/api/budget/", json=sample_budget_data)
        budget_id = create_response.json()["id"]

        response = client.get(f"/api/budget/{budget_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == budget_id

    def test_update_budget(self, client, sample_budget_data):
        """测试更新预算"""
        create_response = client.post("/api/budget/", json=sample_budget_data)
        budget_id = create_response.json()["id"]

        update_data = {"total_amount": 150000.0, "status": "执行中"}
        response = client.put(f"/api/budget/{budget_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["total_amount"] == 150000.0
        assert data["status"] == "执行中"

    def test_create_budget_item(self, client, sample_budget_data):
        """测试创建预算明细"""
        # 先创建预算
        budget_response = client.post("/api/budget/", json=sample_budget_data)
        budget_id = budget_response.json()["id"]

        # 创建明细
        item_data = {
            "budget_id": budget_id,
            "category": "场地租用",
            "planned_amount": 30000.0,
            "actual_amount": 0.0,
            "status": "正常"
        }
        response = client.post("/api/budget/items", json=item_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["category"] == "场地租用"
        assert data["planned_amount"] == 30000.0

    def test_get_budget_items(self, client, sample_budget_data):
        """测试获取预算明细列表"""
        # 先创建预算
        budget_response = client.post("/api/budget/", json=sample_budget_data)
        budget_id = budget_response.json()["id"]

        # 创建明细
        item_data = {
            "budget_id": budget_id,
            "category": "物料制作",
            "planned_amount": 20000.0,
            "status": "正常"
        }
        client.post("/api/budget/items", json=item_data)

        response = client.get(f"/api/budget/{budget_id}/items")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_update_budget_item(self, client, sample_budget_data):
        """测试更新预算明细"""
        # 先创建预算
        budget_response = client.post("/api/budget/", json=sample_budget_data)
        budget_id = budget_response.json()["id"]

        # 创建明细
        item_data = {
            "budget_id": budget_id,
            "category": "搭建展览",
            "planned_amount": 50000.0,
            "status": "正常"
        }
        item_response = client.post("/api/budget/items", json=item_data)
        item_id = item_response.json()["id"]

        # 更新明细
        update_data = {"actual_amount": 48000.0, "status": "正常"}
        response = client.put(f"/api/budget/items/{item_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["actual_amount"] == 48000.0

    def test_create_budget_log(self, client, sample_budget_data):
        """测试创建预算日志"""
        # 先创建预算
        budget_response = client.post("/api/budget/", json=sample_budget_data)
        budget_id = budget_response.json()["id"]

        # 创建日志
        log_data = {
            "activity_id": budget_id,
            "name": "场地定金",
            "amount": 10000.0,
            "category": "场地租用",
            "type": "expense",
            "status": "已结清"
        }
        response = client.post("/api/budget/logs", json=log_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "场地定金"
        assert data["amount"] == 10000.0

    def test_get_budget_logs(self, client, sample_budget_data):
        """测试获取预算日志"""
        # 先创建预算
        budget_response = client.post("/api/budget/", json=sample_budget_data)
        budget_id = budget_response.json()["id"]

        # 创建日志
        log_data = {
            "activity_id": budget_id,
            "name": "物料采购",
            "amount": 5000.0,
            "type": "expense"
        }
        client.post("/api/budget/logs", json=log_data)

        response = client.get(f"/api/budget/logs?activity_id={budget_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_create_yearly_quota(self, client):
        """测试创建年度配额"""
        quota_data = {"year": "2026", "quota": 1000000.0}
        response = client.post("/api/budget/quotas", json=quota_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["year"] == "2026"
        assert data["quota"] == 1000000.0

    def test_get_yearly_quota_by_year(self, client):
        """测试获取指定年份配额"""
        quota_data = {"year": "2027", "quota": 2000000.0}
        client.post("/api/budget/quotas", json=quota_data)

        response = client.get("/api/budget/quotas/year/2027")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["year"] == "2027"

    def test_update_yearly_quota(self, client):
        """测试更新年度配额"""
        quota_data = {"year": "2028", "quota": 1500000.0}
        response = client.post("/api/budget/quotas", json=quota_data)
        quota_id = response.json()["id"]

        update_data = {"quota": 1800000.0}
        update_response = client.put(f"/api/budget/quotas/{quota_id}", json=update_data)
        assert update_response.status_code == status.HTTP_200_OK
        data = update_response.json()
        assert data["quota"] == 1800000.0

    def test_get_budget_by_activity_id(self, client, sample_budget_data):
        """测试根据活动ID获取预算"""
        client.post("/api/budget/", json=sample_budget_data)

        response = client.get("/api/budget/?activity_id=1")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
