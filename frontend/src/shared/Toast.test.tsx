/**
 * Toast 组件测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { ToastProvider, useToast } from './Toast';

// 测试组件
const TestComponent = () => {
  const toast = useToast();
  return (
    <div>
      <button onClick={() => toast.success('成功消息', '操作成功')}>成功</button>
      <button onClick={() => toast.error('错误消息', '出错了')}>错误</button>
      <button onClick={() => toast.warning('警告消息', '请注意')}>警告</button>
      <button onClick={() => toast.info('信息消息', '提示一下')}>信息</button>
    </div>
  );
};

describe('Toast 组件', () => {
  describe('渲染测试', () => {
    it('应该渲染 ToastProvider', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      expect(screen.getByText('成功')).toBeInTheDocument();
      expect(screen.getByText('错误')).toBeInTheDocument();
      expect(screen.getByText('警告')).toBeInTheDocument();
      expect(screen.getByText('信息')).toBeInTheDocument();
    });

    it('应该渲染所有按钮', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBe(4);
    });
  });

  describe('交互测试', () => {
    it('点击成功按钮不应报错', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      const successButton = screen.getByText('成功');
      expect(() => fireEvent.click(successButton)).not.toThrow();
    });

    it('点击错误按钮不应报错', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      const errorButton = screen.getByText('错误');
      expect(() => fireEvent.click(errorButton)).not.toThrow();
    });

    it('点击警告按钮不应报错', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      const warningButton = screen.getByText('警告');
      expect(() => fireEvent.click(warningButton)).not.toThrow();
    });

    it('点击信息按钮不应报错', () => {
      render(
        <ToastProvider>
          <TestComponent />
        </ToastProvider>
      );
      const infoButton = screen.getByText('信息');
      expect(() => fireEvent.click(infoButton)).not.toThrow();
    });
  });

  describe('边界测试', () => {
    it('在 ToastProvider 外使用 useToast 应该抛出错误', () => {
      // 这应该抛出错误，因为 useToast 必须在 ToastProvider 内使用
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() => {
        render(<TestComponent />);
      }).toThrow();
      consoleError.mockRestore();
    });
  });
});
