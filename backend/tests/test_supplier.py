"""
供应商 API 单元测试
"""
import pytest
from fastapi import status


class TestSupplierAPI:
    """供应商 API 测试类"""

    def test_create_supplier(self, client, sample_supplier_data):
        """测试创建供应商"""
        response = client.post("/api/suppliers/", json=sample_supplier_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == sample_supplier_data["name"]
        assert data["category"] == sample_supplier_data["category"]
        assert "id" in data

    def test_get_supplier_list(self, client, sample_supplier_data):
        """测试获取供应商列表"""
        client.post("/api/suppliers/", json=sample_supplier_data)

        response = client.get("/api/suppliers/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_supplier_by_id(self, client, sample_supplier_data):
        """测试根据ID获取供应商详情"""
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        response = client.get(f"/api/suppliers/{supplier_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == supplier_id

    def test_update_supplier(self, client, sample_supplier_data):
        """测试更新供应商"""
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        update_data = {"name": "更新后的供应商", "contact": "新联系人"}
        response = client.put(f"/api/suppliers/{supplier_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "更新后的供应商"

    def test_delete_supplier(self, client, sample_supplier_data):
        """测试删除供应商"""
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        response = client.delete(f"/api/suppliers/{supplier_id}")
        assert response.status_code == status.HTTP_200_OK

        get_response = client.get(f"/api/suppliers/{supplier_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_search_suppliers(self, client, sample_supplier_data):
        """测试搜索供应商"""
        client.post("/api/suppliers/", json=sample_supplier_data)

        response = client.get("/api/suppliers/?keyword=测试")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_create_supplier_review(self, client, sample_supplier_data):
        """测试创建供应商评价"""
        # 先创建供应商
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        # 创建评价
        review_data = {
            "supplier_id": supplier_id,
            "quality_score": 4.5,
            "delivery_score": 4.0,
            "service_score": 4.8,
            "price_score": 4.2,
            "overall_score": 4.4,
            "comments": "服务不错"
        }
        response = client.post("/api/suppliers/reviews", json=review_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["overall_score"] == 4.4

    def test_get_supplier_reviews(self, client, sample_supplier_data):
        """测试获取供应商评价列表"""
        # 先创建供应商
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        # 创建评价
        review_data = {
            "supplier_id": supplier_id,
            "quality_score": 4.5,
            "delivery_score": 4.0,
            "service_score": 4.8,
            "price_score": 4.2,
            "overall_score": 4.4
        }
        client.post("/api/suppliers/reviews", json=review_data)

        # 获取评价列表
        response = client.get(f"/api/suppliers/{supplier_id}/reviews")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_supplier_avg_score(self, client, sample_supplier_data):
        """测试获取供应商平均评分"""
        # 先创建供应商
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        # 创建评价
        review_data = {
            "supplier_id": supplier_id,
            "quality_score": 4.5,
            "delivery_score": 4.0,
            "service_score": 4.8,
            "price_score": 4.2,
            "overall_score": 4.4
        }
        client.post("/api/suppliers/reviews", json=review_data)

        response = client.get(f"/api/suppliers/{supplier_id}/avg-score")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "avg_score" in data

    def test_create_bill(self, client, sample_supplier_data):
        """测试创建账单"""
        # 先创建供应商
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        # 创建账单
        bill_data = {
            "supplier_id": supplier_id,
            "amount": 10000.0,
            "status": "待付款",
            "due_date": "2026-04-30"
        }
        response = client.post("/api/suppliers/bills", json=bill_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["amount"] == 10000.0

    def test_mark_bill_paid(self, client, sample_supplier_data):
        """测试标记账单已付款"""
        # 先创建供应商
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        # 创建账单
        bill_data = {
            "supplier_id": supplier_id,
            "amount": 10000.0,
            "status": "待付款"
        }
        bill_response = client.post("/api/suppliers/bills", json=bill_data)
        bill_id = bill_response.json()["id"]

        # 标记已付款
        response = client.put(f"/api/suppliers/bills/{bill_id}/paid")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "已付款"

    def test_get_pending_bills(self, client, sample_supplier_data):
        """测试获取待付款账单"""
        # 先创建供应商
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        # 创建待付款账单
        bill_data = {
            "supplier_id": supplier_id,
            "amount": 5000.0,
            "status": "待付款"
        }
        client.post("/api/suppliers/bills", json=bill_data)

        response = client.get("/api/suppliers/bills/pending")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_create_supplier_review_simplified(self, client, sample_supplier_data):
        """测试简化创建供应商评价"""
        # 先创建供应商
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        # 使用简化格式创建评价
        review_data = {
            "content": "服务态度很好，按时交付",
            "rating": 5
        }
        response = client.post(f"/api/suppliers/{supplier_id}/reviews", json=review_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["overall_score"] == 5

    def test_create_supplier_bill_simplified(self, client, sample_supplier_data):
        """测试简化创建供应商账单"""
        # 先创建供应商
        create_response = client.post("/api/suppliers/", json=sample_supplier_data)
        supplier_id = create_response.json()["id"]

        # 使用简化格式创建账单
        bill_data = {
            "activity_name": "2026春季活动",
            "project_name": "场地搭建",
            "amount": 15000.0,
            "status": "待付款",
            "date": "2026-04-15"
        }
        response = client.post(f"/api/suppliers/{supplier_id}/bills", json=bill_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["amount"] == 15000.0
