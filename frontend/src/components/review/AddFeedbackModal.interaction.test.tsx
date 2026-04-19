/**
 * 添加反馈弹窗交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import AddFeedbackModal from './AddFeedbackModal';
import { ReviewFeedback } from '../../types';

// Mock ScoreInput component
vi.mock('../../components/review/ScoreInput', () => ({
  default: ({ label, value, onChange }: any) => (
    <div data-testid="score-input" data-label={label}>
      <span>{label}: {value}</span>
      <button onClick={() => onChange(value + 1)}>增加</button>
      <button onClick={() => onChange(value - 1)}>减少</button>
    </div>
  ),
}));

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();

const renderModal = () => {
  render(
    <AddFeedbackModal
      reviewId="review-1"
      onClose={mockOnClose}
      onSave={mockOnSave}
    />
  );
};

describe('添加反馈弹窗交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('弹窗基础元素', () => {
    it('应显示弹窗标题', () => {
      renderModal();

      expect(screen.getByText('添加活动评价')).toBeInTheDocument();
    });

    it('应显示遮罩层', () => {
      renderModal();

      const overlay = document.querySelector('.fixed.inset-0');
      expect(overlay).toBeInTheDocument();
    });
  });

  describe('评分滑块交互', () => {
    it('应显示所有评分维度', () => {
      renderModal();

      expect(screen.getByText(/目标达成度/)).toBeInTheDocument();
      expect(screen.getByText(/线索质量/)).toBeInTheDocument();
      expect(screen.getByText(/执行稳定性/)).toBeInTheDocument();
      expect(screen.getByText(/资源利用效率/)).toBeInTheDocument();
      expect(screen.getByText(/品牌曝光效果/)).toBeInTheDocument();
    });

    it('应显示评分输入组件', () => {
      renderModal();

      const scoreInputs = screen.getAllByTestId('score-input');
      expect(scoreInputs.length).toBe(5);
    });

    it('应能调整评分', async () => {
      const user = userEvent.setup();
      renderModal();

      const scoreInputs = screen.getAllByTestId('score-input');
      const increaseButton = scoreInputs[0].querySelector('button');
      await user.click(increaseButton!);

      expect(scoreInputs[0]).toHaveTextContent('目标达成度: 5');
    });

    it('评分默认为4分', () => {
      renderModal();

      expect(screen.getByText('目标达成度: 4')).toBeInTheDocument();
    });
  });

  describe('取消按钮交互', () => {
    it('应显示取消按钮', () => {
      renderModal();

      expect(screen.getByRole('button', { name: /取消/ })).toBeInTheDocument();
    });

    it('点击取消应调用 onClose', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole('button', { name: /取消/ }));

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe('提交按钮交互', () => {
    it('应显示提交评价按钮', () => {
      renderModal();

      expect(screen.getByRole('button', { name: /提交评价/ })).toBeInTheDocument();
    });
  });

  describe('表单验证交互', () => {
    it('提交空表单应显示验证错误', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole('button', { name: /提交评价/ }));

      expect(screen.getByText(/请填写姓名/)).toBeInTheDocument();
    });

    it('表单验证失败不应调用 onSave', async () => {
      const user = userEvent.setup();
      renderModal();

      await user.click(screen.getByRole('button', { name: /提交评价/ }));

      expect(mockOnSave).not.toHaveBeenCalled();
    });
  });

  describe('遮罩层交互', () => {
    it('点击遮罩层应关闭弹窗', async () => {
      const user = userEvent.setup();
      renderModal();

      const overlay = document.querySelector('.absolute.inset-0');
      await user.click(overlay!);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });
});
