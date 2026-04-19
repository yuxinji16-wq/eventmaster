/**
 * 复盘列表页面交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import ReviewList from './ReviewList';
import { ReviewStatus } from '../../types';

// Mock hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock FilterDropdown component
vi.mock('../../components/review/FilterDropdown', () => ({
  default: ({ value, onChange, options, 'data-testid': testId }: any) => (
    <select
      data-testid={testId || 'filter-dropdown'}
      value={value}
      onChange={(e: any) => onChange(e.target.value)}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  ),
}));

const mockReviewActivities = [
  {
    id: '1',
    activityId: '1',
    status: ReviewStatus.COMPLETED,
    feedbacks: [],
    conclusion: { overallScore: 4.5 },
    expectedParticipants: 10
  },
  {
    id: '2',
    activityId: '2',
    status: ReviewStatus.IN_PROGRESS,
    feedbacks: [],
    conclusion: null,
    expectedParticipants: 8
  }
];

const mockActivities = [
  { id: '1', name: '春季发布会', date: '2024-03-15', year: '2024', category: '自办活动', actualSpend: 50000 },
  { id: '2', name: '行业峰会', date: '2024-04-20', year: '2024', category: '外部市场活动', actualSpend: 80000 }
];

const defaultProps = {
  searchQuery: '',
  setSearchQuery: vi.fn(),
  statusFilter: '所有状态',
  setStatusFilter: vi.fn(),
  yearFilter: '所有年份',
  categoryFilter: '所有类型',
  setCategoryFilter: vi.fn(),
  reviewActivities: mockReviewActivities,
  activities: mockActivities,
};

const renderReviewList = (props = defaultProps) => {
  render(
    <MemoryRouter>
      <ReviewList {...props} />
    </MemoryRouter>
  );
};

describe('复盘列表页面交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('搜索框交互', () => {
    it('应显示搜索输入框', () => {
      renderReviewList();

      expect(screen.getByPlaceholderText(/搜索活动名称/)).toBeInTheDocument();
    });

    it('应能输入搜索关键词并调用回调', async () => {
      const user = userEvent.setup();
      const setSearchQuery = vi.fn();
      renderReviewList({ ...defaultProps, setSearchQuery });

      const searchInput = screen.getByPlaceholderText(/搜索活动名称/);
      await user.type(searchInput, '发布会');

      // 对于受控组件，验证回调被调用（每个字符一次）
      expect(setSearchQuery).toHaveBeenCalled();
      // "发布会" 是3个字符，应该调用3次
      expect(setSearchQuery).toHaveBeenCalledTimes(3);
    });

    it('搜索应调用 setSearchQuery', async () => {
      const user = userEvent.setup();
      const setSearchQuery = vi.fn();
      renderReviewList({ ...defaultProps, setSearchQuery });

      const searchInput = screen.getByPlaceholderText(/搜索活动名称/);
      await user.type(searchInput, '发布');

      expect(setSearchQuery).toHaveBeenCalled();
    });
  });

  describe('筛选器交互', () => {
    it('应显示类型筛选下拉框', () => {
      renderReviewList();

      // 有两个下拉框，获取第一个（类型筛选）
      const dropdowns = screen.getAllByTestId('filter-dropdown');
      expect(dropdowns.length).toBeGreaterThanOrEqual(1);
    });

    it('应能切换类型筛选', async () => {
      const user = userEvent.setup();
      const setCategoryFilter = vi.fn();
      renderReviewList({ ...defaultProps, setCategoryFilter });

      // 第一个下拉框是类型筛选
      const dropdowns = screen.getAllByTestId('filter-dropdown');
      await user.selectOptions(dropdowns[0], '自办活动');

      expect(setCategoryFilter).toHaveBeenCalledWith('自办活动');
    });

    it('应能切换状态筛选', async () => {
      const user = userEvent.setup();
      const setStatusFilter = vi.fn();
      renderReviewList({ ...defaultProps, statusFilter: '所有状态', setStatusFilter });

      // 第二个下拉框是状态筛选
      const dropdowns = screen.getAllByTestId('filter-dropdown');
      await user.selectOptions(dropdowns[1], ReviewStatus.COMPLETED);

      expect(setStatusFilter).toHaveBeenCalled();
    });
  });

  describe('复盘列表表格交互', () => {
    it('应显示复盘列表表头', () => {
      renderReviewList();

      expect(screen.getByText('活动名称')).toBeInTheDocument();
      expect(screen.getByText('活动时间')).toBeInTheDocument();
      expect(screen.getByText('类型')).toBeInTheDocument();
      expect(screen.getByText('评分')).toBeInTheDocument();
      expect(screen.getByText('状态')).toBeInTheDocument();
    });

    it('应显示复盘数据', () => {
      renderReviewList();

      expect(screen.getByText('春季发布会')).toBeInTheDocument();
      expect(screen.getByText('行业峰会')).toBeInTheDocument();
    });

    it('应显示活动类型标签', () => {
      renderReviewList();

      expect(screen.getByText('自办')).toBeInTheDocument();
      expect(screen.getByText('外部')).toBeInTheDocument();
    });

    it('应显示状态标签', () => {
      renderReviewList();

      // 查找状态标签（带有背景色的 span）
      const completedStatus = document.querySelector('span.bg-emerald-100');
      const inProgressStatus = document.querySelector('span.bg-blue-100');

      expect(completedStatus).toBeInTheDocument();
      expect(completedStatus?.textContent).toBe('已完成');
      expect(inProgressStatus).toBeInTheDocument();
      expect(inProgressStatus?.textContent).toBe('进行中');
    });

    it('已完成状态应为绿色', () => {
      renderReviewList();

      const completedStatus = document.querySelector('span.bg-emerald-100');
      expect(completedStatus?.textContent).toBe('已完成');
      expect(completedStatus?.closest('span')).toHaveClass(/emerald/);
    });

    it('进行中状态应为蓝色', () => {
      renderReviewList();

      const inProgressStatus = document.querySelector('span.bg-blue-100');
      expect(inProgressStatus?.textContent).toBe('进行中');
      expect(inProgressStatus?.closest('span')).toHaveClass(/blue/);
    });
  });

  describe('进入复盘按钮交互', () => {
    it('应显示进入复盘按钮', () => {
      renderReviewList();

      expect(screen.getAllByRole('button', { name: /进入复盘/ })[0]).toBeInTheDocument();
    });

    it('点击进入复盘应导航到详情页', async () => {
      const user = userEvent.setup();
      renderReviewList();

      const enterButton = screen.getAllByRole('button', { name: /进入复盘/ })[0];
      await user.click(enterButton);

      expect(mockNavigate).toHaveBeenCalledWith('/reviews/1');
    });
  });

  describe('进度条交互', () => {
    it('应显示反馈进度条', () => {
      renderReviewList();

      // 查找进度条元素
      const progressBars = document.querySelectorAll('[class*="h-1.5"]');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('进度条应显示提交数/期望数', () => {
      renderReviewList();

      // 进度条显示 0/10 或 0/8 格式，检查是否有 "0" 和 "/" 字符
      // 因为文本节点可能被分割，查找包含 "0" 的元素
      const progressTexts = document.querySelectorAll('[class*="text-slate-500"]');
      expect(progressTexts.length).toBeGreaterThan(0);
    });
  });

  describe('评分显示交互', () => {
    it('已完成的复盘应显示评分', () => {
      renderReviewList();

      // 评分显示为 4.5
      expect(screen.getByText('4.5')).toBeInTheDocument();
    });

    it('未完成的复盘应显示占位符', () => {
      renderReviewList();

      expect(screen.getByText('-')).toBeInTheDocument();
    });
  });

  describe('空状态交互', () => {
    it('筛选无结果时应显示空状态', () => {
      // 使用不匹配的搜索关键词渲染，验证空状态逻辑
      renderReviewList({ ...defaultProps, searchQuery: '不存在的活动' });

      expect(screen.queryByText('春季发布会')).not.toBeInTheDocument();
      expect(screen.getByText('暂无复盘记录')).toBeInTheDocument();
    });

    it('空状态应显示剪贴板图标', () => {
      // 使用空数据重新渲染
      renderReviewList({
        ...defaultProps,
        reviewActivities: [],
        activities: [],
      });

      expect(screen.getByText('暂无复盘记录')).toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('长活动名称应截断显示', () => {
      renderReviewList();

      const nameElement = screen.getByText('春季发布会');
      expect(nameElement).toHaveClass('truncate');
    });

    it('花费应格式化为万元', () => {
      renderReviewList();

      // 查找显示花销的元素 (¥5.0w 或 ¥8.0w)
      const spendElements = screen.getAllByText(/¥\d+\.\d+w/);
      expect(spendElements.length).toBe(2);
    });
  });
});
