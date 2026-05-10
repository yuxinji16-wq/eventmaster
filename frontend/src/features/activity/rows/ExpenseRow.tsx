/**
 * 费用行组件
 * 从 pages/ActivityDetail.tsx 行 359-381 迁移而来
 */
import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { ExpenseItem } from '../../../types';

interface ExpenseRowProps {
  item: ExpenseItem;
  onEdit: () => void;
  onDelete: () => void;
}

export const ExpenseRow: React.FC<ExpenseRowProps> = ({ item, onEdit, onDelete }) => {
  const variance = item.actualAmount - item.plannedAmount;
  const variancePercent = item.plannedAmount > 0 ? (variance / item.plannedAmount * 100) : 0;
  const isOver = variance > 0;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
      <div>
        <p className="font-medium text-slate-700">{item.name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          预算 ¥{item.plannedAmount.toLocaleString()} · 实际 ¥{item.actualAmount.toLocaleString()}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-sm font-bold ${isOver ? 'text-rose-600' : 'text-emerald-600'}`}>
          {isOver ? '+' : ''}{variancePercent.toFixed(0)}%
        </span>
        <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400"><Edit size={12} /></button>
        <button onClick={onDelete} className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-500"><Trash2 size={12} /></button>
      </div>
    </div>
  );
};

export default ExpenseRow;
