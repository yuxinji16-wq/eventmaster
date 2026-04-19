/**
 * 仪表盘页面交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';

// 默认 mock 数据
const defaultMockData = {
  budget: { total: 500000, utilization_rate: 65 },
  opportunities: { total_value: 1500000 },
  activities: {
    total: 12,
    completed: 8,
    ongoing: 3,
    by_status: { 待启动: 1 }
  },
  monthly: {
    '2024-01': { budget: 50000, count: 3 },
    '2024-02': { budget: 30000, count: 2 },
    '2024-03': { budget: 80000, count: 5 },
  }
};

// vi.hoisted 确保在 vi.mock 之前执行，返回的函数在 factory 中可用
const getStatsMock = vi.hoisted(() => vi.fn((year: string) => Promise.resolve(defaultMockData)));

// Mock recharts to avoid rendering issues
vi.mock('recharts', () => ({
  BarChart: ({ children }: { children: React.ReactNode }) => <div data-testid="bar-chart">{children}</div>,
  Bar: vi.fn(),
  XAxis: vi.fn(),
  YAxis: vi.fn(),
  CartesianGrid: vi.fn(),
  Tooltip: vi.fn(),
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: vi.fn(),
  Pie: vi.fn(),
  Cell: vi.fn(),
  AreaChart: ({ children }: { children: React.ReactNode }) => <div data-testid="area-chart">{children}</div>,
  Area: vi.fn(),
}));

// Mock dashboardApi
vi.mock('../services/backendApi', () => ({
  dashboardApi: {
    getStats: getStatsMock,
  },
}));

const renderDashboard = () => {
  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

describe('仪表盘页面交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 重新设置为默认数据
    getStatsMock.mockImplementation((year: string) => Promise.resolve(defaultMockData));
  });

  afterEach(() => {
    cleanup();
  });

  describe('年度选择器交互', () => {
    it('应显示年度选择器下拉框', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
    });

    it('应能选择不同年份', async () => {
      const user = userEvent.setup();
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
      const yearSelect = screen.getByRole('combobox');
      await user.selectOptions(yearSelect, '2025');
      expect(yearSelect).toHaveValue('2025');
    });

    it('切换年份应重新加载数据', async () => {
      const user = userEvent.setup();
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
      const yearSelect = screen.getByRole('combobox');
      await user.selectOptions(yearSelect, '2023');
      expect(getStatsMock).toHaveBeenCalledWith('2023');
    });

    it('应显示可选年份列表', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByRole('combobox')).toBeInTheDocument();
      });
      const yearSelect = screen.getByRole('combobox');
      const options = yearSelect.querySelectorAll('option');
      expect(options.length).toBeGreaterThanOrEqual(4);
      expect(screen.getByText('2027')).toBeInTheDocument();
    });
  });

  describe('图表类型切换交互', () => {
    it('应显示柱状图切换按钮', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByTestId('chart-type-bar')).toBeInTheDocument();
      });
    });

    it('应能切换到柱状图视图', async () => {
      const user = userEvent.setup();
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByTestId('chart-type-bar')).toBeInTheDocument();
      });
      const barButton = screen.getByTestId('chart-type-bar');
      await user.click(barButton);
      expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
    });

    it('应能切换到折线图视图', async () => {
      const user = userEvent.setup();
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByTestId('chart-type-bar')).toBeInTheDocument();
      });
      // 默认是 line 视图 (AreaChart)，点击切换到 bar
      const barButton = screen.getByTestId('chart-type-bar');
      await user.click(barButton);
      // 现在是 bar 视图，再点击 line 按钮
      const lineButton = screen.getByTestId('chart-type-line');
      await user.click(lineButton);
      expect(screen.getByTestId('area-chart')).toBeInTheDocument();
    });
  });

  describe('指标卡片交互', () => {
    it('应显示4个指标卡片', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('年度总预算')).toBeInTheDocument();
      });
      expect(screen.getByText('累计潜客数')).toBeInTheDocument();
      expect(screen.getByText('活动ROI')).toBeInTheDocument();
      expect(screen.getByText('目标完成率')).toBeInTheDocument();
    });

    it('指标卡片应显示货币符号', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/¥/)).toBeInTheDocument();
      });
    });
  });

  describe('活动类型分布饼图交互', () => {
    it('应显示活动类型分布区域', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('活动类型分布')).toBeInTheDocument();
      });
    });

    it('应显示各类活动的数量和名称', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/Events/i)).toBeInTheDocument();
      });
    });
  });

  describe('数据加载状态', () => {
    it('应显示加载状态', async () => {
      // 永不 resolve 的 promise，保持加载状态
      getStatsMock.mockImplementation(() => new Promise(() => {}));
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/加载中/i)).toBeInTheDocument();
      });
    });

    it('加载完成后应显示数据', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('年度总预算')).toBeInTheDocument();
      });
    });

    it('加载失败应显示错误信息', async () => {
      getStatsMock.mockImplementation(() => Promise.reject(new Error('Network error')));
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/仪表盘加载失败/i)).toBeInTheDocument();
      });
    });

    it('错误状态应显示重试按钮', async () => {
      getStatsMock.mockImplementation(() => Promise.reject(new Error('Error')));
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /重试/i })).toBeInTheDocument();
      });
    });
  });

  describe('空数据状态', () => {
    it('无数据时应显示空状态提示', async () => {
      getStatsMock.mockResolvedValue({
        budget: { total: 0 },
        activities: { total: 0 },
        monthly: {},
        opportunities: {}
      });
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('暂无可展示的仪表盘数据')).toBeInTheDocument();
      });
    });
  });

  describe('年度趋势图表交互', () => {
    it('应显示年度活动趋势标题', async () => {
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText('年度活动趋势')).toBeInTheDocument();
      });
    });

    it('应显示图例说明', async () => {
      renderDashboard();
      await waitFor(() => {
        // 查找图例容器中的 legend items
        const spans = screen.getAllByText((content, element) =>
          element?.textContent === '预算' || element?.textContent === '获客'
        );
        expect(spans.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('边界情况测试', () => {
    it('网络错误时应显示友好错误提示', async () => {
      getStatsMock.mockImplementation(() => Promise.reject(new Error('Failed to fetch')));
      renderDashboard();
      await waitFor(() => {
        expect(screen.getByText(/检查后端服务/i)).toBeInTheDocument();
      });
    });

    it('数据异常时应优雅降级', async () => {
      getStatsMock.mockImplementation(() => Promise.resolve({
        budget: null,
        activities: null,
        monthly: null
      }));
      renderDashboard();
      await waitFor(() => {
        // null 数据被 || {} 安全处理，但 monthly/distribution 为空，触发空状态
        expect(screen.getByText('暂无可展示的仪表盘数据')).toBeInTheDocument();
      });
    });
  });
});
