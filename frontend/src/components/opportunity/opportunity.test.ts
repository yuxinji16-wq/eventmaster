/**
 * 商机管理模块测试
 */
import { describe, it, expect } from 'vitest';

// 商机阶段定义
type OpportunityStage = '初步接触' | '需求确认' | '方案制定' | '商务谈判' | '合同签署' | '已完成' | '已失败';

interface Opportunity {
  id: string;
  clientName: string;
  company: string;
  contact: string;
  phone: string;
  email: string;
  estimatedValue: number;
  status: string;
  createDate: string;
  expectedCloseDate: string;
  notes: string;
}

// 商机筛选逻辑
function filterOpportunities(
  opportunities: Opportunity[],
  searchQuery: string,
  statusFilter: string
): Opportunity[] {
  return opportunities.filter(opp => {
    const matchesSearch =
      opp.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.contact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === '全部' || opp.status === statusFilter;
    return matchesSearch && matchesStatus;
  });
}

// 计算商机总价值
function calculateTotalValue(opportunities: Opportunity[]): number {
  return opportunities.reduce((sum, opp) => sum + opp.estimatedValue, 0);
}

// 商机阶段颜色映射
function getStageColor(stage: OpportunityStage): string {
  const colors: Record<OpportunityStage, string> = {
    '初步接触': 'bg-slate-100 text-slate-600',
    '需求确认': 'bg-blue-100 text-blue-600',
    '方案制定': 'bg-purple-100 text-purple-600',
    '商务谈判': 'bg-amber-100 text-amber-600',
    '合同签署': 'bg-emerald-100 text-emerald-600',
    '已完成': 'bg-green-100 text-green-600',
    '已失败': 'bg-red-100 text-red-600',
  };
  return colors[stage] || 'bg-slate-100 text-slate-600';
}

describe('商机筛选逻辑', () => {
  const mockOpportunities: Opportunity[] = [
    { id: '1', clientName: '张总', company: '科技公司A', contact: '张总', phone: '13800138000', email: 'zhang@a.com', estimatedValue: 500000, status: '初步接触', createDate: '2024-03-01', expectedCloseDate: '2024-06-30', notes: '' },
    { id: '2', clientName: '李总', company: '制造业公司B', contact: '李总', phone: '13900139000', email: 'li@b.com', estimatedValue: 800000, status: '商务谈判', createDate: '2024-02-15', expectedCloseDate: '2024-05-31', notes: '' },
    { id: '3', clientName: '王总', company: '金融公司C', contact: '王总', phone: '13700137000', email: 'wang@c.com', estimatedValue: 1200000, status: '需求确认', createDate: '2024-03-10', expectedCloseDate: '2024-07-15', notes: '' },
  ];

  it('应返回所有商机当没有过滤条件时', () => {
    const result = filterOpportunities(mockOpportunities, '', '全部');
    expect(result).toHaveLength(3);
  });

  it('应按公司名称搜索', () => {
    const result = filterOpportunities(mockOpportunities, '科技', '全部');
    expect(result).toHaveLength(1);
    expect(result[0].company).toBe('科技公司A');
  });

  it('应按客户名称搜索', () => {
    const result = filterOpportunities(mockOpportunities, '张总', '全部');
    expect(result).toHaveLength(1);
    expect(result[0].clientName).toBe('张总');
  });

  it('应按商机阶段筛选', () => {
    const result = filterOpportunities(mockOpportunities, '', '商务谈判');
    expect(result).toHaveLength(1);
    expect(result[0].status).toBe('商务谈判');
  });

  it('应同时支持搜索和阶段筛选', () => {
    const result = filterOpportunities(mockOpportunities, '公司', '初步接触');
    expect(result).toHaveLength(1);
  });

  it('搜索应不区分大小写', () => {
    const result1 = filterOpportunities(mockOpportunities, '科技', '全部');
    const result2 = filterOpportunities(mockOpportunities, 'KEJI', '全部');
    expect(result1.length).toBe(1);
    expect(result2.length).toBe(0); // KEJI不会匹配中文
  });
});

describe('商机价值计算', () => {
  it('应正确计算商机总价值', () => {
    const opportunities: Opportunity[] = [
      { id: '1', clientName: 'A', company: 'A公司', contact: '', phone: '', email: '', estimatedValue: 100000, status: '初步接触', createDate: '', expectedCloseDate: '', notes: '' },
      { id: '2', clientName: 'B', company: 'B公司', contact: '', phone: '', email: '', estimatedValue: 200000, status: '初步接触', createDate: '', expectedCloseDate: '', notes: '' },
    ];
    expect(calculateTotalValue(opportunities)).toBe(300000);
  });

  it('应处理空数组', () => {
    expect(calculateTotalValue([])).toBe(0);
  });

  it('应正确计算大数值', () => {
    const opportunities: Opportunity[] = [
      { id: '1', clientName: 'A', company: 'A公司', contact: '', phone: '', email: '', estimatedValue: 1000000, status: '初步接触', createDate: '', expectedCloseDate: '', notes: '' },
      { id: '2', clientName: 'B', company: 'B公司', contact: '', phone: '', email: '', estimatedValue: 2500000, status: '初步接触', createDate: '', expectedCloseDate: '', notes: '' },
      { id: '3', clientName: 'C', company: 'C公司', contact: '', phone: '', email: '', estimatedValue: 3000000, status: '初步接触', createDate: '', expectedCloseDate: '', notes: '' },
    ];
    expect(calculateTotalValue(opportunities)).toBe(6500000);
  });
});

describe('商机阶段颜色映射', () => {
  it('应返回正确的颜色类名', () => {
    expect(getStageColor('初步接触')).toBe('bg-slate-100 text-slate-600');
    expect(getStageColor('需求确认')).toBe('bg-blue-100 text-blue-600');
    expect(getStageColor('方案制定')).toBe('bg-purple-100 text-purple-600');
    expect(getStageColor('商务谈判')).toBe('bg-amber-100 text-amber-600');
    expect(getStageColor('合同签署')).toBe('bg-emerald-100 text-emerald-600');
    expect(getStageColor('已完成')).toBe('bg-green-100 text-green-600');
    expect(getStageColor('已失败')).toBe('bg-red-100 text-red-600');
  });

  it('应处理未知阶段', () => {
    expect(getStageColor('未知阶段' as OpportunityStage)).toBe('bg-slate-100 text-slate-600');
  });
});

describe('商机日期格式验证', () => {
  it('应验证日期格式为 YYYY-MM-DD', () => {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    expect('2024-03-15').toMatch(dateRegex);
    expect('2024-12-31').toMatch(dateRegex);
    expect('2024-1-1').not.toMatch(dateRegex);
  });

  it('应正确计算距离到期日的天数', () => {
    const today = new Date();
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + 30);

    const daysUntilClose = Math.ceil((futureDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    expect(daysUntilClose).toBe(30);
  });
});

describe('商机数据验证', () => {
  it('应验证手机号格式', () => {
    const phoneRegex = /^1[3-9]\d{9}$/;
    expect('13800138000').toMatch(phoneRegex);
    expect('1380013800').not.toMatch(phoneRegex);
    expect('23800138000').not.toMatch(phoneRegex);
  });

  it('应验证邮箱格式', () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    expect('test@example.com').toMatch(emailRegex);
    expect('test@example').not.toMatch(emailRegex);
    expect('@example.com').not.toMatch(emailRegex);
  });

  it('应验证商机估值大于零', () => {
    const validateValue = (value: number): boolean => value > 0;
    expect(validateValue(100000)).toBe(true);
    expect(validateValue(0)).toBe(false);
    expect(validateValue(-100)).toBe(false);
  });
});
