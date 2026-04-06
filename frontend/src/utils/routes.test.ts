/**
 * 路由工具测试
 */
import { describe, it, expect } from 'vitest';
import { AppRoutes as Routes, RouteMetaMap } from '../utils/routes';

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

  it('should have auth and settings routes', () => {
    expect(Routes.LOGIN).toBe('/login');
    expect(Routes.ACCOUNT).toBe('/account');
    expect(Routes.PERMISSIONS).toBe('/permissions');
    expect(Routes.SETTINGS).toBe('/settings');
  });

  it('should have activity detail route with id parameter', () => {
    const detailRoute = Routes.ACTIVITY_DETAIL;
    expect(detailRoute).toContain(':id');
  });

  it('all routes should start with /', () => {
    const routes = Object.values(Routes);
    routes.forEach(route => {
      expect(route.startsWith('/')).toBe(true);
    });
  });
});

describe('RouteMetaMap', () => {
  it('should have metadata for all routes', () => {
    const routes = Object.values(Routes);
    routes.forEach(route => {
      expect(RouteMetaMap[route]).toBeDefined();
      expect(RouteMetaMap[route].label).toBeDefined();
    });
  });

  it('should have correct Chinese labels', () => {
    expect(RouteMetaMap[Routes.HOME].label).toBe('仪表盘');
    expect(RouteMetaMap[Routes.ACTIVITIES].label).toBe('活动列表');
    expect(RouteMetaMap[Routes.ACCOUNT].label).toBe('账号管理');
    expect(RouteMetaMap[Routes.PERMISSIONS].label).toBe('权限管理');
    expect(RouteMetaMap[Routes.SETTINGS].label).toBe('网站设置');
    expect(RouteMetaMap[Routes.LOGIN].label).toBe('登录');
  });

  it('should have breadcrumb configuration', () => {
    expect(RouteMetaMap[Routes.HOME].breadcrumb).toEqual(['首页']);
    expect(RouteMetaMap[Routes.LOGIN].breadcrumb).toEqual([]);
    expect(RouteMetaMap[Routes.ACTIVITY_DETAIL].breadcrumb).toContain('活动管理');
  });
});
