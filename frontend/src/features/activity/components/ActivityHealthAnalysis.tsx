/**
 * AI 活动健康度分析组件
 * 基于活动执行数据，动态分析活动健康状态并提供改进建议
 */
import React, { useState, useMemo } from 'react';
import {
  Sparkles, Activity, TrendingUp, AlertTriangle, CheckCircle2,
  DollarSign, Users, Package, Newspaper, Briefcase, Target,
  Lightbulb, RefreshCw, Info
} from 'lucide-react';
import { Card, Button } from '../../../shared';
import { ActivityTask, ExpenseItem, Supplier, Material, Opportunity, MediaStats } from '../../../utils/hooks';

interface ActivityHealthAnalysisProps {
  activityId: string;
  activityName: string;
  activityStatus: string;
  currentStage: string;
  tasks: ActivityTask[];
  expenses: ExpenseItem[];
  budget: number;
  suppliers: Supplier[];
  materials: Material[];
  opportunities: Opportunity[];
  mediaStats: MediaStats | null;
  leadsCount: number;
  onRefresh?: () => void;
}

// 评分维度权重
const SCORE_WEIGHTS = {
  execution: 0.25,      // 执行情况 25%
  budget: 0.20,         // 预算情况 20%
  resources: 0.15,      // 资源准备 15%
  business: 0.20,      // 商机线索 20%
  media: 0.10,         // 媒体传播 10%
  review: 0.10,        // 复盘反馈 10%
};

interface RiskItem {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  suggestion: string;
}

interface HealthScore {
  overall: number;
  execution: number;
  budget: number;
  resources: number;
  business: number;
  media: number;
  review: number;
  level: 'healthy' | 'warning' | 'danger';
}

interface AnalysisResult {
  score: HealthScore;
  risks: RiskItem[];
  effectiveness: 'excellent' | 'good' | 'average' | 'weak';
  suggestions: string[];
}

// 计算执行情况得分
function calculateExecutionScore(tasks: ActivityTask[], activityStatus: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  if (!tasks || tasks.length === 0) {
    return { score: 60, issues: ['暂无任务数据'] };
  }

  const completedTasks = tasks.filter(t => t.status === '已完成');
  const overdueTasks = tasks.filter(t => {
    if (t.status === '已完成') return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  });
  const p0p1Tasks = tasks.filter(t => t.priority === 'P0' || t.priority === 'P1');
  const unfinishedP0p1 = p0p1Tasks.filter(t => t.status !== '已完成');

  // 完成率扣分
  const completionRate = completedTasks.length / tasks.length;
  if (completionRate < 0.5) {
    score -= 30;
    issues.push(`任务完成率仅 ${(completionRate * 100).toFixed(0)}%`);
  } else if (completionRate < 0.8) {
    score -= 15;
  }

  // 延期任务扣分
  if (overdueTasks.length > 0) {
    score -= overdueTasks.length * 10;
    issues.push(`存在 ${overdueTasks.length} 项延期任务`);
  }

  // P0/P1 未完成扣分
  if (unfinishedP0p1.length > 0 && (activityStatus === '进行中' || activityStatus === '已完成')) {
    score -= unfinishedP0p1.length * 15;
    issues.push(`${unfinishedP0p1.length} 项 P0/P1 任务未完成`);
  }

  return { score: Math.max(0, score), issues };
}

// 计算预算情况得分
function calculateBudgetScore(budget: number, expenses: ExpenseItem[], activityStatus: string): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  if (!budget || budget <= 0) {
    return { score: 70, issues: ['预算未设置'] };
  }

  const totalSpent = (expenses || []).reduce((sum, e) => sum + (e.actualAmount || 0), 0);
  const executionRate = (totalSpent / budget) * 100;

  if (executionRate > 100) {
    score = 20;
    issues.push(`预算超支 ${(executionRate - 100).toFixed(1)}%`);
  } else if (executionRate > 90) {
    score = 50;
    issues.push('预算接近超支警戒线');
  } else if (executionRate > 75) {
    score = 75;
    issues.push('预算执行进度较快');
  }

  if (executionRate < 30 && activityStatus === '已完成') {
    score -= 20;
    issues.push('活动结束但预算使用率过低');
  }

  return { score: Math.max(0, score), issues };
}

// 计算资源准备得分
function calculateResourcesScore(suppliers: Supplier[], materials: Material[]): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 100;

  if ((!suppliers || suppliers.length === 0) && (!materials || materials.length === 0)) {
    return { score: 60, issues: ['暂无资源数据'] };
  }

  // 供应商评分
  if (suppliers && suppliers.length > 0) {
    const confirmedSuppliers = suppliers.filter(s => s.status === '已签约' || s.status === '已完成');
    const unconfirmedSuppliers = suppliers.filter(s => s.status !== '已签约' && s.status !== '已完成' && s.status !== '已拒绝');

    if (unconfirmedSuppliers.length > 0) {
      score -= 15;
      issues.push(`${unconfirmedSuppliers.length} 家供应商待确认`);
    }

    if (confirmedSuppliers.length === 0 && suppliers.length > 0) {
      score -= 20;
      issues.push('暂无已确认供应商');
    }
  }

  // 物料评分
  if (materials && materials.length > 0) {
    const lowStockMaterials = materials.filter(m =>
      m.status === 'Low Stock' || m.status === 'Out of Stock' ||
      (m.stock && m.stock < 5)
    );

    if (lowStockMaterials.length > 0) {
      score -= lowStockMaterials.length * 10;
      issues.push(`${lowStockMaterials.length} 项物料库存不足`);
    }
  }

  return { score: Math.max(0, score), issues };
}

// 计算商机线索得分
function calculateBusinessScore(opportunities: Opportunity[], leadsCount: number): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 70;

  if (!opportunities || opportunities.length === 0) {
    if (leadsCount > 0) {
      return { score: 75, issues: [] };
    }
    return { score: 50, issues: ['暂无商机线索数据'] };
  }

  const toSales = opportunities.filter(o => o.status === '已转销售');
  const converted = opportunities.filter(o => o.status === '已转化');
  const conversionRate = opportunities.length > 0 ? (converted.length / opportunities.length) * 100 : 0;

  // 转化率评分
  if (conversionRate >= 30) {
    score = 100;
  } else if (conversionRate >= 20) {
    score = 85;
  } else if (conversionRate >= 10) {
    score = 70;
  } else if (conversionRate > 0) {
    score = 55;
    issues.push(`转化率仅 ${conversionRate.toFixed(1)}%，偏低`);
  }

  if (opportunities.length >= 5 && toSales.length === 0 && converted.length === 0) {
    issues.push('商机数量充足但暂无转化结果');
  }

  if (converted.length > 0 && conversionRate >= 20) {
    issues.push(`已转化 ${converted.length} 个商机，成效良好`);
  }

  return { score: Math.max(0, score), issues };
}

// 计算媒体传播得分
function calculateMediaScore(mediaStats: MediaStats | null): { score: number; issues: string[] } {
  const issues: string[] = [];
  let score = 60;

  if (!mediaStats) {
    return { score: 50, issues: ['暂无媒体数据'] };
  }

  const { totalMediaCount, totalContentCount, totalViews, effectivenessScore } = mediaStats;

  // 媒体数量评分
  if (totalMediaCount === 0 && totalContentCount === 0) {
    return { score: 30, issues: ['暂无媒体传播记录'] };
  }

  // 基于有效性评分
  if (effectivenessScore >= 80) {
    score = 90;
  } else if (effectivenessScore >= 60) {
    score = 75;
  } else if (effectivenessScore >= 40) {
    score = 60;
  } else if (effectivenessScore > 0) {
    score = 45;
  }

  // 曝光量加分
  if (totalViews > 100000) {
    score = Math.min(100, score + 10);
    issues.push(`总曝光量 ${(totalViews / 10000).toFixed(1)}万，传播效果良好`);
  } else if (totalViews > 10000) {
    issues.push(`总曝光量 ${(totalViews / 1000).toFixed(1)}k`);
  }

  // 媒体合作加分
  if (totalMediaCount >= 5) {
    issues.push(`已建立 ${totalMediaCount} 个媒体合作关系`);
  }

  return { score: Math.max(0, score), issues };
}

// 计算复盘反馈得分
function calculateReviewScore(): { score: number; issues: string[] } {
  // 当前版本暂使用基础分，后续可接入真实复盘数据
  return { score: 70, issues: [] };
}

// 综合分析函数
function analyzeActivityHealth(props: Omit<ActivityHealthAnalysisProps, 'onRefresh'>): AnalysisResult {
  const execution = calculateExecutionScore(props.tasks, props.activityStatus);
  const budget = calculateBudgetScore(props.budget, props.expenses, props.activityStatus);
  const resources = calculateResourcesScore(props.suppliers, props.materials);
  const business = calculateBusinessScore(props.opportunities, props.leadsCount);
  const media = calculateMediaScore(props.mediaStats);
  const review = calculateReviewScore();

  // 加权总分
  const overall = Math.round(
    execution.score * SCORE_WEIGHTS.execution +
    budget.score * SCORE_WEIGHTS.budget +
    resources.score * SCORE_WEIGHTS.resources +
    business.score * SCORE_WEIGHTS.business +
    media.score * SCORE_WEIGHTS.media +
    review.score * SCORE_WEIGHTS.review
  );

  // 健康等级
  let level: 'healthy' | 'warning' | 'danger' = 'healthy';
  if (overall < 50) {
    level = 'danger';
  } else if (overall < 70) {
    level = 'warning';
  }

  // 收集所有风险
  const risks: RiskItem[] = [];

  execution.issues.forEach(issue => {
    risks.push({
      type: issue.includes('延期') || issue.includes('超支') ? 'error' : 'warning',
      category: '执行',
      message: issue,
      suggestion: issue.includes('延期')
        ? '建议优先处理延期任务，评估阻塞原因'
        : '建议加快任务执行进度，确保按期完成'
    });
  });

  budget.issues.forEach(issue => {
    risks.push({
      type: issue.includes('超支') ? 'error' : issue.includes('过快') ? 'warning' : 'info',
      category: '预算',
      message: issue,
      suggestion: issue.includes('超支')
        ? '建议立即审视支出，必要时调整后续计划或申请追加预算'
        : '建议持续监控预算执行情况'
    });
  });

  resources.issues.forEach(issue => {
    risks.push({
      type: 'warning',
      category: '资源',
      message: issue,
      suggestion: issue.includes('待确认')
        ? '建议尽快联系供应商确认合作细节'
        : '建议及时补充物料库存或调整物资配置'
    });
  });

  business.issues.forEach(issue => {
    risks.push({
      type: issue.includes('偏低') || issue.includes('暂无') ? 'warning' : 'info',
      category: '商机',
      message: issue,
      suggestion: issue.includes('偏低')
        ? '建议加强商机跟进，提高转化效率'
        : issue.includes('暂无')
        ? '建议积极拓展商机渠道'
        : '当前商机转化情况良好'
    });
  });

  media.issues.forEach(issue => {
    risks.push({
      type: issue.includes('暂无') ? 'warning' : 'info',
      category: '传播',
      message: issue,
      suggestion: issue.includes('暂无')
        ? '建议加强媒体合作，扩大活动传播覆盖面'
        : '当前媒体传播效果良好'
    });
  });

  // 成效判断
  let effectiveness: 'excellent' | 'good' | 'average' | 'weak' = 'average';
  if (overall >= 85) {
    effectiveness = 'excellent';
  } else if (overall >= 70) {
    effectiveness = 'good';
  } else if (overall >= 50) {
    effectiveness = 'average';
  } else {
    effectiveness = 'weak';
  }

  // 生成改进建议
  const suggestions: string[] = [];

  if (execution.score < 70) {
    suggestions.push('加快任务执行，优先处理延期和高优先级任务');
  }
  if (budget.score < 70) {
    suggestions.push('加强预算管控，定期跟踪支出进度');
  }
  if (resources.score < 70) {
    suggestions.push('尽快确认供应商合作关系，补充必要物料');
  }
  if (business.score < 70) {
    suggestions.push('加强商机线索跟进，提高转化率');
  }
  if (media.score < 70) {
    suggestions.push('扩大媒体合作渠道，提升活动曝光度');
  }
  if (overall >= 80) {
    suggestions.push('继续保持当前执行节奏，关注细节优化');
  } else if (suggestions.length === 0) {
    suggestions.push('各维度执行良好，可进一步提升细节把控');
  }

  return {
    score: {
      overall,
      execution: execution.score,
      budget: budget.score,
      resources: resources.score,
      business: business.score,
      media: media.score,
      review: review.score,
      level,
    },
    risks: risks.slice(0, 6), // 最多显示6条风险
    effectiveness,
    suggestions: suggestions.slice(0, 4), // 最多显示4条建议
  };
}

// 维度标签
const SCORE_LABELS = {
  execution: '执行情况',
  budget: '预算情况',
  resources: '资源准备',
  business: '商机线索',
  media: '媒体传播',
  review: '复盘反馈',
};

// 维度图标
const SCORE_ICONS = {
  execution: Target,
  budget: DollarSign,
  resources: Package,
  business: Briefcase,
  media: Newspaper,
  review: Activity,
};

export const ActivityHealthAnalysis: React.FC<ActivityHealthAnalysisProps> = (props) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<AnalysisResult | null>(null);

  // 初始分析
  const analysis = useMemo(() => {
    return analyzeActivityHealth(props);
  }, [
    props.activityId,
    props.tasks,
    props.expenses,
    props.budget,
    props.suppliers,
    props.materials,
    props.opportunities,
    props.mediaStats,
    props.leadsCount,
    props.activityStatus,
  ]);

  const handleRefresh = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setLastAnalysis(analyzeActivityHealth(props));
      props.onRefresh?.();
      setIsAnalyzing(false);
    }, 800);
  };

  const displayAnalysis = lastAnalysis || analysis;
  const { score, risks, effectiveness, suggestions } = displayAnalysis;

  // 健康度等级配置
  const levelConfig = {
    healthy: {
      label: '健康',
      color: 'emerald',
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      border: 'border-emerald-200',
      ring: 'ring-emerald-500',
    },
    warning: {
      label: '需关注',
      color: 'amber',
      bg: 'bg-amber-50',
      text: 'text-amber-600',
      border: 'border-amber-200',
      ring: 'ring-amber-500',
    },
    danger: {
      label: '高风险',
      color: 'rose',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
      border: 'border-rose-200',
      ring: 'ring-rose-500',
    },
  };

  const currentLevel = levelConfig[score.level];

  // 成效标签配置
  const effectivenessConfig = {
    excellent: { label: '优秀', color: 'emerald' },
    good: { label: '良好', color: 'blue' },
    average: { label: '一般', color: 'amber' },
    weak: { label: '较弱', color: 'rose' },
  };

  const effConfig = effectivenessConfig[effectiveness];

  return (
    <Card>
      {/* 头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">AI 活动健康度分析</h3>
            <p className="text-xs text-slate-400">基于实时数据分析</p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          icon={<RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />}
          onClick={handleRefresh}
          loading={isAnalyzing}
        >
          {isAnalyzing ? '分析中' : '重新分析'}
        </Button>
      </div>

      {/* 健康度总分 */}
      <div className={`p-4 rounded-xl ${currentLevel.bg} ${currentLevel.border} border mb-4`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${currentLevel.text} ${currentLevel.bg}`}>
              {currentLevel.label}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-bold ${
              effConfig.color === 'emerald' ? 'bg-emerald-100 text-emerald-600' :
              effConfig.color === 'blue' ? 'bg-blue-100 text-blue-600' :
              effConfig.color === 'amber' ? 'bg-amber-100 text-amber-600' :
              'bg-rose-100 text-rose-600'
            }`}>
              成效: {effConfig.label}
            </span>
          </div>
        </div>
        <div className="flex items-end gap-2">
          <span className={`text-4xl font-black ${currentLevel.text}`}>{score.overall}</span>
          <span className="text-lg text-slate-400 mb-1">分</span>
        </div>
        <div className="mt-2 h-2 bg-white/50 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              score.level === 'healthy' ? 'bg-emerald-500' :
              score.level === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
            }`}
            style={{ width: `${score.overall}%` }}
          />
        </div>
      </div>

      {/* 维度得分 */}
      <div className="space-y-2 mb-4">
        <p className="text-xs font-bold text-slate-400 uppercase">各维度得分</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(SCORE_LABELS) as Array<keyof typeof SCORE_LABELS>).map(key => {
            const Icon = SCORE_ICONS[key];
            const dimScore = score[key];
            return (
              <div key={key} className="flex items-center gap-2 p-2 bg-slate-50 rounded-lg">
                <Icon size={14} className="text-slate-400 shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 truncate">{SCORE_LABELS[key]}</span>
                    <span className={`text-sm font-bold ${
                      dimScore >= 70 ? 'text-emerald-600' : dimScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {dimScore}
                    </span>
                  </div>
                  <div className="mt-1 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        dimScore >= 70 ? 'bg-emerald-400' : dimScore >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${dimScore}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 风险预警 */}
      {risks.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">风险预警</p>
          <div className="space-y-2">
            {risks.map((risk, index) => (
              <div
                key={index}
                className={`p-2.5 rounded-lg border ${
                  risk.type === 'error'
                    ? 'bg-rose-50 border-rose-200'
                    : risk.type === 'warning'
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex items-start gap-2">
                  {risk.type === 'error' ? (
                    <AlertTriangle size={14} className="text-rose-500 mt-0.5 shrink-0" />
                  ) : risk.type === 'warning' ? (
                    <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                  ) : (
                    <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-slate-700">{risk.message}</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      <span className="text-slate-400">[{risk.category}]</span> {risk.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 改进建议 */}
      {suggestions.length > 0 && (
        <div>
          <p className="text-xs font-bold text-slate-400 uppercase mb-2">AI 改进建议</p>
          <div className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start gap-2 p-2.5 bg-indigo-50 rounded-lg">
                <Lightbulb size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                <p className="text-xs text-slate-700 leading-relaxed">{suggestion}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 数据不足提示 */}
      {(!props.tasks?.length && !props.expenses?.length) && (
        <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500">
            <Info size={14} />
            <p className="text-xs">数据不足，部分分析可能不准确。建议完善任务、预算等数据后再分析。</p>
          </div>
        </div>
      )}
    </Card>
  );
};
