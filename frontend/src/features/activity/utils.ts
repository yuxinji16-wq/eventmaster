/**
 * 活动详情工具函数
 * 从 pages/ActivityDetail.tsx 迁移而来
 */
import { Activity, ActivityTask, ActivityStage, ACTIVITY_STAGES, RiskLevel } from '../../types';

export function getRiskColor(risk: RiskLevel): { bg: string; text: string; border: string } {
  return {
    healthy: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    danger: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  }[risk];
}

export function getPriorityColor(priority: 'P0' | 'P1' | 'P2'): { bg: string; text: string } {
  return {
    P0: { bg: 'bg-rose-100', text: 'text-rose-600' },
    P1: { bg: 'bg-amber-100', text: 'text-amber-600' },
    P2: { bg: 'bg-blue-100', text: 'text-blue-600' },
  }[priority];
}

export function getStatusColor(status: string): { bg: string; text: string } {
  const colors: Record<string, { bg: string; text: string }> = {
    '待启动': { bg: 'bg-slate-100', text: 'text-slate-600' },
    '筹备中': { bg: 'bg-amber-50', text: 'text-amber-600' },
    '执行中': { bg: 'bg-blue-50', text: 'text-blue-600' },
    '已完成': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    '复盘中': { bg: 'bg-purple-50', text: 'text-purple-600' },
    '未开始': { bg: 'bg-slate-100', text: 'text-slate-600' },
    '进行中': { bg: 'bg-blue-50', text: 'text-blue-600' },
    '已取消': { bg: 'bg-rose-100', text: 'text-rose-600' },
    'In Stock': { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    'Low Stock': { bg: 'bg-amber-50', text: 'text-amber-600' },
    'Out of Stock': { bg: 'bg-rose-50', text: 'text-rose-600' },
  };
  return colors[status] || { bg: 'bg-slate-100', text: 'text-slate-600' };
}

export function formatCurrency(amount: number | undefined | null): string {
  if (amount == null || isNaN(amount)) return '¥0';
  if (amount >= 10000) return `¥${(amount / 10000).toFixed(1)}w`;
  return `¥${amount.toLocaleString()}`;
}

export function getStageIndex(stage: string): number {
  const stageMap: Record<string, string> = {
    '进行中': '执行中',
    '执行中': '执行中',
    '待启动': '待启动',
    '筹备中': '筹备中',
    '复盘中': '复盘中',
    '已完成': '已完成',
    '已取消': '已完成',
  };
  const normalizedStage = stageMap[stage] || stage;
  const index = ACTIVITY_STAGES.indexOf(normalizedStage as ActivityStage);
  return index >= 0 ? index : 0;
}

export function calculateRiskLevel(tasks: ActivityTask[], budget: number, actualSpend: number): RiskLevel {
  const taskList = tasks || [];
  const overdueTasks = taskList.filter(t => t.status !== '已完成' && new Date(t.dueDate) < new Date());
  if (overdueTasks.length > 0) return 'danger';
  const p0Pending = taskList.filter(t => t.priority === 'P0' && t.status !== '已完成');
  if (p0Pending.length > 0) return 'warning';
  if (budget > 0) {
    const rate = actualSpend / budget;
    if (rate >= 1) return 'danger';
    if (rate >= 0.9) return 'warning';
  }
  return 'healthy';
}

export function getStatusSummary(activity: Activity, tasks: ActivityTask[]): string {
  const taskList = tasks || [];
  const overdueTasks = taskList.filter(t => t.status !== '已完成' && new Date(t.dueDate) < new Date());
  if (overdueTasks.length > 0) return `⚠️ ${overdueTasks.length} 项任务已延期，需立即处理`;
  const pending = taskList.filter(t => t.status !== '已完成');
  if (pending.length > 0) return `📋 ${pending.length} 项任务待完成`;
  if (activity.status === '已完成') return `✅ 活动已完成，留资 ${activity.leads || 0} 人`;
  return `🎯 ${activity.status || '筹备中'}，当前无阻塞任务`;
}
