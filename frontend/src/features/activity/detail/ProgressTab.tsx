/**
 * 执行进度 Tab
 * 从 pages/ActivityDetail.tsx 行 107-175 迁移而来
 */
import React, { useState } from 'react';
import { Check, Plus, Download, ChevronUp, ChevronDown } from 'lucide-react';
import { Card, Button } from '../../../shared';
import { ActivityTask } from '../../../types';
import { TaskRow } from '../rows/TaskRow';
import { getPriorityColor } from '../utils';

interface ProgressTabProps {
  tasks: ActivityTask[];
  onAddTask: () => void;
  onEditTask: (t: ActivityTask) => void;
  onCompleteTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onImportTasks: () => void;
}

export const ProgressTab: React.FC<ProgressTabProps> = ({ tasks, onAddTask, onEditTask, onCompleteTask, onDeleteTask, onImportTasks }) => {
  const [showAll, setShowAll] = useState(false);
  const taskList = tasks || [];

  const sortedTasks = [...taskList].sort((a, b) => {
    const priorityOrder: Record<string, number> = { 'P0': 0, 'P1': 1, 'P2': 2 };
    const priorityDiff = (priorityOrder[a.priority] || 99) - (priorityOrder[b.priority] || 99);
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
  });

  const pendingTasks = sortedTasks.filter((t: ActivityTask) => t.status !== '已完成');
  const nextTask = pendingTasks[0];
  const displayTasks = showAll ? sortedTasks : sortedTasks.slice(0, 5);

  return (
    <div className="space-y-4">
      {nextTask && (
        <Card className="bg-gradient-to-r from-indigo-50 to-white border-indigo-100">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-indigo-500 uppercase mb-1">下一步动作</p>
              <h4 className="font-bold text-slate-800 text-lg">{nextTask.name}</h4>
              <div className="flex items-center gap-3 mt-2">
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${getPriorityColor(nextTask.priority).bg} ${getPriorityColor(nextTask.priority).text}`}>{nextTask.priority}</span>
                <span className="text-sm text-slate-500">{nextTask.assignee}</span>
                <span className="text-sm text-slate-400">·</span>
                <span className="text-sm text-slate-500">{nextTask.dueDate}</span>
              </div>
            </div>
            <Button size="sm" variant="primary" onClick={() => onCompleteTask(nextTask.id)}><Check size={14} /> 完成</Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">任务列表 ({tasks.length})</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowAll(!showAll)}>
              {showAll ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showAll ? '收起' : '展开全部'}
            </Button>
            <Button size="sm" variant="outline" icon={<Download size={14} />} onClick={onImportTasks}>导入</Button>
            <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAddTask}>新增</Button>
          </div>
        </div>
        <div className="space-y-2">
          {displayTasks.map(task => (
            <TaskRow key={task.id} task={task} onComplete={() => onCompleteTask(task.id)} onEdit={() => onEditTask(task)} onDelete={() => onDeleteTask(task.id)} />
          ))}
        </div>
        {!showAll && tasks.length > 5 && (
          <button onClick={() => setShowAll(true)} className="w-full mt-3 py-2 text-sm text-indigo-500 font-medium hover:bg-indigo-50 rounded-lg transition-colors">
            查看更多 {tasks.length - 5} 项任务...
          </button>
        )}
      </Card>
    </div>
  );
};

export default ProgressTab;
