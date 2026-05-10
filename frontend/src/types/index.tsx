/**
 * 类型定义
 *
 * 注意：前端内部使用 camelCase + string ID（与 hooks.ts adapt 函数返回保持一致）
 * 后端 API 类型在 backendApi.ts 内部定义，通过 adapt 函数转换为前端类型
 */

// ============ 枚举定义 ============

export enum ActivityStatus {
  PLANNED = '待启动',
  ONGOING = '进行中',
  COMPLETED = '已完成',
  CANCELLED = '已取消'
}

export type ActivityCategory = '自办活动' | '外部市场活动';
export type ActivityType = 'Exhibition' | 'Conference' | 'Webinar' | 'Roadshow';

// 活动阶段定义
export const ACTIVITY_STAGES = ['待启动', '筹备中', '执行中', '复盘中', '已完成'] as const;
export type ActivityStage = typeof ACTIVITY_STAGES[number];

// 风险等级
export type RiskLevel = 'healthy' | 'warning' | 'danger';

export enum ReviewStatus {
  NOT_STARTED = '未开始',
  IN_PROGRESS = '进行中',
  PENDING_CONFIRM = '待确认',
  COMPLETED = '已完成'
}

export enum TaskPriority {
  P0 = 'P0',
  P1 = 'P1',
  P2 = 'P2'
}

export enum TaskStatus {
  TODO = '未开始',
  IN_PROGRESS = '进行中',
  DONE = '已完成',
  BLOCKED = '阻塞'
}

export enum BudgetStatus {
  DRAFT = '草稿',
  APPROVED = '已审批',
  EXECUTING = '执行中',
  CLOSED = '已结项'
}

export type BudgetCategory =
  | '场地租用'
  | '搭建/展览'
  | '物料制作'
  | '差旅/住宿'
  | '餐饮/招待'
  | '礼品/赠品'
  | '媒体/推广'
  | '人员费用'
  | '其他';

export type ExpenseCategory = '搭建/展览' | '场地租用' | '物料制作' | '差旅/住宿' | '餐饮/招待' | '礼品/赠品' | '媒体/推广' | '其他';
export type ExpenseStatus = '已支付' | '待报销' | '已报销';
export type BillStatus = '已结清' | '待结算';
export type MaterialCategory = '产品宣传册' | '易拉宝' | '会议定制' | '礼品' | '办公用品' | '其他';
export type MaterialType = '常规' | '定制';
export type MaterialStatus = 'In Stock' | 'Low Stock' | 'Out of Stock';
export type ServiceType = '搭建' | '设计' | '影音' | '礼品' | '印刷' | '其他';
export type MediaType = '公众号' | '视频号' | '抖音' | '微博' | '官网' | '其他';
export type AttachmentCategory = '策划方案' | '设计文件' | '合同文档' | '现场照片' | '总结报告' | '其他';
export type BudgetItemStatus = '正常' | '超预算' | '未开始';
export type BudgetLogType = 'expense' | 'income';
export type ReviewTagCategory = '问题类' | '成功类' | '建议类' | '其他';

// ============ 前端内部类型（camelCase, string ID）============
// 与 hooks.ts 中的 adapt 函数返回值保持一致

export interface Activity {
  id: string;
  name: string;
  date: string;
  year: string;
  location?: string;
  type: string;
  category: string;
  industry?: string;
  budget: number;
  actualSpend: number;
  leads: number;
  status: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
  // 活动详情页扩展字段
  tasks?: ActivityTask[];
  expenses?: ExpenseItem[];
  riskLevel?: RiskLevel;
  currentStage?: ActivityStage;
  // 复盘数据
  reviewData?: ReviewData;
  // 外部活动信息（当 activity.type === 'external' 时使用）
  externalEventInfo?: ExternalEventInfo;
}

// ============ 外部活动类型定义 ============

export type DriverType = '主动规划型' | '客户驱动型' | '领导推动型' | '机会触发型' | '被动承接型';
export type ParticipationStrategy = '重点投入' | '标准参与' | '低成本调研';
export type ParticipationForm = '展位' | '演讲' | '展位+演讲' | '普通参会' | '其他';
export type SelfAssessment = '超预期' | '基本达成' | '未达预期';
export type ValueAssessment = '高价值' | '中等价值' | '低价值' | '无效投入';
export type NextYearSuggestion = '升级参与' | '维持参与' | '降级参与' | '不再参与';
export type GoalOption = '客户拓展' | '品牌曝光' | '行业调研' | '生态合作' | '其他';
export type PremiumResource = '深度对接机会' | '媒体采访机会' | '行业报告/白皮书' | '参会名单' | '合作伙伴资源' | '奖项/标准/官方背书' | '其他';

export interface ExternalEventInfo {
  decision: {
    goals: GoalOption[];
    driverType: DriverType | '';
    participationStrategy: ParticipationStrategy | '';
    decisionNote: string;
  };
  execution: {
    participationForm: ParticipationForm[];
    attendees: string[];
    displayContent: string;
    resourceSupport: string[];
  };
  resources: {
    leadsCount: number;
    highValueLeadsCount: number;
    transferredLeadsCount: number;
    convertedLeadsCount: number;
    premiumResources: PremiumResource[];
    competitorObservation: string;
    industryObservation: string;
  };
  cost: {
    participationFee: number;
    materialFee: number;
    otherFee: number;
    totalCost: number;
    overBudget: boolean;
  };
  evaluation: {
    selfAssessment: SelfAssessment | '';
    valueAssessment: ValueAssessment | '';
    continueNextYear: string;
    nextYearSuggestion: NextYearSuggestion | '';
    conclusion: string;
  };
  oaLinks: {
    applicationUrl: string;
    feedbackUrl: string;
  };
}

// 创建默认外部活动信息
export const createDefaultExternalEventInfo = (): ExternalEventInfo => ({
  decision: {
    goals: [],
    driverType: '',
    participationStrategy: '',
    decisionNote: '',
  },
  execution: {
    participationForm: [],
    attendees: [],
    displayContent: '',
    resourceSupport: [],
  },
  resources: {
    leadsCount: 0,
    highValueLeadsCount: 0,
    transferredLeadsCount: 0,
    convertedLeadsCount: 0,
    premiumResources: [],
    competitorObservation: '',
    industryObservation: '',
  },
  cost: {
    participationFee: 0,
    materialFee: 0,
    otherFee: 0,
    totalCost: 0,
    overBudget: false,
  },
  evaluation: {
    selfAssessment: '',
    valueAssessment: '',
    continueNextYear: '',
    nextYearSuggestion: '',
    conclusion: '',
  },
  oaLinks: {
    applicationUrl: '',
    feedbackUrl: '',
  },
});

// 活动复盘数据（本地管理）
export interface ReviewData {
  status?: ReviewStatus;
  participantCount?: number;
  expectedParticipants?: number;
  conversionRate: number;
  satisfactionScore: number;
  keyAchievements: string;
  problems: string;
  lessonsLearned: string;
  nextSuggestions: string;
  reviewDate: string;
  reviewer: string;
  comments?: ReviewComment[];
  evaluations?: ReviewEvaluation[];
  isReviewed?: boolean;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  type: string;
  stock: number;
  unit: string;
  status: string;
  usageCount: number;
  lastUpdated: string;
  imageUrl?: string;
  location?: string;
  created_at?: string;
}

export interface Supplier {
  id: string;
  name: string;
  serviceType: string;
  rating: number;
  contact: string;
  phone: string;
  email?: string;
  address?: string;
  bankName?: string;
  bankAccount?: string;
  lastUsed?: string;
  orderCount: number;
  tags?: string[];
  reviews?: SupplierReview[];
  bills?: BillRecord[];
  created_at?: string;
  updated_at?: string;
}

export interface SupplierReview {
  id: string;
  user: string;
  date: string;
  content: string;
  rating: number;
}

export interface BillRecord {
  id: string;
  activityName: string;
  projectName: string;
  date: string;
  status: string;
  amount: number;
}

export interface SupplierDetail extends Supplier {
  reviews: SupplierReview[];
  bills: BillRecord[];
}

// 商机来源类型
export type LeadSourceType = 'activity' | 'manual';

// 线索等级
export type LeadLevel = 'A' | 'B' | 'C' | '待评估';

// 线索状态
export type LeadStatus = '未跟进' | '待跟进' | '已联系' | '已转销售' | '已转化' | '未转化';

// 商机线索类型（统一数据结构）
export interface Opportunity {
  id: string;
  // 客户信息
  clientName: string;       // 客户单位
  company?: string;
  contact?: string;
  contactName: string;      // 姓名
  phone: string;            // 联系方式
  email?: string;           // 邮箱
  requirement: string;       // 需求描述

  // 来源信息
  sourceType: LeadSourceType;  // 来源类型：activity=活动获取, manual=自主录入
  sourceName: string;          // 来源名称：活动名称或"自主录入"
  activityId?: string;         // 关联活动ID（仅活动来源时有值）

  // 销售分配
  region: string;             // 所属区域（必填）
  owner: string;             // 对接人（必填）

  // 销售评估
  leadLevel: LeadLevel;      // 线索等级（A/B/C/待评估）
  evaluationNote?: string;    // 评估备注
  transferredToSales: boolean; // 是否转交销售
  transferredAt?: string;     // 转交时间

  // 转化结果
  converted: boolean;         // 是否转化成功
  conversionStatus?: LeadStatus; // 结果状态
  conversionAt?: string;      // 转化时间
  resultNote?: string;        // 结果备注

  // 线索状态
  status: LeadStatus;        // 当前状态

  // 元数据
  createdAt: string;          // 创建时间
  updatedAt?: string;         // 更新时间
  notes?: string;             // 备注
}

export interface BudgetLog {
  id: string;
  activityId: string;
  name: string;
  amount: number;
  category: string;
  date: string;
  notes?: string;
  status: string;
  type: string;
  created_at?: string;
}

// ============ 仪表盘类型 ============

export interface DashboardStats {
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

export interface BudgetOverview {
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

// ============ 前端扩展类型（前端特有，后端无）============

// 复盘标签
export interface ReviewTag {
  id: string;
  name: string;
  color: string;
  category: ReviewTagCategory;
}

// 复盘评论
export interface ReviewComment {
  id: string;
  author: string;
  authorRole: string;
  content: string;
  rating?: number;
  createdAt: string;
}

// 个人评价
export interface ReviewEvaluation {
  id: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: string;
  executionScore: number;
  collaborationScore: number;
  contentScore: number;
  positives: string;
  problems: string;
  suggestions: string;
  createdAt: string;
  updatedAt?: string;
}

// 任务
export interface Task {
  id: string;
  name: string;
  description?: string;
  assignee: string;
  assigneeId?: string;
  dueDate: string;
  priority: TaskPriority;
  status: TaskStatus;
  activityId: string;
  createdAt: string;
  updatedAt?: string;
  completedAt?: string;
  notes?: string;
}

// 活动任务（简化版，用于活动详情页本地管理）
export interface ActivityTask {
  id: string;
  name: string;
  description?: string;
  assignee: string;
  dueDate: string;
  priority: 'P0' | 'P1' | 'P2';
  status: '未开始' | '进行中' | '已完成' | '阻塞';
  createdAt: string;
  completedAt?: string;
}

// 媒体宣传
export interface MediaPromotion {
  id: string;
  mediaName: string;
  mediaType: MediaType;
  publishDate: string;
  title: string;
  link?: string;
  views?: number;
  likes?: number;
  cover?: string;
}

// 公众号文章
export interface WechatArticle {
  id: string;
  title: string;
  link: string;
  publishDate: string;
  author: string;
  readCount?: number;
  likeCount?: number;
}

// 资料附件
export interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string;
  uploadDate: string;
  uploader: string;
  url?: string;
  category?: AttachmentCategory;
}

// 费用明细
export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  plannedAmount?: number;
  actualAmount?: number;
  category: ExpenseCategory;
  date: string;
  payer?: string;
  status: ExpenseStatus;
  notes?: string;
  invoice?: string;
}

// 预算明细项
export interface BudgetItem {
  id: string;
  budgetId: string;
  category: BudgetCategory;
  plannedAmount: number;
  actualAmount: number;
  variance?: number;
  variancePercent?: number;
  status: BudgetItemStatus;
  notes?: string;
}

// 预算主表
export interface Budget {
  id: string;
  activityId: string;
  totalAmount: number;
  status: BudgetStatus;
  approvedBy?: string;
  approvedAt?: string;
  items: BudgetItem[];
  usedAmount?: number;
  remainingAmount?: number;
  executionRate?: number;
  createdAt?: string;
  updatedAt?: string;
}

// 复盘评价输入
export interface ReviewFeedback {
  id: string;
  reviewId: string;
  evaluatorId: string;
  evaluatorName: string;
  evaluatorRole: string;
  goalScore: number;
  leadQualityScore: number;
  executionScore: number;
  resourceScore: number;
  brandScore: number;
  successes: string;
  problems: string;
  suggestions: string;
  tags?: string[];
  isSubmitted: boolean;
  submittedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

// 复盘结论
export interface ReviewConclusion {
  aiSummary?: string;
  keySuccesses?: string[];
  commonProblems?: string[];
  actionSuggestions?: string[];
  managerSummary?: string;
  managerId?: string;
  managerName?: string;
  updatedAt?: string;
  avgGoalScore?: number;
  avgLeadQualityScore?: number;
  avgExecutionScore?: number;
  avgResourceScore?: number;
  avgBrandScore?: number;
  overallScore?: number;
}

// 复盘主体
export interface Review {
  id: string;
  activityId: string;
  status: ReviewStatus;
  expectedParticipants: number;
  participantCount?: number;
  leadCount?: number;
  feedbacks: ReviewFeedback[];
  conclusion?: ReviewConclusion;
  tags?: ReviewTag[];
  relatedActivityIds?: string[];
  canAddFeedback: boolean;
  confirmedBy?: string;
  confirmedAt?: string;
  remindedAt?: string;
  remindedCount?: number;
  createdAt: string;
  updatedAt: string;
}

// ============ 预设数据 ============

export const PRESET_REVIEW_TAGS: ReviewTag[] = [
  { id: 'tag1', name: '物料问题', color: 'rose', category: '问题类' },
  { id: 'tag2', name: '客户质量低', color: 'amber', category: '问题类' },
  { id: 'tag3', name: '执行超时', color: 'orange', category: '问题类' },
  { id: 'tag4', name: '预算超支', color: 'red', category: '问题类' },
  { id: 'tag5', name: '展位效果好', color: 'emerald', category: '成功类' },
  { id: 'tag6', name: '获客质量高', color: 'green', category: '成功类' },
  { id: 'tag7', name: '团队协作顺畅', color: 'teal', category: '成功类' },
  { id: 'tag8', name: '品牌曝光足', color: 'cyan', category: '成功类' },
  { id: 'tag9', name: '流程优化', color: 'indigo', category: '建议类' },
  { id: 'tag10', name: '资源配置', color: 'violet', category: '建议类' },
  { id: 'tag11', name: '时间管理', color: 'purple', category: '建议类' },
  { id: 'tag12', name: '成本控制', color: 'fuchsia', category: '建议类' },
];
