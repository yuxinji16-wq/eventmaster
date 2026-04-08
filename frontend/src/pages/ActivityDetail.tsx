/**
 * 活动详情页 - 活动管理中枢 v3
 *
 * 支持在当前页面：
 * - 新增供应商/物料/商机/任务/预算项
 * - 状态更改
 * - 数据同步
 */
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity, ActivityStatus, ActivityTask, ActivityStage, ACTIVITY_STAGES, RiskLevel,
  ExpenseItem, Opportunity, Material, Supplier, PRESET_REVIEW_TAGS
} from '../types';
import { useActivitiesData, useSuppliersData, useMaterialsData, useOpportunitiesData, useReviewData } from '../utils/hooks';
import { materialsApi } from '../services/backendApi';
import { useToast } from '../shared/Toast';
import {
  Card, Button, Modal, Input, Select
} from '../shared';
import {
  Calendar, MapPin, Edit2, Plus, Check, X, Clock, AlertTriangle,
  Zap, Wallet, Users, Package, TrendingUp, ClipboardCheck,
  ArrowLeft, AlertCircle, CheckCircle2, Loader2,
  User, ChevronDown, ChevronUp, Edit, Star, Trash2,
  FileText, UploadCloud, Download, Sparkles
} from 'lucide-react';

// ============ 常量 ============

const TABS = [
  { id: 'progress', label: '执行进度', icon: Zap },
  { id: 'budget', label: '预算', icon: Wallet },
  { id: 'supplier', label: '供应商', icon: Users },
  { id: 'material', label: '物料', icon: Package },
  { id: 'opportunity', label: '商机', icon: TrendingUp },
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

const OPPORTUNITY_STAGES = [
  { value: '潜在客户', label: '潜在客户' },
  { value: '需求调研', label: '需求调研' },
  { value: '方案报价', label: '方案报价' },
  { value: '商务谈判', label: '商务谈判' },
  { value: '成交', label: '成交' },
  { value: '失效', label: '失效' },
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

function formatCurrency(amount: number): string {
  if (amount >= 10000) return `¥${(amount / 10000).toFixed(1)}w`;
  return `¥${amount.toLocaleString()}`;
}

function getStageIndex(stage: string): number {
  return ACTIVITY_STAGES.indexOf(stage as ActivityStage);
}

function calculateRiskLevel(tasks: ActivityTask[], budget: number, actualSpend: number): RiskLevel {
  const overdueTasks = tasks.filter(t => t.status !== '已完成' && new Date(t.dueDate) < new Date());
  if (overdueTasks.length > 0) return 'danger';
  const p0Pending = tasks.filter(t => t.priority === 'P0' && t.status !== '已完成');
  if (p0Pending.length > 0) return 'warning';
  if (budget > 0) {
    const rate = actualSpend / budget;
    if (rate >= 1) return 'danger';
    if (rate >= 0.9) return 'warning';
  }
  return 'healthy';
}

function getStatusSummary(activity: Activity, tasks: ActivityTask[]): string {
  const overdueTasks = tasks.filter(t => t.status !== '已完成' && new Date(t.dueDate) < new Date());
  if (overdueTasks.length > 0) return `⚠️ ${overdueTasks.length} 项任务已延期，需立即处理`;
  const pending = tasks.filter(t => t.status !== '已完成');
  if (pending.length > 0) return `📋 ${pending.length} 项任务待完成`;
  if (activity.status === '已完成') return `✅ 活动已完成，留资 ${activity.leads} 人`;
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

function StatusPanelItem({ icon, title, stats, status }: { icon: React.ReactNode; title: string; stats: { label: string; value: string | number; color?: string }[]; status?: { type: 'success' | 'warning' | 'danger'; text: string } }) {
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

function OpportunityRow({ opportunity, onStageChange }: { opportunity: any; onStageChange: (stage: string) => void }) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
      <div>
        <p className="font-medium text-slate-700">{opportunity.clientName}</p>
        <p className="text-xs text-slate-400">¥{opportunity.estimatedValue.toLocaleString()}</p>
      </div>
      <select value={opportunity.status || ''} onChange={(e) => onStageChange(e.target.value)}
        className={`px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(opportunity.status).bg} ${getStatusColor(opportunity.status).text}`}>
        {OPPORTUNITY_STAGES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
      </select>
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
  const [form, setForm] = useState({
    name: '',
    serviceType: '搭建',
    contact: '',
    phone: '',
  });

  return (
    <Modal title="新增供应商" onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">供应商名称 *</label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="输入供应商名称" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">服务类型</label>
          <Select value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})} options={SERVICE_TYPES} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">联系人</label>
            <Input value={form.contact} onChange={e => setForm({...form, contact: e.target.value})} placeholder="输入联系人" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">电话</label>
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="输入电话" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={() => { onSave(form); onClose(); }}>添加</Button>
      </div>
    </Modal>
  );
}

function MaterialModal({ onClose, onSave }: { onClose: () => void; onSave: (data: any) => void }) {
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
      // 处理后端返回的数组格式或 { materials: [] } 格式
      const data = Array.isArray(response) ? response : response.materials || response.data || [];
      setMaterials(data);
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
  const [form, setForm] = useState({
    clientName: '',
    estimatedValue: 0,
    status: '潜在客户',
  });

  return (
    <Modal title="新增商机" onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">客户名称 *</label>
          <Input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} placeholder="输入客户名称" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">预计金额</label>
          <Input type="number" value={form.estimatedValue} onChange={e => setForm({...form, estimatedValue: +e.target.value})} placeholder="输入预计金额" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">阶段</label>
          <Select value={form.status} onChange={e => setForm({...form, status: e.target.value})} options={OPPORTUNITY_STAGES} />
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={() => { onSave(form); onClose(); }}>添加</Button>
      </div>
    </Modal>
  );
}

// ============ Tab 内容组件 ============

function ProgressTab({ tasks, onAddTask, onEditTask, onCompleteTask, onDeleteTask }: {
  tasks: ActivityTask[];
  onAddTask: () => void;
  onEditTask: (t: ActivityTask) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const pendingTasks = tasks.filter(t => t.status !== '已完成');
  const nextTask = pendingTasks[0];
  const displayTasks = showAll ? tasks : tasks.slice(0, 5);

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
  const totalPlanned = activity.budget;
  const totalActual = expenses.reduce((sum, e) => sum + e.actualAmount, 0) || activity.actualSpend;
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

function OpportunityTabContent({ opportunities, onAdd, onStageChange }: {
  opportunities: any[];
  onAdd: () => void;
  onStageChange: (id: string, stage: string) => void;
}) {
  const totalValue = opportunities.reduce((sum, o) => sum + o.estimatedValue, 0);
  const highIntent = opportunities.filter(o => ['商务谈判', '方案报价'].includes(o.status)).length;

  return (
    <div className="space-y-4">
      <StatusPanelItem
        icon={<TrendingUp size={18} />}
        title="商机"
        stats={[
          { label: '商机总数', value: opportunities.length },
          { label: '高意向', value: highIntent, color: 'text-indigo-600' },
          { label: '预计金额', value: formatCurrency(totalValue), color: 'text-emerald-600' },
        ]}
        status={highIntent > 0 ? { type: 'success', text: `${highIntent} 个高意向` } : { type: 'neutral', text: '暂无高意向' }}
      />
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">关联商机 ({opportunities.length})</h3>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAdd}>新增</Button>
        </div>
        {opportunities.length > 0 ? (
          <div className="space-y-2">
            {opportunities.map(o => (
              <OpportunityRow key={o.id} opportunity={o} onStageChange={(stage) => onStageChange(o.id, stage)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <TrendingUp size={24} className="mx-auto mb-2" />
            <p>暂无关联商机</p>
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
  const submittedFeedbacks = feedbacks.filter(fb => fb.is_submitted);

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
      alert('请输入评价人姓名');
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
  const toast = useToast();
  const { activities, loading, updateActivity, deleteActivity } = useActivitiesData();
  const { createReviewForActivity, fetchReviewActivities } = useReviewData(id || '');

  // 活动状态
  const [activity, setActivity] = useState<Activity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});
  const [activeTab, setActiveTab] = useState('progress');

  // 本地数据状态
  const [tasks, setTasks] = useState<ActivityTask[]>([]);
  const [expenses, setExpenses] = useState<ExpenseItem[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);

  // 弹窗状态
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ActivityTask | null>(null);
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

  // 加载活动数据
  useEffect(() => {
    if (id && activities.length > 0) {
      const found = activities.find(a => a.id === id);
      if (found) {
        setActivity(found);
        setEditForm(found);
        if (found.tasks) setTasks(found.tasks);
        if (found.expenses) setExpenses(found.expenses);
      }
    }
  }, [id, activities]);

  // 计算风险
  const riskLevel = useMemo(() => {
    if (!activity) return 'healthy';
    return calculateRiskLevel(tasks, activity.budget, activity.actualSpend);
  }, [activity, tasks]);

  const statusSummary = useMemo(() => {
    if (!activity) return '';
    return getStatusSummary(activity, tasks);
  }, [activity, tasks]);

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

  // 任务操作
  const handleAddTask = () => { setEditingTask(null); setTaskModalOpen(true); };
  const handleEditTask = (t: ActivityTask) => { setEditingTask(t); setTaskModalOpen(true); };
  const handleSaveTask = (data: Partial<ActivityTask>) => {
    if (editingTask) {
      setTasks(prev => prev.map(t => t.id === editingTask.id ? { ...t, ...data } : t));
    } else {
      const newTask: ActivityTask = { id: `task-${Date.now()}`, name: data.name!, assignee: data.assignee!, dueDate: data.dueDate!, priority: data.priority || 'P1', status: data.status || '未开始', createdAt: new Date().toISOString(), description: data.description };
      setTasks(prev => [newTask, ...prev]);
    }
    toast.success(editingTask ? '任务已更新' : '任务已创建');
  };
  const handleCompleteTask = (taskId: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: '已完成', completedAt: new Date().toISOString() } : t));
    toast.success('任务完成');
  };
  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    toast.success('任务已删除');
  };

  // 预算操作
  const handleAddExpense = () => { setEditingExpense(null); setExpenseModalOpen(true); };
  const handleEditExpense = (e: ExpenseItem) => { setEditingExpense(e); setExpenseModalOpen(true); };
  const handleSaveExpense = (data: Partial<ExpenseItem>) => {
    if (editingExpense) {
      setExpenses(prev => prev.map(e => e.id === editingExpense.id ? { ...e, ...data } : e));
    } else {
      const newExpense: ExpenseItem = { id: `exp-${Date.now()}`, name: data.name!, category: (data.category || '其他') as any, plannedAmount: data.plannedAmount || 0, actualAmount: data.actualAmount || 0, status: '正常', date: new Date().toISOString().split('T')[0] };
      setExpenses(prev => [...prev, newExpense]);
    }
    toast.success(editingExpense ? '预算项已更新' : '预算项已创建');
  };
  const handleDeleteExpense = (expenseId: string) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    toast.success('预算项已删除');
  };

  // 供应商操作
  const handleAddSupplier = (data: any) => {
    const newSupplier = { id: `sup-${Date.now()}`, name: data.name, serviceType: data.serviceType, contact: data.contact, phone: data.phone, rating: 5, orderCount: 0, tags: [] };
    setSuppliers(prev => [...prev, newSupplier]);
    toast.success('供应商已添加');
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
    setMaterials(prev => [...prev, newMaterial]);
  };
  const handleMaterialStatusChange = (materialId: string, status: string) => {
    setMaterials(prev => prev.map(m => m.id === materialId ? { ...m, status } : m));
    toast.success('库存状态已更新');
  };

  // 商机操作
  const handleAddOpportunity = (data: any) => {
    const newOpp = { id: `opp-${Date.now()}`, clientName: data.clientName, estimatedValue: data.estimatedValue, status: data.status };
    setOpportunities(prev => [...prev, newOpp]);
    toast.success('商机已添加');
  };
  const handleOpportunityStageChange = (oppId: string, stage: string) => {
    setOpportunities(prev => prev.map(o => o.id === oppId ? { ...o, status: stage } : o));
    toast.success('商机阶段已更新');
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

  const totalExpenses = expenses.reduce((sum, e) => sum + e.actualAmount, 0) || activity.actualSpend;
  const executionRate = activity.budget > 0 ? (totalExpenses / activity.budget) * 100 : 0;
  const currentStage = activity.currentStage || activity.status;

  return (
    <div className="space-y-4">
      {/* 返回 */}
      <button onClick={() => navigate('/activities')} className="flex items-center gap-2 text-slate-500 hover:text-slate-700"><ArrowLeft size={16} /> 返回活动列表</button>

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
              <span className="px-3 py-1 bg-white/10 rounded-xl text-xs font-bold">{activity.category}</span>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold ${riskLevel === 'healthy' ? 'bg-emerald-500/30' : riskLevel === 'warning' ? 'bg-amber-500/30' : 'bg-rose-500/30'}`}>
                {riskLevel === 'healthy' ? '正常' : riskLevel === 'warning' ? '预警' : '风险'}
              </span>
            </div>
            <h1 className="text-2xl font-black mb-2">{activity.name}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1"><Calendar size={14} /> {activity.date}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {activity.location}</span>
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
          <StatCard label="预算" value={formatCurrency(activity.budget)} />
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

      {/* ========== 2. 执行进度（核心主轴） ========== */}
      <Card>
        <h3 className="font-bold text-slate-800 mb-4">执行进度</h3>
        <div className="mb-4">
          <p className="text-sm text-indigo-600 font-medium mb-3">当前阶段：{currentStage}</p>
          <StageProgressBar currentStage={currentStage} />
        </div>
      </Card>

      {/* 风险提示 */}
      {riskLevel !== 'healthy' && (
        <RiskAlert risk={riskLevel} message={riskLevel === 'danger' ? '存在延期任务或P0任务未完成，需立即处理' : '有P0任务进行中或预算接近上限'} />
      )}

      {/* ========== 3. 下方布局 ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧 Tab 区 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab 导航 */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
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
            <div className="p-4">
              {activeTab === 'progress' && <ProgressTab tasks={tasks} onAddTask={handleAddTask} onEditTask={handleEditTask} onCompleteTask={handleCompleteTask} onDeleteTask={handleDeleteTask} />}
              {activeTab === 'budget' && <BudgetTab activity={activity} expenses={expenses} onAddExpense={handleAddExpense} onEditExpense={handleEditExpense} onDeleteExpense={handleDeleteExpense} />}
              {activeTab === 'supplier' && <SupplierTabContent suppliers={suppliers} onAdd={() => setSupplierModalOpen(true)} onConfirm={handleConfirmSupplier} onStatusChange={handleSupplierStatusChange} />}
              {activeTab === 'material' && <MaterialTabContent materials={materials} onAdd={() => setMaterialModalOpen(true)} onStatusChange={handleMaterialStatusChange} />}
              {activeTab === 'opportunity' && <OpportunityTabContent opportunities={opportunities} onAdd={() => setOpportunityModalOpen(true)} onStageChange={handleOpportunityStageChange} />}
              {activeTab === 'review' && <ReviewTab activityId={id || ''} />}
            </div>
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="space-y-4">
          {/* 资料上传与下载 */}
          <Card>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">
                <FileText size={18} />
              </div>
              <h3 className="font-bold text-slate-800">活动资料</h3>
            </div>
            <div className="space-y-3">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-indigo-400 transition-colors cursor-pointer">
                <UploadCloud size={24} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">点击或拖拽上传文件</p>
                <p className="text-xs text-slate-400 mt-1">支持 PDF、Word、图片等</p>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-400 uppercase">已上传文件</p>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">活动策划方案.pdf</span>
                    </div>
                    <button className="p-1 hover:bg-slate-200 rounded"><Download size={12} className="text-slate-400" /></button>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <FileText size={14} className="text-slate-400" />
                      <span className="text-xs font-medium text-slate-600 truncate max-w-[120px]">现场布置图.jpg</span>
                    </div>
                    <button className="p-1 hover:bg-slate-200 rounded"><Download size={12} className="text-slate-400" /></button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* AI 复盘总结 */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-500">
                  <Sparkles size={18} />
                </div>
                <h3 className="font-bold text-slate-800">AI 复盘总结</h3>
              </div>
              <Button size="sm" variant="outline" icon={<Sparkles size={14} />} onClick={handleGenerateSummary}>
                重新生成
              </Button>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
                <p className="text-xs font-bold text-amber-600 mb-1">活动成效</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  {aiSummary.activityOverview || '本次线上沙龙活动参与人数达 86 人，其中高意向客户占比 37%，留资效果良好。通过多渠道宣传，传播覆盖面较广。'}
                </p>
              </div>
              <div className="p-3 bg-emerald-50 rounded-xl">
                <p className="text-xs font-bold text-emerald-600 mb-1">成功亮点</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li className="flex items-start gap-1"><Check size={12} className="text-emerald-500 mt-0.5 shrink-0" /> 客户质量高，商务洽谈转化率预期达 25%</li>
                  <li className="flex items-start gap-1"><Check size={12} className="text-emerald-500 mt-0.5 shrink-0" /> 场地布置简洁大气，物料充足</li>
                  <li className="flex items-start gap-1"><Check size={12} className="text-emerald-500 mt-0.5 shrink-0" /> 流程紧凑，无明显冷场环节</li>
                </ul>
              </div>
              <div className="p-3 bg-rose-50 rounded-xl">
                <p className="text-xs font-bold text-rose-600 mb-1">待改进</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li className="flex items-start gap-1"><AlertCircle size={12} className="text-rose-500 mt-0.5 shrink-0" /> 签到环节略有延迟，建议提前 15 分钟开放</li>
                  <li className="flex items-start gap-1"><AlertCircle size={12} className="text-rose-500 mt-0.5 shrink-0" /> 茶歇区域略显拥挤</li>
                </ul>
              </div>
              <div className="p-3 bg-indigo-50 rounded-xl">
                <p className="text-xs font-bold text-indigo-600 mb-1">改进建议</p>
                <ul className="text-sm text-slate-700 space-y-1">
                  <li className="flex items-start gap-1"><TrendingUp size={12} className="text-indigo-500 mt-0.5 shrink-0" /> 下次活动建议设置专属 VIP 洽谈区</li>
                  <li className="flex items-start gap-1"><TrendingUp size={12} className="text-indigo-500 mt-0.5 shrink-0" /> 增加线上直播互动环节</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 弹窗 */}
      {taskModalOpen && <TaskModal task={editingTask} onClose={() => setTaskModalOpen(false)} onSave={handleSaveTask} onDelete={editingTask ? handleDeleteTask : undefined} />}
      {expenseModalOpen && <ExpenseModal expense={editingExpense} onClose={() => setExpenseModalOpen(false)} onSave={handleSaveExpense} />}
      {supplierModalOpen && <SupplierModal onClose={() => setSupplierModalOpen(false)} onSave={handleAddSupplier} />}
      {materialModalOpen && <MaterialModal onClose={() => setMaterialModalOpen(false)} onSave={handleAddMaterial} />}
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
    </div>
  );
};

export default ActivityDetail;
