/**
 * 费用编辑弹窗
 * 从 pages/ActivityDetail.tsx 行 364-405 迁移而来
 */
import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../shared';
import { ExpenseItem } from '../../../types';

const EXPENSE_CATEGORIES = [
  { value: '场地租用', label: '场地租用' },
  { value: '搭建/展览', label: '搭建/展览' },
  { value: '物料制作', label: '物料制作' },
  { value: '差旅/住宿', label: '差旅/住宿' },
  { value: '餐饮/招待', label: '餐饮/招待' },
  { value: '礼品/赠品', label: '礼品/赠品' },
  { value: '媒体/推广', label: '媒体/推广' },
  { value: '其他', label: '其他' },
];

interface ExpenseModalProps {
  expense?: ExpenseItem | null;
  onClose: () => void;
  onSave: (data: Partial<ExpenseItem>) => Promise<void>;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ expense, onClose, onSave }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: expense?.name || '',
    category: expense?.category || '其他',
    plannedAmount: expense?.plannedAmount || 0,
    actualAmount: expense?.actualAmount || 0,
  });

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (error) {
      console.error('保存失败:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={expense ? '编辑预算项' : '新增预算项'} onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">名称 *</label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="输入名称" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">类别</label>
          <Select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
            options={EXPENSE_CATEGORIES} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">预算金额</label>
            <Input type="number" value={form.plannedAmount} onChange={e => setForm({...form, plannedAmount: +e.target.value})} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">实际金额</label>
            <Input type="number" value={form.actualAmount} onChange={e => setForm({...form, actualAmount: +e.target.value})} />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={handleSave} disabled={saving || !form.name}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </div>
    </Modal>
  );
};

export default ExpenseModal;
