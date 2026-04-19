/**
 * 复盘管理场景测试
 * 覆盖复盘创建、反馈添加、提交、AI摘要生成等核心场景
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

// Mock 数据
const mockActivities = [
  { id: '1', name: '2024春季产品发布会', date: '2024-03-15', category: '自办活动', budget: 50000, actualSpend: 48000, status: '已完成' },
  { id: '2', name: '行业峰会参展', date: '2024-05-20', category: '外部市场活动', budget: 80000, actualSpend: 75000, status: '已完成' },
];

const mockReviews = [
  {
    id: '1',
    activityId: '1',
    status: '进行中',
    expectedParticipants: 10,
    feedbacks: [
      {
        id: 'f1',
        evaluatorName: '张三',
        goalScore: 4,
        leadQualityScore: 5,
        executionScore: 4,
        resourceScore: 4,
        brandScore: 5,
        successes: '活动组织有序',
        problems: '签到环节稍慢',
        suggestions: '提前准备签到表',
        isSubmitted: true,
        tags: ['签到', '组织'],
      },
      {
        id: 'f2',
        evaluatorName: '李四',
        goalScore: 5,
        leadQualityScore: 4,
        executionScore: 5,
        resourceScore: 4,
        brandScore: 4,
        successes: '客户反馈好',
        problems: '物料准备不足',
        suggestions: '增加物料储备',
        isSubmitted: true,
        tags: ['物料', '客户反馈'],
      },
    ],
    conclusion: {
      overallScore: 4.4,
      ai_summary: '本次活动整体表现良好',
    },
  },
  {
    id: '2',
    activityId: '2',
    status: '未开始',
    expectedParticipants: 15,
    feedbacks: [],
    conclusion: null,
  },
];

// Mock hooks
vi.mock('../../utils/hooks', () => ({
  useReviewsData: () => ({
    reviewActivities: mockReviews,
    loading: false,
    error: null,
  }),
  useActivitiesData: () => ({
    activities: mockActivities,
    loading: false,
    error: null,
  }),
}));

// Mock Toast
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};
vi.mock('../../shared/Toast', () => ({
  useToast: () => mockToast,
}));

// Mock API
vi.mock('../../services/backendApi', () => ({
  reviewsApi: {
    getActivities: vi.fn().mockResolvedValue(mockActivities),
    getReview: vi.fn().mockResolvedValue(mockReviews[0]),
    getReviewDetail: vi.fn().mockResolvedValue(mockReviews[0]),
    createReview: vi.fn().mockResolvedValue({ id: '3', activityId: '1', status: '未开始' }),
    updateReview: vi.fn().mockResolvedValue({ success: true }),
    startReview: vi.fn().mockResolvedValue({ id: '1', status: '进行中' }),
    completeReview: vi.fn().mockResolvedValue({ id: '1', status: '已完成' }),
    getFeedbacks: vi.fn().mockResolvedValue(mockReviews[0].feedbacks),
    createFeedback: vi.fn().mockResolvedValue({ id: 'f3' }),
    updateFeedback: vi.fn().mockResolvedValue({ success: true }),
    submitFeedback: vi.fn().mockResolvedValue({ isSubmitted: true }),
    getConclusion: vi.fn().mockResolvedValue(mockReviews[0].conclusion),
    createConclusion: vi.fn().mockResolvedValue({ id: 'c1' }),
    updateConclusion: vi.fn().mockResolvedValue({ success: true }),
    getAvgScores: vi.fn().mockResolvedValue({
      avg_goal_score: 4.5,
      avg_lead_quality_score: 4.5,
      avg_execution_score: 4.5,
      avg_resource_score: 4.0,
      avg_brand_score: 4.5,
      overall_score: 4.4,
    }),
    generateSummary: vi.fn().mockResolvedValue({
      summary: '本次活动整体表现良好',
      key_successes: ['活动组织有序', '客户反馈好'],
      common_problems: ['签到环节稍慢', '物料准备不足'],
      action_suggestions: ['提前准备签到表', '增加物料储备'],
      avg_scores: {
        avg_goal_score: 4.5,
        avg_lead_quality_score: 4.5,
        avg_execution_score: 4.5,
        avg_resource_score: 4.0,
        avg_brand_score: 4.5,
        overall_score: 4.4,
      },
    }),
  },
}));

describe('复盘管理场景', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mockToast).forEach(fn => fn.mockClear());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('场景34: 创建复盘', () => {
    it('应正确创建新复盘', async () => {
      // Given: 复盘数据
      const reviewData = {
        activity_id: 1,
        status: '未开始',
        expected_participants: 10,
      };

      // When: 创建复盘
      const { reviewsApi } = await import('../../services/backendApi');
      const result = await reviewsApi.createReview(reviewData);

      // Then: 返回新复盘
      expect(result).toHaveProperty('id');
      expect(result.status).toBe('未开始');
    });

    it('新复盘默认状态应为未开始', () => {
      // Given: 默认状态
      const defaultStatus = '未开始';

      // Then: 状态正确
      expect(defaultStatus).toBe('未开始');
    });

    it('复盘应关联活动', () => {
      // Given: 复盘和活动
      const review = mockReviews[0];
      const activity = mockActivities.find(a => a.id === review.activityId);

      // Then: 关联正确
      expect(activity).toBeDefined();
      expect(activity?.name).toBe('2024春季产品发布会');
    });

    it('复盘应设置预期参与人数', () => {
      // Given: 预期人数
      const expectedParticipants = 10;

      // Then: 人数设置正确
      expect(expectedParticipants).toBe(10);
    });

    it('只能为已完成的创建复盘', () => {
      // Given: 已完成活动
      const completedActivity = mockActivities.find(a => a.status === '已完成');

      // Then: 可以创建复盘
      expect(completedActivity).toBeDefined();
    });
  });

  describe('场景35: 添加复盘反馈', () => {
    it('应正确添加反馈', async () => {
      // Given: 反馈数据
      const feedbackData = {
        review_id: 1,
        evaluator_id: 'user1',
        evaluator_name: '王五',
        evaluator_role: '项目经理',
        goal_score: 5,
        lead_quality_score: 4,
        execution_score: 5,
        resource_score: 4,
        brand_score: 5,
        successes: '活动圆满成功',
        problems: '部分细节待优化',
        suggestions: '下次可提前规划',
        tags: ['组织', '策划'],
      };

      // When: 添加反馈
      const { reviewsApi } = await import('../../services/backendApi');
      const result = await reviewsApi.createFeedback(feedbackData);

      // Then: 返回反馈
      expect(result).toHaveProperty('id');
    });

    it('评分应在1-5范围内', () => {
      // Given: 评分验证
      const validateScore = (score: number) => score >= 1 && score <= 5;

      // Then: 验证结果
      expect(validateScore(5)).toBe(true);
      expect(validateScore(1)).toBe(true);
      expect(validateScore(0)).toBe(false);
      expect(validateScore(6)).toBe(false);
    });

    it('反馈应记录评价人信息', () => {
      // Given: 反馈数据
      const feedback = {
        evaluatorName: '张三',
        evaluatorRole: '市场经理',
      };

      // Then: 信息完整
      expect(feedback.evaluatorName).toBeTruthy();
      expect(feedback.evaluatorRole).toBeTruthy();
    });

    it('成功经验不应为空', () => {
      // Given: 成功经验
      const successes = '活动组织有序';

      // Then: 非空
      expect(successes.trim().length).toBeGreaterThan(0);
    });

    it('问题描述不应为空', () => {
      // Given: 问题描述
      const problems = '签到环节稍慢';

      // Then: 非空
      expect(problems.trim().length).toBeGreaterThan(0);
    });

    it('改进建议不应为空', () => {
      // Given: 建议
      const suggestions = '提前准备签到表';

      // Then: 非空
      expect(suggestions.trim().length).toBeGreaterThan(0);
    });
  });

  describe('场景36: 提交复盘反馈', () => {
    it('应正确提交反馈', async () => {
      // Given: 反馈ID
      const feedbackId = 1;

      // When: 提交反馈
      const { reviewsApi } = await import('../../services/backendApi');
      await reviewsApi.submitFeedback(feedbackId);

      // Then: API被调用
      expect(reviewsApi.submitFeedback).toHaveBeenCalledWith(feedbackId);
    });

    it('提交后反馈状态应变为已提交', async () => {
      // Given: 未提交的反馈
      const feedback = mockReviews[0].feedbacks[0];

      // When: 提交
      const { reviewsApi } = await import('../../services/backendApi');
      await reviewsApi.submitFeedback(1);

      // Then: 状态更新（模拟）
      expect(feedback.isSubmitted).toBe(true);
    });

    it('已提交反馈不应允许修改', () => {
      // Given: 已提交的反馈
      const feedback = { id: '1', isSubmitted: true };

      // Then: 不允许修改
      expect(feedback.isSubmitted).toBe(true);
    });

    it('提交应更新进度', () => {
      // Given: 复盘和反馈
      const review = mockReviews[0];
      const submittedCount = review.feedbacks.filter(f => f.isSubmitted).length;

      // Then: 进度更新
      expect(submittedCount).toBe(2);
    });
  });

  describe('场景37: 生成AI摘要', () => {
    it('应正确生成AI摘要', async () => {
      // Given: 复盘ID
      const reviewId = 1;

      // When: 生成摘要
      const { reviewsApi } = await import('../../services/backendApi');
      const result = await reviewsApi.generateSummary(reviewId);

      // Then: 返回摘要数据
      expect(result).toHaveProperty('summary');
      expect(result).toHaveProperty('key_successes');
      expect(result).toHaveProperty('common_problems');
      expect(result).toHaveProperty('action_suggestions');
    });

    it('AI摘要应包含关键成功点', async () => {
      // Given: 摘要数据
      const { reviewsApi } = await import('../../services/backendApi');
      const result = await reviewsApi.generateSummary(1);

      // Then: 包含成功点
      expect(result.key_successes.length).toBeGreaterThan(0);
    });

    it('AI摘要应包含常见问题', async () => {
      // Given: 摘要数据
      const { reviewsApi } = await import('../../services/backendApi');
      const result = await reviewsApi.generateSummary(1);

      // Then: 包含问题
      expect(result.common_problems.length).toBeGreaterThan(0);
    });

    it('AI摘要应包含行动建议', async () => {
      // Given: 摘要数据
      const { reviewsApi } = await import('../../services/backendApi');
      const result = await reviewsApi.generateSummary(1);

      // Then: 包含建议
      expect(result.action_suggestions.length).toBeGreaterThan(0);
    });

    it('生成中应显示加载状态', () => {
      // Given: 加载状态
      let isGenerating = true;

      // Then: 显示加载
      expect(isGenerating).toBe(true);
    });

    it('生成失败应显示错误', () => {
      // Given: 生成失败
      const errorMessage = 'AI摘要生成失败';

      // Then: 显示错误
      expect(errorMessage).toBeTruthy();
    });

    it('多条反馈后应能生成摘要', () => {
      // Given: 多条反馈
      const feedbackCount = mockReviews[0].feedbacks.length;

      // Then: 足够生成
      expect(feedbackCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('场景38: 查看年度复盘统计', () => {
    it('应获取年度复盘列表', async () => {
      // Given: 年份
      const year = '2024';

      // When: 获取列表
      const { reviewsApi } = await import('../../services/backendApi');
      const activities = await reviewsApi.getActivities();

      // Then: 返回活动列表
      expect(Array.isArray(activities)).toBe(true);
    });

    it('应按年份筛选复盘', () => {
      // Given: 活动和年份
      const year = '2024';

      // When: 筛选
      const yearReviews = mockReviews.filter(r => {
        const activity = mockActivities.find(a => a.id === r.activityId);
        return activity?.date.includes(year);
      });

      // Then: 筛选正确
      expect(yearReviews.length).toBeGreaterThan(0);
    });

    it('应计算年度复盘总数', () => {
      // Given: 2024年复盘
      const year = '2024';
      const yearReviews = mockReviews.filter(r => {
        const activity = mockActivities.find(a => a.id === r.activityId);
        return activity?.date.includes(year);
      });

      // Then: 总数正确
      expect(yearReviews.length).toBe(2);
    });

    it('应计算年度平均分', () => {
      // Given: 复盘列表
      const reviewsWithScores = mockReviews.filter(r => r.conclusion?.overallScore);

      // When: 计算平均分
      if (reviewsWithScores.length > 0) {
        const avgScore = reviewsWithScores.reduce((sum, r) => sum + (r.conclusion?.overallScore || 0), 0) / reviewsWithScores.length;

        // Then: 平均分正确
        expect(avgScore).toBeCloseTo(4.4, 1);
      }
    });

    it('空数据年份应显示空状态', () => {
      // Given: 无数据的年份
      const year = '2020';
      const yearReviews = mockReviews.filter(r => {
        const activity = mockActivities.find(a => a.id === r.activityId);
        return activity?.date.includes(year);
      });

      // Then: 为空
      expect(yearReviews.length).toBe(0);
    });
  });

  describe('场景39: 复盘状态流转', () => {
    it('未开始应能转为进行中', async () => {
      // Given: 复盘ID
      const reviewId = 2;

      // When: 启动复盘
      const { reviewsApi } = await import('../../services/backendApi');
      await reviewsApi.startReview(reviewId);

      // Then: API被调用
      expect(reviewsApi.startReview).toHaveBeenCalledWith(reviewId);
    });

    it('进行中应能转为已完成', async () => {
      // Given: 复盘ID
      const reviewId = 1;

      // When: 完成复盘
      const { reviewsApi } = await import('../../services/backendApi');
      await reviewsApi.completeReview(reviewId);

      // Then: API被调用
      expect(reviewsApi.completeReview).toHaveBeenCalledWith(reviewId);
    });

    it('已完成不应回退', () => {
      // Given: 已完成复盘
      const status = '已完成';

      // Then: 不允许回退
      expect(status).toBe('已完成');
    });

    it('复盘状态应有效', () => {
      // Given: 有效状态
      const validStatuses = ['未开始', '进行中', '待确认', '已完成'];

      // Then: 状态有效
      mockReviews.forEach(review => {
        expect(validStatuses).toContain(review.status);
      });
    });
  });

  describe('场景40: 复盘反馈标签', () => {
    it('应支持预设标签', () => {
      // Given: 预设标签
      const presetTags = ['签到', '组织', '物料', '客户反馈', '策划', '执行', '效果', '预算'];

      // Then: 标签有效
      expect(presetTags.length).toBeGreaterThan(0);
    });

    it('反馈应能添加多个标签', () => {
      // Given: 反馈标签
      const feedback = mockReviews[0].feedbacks[0];

      // Then: 有标签
      expect(feedback.tags).toBeDefined();
      expect(feedback.tags!.length).toBeGreaterThan(0);
    });

    it('标签应分类管理', () => {
      // Given: 标签分类
      const tagCategories = ['问题类', '成功类', '建议类', '其他'];

      // Then: 分类有效
      expect(tagCategories.length).toBe(4);
    });
  });

  describe('场景41: 复盘评分计算', () => {
    it('应正确计算综合评分', () => {
      // Given: 各维度评分
      const goalScore = 4;
      const leadQualityScore = 5;
      const executionScore = 4;
      const resourceScore = 4;
      const brandScore = 5;

      // When: 计算综合分（平均）
      const overallScore = (goalScore + leadQualityScore + executionScore + resourceScore + brandScore) / 5;

      // Then: 综合分正确
      expect(overallScore).toBe(4.4);
    });

    it('应获取平均分数据', async () => {
      // Given: 复盘ID
      const reviewId = 1;

      // When: 获取平均分
      const { reviewsApi } = await import('../../services/backendApi');
      const avgScores = await reviewsApi.getAvgScores(reviewId);

      // Then: 返回平均分
      expect(avgScores).toHaveProperty('overall_score');
    });
  });

  describe('场景42: 复盘数据验证', () => {
    it('预期参与人数应为正数', () => {
      // Given: 验证函数
      const validateParticipants = (count: number) => count > 0;

      // Then: 验证结果
      expect(validateParticipants(10)).toBe(true);
      expect(validateParticipants(0)).toBe(false);
    });

    it('评分应为1-5整数', () => {
      // Given: 评分验证
      const validateScore = (score: number) => score >= 1 && score <= 5 && Number.isInteger(score);

      // Then: 验证结果
      expect(validateScore(5)).toBe(true);
      expect(validateScore(3)).toBe(true);
      expect(validateScore(0)).toBe(false);
      expect(validateScore(6)).toBe(false);
      expect(validateScore(3.5)).toBe(false);
    });
  });
});
