/**
 * 常量模块测试
 */
import { describe, it, expect } from 'vitest';
import { NAV_ITEMS, MOCK_ACTIVITIES, MOCK_MATERIALS, MOCK_SUPPLIERS, MOCK_OPPORTUNITIES, MOCK_BUDGETS, MOCK_REVIEWS } from '../constants';

describe('NAV_ITEMS', () => {
  it('should have 7 navigation items', () => {
    expect(NAV_ITEMS).toHaveLength(7);
  });

  it('should have required fields for each item', () => {
    NAV_ITEMS.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.label).toBeDefined();
      expect(item.icon).toBeDefined();
    });
  });

  it('should have correct dashboard id', () => {
    const dashboard = NAV_ITEMS.find(item => item.id === 'dashboard');
    expect(dashboard).toBeDefined();
    expect(dashboard?.label).toBe('数据仪表盘');
  });
});

describe('MOCK_ACTIVITIES', () => {
  it('should have mock activities', () => {
    expect(MOCK_ACTIVITIES.length).toBeGreaterThan(0);
  });

  it('should have valid activity structure', () => {
    MOCK_ACTIVITIES.forEach(activity => {
      expect(activity.id).toBeDefined();
      expect(activity.name).toBeDefined();
      expect(activity.year).toBeDefined();
      expect(activity.status).toBeDefined();
    });
  });
});

describe('MOCK_MATERIALS', () => {
  it('should have mock materials', () => {
    expect(MOCK_MATERIALS.length).toBeGreaterThan(0);
  });

  it('should have valid material structure', () => {
    MOCK_MATERIALS.forEach(material => {
      expect(material.id).toBeDefined();
      expect(material.name).toBeDefined();
      expect(material.stock).toBeDefined();
      expect(typeof material.stock).toBe('number');
    });
  });
});

describe('MOCK_SUPPLIERS', () => {
  it('should have mock suppliers', () => {
    expect(MOCK_SUPPLIERS.length).toBeGreaterThan(0);
  });

  it('should have valid supplier structure', () => {
    MOCK_SUPPLIERS.forEach(supplier => {
      expect(supplier.id).toBeDefined();
      expect(supplier.name).toBeDefined();
      expect(supplier.rating).toBeDefined();
      expect(supplier.rating).toBeGreaterThanOrEqual(0);
      expect(supplier.rating).toBeLessThanOrEqual(5);
    });
  });
});

describe('MOCK_OPPORTUNITIES', () => {
  it('should have mock opportunities', () => {
    expect(MOCK_OPPORTUNITIES.length).toBeGreaterThan(0);
  });

  it('should have valid opportunity structure', () => {
    MOCK_OPPORTUNITIES.forEach(opp => {
      expect(opp.id).toBeDefined();
      expect(opp.clientName).toBeDefined();
      expect(opp.status).toBeDefined();
    });
  });

  it('should have valid status values', () => {
    const validStatuses = ['高意向', '中意向', '低意向'];
    MOCK_OPPORTUNITIES.forEach(opp => {
      expect(validStatuses).toContain(opp.status);
    });
  });
});

describe('MOCK_BUDGETS', () => {
  it('should have mock budgets', () => {
    expect(MOCK_BUDGETS.length).toBeGreaterThan(0);
  });

  it('should have valid budget structure', () => {
    MOCK_BUDGETS.forEach(budget => {
      expect(budget.id).toBeDefined();
      expect(budget.totalAmount).toBeDefined();
      expect(budget.items).toBeDefined();
      expect(Array.isArray(budget.items)).toBe(true);
    });
  });

  it('should calculate usedAmount correctly', () => {
    MOCK_BUDGETS.forEach(budget => {
      if (budget.items.length > 0) {
        const calculatedUsed = budget.items.reduce((sum, item) => sum + item.actualAmount, 0);
        expect(budget.usedAmount).toBeCloseTo(calculatedUsed, 0);
      }
    });
  });
});

describe('MOCK_REVIEWS', () => {
  it('should have mock reviews', () => {
    expect(MOCK_REVIEWS.length).toBeGreaterThan(0);
  });

  it('should have valid review structure', () => {
    MOCK_REVIEWS.forEach(review => {
      expect(review.id).toBeDefined();
      expect(review.activityId).toBeDefined();
      expect(review.status).toBeDefined();
      expect(review.feedbacks).toBeDefined();
      expect(Array.isArray(review.feedbacks)).toBe(true);
    });
  });
});
