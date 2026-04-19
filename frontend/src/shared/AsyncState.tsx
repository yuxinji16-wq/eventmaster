import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AsyncStateProps {
  loading?: boolean;
  loadingText?: string;
  error?: string | null;
  errorTitle?: string;
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

export const AsyncState: React.FC<AsyncStateProps> = ({
  loading = false,
  loadingText = '加载中...',
  error = null,
  errorTitle = '加载失败',
  empty = false,
  emptyTitle = '暂无数据',
  emptyDescription,
  onRetry,
  children
}) => {
  if (loading) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
        <p className="text-center text-sm text-slate-400 -mt-4">{loadingText}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-rose-100">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle size={36} className="text-rose-300 mb-4" />
          <p className="text-slate-700 font-semibold text-lg">{errorTitle}</p>
          <p className="text-sm text-slate-500 mt-2 max-w-sm">{error}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-6 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
            >
              重试
            </button>
          )}
        </div>
      </div>
    );
  }

  if (empty) {
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-slate-600 font-semibold text-lg">{emptyTitle}</p>
          {emptyDescription && <p className="text-sm text-slate-400 mt-2 max-w-sm">{emptyDescription}</p>}
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
