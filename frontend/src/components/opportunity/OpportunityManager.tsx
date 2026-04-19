import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeadsData, useActivitiesData } from '../../utils/hooks';
import { Activity, Opportunity } from '../../types';
import { useToast } from '../../shared/Toast';
import { AsyncState } from '../../shared/AsyncState';
import {
  Users,
  Plus,
  Search,
  ChevronDown,
  X,
  Edit2,
  Trash2,
  Tag,
  Building2,
  Phone,
  User,
  MapPin,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  Star
} from 'lucide-react';

// 区域选项
const REGION_OPTIONS = [
  { value: '华北', label: '华北' },
  { value: '华东', label: '华东' },
  { value: '华南', label: '华南' },
  { value: '华中', label: '华中' },
  { value: '西南', label: '西南' },
  { value: '西北', label: '西北' },
  { value: '东北', label: '东北' },
  { value: '港澳台', label: '港澳台' },
  { value: '海外', label: '海外' },
];

// 线索等级选项
const LEAD_LEVEL_OPTIONS = ['A', 'B', 'C', '待评估'];

// 线索状态选项
const LEAD_STATUS_OPTIONS = ['未跟进', '待跟进', '已转销售'];

// 线索等级颜色
const getLeadLevelColor = (level: string) => {
  switch (level) {
    case 'A': return 'bg-rose-100 text-rose-700';
    case 'B': return 'bg-amber-100 text-amber-700';
    case 'C': return 'bg-slate-100 text-slate-600';
    default: return 'bg-slate-50 text-slate-400';
  }
};

// 线索状态颜色
const getLeadStatusColor = (status: string) => {
  switch (status) {
    case '未跟进': return 'bg-slate-100 text-slate-600';
    case '待跟进': return 'bg-blue-100 text-blue-700';
    case '已转销售': return 'bg-purple-100 text-purple-700';
    default: return 'bg-slate-100 text-slate-600';
  }
};

const OpportunityManager: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { leads, loading, error, addLead, updateLead, deleteLead } = useLeadsData();
  const { activities } = useActivitiesData();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [editingLead, setEditingLead] = useState<Opportunity | null>(null);

  // 获取活动名称映射
  const activityNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    activities.forEach(a => { map[a.id] = a.name; });
    return map;
  }, [activities]);

  // 获取可用年份列表
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    leads.forEach(lead => {
      const year = new Date(lead.createdAt).getFullYear().toString();
      years.add(year);
    });
    const currentYear = new Date().getFullYear().toString();
    years.add(currentYear);
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [leads]);

  // 筛选后的线索
  const filteredLeads = useMemo(() => {
    return leads.filter(lead => {
      // 搜索匹配
      const keyword = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' ||
        (lead.clientName || '').toLowerCase().includes(keyword) ||
        (lead.contactName || '').toLowerCase().includes(keyword) ||
        (lead.phone || '').includes(searchTerm);

      // 来源筛选
      const matchesSource = sourceFilter === 'all' ||
        (sourceFilter === 'activity' && lead.sourceType === 'activity') ||
        (sourceFilter === 'manual' && lead.sourceType === 'manual');

      // 活动筛选
      const matchesActivity = activityFilter === 'all' ||
        (lead.sourceType === 'activity' && lead.activityId === activityFilter);

      // 年份筛选
      const leadYear = new Date(lead.createdAt).getFullYear().toString();
      const matchesYear = yearFilter === 'all' || leadYear === yearFilter;

      return matchesSearch && matchesSource && matchesActivity && matchesYear;
    });
  }, [leads, searchTerm, sourceFilter, activityFilter, yearFilter]);

  // 统计
  const stats = useMemo(() => {
    const total = leads.length;
    const fromActivity = leads.filter(l => l.sourceType === 'activity').length;
    const fromManual = leads.filter(l => l.sourceType === 'manual').length;
    const transferred = leads.filter(l => l.status === '已转销售').length;
    const converted = leads.filter(l => l.converted || l.conversionStatus === '已转化').length;
    const notConverted = leads.filter(l => l.conversionStatus === '未转化').length;
    const conversionRate = transferred > 0 ? ((converted / transferred) * 100).toFixed(1) : '0';

    return { total, fromActivity, fromManual, transferred, converted, notConverted, conversionRate };
  }, [leads]);

  // 添加线索
  const handleAddLead = (data: Omit<Opportunity, 'id' | 'createdAt'>) => {
    addLead(data);
    setShowNewModal(false);
    toast.success('线索已添加');
  };

  // 更新线索
  const handleUpdateLead = (data: Omit<Opportunity, 'id' | 'createdAt'>) => {
    if (!editingLead) return;
    updateLead(editingLead.id, data);
    setEditingLead(null);
    toast.success('线索已更新');
  };

  // 删除线索
  const handleDeleteLead = (id: string) => {
    if (!window.confirm('确定要删除这条线索吗？')) return;
    deleteLead(id);
    toast.success('线索已删除');
  };

  // 格式化日期
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* 标题和添加按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">活动线索</h2>
          <p className="text-slate-500">记录和管理活动获取的客户线索</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          录入线索
        </button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Users size={14} />
            <span className="text-xs font-bold uppercase">线索总数</span>
          </div>
          <p className="text-2xl font-black text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Tag size={14} />
            <span className="text-xs font-bold uppercase">活动获取</span>
          </div>
          <p className="text-2xl font-black text-blue-600">{stats.fromActivity}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 mb-2">
            <Plus size={14} />
            <span className="text-xs font-bold uppercase">自主录入</span>
          </div>
          <p className="text-2xl font-black text-slate-600">{stats.fromManual}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-purple-500 mb-2">
            <ArrowRight size={14} />
            <span className="text-xs font-bold uppercase">已转销售</span>
          </div>
          <p className="text-2xl font-black text-purple-600">{stats.transferred}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <CheckCircle size={14} />
            <span className="text-xs font-bold uppercase">已转化</span>
          </div>
          <p className="text-2xl font-black text-emerald-600">{stats.converted}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 text-rose-500 mb-2">
            <Clock size={14} />
            <span className="text-xs font-bold uppercase">未转化</span>
          </div>
          <p className="text-2xl font-black text-rose-600">{stats.notConverted}</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-xl shadow-sm">
          <div className="flex items-center gap-2 text-white/80 mb-2">
            <TrendingUp size={14} />
            <span className="text-xs font-bold uppercase">转化率</span>
          </div>
          <p className="text-2xl font-black text-white">{stats.conversionRate}%</p>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            placeholder="搜索客户名称、姓名、电话..."
            className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {/* 年份筛选 */}
          <div className="relative group">
            <select
              className="appearance-none border border-slate-200 rounded-xl pl-5 pr-12 py-3 text-sm font-bold outline-none transition-all cursor-pointer hover:border-indigo-300 shadow-sm bg-slate-50 text-slate-600"
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
            >
              <option value="all">全部年份</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year} 年</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
          </div>

          {/* 来源筛选 */}
          <div className="relative group">
            <select
              className="appearance-none border border-slate-200 rounded-xl pl-5 pr-12 py-3 text-sm font-bold outline-none transition-all cursor-pointer hover:border-indigo-300 shadow-sm bg-slate-50 text-slate-600"
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                if (e.target.value !== 'activity') {
                  setActivityFilter('all');
                }
              }}
            >
              <option value="all">全部来源</option>
              <option value="activity">活动获取</option>
              <option value="manual">自主录入</option>
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
          </div>

          {/* 活动筛选（仅来源为"活动获取"时显示） */}
          {sourceFilter === 'activity' && (
            <div className="relative group">
              <select
                className="appearance-none border border-slate-200 rounded-xl pl-5 pr-12 py-3 text-sm font-bold outline-none transition-all cursor-pointer hover:border-indigo-300 shadow-sm bg-slate-50 text-slate-600"
                value={activityFilter}
                onChange={(e) => setActivityFilter(e.target.value)}
              >
                <option value="all">全部活动</option>
                {activities.map(act => (
                  <option key={act.id} value={act.id}>{act.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
            </div>
          )}
        </div>
      </div>

      {/* 线索列表 */}
      <AsyncState
        loading={loading}
        loadingText="线索数据加载中..."
        error={error}
        errorTitle="线索数据加载失败"
        onRetry={() => window.location.reload()}
        empty={!loading && !error && filteredLeads.length === 0}
        emptyTitle="暂无线索数据"
        emptyDescription="请调整筛选条件或新增线索。"
      >
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">客户单位</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">姓名</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">联系方式</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">来源</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">等级</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">状态</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">区域/对接人</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">日期</th>
                  <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/opportunities/${lead.id}`)}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" />
                        <span className="font-bold text-slate-800">{lead.clientName}</span>
                      </div>
                      {lead.requirement && (
                        <p className="text-xs text-slate-400 mt-1 truncate max-w-[180px]">
                          {lead.requirement.substring(0, 25)}...
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-700">{lead.contactName}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className="text-slate-600">{lead.phone}</span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${
                        lead.sourceType === 'activity'
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {lead.sourceType === 'activity'
                          ? activityNameMap[lead.activityId || ''] || '活动获取'
                          : '自主录入'
                        }
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getLeadLevelColor(lead.leadLevel)}`}>
                        {lead.leadLevel}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getLeadStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-slate-600">
                        <div className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          <span>{lead.region}</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{lead.owner}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-slate-500">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="py-4 px-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingLead(lead)}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-indigo-600 transition-colors"
                          title="编辑"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLead(lead.id)}
                          className="p-2 hover:bg-rose-50 rounded-lg text-rose-600 transition-colors"
                          title="删除"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              }
              </tbody>
            </table>
          </div>
        </div>
      </AsyncState>

      {/* 新增弹窗 */}
      {showNewModal && (
        <LeadFormModal
          activities={activities}
          onSubmit={handleAddLead}
          onClose={() => setShowNewModal(false)}
        />
      )}

      {/* 编辑弹窗 */}
      {editingLead && (
        <LeadFormModal
          activities={activities}
          initialData={editingLead}
          onSubmit={handleUpdateLead}
          onClose={() => setEditingLead(null)}
        />
      )}
    </div>
  );
};

// 线索表单弹窗组件
interface LeadFormModalProps {
  activities: Activity[];
  initialData?: Opportunity;
  onSubmit: (data: Omit<Opportunity, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

const LeadFormModal: React.FC<LeadFormModalProps> = ({
  activities,
  initialData,
  onSubmit,
  onClose
}) => {
  const toast = useToast();
  const [formData, setFormData] = useState<Omit<Opportunity, 'id' | 'createdAt'>>({
    clientName: initialData?.clientName || '',
    contactName: initialData?.contactName || '',
    phone: initialData?.phone || '',
    email: initialData?.email || '',
    requirement: initialData?.requirement || '',
    sourceType: initialData?.sourceType || 'manual',
    sourceName: initialData?.sourceName || '自主录入',
    activityId: initialData?.activityId,
    region: initialData?.region || '',
    owner: initialData?.owner || '',
    // 销售评估
    leadLevel: initialData?.leadLevel || '待评估',
    evaluationNote: initialData?.evaluationNote || '',
    transferredToSales: initialData?.transferredToSales || false,
    transferredAt: initialData?.transferredAt,
    // 转化结果
    converted: initialData?.converted || false,
    conversionStatus: initialData?.conversionStatus,
    conversionAt: initialData?.conversionAt,
    resultNote: initialData?.resultNote || '',
    // 状态
    status: initialData?.status || '未跟进',
    notes: initialData?.notes || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientName.trim() || !formData.contactName.trim() || !formData.phone.trim()) {
      toast.warning('请填写客户单位、姓名和联系方式');
      return;
    }
    if (!formData.region || !formData.owner) {
      toast.warning('请填写区域和对接人');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-black text-slate-800">
            {initialData ? '编辑线索' : '录入线索'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* 客户信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                客户单位 *
              </label>
              <input
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                value={formData.clientName}
                onChange={(e) => setFormData({...formData, clientName: e.target.value})}
                placeholder="输入客户单位名称"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                姓名 *
              </label>
              <input
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                value={formData.contactName}
                onChange={(e) => setFormData({...formData, contactName: e.target.value})}
                placeholder="输入联系人姓名"
              />
            </div>
          </div>

          {/* 联系方式 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                联系方式 *
              </label>
              <input
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="输入电话"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                邮箱
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder="输入邮箱"
              />
            </div>
          </div>

          {/* 来源 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              商机来源
            </label>
            <select
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
              value={formData.sourceType}
              onChange={(e) => {
                const sourceType = e.target.value as 'activity' | 'manual';
                setFormData({
                  ...formData,
                  sourceType,
                  sourceName: sourceType === 'manual' ? '自主录入' : '',
                  activityId: sourceType === 'manual' ? undefined : formData.activityId,
                });
              }}
            >
              <option value="manual">自主录入</option>
              <option value="activity">活动获取</option>
            </select>
          </div>

          {/* 活动选择 */}
          {formData.sourceType === 'activity' && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                选择活动 *
              </label>
              <select
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                value={formData.activityId || ''}
                onChange={(e) => {
                  const act = activities.find(a => a.id === e.target.value);
                  setFormData({
                    ...formData,
                    activityId: e.target.value,
                    sourceName: act?.name || '活动获取',
                  });
                }}
              >
                <option value="">选择活动</option>
                {activities.map(act => (
                  <option key={act.id} value={act.id}>{act.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* 需求 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              需求描述 *
            </label>
            <textarea
              required
              rows={3}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold resize-none"
              value={formData.requirement}
              onChange={(e) => setFormData({...formData, requirement: e.target.value})}
              placeholder="描述客户需求..."
            />
          </div>

          {/* 销售分配 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                所属区域 *
              </label>
              <select
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                value={formData.region}
                onChange={(e) => setFormData({...formData, region: e.target.value})}
              >
                <option value="">选择区域</option>
                {REGION_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                对接人 *
              </label>
              <input
                required
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                value={formData.owner}
                onChange={(e) => setFormData({...formData, owner: e.target.value})}
                placeholder="输入对接人姓名"
              />
            </div>
          </div>

          {/* 线索等级（编辑时可修改） */}
          {initialData && (
            <>
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">销售评估</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      线索等级
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                      value={formData.leadLevel}
                      onChange={(e) => setFormData({...formData, leadLevel: e.target.value as any})}
                    >
                      {LEAD_LEVEL_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      当前状态
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                    >
                      {LEAD_STATUS_OPTIONS.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.transferredToSales}
                      onChange={(e) => setFormData({...formData, transferredToSales: e.target.checked})}
                      className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="text-sm font-bold text-slate-700">已转交销售</span>
                  </label>
                </div>
                {formData.transferredToSales && (
                  <div className="mt-3">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      转交时间
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                      value={formData.transferredAt?.split('T')[0] || ''}
                      onChange={(e) => setFormData({...formData, transferredAt: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                    />
                  </div>
                )}
                <div className="mt-3">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    评估备注
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold resize-none"
                    value={formData.evaluationNote}
                    onChange={(e) => setFormData({...formData, evaluationNote: e.target.value})}
                    placeholder="评估备注..."
                  />
                </div>
              </div>

              {/* 转化结果 */}
              <div className="border-t border-slate-200 pt-4 mt-4">
                <h4 className="text-sm font-bold text-slate-700 mb-3">转化结果</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.converted}
                        onChange={(e) => setFormData({
                          ...formData,
                          converted: e.target.checked,
                          conversionStatus: e.target.checked ? '已转化' : '未转化'
                        })}
                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                      />
                      <span className="text-sm font-bold text-slate-700">转化成功</span>
                    </label>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      结果状态
                    </label>
                    <select
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                      value={formData.conversionStatus || ''}
                      onChange={(e) => setFormData({...formData, conversionStatus: e.target.value as any})}
                    >
                      <option value="">选择结果</option>
                      <option value="已转化">已转化</option>
                      <option value="未转化">未转化</option>
                    </select>
                  </div>
                </div>
                {formData.conversionStatus === '已转化' && (
                  <div className="mt-3">
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      转化时间
                    </label>
                    <input
                      type="date"
                      className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
                      value={formData.conversionAt?.split('T')[0] || ''}
                      onChange={(e) => setFormData({...formData, conversionAt: e.target.value ? new Date(e.target.value).toISOString() : undefined})}
                    />
                  </div>
                )}
                <div className="mt-3">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    结果备注
                  </label>
                  <textarea
                    rows={2}
                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold resize-none"
                    value={formData.resultNote}
                    onChange={(e) => setFormData({...formData, resultNote: e.target.value})}
                    placeholder="结果备注..."
                  />
                </div>
              </div>
            </>
          )}

          {/* 备注 */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              备注
            </label>
            <textarea
              rows={2}
              className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold resize-none"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="其他备注信息..."
            />
          </div>

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
            >
              保存
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
            >
              取消
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OpportunityManager;
