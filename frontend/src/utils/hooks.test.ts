/**
 * API 类型和真实适配器测试
 */
import { describe, expect, it } from 'vitest';
import type {
  ApiActivity,
  ApiBudgetLog,
  ApiMaterial,
  ApiOpportunity,
  ApiSupplier,
} from '../services/backendApi';
import {
  adaptActivity,
  adaptBudgetLog,
  adaptMaterial,
  adaptOpportunity,
  adaptSupplier,
} from './hooks';

describe('API 类型适配器', () => {
  describe('adaptActivity', () => {
    it('将后端活动数据转换为前端格式', () => {
      const apiActivity: ApiActivity = {
        id: 1,
        name: '测试活动',
        date: '2026-03-15',
        year: '2026',
        location: '北京',
        type: 'Conference',
        category: '自办活动',
        industry: '科技',
        budget: 100000,
        actual_spend: 80000,
        leads: 50,
        status: '已完成',
        description: '这是一个测试活动',
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-15T18:00:00Z',
      };

      const result = adaptActivity(apiActivity);

      expect(result).toMatchObject({
        id: '1',
        name: '测试活动',
        date: '2026-03-15',
        year: '2026',
        budget: 100000,
        actualSpend: 80000,
        leads: 50,
        status: '已完成',
        description: '这是一个测试活动',
      });
    });

    it('为空描述和状态提供默认值', () => {
      const apiActivity: ApiActivity = {
        id: 2,
        name: '最小活动',
        date: '2026-04-01',
        year: '2026',
        type: 'Exhibition',
        category: '外部市场活动',
        budget: 50000,
        actual_spend: 0,
        leads: 0,
        status: '',
        created_at: '2026-04-01T00:00:00Z',
        updated_at: '2026-04-01T00:00:00Z',
      };

      const result = adaptActivity(apiActivity);

      expect(result.description).toBe('');
      expect(result.status).toBe('待启动');
    });
  });

  describe('adaptMaterial', () => {
    const baseMaterial: ApiMaterial = {
      id: 1,
      name: '产品手册',
      category: '宣传册',
      type: '常规',
      stock: 100,
      unit: '本',
      status: 'In Stock',
      usage_count: 50,
      last_updated: '2026-03-20T12:00:00Z',
      created_at: '2026-01-01T00:00:00Z',
    };

    it('将后端物料数据转换为前端格式', () => {
      const result = adaptMaterial(baseMaterial);

      expect(result).toMatchObject({
        id: '1',
        name: '产品手册',
        category: '宣传册',
        stock: 100,
        status: 'In Stock',
        usageCount: 50,
      });
    });

    it('按库存数量计算库存状态', () => {
      expect(adaptMaterial({ ...baseMaterial, id: 2, stock: 5 }).status).toBe('Low Stock');
      expect(adaptMaterial({ ...baseMaterial, id: 3, stock: 0 }).status).toBe('Out of Stock');
    });
  });

  describe('adaptSupplier', () => {
    it('将后端供应商数据转换为前端格式', () => {
      const apiSupplier: ApiSupplier = {
        id: 1,
        name: '测试供应商',
        category: '搭建',
        rating: 4.5,
        contact: '张三',
        phone: '13800138000',
        email: 'test@supplier.com',
        address: '北京市朝阳区',
        bank_name: '中国银行',
        bank_account: '1234567890',
        last_used: '2026-03-15',
        order_count: 10,
        tags: ['自有工厂', '高配合度'],
        created_at: '2026-01-01T00:00:00Z',
        updated_at: '2026-03-15T12:00:00Z',
      };

      const result = adaptSupplier(apiSupplier);

      expect(result).toMatchObject({
        id: '1',
        name: '测试供应商',
        serviceType: '搭建',
        rating: 4.5,
        contact: '张三',
        phone: '13800138000',
        tags: ['自有工厂', '高配合度'],
        orderCount: 10,
        bankName: '中国银行',
        bankAccount: '1234567890',
      });
    });
  });

  describe('adaptOpportunity', () => {
    it('将当前后端商机字段转换为前端格式', () => {
      const apiOpp: ApiOpportunity = {
        id: 1,
        client_name: '李四',
        company: '测试公司',
        contact: '李四',
        phone: '13900139000',
        email: 'li@company.com',
        requirement: '需要活动策划',
        contact_person: '王经理',
        estimated_value: 500000,
        status: '高意向',
        create_date: '2026-03-01',
        expected_close_date: '2026-06-30',
        activity_id: 1,
        notes: '重点跟进',
        field: '医疗',
        position: '市场总监',
        created_at: '2026-03-01T10:00:00Z',
        updated_at: '2026-03-15T18:00:00Z',
      };

      const result = adaptOpportunity(apiOpp);

      expect(result).toMatchObject({
        id: '1',
        clientName: '李四',
        company: '测试公司',
        field: '医疗',
        position: '市场总监',
        requirement: '需要活动策划',
        contactPerson: '王经理',
        estimatedValue: 500000,
        status: '高意向',
        createDate: '2026-03-01',
        activityId: '1',
        notes: '重点跟进',
      });
    });
  });

  describe('adaptBudgetLog', () => {
    it('将后端预算日志转换为前端格式', () => {
      const apiLog: ApiBudgetLog = {
        id: 9,
        activity_id: 3,
        name: '场地费',
        amount: 12000,
        category: '场地',
        date: '2026-04-19',
        notes: '预付款',
        status: '待结算',
        type: 'expense',
        created_at: '2026-04-19T10:00:00Z',
      };

      const result = adaptBudgetLog(apiLog);

      expect(result).toMatchObject({
        id: '9',
        activityId: '3',
        name: '场地费',
        amount: 12000,
        status: '待结算',
        type: 'expense',
      });
    });
  });
});
