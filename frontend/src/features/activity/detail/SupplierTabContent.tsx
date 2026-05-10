/**
 * 供应商 Tab 内容
 * 从 pages/ActivityDetail.tsx 行 234-275 迁移而来
 */
import React from 'react';
import { Users, Plus } from 'lucide-react';
import { Card, Button } from '../../../shared';
import { SupplierRow } from '../rows/SupplierRow';
import { StatusPanelItem } from '../components/StatusPanelItem';

interface SupplierTabContentProps {
  suppliers: any[];
  onAdd: () => void;
  onConfirm: (id: string) => void;
  onStatusChange: (id: string, status: string) => void;
}

export const SupplierTabContent: React.FC<SupplierTabContentProps> = ({ suppliers, onAdd, onConfirm, onStatusChange }) => {
  const confirmed = suppliers.filter(s => s.orderCount > 0).length;

  return (
    <div className="space-y-4">
      <StatusPanelItem
        icon={<Users size={18} />}
        title="供应商"
        stats={[
          { label: '已确认', value: confirmed, color: 'text-emerald-600' },
          { label: '待确认', value: suppliers.length - confirmed, color: 'text-amber-600' },
          { label: '总计', value: suppliers.length },
        ]}
        status={suppliers.length === 0 ? undefined : confirmed === suppliers.length ? { type: 'success', text: '全部确认' } : { type: 'warning', text: `${suppliers.length - confirmed} 待确认` }}
      />
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">关联供应商 ({suppliers.length})</h3>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAdd}>新增</Button>
        </div>
        {suppliers.length > 0 ? (
          <div className="space-y-2">
            {suppliers.map(s => (
              <SupplierRow key={s.id} supplier={s} onConfirm={() => onConfirm(s.id)} onStatusChange={(status) => onStatusChange(s.id, status)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Users size={24} className="mx-auto mb-2" />
            <p>暂无关联供应商</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default SupplierTabContent;
