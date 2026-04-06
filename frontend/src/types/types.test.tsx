/**
 * 类型定义测试
 */
import { describe, it, expect } from 'vitest';
import { ActivityStatus, ReviewStatus, TaskPriority, TaskStatus, PRESET_REVIEW_TAGS } from '../types';

describe('ActivityStatus 枚举', () => {
  it('should have correct status values', () => {
    expect(ActivityStatus.PLANNED).toBe('待启动');
    expect(ActivityStatus.ONGOING).toBe('进行中');
    expect(ActivityStatus.COMPLETED).toBe('已完成');
    expect(ActivityStatus.CANCELLED).toBe('已取消');
  });
});

describe('ReviewStatus 枚举', () => {
  it('should have correct status values', () => {
    expect(ReviewStatus.NOT_STARTED).toBe('未开始');
    expect(ReviewStatus.IN_PROGRESS).toBe('进行中');
    expect(ReviewStatus.PENDING_CONFIRM).toBe('待确认');
    expect(ReviewStatus.COMPLETED).toBe('已完成');
  });
});

describe('TaskPriority 枚举', () => {
  it('should have correct priority values', () => {
    expect(TaskPriority.P0).toBe('P0');
    expect(TaskPriority.P1).toBe('P1');
    expect(TaskPriority.P2).toBe('P2');
  });
});

describe('TaskStatus 枚举', () => {
  it('should have correct status values', () => {
    expect(TaskStatus.TODO).toBe('未开始');
    expect(TaskStatus.IN_PROGRESS).toBe('进行中');
    expect(TaskStatus.DONE).toBe('已完成');
    expect(TaskStatus.BLOCKED).toBe('阻塞');
  });
});

describe('PRESET_REVIEW_TAGS', () => {
  it('should have 12 preset tags', () => {
    expect(PRESET_REVIEW_TAGS).toHaveLength(12);
  });

  it('should have valid tag structure', () => {
    PRESET_REVIEW_TAGS.forEach(tag => {
      expect(tag.id).toBeDefined();
      expect(tag.name).toBeDefined();
      expect(tag.color).toBeDefined();
      expect(tag.category).toBeDefined();
    });
  });

  it('should have tags in each category', () => {
    const categories = PRESET_REVIEW_TAGS.map(t => t.category);
    expect(categories).toContain('问题类');
    expect(categories).toContain('成功类');
    expect(categories).toContain('建议类');
  });
});
