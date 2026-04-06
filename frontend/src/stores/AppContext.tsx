import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { Activity, Material, Supplier, Opportunity, BudgetLog } from '../types';

const STORAGE_KEY = 'eventmaster_state';

// 全局状态类型
interface AppState {
  activities: Activity[];
  materials: Material[];
  suppliers: Supplier[];
  opportunities: Opportunity[];
  budgetLogs: BudgetLog[];
}

// 从 localStorage 加载状态
function loadState(): AppState {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        activities: parsed.activities || [],
        materials: parsed.materials || [],
        suppliers: parsed.suppliers || [],
        opportunities: parsed.opportunities || [],
        budgetLogs: parsed.budgetLogs || [],
      };
    }
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
  }
  return {
    activities: [],
    materials: [],
    suppliers: [],
    opportunities: [],
    budgetLogs: [],
  };
}

// 保存状态到 localStorage
function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
}

// Context类型
interface AppContextType {
  state: AppState;
  setActivities: (activities: Activity[]) => void;
  setMaterials: (materials: Material[]) => void;
  setSuppliers: (suppliers: Supplier[]) => void;
  setOpportunities: (opportunities: Opportunity[]) => void;
  setBudgetLogs: (logs: BudgetLog[]) => void;
  // CRUD操作
  addActivity: (activity: Activity) => void;
  updateActivity: (id: string, updates: Partial<Activity>) => void;
  deleteActivity: (id: string) => void;
  addMaterial: (material: Material) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addOpportunity: (opportunity: Opportunity) => void;
  updateOpportunity: (id: string, updates: Partial<Opportunity>) => void;
  deleteOpportunity: (id: string) => void;
}

// 默认状态
const defaultState: AppState = {
  activities: [],
  materials: [],
  suppliers: [],
  opportunities: [],
  budgetLogs: [],
};

// 创建Context
const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider组件
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, setState] = useState<AppState>(loadState);

  // 状态变更时持久化到 localStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // 设置器
  const setActivities = useCallback((activities: Activity[]) => {
    setState(prev => ({ ...prev, activities }));
  }, []);

  const setMaterials = useCallback((materials: Material[]) => {
    setState(prev => ({ ...prev, materials }));
  }, []);

  const setSuppliers = useCallback((suppliers: Supplier[]) => {
    setState(prev => ({ ...prev, suppliers }));
  }, []);

  const setOpportunities = useCallback((opportunities: Opportunity[]) => {
    setState(prev => ({ ...prev, opportunities }));
  }, []);

  const setBudgetLogs = useCallback((logs: BudgetLog[]) => {
    setState(prev => ({ ...prev, budgetLogs: logs }));
  }, []);

  // 活动CRUD
  const addActivity = useCallback((activity: Activity) => {
    setState(prev => ({
      ...prev,
      activities: [activity, ...prev.activities],
    }));
  }, []);

  const updateActivity = useCallback((id: string, updates: Partial<Activity>) => {
    setState(prev => ({
      ...prev,
      activities: prev.activities.map(a =>
        a.id === id ? { ...a, ...updates } : a
      ),
    }));
  }, []);

  const deleteActivity = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      activities: prev.activities.filter(a => a.id !== id),
    }));
  }, []);

  // 物料CRUD
  const addMaterial = useCallback((material: Material) => {
    setState(prev => ({
      ...prev,
      materials: [material, ...prev.materials],
    }));
  }, []);

  const updateMaterial = useCallback((id: string, updates: Partial<Material>) => {
    setState(prev => ({
      ...prev,
      materials: prev.materials.map(m =>
        m.id === id ? { ...m, ...updates } : m
      ),
    }));
  }, []);

  const deleteMaterial = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      materials: prev.materials.filter(m => m.id !== id),
    }));
  }, []);

  // 供应商CRUD
  const addSupplier = useCallback((supplier: Supplier) => {
    setState(prev => ({
      ...prev,
      suppliers: [supplier, ...prev.suppliers],
    }));
  }, []);

  const updateSupplier = useCallback((id: string, updates: Partial<Supplier>) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s =>
        s.id === id ? { ...s, ...updates } : s
      ),
    }));
  }, []);

  const deleteSupplier = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== id),
    }));
  }, []);

  // 商机CRUD
  const addOpportunity = useCallback((opportunity: Opportunity) => {
    setState(prev => ({
      ...prev,
      opportunities: [opportunity, ...prev.opportunities],
    }));
  }, []);

  const updateOpportunity = useCallback((id: string, updates: Partial<Opportunity>) => {
    setState(prev => ({
      ...prev,
      opportunities: prev.opportunities.map(o =>
        o.id === id ? { ...o, ...updates } : o
      ),
    }));
  }, []);

  const deleteOpportunity = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      opportunities: prev.opportunities.filter(o => o.id !== id),
    }));
  }, []);

  const value: AppContextType = {
    state,
    setActivities,
    setMaterials,
    setSuppliers,
    setOpportunities,
    setBudgetLogs,
    addActivity,
    updateActivity,
    deleteActivity,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    addOpportunity,
    updateOpportunity,
    deleteOpportunity,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// 选择性Hook（避免不必要重渲染）
export function useActivities() {
  const { state, addActivity, updateActivity, deleteActivity, setActivities } = useAppContext();
  return { activities: state.activities, addActivity, updateActivity, deleteActivity, setActivities };
}

export function useMaterials() {
  const { state, addMaterial, updateMaterial, deleteMaterial, setMaterials } = useAppContext();
  return { materials: state.materials, addMaterial, updateMaterial, deleteMaterial, setMaterials };
}

export function useSuppliers() {
  const { state, addSupplier, updateSupplier, deleteSupplier, setSuppliers } = useAppContext();
  return { suppliers: state.suppliers, addSupplier, updateSupplier, deleteSupplier, setSuppliers };
}

export function useOpportunities() {
  const { state, addOpportunity, updateOpportunity, deleteOpportunity, setOpportunities } = useAppContext();
  return { opportunities: state.opportunities, addOpportunity, updateOpportunity, deleteOpportunity, setOpportunities };
}
