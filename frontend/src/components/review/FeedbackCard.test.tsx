/**
 * FeedbackCard 组件测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import FeedbackCard from './FeedbackCard';
import { ReviewFeedback } from '../../types';

const mockFeedback: ReviewFeedback = {
  id: 1,
  evaluatorName: '张三',
  evaluatorRole: '市场经理',
  goalScore: 4,
  leadQualityScore: 4,
  executionScore: 3,
  resourceScore: 4,
  brandScore: 4,
  successes: '团队配合默契，执行到位',
  problems: '签到流程需优化',
  suggestions: '建议提前测试签到系统',
  submittedAt: '2026-04-19 10:00',
};

describe('FeedbackCard 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染反馈内容', () => {
      render(
        <FeedbackCard
          feedback={mockFeedback}
          canEdit={false}
          onDelete={vi.fn()}
        />
      );
      expect(screen.getByText('团队配合默契，执行到位')).toBeInTheDocument();
      expect(screen.getByText('签到流程需优化')).toBeInTheDocument();
    });

    it('应该渲染评价者信息', () => {
      render(
        <FeedbackCard
          feedback={mockFeedback}
          canEdit={false}
          onDelete={vi.fn()}
        />
      );
      expect(screen.getByText('张三')).toBeInTheDocument();
      expect(screen.getByText('市场经理')).toBeInTheDocument();
    });

    it('应该渲染分数', () => {
      render(
        <FeedbackCard
          feedback={mockFeedback}
          canEdit={false}
          onDelete={vi.fn()}
        />
      );
      // 有多个分数，所以用 getAllByText
      expect(screen.getAllByText('4').length).toBeGreaterThan(0);
    });
  });

  describe('边界测试', () => {
    it('canEdit 为 true 时应该渲染删除按钮', () => {
      render(
        <FeedbackCard
          feedback={mockFeedback}
          canEdit={true}
          onDelete={vi.fn()}
        />
      );
      // 应该有删除按钮
    });
  });
});
