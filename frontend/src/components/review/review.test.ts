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
