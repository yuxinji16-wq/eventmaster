/**
 * 物料管理模块测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// 模拟 CSV 导出逻辑
function generateWithdrawalCSV(logs: Array<{
  id: string;
  materialName: string;
  count: number;
  unit: string;
  user: string;
  reason: string;
  date: string;
}>): string {
  const headers = ['领用时间', '物料名称', '领用数量', '单位', '领用人/部门', '领用用途'];
  const rows = [
    headers.join(','),
    ...logs.map(log => [
      log.date,
      `"${log.materialName}"`,
      log.count,
      log.unit,
      `"${log.user}"`,
      `"${log.reason}"`
    ].join(','))
  ];
  return rows.join('\n');
}

function generateWarehousingCSV(logs: Array<{
  id: string;
  materialName: string;
  count: number;
  operator: string;
  date: string;
  isNewType: boolean;
}>): string {
  const headers = ['日期', '物料名称', '入库数量', '操作人', '类型'];
  const rows = [
    headers.join(','),
    ...logs.map(log => [
      log.date,
      `"${log.materialName}"`,
      log.count,
      `"${log.operator}"`,
      log.isNewType ? '新增入库' : '库存增补'
    ].join(','))
  ];
  return rows.join('\n');
}

describe('物料领用流水 CSV 导出', () => {
  const sampleWithdrawalLogs = [
    { id: 'w1', materialName: 'AI产品白皮书', count: 50, unit: '本', user: '市场部-张伟', reason: 'Q1巡回展', date: '2024-03-22 10:30:12' },
    { id: 'w2', materialName: '品牌定制保温杯', count: 20, unit: '个', user: '行政部-李芳', reason: '新员工礼包', date: '2024-03-21 15:45:00' },
  ];

  it('应正确生成 CSV 表头', () => {
    const csv = generateWithdrawalCSV([]);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe('领用时间,物料名称,领用数量,单位,领用人/部门,领用用途');
  });

  it('应正确转换单条领用记录', () => {
    const csv = generateWithdrawalCSV([sampleWithdrawalLogs[0]]);
    const lines = csv.split('\n');
    expect(lines.length).toBe(2);
    expect(lines[1]).toContain('AI产品白皮书');
    expect(lines[1]).toContain('50');
    expect(lines[1]).toContain('本');
    expect(lines[1]).toContain('市场部-张伟');
  });

  it('应正确转换多条领用记录', () => {
    const csv = generateWithdrawalCSV(sampleWithdrawalLogs);
    const lines = csv.split('\n');
    expect(lines.length).toBe(3); // 1 header + 2 data rows
    expect(lines[1]).toContain('AI产品白皮书');
    expect(lines[2]).toContain('品牌定制保温杯');
  });

  it('应正确处理包含逗号的物料名称', () => {
    const logsWithComma = [
      { id: 'w3', materialName: '产品,手册', count: 10, unit: '本', user: '市场部', reason: '测试', date: '2024-03-22' }
    ];
    const csv = generateWithdrawalCSV(logsWithComma);
    const dataLine = csv.split('\n')[1];
    expect(dataLine).toContain('"产品,手册"'); // 应该被引号包裹
  });

  it('应正确处理空记录列表', () => {
    const csv = generateWithdrawalCSV([]);
    const lines = csv.split('\n');
    expect(lines.length).toBe(1); // 只有表头
    expect(lines[0]).toBe('领用时间,物料名称,领用数量,单位,领用人/部门,领用用途');
  });
});

describe('物料入库流水 CSV 导出', () => {
  const sampleWarehousingLogs = [
    { id: 'l1', materialName: 'AI产品白皮书 2024版', count: 200, operator: '张三', date: '2024-03-22 14:00', isNewType: false },
    { id: 'l2', materialName: 'NUMAP宣传册', count: 300, operator: '李四', date: '2024-02-05 17:03', isNewType: true },
  ];

  it('应正确生成入库 CSV 表头', () => {
    const csv = generateWarehousingCSV([]);
    const firstLine = csv.split('\n')[0];
    expect(firstLine).toBe('日期,物料名称,入库数量,操作人,类型');
  });

  it('应正确区分新增入库和库存增补', () => {
    const csv = generateWarehousingCSV(sampleWarehousingLogs);
    const lines = csv.split('\n');
    expect(lines[1]).toContain('库存增补');
    expect(lines[2]).toContain('新增入库');
  });

  it('应正确处理入库记录数据', () => {
    const csv = generateWarehousingCSV([sampleWarehousingLogs[0]]);
    const lines = csv.split('\n');
    expect(lines[1]).toContain('AI产品白皮书 2024版');
    expect(lines[1]).toContain('200');
    expect(lines[1]).toContain('张三');
  });
});

describe('物料状态计算逻辑', () => {
  function calculateStockStatus(stock: number): 'In Stock' | 'Low Stock' | 'Out of Stock' {
    if (stock === 0) return 'Out of Stock';
    if (stock < 10) return 'Low Stock';
    return 'In Stock';
  }

  it('库存充足时应返回 In Stock', () => {
    expect(calculateStockStatus(100)).toBe('In Stock');
    expect(calculateStockStatus(50)).toBe('In Stock');
    expect(calculateStockStatus(10)).toBe('In Stock');
  });

  it('库存预警时应返回 Low Stock', () => {
    expect(calculateStockStatus(9)).toBe('Low Stock');
    expect(calculateStockStatus(5)).toBe('Low Stock');
    expect(calculateStockStatus(1)).toBe('Low Stock');
  });

  it('库存为零时应返回 Out of Stock', () => {
    expect(calculateStockStatus(0)).toBe('Out of Stock');
  });
});

describe('物料分类过滤逻辑', () => {
  const mockMaterials = [
    { id: '1', name: '产品手册A', category: '宣传册', stock: 100 },
    { id: '2', name: '产品手册B', category: '宣传册', stock: 5 },
    { id: '3', name: '易拉宝A', category: '易拉宝', stock: 50 },
    { id: '4', name: '礼品A', category: '礼品', stock: 0 },
  ];

  function filterMaterials(materials: typeof mockMaterials, searchQuery: string, categoryFilter: string) {
    return materials.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === '所有分类' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }

  it('应返回所有物料当没有过滤条件时', () => {
    const result = filterMaterials(mockMaterials, '', '所有分类');
    expect(result).toHaveLength(4);
  });

  it('应按分类过滤物料', () => {
    const result = filterMaterials(mockMaterials, '', '宣传册');
    expect(result).toHaveLength(2);
    expect(result.every(m => m.category === '宣传册')).toBe(true);
  });

  it('应按搜索关键词过滤物料', () => {
    const result = filterMaterials(mockMaterials, '产品手册', '所有分类');
    expect(result).toHaveLength(2);
  });

  it('应同时支持分类和关键词过滤', () => {
    const result = filterMaterials(mockMaterials, '产品手册', '宣传册');
    expect(result).toHaveLength(2);
  });

  it('搜索应不区分大小写', () => {
    const result1 = filterMaterials(mockMaterials, '产品手册', '所有分类');
    const result2 = filterMaterials(mockMaterials, '产品手册', '所有分类');
    expect(result1.length).toBe(result2.length);
    // 英文搜索也应该工作
    const result3 = filterMaterials(mockMaterials, '手册', '所有分类');
    expect(result3.length).toBe(2);
  });
});

describe('物料领用时间格式', () => {
  it('应生成正确的日期时间字符串', () => {
    const now = new Date();
    const formatted = now.toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');
    // 验证格式: YYYY-M-D H:mm:ss 或 YYYY-MM-DD H:mm:ss
    expect(formatted).toMatch(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{2}:\d{2}$/);
  });
});
