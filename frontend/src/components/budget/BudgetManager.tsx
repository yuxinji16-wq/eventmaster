import React, { useState, useMemo, useEffect } from 'react';
import { useActivitiesData, useBudgetData } from '../../utils/hooks';
import { BudgetLog, Activity, Budget, BudgetItem, BudgetCategory, BudgetStatus } from '../../types';
import { getMarketingInsight } from '../../services/geminiService';
import BudgetOverview from './BudgetOverview';
import BudgetDetail from './BudgetDetail';
import BudgetItemModal from './BudgetItemModal';
import QuotaModal from './QuotaModal';

// 导出常量供子组件使用
export const BUDGET_CATEGORIES: BudgetCategory[] = [
  '场地租用', '搭建/展览', '物料制作', '差旅/住宿', '餐饮/招待', '礼品/赠品', '媒体/推广', '人员费用', '其他'
];

const BudgetManager: React.FC = () => {
  // API Hooks
  const { activities, loading: activitiesLoading, updateActivity } = useActivitiesData();
  const { overview, activitiesWithBudget, loading: budgetLoading, updateQuota, getLogs, createLog, fetchBudgetOverview } = useBudgetData();

  // 数据状态化
  const [logs, setLogs] = useState<BudgetLog[]>([]);
  const [yearlyQuota, setYearlyQuota] = useState<Record<string, number>>({
    '2022': 1500000, '2023': 1800000, '2024': 2500000, '2025': 2800000
  });

  // 视图状态
  const [selectedYear, setSelectedYear] = useState('2024');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'overview' | 'detail'>('overview');
  const [currentActivityId, setCurrentActivityId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('所有类型');
  const [statusFilter, setStatusFilter] = useState('全部状态');

  // 弹窗状态
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingLog, setEditingLog] = useState<BudgetLog | null>(null);
  const [isActivityEditModalOpen, setIsActivityEditModalOpen] = useState(false);
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [isBudgetItemModalOpen, setIsBudgetItemModalOpen] = useState(false);
  const [editingBudgetItem, setEditingBudgetItem] = useState<BudgetItem | null>(null);

  // AI 状态
  const [aiInsight, setAiInsight] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // 预算项本地状态（API不提供items结构，仅内存管理）
  const [budgetItems, setBudgetItems] = useState<Record<string, BudgetItem[]>>({});

  // 从API获取数据
  useEffect(() => {
    fetchBudgetOverview(selectedYear);
  }, [selectedYear, fetchBudgetOverview]);

  // 当切换活动时获取对应的费用明细
  useEffect(() => {
    if (currentActivityId) {
      getLogs(parseInt(currentActivityId)).then(setLogs).catch(console.error);
    } else {
      setLogs([]);
    }
  }, [currentActivityId, getLogs]);

  // 从overview更新年度配额
  useEffect(() => {
    if (overview && overview.yearly_quota) {
      setYearlyQuota(prev => ({
        ...prev,
        [selectedYear]: overview.yearly_quota
      }));
    }
  }, [overview, selectedYear]);

  // --- 数据计算 ---
  // 从activitiesWithBudget构建预算数据
  const budgetsData = useMemo(() => {
    if (!activitiesWithBudget || !Array.isArray(activitiesWithBudget)) return [];
    return activitiesWithBudget.map(a => ({
      id: `budget-${a.id}`,
      activityId: String(a.id),
      totalAmount: a.budget || 0,
      usedAmount: a.actual_spend || a.actualSpend || 0,
      remainingAmount: (a.budget || 0) - (a.actual_spend || a.actualSpend || 0),
      executionRate: a.budget > 0 ? ((a.actual_spend || a.actualSpend || 0) / a.budget) * 100 : 0,
      status: BudgetStatus.EXECUTING,
      items: budgetItems[a.id] || []
    }));
  }, [activitiesWithBudget, budgetItems]);

  const currentActivity = useMemo(() => activities.find(a => a.id === currentActivityId), [activities, currentActivityId]);
  const currentBudget = useMemo(() => budgetsData.find(b => b.activityId === currentActivityId), [budgetsData, currentActivityId]);
  const totalApproved = yearlyQuota[selectedYear] || 0;

  // 年度筛选的活动
  const yearFilteredActivities = useMemo(() => {
    return activities.filter(a => a.year === selectedYear);
  }, [activities, selectedYear]);

  // 年度统计数据
  const yearStats = useMemo(() => {
    const totalBudget = yearFilteredActivities.reduce((sum, a) => sum + a.budget, 0);
    const totalUsed = yearFilteredActivities.reduce((sum, a) => sum + (a.actualSpend || 0), 0);
    const remaining = totalBudget - totalUsed;
    const executionRate = totalBudget > 0 ? (totalUsed / totalBudget) * 100 : 0;

    return { totalBudget, totalUsed, remaining, executionRate };
  }, [yearFilteredActivities]);

  // 活动类型对比
  const categoryStats = useMemo(() => {
    const selfActivities = yearFilteredActivities.filter(a => a.category === '自办活动');
    const externalActivities = yearFilteredActivities.filter(a => a.category === '外部市场活动');

    const selfBudget = selfActivities.reduce((sum, a) => sum + a.budget, 0);
    const externalBudget = externalActivities.reduce((sum, a) => sum + a.budget, 0);

    const selfUsed = selfActivities.reduce((sum, a) => sum + a.actualSpend, 0);
    const externalUsed = externalActivities.reduce((sum, a) => sum + a.actualSpend, 0);

    return {
      self: {
        count: selfActivities.length,
        budget: selfBudget,
        used: selfUsed,
        avgRate: selfBudget > 0 ? (selfUsed / selfBudget) * 100 : 0,
      },
      external: {
        count: externalActivities.length,
        budget: externalBudget,
        used: externalUsed,
        avgRate: externalBudget > 0 ? (externalUsed / externalBudget) * 100 : 0,
      },
    };
  }, [yearFilteredActivities]);

  // 月度趋势数据
  const monthlyTrend = useMemo(() => {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    return months.map((month, index) => {
      const monthNum = (index + 1).toString().padStart(2, '0');
      const monthActivities = yearFilteredActivities.filter(a => {
        const activityMonth = a.date.split('-')[1];
        return activityMonth === monthNum;
      });
      const budget = monthActivities.reduce((sum, a) => sum + a.budget, 0);
      const actual = monthActivities.reduce((sum, a) => sum + a.actualSpend, 0);
      return { month, budget: budget / 10000, actual: actual / 10000 };
    });
  }, [yearFilteredActivities]);

  // 超预算活动
  const overBudgetActivities = useMemo(() => {
    return yearFilteredActivities.filter(a => a.actualSpend > a.budget);
  }, [yearFilteredActivities]);

  // 高风险活动（执行率 80%-100%）
  const highRiskActivities = useMemo(() => {
    return yearFilteredActivities.filter(a => {
      const rate = (a.actualSpend / a.budget) * 100;
      return rate >= 80 && rate <= 100;
    });
  }, [yearFilteredActivities]);

  // 获取活动预算状态（三档）
  const getBudgetStatus = (activity: Activity): '正常' | '预警' | '超预算' => {
    const rate = (activity.actualSpend / activity.budget) * 100;
    if (rate > 100) return '超预算';
    if (rate >= 80) return '预警';
    return '正常';
  };

  // ROI 分析（投入产出：留资数/花费）
  const roiAnalysis = useMemo(() => {
    const selfActivities = yearFilteredActivities.filter(a => a.category === '自办活动' && a.actualSpend > 0);
    const externalActivities = yearFilteredActivities.filter(a => a.category === '外部市场活动' && a.actualSpend > 0);

    const selfLeads = selfActivities.reduce((sum, a) => sum + a.leads, 0);
    const selfSpend = selfActivities.reduce((sum, a) => sum + a.actualSpend, 0);
    const selfROI = selfSpend > 0 ? (selfLeads / (selfSpend / 10000)).toFixed(1) : '0';

    const externalLeads = externalActivities.reduce((sum, a) => sum + a.leads, 0);
    const externalSpend = externalActivities.reduce((sum, a) => sum + a.actualSpend, 0);
    const externalROI = externalSpend > 0 ? (externalLeads / (externalSpend / 10000)).toFixed(1) : '0';

    return {
      self: { leads: selfLeads, spend: selfSpend, roi: selfROI },
      external: { leads: externalLeads, spend: externalSpend, roi: externalROI },
    };
  }, [yearFilteredActivities]);

  // 筛选后的活动列表
  const filteredActivities = useMemo(() => {
    return yearFilteredActivities.filter(a => {
      const matchesSearch = a.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === '所有类型' || a.category === categoryFilter;
      const status = getBudgetStatus(a);
      const matchesStatus = statusFilter === '全部状态' || status === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [yearFilteredActivities, searchQuery, categoryFilter, statusFilter]);

  // 活动详情费用明细
  const detailLogs = useMemo(() =>
    logs.filter(l => l.activityId === currentActivityId),
    [logs, currentActivityId]
  );

  // --- 交互处理 ---
  const handleSaveExpense = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const amount = Number(formData.get('amount'));

    const logData: Partial<BudgetLog> = {
      name: formData.get('name') as string,
      amount,
      category: formData.get('category') as any,
      date: formData.get('date') as string,
      notes: formData.get('notes') as string,
      status: formData.get('status') as '已结清' | '待结算',
      activityId: currentActivityId!,
      type: 'expense'
    };

    try {
      const newLog = await createLog(logData);
      const updatedLogs = editingLog
        ? logs.map(l => l.id === editingLog.id ? newLog : l)
        : [...logs, newLog];
      setLogs(updatedLogs);

      // 更新活动的实际支出
      if (currentActivity && currentActivityId) {
        const otherLogsAmount = updatedLogs
          .filter(l => l.activityId === currentActivityId && l.id !== newLog.id && l.type === 'expense')
          .reduce((sum, curr) => sum + curr.amount, 0);
        const newActualSpend = otherLogsAmount + amount;
        // 调用API更新活动实际支出
        await updateActivity(parseInt(currentActivityId), { actualSpend: newActualSpend });
      }

      setIsExpenseModalOpen(false);
      setEditingLog(null);
    } catch (err) {
      console.error('Failed to save expense:', err);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!window.confirm('确定要删除这条费用记录吗？')) return;
    const logToDelete = logs.find(l => l.id === id);
    if (!logToDelete) return;

    try {
      const updatedLogs = logs.filter(l => l.id !== id);
      setLogs(updatedLogs);

      if (currentActivity && currentActivityId) {
        const newActualSpend = currentActivity.actualSpend - logToDelete.amount;
        await updateActivity(parseInt(currentActivityId), { actualSpend: Math.max(0, newActualSpend) });
      }
    } catch (err) {
      console.error('删除费用记录失败:', err);
      alert('删除失败，请重试');
    }
  };

  const handleSaveActivity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const budget = Number(formData.get('budget'));

    if (editingActivity) {
      try {
        await updateActivity(parseInt(editingActivity.id), {
          name: formData.get('name') as string,
          budget
        });
        setIsActivityEditModalOpen(false);
      } catch (err) {
        console.error('保存活动失败:', err);
        alert('保存失败，请重试');
      }
    } else {
      setIsActivityEditModalOpen(false);
    }
  };

  const handleSaveQuota = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const quota = Number(formData.get('quota'));
    try {
      await updateQuota(selectedYear, quota);
      setYearlyQuota({ ...yearlyQuota, [selectedYear]: quota });
      setIsQuotaModalOpen(false);
    } catch (err) {
      console.error('更新配额失败:', err);
      alert('保存失败，请重试');
    }
  };

  const handleSaveBudgetItem = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentActivityId) return;
    const formData = new FormData(e.currentTarget);

    const newItem: BudgetItem = {
      id: editingBudgetItem?.id || `item-${Date.now()}`,
      budgetId: `budget-${currentActivityId}`,
      category: formData.get('category') as BudgetCategory,
      plannedAmount: Number(formData.get('plannedAmount')),
      actualAmount: Number(formData.get('actualAmount')),
      variance: Number(formData.get('actualAmount')) - Number(formData.get('plannedAmount')),
      variancePercent: Number(formData.get('plannedAmount')) > 0
        ? ((Number(formData.get('actualAmount')) - Number(formData.get('plannedAmount'))) / Number(formData.get('plannedAmount'))) * 100
        : 0,
      status: Number(formData.get('actualAmount')) > Number(formData.get('plannedAmount')) ? '超预算' : Number(formData.get('actualAmount')) > 0 ? '正常' : '未开始',
    };

    const currentItems = budgetItems[currentActivityId] || [];
    const updatedItems = editingBudgetItem
      ? currentItems.map(i => i.id === editingBudgetItem.id ? newItem : i)
      : [...currentItems, newItem];

    setBudgetItems(prev => ({
      ...prev,
      [currentActivityId]: updatedItems
    }));

    setIsBudgetItemModalOpen(false);
    setEditingBudgetItem(null);
  };

  const handleRunAIAnalysis = async () => {
    if (!currentActivity) return;
    setIsAiLoading(true);
    const prompt = `请深度分析活动 "${currentActivity.name}" 的财务状况。预算 ¥${currentActivity.budget}，已支出 ¥${currentActivity.actualSpend}。明细：${JSON.stringify(detailLogs)}。给出风险和优化建议。`;
    const insight = await getMarketingInsight(prompt);
    setAiInsight(insight);
    setIsAiLoading(false);
  };

  // 视图切换处理
  const handleViewBudgetStructure = (activityId: string) => {
    setCurrentActivityId(activityId);
    setViewMode('detail');
    setAiInsight(null);
  };

  const handleBackToOverview = () => {
    setViewMode('overview');
    setAiInsight(null);
  };

  // 详情页计算属性
  const executionRate = currentActivity ? Math.round((currentActivity.actualSpend / currentActivity.budget) * 100) : 0;
  const status = currentActivity ? getBudgetStatus(currentActivity) : '正常';
  const variance = currentActivity ? currentActivity.actualSpend - currentActivity.budget : 0;

  return (
    <div className="relative">
      {viewMode === 'overview' ? (
        <BudgetOverview
          selectedYear={selectedYear}
          yearlyQuota={yearlyQuota}
          yearStats={yearStats}
          categoryStats={categoryStats}
          monthlyTrend={monthlyTrend}
          overBudgetActivities={overBudgetActivities}
          highRiskActivities={highRiskActivities}
          filteredActivities={filteredActivities}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          categoryFilter={categoryFilter}
          setCategoryFilter={setCategoryFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          onYearChange={setSelectedYear}
          onQuotaModalOpen={() => setIsQuotaModalOpen(true)}
          onViewBudgetStructure={handleViewBudgetStructure}
          getBudgetStatus={getBudgetStatus}
          roiAnalysis={roiAnalysis}
        />
      ) : (
        <BudgetDetail
          currentActivity={currentActivity}
          currentBudget={currentBudget}
          executionRate={executionRate}
          status={status}
          variance={variance}
          aiInsight={aiInsight}
          isAiLoading={isAiLoading}
          onBack={handleBackToOverview}
          onRunAIAnalysis={handleRunAIAnalysis}
          onBudgetItemModalOpen={(item) => {
            setEditingBudgetItem(item);
            setIsBudgetItemModalOpen(true);
          }}
        />
      )}

      {/* 预算明细编辑弹窗 */}
      <BudgetItemModal
        isOpen={isBudgetItemModalOpen}
        editingBudgetItem={editingBudgetItem}
        onClose={() => {
          setIsBudgetItemModalOpen(false);
          setEditingBudgetItem(null);
        }}
        onSave={handleSaveBudgetItem}
      />

      {/* 年度配额弹窗 */}
      <QuotaModal
        isOpen={isQuotaModalOpen}
        selectedYear={selectedYear}
        totalApproved={totalApproved}
        onClose={() => setIsQuotaModalOpen(false)}
        onSave={handleSaveQuota}
      />
    </div>
  );
};

export default BudgetManager;
