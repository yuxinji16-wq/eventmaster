/**
 * React 错误边界组件
 * EventMaster Pro - 全生命周期活动管理平台
 */
import React, { Component, ReactNode } from 'react';
import { ErrorCode, ErrorMessages, parseBackendError, AppError } from '../types/errors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  /** 错误恢复时是否显示重试按钮 */
  showRetry?: boolean;
}

interface State {
  hasError: boolean;
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    const appError: AppError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: error?.message || '发生意外错误',
      severity: 'critical',
      context: {},
      timestamp: new Date().toISOString(),
      originalError: error,
    };
    return { hasError: true, error: appError, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const appError: AppError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: error?.message || '发生意外错误',
      severity: 'critical',
      context: { componentStack: errorInfo.componentStack },
      timestamp: new Date().toISOString(),
      originalError: error,
    };

    this.setState({ errorInfo });

    // 记录错误日志
    console.error('[ErrorBoundary] Caught error:', appError);

    // 调用回调
    this.props.onError?.(appError, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <div className="text-center max-w-md">
            {/* 错误图标 */}
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-rose-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>

            {/* 错误消息 */}
            <h2 className="text-xl font-bold text-slate-800 mb-2">
              {ErrorMessages[this.state.error.code] || this.state.error.message}
            </h2>

            {/* 错误码 */}
            {this.state.error.code !== ErrorCode.INTERNAL_ERROR && (
              <p className="text-sm text-slate-500 mb-4">
                错误代码: <code className="bg-slate-100 px-2 py-0.5 rounded font-mono">{this.state.error.code}</code>
              </p>
            )}

            {/* 操作按钮 */}
            <div className="flex gap-3 justify-center mt-6">
              {this.props.showRetry !== false && (
                <button
                  onClick={this.handleRetry}
                  className="px-4 py-2 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
                >
                  重试
                </button>
              )}
              <button
                onClick={this.handleGoHome}
                className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-all shadow-sm"
              >
                返回首页
              </button>
            </div>

            {/* 开发环境额外信息 */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-slate-400 cursor-pointer hover:text-slate-600">
                  展开开发环境详情
                </summary>
                <pre className="mt-2 p-3 bg-slate-800 text-slate-100 rounded-lg text-xs overflow-auto max-h-48">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
