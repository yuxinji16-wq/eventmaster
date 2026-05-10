/**
 * 任务行组件
 * 从 pages/ActivityDetail.tsx 行 245-276 迁移而来
 */
import React from 'react';
import { Check, Edit, Trash2 } from 'lucide-react';
import { ActivityTask } from '../../../types';
import { getPriorityColor } from '../utils';

interface TaskRowProps {
  task: ActivityTask;
  onComplete: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onComplete, onEdit, onDelete }) => {
  const isOverdue = task.status !== '已完成' && new Date(task.dueDate) < new Date();
  const pColors = getPriorityColor(task.priority);

  return (
    <div className={`flex items-center justify-between p-3 rounded-xl border ${isOverdue ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100'}`}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {task.status !== '已完成' ? (
          <button onClick={onComplete} className="w-6 h-6 rounded-full border-2 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50 transition-colors" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center"><Check size={12} className="text-white" /></div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${pColors.bg} ${pColors.text}`}>{task.priority}</span>
            <span className="font-medium text-slate-800 truncate">{task.name}</span>
            {isOverdue && <span className="px-1.5 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-600">延期</span>}
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <span>{task.assignee}</span>
            <span>·</span>
            <span>{task.dueDate}</span>
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        <button onClick={onEdit} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={14} /></button>
        <button onClick={onDelete} className="p-2 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={14} /></button>
      </div>
    </div>
  );
};

export default TaskRow;
