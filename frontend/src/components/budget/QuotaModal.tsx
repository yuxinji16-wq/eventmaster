import React from 'react';
import { X } from 'lucide-react';

interface QuotaModalProps {
  isOpen: boolean;
  selectedYear: string;
  totalApproved: number;
  onClose: () => void;
  onSave: (e: React.FormEvent<HTMLFormElement>) => void;
}

const QuotaModal: React.FC<QuotaModalProps> = ({
  isOpen, selectedYear, totalApproved, onClose, onSave
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md z-10 overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="text-xl font-black text-slate-800">{selectedYear} 年度配额</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
            <X size={20} />
          </button>
        </div>
        <form onSubmit={onSave} className="p-8 space-y-4">
          <div>
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">年度预算总额</label>
            <input
              name="quota"
              type="number"
              defaultValue={totalApproved}
              className="w-full mt-2 px-4 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold text-slate-700 text-xl"
            />
          </div>
          <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">确认调整</button>
        </form>
      </div>
    </div>
  );
};

export default QuotaModal;
