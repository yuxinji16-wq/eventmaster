/**
 * API Data Hooks
 * 从后端API读取和操作数据
 */
import { useState, useEffect, useCallback } from 'react';
import {
  activitiesApi, materialsApi, suppliersApi,
  opportunitiesApi, budgetApi, reviewsApi,
  Activity as ApiActivity, Material as ApiMaterial,
  Supplier as ApiSupplier, Opportunity as ApiOpportunity, BudgetLog as ApiBudgetLog
} from '../services/backendApi';
import {
  Activity, Material, Supplier, Opportunity, BudgetLog,
  ActivityStatus, BudgetStatus
} from '../types';

/**
 * 安全解析字符串 ID 为数字
 * @throws 如果 ID 无效（空字符串、非数字等）
 */
function parseId(id: string): number {
  if (!id || typeof id !== 'string') {
    throw new Error(`Invalid ID: ${id}`);
  }
  const parsed = parseInt(id.trim(), 10);
  if (isNaN(parsed)) {
    throw new Error(`Invalid ID format: ${id}`);
  }
  return parsed;
}

/**
 * 安全解析字符串 ID 为数字，如果无效返回 undefined
 */
function tryParseId(id: string): number | undefined {
  if (!id || typeof id !== 'string') {
    return undefined;
  }
  const parsed = parseInt(id.trim(), 10);
  return isNaN(parsed) ? undefined : parsed;
}

/**
 * API响应类型适配器
 * 将后端snake_case转换为前端camelCase
 */

// Activity 适配器
export function adaptActivity(apiActivity: ApiActivity): Activity {
  return {
    id: String(apiActivity.id),
    name: apiActivity.name,
    date: apiActivity.date,
    year: apiActivity.year,
    location: apiActivity.location,
    type: apiActivity.type as any,
    category: apiActivity.category as any,
    industry: apiActivity.industry,
    budget: apiActivity.budget,
    actualSpend: apiActivity.actual_spend,
    leads: apiActivity.leads,
    status: (apiActivity.status || '待启动') as ActivityStatus,
    description: apiActivity.description || '',
  };
}

// Material 适配器
export function adaptMaterial(apiMaterial: ApiMaterial): Material {
  let status: 'In Stock' | 'Low Stock' | 'Out of Stock' = 'In Stock';
  if (apiMaterial.stock === 0) status = 'Out of Stock';
  else if (apiMaterial.stock < 10) status = 'Low Stock';

  return {
    id: String(apiMaterial.id),
    name: apiMaterial.name,
    category: apiMaterial.category as any,
    type: (apiMaterial.type || '常规') as any,
    stock: apiMaterial.stock,
    unit: apiMaterial.unit,
    status,
    usageCount: apiMaterial.usage_count || 0,
    lastUpdated: apiMaterial.last_updated || new Date().toISOString(),
  };
}

// Supplier 适配器（适用于 ApiSupplier 和 ApiSupplierDetail）
export function adaptSupplier(apiSupplier: ApiSupplier & { reviews?: any[]; bills?: any[]; attachments?: any[] }): Supplier {
  return {
    id: String(apiSupplier.id),
    name: apiSupplier.name,
    serviceType: (apiSupplier.service_type || '其他') as any,
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
    reviews: (apiSupplier.reviews || []) as any,
    bills: (apiSupplier.bills || []) as any,
    attachments: (apiSupplier.attachments || []) as any,
  };
}

// Opportunity 适配器
export function adaptOpportunity(apiOpp: ApiOpportunity): Opportunity {
  return {
    id: String(apiOpp.id),
    clientName: apiOpp.client_name || '',
    company: '',
    contact: '',
    phone: '',
    email: '',
    requirement: '',
    contactPerson: '',
    estimatedValue: apiOpp.value || 0,
    status: apiOpp.stage || '中意向',
    createDate: apiOpp.created_at?.split('T')[0] || new Date().toISOString().split('T')[0],
    expectedCloseDate: '',
    activityId: apiOpp.activity_id ? String(apiOpp.activity_id) : undefined,
    notes: '',
  };
}

// BudgetLog 适配器
export function adaptBudgetLog(apiLog: ApiBudgetLog): BudgetLog {
  return {
    id: String(apiLog.id),
    name: apiLog.name,
    activityId: String(apiLog.activity_id),
    amount: apiLog.amount,
    category: apiLog.category as any,
    date: apiLog.date,
    notes: apiLog.notes || '',
    status: (apiLog.status || '待结算') as '已结清' | '待结算',
    type: (apiLog.type || 'expense') as 'expense' | 'income',
  };
}

/**
 * 活动数据 Hook
 */
export function useActivitiesData() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchActivities = useCallback(async (params?: { year?: string; status?: string; search?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await activitiesApi.getList(params);
      const data = Array.isArray(response) ? response : response.activities || [];
      const adapted = data.map(adaptActivity);
      setActivities(adapted);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取活动列表失败');
      console.error('Failed to fetch activities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const addActivity = useCallback(async (data: Partial<Activity>) => {
    try {
      const apiData = {
        name: data.name || '',
        date: data.date || '',
        year: data.year || new Date().getFullYear().toString(),
        location: data.location,
        type: data.type || 'Conference',
        category: data.category || '自办活动',
        industry: data.industry,
        budget: data.budget || 0,
        actual_spend: data.actualSpend || 0,
        leads: data.leads || 0,
        status: data.status || '待启动',
        description: data.description,
      };
      const newActivity = await activitiesApi.create(apiData);
      const adapted = adaptActivity(newActivity);
      setActivities(prev => [adapted, ...prev]);
      return adapted;
    } catch (err) {
      console.error('Failed to create activity:', err);
      throw err;
    }
  }, []);

  const updateActivity = useCallback(async (id: number, data: Partial<Activity>) => {
    try {
      const apiData: Record<string, any> = {};
      if (data.name !== undefined) apiData.name = data.name;
      if (data.date !== undefined) apiData.date = data.date;
      if (data.year !== undefined) apiData.year = data.year;
      if (data.location !== undefined) apiData.location = data.location;
      if (data.type !== undefined) apiData.type = data.type;
      if (data.category !== undefined) apiData.category = data.category;
      if (data.industry !== undefined) apiData.industry = data.industry;
      if (data.budget !== undefined) apiData.budget = data.budget;
      if (data.actualSpend !== undefined) apiData.actual_spend = data.actualSpend;
      if (data.leads !== undefined) apiData.leads = data.leads;
      if (data.status !== undefined) apiData.status = data.status;
      if (data.description !== undefined) apiData.description = data.description;

      const updated = await activitiesApi.update(id, apiData);
      const adapted = adaptActivity(updated);
      setActivities(prev => prev.map(a => a.id === String(id) ? adapted : a));
      return adapted;
    } catch (err) {
      console.error('Failed to update activity:', err);
      throw err;
    }
  }, []);

  const deleteActivity = useCallback(async (id: number) => {
    try {
      await activitiesApi.delete(id);
      setActivities(prev => prev.filter(a => a.id !== String(id)));
    } catch (err) {
      console.error('Failed to delete activity:', err);
      throw err;
    }
  }, []);

  return {
    activities,
    loading,
    error,
    fetchActivities,
    addActivity,
    updateActivity,
    deleteActivity
  };
}

/**
 * 物料数据 Hook
 */
export function useMaterialsData() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMaterials = useCallback(async (params?: { search?: string; category?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await materialsApi.getList(params);
      const data = Array.isArray(response) ? response : response.materials || response.data || [];
      const adapted = data.map(adaptMaterial);
      setMaterials(adapted);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取物料列表失败');
      console.error('Failed to fetch materials:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const addMaterial = useCallback(async (data: Partial<Material>) => {
    try {
      const apiData = {
        name: data.name || '',
        category: data.category || '其他',
        type: data.type || '常规',
        stock: data.stock || 0,
        unit: data.unit || '个',
        status: data.status || 'In Stock',
        usage_count: data.usageCount || 0,
        last_updated: data.lastUpdated || new Date().toISOString(),
      };
      const newMaterial = await materialsApi.create(apiData);
      const adapted = adaptMaterial(newMaterial);
      setMaterials(prev => [adapted, ...prev]);
      return adapted;
    } catch (err) {
      console.error('Failed to create material:', err);
      throw err;
    }
  }, []);

  const updateMaterial = useCallback(async (id: number, data: Partial<Material>) => {
    try {
      const apiData: Record<string, any> = {};
      if (data.name !== undefined) apiData.name = data.name;
      if (data.category !== undefined) apiData.category = data.category;
      if (data.type !== undefined) apiData.type = data.type;
      if (data.stock !== undefined) apiData.stock = data.stock;
      if (data.unit !== undefined) apiData.unit = data.unit;
      if (data.usageCount !== undefined) apiData.usage_count = data.usageCount;
      if (data.lastUpdated !== undefined) apiData.last_updated = data.lastUpdated;

      const updated = await materialsApi.update(id, apiData);
      const adapted = adaptMaterial(updated);
      setMaterials(prev => prev.map(m => m.id === String(id) ? adapted : m));
      return adapted;
    } catch (err) {
      console.error('Failed to update material:', err);
      throw err;
    }
  }, []);

  const deleteMaterial = useCallback(async (id: number) => {
    try {
      await materialsApi.delete(id);
      setMaterials(prev => prev.filter(m => m.id !== String(id)));
    } catch (err) {
      console.error('Failed to delete material:', err);
      throw err;
    }
  }, []);

  const addStock = useCallback(async (id: number, count: number, operator: string, is_new_type: boolean) => {
    try {
      await materialsApi.addStock(id, { count, operator, is_new_type });
      await fetchMaterials();
    } catch (err) {
      console.error('Failed to add stock:', err);
      throw err;
    }
  }, [fetchMaterials]);

  const withdraw = useCallback(async (id: number, count: number, user: string, reason: string) => {
    try {
      await materialsApi.withdraw(id, { count, user, reason });
      await fetchMaterials();
    } catch (err) {
      console.error('Failed to withdraw:', err);
      throw err;
    }
  }, [fetchMaterials]);

  return {
    materials,
    loading,
    error,
    fetchMaterials,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addStock,
    withdraw
  };
}

/**
 * 供应商数据 Hook
 */
export function useSuppliersData() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = useCallback(async (params?: { category?: string; search?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await suppliersApi.getList(params);
      const data = Array.isArray(response) ? response : response.suppliers || response.data || [];
      const adapted = data.map(adaptSupplier);
      setSuppliers(adapted);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取供应商列表失败');
      console.error('Failed to fetch suppliers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const addSupplier = useCallback(async (data: Partial<Supplier>) => {
    try {
      const apiData = {
        name: data.name || '',
        service_type: data.serviceType || '其他',
        rating: data.rating || 5,
        contact: data.contact || '',
        phone: data.phone || '',
        email: data.email,
        address: data.address,
        bank_name: data.bankName,
        bank_account: data.bankAccount,
        tags: data.tags,
      };
      const newSupplier = await suppliersApi.create(apiData);
      const adapted = adaptSupplier(newSupplier);
      setSuppliers(prev => [adapted, ...prev]);
      return adapted;
    } catch (err) {
      console.error('Failed to create supplier:', err);
      throw err;
    }
  }, []);

  const updateSupplier = useCallback(async (id: number, data: Partial<Supplier>) => {
    try {
      const apiData: Record<string, any> = {};
      if (data.name !== undefined) apiData.name = data.name;
      if (data.serviceType !== undefined) apiData.service_type = data.serviceType;
      if (data.rating !== undefined) apiData.rating = data.rating;
      if (data.contact !== undefined) apiData.contact = data.contact;
      if (data.phone !== undefined) apiData.phone = data.phone;
      if (data.email !== undefined) apiData.email = data.email;
      if (data.address !== undefined) apiData.address = data.address;
      if (data.bankName !== undefined) apiData.bank_name = data.bankName;
      if (data.bankAccount !== undefined) apiData.bank_account = data.bankAccount;
      if (data.tags !== undefined) apiData.tags = data.tags;

      const updated = await suppliersApi.update(id, apiData);
      const adapted = adaptSupplier(updated);
      setSuppliers(prev => prev.map(s => s.id === String(id) ? adapted : s));
      return adapted;
    } catch (err) {
      console.error('Failed to update supplier:', err);
      throw err;
    }
  }, []);

  const deleteSupplier = useCallback(async (id: number) => {
    try {
      await suppliersApi.delete(id);
      setSuppliers(prev => prev.filter(s => s.id !== String(id)));
    } catch (err) {
      console.error('Failed to delete supplier:', err);
      throw err;
    }
  }, []);

  const addReview = useCallback(async (id: number, data: { content: string; rating: number }) => {
    try {
      await suppliersApi.addReview(id, data);
      // 重新获取供应商详情以更新评价列表
      const detail = await suppliersApi.getDetail(id);
      const adapted = adaptSupplier(detail);
      setSuppliers(prev => prev.map(s => s.id === String(id) ? adapted : s));
      return adapted;
    } catch (err) {
      console.error('Failed to add review:', err);
      throw err;
    }
  }, []);

  const addBill = useCallback(async (
    id: number,
    data: { activityName: string; projectName: string; amount: number; status: string; date: string }
  ) => {
    try {
      await suppliersApi.addBill(id, {
        activity_name: data.activityName,
        project_name: data.projectName,
        amount: data.amount,
        status: data.status,
        date: data.date,
      });
      // 重新获取供应商详情以更新账单列表
      const detail = await suppliersApi.getDetail(id);
      const adapted = adaptSupplier(detail);
      setSuppliers(prev => prev.map(s => s.id === String(id) ? adapted : s));
      return adapted;
    } catch (err) {
      console.error('Failed to add bill:', err);
      throw err;
    }
  }, []);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addReview,
    addBill
  };
}

/**
 * 商机数据 Hook
 */
export function useOpportunitiesData() {
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOpportunities = useCallback(async (params?: { stage?: string; activity_id?: number; search?: string }) => {
    setLoading(true);
    setError(null);
    try {
      const response = await opportunitiesApi.getList(params);
      const data = Array.isArray(response) ? response : response.opportunities || response.data || [];
      const adapted = data.map(adaptOpportunity);
      setOpportunities(adapted);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取商机列表失败');
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const addOpportunity = useCallback(async (data: Partial<Opportunity>) => {
    try {
      const apiData = {
        client_name: data.clientName || '',
        company: data.company || '',
        contact: data.contact || '',
        phone: data.phone || '',
        email: data.email || '',
        value: data.estimatedValue || 0,
        stage: data.status || '中意向',
        activity_id: tryParseId(data.activityId || ''),
        expected_close_date: data.expectedCloseDate,
      };
      const newOpp = await opportunitiesApi.create(apiData);
      const adapted = adaptOpportunity(newOpp);
      setOpportunities(prev => [adapted, ...prev]);
      return adapted;
    } catch (err) {
      console.error('Failed to create opportunity:', err);
      throw err;
    }
  }, []);

  const updateOpportunity = useCallback(async (id: number, data: Partial<Opportunity>) => {
    try {
      const apiData: Record<string, any> = {};
      if (data.clientName !== undefined) apiData.client_name = data.clientName;
      if (data.company !== undefined) apiData.company = data.company;
      if (data.contact !== undefined) apiData.contact = data.contact;
      if (data.phone !== undefined) apiData.phone = data.phone;
      if (data.email !== undefined) apiData.email = data.email;
      if (data.estimatedValue !== undefined) apiData.value = data.estimatedValue;
      if (data.status !== undefined) apiData.stage = data.status;
      if (data.activityId !== undefined) apiData.activity_id = tryParseId(data.activityId);
      if (data.expectedCloseDate !== undefined) apiData.expected_close_date = data.expectedCloseDate;

      const updated = await opportunitiesApi.update(id, apiData);
      const adapted = adaptOpportunity(updated);
      setOpportunities(prev => prev.map(o => o.id === String(id) ? adapted : o));
      return adapted;
    } catch (err) {
      console.error('Failed to update opportunity:', err);
      throw err;
    }
  }, []);

  const deleteOpportunity = useCallback(async (id: number) => {
    try {
      await opportunitiesApi.delete(id);
      setOpportunities(prev => prev.filter(o => o.id !== String(id)));
    } catch (err) {
      console.error('Failed to delete opportunity:', err);
      throw err;
    }
  }, []);

  return {
    opportunities,
    loading,
    error,
    fetchOpportunities,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity
  };
}

/**
 * 预算数据 Hook
 */
export function useBudgetData() {
  const [overview, setOverview] = useState<any>(null);
  const [activitiesWithBudget, setActivitiesWithBudget] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgetOverview = useCallback(async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await budgetApi.getOverview(year);
      setOverview(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取预算概览失败');
      console.error('Failed to fetch budget overview:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivitiesWithBudget = useCallback(async (year: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await budgetApi.getActivities(year);
      setActivitiesWithBudget(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取活动预算失败');
      console.error('Failed to fetch activities with budget:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateQuota = useCallback(async (year: string, quota: number) => {
    try {
      const result = await budgetApi.updateQuota({ year, quota });
      await fetchBudgetOverview(year);
      return result;
    } catch (err) {
      console.error('Failed to update quota:', err);
      throw err;
    }
  }, [fetchBudgetOverview]);

  const getLogs = useCallback(async (activityId: number): Promise<BudgetLog[]> => {
    try {
      const logs = await budgetApi.getLogs(activityId);
      return logs.map(adaptBudgetLog);
    } catch (err) {
      console.error('Failed to get budget logs:', err);
      throw err;
    }
  }, []);

  const createLog = useCallback(async (data: Partial<BudgetLog>) => {
    try {
      const apiData = {
        name: data.name || '',
        activity_id: tryParseId(data.activityId) || 0,
        amount: data.amount || 0,
        category: data.category || '其他',
        date: data.date || '',
        notes: data.notes,
        status: data.status || '待结算',
        type: data.type || 'expense',
      };
      const newLog = await budgetApi.createLog(apiData);
      return adaptBudgetLog(newLog);
    } catch (err) {
      console.error('Failed to create budget log:', err);
      throw err;
    }
  }, []);

  return {
    overview,
    activitiesWithBudget,
    loading,
    error,
    fetchBudgetOverview,
    fetchActivitiesWithBudget,
    updateQuota,
    getLogs,
    createLog
  };
}

/**
 * 复盘数据 Hook
 */
export function useReviewsData() {
  const [reviewActivities, setReviewActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewActivities = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await reviewsApi.getActivities(status);
      setReviewActivities(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取复盘活动失败');
      console.error('Failed to fetch review activities:', err);
      setReviewActivities([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviewActivities();
  }, [fetchReviewActivities]);

  const generateSummary = useCallback(async (reviewId: number) => {
    try {
      return await reviewsApi.generateSummary(reviewId);
    } catch (err) {
      console.error('Failed to generate summary:', err);
      throw err;
    }
  }, []);

  // 更新复盘数据（包括添加反馈、删除反馈、更新状态等）
  const updateReview = useCallback((reviewId: string, updates: any) => {
    setReviewActivities(prev => prev.map(review => {
      if (review.id === reviewId) {
        return { ...review, ...updates };
      }
      return review;
    }));
  }, []);

  return {
    reviewActivities,
    loading,
    error,
    fetchReviewActivities,
    generateSummary,
    updateReview
  };
}
