/**
 * 物料领用弹窗
 * 从 pages/ActivityDetail.tsx 行 484-693 迁移而来
 */
import React, { useState, useEffect } from 'react';
import { X, Loader2, Package } from 'lucide-react';
import { Modal, Button, Input, Select } from '../../../shared';
import { useToast } from '../../../shared/Toast';
import { materialsApi } from '../../../services/backendApi';

const MATERIAL_CATEGORIES = [
  { value: '产品宣传册', label: '产品宣传册' },
  { value: '易拉宝', label: '易拉宝' },
  { value: '会议定制', label: '会议定制' },
  { value: '礼品', label: '礼品' },
  { value: '办公用品', label: '办公用品' },
  { value: '其他', label: '其他' },
];

interface MaterialModalProps {
  activityId: string;
  onClose: () => void;
  onSave: (data: any) => void;
}

export const MaterialModal: React.FC<MaterialModalProps> = ({ activityId, onClose, onSave }) => {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [withdrawCount, setWithdrawCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.keyword = search;
      const response = await materialsApi.getList(params);
      setMaterials(response);
    } catch (err) {
      console.error('加载物料失败:', err);
      setMaterials([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMaterials(); }, [categoryFilter]);

  useEffect(() => {
    const timer = setTimeout(() => { loadMaterials(); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const getStockStatus = (stock: number) => {
    if (stock === 0) return { label: '缺货', color: 'bg-rose-100 text-rose-600' };
    if (stock <= 10) return { label: '预警', color: 'bg-amber-100 text-amber-600' };
    return { label: '充足', color: 'bg-emerald-100 text-emerald-600' };
  };

  const handleSelectMaterial = (material: any) => {
    setSelectedMaterial(material);
    setWithdrawCount(1);
  };

  const handleCancelSelect = () => {
    setSelectedMaterial(null);
    setWithdrawCount(1);
  };

  const handleSubmit = async () => {
    if (!selectedMaterial || withdrawCount < 1 || withdrawCount > selectedMaterial.stock) return;
    setSubmitting(true);
    try {
      await materialsApi.withdraw(selectedMaterial.id, {
        count: withdrawCount,
        user: '活动领用',
        reason: `活动物料领用: ${selectedMaterial.name}`,
        activity_id: parseInt(activityId, 10),
      });
      onSave({
        warehouseId: selectedMaterial.id,
        name: selectedMaterial.name,
        category: selectedMaterial.category,
        count: withdrawCount,
        unit: selectedMaterial.unit || '个',
        warehouseStock: selectedMaterial.stock,
      });
      toast.success(`已从仓库领用 ${withdrawCount} ${selectedMaterial.unit} "${selectedMaterial.name}"`);
      onClose();
    } catch (err) {
      console.error('领用失败:', err);
      toast.error('领用失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal title="物料领用" onClose={onClose} size="lg">
      <div className="space-y-4">
        {!selectedMaterial && (
          <div className="flex gap-3">
            <div className="flex-1">
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索物料名称..." />
            </div>
            <div className="w-40">
              <Select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                options={[{ value: '', label: '全部分类' }, ...MATERIAL_CATEGORIES]}
              />
            </div>
          </div>
        )}

        {!selectedMaterial && (
          <div className="border border-slate-200 rounded-lg max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">
                <Loader2 className="animate-spin mx-auto mb-2" size={24} />
                <p className="text-sm">加载中...</p>
              </div>
            ) : materials.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Package size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无物料数据</p>
              </div>
            ) : (
              materials.map(m => {
                const status = getStockStatus(m.stock);
                return (
                  <div
                    key={m.id}
                    onClick={() => m.stock > 0 && handleSelectMaterial(m)}
                    className={`px-4 py-3 flex justify-between items-center border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors ${
                      m.stock > 0 ? 'hover:bg-indigo-50' : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{m.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${status.color}`}>{status.label}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{m.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-slate-700">
                        库存: <span className={m.stock <= 10 ? 'text-amber-600' : 'text-emerald-600'}>{m.stock}</span> {m.unit}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {selectedMaterial && (
          <div className="border-2 border-indigo-200 rounded-lg p-4 bg-indigo-50">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="font-bold text-indigo-800 text-lg">{selectedMaterial.name}</p>
                <p className="text-sm text-indigo-600">{selectedMaterial.category}</p>
              </div>
              <button onClick={handleCancelSelect} className="text-indigo-400 hover:text-indigo-600">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">当前库存</p>
                <p className={`text-2xl font-black ${selectedMaterial.stock <= 10 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {selectedMaterial.stock}
                </p>
                <p className="text-xs text-slate-400">{selectedMaterial.unit}</p>
              </div>
              <div className="bg-white rounded-lg p-3 text-center">
                <p className="text-xs text-slate-400 uppercase font-bold">领用数量</p>
                <Input
                  type="number"
                  value={withdrawCount}
                  onChange={e => setWithdrawCount(Math.max(1, Math.min(selectedMaterial.stock, +e.target.value)))}
                  min={1}
                  max={selectedMaterial.stock}
                  className="text-center text-xl font-bold"
                />
              </div>
            </div>

            {withdrawCount > selectedMaterial.stock && (
              <div className="text-center text-rose-500 text-sm mb-3">
                领用数量不能超过当前库存（{selectedMaterial.stock}）
              </div>
            )}

            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={onClose}>取消</Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={withdrawCount < 1 || withdrawCount > selectedMaterial.stock || submitting}
              >
                {submitting ? '提交中...' : '确认领用'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default MaterialModal;
