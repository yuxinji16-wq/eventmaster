/**
 * 活动列表页面
 * 从 components/activity/ActivityManager.tsx 迁移而来
 * Phase 1 Step 3d: 重构主页面
 */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useActivitiesData, useMaterialsData, useSuppliersData, useOpportunitiesData } from '@/utils/hooks';
import { Activity, ActivityStatus, ReviewStatus, ReviewComment, ReviewData, ReviewEvaluation, Task, TaskPriority, TaskStatus } from '@/types';
import { ACTIVITY_INDUSTRIES } from '@/constants';
import {
  Plus, Search, Calendar, X, Edit2, Trash2, ChevronDown, ArrowLeft,
  Sparkles, TrendingUp, Package, Users, MessageSquare, Star, Receipt, BarChart3, Save, ClipboardCheck, Loader2,
  LayoutGrid, CalendarDays, ChevronLeft, Link, Download, Upload, Newspaper, Share2, Eye, Heart, File, Check, Video, PenTool,
  AlertTriangle, CheckCircle, Clock, Target, Wallet, Zap, AlertCircle, FileText, Folder, MoreVertical, Settings, Play, Pause
} from 'lucide-react';
import { getMarketingInsight } from '@/services/geminiService';
import { activitiesApi } from '@/services/backendApi';
import { useToast } from '@/shared/Toast';
import { AsyncState } from '@/shared/AsyncState';

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

// 活动阶段定义
const ACTIVITY_STAGES = [
  { id: 'planning', name: '筹备中', color: 'amber' },
  { id: 'executing', name: '执行中', color: 'blue' },
  { id: 'closing', name: '收尾中', color: 'purple' },
  { id: 'completed', name: '已完成', color: 'emerald' },
];

const ActivityListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const toast = useToast();
  const { activities, loading, error, addActivity, updateActivity, deleteActivity, fetchActivities } = useActivitiesData();
  const { materials } = useMaterialsData();
  const { suppliers } = useSuppliersData();
  const { opportunities } = useOpportunitiesData();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('所有年份');
  const [typeFilter, setTypeFilter] = useState('所有分类');
  const [statusFilter, setStatusFilter] = useState('所有状态');
  const [industryFilter, setIndustryFilter] = useState('所有行业');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'calendar'>('card');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [manageMode, setManageMode] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());
  const [taskImportModal, setTaskImportModal] = useState<{ open: boolean; activityId: string; activityName: string }>({ open: false, activityId: '', activityName: '' });
  const [taskSummary, setTaskSummary] = useState<Record<string, { task_count: number; completed_task_count: number }>>({});

  useEffect(() => {
    const year = searchParams.get('year');
    if (year) setYearFilter(year);
  }, [searchParams]);

  useEffect(() => {
    if (yearFilter === '所有年份') {
      setSearchParams(prev => {
        const next = new URLSearchParams(prev);
        next.delete('year');
        return next;
      });
      return;
    }
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      next.set('year', yearFilter);
      return next;
    });
  }, [yearFilter, setSearchParams]);

  useEffect(() => {
    activitiesApi.getTaskSummary().then(setTaskSummary).catch(() => setTaskSummary({}));
  }, [activities]);

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const name = activity.name || '';
      const desc = activity.description || '';
      const matchesSearch = name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           desc.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesYear = yearFilter === '所有年份' || activity.year === yearFilter;
      const matchesType = typeFilter === '所有分类' || activity.type === typeFilter;
      const matchesStatus = statusFilter === '所有状态' || activity.status === statusFilter;
      const matchesIndustry = industryFilter === '所有行业' || activity.industry === industryFilter;
      return matchesSearch && matchesYear && matchesType && matchesStatus && matchesIndustry;
    });
  }, [activities, searchQuery, yearFilter, typeFilter, statusFilter, industryFilter]);

  // 从活动数据中动态获取所有可用年份
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    activities.forEach(a => { if (a.year) years.add(a.year); });
    // 确保包含当前年份及前后一年
    const currentYear = new Date().getFullYear().toString();
    years.add(currentYear);
    years.add((parseInt(currentYear) - 1).toString());
    years.add((parseInt(currentYear) + 1).toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [activities]);

  const yearOptions = useMemo(() => [
    { label: '所有年份', value: '所有年份' },
    ...availableYears.map(y => ({ label: `${y} 年度`, value: y }))
  ], [availableYears]);

  const activitiesByMonth = useMemo(() => {
    const grouped: { [key: number]: Activity[] } = {};
    for (let i = 0; i < 12; i++) grouped[i] = [];
    filteredActivities.forEach(activity => {
      const month = parseInt(activity.date.split('-')[1]) - 1;
      if (month >= 0 && month < 12) grouped[month].push(activity);
    });
    return grouped;
  }, [filteredActivities]);

  const selectedActivity = activities.find(a => a.id === selectedActivityId);

  if (loading) {
    return (
      <AsyncState loading loadingText="活动数据加载中...">
        <div />
      </AsyncState>
    );
  }

  if (error) {
    return (
      <AsyncState
        error={error}
        errorTitle="活动数据加载失败"
        onRetry={() => fetchActivities()}
      >
        <div />
      </AsyncState>
    );
  }

  const handleUpdateActivity = async (updated: Activity) => {
    await updateActivity(parseInt(updated.id), updated);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('确定要永久删除这个活动吗？')) {
      await deleteActivity(parseInt(id));
    }
  };

  // 日历视图 - 月份详情
  if (viewMode === 'calendar' && selectedMonth !== null) {
    const monthActivities = activitiesByMonth[selectedMonth];
    return (
      <div className="space-y-4 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <button onClick={() => setSelectedMonth(null)} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-sm uppercase tracking-widest transition-all">
            <ChevronLeft size={20} /> 返回年度日历
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-black text-slate-800">{yearFilter}年 {MONTH_NAMES[selectedMonth]}</h2>
            <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl text-sm font-black">{monthActivities.length} 个活动</span>
          </div>
        </div>
        {monthActivities.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {monthActivities.map((activity) => (
              <div key={activity.id} onClick={() => navigate(`/activities/${activity.id}`)} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-indigo-200 transition-all cursor-pointer group">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${activity.status === ActivityStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : activity.status === ActivityStatus.ONGOING ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{activity.status}</span>
                  <span className="text-xs text-slate-400 font-medium">{activity.date}</span>
                </div>
                <h3 className="text-sm font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors">{activity.name}</h3>
                <p className="text-xs text-slate-400 mt-2 truncate">{activity.description || '暂无描述'}</p>
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-bold">¥{(activity.budget/10000).toFixed(1)}w</span>
                  <span className="text-xs text-indigo-600 font-bold">{activity.leads} 潜客</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl border border-slate-100 text-center">
            <Calendar size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-400 font-bold">本月暂无活动安排</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 relative">
      {/* 顶部操作栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-100">
            <button onClick={() => { setViewMode('card'); setSelectedMonth(null); }} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'card' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
              <LayoutGrid size={16} /> 卡片视图
            </button>
            <button onClick={() => setViewMode('calendar')} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-slate-500 hover:bg-slate-50'}`}>
              <CalendarDays size={16} /> 日历视图
            </button>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-slate-500 font-medium">共 <span className="text-indigo-600 font-bold">{filteredActivities.length}</span> 个活动</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setEditingActivity(null); setIsModalOpen(true); }} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all">
            <Plus size={18} /> 创建新活动
          </button>
          <button onClick={() => { setManageMode(!manageMode); setSelectedActivities(new Set()); }} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold shadow-lg transition-all ${manageMode ? 'bg-slate-600 text-white hover:bg-slate-700' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
            <Settings size={18} /> {manageMode ? '取消管理' : '管理活动'}
          </button>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input type="text" placeholder="搜索活动..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700" />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterDropdown value={yearFilter} onChange={setYearFilter} options={yearOptions} />
          <FilterDropdown value={typeFilter} onChange={setTypeFilter} options={[{label: '所有分类', value: '所有分类'}, {label: '自办活动', value: 'selfHosted'}, {label: '外部市场活动', value: 'external'}]} />
          <FilterDropdown value={statusFilter} onChange={setStatusFilter} options={[{label: '所有状态', value: '所有状态'}, ...Object.values(ActivityStatus).map(s => ({label: s, value: s}))]} />
          <FilterDropdown value={industryFilter} onChange={setIndustryFilter} options={[{label: '所有行业', value: '所有行业'}, ...ACTIVITY_INDUSTRIES.map(i => ({label: i, value: i}))]} />
        </div>
      </div>

      {/* 日历视图 */}
      {viewMode === 'calendar' && (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {MONTH_NAMES.map((monthName, index) => {
            const monthActivities = activitiesByMonth[index];
            return (
              <div key={index} onClick={() => setSelectedMonth(index)} className={`bg-white rounded-xl shadow-sm border cursor-pointer hover:shadow-lg hover:border-indigo-200 transition-all group relative overflow-hidden ${monthActivities.length > 0 ? 'border-slate-100' : 'border-slate-50'}`}>
                <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-50/30 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-all duration-700"></div>
                <div className="p-4 relative z-10">
                  <h3 className="text-base font-black text-slate-800 mb-2">{monthName}</h3>
                  {monthActivities.length > 0 ? (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-black text-indigo-600">{monthActivities.length}</span>
                        <span className="text-xs text-slate-400">活动</span>
                      </div>
                      <div className="space-y-1 max-h-20 overflow-hidden">
                        {monthActivities.slice(0, 3).map((act, i) => (
                          <div key={i} className="text-xs text-slate-600 truncate flex items-center gap-1">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${act.status === ActivityStatus.COMPLETED ? 'bg-emerald-500' : act.status === ActivityStatus.ONGOING ? 'bg-blue-500' : 'bg-amber-500'}`}></span>
                            {act.name}
                          </div>
                        ))}
                        {monthActivities.length > 3 && <div className="text-xs text-indigo-500 font-bold">+{monthActivities.length - 3} 更多</div>}
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-300 py-2">暂无活动</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 卡片视图 */}
      {viewMode === 'card' && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-10">
          {filteredActivities.map((activity) => (
            <div
              onClick={() => !manageMode && navigate(`/activities/${activity.id}`)}
              className={`bg-white p-5 rounded-xl shadow-sm border transition-all group relative overflow-hidden cursor-pointer ${manageMode ? '' : 'hover:shadow-xl hover:border-indigo-100'} ${selectedActivities.has(activity.id) ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-100'}`}>
              {manageMode && (
                <div className="absolute top-3 left-3 z-20" onClick={(e) => { e.stopPropagation(); const newSet = new Set(selectedActivities); if (newSet.has(activity.id)) newSet.delete(activity.id); else newSet.add(activity.id); setSelectedActivities(newSet); }}>
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectedActivities.has(activity.id) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300 bg-white'}`}>
                    {selectedActivities.has(activity.id) && <Check size={12} className="text-white" />}
                  </div>
                </div>
              )}
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/30 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-all duration-700"></div>
              <div className="flex justify-between items-start mb-3 relative z-10">
                <div className="flex flex-wrap gap-1.5">
                  <span className={`px-2 py-1 rounded-lg text-[10px] font-black ${activity.status === ActivityStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' : activity.status === ActivityStatus.ONGOING ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{activity.status}</span>
                  <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black">{activity.type === 'external' ? '外部市场活动' : '自办活动'}</span>
                  {activity.industry && <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-black">{activity.industry}</span>}
                </div>
              </div>
              <h3 className="text-base font-black text-slate-800 mb-1 truncate group-hover:text-indigo-600 transition-colors relative z-10">{activity.name}</h3>
              <p className="text-xs text-slate-400 font-medium line-clamp-2 mb-4 h-8 relative z-10">{activity.description || '暂无详细描述...'}</p>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600 bg-slate-50/50 p-2 rounded-xl mb-4 relative z-10">
                <Calendar size={14} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                <span>{activity.date}</span>
              </div>
              <div className="pt-3 border-t border-slate-50 flex items-center justify-between relative z-10">
                <div><p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Wallet size={10} /> 费用</p><p className="font-black text-slate-800 text-sm">¥{(activity.budget/10000).toFixed(1)}w</p></div>
                <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase flex items-center justify-end gap-1"><Target size={10} /> 潜客</p><p className="font-black text-indigo-600 text-sm">{activity.leads}</p></div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Zap size={12} className="text-indigo-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase">执行任务</span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500">
                    {taskSummary[activity.id]?.completed_task_count || 0}/{taskSummary[activity.id]?.task_count || 0}
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{
                      width: `${taskSummary[activity.id]?.task_count ? ((taskSummary[activity.id].completed_task_count || 0) / taskSummary[activity.id].task_count) * 100 : 0}%`
                    }}
                  />
                </div>
              </div>
              {manageMode && (
                <div className="absolute bottom-3 right-3 flex gap-2 z-20">
                  <button onClick={(e) => { e.stopPropagation(); setEditingActivity(activity); setIsModalOpen(true); }} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"><Edit2 size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`确定要删除活动"${activity.name}"吗？`)) { deleteActivity(activity.id); } }} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600"><Trash2 size={12} /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <ActivityFormModal activity={editingActivity} onClose={() => setIsModalOpen(false)} onSave={async (data) => {
          try {
            const year = data.date ? data.date.split('-')[0] : new Date().getFullYear().toString();
            const activityData = { ...data, year, actualSpend: editingActivity?.actualSpend || 0 };
            if (editingActivity) {
              await updateActivity(parseInt(editingActivity.id), activityData);
            } else {
              await addActivity(activityData);
            }
            if (!editingActivity) setYearFilter(year);
            setIsModalOpen(false);
          } catch (err) {
            console.error('保存活动失败:', err);
            toast.error('保存失败', '保存活动失败，请重试');
          }
        }} />
      )}

      {taskImportModal.open && (
        <TaskImportModal
          activityId={taskImportModal.activityId}
          activityName={taskImportModal.activityName}
          onClose={() => setTaskImportModal({ open: false, activityId: '', activityName: '' })}
          onImport={(tasks) => {
            const activity = activities.find(a => a.id === taskImportModal.activityId);
            if (activity) {
              const existingTasks = activity.tasks || [];
              const updatedActivity = { ...activity, tasks: [...existingTasks, ...tasks] };
              updateActivity(parseInt(activity.id), updatedActivity as any);
              toast.success('任务导入成功', `成功导入 ${tasks.length} 个任务`);
            }
          }}
        />
      )}
    </div>
  );
};


// ==================== 辅助组件 ====================
const FilterDropdown: React.FC<{ value: string; onChange: (val: string) => void; options: {label: string; value: string}[] }> = ({ value, onChange, options }) => (
  <div className="relative">
    <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-bold outline-none cursor-pointer hover:border-indigo-300 bg-slate-50 text-slate-600">
      {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
    </select>
    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
  </div>
);

const ActivityFormModal: React.FC<{ activity: Activity | null; onClose: () => void; onSave: (data: Partial<Activity>) => void }> = ({ activity, onClose, onSave }) => {
  const [formData, setFormData] = useState<Partial<Activity>>(activity || { name: '', date: new Date().toISOString().split('T')[0], location: '', type: 'selfHosted', status: ActivityStatus.PLANNED, budget: 100000, leads: 0, description: '', industry: '' });
  const [typeError, setTypeError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 验证活动类型必填
    if (!formData.type) {
      setTypeError('请选择活动类型');
      return;
    }
    setTypeError('');
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl z-10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">{activity ? '编辑活动' : '新建活动'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase">活动名称</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase">日期</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase">地点</label><input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase">活动类型</label>
              <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value, industry: e.target.value === 'selfHosted' ? '' : (formData.industry || '')})} className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-bold mt-1 ${typeError ? 'border-rose-400' : 'border-slate-200'}`}>
                <option value="">请选择活动类型</option>
                <option value="selfHosted">自办活动</option>
                <option value="external">外部市场活动</option>
              </select>
              {typeError && <p className="text-xs text-rose-500 mt-1">{typeError}</p>}
            </div>
            {formData.type === 'external' && (
              <div><label className="text-xs font-bold text-slate-400 uppercase">关联行业</label>
                <select value={formData.industry || ''} onChange={e => setFormData({...formData, industry: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold mt-1">
                  <option value="">请选择行业</option>
                  {ACTIVITY_INDUSTRIES.map(ind => <option key={ind} value={ind}>{ind}</option>)}
                </select>
              </div>
            )}
            <div><label className="text-xs font-bold text-slate-400 uppercase">状态</label><select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold mt-1">{Object.values(ActivityStatus).map(s => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase">预算(万)</label><input type="number" value={formData.budget ? formData.budget / 10000 : 0} onChange={e => setFormData({...formData, budget: Number(e.target.value) * 10000})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase">简介</label><textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 mt-1 resize-none" /></div>
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"><Check size={18} /> 确认保存</button>
        </form>
      </div>
    </div>
  );
};

const ReviewEditModal: React.FC<{ activity: Activity; onClose: () => void; onSave: (reviewData: ReviewData) => void }> = ({ activity, onClose, onSave }) => {
  const [formData, setFormData] = useState<ReviewData>(activity.reviewData || { participantCount: 0, conversionRate: 0, satisfactionScore: 0, keyAchievements: '', problems: '', lessonsLearned: '', nextSuggestions: '', reviewDate: new Date().toISOString().split('T')[0], reviewer: '市场部负责人' });
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-xl font-black text-slate-800">编辑活动复盘</h3>
          <p className="text-xs text-slate-500">{activity.name}</p>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div><label className="text-xs font-bold text-slate-400">参与人数</label><input type="number" value={formData.participantCount} onChange={e => setFormData({...formData, participantCount: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div><label className="text-xs font-bold text-slate-400">转化率%</label><input type="number" step="0.1" value={formData.conversionRate} onChange={e => setFormData({...formData, conversionRate: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div><label className="text-xs font-bold text-slate-400">满意度</label><input type="number" step="0.1" min="1" max="5" value={formData.satisfactionScore} onChange={e => setFormData({...formData, satisfactionScore: Number(e.target.value)})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div><label className="text-xs font-bold text-slate-400">复盘日期</label><input type="date" value={formData.reviewDate} onChange={e => setFormData({...formData, reviewDate: e.target.value})} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
          </div>
          <div><label className="text-xs font-bold text-slate-400">主要成果</label><textarea value={formData.keyAchievements} onChange={e => setFormData({...formData, keyAchievements: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 mt-1 resize-none" /></div>
          <div><label className="text-xs font-bold text-slate-400">遇到的问题</label><textarea value={formData.problems} onChange={e => setFormData({...formData, problems: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 mt-1 resize-none" /></div>
          <div><label className="text-xs font-bold text-slate-400">经验教训</label><textarea value={formData.lessonsLearned} onChange={e => setFormData({...formData, lessonsLearned: e.target.value})} rows={2} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 mt-1 resize-none" /></div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"><Save size={18} /> 保存复盘</button>
        </form>
      </div>
    </div>
  );
};

// 添加任务模态框
const AddTaskModal: React.FC<{ activityId: string; onClose: () => void; onSave: (task: Task) => void }> = ({ activityId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    assignee: '',
    dueDate: new Date().toISOString().split('T')[0],
    priority: TaskPriority.P1,
    status: TaskStatus.TODO,
    notes: ''
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-blue-50">
          <h3 className="text-xl font-black text-slate-800">添加任务</h3>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const task: Task = {
            id: `t-${Date.now()}`,
            ...formData,
            activityId,
            createdAt: new Date().toISOString().split('T')[0]
          };
          onSave(task);
        }} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-400">任务名称</label>
            <input
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">负责人</label>
            <input
              required
              value={formData.assignee}
              onChange={(e) => setFormData({ ...formData, assignee: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400">截止日期</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">优先级</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1"
              >
                <option value={TaskPriority.P0}>P0 - 最高</option>
                <option value={TaskPriority.P1}>P1 - 中等</option>
                <option value={TaskPriority.P2}>P2 - 低</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-400">备注</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 mt-1 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">取消</button>
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"><Check size={16} /> 添加</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 任务导入模态框
const TaskImportModal: React.FC<{
  activityId: string;
  activityName: string;
  onClose: () => void;
  onImport: (tasks: Task[]) => void;
}> = ({ activityId, activityName, onClose, onImport }) => {
  const [importMode, setImportMode] = useState<'paste' | 'file'>('paste');
  const [pasteData, setPasteData] = useState('');
  const [fileName, setFileName] = useState('');
  const [parsedTasks, setParsedTasks] = useState<Task[]>([]);
  const [error, setError] = useState('');

  const parsePastedData = (text: string): Task[] => {
    const lines = text.trim().split('\n').filter(line => line.trim());
    const tasks: Task[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

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
          let priority: TaskPriority = TaskPriority.P1;
          if (priorityStr === 'P0') priority = TaskPriority.P0;
          else if (priorityStr === 'P1') priority = TaskPriority.P1;
          else if (priorityStr === 'P2') priority = TaskPriority.P2;
          else if (parts.length >= 5) {
            const maybePriority = parts[4]?.toUpperCase().trim();
            if (maybePriority === 'P0' || maybePriority === 'P1' || maybePriority === 'P2') {
              priority = maybePriority as TaskPriority;
            }
          }

          tasks.push({
            id: `t-import-${Date.now()}-${i}`,
            name,
            assignee,
            dueDate: dueDate || new Date().toISOString().split('T')[0],
            priority,
            status: TaskStatus.TODO,
            activityId,
            createdAt: new Date().toISOString().split('T')[0]
          });
        }
      }
    }
    return tasks;
  };

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
        setError('无法解析文件，请确保格式正确（任务名、负责人、截止日期、优先级）');
      }
    };
    reader.readAsText(file);
  };

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
      setError('无法解析数据，请确保格式正确：每行一个任务，格式为：任务名[Tab]负责人[Tab]截止日期[Tab]优先级');
    }
  };

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-xl font-black text-slate-800">导入任务</h3>
              <p className="text-xs text-slate-500">{activityName}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
          </div>
        </div>

        <div className="p-6 space-y-4">
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
                <label className="text-xs font-bold text-slate-400">粘贴Excel/Sheets数据</label>
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
                <input type="file" accept=".csv,.txt,.xlsx" onChange={handleFileChange} className="hidden" />
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 transition-colors">
                  <Upload size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm font-bold text-slate-500">点击选择文件</p>
                  <p className="text-xs text-slate-400 mt-1">支持 CSV、TXT、XLSX 格式</p>
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

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">取消</button>
          <button
            onClick={() => { if (parsedTasks.length > 0) { onImport(parsedTasks); onClose(); } }}
            disabled={parsedTasks.length === 0}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 ${parsedTasks.length > 0 ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
          >
            <Download size={16} /> 确认导入 ({parsedTasks.length})
          </button>
        </div>
      </div>
    </div>
  );
};

// 添加评价模态框
const AddEvaluationModal: React.FC<{ onClose: () => void; onSave: (evaluation: ReviewEvaluation) => void }> = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    evaluatorName: '',
    evaluatorRole: '',
    executionScore: 4,
    collaborationScore: 4,
    contentScore: 4,
    positives: '',
    problems: '',
    suggestions: ''
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-purple-50 to-indigo-50">
          <h3 className="text-xl font-black text-slate-800">添加评价</h3>
          <p className="text-xs text-slate-500">填写您的活动评价</p>
        </div>
        <form onSubmit={(e) => {
          e.preventDefault();
          const evaluation: ReviewEvaluation = {
            id: `e-${Date.now()}`,
            evaluatorId: `u-${Date.now()}`,
            ...formData,
            createdAt: new Date().toLocaleString('zh-CN')
          };
          onSave(evaluation);
        }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-400">您的姓名</label>
              <input
                required
                value={formData.evaluatorName}
                onChange={(e) => setFormData({ ...formData, evaluatorName: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-400">角色/部门</label>
              <input
                required
                value={formData.evaluatorRole}
                onChange={(e) => setFormData({ ...formData, evaluatorRole: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1"
              />
            </div>
          </div>

          {/* 评分 */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-black text-slate-400 mb-3">评分（1-5分）</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-2">执行效果</p>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFormData({ ...formData, executionScore: score })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        formData.executionScore >= score ? 'bg-amber-400 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Star size={14} fill={formData.executionScore >= score ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-2">协作体验</p>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFormData({ ...formData, collaborationScore: score })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        formData.collaborationScore >= score ? 'bg-emerald-400 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Star size={14} fill={formData.collaborationScore >= score ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-slate-400 mb-2">内容质量</p>
                <div className="flex items-center justify-center gap-1">
                  {[1, 2, 3, 4, 5].map(score => (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setFormData({ ...formData, contentScore: score })}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        formData.contentScore >= score ? 'bg-indigo-400 text-white' : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      <Star size={14} fill={formData.contentScore >= score ? 'currentColor' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 文本评价 */}
          <div>
            <label className="text-xs font-bold text-emerald-500">优点/亮点</label>
            <textarea
              value={formData.positives}
              onChange={(e) => setFormData({ ...formData, positives: e.target.value })}
              rows={2}
              placeholder="活动中做得好的地方..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 mt-1 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-rose-500">问题/不足</label>
            <textarea
              value={formData.problems}
              onChange={(e) => setFormData({ ...formData, problems: e.target.value })}
              rows={2}
              placeholder="活动中遇到的问题..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 mt-1 resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-indigo-500">改进建议</label>
            <textarea
              value={formData.suggestions}
              onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
              rows={2}
              placeholder="下次可以改进的地方..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 mt-1 resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">取消</button>
            <button type="submit" className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2"><Check size={16} /> 提交评价</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ActivityListPage;
