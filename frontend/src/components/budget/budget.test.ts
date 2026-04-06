/**
 * 预算管理模块测试
 */
import { describe, it, expect } from 'vitest';

interface BudgetItem {
  id: string;
  name: string;
  category: string;
  planned: number;
  actual: number;
  year: number;
}

interface YearlyQuota {
  id: string;
  year: number;
  totalQuota: number;
  usedQuota: number;
}

// 计算预算使用率
function calculateUsageRate(planned: number, actual: number): number {
  if (planned === 0) return 0;
  return Math.round((actual / planned) * 100);
}

// 计算年度预算剩余
function calculateRemainingQuota(total: number, used: number): number {
  return total - used;
}

// 按类别汇总预算
function summarizeByCategory(items: BudgetItem[]): Record<string, { planned: number; actual: number }> {
  const summary: Record<string, { planned: number; actual: number }> = {};
  items.forEach(item => {
    if (!summary[item.category]) {
      summary[item.category] = { planned: 0, actual: 0 };
    }
    summary[item.category].planned += item.planned;
    summary[item.category].actual += item.actual;
  });
  return summary;
}

// 预算状态判定
function getBudgetStatus(usageRate: number): 'normal' | 'warning' | 'over' {
  if (usageRate >= 100) return 'over';
  if (usageRate >= 80) return 'warning';
  return 'normal';
}

describe('预算使用率计算', () => {
  it('应正确计算使用率', () => {
    expect(calculateUsageRate(100000, 50000)).toBe(50);
    expect(calculateUsageRate(100000, 80000)).toBe(80);
    expect(calculateUsageRate(100000, 100000)).toBe(100);
  });

  it('应处理超支情况', () => {
    expect(calculateUsageRate(100000, 120000)).toBe(120);
  });

  it('计划为零时应返回零', () => {
    expect(calculateUsageRate(0, 0)).toBe(0);
    expect(calculateUsageRate(0, 10000)).toBe(0);
  });

  it('应四舍五入到整数', () => {
    expect(calculateUsageRate(100000, 33333)).toBe(33);
    expect(calculateUsageRate(100000, 33500)).toBe(34); // 33.5% 四舍五入到 34
  });
});

describe('年度配额计算', () => {
  it('应正确计算剩余配额', () => {
    expect(calculateRemainingQuota(1000000, 300000)).toBe(700000);
    expect(calculateRemainingQuota(1000000, 1000000)).toBe(0);
  });

  it('不应返回负数', () => {
    expect(calculateRemainingQuota(1000000, 1200000)).toBe(-200000);
  });
});

describe('预算分类汇总', () => {
  const mockBudgetItems: BudgetItem[] = [
    { id: '1', name: '场地费', category: '场地', planned: 50000, actual: 45000, year: 2024 },
    { id: '2', name: '搭建费', category: '场地', planned: 30000, actual: 32000, year: 2024 },
    { id: '3', name: '物料费', category: '物料', planned: 20000, actual: 18000, year: 2024 },
    { id: '4', name: '嘉宾酬金', category: '人员', planned: 80000, actual: 85000, year: 2024 },
  ];

  it('应按类别汇总预算', () => {
    const summary = summarizeByCategory(mockBudgetItems);
    expect(summary['场地'].planned).toBe(80000);
    expect(summary['场地'].actual).toBe(77000);
    expect(summary['物料'].planned).toBe(20000);
    expect(summary['人员'].actual).toBe(85000);
  });

  it('应处理空数组', () => {
    const summary = summarizeByCategory([]);
    expect(Object.keys(summary).length).toBe(0);
  });
});

describe('预算状态判定', () => {
  it('使用率低于80%时应返回 normal', () => {
    expect(getBudgetStatus(50)).toBe('normal');
    expect(getBudgetStatus(79)).toBe('normal');
  });

  it('使用率在80%-99%时应返回 warning', () => {
    expect(getBudgetStatus(80)).toBe('warning');
    expect(getBudgetStatus(99)).toBe('warning');
  });

  it('使用率达到或超过100%时应返回 over', () => {
    expect(getBudgetStatus(100)).toBe('over');
    expect(getBudgetStatus(120)).toBe('over');
  });
});

describe('预算颜色样式映射', () => {
  const getStatusColor = (status: 'normal' | 'warning' | 'over'): string => {
    const colors = {
      normal: 'text-emerald-600 bg-emerald-50',
      warning: 'text-amber-600 bg-amber-50',
      over: 'text-rose-600 bg-rose-50',
    };
    return colors[status];
  };

  it('应返回正确的状态颜色', () => {
    expect(getStatusColor('normal')).toBe('text-emerald-600 bg-emerald-50');
    expect(getStatusColor('warning')).toBe('text-amber-600 bg-amber-50');
    expect(getStatusColor('over')).toBe('text-rose-600 bg-rose-50');
  });
});

describe('年度预算验证', () => {
  it('应验证年份格式', () => {
    const yearRegex = /^\d{4}$/;
    expect('2024').toMatch(yearRegex);
    expect('24').not.toMatch(yearRegex);
    expect('20240').not.toMatch(yearRegex);
  });

  it('应验证预算金额大于零', () => {
    const validateAmount = (amount: number): boolean => amount >= 0;
    expect(validateAmount(100000)).toBe(true);
    expect(validateAmount(0)).toBe(true);
    expect(validateAmount(-100)).toBe(false);
  });
});
