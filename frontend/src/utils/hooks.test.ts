/**
 * API类型和适配器测试
 */
import { describe, it, expect } from 'vitest';

// 导入后端API类型（用于测试类型适配）
interface ApiActivity {
  id: number;
  name: string;
  date: string;
  year: string;
  location?: string;
  type: string;
  category: string;
  industry?: string;
  budget: number;
  actual_spend: number;
  leads: number;
  status: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

interface ApiMaterial {
  id: number;
  name: string;
  category: string;
  type: string;
  stock: number;
  unit: string;
  status: string;
  usage_count: number;
  last_updated: string;
  created_at: string;
}

interface ApiSupplier {
  id: number;
  name: string;
  service_type: string;
  rating: number;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
  bank_name?: string;
  bank_account?: string;
  last_used?: string;
  order_count: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

interface ApiOpportunity {
  id: number;
  client_name: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  value: number;
  stage: string;
  activity_id?: number;
  expected_close_date?: string;
  created_at: string;
  updated_at: string;
}

// 模拟适配器函数（与hooks.ts中相同）
function adaptActivity(apiActivity: ApiActivity) {
  return {
    id: String(apiActivity.id),
    name: apiActivity.name,
    date: apiActivity.date,
    year: apiActivity.year,
    location: apiActivity.location,
    type: apiActivity.type,
    category: apiActivity.category,
    industry: apiActivity.industry,
    budget: apiActivity.budget,
    actualSpend: apiActivity.actual_spend,
    leads: apiActivity.leads,
    status: (apiActivity.status || '待启动'),
    description: apiActivity.description || '',
  };
}

function adaptMaterial(apiMaterial: ApiMaterial) {
  let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
  if (apiMaterial.stock === 0) status = 'Out of Stock';
  else if (apiMaterial.stock < 10) status = 'Low Stock';

  return {
    id: String(apiMaterial.id),
    name: apiMaterial.name,
    category: apiMaterial.category,
    type: (apiMaterial.type || '常规'),
    stock: apiMaterial.stock,
    unit: apiMaterial.unit,
    status,
    usageCount: apiMaterial.usage_count || 0,
    lastUpdated: apiMaterial.last_updated || new Date().toISOString(),
  };
}

function adaptSupplier(apiSupplier: ApiSupplier) {
  return {
    id: String(apiSupplier.id),
    name: apiSupplier.name,
    serviceType: (apiSupplier.service_type || '其他'),
    rating: apiSupplier.rating,
    contact: apiSupplier.contact,
    phone: apiSupplier.phone,
    email: apiSupplier.email,
    address: apiSupplier.address,
    lastUsed: apiSupplier.last_used || new Date().toISOString().split('T')[0],
    tags: apiSupplier.tags || [],
    orderCount: apiSupplier.order_count || 0,
    bankName: apiSupplier.bank_name,
    bankAccount: apiSupplier.bank_account,
    reviews: [],
    bills: [],
    attachments: [],
  };
}

function adaptOpportunity(apiOpp: ApiOpportunity) {
  return {
    id: String(apiOpp.id),
    clientName: apiOpp.client_name || apiOpp.company || '',
    company: apiOpp.company || '',
    contact: apiOpp.contact || '',
    phone: apiOpp.phone || '',
    email: apiOpp.email || '',
    requirement: '',
    contactPerson: '',
    estimatedValue: apiOpp.value || 0,
    status: apiOpp.stage || '中意向',
    createDate: apiOpp.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    expectedCloseDate: apiOpp.expected_close_date || '',
    activityId: apiOpp.activity_id ? String(apiOpp.activity_id) : undefined,
    notes: '',
  };
}

describe('API类型适配器', () => {
  describe('adaptActivity', () => {
    it('应正确转换后端活动数据到前端格式', () => {
      const apiActivity: ApiActivity = {
        id: 1,
        name: '测试活动',
        date: '2024-03-15',
        year: '2024',
        location: '北京',
        type: 'Conference',
        category: '自办活动',
        industry: '科技',
        budget: 100000,
        actual_spend: 80000,
        leads: 50,
        status: '已完成',
        description: '这是一个测试活动',
        created_at: '2024-03-01T10:00:00Z',
        updated_at: '2024-03-15T18:00:00Z',
      };

      const result = adaptActivity(apiActivity);

      expect(result.id).toBe('1');
      expect(result.name).toBe('测试活动');
      expect(result.date).toBe('2024-03-15');
      expect(result.year).toBe('2024');
      expect(result.budget).toBe(100000);
      expect(result.actualSpend).toBe(80000);
      expect(result.leads).toBe(50);
      expect(result.status).toBe('已完成');
      expect(result.description).toBe('这是一个测试活动');
    });

    it('应处理缺失的可选字段', () => {
      const apiActivity: ApiActivity = {
        id: 2,
        name: '最小活动',
        date: '2024-04-01',
        year: '2024',
        type: 'Exhibition',
        category: '外部市场活动',
        budget: 50000,
        actual_spend: 0,
        leads: 0,
        status: '待启动',
        created_at: '2024-04-01T00:00:00Z',
        updated_at: '2024-04-01T00:00:00Z',
      };

      const result = adaptActivity(apiActivity);

      expect(result.id).toBe('2');
      expect(result.location).toBeUndefined();
      expect(result.industry).toBeUndefined();
      expect(result.description).toBe('');
      expect(result.status).toBe('待启动');
    });
  });

  describe('adaptMaterial', () => {
    it('应正确转换后端物料数据到前端格式', () => {
      const apiMaterial: ApiMaterial = {
        id: 1,
        name: '产品手册',
        category: '宣传册',
        type: '常规',
        stock: 100,
        unit: '本',
        status: 'In Stock',
        usage_count: 50,
        last_updated: '2024-03-20T12:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
      };

      const result = adaptMaterial(apiMaterial);

      expect(result.id).toBe('1');
      expect(result.name).toBe('产品手册');
      expect(result.category).toBe('宣传册');
      expect(result.stock).toBe(100);
      expect(result.status).toBe('In Stock');
      expect(result.usageCount).toBe(50);
    });

    it('应根据库存数量正确设置状态', () => {
      const lowStockMaterial: ApiMaterial = {
        id: 2,
        name: '低库存物料',
        category: '礼品',
        type: '定制',
        stock: 5,
        unit: '个',
        status: 'In Stock',
        usage_count: 0,
        last_updated: '2024-03-20T12:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
      };

      const outOfStockMaterial: ApiMaterial = {
        id: 3,
        name: '缺货物料',
        category: '办公用品',
        type: '常规',
        stock: 0,
        unit: '套',
        status: 'In Stock',
        usage_count: 100,
        last_updated: '2024-03-20T12:00:00Z',
        created_at: '2024-01-01T00:00:00Z',
      };

      expect(adaptMaterial(lowStockMaterial).status).toBe('Low Stock');
      expect(adaptMaterial(outOfStockMaterial).status).toBe('Out of Stock');
    });
  });

  describe('adaptSupplier', () => {
    it('应正确转换后端供应商数据到前端格式', () => {
      const apiSupplier: ApiSupplier = {
        id: 1,
        name: '测试供应商',
        service_type: '搭建',
        rating: 4.5,
        contact: '张三',
        phone: '13800138000',
        email: 'test@supplier.com',
        address: '北京市朝阳区',
        bank_name: '中国银行',
        bank_account: '1234567890',
        last_used: '2024-03-15',
        order_count: 10,
        tags: ['自有工厂', '高配合度'],
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-03-15T12:00:00Z',
      };

      const result = adaptSupplier(apiSupplier);

      expect(result.id).toBe('1');
      expect(result.name).toBe('测试供应商');
      expect(result.serviceType).toBe('搭建');
      expect(result.rating).toBe(4.5);
      expect(result.contact).toBe('张三');
      expect(result.phone).toBe('13800138000');
      expect(result.tags).toEqual(['自有工厂', '高配合度']);
      expect(result.orderCount).toBe(10);
    });
  });

  describe('adaptOpportunity', () => {
    it('应正确转换后端商机数据到前端格式', () => {
      const apiOpp: ApiOpportunity = {
        id: 1,
        client_name: '李四',
        company: '测试公司',
        contact: '李四',
        phone: '13900139000',
        email: 'li@company.com',
        value: 500000,
        stage: '高意向',
        activity_id: 1,
        expected_close_date: '2024-06-30',
        created_at: '2024-03-01T10:00:00Z',
        updated_at: '2024-03-15T18:00:00Z',
      };

      const result = adaptOpportunity(apiOpp);

      expect(result.id).toBe('1');
      expect(result.clientName).toBe('李四');
      expect(result.company).toBe('测试公司');
      expect(result.estimatedValue).toBe(500000);
      expect(result.status).toBe('高意向');
      expect(result.activityId).toBe('1');
      expect(result.expectedCloseDate).toBe('2024-06-30');
    });

    it('应处理client_name为空的情况', () => {
      const apiOpp: ApiOpportunity = {
        id: 2,
        client_name: '',
        company: '仅有公司名',
        contact: '王五',
        phone: '13700137000',
        email: 'wang@company.com',
        value: 100000,
        stage: '中意向',
        created_at: '2024-03-01T10:00:00Z',
        updated_at: '2024-03-15T18:00:00Z',
      };

      const result = adaptOpportunity(apiOpp);

      expect(result.clientName).toBe('仅有公司名');
    });
  });
});
