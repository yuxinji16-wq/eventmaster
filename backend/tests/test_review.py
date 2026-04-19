"""
复盘 API 单元测试
"""
import pytest
from fastapi import status


class TestReviewAPI:
    """复盘 API 测试类"""

    def test_create_review(self, client, sample_review_data):
        """测试创建复盘"""
        response = client.post("/api/reviews/", json=sample_review_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["activity_id"] == sample_review_data["activity_id"]
        assert data["status"] == sample_review_data["status"]
        assert "id" in data

    def test_get_review_list(self, client, sample_review_data):
        """测试获取复盘列表"""
        client.post("/api/reviews/", json=sample_review_data)

        response = client.get("/api/reviews/")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_get_review_by_id(self, client, sample_review_data):
        """测试根据ID获取复盘详情"""
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        response = client.get(f"/api/reviews/{review_id}")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == review_id

    def test_update_review(self, client, sample_review_data):
        """测试更新复盘"""
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        update_data = {"status": "进行中", "participant_count": 30}
        response = client.put(f"/api/reviews/{review_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "进行中"
        assert data["participant_count"] == 30

    def test_start_review(self, client, sample_review_data):
        """测试启动复盘"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        response = client.post(f"/api/reviews/{review_id}/start")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "进行中"

    def test_complete_review(self, client, sample_review_data):
        """测试完成复盘"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        response = client.post(f"/api/reviews/{review_id}/complete")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "已完成"

    def test_create_review_feedback(self, client, sample_review_data):
        """测试创建复盘反馈"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        feedback_data = {
            "review_id": review_id,
            "evaluator_id": "user123",
            "evaluator_name": "测试评价人",
            "evaluator_role": "项目经理",
            "goal_score": 4.5,
            "lead_quality_score": 4.0,
            "execution_score": 4.8,
            "resource_score": 4.2,
            "brand_score": 4.6,
            "successes": "活动执行顺利",
            "problems": "资源调配有优化空间",
            "suggestions": "建议提前规划"
        }
        response = client.post("/api/reviews/feedbacks", json=feedback_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["goal_score"] == 4.5
        assert data["evaluator_name"] == "测试评价人"

    def test_get_review_feedbacks(self, client, sample_review_data):
        """测试获取复盘反馈列表"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        # 创建反馈
        feedback_data = {
            "review_id": review_id,
            "evaluator_id": "user456",
            "evaluator_name": "另一评价人",
            "goal_score": 4.0,
            "lead_quality_score": 4.0,
            "execution_score": 4.0,
            "resource_score": 4.0,
            "brand_score": 4.0
        }
        client.post("/api/reviews/feedbacks", json=feedback_data)

        response = client.get(f"/api/reviews/{review_id}/feedbacks")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_update_feedback(self, client, sample_review_data):
        """测试更新复盘反馈"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        # 创建反馈
        feedback_data = {
            "review_id": review_id,
            "evaluator_id": "user789",
            "evaluator_name": "更新测试人",
            "goal_score": 3.5,
            "lead_quality_score": 3.5,
            "execution_score": 3.5,
            "resource_score": 3.5,
            "brand_score": 3.5
        }
        feedback_response = client.post("/api/reviews/feedbacks", json=feedback_data)
        feedback_id = feedback_response.json()["id"]

        # 更新反馈
        update_data = {"goal_score": 4.5, "suggestions": "更新后的建议"}
        response = client.put(f"/api/reviews/feedbacks/{feedback_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["goal_score"] == 4.5

    def test_submit_feedback(self, client, sample_review_data):
        """测试提交反馈"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        # 创建反馈
        feedback_data = {
            "review_id": review_id,
            "evaluator_id": "user101",
            "evaluator_name": "提交测试人",
            "goal_score": 4.0,
            "lead_quality_score": 4.0,
            "execution_score": 4.0,
            "resource_score": 4.0,
            "brand_score": 4.0
        }
        feedback_response = client.post("/api/reviews/feedbacks", json=feedback_data)
        feedback_id = feedback_response.json()["id"]

        response = client.post(f"/api/reviews/feedbacks/{feedback_id}/submit")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_submitted"] == True

    def test_create_review_conclusion(self, client, sample_review_data):
        """测试创建复盘结论"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        conclusion_data = {
            "review_id": review_id,
            "ai_summary": "AI生成的总结",
            "key_successes": ["成功1", "成功2"],
            "common_problems": ["问题1", "问题2"],
            "action_suggestions": ["建议1", "建议2"],
            "manager_summary": "管理总结",
            "manager_id": "manager001",
            "manager_name": "测试经理",
            "avg_goal_score": 4.5,
            "avg_lead_quality_score": 4.2,
            "avg_execution_score": 4.8,
            "avg_resource_score": 4.0,
            "avg_brand_score": 4.6,
            "overall_score": 4.42
        }
        response = client.post("/api/reviews/conclusions", json=conclusion_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["review_id"] == review_id
        assert data["overall_score"] == 4.42

    def test_get_review_conclusion(self, client, sample_review_data):
        """测试获取复盘结论"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        # 创建结论
        conclusion_data = {
            "review_id": review_id,
            "ai_summary": "测试总结",
            "key_successes": ["成功"],
            "common_problems": ["问题"],
            "action_suggestions": ["建议"],
            "manager_id": "manager002",
            "manager_name": "经理甲",
            "overall_score": 4.0
        }
        client.post("/api/reviews/conclusions", json=conclusion_data)

        response = client.get(f"/api/reviews/{review_id}/conclusion")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["review_id"] == review_id

    def test_get_review_avg_scores(self, client, sample_review_data):
        """测试获取复盘平均分"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        # 创建反馈
        feedback_data = {
            "review_id": review_id,
            "evaluator_id": "user999",
            "evaluator_name": "平均分测试人",
            "goal_score": 4.0,
            "lead_quality_score": 4.0,
            "execution_score": 4.0,
            "resource_score": 4.0,
            "brand_score": 4.0
        }
        feedback_response = client.post("/api/reviews/feedbacks", json=feedback_data)
        feedback_id = feedback_response.json()["id"]

        # 提交反馈
        client.post(f"/api/reviews/feedbacks/{feedback_id}/submit")

        response = client.get(f"/api/reviews/{review_id}/avg-scores")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "avg_goal_score" in data

    def test_filter_reviews_by_status(self, client, sample_review_data):
        """测试按状态筛选复盘"""
        client.post("/api/reviews/", json=sample_review_data)

        response = client.get("/api/reviews/?status=未开始")
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, list)

    def test_generate_review_summary(self, client, sample_review_data):
        """测试生成复盘AI摘要"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        response = client.post(f"/api/reviews/{review_id}/generate-summary")
        # 可能返回 200 或 500（如果 AI 服务不可用）
        assert response.status_code in [status.HTTP_200_OK, status.HTTP_500_INTERNAL_SERVER_ERROR]
        if response.status_code == status.HTTP_200_OK:
            data = response.json()
            assert "summary" in data or "key_successes" in data or "ai_summary" in data

    def test_update_review_conclusion(self, client, sample_review_data):
        """测试更新复盘结论"""
        # 先创建复盘
        create_response = client.post("/api/reviews/", json=sample_review_data)
        review_id = create_response.json()["id"]

        # 创建结论
        conclusion_data = {
            "review_id": review_id,
            "ai_summary": "初始总结",
            "key_successes": ["成功"],
            "common_problems": ["问题"],
            "action_suggestions": ["建议"],
            "manager_id": "manager003",
            "manager_name": "经理乙",
            "overall_score": 3.5
        }
        create_resp = client.post("/api/reviews/conclusions", json=conclusion_data)
        conclusion_id = create_resp.json()["id"]

        # 更新结论
        update_data = {
            "ai_summary": "更新后的AI总结",
            "key_successes": ["更新后的成功"],
            "common_problems": ["更新后的问题"],
            "action_suggestions": ["更新后的建议"],
            "manager_summary": "更新后的管理总结",
            "overall_score": 4.2
        }
        response = client.put(f"/api/reviews/conclusions/{conclusion_id}", json=update_data)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["ai_summary"] == "更新后的AI总结"
        assert data["overall_score"] == 4.2

    def test_update_nonexistent_conclusion(self, client, sample_review_data):
        """测试更新不存在的结论"""
        update_data = {
            "ai_summary": "不存在的结论",
            "overall_score": 4.0
        }
        response = client.put("/api/reviews/conclusions/99999", json=update_data)
        assert response.status_code == status.HTTP_404_NOT_FOUND
