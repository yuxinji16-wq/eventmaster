/**
 * Toast 通知系统
 * EventMaster Pro - 全生命周期活动管理平台
 */
import React, { createContext, useContext, useState, useCallback, useRef } from 'react';

// Toast 类型
export type ToastType = 'success' | 'error' | 'warning' | 'info';

// Toast 项结构
export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  code?: string; // 错误码
}

// Toast 上下文类型
interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, message?: string) => string;
  error: (title: string, message?: string, code?: string) => string;
  warning: (title: string, message?: string) => string;
  info: (title: string, message?: string) => string;
}

const ToastContext = createContext<ToastContextType | null>(null);

// 使用 Toast 的 Hook
export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (!context) {
    // 返回一个模拟的 context，避免在 provider 外使用时报错
    return {
      toasts: [],
      addToast: () => '',
      removeToast: () => {},
      clearToasts: () => {},
      success: () => '',
      error: () => '',
      warning: () => '',
      info: () => '',
    };
  }
  return context;
}

// Toast 提供者组件
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastIdCounter = useRef(0);

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${toastIdCounter.current++}`;
    const newToast: Toast = { ...toast, id };

    setToasts(prev => {
      // 避免重复错误 toast（相同 code 在 3 秒内只显示一次）
      if (toast.type === 'error' && toast.code) {
        const recentDuplicate = prev.find(
          t => t.type === 'error' && t.code === toast.code &&
          new Date().getTime() - parseInt(t.id.split('-')[1]) < 3000
        );
        if (recentDuplicate) return prev;
      }

      // 限制最大 toast 数量
      const limited = prev.slice(-9);
      return [...limited, newToast];
    });

    // 自动移除
    const duration = toast.duration ?? (toast.type === 'error' ? 8000 : 5000);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const clearToasts = useCallback(() => {
    setToasts([]);
  }, []);

  const success = useCallback((title: string, message?: string) => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string, code?: string) => {
    return addToast({ type: 'error', title, message, duration: 8000, code });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string) => {
    return addToast({ type: 'warning', title, message, duration: 6000 });
  }, [addToast]);

  const info = useCallback((title: string, message?: string) => {
    return addToast({ type: 'info', title, message, duration: 5000 });
  }, [addToast]);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts, success, error, warning, info }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

// Toast 容器组件
function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

// 单个 Toast 项
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const typeClasses: Record<ToastType, { bg: string; border: string; text: string; icon: React.ReactNode }> = {
    success: {
      bg: 'bg-white',
      border: 'border-emerald-200',
      text: 'text-slate-800',
      icon: (
        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
    },
    error: {
      bg: 'bg-white',
      border: 'border-rose-200',
      text: 'text-slate-800',
      icon: (
        <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      ),
    },
    warning: {
      bg: 'bg-white',
      border: 'border-amber-200',
      text: 'text-slate-800',
      icon: (
        <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
      ),
    },
    info: {
      bg: 'bg-white',
      border: 'border-blue-200',
      text: 'text-slate-800',
      icon: (
        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
    },
  };

  const style = typeClasses[toast.type];

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg
        transform transition-all duration-300 ease-out
        hover:shadow-xl hover:scale-[1.02]
        ${style.bg} ${style.border}
        pointer-events-auto
      `}
    >
      <div className="flex-shrink-0">{style.icon}</div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${style.text}`}>{toast.title}</p>
        {toast.message && (
          <p className={`text-sm mt-0.5 text-slate-500`}>{toast.message}</p>
        )}
        {toast.code && (
          <p className="text-xs mt-1.5 font-mono text-slate-400">错误码: {toast.code}</p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default ToastProvider;
