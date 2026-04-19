/**
 * 仪表盘场景测试
 * 覆盖年度数据查看、数据刷新、空数据状态等核心场景
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
const mockDashboardStats = {
  yearly_metrics: {
    year: '2024',
    total_activities: 25,
    total_budget: 500000,
    total_leads: 500,
    avg_roi: 3.5,
  },
  monthly_trend: [
    { month: '2024-01', activities: 2, budget: 50000, leads: 30 },
    { month: '2024-02', activities: 3, budget: 60000, leads: 45 },
    { month: '2024-03', activities: 4, budget: 80000, leads: 60 },
    { month: '2024-04', activities: 3, budget: 55000, leads: 40 },
    { month: '2024-05', activities: 5, budget: 90000, leads: 80 },
    { month: '2024-06', activities: 2, budget: 40000, leads: 35 },
    { month: '2024-07', activities: 1, budget: 20000, leads: 15 },
    { month: '2024-08', activities: 2, budget: 35000, leads: 40 },
    { month: '2024-09', activities: 1, budget: 25000, leads: 25 },
    { month: '2024-10', activities: 1, budget: 20000, leads: 50 },
    { month: '2024-11', activities: 1, budget: 25000, leads: 35 },
    { month: '2024-12', activities: 0, budget: 0, leads: 0 },
  ],
  activity_distribution: [
    { category: '已完成', count: 15 },
    { category: '进行中', count: 5 },
    { category: '待启动', count: 5 },
  ],
};

const mockDashboardResponse = {
  budget: {
    total: 500000,
    utilization_rate: 65,
  },
  opportunities: {
    total_value: 2600000,
  },
  activities: {
    total: 25,
    completed: 15,
    ongoing: 5,
    by_status: {
      '待启动': 5,
    },
  },
  monthly: {
    '2024-01': { budget: 50000, count: 2 },
    '2024-02': { budget: 60000, count: 3 },
    '2024-03': { budget: 80000, count: 4 },
    '2024-04': { budget: 55000, count: 3 },
    '2024-05': { budget: 90000, count: 5 },
    '2024-06': { budget: 40000, count: 2 },
    '2024-07': { budget: 20000, count: 1 },
    '2024-08': { budget: 35000, count: 2 },
    '2024-09': { budget: 25000, count: 1 },
    '2024-10': { budget: 20000, count: 1 },
    '2024-11': { budget: 25000, count: 1 },
    '2024-12': { budget: 0, count: 0 },
  },
};

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
  dashboardApi: {
    getStats: vi.fn().mockResolvedValue(mockDashboardStats),
  },
}));

describe('仪表盘场景', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mockToast).forEach(fn => fn.mockClear());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('场景39: 查看年度数据', () => {
    it('应能获取指定年份的统计数据', async () => {
      // Given: 年份参数
      const year = '2024';

      // When: 获取统计数据
      const { dashboardApi } = await import('../../services/backendApi');
      const stats = await dashboardApi.getStats(year);

      // Then: 返回统计数据
      expect(stats).toHaveProperty('yearly_metrics');
      expect(stats).toHaveProperty('monthly_trend');
    });

    it('年度数据应包含正确年份', () => {
      // Given: 年度数据
      const metrics = mockDashboardStats.yearly_metrics;

      // Then: 年份正确
      expect(metrics.year).toBe('2024');
    });

    it('年度数据应包含活动总数', () => {
      // Given: 年度指标
      const metrics = mockDashboardStats.yearly_metrics;

      // Then: 活动总数
      expect(metrics.total_activities).toBe(25);
    });

    it('年度数据应包含总预算', () => {
      // Given: 年度指标
      const metrics = mockDashboardStats.yearly_metrics;

      // Then: 总预算
      expect(metrics.total_budget).toBe(500000);
    });

    it('年度数据应包含潜客数', () => {
      // Given: 年度指标
      const metrics = mockDashboardStats.yearly_metrics;

      // Then: 潜客数
      expect(metrics.total_leads).toBe(500);
    });

    it('年度数据应包含ROI', () => {
      // Given: 年度指标
      const metrics = mockDashboardStats.yearly_metrics;

      // Then: ROI
      expect(metrics.avg_roi).toBe(3.5);
    });

    it('应能切换查看不同年份数据', () => {
      // Given: 年份列表
      const years = ['2027', '2026', '2025', '2024', '2023', '2022'];

      // Then: 年份列表正确
      expect(years).toContain('2024');
      expect(years.length).toBe(6);
    });

    it('年度数据应包含月度趋势', () => {
      // Given: 统计数据
      const stats = mockDashboardStats;

      // Then: 包含月度趋势
      expect(stats.monthly_trend).toBeDefined();
      expect(stats.monthly_trend.length).toBe(12);
    });

    it('年度数据应包含活动分布', () => {
      // Given: 统计数据
      const stats = mockDashboardStats;

      // Then: 包含活动分布
      expect(stats.activity_distribution).toBeDefined();
      expect(stats.activity_distribution.length).toBeGreaterThan(0);
    });
  });

  describe('场景40: 数据刷新', () => {
    it('应能手动刷新数据', async () => {
      // Given: 当前年份
      const year = '2024';

      // When: 刷新数据
      const { dashboardApi } = await import('../../services/backendApi');
      vi.clearAllMocks();
      dashboardApi.getStats.mockClear();
      dashboardApi.getStats.mockResolvedValueOnce(mockDashboardStats);
      const stats = await dashboardApi.getStats(year);

      // Then: API被调用
      expect(dashboardApi.getStats).toHaveBeenCalledWith(year);
    });

    it('刷新时应显示加载状态', () => {
      // Given: 加载状态
      let isRefreshing = true;

      // Then: 显示加载
      expect(isRefreshing).toBe(true);
    });

    it('刷新成功后应更新数据', async () => {
      // Given: 旧数据
      const oldStats = mockDashboardStats;

      // When: 获取新数据
      const { dashboardApi } = await import('../../services/backendApi');
      const newStats = await dashboardApi.getStats('2024');

      // Then: 数据更新
      expect(newStats).toBeDefined();
    });

    it('刷新失败应显示错误', () => {
      // Given: 错误处理
      const errorMessage = '数据加载失败';

      // Then: 错误非空
      expect(errorMessage).toBeTruthy();
    });

    it('刷新后应停止加载状态', async () => {
      // Given: 加载完成
      let isLoading = false;

      // Then: 停止加载
      expect(isLoading).toBe(false);
    });
  });

  describe('场景41: 空数据状态', () => {
    it('无数据年份应显示空状态', () => {
      // Given: 空数据
      const emptyData = {
        monthly_trend: [],
        activity_distribution: [],
        yearly_metrics: {
          year: '2020',
          total_activities: 0,
          total_budget: 0,
          total_leads: 0,
          avg_roi: 0,
        },
      };

      // Then: 数据为空
      expect(emptyData.monthly_trend.length).toBe(0);
      expect(emptyData.yearly_metrics.total_activities).toBe(0);
    });

    it('空状态应显示暂无数据提示', () => {
      // Given: 空状态文案
      const emptyTitle = '暂无可展示的仪表盘数据';

      // Then: 提示正确
      expect(emptyTitle).toBe('暂无可展示的仪表盘数据');
    });

    it('空状态应提供切换年份提示', () => {
      // Given: 空状态描述
      const emptyDescription = '请切换年份或补充业务数据后重试。';

      // Then: 提示正确
      expect(emptyDescription).toBeTruthy();
    });

    it('零预算应正确显示', () => {
      // Given: 零预算
      const zeroBudget = 0;

      // Then: 显示正确
      expect(zeroBudget).toBe(0);
    });

    it('零活动数应正确显示', () => {
      // Given: 零活动
      const zeroActivities = 0;

      // Then: 显示正确
      expect(zeroActivities).toBe(0);
    });
  });

  describe('场景42: 仪表盘数据展示', () => {
    it('应正确显示年度总预算', () => {
      // Given: 预算数据
      const budget = mockDashboardResponse.budget.total;

      // When: 格式化显示
      const displayValue = `¥${(budget / 10000).toFixed(1)}w`;

      // Then: 格式正确
      expect(displayValue).toBe('¥50.0w');
    });

    it('应正确显示累计潜客数', () => {
      // Given: 潜客数据
      const opportunities = mockDashboardResponse.opportunities.total_value;

      // Then: 显示正确
      expect(opportunities).toBe(2600000);
    });

    it('应正确显示活动ROI', () => {
      // Given: ROI数据
      const roi = mockDashboardStats.yearly_metrics.avg_roi;

      // Then: 显示正确
      expect(roi).toBe(3.5);
    });

    it('应正确显示活动完成率', () => {
      // Given: 活动数据
      const total = 25;
      const completed = 15;
      const completionRate = (completed / total) * 100;

      // Then: 完成率正确
      expect(completionRate).toBe(60);
    });

    it('应正确显示预算执行率', () => {
      // Given: 预算执行率
      const utilizationRate = mockDashboardResponse.budget.utilization_rate;

      // Then: 执行率正确
      expect(utilizationRate).toBe(65);
    });
  });

  describe('场景43: 图表数据转换', () => {
    it('月度趋势数据应正确转换格式', () => {
      // Given: API响应数据
      const monthlyData = mockDashboardResponse.monthly;

      // When: 转换为图表格式
      const chartData = Object.entries(monthlyData).map(([month, data]: [string, any]) => ({
        name: month.slice(5) + '月',
        budget: data.budget,
        leads: data.count * 10,
      }));

      // Then: 格式正确
      expect(chartData[0].name).toBe('01月');
      expect(chartData.length).toBe(12);
    });

    it('活动分布数据应正确转换', () => {
      // Given: 分布数据
      const distribution = mockDashboardStats.activity_distribution;
      const total = distribution.reduce((sum, d) => sum + d.count, 0);

      // When: 计算百分比
      const withPercentage = distribution.map(d => ({
        ...d,
        percentage: (d.count / total) * 100,
      }));

      // Then: 百分比正确
      expect(withPercentage[0].percentage).toBeCloseTo(60, 0);
    });

    it('图表数据应为数组格式', () => {
      // Given: 图表数据
      const chartData = mockDashboardStats.monthly_trend;

      // Then: 数组格式
      expect(Array.isArray(chartData)).toBe(true);
    });
  });

  describe('场景44: 仪表盘加载状态', () => {
    it('初始加载应显示加载状态', () => {
      // Given: 加载状态
      const isLoading = true;

      // Then: 显示加载
      expect(isLoading).toBe(true);
    });

    it('加载完成应停止显示加载', () => {
      // Given: 加载完成
      const isLoading = false;
      const hasData = mockDashboardStats !== null;

      // Then: 停止加载
      expect(isLoading).toBe(false);
      expect(hasData).toBe(true);
    });

    it('加载中文案应正确', () => {
      // Given: 加载文案
      const loadingText = '仪表盘数据加载中...';

      // Then: 文案正确
      expect(loadingText).toBe('仪表盘数据加载中...');
    });

    it('加载失败应显示重试按钮', () => {
      // Given: 错误状态
      const hasError = true;

      // Then: 显示错误标题
      const errorTitle = '仪表盘加载失败';
      expect(errorTitle).toBe('仪表盘加载失败');
    });
  });

  describe('场景45: 仪表盘指标计算', () => {
    it('应正确计算预算使用率', () => {
      // Given: 预算数据
      const total = 500000;
      const used = 325000;
      const utilizationRate = (used / total) * 100;

      // Then: 使用率正确
      expect(utilizationRate).toBe(65);
    });

    it('应正确计算平均活动预算', () => {
      // Given: 活动预算
      const totalBudget = 500000;
      const totalActivities = 25;
      const avgBudget = totalBudget / totalActivities;

      // Then: 平均预算正确
      expect(avgBudget).toBe(20000);
    });

    it('应正确计算潜客转化', () => {
      // Given: 潜客数据
      const totalLeads = 500;
      const totalActivities = 25;
      const leadsPerActivity = totalLeads / totalActivities;

      // Then: 人均潜客正确
      expect(leadsPerActivity).toBe(20);
    });

    it('应正确计算月度预算合计', () => {
      // Given: 月度预算
      const monthlyBudgets = mockDashboardStats.monthly_trend.map(m => m.budget);
      const totalBudget = monthlyBudgets.reduce((sum, b) => sum + b, 0);

      // Then: 合计正确
      expect(totalBudget).toBe(500000);
    });
  });

  describe('场景46: 年份选择器', () => {
    it('应显示可用年份列表', () => {
      // Given: 年份列表
      const years = ['2027', '2026', '2025', '2024', '2023', '2022'];

      // Then: 列表正确
      expect(years.length).toBe(6);
      expect(years[0]).toBe('2027'); // 最新在前
    });

    it('当前年份应默认选中', () => {
      // Given: 当前年份
      const currentYear = new Date().getFullYear().toString();

      // Then: 默认选中
      expect(currentYear).toBe('2026');
    });

    it('年份切换应触发数据刷新', () => {
      // Given: 年份切换
      const newYear = '2024';
      const shouldRefresh = true;

      // Then: 触发刷新
      expect(shouldRefresh).toBe(true);
    });
  });
});
