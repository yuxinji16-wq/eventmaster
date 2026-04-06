import React from 'react';
import { X } from 'lucide-react';
import { BudgetCategory, BudgetItem } from '../../types';
import { BUDGET_CATEGORIES } from './BudgetManager';

interface BudgetItemModalProps {
  isOpen: boolean;
  editingBudgetItem: BudgetItem | null;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

const BudgetItemModal: React.FC<BudgetItemModalProps> = ({
  isOpen, editingBudgetItem, onClose, onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800">{editingBudgetItem ? '编辑预算明细' : '新增预算明细'}</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSave} className="p-8 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">费用类别</label>
            <select
              name="category"
              defaultValue={editingBudgetItem?.category || BUDGET_CATEGORIES[0]}
              className="w-full mt-2 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700"
            >
              {BUDGET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">预算金额</label>
              <input
                name="plannedAmount"
                type="number"
                defaultValue={editingBudgetItem?.plannedAmount || 0}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest">实际金额</label>
              <input
                name="actualAmount"
                type="number"
                defaultValue={editingBudgetItem?.actualAmount || 0}
                className="w-full mt-2 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700"
              />
            </div>
          </div>
          <div className="flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-3 bg-slate-100 rounded-xl font-bold text-slate-600">取消</button>
            <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">保存</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BudgetItemModal;
