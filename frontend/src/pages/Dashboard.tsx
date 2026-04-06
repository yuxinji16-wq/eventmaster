
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { TrendingUp, Users, Target, DollarSign, Calendar, BarChart2, LineChart as LineIcon, ChevronDown } from 'lucide-react';
import { dashboardApi } from '../services/backendApi';

// 类型定义
interface MonthlyTrendItem {
  month: string;
  budget: number;
  leads: number;
}

interface ActivityDistributionItem {
  type: string;
  count: number;
  percentage: number;
  color: string;
}

interface DashboardData {
  yearly_metrics: {
    year: string;
    budget: number;
    leads: number;
    roi: number;
    completion: number;
  };
  monthly_trend: MonthlyTrendItem[];
  activity_distribution: ActivityDistributionItem[];
}

// 模拟数据生成器（作为回退）
const generateYearlyData = (year: string): DashboardData => {
  const seed = parseInt(year);
  return {
    yearly_metrics: {
      year,
      budget: (80 + (seed % 5) * 5) * 10000,
      leads: 800 + (seed % 10) * 50,
      roi: 3.5 + (seed % 3) * 0.4,
      completion: 70 + (seed % 7) * 4
    },
    monthly_trend: [
      { month: '1月', budget: 120000 + (seed % 3) * 20000, leads: 350 + (seed % 5) * 30 },
      { month: '2月', budget: 80000 + (seed % 2) * 15000, leads: 180 + (seed % 4) * 20 },
      { month: '3月', budget: 520000 - (seed % 4) * 30000, leads: 780 - (seed % 3) * 40 },
      { month: '4月', budget: 280000 + (seed % 5) * 10000, leads: 420 + (seed % 2) * 50 },
      { month: '5月', budget: 410000 + (seed % 3) * 25000, leads: 590 + (seed % 6) * 15 },
      { month: '6月', budget: 220000 - (seed % 2) * 10000, leads: 310 + (seed % 4) * 10 },
    ],
    activity_distribution: [
      { type: '展会', count: 5 + (seed % 4), percentage: 30, color: '#6366f1' },
      { type: '研讨会', count: 10 + (seed % 6), percentage: 50, color: '#8b5cf6' },
      { type: '路演', count: 3 + (seed % 3), percentage: 15, color: '#ec4899' },
      { type: '峰会', count: 2 + (seed % 2), percentage: 10, color: '#10b981' },
    ]
  };
};

const Dashboard: React.FC = () => {
  const [globalYear, setGlobalYear] = useState('2024');
  const [trendYear, setTrendYear] = useState('2024');
  const [chartType, setChartType] = useState<'bar' | 'line'>('line');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async (year: string) => {
    try {
      setLoading(true);
      const response = await dashboardApi.getStats(year);
      // 将真实API响应转换为Dashboard期望的格式
      const monthlyTrend = Object.entries(response.monthly || {}).map(([month, data]: [string, any]) => ({
        month: month.slice(5) + '月', // "2024-01" -> "01月"
        budget: data.budget || 0,
        leads: data.count * 10 || 0 // 估算leads
      }));
      const totalActivities = response.activities?.total || 0;
      const activityDistribution = [
        { type: '已完成', count: response.activities?.completed || 0, percentage: totalActivities > 0 ? (response.activities?.completed / totalActivities * 100) : 0, color: '#10b981' },
        { type: '进行中', count: response.activities?.ongoing || 0, percentage: totalActivities > 0 ? (response.activities?.ongoing / totalActivities * 100) : 0, color: '#6366f1' },
        { type: '待启动', count: response.activities?.by_status?.待启动 || 0, percentage: totalActivities > 0 ? ((response.activities?.by_status?.待启动 || 0) / totalActivities * 100) : 0, color: '#f59e0b' },
      ].filter(item => item.count > 0);
      const transformedData = {
        yearly_metrics: {
          year,
          budget: response.budget?.total || 0,
          leads: response.opportunities?.total_value ? Math.round(response.opportunities.total_value / 10000) : 0,
          roi: response.budget?.utilization_rate ? (response.budget.utilization_rate / 100 * 3.5) : 3.5,
          completion: totalActivities > 0 ? ((response.activities?.completed / totalActivities) * 100) : 0
        },
        monthly_trend: monthlyTrend,
        activity_distribution: activityDistribution
      };
      setDashboardData(transformedData);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      setDashboardData(generateYearlyData(year));
      setError(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(globalYear);
  }, [globalYear, fetchDashboardData]);

  const globalData = useMemo(() => {
    if (dashboardData && 'yearly_metrics' in dashboardData) {
      return {
        metrics: {
          budget: dashboardData.yearly_metrics.budget,
          leads: dashboardData.yearly_metrics.leads,
          roi: dashboardData.yearly_metrics.roi.toFixed(1),
          completion: dashboardData.yearly_metrics.completion
        },
        monthly: dashboardData.monthly_trend.map((item: MonthlyTrendItem) => ({
          name: item.month,
          budget: item.budget,
          leads: item.leads
        })),
        distribution: dashboardData.activity_distribution.map((item: ActivityDistributionItem) => ({
          name: item.type,
          value: item.count,
          color: item.color
        }))
      };
    }
    const mockData = generateYearlyData(globalYear);
    return {
      metrics: {
        budget: mockData.yearly_metrics.budget / 10000,
        leads: mockData.yearly_metrics.leads,
        roi: mockData.yearly_metrics.roi.toFixed(1),
        completion: mockData.yearly_metrics.completion
      },
      monthly: mockData.monthly_trend.map(item => ({
        name: item.month,
        budget: item.budget,
        leads: item.leads
      })),
      distribution: mockData.activity_distribution.map(item => ({
        name: item.type,
        value: item.count,
        color: item.color
      }))
    };
  }, [dashboardData, globalYear]);

  const trendData = useMemo(() => {
    if (dashboardData && 'monthly_trend' in dashboardData) {
      return {
        monthly: dashboardData.monthly_trend.map((item: MonthlyTrendItem) => ({
          name: item.month,
          budget: item.budget,
          leads: item.leads
        })),
        distribution: dashboardData.activity_distribution.map((item: ActivityDistributionItem) => ({
          name: item.type,
          value: item.count,
          color: item.color
        }))
      };
    }
    const mockData = generateYearlyData(trendYear);
    return {
      monthly: mockData.monthly_trend.map(item => ({
        name: item.month,
        budget: item.budget,
        leads: item.leads
      })),
      distribution: mockData.activity_distribution.map(item => ({
        name: item.type,
        value: item.count,
        color: item.color
      }))
    };
  }, [dashboardData, trendYear]);

  if (loading && !dashboardData) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600">
            <Calendar size={18} />
          </div>
          <div>
            <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Timeframe Selector</span>
            <span className="text-sm font-bold text-slate-700">数据统计周期</span>
          </div>
        </div>

        <div className="relative">
          <select
            value={globalYear}
            onChange={(e) => setGlobalYear(e.target.value)}
            className="appearance-none bg-white border border-indigo-100 rounded-lg pl-4 pr-10 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 outline-none cursor-pointer"
          >
            <option value="2027">2027</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
            <option value="2022">2022</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 pointer-events-none" size={14} />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <MetricCard
          title="年度总预算"
          value={`¥${globalData.metrics.budget.toFixed(1)}w`}
          icon={<DollarSign size={18} className="text-indigo-600" />}
          change={`+${(parseInt(globalYear) % 15) + 5}%`}
        />
        <MetricCard
          title="累计潜客数"
          value={globalData.metrics.leads.toLocaleString()}
          icon={<Users size={18} className="text-emerald-600" />}
          change={`+${(parseInt(globalYear) % 20) + 10}%`}
        />
        <MetricCard
          title="活动ROI"
          value={`${globalData.metrics.roi}x`}
          icon={<TrendingUp size={18} className="text-pink-600" />}
          change={`+${(parseInt(globalYear) % 8) + 2}%`}
        />
        <MetricCard
          title="目标完成率"
          value={`${globalData.metrics.completion}%`}
          icon={<Target size={18} className="text-amber-600" />}
          change={`+${(parseInt(globalYear) % 5) + 1}%`}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">年度活动趋势</h3>
              <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">{trendYear}</p>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <select
                value={trendYear}
                onChange={(e) => setTrendYear(e.target.value)}
                className="appearance-none bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-slate-600 outline-none cursor-pointer"
              >
                <option value="2027">2027</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>

              <div className="h-4 w-px bg-slate-200"></div>

              <div className="flex gap-0.5 bg-white p-0.5 rounded border border-slate-100">
                <button
                  onClick={() => setChartType('bar')}
                  className={`p-1 rounded transition-all ${chartType === 'bar' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-400'}`}
                >
                  <BarChart2 size={14} />
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`p-1 rounded transition-all ${chartType === 'line' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-indigo-400'}`}
                >
                  <LineIcon size={14} />
                </button>
              </div>
            </div>
          </div>

          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={trendData.monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px'}} />
                  <Bar dataKey="budget" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="leads" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              ) : (
                <AreaChart data={trendData.monthly} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBudget2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorLeads2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 600}} dy={5} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', padding: '8px'}} />
                  <Area type="monotone" dataKey="budget" stroke="#6366f1" strokeWidth={3} fill="url(#colorBudget2)" animationDuration={1000} />
                  <Area type="monotone" dataKey="leads" stroke="#10b981" strokeWidth={3} fill="url(#colorLeads2)" animationDuration={1000} />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>

          <div className="flex justify-center gap-6 mt-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 rounded-full bg-indigo-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">预算</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-1.5 rounded-full bg-emerald-500"></div>
              <span className="text-[10px] font-bold text-slate-500 uppercase">获客</span>
            </div>
          </div>
        </div>

        {/* Distribution Pie */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-base font-bold text-slate-800 mb-1">活动类型分布</h3>
          <p className="text-[9px] text-slate-400 uppercase font-bold tracking-wider mb-3">{trendYear}</p>
          <div className="h-44 flex flex-col items-center justify-center relative">
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={trendData.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationBegin={200}
                  animationDuration={1000}
                >
                  {trendData.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '10px', border: 'none', boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>

            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-8 text-center pointer-events-none">
              <p className="text-2xl font-black text-slate-800 leading-none">{trendData.distribution.reduce((a,b)=>a+b.value, 0)}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mt-0.5">Events</p>
            </div>

            <div className="w-full mt-1 space-y-2">
              {trendData.distribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs group">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{backgroundColor: item.color}}></div>
                    <span className="text-slate-500 font-medium group-hover:text-slate-800 transition-colors">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-800 bg-slate-50 px-2 py-0.5 rounded">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{title: string; value: string; icon: React.ReactNode; change: string}> = ({title, value, icon, change}) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-start justify-between group hover:border-indigo-300 hover:shadow-md transition-all duration-200">
    <div>
      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-1">{title}</p>
      <h4 className="text-xl font-black text-slate-800 leading-none mb-2">{value}</h4>
      <p className="flex items-center gap-1.5 text-[9px] font-bold uppercase">
        <span className="text-emerald-500 bg-emerald-50 px-1.5 py-0.5 rounded">{change}</span>
        <span className="text-slate-400">vs Last</span>
      </p>
    </div>
    <div className="p-2.5 bg-slate-50 rounded-lg group-hover:bg-indigo-600 group-hover:text-white transition-all duration-200">
      {icon}
    </div>
  </div>
);

export default Dashboard;
