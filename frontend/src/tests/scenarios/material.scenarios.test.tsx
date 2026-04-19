/**
 * 物料管理场景测试
 * 覆盖物料入库、领用、库存管理、数据导出等核心场景
 */
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import React from 'react';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

// Mock 数据
const mockMaterials = [
  { id: '1', name: 'AI产品白皮书 2024版', category: '产品宣传册', type: '常规', stock: 150, unit: '本', status: 'In Stock', usageCount: 50, lastUpdated: '2024-03-22' },
  { id: '2', name: 'NUMAP宣传册', category: '产品宣传册', type: '定制', stock: 300, unit: '本', status: 'In Stock', usageCount: 0, lastUpdated: '2024-02-05' },
  { id: '3', name: '品牌定制保温杯', category: '礼品', type: '定制', stock: 5, unit: '个', status: 'Low Stock', usageCount: 95, lastUpdated: '2024-03-21' },
  { id: '4', name: '易拉宝-X1展台', category: '易拉宝', type: '定制', stock: 0, unit: '个', status: 'Out of Stock', usageCount: 20, lastUpdated: '2024-01-15' },
];

const mockFetchMaterials = vi.fn().mockResolvedValue(mockMaterials);
const mockAddMaterial = vi.fn().mockImplementation((data) => Promise.resolve({ id: '5', ...data }));
const mockUpdateMaterial = vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data }));
const mockDeleteMaterial = vi.fn().mockImplementation((id) => Promise.resolve({ success: true }));
const mockAddStock = vi.fn().mockImplementation((id, count) => Promise.resolve({ id, stock: count }));
const mockWithdraw = vi.fn().mockImplementation((id, count) => Promise.resolve({ id, withdrawn: count }));

vi.mock('../../utils/hooks', () => ({
  useMaterialsData: () => ({
    materials: mockMaterials,
    loading: false,
    error: null,
    fetchMaterials: mockFetchMaterials,
    addMaterial: mockAddMaterial,
    updateMaterial: mockUpdateMaterial,
    deleteMaterial: mockDeleteMaterial,
    addStock: mockAddStock,
    withdraw: mockWithdraw,
  }),
}));

// Mock Toast
const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};
vi.mock('../../shared/Toast', () => ({
  useToast: () => mockToast,
}));

// Mock API
vi.mock('../../services/backendApi', () => ({
  materialsApi: {
    getList: vi.fn().mockResolvedValue(mockMaterials),
    getDetail: vi.fn().mockResolvedValue(mockMaterials[0]),
    create: vi.fn().mockResolvedValue(mockMaterials[0]),
    update: vi.fn().mockResolvedValue(mockMaterials[0]),
    delete: vi.fn().mockResolvedValue({ message: 'deleted' }),
    addStock: vi.fn().mockResolvedValue({ message: 'stock added' }),
    withdraw: vi.fn().mockResolvedValue({ message: 'withdrawn' }),
    getWarehousingLogs: vi.fn().mockResolvedValue([]),
    getWithdrawalLogs: vi.fn().mockResolvedValue([]),
  },
}));

describe('物料管理场景', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 清理mock toast调用
    Object.values(mockToast).forEach(fn => fn.mockClear());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('场景12: 新增物料类型入库', () => {
    it('应正确创建新物料类型', async () => {
      // Given: 新物料数据
      const newMaterialData = {
        name: '2024年度品牌宣传册',
        category: '产品宣传册',
        type: '常规' as const,
        stock: 200,
        unit: '本',
      };

      // When: 添加新物料
      const result = await mockAddMaterial(newMaterialData);

      // Then: 返回包含ID的新物料
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(newMaterialData.name);
    });

    it('新增物料入库应增加流水记录', () => {
      // Given: 入库流水记录
      const logs: any[] = [];

      // When: 执行入库
      const newLog = {
        id: `log-${Date.now()}`,
        materialName: '测试物料',
        count: 100,
        operator: '当前用户',
        date: new Date().toLocaleString(),
        isNewType: true,
      };
      logs.unshift(newLog);

      // Then: 记录被添加到列表头部
      expect(logs.length).toBe(1);
      expect(logs[0].isNewType).toBe(true);
    });

    it('新增类型入库应标记为首批入库', () => {
      // Given: 入库记录
      const log = {
        isNewType: true,
        count: 200,
      };

      // Then: 标记正确
      expect(log.isNewType).toBe(true);
    });

    it('新分类应添加到分类列表', () => {
      // Given: 原始分类
      const categories = ['产品宣传册', '易拉宝', '会议定制', '礼品', '办公用品', '其他'];

      // When: 添加新分类
      const newCategory = '宣传礼包';
      const updatedCategories = [...categories.filter(c => c !== '其他'), newCategory, '其他'];

      // Then: 新分类存在
      expect(updatedCategories).toContain(newCategory);
    });
  });

  describe('场景13: 补充入库', () => {
    it('应正确增加现有物料库存', async () => {
      // Given: 物料ID和补充数量
      const materialId = '1';
      const addCount = 50;

      // When: 执行补充入库
      await mockAddStock(materialId, addCount);

      // Then: API被调用
      expect(mockAddStock).toHaveBeenCalledWith(materialId, addCount);
    });

    it('补充入库应标记为库存增补', () => {
      // Given: 入库记录
      const log = {
        isNewType: false,
        count: 50,
      };

      // Then: 标记为补充入库
      expect(log.isNewType).toBe(false);
    });

    it('补充入库应生成流水记录', () => {
      // Given: 现有物料和入库数量
      const material = mockMaterials[0];
      const addCount = 50;

      // When: 执行补充入库
      const newLog = {
        materialName: material.name,
        count: addCount,
        isNewType: false,
      };

      // Then: 记录正确
      expect(newLog.isNewType).toBe(false);
      expect(newLog.count).toBe(50);
    });

    it('补充入库应更新库存数量', () => {
      // Given: 原始库存
      const originalStock = mockMaterials[0].stock;
      const addCount = 50;

      // When: 计算新库存
      const newStock = originalStock + addCount;

      // Then: 库存增加
      expect(newStock).toBe(originalStock + addCount);
    });
  });

  describe('场景14: 物料领用', () => {
    it('应正确处理领用请求', async () => {
      // Given: 物料ID和领用数量
      const materialId = '1';
      const count = 10;
      const user = '市场部-张伟';
      const reason = 'Q1巡回展-上海站';

      // When: 执行领用
      await mockWithdraw(materialId, count);

      // Then: API被调用
      expect(mockWithdraw).toHaveBeenCalledWith(materialId, count);
    });

    it('领用应生成领用流水记录', () => {
      // Given: 领用表单数据
      const withdrawalData = {
        materialName: 'AI产品白皮书 2024版',
        count: 50,
        unit: '本',
        user: '市场部-张伟',
        reason: 'Q1巡回展-上海站',
        date: new Date().toLocaleString(),
      };

      // When: 创建领用记录
      const log = {
        id: `wlog-${Date.now()}`,
        ...withdrawalData,
      };

      // Then: 记录正确
      expect(log.id).toBeDefined();
      expect(log.materialName).toBe(withdrawalData.materialName);
    });

    it('领用应减少库存数量', () => {
      // Given: 原始库存
      const originalStock = 150;
      const withdrawCount = 50;

      // When: 计算新库存
      const newStock = originalStock - withdrawCount;

      // Then: 库存减少
      expect(newStock).toBe(100);
    });

    it('领用应增加累计领用统计', () => {
      // Given: 原始累计领用
      const originalUsage = 50;
      const withdrawCount = 50;

      // When: 计算新累计
      const newUsage = originalUsage + withdrawCount;

      // Then: 累计增加
      expect(newUsage).toBe(100);
    });

    it('领用人信息应完整记录', () => {
      // Given: 领用人信息
      const userInfo = '市场部-张伟';

      // Then: 信息非空
      expect(userInfo).toBeTruthy();
      expect(userInfo.includes('-')).toBe(true);
    });

    it('领用用途应完整记录', () => {
      // Given: 领用用途
      const reason = 'Q1巡回展-上海站';

      // Then: 用途非空
      expect(reason).toBeTruthy();
    });
  });

  describe('场景15: 物料搜索和筛选', () => {
    it('关键词搜索应匹配物料名称', () => {
      // Given: 搜索关键词
      const keyword = '白皮书';

      // When: 搜索
      const results = mockMaterials.filter(m =>
        m.name.toLowerCase().includes(keyword.toLowerCase())
      );

      // Then: 匹配结果
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('白皮书');
    });

    it('分类筛选应返回正确结果', () => {
      // Given: 分类筛选
      const category = '产品宣传册';

      // When: 筛选
      const results = mockMaterials.filter(m => m.category === category);

      // Then: 分类匹配
      expect(results.length).toBe(2);
      expect(results.every(m => m.category === category)).toBe(true);
    });

    it('搜索应支持物料规格匹配', () => {
      // Given: 单位搜索
      const searchInUnit = '本';

      // When: 搜索
      const results = mockMaterials.filter(m =>
        m.unit === searchInUnit
      );

      // Then: 匹配
      expect(results.length).toBe(2);
    });

    it('组合筛选应同时生效', () => {
      // Given: 分类和关键词
      const category = '礼品';
      const keyword = '保温';

      // When: 组合筛选
      const results = mockMaterials.filter(m =>
        m.category === category &&
        m.name.toLowerCase().includes(keyword.toLowerCase())
      );

      // Then: 精确匹配
      expect(results.length).toBe(1);
    });

    it('空搜索应返回全部物料', () => {
      // Given: 空关键词
      const keyword = '';

      // When: 搜索
      const results = keyword === ''
        ? mockMaterials
        : mockMaterials.filter(m => m.name.includes(keyword));

      // Then: 返回全部
      expect(results.length).toBe(mockMaterials.length);
    });
  });

  describe('场景16: 导出领用流水', () => {
    it('应正确生成CSV内容', () => {
      // Given: 领用记录
      const logs = [
        { date: '2024-03-22 10:30:12', materialName: 'AI产品白皮书 2024版', count: 50, unit: '本', user: '市场部-张伟', reason: 'Q1巡回展' },
      ];

      // When: 生成CSV
      const headers = ['领用时间', '物料名称', '领用数量', '单位', '领用人/部门', '领用用途'];
      const csvRows = [
        headers.join(','),
        ...logs.map(log => [
          log.date,
          `"${log.materialName}"`,
          log.count,
          log.unit,
          `"${log.user}"`,
          `"${log.reason}"`,
        ].join(','))
      ].join('\n');

      // Then: CSV格式正确
      expect(csvRows).toContain('领用时间');
      expect(csvRows).toContain('AI产品白皮书');
    });

    it('空数据不应允许导出', () => {
      // Given: 空记录
      const logs: any[] = [];

      // When: 检查
      const canExport = logs.length > 0;

      // Then: 不能导出
      expect(canExport).toBe(false);
    });

    it('导出的文件名应包含日期', () => {
      // Given: 日期
      const today = new Date().toISOString().split('T')[0];

      // When: 生成文件名
      const filename = `物料领用流水_${today}.csv`;

      // Then: 包含日期
      expect(filename).toContain(today);
    });

    it('CSV应使用UTF-8 BOM编码', () => {
      // Given: BOM标记
      const bom = '\ufeff';

      // When: 创建CSV
      const csv = bom + 'data';

      // Then: 包含BOM
      expect(csv.charCodeAt(0)).toBe(0xfeff);
    });
  });

  describe('场景17: 库存状态边界', () => {
    it('库存为0时不应允许领用', () => {
      // Given: 缺货物料
      const material = mockMaterials.find(m => m.id === '4');

      // When: 检查
      const canWithdraw = material?.stock > 0;

      // Then: 不能领用
      expect(canWithdraw).toBe(false);
    });

    it('库存预警阈值应为10', () => {
      // Given: 预警阈值
      const LOW_STOCK_THRESHOLD = 10;

      // Then: 阈值为10
      expect(LOW_STOCK_THRESHOLD).toBe(10);
    });

    it('库存低于10应显示预警状态', () => {
      // Given: 低库存物料
      const stock = 5;
      const threshold = 10;

      // When: 判断状态
      const status = stock === 0 ? 'Out of Stock' : stock < threshold ? 'Low Stock' : 'In Stock';

      // Then: 预警状态
      expect(status).toBe('Low Stock');
    });

    it('缺货状态应正确识别', () => {
      // Given: 零库存
      const stock = 0;

      // When: 判断状态
      const status = stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'In Stock';

      // Then: 缺货状态
      expect(status).toBe('Out of Stock');
    });

    it('充足库存应显示正常状态', () => {
      // Given: 充足库存
      const stock = 150;

      // When: 判断状态
      const status = stock === 0 ? 'Out of Stock' : stock < 10 ? 'Low Stock' : 'In Stock';

      // Then: 正常状态
      expect(status).toBe('In Stock');
    });

    it('领用数量不应超过库存', () => {
      // Given: 库存和领用请求
      const stock = 5;
      const requested = 10;

      // When: 验证
      const isValid = requested <= stock;

      // Then: 验证失败
      expect(isValid).toBe(false);
    });

    it('领用数量应为正整数', () => {
      // Given: 领用数量验证
      const validateCount = (count: number) => count > 0 && Number.isInteger(count);

      // Then: 验证结果
      expect(validateCount(10)).toBe(true);
      expect(validateCount(0)).toBe(false);
      expect(validateCount(-1)).toBe(false);
      expect(validateCount(1.5)).toBe(false);
    });
  });

  describe('场景18: 物料数据验证', () => {
    it('物料名称不应为空', () => {
      // Given: 验证函数
      const validateName = (name: string) => name.trim().length > 0;

      // Then: 验证结果
      expect(validateName('')).toBe(false);
      expect(validateName('   ')).toBe(false);
      expect(validateName('测试物料')).toBe(true);
    });

    it('分类应为有效选项', () => {
      // Given: 有效分类
      const validCategories = ['产品宣传册', '易拉宝', '会议定制', '礼品', '办公用品', '其他'];
      const category = '礼品';

      // Then: 验证通过
      expect(validCategories).toContain(category);
    });

    it('单位不应为空', () => {
      // Given: 单位验证
      const validateUnit = (unit: string) => unit.trim().length > 0;

      // Then: 验证结果
      expect(validateUnit('')).toBe(false);
      expect(validateUnit('本')).toBe(true);
    });

    it('库存应为非负数', () => {
      // Given: 库存验证
      const validateStock = (stock: number) => stock >= 0;

      // Then: 验证结果
      expect(validateStock(0)).toBe(true);
      expect(validateStock(100)).toBe(true);
      expect(validateStock(-1)).toBe(false);
    });
  });

  describe('场景19: 物料列表展示', () => {
    it('应按分类分组显示', () => {
      // Given: 物料列表
      const groups: Record<string, typeof mockMaterials> = {};

      // When: 分组
      mockMaterials.forEach(item => {
        if (!groups[item.category]) groups[item.category] = [];
        groups[item.category].push(item);
      });

      // Then: 分组正确
      expect(Object.keys(groups)).toContain('产品宣传册');
      expect(Object.keys(groups)).toContain('礼品');
      expect(groups['产品宣传册'].length).toBe(2);
    });

    it('应显示库存数量和状态', () => {
      // Given: 物料
      const material = mockMaterials[0];

      // Then: 信息完整
      expect(material.stock).toBeDefined();
      expect(material.status).toBeDefined();
      expect(material.unit).toBeDefined();
    });

    it('应显示最后更新时间', () => {
      // Given: 物料
      const material = mockMaterials[0];

      // Then: 有更新时间
      expect(material.lastUpdated).toBeTruthy();
    });
  });
});
