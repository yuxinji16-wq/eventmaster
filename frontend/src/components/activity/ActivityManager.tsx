import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useActivitiesData, useMaterialsData, useSuppliersData, useOpportunitiesData } from '../../utils/hooks';
import { Activity, ActivityStatus, ReviewData, Task, TaskPriority, TaskStatus } from '../../types';
import { ACTIVITY_INDUSTRIES } from '../../constants';
import {
  Plus, Search, Calendar, X, Edit2, Trash2, ChevronDown, ArrowLeft,
  Sparkles, TrendingUp, Package, Users, MessageSquare, Star, Receipt, BarChart3, Save, ClipboardCheck, Loader2,
  LayoutGrid, CalendarDays, ChevronLeft, Link, Download, Upload, Newspaper, Share2, Eye, Heart, File, Check, Video, PenTool,
  AlertTriangle, CheckCircle, Clock, Target, Wallet, Zap, AlertCircle, FileText, Folder, MoreVertical, Settings, Play, Pause
} from 'lucide-react';
import { getMarketingInsight } from '../../services/geminiService';
import { useToast } from '../../shared/Toast';

const MONTH_NAMES = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

// 活动阶段定义
const ACTIVITY_STAGES = [
  { id: 'planning', name: '筹备中', color: 'amber' },
  { id: 'executing', name: '执行中', color: 'blue' },
  { id: 'closing', name: '收尾中', color: 'purple' },
  { id: 'completed', name: '已完成', color: 'emerald' },
];

const ActivityManager: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { activities, loading, addActivity, updateActivity, deleteActivity, fetchActivities } = useActivitiesData();
  const { materials } = useMaterialsData();
  const { suppliers } = useSuppliersData();
  const { opportunities } = useOpportunitiesData();
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [yearFilter, setYearFilter] = useState('所有年份');
  const [categoryFilter, setCategoryFilter] = useState('所有分类');
  const [statusFilter, setStatusFilter] = useState('所有状态');
  const [industryFilter, setIndustryFilter] = useState('所有行业');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'calendar'>('card');
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [manageMode, setManageMode] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState<Set<string>>(new Set());

  const filteredActivities = useMemo(() => {
    return activities.filter(activity => {
      const matchesSearch = activity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (activity.description && activity.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesYear = yearFilter === '所有年份' || activity.year === yearFilter;
      const matchesCategory = categoryFilter === '所有分类' || activity.category === categoryFilter;
      const matchesStatus = statusFilter === '所有状态' || activity.status === statusFilter;
      const matchesIndustry = industryFilter === '所有行业' || activity.industry === industryFilter;
      return matchesSearch && matchesYear && matchesCategory && matchesStatus && matchesIndustry;
    });
  }, [activities, searchQuery, yearFilter, categoryFilter, statusFilter, industryFilter]);

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
          <FilterDropdown value={categoryFilter} onChange={setCategoryFilter} options={[{label: '所有分类', value: '所有分类'}, {label: '自办活动', value: '自办活动'}, {label: '外部市场活动', value: '外部市场活动'}]} />
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
            <div className={`bg-white p-5 rounded-xl shadow-sm border transition-all group relative overflow-hidden ${manageMode ? 'cursor-pointer' : 'hover:shadow-xl hover:border-indigo-100'} ${selectedActivities.has(activity.id) ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-slate-100'}`}>
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
                  <span className="px-2 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black">{activity.category}</span>
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
                <div><p className="text-[10px] font-black text-slate-400 uppercase flex items-center gap-1"><Wallet size={10} /> 预算</p><p className="font-black text-slate-800 text-sm">¥{(activity.budget/10000).toFixed(1)}w</p></div>
                <div className="text-right"><p className="text-[10px] font-black text-slate-400 uppercase flex items-center justify-end gap-1"><Target size={10} /> 潜客</p><p className="font-black text-indigo-600 text-sm">{activity.leads}</p></div>
              </div>
              {manageMode && (
                <div className="absolute bottom-3 right-3 flex gap-2 z-20">
                  <button onClick={(e) => { e.stopPropagation(); setEditingActivity(activity); setIsModalOpen(true); }} className="px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700"><Edit2 size={12} /></button>
                  <button onClick={(e) => { e.stopPropagation(); if (window.confirm(`确定要删除活动"${activity.name}"吗？`)) { deleteActivity(activity.id); } }} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-lg hover:bg-rose-600"><Trash2 size={12} /></button>
                </div>
              )}
              {!manageMode && (
                <div onClick={() => navigate(`/activities/${activity.id}`)} className="absolute inset-0 cursor-pointer" />
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
    </div>
  );
};

// ==================== 活动详情页（优化后） ====================
const ActivityDetailView: React.FC<{
  activity: Activity;
  onBack: () => void;
  onUpdate: (updated: Activity) => void;
  onDelete: () => void;
}> = ({ activity, onBack, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('progress');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [newComment, setNewComment] = useState({ author: '', role: '', content: '' });
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);

  const associatedMaterials = materials.slice(0, 3);
  const associatedSuppliers = suppliers.filter(s => s.id === '1');
  const associatedOpportunities = opportunities.filter(o => o.activityId === activity.id);

  // 计算费用汇总
  const totalExpenses = activity.expenses?.reduce((sum, e) => sum + e.amount, 0) || 0;
  const budgetHealth = totalExpenses > activity.budget ? 'over' : totalExpenses > activity.budget * 0.9 ? 'warning' : 'healthy';

  // 判断活动阶段
  const getCurrentStage = () => {
    if (activity.status === ActivityStatus.COMPLETED) return 'completed';
    if (activity.status === ActivityStatus.ONGOING) return 'executing';
    return 'planning';
  };
  const currentStage = getCurrentStage();

  // 风险判断
  const risks = [];
  if (budgetHealth === 'over') risks.push({ type: 'error', text: '预算超支' });
  if (budgetHealth === 'warning') risks.push({ type: 'warning', text: '预算即将耗尽' });
  if (activity.status !== ActivityStatus.COMPLETED && activity.status !== ActivityStatus.CANCELLED) {
    const eventDate = new Date(activity.date);
    const today = new Date();
    const daysLeft = Math.ceil((eventDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 7 && daysLeft > 0) risks.push({ type: 'warning', text: `距活动仅${daysLeft}天` });
  }

  const handleGenerateAIInsight = async () => {
    setIsAiLoading(true);
    const insight = await getMarketingInsight(`分析活动: ${activity.name}, 预算: ${activity.budget}, 支出: ${activity.actualSpend}, 获客: ${activity.leads}`);
    setAiAnalysis(insight);
    setIsAiLoading(false);
  };

  const handleAddComment = () => {
    if (!newComment.author || !newComment.content) return;
    const comment: ReviewComment = {
      id: `rc-${Date.now()}`,
      author: newComment.author,
      authorRole: newComment.role,
      content: newComment.content,
      createdAt: new Date().toLocaleString('zh-CN'),
    };
    const updatedReviewData = { ...activity.reviewData, comments: [...(activity.reviewData?.comments || []), comment] };
    onUpdate({ ...activity, reviewData: updatedReviewData });
    setNewComment({ author: '', role: '', content: '' });
    setActiveModal(null);
  };

  return (
    <div className="max-w-[1180px] mx-auto origin-top scale-[0.96] space-y-4 animate-in fade-in duration-500 pb-20">
      {/* ========== 顶部信息区（增强决策信息） ========== */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

        <div className="relative z-10">
          {/* 导航行 */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white font-bold text-sm transition-all">
              <ArrowLeft size={18} /> 返回列表
            </button>
            <div className="flex gap-2">
              <button onClick={() => setActiveModal('profile')} className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-bold transition-all">
                <Edit2 size={14} /> 编辑
              </button>
              <button onClick={onDelete} className="flex items-center gap-1 px-3 py-1.5 bg-rose-500/30 hover:bg-rose-500/50 rounded-xl text-sm font-bold transition-all">
                <Trash2 size={14} /> 删除
              </button>
            </div>
          </div>

          {/* 状态标签行 */}
          <div className="flex items-center gap-3 mb-3">
            {/* 活动状态 */}
            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase ${
              activity.status === ActivityStatus.COMPLETED ? 'bg-emerald-400/30 text-emerald-100' :
              activity.status === ActivityStatus.ONGOING ? 'bg-blue-400/30 text-blue-100' :
              activity.status === ActivityStatus.PLANNED ? 'bg-amber-400/30 text-amber-100' :
              'bg-slate-400/30 text-slate-100'
            }`}>
              {activity.status}
            </span>
            {/* 当前阶段 */}
            <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold">
              {ACTIVITY_STAGES.find(s => s.id === currentStage)?.name || '筹备中'}
            </span>
            {/* 活动分类 */}
            <span className="px-3 py-1 bg-white/10 rounded-xl text-xs">
              {activity.category}
            </span>
          </div>

          {/* 活动名称 */}
          <h1 className="text-2xl font-black mb-2">{activity.name}</h1>
          <p className="text-white/70 text-sm mb-4">{activity.description}</p>

          {/* 决策信息行 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 时间地点 */}
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60 mb-1">活动时间</p>
              <p className="font-black">{activity.date}</p>
              <p className="text-xs text-white/60 mt-1 truncate">{activity.location || '地点待定'}</p>
            </div>
            {/* 负责人 */}
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60 mb-1">负责人</p>
              <p className="font-black">{activity.reviewData?.reviewer || '市场部负责人'}</p>
            </div>
            {/* 预算健康度 */}
            <div className={`rounded-xl p-3 ${budgetHealth === 'over' ? 'bg-rose-500/30' : budgetHealth === 'warning' ? 'bg-amber-500/30' : 'bg-white/10'}`}>
              <p className="text-xs text-white/60 mb-1">预算健康度</p>
              <p className="font-black">{((totalExpenses/activity.budget)*100).toFixed(0)}%</p>
              <p className="text-xs mt-1">
                {budgetHealth === 'over' ? '⚠ 超支' : budgetHealth === 'warning' ? '⚠ 即将耗尽' : '✓ 健康'}
              </p>
            </div>
            {/* 风险提示 */}
            <div className={`rounded-xl p-3 ${risks.length > 0 ? 'bg-amber-500/30' : 'bg-white/10'}`}>
              <p className="text-xs text-white/60 mb-1">风险状态</p>
              {risks.length > 0 ? (
                <div className="space-y-1">
                  {risks.slice(0, 2).map((r, i) => (
                    <p key={i} className="text-xs font-bold">⚠ {r.text}</p>
                  ))}
                </div>
              ) : (
                <p className="font-black text-emerald-300">✓ 无风险</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========== 主内容区 + 右侧边栏 ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* 左侧主内容区 */}
        <div className="lg:col-span-3 space-y-4">

          {/* ========== 执行进度（核心模块） ========== */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <Zap size={20} className="text-indigo-600" /> 执行进度
                <span className="ml-auto text-sm font-bold text-indigo-600">
                  {currentStage === 'completed' ? '100%' : '75%'}
                </span>
              </h3>
            </div>

            <div className="p-6">
              {/* 阶段进度条 */}
              <div className="flex items-center justify-between mb-8">
                {ACTIVITY_STAGES.map((stage, index) => (
                  <div key={stage.id} className="flex-1 flex flex-col items-center relative">
                    {index < ACTIVITY_STAGES.length - 1 && (
                      <div className={`absolute top-4 left-1/2 w-full h-1 ${
                        ACTIVITY_STAGES.findIndex(s => s.id === currentStage) > index ? 'bg-indigo-500' : 'bg-slate-200'
                      }`} />
                    )}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black z-10 ${
                      ACTIVITY_STAGES.findIndex(s => s.id === currentStage) >= index
                        ? 'bg-indigo-500 text-white'
                        : 'bg-slate-200 text-slate-400'
                    }`}>
                      {index + 1}
                    </div>
                    <p className={`text-xs font-bold mt-2 ${
                      stage.id === currentStage ? 'text-indigo-600' : 'text-slate-400'
                    }`}>{stage.name}</p>
                  </div>
                ))}
              </div>

              {/* 当前任务 / 下一步动作 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs font-black text-slate-400 uppercase mb-2">当前任务</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-sm font-bold text-slate-700">物料采购确认</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="text-sm font-bold text-slate-700">供应商合同签署</span>
                    </div>
                  </div>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4 border border-indigo-100">
                  <p className="text-xs font-black text-indigo-400 uppercase mb-2">下一步动作</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-black text-slate-800">确认展位位置</p>
                      <p className="text-xs text-slate-400">截止: 03-10</p>
                    </div>
                    <button className="px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all">
                      立即处理
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========== 结果摘要（简化版） ========== */}
          <section className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">
              <Target size={20} className="text-emerald-600" /> 结果摘要
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-slate-400">关键成果</p>
                  <p className="text-sm text-slate-700">{activity.reviewData?.keyAchievements || '暂无'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-black text-slate-400">主要问题</p>
                  <p className="text-sm text-slate-700">{activity.reviewData?.problems || '暂无'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles size={16} className="text-indigo-500 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-black text-slate-400">AI总结</p>
                    <button onClick={handleGenerateAIInsight} disabled={isAiLoading} className="text-xs text-indigo-600 font-bold hover:underline">
                      {isAiLoading ? '生成中...' : '重新生成'}
                    </button>
                  </div>
                  <p className="text-sm text-slate-700">{aiAnalysis || activity.reviewData?.aiInsight || '点击生成AI分析'}</p>
                </div>
              </div>
            </div>
          </section>

          {/* ========== Tab内容区 ========== */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Tab导航 */}
            <div className="flex border-b border-slate-100 overflow-x-auto">
              {[
                { id: 'progress', label: '执行进度', icon: Zap },
                { id: 'budget', label: '预算', icon: Wallet },
                { id: 'supplier', label: '供应商', icon: Users },
                { id: 'material', label: '物料', icon: Package },
                { id: 'opportunity', label: '商机', icon: TrendingUp },
                { id: 'review', label: '复盘', icon: ClipboardCheck },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-all ${
                    activeTab === tab.id
                      ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50'
                      : 'text-slate-400 border-transparent hover:text-slate-600'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab内容 */}
            <div className="p-6">
              {/* 执行进度Tab */}
              {activeTab === 'progress' && (
                <div className="space-y-4">
                  {/* 任务统计 */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-slate-800">{activity.tasks?.length || 0}</p>
                      <p className="text-xs text-slate-400 font-bold">任务总数</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-emerald-600">{activity.tasks?.filter(t => t.status === TaskStatus.DONE).length || 0}</p>
                      <p className="text-xs text-emerald-400 font-bold">已完成</p>
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-blue-600">{activity.tasks?.filter(t => t.status === TaskStatus.IN_PROGRESS).length || 0}</p>
                      <p className="text-xs text-blue-400 font-bold">进行中</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-amber-600">{activity.tasks?.filter(t => t.status === TaskStatus.BLOCKED).length || 0}</p>
                      <p className="text-xs text-amber-400 font-bold">阻塞</p>
                    </div>
                  </div>

                  {/* 当前任务 & 下一步动作 */}
                  {(() => {
                    const sortedTasks = activity.tasks
                      ?.filter(t => t.status !== TaskStatus.DONE)
                      ?.sort((a, b) => {
                        if (a.priority !== b.priority) return a.priority === TaskPriority.P0 ? -1 : 1;
                        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                      }) || [];

                    const currentTask = sortedTasks[0];
                    const nextTask = sortedTasks[1];

                    if (!currentTask) return null;

                    return (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Zap size={18} className="text-blue-600" />
                            <h4 className="font-black text-slate-800">当前任务</h4>
                          </div>
                          <div className="space-y-2">
                            <p className="font-black text-slate-800">{currentTask.name}</p>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                currentTask.priority === TaskPriority.P0 ? 'bg-rose-200 text-rose-700' :
                                currentTask.priority === TaskPriority.P1 ? 'bg-amber-200 text-amber-700' :
                                'bg-slate-200 text-slate-600'
                              }`}>{currentTask.priority}</span>
                              <span className="text-xs text-slate-500">{currentTask.assignee}</span>
                              <span className="text-xs text-slate-400">截止: {currentTask.dueDate}</span>
                            </div>
                            <button
                              onClick={() => {
                                const updatedTasks = activity.tasks?.map(t =>
                                  t.id === currentTask.id ? { ...t, status: TaskStatus.DONE, completedAt: new Date().toISOString().split('T')[0] } : t
                                );
                                onUpdate({ ...activity, tasks: updatedTasks });
                              }}
                              className="mt-2 flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all"
                            >
                              <Check size={14} /> 标记完成
                            </button>
                          </div>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100">
                          <div className="flex items-center gap-2 mb-3">
                            <Clock size={18} className="text-indigo-600" />
                            <h4 className="font-black text-slate-800">下一步动作</h4>
                          </div>
                          {nextTask ? (
                            <div className="space-y-2">
                              <p className="font-black text-slate-800">{nextTask.name}</p>
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                                  nextTask.priority === TaskPriority.P0 ? 'bg-rose-200 text-rose-700' :
                                  nextTask.priority === TaskPriority.P1 ? 'bg-amber-200 text-amber-700' :
                                  'bg-slate-200 text-slate-600'
                                }`}>{nextTask.priority}</span>
                                <span className="text-xs text-slate-500">{nextTask.assignee}</span>
                                <span className="text-xs text-slate-400">截止: {nextTask.dueDate}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">暂无待办任务</p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* 风险提示 */}
                  {(() => {
                    const overdueTasks = activity.tasks?.filter(t => {
                      const dueDate = new Date(t.dueDate);
                      const today = new Date();
                      return dueDate < today && t.status !== TaskStatus.DONE;
                    }) || [];
                    const blockedP0Tasks = activity.tasks?.filter(t => t.priority === TaskPriority.P0 && t.status === TaskStatus.BLOCKED) || [];

                    if (overdueTasks.length > 0 || blockedP0Tasks.length > 0) {
                      return (
                        <div className="bg-rose-50 rounded-xl p-4 border border-rose-100">
                          <h4 className="font-black text-rose-700 mb-3 flex items-center gap-2">
                            <AlertTriangle size={16} /> 风险任务
                          </h4>
                          <div className="space-y-2">
                            {overdueTasks.map(t => (
                              <div key={t.id} className="flex items-center justify-between text-sm">
                                <span className="text-rose-600 font-bold">{t.name} (超期)</span>
                                <span className="text-xs text-rose-400">{t.assignee}</span>
                              </div>
                            ))}
                            {blockedP0Tasks.map(t => (
                              <div key={t.id} className="flex items-center justify-between text-sm">
                                <span className="text-rose-600 font-bold">{t.name} (P0阻塞)</span>
                                <span className="text-xs text-rose-400">{t.assignee}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* 任务列表 */}
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-800">任务列表</h4>
                    <button
                      onClick={() => setActiveModal('addTask')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      <Plus size={14} /> 添加任务
                    </button>
                  </div>
                  <div className="space-y-3">
                    {activity.tasks?.sort((a, b) => {
                      // 排序：P0优先，然后按截止日期
                      if (a.priority !== b.priority) return a.priority === TaskPriority.P0 ? -1 : 1;
                      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
                    }).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => {
                              const newStatus = task.status === TaskStatus.DONE ? TaskStatus.TODO : TaskStatus.DONE;
                              const updatedTasks = activity.tasks?.map(t =>
                                t.id === task.id ? { ...t, status: newStatus, completedAt: newStatus === TaskStatus.DONE ? new Date().toISOString().split('T')[0] : undefined } : t
                              );
                              onUpdate({ ...activity, tasks: updatedTasks });
                            }}
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black transition-all ${
                              task.status === TaskStatus.DONE ? 'bg-emerald-500 text-white' :
                              task.status === TaskStatus.IN_PROGRESS ? 'bg-blue-500 text-white' :
                              task.status === TaskStatus.BLOCKED ? 'bg-rose-500 text-white' :
                              'bg-slate-200 text-slate-400 hover:bg-indigo-100'
                            }`}
                          >
                            {task.status === TaskStatus.DONE ? '✓' : task.status === TaskStatus.BLOCKED ? '!' : '○'}
                          </button>
                          <div>
                            <span className={`text-sm font-bold ${task.status === TaskStatus.DONE ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                              {task.name}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-1.5 py-0.5 rounded text-xs font-black ${
                                task.priority === TaskPriority.P0 ? 'bg-rose-100 text-rose-600' :
                                task.priority === TaskPriority.P1 ? 'bg-amber-100 text-amber-600' :
                                'bg-slate-100 text-slate-500'
                              }`}>{task.priority}</span>
                              <span className="text-xs text-slate-400">{task.assignee}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`text-xs font-bold ${
                            new Date(task.dueDate) < new Date() && task.status !== TaskStatus.DONE ? 'text-rose-500' : 'text-slate-400'
                          }`}>{task.dueDate}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => {
                                const statusOptions = [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE, TaskStatus.BLOCKED];
                                const currentIndex = statusOptions.indexOf(task.status);
                                const nextStatus = statusOptions[(currentIndex + 1) % statusOptions.length];
                                const updatedTasks = activity.tasks?.map(t =>
                                  t.id === task.id ? { ...t, status: nextStatus } : t
                                );
                                onUpdate({ ...activity, tasks: updatedTasks });
                              }}
                              className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                              title="切换状态"
                            >
                              <Settings size={14} />
                            </button>
                            <button
                              onClick={() => {
                                const updatedTasks = activity.tasks?.filter(t => t.id !== task.id);
                                onUpdate({ ...activity, tasks: updatedTasks });
                              }}
                              className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                              title="删除任务"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {(!activity.tasks || activity.tasks.length === 0) && (
                      <p className="text-center text-slate-400 text-sm py-8">暂无任务，点击"添加任务"创建</p>
                    )}
                  </div>
                </div>
              )}

              {/* 预算Tab */}
              {activeTab === 'budget' && (
                <div className="space-y-4">
                  {/* 预算概览卡片 */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-slate-400 font-bold">总预算</p>
                      <p className="text-xl font-black text-slate-800">¥{(activity.budget/10000).toFixed(1)}w</p>
                    </div>
                    <div className="bg-rose-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-rose-400 font-bold">实际支出</p>
                      <p className="text-xl font-black text-rose-600">¥{(totalExpenses/10000).toFixed(1)}w</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-emerald-400 font-bold">预算余额</p>
                      <p className="text-xl font-black text-emerald-600">¥{((activity.budget - totalExpenses)/10000).toFixed(1)}w</p>
                    </div>
                    <div className="bg-indigo-50 rounded-xl p-4 text-center">
                      <p className="text-xs text-indigo-400 font-bold">执行率</p>
                      <p className="text-xl font-black text-indigo-600">{((totalExpenses/activity.budget)*100).toFixed(0)}%</p>
                    </div>
                  </div>

                  {/* 费用明细（折叠） */}
                  <div className="border border-slate-100 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setShowExpenseDetail(!showExpenseDetail)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-all"
                    >
                      <span className="font-bold text-slate-700">费用明细列表</span>
                      <ChevronDown size={16} className={`text-slate-400 transition-transform ${showExpenseDetail ? 'rotate-180' : ''}`} />
                    </button>
                    {showExpenseDetail && activity.expenses && (
                      <div className="p-4 space-y-2">
                        {activity.expenses.map((expense) => (
                          <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-1 bg-white rounded-lg text-xs font-bold text-slate-600">{expense.category}</span>
                              <span className="text-sm font-bold text-slate-800">{expense.name}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-black text-slate-800">¥{expense.amount.toLocaleString()}</span>
                              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${expense.status === '已报销' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{expense.status}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 供应商Tab */}
              {activeTab === 'supplier' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-800">关联供应商</h4>
                    <button
                      onClick={() => setActiveModal('addSupplier')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      <Plus size={14} /> 关联供应商
                    </button>
                  </div>
                  {associatedSuppliers.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-black">
                          {s.name[0]}
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{s.name}</p>
                          <p className="text-xs text-slate-400">{s.serviceType}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-amber-500 text-sm font-bold">
                          <Star size={14} fill="currentColor" /> {s.rating}
                        </div>
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">已确认</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all" title="查看详情">
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => setActiveModal('editSupplier')}
                            className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all"
                            title="编辑"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-rose-600 transition-all" title="取消关联">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {associatedSuppliers.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-8">暂无关联供应商</p>
                  )}
                </div>
              )}

              {/* 物料Tab */}
              {activeTab === 'material' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-800">物料清单</h4>
                    <button
                      onClick={() => setActiveModal('addMaterial')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      <Plus size={14} /> 申请物料
                    </button>
                  </div>
                  {associatedMaterials.map((m) => (
                    <div key={m.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                          <Package size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800">{m.name}</p>
                          <p className="text-xs text-slate-400">数量: 50 {m.unit}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold">已领用</span>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all" title="查看库存">
                            <Eye size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all" title="编辑数量">
                            <Edit2 size={14} />
                          </button>
                          <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-amber-600 transition-all" title="归还">
                            <ArrowLeft size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {associatedMaterials.length === 0 && (
                    <p className="text-center text-slate-400 text-sm py-8">暂无物料申请</p>
                  )}
                </div>
              )}

              {/* 商机Tab */}
              {activeTab === 'opportunity' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-slate-800">关联商机</h4>
                    <button
                      onClick={() => setActiveModal('addOpportunity')}
                      className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                    >
                      <Plus size={14} /> 添加商机
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-indigo-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-indigo-600">{associatedOpportunities.length}</p>
                      <p className="text-xs text-indigo-400 font-bold">商机总数</p>
                    </div>
                    <div className="bg-emerald-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-emerald-600">{associatedOpportunities.filter(o => o.status === '高意向').length}</p>
                      <p className="text-xs text-emerald-400 font-bold">高意向</p>
                    </div>
                    <div className="bg-amber-50 rounded-xl p-4 text-center">
                      <p className="text-2xl font-black text-amber-600">¥{(associatedOpportunities.reduce((sum, o) => sum + o.estimatedValue, 0)/10000).toFixed(0)}w</p>
                      <p className="text-xs text-amber-400 font-bold">预估金额</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {associatedOpportunities.slice(0, 3).map((o) => (
                      <div key={o.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all group">
                        <div className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${o.status === '高意向' ? 'bg-rose-100 text-rose-600' : 'bg-slate-200 text-slate-600'}`}>
                            {o.status}
                          </span>
                          <span className="text-sm font-bold text-slate-800">{o.clientName}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-black text-indigo-600 text-sm">¥{(o.estimatedValue/10000).toFixed(0)}w</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all" title="查看详情">
                              <Eye size={14} />
                            </button>
                            <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-indigo-600 transition-all" title="编辑">
                              <Edit2 size={14} />
                            </button>
                            <button className="p-1.5 hover:bg-white rounded-lg text-slate-400 hover:text-emerald-600 transition-all" title="更新阶段">
                              <TrendingUp size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {associatedOpportunities.length === 0 && (
                      <p className="text-center text-slate-400 text-sm py-8">暂无关联商机</p>
                    )}
                  </div>
                </div>
              )}

              {/* 复盘Tab - 复盘中心 */}
              {activeTab === 'review' && (
                <div className="space-y-4">
                  {/* 复盘状态卡片 */}
                  <div className={`rounded-xl p-6 border ${
                    activity.reviewData?.status === ReviewStatus.COMPLETED ? 'bg-emerald-50 border-emerald-100' :
                    activity.reviewData?.status === ReviewStatus.PENDING_CONFIRM ? 'bg-purple-50 border-purple-100' :
                    activity.reviewData?.status === ReviewStatus.IN_PROGRESS ? 'bg-blue-50 border-blue-100' :
                    'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className={`px-3 py-1.5 rounded-xl text-sm font-black ${
                            activity.reviewData?.status === ReviewStatus.COMPLETED ? 'bg-emerald-200 text-emerald-700' :
                            activity.reviewData?.status === ReviewStatus.PENDING_CONFIRM ? 'bg-purple-200 text-purple-700' :
                            activity.reviewData?.status === ReviewStatus.IN_PROGRESS ? 'bg-blue-200 text-blue-700' :
                            'bg-slate-200 text-slate-600'
                          }`}>
                            {activity.reviewData?.status || ReviewStatus.NOT_STARTED}
                          </span>
                          {activity.reviewData?.status === ReviewStatus.COMPLETED && (
                            <span className="flex items-center gap-1 text-emerald-600 text-sm font-bold">
                              <CheckCircle size={16} /> 已确认完成
                            </span>
                          )}
                        </div>
                        <h4 className="font-black text-slate-800 text-xl">复盘中心</h4>
                      </div>

                      {/* 参与人数设置 */}
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-slate-200">
                          <Users size={16} className="text-slate-400" />
                          <span className="text-xs text-slate-500">预期参与</span>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={activity.reviewData?.expectedParticipants || 3}
                            onChange={(e) => {
                              const updatedReviewData = {
                                ...activity.reviewData,
                                expectedParticipants: Number(e.target.value)
                              };
                              onUpdate({ ...activity, reviewData: updatedReviewData });
                            }}
                            className="w-12 text-center font-black text-slate-700 bg-transparent outline-none"
                            disabled={activity.reviewData?.status === ReviewStatus.COMPLETED}
                          />
                          <span className="text-xs text-slate-500">人</span>
                        </div>
                      </div>
                    </div>

                    {/* 评价进度 */}
                    <div className="bg-white/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-bold text-slate-600">评价进度</span>
                        <span className="text-sm font-black text-indigo-600">
                          {activity.reviewData?.evaluations?.length || 0} / {activity.reviewData?.expectedParticipants || 3} 人
                        </span>
                      </div>
                      <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            activity.reviewData?.status === ReviewStatus.COMPLETED ? 'bg-emerald-500' :
                            activity.reviewData?.status === ReviewStatus.PENDING_CONFIRM ? 'bg-purple-500' :
                            'bg-indigo-500'
                          }`}
                          style={{ width: `${Math.min(((activity.reviewData?.evaluations?.length || 0) / (activity.reviewData?.expectedParticipants || 3)) * 100, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-slate-400">
                          {Math.round(((activity.reviewData?.evaluations?.length || 0) / (activity.reviewData?.expectedParticipants || 3)) * 100)}% 完成
                        </span>
                        {(activity.reviewData?.status === ReviewStatus.NOT_STARTED || activity.reviewData?.status === ReviewStatus.IN_PROGRESS) && (
                          <span className="text-xs text-slate-500">
                            还需 {(activity.reviewData?.expectedParticipants || 3) - (activity.reviewData?.evaluations?.length || 0)} 人评价
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 操作按钮区 */}
                    <div className="flex items-center gap-3">
                      {/* 添加评价按钮 - 始终显示（除非已完成） */}
                      {activity.reviewData?.status !== ReviewStatus.COMPLETED && (
                        <button
                          onClick={() => setActiveModal('addEvaluation')}
                          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                        >
                          <Plus size={18} /> 添加评价
                        </button>
                      )}

                      {/* 确认复盘按钮 - 待确认状态显示 */}
                      {activity.reviewData?.status === ReviewStatus.PENDING_CONFIRM && (
                        <button
                          onClick={() => {
                            if (window.confirm('确认要完成复盘吗？完成后将不可再修改评价。')) {
                              const updatedReviewData = {
                                ...activity.reviewData,
                                status: ReviewStatus.COMPLETED,
                                confirmedBy: activity.reviewData?.reviewer || '负责人',
                                confirmedAt: new Date().toISOString().split('T')[0]
                              };
                              onUpdate({ ...activity, reviewData: updatedReviewData, isReviewed: true });
                            }
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                        >
                          <Check size={18} /> 确认完成复盘
                        </button>
                      )}

                      {/* 已完成状态显示确认信息 */}
                      {activity.reviewData?.status === ReviewStatus.COMPLETED && (
                        <div className="flex items-center gap-2 text-emerald-600 text-sm">
                          <CheckCircle size={18} />
                          <span>由 <strong>{activity.reviewData?.confirmedBy}</strong> 于 {activity.reviewData?.confirmedAt} 确认完成</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 评分汇总 */}
                  {activity.reviewData?.evaluations && activity.reviewData.evaluations.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-slate-100">
                      <h5 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                        <BarChart3 size={18} className="text-indigo-500" /> 评分汇总
                      </h5>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto bg-indigo-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-2xl font-black text-indigo-600">
                              {(activity.reviewData.evaluations.reduce((sum, e) => sum + e.executionScore, 0) / activity.reviewData.evaluations.length).toFixed(1)}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700">执行效果</p>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} size={12} className={star <= Math.round(activity.reviewData!.evaluations!.reduce((sum, e) => sum + e.executionScore, 0) / activity.reviewData!.evaluations!.length) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                            ))}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-2xl font-black text-emerald-600">
                              {(activity.reviewData.evaluations.reduce((sum, e) => sum + e.collaborationScore, 0) / activity.reviewData.evaluations.length).toFixed(1)}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700">协作体验</p>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} size={12} className={star <= Math.round(activity.reviewData!.evaluations!.reduce((sum, e) => sum + e.collaborationScore, 0) / activity.reviewData!.evaluations!.length) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                            ))}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="w-20 h-20 mx-auto bg-amber-100 rounded-full flex items-center justify-center mb-2">
                            <span className="text-2xl font-black text-amber-600">
                              {(activity.reviewData.evaluations.reduce((sum, e) => sum + e.contentScore, 0) / activity.reviewData.evaluations.length).toFixed(1)}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-700">内容质量</p>
                          <div className="flex items-center justify-center gap-1 mt-1">
                            {[1,2,3,4,5].map(star => (
                              <Star key={star} size={12} className={star <= Math.round(activity.reviewData!.evaluations!.reduce((sum, e) => sum + e.contentScore, 0) / activity.reviewData!.evaluations!.length) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 结果摘要 - 待确认和已完成状态显示 */}
                  {(activity.reviewData?.status === ReviewStatus.PENDING_CONFIRM || activity.reviewData?.status === ReviewStatus.COMPLETED) && (
                    <div className="bg-white rounded-xl p-6 border border-slate-100">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-black text-slate-800 flex items-center gap-2">
                          <ClipboardCheck size={18} className="text-emerald-500" /> 结果摘要
                        </h5>
                        {activity.reviewData?.status === ReviewStatus.PENDING_CONFIRM && (
                          <button
                            onClick={() => {
                              const evaluations = activity.reviewData?.evaluations || [];
                              const allPositives = evaluations.map(e => e.positives).filter(Boolean).join('；');
                              const allProblems = evaluations.map(e => e.problems).filter(Boolean).join('；');
                              const allSuggestions = evaluations.map(e => e.suggestions).filter(Boolean).join('；');

                              const updatedReviewData = {
                                ...activity.reviewData,
                                keyAchievements: allPositives || '暂无',
                                problems: allProblems || '暂无',
                                nextSuggestions: allSuggestions || '暂无'
                              };
                              onUpdate({ ...activity, reviewData: updatedReviewData });
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all"
                          >
                            <Sparkles size={14} /> 重新生成
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                          <CheckCircle size={18} className="text-emerald-500 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-black text-emerald-600 mb-1">关键成果</p>
                            <p className="text-sm text-slate-700">{activity.reviewData?.keyAchievements || '点击"重新生成"汇总所有评价的优点'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                          <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-black text-amber-600 mb-1">主要问题</p>
                            <p className="text-sm text-slate-700">{activity.reviewData?.problems || '点击"重新生成"汇总所有评价的问题'}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 bg-indigo-50 rounded-xl">
                          <Sparkles size={18} className="text-indigo-500 mt-0.5 shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs font-black text-indigo-600 mb-1">改进建议</p>
                            <p className="text-sm text-slate-700">{activity.reviewData?.nextSuggestions || '点击"重新生成"汇总所有评价的建议'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 评价列表 */}
                  <div className="bg-white rounded-xl p-6 border border-slate-100">
                    <div className="flex items-center justify-between mb-4">
                      <h5 className="font-black text-slate-800 flex items-center gap-2">
                        <MessageSquare size={18} className="text-indigo-500" /> 评价详情
                      </h5>
                      {activity.reviewData?.status !== ReviewStatus.COMPLETED && (
                        <button
                          onClick={() => setActiveModal('addEvaluation')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all"
                        >
                          <Plus size={14} /> 添加评价
                        </button>
                      )}
                    </div>
                    <div className="space-y-4">
                      {activity.reviewData?.evaluations?.map((evaluation, index) => (
                        <div key={evaluation.id} className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-all">
                          {/* 评价头部 */}
                          <div className="flex items-center justify-between p-4 bg-slate-50">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-black">
                                {evaluation.evaluatorName[0]}
                              </div>
                              <div>
                                <p className="font-black text-slate-800">{evaluation.evaluatorName}</p>
                                <p className="text-xs text-slate-400">{evaluation.evaluatorRole}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-xs text-slate-400">#{index + 1}</span>
                              <span className="text-xs text-slate-400">{evaluation.createdAt}</span>
                              {activity.reviewData?.status !== ReviewStatus.COMPLETED && (
                                <button
                                  onClick={() => {
                                    if (window.confirm('确定要删除这条评价吗？')) {
                                      const updatedEvaluations = activity.reviewData?.evaluations?.filter(e => e.id !== evaluation.id) || [];
                                      const newStatus = updatedEvaluations.length === 0 ? ReviewStatus.NOT_STARTED :
                                        updatedEvaluations.length >= (activity.reviewData?.expectedParticipants || 3) ? ReviewStatus.PENDING_CONFIRM : ReviewStatus.IN_PROGRESS;
                                      onUpdate({
                                        ...activity,
                                        reviewData: { ...activity.reviewData, evaluations: updatedEvaluations, status: newStatus }
                                      });
                                    }
                                  }}
                                  className="p-1.5 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
                                  title="删除评价"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                          {/* 评分 */}
                          <div className="p-4 border-b border-slate-100">
                            <div className="grid grid-cols-3 gap-4">
                              <div className="text-center">
                                <p className="text-xs text-slate-400 mb-1">执行效果</p>
                                <div className="flex items-center justify-center gap-1">
                                  {[1,2,3,4,5].map(star => (
                                    <Star key={star} size={14} className={star <= evaluation.executionScore ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                  ))}
                                </div>
                                <p className="text-sm font-black text-indigo-600 mt-1">{evaluation.executionScore}分</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-slate-400 mb-1">协作体验</p>
                                <div className="flex items-center justify-center gap-1">
                                  {[1,2,3,4,5].map(star => (
                                    <Star key={star} size={14} className={star <= evaluation.collaborationScore ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                  ))}
                                </div>
                                <p className="text-sm font-black text-emerald-600 mt-1">{evaluation.collaborationScore}分</p>
                              </div>
                              <div className="text-center">
                                <p className="text-xs text-slate-400 mb-1">内容质量</p>
                                <div className="flex items-center justify-center gap-1">
                                  {[1,2,3,4,5].map(star => (
                                    <Star key={star} size={14} className={star <= evaluation.contentScore ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
                                  ))}
                                </div>
                                <p className="text-sm font-black text-amber-600 mt-1">{evaluation.contentScore}分</p>
                              </div>
                            </div>
                          </div>
                          {/* 评价内容 */}
                          <div className="p-4 space-y-3">
                            <div>
                              <p className="text-xs font-black text-emerald-500 mb-1">优点/亮点</p>
                              <p className="text-sm text-slate-600">{evaluation.positives || '未填写'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-black text-rose-500 mb-1">问题/不足</p>
                              <p className="text-sm text-slate-600">{evaluation.problems || '未填写'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-black text-indigo-500 mb-1">改进建议</p>
                              <p className="text-sm text-slate-600">{evaluation.suggestions || '未填写'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(!activity.reviewData?.evaluations || activity.reviewData.evaluations.length === 0) && (
                        <div className="text-center py-12">
                          <ClipboardCheck size={48} className="mx-auto text-slate-300 mb-4" />
                          <p className="text-slate-400 font-bold">暂无评价</p>
                          <p className="text-slate-400 text-sm mt-1">点击上方"添加评价"按钮开始填写</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========== 右侧边栏（状态面板） ========== */}
        <div className="space-y-4">
          {/* 风险提示 */}
          {risks.length > 0 && (
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <h4 className="font-black text-amber-700 mb-3 flex items-center gap-2">
                <AlertTriangle size={16} /> 风险提示
              </h4>
              <div className="space-y-2">
                {risks.map((r, i) => (
                  <p key={i} className="text-sm text-amber-600">• {r.text}</p>
                ))}
              </div>
            </div>
          )}

          {/* 供应商状态 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-slate-800 flex items-center gap-2"><Users size={16} className="text-indigo-500" /> 供应商</h4>
              <span className="text-xs text-slate-400">查看 →</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-emerald-50 rounded-xl p-2">
                <p className="text-lg font-black text-emerald-600">1</p>
                <p className="text-xs text-slate-400">已确认</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-2">
                <p className="text-lg font-black text-amber-600">1</p>
                <p className="text-xs text-slate-400">待确认</p>
              </div>
            </div>
          </div>

          {/* 物料状态 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-slate-800 flex items-center gap-2"><Package size={16} className="text-emerald-500" /> 物料</h4>
              <span className="text-xs text-slate-400">查看 →</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-emerald-50 rounded-xl p-2">
                <p className="text-lg font-black text-emerald-600">3</p>
                <p className="text-xs text-slate-400">已领用</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-2">
                <p className="text-lg font-black text-slate-600">1</p>
                <p className="text-xs text-slate-400">待领取</p>
              </div>
            </div>
          </div>

          {/* 商机状态 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-slate-800 flex items-center gap-2"><TrendingUp size={16} className="text-indigo-500" /> 商机</h4>
              <span className="text-xs text-slate-400">查看 →</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-rose-50 rounded-xl p-2">
                <p className="text-lg font-black text-rose-600">{associatedOpportunities.filter(o => o.status === '高意向').length}</p>
                <p className="text-xs text-slate-400">高意向</p>
              </div>
              <div className="bg-indigo-50 rounded-xl p-2">
                <p className="text-lg font-black text-indigo-600">¥{(associatedOpportunities.reduce((sum, o) => sum + o.estimatedValue, 0)/10000).toFixed(0)}w</p>
                <p className="text-xs text-slate-400">预估金额</p>
              </div>
            </div>
          </div>

          {/* 资料状态 */}
          <div className="bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-black text-slate-800 flex items-center gap-2"><Folder size={16} className="text-slate-500" /> 资料</h4>
              <span className="text-xs text-slate-400">查看 →</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <p className="text-2xl font-black text-slate-800">{activity.attachments?.length || 5}</p>
                <p className="text-xs text-slate-400">文件数量</p>
              </div>
              <button className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-bold hover:bg-indigo-100 transition-all">
                + 上传
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ========== 模态框 ========== */}
      {activeModal === 'profile' && (
        <ActivityFormModal activity={activity} onClose={() => setActiveModal(null)} onSave={async (data) => {
          try {
            const year = data.date ? data.date.split('-')[0] : new Date().getFullYear().toString();
            onUpdate({ ...activity, ...data, year });
            setActiveModal(null);
          } catch (err) {
            console.error('保存活动失败:', err);
            toast.error('保存失败', '保存活动失败，请重试');
          }
        }} />
      )}
      {activeModal === 'review' && (
        <ReviewEditModal activity={activity} onClose={() => setActiveModal(null)} onSave={(reviewData) => { onUpdate({ ...activity, reviewData, isReviewed: true }); setActiveModal(null); }} />
      )}
      {activeModal === 'comment' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setActiveModal(null)}></div>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 p-6 space-y-4">
            <h3 className="text-lg font-black text-slate-800">发表评论</h3>
            <input placeholder="您的姓名" value={newComment.author} onChange={(e) => setNewComment({...newComment, author: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700" />
            <input placeholder="您的角色/部门" value={newComment.role} onChange={(e) => setNewComment({...newComment, role: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700" />
            <textarea placeholder="评论内容..." value={newComment.content} onChange={(e) => setNewComment({...newComment, content: e.target.value})} rows={4} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-600 resize-none" />
            <div className="flex gap-3">
              <button onClick={() => setActiveModal(null)} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">取消</button>
              <button onClick={handleAddComment} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">发布</button>
            </div>
          </div>
        </div>
      )}
      {activeModal === 'addTask' && (
        <AddTaskModal
          activityId={activity.id}
          onClose={() => setActiveModal(null)}
          onSave={(task) => {
            const updatedTasks = [...(activity.tasks || []), task];
            onUpdate({ ...activity, tasks: updatedTasks });
            setActiveModal(null);
          }}
        />
      )}
      {activeModal === 'addEvaluation' && (
        <AddEvaluationModal
          onClose={() => setActiveModal(null)}
          onSave={(evaluation) => {
            const currentEvaluations = activity.reviewData?.evaluations || [];
            const newStatus = currentEvaluations.length + 1 >= (activity.reviewData?.expectedParticipants || 3)
              ? ReviewStatus.PENDING_CONFIRM
              : ReviewStatus.IN_PROGRESS;
            const updatedReviewData = {
              ...activity.reviewData,
              status: newStatus,
              evaluations: [...currentEvaluations, evaluation]
            };
            onUpdate({ ...activity, reviewData: updatedReviewData });
            setActiveModal(null);
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
  const [formData, setFormData] = useState<Partial<Activity>>(activity || { name: '', date: new Date().toISOString().split('T')[0], location: '', type: 'Exhibition', category: '自办活动', status: ActivityStatus.PLANNED, budget: 100000, leads: 0, description: '', industry: '' });

  const isExternal = formData.category === '外部市场活动';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl z-10 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">{activity ? '编辑活动' : '新建活动'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full text-slate-400"><X size={20} /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2"><label className="text-xs font-bold text-slate-400 uppercase">活动名称</label><input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase">日期</label><input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase">地点</label><input value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1" /></div>
            <div><label className="text-xs font-bold text-slate-400 uppercase">活动类型</label>
              <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, industry: e.target.value === '自办活动' ? '' : (formData.industry || '')})} className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold mt-1">
                <option value="自办活动">自办活动</option>
                <option value="外部市场活动">外部市场活动</option>
              </select>
            </div>
            {isExternal && (
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

export default ActivityManager;
