import React, { useRef, useEffect } from 'react';
import { useNotification, Notification } from './NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Bell, CheckCheck, Trash2, X, Clock, AlertTriangle, Info, CheckCircle, XCircle, Cpu, ChevronRight } from 'lucide-react';

const typeConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; border: string }> = {
  success: {
    icon: <CheckCircle size={14} className="text-emerald-500" />,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-100',
  },
  error: {
    icon: <XCircle size={14} className="text-rose-500" />,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-100',
  },
  warning: {
    icon: <AlertTriangle size={14} className="text-amber-500" />,
    color: 'text-amber-700',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
  },
  info: {
    icon: <Info size={14} className="text-blue-500" />,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
  },
  system: {
    icon: <Cpu size={14} className="text-indigo-500" />,
    color: 'text-indigo-700',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
  },
};

const priorityBadge: Record<string, { label: string; color: string }> = {
  urgent: { label: '紧急', color: 'bg-rose-100 text-rose-600' },
  high: { label: '重要', color: 'bg-amber-100 text-amber-600' },
  normal: { label: '一般', color: 'bg-slate-100 text-slate-500' },
  low: { label: '低', color: 'bg-slate-50 text-slate-400' },
};

function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return '刚刚';
  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
}

const NotificationItem: React.FC<{ notification: Notification; onRead: (id: string) => void; onDelete: (id: string) => void; onClick: () => void }> = ({ notification, onRead, onDelete, onClick }) => {
  const cfg = typeConfig[notification.type] || typeConfig.info;
  const prio = priorityBadge[notification.priority] || priorityBadge.normal;

  const handleReadClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRead(notification.id);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(notification.id);
  };

  const handleItemClick = () => {
    onClick();
  };

  return (
    <div
      onClick={handleItemClick}
      className={`relative p-4 border-b border-slate-50 cursor-pointer transition-all hover:bg-slate-50 ${!notification.isRead ? 'bg-indigo-50/30 hover:bg-indigo-50/50' : ''}`}
    >
      {!notification.isRead && (
        <span className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-indigo-500 rounded-full" />
      )}
      <div className="flex items-start gap-3 pl-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${cfg.bg}`}>
          {cfg.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-black px-1.5 py-0.5 rounded ${prio.color}`}>{prio.label}</span>
            <span className={`text-xs font-semibold ${cfg.color}`}>{notification.title}</span>
          </div>
          <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">{notification.content}</p>
          <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
            <Clock size={10} />
            <span>{formatTime(notification.createdAt)}</span>
            {notification.module && notification.module !== 'system' && (
              <>
                <span>·</span>
                <span className="capitalize">{notification.module}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1 shrink-0" onClick={e => e.stopPropagation()}>
          {notification.actionUrl && (
            <button
              onClick={handleItemClick}
              className="p-1 text-slate-300 hover:text-indigo-500 rounded transition-colors"
              title="查看详情"
            >
              <ChevronRight size={14} />
            </button>
          )}
          <button
            onClick={handleReadClick}
            className="p-1 text-slate-300 hover:text-emerald-500 rounded transition-colors"
            title="标为已读"
          >
            <CheckCheck size={14} />
          </button>
          <button
            onClick={handleDeleteClick}
            className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors"
            title="删除"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

const NotificationCenter: React.FC = () => {
  const { notifications, unreadCount, isOpen, setIsOpen, filter, setFilter, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotification();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  // 根据过滤状态显示通知（最多显示20条）
  const displayNotifications = (filter === 'unread'
    ? notifications.filter(n => !n.isRead)
    : notifications).slice(0, 20);
  const displayCount = filter === 'unread' ? unreadCount : notifications.length;

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const bellBtn = document.getElementById('notification-bell');
        if (!bellBtn?.contains(e.target as Node)) {
          setIsOpen(false);
        }
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setIsOpen]);

  const handleNotificationClick = (notif: Notification) => {
    markAsRead(notif.id);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
      setIsOpen(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full mt-3 w-[420px] bg-white rounded-3xl shadow-2xl border border-slate-100 z-[100] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
      style={{ maxHeight: 'calc(100vh - 120px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-indigo-600 to-purple-600 shrink-0">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-white" />
          <h3 className="text-lg font-black text-white tracking-tight">通知中心</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 bg-white text-indigo-600 text-xs font-black rounded-full">
              {unreadCount} 未读
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-1 px-3 py-1.5 text-white/80 text-xs font-bold hover:text-white hover:bg-white/10 rounded-lg transition-all"
              title="全部标为已读"
            >
              <CheckCheck size={14} /> 全部已读
            </button>
          )}
          <button
            onClick={clearAll}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            title="清空所有"
          >
            <Trash2 size={16} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-4 py-3 bg-slate-50/50 border-b border-slate-100 shrink-0">
        <span
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 text-xs font-black rounded-xl cursor-pointer transition-all ${filter === 'all' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
        >全部 ({notifications.length})</span>
        <span
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 text-xs font-bold rounded-xl cursor-pointer transition-all ${filter === 'unread' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-400 hover:bg-white hover:text-slate-600'}`}
        >未读 ({unreadCount})</span>
      </div>

      {/* Notification list */}
      <div className="overflow-y-auto" style={{ maxHeight: '480px' }}>
        {displayNotifications.length > 0 ? (
          displayNotifications.map(notif => (
            <NotificationItem
              key={notif.id}
              notification={notif}
              onRead={markAsRead}
              onDelete={deleteNotification}
              onClick={() => handleNotificationClick(notif)}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-slate-300">
            <Bell size={48} strokeWidth={1} className="mb-4 opacity-40" />
            <p className="text-sm font-bold">{filter === 'unread' ? '暂无未读通知' : '暂无通知'}</p>
            <p className="text-xs text-slate-400 mt-1">{filter === 'unread' ? '所有消息都已处理完毕' : '所有消息都已处理完毕'}</p>
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 20 && (
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 shrink-0">
          <button className="w-full py-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            查看全部 {notifications.length} 条通知
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
