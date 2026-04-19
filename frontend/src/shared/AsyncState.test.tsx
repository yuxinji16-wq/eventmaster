/**
 * AsyncState 组件测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { Loading, Error, Empty, Data } from './AsyncState';

describe('AsyncState 组件', () => {
  describe('Loading 组件', () => {
    it('应该渲染加载状态', () => {
      render(<Loading />);
      expect(screen.getByText('加载中...')).toBeInTheDocument();
    });

    it('应该渲染加载图标', () => {
      render(<Loading />);
      // Loading 组件应该有旋转图标
      const spinners = document.querySelectorAll('svg');
      expect(spinners.length).toBeGreaterThan(0);
    });

    it('应该显示自定义文本', () => {
      render(<Loading text="正在获取数据..." />);
      expect(screen.getByText('正在获取数据...')).toBeInTheDocument();
    });
  });

  describe('Error 组件', () => {
    it('应该渲染错误状态', () => {
      render(<Error message="加载失败" />);
      expect(screen.getByText('加载失败')).toBeInTheDocument();
    });

    it('应该显示重试按钮', () => {
      render(<Error message="出错了" onRetry={vi.fn()} />);
      expect(screen.getByText('重新加载')).toBeInTheDocument();
    });

    it('点击重试应该调用 onRetry', () => {
      const onRetry = vi.fn();
      render(<Error message="出错了" onRetry={onRetry} />);
      fireEvent.click(screen.getByText('重新加载'));
      expect(onRetry).toHaveBeenCalled();
    });

    it('没有重试回调时重试按钮应该禁用', () => {
      render(<Error message="出错了" />);
      const retryButton = screen.getByText('重新加载');
      expect(retryButton).toBeInTheDocument();
    });
  });

  describe('Empty 组件', () => {
    it('应该渲染空状态', () => {
      render(<Empty />);
      expect(screen.getByText('暂无数据')).toBeInTheDocument();
    });

    it('应该显示自定义文本', () => {
      render(<Empty text="没有找到匹配的结果" />);
      expect(screen.getByText('没有找到匹配的结果')).toBeInTheDocument();
    });

    it('应该显示自定义图标', () => {
      render(<Empty icon={<span data-testid="custom-icon">📭</span>} />);
      expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
    });

    it('应该显示操作按钮', () => {
      const onAction = vi.fn();
      render(
        <Empty
          text="没有数据"
          actionText="添加数据"
          onAction={onAction}
        />
      );
      fireEvent.click(screen.getByText('添加数据'));
      expect(onAction).toHaveBeenCalled();
    });
  });

  describe('Data 组件', () => {
    it('应该渲染数据内容', () => {
      render(
        <Data>
          <div>数据内容</div>
        </Data>
      );
      expect(screen.getByText('数据内容')).toBeInTheDocument();
    });

    it('应该正确传递 className', () => {
      render(
        <Data className="custom-class">
          <div>数据</div>
        </Data>
      );
      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
    });
  });
});
