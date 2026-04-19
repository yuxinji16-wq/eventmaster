import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Material } from '../types';
import { materialsApi } from '../services/backendApi';
import { BackButton, Card, LoadingSpinner } from '../shared';
import { MaterialDetailView } from '../components/material/MaterialManager';
import { adaptMaterial } from '../utils/hooks';

interface WarehousingLog {
  id: string;
  materialName: string;
  count: number;
  operator: string;
  date: string;
  isNewType: boolean;
}

interface WithdrawalLog {
  id: string;
  materialName: string;
  count: number;
  unit: string;
  user: string;
  reason: string;
  date: string;
  status?: string;
}

const MaterialDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);

  // 物料流转日志状态
  const [warehousingLogs, setWarehousingLogs] = useState<WarehousingLog[]>([]);
  const [withdrawalLogs, setWithdrawalLogs] = useState<WithdrawalLog[]>([]);

  useEffect(() => {
    if (id) {
      setLoading(true);
      Promise.all([
        materialsApi.getDetail(parseInt(id)),
        materialsApi.getWarehousingLogs(parseInt(id)),
        materialsApi.getWithdrawalLogs({ materialId: parseInt(id) }),
      ])
        .then(([data, warehousing, withdrawals]) => {
          setMaterial(adaptMaterial(data));
          setWarehousingLogs(warehousing.map((log: any) => ({
            id: String(log.id),
            materialName: log.material_name,
            count: log.count,
            operator: log.operator || '',
            date: log.date || log.created_at,
            isNewType: log.is_new_type === true || log.is_new_type === 'true',
          })));
          setWithdrawalLogs(withdrawals.map((log: any) => ({
            id: String(log.id),
            materialName: log.material_name,
            count: log.count,
            unit: log.unit || '',
            user: log.user || '',
            reason: log.reason || '',
            date: log.date || log.created_at,
            status: log.status || '领用中',
          })));
        })
        .catch(err => {
          setMaterial(null);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleBack = () => {
    navigate('/materials');
  };

  const handleEdit = async (updated: Material) => {
    if (!material) return;
    try {
      await materialsApi.update(parseInt(material.id), updated as any);
      setMaterial(updated);
    } catch (error) {
      console.error('Failed to update material:', error);
    }
  };

  // 处理库存增加（入库）
  const handleAddStock = async (count: number) => {
    if (!material) return;
    const newLog: WarehousingLog = {
      id: `log-${Date.now()}`,
      materialName: material.name,
      count,
      operator: '当前用户',
      date: new Date().toISOString().replace('T', ' ').slice(0, 19),
      isNewType: false
    };
    setWarehousingLogs(prev => [newLog, ...prev]);
    try {
      await materialsApi.addStock(parseInt(material.id), { count, operator: '当前用户', is_new_type: false });
      // 刷新物料详情
      const updated = await materialsApi.getDetail(parseInt(material.id));
      setMaterial(adaptMaterial(updated));
    } catch (error) {
      console.error('Failed to add stock:', error);
    }
  };

  // 处理库存减少（领用）
  const handleWithdraw = async (count: number, user: string, reason: string) => {
    if (!material) return;
    const newLog: WithdrawalLog = {
      id: `wlog-${Date.now()}`,
      materialName: material.name,
      count,
      unit: material.unit,
      user,
      reason,
      date: new Date().toISOString().replace('T', ' ').slice(0, 19)
    };
    setWithdrawalLogs(prev => [newLog, ...prev]);
    try {
      await materialsApi.withdraw(parseInt(material.id), { count, user, reason });
      // 刷新物料详情
      const updated = await materialsApi.getDetail(parseInt(material.id));
      setMaterial(adaptMaterial(updated));
    } catch (error) {
      console.error('Failed to withdraw:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回物料列表" />
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (!material) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回物料列表" />
        <Card>
          <div className="text-center py-12">
            <p className="text-slate-500">物料不存在或已被删除</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={handleBack} label="返回物料列表" />
      <MaterialDetailView material={material} onBack={handleBack} onEdit={handleEdit} warehousingLogs={warehousingLogs} withdrawalLogs={withdrawalLogs} />
    </div>
  );
};

export default MaterialDetail;
