/**
 * 商机新增弹窗
 * 从 pages/ActivityDetail.tsx 行 695-780 迁移而来
 */
import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../shared';
import { useToast } from '../../../shared/Toast';

interface OpportunityModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({ onClose, onSave }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    clientName: '',
    contactName: '',
    phone: '',
    email: '',
    requirement: '',
    region: '华北',
    owner: '',
  });

  return (
    <Modal title="新增线索" onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">客户单位 *</label>
          <Input value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} placeholder="输入客户单位名称" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">姓名 *</label>
            <Input value={form.contactName} onChange={e => setForm({...form, contactName: e.target.value})} placeholder="输入联系人姓名" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">联系方式 *</label>
            <Input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="输入电话" />
          </div>
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">邮箱</label>
          <Input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="输入邮箱" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">需求描述 *</label>
          <textarea
            value={form.requirement}
            onChange={e => setForm({...form, requirement: e.target.value})}
            placeholder="描述客户需求..."
            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none resize-none"
            rows={3}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">所属区域 *</label>
            <Select
              value={form.region}
              onChange={e => setForm({...form, region: e.target.value})}
              options={[
                { value: '华北', label: '华北' },
                { value: '华东', label: '华东' },
                { value: '华南', label: '华南' },
                { value: '华中', label: '华中' },
                { value: '西南', label: '西南' },
                { value: '西北', label: '西北' },
                { value: '东北', label: '东北' },
                { value: '港澳台', label: '港澳台' },
                { value: '海外', label: '海外' },
              ]}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">对接人 *</label>
            <Input value={form.owner} onChange={e => setForm({...form, owner: e.target.value})} placeholder="输入对接人" />
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={() => {
          if (!form.clientName.trim() || !form.contactName.trim() || !form.phone.trim()) {
            toast.error('请填写客户单位、姓名和联系方式');
            return;
          }
          if (!form.region || !form.owner) {
            toast.error('请填写区域和对接人');
            return;
          }
          onSave(form);
          onClose();
        }}>添加</Button>
      </div>
    </Modal>
  );
};

export default OpportunityModal;
