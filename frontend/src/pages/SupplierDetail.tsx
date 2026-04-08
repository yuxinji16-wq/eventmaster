import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Supplier, SupplierReview, BillRecord } from '../types';
import { useSuppliersData } from '../utils/hooks';
import { suppliersApi } from '../services/backendApi';
import { BackButton, Card, LoadingSpinner } from '../shared';
import { useToast } from '../shared/Toast';
import { SupplierDetailView } from '../components/supplier/SupplierManager';

const SupplierDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { suppliers, loading, updateSupplier, deleteSupplier, addReview, addBill } = useSuppliersData();
  const [supplier, setSupplier] = useState<Supplier | null>(null);
  const [reviews, setReviews] = useState<SupplierReview[]>([]);
  const [bills, setBills] = useState<BillRecord[]>([]);
  const [detailLoading, setDetailLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Partial<Supplier>>({});

  // 加载供应商详情、评价和账单
  useEffect(() => {
    const loadDetail = async () => {
      if (!id) return;
      setDetailLoading(true);
      try {
        const numericId = parseInt(id);
        // 并行获取供应商详情、评价和账单
        const [detail, reviewsData, billsData] = await Promise.all([
          suppliersApi.getDetail(numericId),
          suppliersApi.getReviews(numericId),
          suppliersApi.getBills(numericId),
        ]);
        setSupplier({
          id: String(detail.id),
          name: detail.name,
          serviceType: detail.category as any,
          rating: detail.rating || 5,
          contact: detail.contact || '',
          phone: detail.phone || '',
          email: detail.email,
          address: detail.address,
          lastUsed: detail.last_used || new Date().toISOString().split('T')[0],
          tags: detail.tags || [],
          orderCount: detail.order_count || 0,
          bankName: detail.bank_name,
          bankAccount: detail.bank_account,
          reviews: reviewsData.map((r: any) => ({ id: String(r.id), user: r.comments || '匿名', date: r.created_at?.split('T')[0] || '', content: r.comments || '', rating: r.overall_score || 5 })) as SupplierReview[],
          bills: billsData.map((b: any) => ({ id: String(b.id), activityName: b.activity_name || '', projectName: b.notes || '', date: b.due_date || '', status: b.status === '已付款' ? '已结清' : '待结算', amount: b.amount })) as BillRecord[],
          created_at: detail.created_at,
          updated_at: detail.updated_at,
        });
        setReviews(reviewsData.map((r: any) => ({ id: String(r.id), user: r.comments || '匿名', date: r.created_at?.split('T')[0] || '', content: r.comments || '', rating: r.overall_score || 5 })) as SupplierReview[]);
        setBills(billsData.map((b: any) => ({ id: String(b.id), activityName: b.activity_name || '', projectName: b.notes || '', date: b.due_date || '', status: b.status === '已付款' ? '已结清' : '待结算', amount: b.amount })) as BillRecord[]);
        setEditingSupplier({
          name: detail.name,
          serviceType: detail.category as any,
          rating: detail.rating || 5,
          contact: detail.contact || '',
          phone: detail.phone || '',
          email: detail.email,
          address: detail.address,
          bankName: detail.bank_name,
          bankAccount: detail.bank_account,
          tags: detail.tags || [],
        });
      } catch (err) {
        console.error('Failed to load supplier detail:', err);
        // fallback to list data
        const found = suppliers.find(s => s.id === id);
        if (found) setSupplier(found);
      } finally {
        setDetailLoading(false);
      }
    };
    loadDetail();
  }, [id, suppliers]);

  const handleBack = () => {
    navigate('/suppliers');
  };

  const handleUpdate = async (updated: Supplier) => {
    if (!supplier) return;
    try {
      await updateSupplier(parseInt(supplier.id), updated);
      setSupplier(prev => prev ? { ...prev, ...updated } : prev);
      setIsEditModalOpen(false);
      toast.success('保存成功');
    } catch (error) {
      console.error('Failed to update supplier:', error);
      toast.error('保存失败');
    }
  };

  const handleAddReview = async (data: { content: string; rating: number }) => {
    if (!supplier) return;
    try {
      await addReview(parseInt(supplier.id), data);
      // 重新加载评价
      const reviewsData = await suppliersApi.getReviews(parseInt(supplier.id));
      const newReviews = reviewsData.map((r: any) => ({ id: String(r.id), user: r.comments || '匿名', date: r.created_at?.split('T')[0] || '', content: r.comments || '', rating: r.overall_score || 5 })) as SupplierReview[];
      setReviews(newReviews);
      setSupplier(prev => prev ? { ...prev, reviews: newReviews } : prev);
      setIsReviewModalOpen(false);
      toast.success('评价已添加');
    } catch {
      toast.error('添加评价失败');
    }
  };

  const handleAddBill = async (data: { activityName: string; projectName: string; amount: number; status: string; date: string }) => {
    if (!supplier) return;
    try {
      await addBill(parseInt(supplier.id), data);
      // 重新加载账单
      const billsData = await suppliersApi.getBills(parseInt(supplier.id));
      const newBills = billsData.map((b: any) => ({ id: String(b.id), activityName: b.activity_name || '', projectName: b.notes || '', date: b.due_date || '', status: b.status === '已付款' ? '已结清' : '待结算', amount: b.amount })) as BillRecord[];
      setBills(newBills);
      setSupplier(prev => prev ? { ...prev, bills: newBills } : prev);
      setIsBillModalOpen(false);
      toast.success('账单已添加');
    } catch {
      toast.error('添加账单失败');
    }
  };

  const handleDelete = async () => {
    if (!supplier) return;
    try {
      await deleteSupplier(parseInt(supplier.id));
      toast.success('删除成功');
      navigate('/suppliers');
    } catch {
      toast.error('删除失败');
    }
  };

  if (detailLoading || loading) {
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
      <SupplierDetailView
        supplier={supplier}
        onBack={handleBack}
        onUpdate={handleUpdate}
        onDelete={handleDelete}
        onAddReview={handleAddReview}
        onAddBill={handleAddBill}
        isReviewModalOpen={isReviewModalOpen}
        setIsReviewModalOpen={setIsReviewModalOpen}
        isBillModalOpen={isBillModalOpen}
        setIsBillModalOpen={setIsBillModalOpen}
        isEditModalOpen={isEditModalOpen}
        setIsEditModalOpen={setIsEditModalOpen}
        editingSupplier={editingSupplier}
        setEditingSupplier={setEditingSupplier}
      />
    </div>
  );
};

export default SupplierDetail;
