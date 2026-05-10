/**
 * 物料 Tab 内容
 * 从 pages/ActivityDetail.tsx 行 277-305 迁移而来
 */
import React from 'react';
import { Package, Plus } from 'lucide-react';
import { Card, Button } from '../../../shared';
import { MaterialRow } from '../rows/MaterialRow';

interface MaterialTabContentProps {
  materials: any[];
  onAdd: () => void;
  onStatusChange: (id: string, status: string) => void;
}

export const MaterialTabContent: React.FC<MaterialTabContentProps> = ({ materials, onAdd, onStatusChange }) => {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">领用物料 ({materials.length})</h3>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAdd}>新增领用</Button>
        </div>
        {materials.length > 0 ? (
          <div className="space-y-2">
            {materials.map(m => (
              <MaterialRow key={m.id} material={m} onStatusChange={(status) => onStatusChange(m.id, status)} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <Package size={24} className="mx-auto mb-2" />
            <p>暂无领用物料</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MaterialTabContent;
