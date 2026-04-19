/**
 * ScoreCard 组件测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import ScoreCard from './ScoreCard';

describe('ScoreCard 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染分数', () => {
      render(<ScoreCard score={4.5} label="综合评分" color="indigo" />);
      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('综合评分')).toBeInTheDocument();
    });

    it('应该渲染标签', () => {
      render(<ScoreCard score={3.0} label="质量评分" color="emerald" />);
      expect(screen.getByText('质量评分')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('零分应该正常显示', () => {
      render(<ScoreCard score={0} label="零分" color="amber" />);
      expect(screen.getByText('0.0')).toBeInTheDocument();
    });
  });
});
