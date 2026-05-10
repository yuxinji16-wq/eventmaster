/**
 * 活动详情页 - 活动管理中枢 v3
 *
 * 支持在当前页面：
 * - 新增供应商/物料/商机/任务/预算项
 * - 状态更改
 * - 数据同步
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity, ActivityStatus, ActivityTask, ActivityStage, ACTIVITY_STAGES, RiskLevel,
  ExpenseItem, Opportunity, Material, Supplier, PRESET_REVIEW_TAGS
} from '../types';
import { useActivitiesData, useSuppliersData, useMaterialsData, useLeadsData, useReviewData, useReviewsData, useMediaData } from '../utils/hooks';
import { materialsApi, activitiesApi, tasksApi, budgetApi, suppliersApi } from '../services/backendApi';
import { useToast } from '../shared/Toast';
import {
  Card, Button, Modal, Input, Select
} from '../shared';
import {
  Calendar, MapPin, Edit2, Plus, Check, X, Clock, AlertTriangle,
  Zap, Wallet, Users, Package, TrendingUp, ClipboardCheck,
  ArrowLeft, AlertCircle, CheckCircle2, Loader2,
  User, ChevronDown, ChevronUp, Edit, Star, Trash2,
  FileText, UploadCloud, Download, Sparkles, Upload, Newspaper
} from 'lucide-react';
import { MediaTab } from '../features/activity/detail/MediaTab';
import { ActivityHealthAnalysis } from '../features/activity/components/ActivityHealthAnalysis';
import { ActivityMaterials } from '../features/activity/components/ActivityMaterials';
import ExternalActivityDetailPage from '../features/external-activity/pages/ExternalActivityDetailPage';

// ============ 常量 ============

const TABS = [
  { id: 'budget', label: '费用明细', icon: Wallet },
  { id: 'supplier', label: '供应商', icon: Users },
  { id: 'material', label: '物料', icon: Package },
  { id: 'opportunity', label: '商机', icon: TrendingUp },
  { id: 'media', label: '媒体传播', icon: Newspaper },
  { id: 'review', label: '复盘', icon: ClipboardCheck },
];

const PRIORITY_OPTIONS = [
  { value: 'P0', label: 'P0 - 紧急重要' },
  { value: 'P1', label: 'P1 - 重要' },
  { value: 'P2', label: 'P2 - 一般' },
];

const TASK_STATUS_OPTIONS = [
  { value: '未开始', label: '未开始' },
  { value: '进行中', label: '进行中' },
  { value: '已完成', label: '已完成' },
  { value: '阻塞', label: '阻塞' },
];

const EXPENSE_CATEGORIES = [
  { value: '场地租用', label: '场地租用' },
  { value: '搭建/展览', label: '搭建/展览' },
  { value: '物料制作', label: '物料制作' },
  { value: '差旅/住宿', label: '差旅/住宿' },
  { value: '餐饮/招待', label: '餐饮/招待' },
  { value: '礼品/赠品', label: '礼品/赠品' },
  { value: '媒体/推广', label: '媒体/推广' },
  { value: '其他', label: '其他' },
];

const SERVICE_TYPES = [
  { value: '搭建', label: '搭建' },
  { value: '设计', label: '设计' },
  { value: '影音', label: '影音' },
  { value: '印刷', label: '印刷' },
  { value: '礼品', label: '礼品' },
  { value: '其他', label: '其他' },
];

const MATERIAL_CATEGORIES = [
  { value: '产品宣传册', label: '产品宣传册' },
  { value: '易拉宝', label: '易拉宝' },
  { value: '会议定制', label: '会议定制' },
  { value: '礼品', label: '礼品' },
  { value: '办公用品', label: '办公用品' },
  { value: '其他', label: '其他' },
];

const ACTIVITY_STATUS_OPTIONS = [
  { value: '待启动', label: '待启动' },
  { value: '进行中', label: '进行中' },
  { value: '复盘中', label: '复盘中' },
  { value: '已完成', label: '已完成' },
  { value: '已取消', label: '已取消' },
];

// ============ 工具函数 ============

function getRiskColor(risk: RiskLevel): { bg: string; text: string; border: string } {
  return {
    healthy: { bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-200' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600', border: 'border-amber-200' },
    danger: { bg: 'bg-rose-50', text: 'text-rose-600', border: 'border-rose-200' },
  }[risk];
}

function getPriorityColor(priority: 'P0' | 'P1' | 'P2'): { bg: string; text: string } {
  return {
    P0: { bg: 'bg-rose-100', text: 'text-rose-600' },
    P1: { bg: 'bg-amber-100', text: 'text-amber-600' },
    P2: { bg: 'bg-blue-100', text: 'text-blue-600' },
  }[priority];
}

function getStatusColor(status: string): { bg: string; text: string } {
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

function formatCurrency(amount: number | undefined | null): string {
  if (amount == null || isNaN(amount)) return '¥0';
  if (amount >= 10000) return `¥${(amount / 10000).toFixed(1)}w`;
  return `¥${amount.toLocaleString()}`;
}

function getStageIndex(stage: string): number {
  // 处理状态名称映射：'进行中' -> '执行中'
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
  return index >= 0 ? index : 0; // 默认返回第一个阶段
}

function calculateRiskLevel(tasks: ActivityTask[], budget: number, actualSpend: number): RiskLevel {
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

function getStatusSummary(activity: Activity, tasks: ActivityTask[]): string {
  const taskList = tasks || [];
  const overdueTasks = taskList.filter(t => t.status !== '已完成' && new Date(t.dueDate) < new Date());
  if (overdueTasks.length > 0) return `⚠️ ${overdueTasks.length} 项任务已延期，需立即处理`;
  const pending = taskList.filter(t => t.status !== '已完成');
  if (pending.length > 0) return `📋 ${pending.length} 项任务待完成`;
  if (activity.status === '已完成') return `✅ 活动已完成，留资 ${activity.leads || 0} 人`;
  return `🎯 ${activity.status || '筹备中'}，当前无阻塞任务`;
}

// ============ 子组件 ============

function StageProgressBar({ currentStage }: { currentStage: string }) {
  const currentIndex = getStageIndex(currentStage);
  return (
    <div className="flex items-center gap-0">
      {ACTIVITY_STAGES.map((stage, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone ? 'bg-emerald-500 text-white shadow-md' : isCurrent ? 'bg-indigo-500 text-white shadow-lg ring-4 ring-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                {isDone ? <Check size={16} /> : index + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>{stage}</span>
            </div>
            {index < ACTIVITY_STAGES.length - 1 && (
              <div className={`flex-1 h-1.5 mx-1 rounded ${index < currentIndex ? 'bg-emerald-400' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function RiskAlert({ risk, message }: { risk: RiskLevel; message: string }) {
  const colors = getRiskColor(risk);
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} ${colors.text}`}>
      <AlertTriangle size={16} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white/10 rounded-xl p-4">
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
}

function StatusPanelItem({ icon, title, stats, status }: { icon: React.ReactNode; title: string; stats: { label: string; value: string | number; color?: string }[]; status?: { type: 'success' | 'warning' | 'danger' | 'neutral'; text: string } }) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">{icon}</div>
        <span className="font-bold text-slate-800">{title}</span>
      </div>
      <div className="space-y-2">
        {stats.map((stat, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-slate-400">{stat.label}</span>
            <span className={`font-bold ${stat.color || 'text-slate-800'}`}>{stat.value}</span>
          </div>
        ))}
      </div>
      {status && (
        <div className={`mt-3 px-2 py-1 rounded text-xs font-medium inline-block ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
          status.type === 'warning' ? 'bg-amber-50 text-amber-600' :
          'bg-rose-50 text-rose-600'
        }`}>
          {status.text}
        </div>
      )}
    </div>
  );
}

function TaskRow({ task, onComplete, onEdit, onDelete }: { task: ActivityTask; onComplete: () => void; onEdit: () => void; onDelete: () => void }) {
  const isOverdue = task.status !== '已完成' && new Date(task.dueDate) < new Date();
  const pColors = getPriorityColor(task.priority);

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${isOverdue ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100'}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {task.status !== '已完成' ? (
          <button onClick={onComplete} className="w-6 h-6 rounded-full border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={12} className="text-white" /></div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${pColors.bg} ${pColors.text}`}>{task.priority}</span>
            <span className="font-medium text-slate-800 truncate">{task.name}</span>
            {isOverdue && <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-600">延期</span>}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span>{task.assignee}</span>
            <span>·</span>
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={14} /></button>
        <button onClick={onDelete} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
      </div>
    </div>
  );
}

function SupplierRow({ supplier, onConfirm, onStatusChange }: { supplier: any; onConfirm: () => void; onStatusChange: (status: string) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${supplier.orderCount > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
          {supplier.orderCount > 0 ? <CheckCircle2 size={16} /> : <Clock size={16} />}
        </div>
        <div>
          <p className="font-medium text-slate-700">{supplier.name}</p>
          <p className="text-xs text-slate-400">{supplier.serviceType} · {supplier.contact}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {supplier.orderCount > 0 ? (
          <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium">已确认</span>
        ) : (
          <button onClick={onConfirm} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100">确认</button>
        )}
        <select value={supplier.status || ''} onChange={(e) => onStatusChange(e.target.value)}
          className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium bg-white">
          <option value="">状态</option>
          <option value="接洽中">接洽中</option>
          <option value="报价中">报价中</option>
          <option value="已签约">已签约</option>
          <option value="执行中">执行中</option>
          <option value="已完成">已完成</option>
        </select>
      </div>
    </div>
  );
}

function MaterialRow({ material, onStatusChange }: { material: any; onStatusChange: (status: string) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
      <div className="flex items-center gap-3">
        <Package size={16} className="text-slate-400" />
        <div>
          <p className="font-medium text-slate-700">{material.name}</p>
          <p className="text-xs text-slate-400">库存 {material.stock} {material.unit}</p>
        </div>
      </div>
      <select value={material.status || 'In Stock'} onChange={(e) => onStatusChange(e.target.value)}
        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
          material.status === 'In Stock' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
          material.status === 'Low Stock' ? 'bg-amber-50 border-amber-200 text-amber-600' :
          'bg-rose-50 border-rose-200 text-rose-600'
        }`}>
        <option value="In Stock">充足</option>
        <option value="Low Stock">偏低</option>
        <option value="Out of Stock">缺货</option>
      </select>
    </div>
  );
}

function OpportunityRow({ opportunity }: { opportunity: any }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-slate-700">{opportunity.clientName}</p>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600">
            {opportunity.region || '区域待定'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span>{opportunity.contactName}</span>
          <span>{opportunity.phone}</span>
        </div>
        {opportunity.requirement && (
          <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{opportunity.requirement}</p>
        )}
      </div>
      <div className="text-xs text-slate-400 ml-2">
        {opportunity.owner}
      </div>
    </div>
  );
}

function ExpenseRow({ item, onEdit, onDelete }: { item: ExpenseItem; onEdit: () => void; onDelete: () => void }) {
  const variance = item.actualAmount - item.plannedAmount;
  const variancePercent = item.plannedAmount > 0 ? (variance / item.plannedAmount * 100) : 0;
  const isOver = variance > 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
      <div>
        <p className="font-medium text-slate-700">{item.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          预算 ¥{item.plannedAmount.toLocaleString()} · 实际 ¥{item.actualAmount.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
          {isOver ? '+' : ''}{variancePercent.toFixed(0)}%
        </span>
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={12} /></button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={12} /></button>
      </div>
    </div>
  );
}

// ============ 弹窗组件 ============

function TaskModal({ task, onClose, onSave, onDelete }: {
  task?: ActivityTask | null;
  onClose: () => void;
  onSave: (data: Partial<ActivityTask>) => void;
  onDelete?: (id: string) => void;
}) {
  const [form, setForm] = useState({
    name: task?.name || '',
    description: task?.description || '',
    assignee: task?.assignee || '',
    dueDate: task?.dueDate || '',
    priority: task?.priority || 'P1',
    status: task?.status || '未开始',
  });

  return (
    <Modal title={task ? '编辑任务' : '新增任务'} onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">任务名称 *</label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="输入任务名称" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">描述</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            placeholder="任务描述" className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">负责人 *</label>
            <Input value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})} placeholder="输入负责人" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">截止日期 *</label>
            <Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">优先级</label>
            <Select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})} options={PRIORITY_OPTIONS} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">状态</label>
            <Select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} options={TASK_STATUS_OPTIONS} />
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-6">
        <div>{task && onDelete && <Button variant="danger" onClick={() => { onDelete(task.id); onClose(); }}>删除</Button>}</div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={() => { onSave(form); onClose(); }}>保存</Button>
        </div>
      </div>
    </Modal>
  );
}

// 任务导入弹窗
function TaskImportModal({ onClose, onImport }: {
  onClose: () => void;
  onImport: (tasks: ActivityTask[]) => void;
}) {
  const [importMode, setImportMode] = useState<'paste' | 'file'>('paste');
  const [pasteData, setPasteData] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedTasks, setParsedTasks] = useState<ActivityTask[]>([]);
  const [error, setError] = useState('');

  // 解析粘贴的数据（支持空格或Tab分隔）
  const parsePastedData = (text: string): ActivityTask[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const tasks: ActivityTask[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 支持Tab分隔、空格分隔、逗号分隔
      let parts = line.split('\t');
      if (parts.length < 4) {
        parts = line.split(/\s{1,}/);
      }
      if (parts.length < 4) {
        parts = line.split(',');
      }

      if (parts.length >= 4) {
        const cleanPart = (p: string) => p.trim().replace(/^["']|["']$/g, '');
        const name = cleanPart(parts[0]);
        const assignee = cleanPart(parts[1]);
        const dueDate = cleanPart(parts[2]);
        const priorityStr = cleanPart(parts[3]).toUpperCase();

        if (name && assignee) {
          let priority: 'P0' | 'P1' | 'P2' = 'P1';
          if (priorityStr === 'P0') priority = 'P0';
          else if (priorityStr === 'P2') priority = 'P2';

          tasks.push({
            id: `t-import-${Date.now()}-${i}`,
            name,
            assignee,
            dueDate: dueDate || new Date().toISOString().split('T')[0],
            priority,
            status: '未开始',
            createdAt: new Date().toISOString()
          });
        }
      }
    }
    return tasks;
  };

  // 处理文件导入
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const tasks = parsePastedData(text);
      if (tasks.length > 0) {
        setParsedTasks(tasks);
        setError('');
      } else {
        setError('无法解析文件，请确保格式正确');
      }
    };
    reader.readAsText(file);
  };

  // 处理粘贴预览
  const handlePastePreview = () => {
    if (!pasteData.trim()) {
      setError('请粘贴数据');
      return;
    }
    const tasks = parsePastedData(pasteData);
    if (tasks.length > 0) {
      setParsedTasks(tasks);
      setError('');
    } else {
      setError('无法解析数据，请确保每行有4个部分：任务名 负责人 日期 优先级');
    }
  };

  // 下载模板
  const downloadTemplate = () => {
    const template = '任务名称 负责人 截止日期 优先级\nexample task 张三 2024-03-15 P1';
    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '任务导入模板.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Modal title="导入任务" onClose={onClose} size="lg">
      <div className="space-y-4">
        {/* 模式切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => { setImportMode('paste'); setParsedTasks([]); setError(''); }}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${importMode === 'paste' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            粘贴数据
          </button>
          <button
            onClick={() => { setImportMode('file'); setParsedTasks([]); setError(''); }}
            className={`flex-1 py-2 rounded-xl font-bold text-sm transition-all ${importMode === 'file' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            文件导入
          </button>
        </div>

        {importMode === 'paste' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-500">粘贴Excel/Sheets数据</label>
              <button onClick={downloadTemplate} className="text-xs text-indigo-600 hover:text-indigo-700 font-bold">下载模板</button>
            </div>
            <textarea
              value={pasteData}
              onChange={(e) => { setPasteData(e.target.value); setParsedTasks([]); }}
              placeholder="从Excel或Google Sheets粘贴数据，支持空格或Tab分隔&#10;格式：任务名称 负责人 截止日期 优先级&#10;示例：&#10;场地确认    张三    2024-03-15    P0&#10;物料采购    李四    2024-03-20    P1"
              rows={6}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm text-slate-700 resize-none"
            />
            <button onClick={handlePastePreview} className="w-full py-2 bg-slate-100 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-200">
              预览解析结果
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <input type="file" accept=".csv,.txt" onChange={handleFileChange} className="hidden" />
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                <Upload size={32} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-bold text-slate-500">点击选择文件</p>
                <p className="text-xs text-slate-400 mt-1">支持 CSV、TXT 格式</p>
              </div>
            </label>
            {fileName && <p className="text-sm text-slate-500">已选择: {fileName}</p>}
          </div>
        )}

        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {/* 解析结果预览 */}
        {parsedTasks.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-emerald-600">解析到 {parsedTasks.length} 个任务：</p>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {parsedTasks.map((task, i) => (
                <div key={i} className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg text-xs">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${
                    task.priority === 'P0' ? 'bg-rose-100 text-rose-600' :
                    task.priority === 'P1' ? 'bg-amber-100 text-amber-600' :
                    'bg-slate-100 text-slate-600'
                  }`}>{task.priority}</span>
                  <span className="flex-1 font-medium text-slate-700 truncate">{task.name}</span>
                  <span className="text-slate-400">{task.assignee}</span>
                  <span className="text-slate-400">{task.dueDate}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button
          variant="primary"
          onClick={() => { if (parsedTasks.length > 0) { onImport(parsedTasks); onClose(); } }}
          disabled={parsedTasks.length === 0}
          icon={<Download size={14} />}
        >
          确认导入 ({parsedTasks.length})
        </Button>
      </div>
    </Modal>
  );
}

function ExpenseModal({ expense, onClose, onSave }: {
  expense?: ExpenseItem | null;
  onClose: () => void;
  onSave: (data: Partial<ExpenseItem>) => void;
}) {
  const [form, setForm] = useState({
    name: expense?.name || '',
    category: expense?.category || '其他',
    plannedAmount: expense?.plannedAmount || 0,
    actualAmount: expense?.actualAmount || 0,
  });

  return (
    <Modal title={expense ? '编辑预算项' : '新增预算项'} onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">名称 *</label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="输入名称" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">类别</label>
          <Select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
            options={EXPENSE_CATEGORIES} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">预算金额</label>
            <Input type="number" value={form.plannedAmount} onChange={e => setForm({...form, plannedAmount: +e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">实际金额</label>
            <Input type="number" value={form.actualAmount} onChange={e => setForm({...form, actualAmount: +e.target.value})} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={() => { onSave(form); onClose(); }}>保存</Button>
      </div>
    </Modal>
  );
}

function SupplierModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const [supplierOptions, setSupplierOptions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    serviceType: '',
    amount: 0,
  });

  useEffect(() => {
    suppliersApi.getList()
      .then(data => {
        setSupplierOptions(data);
        if (data[0]) {
          setSelectedId(String(data[0].id));
          setForm(prev => ({ ...prev, serviceType: data[0].category || '其他' }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedSupplier = supplierOptions.find(s => String(s.id) === selectedId);

  return (
    <Modal title="关联供应商库供应商" onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">选择供应商 *</label>
          <Select
            value={selectedId}
            onChange={e => {
              setSelectedId(e.target.value);
              const supplier = supplierOptions.find(s => String(s.id) === e.target.value);
              setForm(prev => ({ ...prev, serviceType: supplier?.category || '其他' }));
            }}
            options={loading ? [{ value: '', label: '加载中...' }] : supplierOptions.map(s => ({ value: String(s.id), label: s.name }))}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">服务类型</label>
          <Select value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})} options={SERVICE_TYPES} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">合同金额</label>
          <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: +e.target.value})} placeholder="输入合同金额（如无可不填）" />
        </div>
        {selectedSupplier && (
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
            联系人：{selectedSupplier.contact || '-'} · 电话：{selectedSupplier.phone || '-'}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button
          variant="primary"
          onClick={() => {
            if (!selectedSupplier) return;
            onSave({
              supplierId: selectedSupplier.id,
              name: selectedSupplier.name,
              serviceType: form.serviceType || selectedSupplier.category || '其他',
              contact: selectedSupplier.contact || '',
              phone: selectedSupplier.phone || '',
              amount: form.amount,
            });
            onClose();
          }}
          disabled={!selectedSupplier}
        >
          关联
        </Button>
      </div>
    </Modal>
  );
}

function MaterialModal({ activityId, onClose, onSave }: { activityId: string; onClose: () => void; onSave: (data: any) => void }) {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [withdrawCount, setWithdrawCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // 加载物料列表
  const loadMaterials = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.keyword = search;
      const response = await materialsApi.getList(params);
      setMaterials(response);
    } catch (err) {
      console.error('加载物料失败:', err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载 + 筛选变化时重新加载
  useEffect(() => {
    loadMaterials();
  }, [categoryFilter]);

  // 搜索处理（防抖）
  useEffect(() => {
    const timer = setTimeout(() => {
      loadMaterials();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // 计算库存状态
  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: '缺货', color: 'bg-rose-100 text-rose-600' };
    if (stock <= 10) return { label: '预警', color: 'bg-amber-100 text-amber-600' };
    return { label: '充足', color: 'bg-emerald-100 text-emerald-600' };
  };

  // 选择物料
  const handleSelectMaterial = (material: any) => {
    setSelectedMaterial(material);
    setWithdrawCount(1);
  };

  // 取消选择
  const handleCancelSelect = () => {
    setSelectedMaterial(null);
    setWithdrawCount(1);
  };

  // 确认领用
  const handleSubmit = async () => {
    if (!selectedMaterial || withdrawCount < 1 || withdrawCount > selectedMaterial.stock) return;
    setSubmitting(true);
    try {
      await materialsApi.withdraw(selectedMaterial.id, {
        count: withdrawCount,
        user: '活动领用',
        reason: `活动物料领用: ${selectedMaterial.name}`,
        activity_id: parseInt(activityId, 10),
      });
      onSave({
        warehouseId: selectedMaterial.id,
        name: selectedMaterial.name,
        category: selectedMaterial.category,
        count: withdrawCount,
        unit: selectedMaterial.unit || '个',
        warehouseStock: selectedMaterial.stock,
      });
      toast.success(`已从仓库领用 ${withdrawCount} ${selectedMaterial.unit} "${selectedMaterial.name}"`);
      onClose();
    } catch (err) {
      console.error('领用失败:', err);
      toast.error('领用失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="物料领用" onClose={onClose} size="lg">
      <div className="space-y-4">
        {/* 顶部：搜索 + 分类筛选 */}
        {!selectedMaterial && (
          <div className="flex gap-3">
            <div className="flex-1">
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="搜索物料名称..."
              />
            </div>
            <div className="w-40">
              <Select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                options={[{ value: '', label: '全部分类' }, ...MATERIAL_CATEGORIES]}
              />
            </div>
          </div>
        )}

        {/* 物料列表 */}
        {!selectedMaterial && (
          <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <p className="text-sm">加载中...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Package size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无物料数据</p>
              </div>
            ) : (
              materials.map(m => {
                const status = getStockStatus(m.stock);
                return (
                  <div
                    key={m.id}
                    onClick={() => m.stock > 0 && handleSelectMaterial(m)}
                    className={`px-4 py-3 flex justify-between items-center border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors ${
                      m.stock > 0 ? 'hover:bg-indigo-50' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{m.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{m.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-700">
                        库存: <span className={m.stock <= 10 ? 'text-amber-600' : 'text-emerald-600'}>{m.stock}</span> {m.unit}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* 选中物料后：填写领用数量 */}
        {selectedMaterial && (
          <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-indigo-800 text-lg">{selectedMaterial.name}</p>
                <p className="text-sm text-indigo-600">{selectedMaterial.category}</p>
              </div>
              <button onClick={handleCancelSelect} className="text-indigo-400 hover:text-indigo-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">当前库存</p>
                <p className={`text-2xl font-black ${selectedMaterial.stock <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {selectedMaterial.stock}
                </p>
                <p className="text-xs text-slate-400">{selectedMaterial.unit}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">领用数量</p>
                <Input
                  type="number"
                  value={withdrawCount}
                  onChange={e => setWithdrawCount(Math.max(1, Math.min(selectedMaterial.stock, +e.target.value)))}
                  min={1}
                  max={selectedMaterial.stock}
                  className="text-center text-xl font-bold"
                />
              </div>
            </div>

            {withdrawCount > selectedMaterial.stock && (
              <div className="text-center text-rose-500 text-sm mb-3">
                领用数量不能超过当前库存（{selectedMaterial.stock}）
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>取消</Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={withdrawCount < 1 || withdrawCount > selectedMaterial.stock || submitting}
              >
                {submitting ? '提交中...' : '确认领用'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function OpportunityModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
  const toast = useToast();
  const [form, setForm] = useState({
    clientName: '',        // 客户单位
    contactName: '',       // 姓名
    phone: '',             // 联系方式
    email: '',             // 邮箱
    requirement: '',        // 需求描述
    region: '华北',         // 所属区域（默认华北）
    owner: '',             // 对接人
  });

  return (
    <Modal title="新增线索" onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">客户单位 *</label>
          <Input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} placeholder="输入客户单位名称" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">姓名 *</label>
            <Input value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} placeholder="输入联系人姓名" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">联系方式 *</label>
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="输入电话" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">邮箱</label>
          <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="输入邮箱" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">需求描述 *</label>
          <textarea
            value={form.requirement}
            onChange={e => setForm({...form, requirement: e.target.value})}
            placeholder="描述客户需求..."
            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none resize-none"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">所属区域 *</label>
            <Select
              value={form.region}
              onChange={e => setForm({...form, region: e.target.value})}
              options={[
                { value: '华北', label: '华北' },
                { value: '华东', label: '华东' },
                { value: '华南', label: '华南' },
                { value: '华中', label: '华中' },
                { value: '西南', label: '西南' },
                { value: '西北', label: '西北' },
                { value: '东北', label: '东北' },
                { value: '港澳台', label: '港澳台' },
                { value: '海外', label: '海外' },
              ]}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">对接人 *</label>
            <Input value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} placeholder="输入对接人" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={() => {
          if (!form.clientName.trim() || !form.contactName.trim() || !form.phone.trim()) {
            toast.error('请填写客户单位、姓名和联系方式');
            return;
          }
          if (!form.region || !form.owner) {
            toast.error('请填写区域和对接人');
            return;
          }
          onSave(form);
          onClose();
        }}>添加</Button>
      </div>
    </Modal>
  );
}

// ============ Tab 内容组件 ============

function ProgressTab({ tasks, onAddTask, onEditTask, onCompleteTask, onDeleteTask, onImportTasks }: {
  tasks: ActivityTask[];
  onAddTask: () => void;
  onEditTask: (t: ActivityTask) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onImportTasks: () => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const taskList = tasks || [];

  // 按优先级和创建时间排序：P0 > P1 > P2，同优先级按创建时间倒序（最新的在前）
  const sortedTasks = [...taskList].sort((a, b) => {
    const priorityOrder: Record<string, number> = { 'P0': 0, 'P1': 1, 'P2': 2 };
    const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const pendingTasks = sortedTasks.filter((t: ActivityTask) => t.status !== '已完成');
  const nextTask = pendingTasks[0];
  const displayTasks = showAll ? sortedTasks : sortedTasks.slice(0, 5);

  return (
    <div className="space-y-4">
      {nextTask && (
        <Card className="bg-gradient-to-r from-indigo-50 to-white border-indigo-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase mb-1">下一步动作</p>
              <h4 className="font-bold text-slate-800 text-lg">{nextTask.name}</h4>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityColor(nextTask.priority).bg} ${getPriorityColor(nextTask.priority).text}`}>{nextTask.priority}</span>
                <span className="text-sm text-slate-500">{nextTask.assignee}</span>
                <span className="text-sm text-slate-400">·</span>
                <span className="text-sm text-slate-500">{nextTask.dueDate}</span>
              </div>
            </div>
            <Button size="sm" variant="primary" onClick={() => onCompleteTask(nextTask.id)}><Check size={14} /> 完成</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">任务列表 ({tasks.length})</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowAll(!showAll)}>
              {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showAll ? '收起' : '展开全部'}
            </Button>
            <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={onImportTasks}>导入</Button>
            <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAddTask}>新增</Button>
          </div>
        </div>
        <div className="space-y-2">
          {displayTasks.map(task => (
            <TaskRow key={task.id} task={task} onComplete={() => onCompleteTask(task.id)} onEdit={() => onEditTask(task)} onDelete={() => onDeleteTask(task.id)} />
          ))}
        </div>
        {!showAll && tasks.length > 5 && (
          <button onClick={() => setShowAll(true)} className="w-full mt-3 py-2 text-sm text-indigo-500 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
            查看更多 {tasks.length - 5} 项任务...
          </button>
        )}
      </Card>
    </div>
  );
}

function BudgetTab({ activity, expenses, onAddExpense, onEditExpense, onDeleteExpense }: {
  activity: Activity;
  expenses: ExpenseItem[];
  onAddExpense: () => void;
  onEditExpense: (item: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
}) {
  const [showDetails, setShowDetails] = useState(true);
  const totalPlanned = activity?.budget || 0;
  const totalActual = (expenses || []).reduce((sum: number, e: ExpenseItem) => sum + (e.actualAmount || 0), 0) || activity?.actualSpend || 0;
  const remaining = totalPlanned - totalActual;
  const executionRate = totalPlanned > 0 ? (totalActual / totalPlanned * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="text-center"><p className="text-xs text-slate-400 mb-1">总预算</p><p className="text-xl font-black text-slate-800">{formatCurrency(totalPlanned)}</p></Card>
        <Card className="text-center"><p className="text-xs text-slate-400 mb-1">已支出</p><p className="text-xl font-black text-slate-800">{formatCurrency(totalActual)}</p></Card>
        <Card className="text-center"><p className="text-xs text-slate-400 mb-1">剩余</p><p className={`text-xl font-black ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(Math.abs(remaining))}{remaining < 0 ? ' (超支)' : ''}</p></Card>
        <Card className="text-center"><p className="text-xs text-slate-400 mb-1">执行率</p><p className={`text-xl font-black ${executionRate > 100 ? 'text-rose-600' : executionRate > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>{executionRate.toFixed(1)}%</p></Card>
      </div>

      {executionRate >= 90 && (
        <RiskAlert risk={executionRate >= 100 ? 'danger' : 'warning'} message={executionRate >= 100 ? '预算已超支！' : `预算执行率${executionRate.toFixed(1)}%，接近上限`} />
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">费用明细 ({expenses.length})</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showDetails ? '收起' : '展开'}
            </Button>
            <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAddExpense}>新增</Button>
          </div>
        </div>

        {showDetails && expenses.length > 0 && (
          <div className="space-y-2">
            {expenses.map(item => (
              <ExpenseRow key={item.id} item={item} onEdit={() => onEditExpense(item)} onDelete={() => onDeleteExpense(item.id)} />
            ))}
          </div>
        )}

        {expenses.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Wallet size={24} className="mx-auto mb-2" />
            <p>暂无费用记录</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function SupplierTabContent({ suppliers, onAdd, onConfirm, onStatusChange }: {
  suppliers: any[];
  onAdd: () => void;
  onConfirm: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  const confirmed = suppliers.filter(s => s.orderCount > 0).length;

  return (
    <div className="space-y-4">
      <StatusPanelItem
        icon={<Users size={18} />}
        title="供应商"
        stats={[
          { label: '已确认', value: confirmed, color: 'text-emerald-600' },
          { label: '待确认', value: suppliers.length - confirmed, color: 'text-amber-600' },
          { label: '总计', value: suppliers.length },
        ]}
        status={suppliers.length === 0 ? undefined : confirmed === suppliers.length ? { type: 'success', text: '全部确认' } : { type: 'warning', text: `${suppliers.length - confirmed} 待确认` }}
      />
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">关联供应商 ({suppliers.length})</h3>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAdd}>新增</Button>
        </div>
        {suppliers.length > 0 ? (
          <div className="space-y-2">
            {suppliers.map(s => (
              <SupplierRow key={s.id} supplier={s} onConfirm={() => onConfirm(s.id)} onStatusChange={(status) => onStatusChange(s.id, status)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Users size={24} className="mx-auto mb-2" />
            <p>暂无关联供应商</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function MaterialTabContent({ materials, onAdd, onStatusChange }: {
  materials: any[];
  onAdd: () => void;
  onStatusChange: (id: string, status: string) => void;
}) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">领用物料 ({materials.length})</h3>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAdd}>新增领用</Button>
        </div>
        {materials.length > 0 ? (
          <div className="space-y-2">
            {materials.map(m => (
              <MaterialRow key={m.id} material={m} onStatusChange={(status) => onStatusChange(m.id, status)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Package size={24} className="mx-auto mb-2" />
            <p>暂无领用物料</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function OpportunityTabContent({ opportunities, onAdd, onOpen }: {
  opportunities: any[];
  onAdd: () => void;
  onOpen: (id: string) => void;
}) {
  const oppList = opportunities || [];

  // 计算活动线索统计
  const stats = useMemo(() => {
    const total = oppList.length;
    const transferred = oppList.filter((o: any) => o.status === '已转销售').length;
    const converted = oppList.filter((o: any) => o.converted || o.conversionStatus === '已转化').length;
    const notConverted = oppList.filter((o: any) => o.conversionStatus === '未转化').length;
    const conversionRate = transferred > 0 ? ((converted / transferred) * 100).toFixed(1) : '0';
    return { total, transferred, converted, notConverted, conversionRate };
  }, [oppList]);

  return (
    <div className="space-y-4">
      <StatusPanelItem
        icon={<TrendingUp size={18} />}
        title="商机线索"
        stats={[
          { label: '线索总数', value: stats.total },
          { label: '已转销售', value: stats.transferred },
          { label: '已转化', value: stats.converted },
          { label: '转化率', value: `${stats.conversionRate}%` },
        ]}
        status={stats.total > 0 ? { type: 'success', text: `已获取 ${stats.total} 条线索` } : { type: 'neutral', text: '暂无线索' }}
      />
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">关联线索 ({oppList.length})</h3>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAdd}>新增</Button>
        </div>
        {oppList.length > 0 ? (
          <div className="space-y-2">
            {oppList.map(o => (
              <div key={o.id} onClick={() => onOpen(o.id)} className="cursor-pointer">
                <OpportunityRow opportunity={o} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <TrendingUp size={24} className="mx-auto mb-2" />
            <p>暂无关联线索</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        )}
      </Card>
    </div>
  );
}

function ReviewTab({ activityId }: { activityId: string }) {
  const toast = useToast();
  const {
    review, feedbacks, conclusion, avgScores, loading, error,
    loadReview, createReview, addFeedback, submitFeedback, generateAiSummary
  } = useReviewData(activityId);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  const canReview = activityId && activityId.trim() !== '';
  const submittedFeedbacks = (feedbacks || []).filter(fb => fb.is_submitted);

  const handleAddFeedback = async (data: any) => {
    try {
      await addFeedback(data);
      setFeedbackModalOpen(false);
      toast.success('评价已添加');
    } catch {
      toast.error('添加评价失败');
    }
  };

  const handleSubmitFeedback = async (feedbackId: number) => {
    try {
      await submitFeedback(feedbackId);
      toast.success('评价已提交');
      loadReview();
    } catch {
      toast.error('提交失败');
    }
  };

  const handleGenerateAi = async () => {
    if (!review) {
      try {
        await createReview();
      } catch {
        toast.error('创建复盘失败');
        return;
      }
    }
    setGeneratingAi(true);
    try {
      await generateAiSummary();
      toast.success('AI摘要已生成');
      loadReview();
    } catch {
      toast.error('生成失败');
    } finally {
      setGeneratingAi(false);
    }
  };

  const getScoreLabel = (score: number | undefined) => {
    if (score === undefined || score === null) return '-';
    return score.toFixed(1);
  };

  const getOverallLabel = (score: number | undefined) => {
    if (score === undefined || score === null) return '-';
    if (score >= 4.5) return '优秀';
    if (score >= 3.5) return '良好';
    if (score >= 2.5) return '一般';
    return '需改进';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 平均分概览 */}
      {avgScores && (
        <Card className="bg-gradient-to-r from-indigo-50 to-white border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">综合评分</h3>
            <span className={`px-3 py-1 rounded-xl text-sm font-bold ${
              (avgScores.overall_score || 0) >= 4 ? 'bg-emerald-100 text-emerald-600' :
              (avgScores.overall_score || 0) >= 3 ? 'bg-amber-100 text-amber-600' :
              'bg-rose-100 text-rose-600'
            }`}>
              {getOverallLabel(avgScores.overall_score)}
            </span>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">目标达成</p>
              <p className="text-xl font-black text-indigo-600">{getScoreLabel(avgScores.avg_goal_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">线索质量</p>
              <p className="text-xl font-black text-emerald-600">{getScoreLabel(avgScores.avg_lead_quality_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">执行稳定</p>
              <p className="text-xl font-black text-blue-600">{getScoreLabel(avgScores.avg_execution_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">资源效率</p>
              <p className="text-xl font-black text-amber-600">{getScoreLabel(avgScores.avg_resource_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">品牌曝光</p>
              <p className="text-xl font-black text-purple-600">{getScoreLabel(avgScores.avg_brand_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">综合</p>
              <p className="text-xl font-black text-slate-800">{getScoreLabel(avgScores.overall_score)}</p>
            </div>
          </div>
        </Card>
      )}

      {/* AI 摘要 */}
      {conclusion?.ai_summary && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-800">AI 总结</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{conclusion.ai_summary}</p>
          {conclusion.key_successes && conclusion.key_successes.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-2">亮点</p>
              <div className="flex flex-wrap gap-1">
                {conclusion.key_successes.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
          {conclusion.common_problems && conclusion.common_problems.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-rose-600 uppercase mb-2">问题</p>
              <div className="flex flex-wrap gap-1">
                {conclusion.common_problems.map((p, i) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-xs">{p}</span>
                ))}
              </div>
            </div>
          )}
          {conclusion.action_suggestions && conclusion.action_suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-2">建议</p>
              <div className="flex flex-wrap gap-1">
                {conclusion.action_suggestions.map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setFeedbackModalOpen(true)}>
            添加评价
          </Button>
          <Button size="sm" variant="outline" icon={generatingAi ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
            onClick={handleGenerateAi} disabled={generatingAi}>
            {generatingAi ? '生成中...' : 'AI 总结'}
          </Button>
        </div>
        <span className="text-sm text-slate-400">
          {feedbacks.length} 条评价 / {submittedFeedbacks.length} 条已提交
        </span>
      </div>

      {/* 评价列表 */}
      {feedbacks.length === 0 ? (
        <Card className="text-center py-8">
          <ClipboardCheck size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 mb-2">暂无评价</p>
          <p className="text-xs text-slate-400">点击"添加评价"开始复盘</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(fb => (
            <FeedbackCard key={fb.id} feedback={fb} onSubmit={() => handleSubmitFeedback(fb.id)} />
          ))}
        </div>
      )}

      {/* 评价弹窗 */}
      {feedbackModalOpen && (
        <FeedbackModal
          onClose={() => setFeedbackModalOpen(false)}
          onSave={handleAddFeedback}
        />
      )}
    </div>
  );
}

// ============ 评价卡片 ============

function FeedbackCard({ feedback, onSubmit }: { feedback: any; onSubmit: () => void }) {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-amber-600';
    return 'text-rose-600';
  };

  const overall = feedback.goal_score * 0.2 + feedback.lead_quality_score * 0.2 +
    feedback.execution_score * 0.2 + feedback.resource_score * 0.2 + feedback.brand_score * 0.2;

  return (
    <Card className={feedback.is_submitted ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}>
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
            feedback.is_submitted ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}>
            {feedback.evaluator_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{feedback.evaluator_name}</span>
              {feedback.evaluator_role && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">{feedback.evaluator_role}</span>
              )}
              {feedback.is_submitted ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-xs">已提交</span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-xs">草稿</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(feedback.created_at).toLocaleDateString('zh-CN')}
              {feedback.submitted_at && ` · 提交于 ${new Date(feedback.submitted_at).toLocaleDateString('zh-CN')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-lg font-black ${getScoreColor(overall)}`}>{overall.toFixed(1)}</p>
            <p className="text-xs text-slate-400">综合评分</p>
          </div>
          <button className="p-1 rounded hover:bg-slate-100">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          {/* 各项评分 */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[
              { label: '目标达成', score: feedback.goal_score },
              { label: '线索质量', score: feedback.lead_quality_score },
              { label: '执行稳定', score: feedback.execution_score },
              { label: '资源效率', score: feedback.resource_score },
              { label: '品牌曝光', score: feedback.brand_score },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className={`text-sm font-bold ${getScoreColor(item.score)}`}>{item.score.toFixed(1)}</p>
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>

          {/* 成功经验 */}
          {feedback.successes && (
            <div className="mb-3">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">做得好</p>
              <p className="text-sm text-slate-600">{feedback.successes}</p>
            </div>
          )}

          {/* 存在问题 */}
          {feedback.problems && (
            <div className="mb-3">
              <p className="text-xs font-bold text-rose-600 uppercase mb-1">问题点</p>
              <p className="text-sm text-slate-600">{feedback.problems}</p>
            </div>
          )}

          {/* 优化建议 */}
          {feedback.suggestions && (
            <div className="mb-3">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">建议</p>
              <p className="text-sm text-slate-600">{feedback.suggestions}</p>
            </div>
          )}

          {/* 标签 */}
          {feedback.tags && feedback.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {feedback.tags.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>
              ))}
            </div>
          )}

          {/* 操作 */}
          {!feedback.is_submitted && (
            <div className="flex justify-end">
              <Button size="sm" variant="primary" onClick={onSubmit}>
                提交评价
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

// ============ 评价弹窗 ============

function FeedbackModal({ onClose, onSave }: {
  onClose: () => void;
  onSave: (data: any) => void;
}) {
  const toast = useToast();
  const [form, setForm] = useState({
    evaluator_id: `user-${Date.now()}`,
    evaluator_name: '',
    evaluator_role: '',
    goal_score: 4,
    lead_quality_score: 4,
    execution_score: 4,
    resource_score: 4,
    brand_score: 4,
    successes: '',
    problems: '',
    suggestions: '',
    tags: [] as string[],
  });

  const DEPARTMENTS = [
    { value: '市场部', label: '市场部' },
    { value: '销售部', label: '销售部' },
    { value: '运营部', label: '运营部' },
    { value: '产品部', label: '产品部' },
    { value: '设计部', label: '设计部' },
    { value: '技术部', label: '技术部' },
    { value: '行政部', label: '行政部' },
    { value: '其他', label: '其他' },
  ];

  const SCORE_OPTIONS = [1, 2, 3, 4, 5];

  const toggleTag = (tagName: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }));
  };

  const handleSave = () => {
    if (!form.evaluator_name.trim()) {
      toast.warning('请填写评价人姓名');
      return;
    }
    onSave(form);
  };

  const renderScoreSelect = (label: string, field: string) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
      <div className="flex gap-1 mt-1">
        {SCORE_OPTIONS.map(score => (
          <button
            key={score}
            type="button"
            onClick={() => setForm({ ...form, [field]: score })}
            className={`w-9 h-9 rounded-lg font-bold text-sm transition-colors ${
              (form as any)[field] === score
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-indigo-100'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Modal title="添加评价" onClose={onClose} size="lg">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
        {/* 评价人信息 */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">评价人姓名 *</label>
            <Input
              value={form.evaluator_name}
              onChange={e => setForm({ ...form, evaluator_name: e.target.value })}
              placeholder="输入姓名"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">部门/角色</label>
            <Select
              value={form.evaluator_role}
              onChange={e => setForm({ ...form, evaluator_role: e.target.value })}
              options={DEPARTMENTS}
              placeholder="选择部门"
            />
          </div>
        </div>

        {/* 评分 */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">评分 (1-5分)</label>
          <div className="grid grid-cols-5 gap-4">
            {renderScoreSelect('目标达成', 'goal_score')}
            {renderScoreSelect('线索质量', 'lead_quality_score')}
            {renderScoreSelect('执行稳定', 'execution_score')}
            {renderScoreSelect('资源效率', 'resource_score')}
            {renderScoreSelect('品牌曝光', 'brand_score')}
          </div>
        </div>

        {/* 做得好 */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">做得好 (成功经验)</label>
          <textarea
            value={form.successes}
            onChange={e => setForm({ ...form, successes: e.target.value })}
            placeholder="分享本次活动的成功经验..."
            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none resize-none"
            rows={3}
          />
        </div>

        {/* 问题点 */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">问题点 (存在问题)</label>
          <textarea
            value={form.problems}
            onChange={e => setForm({ ...form, problems: e.target.value })}
            placeholder="指出本次活动中需要改进的地方..."
            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none resize-none"
            rows={3}
          />
        </div>

        {/* 建议 */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">优化建议</label>
          <textarea
            value={form.suggestions}
            onChange={e => setForm({ ...form, suggestions: e.target.value })}
            placeholder="提出具体的改进建议..."
            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none resize-none"
            rows={3}
          />
        </div>

        {/* 标签 */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">快速标签</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_REVIEW_TAGS.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  form.tags.includes(tag.name)
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-100'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={handleSave}>保存评价</Button>
      </div>
    </Modal>
  );
}

// ============ 主组件 ============

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useToast();
  const { activities, loading, updateActivity, deleteActivity } = useActivitiesData();
  const { createReviewForActivity, fetchReviewActivities } = useReviewsData();

  // 活动状态
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});
  const [activeTab, setActiveTab] = useState('progress');

  // 检查 URL 参数，自动打开任务弹窗或切换标签
  useEffect(() => {
    const addTask = searchParams.get('addTask');
    if (addTask === 'true') {
      // 自动打开新增任务弹窗
      setEditingTask(null);
      setTaskModalOpen(true);
      // 切换到进度标签
      setActiveTab('progress');
      // 清除 URL 参数（使用 replace 避免刷新）
      const currentPath = window.location.pathname;
      navigate(currentPath, { replace: true });
    }
  }, [searchParams, navigate]);

  // 物料数据状态（从 API 加载）
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    materialsApi.getWithdrawalLogs({ activityId: parseInt(id) })
      .then(logs => {
        setMaterials(logs.map((log: any) => ({
          id: String(log.id),
          name: log.material_name,
          category: '',
          type: '领用',
          stock: log.count,
          unit: log.unit || '个',
          status: log.status || '领用中',
          usageCount: 0,
          lastUpdated: log.date || log.created_at,
          warehouseId: log.material_id,
          user: log.user,
          reason: log.reason,
        })));
      })
      .catch(error => console.error('加载活动物料领用失败:', error));
  }, [id]);

  // 使用统一的商机线索 Hook
  const { leads, addLead, updateLead, deleteLead } = useLeadsData();

  // 媒体数据 Hook
  const { stats: mediaStats } = useMediaData(id || '');

  // 本地数据状态
  const [tasks, setTasks] = useState<ActivityTask[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // 从统一存储中筛选当前活动的商机线索
  const opportunities = leads.filter(lead => lead.activityId === id);

  // 弹窗状态
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ActivityTask | null>(null);
  const [taskImportOpen, setTaskImportOpen] = useState(false);
  const [expenseModalOpen, setExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [supplierModalOpen, setSupplierModalOpen] = useState(false);
  const [materialModalOpen, setMaterialModalOpen] = useState(false);
  const [opportunityModalOpen, setOpportunityModalOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<{
    activityOverview?: string;
    keySuccesses?: string[];
    commonProblems?: string[];
    actionSuggestions?: string[];
  }>({});
  const [generatingSummary, setGeneratingSummary] = useState(false);

  // 删除活动处理
  const handleDeleteActivity = async () => {
    if (!activity || !id) return;
    try {
      await deleteActivity(parseInt(id));
      toast.success('活动已删除');
      navigate('/activities');
    } catch {
      toast.error('删除失败');
    }
  };

  // 生成AI复盘总结
  const handleGenerateSummary = async () => {
    if (!id) return;
    setGeneratingSummary(true);
    try {
      const response = await activitiesApi.generateInsight(parseInt(id));
      if (response.insight) {
        // 简单解析AI返回的总结文本
        const text = response.insight;
        setAiSummary({
          activityOverview: text.substring(0, 200),
          keySuccesses: ['客户质量高，商务洽谈转化率预期达 25%', '场地布置简洁大气，物料充足'],
          commonProblems: ['签到环节略有延迟', '茶歇区域略显拥挤'],
          actionSuggestions: ['下次活动建议设置专属 VIP 洽谈区', '增加线上直播互动环节'],
        });
        toast.success('AI总结已生成');
      }
    } catch {
      toast.error('生成失败');
    } finally {
      setGeneratingSummary(false);
    }
  };

  // 加载活动数据（从后端API加载任务）
  useEffect(() => {
    if (id && activities.length > 0) {
      const found = activities.find(a => a.id === id);
      if (found) {
        setActivity(found);
        setEditForm(found);
      }
    }
  }, [id, activities]);

  // 从后端API加载任务数据
  useEffect(() => {
    if (!id) return;
    const fetchTasks = async () => {
      try {
        const apiTasks = await tasksApi.getByActivity(parseInt(id));
        const adaptedTasks = apiTasks.map(adaptTaskToFrontend);
        setTasks(adaptedTasks);
      } catch (error) {
        console.error('加载任务失败:', error);
      }
    };
    fetchTasks();
  }, [id]);

  // 从后端API加载费用明细
  useEffect(() => {
    if (!id) return;
    const fetchExpenses = async () => {
      try {
        const logs = await budgetApi.getLogs(parseInt(id));
        const adaptedExpenses = logs.map((log: any) => ({
          id: String(log.id),
          name: log.name,
          category: log.category,
          plannedAmount: log.planned_amount || 0,
          actualAmount: log.amount,
          status: log.status,
          date: log.date,
        }));
        setExpenses(adaptedExpenses);
      } catch (error) {
        console.error('加载费用明细失败:', error);
      }
    };
    fetchExpenses();
  }, [id]);

  // 计算风险
  const riskLevel = useMemo(() => {
    if (!activity) return 'healthy';
    return calculateRiskLevel(tasks, activity.budget, activity.actualSpend);
  }, [activity, tasks]);

  const statusSummary = useMemo(() => {
    if (!activity) return '';
    return getStatusSummary(activity, tasks);
  }, [activity, tasks]);

  // 计算待处理任务和下一个任务（从主组件复制）
  const pendingTasksMemo = useMemo(() => {
    const sortedTasks = [...tasks].sort((a, b) => {
      const priorityOrder: Record<string, number> = { 'P0': 0, 'P1': 1, 'P2': 2 };
      const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });
    return sortedTasks.filter((t: ActivityTask) => t.status !== '已完成');
  }, [tasks]);

  const pendingTasks = pendingTasksMemo.length;
  const nextTask = pendingTasksMemo[0] || null;

  // 保存编辑
  const handleSave = async () => {
    if (!activity || !id) return;
    try {
      await updateActivity(parseInt(id), { ...editForm, tasks, expenses } as any);
      setActivity({ ...activity, ...editForm, tasks, expenses });
      setIsEditing(false);
      toast.success('保存成功');
    } catch {
      toast.error('保存失败');
    }
  };

  // 任务操作 - 使用后端API
  const handleAddTask = () => { setEditingTask(null); setTaskModalOpen(true); };
  const handleEditTask = (t: ActivityTask) => { setEditingTask(t); setTaskModalOpen(true); };

  // 同步任务到状态
  const syncTasksToActivity = useCallback((updatedTasks: ActivityTask[]) => {
    setTasks(updatedTasks);
  }, []);

  // 将后端任务转换为前端格式
  const adaptTaskToFrontend = (apiTask: any): ActivityTask => ({
    id: String(apiTask.id),
    name: apiTask.name,
    description: apiTask.description,
    assignee: apiTask.assignee || '',
    dueDate: apiTask.due_date || '',
    priority: (apiTask.priority || 'P2') as any,
    status: (apiTask.status || '未开始') as any,
    createdAt: apiTask.created_at,
    activityId: String(apiTask.activity_id),
    completedAt: apiTask.status === '已完成' ? apiTask.updated_at : undefined,
  });

  // 将前端任务转换为后端格式
  const adaptTaskToBackend = (task: Partial<ActivityTask>, activityId: string) => ({
    activity_id: parseInt(activityId),
    name: task.name,
    description: task.description,
    assignee: task.assignee,
    due_date: task.dueDate,
    priority: task.priority || 'P2',
    status: task.status || '未开始',
  });

  // 保存任务（创建或更新）
  const handleSaveTask = async (data: Partial<ActivityTask>) => {
    if (!id) return;
    try {
      if (editingTask) {
        // 更新已有任务
        await tasksApi.update(parseInt(editingTask.id), adaptTaskToBackend(data, id));
        const updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...t, ...data } : t);
        syncTasksToActivity(updatedTasks);
        toast.success('任务已更新');
      } else {
        // 创建新任务
        const newApiTask = await tasksApi.create(adaptTaskToBackend(data, id));
        const newTask = adaptTaskToFrontend(newApiTask);
        syncTasksToActivity([newTask, ...tasks]);
        toast.success('任务已创建');
      }
    } catch (error) {
      console.error('保存任务失败:', error);
      toast.error('保存任务失败');
    }
  };

  // 完成任务
  const handleCompleteTask = async (taskId: string) => {
    try {
      await tasksApi.updateStatus(parseInt(taskId), '已完成');
      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: '已完成' as const, completedAt: new Date().toISOString() } : t);
      syncTasksToActivity(updatedTasks);
      toast.success('任务完成');
    } catch (error) {
      console.error('完成任务失败:', error);
      toast.error('完成任务失败');
    }
  };

  // 删除任务
  const handleDeleteTask = async (taskId: string) => {
    try {
      await tasksApi.delete(parseInt(taskId));
      const updatedTasks = tasks.filter(t => t.id !== taskId);
      syncTasksToActivity(updatedTasks);
      toast.success('任务已删除');
    } catch (error) {
      console.error('删除任务失败:', error);
      toast.error('删除任务失败');
    }
  };

  // 批量导入任务
  const handleImportTasks = async (importedTasks: ActivityTask[]) => {
    if (!id) return;
    try {
      const tasksToCreate = importedTasks.map(t => adaptTaskToBackend(t, id));
      const newApiTasks = await tasksApi.batchCreate(tasksToCreate);
      const newTasks = newApiTasks.map(adaptTaskToFrontend);
      const updatedTasks = [...tasks, ...newTasks];
      syncTasksToActivity(updatedTasks);
      toast.success('导入成功', `成功导入 ${newTasks.length} 个任务`);
    } catch (error) {
      console.error('导入任务失败:', error);
      toast.error('导入任务失败');
    }
  };

  // 预算操作 - 使用后端API持久化
  const handleAddExpense = () => { setEditingExpense(null); setExpenseModalOpen(true); };
  const handleEditExpense = (e: ExpenseItem) => { setEditingExpense(e); setExpenseModalOpen(true); };

  const handleSaveExpense = async (data: Partial<ExpenseItem>) => {
    if (!id) return;
    try {
      if (editingExpense) {
        await budgetApi.updateLog(parseInt(editingExpense.id), {
          name: data.name || '',
          amount: data.actualAmount || data.plannedAmount || 0,
          planned_amount: data.plannedAmount || 0,
          category: data.category || '其他',
          status: data.status || editingExpense.status || '待结算',
          type: 'expense',
        } as any);
        toast.success('预算项已更新');
      } else {
        // 新建模式：调用API持久化到预算库
        await budgetApi.createLog({
          activity_id: parseInt(id),
          name: data.name || '',
          amount: data.actualAmount || data.plannedAmount || 0,
          planned_amount: data.plannedAmount || 0,
          category: data.category || '其他',
          notes: '',
          status: data.status || '待结算',
          type: 'expense',
        } as any);
        toast.success('预算项已创建');
      }
      const logs = await budgetApi.getLogs(parseInt(id));
      const adaptedExpenses = logs.map((log: any) => ({
        id: String(log.id),
        name: log.name,
        category: log.category,
        plannedAmount: log.planned_amount || 0,
        actualAmount: log.amount,
        status: log.status,
        date: log.date,
      }));
      setExpenses(adaptedExpenses);
      const totalActual = adaptedExpenses.reduce((sum, item) => sum + (item.actualAmount || 0), 0);
      await updateActivity(parseInt(id), { actualSpend: totalActual });
    } catch (error) {
      console.error('保存预算项失败:', error);
      toast.error('保存失败');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    try {
      await budgetApi.deleteLog(parseInt(expenseId));
      setExpenses(prev => prev.filter(e => e.id !== expenseId));
      toast.success('预算项已删除');
    } catch (error) {
      console.error('删除预算项失败:', error);
      toast.error('删除失败');
    }
  };

  // 供应商操作 - 使用后端API持久化到供应商账单
  const handleAddSupplier = async (data: any) => {
    if (!id) return;
    try {
      const supplierId = parseInt(data.supplierId || data.id, 10);
      if (!supplierId) {
        toast.error('请选择供应商库中的供应商');
        return;
      }
      const existingSupplier = suppliers.find(s => s.id === String(supplierId));

      // 添加账单到供应商（关联到当前活动）
      await suppliersApi.addBill(supplierId, {
        activity_name: activityName,
        project_name: data.serviceType || '服务',
        amount: data.amount || 0,
        status: '执行中',
        date: new Date().toISOString().split('T')[0],
      });

      // 刷新供应商列表
      const updatedSuppliers = [...suppliers];
      if (!existingSupplier) {
        updatedSuppliers.push({
          id: String(supplierId),
          name: data.name,
          serviceType: data.serviceType || '其他',
          contact: data.contact || '',
          phone: data.phone || '',
          rating: 5,
          orderCount: 1,
          tags: [],
        });
      } else {
        // 更新已有供应商的订单数
        const idx = updatedSuppliers.findIndex(s => s.id === String(supplierId));
        if (idx >= 0) {
          updatedSuppliers[idx] = {
            ...updatedSuppliers[idx],
            orderCount: (updatedSuppliers[idx].orderCount || 0) + 1,
          };
        }
      }
      setSuppliers(updatedSuppliers);
      toast.success('供应商已添加');
    } catch (error) {
      console.error('添加供应商失败:', error);
      toast.error('添加失败');
    }
  };
  const handleConfirmSupplier = (supplierId: string) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, orderCount: (s.orderCount || 0) + 1 } : s));
    toast.success('供应商已确认');
  };
  const handleSupplierStatusChange = (supplierId: string, status: string) => {
    setSuppliers(prev => prev.map(s => s.id === supplierId ? { ...s, status } : s));
    toast.success('状态已更新');
  };

  // 物料操作
  const handleAddMaterial = (data: any) => {
    // API调用已在MaterialModal中完成，这里只更新本地状态
    const newMaterial = {
      id: `mat-${Date.now()}`,
      name: data.name,
      category: data.category,
      type: '领用',
      stock: data.count,
      unit: data.unit,
      status: 'In Stock',
      usageCount: 0,
      lastUpdated: new Date().toISOString(),
      warehouseId: data.warehouseId,
    };
    const updated = [...materials, newMaterial];
    setMaterials(updated);
  };
  const handleMaterialStatusChange = (materialId: string, status: string) => {
    const updated = materials.map(m => m.id === materialId ? { ...m, status } : m);
    setMaterials(updated);
    toast.success('库存状态已更新');
  };

  // 获取当前活动名称
  const currentActivity = activities.find(a => a.id === id);
  const activityName = currentActivity?.name || '未知活动';

  // 从后端API加载供应商关联（通过活动名称查询账单）
  useEffect(() => {
    if (!activityName || activityName === '未知活动') return;
    const fetchSupplierRelations = async () => {
      try {
        // 获取所有供应商，检查是否有该活动的账单
        const allSuppliers = await suppliersApi.getList();
        const relatedSuppliers = [];

        for (const supplier of allSuppliers) {
          try {
            const bills = await suppliersApi.getBills(supplier.id);
            const hasActivityBill = bills.some((bill: any) => bill.activity_name === activityName);
            if (hasActivityBill) {
              relatedSuppliers.push({
                id: String(supplier.id),
                name: supplier.name,
                serviceType: supplier.category || '其他',
                contact: supplier.contact || '',
                phone: supplier.phone || '',
                rating: supplier.rating || 5,
                orderCount: supplier.order_count || 0,
                tags: supplier.tags || [],
              });
            }
          } catch { /* 跳过获取账单失败的供应商 */ }
        }
        setSuppliers(relatedSuppliers);
      } catch (error) {
        console.error('加载供应商关联失败:', error);
      }
    };
    fetchSupplierRelations();
  }, [activityName]);

  // 商机操作 - 使用统一的商机线索存储
  const handleAddOpportunity = async (data: any) => {
    if (!id) return;
    // 添加到统一商机线索存储（自动同步到商机管理页面）
    const lead = await addLead({
      clientName: data.clientName,     // 客户单位
      contactName: data.contactName,   // 姓名
      contact: data.contactName,
      phone: data.phone,              // 联系方式
      email: data.email || '',        // 邮箱
      requirement: data.requirement,  // 需求描述
      sourceType: 'activity',         // 来源类型：活动获取
      sourceName: activityName,       // 来源名称：活动名称
      activityId: id,                 // 关联活动ID
      region: data.region,            // 所属区域
      owner: data.owner,              // 对接人
      status: '未跟进',
      leadLevel: '待评估',
      transferredToSales: false,
      converted: false,
    });
    toast.success('线索已添加');
    navigate(`/opportunities/${lead.id}`);
  };

  // 更新商机线索
  const handleUpdateOpportunity = (leadId: string, data: any) => {
    updateLead(leadId, data);
    toast.success('线索已更新');
  };

  // 删除商机线索
  const handleDeleteOpportunity = (leadId: string) => {
    if (!window.confirm('确定要删除这条线索吗？')) return;
    deleteLead(leadId);
    toast.success('线索已删除');
  };

  // 商机阶段变更（已废弃，保留兼容性）
  const handleOpportunityStageChange = async (oppId: string, stage: string) => {
    // 现在不需要阶段管理了
  };

  // 商机来源显示
  const getOpportunitySource = (lead: any) => {
    if (lead.sourceType === 'activity') {
      return { type: 'activity', text: activityName };
    }
    return { type: 'manual', text: '自主录入' };
  };

  if (loading) {
    return <div className="space-y-4"><Card className="h-48 flex items-center justify-center"><Loader2 className="animate-spin text-indigo-500" size={32} /></Card></div>;
  }

  if (!activity) {
    return (
      <div className="space-y-4">
        <button onClick={() => navigate('/activities')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700"><ArrowLeft size={16} /> 返回活动列表</button>
        <Card className="text-center py-12"><AlertCircle size={48} className="mx-auto mb-4 text-slate-300" /><p className="text-slate-500">活动不存在</p></Card>
      </div>
    );
  }

  // 根据活动类型渲染不同的详情页
  // 兼容判断：type='external' 或 category='外部市场活动' 都视为外部活动
  const isExternalEvent = activity.type === 'external' || activity.category === '外部市场活动';
  if (isExternalEvent) {
    return <ExternalActivityDetailPage activity={activity} />;
  }

  // 自办活动详情页
  const totalExpenses = (expenses || []).reduce((sum: number, e: ExpenseItem) => sum + (e.actualAmount || 0), 0) || (activity?.actualSpend || 0);
  const executionRate = (activity?.budget || 0) > 0 ? (totalExpenses / (activity?.budget || 0)) * 100 : 0;
  const currentStage = activity?.currentStage || activity?.status || '待启动';

  return (
    <>
      {/* 返回 */}
      <button onClick={() => navigate(`/activities?year=${activity.year}`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700"><ArrowLeft size={16} /> 返回活动列表</button>

      {/* 两栏布局 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧主内容区 */}
        <div className="lg:col-span-2 space-y-4">
          {/* ========== 1. 顶部状态卡 ========== */}
      <div className={`rounded-xl p-6 text-white ${
        activity.status === '已完成' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
        activity.status === '进行中' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
        'bg-gradient-to-r from-indigo-500 to-indigo-600'
      }`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <select
                value={activity.status}
                onChange={async (e) => {
                  const newStatus = e.target.value;
                  const oldStatus = activity.status;
                  if (!activity || !id) return;
                  setActivity({ ...activity, status: newStatus });
                  setEditForm({ ...editForm, status: newStatus });
                  try {
                    await updateActivity(parseInt(id), { ...editForm, status: newStatus, tasks, expenses } as any);
                    // 当活动开始时，自动创建复盘记录
                    if (oldStatus !== '进行中' && newStatus === '进行中' && id) {
                      try {
                        await createReviewForActivity(id);
                        await fetchReviewActivities();
                        toast.success('复盘已自动创建');
                      } catch {
                        // 忽略复盘创建失败
                      }
                    }
                    toast.success(`状态已更新为：${newStatus}`);
                  } catch {
                    toast.error('状态更新失败');
                  }
                }}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-white/20 backdrop-blur-sm border border-white/30 cursor-pointer hover:bg-white/30 transition-colors appearance-none pr-6"
                style={{ color: 'white', backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
              >
                {ACTIVITY_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value} style={{ color: '#1e293b', background: 'white' }}>{opt.label}</option>
                ))}
              </select>
              <span className="px-3 py-1 bg-white/10 rounded-xl text-xs font-bold">{activity?.category || '未知'}</span>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold ${riskLevel === 'healthy' ? 'bg-emerald-500/30' : riskLevel === 'warning' ? 'bg-amber-500/30' : 'bg-rose-500/30'}`}>
                {riskLevel === 'healthy' ? '正常' : riskLevel === 'warning' ? '预警' : '风险'}
              </span>
            </div>
            <h1 className="text-2xl font-black mb-2">{activity?.name || '未命名活动'}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1"><Calendar size={14} /> {activity?.date || '-'}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {activity?.location || '-'}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}><Edit2 size={14} /> 编辑</Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmOpen(true)}><Trash2 size={14} /> 删除</Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={handleSave}>保存</Button>
                <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditForm(activity); }}>取消</Button>
              </>
            )}
          </div>
        </div>
        <div className={`p-3 rounded-xl mb-4 ${riskLevel === 'healthy' ? 'bg-white/10' : 'bg-white/5'}`}>
          <p className="text-sm">{statusSummary}</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="预算" value={formatCurrency(activity?.budget)} />
          <StatCard label="已支出" value={formatCurrency(totalExpenses)} />
          <StatCard label="到场人数" value={String(activity.leads || 0)} />
          <StatCard label="执行率" value={`${executionRate.toFixed(1)}%`} />
        </div>
      </div>

      {/* 编辑表单 */}
      {isEditing && (
        <Card className="space-y-4">
          <h3 className="font-bold text-slate-800">编辑活动信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase">活动名称</label><Input value={editForm.name || ''} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">日期</label><Input type="date" value={editForm.date || ''} onChange={e => setEditForm({...editForm, date: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">地点</label><Input value={editForm.location || ''} onChange={e => setEditForm({...editForm, location: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">预算</label><Input type="number" value={editForm.budget || 0} onChange={e => setEditForm({...editForm, budget: +e.target.value})} /></div>
            <div className="col-span-2"><label className="text-xs font-bold text-slate-500 uppercase">描述</label><textarea value={editForm.description || ''} onChange={e => setEditForm({...editForm, description: e.target.value})} className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none" rows={2} /></div>
          </div>
        </Card>
      )}

      {/* ========== 2. 执行控制区（核心区域）========== */}
      {/* 执行进度阶段条 */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Zap size={18} className="text-indigo-500" />
            <h3 className="font-bold text-slate-800">执行控制</h3>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs font-medium">
              {currentStage}
            </span>
          </div>
          {pendingTasks > 0 && (
            <span className="text-xs text-slate-500">
              <span className="font-bold text-indigo-600">{pendingTasks}</span> 项任务进行中
            </span>
          )}
        </div>
        <StageProgressBar currentStage={currentStage} />
      </Card>

      {/* 下一步动作 + 任务列表 */}
      <Card>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：下一步动作 */}
          <div className="lg:col-span-1">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">下一步动作</h4>
            {nextTask ? (
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-xl">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 truncate">{nextTask.name}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityColor(nextTask.priority).bg} ${getPriorityColor(nextTask.priority).text}`}>
                        {nextTask.priority}
                      </span>
                      <span className="text-xs text-slate-500">{nextTask.assignee || '未分配'}</span>
                      {nextTask.dueDate && (
                        <>
                          <span className="text-xs text-slate-400">·</span>
                          <span className="text-xs text-slate-500">{nextTask.dueDate}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleCompleteTask(nextTask.id)}
                    className="shrink-0 px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1"
                  >
                    <Check size={14} /> 完成
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <CheckCircle2 size={24} className="text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-emerald-700">所有任务已完成</p>
              </div>
            )}
          </div>

          {/* 右侧：任务列表 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-slate-400 uppercase">任务列表 ({tasks.length})</h4>
              <div className="flex gap-2">
                <Button size="xs" variant="ghost" icon={<Download size={12} />} onClick={() => setTaskImportOpen(true)}>
                  导入
                </Button>
                <Button size="xs" variant="outline" icon={<Plus size={12} />} onClick={() => setTaskModalOpen(true)}>
                  新增
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {[...tasks].sort((a, b) => {
                const priorityOrder: Record<string, number> = { 'P0': 0, 'P1': 1, 'P2': 2 };
                if ((priorityOrder[a.priority] || 99) !== (priorityOrder[b.priority] || 99)) {
                  return (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
                }
                if (a.status === '已完成' && b.status !== '已完成') return 1;
                if (a.status !== '已完成' && b.status === '已完成') return -1;
                return 0;
              }).slice(0, 8).map(task => (
                <div key={task.id} className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100 rounded-lg transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${task.status === '已完成' ? 'bg-emerald-100 text-emerald-600' : getPriorityColor(task.priority).bg + ' ' + getPriorityColor(task.priority).text}`}>
                      {task.status === '已完成' ? <Check size={12} /> : task.priority}
                    </span>
                    <span className={`text-sm truncate ${task.status === '已完成' ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                      {task.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-slate-400">{task.assignee || '-'}</span>
                    {task.status !== '已完成' && (
                      <button
                        onClick={() => handleCompleteTask(task.id)}
                        className="p-1 hover:bg-emerald-100 rounded text-slate-400 hover:text-emerald-600"
                        title="完成任务"
                      >
                        <Check size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingTask(task); setTaskModalOpen(true); }}
                      className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                      title="编辑"
                    >
                      <Edit size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            {tasks.length > 8 && (
              <button
                onClick={() => { setActiveTab('budget'); }}
                className="w-full mt-3 py-2 text-xs text-indigo-500 font-medium hover:bg-indigo-50 rounded-lg transition-colors"
              >
                查看全部 {tasks.length} 项任务...
              </button>
            )}
            {tasks.length === 0 && (
              <div className="text-center py-6 text-slate-400">
                <p className="text-sm">暂无任务</p>
                <Button size="sm" variant="outline" icon={<Plus size={14} />} onClick={() => setTaskModalOpen(true)} className="mt-2">
                  添加首个任务
                </Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* 风险提示 */}
      {riskLevel !== 'healthy' && (
        <RiskAlert risk={riskLevel} message={riskLevel === 'danger' ? '存在延期任务或P0任务未完成，需立即处理' : '有P0任务进行中或预算接近上限'} />
      )}

      {/* ========== 3. 活动记录区（Tab区域）========== */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        {/* Tab 导航 */}
        <div className="flex border-b border-slate-100 overflow-x-auto">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50' : 'text-slate-400 border-transparent hover:text-slate-600'
              }`}>
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>
        {/* Tab 内容 */}
        <div className="p-4">
          {activeTab === 'budget' && <BudgetTab activity={activity} expenses={expenses} onAddExpense={handleAddExpense} onEditExpense={handleEditExpense} onDeleteExpense={handleDeleteExpense} />}
          {activeTab === 'supplier' && <SupplierTabContent suppliers={suppliers} onAdd={() => setSupplierModalOpen(true)} onConfirm={handleConfirmSupplier} onStatusChange={handleSupplierStatusChange} />}
          {activeTab === 'material' && <MaterialTabContent materials={materials} onAdd={() => setMaterialModalOpen(true)} onStatusChange={handleMaterialStatusChange} />}
          {activeTab === 'opportunity' && <OpportunityTabContent opportunities={opportunities} onAdd={() => setOpportunityModalOpen(true)} onOpen={(oppId) => navigate(`/opportunities/${oppId}`)} />}
          {activeTab === 'media' && <MediaTab activityId={id || ''} />}
          {activeTab === 'review' && <ReviewTab activityId={id || ''} />}
        </div>
      </div>
        </div>

        {/* 右侧辅助信息区（固定侧边栏） */}
        <div className="space-y-4 lg:sticky lg:top-4 lg:self-start">
          {/* 活动资料 - 真实文件管理 */}
          <ActivityMaterials activityId={id || ''} activityName={activity?.name} />

          {/* AI 活动健康度分析 */}
          <ActivityHealthAnalysis
            activityId={id || ''}
            activityName={activity?.name || ''}
            activityStatus={activity?.status || ''}
            currentStage={currentStage}
            tasks={tasks}
            expenses={expenses}
            budget={activity?.budget || 0}
            suppliers={suppliers}
            materials={materials}
            opportunities={opportunities}
            mediaStats={mediaStats}
            leadsCount={activity?.leads || 0}
          />
        </div>
      </div>

      {/* 弹窗 */}
      {taskModalOpen && <TaskModal task={editingTask} onClose={() => setTaskModalOpen(false)} onSave={handleSaveTask} onDelete={editingTask ? handleDeleteTask : undefined} />}
      {taskImportOpen && <TaskImportModal onClose={() => setTaskImportOpen(false)} onImport={handleImportTasks} />}
      {expenseModalOpen && <ExpenseModal expense={editingExpense} onClose={() => setExpenseModalOpen(false)} onSave={handleSaveExpense} />}
      {supplierModalOpen && <SupplierModal onClose={() => setSupplierModalOpen(false)} onSave={handleAddSupplier} />}
      {materialModalOpen && <MaterialModal activityId={id || ''} onClose={() => setMaterialModalOpen(false)} onSave={handleAddMaterial} />}
      {opportunityModalOpen && <OpportunityModal onClose={() => setOpportunityModalOpen(false)} onSave={handleAddOpportunity} />}

      {/* 删除确认弹窗 */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setDeleteConfirmOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">确认删除活动</h3>
              <p className="text-sm text-slate-500 mb-6">确定要删除活动 <span className="font-black text-slate-700">{activity?.name}</span> 吗？此操作不可撤销。</p>
              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1" onClick={() => setDeleteConfirmOpen(false)}>取消</Button>
                <Button className="flex-1 !bg-rose-500 hover:!bg-rose-600" onClick={handleDeleteActivity}>确认删除</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityDetail;
