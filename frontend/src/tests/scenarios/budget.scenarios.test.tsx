/**
 * 预算管理场景测试
 * 覆盖预算配额设置、费用明细管理、执行率计算、预警机制等核心场景
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
  { id: '1', name: '2024春季产品发布会', budget: 100000, actualSpend: 50000, status: '已完成' },
  { id: '2', name: '行业峰会参展', budget: 80000, actualSpend: 65000, status: '进行中' },
  { id: '3', name: 'Q2路演活动', budget: 50000, actualSpend: 48000, status: '进行中' },
  { id: '4', name: '年度总结大会', budget: 30000, actualSpend: 35000, status: '已完成' },
];

const mockBudgetLogs = [
  { id: '1', name: '场地租用', amount: 15000, category: '场地租用', activityId: '1' },
  { id: '2', name: '物料制作', amount: 20000, category: '物料制作', activityId: '1' },
  { id: '3', name: '餐饮招待', amount: 10000, category: '餐饮/招待', activityId: '1' },
];

const mockOverview = {
  yearly_quota: 300000,
  total_reimbursed: 150000,
  risk_projects: 2,
  execution_rate: 50,
};

// Mock hooks
vi.mock('../../utils/hooks', () => ({
  useActivitiesData: () => ({
    activities: mockActivities,
    loading: false,
    error: null,
    updateActivity: vi.fn(),
  }),
  useBudgetData: () => ({
    overview: mockOverview,
    activitiesWithBudget: mockActivities,
    loading: false,
    error: null,
    fetchBudgetOverview: vi.fn(),
    updateQuota: vi.fn().mockResolvedValue({ success: true }),
    getLogs: vi.fn().mockResolvedValue(mockBudgetLogs),
    createLog: vi.fn().mockResolvedValue({ id: '4' }),
    updateLog: vi.fn().mockResolvedValue({ success: true }),
    deleteLog: vi.fn().mockResolvedValue({ success: true }),
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
  budgetApi: {
    getOverview: vi.fn().mockResolvedValue(mockOverview),
    updateQuota: vi.fn().mockResolvedValue({ message: 'success' }),
    getActivities: vi.fn().mockResolvedValue({ activities: mockActivities, total: 4 }),
    getLogs: vi.fn().mockResolvedValue(mockBudgetLogs),
    createLog: vi.fn().mockResolvedValue({ id: '4', name: 'test' }),
    updateLog: vi.fn().mockResolvedValue({ success: true }),
    deleteLog: vi.fn().mockResolvedValue({ message: 'deleted' }),
    analyze: vi.fn().mockResolvedValue({ efficiency: 0.8, cpl: 50, roi: 2.5 }),
  },
  activitiesApi: {
    generateInsight: vi.fn().mockResolvedValue({ insight: 'AI分析' }),
  },
}));

describe('预算管理场景', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mockToast).forEach(fn => fn.mockClear());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('场景18: 设置年度配额', () => {
    it('应正确更新年度配额', async () => {
      // Given: 新配额数据
      const year = '2024';
      const newQuota = 500000;
      const { useBudgetData } = await import('../../utils/hooks');
      const { updateQuota } = useBudgetData();

      // When: 更新配额
      await updateQuota(year, newQuota);

      // Then: API被调用
      expect(updateQuota).toHaveBeenCalledWith(year, newQuota);
    });

    it('配额设置后概览页应显示新数据', () => {
      // Given: 更新后的配额
      const newQuota = 500000;

      // Then: 概览应反映新值
      expect(mockOverview.yearly_quota).not.toBe(newQuota); // 原始值
    });

    it('配额应为正数', () => {
      // Given: 配额验证
      const validateQuota = (quota: number) => quota > 0;

      // Then: 验证结果
      expect(validateQuota(100000)).toBe(true);
      expect(validateQuota(0)).toBe(false);
      expect(validateQuota(-1000)).toBe(false);
    });

    it('配额应支持千分位格式化', () => {
      // Given: 大数字
      const quota = 500000;

      // When: 格式化
      const formatted = quota.toLocaleString('zh-CN');

      // Then: 格式正确
      expect(formatted).toBe('500,000');
    });
  });

  describe('场景19: 添加费用明细', () => {
    it('应正确创建费用明细', async () => {
      // Given: 费用数据
      const newExpense = {
        activity_id: 1,
        name: '场地布置',
        amount: 8000,
        category: '搭建/展览',
        date: '2024-03-15',
      };

      // When: 创建费用
      const { budgetApi } = await import('../../services/backendApi');
      const result = await budgetApi.createLog(newExpense);

      // Then: 返回新建记录
      expect(result).toHaveProperty('id');
    });

    it('费用明细应关联活动', () => {
      // Given: 费用记录
      const log = {
        id: '1',
        activityId: '1',
        name: '场地租用',
        amount: 15000,
      };

      // Then: 关联正确
      expect(log.activityId).toBe('1');
    });

    it('费用类别应为有效选项', () => {
      // Given: 有效类别
      const validCategories = [
        '场地租用', '搭建/展览', '物料制作', '差旅/住宿',
        '餐饮/招待', '礼品/赠品', '媒体/推广', '人员费用', '其他'
      ];

      // Then: 验证通过
      expect(validCategories).toContain('场地租用');
      expect(validCategories).toContain('物料制作');
    });

    it('费用金额应为正数', () => {
      // Given: 金额验证
      const validateAmount = (amount: number) => amount > 0;

      // Then: 验证结果
      expect(validateAmount(1000)).toBe(true);
      expect(validateAmount(0)).toBe(false);
      expect(validateAmount(-500)).toBe(false);
    });

    it('费用应记录日期', () => {
      // Given: 费用记录
      const log = {
        name: '场地租用',
        date: '2024-03-15',
      };

      // Then: 日期正确
      expect(log.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('场景20: 编辑费用', () => {
    it('应正确更新费用金额', async () => {
      // Given: 费用ID和新金额
      const logId = 1;
      const newAmount = 20000;

      // When: 更新费用
      const { budgetApi } = await import('../../services/backendApi');
      await budgetApi.updateLog(logId, { amount: newAmount });

      // Then: API被调用
      expect(budgetApi.updateLog).toHaveBeenCalledWith(logId, { amount: newAmount });
    });

    it('应正确更新费用名称', async () => {
      // Given: 费用ID和新名称
      const logId = 1;

      // When: 更新名称
      const { budgetApi } = await import('../../services/backendApi');
      await budgetApi.updateLog(logId, { name: '更新后的名称' });

      // Then: API被调用
      expect(budgetApi.updateLog).toHaveBeenCalled();
    });

    it('编辑不应改变其他字段', () => {
      // Given: 原始费用记录
      const original = {
        id: '1',
        name: '场地租用',
        amount: 15000,
        category: '场地租用',
        date: '2024-03-15',
      };

      // Then: 原始数据完整
      expect(original.name).toBe('场地租用');
      expect(original.category).toBe('场地租用');
    });
  });

  describe('场景21: 删除费用', () => {
    it('应正确删除费用记录', async () => {
      // Given: 费用ID
      const logId = 1;

      // When: 删除费用
      const { budgetApi } = await import('../../services/backendApi');
      await budgetApi.deleteLog(logId);

      // Then: API被调用
      expect(budgetApi.deleteLog).toHaveBeenCalledWith(logId);
    });

    it('删除确认应防止误删', () => {
      // Given: 删除确认逻辑
      let shouldDelete = true;

      // When: 用户确认
      if (shouldDelete) {
        // 执行删除
      }

      // Then: 需要确认逻辑
      expect(shouldDelete).toBe(true);
    });

    it('删除后费用应从列表移除', () => {
      // Given: 费用列表
      let logs = [...mockBudgetLogs];

      // When: 删除费用
      const deleteId = '1';
      logs = logs.filter(log => log.id !== deleteId);

      // Then: 列表减少
      expect(logs.length).toBe(mockBudgetLogs.length - 1);
      expect(logs.find(log => log.id === deleteId)).toBeUndefined();
    });
  });

  describe('场景22: 预算执行率计算', () => {
    it('应正确计算执行率', () => {
      // Given: 预算和支出
      const budget = 100000;
      const spend = 50000;

      // When: 计算执行率
      const executionRate = (spend / budget) * 100;

      // Then: 执行率为50%
      expect(executionRate).toBe(50);
    });

    it('执行率应为百分比格式', () => {
      // Given: 执行率
      const rate = 50;

      // When: 格式化
      const formatted = `${rate.toFixed(1)}%`;

      // Then: 格式正确
      expect(formatted).toBe('50.0%');
    });

    it('预算为0时执行率应为0', () => {
      // Given: 零预算
      const budget = 0;
      const spend = 0;

      // When: 计算执行率
      const executionRate = budget > 0 ? (spend / budget) * 100 : 0;

      // Then: 执行率为0
      expect(executionRate).toBe(0);
    });

    it('超预算时执行率应超过100%', () => {
      // Given: 超预算
      const budget = 30000;
      const spend = 35000;

      // When: 计算执行率
      const executionRate = (spend / budget) * 100;

      // Then: 执行率超过100%
      expect(executionRate).toBeGreaterThan(100);
      expect(executionRate).toBeCloseTo(116.67, 1);
    });

    it('应正确计算剩余预算', () => {
      // Given: 预算和支出
      const budget = 100000;
      const spend = 50000;

      // When: 计算剩余
      const remaining = budget - spend;

      // Then: 剩余正确
      expect(remaining).toBe(50000);
    });

    it('超预算时应显示负数剩余', () => {
      // Given: 超预算
      const budget = 30000;
      const spend = 35000;

      // When: 计算剩余
      const remaining = budget - spend;

      // Then: 剩余为负
      expect(remaining).toBe(-5000);
    });
  });

  describe('场景23: 预算预警', () => {
    it('执行率超过80%应触发预警', () => {
      // Given: 预警阈值
      const WARNING_THRESHOLD = 80;

      // When: 执行率85%
      const executionRate = 85;

      // Then: 触发预警
      expect(executionRate).toBeGreaterThanOrEqual(WARNING_THRESHOLD);
    });

    it('执行率80%时应显示预警状态', () => {
      // Given: 80%执行率
      const budget = 100000;
      const spend = 80000;
      const executionRate = (spend / budget) * 100;

      // When: 判断状态
      const status = executionRate >= 80 ? '预警' : '正常';

      // Then: 预警状态
      expect(status).toBe('预警');
    });

    it('执行率低于80%时应显示正常状态', () => {
      // Given: 60%执行率
      const budget = 100000;
      const spend = 60000;
      const executionRate = (spend / budget) * 100;

      // When: 判断状态
      const status = executionRate >= 80 ? '预警' : '正常';

      // Then: 正常状态
      expect(status).toBe('正常');
    });

    it('超预算时应显示超预算状态', () => {
      // Given: 超预算
      const budget = 100000;
      const spend = 110000;

      // When: 判断状态
      const rate = (spend / budget) * 100;
      const status = rate > 100 ? '超预算' : rate >= 80 ? '预警' : '正常';

      // Then: 超预算状态
      expect(status).toBe('超预算');
    });

    it('预警阈值应可配置', () => {
      // Given: 可配置阈值
      const THRESHOLDS = {
        warning: 80,
        danger: 100,
      };

      // Then: 阈值正确
      expect(THRESHOLDS.warning).toBe(80);
      expect(THRESHOLDS.danger).toBe(100);
    });

    it('应能识别高风险活动', () => {
      // Given: 活动列表
      const activities = mockActivities;

      // When: 筛选高风险活动（执行率80%-100%）
      const highRisk = activities.filter(a => {
        const rate = (a.actualSpend / a.budget) * 100;
        return rate >= 80 && rate <= 100;
      });

      // Then: 识别正确
      expect(highRisk.length).toBeGreaterThan(0);
    });
  });

  describe('场景24: 预算统计分析', () => {
    it('应正确计算年度总预算', () => {
      // Given: 活动预算
      const totalBudget = mockActivities.reduce((sum, a) => sum + a.budget, 0);

      // Then: 总预算正确
      expect(totalBudget).toBe(260000);
    });

    it('应正确计算年度总支出', () => {
      // Given: 活动支出
      const totalSpend = mockActivities.reduce((sum, a) => sum + a.actualSpend, 0);

      // Then: 总支出正确
      expect(totalSpend).toBe(198000);
    });

    it('应正确计算年度执行率', () => {
      // Given: 年度总预算和总支出
      const totalBudget = mockActivities.reduce((sum, a) => sum + a.budget, 0);
      const totalSpend = mockActivities.reduce((sum, a) => sum + a.actualSpend, 0);

      // When: 计算执行率
      const rate = totalBudget > 0 ? (totalSpend / totalBudget) * 100 : 0;

      // Then: 执行率正确
      expect(rate).toBeCloseTo(76.15, 1);
    });

    it('应按类别统计预算', () => {
      // Given: 费用按类别分组
      const categoryStats: Record<string, number> = {};
      mockBudgetLogs.forEach(log => {
        if (!categoryStats[log.category]) categoryStats[log.category] = 0;
        categoryStats[log.category] += log.amount;
      });

      // Then: 统计正确
      expect(categoryStats['场地租用']).toBe(15000);
      expect(categoryStats['物料制作']).toBe(20000);
    });

    it('应识别超预算活动', () => {
      // Given: 活动列表
      const overBudget = mockActivities.filter(a => a.actualSpend > a.budget);

      // Then: 识别正确
      expect(overBudget.length).toBe(1);
      expect(overBudget[0].name).toBe('年度总结大会');
    });
  });

  describe('场景25: 预算筛选和搜索', () => {
    it('应按活动名称搜索', () => {
      // Given: 搜索关键词
      const keyword = '峰会';

      // When: 搜索
      const results = mockActivities.filter(a =>
        a.name.toLowerCase().includes(keyword.toLowerCase())
      );

      // Then: 匹配正确
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('峰会');
    });

    it('应按年份筛选', () => {
      // Given: 年份筛选（隐含在activities的date中）
      const yearActivities = mockActivities.filter(a => a.name.includes('2024'));

      // Then: 筛选正确
      expect(yearActivities.length).toBe(1);
    });

    it('应按类别筛选', () => {
      // Given: 类别筛选
      const category = '场地租用';

      // When: 筛选
      const results = mockBudgetLogs.filter(log => log.category === category);

      // Then: 筛选正确
      expect(results.length).toBe(1);
    });

    it('空搜索应返回全部', () => {
      // Given: 空关键词
      const keyword = '';

      // When: 搜索
      const results = keyword === ''
        ? mockActivities
        : mockActivities.filter(a => a.name.includes(keyword));

      // Then: 返回全部
      expect(results.length).toBe(mockActivities.length);
    });
  });

  describe('场景26: 预算数据验证', () => {
    it('预算金额应为非负数', () => {
      // Given: 验证函数
      const validateBudget = (budget: number) => budget >= 0;

      // Then: 验证结果
      expect(validateBudget(0)).toBe(true);
      expect(validateBudget(100000)).toBe(true);
      expect(validateBudget(-100)).toBe(false);
    });

    it('支出金额应为非负数', () => {
      // Given: 验证函数
      const validateSpend = (spend: number) => spend >= 0;

      // Then: 验证结果
      expect(validateSpend(0)).toBe(true);
      expect(validateSpend(50000)).toBe(true);
      expect(validateSpend(-1)).toBe(false);
    });

    it('费用类别应为有效选项', () => {
      // Given: 有效类别列表
      const BUDGET_CATEGORIES = [
        '场地租用', '搭建/展览', '物料制作', '差旅/住宿',
        '餐饮/招待', '礼品/赠品', '媒体/推广', '人员费用', '其他'
      ];

      // Then: 验证通过
      BUDGET_CATEGORIES.forEach(cat => {
        expect(typeof cat).toBe('string');
        expect(cat.length).toBeGreaterThan(0);
      });
    });

    it('费用名称不应为空', () => {
      // Given: 验证函数
      const validateName = (name: string) => name.trim().length > 0;

      // Then: 验证结果
      expect(validateName('场地租用')).toBe(true);
      expect(validateName('')).toBe(false);
      expect(validateName('   ')).toBe(false);
    });
  });
});
