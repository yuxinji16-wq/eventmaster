/**
 * 统一路由配置
 * 所有页面路由在此定义，便于后续接入后端 API
 */

export const AppRoutes = {
  // 首页
  HOME: '/',

  // 活动管理
  ACTIVITIES: '/activities',
  ACTIVITY_DETAIL: '/activities/:id',

  // 物料管理
  MATERIALS: '/materials',
  MATERIAL_DETAIL: '/materials/:id',

  // 预算管理
  BUDGET: '/budget',

  // 供应商管理
  SUPPLIERS: '/suppliers',
  SUPPLIER_DETAIL: '/suppliers/:id',

  // 商机管理
  OPPORTUNITIES: '/opportunities',
  OPPORTUNITY_DETAIL: '/opportunities/:id',

  // 复盘管理
  REVIEWS: '/reviews',
  REVIEW_DETAIL: '/reviews/:id',
} as const;

// 路由元数据（可用于权限控制、面包屑等）
export interface RouteMeta {
  label: string;
  icon?: string;
  breadcrumb?: string[];
}

export const RouteMetaMap: Record<string, RouteMeta> = {
  [AppRoutes.HOME]: { label: '仪表盘', breadcrumb: ['首页'] },
  [AppRoutes.ACTIVITIES]: { label: '活动列表', breadcrumb: ['活动管理'] },
  [AppRoutes.ACTIVITY_DETAIL]: { label: '活动详情', breadcrumb: ['活动管理', '详情'] },
  [AppRoutes.MATERIALS]: { label: '物料列表', breadcrumb: ['物料管理'] },
  [AppRoutes.MATERIAL_DETAIL]: { label: '物料详情', breadcrumb: ['物料管理', '详情'] },
  [AppRoutes.BUDGET]: { label: '预算仓库', breadcrumb: ['预算管理'] },
  [AppRoutes.SUPPLIERS]: { label: '供应商列表', breadcrumb: ['供应商管理'] },
  [AppRoutes.SUPPLIER_DETAIL]: { label: '供应商详情', breadcrumb: ['供应商管理', '详情'] },
  [AppRoutes.OPPORTUNITIES]: { label: '商机列表', breadcrumb: ['商机管理'] },
  [AppRoutes.OPPORTUNITY_DETAIL]: { label: '商机详情', breadcrumb: ['商机管理', '详情'] },
  [AppRoutes.REVIEWS]: { label: '复盘中心', breadcrumb: ['复盘管理'] },
  [AppRoutes.REVIEW_DETAIL]: { label: '复盘详情', breadcrumb: ['复盘管理', '详情'] },
};

export type RoutePath = typeof AppRoutes[keyof typeof AppRoutes];
