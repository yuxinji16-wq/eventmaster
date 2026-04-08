import React from 'react';
import {
  LayoutDashboard,
  CalendarRange,
  Package,
  Wallet,
  Users,
  TrendingUp,
  ClipboardCheck,
  Settings,
  Shield,
  User
} from 'lucide-react';
import { Activity, ActivityStatus, Material, Supplier, Opportunity, BudgetLog, MediaPromotion, WechatArticle, Attachment, ExpenseItem, ReviewComment, Task, TaskPriority, TaskStatus, ReviewStatus, ReviewEvaluation, Review, ReviewFeedback, ReviewTag, PRESET_REVIEW_TAGS, SupplierReview, Budget, BudgetItem, BudgetStatus, BudgetCategory } from '../types';

export const NAV_ITEMS = [
  { id: 'dashboard', label: '数据仪表盘', icon: <LayoutDashboard size={20} /> },
  { id: 'activities', label: '活动管理', icon: <CalendarRange size={20} /> },
  { id: 'materials', label: '物料仓库', icon: <Package size={20} /> },
  { id: 'budget', label: '预算仓库', icon: <Wallet size={20} /> },
  { id: 'suppliers', label: '供应商库', icon: <Users size={20} /> },
  { id: 'leads', label: '商机转化', icon: <TrendingUp size={20} /> },
  { id: 'reviews', label: '复盘中心', icon: <ClipboardCheck size={20} /> },
];

export const SYSTEM_NAV_ITEMS = [
  { id: 'account', label: '账号管理', icon: <User size={20} />, path: '/account' },
  { id: 'permissions', label: '权限管理', icon: <Shield size={20} />, path: '/permissions' },
  { id: 'settings', label: '网站设置', icon: <Settings size={20} />, path: '/settings' },
];

// 模拟复盘评论
const MOCK_REVIEW_COMMENTS: ReviewComment[] = [
  {
    id: 'rc1',
    author: '张伟',
    authorRole: '市场部经理',
    content: '本次展会整体效果超出预期，展位设计获得了很多好评。建议下次提前一周进场，避免最后一天加班。',
    rating: 4.5,
    createdAt: '2024-03-18 14:30'
  },
  {
    id: 'rc2',
    author: '李娜',
    authorRole: '销售总监',
    content: '现场获客质量很高，已有多家大客户进入深度沟通阶段。建议增加技术顾问现场支持。',
    rating: 5,
    createdAt: '2024-03-19 10:15'
  },
  {
    id: 'rc3',
    author: '王强',
    authorRole: '运营主管',
    content: '物料准备充分，但分发流程可以优化，部分时段出现排队现象。建议采用预登记领用方式。',
    rating: 4,
    createdAt: '2024-03-20 16:45'
  }
];

// 模拟媒体宣传
const MOCK_MEDIA_PROMOTIONS: MediaPromotion[] = [
  {
    id: 'mp1',
    mediaName: '公司官方公众号',
    mediaType: '公众号',
    publishDate: '2024-03-10',
    title: '2024全球科技峰会 | 我们来了！',
    link: 'https://mp.weixin.qq.com/example1',
    views: 3520,
    likes: 128
  },
  {
    id: 'mp2',
    mediaName: '公司视频号',
    mediaType: '视频号',
    publishDate: '2024-03-15',
    title: '峰会现场直击：创新科技引领未来',
    link: 'https://channels.weixin.qq.com/example2',
    views: 8900,
    likes: 356
  },
  {
    id: 'mp3',
    mediaName: '行业媒体合作',
    mediaType: '其他',
    publishDate: '2024-03-16',
    title: 'XX科技亮相全球科技峰会，发布重磅新品',
    link: 'https://industry-media.com/example3',
    views: 12500,
    likes: 420
  }
];

// 模拟公众号文章
const MOCK_WECHAT_ARTICLES: WechatArticle[] = [
  {
    id: 'wa1',
    title: '2024全球科技峰会邀请函',
    link: 'https://mp.weixin.qq.com/invite',
    publishDate: '2024-03-01',
    author: '市场部',
    readCount: 8560,
    likeCount: 320
  },
  {
    id: 'wa2',
    title: '峰会倒计时3天 | 精彩预告',
    link: 'https://mp.weixin.qq.com/preview',
    publishDate: '2024-03-12',
    author: '市场部',
    readCount: 4230,
    likeCount: 185
  },
  {
    id: 'wa3',
    title: '峰会圆满落幕 | 感谢每一位参与者',
    link: 'https://mp.weixin.qq.com/summary',
    publishDate: '2024-03-17',
    author: '市场部',
    readCount: 6780,
    likeCount: 290
  }
];

// 模拟资料附件
const MOCK_ATTACHMENTS: Attachment[] = [
  {
    id: 'att1',
    name: '2024全球科技峰会策划方案v2.0.pdf',
    size: '2.4MB',
    type: 'pdf',
    uploadDate: '2024-02-15',
    uploader: '张伟',
    category: '策划方案'
  },
  {
    id: 'att2',
    name: '展位设计效果图.zip',
    size: '15.8MB',
    type: 'zip',
    uploadDate: '2024-02-28',
    uploader: '李娜',
    category: '设计文件'
  },
  {
    id: 'att3',
    name: '供应商合作协议.pdf',
    size: '890KB',
    type: 'pdf',
    uploadDate: '2024-03-05',
    uploader: '王强',
    category: '合同文档'
  },
  {
    id: 'att4',
    name: '现场活动照片集.zip',
    size: '156MB',
    type: 'zip',
    uploadDate: '2024-03-16',
    uploader: '张伟',
    category: '现场照片'
  },
  {
    id: 'att5',
    name: '活动总结报告.docx',
    size: '1.2MB',
    type: 'doc',
    uploadDate: '2024-03-20',
    uploader: '李娜',
    category: '总结报告'
  }
];

// 模拟费用明细
const MOCK_EXPENSES: ExpenseItem[] = [
  {
    id: 'exp1',
    name: '展位租赁费',
    amount: 180000,
    category: '搭建/展览',
    date: '2024-02-20',
    payer: '财务部',
    status: '已报销',
    invoice: 'INV-2024-0220-001'
  },
  {
    id: 'exp2',
    name: '展台搭建费',
    amount: 85000,
    category: '搭建/展览',
    date: '2024-03-10',
    payer: '财务部',
    status: '已报销',
    invoice: 'INV-2024-0310-002'
  },
  {
    id: 'exp3',
    name: '物料印刷费',
    amount: 25600,
    category: '物料制作',
    date: '2024-03-08',
    payer: '王强',
    status: '已报销',
    notes: '包含宣传册、易拉宝、名片等'
  },
  {
    id: 'exp4',
    name: '差旅住宿费',
    amount: 18500,
    category: '差旅/住宿',
    date: '2024-03-14',
    payer: '张伟',
    status: '已报销',
    notes: '团队3人2晚'
  },
  {
    id: 'exp5',
    name: '餐饮招待费',
    amount: 12800,
    category: '餐饮/招待',
    date: '2024-03-15',
    payer: '李娜',
    status: '待报销',
    notes: '客户晚宴'
  },
  {
    id: 'exp6',
    name: '礼品采购',
    amount: 35000,
    category: '礼品/赠品',
    date: '2024-03-05',
    payer: '财务部',
    status: '已报销'
  },
  {
    id: 'exp7',
    name: '媒体推广费',
    amount: 28000,
    category: '媒体/推广',
    date: '2024-03-12',
    payer: '财务部',
    status: '已报销',
    notes: '行业媒体合作推广'
  }
];

export const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: 's1', name: '上海禾松文化传播有限公司', serviceType: '搭建', rating: 4.8, contact: '陈松', phone: '138-1234-5678', lastUsed: '2024-05-20', orderCount: 2, tags: ['自有工厂', '工艺精湛'],
    bankName: '中国工商银行上海市支行',
    bankAccount: '6222 0000 0000 1234 567',
    reviews: [{id: 'r1', user: '张伟', date: '2024-03-20', content: '展位搭建非常稳固，细节处理到位。', rating: 5}],
    bills: [{id: 'b1', activityName: '2024全球科技峰会', projectName: '主展位特装搭建', date: '2024-03-15', status: '已结清', amount: 320000}]
  },
  { id: 's2', name: '北京零点视觉设计中心', serviceType: '设计', rating: 4.5, contact: '林悦', phone: '139-8888-9999', lastUsed: '2024-04-12', orderCount: 0, tags: ['创意感强', '排版专业'], bankName: '招商银行北京分行', bankAccount: '6214 0000 1111 2222' },
  {
    id: 's8', name: '上海赟胜品牌营销有限公司', serviceType: '礼品', rating: 4.9, contact: '徐赟', phone: '185-6666-8888', lastUsed: '2024-06-01', orderCount: 5, tags: ['品牌联名', '高端礼赠', '方案快'],
    bankName: '中国建设银行上海静安支行',
    bankAccount: '6217 0000 9999 8888',
    reviews: [{id: 'r2', user: '市场部负责人', date: '2024-05-10', content: '礼品选品非常有格调，客户反馈极好。', rating: 5}]
  },
  {
    id: 's9', name: '上海泺弘品牌营销有限公司', serviceType: '搭建', rating: 4.7, contact: '周弘', phone: '131-0000-2222', lastUsed: '2024-05-25', orderCount: 3, tags: ['全案执行', '多地覆盖', '配合度极高'],
    bankName: '招商银行上海分行营业部',
    bankAccount: '6214 0000 3333 4444'
  },
  { id: 's4', name: '广州优品商务礼品定制', serviceType: '礼品', rating: 4.7, contact: '王芳', phone: '135-2222-3333', lastUsed: '2024-05-15', orderCount: 12, tags: ['定制Logo', '交货快'] },
  { id: 's5', name: '杭州印像图文快印', serviceType: '印刷', rating: 4.6, contact: '赵磊', phone: '186-5555-6666', lastUsed: '2024-05-18', orderCount: 8, tags: ['色彩准', '打样快'] }
];

// 模拟任务数据
export const MOCK_TASKS: Task[] = [
  { id: 't1', name: '确定活动方案', assignee: '张伟', dueDate: '2024-03-01', priority: TaskPriority.P0, status: TaskStatus.DONE, activityId: '1', createdAt: '2024-02-20', completedAt: '2024-03-01' },
  { id: 't2', name: '预算审批', assignee: '张伟', dueDate: '2024-03-02', priority: TaskPriority.P0, status: TaskStatus.DONE, activityId: '1', createdAt: '2024-02-21', completedAt: '2024-03-02' },
  { id: 't3', name: '物料采购确认', assignee: '王强', dueDate: '2024-03-10', priority: TaskPriority.P1, status: TaskStatus.IN_PROGRESS, activityId: '1', createdAt: '2024-02-25' },
  { id: 't4', name: '供应商合同签署', assignee: '李娜', dueDate: '2024-03-08', priority: TaskPriority.P1, status: TaskStatus.IN_PROGRESS, activityId: '1', createdAt: '2024-02-26' },
  { id: 't5', name: '现场彩排', assignee: '张伟', dueDate: '2024-03-14', priority: TaskPriority.P0, status: TaskStatus.TODO, activityId: '1', createdAt: '2024-03-05' },
  { id: 't6', name: '邀请函发送', assignee: '李娜', dueDate: '2024-06-01', priority: TaskPriority.P1, status: TaskStatus.TODO, activityId: '2', createdAt: '2024-05-20' },
  { id: 't7', name: '场地确认', assignee: '张伟', dueDate: '2024-06-05', priority: TaskPriority.P0, status: TaskStatus.TODO, activityId: '2', createdAt: '2024-05-22' },
];

// 模拟复盘评价数据
export const MOCK_EVALUATIONS: ReviewEvaluation[] = [
  {
    id: 'e1',
    evaluatorId: 'u1',
    evaluatorName: '张伟',
    evaluatorRole: '市场部经理',
    executionScore: 4.5,
    collaborationScore: 4,
    contentScore: 5,
    positives: '展位设计获得好评，现场互动效果好',
    problems: '物料配送延迟半天',
    suggestions: '提前预留物料运输缓冲时间',
    createdAt: '2024-03-18 14:30'
  },
  {
    id: 'e2',
    evaluatorId: 'u2',
    evaluatorName: '李娜',
    evaluatorRole: '销售总监',
    executionScore: 5,
    collaborationScore: 5,
    contentScore: 4.5,
    positives: '获客质量很高，签约多家大客户',
    problems: '现场技术顾问不足',
    suggestions: '增加技术顾问现场支持',
    createdAt: '2024-03-19 10:15'
  },
  {
    id: 'e3',
    evaluatorId: 'u3',
    evaluatorName: '王强',
    evaluatorRole: '运营主管',
    executionScore: 4,
    collaborationScore: 4.5,
    contentScore: 4,
    positives: '物料准备充分',
    problems: '分发流程排队现象',
    suggestions: '采用预登记领用方式',
    createdAt: '2024-03-20 16:45'
  }
];

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: '1',
    name: '2024 全球科技峰会',
    date: '2024-03-15',
    year: '2024',
    location: '上海世博展览馆',
    type: 'Exhibition',
    category: '自办活动',
    budget: 500000,
    actualSpend: 485000,
    leads: 120,
    status: ActivityStatus.COMPLETED,
    description: '年度最大的品牌曝光活动。全球超过 500 家展商参展。',
    isReviewed: true,
    reviewData: {
      status: ReviewStatus.COMPLETED,
      expectedParticipants: 3,
      evaluations: MOCK_EVALUATIONS,
      participantCount: 2800,
      conversionRate: 4.3,
      satisfactionScore: 4.5,
      keyAchievements: '成功签约12家意向客户，品牌曝光量达到预期目标，现场互动效果良好',
      problems: '展台位置较偏，部分时段人流不足；物料配送延迟半天',
      lessonsLearned: '提前确认展台位置，预留物料运输缓冲时间；增加现场互动环节吸引人流',
      nextSuggestions: '下次活动争取主通道展位，准备备用物料方案',
      aiInsight: '本次活动预算利用率97%，成本控制良好。获客成本¥4025/人，高于行业平均水平。建议优化展位选址策略，提升人流量转化效率。',
      reviewDate: '2024-03-25',
      reviewer: '市场部负责人',
      comments: MOCK_REVIEW_COMMENTS,
      confirmedBy: '张伟',
      confirmedAt: '2024-03-25'
    },
    mediaPromotions: MOCK_MEDIA_PROMOTIONS,
    wechatArticles: MOCK_WECHAT_ARTICLES,
    attachments: MOCK_ATTACHMENTS,
    expenses: MOCK_EXPENSES,
    tasks: MOCK_TASKS.filter(t => t.activityId === '1')
  },
  {
    id: '2',
    name: '华东区合作伙伴大会',
    date: '2024-06-20',
    year: '2024',
    location: '杭州滨江银泰喜来登酒店',
    type: 'Conference',
    category: '自办活动',
    budget: 200000,
    actualSpend: 12000,
    leads: 0,
    status: ActivityStatus.PLANNED,
    description: '深耕区域渠道，发布 Q3 新政策。',
    isReviewed: false,
    reviewData: {
      status: ReviewStatus.NOT_STARTED,
      expectedParticipants: 5,
      evaluations: []
    },
    mediaPromotions: [],
    wechatArticles: [],
    attachments: [],
    expenses: [],
    tasks: MOCK_TASKS.filter(t => t.activityId === '2')
  },
  {
    id: '3',
    name: 'AI产品发布会',
    date: '2024-05-10',
    year: '2024',
    location: '北京国家会议中心',
    type: 'Conference',
    category: '自办活动',
    budget: 350000,
    actualSpend: 320000,
    leads: 85,
    status: ActivityStatus.COMPLETED,
    description: '新一代AI产品线首发，邀请行业媒体及核心客户。',
    isReviewed: true,
    reviewData: {
      status: ReviewStatus.COMPLETED,
      expectedParticipants: 2,
      evaluations: [{
        id: 'e4',
        evaluatorId: 'u4',
        evaluatorName: '产品部经理',
        evaluatorRole: '产品部',
        executionScore: 4.8,
        collaborationScore: 4.5,
        contentScore: 5,
        positives: '产品发布获得行业广泛关注',
        problems: '现场网络带宽不足',
        suggestions: '准备备用网络方案',
        createdAt: '2024-05-15'
      }],
      participantCount: 1200,
      conversionRate: 7.1,
      satisfactionScore: 4.8,
      keyAchievements: '产品发布获得行业广泛关注，现场签约3家战略合作伙伴',
      problems: '现场网络带宽不足，直播一度中断',
      lessonsLearned: '大型活动需准备备用网络方案，提前测试直播设备',
      nextSuggestions: '下次提前协调场馆网络资源，准备4G/5G热点备用',
      reviewDate: '2024-05-15',
      reviewer: '产品部经理',
      confirmedBy: '产品部经理',
      confirmedAt: '2024-05-15'
    },
    mediaPromotions: [
      {
        id: 'mp4',
        mediaName: '公司官方公众号',
        mediaType: '公众号',
        publishDate: '2024-05-08',
        title: '重磅！新一代AI产品即将发布',
        link: 'https://mp.weixin.qq.com/ai-launch',
        views: 12500,
        likes: 580
      }
    ],
    wechatArticles: [
      {
        id: 'wa4',
        title: 'AI产品发布会精彩回顾',
        link: 'https://mp.weixin.qq.com/ai-review',
        publishDate: '2024-05-11',
        author: '市场部',
        readCount: 9800,
        likeCount: 420
      }
    ],
    attachments: [],
    expenses: []
  },
  {
    id: '4',
    name: '深圳电子展',
    date: '2024-04-18',
    year: '2024',
    location: '深圳会展中心',
    type: 'Exhibition',
    category: '外部市场活动',
    budget: 150000,
    actualSpend: 142000,
    leads: 65,
    status: ActivityStatus.COMPLETED,
    description: '参加华南地区最大的电子展，拓展区域市场。',
    isReviewed: false,
    reviewData: {
      status: ReviewStatus.NOT_STARTED,
      expectedParticipants: 3,
      evaluations: []
    },
    mediaPromotions: [],
    wechatArticles: [],
    attachments: [],
    expenses: [],
    tasks: []
  },
  {
    id: '5',
    name: '行业数字化转型峰会',
    date: '2024-07-25',
    year: '2024',
    location: '广州白云国际会议中心',
    type: 'Conference',
    category: '外部市场活动',
    budget: 80000,
    actualSpend: 0,
    leads: 0,
    status: ActivityStatus.PLANNED,
    description: '受邀参展并发表主题演讲，展示数字化转型解决方案。',
    isReviewed: false,
    reviewData: {
      status: ReviewStatus.NOT_STARTED,
      expectedParticipants: 2,
      evaluations: []
    },
    mediaPromotions: [],
    wechatArticles: [],
    attachments: [],
    expenses: [],
    tasks: []
  },
  {
    id: '6',
    name: 'Q3新品路演-上海站',
    date: '2024-08-15',
    year: '2024',
    location: '上海静安香格里拉',
    type: 'Roadshow',
    category: '自办活动',
    budget: 120000,
    actualSpend: 0,
    leads: 0,
    status: ActivityStatus.PLANNED,
    description: 'Q3新品系列路演首站，面向华东区核心客户。',
    isReviewed: false,
    reviewData: {
      status: ReviewStatus.NOT_STARTED,
      expectedParticipants: 4,
      evaluations: []
    },
    mediaPromotions: [],
    wechatArticles: [],
    attachments: [],
    expenses: [],
    tasks: []
  }
];

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'o1',
    clientName: '上海科技有限公司',
    company: '上海科技有限公司',
    contact: '陈总',
    phone: '138-1234-5678',
    email: 'chen@shanghitech.com',
    requirement: '需要采购企业级AI解决方案，用于提升生产效率',
    contactPerson: '陈总',
    estimatedValue: 1500000,
    status: '高意向',
    createDate: '2024-03-15',
    expectedCloseDate: '2024-04-30',
    activityId: '1',
    notes: '在2024全球科技峰会上接触，对我们的AI产品非常感兴趣'
  },
  {
    id: 'o2',
    clientName: '北京创新企业',
    company: '北京创新企业',
    contact: '刘经理',
    phone: '139-8888-9999',
    email: 'liu@beijinginnovation.com',
    requirement: '数字化转型项目，需要云服务和数据分析平台',
    contactPerson: '刘经理',
    estimatedValue: 800000,
    status: '中意向',
    createDate: '2024-03-20',
    expectedCloseDate: '2024-05-15',
    activityId: '1',
    notes: '通过展会官网联系我们，正在评估方案'
  },
  {
    id: 'o3',
    clientName: '广州汽车零部件公司',
    company: '广州汽车零部件公司',
    contact: '赵总',
    phone: '135-2222-3333',
    email: 'zhao@gzautoparts.com',
    requirement: '智能制造升级，需要工业物联网解决方案',
    contactPerson: '赵总',
    estimatedValue: 2000000,
    status: '高意向',
    createDate: '2024-04-01',
    expectedCloseDate: '2024-05-30',
    activityId: '1',
    notes: '老客户转介绍，合作意向强烈'
  },
  {
    id: 'o4',
    clientName: '深圳电子科技',
    company: '深圳电子科技',
    contact: '王总监',
    phone: '186-5555-6666',
    email: 'wang@szelectronic.com',
    requirement: '供应链管理系统优化',
    contactPerson: '王总监',
    estimatedValue: 500000,
    status: '低意向',
    createDate: '2023-11-10',
    expectedCloseDate: '2024-02-28',
    activityId: '2',
    notes: '还在前期沟通阶段，预算待确认'
  },
  {
    id: 'o5',
    clientName: '杭州互联网公司',
    company: '杭州互联网公司',
    contact: '李总',
    phone: '137-7777-8888',
    email: 'li@hzinternet.com',
    requirement: '大数据平台建设',
    contactPerson: '李总',
    estimatedValue: 1200000,
    status: '中意向',
    createDate: '2023-12-15',
    expectedCloseDate: '2024-03-31',
    activityId: '2',
    notes: '技术方案已确认，正在走内部审批流程'
  },
];

export const MOCK_BUDGET_LOGS: BudgetLog[] = [
  { id: 'bl1', name: '展台物料运费', activityId: '1', amount: 3500, category: '物流/运费', date: '2024-03-22', notes: '上海至拉斯维加斯空运', status: '已结清', type: 'expense' },
];

// ==================== 预算管理模拟数据 ====================

// 预算明细模板
const createBudgetItems = (budgetId: string, items: { category: BudgetCategory; planned: number; actual: number }[]): BudgetItem[] => {
  return items.map((item, index) => {
    const variance = item.actual - item.planned;
    const variancePercent = item.planned > 0 ? (variance / item.planned) * 100 : 0;
    return {
      id: `${budgetId}-item-${index}`,
      budgetId,
      category: item.category,
      plannedAmount: item.planned,
      actualAmount: item.actual,
      variance,
      variancePercent,
      status: variance > 0 ? '超预算' : item.actual > 0 ? '正常' : '未开始',
    };
  });
};

// 模拟预算数据
export const MOCK_BUDGETS: Budget[] = [
  {
    id: 'budget-1',
    activityId: '1',
    totalAmount: 500000,
    status: BudgetStatus.CLOSED,
    approvedBy: '财务总监',
    approvedAt: '2024-02-01',
    items: createBudgetItems('budget-1', [
      { category: '场地租用', planned: 180000, actual: 180000 },
      { category: '搭建/展览', planned: 150000, actual: 165000 },
      { category: '物料制作', planned: 50000, actual: 45600 },
      { category: '差旅/住宿', planned: 40000, actual: 38500 },
      { category: '餐饮/招待', planned: 30000, actual: 32800 },
      { category: '礼品/赠品', planned: 35000, actual: 35000 },
      { category: '媒体/推广', planned: 15000, actual: 12800 },
    ]),
    usedAmount: 509700,
    remainingAmount: -9700,
    executionRate: 101.9,
    createdAt: '2024-01-15',
    updatedAt: '2024-03-20',
  },
  {
    id: 'budget-2',
    activityId: '2',
    totalAmount: 200000,
    status: BudgetStatus.APPROVED,
    approvedBy: '财务总监',
    approvedAt: '2024-05-01',
    items: createBudgetItems('budget-2', [
      { category: '场地租用', planned: 80000, actual: 0 },
      { category: '搭建/展览', planned: 40000, actual: 0 },
      { category: '物料制作', planned: 20000, actual: 12000 },
      { category: '餐饮/招待', planned: 30000, actual: 0 },
      { category: '礼品/赠品', planned: 20000, actual: 0 },
      { category: '媒体/推广', planned: 10000, actual: 0 },
    ]),
    usedAmount: 12000,
    remainingAmount: 188000,
    executionRate: 6,
    createdAt: '2024-04-20',
  },
  {
    id: 'budget-3',
    activityId: '3',
    totalAmount: 350000,
    status: BudgetStatus.CLOSED,
    approvedBy: '财务总监',
    approvedAt: '2024-04-01',
    items: createBudgetItems('budget-3', [
      { category: '场地租用', planned: 100000, actual: 98000 },
      { category: '搭建/展览', planned: 80000, actual: 75000 },
      { category: '物料制作', planned: 30000, actual: 28000 },
      { category: '差旅/住宿', planned: 25000, actual: 23200 },
      { category: '餐饮/招待', planned: 35000, actual: 36000 },
      { category: '礼品/赠品', planned: 40000, actual: 38000 },
      { category: '媒体/推广', planned: 40000, actual: 41800 },
    ]),
    usedAmount: 340000,
    remainingAmount: 10000,
    executionRate: 97.1,
    createdAt: '2024-03-20',
    updatedAt: '2024-05-15',
  },
  {
    id: 'budget-4',
    activityId: '4',
    totalAmount: 150000,
    status: BudgetStatus.CLOSED,
    approvedBy: '财务总监',
    approvedAt: '2024-03-01',
    items: createBudgetItems('budget-4', [
      { category: '场地租用', planned: 50000, actual: 52000 },
      { category: '搭建/展览', planned: 40000, actual: 45000 },
      { category: '物料制作', planned: 20000, actual: 18000 },
      { category: '差旅/住宿', planned: 20000, actual: 17000 },
      { category: '餐饮/招待', planned: 15000, actual: 10000 },
    ]),
    usedAmount: 142000,
    remainingAmount: 8000,
    executionRate: 94.7,
    createdAt: '2024-02-25',
    updatedAt: '2024-04-20',
  },
  {
    id: 'budget-5',
    activityId: '5',
    totalAmount: 80000,
    status: BudgetStatus.APPROVED,
    approvedBy: '财务总监',
    approvedAt: '2024-06-01',
    items: createBudgetItems('budget-5', [
      { category: '场地租用', planned: 30000, actual: 0 },
      { category: '搭建/展览', planned: 20000, actual: 0 },
      { category: '物料制作', planned: 10000, actual: 0 },
      { category: '差旅/住宿', planned: 10000, actual: 0 },
      { category: '媒体/推广', planned: 10000, actual: 0 },
    ]),
    usedAmount: 0,
    remainingAmount: 80000,
    executionRate: 0,
    createdAt: '2024-05-20',
  },
  {
    id: 'budget-6',
    activityId: '6',
    totalAmount: 120000,
    status: BudgetStatus.APPROVED,
    approvedBy: '财务总监',
    approvedAt: '2024-07-01',
    items: createBudgetItems('budget-6', [
      { category: '场地租用', planned: 40000, actual: 0 },
      { category: '搭建/展览', planned: 30000, actual: 0 },
      { category: '物料制作', planned: 15000, actual: 0 },
      { category: '餐饮/招待', planned: 20000, actual: 0 },
      { category: '礼品/赠品', planned: 15000, actual: 0 },
    ]),
    usedAmount: 0,
    remainingAmount: 120000,
    executionRate: 0,
    createdAt: '2024-06-15',
  },
];

export const MOCK_MATERIALS: Material[] = [
  { id: 'm1', name: 'AI产品白皮书 2024版', category: '产品宣传册', type: '常规', stock: 450, unit: '本', status: 'In Stock', usageCount: 1200, lastUpdated: '2024-03-20 14:30' },
  { id: 'm2', name: '品牌易拉宝 80x180cm', category: '易拉宝', type: '常规', stock: 12, unit: '个', status: 'In Stock', usageCount: 56, lastUpdated: '2024-03-18 10:00' },
  { id: 'm3', name: '定制帆布袋', category: '礼品', type: '定制', stock: 500, unit: '个', status: 'In Stock', usageCount: 200, lastUpdated: '2024-03-15 16:20' },
  { id: 'm4', name: '企业宣传册', category: '产品宣传册', type: '常规', stock: 800, unit: '本', status: 'In Stock', usageCount: 350, lastUpdated: '2024-03-10 09:45' },
  { id: 'm5', name: '签字笔套装', category: '办公用品', type: '常规', stock: 200, unit: '套', status: 'Low Stock', usageCount: 180, lastUpdated: '2024-03-08 14:15' },
];

// ==================== 复盘中心模拟数据 ====================

// 模拟复盘评价
export const MOCK_REVIEW_FEEDBACKS: ReviewFeedback[] = [
  {
    id: 'fb1',
    reviewId: 'r1',
    evaluatorId: 'u1',
    evaluatorName: '张伟',
    evaluatorRole: '市场部经理',
    goalScore: 4.5,
    leadQualityScore: 4,
    executionScore: 4.5,
    resourceScore: 4,
    brandScore: 5,
    successes: '展位设计获得好评，现场互动效果好，品牌曝光超出预期',
    problems: '物料配送延迟半天，部分时段人流不足',
    suggestions: '提前预留物料运输缓冲时间，优化展位选址策略',
    tags: ['tag5', 'tag8', 'tag1'],
    isSubmitted: true,
    submittedAt: '2024-03-18 14:30',
    createdAt: '2024-03-18 14:00'
  },
  {
    id: 'fb2',
    reviewId: 'r1',
    evaluatorId: 'u2',
    evaluatorName: '李娜',
    evaluatorRole: '销售总监',
    goalScore: 5,
    leadQualityScore: 5,
    executionScore: 4,
    resourceScore: 4.5,
    brandScore: 4.5,
    successes: '获客质量很高，现场签约多家大客户，转化率超预期',
    problems: '现场技术顾问不足，客户技术咨询响应慢',
    suggestions: '增加技术顾问现场支持，提前准备技术FAQ',
    tags: ['tag6', 'tag3'],
    isSubmitted: true,
    submittedAt: '2024-03-19 10:15',
    createdAt: '2024-03-19 10:00'
  },
  {
    id: 'fb3',
    reviewId: 'r1',
    evaluatorId: 'u3',
    evaluatorName: '王强',
    evaluatorRole: '运营主管',
    goalScore: 4,
    leadQualityScore: 4,
    executionScore: 4.5,
    resourceScore: 4,
    brandScore: 4,
    successes: '物料准备充分，现场布置专业有序',
    problems: '分发流程排队现象，部分时段供应不足',
    suggestions: '采用预登记领用方式，优化物料分发流程',
    tags: ['tag7', 'tag9'],
    isSubmitted: true,
    submittedAt: '2024-03-20 16:45',
    createdAt: '2024-03-20 16:00'
  },
  {
    id: 'fb4',
    reviewId: 'r2',
    evaluatorId: 'u4',
    evaluatorName: '产品部经理',
    evaluatorRole: '产品部',
    goalScore: 5,
    leadQualityScore: 4.5,
    executionScore: 4,
    resourceScore: 4.5,
    brandScore: 5,
    successes: '产品发布获得行业广泛关注，现场签约3家战略合作伙伴',
    problems: '现场网络带宽不足，直播一度中断',
    suggestions: '准备备用网络方案，提前测试直播设备',
    tags: ['tag6', 'tag8', 'tag3'],
    isSubmitted: true,
    submittedAt: '2024-05-15 11:00',
    createdAt: '2024-05-15 10:30'
  }
];

// 模拟复盘主体
export const MOCK_REVIEWS: Review[] = [
  {
    id: 'r1',
    activityId: '1',
    status: ReviewStatus.COMPLETED,
    expectedParticipants: 5,
    participantCount: 2800,
    leadCount: 120,
    feedbacks: MOCK_REVIEW_FEEDBACKS.filter(f => f.reviewId === 'r1'),
    conclusion: {
      aiSummary: '本次活动整体表现优秀，目标达成度4.5分，线索质量4.3分。主要亮点在于展位设计和获客质量，主要问题集中在物料配送和技术支持方面。建议下次活动优化物流安排和技术资源配置。',
      keySuccesses: ['展位设计获得好评', '获客质量高', '品牌曝光超出预期', '物料准备充分'],
      commonProblems: ['物料配送延迟', '技术顾问不足', '分发流程排队'],
      actionSuggestions: ['提前预留物料运输缓冲时间', '增加技术顾问现场支持', '采用预登记领用方式'],
      avgGoalScore: 4.5,
      avgLeadQualityScore: 4.3,
      avgExecutionScore: 4.3,
      avgResourceScore: 4.2,
      avgBrandScore: 4.5,
      overallScore: 4.4,
      managerSummary: '本次展会整体效果超出预期，团队协作顺畅，获客质量高。建议下次重点优化物料物流和技术支持环节。',
      managerId: 'u1',
      managerName: '张伟',
      updatedAt: '2024-03-25'
    },
    tags: [PRESET_REVIEW_TAGS[4], PRESET_REVIEW_TAGS[5], PRESET_REVIEW_TAGS[0]],
    canAddFeedback: true,
    confirmedBy: '张伟',
    confirmedAt: '2024-03-25',
    createdAt: '2024-03-16',
    updatedAt: '2024-03-25'
  },
  {
    id: 'r2',
    activityId: '3',
    status: ReviewStatus.COMPLETED,
    expectedParticipants: 3,
    participantCount: 1200,
    leadCount: 85,
    feedbacks: MOCK_REVIEW_FEEDBACKS.filter(f => f.reviewId === 'r2'),
    conclusion: {
      aiSummary: '产品发布会效果优秀，品牌曝光5分满分，签约3家战略合作伙伴。主要问题是现场网络不稳定导致直播中断，建议后续活动准备备用网络方案。',
      keySuccesses: ['产品发布获得广泛关注', '签约3家战略合作伙伴', '品牌曝光效果显著'],
      commonProblems: ['网络带宽不足', '直播中断'],
      actionSuggestions: ['准备备用网络方案', '提前测试直播设备', '协调场馆网络资源'],
      avgGoalScore: 5,
      avgLeadQualityScore: 4.5,
      avgExecutionScore: 4,
      avgResourceScore: 4.5,
      avgBrandScore: 5,
      overallScore: 4.6,
      managerSummary: '发布会整体成功，产品关注度超预期。网络问题是唯一需要改进的环节。',
      managerId: 'u4',
      managerName: '产品部经理',
      updatedAt: '2024-05-16'
    },
    tags: [PRESET_REVIEW_TAGS[7], PRESET_REVIEW_TAGS[5]],
    canAddFeedback: true,
    confirmedBy: '产品部经理',
    confirmedAt: '2024-05-16',
    createdAt: '2024-05-11',
    updatedAt: '2024-05-16'
  },
  {
    id: 'r3',
    activityId: '4',
    status: ReviewStatus.NOT_STARTED,
    expectedParticipants: 3,
    feedbacks: [],
    canAddFeedback: true,
    createdAt: '2024-04-19',
    updatedAt: '2024-04-19'
  },
  {
    id: 'r4',
    activityId: '2',
    status: ReviewStatus.NOT_STARTED,
    expectedParticipants: 4,
    feedbacks: [],
    canAddFeedback: true,
    createdAt: '2024-06-21',
    updatedAt: '2024-06-21'
  }
];

// ==================== 活动行业分类 ====================
export const ACTIVITY_INDUSTRIES = [
  '航天',
  '航空',
  '车辆',
  '船舶',
  '电子信息',
  '芯片电子',
  '电力能源',
  '核能',
  '高校',
  '政府',
  '综合',
] as const;

export type ActivityIndustry = typeof ACTIVITY_INDUSTRIES[number];

export { PRESET_REVIEW_TAGS };