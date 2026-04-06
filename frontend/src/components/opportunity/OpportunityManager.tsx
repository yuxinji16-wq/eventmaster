import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOpportunitiesData, useActivitiesData } from '../../utils/hooks';
import { Opportunity } from '../../types';
import { 
  TrendingUp, 
  Plus, 
  Search, 
  ChevronDown, 
  X, 
  Edit2,
  Check,
  DollarSign,
  Users,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

const OpportunityManager: React.FC = () => {
  const navigate = useNavigate();
  const { opportunities, loading, addOpportunity, updateOpportunity, deleteOpportunity } = useOpportunitiesData();
  const { activities } = useActivitiesData();
  const [selectedYear, setSelectedYear] = useState<string>('全部');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('所有状态');
  const [showNewModal, setShowNewModal] = useState<boolean>(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);

  const statuses = ['所有状态', '高意向', '中意向', '低意向'];

  // 动态获取所有可用年份
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    opportunities.forEach(o => {
      const year = o.createDate.split('-')[0];
      if (year) years.add(year);
    });
    const currentYear = new Date().getFullYear().toString();
    years.add(currentYear);
    years.add((parseInt(currentYear) - 1).toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [opportunities]);

  const getEventName = (id: string) => activities.find(a => a.id === id)?.name || '未知活动';

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesYear = selectedYear === '全部' || opp.createDate.startsWith(selectedYear);
    const matchesSearch = opp.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          opp.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === '所有状态' || opp.status === statusFilter;
    return matchesYear && matchesSearch && matchesStatus;
  });

  const getYearlyStats = (year: string) => {
    const yearOpps = year === '全部' ? opportunities : opportunities.filter(o => o.createDate.startsWith(year));
    return {
      total: yearOpps.length,
      highIntent: yearOpps.filter(o => o.status === '高意向').length,
      mediumIntent: yearOpps.filter(o => o.status === '中意向').length,
      lowIntent: yearOpps.filter(o => o.status === '低意向').length,
      totalValue: yearOpps.reduce((sum, o) => sum + o.estimatedValue, 0)
    };
  };

  const currentStats = getYearlyStats(selectedYear);

  const handleAddOpportunity = async (data: Partial<Opportunity>) => {
    try {
      await addOpportunity(data);
      setShowNewModal(false);
    } catch (err) {
      console.error('Failed to add opportunity:', err);
      alert('添加商机失败，请重试');
    }
  };

  const handleUpdateOpportunity = async (data: Partial<Opportunity>) => {
    if (!editingOpportunity) return;
    await updateOpportunity(parseInt(editingOpportunity.id), data);
    setEditingOpportunity(null);
  };

  const handleDeleteOpportunity = async (id: string) => {
    if (!window.confirm('确定要删除这个商机吗？')) return;
    try {
      await deleteOpportunity(parseInt(id));
    } catch (err) {
      console.error('删除商机失败:', err);
      alert('删除失败，请重试');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">商机转化</h2>
          <p className="text-slate-500">追踪活动产生的潜在商机及转化漏斗</p>
        </div>
        <button
          onClick={() => setShowNewModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Plus size={20} />
          添加新商机
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-500">
              <Users size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">总商机数</span>
            </div>
            <TrendingUp size={16} className="text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-800">{currentStats.total}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-emerald-600">
              <ArrowUpRight size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">高意向</span>
            </div>
          </div>
          <p className="text-3xl font-black text-emerald-600">{currentStats.highIntent}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-amber-600">
              <ArrowDownRight size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">中意向</span>
            </div>
          </div>
          <p className="text-3xl font-black text-amber-600">{currentStats.mediumIntent}</p>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-slate-500">
              <DollarSign size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">总价值</span>
            </div>
          </div>
          <p className="text-3xl font-black text-indigo-600">
            ¥{(currentStats.totalValue / 10000).toFixed(1)}万
          </p>
        </div>
      </div>

      <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[300px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            placeholder="搜索客户名称..."
            className="w-full pl-14 pr-4 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative group">
            <select
              className="appearance-none border border-slate-200 rounded-xl pl-5 pr-12 py-3 text-sm font-bold outline-none transition-all cursor-pointer hover:border-indigo-300 shadow-sm bg-slate-50 text-slate-600"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="全部">全部年份</option>
              {availableYears.map(year => (
                <option key={year} value={year}>{year} 年</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
          </div>
          <div className="relative group">
            <select
              className="appearance-none border border-slate-200 rounded-xl pl-5 pr-12 py-3 text-sm font-bold outline-none transition-all cursor-pointer hover:border-indigo-300 shadow-sm bg-slate-50 text-slate-600"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" size={16} />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-black text-slate-800">商机汇总</h3>
          <span className="text-2xl font-black text-indigo-600">
            ¥{(filteredOpportunities.reduce((sum, o) => sum + o.estimatedValue, 0) / 10000).toFixed(1)}万
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">客户名称</th>
                <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">对接人</th>
                <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">预计价值</th>
                <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">状态</th>
                <th className="text-left py-4 px-4 text-sm font-black text-slate-500 uppercase tracking-wider">预计成交</th>
              </tr>
            </thead>
            <tbody>
              {filteredOpportunities.map((opp) => (
                <tr
                  key={opp.id}
                  className="border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-pointer"
                  onClick={() => navigate(`/opportunities/${opp.id}`)}
                >
                  <td className="py-4 px-4 font-bold text-slate-800">{opp.clientName}</td>
                  <td className="py-4 px-4 text-sm text-slate-600">{opp.contactPerson}</td>
                  <td className="py-4 px-4 font-bold text-indigo-600">
                    ¥{(opp.estimatedValue / 10000).toFixed(2)}万
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${
                      opp.status === '高意向' ? 'bg-emerald-100 text-emerald-700' :
                      opp.status === '中意向' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    }`}>
                      {opp.status}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-600">{opp.expectedCloseDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showNewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-800">添加新商机</h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <OpportunityForm
              onSubmit={handleAddOpportunity}
              onCancel={() => setShowNewModal(false)}
            />
          </div>
        </div>
      )}

    </div>
  );
};

const OpportunityForm: React.FC<{
  onSubmit: (data: Partial<Opportunity>) => void;
  onCancel: () => void;
}> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    clientName: '',
    company: '',
    contact: '',
    phone: '',
    email: '',
    requirement: '',
    contactPerson: '',
    estimatedValue: '',
    status: '中意向',
    expectedCloseDate: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      estimatedValue: parseFloat(formData.estimatedValue) * 10000
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">客户名称 *</label>
          <input
            required
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
            value={formData.clientName}
            onChange={(e) => setFormData({...formData, clientName: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">单位 *</label>
          <input
            required
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
            value={formData.company}
            onChange={(e) => setFormData({...formData, company: e.target.value})}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">对接人 *</label>
          <input
            required
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
            value={formData.contactPerson}
            onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">联系方式 *</label>
          <input
            required
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">邮箱</label>
        <input
          type="email"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">需求描述 *</label>
        <textarea
          required
          rows={3}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold resize-none"
          value={formData.requirement}
          onChange={(e) => setFormData({...formData, requirement: e.target.value})}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">预计价值（万元）*</label>
          <input
            required
            type="number"
            step="0.01"
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
            value={formData.estimatedValue}
            onChange={(e) => setFormData({...formData, estimatedValue: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">状态</label>
          <select
            className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
          >
            <option value="高意向">高意向</option>
            <option value="中意向">中意向</option>
            <option value="低意向">低意向</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">预计成交日期</label>
        <input
          type="date"
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold"
          value={formData.expectedCloseDate}
          onChange={(e) => setFormData({...formData, expectedCloseDate: e.target.value})}
        />
      </div>
      <div>
        <label className="block text-sm font-bold text-slate-700 mb-2">备注</label>
        <textarea
          rows={2}
          className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none font-bold resize-none"
          value={formData.notes}
          onChange={(e) => setFormData({...formData, notes: e.target.value})}
        />
      </div>
      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
        >
          保存
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold hover:bg-slate-200 transition-colors"
        >
          取消
        </button>
      </div>
    </form>
  );
};

const OpportunityDetail: React.FC<{
  opportunity: Opportunity;
  onUpdate: (data: Partial<Opportunity>) => void;
  onDelete: () => void;
  onEdit: () => void;
  isEditing: boolean;
}> = ({ opportunity, onUpdate, onDelete, onEdit, isEditing }) => {
  const [editData, setEditData] = useState<Partial<Opportunity>>({});

  if (isEditing) {
    return (
      <div className="p-6">
        <OpportunityForm
          onSubmit={(data) => {
            onUpdate(data);
            onEdit();
          }}
          onCancel={onEdit}
        />
      </div>
    );
  }

  return (
    <div className="origin-top scale-[0.96] p-5 space-y-5">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h2 className="text-2xl font-black text-slate-800 mb-2">{opportunity.clientName}</h2>
          <p className="text-slate-500">{opportunity.company}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all"
          >
            <Edit2 size={16} />
            编辑
          </button>
          <button
            onClick={onDelete}
            className="flex items-center gap-2 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl text-sm font-bold hover:bg-rose-100 transition-all"
          >
            删除
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">对接人</label>
            <p className="text-lg font-bold text-slate-800 mt-1">{opportunity.contactPerson}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">联系方式</label>
            <p className="text-lg font-bold text-slate-800 mt-1">{opportunity.phone}</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">邮箱</label>
            <p className="text-lg font-bold text-slate-800 mt-1">{opportunity.email || '-'}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">预计价值</label>
            <p className="text-2xl font-black text-indigo-600 mt-1">
              ¥{(opportunity.estimatedValue / 10000).toFixed(2)}万
            </p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">状态</label>
            <p className="mt-1">
              <span className={`px-3 py-1 rounded-lg text-sm font-black uppercase ${
                opportunity.status === '高意向' ? 'bg-emerald-100 text-emerald-700' :
                opportunity.status === '中意向' ? 'bg-amber-100 text-amber-700' :
                'bg-rose-100 text-rose-700'
              }`}>
                {opportunity.status}
              </span>
            </p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">预计成交日期</label>
            <p className="text-lg font-bold text-slate-800 mt-1">{opportunity.expectedCloseDate || '-'}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">需求描述</label>
        <p className="text-base font-medium text-slate-700 mt-2 bg-slate-50 p-4 rounded-xl">{opportunity.requirement}</p>
      </div>

      {opportunity.notes && (
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">备注</label>
          <p className="text-base font-medium text-slate-700 mt-2 bg-slate-50 p-4 rounded-xl">{opportunity.notes}</p>
        </div>
      )}
    </div>
  );
};

export default OpportunityManager;
