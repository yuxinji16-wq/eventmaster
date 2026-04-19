import React from 'react';
import {
  LayoutDashboard,
  CalendarRange,
  Package,
  Wallet,
  Users,
  TrendingUp,
  ClipboardCheck,
  Settings,
  Shield,
  User
} from 'lucide-react';

export const NAV_ITEMS = [
  { id: 'dashboard', label: '数据仪表盘', icon: <LayoutDashboard size={20} /> },
  { id: 'activities', label: '活动管理', icon: <CalendarRange size={20} /> },
  { id: 'materials', label: '物料仓库', icon: <Package size={20} /> },
  { id: 'budget', label: '预算仓库', icon: <Wallet size={20} /> },
  { id: 'suppliers', label: '供应商库', icon: <Users size={20} /> },
  { id: 'leads', label: '商机转化', icon: <TrendingUp size={20} /> },
  { id: 'reviews', label: '复盘中心', icon: <ClipboardCheck size={20} /> },
];

export const SYSTEM_NAV_ITEMS = [
  { id: 'account', label: '账号管理', icon: <User size={20} />, path: '/account' },
  { id: 'permissions', label: '权限管理', icon: <Shield size={20} />, path: '/permissions' },
  { id: 'settings', label: '网站设置', icon: <Settings size={20} />, path: '/settings' },
];

// ==================== 活动行业分类 ====================
export const ACTIVITY_INDUSTRIES = [
  '航天',
  '航空',
  '车辆',
  '船舶',
  '电子信息',
  '芯片电子',
  '电力能源',
  '核能',
  '高校',
  '政府',
  '综合',
] as const;

export type ActivityIndustry = typeof ACTIVITY_INDUSTRIES[number];
