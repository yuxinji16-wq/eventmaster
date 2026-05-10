/**
 * 任务编辑弹窗
 * 从 pages/ActivityDetail.tsx 行 109-167 迁移而来
 */
import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../shared';
import { ActivityTask } from '../../../types';

const PRIORITY_OPTIONS = [
  { value: 'P0', label: 'P0 - 紧急重要' },
  { value: 'P1', label: 'P1 - 重要' },
  { value: 'P2', label: 'P2 - 一般' },
];

const TASK_STATUS_OPTIONS = [
  { value: '未开始', label: '未开始' },
  { value: '进行中', label: '进行中' },
  { value: '已完成', label: '已完成' },
  { value: '阻塞', label: '阻塞' },
];

interface TaskModalProps {
  task?: ActivityTask | null;
  onClose: () => void;
  onSave: (data: Partial<ActivityTask>) => Promise<void>;
  onDelete?: (id: string) => Promise<void>;
}

export const TaskModal: React.FC<TaskModalProps> = ({ task, onClose, onSave, onDelete }) => {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: task?.name || '',
    description: task?.description || '',
    assignee: task?.assignee || '',
    dueDate: task?.dueDate || '',
    priority: task?.priority || 'P1',
    status: task?.status || '未开始',
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

  const handleDelete = async () => {
    if (!task || !onDelete) return;
    if (!confirm('确定要删除此任务吗？')) return;
    try {
      await onDelete(task.id);
      onClose();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  return (
    <Modal title={task ? '编辑任务' : '新增任务'} onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">任务名称 *</label>
          <Input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="输入任务名称" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">描述</label>
          <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
            placeholder="任务描述" className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none" rows={2} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">负责人 *</label>
            <Input value={form.assignee} onChange={e => setForm({...form, assignee: e.target.value})} placeholder="输入负责人" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">截止日期 *</label>
            <Input type="date" value={form.dueDate} onChange={e => setForm({...form, dueDate: e.target.value})} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">优先级</label>
            <Select value={form.priority} onChange={e => setForm({...form, priority: e.target.value as any})} options={PRIORITY_OPTIONS} />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">状态</label>
            <Select value={form.status} onChange={e => setForm({...form, status: e.target.value as any})} options={TASK_STATUS_OPTIONS} />
          </div>
        </div>
      </div>
      <div className="flex-between mt-6 flex justify-between">
        <div>{task && onDelete && <Button variant="danger" onClick={handleDelete}>删除</Button>}</div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onClose}>取消</Button>
          <Button variant="primary" onClick={handleSave} disabled={saving || !form.name}>
            {saving ? '保存中...' : '保存'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default TaskModal;
