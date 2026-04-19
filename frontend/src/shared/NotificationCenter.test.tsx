/**
 * NotificationCenter 组件测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { NotificationProvider, useNotification } from './NotificationContext';
import NotificationCenter from './NotificationCenter';

// 测试组件 - 使用 NotificationContext
const TestWrapper = ({ isOpen = true }: { isOpen?: boolean }) => {
  const { setIsOpen } = useNotification();

  React.useEffect(() => {
    setIsOpen(isOpen);
  }, [isOpen, setIsOpen]);

  return <NotificationCenter />;
};

const mockNotifications = [
  {
    id: 'notif-1',
    type: 'warning' as const,
    title: '物料库存不足',
    content: '品牌易拉宝当前库存仅剩 5 个',
    priority: 'high' as const,
    module: 'material',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-2',
    type: 'info' as const,
    title: '活动即将开始',
    content: '2025春季新品发布会将于 3 天后举行',
    priority: 'normal' as const,
    module: 'activity',
    isRead: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'notif-3',
    type: 'system' as const,
    title: '系统更新通知',
    content: 'EventMaster Pro 已更新至 v1.1.0',
    priority: 'low' as const,
    module: 'system',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
];

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock as any;

describe('NotificationCenter 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify(mockNotifications));
  });

  describe('渲染测试', () => {
    it('应该渲染通知中心标题', async () => {
      render(
        <NotificationProvider>
          <TestWrapper isOpen={true} />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('通知中心')).toBeInTheDocument();
      });
    });

    it('应该渲染通知列表', async () => {
      render(
        <NotificationProvider>
          <TestWrapper isOpen={true} />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('物料库存不足')).toBeInTheDocument();
        expect(screen.getByText('活动即将开始')).toBeInTheDocument();
      });
    });

    it('应该显示全部标为已读按钮', async () => {
      render(
        <NotificationProvider>
          <TestWrapper isOpen={true} />
        </NotificationProvider>
      );

      await waitFor(() => {
        expect(screen.getByText('全部已读')).toBeInTheDocument();
      });
    });
  });

  describe('边界测试', () => {
    it('isOpen 为 false 时不渲染', () => {
      render(
        <NotificationProvider>
          <TestWrapper isOpen={false} />
        </NotificationProvider>
      );

      expect(screen.queryByText('通知中心')).not.toBeInTheDocument();
    });
  });
});
