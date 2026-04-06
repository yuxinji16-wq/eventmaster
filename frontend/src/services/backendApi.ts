/**
 * 后端 API 服务
 * API 类型与后端 schema 保持一致（snake_case, number ID）
 * 通过 hooks.ts 中的 adapt 函数转换为前端类型
 */

// ============ API 类型定义（与后端一致）============

export interface ApiActivity {
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

export interface ApiMaterial {
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

export interface ApiSupplier {
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

export interface ApiSupplierReview {
  id: number;
  user: string;
  date: string;
  content: string;
  rating: number;
}

export interface ApiBillRecord {
  id: number;
  activity_name: string;
  project_name: string;
  date: string;
  status: string;
  amount: number;
}

export interface ApiSupplierDetail extends ApiSupplier {
  reviews: ApiSupplierReview[];
  bills: ApiBillRecord[];
}

export interface ApiOpportunity {
  id: number;
  client_name: string;
  activity_id: number;
  value: number;
  stage: string;
  probability: number;
  created_at: string;
  updated_at: string;
}

export interface ApiBudgetLog {
  id: number;
  activity_id: number;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  status: string;
  type: string;
  created_at: string;
}

export interface ApiWarehousingLog {
  id: number;
  material_id: number;
  material_name: string;
  count: number;
  operator: string;
  is_new_type: boolean;
  date: string;
  created_at: string;
}

export interface ApiWithdrawalLog {
  id: number;
  material_id: number;
  material_name: string;
  count: number;
  unit: string;
  user: string;
  reason: string;
  date: string;
  created_at: string;
}

export interface ApiDashboardStats {
  yearly_metrics: {
    total_activities: number;
    total_budget: number;
    total_leads: number;
    avg_roi: number;
  };
  monthly_trend: Array<{
    month: string;
    activities: number;
    budget: number;
    leads: number;
  }>;
  activity_distribution: Array<{
    category: string;
    count: number;
  }>;
}

export interface ApiBudgetOverview {
  yearly_quota: number;
  total_reimbursed: number;
  risk_projects: number;
  execution_rate: number;
  category_stats: Array<{
    category: string;
    budget: number;
    actual: number;
    rate: number;
  }>;
}

// ============ API Client ============

const API_BASE = 'http://localhost:8001/api';
const DEFAULT_TIMEOUT = 30000; // 30秒超时
const MAX_RETRIES = 3;

interface ApiError {
  message: string;
  status?: number;
  isNetworkError?: boolean;
  isTimeout?: boolean;
}

function createApiError(message: string, status?: number, isNetworkError = false, isTimeout = false): ApiError {
  return { message, status, isNetworkError, isTimeout };
}

export async function request<T>(endpoint: string, options: RequestInit = {}, retries = MAX_RETRIES): Promise<T> {
  const url = `${API_BASE}${endpoint}`;

  // 从 localStorage 获取 token
  const token = localStorage.getItem('auth_token');

  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  };

  // 创建超时控制器
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT);
  config.signal = controller.signal;

  let lastError: Error | ApiError | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        // 401  Unauthorized - 清除 token 并重定向到登录页
        if (response.status === 401) {
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
          throw createApiError('登录已过期，请重新登录', 401);
        }

        let errorMessage = `HTTP Error: ${response.status}`;
        try {
          const errorData = await response.json();
          // FastAPI 返回 { detail: "错误信息" } 格式
          if (errorData && typeof errorData === 'object') {
            errorMessage = errorData.detail || errorData.message || JSON.stringify(errorData);
          }
        } catch {
          // 解析失败，使用默认消息
          errorMessage = response.statusText || errorMessage;
        }
        const error = createApiError(errorMessage, response.status);
        console.error(`API Request Error (attempt ${attempt}/${retries}):`, error);
        throw error;
      }

      clearTimeout(timeoutId);
      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);

      // 检查是否是 ApiError 格式 { message, status, isNetworkError, isTimeout }
      if (error && typeof error === 'object' && 'message' in error) {
        const apiErr = error as ApiError;
        if (apiErr.isTimeout) {
          lastError = createApiError('请求超时，请检查网络连接', undefined, false, true);
        } else if (apiErr.isNetworkError) {
          lastError = createApiError('网络错误，请检查网络连接', undefined, true);
        } else {
          lastError = apiErr;
        }
        console.error(`API Error (attempt ${attempt}/${retries}):`, lastError);
      } else if (error instanceof Error) {
        if (error.name === 'AbortError') {
          lastError = createApiError('请求超时，请检查网络连接', undefined, false, true);
          console.error(`API Timeout (attempt ${attempt}/${retries}):`, lastError);
        } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
          lastError = createApiError('网络错误，请检查网络连接', undefined, true);
          console.error(`Network Error (attempt ${attempt}/${retries}):`, lastError);
        } else {
          lastError = createApiError(error.message);
          console.error(`API Error (attempt ${attempt}/${retries}):`, lastError);
        }
      } else {
        lastError = createApiError(String(error));
      }

      // 如果还有重试次数，等待后重试（指数退避）
      if (attempt < retries && (lastError.isNetworkError || lastError.isTimeout)) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    }
  }

  throw lastError || createApiError('请求失败');
}

// ============ 仪表盘 API ============

export const dashboardApi = {
  getStats: (year: string = '2024') =>
    request<ApiDashboardStats>(`/dashboard/stats?year=${year}`),
};

// ============ 活动 API ============

export const activitiesApi = {
  getList: (params?: { year?: string; category?: string; status?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ activities: ApiActivity[]; total: number }>(`/activities?${query}`);
  },
  getDetail: (id: number) => request<ApiActivity>(`/activities/${id}`),
  create: (data: Partial<ApiActivity>) =>
    request<ApiActivity>('/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<ApiActivity>) =>
    request<ApiActivity>(`/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<{ message: string }>(`/activities/${id}`, {
    method: 'DELETE',
  }),
  generateInsight: (id: number) =>
    request<{ insight: string }>(`/activities/${id}/generate-insight`, {
      method: 'POST',
      body: JSON.stringify({}),
    }),
};

// ============ 预算 API ============

export const budgetApi = {
  getOverview: (year: string) => request<ApiBudgetOverview>(`/budget/overview?year=${year}`),
  updateQuota: (data: { year: string; quota: number }) =>
    request<{ message: string }>(`/budget/quotas?year=${data.year}`, {
      method: 'PUT',
      body: JSON.stringify({ quota: data.quota }),
    }),
  getActivities: (year: string) =>
    request<{ activities: ApiActivity[]; total: number }>(`/budget/activities?year=${year}`),
  getLogs: (activityId: number) => request<ApiBudgetLog[]>(`/budget/logs?activity_id=${activityId}`),
  createLog: (data: Partial<ApiBudgetLog>) =>
    request<ApiBudgetLog>('/budget/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  analyze: (activityId: number) =>
    request<{ efficiency: number; cpl: number; roi: number }>(
      `/budget/analyze?activity_id=${activityId}`,
      { method: 'POST', body: JSON.stringify({}) }
    ),
};

// ============ 物料 API ============

export const materialsApi = {
  getList: (params?: { search?: string; category?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ materials: ApiMaterial[]; total: number }>(`/materials?${query}`);
  },
  getDetail: (id: number) => request<ApiMaterial>(`/materials/${id}`),
  create: (data: Partial<ApiMaterial>) =>
    request<ApiMaterial>('/materials', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<ApiMaterial>) =>
    request<ApiMaterial>(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<{ message: string }>(`/materials/${id}`, {
    method: 'DELETE',
  }),
  addStock: (
    id: number,
    data: { count: number; operator: string; is_new_type: boolean }
  ) =>
    request<{ message: string }>(`/materials/${id}/warehousing`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  withdraw: (
    id: number,
    data: { count: number; user: string; reason: string }
  ) =>
    request<{ message: string }>(`/materials/${id}/withdrawal`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getWarehousingLogs: () => request<ApiWarehousingLog[]>('/materials/warehousing-logs'),
  getWithdrawalLogs: () => request<ApiWithdrawalLog[]>('/materials/withdrawal-logs'),
};

// ============ 供应商 API ============

export const suppliersApi = {
  getList: (params?: { category?: string; search?: string }) => {
    const query = new URLSearchParams(params as Record<string, string>).toString();
    return request<{ suppliers: ApiSupplier[]; total: number }>(`/suppliers?${query}`);
  },
  getDetail: (id: number) => request<ApiSupplierDetail>(`/suppliers/${id}`),
  create: (data: Partial<ApiSupplier>) =>
    request<ApiSupplier>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<ApiSupplier>) =>
    request<ApiSupplier>(`/suppliers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<{ message: string }>(`/suppliers/${id}`, {
    method: 'DELETE',
  }),
  addReview: (id: number, data: { content: string; rating: number }) =>
    request<{ message: string }>(`/suppliers/${id}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  addBill: (
    id: number,
    data: {
      activity_name: string;
      project_name: string;
      amount: number;
      status: string;
      date: string;
    }
  ) =>
    request<{ message: string }>(`/suppliers/${id}/bills`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============ 商机 API ============

export const opportunitiesApi = {
  getList: (params?: { stage?: string; activity_id?: number; search?: string }) => {
    const query = new URLSearchParams(
      params as Record<string, string | number>
    ).toString();
    return request<{ opportunities: ApiOpportunity[]; total: number }>(
      `/opportunities?${query}`
    );
  },
  getPipeline: () =>
    request<{
      total_value: number;
      stages: Array<{ stage: string; value: number; count: number }>;
    }>('/opportunities/pipeline'),
  create: (data: Partial<ApiOpportunity>) =>
    request<ApiOpportunity>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: Partial<ApiOpportunity>) =>
    request<ApiOpportunity>(`/opportunities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  delete: (id: number) => request<{ message: string }>(`/opportunities/${id}`, {
    method: 'DELETE',
  }),
};

// ============ 复盘 API ============

export const reviewsApi = {
  getActivities: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<ApiActivity[]>(`/reviews/activities${query}`);
  },
  getSummary: (id: number) =>
    request<{
      budget_efficiency: number;
      cpl: number;
      roi: number;
    }>(`/reviews/${id}`),
  generateSummary: (id: number) =>
    request<{ summary: string; insight: string }>(
      `/reviews/${id}/generate-summary`,
      { method: 'POST', body: JSON.stringify({}) }
    ),
};

export default {
  dashboard: dashboardApi,
  activities: activitiesApi,
  budget: budgetApi,
  materials: materialsApi,
  suppliers: suppliersApi,
  opportunities: opportunitiesApi,
  reviews: reviewsApi,
};
