import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Supplier } from '../types';
import { useSuppliersData } from '../utils/hooks';
import { BackButton, Card, LoadingSpinner } from '../shared';
import SupplierDetailView from '../components/supplier/SupplierManager';

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { suppliers, loading, updateSupplier } = useSuppliersData();
  const [supplier, setSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    if (id && suppliers.length > 0) {
      const found = suppliers.find(s => s.id === id);
      setSupplier(found || null);
    }
  }, [id, suppliers]);

  const handleBack = () => {
    navigate('/suppliers');
  };

  const handleUpdate = async (updated: Supplier) => {
    if (!supplier) return;
    try {
      await updateSupplier(parseInt(supplier.id), updated);
      setSupplier(updated);
    } catch (error) {
      console.error('Failed to update supplier:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回供应商列表" />
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回供应商列表" />
        <Card>
          <div className="text-center py-12">
            <p className="text-slate-500">供应商不存在或已被删除</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={handleBack} label="返回供应商列表" />
      <SupplierDetailView supplier={supplier} onBack={handleBack} onUpdate={handleUpdate} />
    </div>
  );
};

export default SupplierDetail;
