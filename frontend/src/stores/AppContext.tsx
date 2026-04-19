/**
 * 应用全局状态 Provider
 * 注意：业务数据必须通过 hooks.ts 中的 use*Data hooks 从 API 获取
 */
import React, { createContext, useContext, ReactNode } from 'react';

// 空状态类型（保持接口兼容）
interface AppState {
  // 预留扩展
}

// 空Context类型
interface AppContextType {
  // 预留扩展
}

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
}

// 保留导出以兼容现有代码
export function useAppContext() {
  return useContext(AppContext);
}

export function useActivities() {
  throw new Error('useActivities 已废弃，请使用 useActivitiesData from utils/hooks');
}

export function useMaterials() {
  throw new Error('useMaterials 已废弃，请使用 useMaterialsData from utils/hooks');
}

export function useSuppliers() {
  throw new Error('useSuppliers 已废弃，请使用 useSuppliersData from utils/hooks');
}

export function useOpportunities() {
  throw new Error('useOpportunities 已废弃，请使用 useOpportunitiesData from utils/hooks');
}
