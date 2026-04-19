import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Opportunity, LeadLevel, LeadStatus } from '../types';
import { useLeadsData } from '../utils/hooks';
import { opportunitiesApi } from '../services/backendApi';
import { BackButton, LoadingSpinner, Button, Modal, Input, Select } from '../shared';
import {
  Check, TrendingUp, Star, ChevronDown, ChevronUp, Clock,
  User, MapPin, FileText
} from 'lucide-react';

const LEAD_LEVEL_OPTIONS = [
  { value: 'A', label: 'A - 优质线索' },
  { value: 'B', label: 'B - 一般线索' },
  { value: 'C', label: 'C - 需评估' },
  { value: '待评估', label: '待评估' },
];

const STATUS_OPTIONS = [
  { value: '未跟进', label: '未跟进' },
  { value: '待跟进', label: '待跟进' },
  { value: '已转销售', label: '已转销售' },
];

// 等级颜色
const getLeadLevelStyle = (level: LeadLevel) => {
  switch (level) {
    case 'A': return 'bg-emerald-500 text-white';
    case 'B': return 'bg-blue-500 text-white';
    case 'C': return 'bg-amber-500 text-white';
    default: return 'bg-slate-200 text-slate-600';
  }
};

// 状态颜色
const getStatusStyle = (status: LeadStatus) => {
  switch (status) {
    case '未跟进': return 'bg-slate-100 text-slate-600';
    case '待跟进': return 'bg-blue-50 text-blue-600';
    case '已转销售': return 'bg-violet-50 text-violet-600';
    case '已转化': return 'bg-emerald-50 text-emerald-600';
    case '未转化': return 'bg-rose-50 text-rose-600';
    default: return 'bg-slate-100 text-slate-600';
  }
};

// 统一模块头部组件
const ModuleHeader: React.FC<{
  icon: React.ReactNode;
  title: string;
  action?: React.ReactNode;
}> = ({ icon, title, action }) => (
  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
    <div className="flex items-center gap-2">
      <span className="text-slate-400">{icon}</span>
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
    </div>
    {action}
  </div>
);

// 字段行组件 - 无icon
const FieldRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
    <span className="text-sm text-slate-500">{label}</span>
    <span className="text-sm font-medium text-slate-800">{value}</span>
  </div>
);

// 卡片容器
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-100 ${className}`}>{children}</div>
);

const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { leads, loading, updateLead, deleteLead } = useLeadsData();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [operationLogs, setOperationLogs] = useState<any[]>([]);

  // 四个独立弹窗状态
  const [basicModalOpen, setBasicModalOpen] = useState(false);
  const [basicForm, setBasicForm] = useState({ contactName: '', phone: '', email: '', region: '', owner: '' });

  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [statusForm, setStatusForm] = useState<LeadStatus>('未跟进');

  const [evaluationModalOpen, setEvaluationModalOpen] = useState(false);
  const [evaluationForm, setEvaluationForm] = useState({
    leadLevel: '待评估' as LeadLevel,
    transferredToSales: false,
    evaluationNote: ''
  });

  const [conversionModalOpen, setConversionModalOpen] = useState(false);
  const [conversionForm, setConversionForm] = useState({
    conversionStatus: '未转化' as LeadStatus,
    resultNote: ''
  });

  const [timelineExpanded, setTimelineExpanded] = useState(false);

  useEffect(() => {
    if (id && leads.length > 0) {
      const found = leads.find(o => o.id === id);
      setOpportunity(found || null);
    }
  }, [id, leads]);

  const loadOperationLogs = async () => {
    if (!id) return;
    try {
      const logs = await opportunitiesApi.getLogs(Number(id));
      setOperationLogs(logs);
    } catch (err) {
      console.error('加载商机操作记录失败:', err);
      setOperationLogs([]);
    }
  };

  useEffect(() => {
    loadOperationLogs();
  }, [id]);

  const handleBack = () => navigate('/opportunities');

  const handleUpdate = async (data: Partial<Opportunity>) => {
    if (!opportunity) return;
    await updateLead(opportunity.id, data);
    setOpportunity({ ...opportunity, ...data });
    await loadOperationLogs();
  };

  const handleDelete = () => {
    if (!opportunity) return;
    if (window.confirm('确定要永久删除这条线索吗？')) {
      deleteLead(opportunity.id);
      navigate('/opportunities');
    }
  };

  // 打开基础信息编辑弹窗
  const openBasicModal = () => {
    if (opportunity) {
      setBasicForm({
        contactName: opportunity.contactName,
        phone: opportunity.phone,
        email: opportunity.email || '',
        region: opportunity.region,
        owner: opportunity.owner,
      });
      setBasicModalOpen(true);
    }
  };

  // 保存基础信息
  const saveBasicInfo = async () => {
    await handleUpdate({
      contactName: basicForm.contactName,
      phone: basicForm.phone,
      email: basicForm.email || undefined,
      region: basicForm.region,
      owner: basicForm.owner,
    });
    setBasicModalOpen(false);
  };

  // 打开状态编辑弹窗
  const openStatusModal = () => {
    if (opportunity) {
      setStatusForm(opportunity.status);
      setStatusModalOpen(true);
    }
  };

  // 保存状态
  const saveStatus = async () => {
    await handleUpdate({ status: statusForm });
    setStatusModalOpen(false);
  };

  // 打开销售评估弹窗
  const openEvaluationModal = () => {
    if (opportunity) {
      setEvaluationForm({
        leadLevel: opportunity.leadLevel,
        transferredToSales: opportunity.transferredToSales,
        evaluationNote: opportunity.evaluationNote || '',
      });
      setEvaluationModalOpen(true);
    }
  };

  // 保存销售评估
  const saveEvaluation = async () => {
    const updates: Partial<Opportunity> = {
      leadLevel: evaluationForm.leadLevel,
      evaluationNote: evaluationForm.evaluationNote || undefined,
    };

    if (evaluationForm.transferredToSales && !opportunity?.transferredToSales) {
      updates.transferredToSales = true;
      updates.transferredAt = new Date().toISOString();
      if (!opportunity?.status || opportunity.status === '未跟进' || opportunity.status === '待跟进') {
        updates.status = '已转销售';
      }
    } else {
      updates.transferredToSales = evaluationForm.transferredToSales;
      if (!evaluationForm.transferredToSales) {
        updates.transferredAt = undefined;
      }
    }

    await handleUpdate(updates);
    setEvaluationModalOpen(false);
  };

  // 打开转化结果弹窗
  const openConversionModal = () => {
    if (opportunity) {
      setConversionForm({
        conversionStatus: opportunity.conversionStatus || '未转化',
        resultNote: opportunity.resultNote || '',
      });
      setConversionModalOpen(true);
    }
  };

  // 保存转化结果
  const saveConversion = async () => {
    const converted = conversionForm.conversionStatus === '已转化';
    await handleUpdate({
      converted,
      conversionStatus: conversionForm.conversionStatus,
      conversionAt: converted ? new Date().toISOString() : undefined,
      resultNote: conversionForm.resultNote || undefined,
    });
    setConversionModalOpen(false);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回线索列表" />
        <Card className="p-6"><div className="h-64 flex items-center justify-center"><LoadingSpinner /></div></Card>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回线索列表" />
        <Card className="p-6">
          <div className="text-center py-12"><p className="text-slate-500">线索不存在</p></div>
        </Card>
      </div>
    );
  }

  const sourceLabel = opportunity.sourceType === 'activity' ? opportunity.sourceName : '自主录入';

  return (
    <div className="space-y-4">
      <BackButton onClick={handleBack} label="返回线索列表" />

      {/* 顶部信息区 */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-800">{opportunity.clientName}</h1>
              <span className={`px-3 py-1 rounded-lg text-sm font-bold ${getLeadLevelStyle(opportunity.leadLevel)}`}>
                {opportunity.leadLevel}级
              </span>
              <button
                onClick={openStatusModal}
                className={`px-2 py-1 rounded-lg text-sm font-medium cursor-pointer hover:opacity-80 ${getStatusStyle(opportunity.status)}`}>
                {opportunity.status}
              </button>
              {opportunity.converted && (
                <span className="px-3 py-1 rounded-lg text-sm font-bold bg-emerald-500 text-white">
                  已转化
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                opportunity.sourceType === 'activity' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-600'
              }`}>
                {sourceLabel}
              </span>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-500">{opportunity.region}</span>
              <span className="text-slate-300">·</span>
              <span className="text-sm text-slate-500">对接人：{opportunity.owner}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-6">
            <button
              onClick={handleDelete}
              className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-600 text-sm font-medium hover:bg-rose-100 transition-colors"
            >
              删除
            </button>
          </div>
        </div>
      </Card>

      {/* 基础信息 + 归属信息 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 基础信息 */}
        <Card className="p-5">
          <ModuleHeader
            icon={<User size={16} />}
            title="基础信息"
            action={
              <button onClick={openBasicModal} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100">
                编辑
              </button>
            }
          />
          <div className="pt-4">
            <FieldRow label="姓名" value={opportunity.contactName} />
            <FieldRow label="电话" value={opportunity.phone} />
            {opportunity.email && <FieldRow label="邮箱" value={opportunity.email} />}
          </div>
        </Card>

        {/* 归属信息 */}
        <Card className="p-5">
          <ModuleHeader
            icon={<MapPin size={16} />}
            title="归属信息"
            action={
              <button onClick={openBasicModal} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100">
                编辑
              </button>
            }
          />
          <div className="pt-4">
            <FieldRow label="区域" value={opportunity.region} />
            <FieldRow label="对接人" value={opportunity.owner} />
            <FieldRow label="创建时间" value={formatDate(opportunity.createdAt)} />
          </div>
        </Card>
      </div>

      {/* 需求描述 */}
      {opportunity.requirement && (
        <Card className="p-5">
          <ModuleHeader
            icon={<FileText size={16} />}
            title="需求描述"
          />
          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{opportunity.requirement}</p>
          </div>
        </Card>
      )}

      {/* 销售评估 + 转化结果 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 销售评估 */}
        <Card className="p-5">
          <ModuleHeader
            icon={<Star size={16} />}
            title="销售评估"
            action={
              <button onClick={openEvaluationModal} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100">
                {opportunity.evaluationNote || opportunity.transferredToSales ? '编辑' : '添加'}
              </button>
            }
          />
          <div className="pt-4">
            <FieldRow
              label="线索等级"
              value={<span className={`px-3 py-0.5 rounded-lg text-sm font-bold ${getLeadLevelStyle(opportunity.leadLevel)}`}>{opportunity.leadLevel}级</span>}
            />
            <FieldRow
              label="转交销售"
              value={
                <span className={`px-2 py-0.5 rounded-lg text-sm font-medium ${
                  opportunity.transferredToSales ? 'bg-violet-50 text-violet-600' : 'bg-slate-100 text-slate-500'
                }`}>
                  {opportunity.transferredToSales ? '已转' : '未转'}
                </span>
              }
            />
            {opportunity.transferredAt && (
              <FieldRow label="转交时间" value={formatDate(opportunity.transferredAt)} />
            )}
            {opportunity.evaluationNote && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-600">{opportunity.evaluationNote}</p>
              </div>
            )}
            {!opportunity.evaluationNote && !opportunity.transferredToSales && (
              <p className="text-sm text-slate-400 py-2">暂无评估信息</p>
            )}
          </div>
        </Card>

        {/* 转化结果 */}
        <Card className="p-5">
          <ModuleHeader
            icon={<TrendingUp size={16} />}
            title="转化结果"
            action={
              <button onClick={openConversionModal} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100">
                更新
              </button>
            }
          />
          <div className="pt-4">
            <FieldRow
              label="转化状态"
              value={
                <span className={`px-2 py-0.5 rounded-lg text-sm font-medium ${
                  opportunity.converted
                    ? 'bg-emerald-50 text-emerald-600'
                    : opportunity.conversionStatus === '未转化'
                      ? 'bg-rose-50 text-rose-600'
                      : 'bg-slate-100 text-slate-500'
                }`}>
                  {opportunity.converted ? '已转化' : (opportunity.conversionStatus || '待评估')}
                </span>
              }
            />
            {opportunity.conversionAt && (
              <FieldRow label="转化时间" value={formatDate(opportunity.conversionAt)} />
            )}
            {!opportunity.conversionAt && <div className="py-2.5" />}
            {opportunity.resultNote && (
              <div className="pt-3 border-t border-slate-100">
                <p className="text-sm text-slate-600">{opportunity.resultNote}</p>
              </div>
            )}
            {!opportunity.conversionStatus && !opportunity.converted && !opportunity.resultNote && (
              <p className="text-sm text-slate-400 py-2">暂无转化结果</p>
            )}
          </div>
        </Card>
      </div>

      {/* 备注 */}
      {opportunity.notes && (
        <Card className="p-5">
          <ModuleHeader
            icon={<Clock size={16} />}
            title="备注"
          />
          <div className="pt-4">
            <p className="text-sm text-slate-600">{opportunity.notes}</p>
          </div>
        </Card>
      )}

      {/* 操作记录 */}
      <Card className="p-5">
        <button
          onClick={() => setTimelineExpanded(!timelineExpanded)}
          className="w-full flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <span className="text-slate-400"><Clock size={16} /></span>
            <span className="text-base font-bold text-slate-800">操作记录</span>
          </div>
          {timelineExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
        </button>

        {timelineExpanded && (
          <div className="mt-4 space-y-4">
            {(operationLogs.length > 0 ? operationLogs : [{
              id: 'created',
              action: '创建线索',
              detail: '',
              created_at: opportunity.createdAt
            }]).map((log) => (
              <div key={log.id} className="flex items-start gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{log.action}</p>
                  {log.detail && <p className="text-xs text-slate-500 mt-0.5">{log.detail}</p>}
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(log.created_at || log.createdAt)}</p>
                </div>
              </div>
            ))}
            {opportunity.transferredAt && (
              <div className="flex items-start gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-violet-500 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">转交销售</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(opportunity.transferredAt)}</p>
                </div>
              </div>
            )}
            {opportunity.conversionAt && (
              <div className="flex items-start gap-4">
                <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 mt-1.5" />
                <div>
                  <p className="text-sm font-medium text-slate-700">{opportunity.converted ? '转化成功' : '标记未转化'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{formatDate(opportunity.conversionAt)}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ============ 四个独立弹窗 ============ */}

      {/* 1. 基础信息 + 归属信息编辑弹窗 */}
      {basicModalOpen && (
        <Modal
          onClose={() => setBasicModalOpen(false)}
          title="编辑联系信息"
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setBasicModalOpen(false)}>取消</Button>
              <Button variant="primary" onClick={saveBasicInfo} icon={<Check size={14} />}>保存</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">姓名 *</label>
              <Input
                value={basicForm.contactName}
                onChange={(e) => setBasicForm({ ...basicForm, contactName: e.target.value })}
                placeholder="请输入联系人姓名"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">电话 *</label>
              <Input
                value={basicForm.phone}
                onChange={(e) => setBasicForm({ ...basicForm, phone: e.target.value })}
                placeholder="请输入联系电话"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">邮箱</label>
              <Input
                type="email"
                value={basicForm.email}
                onChange={(e) => setBasicForm({ ...basicForm, email: e.target.value })}
                placeholder="请输入邮箱地址"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">区域 *</label>
              <Input
                value={basicForm.region}
                onChange={(e) => setBasicForm({ ...basicForm, region: e.target.value })}
                placeholder="请输入所属区域"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">对接人 *</label>
              <Input
                value={basicForm.owner}
                onChange={(e) => setBasicForm({ ...basicForm, owner: e.target.value })}
                placeholder="请输入对接人姓名"
              />
            </div>
          </div>
        </Modal>
      )}

      {/* 2. 状态编辑弹窗 */}
      {statusModalOpen && (
        <Modal
          onClose={() => setStatusModalOpen(false)}
          title="更新状态"
          size="sm"
          footer={
            <>
              <Button variant="secondary" onClick={() => setStatusModalOpen(false)}>取消</Button>
              <Button variant="primary" onClick={saveStatus} icon={<Check size={14} />}>保存</Button>
            </>
          }
        >
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">选择状态</label>
            <Select
              value={statusForm}
              onChange={(e) => setStatusForm(e.target.value as LeadStatus)}
              options={STATUS_OPTIONS}
            />
          </div>
        </Modal>
      )}

      {/* 3. 销售评估编辑弹窗 */}
      {evaluationModalOpen && (
        <Modal
          onClose={() => setEvaluationModalOpen(false)}
          title="编辑销售评估"
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setEvaluationModalOpen(false)}>取消</Button>
              <Button variant="primary" onClick={saveEvaluation} icon={<Check size={14} />}>保存</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">线索等级</label>
              <Select
                value={evaluationForm.leadLevel}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, leadLevel: e.target.value as LeadLevel })}
                options={LEAD_LEVEL_OPTIONS}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">转交销售</label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={evaluationForm.transferredToSales}
                  onChange={(e) => setEvaluationForm({ ...evaluationForm, transferredToSales: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                />
                <span className="text-sm text-slate-700">已转交销售</span>
              </label>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">评估备注</label>
              <textarea
                value={evaluationForm.evaluationNote}
                onChange={(e) => setEvaluationForm({ ...evaluationForm, evaluationNote: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                placeholder="记录销售评估备注..."
              />
            </div>
          </div>
        </Modal>
      )}

      {/* 4. 转化结果编辑弹窗 */}
      {conversionModalOpen && (
        <Modal
          onClose={() => setConversionModalOpen(false)}
          title="更新转化结果"
          size="md"
          footer={
            <>
              <Button variant="secondary" onClick={() => setConversionModalOpen(false)}>取消</Button>
              <Button variant="primary" onClick={saveConversion} icon={<Check size={14} />}>保存</Button>
            </>
          }
        >
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">转化状态</label>
              <Select
                value={conversionForm.conversionStatus}
                onChange={(e) => setConversionForm({ ...conversionForm, conversionStatus: e.target.value as LeadStatus })}
                options={[
                  { value: '未转化', label: '未转化' },
                  { value: '已转化', label: '已转化' },
                ]}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">结果备注</label>
              <textarea
                value={conversionForm.resultNote}
                onChange={(e) => setConversionForm({ ...conversionForm, resultNote: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                placeholder="记录转化结果备注..."
              />
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OpportunityDetail;
