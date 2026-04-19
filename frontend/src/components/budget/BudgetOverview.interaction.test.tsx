/**
 * BudgetOverview 组件交互测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import BudgetOverview from './BudgetOverview';

const mockProps = {
  selectedYear: '2026',
  yearlyQuota: { '2026': 1000000 },
  yearStats: {
    totalBudget: 1000000,
    totalUsed: 600000,
    remaining: 400000,
    executionRate: 60,
  },
  categoryStats: {
    self: { count: 3, budget: 500000, used: 300000, avgRate: 60 },
    external: { count: 2, budget: 500000, used: 300000, avgRate: 60 },
  },
  monthlyTrend: [
    { month: '1月', budget: 100000, actual: 80000 },
    { month: '2月', budget: 100000, actual: 90000 },
  ],
  overBudgetActivities: [],
  highRiskActivities: [],
  filteredActivities: [],
  searchQuery: '',
  setSearchQuery: vi.fn(),
  categoryFilter: '所有类型',
  setCategoryFilter: vi.fn(),
  industryFilter: '所有行业',
  setIndustryFilter: vi.fn(),
  availableIndustries: ['科技', '金融', '教育'],
  statusFilter: '全部状态',
  setStatusFilter: vi.fn(),
  onYearChange: vi.fn(),
  onQuotaModalOpen: vi.fn(),
  onViewBudgetStructure: vi.fn(),
  getBudgetStatus: () => '正常' as const,
  roiAnalysis: {
    self: { leads: 100, spend: 300000, roi: '0.33' },
    external: { leads: 50, spend: 300000, roi: '0.17' },
  },
};

describe('BudgetOverview 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染页面标题', () => {
      render(<BudgetOverview {...mockProps} />);
      expect(screen.getByText('预算仓库')).toBeInTheDocument();
    });

    it('应该渲染年份选择器', () => {
      render(<BudgetOverview {...mockProps} />);
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThan(0);
    });

    it('应该显示年度总览卡片', () => {
      render(<BudgetOverview {...mockProps} />);
      expect(screen.getByText('预算总额')).toBeInTheDocument();
      expect(screen.getByText('已使用金额')).toBeInTheDocument();
      expect(screen.getByText('剩余预算')).toBeInTheDocument();
      expect(screen.getByText('预算使用率')).toBeInTheDocument();
    });

    it('应该显示搜索输入框', () => {
      render(<BudgetOverview {...mockProps} />);
      const searchInput = screen.getByPlaceholderText('搜索活动名称...');
      expect(searchInput).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击年度总览卡片应该打开配额弹窗', () => {
      const onQuotaModalOpen = vi.fn();
      render(<BudgetOverview {...mockProps} onQuotaModalOpen={onQuotaModalOpen} />);

      const budgetCard = screen.getByText('¥100w');
      fireEvent.click(budgetCard);
      expect(onQuotaModalOpen).toHaveBeenCalled();
    });

    it('搜索框输入应该调用 setSearchQuery', () => {
      const setSearchQuery = vi.fn();
      render(<BudgetOverview {...mockProps} setSearchQuery={setSearchQuery} />);

      const searchInput = screen.getByPlaceholderText('搜索活动名称...');
      fireEvent.change(searchInput, { target: { value: '测试活动' } });

      expect(setSearchQuery).toHaveBeenCalledWith('测试活动');
    });

    it('类别筛选应该调用 setCategoryFilter', () => {
      const setCategoryFilter = vi.fn();
      render(<BudgetOverview {...mockProps} setCategoryFilter={setCategoryFilter} />);

      const selects = screen.getAllByRole('combobox');
      const categorySelect = selects[1]; // 第二个下拉框是类别筛选

      fireEvent.change(categorySelect, { target: { value: '自办活动' } });
      expect(setCategoryFilter).toHaveBeenCalledWith('自办活动');
    });

    it('状态筛选应该调用 setStatusFilter', () => {
      const setStatusFilter = vi.fn();
      render(<BudgetOverview {...mockProps} setStatusFilter={setStatusFilter} />);

      const selects = screen.getAllByRole('combobox');
      const statusSelect = selects[3]; // 第4个下拉框是状态筛选

      fireEvent.change(statusSelect, { target: { value: '超预算' } });
      expect(setStatusFilter).toHaveBeenCalledWith('超预算');
    });
  });

  describe('数据显示测试', () => {
    it('应该显示正确的预算数值', () => {
      render(<BudgetOverview {...mockProps} />);
      expect(screen.getByText('¥100w')).toBeInTheDocument();
      expect(screen.getByText('¥60w')).toBeInTheDocument();
      expect(screen.getByText('¥40w')).toBeInTheDocument();
    });

    it('应该显示执行率', () => {
      render(<BudgetOverview {...mockProps} />);
      const rates = screen.getAllByText('60.0%');
      expect(rates.length).toBeGreaterThan(0);
    });

    it('应该显示 ROI 分析', () => {
      render(<BudgetOverview {...mockProps} />);
      const selfActivities = screen.getAllByText('自办活动');
      expect(selfActivities.length).toBeGreaterThan(0);
    });
  });

  describe('空状态测试', () => {
    it('活动列表为空时应该显示空状态提示', () => {
      render(<BudgetOverview {...mockProps} filteredActivities={[]} />);
      expect(screen.getByText('暂无活动记录')).toBeInTheDocument();
    });
  });

  describe('风险预警测试', () => {
    it('有超预算活动时应该显示风险预警', () => {
      const mockActivity = {
        id: '1',
        name: '超预算活动',
        date: '2026-01-15',
        year: '2026',
        category: '自办活动',
        budget: 50000,
        actualSpend: 60000,
      };
      render(<BudgetOverview {...mockProps} overBudgetActivities={[mockActivity]} />);

      const activities = screen.getAllByText('超预算活动');
      expect(activities.length).toBeGreaterThan(0);
    });

    it('有高风险活动时应该显示高风险预警', () => {
      const mockActivity = {
        id: '2',
        name: '高风险活动',
        date: '2026-02-20',
        year: '2026',
        category: '自办活动',
        budget: 100000,
        actualSpend: 85000,
      };
      render(<BudgetOverview {...mockProps} highRiskActivities={[mockActivity]} />);

      const activities = screen.getAllByText('高风险活动');
      expect(activities.length).toBeGreaterThan(0);
    });
  });
});
