import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'system';
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  module?: string;  // 'activity' | 'material' | 'budget' | 'supplier' | 'opportunity' | 'review' | 'system'
  actionUrl?: string;  // 点击后跳转的路径
  metadata?: Record<string, any>;  // 附加数据
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  isOpen: boolean;
  filter: 'all' | 'unread';
  setIsOpen: (open: boolean) => void;
  setFilter: (filter: 'all' | 'unread') => void;
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAll: () => void;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function useNotification(): NotificationContextType {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    return {
      notifications: [],
      unreadCount: 0,
      isLoading: false,
      isOpen: false,
      filter: 'all',
      setIsOpen: () => {},
      setFilter: () => {},
      addNotification: () => {},
      markAsRead: () => {},
      markAllAsRead: () => {},
      deleteNotification: () => {},
      clearAll: () => {},
      fetchNotifications: async () => {},
    };
  }
  return ctx;
}

// 自动生成示例通知（模拟后端推送）
function generateSampleNotifications(): Notification[] {
  return [
    {
      id: 'notif-1',
      type: 'warning',
      title: '物料库存不足',
      content: '品牌易拉宝当前库存仅剩 5 个，请及时补充。',
      priority: 'high',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30分钟前
      module: 'material',
      actionUrl: '/materials',
      metadata: { materialId: '3', materialName: '品牌易拉宝', currentStock: 5 },
    },
    {
      id: 'notif-2',
      type: 'info',
      title: '活动即将开始',
      content: '2025春季新品发布会将于 3 天后（2025-03-20）举行。',
      priority: 'normal',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2小时前
      module: 'activity',
      actionUrl: '/activities/7',
      metadata: { activityId: 7 },
    },
    {
      id: 'notif-3',
      type: 'success',
      title: '复盘已完成',
      content: '2024 全球科技峰会复盘报告已生成，可前往查看。',
      priority: 'normal',
      isRead: true,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1天前
      module: 'review',
      actionUrl: '/reviews/1',
    },
    {
      id: 'notif-4',
      type: 'system',
      title: '系统更新通知',
      content: 'EventMaster Pro 已更新至 v1.1.0，新增预算分析和商机转化模块。',
      priority: 'low',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      module: 'system',
    },
    {
      id: 'notif-5',
      type: 'error',
      title: '预算超支预警',
      content: '智能制造行业峰会当前执行率已达 96.25%，接近超支，请关注。',
      priority: 'urgent',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15分钟前
      module: 'budget',
      actionUrl: '/budget',
      metadata: { activityId: 9, executionRate: 96.25 },
    },
    {
      id: 'notif-6',
      type: 'success',
      title: '新商机录入',
      content: '头部金融机构录入新商机，预估价值 ¥2,000,000。',
      priority: 'normal',
      isRead: false,
      createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45分钟前
      module: 'opportunity',
      actionUrl: '/opportunities/5',
    },
  ];
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const initialized = useRef(false);

  // 从 localStorage 加载通知
  const loadFromStorage = useCallback(() => {
    try {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return generateSampleNotifications();
  }, []);

  // 保存到 localStorage
  const saveToStorage = useCallback((notifs: Notification[]) => {
    try {
      localStorage.setItem('notifications', JSON.stringify(notifs));
    } catch {}
  }, []);

  // 初始化
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      const initial = loadFromStorage();
      setNotifications(initial);
      saveToStorage(initial);
    }
  }, [loadFromStorage, saveToStorage]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => {
      const updated = [newNotif, ...prev];
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, isRead: true }));
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => {
      const updated = prev.filter(n => n.id !== id);
      saveToStorage(updated);
      return updated;
    });
  }, [saveToStorage]);

  const clearAll = useCallback(() => {
    setNotifications([]);
    saveToStorage([]);
  }, [saveToStorage]);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: 后续接入真实后端 API
      await new Promise(resolve => setTimeout(resolve, 500));
      const stored = loadFromStorage();
      setNotifications(stored);
    } finally {
      setIsLoading(false);
    }
  }, [loadFromStorage]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      isLoading,
      isOpen,
      filter,
      setIsOpen,
      setFilter,
      addNotification,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      fetchNotifications,
    }}>
      {children}
    </NotificationContext.Provider>
  );
}
