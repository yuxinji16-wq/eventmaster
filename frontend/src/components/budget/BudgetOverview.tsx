import React from 'react';
import {
  Wallet, PieChart as PieIcon, BarChart3, AlertTriangle, TrendingUp,
  Building, Building2, Search, Activity as ActivityIcon, Calendar,
  ArrowLeft, CreditCard, DollarSign, AlertCircle, Sparkles
} from 'lucide-react';
import {
  AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Activity, BudgetCategory, BudgetStatus, BudgetItem } from '../../types';
import { BUDGET_CATEGORIES } from './BudgetManager';

interface BudgetOverviewProps {
  selectedYear: string;
  yearlyQuota: Record<string, number>;
  yearStats: {
    totalBudget: number;
    totalUsed: number;
    remaining: number;
    executionRate: number;
  };
  categoryStats: {
    self: { count: number; budget: number; used: number; avgRate: number };
    external: { count: number; budget: number; used: number; avgRate: number };
  };
  monthlyTrend: { month: string; budget: number; actual: number }[];
  overBudgetActivities: Activity[];
  highRiskActivities: Activity[];
  filteredActivities: Activity[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  categoryFilter: string;
  setCategoryFilter: (f: string) => void;
  industryFilter: string;
  setIndustryFilter: (f: string) => void;
  availableIndustries: string[];
  statusFilter: string;
  setStatusFilter: (f: string) => void;
  onYearChange: (y: string) => void;
  onQuotaModalOpen: () => void;
  onViewBudgetStructure: (activityId: string) => void;
  getBudgetStatus: (activity: Activity) => '正常' | '预警' | '超预算';
  roiAnalysis: {
    self: { leads: number; spend: number; roi: string };
    external: { leads: number; spend: number; roi: string };
  };
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  selectedYear, yearlyQuota, yearStats, categoryStats, monthlyTrend,
  overBudgetActivities, highRiskActivities, filteredActivities,
  searchQuery, setSearchQuery, categoryFilter, setCategoryFilter, industryFilter, setIndustryFilter, availableIndustries, statusFilter, setStatusFilter,
  onYearChange, onQuotaModalOpen, onViewBudgetStructure, getBudgetStatus, roiAnalysis
}) => {
  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">预算仓库</h1>
          <p className="text-sm text-slate-500 mt-1">年度预算分析 + 活动预算管理</p>
        </div>
        <select
          value={selectedYear}
          onChange={(e) => onYearChange(e.target.value)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all cursor-pointer"
        >
          {Object.keys(yearlyQuota).map(y => (
            <option key={y} value={y}>{y} 年度</option>
          ))}
        </select>
      </div>

      {/* 年度总览卡片 */}
      <div className="grid grid-cols-4 gap-4">
        <div
          className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white cursor-pointer hover:scale-[1.02] transition-all"
          onClick={onQuotaModalOpen}
        >
          <div className="flex items-center justify-between mb-2">
            <Wallet size={20} className="text-white/70" />
            <span className="text-xs text-white/60">年度</span>
          </div>
          <p className="text-3xl font-black">¥{(yearStats.totalBudget / 10000).toFixed(0)}w</p>
          <p className="text-sm text-white/80">预算总额</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <CreditCard size={20} className="text-white/70" />
            <span className="text-xs text-white/60">年度</span>
          </div>
          <p className="text-3xl font-black">¥{(yearStats.totalUsed / 10000).toFixed(0)}w</p>
          <p className="text-sm text-white/80">已使用金额</p>
        </div>

        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <DollarSign size={20} className="text-white/70" />
            <span className="text-xs text-white/60">年度</span>
          </div>
          <p className="text-3xl font-black">¥{(yearStats.remaining / 10000).toFixed(0)}w</p>
          <p className="text-sm text-white/80">剩余预算</p>
        </div>

        <div className={`rounded-xl p-5 text-white ${yearStats.executionRate > 100 ? 'bg-gradient-to-br from-rose-500 to-rose-600' : 'bg-gradient-to-br from-purple-500 to-purple-600'}`}>
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={20} className="text-white/70" />
            <span className="text-xs text-white/60">使用率</span>
          </div>
          <p className="text-3xl font-black">{yearStats.executionRate.toFixed(1)}%</p>
          <p className="text-sm text-white/80">预算使用率</p>
        </div>
      </div>

      {/* 月度趋势 + 活动类型对比 + 风险预警 + ROI分析 */}
      <div className="grid grid-cols-4 gap-4">
        {/* 行业预算分布 */}
        <div className="col-span-2 bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-500" /> 行业预算分布
          </h3>
          <div className="h-56 min-w-0">
            {monthlyTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-slate-300 text-sm">暂无趋势数据</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" />
                  <YAxis tick={{ fontSize: 10, fontWeight: 'bold' }} stroke="#94a3b8" tickFormatter={(v) => `¥${v}w`} />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [`¥${value.toFixed(1)}万`, '']}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="budget" name="预算" stroke="#6366f1" fill="#c7d2fe" strokeWidth={2} />
                  <Area type="monotone" dataKey="actual" name="实际" stroke="#10b981" fill="#a7f3d0" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* 预算风险预警 */}
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" /> 预算风险预警
          </h3>
          <div className="space-y-3">
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-rose-600">超预算活动</span>
                <span className="text-xl font-black text-rose-600">{overBudgetActivities.length}</span>
              </div>
              <p className="text-xs text-rose-500">需立即关注</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-amber-600">高风险活动</span>
                <span className="text-xl font-black text-amber-600">{highRiskActivities.length}</span>
              </div>
              <p className="text-xs text-amber-500">执行率 80%-100%</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-emerald-600">正常活动</span>
                <span className="text-xl font-black text-emerald-600">
                  {filteredActivities.length - overBudgetActivities.length - highRiskActivities.length}
                </span>
              </div>
              <p className="text-xs text-emerald-500">执行率 &lt;80%</p>
            </div>
          </div>
        </div>

        {/* ROI 分析 */}
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-purple-500" /> ROI 分析
          </h3>
          <div className="space-y-4">
            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building size={14} className="text-indigo-600" />
                <span className="font-bold text-indigo-700 text-sm">自办活动</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-indigo-600">{roiAnalysis.self.roi}</p>
                <p className="text-xs text-slate-500">留资/万元投入</p>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                {roiAnalysis.self.leads} 留资 / ¥{(roiAnalysis.self.spend / 10000).toFixed(0)}w
              </p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={14} className="text-emerald-600" />
                <span className="font-bold text-emerald-700 text-sm">外部活动</span>
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-emerald-600">{roiAnalysis.external.roi}</p>
                <p className="text-xs text-slate-500">留资/万元投入</p>
              </div>
              <p className="text-xs text-slate-400 mt-2 text-center">
                {roiAnalysis.external.leads} 留资 / ¥{(roiAnalysis.external.spend / 10000).toFixed(0)}w
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 超预算 + 高风险活动快捷入口 */}
      {(overBudgetActivities.length > 0 || highRiskActivities.length > 0) && (
        <div className="grid grid-cols-2 gap-4">
          {/* 超预算活动 */}
          {overBudgetActivities.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-100">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-500" /> 超预算活动
                <span className="ml-2 px-2 py-0.5 bg-rose-100 text-rose-600 text-xs font-bold rounded-full">
                  {overBudgetActivities.length} 个
                </span>
              </h3>
              <div className="space-y-2">
                {overBudgetActivities.slice(0, 3).map(activity => (
                  <div
                    key={activity.id}
                    className="flex items-center justify-between p-3 bg-rose-50 border border-rose-200 rounded-xl cursor-pointer hover:bg-rose-100 transition-all"
                    onClick={() => onViewBudgetStructure(activity.id)}
                  >
                    <div>
                      <p className="font-bold text-rose-700 text-sm">{activity.name}</p>
                      <p className="text-xs text-rose-500 mt-0.5">
                        预算 ¥{(activity.budget / 10000).toFixed(0)}w / 实际 ¥{(activity.actualSpend / 10000).toFixed(1)}w
                      </p>
                    </div>
                    <span className="text-rose-600 font-bold text-sm">
                      +{((activity.actualSpend - activity.budget) / 10000).toFixed(1)}w
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 高风险活动 */}
          {highRiskActivities.length > 0 && (
            <div className="bg-white rounded-xl p-5 border border-slate-100">
              <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
                <AlertCircle size={18} className="text-amber-500" /> 高风险活动
                <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-600 text-xs font-bold rounded-full">
                  {highRiskActivities.length} 个
                </span>
              </h3>
              <div className="space-y-2">
                {highRiskActivities.slice(0, 3).map(activity => {
                  const rate = (activity.actualSpend / activity.budget) * 100;
                  return (
                    <div
                      key={activity.id}
                      className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded-xl cursor-pointer hover:bg-amber-100 transition-all"
                      onClick={() => onViewBudgetStructure(activity.id)}
                    >
                      <div>
                        <p className="font-bold text-amber-700 text-sm">{activity.name}</p>
                        <p className="text-xs text-amber-500 mt-0.5">
                          预算 ¥{(activity.budget / 10000).toFixed(0)}w / 剩余 ¥{((activity.budget - activity.actualSpend) / 10000).toFixed(1)}w
                        </p>
                      </div>
                      <span className="text-amber-600 font-bold text-sm">{rate.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 活动类型对比（精简版） */}
      <div className="bg-white rounded-xl p-5 border border-slate-100">
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <PieIcon size={18} className="text-emerald-500" /> 活动类型对比
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building size={16} className="text-indigo-600" />
              <span className="font-bold text-indigo-700">自办活动</span>
              <span className="ml-auto text-xs bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                {categoryStats.self.count} 个
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-black text-indigo-600">¥{(categoryStats.self.budget / 10000).toFixed(0)}w</p>
                <p className="text-xs text-slate-500">预算</p>
              </div>
              <div>
                <p className="text-lg font-black text-indigo-600">¥{(categoryStats.self.used / 10000).toFixed(0)}w</p>
                <p className="text-xs text-slate-500">实际</p>
              </div>
              <div>
                <p className="text-lg font-black text-indigo-600">{categoryStats.self.avgRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500">执行率</p>
              </div>
            </div>
          </div>

          <div className="bg-emerald-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 size={16} className="text-emerald-600" />
              <span className="font-bold text-emerald-700">外部活动</span>
              <span className="ml-auto text-xs bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                {categoryStats.external.count} 个
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-black text-emerald-600">¥{(categoryStats.external.budget / 10000).toFixed(0)}w</p>
                <p className="text-xs text-slate-500">预算</p>
              </div>
              <div>
                <p className="text-lg font-black text-emerald-600">¥{(categoryStats.external.used / 10000).toFixed(0)}w</p>
                <p className="text-xs text-slate-500">实际</p>
              </div>
              <div>
                <p className="text-lg font-black text-emerald-600">{categoryStats.external.avgRate.toFixed(1)}%</p>
                <p className="text-xs text-slate-500">执行率</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 筛选栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="搜索活动名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="appearance-none border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-bold outline-none cursor-pointer hover:border-indigo-300 bg-slate-50 text-slate-600"
          >
            <option value="所有类型">所有类型</option>
            <option value="自办活动">自办活动</option>
            <option value="外部市场活动">外部活动</option>
          </select>
          <select
            value={industryFilter}
            onChange={(e) => setIndustryFilter(e.target.value)}
            className="appearance-none border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-bold outline-none cursor-pointer hover:border-indigo-300 bg-slate-50 text-slate-600"
          >
            <option value="所有行业">所有行业</option>
            {availableIndustries.map(industry => (
              <option key={industry} value={industry}>{industry}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none border border-slate-200 rounded-xl pl-4 pr-10 py-2 text-sm font-bold outline-none cursor-pointer hover:border-indigo-300 bg-slate-50 text-slate-600"
          >
            <option value="全部状态">全部状态</option>
            <option value="正常">正常</option>
            <option value="预警">预警</option>
            <option value="超预算">超预算</option>
          </select>
        </div>
      </div>

      {/* 活动预算列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase">
          <div className="col-span-3">活动名称</div>
          <div className="col-span-1">类型</div>
          <div className="col-span-1">行业</div>
          <div className="col-span-2">预算 / 实际</div>
          <div className="col-span-1">差额</div>
          <div className="col-span-1">执行率</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-2">操作</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredActivities.map(activity => {
            const executionRate = (activity.actualSpend / activity.budget) * 100;
            const variance = activity.actualSpend - activity.budget;
            const status = getBudgetStatus(activity);

            return (
              <div key={activity.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-all">
                <div className="col-span-3">
                  <p className="font-black text-slate-800 truncate">{activity.name}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activity.date}</p>
                </div>
                <div className="col-span-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${activity.category === '自办活动'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                    }`}>
                    {activity.category === '自办活动' ? '自办' : '外部'}
                  </span>
                </div>
                <div className="col-span-1">
                  <span className="text-xs font-bold text-slate-500">{activity.industry || '未设置'}</span>
                </div>
                <div className="col-span-2">
                  <p className="text-sm">
                    <span className="text-slate-500">¥{(activity.budget / 10000).toFixed(0)}w</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className={`font-bold ${status === '超预算' ? 'text-rose-600' : 'text-slate-700'}`}>
                      ¥{(activity.actualSpend / 10000).toFixed(1)}w
                    </span>
                  </p>
                </div>
                <div className="col-span-1">
                  <span className={`font-bold text-sm ${variance > 0 ? 'text-rose-600' : variance < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {variance > 0 ? '+' : ''}{(variance / 10000).toFixed(1)}w
                  </span>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          status === '超预算' ? 'bg-rose-500' :
                          status === '预警' ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(executionRate, 100)}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold ${
                      status === '超预算' ? 'text-rose-600' :
                      status === '预警' ? 'text-amber-600' : 'text-slate-600'
                    }`}>
                      {executionRate.toFixed(0)}%
                    </span>
                  </div>
                </div>
                <div className="col-span-1">
                  <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                    status === '超预算' ? 'bg-rose-100 text-rose-700' :
                    status === '预警' ? 'bg-amber-100 text-amber-700' :
                    'bg-emerald-100 text-emerald-700'
                  }`}>
                    {status}
                  </span>
                </div>
                <div className="col-span-2 flex gap-2">
                  <button
                    onClick={() => onViewBudgetStructure(activity.id)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all"
                  >
                    查看预算结构
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredActivities.length === 0 && (
          <div className="text-center py-12">
            <Wallet size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold">暂无活动记录</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetOverview;
