/**
 * 外部市场活动详情页
 * 当 activity.type === "external" 时显示此页面
 * 外部活动价值管理页：为什么参加 → 怎么参与 → 获得什么 → 是否值得继续参加
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Activity, ExternalEventInfo, createDefaultExternalEventInfo,
  DriverType, ParticipationStrategy, ParticipationForm, GoalOption, PremiumResource,
  SelfAssessment, ValueAssessment, NextYearSuggestion
} from '@/types';
import { useActivitiesData, useLeadsData } from '@/utils/hooks';
import { useToast } from '@/shared/Toast';
import {
  Card, Button
} from '@/shared';
import {
  Calendar, MapPin, Edit2, Check, X, Loader2,
  ArrowLeft, Sparkles, FileText, UploadCloud, Download,
  Target, Users, Package, DollarSign, ClipboardCheck, TrendingUp,
  Link as LinkIcon, Star, AlertCircle, CheckCircle2, Zap,
  FileSearch, MessageSquare, Eye, ThumbsUp, ThumbsDown, Minus,
  ArrowRight, ChevronRight, Plus, Award
} from 'lucide-react';
// 复用自办活动的媒体传播模块
import { MediaTab } from '../../activity/detail/MediaTab';
// 复用自办活动的商机模块
import { OpportunityTabContent } from '../../activity/detail/OpportunityTabContent';
import { OpportunityModal } from '../../activity/modals/OpportunityModal';

// ============ 常量 ============

const TABS = [
  { id: 'decision', label: '参会决策', icon: Target, color: 'amber' },
  { id: 'execution', label: '参会执行', icon: Zap, color: 'blue' },
  { id: 'resources', label: '资源线索', icon: Users, color: 'emerald' },
  { id: 'media', label: '媒体传播', icon: Package, color: 'purple' },
  { id: 'cost', label: '费用记录', icon: DollarSign, color: 'rose' },
  { id: 'evaluation', label: '会后评估', icon: ClipboardCheck, color: 'indigo' },
];

const DRIVER_TYPES: DriverType[] = ['主动规划型', '客户驱动型', '领导推动型', '机会触发型', '被动承接型'];
const PARTICIPATION_STRATEGIES: ParticipationStrategy[] = ['重点投入', '标准参与', '低成本调研'];
const PARTICIPATION_FORMS: ParticipationForm[] = ['展位', '演讲', '展位+演讲', '普通参会', '其他'];
const GOAL_OPTIONS: GoalOption[] = ['客户拓展', '品牌曝光', '行业调研', '生态合作', '其他'];
const PREMIUM_RESOURCES: PremiumResource[] = ['深度对接机会', '媒体采访机会', '行业报告/白皮书', '参会名单', '合作伙伴资源', '奖项/标准/官方背书', '其他'];
const SELF_ASSESSMENTS: SelfAssessment[] = ['超预期', '基本达成', '未达预期'];
const VALUE_ASSESSMENTS: ValueAssessment[] = ['高价值', '中等价值', '低价值', '无效投入'];
const NEXT_YEAR_SUGGESTIONS: NextYearSuggestion[] = ['升级参与', '维持参与', '降级参与', '不再参与'];
const RESOURCE_OPTIONS = ['企业折页', '产品折页', '易拉宝', '展示设备', '定制物料', '其他'];

// ============ 主组件 ============

interface ExternalActivityDetailPageProps {
  activity: Activity;
}

const ExternalActivityDetailPage: React.FC<ExternalActivityDetailPageProps> = ({ activity }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { updateActivity } = useActivitiesData();

  // 商机线索数据 - 使用统一的商机线索 Hook
  const { leads, addLead } = useLeadsData();
  // 当前活动的商机线索
  const activityLeads = leads.filter(lead => lead.activityId === id);
  const [opportunityModalOpen, setOpportunityModalOpen] = useState(false);

  // 外部活动数据状态 - 初始化时使用 prop 的值
  const [externalInfo, setExternalInfo] = useState<ExternalEventInfo>(
    activity.externalEventInfo || createDefaultExternalEventInfo()
  );

  // 【关键修复】当父组件传入的 activity.externalEventInfo 变化时，同步本地 state
  useEffect(() => {
    if (activity.externalEventInfo) {
      setExternalInfo(activity.externalEventInfo);
    }
  }, [activity.externalEventInfo]);

  // 【修改】模块级编辑状态 - editingSection 控制哪个模块在编辑态
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('decision');
  const [isSaving, setIsSaving] = useState(false);

  // AI分析状态
  const [aiAnalysis, setAiAnalysis] = useState<{
    score: number;
    matchDegree: string;
    resourceGain: string;
    leadQuality: string;
    costReasonableness: string;
    mediaValue: string;
    followUpValue: string;
    riskWarning: string[];
    dataGaps: string[];
    nextYearSuggestion: string;
    continueInvestment: string;
  } | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);

  // 计算数据缺口
  const dataGaps = useMemo(() => {
    const gaps: string[] = [];
    if (!externalInfo.decision.goals.length) gaps.push('参会决策未完善');
    if (!externalInfo.decision.driverType) gaps.push('驱动方式未填写');
    if (!externalInfo.decision.participationStrategy) gaps.push('参会策略未填写');
    if (!externalInfo.execution.participationForm.length) gaps.push('参与形式未填写');
    if (!externalInfo.resources.leadsCount && !externalInfo.resources.premiumResources.length) gaps.push('暂无资源线索记录');
    if (!externalInfo.evaluation.selfAssessment) gaps.push('暂无会后评估');
    if (!externalInfo.oaLinks.applicationUrl) gaps.push('暂未关联OA申请单');
    if (!externalInfo.evaluation.conclusion) gaps.push('暂无复盘结论');
    return gaps;
  }, [externalInfo]);

  // 保存指定模块的外部活动信息
  const handleSaveSection = async (section: string) => {
    if (!id) return;
    setIsSaving(true);
    try {
      await updateActivity(parseInt(id), { externalEventInfo: externalInfo } as any);
      setEditingSection(null); // 保存成功后退出编辑态
      toast.success('保存成功');
    } catch {
      toast.error('保存失败');
    } finally {
      setIsSaving(false);
    }
  };

  // 新增商机线索
  const handleAddOpportunity = async (form: { name: string; contact: string; company: string; remark: string }) => {
    if (!id) return;
    await addLead({ ...form, activityId: id });
    setOpportunityModalOpen(false);
    toast.success('商机线索已添加');
  };

  // 取消编辑 - 放弃临时修改，恢复到保存状态
  const handleCancelEdit = () => {
    // 恢复到 activity.prop 的值
    if (activity.externalEventInfo) {
      setExternalInfo(activity.externalEventInfo);
    }
    setEditingSection(null);
  };

  // 生成AI分析
  const handleGenerateAI = async () => {
    setGeneratingAI(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const totalCost = externalInfo.cost.totalCost || 0;
      const leadsCount = externalInfo.resources.leadsCount || 0;
      const highValueLeads = externalInfo.resources.highValueLeadsCount || 0;
      const premiumResources = externalInfo.resources.premiumResources.length || 0;

      let score = 50;
      if (leadsCount > 0) score += Math.min(20, leadsCount * 2);
      if (highValueLeads > 0) score += highValueLeads * 5;
      if (premiumResources > 0) score += premiumResources * 5;
      if (externalInfo.evaluation.conclusion) score += 10;
      if (totalCost > 0 && leadsCount > 0) {
        const costPerLead = totalCost / leadsCount;
        if (costPerLead < 1000) score += 15;
        else if (costPerLead < 5000) score += 10;
        else if (costPerLead > 10000) score -= 10;
      }
      score = Math.min(100, Math.max(0, score));

      setAiAnalysis({
        score,
        matchDegree: externalInfo.execution.participationForm.length > 0 ? '匹配度良好' : '需补充参与形式',
        resourceGain: premiumResources > 0 ? `已获取${premiumResources}类溢价资源` : '暂无溢价资源记录',
        leadQuality: highValueLeads > 0 ? `高价值线索${highValueLeads}个` : '线索质量待评估',
        costReasonableness: totalCost > 0 && leadsCount > 0 ? `人均成本约${Math.round(totalCost / leadsCount)}元` : '成本数据不完整',
        mediaValue: '媒体合作待评估',
        followUpValue: externalInfo.evaluation.valueAssessment || '待评估',
        riskWarning: totalCost > activity.budget ? ['投入超出预算'] : [],
        dataGaps: dataGaps.slice(0, 3),
        nextYearSuggestion: externalInfo.evaluation.nextYearSuggestion || '待定',
        continueInvestment: score >= 70 ? '建议继续投入' : score >= 50 ? '可考虑维持参与' : '建议评估后决定',
      });
      toast.success('AI分析已生成');
    } catch {
      toast.error('AI分析生成失败');
    } finally {
      setGeneratingAI(false);
    }
  };

  // 更新外部信息字段
  const updateExternalInfo = useCallback((updates: Partial<ExternalEventInfo>) => {
    setExternalInfo(prev => ({ ...prev, ...updates }));
  }, []);

  // 计算总费用
  const totalCost = useMemo(() => {
    return externalInfo.cost.participationFee + externalInfo.cost.materialFee + externalInfo.cost.otherFee;
  }, [externalInfo]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 0 }).format(amount);
  };

  // 判断是否有数据
  const hasDecisionData = externalInfo.decision.goals.length > 0 || externalInfo.decision.driverType || externalInfo.decision.participationStrategy;
  const hasExecutionData = externalInfo.execution.participationForm.length > 0 || externalInfo.execution.attendees.length > 0;
  const hasResourcesData = externalInfo.resources.leadsCount > 0 || externalInfo.resources.premiumResources.length > 0;
  const hasEvaluationData = externalInfo.evaluation.selfAssessment || externalInfo.evaluation.conclusion;

  return (
    <div className="space-y-4">
      {/* 返回 */}
      <button onClick={() => navigate(`/activities?year=${activity.year}`)} className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> 返回活动列表
      </button>

      {/* ========== 1. 顶部概览卡 ========== */}
      <div className={`rounded-xl p-6 text-white ${
        activity.status === '已完成' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' :
        activity.status === '进行中' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
        'bg-gradient-to-r from-purple-500 to-purple-600'
      }`}>
        <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-xl text-xs font-bold">{activity.status}</span>
              <span className="px-3 py-1 bg-white/10 rounded-xl text-xs font-bold">外部市场活动</span>
              {externalInfo.decision.driverType && (
                <span className="px-3 py-1 bg-amber-400/30 rounded-xl text-xs font-bold">{externalInfo.decision.driverType}</span>
              )}
              {externalInfo.decision.participationStrategy && (
                <span className="px-3 py-1 bg-emerald-400/30 rounded-xl text-xs font-bold">{externalInfo.decision.participationStrategy}</span>
              )}
            </div>
            <h1 className="text-2xl font-black mb-2">{activity.name || '未命名活动'}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80 flex-wrap">
              <span className="flex items-center gap-1"><Calendar size={14} /> {activity.date || '-'}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {activity.location || '-'}</span>
              {activity.industry && <span className="flex items-center gap-1"><Star size={14} /> {activity.industry}</span>}
            </div>
          </div>
          {/* 【修改】顶部基础信息区预留编辑按钮 */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setEditingSection('basic')}
            className="bg-white/20 text-white border-white/30 hover:bg-white/30"
          >
            <Edit2 size={14} /> 编辑基础信息
          </Button>
        </div>

        {/* 核心指标卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <OverviewCard label="参会目标" value={externalInfo.decision.goals.length > 0 ? `${externalInfo.decision.goals.length}项` : '待补充'} icon={Target} />
          <OverviewCard label="参会策略" value={externalInfo.decision.participationStrategy || '待补充'} icon={TrendingUp} />
          <OverviewCard label="获取线索" value={`${externalInfo.resources.leadsCount}个`} icon={Users} highlight={externalInfo.resources.leadsCount > 0} />
          <OverviewCard label="高价值线索" value={`${externalInfo.resources.highValueLeadsCount}个`} icon={Star} highlight={externalInfo.resources.highValueLeadsCount > 0} />
          <OverviewCard label="总支出" value={totalCost > 0 ? formatCurrency(totalCost) : '待补充'} icon={DollarSign} warning={totalCost > activity.budget} />
          <OverviewCard label="价值评估" value={externalInfo.evaluation.valueAssessment || '待评估'} icon={ClipboardCheck} />
        </div>
      </div>

      {/* ========== 2. 下方布局 ========== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* 左侧 Tab 区 */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tab 导航 */}
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
            <div className="flex border-b border-slate-100 overflow-x-auto">
              {TABS.map(tab => {
                const hasData = tab.id === 'decision' ? hasDecisionData :
                               tab.id === 'execution' ? hasExecutionData :
                               tab.id === 'resources' ? hasResourcesData :
                               tab.id === 'evaluation' ? hasEvaluationData : true;
                return (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? `text-${tab.color}-600 border-${tab.color}-600 bg-${tab.color}-50/50`
                        : 'text-slate-400 border-transparent hover:text-slate-600'
                    }`}>
                    <tab.icon size={14} />
                    {tab.label}
                    {hasData && activeTab !== tab.id && (
                      <span className={`w-2 h-2 rounded-full bg-${tab.color}-500`} />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="p-5">
              {activeTab === 'decision' && (
                <DecisionTab
                  externalInfo={externalInfo}
                  editingSection={editingSection}
                  onUpdate={updateExternalInfo}
                  onEdit={() => setEditingSection('decision')}
                  onSave={() => handleSaveSection('decision')}
                  onCancel={handleCancelEdit}
                  isSaving={isSaving}
                />
              )}
              {activeTab === 'execution' && (
                <ExecutionTab
                  externalInfo={externalInfo}
                  editingSection={editingSection}
                  onUpdate={updateExternalInfo}
                  onEdit={() => setEditingSection('execution')}
                  onSave={() => handleSaveSection('execution')}
                  onCancel={handleCancelEdit}
                  isSaving={isSaving}
                />
              )}
              {activeTab === 'resources' && (
                <ResourcesTab
                  externalInfo={externalInfo}
                  editingSection={editingSection}
                  onUpdate={updateExternalInfo}
                  onEdit={() => setEditingSection('resources')}
                  onSave={() => handleSaveSection('resources')}
                  onCancel={handleCancelEdit}
                  isSaving={isSaving}
                  opportunities={activityLeads}
                  onAddOpportunity={handleAddOpportunity}
                  onOpenOpportunity={() => setOpportunityModalOpen(true)}
                />
              )}
              {activeTab === 'media' && <MediaTab activityId={id || ''} />}
              {activeTab === 'cost' && (
                <CostTab
                  externalInfo={externalInfo}
                  editingSection={editingSection}
                  onUpdate={updateExternalInfo}
                  onEdit={() => setEditingSection('cost')}
                  onSave={() => handleSaveSection('cost')}
                  onCancel={handleCancelEdit}
                  isSaving={isSaving}
                  budget={activity.budget}
                />
              )}
              {activeTab === 'evaluation' && (
                <EvaluationTab
                  externalInfo={externalInfo}
                  editingSection={editingSection}
                  onUpdate={updateExternalInfo}
                  onEdit={() => setEditingSection('evaluation')}
                  onSave={() => handleSaveSection('evaluation')}
                  onCancel={handleCancelEdit}
                  isSaving={isSaving}
                />
              )}
            </div>
          </div>
        </div>

        {/* 右侧面板 */}
        <div className="space-y-4">
          {/* 活动资料 */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-indigo-500 shadow-sm">
                <FileText size={18} />
              </div>
              <h3 className="font-bold text-slate-800">活动资料</h3>
            </div>
            <div className="p-4">
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-purple-400 transition-colors cursor-pointer">
                <UploadCloud size={28} className="mx-auto mb-2 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">点击上传文件</p>
                <p className="text-xs text-slate-400 mt-1">支持 PDF、Word、图片等</p>
              </div>
            </div>
          </Card>

          {/* OA表单关联 */}
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 p-4 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-blue-500 shadow-sm">
                <LinkIcon size={18} />
              </div>
              <h3 className="font-bold text-slate-800">OA表单关联</h3>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <FileSearch size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-600">参会申请单</span>
                </div>
                {externalInfo.oaLinks.applicationUrl ? (
                  <a href={externalInfo.oaLinks.applicationUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    查看 <ChevronRight size={14} />
                  </a>
                ) : (
                  <span className="text-sm text-slate-400">未关联</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <MessageSquare size={16} className="text-slate-400" />
                  <span className="text-sm text-slate-600">会后反馈单</span>
                </div>
                {externalInfo.oaLinks.feedbackUrl ? (
                  <a href={externalInfo.oaLinks.feedbackUrl} target="_blank" rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                    查看 <ChevronRight size={14} />
                  </a>
                ) : (
                  <span className="text-sm text-slate-400">未关联</span>
                )}
              </div>
              {editingSection === 'oaLinks' && (
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <input
                    type="url"
                    value={externalInfo.oaLinks.applicationUrl}
                    onChange={(e) => updateExternalInfo({ oaLinks: { ...externalInfo.oaLinks, applicationUrl: e.target.value } })}
                    placeholder="粘贴OA申请单链接"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                  <input
                    type="url"
                    value={externalInfo.oaLinks.feedbackUrl}
                    onChange={(e) => updateExternalInfo({ oaLinks: { ...externalInfo.oaLinks, feedbackUrl: e.target.value } })}
                    placeholder="粘贴OA反馈单链接"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              )}
            </div>
          </Card>

          {/* AI外部活动价值分析 */}
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-amber-500 shadow-sm">
                  <Sparkles size={18} />
                </div>
                <h3 className="font-bold text-slate-800">AI价值分析</h3>
              </div>
              <Button size="sm" variant="outline" icon={<Sparkles size={14} />} onClick={handleGenerateAI} disabled={generatingAI}>
                {generatingAI ? <Loader2 size={14} className="animate-spin" /> : '生成'}
              </Button>
            </div>
            <div className="p-4 space-y-4">
              {/* 数据缺口提示 */}
              {dataGaps.length > 0 && !aiAnalysis && (
                <div className="p-3 bg-amber-50 rounded-xl">
                  <p className="text-xs font-bold text-amber-600 mb-2 flex items-center gap-1">
                    <AlertCircle size={12} /> 数据缺口提示
                  </p>
                  <ul className="space-y-1">
                    {dataGaps.slice(0, 4).map((gap, i) => (
                      <li key={i} className="text-xs text-amber-700 flex items-start gap-1">
                        <ArrowRight size={10} className="mt-0.5 shrink-0" /> {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {aiAnalysis ? (
                <div className="space-y-4">
                  {/* 综合评分 */}
                  <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                    <p className="text-xs text-slate-500 uppercase">综合价值评分</p>
                    <p className={`text-4xl font-black mt-1 ${
                      aiAnalysis.score >= 70 ? 'text-emerald-600' :
                      aiAnalysis.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>{aiAnalysis.score}</p>
                    <p className="text-xs text-slate-400">满分100分</p>
                  </div>

                  {/* 分析维度 */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500">会议匹配度</span>
                      <span className="font-medium text-slate-700">{aiAnalysis.matchDegree}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500">资源获取</span>
                      <span className="font-medium text-slate-700">{aiAnalysis.resourceGain}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500">线索质量</span>
                      <span className="font-medium text-slate-700">{aiAnalysis.leadQuality}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm p-2 bg-slate-50 rounded-lg">
                      <span className="text-slate-500">投入合理性</span>
                      <span className="font-medium text-slate-700">{aiAnalysis.costReasonableness}</span>
                    </div>
                  </div>

                  {/* 风险预警 */}
                  {aiAnalysis.riskWarning.length > 0 && (
                    <div className="p-3 bg-rose-50 rounded-xl">
                      <p className="text-xs font-bold text-rose-600 mb-2 flex items-center gap-1">
                        <AlertCircle size={12} /> 风险预警
                      </p>
                      <ul className="space-y-1">
                        {aiAnalysis.riskWarning.map((warning, i) => (
                          <li key={i} className="text-xs text-rose-700">{warning}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 建议 */}
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <p className="text-xs font-bold text-purple-600 mb-2">💡 参与建议</p>
                    <p className="text-sm text-purple-700">
                      {aiAnalysis.continueInvestment}
                    </p>
                    {aiAnalysis.nextYearSuggestion !== '待定' && (
                      <p className="text-xs text-purple-600 mt-1">明年建议：{aiAnalysis.nextYearSuggestion}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sparkles size={32} className="mx-auto mb-2 text-slate-300" />
                  <p className="text-sm text-slate-400">完善数据后生成AI分析</p>
                  <p className="text-xs text-slate-400 mt-1">数据越完整，分析越准确</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* 商机线索弹窗 */}
      {opportunityModalOpen && (
        <OpportunityModal
          onClose={() => setOpportunityModalOpen(false)}
          onSave={handleAddOpportunity}
        />
      )}
    </div>
  );
};

// ============ 概览卡片组件 ============

const OverviewCard: React.FC<{
  label: string;
  value: string;
  icon: React.ElementType;
  highlight?: boolean;
  warning?: boolean;
}> = ({ label, value, icon: Icon, highlight, warning }) => (
  <div className={`p-3 rounded-xl backdrop-blur-sm ${
    warning ? 'bg-rose-500/20' : highlight ? 'bg-white/10' : 'bg-white/10'
  }`}>
    <div className="flex items-center gap-1.5 mb-1">
      <Icon size={12} className={warning ? 'text-rose-300' : highlight ? 'text-white/80' : 'text-white/60'} />
      <span className={`text-[10px] ${warning ? 'text-rose-200' : highlight ? 'text-white/80' : 'text-white/60'}`}>{label}</span>
    </div>
    <p className={`text-sm font-bold truncate ${warning ? 'text-rose-200' : 'text-white'}`}>{value}</p>
  </div>
);

// ============ Tab 组件 ============

interface TabProps {
  externalInfo: ExternalEventInfo;
  editingSection: string | null;
  onUpdate: (updates: Partial<ExternalEventInfo>) => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
  isSaving: boolean;
}

// ============ 参会决策 Tab ============
const DecisionTab: React.FC<TabProps> = ({ externalInfo, editingSection, onUpdate, onEdit, onSave, onCancel, isSaving }) => {
  const isEditing = editingSection === 'decision';
  const toggleGoal = (goal: GoalOption) => {
    const goals = externalInfo.decision.goals.includes(goal)
      ? externalInfo.decision.goals.filter(g => g !== goal)
      : [...externalInfo.decision.goals, goal];
    onUpdate({ decision: { ...externalInfo.decision, goals } });
  };

  // 紧凑展示态
  if (!isEditing) {
    return (
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Target size={16} className="text-amber-500" />
            <span className="font-bold text-slate-800">参会决策</span>
          </div>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 size={12} /> 编辑
          </Button>
        </div>
        <div className="p-4 space-y-3">
          {/* 参会目标 */}
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">参会目标</span>
            <div className="flex flex-wrap gap-1">
              {externalInfo.decision.goals.length > 0 ? (
                externalInfo.decision.goals.map(goal => (
                  <span key={goal} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium">
                    {goal}
                  </span>
                ))
              ) : (
                <span className="text-sm text-amber-400">待补充</span>
              )}
            </div>
          </div>
          {/* 驱动方式 */}
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">驱动方式</span>
            {externalInfo.decision.driverType ? (
              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">
                {externalInfo.decision.driverType}
              </span>
            ) : (
              <span className="text-sm text-blue-400">待补充</span>
            )}
          </div>
          {/* 参会策略 */}
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">参会策略</span>
            {externalInfo.decision.participationStrategy ? (
              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                {externalInfo.decision.participationStrategy}
              </span>
            ) : (
              <span className="text-sm text-emerald-400">待补充</span>
            )}
          </div>
          {/* 决策说明 */}
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">决策说明</span>
            <span className="text-sm text-slate-600 flex-1">
              {externalInfo.decision.decisionNote || <span className="text-slate-400">待补充</span>}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 编辑态
  return (
    <div className="bg-white rounded-xl border border-amber-200 p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-amber-500" />
          <span className="font-bold text-slate-800">编辑参会决策</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}>
            <X size={12} /> 取消
          </Button>
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} 保存
          </Button>
        </div>
      </div>

      {/* 参会目标 */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">参会目标</label>
        <div className="flex flex-wrap gap-2">
          {GOAL_OPTIONS.map(goal => (
            <button
              key={goal}
              onClick={() => toggleGoal(goal)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                externalInfo.decision.goals.includes(goal)
                  ? 'bg-amber-100 text-amber-700 border border-amber-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-amber-300'
              }`}
            >
              {externalInfo.decision.goals.includes(goal) && <Check size={12} className="inline mr-1" />}
              {goal}
            </button>
          ))}
        </div>
      </div>

      {/* 驱动方式 */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">驱动方式</label>
        <div className="flex flex-wrap gap-2">
          {DRIVER_TYPES.map(type => (
            <button
              key={type}
              onClick={() => onUpdate({ decision: { ...externalInfo.decision, driverType: type } })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                externalInfo.decision.driverType === type
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-blue-300'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* 参会策略 */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">参会策略</label>
        <div className="flex flex-wrap gap-2">
          {PARTICIPATION_STRATEGIES.map(strategy => (
            <button
              key={strategy}
              onClick={() => onUpdate({ decision: { ...externalInfo.decision, participationStrategy: strategy } })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                externalInfo.decision.participationStrategy === strategy
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200 hover:border-emerald-300'
              }`}
            >
              {strategy}
            </button>
          ))}
        </div>
      </div>

      {/* 决策说明 */}
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">决策说明</label>
        <textarea
          value={externalInfo.decision.decisionNote}
          onChange={(e) => onUpdate({ decision: { ...externalInfo.decision, decisionNote: e.target.value } })}
          placeholder="说明为什么参加这个活动..."
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none"
          rows={3}
        />
      </div>
    </div>
  );
};

// ============ 参会执行 Tab ============
const ExecutionTab: React.FC<TabProps> = ({ externalInfo, editingSection, onUpdate, onEdit, onSave, onCancel, isSaving }) => {
  const isEditing = editingSection === 'execution';
  const toggleForm = (form: ParticipationForm) => {
    const forms = externalInfo.execution.participationForm.includes(form)
      ? externalInfo.execution.participationForm.filter(f => f !== form)
      : [...externalInfo.execution.participationForm, form];
    onUpdate({ execution: { ...externalInfo.execution, participationForm: forms } });
  };
  const toggleResource = (resource: string) => {
    const resources = externalInfo.execution.resourceSupport.includes(resource)
      ? externalInfo.execution.resourceSupport.filter(r => r !== resource)
      : [...externalInfo.execution.resourceSupport, resource];
    onUpdate({ execution: { ...externalInfo.execution, resourceSupport: resources } });
  };

  // 紧凑展示态
  if (!isEditing) {
    return (
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-blue-500" />
            <span className="font-bold text-slate-800">参会执行</span>
          </div>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 size={12} /> 编辑
          </Button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">参与形式</span>
            <div className="flex flex-wrap gap-1">
              {externalInfo.execution.participationForm.length > 0 ? (
                externalInfo.execution.participationForm.map(form => (
                  <span key={form} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs font-medium">{form}</span>
                ))
              ) : (
                <span className="text-sm text-blue-400">待补充</span>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">参会人员</span>
            <div className="flex flex-wrap gap-1">
              {externalInfo.execution.attendees.length > 0 ? (
                externalInfo.execution.attendees.map((name, i) => (
                  <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded text-xs">{name}</span>
                ))
              ) : (
                <span className="text-sm text-purple-400">待补充</span>
              )}
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">展示内容</span>
            <span className="text-sm text-slate-600 flex-1">
              {externalInfo.execution.displayContent || <span className="text-slate-400">待补充</span>}
            </span>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">资源支撑</span>
            <div className="flex flex-wrap gap-1">
              {externalInfo.execution.resourceSupport.length > 0 ? (
                externalInfo.execution.resourceSupport.map(r => (
                  <span key={r} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">{r}</span>
                ))
              ) : (
                <span className="text-sm text-emerald-400">待补充</span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 编辑态
  return (
    <div className="bg-white rounded-xl border border-blue-200 p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Zap size={16} className="text-blue-500" />
          <span className="font-bold text-slate-800">编辑参会执行</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}><X size={12} /> 取消</Button>
          <Button size="sm" onClick={onSave} disabled={isSaving}>{isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} 保存</Button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">参与形式</label>
        <div className="flex flex-wrap gap-2">
          {PARTICIPATION_FORMS.map(form => (
            <button key={form} onClick={() => toggleForm(form)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${externalInfo.execution.participationForm.includes(form) ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              {form}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">参会人员</label>
        <input type="text" value={externalInfo.execution.attendees.join('、')}
          onChange={(e) => onUpdate({ execution: { ...externalInfo.execution, attendees: e.target.value.split('、').filter(Boolean) } })}
          placeholder="输入参会人员姓名，多人以顿号分隔" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">展示内容</label>
        <textarea value={externalInfo.execution.displayContent}
          onChange={(e) => onUpdate({ execution: { ...externalInfo.execution, displayContent: e.target.value } })}
          placeholder="描述参展展示的内容..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none" rows={2} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">资源支撑</label>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_OPTIONS.map(resource => (
            <button key={resource} onClick={() => toggleResource(resource)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${externalInfo.execution.resourceSupport.includes(resource) ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              {resource}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============ 资源线索 Tab ============
interface ResourcesTabProps extends TabProps {
  opportunities: { id: string; name: string; contact: string; company: string; remark: string; status: string; createdAt: string }[];
  onAddOpportunity: (form: { name: string; contact: string; company: string; remark: string }) => Promise<void>;
  onOpenOpportunity: () => void;
}

const ResourcesTab: React.FC<ResourcesTabProps> = ({ externalInfo, editingSection, onUpdate, onEdit, onSave, onCancel, isSaving, opportunities, onAddOpportunity, onOpenOpportunity }) => {
  const isEditing = editingSection === 'resources';
  const togglePremiumResource = (resource: PremiumResource) => {
    const resources = externalInfo.resources.premiumResources.includes(resource)
      ? externalInfo.resources.premiumResources.filter(r => r !== resource)
      : [...externalInfo.resources.premiumResources, resource];
    onUpdate({ resources: { ...externalInfo.resources, premiumResources: resources } });
  };
  const updateNumberField = (field: keyof ExternalEventInfo['resources'], value: number) => {
    onUpdate({ resources: { ...externalInfo.resources, [field]: value } });
  };

  // 紧凑展示态
  if (!isEditing) {
    return (
      <div className="space-y-4">
        {/* 商机线索子区块 */}
        <OpportunityTabContent
          opportunities={opportunities}
          onAdd={() => onOpenOpportunity()}
          onOpen={() => onOpenOpportunity()}
        />
        {/* 外部活动专属资源 */}
        <div className="bg-white rounded-xl border border-slate-100">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Star size={14} className="text-amber-500" />
              <span className="font-bold text-slate-700 text-sm">活动专属资源</span>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {/* 线索数字 */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: '获取线索', value: externalInfo.resources.leadsCount, color: 'slate' },
                { label: '高价值', value: externalInfo.resources.highValueLeadsCount, color: 'emerald' },
                { label: '已转销售', value: externalInfo.resources.transferredLeadsCount, color: 'blue' },
                { label: '已转化', value: externalInfo.resources.convertedLeadsCount, color: 'purple' },
              ].map((item, i) => (
                <div key={i} className={`text-center p-3 bg-${item.color}-50 rounded-xl`}>
                  <p className={`text-2xl font-black text-${item.color}-600`}>{item.value}</p>
                  <p className={`text-xs text-${item.color}-600 mt-1`}>{item.label}</p>
                </div>
              ))}
            </div>
            {/* 溢价资源 */}
            <div className="flex items-start gap-3">
              <span className="text-sm text-slate-500 w-20 shrink-0">溢价资源</span>
              <div className="flex flex-wrap gap-1">
                {externalInfo.resources.premiumResources.length > 0 ? (
                  externalInfo.resources.premiumResources.map(r => (
                    <span key={r} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded text-xs font-medium flex items-center gap-1">
                      <Star size={10} /> {r}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-amber-400">待补充</span>
                )}
              </div>
            </div>
            {/* 竞品/行业观察 */}
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <span className="text-sm text-slate-500 w-20 shrink-0">竞品观察</span>
                <span className="text-sm text-slate-600 flex-1">
                  {externalInfo.resources.competitorObservation || <span className="text-slate-400">待补充</span>}
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-sm text-slate-500 w-20 shrink-0">行业观察</span>
                <span className="text-sm text-slate-600 flex-1">
                  {externalInfo.resources.industryObservation || <span className="text-slate-400">待补充</span>}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 编辑态
  return (
    <div className="space-y-4">
      {/* 商机线索子区块（仅展示，编辑在弹窗） */}
      <OpportunityTabContent
        opportunities={opportunities}
        onAdd={() => onOpenOpportunity()}
        onOpen={() => onOpenOpportunity()}
      />
      {/* 外部活动专属资源编辑 */}
      <div className="bg-white rounded-xl border border-emerald-200 p-4 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star size={14} className="text-amber-500" />
            <span className="font-bold text-slate-700 text-sm">活动专属资源</span>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}><X size={12} /> 取消</Button>
            <Button size="sm" onClick={onSave} disabled={isSaving}>{isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} 保存</Button>
          </div>
        </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">线索结果</label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: '获取线索', field: 'leadsCount' as const, color: 'slate' },
            { label: '高价值', field: 'highValueLeadsCount' as const, color: 'emerald' },
            { label: '已转销售', field: 'transferredLeadsCount' as const, color: 'blue' },
            { label: '已转化', field: 'convertedLeadsCount' as const, color: 'purple' },
          ].map((item) => (
            <div key={item.field} className={`text-center p-3 bg-${item.color}-50 rounded-xl`}>
              <p className={`text-2xl font-black text-${item.color}-600`}>{externalInfo.resources[item.field]}</p>
              <input type="number" value={externalInfo.resources[item.field]}
                onChange={(e) => updateNumberField(item.field, parseInt(e.target.value) || 0)}
                className={`w-16 mt-1 px-2 py-1 border border-${item.color}-200 rounded text-xs text-center`} min="0" />
            </div>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">溢价资源</label>
        <div className="flex flex-wrap gap-2">
          {PREMIUM_RESOURCES.map(resource => (
            <button key={resource} onClick={() => togglePremiumResource(resource)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${externalInfo.resources.premiumResources.includes(resource) ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              {resource}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">竞品参与情况</label>
        <textarea value={externalInfo.resources.competitorObservation}
          onChange={(e) => onUpdate({ resources: { ...externalInfo.resources, competitorObservation: e.target.value } })}
          placeholder="记录观察到的主要竞品动态..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={2} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">行业趋势观察</label>
        <textarea value={externalInfo.resources.industryObservation}
          onChange={(e) => onUpdate({ resources: { ...externalInfo.resources, industryObservation: e.target.value } })}
          placeholder="记录行业趋势、新兴技术或市场变化..." className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={2} />
      </div>
      </div>
    </div>
  );
};

// ============ 费用记录 Tab ============
const CostTab: React.FC<TabProps & { budget: number }> = ({ externalInfo, editingSection, onUpdate, onEdit, onSave, onCancel, isSaving, budget }) => {
  const isEditing = editingSection === 'cost';
  const totalCost = externalInfo.cost.participationFee + externalInfo.cost.materialFee + externalInfo.cost.otherFee;
  const overBudget = totalCost > budget;
  const updateCostField = (field: 'participationFee' | 'materialFee' | 'otherFee', value: number) => {
    onUpdate({ cost: { ...externalInfo.cost, [field]: value } });
  };

  // 紧凑展示态
  if (!isEditing) {
    return (
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <DollarSign size={16} className="text-rose-500" />
            <span className="font-bold text-slate-800">费用记录</span>
          </div>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 size={12} /> 编辑
          </Button>
        </div>
        <div className="p-4 space-y-3">
          {[
            { label: '参会费用', value: externalInfo.cost.participationFee, note: '展位费、报名费' },
            { label: '物料费用', value: externalInfo.cost.materialFee, note: '宣传物料、礼品' },
            { label: '其他费用', value: externalInfo.cost.otherFee, note: '差旅、餐饮' },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <span className="text-sm text-slate-600">{item.label}</span>
                <p className="text-xs text-slate-400">{item.note}</p>
              </div>
              <span className="font-bold text-slate-800">{item.value.toLocaleString()} 元</span>
            </div>
          ))}
          <div className={`p-3 rounded-xl text-center font-bold ${overBudget ? 'bg-rose-100 text-rose-600' : totalCost > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
            总计：{totalCost.toLocaleString()} 元 {overBudget && `（超预算 ${((totalCost - budget) / 10000).toFixed(2)} 万元）`}
          </div>
        </div>
      </div>
    );
  }

  // 编辑态
  return (
    <div className="bg-white rounded-xl border border-rose-200 p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <DollarSign size={16} className="text-rose-500" />
          <span className="font-bold text-slate-800">编辑费用记录</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}><X size={12} /> 取消</Button>
          <Button size="sm" onClick={onSave} disabled={isSaving}>{isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} 保存</Button>
        </div>
      </div>
      {[
        { label: '参会费用（展位费、报名费）', field: 'participationFee' as const },
        { label: '物料费用（宣传物料、礼品）', field: 'materialFee' as const },
        { label: '其他费用（差旅、餐饮）', field: 'otherFee' as const },
      ].map((item) => (
        <div key={item.field} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-600">{item.label}</span>
          <input type="number" value={externalInfo.cost[item.field]}
            onChange={(e) => updateCostField(item.field, parseFloat(e.target.value) || 0)}
            className="w-32 px-3 py-1 border border-slate-200 rounded-lg text-sm text-right" min="0" />
        </div>
      ))}
    </div>
  );
};

// ============ 会后评估 Tab ============
const EvaluationTab: React.FC<TabProps> = ({ externalInfo, editingSection, onUpdate, onEdit, onSave, onCancel, isSaving }) => {
  const isEditing = editingSection === 'evaluation';

  const renderTag = (value: string, color: string) => (
    <span className={`px-2 py-0.5 bg-${color}-50 text-${color}-700 rounded text-xs font-medium`}>{value}</span>
  );

  // 紧凑展示态
  if (!isEditing) {
    return (
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={16} className="text-indigo-500" />
            <span className="font-bold text-slate-800">会后评估</span>
          </div>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Edit2 size={12} /> 编辑
          </Button>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">效果自评</span>
            {externalInfo.evaluation.selfAssessment ? (
              renderTag(externalInfo.evaluation.selfAssessment, externalInfo.evaluation.selfAssessment === '超预期' ? 'emerald' : externalInfo.evaluation.selfAssessment === '基本达成' ? 'blue' : 'rose')
            ) : (
              <span className="text-sm text-indigo-400">待补充</span>
            )}
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">价值评估</span>
            {externalInfo.evaluation.valueAssessment ? (
              renderTag(externalInfo.evaluation.valueAssessment, externalInfo.evaluation.valueAssessment === '高价值' ? 'amber' : externalInfo.evaluation.valueAssessment === '中等价值' ? 'blue' : 'slate')
            ) : (
              <span className="text-sm text-amber-400">待补充</span>
            )}
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">明年建议</span>
            {externalInfo.evaluation.nextYearSuggestion ? (
              renderTag(externalInfo.evaluation.nextYearSuggestion, externalInfo.evaluation.nextYearSuggestion === '升级参与' ? 'purple' : externalInfo.evaluation.nextYearSuggestion === '维持参与' ? 'blue' : externalInfo.evaluation.nextYearSuggestion === '降级参与' ? 'amber' : 'slate')
            ) : (
              <span className="text-sm text-purple-400">待补充</span>
            )}
          </div>
          <div className="flex items-start gap-3">
            <span className="text-sm text-slate-500 w-20 shrink-0">复盘结论</span>
            <span className="text-sm text-slate-600 flex-1">
              {externalInfo.evaluation.conclusion || <span className="text-slate-400">待补充</span>}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 编辑态
  return (
    <div className="bg-white rounded-xl border border-indigo-200 p-4 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <ClipboardCheck size={16} className="text-indigo-500" />
          <span className="font-bold text-slate-800">编辑会后评估</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onCancel} disabled={isSaving}><X size={12} /> 取消</Button>
          <Button size="sm" onClick={onSave} disabled={isSaving}>{isSaving ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} 保存</Button>
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">效果自评</label>
        <div className="flex gap-2">
          {SELF_ASSESSMENTS.map(assessment => (
            <button key={assessment} onClick={() => onUpdate({ evaluation: { ...externalInfo.evaluation, selfAssessment: assessment } })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${externalInfo.evaluation.selfAssessment === assessment ? (assessment === '超预期' ? 'bg-emerald-100 text-emerald-700 border border-emerald-300' : assessment === '基本达成' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-rose-100 text-rose-700 border border-rose-300') : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              {assessment}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">价值评估</label>
        <div className="grid grid-cols-2 gap-2">
          {VALUE_ASSESSMENTS.map(assessment => (
            <button key={assessment} onClick={() => onUpdate({ evaluation: { ...externalInfo.evaluation, valueAssessment: assessment } })}
              className={`py-2 rounded-lg text-sm font-medium ${externalInfo.evaluation.valueAssessment === assessment ? (assessment === '高价值' ? 'bg-amber-100 text-amber-700 border border-amber-300' : assessment === '中等价值' ? 'bg-blue-100 text-blue-700 border border-blue-300' : 'bg-slate-100 text-slate-600 border border-slate-300') : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              {assessment}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">明年参与建议</label>
        <div className="grid grid-cols-2 gap-2">
          {NEXT_YEAR_SUGGESTIONS.map(suggestion => (
            <button key={suggestion} onClick={() => onUpdate({ evaluation: { ...externalInfo.evaluation, nextYearSuggestion: suggestion } })}
              className={`py-2 rounded-lg text-sm font-medium ${externalInfo.evaluation.nextYearSuggestion === suggestion ? (suggestion === '升级参与' ? 'bg-purple-100 text-purple-700 border border-purple-300' : suggestion === '维持参与' ? 'bg-blue-100 text-blue-700 border border-blue-300' : suggestion === '降级参与' ? 'bg-amber-100 text-amber-700 border border-amber-300' : 'bg-slate-100 text-slate-600 border border-slate-300') : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
              {suggestion}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700 mb-2 block">复盘结论</label>
        <textarea value={externalInfo.evaluation.conclusion}
          onChange={(e) => onUpdate({ evaluation: { ...externalInfo.evaluation, conclusion: e.target.value } })}
          placeholder="总结本次参会的主要收获、问题和建议..." className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none" rows={4} />
      </div>
    </div>
  );
};

export default ExternalActivityDetailPage;
