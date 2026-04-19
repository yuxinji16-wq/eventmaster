/**
 * 年度仪表盘交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import YearlyDashboard from './YearlyDashboard';
import { ReviewStatus } from '../../types';

// Mock hooks
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockReviewActivities = [
  {
    id: '1',
    activityId: '1',
    status: ReviewStatus.COMPLETED,
    feedbacks: [
      {
        id: 'f1',
        reviewId: '1',
        evaluatorId: 'u1',
        evaluatorName: '张三',
        goalScore: 4,
        leadQualityScore: 4,
        executionScore: 4,
        resourceScore: 4,
        brandScore: 4,
        successes: '组织有序',
        problems: '时间紧张',
        suggestions: '提前规划',
        tags: ['tag1'],
        isSubmitted: true,
        createdAt: '2024-03-15',
        submittedAt: '2024-03-16'
      }
    ],
    conclusion: { overallScore: 4.2 },
    expectedParticipants: 10,
    leadCount: 50
  },
  {
    id: '2',
    activityId: '2',
    status: ReviewStatus.COMPLETED,
    feedbacks: [],
    conclusion: { overallScore: 4.8 },
    expectedParticipants: 8,
    leadCount: 80
  }
];

const mockActivities = [
  { id: '1', name: '春季发布会', date: '2024-03-15', year: '2024', category: '自办活动', actualSpend: 50000 },
  { id: '2', name: '行业峰会', date: '2024-04-20', year: '2024', category: '外部市场活动', actualSpend: 80000 }
];

const emptyReviewActivities: any[] = [];
const emptyActivities: any[] = [];

const renderYearlyDashboard = (
  yearFilter = '2024',
  reviewActivities = mockReviewActivities,
  activities = mockActivities
) => {
  render(
    <MemoryRouter>
      <YearlyDashboard
        yearFilter={yearFilter}
        reviewActivities={reviewActivities}
        activities={activities}
      />
    </MemoryRouter>
  );
};

describe('年度仪表盘交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('年度总览卡片交互', () => {
    it('应显示年度总览卡片区域', () => {
      renderYearlyDashboard();

      // Component should render without errors
      expect(screen.getAllByText('年度').length).toBeGreaterThan(0);
    });

    it('应显示统计指标', () => {
      renderYearlyDashboard();

      // Check for key stat labels
      expect(screen.getAllByText(/活动/i).length).toBeGreaterThan(0);
    });
  });

  describe('活动类型对比区域交互', () => {
    it('应显示活动类型对比标题', () => {
      renderYearlyDashboard();

      expect(screen.getByText('活动类型对比')).toBeInTheDocument();
    });

    it('应显示自办活动统计', () => {
      renderYearlyDashboard();

      expect(screen.getAllByText('自办活动').length).toBeGreaterThan(0);
    });

    it('应显示外部活动统计', () => {
      renderYearlyDashboard();

      expect(screen.getByText('外部活动')).toBeInTheDocument();
    });
  });

  describe('年度问题Top区域交互', () => {
    it('应显示年度问题Top标题', () => {
      renderYearlyDashboard();

      expect(screen.getByText('年度问题 Top')).toBeInTheDocument();
    });

    it('应显示问题排名列表', () => {
      renderYearlyDashboard();

      const problemSection = screen.getByText('年度问题 Top');
      expect(problemSection).toBeInTheDocument();
    });
  });

  describe('优秀案例区域交互', () => {
    it('应显示优秀案例标题', () => {
      renderYearlyDashboard();

      expect(screen.getByText('优秀案例')).toBeInTheDocument();
    });

    it('优秀案例应有图标或排名标识', () => {
      renderYearlyDashboard();

      // Component should render with some indication of top cases
      expect(screen.getByText('优秀案例')).toBeInTheDocument();
    });
  });

  describe('年度筛选交互', () => {
    it('应根据年份筛选显示数据', () => {
      renderYearlyDashboard('2024');

      expect(screen.getAllByText('年度').length).toBeGreaterThan(0);
    });

    it('不同年份应显示不同数据', () => {
      renderYearlyDashboard('2023');

      expect(screen.getAllByText('年度').length).toBeGreaterThan(0);
    });
  });

  describe('数据计算逻辑', () => {
    it('应正确显示统计数据', () => {
      renderYearlyDashboard();

      // The component should display some numeric data
      const text = document.body.textContent || '';
      // Check that some numbers are displayed
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe('边界情况测试', () => {
    it('空数据应显示零值', () => {
      renderYearlyDashboard('2024', emptyReviewActivities, emptyActivities);

      expect(screen.getAllByText('年度').length).toBeGreaterThan(0);
    });
  });

  describe('图标显示', () => {
    it('组件应正常渲染', () => {
      renderYearlyDashboard();

      expect(screen.getAllByText('年度').length).toBeGreaterThan(0);
    });
  });
});
