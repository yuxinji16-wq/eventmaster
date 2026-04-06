"""
Dashboard API 单元测试
"""
import pytest
from fastapi import status


class TestDashboardAPI:
    """Dashboard API 测试类"""

    def test_get_dashboard_stats(self, client, sample_activity_data):
        """测试获取仪表盘统计数据"""
        # 先创建一个活动
        client.post("/api/activities/", json=sample_activity_data)

        response = client.get("/api/dashboard/stats?year=2026")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # 验证返回的数据结构
        assert "year" in data
        assert "activities" in data
        assert "budget" in data
        assert "opportunities" in data
        assert "reviews" in data
        assert "monthly" in data
        # 验证活动数据
        assert data["activities"]["total"] == 1
        assert data["activities"]["completed"] == 1

    def test_get_dashboard_stats_with_activities(self, client, sample_activity_data):
        """测试获取仪表盘统计数据（有多条活动时）"""
        # 创建多个活动
        for i in range(3):
            activity = sample_activity_data.copy()
            activity["name"] = f"测试活动{i+1}"
            activity["date"] = f"2026-0{i+1}-15"
            client.post("/api/activities/", json=activity)

        response = client.get("/api/dashboard/stats?year=2026")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["activities"]["total"] == 3

    def test_get_dashboard_stats_no_activities(self, client):
        """测试获取仪表盘统计数据（无活动时）"""
        response = client.get("/api/dashboard/stats?year=2026")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["activities"]["total"] == 0
        assert data["budget"]["total"] == 0
        assert data["opportunities"]["total"] == 0

    def test_get_dashboard_stats_different_years(self, client, sample_activity_data):
        """测试不同年份的仪表盘数据"""
        # 创建2026年活动
        client.post("/api/activities/", json=sample_activity_data)

        # 查询2025年（应该为空）
        response = client.get("/api/dashboard/stats?year=2025")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["activities"]["total"] == 0


class TestBudgetOverviewAPI:
    """预算概览 API 测试类"""

    def test_get_budget_overview(self, client, sample_activity_data):
        """测试获取预算概览"""
        # 先创建一个活动
        client.post("/api/activities/", json=sample_activity_data)

        response = client.get("/api/budget/overview?year=2026")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # 验证返回的数据结构
        assert "year" in data
        assert "total_planned" in data
        assert "total_used" in data
        assert "total_remaining" in data
        assert "utilization_rate" in data
        assert "budget_count" in data
        assert "activity_count" in data
        assert "by_category" in data

    def test_get_budget_overview_with_budget_logs(self, client, sample_activity_data):
        """测试获取预算概览（带有预算日志）"""
        # 创建活动
        response = client.post("/api/activities/", json=sample_activity_data)
        activity_id = response.json()["id"]

        # 创建预算
        budget_data = {
            "activity_id": activity_id,
            "total_amount": 50000.0,
            "used_amount": 0.0,
            "status": "草稿"
        }
        client.post("/api/budget/", json=budget_data)

        # 创建预算日志
        log_data = {
            "activity_id": activity_id,
            "name": "场地费",
            "amount": 10000.0,
            "category": "场地租用",
            "date": "2026-04-10",
            "notes": "测试日志",
            "status": "已结清",
            "type": "expense"
        }
        client.post("/api/budget/logs", json=log_data)

        response = client.get("/api/budget/overview?year=2026")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["budget_count"] >= 1
        assert data["activity_count"] >= 1

    def test_update_budget_quota(self, client):
        """测试更新年度配额"""
        quota_data = {
            "year": "2026",
            "quota": 1000000.0
        }
        response = client.put("/api/budget/quotas?year=2026", json=quota_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["year"] == "2026"
        assert data["quota"] == 1000000.0

    def test_get_budget_activities(self, client, sample_activity_data):
        """测试获取活动预算列表"""
        # 先创建一个活动
        client.post("/api/activities/", json=sample_activity_data)

        response = client.get("/api/budget/activities?year=2026")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_analyze_budget(self, client, sample_activity_data):
        """测试预算分析功能"""
        # 先创建一个活动
        response = client.post("/api/activities/", json=sample_activity_data)
        activity_id = response.json()["id"]

        response = client.post(f"/api/budget/analyze?activity_id={activity_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "activity_id" in data


class TestOpportunityPipelineAPI:
    """商机管道 API 测试类"""

    def test_get_opportunity_pipeline(self, client, sample_opportunity_data):
        """测试获取商机管道视图"""
        # 创建一个商机
        client.post("/opportunities/", json=sample_opportunity_data)

        response = client.get("/api/opportunities/pipeline")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # 验证返回的数据结构
        assert "stages" in data
        assert "高意向" in data["stages"]
        assert "中意向" in data["stages"]
        assert "低意向" in data["stages"]
        assert "counts" in data
        assert "total_value" in data

    def test_get_opportunity_pipeline_empty(self, client):
        """测试获取空的商机管道"""
        response = client.get("/api/opportunities/pipeline")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["counts"]["高意向"] == 0
        assert data["counts"]["中意向"] == 0
        assert data["counts"]["低意向"] == 0
        assert data["total_value"] == 0


class TestReviewActivitiesAPI:
    """复盘活动 API 测试类"""

    def test_get_review_activities_pending(self, client, sample_activity_data):
        """测试获取待复盘活动列表"""
        # 创建一个已完成的活动
        client.post("/api/activities/", json=sample_activity_data)

        response = client.get("/api/reviews/activities?status=pending")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_get_review_activities_all(self, client):
        """测试获取所有复盘活动"""
        response = client.get("/api/reviews/activities")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)


class TestGenerateInsightAPI:
    """AI生成洞察 API 测试类"""

    def test_generate_activity_insight(self, client, sample_activity_data):
        """测试生成活动AI洞察"""
        # 先创建一个活动
        response = client.post("/api/activities/", json=sample_activity_data)
        activity_id = response.json()["id"]

        response = client.post(f"/api/activities/{activity_id}/generate-insight")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # 验证返回的数据结构
        assert "activity_id" in data
        assert "activity_name" in data
        assert "insights" in data
        assert "metrics" in data
        assert data["activity_id"] == activity_id

    def test_generate_activity_insight_not_found(self, client):
        """测试为不存在的活动生成洞察"""
        response = client.post("/api/activities/99999/generate-insight")
        assert response.status_code == status.HTTP_404_NOT_FOUND
