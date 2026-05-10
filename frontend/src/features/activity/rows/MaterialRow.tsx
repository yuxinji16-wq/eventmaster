/**
 * 物料行组件
 * 从 pages/ActivityDetail.tsx 行 310-332 迁移而来
 */
import React from 'react';
import { Package } from 'lucide-react';

interface MaterialRowProps {
  material: {
    name: string;
    stock?: number;
    unit?: string;
    status?: string;
  };
  onStatusChange: (status: string) => void;
}

export const MaterialRow: React.FC<MaterialRowProps> = ({ material, onStatusChange }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
      <div className="flex items-center gap-3">
        <Package size={16} className="text-slate-400" />
        <div>
          <p className="font-medium text-slate-700">{material.name}</p>
          <p className="text-xs text-slate-400">库存 {material.stock} {material.unit}</p>
        </div>
      </div>
      <select value={material.status || 'In Stock'} onChange={(e) => onStatusChange(e.target.value)}
        className={`px-3 py-1 rounded-lg text-xs font-medium border ${
          material.status === 'In Stock' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' :
          material.status === 'Low Stock' ? 'bg-amber-50 border-amber-200 text-amber-600' :
          'bg-rose-50 border-rose-200 text-rose-600'
        }`}>
        <option value="In Stock">充足</option>
        <option value="Low Stock">偏低</option>
        <option value="Out of Stock">缺货</option>
      </select>
    </div>
  );
};

export default MaterialRow;
