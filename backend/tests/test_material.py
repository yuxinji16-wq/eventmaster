"""
物料 API 单元测试
"""
import pytest
from fastapi import status


class TestMaterialAPI:
    """物料 API 测试类"""

    def test_create_material(self, client, sample_material_data):
        """测试创建物料"""
        response = client.post("/api/materials/", json=sample_material_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == sample_material_data["name"]
        assert data["category"] == sample_material_data["category"]
        assert data["stock"] == sample_material_data["stock"]
        assert "id" in data

    def test_get_material_list(self, client, sample_material_data):
        """测试获取物料列表"""
        client.post("/api/materials/", json=sample_material_data)

        response = client.get("/api/materials/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_material_by_id(self, client, sample_material_data):
        """测试根据ID获取物料详情"""
        create_response = client.post("/api/materials/", json=sample_material_data)
        material_id = create_response.json()["id"]

        response = client.get(f"/api/materials/{material_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == material_id

    def test_update_material(self, client, sample_material_data):
        """测试更新物料"""
        create_response = client.post("/api/materials/", json=sample_material_data)
        material_id = create_response.json()["id"]

        update_data = {"name": "更新后的物料", "stock": 200.0}
        response = client.put(f"/api/materials/{material_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["name"] == "更新后的物料"
        assert data["stock"] == 200.0

    def test_delete_material(self, client, sample_material_data):
        """测试删除物料"""
        create_response = client.post("/api/materials/", json=sample_material_data)
        material_id = create_response.json()["id"]

        response = client.delete(f"/api/materials/{material_id}")
        assert response.status_code == status.HTTP_200_OK

        get_response = client.get(f"/api/materials/{material_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    def test_get_low_stock_materials(self, client, sample_material_data):
        """测试获取低库存物料"""
        # 创建一个低库存物料
        low_stock_data = sample_material_data.copy()
        low_stock_data["stock"] = 5.0
        low_stock_data["min_stock"] = 10.0
        client.post("/api/materials/", json=low_stock_data)

        response = client.get("/api/materials/?low_stock=true")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_search_materials(self, client, sample_material_data):
        """测试搜索物料"""
        client.post("/api/materials/", json=sample_material_data)

        response = client.get("/api/materials/?keyword=测试")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_create_warehousing_log(self, client, sample_material_data):
        """测试创建入库记录"""
        # 先创建物料
        create_response = client.post("/api/materials/", json=sample_material_data)
        material_id = create_response.json()["id"]

        # 创建入库记录 - 使用前端格式
        warehousing_data = {
            "count": 50.0,
            "operator": "测试操作员",
            "is_new_type": False
        }
        response = client.post(f"/api/materials/{material_id}/warehousing", json=warehousing_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["count"] == 50.0

    def test_create_withdrawal_log(self, client, sample_material_data):
        """测试创建出库记录"""
        # 先创建物料
        create_response = client.post("/api/materials/", json=sample_material_data)
        material_id = create_response.json()["id"]

        # 创建出库记录 - 使用前端格式
        withdrawal_data = {
            "count": 10.0,
            "user": "测试用户",
            "reason": "测试出库"
        }
        response = client.post(f"/api/materials/{material_id}/withdrawal", json=withdrawal_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["count"] == 10.0

    def test_get_warehousing_logs(self, client, sample_material_data):
        """测试获取入库记录"""
        # 先创建物料
        create_response = client.post("/api/materials/", json=sample_material_data)
        material_id = create_response.json()["id"]

        # 创建入库记录
        warehousing_data = {
            "material_id": material_id,
            "quantity": 50.0,
            "type": "入库"
        }
        client.post("/api/materials/warehousing", json=warehousing_data)

        # 获取入库记录
        response = client.get(f"/api/materials/{material_id}/warehousing")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_create_global_warehousing_log(self, client, sample_material_data):
        """测试创建全局入库记录"""
        # 先创建物料
        create_response = client.post("/api/materials/", json=sample_material_data)
        material_id = create_response.json()["id"]

        # 创建全局入库记录
        warehousing_data = {
            "material_id": material_id,
            "count": 100.0,
            "operator": "全局操作员",
            "is_new_type": "true"
        }
        response = client.post("/api/materials/warehousing", json=warehousing_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["material_id"] == material_id
        assert data["count"] == 100.0

    def test_create_global_withdrawal_log(self, client, sample_material_data):
        """测试创建全局出库记录"""
        # 先创建物料
        create_response = client.post("/api/materials/", json=sample_material_data)
        material_id = create_response.json()["id"]

        # 创建全局出库记录
        withdrawal_data = {
            "material_id": material_id,
            "count": 20.0,
            "user": "全局用户",
            "reason": "全局出库测试"
        }
        response = client.post("/api/materials/withdrawal", json=withdrawal_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["material_id"] == material_id
        assert data["count"] == 20.0
