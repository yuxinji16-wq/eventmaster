/**
 * 供应商关联弹窗
 * 从 pages/ActivityDetail.tsx 行 407-482 迁移而来
 */
import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '../../../shared';
import { suppliersApi } from '../../../services/backendApi';

const SERVICE_TYPES = [
  { value: '搭建', label: '搭建' },
  { value: '设计', label: '设计' },
  { value: '影音', label: '影音' },
  { value: '印刷', label: '印刷' },
  { value: '礼品', label: '礼品' },
  { value: '其他', label: '其他' },
];

interface SupplierModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const SupplierModal: React.FC<SupplierModalProps> = ({ onClose, onSave }) => {
  const [supplierOptions, setSupplierOptions] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    serviceType: '',
    amount: 0,
  });

  useEffect(() => {
    suppliersApi.getList()
      .then(data => {
        setSupplierOptions(data);
        if (data[0]) {
          setSelectedId(String(data[0].id));
          setForm(prev => ({ ...prev, serviceType: data[0].category || '其他' }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const selectedSupplier = supplierOptions.find(s => String(s.id) === selectedId);

  return (
    <Modal title="关联供应商库供应商" onClose={onClose} size="md">
      <div className="space-y-4">
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">选择供应商 *</label>
          <Select
            value={selectedId}
            onChange={e => {
              setSelectedId(e.target.value);
              const supplier = supplierOptions.find(s => String(s.id) === e.target.value);
              setForm(prev => ({ ...prev, serviceType: supplier?.category || '其他' }));
            }}
            options={loading ? [{ value: '', label: '加载中...' }] : supplierOptions.map(s => ({ value: String(s.id), label: s.name }))}
          />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">服务类型</label>
          <Select value={form.serviceType} onChange={e => setForm({...form, serviceType: e.target.value})} options={SERVICE_TYPES} />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">合同金额</label>
          <Input type="number" value={form.amount} onChange={e => setForm({...form, amount: +e.target.value})} placeholder="输入合同金额（如无可不填）" />
        </div>
        {selectedSupplier && (
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
            联系人：{selectedSupplier.contact || '-'} · 电话：{selectedSupplier.phone || '-'}
          </div>
        )}
      </div>
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button
          variant="primary"
          onClick={() => {
            if (!selectedSupplier) return;
            onSave({
              supplierId: selectedSupplier.id,
              name: selectedSupplier.name,
              serviceType: form.serviceType || selectedSupplier.category || '其他',
              contact: selectedSupplier.contact || '',
              phone: selectedSupplier.phone || '',
              amount: form.amount,
            });
            onClose();
          }}
          disabled={!selectedSupplier}
        >
          关联
        </Button>
      </div>
    </Modal>
  );
};

export default SupplierModal;
