/**
 * 错误处理模块测试
 */
import { describe, it, expect } from 'vitest';
import {
  ErrorCode,
  ErrorMessages,
  getErrorMessage,
  getErrorSeverity,
  parseBackendError,
  isBackendError,
  isNetworkError,
  getErrorModuleName,
} from '../types/errors';

describe('ErrorCode 枚举', () => {
  it('应包含所有模块的错误码', () => {
    // 系统错误
    expect(ErrorCode.INTERNAL_ERROR).toBe('E1000');
    expect(ErrorCode.NOT_FOUND).toBe('E1002');

    // 活动模块
    expect(ErrorCode.ACTIVITY_NOT_FOUND).toBe('E2001');
    expect(ErrorCode.ACTIVITY_CREATE_FAILED).toBe('E2002');

    // 物料模块
    expect(ErrorCode.MATERIAL_NOT_FOUND).toBe('E3001');
    expect(ErrorCode.MATERIAL_INSUFFICIENT_STOCK).toBe('E3003');

    // 供应商模块
    expect(ErrorCode.SUPPLIER_NOT_FOUND).toBe('E4001');

    // 预算模块
    expect(ErrorCode.BUDGET_NOT_FOUND).toBe('E5001');

    // 商机模块
    expect(ErrorCode.OPPORTUNITY_NOT_FOUND).toBe('E6001');

    // 复盘模块
    expect(ErrorCode.REVIEW_NOT_FOUND).toBe('E7001');

    // 集成错误
    expect(ErrorCode.AI_SERVICE_UNAVAILABLE).toBe('E9001');
  });
});

describe('ErrorMessages 错误消息映射', () => {
  it('应包含所有错误码的消息', () => {
    expect(ErrorMessages[ErrorCode.INTERNAL_ERROR]).toBe('内部服务器错误');
    expect(ErrorMessages[ErrorCode.ACTIVITY_NOT_FOUND]).toBe('活动不存在');
    expect(ErrorMessages[ErrorCode.MATERIAL_NOT_FOUND]).toBe('物料不存在');
    expect(ErrorMessages[ErrorCode.SUPPLIER_NOT_FOUND]).toBe('供应商不存在');
    expect(ErrorMessages[ErrorCode.BUDGET_NOT_FOUND]).toBe('预算不存在');
    expect(ErrorMessages[ErrorCode.OPPORTUNITY_NOT_FOUND]).toBe('商机不存在');
    expect(ErrorMessages[ErrorCode.REVIEW_NOT_FOUND]).toBe('复盘不存在');
    expect(ErrorMessages[ErrorCode.AI_SERVICE_UNAVAILABLE]).toBe('AI服务暂时不可用');
  });

  it('应包含库存不足的错误消息', () => {
    expect(ErrorMessages[ErrorCode.MATERIAL_INSUFFICIENT_STOCK]).toBe('库存不足');
  });
});

describe('getErrorMessage', () => {
  it('应返回错误码对应的消息', () => {
    expect(getErrorMessage('E2001')).toBe('活动不存在');
    expect(getErrorMessage('E3001')).toBe('物料不存在');
  });

  it('当错误码不存在时应返回 fallback', () => {
    expect(getErrorMessage('E9999', '未知错误')).toBe('未知错误');
  });

  it('当错误码不存在且无 fallback 时应返回默认消息', () => {
    expect(getErrorMessage('E9999')).toBe('发生错误');
  });
});

describe('getErrorSeverity', () => {
  it('系统错误应返回 warning', () => {
    expect(getErrorSeverity('E1001')).toBe('warning');
    expect(getErrorSeverity('E1006')).toBe('warning');
  });

  it('内部错误应返回 critical', () => {
    expect(getErrorSeverity('E1000')).toBe('critical');
  });

  it('集成错误应返回 critical', () => {
    expect(getErrorSeverity('E9001')).toBe('critical');
    expect(getErrorSeverity('E9002')).toBe('critical');
  });

  it('普通业务错误应返回 error', () => {
    expect(getErrorSeverity('E2001')).toBe('error');
    expect(getErrorSeverity('E3001')).toBe('error');
    expect(getErrorSeverity('E4001')).toBe('error');
  });
});

describe('parseBackendError', () => {
  it('应正确解析后端错误响应', () => {
    const response = {
      code: 'E2001',
      message: '活动不存在',
      context: { activity_id: 123 },
      request_id: 'req-123',
    };

    const error = parseBackendError(response);

    expect(error.code).toBe('E2001');
    expect(error.message).toBe('活动不存在');
    expect(error.context).toEqual({ activity_id: 123 });
    expect(error.requestId).toBe('req-123');
    expect(error.severity).toBe('error');
    expect(error.timestamp).toBeDefined();
  });

  it('应处理缺少字段的响应', () => {
    const response = { code: 'E1000' };

    const error = parseBackendError(response);

    expect(error.code).toBe('E1000');
    expect(error.message).toBe('内部服务器错误');
    expect(error.context).toEqual({});
  });

  it('应处理空对象', () => {
    const error = parseBackendError({});

    expect(error.code).toBe('E1000');
    expect(error.message).toBe('内部服务器错误');
  });
});

describe('isBackendError', () => {
  it('应正确识别后端错误', () => {
    expect(isBackendError({ code: 'E2001', message: '活动不存在' })).toBe(true);
  });

  it('应拒绝非后端错误', () => {
    expect(isBackendError({ message: 'error' })).toBe(false);
    expect(isBackendError(null)).toBe(false);
    expect(isBackendError(undefined)).toBe(false);
    expect(isBackendError('error string')).toBe(false);
    expect(isBackendError(new Error('test'))).toBe(false);
  });
});

describe('isNetworkError', () => {
  it('应识别 TypeError 网络错误', () => {
    const error = new TypeError('Failed to fetch');
    expect(isNetworkError(error)).toBe(true);
  });

  it('应拒绝普通 Error', () => {
    expect(isNetworkError(new Error('test'))).toBe(false);
  });

  it('应拒绝非错误对象', () => {
    expect(isNetworkError('error')).toBe(false);
    expect(isNetworkError({})).toBe(false);
  });
});

describe('getErrorModuleName', () => {
  it('应返回正确的模块名称', () => {
    expect(getErrorModuleName('E1000')).toBe('系统');
    expect(getErrorModuleName('E2001')).toBe('活动');
    expect(getErrorModuleName('E3001')).toBe('物料');
    expect(getErrorModuleName('E4001')).toBe('供应商');
    expect(getErrorModuleName('E5001')).toBe('预算');
    expect(getErrorModuleName('E6001')).toBe('商机');
    expect(getErrorModuleName('E7001')).toBe('复盘');
    expect(getErrorModuleName('E9001')).toBe('集成');
  });

  it('应处理未知模块', () => {
    expect(getErrorModuleName('E8001')).toBe('未知');
  });
});
