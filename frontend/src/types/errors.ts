/**
 * 错误码与错误类型定义
 * EventMaster Pro - 全生命周期活动管理平台
 */

// 错误模块枚举
export enum ErrorModule {
  SYSTEM = '1',        // E1000-E1999 系统级错误
  ACTIVITY = '2',       // E2000-E2999 活动模块
  MATERIAL = '3',       // E3000-E3999 物料模块
  SUPPLIER = '4',      // E4000-E4999 供应商模块
  BUDGET = '5',        // E5000-E5999 预算模块
  OPPORTUNITY = '6',   // E6000-E6999 商机模块
  REVIEW = '7',        // E7000-E7999 复盘模块
  INTEGRATION = '9',    // E9000-E9999 外部服务集成
}

// 错误码枚举
export enum ErrorCode {
  // 系统错误 (E1000-E1999)
  INTERNAL_ERROR = 'E1000',           // 内部服务器错误
  INVALID_PARAMS = 'E1001',           // 无效的请求参数
  NOT_FOUND = 'E1002',               // 资源不存在
  DUPLICATE_RESOURCE = 'E1003',       // 资源已存在
  OPERATION_NOT_PERMITTED = 'E1004',  // 操作不被允许
  DATABASE_ERROR = 'E1005',           // 数据库操作失败
  VALIDATION_ERROR = 'E1006',         // 数据验证失败
  UNAUTHORIZED = 'E1007',             // 未授权
  FORBIDDEN = 'E1008',               // 禁止访问

  // 活动模块错误 (E2000-E2999)
  ACTIVITY_NOT_FOUND = 'E2001',           // 活动不存在
  ACTIVITY_CREATE_FAILED = 'E2002',       // 创建活动失败
  ACTIVITY_UPDATE_FAILED = 'E2003',       // 更新活动失败
  ACTIVITY_DELETE_FAILED = 'E2004',       // 删除活动失败
  ACTIVITY_INVALID_STATUS = 'E2005',      // 无效的活动状态转换

  // 物料模块错误 (E3000-E3999)
  MATERIAL_NOT_FOUND = 'E3001',            // 物料不存在
  MATERIAL_CREATE_FAILED = 'E3002',        // 创建物料失败
  MATERIAL_INSUFFICIENT_STOCK = 'E3003',   // 库存不足
  MATERIAL_STOCK_OP_FAILED = 'E3004',       // 库存操作失败
  MATERIAL_WITHDRAWAL_FAILED = 'E3005',    // 物料领用失败

  // 供应商模块错误 (E4000-E4999)
  SUPPLIER_NOT_FOUND = 'E4001',            // 供应商不存在
  SUPPLIER_CREATE_FAILED = 'E4002',        // 创建供应商失败
  SUPPLIER_DUPLICATE = 'E4003',            // 供应商已存在
  SUPPLIER_HAS_RECORDS = 'E4004',         // 供应商有关联记录，无法删除

  // 预算模块错误 (E5000-E5999)
  BUDGET_NOT_FOUND = 'E5001',              // 预算不存在
  BUDGET_CREATE_FAILED = 'E5002',          // 创建预算失败
  BUDGET_EXCEEDS_QUOTA = 'E5003',         // 预算超出年度配额
  BUDGET_ITEM_NOT_FOUND = 'E5004',        // 预算明细不存在
  BUDGET_LOG_NOT_FOUND = 'E5005',         // 预算日志不存在
  QUOTA_NOT_FOUND = 'E5006',              // 年度配额不存在

  // 商机模块错误 (E6000-E6999)
  OPPORTUNITY_NOT_FOUND = 'E6001',         // 商机不存在
  OPPORTUNITY_CREATE_FAILED = 'E6002',     // 创建商机失败
  OPPORTUNITY_INVALID_STAGE = 'E6003',     // 无效的商机阶段
  OPPORTUNITY_CONVERT_FAILED = 'E6004',    // 商机转化失败

  // 复盘模块错误 (E7000-E7999)
  REVIEW_NOT_FOUND = 'E7001',             // 复盘不存在
  REVIEW_CREATE_FAILED = 'E7002',         // 创建复盘失败
  REVIEW_ALREADY_COMPLETED = 'E7003',     // 复盘已完成，无法修改
  FEEDBACK_NOT_FOUND = 'E7004',          // 反馈不存在
  CONCLUSION_NOT_FOUND = 'E7005',         // 复盘结论不存在

  // 集成错误 (E9000-E9999)
  AI_SERVICE_UNAVAILABLE = 'E9001',       // AI服务暂时不可用
  EXTERNAL_API_ERROR = 'E9002',           // 外部API调用失败
  GEMINI_API_ERROR = 'E9003',            // Gemini API 调用失败
}

// 错误消息映射
export const ErrorMessages: Record<string, string> = {
  // 系统错误
  [ErrorCode.INTERNAL_ERROR]: '内部服务器错误',
  [ErrorCode.INVALID_PARAMS]: '无效的请求参数',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.DUPLICATE_RESOURCE]: '资源已存在',
  [ErrorCode.OPERATION_NOT_PERMITTED]: '操作不被允许',
  [ErrorCode.DATABASE_ERROR]: '数据库操作失败',
  [ErrorCode.VALIDATION_ERROR]: '数据验证失败',
  [ErrorCode.UNAUTHORIZED]: '请先登录',
  [ErrorCode.FORBIDDEN]: '权限不足',

  // 活动模块
  [ErrorCode.ACTIVITY_NOT_FOUND]: '活动不存在',
  [ErrorCode.ACTIVITY_CREATE_FAILED]: '创建活动失败',
  [ErrorCode.ACTIVITY_UPDATE_FAILED]: '更新活动失败',
  [ErrorCode.ACTIVITY_DELETE_FAILED]: '删除活动失败',
  [ErrorCode.ACTIVITY_INVALID_STATUS]: '无效的活动状态转换',

  // 物料模块
  [ErrorCode.MATERIAL_NOT_FOUND]: '物料不存在',
  [ErrorCode.MATERIAL_CREATE_FAILED]: '创建物料失败',
  [ErrorCode.MATERIAL_INSUFFICIENT_STOCK]: '库存不足',
  [ErrorCode.MATERIAL_STOCK_OP_FAILED]: '库存操作失败',
  [ErrorCode.MATERIAL_WITHDRAWAL_FAILED]: '物料领用失败',

  // 供应商模块
  [ErrorCode.SUPPLIER_NOT_FOUND]: '供应商不存在',
  [ErrorCode.SUPPLIER_CREATE_FAILED]: '创建供应商失败',
  [ErrorCode.SUPPLIER_DUPLICATE]: '供应商已存在',
  [ErrorCode.SUPPLIER_HAS_RECORDS]: '供应商有关联记录，无法删除',

  // 预算模块
  [ErrorCode.BUDGET_NOT_FOUND]: '预算不存在',
  [ErrorCode.BUDGET_CREATE_FAILED]: '创建预算失败',
  [ErrorCode.BUDGET_EXCEEDS_QUOTA]: '预算超出年度配额',
  [ErrorCode.BUDGET_ITEM_NOT_FOUND]: '预算明细不存在',
  [ErrorCode.BUDGET_LOG_NOT_FOUND]: '预算日志不存在',
  [ErrorCode.QUOTA_NOT_FOUND]: '年度配额不存在',

  // 商机模块
  [ErrorCode.OPPORTUNITY_NOT_FOUND]: '商机不存在',
  [ErrorCode.OPPORTUNITY_CREATE_FAILED]: '创建商机失败',
  [ErrorCode.OPPORTUNITY_INVALID_STAGE]: '无效的商机阶段',
  [ErrorCode.OPPORTUNITY_CONVERT_FAILED]: '商机转化失败',

  // 复盘模块
  [ErrorCode.REVIEW_NOT_FOUND]: '复盘不存在',
  [ErrorCode.REVIEW_CREATE_FAILED]: '创建复盘失败',
  [ErrorCode.REVIEW_ALREADY_COMPLETED]: '复盘已完成，无法修改',
  [ErrorCode.FEEDBACK_NOT_FOUND]: '反馈不存在',
  [ErrorCode.CONCLUSION_NOT_FOUND]: '复盘结论不存在',

  // 集成错误
  [ErrorCode.AI_SERVICE_UNAVAILABLE]: 'AI服务暂时不可用',
  [ErrorCode.EXTERNAL_API_ERROR]: '外部API调用失败',
  [ErrorCode.GEMINI_API_ERROR]: 'Gemini API 调用失败',
};

// 错误严重级别
export type ErrorSeverity = 'info' | 'warning' | 'error' | 'critical';

// 错误上下文
export interface ErrorContext {
  resource?: string;
  id?: string | number;
  field?: string;
  [key: string]: unknown;
}

// 应用错误结构
export interface AppError {
  code: string;
  message: string;
  severity: ErrorSeverity;
  context: ErrorContext;
  timestamp: string;
  requestId?: string;
  originalError?: Error;
}

// 后端错误响应
export interface BackendErrorResponse {
  code: string;
  message: string;
  context?: ErrorContext;
  request_id?: string;
}

// 根据错误码获取默认消息
export function getErrorMessage(code: string, fallback?: string): string {
  return ErrorMessages[code] || fallback || '发生错误';
}

// 根据错误码获取严重级别
export function getErrorSeverity(code: string): ErrorSeverity {
  if (code === 'E1000' || code.startsWith('E9')) return 'critical';
  if (code.startsWith('E1')) return 'warning';
  return 'error';
}

// 解析后端错误响应
export function parseBackendError(response: BackendErrorResponse | unknown): AppError {
  const code = (response as BackendErrorResponse)?.code || 'E1000';
  const message = (response as BackendErrorResponse)?.message || ErrorMessages[code] || '未知错误';

  return {
    code,
    message,
    severity: getErrorSeverity(code),
    context: (response as BackendErrorResponse)?.context || {},
    timestamp: new Date().toISOString(),
    requestId: (response as BackendErrorResponse)?.request_id,
  };
}

// 获取错误码对应的模块名称
export function getErrorModuleName(code: string): string {
  const moduleMap: Record<string, string> = {
    '1': '系统',
    '2': '活动',
    '3': '物料',
    '4': '供应商',
    '5': '预算',
    '6': '商机',
    '7': '复盘',
    '9': '集成',
  };
  const moduleDigit = code.charAt(1);
  return moduleMap[moduleDigit] || '未知';
}

// 判断是否为后端返回的结构化错误
export function isBackendError(error: unknown): error is BackendErrorResponse {
  if (typeof error !== 'object' || error === null) return false;
  const err = error as BackendErrorResponse;
  return typeof err.code === 'string' && typeof err.message === 'string';
}

// 判断是否为网络错误
export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError && error.message.includes('fetch')) return true;
  if ((error as { name?: string })?.name === 'TypeError') return true;
  return false;
}
