/**
 * 供应商管理模块测试
 */
import { describe, it, expect } from 'vitest';
import { Supplier } from '../../types';

// 供应商过滤逻辑
function filterSuppliers(
  suppliers: Supplier[],
  filters: {
    category?: string;
    search?: string;
  }
): Supplier[] {
  return suppliers.filter(supplier => {
    const matchesCat = !filters.category || filters.category === '全部' || supplier.serviceType === filters.category;
    const matchesSearch = !filters.search ||
      supplier.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      supplier.contact.toLowerCase().includes(filters.search.toLowerCase()) ||
      supplier.tags?.some(t => t.toLowerCase().includes(filters.search.toLowerCase()));
    return matchesCat && matchesSearch;
  });
}

// 供应商状态颜色映射
function getSupplierRatingColor(rating: number): { bg: string; text: string } {
  if (rating >= 4.5) return { bg: 'bg-emerald-50', text: 'text-emerald-600' };
  if (rating >= 4.0) return { bg: 'bg-blue-50', text: 'text-blue-600' };
  if (rating >= 3.0) return { bg: 'bg-amber-50', text: 'text-amber-600' };
  return { bg: 'bg-rose-50', text: 'text-rose-600' };
}

// 按服务类型分组
function groupByServiceType(suppliers: Supplier[]): Record<string, Supplier[]> {
  return suppliers.reduce((groups, supplier) => {
    const type = supplier.serviceType;
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(supplier);
    return groups;
  }, {} as Record<string, Supplier[]>);
}

// 计算供应商平均评分
function calculateAverageRating(suppliers: Supplier[]): number {
  if (suppliers.length === 0) return 0;
  const total = suppliers.reduce((sum, s) => sum + s.rating, 0);
  return Math.round((total / suppliers.length) * 10) / 10;
}

// 获取高分供应商
function getTopRatedSuppliers(suppliers: Supplier[], minRating: number = 4.5): Supplier[] {
  return suppliers.filter(s => s.rating >= minRating).sort((a, b) => b.rating - a.rating);
}

describe('供应商过滤逻辑', () => {
  const mockSuppliers: Supplier[] = [
    { id: '1', name: '上海禾松文化传播', serviceType: '搭建', rating: 4.8, contact: '陈松', phone: '138-1234-5678', orderCount: 5, tags: ['自有工厂', '工艺精湛'] },
    { id: '2', name: '北京零点视觉设计', serviceType: '设计', rating: 4.5, contact: '林悦', phone: '139-8888-9999', orderCount: 3, tags: ['创意感强', '排版专业'] },
    { id: '3', name: '深圳音响设备租赁', serviceType: '影音', rating: 4.2, contact: '张伟', phone: '137-1111-2222', orderCount: 2, tags: ['设备新', '服务好'] },
    { id: '4', name: '广州印刷制作', serviceType: '印刷', rating: 3.8, contact: '王芳', phone: '136-3333-4444', orderCount: 1, tags: ['价格低', '质量一般'] },
  ];

  it('应按服务类型过滤供应商', () => {
    const result = filterSuppliers(mockSuppliers, { category: '搭建' });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('上海禾松文化传播');
  });

  it('应按供应商名称搜索', () => {
    const result = filterSuppliers(mockSuppliers, { search: '上海' });
    expect(result).toHaveLength(1);
  });

  it('应按联系人搜索', () => {
    const result = filterSuppliers(mockSuppliers, { search: '陈松' });
    expect(result).toHaveLength(1);
  });

  it('应按标签搜索', () => {
    const result = filterSuppliers(mockSuppliers, { search: '工厂' });
    expect(result).toHaveLength(1);
  });

  it('应支持多条件组合过滤', () => {
    const result = filterSuppliers(mockSuppliers, {
      category: '设计',
      search: '零点'
    });
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('北京零点视觉设计');
  });

  it('空过滤条件应返回全部供应商', () => {
    const result = filterSuppliers(mockSuppliers, {});
    expect(result).toHaveLength(4);
  });

  it('搜索不匹配时应返回空数组', () => {
    const result = filterSuppliers(mockSuppliers, { search: '不存在的供应商' });
    expect(result).toHaveLength(0);
  });
});

describe('供应商评分颜色映射', () => {
  it('评分4.5以上应返回绿色', () => {
    const color = getSupplierRatingColor(4.8);
    expect(color.bg).toBe('bg-emerald-50');
    expect(color.text).toBe('text-emerald-600');
  });

  it('评分4.0-4.5应返回蓝色', () => {
    const color = getSupplierRatingColor(4.3);
    expect(color.bg).toBe('bg-blue-50');
    expect(color.text).toBe('text-blue-600');
  });

  it('评分3.0-4.0应返回黄色', () => {
    const color = getSupplierRatingColor(3.5);
    expect(color.bg).toBe('bg-amber-50');
    expect(color.text).toBe('text-amber-600');
  });

  it('评分3.0以下应返回红色', () => {
    const color = getSupplierRatingColor(2.5);
    expect(color.bg).toBe('bg-rose-50');
    expect(color.text).toBe('text-rose-600');
  });

  it('边界值4.5应返回绿色', () => {
    const color = getSupplierRatingColor(4.5);
    expect(color.bg).toBe('bg-emerald-50');
  });

  it('边界值4.0应返回蓝色', () => {
    const color = getSupplierRatingColor(4.0);
    expect(color.bg).toBe('bg-blue-50');
  });
});

describe('供应商分组', () => {
  const mockSuppliers: Supplier[] = [
    { id: '1', name: '供应商A', serviceType: '搭建', rating: 4.5, contact: '', phone: '', orderCount: 0 },
    { id: '2', name: '供应商B', serviceType: '设计', rating: 4.0, contact: '', phone: '', orderCount: 0 },
    { id: '3', name: '供应商C', serviceType: '搭建', rating: 4.8, contact: '', phone: '', orderCount: 0 },
  ];

  it('应按服务类型正确分组', () => {
    const groups = groupByServiceType(mockSuppliers);
    expect(Object.keys(groups)).toHaveLength(2);
    expect(groups['搭建']).toHaveLength(2);
    expect(groups['设计']).toHaveLength(1);
  });

  it('空数组应返回空对象', () => {
    const groups = groupByServiceType([]);
    expect(Object.keys(groups).length).toBe(0);
  });
});

describe('供应商平均评分计算', () => {
  it('应正确计算平均评分', () => {
    const suppliers: Supplier[] = [
      { id: '1', name: 'A', serviceType: '搭建', rating: 4.0, contact: '', phone: '', orderCount: 0 },
      { id: '2', name: 'B', serviceType: '设计', rating: 5.0, contact: '', phone: '', orderCount: 0 },
      { id: '3', name: 'C', serviceType: '影音', rating: 4.0, contact: '', phone: '', orderCount: 0 },
    ];
    expect(calculateAverageRating(suppliers)).toBe(4.3);
  });

  it('空数组应返回零', () => {
    expect(calculateAverageRating([])).toBe(0);
  });

  it('单供应商应返回其评分', () => {
    const suppliers: Supplier[] = [
      { id: '1', name: 'A', serviceType: '搭建', rating: 4.5, contact: '', phone: '', orderCount: 0 },
    ];
    expect(calculateAverageRating(suppliers)).toBe(4.5);
  });
});

describe('高分供应商筛选', () => {
  const mockSuppliers: Supplier[] = [
    { id: '1', name: 'A', serviceType: '搭建', rating: 4.8, contact: '', phone: '', orderCount: 0 },
    { id: '2', name: 'B', serviceType: '设计', rating: 4.5, contact: '', phone: '', orderCount: 0 },
    { id: '3', name: 'C', serviceType: '影音', rating: 4.2, contact: '', phone: '', orderCount: 0 },
    { id: '4', name: 'D', serviceType: '印刷', rating: 3.8, contact: '', phone: '', orderCount: 0 },
  ];

  it('应返回评分>=4.5的供应商', () => {
    const top = getTopRatedSuppliers(mockSuppliers, 4.5);
    expect(top).toHaveLength(2);
  });

  it('结果应按评分降序排列', () => {
    const top = getTopRatedSuppliers(mockSuppliers, 4.5);
    expect(top[0].rating).toBe(4.8);
    expect(top[1].rating).toBe(4.5);
  });

  it('无符合条件供应商应返回空数组', () => {
    const top = getTopRatedSuppliers(mockSuppliers, 5.0);
    expect(top).toHaveLength(0);
  });

  it('默认最小评分应为4.5', () => {
    const top = getTopRatedSuppliers(mockSuppliers);
    expect(top).toHaveLength(2);
  });
});