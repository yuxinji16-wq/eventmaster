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
  // 外部活动信息
  external_event_info?: any;
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
  image_url?: string;
  location?: string;
  created_at: string;
}

type MaterialPayload = Partial<ApiMaterial> & {
  usageCount?: number;
  lastUpdated?: string;
  imageUrl?: string;
};

export interface ApiSupplier {
  id: number;
  name: string;
  category: string;
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
  company?: string;
  contact?: string;
  phone?: string;
  email?: string;
  requirement?: string;
  contact_person?: string;
  estimated_value: number;
  status: string;
  create_date?: string;
  expected_close_date?: string;
  activity_id?: number;
  notes?: string;
  field?: string;
  position?: string;
  created_at: string;
  updated_at: string;
  // 来源信息
  source_type?: string;  // activity=活动获取, manual=自主录入
  source_name?: string;  // 活动名称或"自主录入"
  // 销售分配
  region?: string;  // 所属区域
  owner?: string;  // 对接人
  lead_level?: string;
  evaluation_note?: string;
  transferred_to_sales?: string;
  transferred_at?: string;
  converted?: string;
  conversion_status?: string;
  conversion_at?: string;
  result_note?: string;
}

export interface ApiBudgetLog {
  id: number;
  activity_id: number;
  name: string;
  amount: number;
  planned_amount?: number;
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
  activity_id?: number;
  status?: string;
  returned_at?: string;
  return_count?: number;
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

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api').replace(/\/$/, '');
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

type QueryValue = string | number | boolean | null | undefined;

function buildQuery(
  params?: Record<string, QueryValue>,
  aliases: Record<string, string> = {}
): string {
  const query = new URLSearchParams();

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return;
    query.set(aliases[key] || key, String(value));
  });

  return query.toString();
}

function withQuery(endpoint: string, query: string): string {
  return query ? `${endpoint}?${query}` : endpoint;
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
        // 401 Unauthorized - 清除 token 并重定向到登录页
        // 但如果是登录请求失败（无 token 时收到 401），不重定向，让调用方处理错误
        if (response.status === 401) {
          const existingToken = localStorage.getItem('auth_token');
          if (existingToken) {
            // 有 token 但 401，说明是会话过期
            localStorage.removeItem('auth_token');
            // 只有不在登录页面时才重定向
            if (!window.location.pathname.includes('/login')) {
              window.location.href = '/login';
            }
            throw createApiError('登录已过期，请重新登录', 401);
          }
          // 无 token 时收到 401，说明是登录失败，解析错误消息后抛出
          let errorMessage = '登录失败';
          try {
            const errorData = await response.json();
            errorMessage = errorData?.detail || errorData?.message || errorMessage;
          } catch {
            // 解析失败
          }
          throw createApiError(errorMessage, 401);
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
    const query = buildQuery(params, { search: 'keyword' });
    return request<ApiActivity[]>(withQuery('/activities/', query));
  },
  getDetail: (id: number) => request<ApiActivity>(`/activities/${id}`),
  create: (data: Partial<ApiActivity>) =>
    request<ApiActivity>('/activities/', {
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
  getTaskSummary: () =>
    request<Record<string, { task_count: number; completed_task_count: number }>>('/activities/summary/task-status'),
};

// ============ 任务 API ============

export interface ApiTask {
  id: number;
  activity_id: number;
  name: string;
  description?: string;
  assignee?: string;
  due_date?: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at?: string;
}

export const tasksApi = {
  getByActivity: (activityId: number, params?: { status?: string; priority?: string }) => {
    const query = buildQuery(params);
    return request<ApiTask[]>(withQuery(`/tasks/activity/${activityId}`, query));
  },
  getDetail: (taskId: number) => request<ApiTask>(`/tasks/${taskId}`),
  create: (data: Partial<ApiTask>) =>
    request<ApiTask>('/tasks/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  batchCreate: (tasks: Partial<ApiTask>[]) =>
    request<ApiTask[]>('/tasks/batch/', {
      method: 'POST',
      body: JSON.stringify({ tasks }),
    }),
  update: (taskId: number, data: Partial<ApiTask>) =>
    request<ApiTask>(`/tasks/${taskId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  updateStatus: (taskId: number, status: string) =>
    request<ApiTask>(`/tasks/${taskId}/status?status=${encodeURIComponent(status)}`, {
      method: 'PATCH',
    }),
  delete: (taskId: number) => request<{ message: string }>(`/tasks/${taskId}`, {
    method: 'DELETE',
  }),
  deleteByActivity: (activityId: number) => request<{ message: string }>(`/tasks/activity/${activityId}`, {
    method: 'DELETE',
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
    request<ApiActivity[] | { activities: ApiActivity[]; total: number }>(`/budget/activities?year=${year}`),
  getLogs: (activityId: number) => request<ApiBudgetLog[]>(`/budget/logs?activity_id=${activityId}`),
  createLog: (data: Partial<ApiBudgetLog>) =>
    request<ApiBudgetLog>('/budget/logs', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLog: (logId: number, data: Partial<ApiBudgetLog>) =>
    request<ApiBudgetLog>(`/budget/logs/${logId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteLog: (logId: number) =>
    request<{ message: string }>(`/budget/logs/${logId}`, {
      method: 'DELETE',
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
    const query = buildQuery(params, { search: 'keyword' });
    return request<ApiMaterial[]>(withQuery('/materials/', query));
  },
  getDetail: (id: number) => request<ApiMaterial>(`/materials/${id}`),
  create: (data: Partial<ApiMaterial>) =>
    request<ApiMaterial>('/materials/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: number, data: MaterialPayload) => {
    const payload: Record<string, unknown> = { ...data };

    if (data.usageCount !== undefined) {
      payload.usage_count = data.usageCount;
      delete payload.usageCount;
    }
    if (data.lastUpdated !== undefined) {
      payload.last_updated = data.lastUpdated;
      delete payload.lastUpdated;
    }
    if (data.imageUrl !== undefined) {
      payload.image_url = data.imageUrl;
      delete payload.imageUrl;
    }

    return request<ApiMaterial>(`/materials/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
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
    data: { count: number; user: string; reason: string; activity_id?: number }
  ) =>
    request<{ message: string }>(`/materials/${id}/withdrawal`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getWarehousingLogs: (materialId?: number) =>
    request<ApiWarehousingLog[]>(materialId ? `/materials/${materialId}/warehousing` : '/materials/warehousing-logs'),
  getWithdrawalLogs: (params?: { materialId?: number; activityId?: number }) => {
    if (params?.materialId) return request<ApiWithdrawalLog[]>(`/materials/${params.materialId}/withdrawal`);
    const query = buildQuery(params?.activityId ? { activity_id: params.activityId } : undefined);
    return request<ApiWithdrawalLog[]>(withQuery('/materials/withdrawal-logs', query));
  },
  returnWithdrawal: (logId: number, returnCount?: number) =>
    request<ApiWithdrawalLog>(`/materials/withdrawal/${logId}/return${returnCount ? `?return_count=${returnCount}` : ''}`, {
      method: 'PATCH',
    }),
};

// ============ 供应商 API ============

export const suppliersApi = {
  getList: (params?: { category?: string; search?: string }) => {
    const query = buildQuery(params, { search: 'keyword' });
    return request<ApiSupplier[]>(withQuery('/suppliers/', query));
  },
  getDetail: (id: number) => request<ApiSupplierDetail>(`/suppliers/${id}`),
  create: (data: Partial<ApiSupplier>) =>
    request<ApiSupplier>('/suppliers/', {
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
  getReviews: (id: number) =>
    request<any[]>(`/suppliers/${id}/reviews`),
  getBills: (id: number) =>
    request<any[]>(`/suppliers/${id}/bills`),
  addReview: (id: number, data: { reviewer_name?: string; content: string; rating: number }) =>
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
    const query = buildQuery(params, { stage: 'status', search: 'keyword' });
    return request<ApiOpportunity[]>(
      withQuery('/opportunities/', query)
    );
  },
  getPipeline: () =>
    request<{
      total_value: number;
      stages: Array<{ stage: string; value: number; count: number }>;
    }>('/opportunities/pipeline/'),
  create: (data: Partial<ApiOpportunity>) =>
    request<ApiOpportunity>('/opportunities/', {
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
  getLogs: (id: number) => request<any[]>(`/opportunities/${id}/logs`),
};

// ============ 复盘 API 类型 ============

export interface ApiReview {
  id: number;
  activity_id: number;
  status: string;
  expected_participants: number;
  participant_count: number;
  lead_count: number;
  confirmed_by?: string;
  confirmed_at?: string;
  reminded_at?: string;
  reminded_count: number;
  created_at: string;
  updated_at?: string;
}

export interface ApiReviewFeedback {
  id: number;
  review_id: number;
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
  is_submitted: boolean;
  submitted_at?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiReviewConclusion {
  id: number;
  review_id: number;
  ai_summary?: string;
  key_successes?: string[];
  common_problems?: string[];
  action_suggestions?: string[];
  manager_summary?: string;
  manager_id?: string;
  manager_name?: string;
  avg_goal_score?: number;
  avg_lead_quality_score?: number;
  avg_execution_score?: number;
  avg_resource_score?: number;
  avg_brand_score?: number;
  overall_score?: number;
  created_at: string;
  updated_at?: string;
}

export interface ApiReviewAvgScores {
  avg_goal_score: number;
  avg_lead_quality_score: number;
  avg_execution_score: number;
  avg_resource_score: number;
  avg_brand_score: number;
  overall_score: number;
}

export interface ApiGenerateSummaryResponse {
  summary: string;
  key_successes: string[];
  common_problems: string[];
  action_suggestions: string[];
  avg_scores: ApiReviewAvgScores;
}

// ============ 复盘 API ============

export const reviewsApi = {
  // 获取需要复盘的活动列表
  getActivities: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return request<any[]>(`/reviews/activities${query}`);
  },
  // 获取单个复盘（按活动ID）
  getReview: (activityId: number) =>
    request<any[]>(`/reviews/?activity_id=${activityId}`),
  // 获取复盘详情（按复盘ID）
  getReviewDetail: (reviewId: number) =>
    request<ApiReview>(`/reviews/${reviewId}`),
  // 创建复盘
  createReview: (data: { activity_id: number; status?: string; expected_participants?: number }) =>
    request<ApiReview>('/reviews/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  // 更新复盘
  updateReview: (reviewId: number, data: Partial<ApiReview>) =>
    request<ApiReview>(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  // 启动复盘
  startReview: (reviewId: number) =>
    request<ApiReview>(`/reviews/${reviewId}/start`, { method: 'POST' }),
  // 完成复盘
  completeReview: (reviewId: number) =>
    request<ApiReview>(`/reviews/${reviewId}/complete`, { method: 'POST' }),
  // 获取复盘反馈列表
  getFeedbacks: (reviewId: number) =>
    request<ApiReviewFeedback[]>(`/reviews/${reviewId}/feedbacks`),
  // 创建复盘反馈
  createFeedback: (data: {
    review_id: number;
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
  }) =>
    request<ApiReviewFeedback>('/reviews/feedbacks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  // 更新复盘反馈
  updateFeedback: (feedbackId: number, data: Partial<ApiReviewFeedback>) =>
    request<ApiReviewFeedback>(`/reviews/feedbacks/${feedbackId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  // 提交反馈
  submitFeedback: (feedbackId: number) =>
    request<ApiReviewFeedback>(`/reviews/feedbacks/${feedbackId}/submit`, { method: 'POST' }),
  // 获取复盘结论
  getConclusion: (reviewId: number) =>
    request<ApiReviewConclusion>(`/reviews/${reviewId}/conclusion`),
  // 创建复盘结论
  createConclusion: (data: {
    review_id: number;
    ai_summary?: string;
    manager_summary?: string;
    manager_id?: string;
    manager_name?: string;
  }) =>
    request<ApiReviewConclusion>('/reviews/conclusions/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  // 更新复盘结论
  updateConclusion: (conclusionId: number, data: Partial<ApiReviewConclusion>) =>
    request<ApiReviewConclusion>(`/reviews/conclusions/${conclusionId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  // 获取平均分
  getAvgScores: (reviewId: number) =>
    request<ApiReviewAvgScores>(`/reviews/${reviewId}/avg-scores`),
  // 生成AI摘要
  generateSummary: (reviewId: number) =>
    request<ApiGenerateSummaryResponse>(
      `/reviews/${reviewId}/generate-summary`,
      { method: 'POST', body: JSON.stringify({}) }
    ),
};

// ============ 媒体与传播 API 类型 ============

export interface ApiMediaRecord {
  id: number;
  activity_id: number;
  name: string;
  category: string;  // media_coop=媒体合作, content_pub=内容发布
  media_type: string;  // interview=采访, press_release=通稿, video=视频, wechat=公众号, video_content=视频内容, social=小红书/微博
  media_level?: string;  // central=央级, industry=行业, local=地方
  has_interview: string;
  has_published: string;
  has_video_interview: string;
  channel?: string;
  url?: string;
  publish_date?: string;
  views: number;
  interactions: number;
  likes: number;
  comments: number;
  shares: number;
  is_key_media: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiPremiumResource {
  id: number;
  activity_id: number;
  has_official_interview: string;
  has_industry_coverage: string;
  has_award_participation: string;
  has_contact_list: string;
  has_whitepaper: string;
  interview_details?: string;
  coverage_details?: string;
  award_details?: string;
  contact_list_details?: string;
  whitepaper_details?: string;
  notes?: string;
  created_at: string;
  updated_at?: string;
}

export interface ApiMediaStats {
  activity_id: number;
  total_media_count: number;
  total_content_count: number;
  total_record_count: number;
  total_views: number;
  total_interactions: number;
  total_likes: number;
  total_comments: number;
  total_shares: number;
  key_media_count: number;
  effectiveness_score: number;
  premium_has_official_interview: string;
  premium_has_industry_coverage: string;
  premium_has_award_participation: string;
  premium_has_contact_list: string;
  premium_has_whitepaper: string;
}

export interface ApiMediaStatsResponse {
  stats: ApiMediaStats;
  media_records: ApiMediaRecord[];
  premium_resource: ApiPremiumResource | null;
}

// ============ 媒体与传播 API ============

export const mediaApi = {
  // 获取活动的媒体统计汇总
  getStats: (activityId: number) =>
    request<ApiMediaStatsResponse>(`/media/activity/${activityId}/stats`),

  // 获取活动的媒体记录列表
  getRecords: (activityId: number, params?: { category?: string }) => {
    const query = buildQuery(params);
    return request<ApiMediaRecord[]>(withQuery(`/media/activity/${activityId}`, query));
  },

  // 获取单个媒体记录
  getRecord: (mediaId: number) =>
    request<ApiMediaRecord>(`/media/${mediaId}`),

  // 创建媒体记录
  createRecord: (data: Partial<ApiMediaRecord>) =>
    request<ApiMediaRecord>('/media/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新媒体记录
  updateRecord: (mediaId: number, data: Partial<ApiMediaRecord>) =>
    request<ApiMediaRecord>(`/media/${mediaId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // 删除媒体记录
  deleteRecord: (mediaId: number) =>
    request<{ message: string }>(`/media/${mediaId}`, {
      method: 'DELETE',
    }),

  // 获取溢价资源
  getPremiumResource: (activityId: number) =>
    request<ApiPremiumResource>(`/media/premium/activity/${activityId}`),

  // 创建/更新溢价资源
  savePremiumResource: (data: Partial<ApiPremiumResource>) =>
    request<ApiPremiumResource>('/media/premium', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 更新溢价资源
  updatePremiumResource: (activityId: number, data: Partial<ApiPremiumResource>) =>
    request<ApiPremiumResource>(`/media/premium/activity/${activityId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ============ 文件管理 API ================

export interface ApiActivityFile {
  id: string;
  activity_id: string;
  name: string;
  type: string;
  size: number;
  storage_key: string;
  upload_time: string;
  description?: string;
}

export const fileApi = {
  // 获取活动的所有文件
  getFiles: (activityId: string) =>
    request<ApiActivityFile[]>(`/files/activity/${activityId}`),

  // 上传文件元数据
  upload: (data: ApiActivityFile) =>
    request<ApiActivityFile>('/files/', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // 删除文件
  delete: (fileId: string) =>
    request<{ message: string }>(`/files/${fileId}`, {
      method: 'DELETE',
    }),

  // 重命名文件
  rename: (fileId: string, newName: string) =>
    request<ApiActivityFile>(`/files/${fileId}/rename`, {
      method: 'PUT',
      body: JSON.stringify({ name: newName }),
    }),
};

export default {
  dashboard: dashboardApi,
  activities: activitiesApi,
  tasks: tasksApi,
  budget: budgetApi,
  materials: materialsApi,
  suppliers: suppliersApi,
  opportunities: opportunitiesApi,
  reviews: reviewsApi,
  media: mediaApi,
  files: fileApi,
};
