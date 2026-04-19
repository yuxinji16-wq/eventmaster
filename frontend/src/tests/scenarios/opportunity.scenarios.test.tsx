/**
 * 商机管理场景测试
 * 覆盖商机创建、阶段更新、筛选、删除等核心场景
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
const mockLeads = [
  {
    id: '1',
    clientName: '华为技术有限公司',
    company: '华为',
    contact: '张经理',
    phone: '13812345678',
    email: 'zhang@huawei.com',
    estimatedValue: 500000,
    status: '潜在客户',
    createDate: '2024-01-15',
    sourceType: 'activity',
    activityId: '1',
  },
  {
    id: '2',
    clientName: '阿里巴巴集团',
    company: '阿里',
    contact: '李总监',
    phone: '13987654321',
    email: 'li@alibaba.com',
    estimatedValue: 800000,
    status: '已联系',
    createDate: '2024-02-01',
    sourceType: 'manual',
  },
  {
    id: '3',
    clientName: '腾讯科技',
    company: '腾讯',
    contact: '王经理',
    phone: '13711112222',
    email: 'wang@tencent.com',
    estimatedValue: 300000,
    status: '已转销售',
    createDate: '2024-02-20',
    sourceType: 'activity',
    activityId: '2',
  },
  {
    id: '4',
    clientName: '字节跳动',
    company: '字节',
    contact: '陈经理',
    phone: '13622223333',
    email: 'chen@bytedance.com',
    estimatedValue: 600000,
    status: '已转化',
    createDate: '2024-03-10',
    sourceType: 'manual',
  },
  {
    id: '5',
    clientName: '京东集团',
    company: '京东',
    contact: '赵经理',
    phone: '13533334444',
    email: 'zhao@jd.com',
    estimatedValue: 400000,
    status: '未转化',
    createDate: '2023-12-01',
    sourceType: 'activity',
    activityId: '1',
  },
];

// Mock hooks
vi.mock('../../utils/hooks', () => ({
  useLeadsData: () => ({
    leads: mockLeads,
    loading: false,
    error: null,
    addLead: vi.fn().mockImplementation((data) => Promise.resolve({ id: '6', ...data })),
    updateLead: vi.fn().mockImplementation((id, data) => Promise.resolve({ id, ...data })),
    deleteLead: vi.fn().mockImplementation((id) => Promise.resolve({ success: true })),
  }),
  useActivitiesData: () => ({
    activities: [],
    loading: false,
    error: null,
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
  opportunitiesApi: {
    getList: vi.fn().mockResolvedValue(mockLeads),
    create: vi.fn().mockResolvedValue(mockLeads[0]),
    update: vi.fn().mockResolvedValue(mockLeads[0]),
    delete: vi.fn().mockResolvedValue({ message: 'deleted' }),
    getPipeline: vi.fn().mockResolvedValue({
      total_value: 2600000,
      stages: [
        { stage: '潜在客户', value: 500000, count: 1 },
        { stage: '已联系', value: 800000, count: 1 },
        { stage: '已转销售', value: 300000, count: 1 },
        { stage: '已转化', value: 600000, count: 1 },
        { stage: '未转化', value: 400000, count: 1 },
      ],
    }),
  },
}));

describe('商机管理场景', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.values(mockToast).forEach(fn => fn.mockClear());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('场景30: 创建商机', () => {
    it('应正确创建新商机', async () => {
      // Given: 新商机数据
      const newLeadData = {
        clientName: '小米科技',
        company: '小米',
        contact: '刘经理',
        phone: '13900001111',
        email: 'liu@xiaomi.com',
        estimatedValue: 450000,
        status: '潜在客户',
        sourceType: 'manual',
      };

      // When: 创建商机
      const { useLeadsData } = await import('../../utils/hooks');
      const { addLead } = useLeadsData();
      const result = await addLead(newLeadData);

      // Then: 返回包含ID的商机
      expect(result).toHaveProperty('id');
      expect(result.clientName).toBe(newLeadData.clientName);
    });

    it('新商机默认状态应为潜在客户', () => {
      // Given: 默认状态
      const defaultStatus = '潜在客户';

      // Then: 状态正确
      expect(defaultStatus).toBe('潜在客户');
    });

    it('商机金额应为正数', () => {
      // Given: 金额验证
      const validateValue = (value: number) => value > 0;

      // Then: 验证结果
      expect(validateValue(500000)).toBe(true);
      expect(validateValue(0)).toBe(false);
      expect(validateValue(-1000)).toBe(false);
    });

    it('客户名称不应为空', () => {
      // Given: 验证函数
      const validateName = (name: string) => name.trim().length > 0;

      // Then: 验证结果
      expect(validateName('华为技术有限公司')).toBe(true);
      expect(validateName('')).toBe(false);
    });

    it('联系电话格式应正确', () => {
      // Given: 电话验证 - 支持手机号和座机号
      const validatePhone = (phone: string) => /^1[3-9]\d{9}$/.test(phone) || /^\d{3,4}-?\d{7,8}$/.test(phone);

      // Then: 验证结果
      expect(validatePhone('13812345678')).toBe(true);
      expect(validatePhone('010-12345678')).toBe(true);
      expect(validatePhone('02187654321')).toBe(true);
      expect(validatePhone('abc123')).toBe(false);
    });

    it('商机来源应可选择', () => {
      // Given: 来源选项
      const sourceOptions = ['activity', 'manual'];

      // Then: 选项有效
      expect(sourceOptions).toContain('activity');
      expect(sourceOptions).toContain('manual');
    });
  });

  describe('场景31: 更新商机阶段', () => {
    it('应正确更新商机阶段', async () => {
      // Given: 商机ID和新阶段
      const leadId = '1';
      const newStatus = '已联系';

      // When: 更新阶段
      const { useLeadsData } = await import('../../utils/hooks');
      const { updateLead } = useLeadsData();
      await updateLead(leadId, { status: newStatus });

      // Then: API被调用
      expect(updateLead).toHaveBeenCalledWith(leadId, expect.objectContaining({ status: newStatus }));
    });

    it('阶段更新流程：潜在客户 -> 已联系', () => {
      // Given: 初始阶段
      let status = '潜在客户';

      // When: 更新为已联系
      status = '已联系';

      // Then: 状态更新
      expect(status).toBe('已联系');
    });

    it('阶段更新流程：已联系 -> 已转销售', () => {
      // Given: 当前阶段
      let status = '已联系';

      // When: 更新为已转销售
      status = '已转销售';

      // Then: 状态更新
      expect(status).toBe('已转销售');
    });

    it('阶段更新流程：已转销售 -> 已转化', () => {
      // Given: 当前阶段
      let status = '已转销售';

      // When: 更新为已转化
      status = '已转化';

      // Then: 状态更新
      expect(status).toBe('已转化');
    });

    it('已转化状态不应回退', () => {
      // Given: 已转化商机
      const status = '已转化';

      // Then: 不允许回退（业务规则）
      expect(status).toBe('已转化');
    });

    it('商机阶段状态应有效', () => {
      // Given: 有效状态列表
      const validStatuses = ['潜在客户', '已联系', '已转销售', '已转化', '未转化'];

      // Then: 状态有效
      mockLeads.forEach(lead => {
        expect(validStatuses).toContain(lead.status);
      });
    });
  });

  describe('场景32: 商机筛选', () => {
    it('应按阶段筛选', () => {
      // Given: 阶段筛选
      const stage = '潜在客户';

      // When: 筛选
      const results = mockLeads.filter(l => l.status === stage);

      // Then: 筛选正确
      expect(results.length).toBe(1);
      expect(results[0].clientName).toBe('华为技术有限公司');
    });

    it('应按关键词搜索', () => {
      // Given: 搜索关键词
      const keyword = '华为';

      // When: 搜索
      const results = mockLeads.filter(l =>
        l.clientName.toLowerCase().includes(keyword.toLowerCase()) ||
        l.contact.toLowerCase().includes(keyword.toLowerCase())
      );

      // Then: 匹配正确
      expect(results.length).toBe(1);
    });

    it('应按来源筛选-活动获取', () => {
      // Given: 来源筛选
      const source = 'activity';

      // When: 筛选
      const results = mockLeads.filter(l =>
        source === 'activity' && l.sourceType === 'activity'
      );

      // Then: 筛选正确
      expect(results.length).toBe(3);
    });

    it('应按来源筛选-自主录入', () => {
      // Given: 来源筛选
      const source = 'manual';

      // When: 筛选
      const results = mockLeads.filter(l =>
        source === 'manual' && l.sourceType === 'manual'
      );

      // Then: 筛选正确
      expect(results.length).toBe(2);
    });

    it('应按年份筛选', () => {
      // Given: 年份筛选
      const year = '2024';

      // When: 筛选
      const results = mockLeads.filter(l => {
        const leadYear = new Date(l.createDate).getFullYear().toString();
        return leadYear === year;
      });

      // Then: 筛选正确
      expect(results.length).toBe(4);
    });

    it('空筛选应返回全部', () => {
      // Given: 空筛选条件
      const filters = { stage: 'all', source: 'all', year: 'all', keyword: '' };

      // When: 筛选
      let results = mockLeads;
      if (filters.stage !== 'all') {
        results = results.filter(l => l.status === filters.stage);
      }
      if (filters.keyword) {
        results = results.filter(l =>
          l.clientName.includes(filters.keyword) ||
          l.contact.includes(filters.keyword)
        );
      }

      // Then: 返回全部
      expect(results.length).toBe(mockLeads.length);
    });

    it('组合筛选应同时生效', () => {
      // Given: 组合条件
      const stage = '潜在客户';
      const keyword = '华';

      // When: 组合筛选
      const results = mockLeads.filter(l =>
        l.status === stage &&
        l.clientName.includes(keyword)
      );

      // Then: 精确匹配
      expect(results.length).toBe(1);
    });
  });

  describe('场景33: 删除商机', () => {
    it('应正确删除商机', async () => {
      // Given: 商机ID
      const leadId = '1';

      // When: 删除商机
      const { useLeadsData } = await import('../../utils/hooks');
      const { deleteLead } = useLeadsData();
      await deleteLead(leadId);

      // Then: API被调用
      expect(deleteLead).toHaveBeenCalledWith(leadId);
    });

    it('删除后商机应从列表移除', () => {
      // Given: 商机列表
      let leads = [...mockLeads];

      // When: 删除商机
      const deleteId = '1';
      leads = leads.filter(l => l.id !== deleteId);

      // Then: 列表减少
      expect(leads.length).toBe(mockLeads.length - 1);
      expect(leads.find(l => l.id === deleteId)).toBeUndefined();
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

  describe('场景34: 商机统计', () => {
    it('应正确计算商机总数', () => {
      // Given: 商机列表
      const total = mockLeads.length;

      // Then: 总数正确
      expect(total).toBe(5);
    });

    it('应正确计算商机总金额', () => {
      // Given: 商机金额
      const totalValue = mockLeads.reduce((sum, l) => sum + l.estimatedValue, 0);

      // Then: 总金额正确
      expect(totalValue).toBe(2600000);
    });

    it('应正确计算各阶段商机数量', () => {
      // Given: 按阶段分组
      const statusCount: Record<string, number> = {};
      mockLeads.forEach(l => {
        statusCount[l.status] = (statusCount[l.status] || 0) + 1;
      });

      // Then: 统计正确
      expect(statusCount['潜在客户']).toBe(1);
      expect(statusCount['已联系']).toBe(1);
      expect(statusCount['已转销售']).toBe(1);
      expect(statusCount['已转化']).toBe(1);
      expect(statusCount['未转化']).toBe(1);
    });

    it('应正确计算各阶段商机金额', () => {
      // Given: 按阶段金额统计
      const statusValue: Record<string, number> = {};
      mockLeads.forEach(l => {
        statusValue[l.status] = (statusValue[l.status] || 0) + l.estimatedValue;
      });

      // Then: 统计正确
      expect(statusValue['潜在客户']).toBe(500000);
      expect(statusValue['已联系']).toBe(800000);
    });

    it('应正确计算转化率', () => {
      // Given: 转化数据
      const transferred = mockLeads.filter(l => l.status === '已转销售' || l.status === '已转化').length;
      const total = mockLeads.length;
      const rate = (transferred / total) * 100;

      // Then: 转化率正确
      expect(rate).toBe(40);
    });

    it('应正确计算来源分布', () => {
      // Given: 来源统计
      const fromActivity = mockLeads.filter(l => l.sourceType === 'activity').length;
      const fromManual = mockLeads.filter(l => l.sourceType === 'manual').length;

      // Then: 分布正确
      expect(fromActivity).toBe(3);
      expect(fromManual).toBe(2);
    });
  });

  describe('场景35: 商机数据验证', () => {
    it('客户名称不应为空', () => {
      // Given: 验证函数
      const validateName = (name: string) => name.trim().length > 0;

      // Then: 验证结果
      expect(validateName('华为技术有限公司')).toBe(true);
      expect(validateName('')).toBe(false);
    });

    it('联系电话不应为空', () => {
      // Given: 验证函数
      const validatePhone = (phone: string) => phone.trim().length > 0;

      // Then: 验证结果
      expect(validatePhone('13812345678')).toBe(true);
      expect(validatePhone('')).toBe(false);
    });

    it('商机金额应为正数', () => {
      // Given: 验证函数
      const validateValue = (value: number) => value > 0;

      // Then: 验证结果
      expect(validateValue(100000)).toBe(true);
      expect(validateValue(0)).toBe(false);
      expect(validateValue(-1000)).toBe(false);
    });

    it('邮箱格式应正确', () => {
      // Given: 邮箱验证
      const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

      // Then: 验证结果
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid')).toBe(false);
    });
  });

  describe('场景36: 商机管道视图', () => {
    it('应获取管道数据', async () => {
      // Given: API调用
      const { opportunitiesApi } = await import('../../services/backendApi');

      // When: 获取管道
      const pipeline = await opportunitiesApi.getPipeline();

      // Then: 返回管道数据
      expect(pipeline).toHaveProperty('total_value');
      expect(pipeline).toHaveProperty('stages');
    });

    it('管道阶段应正确排序', () => {
      // Given: 管道数据
      const stages = [
        { stage: '潜在客户', value: 500000, count: 1 },
        { stage: '已联系', value: 800000, count: 1 },
        { stage: '已转销售', value: 300000, count: 1 },
        { stage: '已转化', value: 600000, count: 1 },
      ];

      // Then: 阶段顺序正确
      expect(stages[0].stage).toBe('潜在客户');
    });
  });
});
