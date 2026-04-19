/**
 * API Data Hooks
 * 从后端API读取和操作数据
 */
import { useState, useEffect, useCallback } from 'react';
import {
  activitiesApi, materialsApi, suppliersApi,
  opportunitiesApi, budgetApi, reviewsApi,
  ApiActivity, ApiMaterial,
  ApiSupplier, ApiOpportunity,
  ApiBudgetLog,
  ApiReview, ApiReviewFeedback, ApiReviewConclusion,
  ApiReviewAvgScores, ApiGenerateSummaryResponse
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
    imageUrl: apiMaterial.image_url,
  };
}

// Supplier 适配器（适用于 ApiSupplier 和 ApiSupplierDetail）
export function adaptSupplier(apiSupplier: ApiSupplier & { reviews?: any[]; bills?: any[]; attachments?: any[] }): Supplier {
  return {
    id: String(apiSupplier.id),
    name: apiSupplier.name,
    serviceType: (apiSupplier.category || apiSupplier.service_type || '其他') as any,
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
    field: apiOpp.field || '',
    position: apiOpp.position || '',
    company: apiOpp.company || '',
    contact: apiOpp.contact || '',
    contactName: apiOpp.contact_person || apiOpp.contact || '',
    phone: apiOpp.phone || '',
    email: apiOpp.email || '',
    requirement: apiOpp.requirement || '',
    contactPerson: apiOpp.contact_person || '',
    estimatedValue: apiOpp.estimated_value || 0,
    status: apiOpp.status || '潜在客户',
    createDate: apiOpp.create_date || new Date().toISOString().split('T')[0],
    expectedCloseDate: apiOpp.expected_close_date || '',
    activityId: apiOpp.activity_id ? String(apiOpp.activity_id) : undefined,
    notes: apiOpp.notes || '',
    sourceType: (apiOpp.source_type || 'manual') as any,
    sourceName: apiOpp.source_name || '自主录入',
    region: apiOpp.region || '',
    owner: apiOpp.owner || '',
    leadLevel: (apiOpp.lead_level || '待评估') as any,
    evaluationNote: apiOpp.evaluation_note || '',
    transferredToSales: apiOpp.transferred_to_sales === 'true',
    transferredAt: apiOpp.transferred_at,
    converted: apiOpp.converted === 'true',
    conversionStatus: apiOpp.conversion_status as any,
    conversionAt: apiOpp.conversion_at,
    resultNote: apiOpp.result_note,
    createdAt: apiOpp.created_at || new Date().toISOString(),
  };
}

// BudgetLog 适配器
export function adaptBudgetLog(apiLog: ApiBudgetLog): BudgetLog {
  return {
    id: String(apiLog.id),
    name: apiLog.name,
    activityId: String(apiLog.activity_id),
    amount: apiLog.amount,
    plannedAmount: apiLog.planned_amount || 0,
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
      const adapted = response.map(adaptActivity);
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
      const adapted = response.map(adaptMaterial);
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
        image_url: data.imageUrl,
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
      if (data.imageUrl !== undefined) apiData.image_url = data.imageUrl;
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
      const adapted = response.map(adaptSupplier);
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
      const category = data.serviceType || '其他';
      const apiData = {
        name: data.name || '',
        category,
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
      // 直接使用我们发送的category，因为API响应可能字段名不一致
      const adapted: Supplier = {
        id: String(newSupplier.id),
        name: newSupplier.name,
        serviceType: (newSupplier.category || category) as any,
        rating: newSupplier.rating,
        contact: newSupplier.contact,
        phone: newSupplier.phone,
        email: newSupplier.email,
        address: newSupplier.address,
        lastUsed: newSupplier.last_used || new Date().toISOString().split('T')[0],
        tags: newSupplier.tags || [],
        orderCount: newSupplier.order_count || 0,
        bankName: newSupplier.bank_name,
        bankAccount: newSupplier.bank_account,
        reviews: [],
        bills: [],
        attachments: [],
        created_at: newSupplier.created_at,
        updated_at: newSupplier.updated_at,
      };
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
      if (data.serviceType !== undefined) apiData.category = data.serviceType;
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

  const addReview = useCallback(async (id: number, data: { reviewer_name?: string; content: string; rating: number }) => {
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
      const adapted = response.map(adaptOpportunity);
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
      const apiData: Record<string, any> = {
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
      // 添加新字段
      if (data.field) apiData.field = data.field;
      if (data.position) apiData.position = data.position;
      if (data.requirement) apiData.requirement = data.requirement;
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
      setActivitiesWithBudget(Array.isArray(data) ? data : data.activities);
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

  const updateLog = useCallback(async (logId: string, data: Partial<BudgetLog>) => {
    try {
      const apiData = {
        name: data.name,
        activity_id: tryParseId(data.activityId),
        amount: data.amount,
        category: data.category,
        date: data.date,
        notes: data.notes,
        status: data.status,
        type: data.type,
      };
      const updatedLog = await budgetApi.updateLog(tryParseId(logId) || 0, apiData);
      return adaptBudgetLog(updatedLog);
    } catch (err) {
      console.error('Failed to update budget log:', err);
      throw err;
    }
  }, []);

  const deleteLog = useCallback(async (logId: string) => {
    try {
      return await budgetApi.deleteLog(tryParseId(logId) || 0);
    } catch (err) {
      console.error('Failed to delete budget log:', err);
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
    createLog,
    updateLog,
    deleteLog
  };
}

/**
 * 复盘数据 Hook
 * 合并所有活动与复盘数据，确保复盘中心显示所有活动
 */
export function useReviewsData() {
  const [reviewActivities, setReviewActivities] = useState<any[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviewActivities = useCallback(async (status?: string) => {
    setLoading(true);
    setError(null);
    try {
      // 并行获取复盘活动和所有活动
      const [reviewData, activitiesData] = await Promise.all([
        reviewsApi.getActivities(status),
        activitiesApi.getList(),
      ]);
      const reviews = reviewData || [];
      const activities = activitiesData;

      setAllActivities(activities);

      // 合并活动与复盘数据：所有活动都应出现在复盘中心
      const merged = activities.map(activity => {
        // 确保 activityId 类型一致（后端返回数字，前端活动ID是字符串）
        const review = reviews.find((r: any) =>
          String(r.activity_id ?? r.activityId) === String(activity.id)
        );
        if (review) {
          return {
            id: review.id || review.review_id,
            activityId: activity.id,
            activityName: activity.name,
            activityDate: activity.date,
            status: review.status || '未开始',
            created_at: review.created_at,
            feedbacks: review.feedbacks || [],
            conclusion: review.conclusion,
            expectedParticipants: review.expected_participants || 0,
            participantCount: review.participant_count || 0,
            leadCount: review.lead_count || activity.leads || 0,
          };
        }
        // 活动没有复盘记录，根据活动状态显示复盘状态
        let reviewStatus = '未开始';
        if (activity.status === '进行中') {
          reviewStatus = '进行中';
        } else if (activity.status === '已完成' || activity.status === '复盘中') {
          reviewStatus = '待开始';
        }
        return {
          id: null,
          activityId: activity.id,
          activityName: activity.name,
          activityDate: activity.date,
          status: reviewStatus,
          created_at: activity.created_at,
          feedbacks: [],
          conclusion: null,
          expectedParticipants: 0,
          participantCount: activity.leads || 0,
          leadCount: activity.leads || 0,
        };
      });

      setReviewActivities(merged);
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

  // 创建复盘（当活动开始时自动创建）
  const createReviewForActivity = useCallback(async (activityId: string) => {
    try {
      const numericId = parseInt(activityId);
      const newReview = await reviewsApi.createReview({
        activity_id: numericId,
        status: '进行中',
        expected_participants: 0,
      });
      // 刷新数据
      await fetchReviewActivities();
      return newReview;
    } catch (err) {
      console.error('Failed to create review:', err);
      throw err;
    }
  }, [fetchReviewActivities]);

  // 更新复盘状态
  const updateReviewStatus = useCallback(async (reviewId: number, newStatus: string) => {
    try {
      await reviewsApi.updateReview(reviewId, { status: newStatus });
      await fetchReviewActivities();
    } catch (err) {
      console.error('Failed to update review status:', err);
      throw err;
    }
  }, [fetchReviewActivities]);

  return {
    reviewActivities,
    allActivities,
    loading,
    error,
    fetchReviewActivities,
    generateSummary,
    createReviewForActivity,
    updateReviewStatus,
  };
}

/**
 * 活动任务数据 Hook（本地状态管理）
 * 用于活动详情页的任务管理
 */
export function useActivityTasks(initialTasks: any[] = []) {
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [loading, setLoading] = useState(false);

  // 添加任务
  const addTask = useCallback(async (taskData: {
    name: string;
    description?: string;
    assignee: string;
    dueDate: string;
    priority: 'P0' | 'P1' | 'P2';
  }) => {
    const newTask = {
      id: `task-${Date.now()}`,
      name: taskData.name,
      description: taskData.description || '',
      assignee: taskData.assignee,
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      status: '未开始' as const,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    return newTask;
  }, []);

  // 更新任务
  const updateTask = useCallback(async (taskId: string, updates: Partial<{
    name: string;
    description: string;
    assignee: string;
    dueDate: string;
    priority: 'P0' | 'P1' | 'P2';
    status: '未开始' | '进行中' | '已完成' | '阻塞';
  }>) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return { ...task, ...updates };
      }
      return task;
    }));
  }, []);

  // 完成任务
  const completeTask = useCallback(async (taskId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === taskId) {
        return {
          ...task,
          status: '已完成' as const,
          completedAt: new Date().toISOString()
        };
      }
      return task;
    }));
  }, []);

  // 删除任务
  const deleteTask = useCallback(async (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  }, []);

  // 获取未完成的任务（按优先级和截止日期排序）
  const pendingTasks = tasks
    .filter(t => t.status !== '已完成')
    .sort((a, b) => {
      const priorityOrder = { P0: 0, P1: 1, P2: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });

  // 获取延期任务
  const overdueTasks = tasks.filter(t => {
    if (t.status === '已完成') return false;
    return new Date(t.dueDate) < new Date();
  });

  // 获取P0未完成任务
  const p0PendingTasks = pendingTasks.filter(t => t.priority === 'P0');

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    completeTask,
    deleteTask,
    pendingTasks,
    overdueTasks,
    p0PendingTasks,
  };
}

/**
 * 复盘数据 Hook
 * 用于活动详情页的复盘管理
 */
export function useReviewData(activityId: string) {
  const [review, setReview] = useState<ApiReview | null>(null);
  const [feedbacks, setFeedbacks] = useState<ApiReviewFeedback[]>([]);
  const [conclusion, setConclusion] = useState<ApiReviewConclusion | null>(null);
  const [avgScores, setAvgScores] = useState<ApiReviewAvgScores | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericActivityId = tryParseId(activityId);

  // 加载复盘数据
  const loadReview = useCallback(async () => {
    if (!numericActivityId) return;
    setLoading(true);
    setError(null);
    try {
      // 先获取该活动的复盘（返回数组）
      const reviewList = await reviewsApi.getReview(numericActivityId).catch(() => null);

      // 如果有复盘记录
      if (reviewList && Array.isArray(reviewList) && reviewList.length > 0) {
        const reviewData = reviewList[0];
        setReview(reviewData);
        const reviewId = reviewData.id;

        // 获取反馈列表
        const fbList = await reviewsApi.getFeedbacks(reviewId);
        setFeedbacks(fbList || []);

        // 获取平均分
        try {
          const scores = await reviewsApi.getAvgScores(reviewId);
          setAvgScores(scores);
        } catch { setAvgScores(null); }

        // 获取结论
        try {
          const concl = await reviewsApi.getConclusion(reviewId);
          setConclusion(concl);
        } catch { setConclusion(null); }
      } else {
        // 没有复盘记录
        setReview(null);
        setFeedbacks([]);
        setConclusion(null);
        setAvgScores(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '加载复盘失败');
    } finally {
      setLoading(false);
    }
  }, [numericActivityId]);

  useEffect(() => {
    if (numericActivityId) {
      loadReview();
    }
  }, [numericActivityId, loadReview]);

  // 创建复盘
  const createReview = useCallback(async (expectedParticipants: number = 0) => {
    if (!numericActivityId) return null;
    try {
      const newReview = await reviewsApi.createReview({
        activity_id: numericActivityId,
        status: '进行中',
        expected_participants: expectedParticipants,
      });
      setReview(newReview);
      return newReview;
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建复盘失败');
      throw err;
    }
  }, [numericActivityId]);

  // 添加反馈
  const addFeedback = useCallback(async (data: {
    evaluator_id: string;
    evaluator_name: string;
    evaluator_role?: string;
    goal_score: number;
    lead_quality_score: number;
    execution_score: number;
    resource_score: number;
    brand_score: number;
    successes?: string;
    problems?: string;
    suggestions?: string;
    tags?: string[];
  }) => {
    let currentReviewId = review?.id;
    if (!currentReviewId) {
      // 如果还没有复盘，先创建
      const newReview = await createReview();
      if (!newReview) throw new Error('创建复盘失败');
      currentReviewId = newReview.id;
    }
    try {
      const feedback = await reviewsApi.createFeedback({
        ...data,
        review_id: currentReviewId,
      });
      setFeedbacks(prev => [...prev, feedback]);
      // 刷新平均分
      try {
        const scores = await reviewsApi.getAvgScores(currentReviewId);
        setAvgScores(scores);
      } catch { /* ignore */ }
      return feedback;
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加反馈失败');
      throw err;
    }
  }, [review, createReview]);

  // 更新反馈
  const updateFeedback = useCallback(async (feedbackId: number, data: Partial<ApiReviewFeedback>) => {
    try {
      const updated = await reviewsApi.updateFeedback(feedbackId, data);
      setFeedbacks(prev => prev.map(fb => fb.id === feedbackId ? updated : fb));
      // 刷新平均分
      if (review?.id) {
        try {
          const scores = await reviewsApi.getAvgScores(review.id);
          setAvgScores(scores);
        } catch { /* ignore */ }
      }
      return updated;
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新反馈失败');
      throw err;
    }
  }, [review]);

  // 提交反馈
  const submitFeedback = useCallback(async (feedbackId: number) => {
    try {
      const submitted = await reviewsApi.submitFeedback(feedbackId);
      setFeedbacks(prev => prev.map(fb => fb.id === feedbackId ? submitted : fb));
      return submitted;
    } catch (err) {
      setError(err instanceof Error ? err.message : '提交反馈失败');
      throw err;
    }
  }, []);

  // 生成AI摘要
  const generateAiSummary = useCallback(async () => {
    if (!review?.id) return null;
    try {
      const result = await reviewsApi.generateSummary(review.id);
      // 保存结论
      try {
        const concl = await reviewsApi.createConclusion({
          review_id: review.id,
          ai_summary: result.summary,
        });
        setConclusion(concl);
      } catch { /* 可能已存在 */ }
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成AI摘要失败');
      throw err;
    }
  }, [review]);

  return {
    review,
    feedbacks,
    conclusion,
    avgScores,
    loading,
    error,
    loadReview,
    createReview,
    addFeedback,
    updateFeedback,
    submitFeedback,
    generateAiSummary,
  };
}

// ============ 商机线索管理（API驱动）============

/**
 * 统一商机线索 Hook
 * 数据完全来自后端 API
 */
export function useLeadsData() {
  const [leads, setLeads] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载商机列表
  const fetchLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await opportunitiesApi.getList();
      const adapted = response.map((opp: ApiOpportunity) => ({
        id: String(opp.id),
        clientName: opp.client_name || '',
        company: opp.company || '',
        contact: opp.contact || '',
        contactName: opp.contact_person || opp.contact || '',
        phone: opp.phone || '',
        email: opp.email || '',
        field: opp.field || '',
        position: opp.position || '',
        requirement: opp.requirement || '',
        contactPerson: opp.contact_person || '',
        estimatedValue: opp.estimated_value || 0,
        status: (opp.status || '未跟进') as any,
        createDate: opp.create_date || new Date().toISOString().split('T')[0],
        expectedCloseDate: opp.expected_close_date || '',
        activityId: opp.activity_id ? String(opp.activity_id) : undefined,
        notes: opp.notes || '',
        createdAt: opp.created_at || new Date().toISOString(),
        // 来源信息
        sourceType: (opp.source_type || 'manual') as any,
        sourceName: opp.source_name || '自主录入',
        // 销售分配
        region: opp.region || '',
        owner: opp.owner || '',
        // 线索等级（默认待评估）
        leadLevel: (opp.lead_level || '待评估') as any,
        evaluationNote: opp.evaluation_note || '',
        transferredToSales: opp.transferred_to_sales === 'true',
        transferredAt: opp.transferred_at,
        converted: opp.converted === 'true',
        conversionStatus: opp.conversion_status as any,
        conversionAt: opp.conversion_at,
        resultNote: opp.result_note,
      }));
      setLeads(adapted);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取商机列表失败');
      console.error('Failed to fetch opportunities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始化加载
  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // 添加商机
  const addLead = useCallback(async (data: Omit<Opportunity, 'id' | 'createdAt'>) => {
    try {
      const apiData = {
        client_name: data.clientName || '',
        company: data.company || '',
        contact: data.contact || '',
        phone: data.phone || '',
        email: data.email || '',
        field: data.field || '',
        position: data.position || '',
        requirement: data.requirement || '',
        contact_person: data.contactPerson || '',
        estimated_value: data.estimatedValue || 0,
        status: data.status || '未跟进',
        create_date: data.createDate || new Date().toISOString().split('T')[0],
        expected_close_date: data.expectedCloseDate || '',
        activity_id: data.activityId ? parseInt(data.activityId, 10) : undefined,
        notes: data.notes || '',
        // 来源信息
        source_type: data.sourceType || 'manual',
        source_name: data.sourceName || '自主录入',
        // 销售分配
        region: data.region || '',
        owner: data.owner || '',
        lead_level: data.leadLevel || '待评估',
        evaluation_note: data.evaluationNote || '',
        transferred_to_sales: data.transferredToSales ? 'true' : 'false',
        transferred_at: data.transferredAt || '',
        converted: data.converted ? 'true' : 'false',
        conversion_status: data.conversionStatus || '',
        conversion_at: data.conversionAt || '',
        result_note: data.resultNote || '',
      };
      const newOpp = await opportunitiesApi.create(apiData);
      const adapted: Opportunity = {
        id: String(newOpp.id),
        clientName: newOpp.client_name || '',
        company: newOpp.company || '',
        contact: newOpp.contact || '',
        contactName: newOpp.contact_person || newOpp.contact || '',
        phone: newOpp.phone || '',
        email: newOpp.email || '',
        field: newOpp.field || '',
        position: newOpp.position || '',
        requirement: newOpp.requirement || '',
        contactPerson: newOpp.contact_person || '',
        estimatedValue: newOpp.estimated_value || 0,
        status: (newOpp.status || '未跟进') as any,
        createDate: newOpp.create_date || new Date().toISOString().split('T')[0],
        expectedCloseDate: newOpp.expected_close_date || '',
        activityId: newOpp.activity_id ? String(newOpp.activity_id) : undefined,
        notes: newOpp.notes || '',
        createdAt: newOpp.created_at || new Date().toISOString(),
        // 来源信息
        sourceType: (newOpp.source_type || 'manual') as any,
        sourceName: newOpp.source_name || '自主录入',
        // 销售分配
        region: newOpp.region || '',
        owner: newOpp.owner || '',
        // 线索等级
        leadLevel: (newOpp.lead_level || '待评估') as any,
        evaluationNote: newOpp.evaluation_note || '',
        transferredToSales: newOpp.transferred_to_sales === 'true',
        transferredAt: newOpp.transferred_at,
        converted: newOpp.converted === 'true',
        conversionStatus: newOpp.conversion_status as any,
        conversionAt: newOpp.conversion_at,
        resultNote: newOpp.result_note,
      };
      setLeads(prev => [adapted, ...prev]);
      return adapted;
    } catch (err) {
      console.error('Failed to create opportunity:', err);
      throw err;
    }
  }, []);

  // 更新商机
  const updateLead = useCallback(async (id: string, data: Partial<Opportunity>) => {
    try {
      const apiData: Record<string, unknown> = {};
      if (data.clientName !== undefined) apiData.client_name = data.clientName;
      if (data.company !== undefined) apiData.company = data.company;
      if (data.contact !== undefined) apiData.contact = data.contact;
      if (data.contactName !== undefined) apiData.contact_person = data.contactName;
      if (data.phone !== undefined) apiData.phone = data.phone;
      if (data.email !== undefined) apiData.email = data.email;
      if (data.field !== undefined) apiData.field = data.field;
      if (data.position !== undefined) apiData.position = data.position;
      if (data.requirement !== undefined) apiData.requirement = data.requirement;
      if (data.contactPerson !== undefined) apiData.contact_person = data.contactPerson;
      if (data.estimatedValue !== undefined) apiData.estimated_value = data.estimatedValue;
      if (data.status !== undefined) apiData.status = data.status;
      if (data.expectedCloseDate !== undefined) apiData.expected_close_date = data.expectedCloseDate;
      if (data.activityId !== undefined) apiData.activity_id = parseInt(data.activityId, 10);
      if (data.notes !== undefined) apiData.notes = data.notes;
      // 来源信息
      if (data.sourceType !== undefined) apiData.source_type = data.sourceType;
      if (data.sourceName !== undefined) apiData.source_name = data.sourceName;
      // 销售分配
      if (data.region !== undefined) apiData.region = data.region;
      if (data.owner !== undefined) apiData.owner = data.owner;
      if (data.leadLevel !== undefined) apiData.lead_level = data.leadLevel;
      if (data.evaluationNote !== undefined) apiData.evaluation_note = data.evaluationNote;
      if (data.transferredToSales !== undefined) apiData.transferred_to_sales = data.transferredToSales ? 'true' : 'false';
      if (data.transferredAt !== undefined) apiData.transferred_at = data.transferredAt || '';
      if (data.converted !== undefined) apiData.converted = data.converted ? 'true' : 'false';
      if (data.conversionStatus !== undefined) apiData.conversion_status = data.conversionStatus || '';
      if (data.conversionAt !== undefined) apiData.conversion_at = data.conversionAt || '';
      if (data.resultNote !== undefined) apiData.result_note = data.resultNote || '';

      await opportunitiesApi.update(parseInt(id, 10), apiData);
      setLeads(prev => prev.map(lead =>
        lead.id === id ? { ...lead, ...data } : lead
      ));
    } catch (err) {
      console.error('Failed to update opportunity:', err);
      throw err;
    }
  }, []);

  // 删除商机
  const deleteLead = useCallback(async (id: string) => {
    try {
      await opportunitiesApi.delete(parseInt(id, 10));
      setLeads(prev => prev.filter(lead => lead.id !== id));
    } catch (err) {
      console.error('Failed to delete opportunity:', err);
      throw err;
    }
  }, []);

  // 按活动ID获取线索
  const getLeadsByActivity = useCallback((activityId: string) => {
    return leads.filter(lead => lead.activityId === activityId);
  }, [leads]);

  // 按来源类型获取线索
  const getLeadsBySource = useCallback((_sourceType: 'activity' | 'manual') => {
    return leads;
  }, [leads]);

  // 搜索线索
  const searchLeads = useCallback((keyword: string) => {
    const lowerKeyword = keyword.toLowerCase();
    return leads.filter(lead =>
      lead.clientName.toLowerCase().includes(lowerKeyword) ||
      (lead.contactName || '').toLowerCase().includes(lowerKeyword) ||
      (lead.contact || '').toLowerCase().includes(lowerKeyword) ||
      (lead.phone || '').includes(keyword) ||
      (lead.requirement || '').toLowerCase().includes(lowerKeyword)
    );
  }, [leads]);

  return {
    leads,
    loading,
    error,
    addLead,
    updateLead,
    deleteLead,
    getLeadsByActivity,
    getLeadsBySource,
    searchLeads,
    refreshLeads: fetchLeads,
  };
}

// 保留兼容函数（废弃）
export function getAllLeads(): Opportunity[] {
  console.warn('getAllLeads is deprecated, use useLeadsData hook instead');
  return [];
}

export function clearAllLeads(): void {
  console.warn('clearAllLeads is deprecated, use opportunitiesApi instead');
}
