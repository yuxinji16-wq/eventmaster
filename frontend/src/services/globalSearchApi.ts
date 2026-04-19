/**
 * 全局搜索 API 服务
 * 并行调用多个模块的搜索 API，聚合结果
 */

import {
  activitiesApi,
  materialsApi,
  suppliersApi,
  opportunitiesApi,
  ApiActivity,
  ApiMaterial,
  ApiSupplier,
  ApiOpportunity,
} from './backendApi';

// 搜索结果类型
export interface SearchResult {
  activities: ApiActivity[];
  materials: ApiMaterial[];
  suppliers: ApiSupplier[];
  opportunities: ApiOpportunity[];
}

// 是否有结果的检查
export function hasResults(result: SearchResult): boolean {
  return (
    result.activities.length > 0 ||
    result.materials.length > 0 ||
    result.suppliers.length > 0 ||
    result.opportunities.length > 0
  );
}

// 获取结果总数
export function getTotalCount(result: SearchResult): number {
  return (
    result.activities.length +
    result.materials.length +
    result.suppliers.length +
    result.opportunities.length
  );
}

// 全局搜索
export async function globalSearch(keyword: string): Promise<SearchResult> {
  // 并行调用 4 个模块的搜索 API
  const [activities, materials, suppliers, opportunities] = await Promise.all([
    activitiesApi.getList({ search: keyword }).catch(() => []),
    materialsApi.getList({ search: keyword }).catch(() => []),
    suppliersApi.getList({ search: keyword }).catch(() => []),
    opportunitiesApi.getList({ search: keyword }).catch(() => []),
  ]);

  return { activities, materials, suppliers, opportunities };
}
