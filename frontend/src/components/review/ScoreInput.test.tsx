/**
 * ScoreInput 组件测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ScoreInput from './ScoreInput';

describe('ScoreInput 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染星星输入', () => {
      render(<ScoreInput value={4} onChange={vi.fn()} />);
      const stars = screen.getAllByRole('button');
      expect(stars.length).toBe(5);
    });

    it('应该渲染标签', () => {
      render(<ScoreInput value={4} onChange={vi.fn()} label="评分" />);
      expect(screen.getByText('评分')).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击星星应该调用 onChange', () => {
      const onChange = vi.fn();
      render(<ScoreInput value={0} onChange={onChange} />);

      const stars = screen.getAllByRole('button');
      fireEvent.click(stars[3]);

      expect(onChange).toHaveBeenCalledWith(4);
    });
  });

  describe('边界测试', () => {
    it('零值应该正常渲染', () => {
      render(<ScoreInput value={0} onChange={vi.fn()} />);
      expect(screen.getAllByRole('button').length).toBe(5);
    });

    it('满分应该正常渲染', () => {
      render(<ScoreInput value={5} onChange={vi.fn()} />);
      expect(screen.getAllByRole('button').length).toBe(5);
    });
  });
});
