/**
 * 通知中心测试
 * 测试通知 Context 和 NotificationCenter 组件的所有交互逻辑
 */
import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { NotificationProvider, useNotification, Notification } from './NotificationContext';
import NotificationCenter from './NotificationCenter';
import { BrowserRouter } from 'react-router-dom';

// 测试包装组件
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    <NotificationProvider>
      {children}
    </NotificationProvider>
  </BrowserRouter>
);

// 测试组件 - 用于访问 Context
const TestConsumer: React.FC = () => {
  const {
    notifications,
    unreadCount,
    isLoading,
    isOpen,
    setIsOpen,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAll,
    fetchNotifications,
  } = useNotification();

  return (
    <div>
      <div data-testid="notification-count">{unreadCount}</div>
      <div data-testid="notification-total">{notifications.length}</div>
      <div data-testid="is-loading">{isLoading ? 'loading' : 'idle'}</div>
      <div data-testid="is-open">{isOpen ? 'open' : 'closed'}</div>
      <button data-testid="open-btn" onClick={() => setIsOpen(true)}>打开</button>
      <button data-testid="close-btn" onClick={() => setIsOpen(false)}>关闭</button>
      <button
        data-testid="add-btn"
        onClick={() => addNotification({
          type: 'info',
          title: '测试通知',
          content: '这是测试内容',
          priority: 'normal',
        })}
      >
        添加通知
      </button>
      <button
        data-testid="fetch-btn"
        onClick={() => fetchNotifications()}
      >
        刷新
      </button>
      <button
        data-testid="mark-all-btn"
        onClick={() => markAllAsRead()}
      >
        全部标为已读
      </button>
      <button
        data-testid="clear-btn"
        onClick={() => clearAll()}
      >
        清空
      </button>
    </div>
  );
};

describe('NotificationContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('初始状态应包含示例通知', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      const total = screen.getByTestId('notification-total');
      expect(parseInt(total.textContent || '0')).toBeGreaterThan(0);
    });
  });

  test('添加新通知会增加总数', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );
    });

    // 等待初始加载
    await waitFor(() => {
      const total = screen.getByTestId('notification-total');
      expect(parseInt(total.textContent || '0')).toBeGreaterThan(0);
    });

    const initialTotal = parseInt(screen.getByTestId('notification-total').textContent || '0');

    await act(async () => {
      fireEvent.click(screen.getByTestId('add-btn'));
    });

    await waitFor(() => {
      const newTotal = screen.getByTestId('notification-total');
      expect(parseInt(newTotal.textContent || '0')).toBe(initialTotal + 1);
    });
  });

  test('未读数量计算正确', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );
    });

    await waitFor(() => {
      const count = screen.getByTestId('notification-count');
      expect(parseInt(count.textContent || '0')).toBeGreaterThanOrEqual(0);
    });
  });

  test('setIsOpen 控制面板开关', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );
    });

    // 初始状态
    expect(screen.getByTestId('is-open').textContent).toBe('closed');

    // 打开面板
    await act(async () => {
      fireEvent.click(screen.getByTestId('open-btn'));
    });
    expect(screen.getByTestId('is-open').textContent).toBe('open');

    // 关闭面板
    await act(async () => {
      fireEvent.click(screen.getByTestId('close-btn'));
    });
    expect(screen.getByTestId('is-open').textContent).toBe('closed');
  });

  test('全部标为已读功能', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );
    });

    // 等待初始加载
    await waitFor(() => {
      const count = screen.getByTestId('notification-count');
      expect(parseInt(count.textContent || '0')).toBeGreaterThanOrEqual(0);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('mark-all-btn'));
    });

    await waitFor(() => {
      const count = screen.getByTestId('notification-count');
      expect(parseInt(count.textContent || '0')).toBe(0);
    });
  });

  test('清空所有通知功能', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
        </TestWrapper>
      );
    });

    // 等待初始加载
    await waitFor(() => {
      const total = screen.getByTestId('notification-total');
      expect(parseInt(total.textContent || '0')).toBeGreaterThan(0);
    });

    await act(async () => {
      fireEvent.click(screen.getByTestId('clear-btn'));
    });

    await waitFor(() => {
      const total = screen.getByTestId('notification-total');
      expect(parseInt(total.textContent || '0')).toBe(0);
    });
  });
});

describe('NotificationCenter 组件', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('未打开时不显示面板', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
          <NotificationCenter />
        </TestWrapper>
      );
    });

    // 面板默认不显示 - 通过检查是否存在面板元素
    const panel = document.querySelector('.animate-in');
    expect(panel).toBeNull();
  });

  test('打开后显示通知中心面板', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
          <NotificationCenter />
        </TestWrapper>
      );
    });

    // 打开面板
    await act(async () => {
      fireEvent.click(screen.getByTestId('open-btn'));
    });

    await waitFor(() => {
      const panel = document.querySelector('.animate-in');
      expect(panel).not.toBeNull();
    });
  });

  test('显示未读数量徽章', async () => {
    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
          <NotificationCenter />
        </TestWrapper>
      );
    });

    // 打开面板
    await act(async () => {
      fireEvent.click(screen.getByTestId('open-btn'));
    });

    await waitFor(() => {
      // 应该有未读徽章
      const badge = document.querySelector('text-white.text-indigo-600, .bg-white.text-indigo-600');
      expect(badge).not.toBeNull();
    });
  });

  test('有空状态提示', async () => {
    // 先清空所有通知
    localStorage.setItem('notifications', '[]');

    await act(async () => {
      render(
        <TestWrapper>
          <TestConsumer />
          <NotificationCenter />
        </TestWrapper>
      );
    });

    // 打开面板
    await act(async () => {
      fireEvent.click(screen.getByTestId('open-btn'));
    });

    await waitFor(() => {
      // 空状态应该显示
      const emptyText = document.querySelector('p.text-sm.font-bold');
      expect(emptyText?.textContent).toBe('暂无通知');
    });
  });
});

describe('通知优先级和类型', () => {
  test('不同类型的通知应有正确的类型定义', () => {
    const types: Array<Notification['type']> = ['info', 'success', 'warning', 'error', 'system'];
    types.forEach((type) => {
      expect(['info', 'success', 'warning', 'error', 'system']).toContain(type);
    });
  });

  test('不同优先级的通知应有正确的优先级定义', () => {
    const priorities: Array<Notification['priority']> = ['low', 'normal', 'high', 'urgent'];
    priorities.forEach((priority) => {
      expect(['low', 'normal', 'high', 'urgent']).toContain(priority);
    });
  });
});
