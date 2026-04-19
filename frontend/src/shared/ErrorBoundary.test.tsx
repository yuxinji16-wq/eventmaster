/**
 * ErrorBoundary 组件测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React, { Component, ErrorInfo } from 'react';
import ErrorBoundary from './ErrorBoundary';

// 测试组件 - 正常渲染
const NormalComponent = () => (
  <div>正常内容</div>
);

// 测试组件 - 抛出错误
const ErrorComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
  if (shouldThrow) {
    throw new Error('测试错误');
  }
  return <div>没有错误</div>;
};

describe('ErrorBoundary 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染子组件', () => {
      render(
        <ErrorBoundary>
          <NormalComponent />
        </ErrorBoundary>
      );
      expect(screen.getByText('正常内容')).toBeInTheDocument();
    });

    it('没有子组件时应该正常渲染', () => {
      render(<ErrorBoundary />);
      // 不应该报错
    });
  });

  describe('错误处理测试', () => {
    it('子组件错误时应该显示错误信息', () => {
      render(
        <ErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('页面加载出错')).toBeInTheDocument();
      expect(screen.getByText('请联系管理员检查错误日志')).toBeInTheDocument();
    });

    it('错误后应该显示重试按钮', () => {
      render(
        <ErrorBoundary>
          <ErrorComponent shouldThrow={true} />
        </ErrorBoundary>
      );
      expect(screen.getByText('重新加载')).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('空 children 应该正常渲染', () => {
      const { container } = render(<ErrorBoundary>{null}</ErrorBoundary>);
      expect(container).toBeInTheDocument();
    });
  });
});
