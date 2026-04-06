import React from 'react';
import {
  ArrowLeft, Calendar, Activity as ActivityIcon, FileText, PieChart as PieIcon,
  Plus, AlertTriangle, AlertCircle, Sparkles, Edit, Receipt, X
} from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer
} from 'recharts';
import { Activity, Budget, BudgetItem, BudgetCategory, BudgetStatus } from '../../types';

const CATEGORY_COLORS: Record<BudgetCategory, string> = {
  '场地租用': '#6366f1',
  '搭建/展览': '#10b981',
  '物料制作': '#f59e0b',
  '差旅/住宿': '#ef4444',
  '餐饮/招待': '#a855f7',
  '礼品/赠品': '#06b6d4',
  '媒体/推广': '#ec4899',
  '人员费用': '#84cc16',
  '其他': '#94a3b8',
};

interface BudgetDetailProps {
  currentActivity: Activity | undefined;
  currentBudget: Budget | undefined;
  executionRate: number;
  status: '正常' | '预警' | '超预算';
  variance: number;
  aiInsight: string | null;
  isAiLoading: boolean;
  onBack: () => void;
  onRunAIAnalysis: () => void;
  onBudgetItemModalOpen: (item: BudgetItem | null) => void;
}

const BudgetDetail: React.FC<BudgetDetailProps> = ({
  currentActivity, currentBudget, executionRate, status, variance,
  aiInsight, isAiLoading, onBack, onRunAIAnalysis, onBudgetItemModalOpen
}) => {
  if (!currentActivity) return null;

  return (
    <div className="space-y-4">
      {/* 返回按钮 */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-all">
        <ArrowLeft size={18} /> 返回预算列表
      </button>

      {/* 活动基础信息 */}
      <div className={`rounded-xl p-6 text-white ${
        status === '超预算' ? 'bg-gradient-to-r from-rose-600 to-rose-700' :
        status === '预警' ? 'bg-gradient-to-r from-amber-500 to-amber-600' :
        'bg-gradient-to-r from-indigo-600 to-purple-600'
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                status === '超预算' ? 'bg-rose-400/30 text-rose-100' :
                status === '预警' ? 'bg-amber-400/30 text-amber-100' :
                'bg-emerald-400/30 text-emerald-100'
              }`}>
                {status}
              </span>
              <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold">{currentActivity.category}</span>
            </div>
            <h1 className="text-2xl font-black mb-2">{currentActivity.name}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1"><Calendar size={14} /> {currentActivity.date}</span>
              <span className="flex items-center gap-1"><ActivityIcon size={14} /> {currentActivity.location}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white/60 text-xs mb-1">预算执行率</p>
            <p className="text-4xl font-black">{executionRate}%</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">预算金额</p>
            <p className="text-lg font-black">¥{(currentActivity.budget / 10000).toFixed(0)}w</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">实际花费</p>
            <p className="text-lg font-black">¥{(currentActivity.actualSpend / 10000).toFixed(1)}w</p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">剩余预算</p>
            <p className={`text-lg font-black ${status === '超预算' ? 'text-rose-200' : 'text-emerald-200'}`}>
              ¥{((currentActivity.budget - currentActivity.actualSpend) / 10000).toFixed(1)}w
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">差额</p>
            <p className={`text-lg font-black ${variance > 0 ? 'text-rose-200' : 'text-emerald-200'}`}>
              {variance > 0 ? '+' : ''}{(variance / 10000).toFixed(1)}w
            </p>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <p className="text-xs text-white/60">状态</p>
            <p className="text-lg font-black">{currentBudget?.status || BudgetStatus.EXECUTING}</p>
          </div>
        </div>
      </div>

      {/* 预警提示 */}
      {status === '超预算' && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center gap-3">
          <AlertTriangle className="text-rose-500" size={24} />
          <div>
            <p className="font-bold text-rose-700">预算超支警告</p>
            <p className="text-sm text-rose-600">该活动已超预算 ¥{(variance / 10000).toFixed(1)}万，请及时调整或申请追加预算。</p>
          </div>
        </div>
      )}

      {status === '预警' && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="text-amber-500" size={24} />
          <div>
            <p className="font-bold text-amber-700">预算接近上限警告</p>
            <p className="text-sm text-amber-600">该活动执行率已达 {executionRate}%，剩余预算 ¥{((currentActivity.budget - currentActivity.actualSpend) / 10000).toFixed(1)}万，请控制支出。</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        {/* 预算结构拆分 */}
        <div className="col-span-2 bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <FileText size={18} className="text-indigo-500" /> 预算结构拆分
            </h3>
            <button
              onClick={() => onBudgetItemModalOpen(null)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
            >
              <Plus size={16} /> 新增明细
            </button>
          </div>

          {currentBudget && currentBudget.items.length > 0 ? (
            <div className="overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-left text-xs font-black text-slate-400 uppercase">类别</th>
                    <th className="pb-3 text-right text-xs font-black text-slate-400 uppercase">预算金额</th>
                    <th className="pb-3 text-right text-xs font-black text-slate-400 uppercase">实际金额</th>
                    <th className="pb-3 text-right text-xs font-black text-slate-400 uppercase">差值</th>
                    <th className="pb-3 text-center text-xs font-black text-slate-400 uppercase">状态</th>
                    <th className="pb-3 text-right text-xs font-black text-slate-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {currentBudget.items.map(item => (
                    <tr key={item.id} className={`group hover:bg-slate-50 ${item.status === '超预算' ? 'bg-rose-50/50' : ''}`}>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[item.category] }} />
                          <span className="font-bold text-slate-700">{item.category}</span>
                        </div>
                      </td>
                      <td className="py-4 text-right font-bold text-slate-600">
                        ¥{(item.plannedAmount / 10000).toFixed(1)}w
                      </td>
                      <td className="py-4 text-right font-black text-slate-800">
                        ¥{(item.actualAmount / 10000).toFixed(1)}w
                      </td>
                      <td className="py-4 text-right">
                        <span className={`font-bold ${(item.variance || 0) > 0 ? 'text-rose-600' : (item.variance || 0) < 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                          {(item.variance || 0) > 0 ? '+' : ''}{((item.variance || 0) / 10000).toFixed(1)}w
                        </span>
                      </td>
                      <td className="py-4 text-center">
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold ${item.status === '超预算' ? 'bg-rose-100 text-rose-700' :
                            item.status === '正常' ? 'bg-emerald-100 text-emerald-700' :
                              'bg-slate-100 text-slate-500'
                          }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => onBudgetItemModalOpen(item)}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <Edit size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50">
                  <tr>
                    <td className="py-4 font-black text-slate-700">合计</td>
                    <td className="py-4 text-right font-black text-slate-700">
                      ¥{(currentBudget.items.reduce((sum, i) => sum + i.plannedAmount, 0) / 10000).toFixed(1)}w
                    </td>
                    <td className="py-4 text-right font-black text-slate-800">
                      ¥{(currentBudget.items.reduce((sum, i) => sum + i.actualAmount, 0) / 10000).toFixed(1)}w
                    </td>
                    <td className="py-4 text-right font-black">
                      <span className={currentBudget.usedAmount && currentBudget.usedAmount > currentBudget.totalAmount ? 'text-rose-600' : 'text-emerald-600'}>
                        {currentBudget.usedAmount && currentBudget.usedAmount > currentBudget.totalAmount ? '+' : ''}
                        {(((currentBudget.usedAmount || 0) - currentBudget.totalAmount) / 10000).toFixed(1)}w
                      </span>
                    </td>
                    <td colSpan={2}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Receipt size={48} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-400 font-bold">暂无预算明细</p>
              <p className="text-slate-400 text-sm mt-1">点击"新增明细"开始添加</p>
            </div>
          )}
        </div>

        {/* 执行进度 */}
        <div className="bg-white rounded-xl p-6 border border-slate-100 flex flex-col items-center justify-center">
          <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
            <PieIcon size={18} className="text-emerald-500" /> 执行进度
          </h3>
          <div className="relative w-48 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[{ value: executionRate }, { value: Math.max(0, 100 - executionRate) }]}
                  innerRadius={70}
                  outerRadius={90}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={
                    status === '超预算' ? "#ef4444" :
                    status === '预警' ? "#f59e0b" : "#10b981"
                  } />
                  <Cell fill="#f1f5f9" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-4xl font-black ${
                status === '超预算' ? 'text-rose-600' :
                status === '预警' ? 'text-amber-600' : 'text-slate-800'
              }`}>
                {executionRate}%
              </span>
              <span className="text-xs text-slate-400 mt-1">执行率</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 w-full">
            <div className="bg-slate-50 rounded-xl p-3 text-center">
              <p className="text-xs text-slate-400">预算</p>
              <p className="font-black text-slate-700">¥{(currentActivity.budget / 10000).toFixed(0)}w</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${
              status === '超预算' ? 'bg-rose-50' :
              status === '预警' ? 'bg-amber-50' : 'bg-emerald-50'
            }`}>
              <p className="text-xs text-slate-400">实际</p>
              <p className={`font-black ${
                status === '超预算' ? 'text-rose-600' :
                status === '预警' ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                ¥{(currentActivity.actualSpend / 10000).toFixed(1)}w
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* AI分析 */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Sparkles size={18} className="text-purple-500" /> AI财务分析
          </h3>
          <button
            onClick={onRunAIAnalysis}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl text-sm font-bold hover:bg-purple-700 transition-all disabled:opacity-50"
          >
            <Sparkles size={16} /> {isAiLoading ? '分析中...' : '生成分析报告'}
          </button>
        </div>

        <div className="p-6 border-2 border-dashed border-slate-200 rounded-xl min-h-[120px] flex items-center justify-center">
          {aiInsight ? (
            <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{aiInsight}</div>
          ) : (
            <p className="text-slate-400 text-sm">点击"生成分析报告"获取AI财务建议</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetDetail;
