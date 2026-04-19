/**
 * 全局搜索模块类型定义
 */

import { ApiActivity, ApiMaterial, ApiSupplier, ApiOpportunity } from '../../services/backendApi';

// 搜索结果项的通用类型
export type SearchResultItem = {
  id: number;
  type: 'activity' | 'material' | 'supplier' | 'opportunity';
  title: string;
  subtitle: string;
  extra?: string;
  url: string;
};

// 搜索结果类型
export interface SearchResult {
  activities: ApiActivity[];
  materials: ApiMaterial[];
  suppliers: ApiSupplier[];
  opportunities: ApiOpportunity[];
}

// 转换为统一的结果项
export function toSearchResultItems(result: SearchResult): SearchResultItem[] {
  const items: SearchResultItem[] = [];

  // 活动
  result.activities.slice(0, 5).forEach((item) => {
    items.push({
      id: item.id,
      type: 'activity',
      title: item.name,
      subtitle: `${item.date} · ${item.location || '未知地点'}`,
      extra: item.status,
      url: `/activities/${item.id}`,
    });
  });

  // 物料
  result.materials.slice(0, 5).forEach((item) => {
    items.push({
      id: item.id,
      type: 'material',
      title: item.name,
      subtitle: `库存: ${item.stock} ${item.unit}`,
      extra: item.category,
      url: `/materials/${item.id}`,
    });
  });

  // 供应商
  result.suppliers.slice(0, 5).forEach((item) => {
    items.push({
      id: item.id,
      type: 'supplier',
      title: item.name,
      subtitle: item.category,
      extra: '★'.repeat(Math.round(item.rating)) + '☆'.repeat(5 - Math.round(item.rating)),
      url: `/suppliers/${item.id}`,
    });
  });

  // 商机
  result.opportunities.slice(0, 5).forEach((item) => {
    items.push({
      id: item.id,
      type: 'opportunity',
      title: item.client_name,
      subtitle: item.company || '',
      extra: `¥${item.estimated_value.toLocaleString()}`,
      url: `/opportunities/${item.id}`,
    });
  });

  return items;
}

// 模块类型的中文标签
export const MODULE_LABELS: Record<SearchResultItem['type'], string> = {
  activity: '活动',
  material: '物料',
  supplier: '供应商',
  opportunity: '商机',
};

// 模块类型图标映射
export const MODULE_ICONS: Record<SearchResultItem['type'], string> = {
  activity: '📅',
  material: '📦',
  supplier: '🏢',
  opportunity: '💼',
};
