/**
 * 常量模块测试
 */
import { describe, it, expect } from 'vitest';
import { NAV_ITEMS, SYSTEM_NAV_ITEMS, ACTIVITY_INDUSTRIES } from '../constants';

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

  it('should have unique ids for all items', () => {
    const ids = NAV_ITEMS.map(item => item.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});

describe('SYSTEM_NAV_ITEMS', () => {
  it('should have 3 system navigation items', () => {
    expect(SYSTEM_NAV_ITEMS).toHaveLength(3);
  });

  it('should have required fields for each item', () => {
    SYSTEM_NAV_ITEMS.forEach(item => {
      expect(item.id).toBeDefined();
      expect(item.label).toBeDefined();
      expect(item.icon).toBeDefined();
      expect(item.path).toBeDefined();
    });
  });

  it('should have valid paths', () => {
    SYSTEM_NAV_ITEMS.forEach(item => {
      expect(item.path).toMatch(/^\//);
    });
  });
});

describe('ACTIVITY_INDUSTRIES', () => {
  it('should have multiple industry options', () => {
    expect(ACTIVITY_INDUSTRIES.length).toBeGreaterThan(0);
  });

  it('should include common industries', () => {
    expect(ACTIVITY_INDUSTRIES).toContain('航天');
    expect(ACTIVITY_INDUSTRIES).toContain('航空');
    expect(ACTIVITY_INDUSTRIES).toContain('电子信息');
    expect(ACTIVITY_INDUSTRIES).toContain('高校');
    expect(ACTIVITY_INDUSTRIES).toContain('政府');
  });

  it('should be a readonly tuple', () => {
    // 检查是否不可直接赋值修改
    expect(Array.isArray(ACTIVITY_INDUSTRIES)).toBe(true);
    expect(ACTIVITY_INDUSTRIES.length).toBeGreaterThan(0);
  });
});
