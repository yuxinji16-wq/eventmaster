/**
 * 仪表盘模块测试
 */
import { describe, it, expect } from 'vitest';

// Dashboard 数据转换
interface DashboardStats {
  year: string;
  activities_total: number;
  activities_completed: number;
  activities_ongoing: number;
  budget_total: number;
  budget_used: number;
  opportunities_total: number;
  opportunities_value: number;
}

interface MonthlyTrendItem {
  month: string;
  budget: number;
  leads: number;
}

interface DashboardMetrics {
  budget: number;
  leads: number;
  roi: number;
  completion: number;
}

// 从 API 响应转换年度指标
function transformYearlyMetrics(response: DashboardStats): DashboardMetrics {
  const completion = response.activities_total > 0
    ? Math.round((response.activities_completed / response.activities_total) * 100)
    : 0;
  const roi = response.budget_used > 0
    ? Math.round((response.opportunities_value / response.budget_used) * 100) / 100
    : 0;
  return {
    budget: response.budget_total,
    leads: response.opportunities_total,
    roi,
    completion,
  };
}

// 转换月度趋势数据
function transformMonthlyTrend(monthlyData: Record<string, { budget: number; count: number }>): MonthlyTrendItem[] {
  return Object.entries(monthlyData)
    .map(([month, data]) => ({
      month: month.slice(5) + '月', // "2024-01" -> "01月"
      budget: data.budget || 0,
      leads: data.count * 10 || 0, // 估算 leads
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

// 计算年度预算使用率
function calculateBudgetUtilization(total: number, used: number): number {
  if (total === 0) return 0;
  return Math.round((used / total) * 100);
}

// 计算活动完成率
function calculateActivityCompletionRate(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// 生成年度趋势数据
function generateYearlyTrend(year: string): MonthlyTrendItem[] {
  const seed = parseInt(year);
  return [
    { month: `${String(seed)}-01`, budget: 120000 + (seed % 3) * 20000, leads: 350 + (seed % 5) * 30 },
    { month: `${String(seed)}-02`, budget: 80000 + (seed % 2) * 15000, leads: 180 + (seed % 4) * 20 },
    { month: `${String(seed)}-03`, budget: 520000 - (seed % 4) * 30000, leads: 780 - (seed % 3) * 40 },
    { month: `${String(seed)}-04`, budget: 280000 + (seed % 5) * 10000, leads: 420 + (seed % 2) * 50 },
    { month: `${String(seed)}-05`, budget: 410000 + (seed % 3) * 25000, leads: 590 + (seed % 6) * 15 },
    { month: `${String(seed)}-06`, budget: 220000 - (seed % 2) * 10000, leads: 310 + (seed % 4) * 10 },
  ];
}

// 获取预算健康状态
function getBudgetHealthStatus(utilizationRate: number): 'healthy' | 'warning' | 'danger' {
  if (utilizationRate >= 100) return 'danger';
  if (utilizationRate >= 80) return 'warning';
  return 'healthy';
}

describe('年度指标转换', () => {
  it('应正确转换完整的API响应', () => {
    const response: DashboardStats = {
      year: '2024',
      activities_total: 10,
      activities_completed: 5,
      activities_ongoing: 3,
      budget_total: 1000000,
      budget_used: 500000,
      opportunities_total: 100,
      opportunities_value: 1500000,
    };
    const metrics = transformYearlyMetrics(response);
    expect(metrics.budget).toBe(1000000);
    expect(metrics.leads).toBe(100);
    expect(metrics.roi).toBe(3);
    expect(metrics.completion).toBe(50);
  });

  it('零活动总数应返回零完成率', () => {
    const response: DashboardStats = {
      year: '2024',
      activities_total: 0,
      activities_completed: 0,
      activities_ongoing: 0,
      budget_total: 0,
      budget_used: 0,
      opportunities_total: 0,
      opportunities_value: 0,
    };
    const metrics = transformYearlyMetrics(response);
    expect(metrics.completion).toBe(0);
  });

  it('零预算使用应返回零ROI', () => {
    const response: DashboardStats = {
      year: '2024',
      activities_total: 10,
      activities_completed: 5,
      activities_ongoing: 3,
      budget_total: 1000000,
      budget_used: 0,
      opportunities_total: 100,
      opportunities_value: 0,
    };
    const metrics = transformYearlyMetrics(response);
    expect(metrics.roi).toBe(0);
  });
});

describe('月度趋势数据转换', () => {
  it('应正确转换月度数据格式', () => {
    const monthlyData: Record<string, { budget: number; count: number }> = {
      '2024-01': { budget: 100000, count: 5 },
      '2024-02': { budget: 150000, count: 8 },
    };
    const trend = transformMonthlyTrend(monthlyData);
    expect(trend).toHaveLength(2);
    expect(trend[0].month).toBe('01月');
    expect(trend[0].budget).toBe(100000);
    expect(trend[0].leads).toBe(50);
  });

  it('应按月份排序', () => {
    const monthlyData: Record<string, { budget: number; count: number }> = {
      '2024-03': { budget: 100000, count: 5 },
      '2024-01': { budget: 150000, count: 8 },
      '2024-02': { budget: 120000, count: 6 },
    };
    const trend = transformMonthlyTrend(monthlyData);
    expect(trend[0].month).toBe('01月');
    expect(trend[1].month).toBe('02月');
    expect(trend[2].month).toBe('03月');
  });

  it('空数据应返回空数组', () => {
    const trend = transformMonthlyTrend({});
    expect(trend).toHaveLength(0);
  });
});

describe('预算使用率计算', () => {
  it('应正确计算使用率', () => {
    expect(calculateBudgetUtilization(1000000, 500000)).toBe(50);
    expect(calculateBudgetUtilization(1000000, 800000)).toBe(80);
  });

  it('超支时应返回超过100', () => {
    expect(calculateBudgetUtilization(1000000, 1200000)).toBe(120);
  });

  it('零总预算应返回零', () => {
    expect(calculateBudgetUtilization(0, 0)).toBe(0);
  });
});

describe('活动完成率计算', () => {
  it('应正确计算完成率', () => {
    expect(calculateActivityCompletionRate(5, 10)).toBe(50);
    expect(calculateActivityCompletionRate(3, 4)).toBe(75);
  });

  it('零总数应返回零', () => {
    expect(calculateActivityCompletionRate(0, 0)).toBe(0);
  });
});

describe('年度趋势数据生成', () => {
  it('应生成6个月的数据', () => {
    const trend = generateYearlyTrend('2024');
    expect(trend).toHaveLength(6);
  });

  it('每月数据应包含预算和潜客数', () => {
    const trend = generateYearlyTrend('2024');
    trend.forEach(item => {
      expect(item.budget).toBeGreaterThan(0);
      expect(item.leads).toBeGreaterThan(0);
    });
  });

  it('不同年份应生成不同数据', () => {
    const trend2024 = generateYearlyTrend('2024');
    const trend2025 = generateYearlyTrend('2025');
    // 由于算法一致性，不同年份数据应不同
    expect(trend2024[0].budget).not.toBe(trend2025[0].budget);
  });
});

describe('预算健康状态', () => {
  it('使用率低于80%应返回healthy', () => {
    expect(getBudgetHealthStatus(50)).toBe('healthy');
    expect(getBudgetHealthStatus(79)).toBe('healthy');
  });

  it('使用率80%-99%应返回warning', () => {
    expect(getBudgetHealthStatus(80)).toBe('warning');
    expect(getBudgetHealthStatus(99)).toBe('warning');
  });

  it('使用率100%及以上应返回danger', () => {
    expect(getBudgetHealthStatus(100)).toBe('danger');
    expect(getBudgetHealthStatus(120)).toBe('danger');
  });
});

describe('仪表盘指标格式化', () => {
  it('预算应格式化为万', () => {
    const formatBudget = (budget: number) => (budget / 10000).toFixed(1) + 'w';
    expect(formatBudget(500000)).toBe('50.0w');
    expect(formatBudget(1250000)).toBe('125.0w');
  });

  it('ROI应保留一位小数', () => {
    const formatROI = (roi: number) => roi.toFixed(1) + 'x';
    expect(formatROI(3.5)).toBe('3.5x');
    expect(formatROI(2.67)).toBe('2.7x');
  });

  it('完成率应格式化为百分比', () => {
    const formatCompletion = (rate: number) => rate + '%';
    expect(formatCompletion(75)).toBe('75%');
    expect(formatCompletion(100)).toBe('100%');
  });
});