/**
 * 错误日志服务
 * EventMaster Pro - 全生命周期活动管理平台
 */
import { AppError, ErrorCode } from '../types/errors';

// 错误日志存储键名
const ERROR_LOG_KEY = 'eventmaster_error_log';
const MAX_LOCAL_LOGS = 100;

// 错误日志条目
interface ErrorLogEntry {
  code: string;
  message: string;
  severity: string;
  context: Record<string, unknown>;
  timestamp: string;
  userAgent?: string;
  url?: string;
}

/**
 * 获取本地错误日志
 */
export function getErrorLog(): ErrorLogEntry[] {
  try {
    const stored = localStorage.getItem(ERROR_LOG_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * 添加错误到本地日志
 */
export function addToErrorLog(error: AppError): void {
  try {
    const logs = getErrorLog();
    const entry: ErrorLogEntry = {
      code: error.code,
      message: error.message,
      severity: error.severity,
      context: error.context,
      timestamp: error.timestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    logs.unshift(entry);

    // 保持只保留最近的日志
    const trimmed = logs.slice(0, MAX_LOCAL_LOGS);
    localStorage.setItem(ERROR_LOG_KEY, JSON.stringify(trimmed));
  } catch (e) {
    console.error('Failed to add to error log:', e);
  }
}

/**
 * 清除本地错误日志
 */
export function clearErrorLog(): void {
  try {
    localStorage.removeItem(ERROR_LOG_KEY);
  } catch (e) {
    console.error('Failed to clear error log:', e);
  }
}

/**
 * 获取错误统计
 */
export function getErrorStats(): {
  total: number;
  byCode: Record<string, number>;
  bySeverity: Record<string, number>;
} {
  const logs = getErrorLog();
  const byCode: Record<string, number> = {};
  const bySeverity: Record<string, number> = {};

  logs.forEach(log => {
    byCode[log.code] = (byCode[log.code] || 0) + 1;
    bySeverity[log.severity] = (bySeverity[log.severity] || 0) + 1;
  });

  return {
    total: logs.length,
    byCode,
    bySeverity,
  };
}

/**
 * 上报错误到服务器（预留接口）
 */
export async function reportErrorToServer(error: AppError): Promise<void> {
  try {
    // 在实际实现中，这会 POST 到后端错误日志端点
    // POST /api/v1/logs/errors
  } catch (e) {
    // 静默处理上报失败，不影响主流程
  }
}

/**
 * 初始化全局错误跟踪
 * 设置 window.onerror 和 window.onunhandledrejection 处理器
 */
export function initializeErrorTracking(): void {
  // 捕获未处理的 Promise 拒绝
  window.addEventListener('unhandledrejection', (event) => {
    const error: AppError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: event.reason?.message || 'Unhandled promise rejection',
      severity: 'error',
      context: { type: 'unhandledrejection' },
      timestamp: new Date().toISOString(),
      originalError: event.reason,
    };

    addToErrorLog(error);
    reportErrorToServer(error);

    // 开发环境显示详细信息
    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorTracking] Unhandled promise rejection:', event.reason);
    }
  });

  // 捕获全局 JavaScript 错误
  window.addEventListener('error', (event) => {
    const error: AppError = {
      code: ErrorCode.INTERNAL_ERROR,
      message: event.message || 'Global error',
      severity: 'error',
      context: {
        type: 'global_error',
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      },
      timestamp: new Date().toISOString(),
    };

    addToErrorLog(error);
    reportErrorToServer(error);

    if (process.env.NODE_ENV === 'development') {
      console.error('[ErrorTracking] Global error:', event);
    }
  });

  // 捕获资源加载错误（如图片、脚本加载失败）
  window.addEventListener('error', (event) => {
    if (event.target !== window) {
      const error: AppError = {
        code: ErrorCode.INTERNAL_ERROR,
        message: `Resource load error: ${(event.target as HTMLElement)?.tagName || 'unknown'}`,
        severity: 'warning',
        context: {
          type: 'resource_error',
          url: (event.target as HTMLScriptElement | HTMLImageElement)?.src || '',
        },
        timestamp: new Date().toISOString(),
      };

      addToErrorLog(error);

      if (process.env.NODE_ENV === 'development') {
        console.warn('[ErrorTracking] Resource error:', event.target);
      }
    }
  }, true);

// 错误追踪初始化完成
}

/**
 * 创建错误日志中间件（用于 API 调用）
 */
export function createApiErrorHandler() {
  return {
    onError: (error: unknown, endpoint: string) => {
      let appError: AppError;

      if (error instanceof Response || (typeof error === 'object' && error !== null && 'status' in error)) {
        const response = error as Response;
        response.json().then((data) => {
          appError = parseBackendError(data);
          addToErrorLog(appError);
          reportErrorToServer(appError);
        }).catch(() => {
          appError = {
            code: ErrorCode.INTERNAL_ERROR,
            message: `API Error: ${response.status}`,
            severity: 'error',
            context: { endpoint, status: response.status },
            timestamp: new Date().toISOString(),
          };
          addToErrorLog(appError);
        });
      } else {
        appError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: error instanceof Error ? error.message : String(error),
          severity: 'error',
          context: { endpoint },
          timestamp: new Date().toISOString(),
          originalError: error instanceof Error ? error : undefined,
        };
        addToErrorLog(appError);
        reportErrorToServer(appError);
      }

      return appError;
    },
  };
}

function parseBackendError(response: unknown): AppError {
  if (typeof response === 'object' && response !== null && 'code' in response) {
    const r = response as { code: string; message: string; context?: Record<string, unknown> };
    return {
      code: r.code,
      message: r.message,
      severity: r.code.startsWith('E9') ? 'critical' : 'error',
      context: r.context || {},
      timestamp: new Date().toISOString(),
    };
  }
  return {
    code: ErrorCode.INTERNAL_ERROR,
    message: 'Unknown error',
    severity: 'error',
    context: {},
    timestamp: new Date().toISOString(),
  };
}

export default {
  getErrorLog,
  addToErrorLog,
  clearErrorLog,
  getErrorStats,
  reportErrorToServer,
  initializeErrorTracking,
  createApiErrorHandler,
};
