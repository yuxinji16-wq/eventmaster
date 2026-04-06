/**
 * 路由工具测试
 */
import { describe, it, expect } from 'vitest';
import { AppRoutes as Routes } from '../utils/routes';

describe('Routes', () => {
  it('should have correct route paths', () => {
    expect(Routes.HOME).toBe('/');
    expect(Routes.ACTIVITIES).toBe('/activities');
    expect(Routes.ACTIVITY_DETAIL).toBe('/activities/:id');
    expect(Routes.MATERIALS).toBe('/materials');
    expect(Routes.MATERIAL_DETAIL).toBe('/materials/:id');
    expect(Routes.BUDGET).toBe('/budget');
    expect(Routes.SUPPLIERS).toBe('/suppliers');
    expect(Routes.SUPPLIER_DETAIL).toBe('/suppliers/:id');
    expect(Routes.OPPORTUNITIES).toBe('/opportunities');
    expect(Routes.OPPORTUNITY_DETAIL).toBe('/opportunities/:id');
    expect(Routes.REVIEWS).toBe('/reviews');
    expect(Routes.REVIEW_DETAIL).toBe('/reviews/:id');
  });

  it('should have activity detail route with id parameter', () => {
    const detailRoute = Routes.ACTIVITY_DETAIL;
    expect(detailRoute).toContain(':id');
  });
});
