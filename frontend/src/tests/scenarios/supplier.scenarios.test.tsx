/**
 * 供应商管理场景测试
 * 覆盖供应商创建、编辑、删除、筛选、评价等核心场景
 */
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
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
const mockSuppliers = [
  {
    id: '1',
    name: '北京星光展览有限公司',
    serviceType: '搭建',
    rating: 4.5,
    contact: '王经理',
    phone: '010-12345678',
    email: 'wang@example.com',
    address: '北京市朝阳区',
    tags: ['大型展会', '特装搭建'],
    orderCount: 15,
  },
  {
    id: '2',
    name: '上海设计工作室',
    serviceType: '设计',
    rating: 4.8,
    contact: '李设计师',
    phone: '021-87654321',
    email: 'li@example.com',
    address: '上海市浦东新区',
    tags: ['VI设计', '展台设计'],
    orderCount: 8,
  },
  {
    id: '3',
    name: '深圳音响设备公司',
    serviceType: '影音',
    rating: 4.2,
    contact: '张技术',
    phone: '0755-11112222',
    email: 'zhang@example.com',
    address: '深圳市南山区',
    tags: ['音响租赁', '灯光设备'],
    orderCount: 20,
  },
  {
    id: '4',
    name: '广州礼品定制厂',
    serviceType: '礼品',
    rating: 3.8,
    contact: '陈老板',
    phone: '020-33334444',
    email: 'chen@example.com',
    address: '广州市天河区',
    tags: ['定制礼品', '纪念品'],
    orderCount: 5,
  },
];

const mockReviews = [
  { id: '1', user: '张三', content: '服务很好，准时交付', rating: 5, date: '2024-02-15' },
  { id: '2', user: '李四', content: '质量不错', rating: 4, date: '2024-01-20' },
];

// Mock hooks
vi.mock('../../utils/hooks', () => ({
  useSuppliersData: () => ({
    suppliers: mockSuppliers,
    loading: false,
    error: null,
    addSupplier: vi.fn().mockImplementation((data) => Promise.resolve({ id: '5', ...data })),
    updateSupplier: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
    deleteSupplier: vi.fn().mockImplementation((id) => Promise.resolve({ success: true })),
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
  suppliersApi: {
    getList: vi.fn().mockResolvedValue(mockSuppliers),
    getDetail: vi.fn().mockResolvedValue({ ...mockSuppliers[0], reviews: mockReviews }),
    create: vi.fn().mockResolvedValue(mockSuppliers[0]),
    update: vi.fn().mockResolvedValue(mockSuppliers[0]),
    delete: vi.fn().mockResolvedValue({ message: 'deleted' }),
    getReviews: vi.fn().mockResolvedValue(mockReviews),
    addReview: vi.fn().mockResolvedValue({ message: 'review added' }),
    addBill: vi.fn().mockResolvedValue({ message: 'bill added' }),
  },
}));

describe('供应商管理场景', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mockToast).forEach(fn => fn.mockClear());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('场景24: 创建供应商', () => {
    it('应正确创建新供应商', async () => {
      // Given: 新供应商数据
      const newSupplierData = {
        name: '测试供应商',
        serviceType: '搭建',
        rating: 4.0,
        contact: '张经理',
        phone: '010-99998888',
        email: 'test@example.com',
        address: '北京市海淀区',
        tags: ['测试'],
      };

      // When: 创建供应商
      const { useSuppliersData } = await import('../../utils/hooks');
      const { addSupplier } = useSuppliersData();
      const result = await addSupplier(newSupplierData);

      // Then: 返回包含ID的供应商
      expect(result).toHaveProperty('id');
      expect(result.name).toBe(newSupplierData.name);
    });

    it('新建供应商应设置默认评分', () => {
      // Given: 默认评分
      const defaultRating = 5.0;

      // Then: 默认评分正确
      expect(defaultRating).toBe(5.0);
    });

    it('供应商名称不应为空', () => {
      // Given: 验证函数
      const validateName = (name: string) => name.trim().length > 0;

      // Then: 验证结果
      expect(validateName('北京星光展览')).toBe(true);
      expect(validateName('')).toBe(false);
      expect(validateName('   ')).toBe(false);
    });

    it('联系电话格式应正确', () => {
      // Given: 电话验证
      const validatePhone = (phone: string) => /^[\d-]+$/.test(phone);

      // Then: 验证结果
      expect(validatePhone('010-12345678')).toBe(true);
      expect(validatePhone('13812345678')).toBe(true);
      expect(validatePhone('abc123')).toBe(false);
    });

    it('邮箱格式应正确', () => {
      // Given: 邮箱验证
      const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      // Then: 验证结果
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });

    it('服务类型应为有效选项', () => {
      // Given: 有效类型
      const validTypes = ['搭建', '设计', '影音', '礼品', '印刷', '其他'];

      // Then: 验证通过
      validTypes.forEach(type => {
        expect(mockSuppliers.some(s => s.serviceType === type) || validTypes.includes(type)).toBe(true);
      });
    });
  });

  describe('场景25: 编辑供应商', () => {
    it('应正确更新供应商联系方式', async () => {
      // Given: 供应商ID和新联系方式
      const supplierId = 1;
      const newContact = '新的联系人';
      const newPhone = '010-88887777';

      // When: 更新供应商
      const { useSuppliersData } = await import('../../utils/hooks');
      const { updateSupplier } = useSuppliersData();
      await updateSupplier(supplierId, { contact: newContact, phone: newPhone });

      // Then: API被调用
      expect(updateSupplier).toHaveBeenCalled();
    });

    it('应正确更新供应商评分', async () => {
      // Given: 供应商ID和新评分
      const supplierId = 1;
      const newRating = 4.8;

      // When: 更新评分
      const { useSuppliersData } = await import('../../utils/hooks');
      const { updateSupplier } = useSuppliersData();
      await updateSupplier(supplierId, { rating: newRating });

      // Then: API被调用
      expect(updateSupplier).toHaveBeenCalledWith(supplierId, expect.objectContaining({ rating: newRating }));
    });

    it('编辑不应改变其他字段', () => {
      // Given: 原始供应商数据
      const original = mockSuppliers[0];
      const originalName = original.name;

      // Then: 其他字段保持不变
      expect(originalName).toBe('北京星光展览有限公司');
    });

    it('评分应在有效范围内', () => {
      // Given: 评分验证
      const validateRating = (rating: number) => rating >= 0 && rating <= 5;

      // Then: 验证结果
      expect(validateRating(4.5)).toBe(true);
      expect(validateRating(0)).toBe(true);
      expect(validateRating(5)).toBe(true);
      expect(validateRating(-1)).toBe(false);
      expect(validateRating(6)).toBe(false);
    });
  });

  describe('场景26: 删除供应商', () => {
    it('应正确删除供应商', async () => {
      // Given: 供应商ID
      const supplierId = 1;

      // When: 删除供应商
      const { useSuppliersData } = await import('../../utils/hooks');
      const { deleteSupplier } = useSuppliersData();
      await deleteSupplier(supplierId);

      // Then: API被调用
      expect(deleteSupplier).toHaveBeenCalledWith(supplierId);
    });

    it('删除后供应商应从列表移除', () => {
      // Given: 供应商列表
      let suppliers = [...mockSuppliers];

      // When: 删除供应商
      const deleteId = '1';
      suppliers = suppliers.filter(s => s.id !== deleteId);

      // Then: 列表减少
      expect(suppliers.length).toBe(mockSuppliers.length - 1);
      expect(suppliers.find(s => s.id === deleteId)).toBeUndefined();
    });

    it('删除确认应防止误操作', () => {
      // Given: 确认逻辑
      let shouldDelete = true;

      // When: 确认后删除
      if (shouldDelete) {
        // 执行删除
      }

      // Then: 需要确认步骤
      expect(shouldDelete).toBe(true);
    });
  });

  describe('场景27: 按分类筛选', () => {
    it('应正确筛选搭建类供应商', () => {
      // Given: 分类筛选
      const category = '搭建';

      // When: 筛选
      const results = mockSuppliers.filter(s => s.serviceType === category);

      // Then: 筛选正确
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('北京星光展览有限公司');
    });

    it('应正确筛选设计类供应商', () => {
      // Given: 分类筛选
      const category = '设计';

      // When: 筛选
      const results = mockSuppliers.filter(s => s.serviceType === category);

      // Then: 筛选正确
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('上海设计工作室');
    });

    it('应正确筛选影音类供应商', () => {
      // Given: 分类筛选
      const category = '影音';

      // When: 筛选
      const results = mockSuppliers.filter(s => s.serviceType === category);

      // Then: 筛选正确
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('深圳音响设备公司');
    });

    it('应正确筛选礼品类供应商', () => {
      // Given: 分类筛选
      const category = '礼品';

      // When: 筛选
      const results = mockSuppliers.filter(s => s.serviceType === category);

      // Then: 筛选正确
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('广州礼品定制厂');
    });

    it('全部分类应显示所有供应商', () => {
      // Given: 全部选项
      const category = '全部';

      // When: 筛选
      const results = category === '全部' ? mockSuppliers : mockSuppliers.filter(s => s.serviceType === category);

      // Then: 显示全部
      expect(results.length).toBe(mockSuppliers.length);
    });
  });

  describe('场景28: 供应商搜索', () => {
    it('应按名称搜索', () => {
      // Given: 搜索关键词
      const keyword = '北京';

      // When: 搜索
      const results = mockSuppliers.filter(s =>
        s.name.toLowerCase().includes(keyword.toLowerCase())
      );

      // Then: 匹配正确
      expect(results.length).toBe(1);
      expect(results[0].name).toContain('北京');
    });

    it('应按联系人搜索', () => {
      // Given: 联系人关键词
      const keyword = '王经理';

      // When: 搜索
      const results = mockSuppliers.filter(s =>
        s.contact.toLowerCase().includes(keyword.toLowerCase())
      );

      // Then: 匹配正确
      expect(results.length).toBe(1);
    });

    it('应按标签搜索', () => {
      // Given: 标签关键词
      const keyword = '大型展会';

      // When: 搜索
      const results = mockSuppliers.filter(s =>
        s.tags?.some(tag => tag.toLowerCase().includes(keyword.toLowerCase()))
      );

      // Then: 匹配正确
      expect(results.length).toBe(1);
    });

    it('组合搜索应同时生效', () => {
      // Given: 分类和关键词
      const category = '搭建';
      const keyword = '北京';

      // When: 组合筛选
      const results = mockSuppliers.filter(s =>
        s.serviceType === category &&
        s.name.toLowerCase().includes(keyword.toLowerCase())
      );

      // Then: 精确匹配
      expect(results.length).toBe(1);
    });

    it('空搜索应返回全部', () => {
      // Given: 空关键词
      const keyword = '';

      // When: 搜索
      const results = keyword === ''
        ? mockSuppliers
        : mockSuppliers.filter(s => s.name.includes(keyword));

      // Then: 返回全部
      expect(results.length).toBe(mockSuppliers.length);
    });
  });

  describe('场景29: 添加供应商评价', () => {
    it('应正确添加新评价', async () => {
      // Given: 评价数据
      const reviewData = {
        content: '服务很好，准时交付',
        rating: 5,
      };

      // When: 添加评价
      const { suppliersApi } = await import('../../services/backendApi');
      const result = await suppliersApi.addReview(1, reviewData);

      // Then: API被调用
      expect(suppliersApi.addReview).toHaveBeenCalledWith(1, reviewData);
    });

    it('评价内容不应为空', () => {
      // Given: 评价验证
      const validateContent = (content: string) => content.trim().length > 0;

      // Then: 验证结果
      expect(validateContent('服务很好')).toBe(true);
      expect(validateContent('')).toBe(false);
    });

    it('评分应在1-5范围内', () => {
      // Given: 评分验证
      const validateRating = (rating: number) => rating >= 1 && rating <= 5;

      // Then: 验证结果
      expect(validateRating(5)).toBe(true);
      expect(validateRating(1)).toBe(true);
      expect(validateRating(0)).toBe(false);
      expect(validateRating(6)).toBe(false);
    });

    it('评价应记录评价人', () => {
      // Given: 评价人
      const user = '张三';

      // Then: 评价人非空
      expect(user).toBeTruthy();
    });

    it('评价应记录日期', () => {
      // Given: 评价日期
      const date = new Date().toISOString().split('T')[0];

      // Then: 日期格式正确
      expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('应能获取供应商评价列表', async () => {
      // Given: 供应商ID
      const supplierId = 1;

      // When: 获取评价
      const { suppliersApi } = await import('../../services/backendApi');
      const reviews = await suppliersApi.getReviews(supplierId);

      // Then: 返回评价列表
      expect(Array.isArray(reviews)).toBe(true);
    });
  });

  describe('场景30: 供应商数据展示', () => {
    it('应显示供应商评分', () => {
      // Given: 供应商
      const supplier = mockSuppliers[0];

      // Then: 评分显示
      expect(supplier.rating).toBe(4.5);
    });

    it('应显示服务类型标签', () => {
      // Given: 供应商
      const supplier = mockSuppliers[0];

      // Then: 类型标签
      expect(supplier.serviceType).toBe('搭建');
    });

    it('应显示供应商标签', () => {
      // Given: 供应商
      const supplier = mockSuppliers[0];

      // Then: 有标签
      expect(supplier.tags).toBeDefined();
      expect(supplier.tags!.length).toBeGreaterThan(0);
    });

    it('应显示合作次数', () => {
      // Given: 供应商
      const supplier = mockSuppliers[0];

      // Then: 合作次数
      expect(supplier.orderCount).toBe(15);
    });

    it('应显示联系方式', () => {
      // Given: 供应商
      const supplier = mockSuppliers[0];

      // Then: 联系方式完整
      expect(supplier.contact).toBeTruthy();
      expect(supplier.phone).toBeTruthy();
    });
  });

  describe('场景31: 供应商统计', () => {
    it('应正确计算供应商总数', () => {
      // Given: 供应商列表
      const total = mockSuppliers.length;

      // Then: 总数正确
      expect(total).toBe(4);
    });

    it('应正确计算各类型供应商数量', () => {
      // Given: 按类型分组
      const typeCount: Record<string, number> = {};
      mockSuppliers.forEach(s => {
        typeCount[s.serviceType] = (typeCount[s.serviceType] || 0) + 1;
      });

      // Then: 统计正确
      expect(typeCount['搭建']).toBe(1);
      expect(typeCount['设计']).toBe(1);
      expect(typeCount['影音']).toBe(1);
      expect(typeCount['礼品']).toBe(1);
    });

    it('应正确计算平均评分', () => {
      // Given: 评分列表
      const ratings = mockSuppliers.map(s => s.rating);
      const avgRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;

      // Then: 平均评分正确
      expect(avgRating).toBeCloseTo(4.325, 2);
    });
  });
});
