/**
 * 活动详情页面
 * 从 pages/ActivityDetail.tsx 迁移而来
 * Phase 1 Step 2g: 重构主页面
 */
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Activity, ActivityStatus, ActivityTask, ActivityStage, ACTIVITY_STAGES, RiskLevel,
  ExpenseItem, Opportunity, Material, Supplier, PRESET_REVIEW_TAGS
} from '@/types';
import { useActivitiesData, useSuppliersData, useMaterialsData, useLeadsData, useReviewData, useReviewsData } from '@/utils/hooks';
import { materialsApi, activitiesApi, tasksApi, budgetApi, suppliersApi } from '@/services/backendApi';
import { useToast } from '@/shared/Toast';
import {
  Card, Button, Modal, Input, Select
} from '@/shared';
import {
  Calendar, MapPin, Edit2, Plus, Check, X, Clock, AlertTriangle,
  Zap, Wallet, Users, Package, TrendingUp, ClipboardCheck,
  ArrowLeft, AlertCircle, CheckCircle2, Loader2,
  User, ChevronDown, ChevronUp, Edit, Star, Trash2,
  FileText, UploadCloud, Download, Sparkles, Upload
} from 'lucide-react';
import {
  TaskModal, TaskImportModal, ExpenseModal, SupplierModal, MaterialModal, OpportunityModal
} from '@/features/activity/modals';
import {
  StageProgressBar, RiskAlert, StatCard, StatusPanelItem
} from '@/features/activity/components';
import {
  TaskRow, SupplierRow, MaterialRow, OpportunityRow, ExpenseRow
} from '@/features/activity/rows';
import {
  getRiskColor, getPriorityColor, getStatusColor, formatCurrency,
  getStageIndex, calculateRiskLevel, getStatusSummary
} from '@/features/activity/utils';
import {
  ProgressTab, BudgetTab, SupplierTabContent, MaterialTabContent,
  OpportunityTabContent, ReviewTab, FeedbackCard, FeedbackModal
} from '@/features/activity/detail';

// ============ 常量 ============

// Tab 配置常量
const TABS = [
  { id: 'progress', label: '执行进度', icon: Zap },
  { id: 'budget', label: '预算', icon: Wallet },
  { id: 'supplier', label: '供应商', icon: Users },
  { id: 'material', label: '物料', icon: Package },
  { id: 'opportunity', label: '商机', icon: TrendingUp },
  { id: 'review', label: '复盘', icon: ClipboardCheck },
];

// 活动状态选项
const ACTIVITY_STATUS_OPTIONS = [
  { value: '待启动', label: '待启动' },
  { value: '进行中', label: '进行中' },
  { value: '复盘中', label: '复盘中' },
  { value: '已完成', label: '已完成' },
  { value: '已取消', label: '已取消' },
];

// ============ 主组件 ============

const ActivityDetailPage: React.FC = () => {
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
      setEditingTask(null);
      setTaskModalOpen(true);
      setActiveTab('progress');
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
        await tasksApi.update(parseInt(editingTask.id), adaptTaskToBackend(data, id));
        const updatedTasks = tasks.map(t => t.id === editingTask.id ? { ...t, ...data } : t);
        syncTasksToActivity(updatedTasks);
        toast.success('任务已更新');
      } else {
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
    if (!id) throw new Error('活动ID不存在');
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

      await suppliersApi.addBill(supplierId, {
        activity_name: activityName,
        project_name: data.serviceType || '服务',
        amount: data.amount || 0,
        status: '执行中',
        date: new Date().toISOString().split('T')[0],
      });

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
    const lead = await addLead({
      clientName: data.clientName,
      contactName: data.contactName,
      contact: data.contactName,
      phone: data.phone,
      email: data.email || '',
      requirement: data.requirement,
      sourceType: 'activity',
      sourceName: activityName,
      activityId: id,
      region: data.region,
      owner: data.owner,
      status: '未跟进',
      leadLevel: '待评估',
      transferredToSales: false,
      converted: false,
    });
    toast.success('线索已添加');
    navigate(`/opportunities/${lead.id}`);
  };

  const handleUpdateOpportunity = (leadId: string, data: any) => {
    updateLead(leadId, data);
    toast.success('线索已更新');
  };

  const handleDeleteOpportunity = (leadId: string) => {
    if (!window.confirm('确定要删除这条线索吗？')) return;
    deleteLead(leadId);
    toast.success('线索已删除');
  };

  const handleOpportunityStageChange = async (oppId: string, stage: string) => {
    // 现在不需要阶段管理了
  };

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

  const totalExpenses = (expenses || []).reduce((sum: number, e: ExpenseItem) => sum + (e.actualAmount || 0), 0) || (activity?.actualSpend || 0);
  const executionRate = (activity?.budget || 0) > 0 ? (totalExpenses / (activity?.budget || 0)) * 100 : 0;
  const currentStage = activity?.currentStage || activity?.status || '待启动';

  return (
    <div className="space-y-4">
      {/* 返回 */}
      <button onClick={() => navigate(`/activities?year=${activity.year}`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700"><ArrowLeft size={16} /> 返回活动列表</button>

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
              {activeTab === 'progress' && <ProgressTab tasks={tasks} onAddTask={handleAddTask} onEditTask={handleEditTask} onCompleteTask={handleCompleteTask} onDeleteTask={handleDeleteTask} onImportTasks={() => setTaskImportOpen(true)} />}
              {activeTab === 'budget' && <BudgetTab activity={activity} expenses={expenses} onAddExpense={handleAddExpense} onEditExpense={handleEditExpense} onDeleteExpense={handleDeleteExpense} />}
              {activeTab === 'supplier' && <SupplierTabContent suppliers={suppliers} onAdd={() => setSupplierModalOpen(true)} onConfirm={handleConfirmSupplier} onStatusChange={handleSupplierStatusChange} />}
              {activeTab === 'material' && <MaterialTabContent materials={materials} onAdd={() => setMaterialModalOpen(true)} onStatusChange={handleMaterialStatusChange} />}
              {activeTab === 'opportunity' && <OpportunityTabContent opportunities={opportunities} onAdd={() => setOpportunityModalOpen(true)} onOpen={(oppId) => navigate(`/opportunities/${oppId}`)} />}
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
    </div>
  );
};

export default ActivityDetailPage;
