/**
 * 供应商行组件
 * 从 pages/ActivityDetail.tsx 行 278-308 迁移而来
 */
import React from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface SupplierRowProps {
  supplier: {
    name: string;
    serviceType?: string;
    contact?: string;
    status?: string;
    orderCount?: number;
  };
  onConfirm: () => void;
  onStatusChange: (status: string) => void;
}

export const SupplierRow: React.FC<SupplierRowProps> = ({ supplier, onConfirm, onStatusChange }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${(supplier.orderCount || 0) > 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
          {(supplier.orderCount || 0) > 0 ? <CheckCircle2 size={16} /> : <Clock size={16} />}
        </div>
        <div>
          <p className="font-medium text-slate-700">{supplier.name}</p>
          <p className="text-xs text-slate-400">{supplier.serviceType} · {supplier.contact}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {(supplier.orderCount || 0) > 0 ? (
          <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-medium">已确认</span>
        ) : (
          <button onClick={onConfirm} className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100">确认</button>
        )}
        <select value={supplier.status || ''} onChange={(e) => onStatusChange(e.target.value)}
          className="px-2 py-1 rounded-lg border border-slate-200 text-xs font-medium bg-white">
          <option value="">状态</option>
          <option value="接洽中">接洽中</option>
          <option value="报价中">报价中</option>
          <option value="已签约">已签约</option>
          <option value="执行中">执行中</option>
          <option value="已完成">已完成</option>
        </select>
      </div>
    </div>
  );
};

export default SupplierRow;
