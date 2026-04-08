/**
 * API 兼容层 - 支持切换模拟数据和真实API
 */
import backendApi from './backendApi';

// 配置：是否使用真实API（默认从环境变量读取，开发环境使用模拟数据）
const USE_REAL_API = import.meta.env.VITE_USE_REAL_API === 'true';

// 模拟数据 - 使用深拷贝避免可变问题
const getMockData = () => ({
  activities: [
    {
      id: 1,
      name: '2024 全球科技峰会',
      date: '2024-03-15',
      year: '2024',
      location: '上海世博展览馆',
      type: 'Exhibition',
      category: '自办活动',
      budget: 500000,
      actual_spend: 485000,
      leads: 120,
      status: '已完成',
      description: '年度最大的品牌曝光活动。全球超过 500 家展商参展。',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: '华东区合作伙伴大会',
      date: '2024-06-20',
      year: '2024',
      location: '杭州滨江银泰喜来登酒店',
      type: 'Conference',
      category: '自办活动',
      budget: 200000,
      actual_spend: 12000,
      leads: 0,
      status: '待启动',
      description: '深耕区域渠道，发布 Q3 新政策。',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
  ],

  materials: [
    { id: 1, name: 'AI产品白皮书 2024版', category: '产品宣传册', type: '常规', stock: 450, unit: '本', status: 'In Stock', usage_count: 1200, last_updated: '2024-03-20 14:30', created_at: new Date().toISOString() },
  ],

  suppliers: [
    { id: 1, name: '上海禾松文化传播有限公司', service_type: '搭建', rating: 4.8, contact: '陈松', phone: '138-1234-5678', last_used: '2024-05-20', order_count: 2, tags: ['自有工厂', '工艺精湛'], bank_name: '中国工商银行上海市支行', bank_account: '6222 0000 0000 1234 567', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, name: '北京零点视觉设计中心', service_type: '设计', rating: 4.5, contact: '林悦', phone: '139-8888-9999', last_used: '2024-04-12', order_count: 0, tags: ['创意感强', '排版专业'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],

  opportunities: [
    { id: 1, client_name: '全球电子集团', activity_id: 1, value: 1200000, stage: '方案报价', probability: 60, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, client_name: '未来科技研究院', activity_id: 1, value: 800000, stage: '商务谈判', probability: 80, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ],

  budget_logs: [
    { id: 1, activity_id: 1, name: '展台物料运费', amount: 3500, category: '物流/运费', date: '2024-03-22', notes: '上海至拉斯维加斯空运', status: '已结清', type: 'expense', created_at: new Date().toISOString() },
  ],
});

// 每次调用创建新的数据副本
const createMockData = () => {
  const data = getMockData();
  return {
    activities: [...data.activities],
    materials: [...data.materials],
    suppliers: [...data.suppliers],
    opportunities: [...data.opportunities],
    budget_logs: [...data.budget_logs],
  };
};

// 类型定义
interface ListParams {
  year?: string;
  category?: string;
  status?: string;
}

interface CreateActivityData {
  name: string;
  date: string;
  location: string;
  type: string;
  category: string;
  budget: number;
  description?: string;
}

interface UpdateActivityData extends Partial<CreateActivityData> {
  status?: string;
  actual_spend?: number;
  leads?: number;
}

interface CreateMaterialData {
  name: string;
  category: string;
  type: string;
  stock: number;
  unit: string;
}

interface CreateSupplierData {
  name: string;
  service_type: string;
  contact: string;
  phone: string;
  tags?: string[];
}

interface CreateOpportunityData {
  client_name: string;
  activity_id: number;
  value: number;
  stage: string;
  probability: number;
}

interface CreateBudgetLogData {
  activity_id: number;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  status: string;
  type: string;
}

// API 兼容层
export const apiCompatible = {
  // 活动管理
  activities: {
    getList: async (params?: ListParams) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        return { activities: mockData.activities, total: mockData.activities.length };
      }
      return backendApi.activities.getList(params);
    },
    getDetail: async (id: number) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const activity = mockData.activities.find(a => a.id === id);
        if (!activity) throw new Error('活动不存在');
        return activity;
      }
      return backendApi.activities.getDetail(id);
    },
    create: async (data: CreateActivityData) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const newActivity = {
          ...data,
          id: Date.now(),
          year: data.date.split('-')[0],
          actual_spend: 0,
          leads: 0,
          status: '待启动',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockData.activities.unshift(newActivity);
        return newActivity;
      }
      return backendApi.activities.create(data);
    },
    update: async (id: number, data: UpdateActivityData) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const index = mockData.activities.findIndex(a => a.id === id);
        if (index === -1) throw new Error('活动不存在');
        mockData.activities[index] = {
          ...mockData.activities[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        return mockData.activities[index];
      }
      return backendApi.activities.update(id, data);
    },
    delete: async (id: number) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const index = mockData.activities.findIndex(a => a.id === id);
        if (index !== -1) mockData.activities.splice(index, 1);
        return { message: '删除成功' };
      }
      return backendApi.activities.delete(id);
    },
    generateInsight: async (id: number) => {
      if (!USE_REAL_API) {
        return { insight: '这是模拟的AI洞察结果...' };
      }
      return backendApi.activities.generateInsight(id);
    },
  },

  // 物料管理
  materials: {
    getList: async (params?: ListParams) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        return {
          materials: mockData.materials,
          total: mockData.materials.length,
          categories: ['产品宣传册', '易拉宝', '会议定制', '礼品', '办公用品', '其他']
        };
      }
      return backendApi.materials.getList(params);
    },
    create: async (data: CreateMaterialData) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const newMaterial = {
          ...data,
          id: Date.now(),
          status: data.stock > 0 ? 'In Stock' : 'Out of Stock',
          usage_count: 0,
          created_at: new Date().toISOString()
        };
        mockData.materials.unshift(newMaterial);
        return newMaterial;
      }
      return backendApi.materials.create(data);
    },
    delete: async (id: number) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const index = mockData.materials.findIndex(m => m.id === id);
        if (index !== -1) mockData.materials.splice(index, 1);
        return { message: '删除成功' };
      }
      return backendApi.materials.delete(id);
    },
    addStock: async (id: number, data: { count: number; operator: string }) => {
      if (!USE_REAL_API) {
        return {
          id: Date.now(),
          material_id: id,
          count: data.count,
          operator: data.operator,
          date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
      }
      return backendApi.materials.addStock(id, data);
    },
    withdraw: async (id: number, data: { count: number; user: string; reason: string }) => {
      if (!USE_REAL_API) {
        return {
          id: Date.now(),
          material_id: id,
          count: data.count,
          user: data.user,
          reason: data.reason,
          date: new Date().toISOString(),
          created_at: new Date().toISOString()
        };
      }
      return backendApi.materials.withdraw(id, data);
    },
  },

  // 供应商管理
  suppliers: {
    getList: async (params?: ListParams) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        return { suppliers: mockData.suppliers, total: mockData.suppliers.length };
      }
      return backendApi.suppliers.getList(params);
    },
    getDetail: async (id: number) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const supplier = mockData.suppliers.find(s => s.id === id);
        if (!supplier) throw new Error('供应商不存在');
        return { ...supplier, reviews: [], bills: [] };
      }
      return backendApi.suppliers.getDetail(id);
    },
    create: async (data: CreateSupplierData) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const newSupplier = {
          ...data,
          id: Date.now(),
          order_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockData.suppliers.unshift(newSupplier);
        return newSupplier;
      }
      return backendApi.suppliers.create(data);
    },
    update: async (id: number, data: Partial<CreateSupplierData>) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const index = mockData.suppliers.findIndex(s => s.id === id);
        if (index === -1) throw new Error('供应商不存在');
        mockData.suppliers[index] = {
          ...mockData.suppliers[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        return mockData.suppliers[index];
      }
      return backendApi.suppliers.update(id, data);
    },
    delete: async (id: number) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const index = mockData.suppliers.findIndex(s => s.id === id);
        if (index !== -1) mockData.suppliers.splice(index, 1);
        return { message: '删除成功' };
      }
      return backendApi.suppliers.delete(id);
    },
    addReview: async (id: number, data: { rating: number; comment: string }) => {
      if (!USE_REAL_API) {
        return {
          id: Date.now(),
          supplier_id: id,
          user: '市场部负责人',
          date: new Date().toISOString().split('T')[0],
          ...data,
          created_at: new Date().toISOString()
        };
      }
      return backendApi.suppliers.addReview(id, data);
    },
    addBill: async (id: number, data: { amount: number; date: string; notes?: string }) => {
      if (!USE_REAL_API) {
        return {
          id: Date.now(),
          supplier_id: id,
          ...data,
          created_at: new Date().toISOString()
        };
      }
      return backendApi.suppliers.addBill(id, data);
    },
  },

  // 商机管理
  opportunities: {
    getList: async (params?: ListParams) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        return {
          opportunities: mockData.opportunities,
          total: mockData.opportunities.length,
          total_value: mockData.opportunities.reduce((sum, o) => sum + o.value, 0),
          stats: {}
        };
      }
      return backendApi.opportunities.getList(params);
    },
    create: async (data: CreateOpportunityData) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const newOpp = {
          ...data,
          id: Date.now(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        mockData.opportunities.unshift(newOpp);
        return newOpp;
      }
      return backendApi.opportunities.create(data);
    },
    update: async (id: number, data: Partial<CreateOpportunityData>) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const index = mockData.opportunities.findIndex(o => o.id === id);
        if (index === -1) throw new Error('商机不存在');
        mockData.opportunities[index] = {
          ...mockData.opportunities[index],
          ...data,
          updated_at: new Date().toISOString()
        };
        return mockData.opportunities[index];
      }
      return backendApi.opportunities.update(id, data);
    },
    delete: async (id: number) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const index = mockData.opportunities.findIndex(o => o.id === id);
        if (index !== -1) mockData.opportunities.splice(index, 1);
        return { message: '删除成功' };
      }
      return backendApi.opportunities.delete(id);
    },
    getPipeline: async () => {
      if (!USE_REAL_API) {
        return { total_value: 2000000, stages: [], conversion_rates: [] };
      }
      return backendApi.opportunities.getPipeline();
    },
  },

  // 预算管理
  budget: {
    getOverview: async (year: string) => {
      if (!USE_REAL_API) {
        return {
          yearly_quota: 2500000,
          total_reimbursed: 497000,
          risk_projects: 0,
          execution_rate: 19.9,
          category_stats: []
        };
      }
      return backendApi.budget.getOverview(year);
    },
    getActivities: async (year: string) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        return { activities: mockData.activities, total: mockData.activities.length };
      }
      return backendApi.budget.getActivities(year);
    },
    getLogs: async (activityId: number) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        return mockData.budget_logs.filter(l => l.activity_id === activityId);
      }
      return backendApi.budget.getLogs(activityId);
    },
    createLog: async (data: CreateBudgetLogData) => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        const newLog = { ...data, id: Date.now(), created_at: new Date().toISOString() };
        mockData.budget_logs.unshift(newLog);
        return newLog;
      }
      return backendApi.budget.createLog(data);
    },
    analyze: async (activityId: number) => {
      if (!USE_REAL_API) {
        return { insight: '模拟分析结果', risk_level: 'low', recommendations: [] };
      }
      return backendApi.budget.analyze(activityId);
    },
  },

  // 复盘管理
  reviews: {
    getActivities: async () => {
      if (!USE_REAL_API) {
        const mockData = createMockData();
        return mockData.activities.filter(a => a.status === '已完成');
      }
      return backendApi.reviews.getActivities('已完成');
    },
    getSummary: async (id: number) => {
      if (!USE_REAL_API) {
        return { budget_efficiency: 97, cpl: 4042, roi: 3.2 };
      }
      return backendApi.reviews.getSummary(id);
    },
    generateSummary: async (id: number) => {
      if (!USE_REAL_API) {
        return { activity_id: id, insight: '模拟复盘结果' };
      }
      return backendApi.reviews.generateSummary(id);
    },
  },

  // 仪表盘
  dashboard: {
    getStats: async (year: string) => {
      if (!USE_REAL_API) {
        return {
          yearly_metrics: { year, budget: 250, leads: 850, roi: 3.9, completion: 78 },
          monthly_trend: [
            { month: '1月', budget: 120, leads: 350 },
            { month: '2月', budget: 80, leads: 180 },
            { month: '3月', budget: 520, leads: 780 },
            { month: '4月', budget: 280, leads: 420 },
            { month: '5月', budget: 410, leads: 590 },
            { month: '6月', budget: 220, leads: 310 },
          ],
          activity_distribution: [
            { type: '展会', count: 6, percentage: 30, color: '#6366f1' },
            { type: '研讨会', count: 10, percentage: 50, color: '#8b5cf6' },
            { type: '路演', count: 3, percentage: 15, color: '#ec4899' },
            { type: '峰会', count: 2, percentage: 10, color: '#10b981' },
          ],
        };
      }
      return backendApi.dashboard.getStats(year);
    },
  },
};

export default apiCompatible;
