/**
 * 复盘管理模块测试
 */
import { describe, it, expect } from 'vitest';

// 复盘状态枚举
enum ReviewStatus {
  NOT_STARTED = '未开始',
  IN_PROGRESS = '进行中',
  PENDING_CONFIRM = '待确认',
  COMPLETED = '已完成'
}

// 复盘反馈结构
interface ReviewFeedback {
  id: string;
  reviewer: string;
  scores: Record<string, number>;
  tagIds: string[];
  comment: string;
  submittedAt: string;
}

// 复盘总结结构
interface ReviewSummary {
  id: string;
  reviewId: string;
  overallScore: number;
  keyInsights: string[];
  problems: string[];
  bestPractices: string[];
  recommendations: string[];
}

// 计算平均分
function calculateAverageScore(feedbacks: ReviewFeedback[]): number {
  if (feedbacks.length === 0) return 0;
  const totalScore = feedbacks.reduce((sum, fb) => {
    const scores = Object.values(fb.scores);
    const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
    return sum + avgScore;
  }, 0);
  return Math.round(totalScore / feedbacks.length * 10) / 10;
}

// 统计标签使用频率
function calculateTagFrequency(feedbacks: ReviewFeedback[]): Record<string, number> {
  const frequency: Record<string, number> = {};
  feedbacks.forEach(fb => {
    fb.tagIds.forEach(tagId => {
      frequency[tagId] = (frequency[tagId] || 0) + 1;
    });
  });
  return frequency;
}

// 获取最常用标签
function getTopTags(feedbacks: ReviewFeedback[], topN: number = 3): Array<{ tagId: string; count: number }> {
  const frequency = calculateTagFrequency(feedbacks);
  return Object.entries(frequency)
    .map(([tagId, count]) => ({ tagId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, topN);
}

// 判断复盘是否可提交
function canSubmitReview(status: ReviewStatus, feedbacks: ReviewFeedback[]): { canSubmit: boolean; reason?: string } {
  if (status === ReviewStatus.COMPLETED) {
    return { canSubmit: false, reason: '复盘已完成后不可提交' };
  }
  if (feedbacks.length === 0) {
    return { canSubmit: false, reason: '至少需要一条反馈才能提交' };
  }
  const unsubmitted = feedbacks.filter(fb => !fb.submittedAt);
  if (unsubmitted.length > 0) {
    return { canSubmit: false, reason: `还有 ${unsubmitted.length} 条反馈未提交` };
  }
  return { canSubmit: true };
}

// 复盘状态颜色映射
function getStatusColor(status: ReviewStatus): string {
  const colors: Record<ReviewStatus, string> = {
    [ReviewStatus.NOT_STARTED]: 'bg-slate-100 text-slate-600',
    [ReviewStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-600',
    [ReviewStatus.PENDING_CONFIRM]: 'bg-amber-100 text-amber-600',
    [ReviewStatus.COMPLETED]: 'bg-emerald-100 text-emerald-600',
  };
  return colors[status];
}

describe('复盘平均分计算', () => {
  it('应正确计算多条反馈的平均分', () => {
    const feedbacks: ReviewFeedback[] = [
      { id: '1', reviewer: '张三', scores: { 组织能力: 4, 沟通协作: 5 }, tagIds: [], comment: '', submittedAt: '2024-03-20' },
      { id: '2', reviewer: '李四', scores: { 组织能力: 5, 沟通协作: 4 }, tagIds: [], comment: '', submittedAt: '2024-03-20' },
    ];
    // 张三平均: 4.5, 李四平均: 4.5, 总平均: 4.5
    expect(calculateAverageScore(feedbacks)).toBe(4.5);
  });

  it('应处理空反馈数组', () => {
    expect(calculateAverageScore([])).toBe(0);
  });

  it('应处理单条反馈', () => {
    const feedbacks: ReviewFeedback[] = [
      { id: '1', reviewer: '张三', scores: { 组织能力: 5, 沟通协作: 4, 执行力: 5 }, tagIds: [], comment: '', submittedAt: '2024-03-20' },
    ];
    expect(calculateAverageScore(feedbacks)).toBeCloseTo(4.67, 1);
  });

  it('应处理多维度评分', () => {
    const feedbacks: ReviewFeedback[] = [
      { id: '1', reviewer: '张三', scores: { 组织能力: 5, 沟通协作: 4, 执行力: 3, 创新能力: 4 }, tagIds: [], comment: '', submittedAt: '2024-03-20' },
    ];
    // (5+4+3+4)/4 = 4
    expect(calculateAverageScore(feedbacks)).toBe(4);
  });
});

describe('标签频率统计', () => {
  it('应正确统计标签使用频率', () => {
    const feedbacks: ReviewFeedback[] = [
      { id: '1', reviewer: '张三', scores: {}, tagIds: ['tag1', 'tag2'], comment: '', submittedAt: '' },
      { id: '2', reviewer: '李四', scores: {}, tagIds: ['tag1', 'tag3'], comment: '', submittedAt: '' },
      { id: '3', reviewer: '王五', scores: {}, tagIds: ['tag1', 'tag2'], comment: '', submittedAt: '' },
    ];
    const frequency = calculateTagFrequency(feedbacks);
    expect(frequency['tag1']).toBe(3);
    expect(frequency['tag2']).toBe(2);
    expect(frequency['tag3']).toBe(1);
  });

  it('应处理空数组', () => {
    const frequency = calculateTagFrequency([]);
    expect(Object.keys(frequency).length).toBe(0);
  });
});

describe('获取热门标签', () => {
  it('应返回指定数量的热门标签', () => {
    const feedbacks: ReviewFeedback[] = [
      { id: '1', reviewer: '张三', scores: {}, tagIds: ['tag1', 'tag2', 'tag3'], comment: '', submittedAt: '' },
      { id: '2', reviewer: '李四', scores: {}, tagIds: ['tag1', 'tag2'], comment: '', submittedAt: '' },
      { id: '3', reviewer: '王五', scores: {}, tagIds: ['tag1'], comment: '', submittedAt: '' },
    ];
    const topTags = getTopTags(feedbacks, 2);
    expect(topTags).toHaveLength(2);
    expect(topTags[0].tagId).toBe('tag1');
    expect(topTags[0].count).toBe(3);
  });

  it('当标签不足时应返回所有标签', () => {
    const feedbacks: ReviewFeedback[] = [
      { id: '1', reviewer: '张三', scores: {}, tagIds: ['tag1'], comment: '', submittedAt: '' },
    ];
    const topTags = getTopTags(feedbacks, 5);
    expect(topTags).toHaveLength(1);
  });
});

describe('复盘提交验证', () => {
  it('已完成状态的复盘不可再提交', () => {
    const feedbacks: ReviewFeedback[] = [
      { id: '1', reviewer: '张三', scores: {}, tagIds: [], comment: '', submittedAt: '2024-03-20' },
    ];
    const result = canSubmitReview(ReviewStatus.COMPLETED, feedbacks);
    expect(result.canSubmit).toBe(false);
    expect(result.reason).toBe('复盘已完成后不可提交');
  });

  it('没有反馈时不可提交', () => {
    const result = canSubmitReview(ReviewStatus.IN_PROGRESS, []);
    expect(result.canSubmit).toBe(false);
    expect(result.reason).toBe('至少需要一条反馈才能提交');
  });

  it('存在未提交反馈时不可提交', () => {
    const feedbacks: ReviewFeedback[] = [
      { id: '1', reviewer: '张三', scores: {}, tagIds: [], comment: '', submittedAt: '2024-03-20' },
      { id: '2', reviewer: '李四', scores: {}, tagIds: [], comment: '', submittedAt: '' },
    ];
    const result = canSubmitReview(ReviewStatus.IN_PROGRESS, feedbacks);
    expect(result.canSubmit).toBe(false);
    expect(result.reason).toBe('还有 1 条反馈未提交');
  });

  it('所有反馈已提交时可提交', () => {
    const feedbacks: ReviewFeedback[] = [
      { id: '1', reviewer: '张三', scores: {}, tagIds: [], comment: '', submittedAt: '2024-03-20' },
      { id: '2', reviewer: '李四', scores: {}, tagIds: [], comment: '', submittedAt: '2024-03-20' },
    ];
    const result = canSubmitReview(ReviewStatus.IN_PROGRESS, feedbacks);
    expect(result.canSubmit).toBe(true);
  });
});

describe('复盘状态颜色映射', () => {
  it('应返回正确的状态颜色', () => {
    expect(getStatusColor(ReviewStatus.NOT_STARTED)).toBe('bg-slate-100 text-slate-600');
    expect(getStatusColor(ReviewStatus.IN_PROGRESS)).toBe('bg-blue-100 text-blue-600');
    expect(getStatusColor(ReviewStatus.PENDING_CONFIRM)).toBe('bg-amber-100 text-amber-600');
    expect(getStatusColor(ReviewStatus.COMPLETED)).toBe('bg-emerald-100 text-emerald-600');
  });
});

describe('复盘日期验证', () => {
  it('应验证日期格式', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect('2024-03-15').toMatch(dateRegex);
    expect('2024-12-31 10:30:00').not.toMatch(dateRegex);
  });
});

// ============ 多维度评分测试 ============

// 多维度评分结构
interface MultiScoreFeedback {
  id: number;
  evaluator_name: string;
  evaluator_role?: string;
  goal_score: number;        // 目标达成度
  lead_quality_score: number; // 线索质量
  execution_score: number;    // 执行稳定性
  resource_score: number;     // 资源利用效率
  brand_score: number;       // 品牌曝光效果
  successes?: string;
  problems?: string;
  suggestions?: string;
  is_submitted: boolean;
}

// 计算多维度平均分
function calculateMultiScoreAverages(feedbacks: MultiScoreFeedback[]) {
  if (feedbacks.length === 0) {
    return { avg_goal_score: 0, avg_lead_quality_score: 0, avg_execution_score: 0, avg_resource_score: 0, avg_brand_score: 0, overall_score: 0 };
  }
  const sum = feedbacks.reduce((acc, fb) => ({
    goal: acc.goal + fb.goal_score,
    lead: acc.lead + fb.lead_quality_score,
    execution: acc.execution + fb.execution_score,
    resource: acc.resource + fb.resource_score,
    brand: acc.brand + fb.brand_score,
  }), { goal: 0, lead: 0, execution: 0, resource: 0, brand: 0 });

  const count = feedbacks.length;
  const avg_goal_score = sum.goal / count;
  const avg_lead_quality_score = sum.lead / count;
  const avg_execution_score = sum.execution / count;
  const avg_resource_score = sum.resource / count;
  const avg_brand_score = sum.brand / count;
  const overall_score = (avg_goal_score + avg_lead_quality_score + avg_execution_score + avg_resource_score + avg_brand_score) / 5;

  return { avg_goal_score, avg_lead_quality_score, avg_execution_score, avg_resource_score, avg_brand_score, overall_score };
}

// 按部门分组评价
function groupFeedbacksByDepartment(feedbacks: MultiScoreFeedback[]) {
  const groups: Record<string, MultiScoreFeedback[]> = {};
  feedbacks.forEach(fb => {
    const dept = fb.evaluator_role || '未指定';
    if (!groups[dept]) groups[dept] = [];
    groups[dept].push(fb);
  });
  return groups;
}

// 评价等级判断
function getScoreLevel(score: number): string {
  if (score >= 4.5) return '优秀';
  if (score >= 3.5) return '良好';
  if (score >= 2.5) return '一般';
  return '需改进';
}

// AI摘要生成（模拟）
function generateAiSummary(feedbacks: MultiScoreFeedback[]): { summary: string; key_successes: string[]; common_problems: string[]; action_suggestions: string[] } {
  const submitted = feedbacks.filter(fb => fb.is_submitted);
  if (submitted.length === 0) {
    return { summary: '暂无反馈数据', key_successes: [], common_problems: [], action_suggestions: [] };
  }

  const successes = submitted.filter(fb => fb.successes).map(fb => fb.successes!);
  const problems = submitted.filter(fb => fb.problems).map(fb => fb.problems!);
  const suggestions = submitted.filter(fb => fb.suggestions).map(fb => fb.suggestions!);

  return {
    summary: `本次复盘共收到${submitted.length}份反馈`,
    key_successes: [...new Set(successes)].slice(0, 5),
    common_problems: [...new Set(problems)].slice(0, 5),
    action_suggestions: [...new Set(suggestions)].slice(0, 5),
  };
}

describe('多维度评分计算', () => {
  it('应正确计算五维度平均分', () => {
    const feedbacks: MultiScoreFeedback[] = [
      { id: 1, evaluator_name: '张三', evaluator_role: '市场部', goal_score: 4, lead_quality_score: 5, execution_score: 4, resource_score: 3, brand_score: 4, is_submitted: true },
      { id: 2, evaluator_name: '李四', evaluator_role: '销售部', goal_score: 5, lead_quality_score: 4, execution_score: 5, resource_score: 4, brand_score: 5, is_submitted: true },
    ];
    const result = calculateMultiScoreAverages(feedbacks);
    expect(result.avg_goal_score).toBe(4.5);
    expect(result.avg_lead_quality_score).toBe(4.5);
    expect(result.avg_execution_score).toBe(4.5);
    expect(result.avg_resource_score).toBe(3.5);
    expect(result.avg_brand_score).toBe(4.5);
    expect(result.overall_score).toBe(4.3);
  });

  it('空反馈应返回零分', () => {
    const result = calculateMultiScoreAverages([]);
    expect(result.overall_score).toBe(0);
  });

  it('应正确计算综合评分', () => {
    const feedbacks: MultiScoreFeedback[] = [
      { id: 1, evaluator_name: '测试', goal_score: 5, lead_quality_score: 5, execution_score: 5, resource_score: 5, brand_score: 5, is_submitted: true },
    ];
    const result = calculateMultiScoreAverages(feedbacks);
    expect(result.overall_score).toBe(5);
  });
});

describe('按部门分组', () => {
  it('应正确按部门分组', () => {
    const feedbacks: MultiScoreFeedback[] = [
      { id: 1, evaluator_name: '张三', evaluator_role: '市场部', goal_score: 4, lead_quality_score: 4, execution_score: 4, resource_score: 4, brand_score: 4, is_submitted: true },
      { id: 2, evaluator_name: '李四', evaluator_role: '销售部', goal_score: 5, lead_quality_score: 5, execution_score: 5, resource_score: 5, brand_score: 5, is_submitted: true },
      { id: 3, evaluator_name: '王五', evaluator_role: '市场部', goal_score: 3, lead_quality_score: 3, execution_score: 3, resource_score: 3, brand_score: 3, is_submitted: true },
    ];
    const groups = groupFeedbacksByDepartment(feedbacks);
    expect(groups['市场部']).toHaveLength(2);
    expect(groups['销售部']).toHaveLength(1);
    expect(groups['未指定']).toBeUndefined();
  });

  it('无部门应归入未指定', () => {
    const feedbacks: MultiScoreFeedback[] = [
      { id: 1, evaluator_name: '张三', goal_score: 4, lead_quality_score: 4, execution_score: 4, resource_score: 4, brand_score: 4, is_submitted: true },
    ];
    const groups = groupFeedbacksByDepartment(feedbacks);
    expect(groups['未指定']).toHaveLength(1);
  });
});

describe('评分等级判断', () => {
  it('应正确判断评分等级', () => {
    expect(getScoreLevel(5)).toBe('优秀');
    expect(getScoreLevel(4.5)).toBe('优秀');
    expect(getScoreLevel(4)).toBe('良好');
    expect(getScoreLevel(3.5)).toBe('良好');
    expect(getScoreLevel(3)).toBe('一般');
    expect(getScoreLevel(2)).toBe('需改进');
  });
});

describe('AI摘要生成', () => {
  it('应生成包含反馈数量的摘要', () => {
    const feedbacks: MultiScoreFeedback[] = [
      { id: 1, evaluator_name: '张三', goal_score: 4, lead_quality_score: 4, execution_score: 4, resource_score: 4, brand_score: 4, successes: '组织有序', problems: '沟通不足', suggestions: '增加会议', is_submitted: true },
      { id: 2, evaluator_name: '李四', goal_score: 5, lead_quality_score: 5, execution_score: 5, resource_score: 5, brand_score: 5, successes: '团队协作好', is_submitted: true },
    ];
    const result = generateAiSummary(feedbacks);
    expect(result.summary).toContain('2份反馈');
    expect(result.key_successes).toContain('组织有序');
    expect(result.common_problems).toContain('沟通不足');
    expect(result.action_suggestions).toContain('增加会议');
  });

  it('空反馈应返回暂无数据', () => {
    const result = generateAiSummary([]);
    expect(result.summary).toBe('暂无反馈数据');
    expect(result.key_successes).toHaveLength(0);
  });

  it('应去重并限制数量', () => {
    const feedbacks: MultiScoreFeedback[] = [
      { id: 1, evaluator_name: '张三', goal_score: 4, lead_quality_score: 4, execution_score: 4, resource_score: 4, brand_score: 4, successes: '组织有序', is_submitted: true },
      { id: 2, evaluator_name: '李四', goal_score: 5, lead_quality_score: 5, execution_score: 5, resource_score: 5, brand_score: 5, successes: '组织有序', is_submitted: true },
      { id: 3, evaluator_name: '王五', goal_score: 4, lead_quality_score: 4, execution_score: 4, resource_score: 4, brand_score: 4, successes: '组织有序', is_submitted: true },
    ];
    const result = generateAiSummary(feedbacks);
    // 去重后应该只有1条
    expect(result.key_successes).toHaveLength(1);
  });

  it('未提交的反馈不应计入', () => {
    const feedbacks: MultiScoreFeedback[] = [
      { id: 1, evaluator_name: '张三', goal_score: 4, lead_quality_score: 4, execution_score: 4, resource_score: 4, brand_score: 4, successes: '组织有序', is_submitted: false },
      { id: 2, evaluator_name: '李四', goal_score: 5, lead_quality_score: 5, execution_score: 5, resource_score: 5, brand_score: 5, successes: '团队协作好', is_submitted: true },
    ];
    const result = generateAiSummary(feedbacks);
    expect(result.summary).toContain('1份反馈');
    expect(result.key_successes).not.toContain('组织有序');
    expect(result.key_successes).toContain('团队协作好');
  });
});
