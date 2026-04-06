/**
 * 集中错误处理 Hook
 * EventMaster Pro - 全生命周期活动管理平台
 */
import { useCallback } from 'react';
import { useToast } from '../shared/Toast';
import {
  parseBackendError,
  isBackendError,
  isNetworkError,
  AppError,
  ErrorCode,
  ErrorMessages,
} from '../types/errors';

/**
 * 错误处理返回类型
 */
interface UseErrorHandlerReturn {
  /** 处理错误并显示 toast */
  handleError: (error: unknown, fallbackMessage?: string) => AppError | null;
  /** 处理后端返回的错误响应 */
  handleBackendError: (response: unknown, fallbackMessage?: string) => AppError | null;
  /** 处理网络错误 */
  handleNetworkError: (error: unknown, fallbackMessage?: string) => AppError | null;
  /** 通用错误处理（自动判断类型） */
  handle: (error: unknown, fallbackMessage?: string) => AppError | null;
}

/**
 * 集中错误处理 Hook
 * 提供统一的错误处理和 toast 通知
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const toast = useToast();

  const handleBackendError = useCallback(
    (response: unknown, fallbackMessage?: string): AppError | null => {
      const appError = parseBackendError(response);

      // 根据错误码显示不同的 toast
      toast.error(appError.message, undefined, appError.code);

      // 开发环境打印详细信息
      if (process.env.NODE_ENV === 'development') {
        console.error('[ErrorHandler] Backend error:', appError);
      }

      return appError;
    },
    [toast]
  );

  const handleNetworkError = useCallback(
    (error: unknown, fallbackMessage?: string): AppError | null => {
      const appError: AppError = {
        code: ErrorCode.INTERNAL_ERROR,
        message: fallbackMessage || '网络连接失败，请检查网络',
        severity: 'error',
        context: {
          type: 'network_error',
          error: error instanceof Error ? error.message : String(error),
        },
        timestamp: new Date().toISOString(),
        originalError: error instanceof Error ? error : undefined,
      };

      toast.error('网络错误', appError.message);

      if (process.env.NODE_ENV === 'development') {
        console.error('[ErrorHandler] Network error:', appError);
      }

      return appError;
    },
    [toast]
  );

  const handleError = useCallback(
    (error: unknown, fallbackMessage?: string): AppError | null => {
      // 优先处理后端结构化错误
      if (isBackendError(error)) {
        return handleBackendError(error, fallbackMessage);
      }

      // 处理网络错误
      if (isNetworkError(error)) {
        return handleNetworkError(error, fallbackMessage);
      }

      // 处理普通 Error 对象
      if (error instanceof Error) {
        const appError: AppError = {
          code: ErrorCode.INTERNAL_ERROR,
          message: error.message || fallbackMessage || '发生错误',
          severity: 'error',
          context: { type: 'javascript_error' },
          timestamp: new Date().toISOString(),
          originalError: error,
        };

        toast.error('操作失败', appError.message);

        if (process.env.NODE_ENV === 'development') {
          console.error('[ErrorHandler] JS Error:', appError);
        }

        return appError;
      }

      // 未知错误
      const appError: AppError = {
        code: ErrorCode.INTERNAL_ERROR,
        message: fallbackMessage || '发生未知错误',
        severity: 'error',
        context: { type: 'unknown' },
        timestamp: new Date().toISOString(),
      };

      toast.error('操作失败', appError.message);

      if (process.env.NODE_ENV === 'development') {
        console.error('[ErrorHandler] Unknown error:', error);
      }

      return appError;
    },
    [toast, handleBackendError, handleNetworkError]
  );

  // 自动判断错误类型并处理
  const handle = useCallback(
    (error: unknown, fallbackMessage?: string): AppError | null => {
      return handleError(error, fallbackMessage);
    },
    [handleError]
  );

  return {
    handleError,
    handleBackendError,
    handleNetworkError,
    handle,
  };
}

/**
 * HTTP 状态码到错误码的映射
 */
export function getErrorCodeForStatus(status: number): string {
  const statusCodeMap: Record<number, string> = {
    400: ErrorCode.INVALID_PARAMS,
    401: ErrorCode.UNAUTHORIZED,
    403: ErrorCode.FORBIDDEN,
    404: ErrorCode.NOT_FOUND,
    409: ErrorCode.DUPLICATE_RESOURCE,
    422: ErrorCode.VALIDATION_ERROR,
    500: ErrorCode.INTERNAL_ERROR,
    502: ErrorCode.EXTERNAL_API_ERROR,
    503: ErrorCode.AI_SERVICE_UNAVAILABLE,
  };

  return statusCodeMap[status] || ErrorCode.INTERNAL_ERROR;
}

/**
 * 根据 HTTP 状态码显示错误 toast
 */
export function useStatusCodeError() {
  const toast = useToast();

  return useCallback(
    (status: number, fallbackMessage?: string) => {
      const code = getErrorCodeForStatus(status);
      const message = ErrorMessages[code] || fallbackMessage || `请求失败 (${status})`;

      toast.error('请求失败', message, code);
    },
    [toast]
  );
}

export default useErrorHandler;
