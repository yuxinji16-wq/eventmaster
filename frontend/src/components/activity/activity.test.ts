/**
 * 活动详情页模块测试
 */
import { describe, it, expect } from 'vitest';
import {
  ActivityStage,
  ACTIVITY_STAGES,
  ActivityTask,
  RiskLevel
} from '../../types';

// ============ 工具函数测试 ============

// 阶段索引计算
function getStageIndex(stage: string): number {
  return ACTIVITY_STAGES.indexOf(stage as ActivityStage);
}

// 风险等级计算
function calculateRiskLevel(
  tasks: ActivityTask[],
  budget: number,
  actualSpend: number
): RiskLevel {
  // 检查是否有延期任务
  const overdueTasks = tasks.filter(t => {
    if (t.status === '已完成') return false;
    return new Date(t.dueDate) < new Date();
  });
  if (overdueTasks.length > 0) return 'danger';

  // 检查是否有P0任务未完成
  const p0Pending = tasks.filter(t => t.priority === 'P0' && t.status !== '已完成');
  if (p0Pending.length > 0) return 'warning';

  // 检查预算执行率
  if (budget > 0) {
    const rate = actualSpend / budget;
    if (rate >= 1) return 'danger';
    if (rate >= 0.9) return 'warning';
  }

  return 'healthy';
}

// 状态摘要生成
function getStatusSummary(activity: any, tasks: ActivityTask[]): string {
  const currentStage = activity.currentStage || activity.status;
  const pendingCount = tasks.filter(t => t.status !== '已完成').length;
  const overdueTasks = tasks.filter(t => {
    if (t.status === '已完成') return false;
    return new Date(t.dueDate) < new Date();
  });

  if (overdueTasks.length > 0) {
    return `⚠️ 有 ${overdueTasks.length} 项任务已延期，需要立即处理`;
  }

  if (pendingCount > 0) {
    return `当前处于 ${currentStage}，还有 ${pendingCount} 项任务待完成`;
  }

  if (activity.status === '已完成') {
    return `✅ 活动已完成，累计留资 ${activity.leads} 人`;
  }

  return `当前处于 ${currentStage}，所有任务已处理完毕`;
}

// 优先级颜色映射
function getPriorityColor(priority: 'P0' | 'P1' | 'P2'): { bg: string; text: string } {
  const colors = {
    P0: { bg: 'bg-rose-100', text: 'text-rose-600' },
    P1: { bg: 'bg-amber-100', text: 'text-amber-600' },
    P2: { bg: 'bg-blue-100', text: 'text-blue-600' },
  };
  return colors[priority];
}

// 风险颜色映射
function getRiskColor(risk: RiskLevel): { bg: string; text: string } {
  const colors = {
    healthy: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-600' },
    danger: { bg: 'bg-rose-50', text: 'text-rose-600' },
  };
  return colors[risk];
}

describe('活动阶段常量', () => {
  it('应包含5个阶段', () => {
    expect(ACTIVITY_STAGES).toHaveLength(5);
  });

  it('阶段顺序应正确', () => {
    expect(ACTIVITY_STAGES[0]).toBe('待启动');
    expect(ACTIVITY_STAGES[1]).toBe('筹备中');
    expect(ACTIVITY_STAGES[2]).toBe('执行中');
    expect(ACTIVITY_STAGES[3]).toBe('复盘中');
    expect(ACTIVITY_STAGES[4]).toBe('已完成');
  });
});

describe('阶段索引计算', () => {
  it('应正确计算各阶段索引', () => {
    expect(getStageIndex('待启动')).toBe(0);
    expect(getStageIndex('筹备中')).toBe(1);
    expect(getStageIndex('执行中')).toBe(2);
    expect(getStageIndex('复盘中')).toBe(3);
    expect(getStageIndex('已完成')).toBe(4);
  });

  it('未知阶段应返回-1', () => {
    expect(getStageIndex('未知阶段')).toBe(-1);
  });
});

describe('风险等级计算', () => {
  it('无任务时应返回healthy', () => {
    expect(calculateRiskLevel([], 1000000, 0)).toBe('healthy');
  });

  it('有延期任务时应返回danger', () => {
    const tasks: ActivityTask[] = [
      {
        id: '1',
        name: '测试任务',
        assignee: '张三',
        dueDate: '2020-01-01', // 已过期
        priority: 'P2',
        status: '进行中',
        createdAt: '2020-01-01'
      }
    ];
    expect(calculateRiskLevel(tasks, 1000000, 0)).toBe('danger');
  });

  it('有P0未完成任务时应返回warning', () => {
    const tasks: ActivityTask[] = [
      {
        id: '1',
        name: 'P0任务',
        assignee: '张三',
        dueDate: '2099-12-31', // 未过期
        priority: 'P0',
        status: '进行中',
        createdAt: '2020-01-01'
      }
    ];
    expect(calculateRiskLevel(tasks, 1000000, 0)).toBe('warning');
  });

  it('预算超支时应返回danger', () => {
    expect(calculateRiskLevel([], 1000000, 1100000)).toBe('danger');
  });

  it('预算执行率超过90%时应返回warning', () => {
    expect(calculateRiskLevel([], 1000000, 950000)).toBe('warning');
  });

  it('正常情况应返回healthy', () => {
    expect(calculateRiskLevel([], 1000000, 500000)).toBe('healthy');
  });

  it('已完成的任务不应计入延期', () => {
    const tasks: ActivityTask[] = [
      {
        id: '1',
        name: '已完成的任务',
        assignee: '张三',
        dueDate: '2020-01-01',
        priority: 'P2',
        status: '已完成',
        createdAt: '2020-01-01'
      }
    ];
    expect(calculateRiskLevel(tasks, 1000000, 0)).toBe('healthy');
  });
});

describe('状态摘要生成', () => {
  it('有延期任务时应显示警告', () => {
    const activity = { status: '执行中' };
    const tasks: ActivityTask[] = [
      {
        id: '1',
        name: '测试任务',
        assignee: '张三',
        dueDate: '2020-01-01',
        priority: 'P2',
        status: '进行中',
        createdAt: '2020-01-01'
      }
    ];
    const summary = getStatusSummary(activity, tasks);
    expect(summary).toContain('延期');
    expect(summary).toContain('1');
  });

  it('有待完成任务时应显示数量', () => {
    const activity = { status: '执行中' };
    const tasks: ActivityTask[] = [
      {
        id: '1',
        name: '测试任务',
        assignee: '张三',
        dueDate: '2099-12-31',
        priority: 'P2',
        status: '进行中',
        createdAt: '2020-01-01'
      }
    ];
    const summary = getStatusSummary(activity, tasks);
    expect(summary).toContain('还有 1 项任务待完成');
  });

  it('已完成活动应显示留资信息', () => {
    const activity = { status: '已完成', leads: 100 };
    const summary = getStatusSummary(activity, []);
    expect(summary).toContain('已完成');
    expect(summary).toContain('100');
  });

  it('所有任务完成且非已完成状态时应显示特定信息', () => {
    const activity = { status: '执行中' };
    const tasks: ActivityTask[] = [
      {
        id: '1',
        name: '已完成的任务',
        assignee: '张三',
        dueDate: '2099-12-31',
        priority: 'P2',
        status: '已完成',
        createdAt: '2020-01-01'
      }
    ];
    const summary = getStatusSummary(activity, tasks);
    expect(summary).toContain('所有任务已处理完毕');
  });
});

describe('优先级颜色映射', () => {
  it('P0应返回红色系', () => {
    const color = getPriorityColor('P0');
    expect(color.bg).toBe('bg-rose-100');
    expect(color.text).toBe('text-rose-600');
  });

  it('P1应返回黄色系', () => {
    const color = getPriorityColor('P1');
    expect(color.bg).toBe('bg-amber-100');
    expect(color.text).toBe('text-amber-600');
  });

  it('P2应返回蓝色系', () => {
    const color = getPriorityColor('P2');
    expect(color.bg).toBe('bg-blue-100');
    expect(color.text).toBe('text-blue-600');
  });
});

describe('风险颜色映射', () => {
  it('healthy应返回绿色系', () => {
    const color = getRiskColor('healthy');
    expect(color.bg).toBe('bg-emerald-50');
    expect(color.text).toBe('text-emerald-600');
  });

  it('warning应返回黄色系', () => {
    const color = getRiskColor('warning');
    expect(color.bg).toBe('bg-amber-50');
    expect(color.text).toBe('text-amber-600');
  });

  it('danger应返回红色系', () => {
    const color = getRiskColor('danger');
    expect(color.bg).toBe('bg-rose-50');
    expect(color.text).toBe('text-rose-600');
  });
});

describe('预算执行率计算', () => {
  const calculateExecutionRate = (actual: number, budget: number): number => {
    if (budget === 0) return 0;
    return Math.round((actual / budget) * 100);
  };

  it('应正确计算执行率', () => {
    expect(calculateExecutionRate(500000, 1000000)).toBe(50);
    expect(calculateExecutionRate(800000, 1000000)).toBe(80);
    expect(calculateExecutionRate(1000000, 1000000)).toBe(100);
  });

  it('超支时应返回超过100', () => {
    expect(calculateExecutionRate(1200000, 1000000)).toBe(120);
  });

  it('预算为零时应返回零', () => {
    expect(calculateExecutionRate(500000, 0)).toBe(0);
  });
});

describe('任务状态判断', () => {
  const isTaskOverdue = (task: ActivityTask): boolean => {
    if (task.status === '已完成') return false;
    return new Date(task.dueDate) < new Date();
  };

  it('已过期且未完成的任务应返回true', () => {
    const task: ActivityTask = {
      id: '1',
      name: '测试',
      assignee: '张三',
      dueDate: '2020-01-01',
      priority: 'P1',
      status: '进行中',
      createdAt: '2020-01-01'
    };
    expect(isTaskOverdue(task)).toBe(true);
  });

  it('已完成的任务应返回false', () => {
    const task: ActivityTask = {
      id: '1',
      name: '测试',
      assignee: '张三',
      dueDate: '2020-01-01',
      priority: 'P1',
      status: '已完成',
      createdAt: '2020-01-01'
    };
    expect(isTaskOverdue(task)).toBe(false);
  });

  it('未来截止的任务应返回false', () => {
    const task: ActivityTask = {
      id: '1',
      name: '测试',
      assignee: '张三',
      dueDate: '2099-12-31',
      priority: 'P1',
      status: '进行中',
      createdAt: '2020-01-01'
    };
    expect(isTaskOverdue(task)).toBe(false);
  });
});

describe('任务排序', () => {
  const sortTasks = (tasks: ActivityTask[]): ActivityTask[] => {
    return [...tasks].sort((a, b) => {
      const priorityOrder: Record<string, number> = { P0: 0, P1: 1, P2: 2 };
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) return priorityDiff;
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    });
  };

  it('应按优先级排序', () => {
    const tasks: ActivityTask[] = [
      { id: '1', name: 'P2', assignee: '', dueDate: '2099-01-01', priority: 'P2', status: '未开始', createdAt: '' },
      { id: '2', name: 'P0', assignee: '', dueDate: '2099-01-01', priority: 'P0', status: '未开始', createdAt: '' },
      { id: '3', name: 'P1', assignee: '', dueDate: '2099-01-01', priority: 'P1', status: '未开始', createdAt: '' },
    ];
    const sorted = sortTasks(tasks);
    expect(sorted[0].priority).toBe('P0');
    expect(sorted[1].priority).toBe('P1');
    expect(sorted[2].priority).toBe('P2');
  });

  it('相同优先级应按截止日期排序', () => {
    const tasks: ActivityTask[] = [
      { id: '1', name: '晚', assignee: '', dueDate: '2099-12-31', priority: 'P1', status: '未开始', createdAt: '' },
      { id: '2', name: '早', assignee: '', dueDate: '2099-01-01', priority: 'P1', status: '未开始', createdAt: '' },
    ];
    const sorted = sortTasks(tasks);
    expect(sorted[0].name).toBe('早');
    expect(sorted[1].name).toBe('晚');
  });
});