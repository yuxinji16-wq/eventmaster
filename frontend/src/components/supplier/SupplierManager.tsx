
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSuppliersData } from '../../utils/hooks';
import { Supplier, SupplierReview, BillRecord } from '../../types';
import { useToast } from '../../shared/Toast';
import {
  Star, Phone, User, ExternalLink, ShieldCheck, ArrowLeft, Download,
  Edit3, Plus, MessageSquare, History, FileText, Mail, MapPin,
  Trash2, CreditCard, ChevronRight, UploadCloud, X, Check, Briefcase, Search, Settings, Copy, Landmark
} from 'lucide-react';

const CATEGORIES = ['全部', '搭建', '设计', '影音', '礼品', '印刷'];

const SupplierManager: React.FC = () => {
  const navigate = useNavigate();
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);
  const { suppliers, loading, addSupplier, updateSupplier, deleteSupplier } = useSuppliersData();
  const [activeCategory, setActiveCategory] = useState('全部');
  const [searchQuery, setSearchQuery] = useState('');
  
  // 弹窗状态
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchesCat = activeCategory === '全部' || s.serviceType === activeCategory;
      const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.contact.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            s.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [suppliers, activeCategory, searchQuery]);

  const selectedSupplier = suppliers.find(s => s.id === selectedSupplierId);

  const handleSaveSupplier = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data: Partial<Supplier> = {
      name: formData.get('name') as string,
      serviceType: formData.get('serviceType') as any,
      rating: Number(formData.get('rating')),
      contact: formData.get('contact') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      address: formData.get('address') as string,
      bankName: formData.get('bankName') as string,
      bankAccount: formData.get('bankAccount') as string,
      tags: (formData.get('tags') as string).split(/[，,]/).filter(t => t.trim()),
    };

    if (editingSupplier) {
      await updateSupplier(parseInt(editingSupplier.id), data);
    } else {
      await addSupplier(data);
    }
    setIsAddModalOpen(false);
    setEditingSupplier(null);
  };

  const handleUpdateDetail = async (updated: Supplier) => {
    await updateSupplier(parseInt(updated.id), updated);
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* 移除内部标题，保持简洁，统计信息移入搜索栏下方 */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-slate-500 font-bold">共管理 <span className="text-indigo-600">{suppliers.length}</span> 家核心合作伙伴档案</p>
      </div>

      {/* 搜索与分类 Tab 栏 */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-wrap items-center gap-8">
        <div className="flex-1 min-w-[300px] relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="搜索供应商、联系人、标签..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 transition-all outline-none font-bold text-slate-700 shadow-inner"
          />
        </div>

        <div className="flex items-center gap-4">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">主营类别</span>
          <div className="flex p-1 bg-slate-50 rounded-xl border border-slate-100 shadow-inner">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${
                  activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button 
          onClick={() => { setEditingSupplier(null); setIsAddModalOpen(true); }}
          className="bg-indigo-600 text-white px-8 py-3.5 rounded-xl font-black shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={20} /> 录入新供应商
        </button>
      </div>

      {/* 供应商卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-10">
        {filteredSuppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 group hover:border-indigo-400 hover:shadow-lg transition-all relative overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-start mb-3">
              <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded text-xs font-black uppercase tracking-widest border border-indigo-100">
                {supplier.serviceType}
              </span>
              <div className="flex items-center gap-1 text-amber-400">
                <Star size={14} fill="currentColor" />
                <span className="text-sm font-black text-slate-800">{supplier.rating}</span>
              </div>
            </div>

            <h3 className="text-base font-black text-slate-800 mb-3 group-hover:text-indigo-600 transition-colors leading-tight line-clamp-2 flex-1">
              {supplier.name}
            </h3>

            <div className="flex flex-wrap gap-1 mb-4">
              {supplier.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="text-xs font-medium text-slate-400">#{tag}</span>
              ))}
            </div>

            <div className="space-y-2 text-sm text-slate-600 mb-4">
              {supplier.contact && (
                <div className="flex items-center gap-2">
                  <User size={14} className="text-slate-300" />
                  <span className="font-medium truncate">{supplier.contact}</span>
                </div>
              )}
              {supplier.phone && (
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-slate-300" />
                  <span className="font-medium">{supplier.phone}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2">
                  <Mail size={14} className="text-slate-300" />
                  <span className="font-medium truncate">{supplier.email}</span>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-auto">
              <span className="text-xs text-slate-400 font-medium">合作 {supplier.orderCount || 0} 笔</span>
              <button
                onClick={() => navigate(`/suppliers/${supplier.id}`)}
                className="text-indigo-600 text-xs font-black uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all"
              >
                查看档案 <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 录入/编辑 模态框 */}
      {isAddModalOpen && (
        <SupplierFormModal 
          editingSupplier={editingSupplier} 
          onClose={() => setIsAddModalOpen(false)} 
          onSubmit={handleSaveSupplier} 
        />
      )}
    </div>
  );
};

// 供应商表单模态框组件 (保持不变，已在之前代码中定义)
const SupplierFormModal: React.FC<{ 
  editingSupplier: Supplier | null; 
  onClose: () => void; 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void 
}> = ({ editingSupplier, onClose, onSubmit }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl z-10 animate-in zoom-in duration-300">
      <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="text-2xl font-black text-slate-800 tracking-tight">{editingSupplier ? '更新供应商档案' : '录入新供应商'}</h3>
        <button onClick={onClose} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
      </div>
      <form onSubmit={onSubmit} className="p-10 space-y-4 max-h-[70vh] overflow-y-auto">
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-400 uppercase px-1">公司全称</label>
          <input required name="name" defaultValue={editingSupplier?.name} className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase px-1">服务类别</label>
            <select name="serviceType" defaultValue={editingSupplier?.serviceType || '搭建'} className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold">
              {CATEGORIES.filter(c => c !== '全部').map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase px-1">内部评分</label>
            <input name="rating" type="number" step="0.1" max="5" defaultValue={editingSupplier?.rating || 4.5} className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase px-1">主要联系人</label>
            <input name="contact" defaultValue={editingSupplier?.contact} className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold shadow-inner" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase px-1">联系电话</label>
            <input name="phone" defaultValue={editingSupplier?.phone} className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold shadow-inner" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-400 uppercase px-1">电子邮箱</label>
          <input name="email" defaultValue={editingSupplier?.email} className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold shadow-inner" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase px-1">开户银行</label>
            <input name="bankName" defaultValue={editingSupplier?.bankName} className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold shadow-inner" />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-black text-slate-400 uppercase px-1">银行账号</label>
            <input name="bankAccount" defaultValue={editingSupplier?.bankAccount} className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold shadow-inner" />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-black text-slate-400 uppercase px-1">标签 (用逗号分隔)</label>
          <input name="tags" defaultValue={editingSupplier?.tags?.join(',')} placeholder="如：自有工厂, 高配合度" className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold shadow-inner" />
        </div>
        <div className="pt-4">
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-xl shadow-indigo-500/20 uppercase tracking-widest">保存档案</button>
        </div>
      </form>
    </div>
  </div>
);

// 详情页组件 (SupplierDetailView)
const SupplierDetailView: React.FC<{
  supplier: Supplier;
  onBack: () => void;
  onUpdate: (updated: Supplier) => void;
  onDelete?: () => void;
  onAddReview?: (data: { content: string; rating: number }) => void;
  onAddBill?: (data: { activityName: string; projectName: string; amount: number; status: string; date: string }) => void;
  isReviewModalOpen?: boolean;
  setIsReviewModalOpen?: (open: boolean) => void;
  isBillModalOpen?: boolean;
  setIsBillModalOpen?: (open: boolean) => void;
  isEditModalOpen?: boolean;
  setIsEditModalOpen?: (open: boolean) => void;
  editingSupplier?: Partial<Supplier>;
  setEditingSupplier?: (supplier: Partial<Supplier>) => void;
}> = ({
  supplier,
  onBack,
  onUpdate,
  onDelete,
  onAddReview,
  onAddBill,
  isReviewModalOpen: externalReviewModal,
  setIsReviewModalOpen: setExternalReviewModal,
  isBillModalOpen: externalBillModal,
  setIsBillModalOpen: setExternalBillModal,
  isEditModalOpen: externalEditModal,
  setIsEditModalOpen: setExternalEditModal,
}) => {
  const toast = useToast();
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  // 使用外部状态如果提供，否则使用内部状态
  const [internalReviewModal, setInternalReviewModal] = useState(false);
  const [internalBillModal, setInternalBillModal] = useState(false);
  const [internalEditModal, setInternalEditModal] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [billLoading, setBillLoading] = useState(false);

  const isReviewModalOpen = externalReviewModal !== undefined ? externalReviewModal : internalReviewModal;
  const setIsReviewModalOpen = setExternalReviewModal || setInternalReviewModal;
  const isBillModalOpen = externalBillModal !== undefined ? externalBillModal : internalBillModal;
  const setIsBillModalOpen = setExternalBillModal || setInternalBillModal;
  const isEditModalOpen = externalEditModal !== undefined ? externalEditModal : internalEditModal;
  const setIsEditModalOpen = setExternalEditModal || setInternalEditModal;

  const copyToClipboard = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    toast.success('已复制', '已复制到剪贴板');
  };

  const handleAddReview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onAddReview) {
      const formData = new FormData(e.currentTarget);
      await onAddReview({
        content: formData.get('content') as string,
        rating: Number(formData.get('rating')),
      });
      return;
    }
    setReviewLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      // 内部逻辑通过 useSuppliersData
      setIsReviewModalOpen(false);
    } catch (err) {
      console.error('Failed to add review:', err);
      toast.error('添加失败', '添加评价失败');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddBill = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (onAddBill) {
      const formData = new FormData(e.currentTarget);
      await onAddBill({
        activityName: formData.get('activityName') as string,
        projectName: formData.get('projectName') as string,
        amount: Number(formData.get('amount')),
        status: formData.get('status') as string,
        date: formData.get('date') as string,
      });
      return;
    }
    setBillLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      // 内部逻辑通过 useSuppliersData
      setIsBillModalOpen(false);
    } catch (err) {
      console.error('Failed to add bill:', err);
      toast.error('添加失败', '添加账单失败');
    } finally {
      setBillLoading(false);
    }
  };

  const handleEditSupplierSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const updated: Supplier = {
      ...supplier,
      name: formData.get('name') as string,
      serviceType: formData.get('serviceType') as any,
      rating: Number(formData.get('rating')),
      contact: formData.get('contact') as string,
      phone: formData.get('phone') as string,
      email: formData.get('email') as string,
      bankName: formData.get('bankName') as string,
      bankAccount: formData.get('bankAccount') as string,
      tags: (formData.get('tags') as string).split(/[，,]/).filter(t => t.trim()),
    };
    onUpdate(updated);
    setIsEditModalOpen(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete();
    }
    setDeleteConfirmOpen(false);
  };

  return (
    <div className="max-w-[1400px] mx-auto pb-20">
      <div className="flex items-center justify-between mb-6">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-sm uppercase tracking-widest transition-colors active:scale-95"><ArrowLeft size={20} /> 返回列表</button>
        <div className="flex gap-4">
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="px-6 py-3 text-sm font-black text-rose-500 bg-white border border-rose-200 rounded-xl hover:bg-rose-50 shadow-sm transition-all flex items-center gap-2"
          >
            <Trash2 size={16} /> 删除供应商
          </button>
          <button className="px-6 py-3 text-sm font-black text-slate-500 bg-white border border-slate-100 rounded-xl hover:bg-slate-50 shadow-sm transition-all">导出评价摘要</button>
          <button onClick={() => setIsEditModalOpen(true)} className="px-8 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black shadow-xl shadow-indigo-500/20 hover:bg-indigo-700 transition-all active:scale-95">编辑供应商档案</button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col md:flex-row justify-between items-center gap-4 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-2 h-full bg-indigo-600"></div>
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-2xl font-black text-slate-800 tracking-tighter leading-none">{supplier.name}</h1>
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black rounded-lg border border-indigo-100 uppercase tracking-widest">{supplier.serviceType}</span>
          </div>
          <div className="flex gap-2">
            {supplier.tags?.map(tag => <span key={tag} className="text-xs font-bold text-slate-400">#{tag}</span>)}
          </div>
        </div>
        <div className="text-center md:text-right">
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-2">INTERNAL SCORE</p>
          <div className="flex items-center gap-3 justify-center md:justify-end">
            <Star className="text-amber-400 fill-amber-400" size={28} />
            <span className="text-4xl font-black text-slate-800 leading-none">{supplier.rating}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div><h3 className="font-black text-slate-800 text-lg tracking-tight">内部复盘留言板</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Historical Feedback Dashboard</p></div>
              <button onClick={() => setIsReviewModalOpen(true)} className="px-4 py-2 bg-indigo-50 text-indigo-600 text-xs font-black rounded-lg hover:bg-indigo-600 hover:text-white shadow-sm transition-all flex items-center gap-2"><Plus size={14} /> 新增评价</button>
            </div>
            <div className="p-6 space-y-4">
              {supplier.reviews?.length ? supplier.reviews.map(r => (
                <div key={r.id} className="p-5 bg-slate-50/50 rounded-xl border border-slate-100">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center font-black text-indigo-600 shadow-sm border border-slate-100">{r.user[0]}</div>
                      <div><p className="font-black text-slate-800 text-sm">{r.user}</p><p className="text-xs text-slate-400">{r.date}</p></div>
                    </div>
                    <div className="flex gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={12} className={i < r.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />)}</div>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed italic">"{r.content}"</p>
                </div>
              )) : <div className="py-12 text-center text-slate-300 font-black uppercase tracking-[0.2em] italic">暂无复盘记录</div>}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between">
              <div><h3 className="font-black text-slate-800 text-lg tracking-tight">合作历史与账单管理</h3><p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-1">Billing & Transaction History</p></div>
              <button onClick={() => setIsBillModalOpen(true)} className="px-4 py-2 bg-emerald-50 text-emerald-600 text-xs font-black rounded-lg hover:bg-emerald-600 hover:text-white shadow-sm transition-all flex items-center gap-2"><Plus size={14} /> 新增账单记录</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">关联活动项目</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">合作项目/内容</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">结算日期</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">状态</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">金额 (ACTUAL)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {supplier.bills?.length ? supplier.bills.map(b => (
                    <tr key={b.id}>
                      <td className="px-6 py-4 font-black text-slate-800 text-sm tracking-tight">{b.activityName}</td>
                      <td className="px-6 py-4 text-xs text-slate-500 font-bold">{b.projectName || '未注明项目'}</td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-bold">{b.date}</td>
                      <td className="px-6 py-4"><span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${b.status === '已结清' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{b.status}</span></td>
                      <td className="px-6 py-4 font-black text-slate-800">¥{b.amount.toLocaleString()}</td>
                    </tr>
                  )) : <tr><td colSpan={5} className="py-12 text-center text-slate-300 font-black uppercase italic tracking-widest">暂无流水记录</td></tr>}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
            <h3 className="font-black text-slate-800 text-base tracking-tight mb-4">基础联络与账户</h3>
            <InfoItem icon={<User />} label="关键联系人" value={supplier.contact} onCopy={() => copyToClipboard(supplier.contact)} />
            <InfoItem icon={<Phone />} label="联系电话" value={supplier.phone} onCopy={() => copyToClipboard(supplier.phone)} />
            <InfoItem icon={<Mail />} label="电子邮箱" value={supplier.email || '未提供'} onCopy={() => copyToClipboard(supplier.email)} />
            <InfoItem icon={<Landmark />} label="开户银行" value={supplier.bankName || '未提供'} onCopy={() => copyToClipboard(supplier.bankName)} />
            <InfoItem icon={<CreditCard />} label="银行账号" value={supplier.bankAccount || '未提供'} onCopy={() => copyToClipboard(supplier.bankAccount)} />
            <InfoItem icon={<MapPin />} label="办公地址" value={supplier.address || '未提供'} />
          </section>
        </div>
      </div>

      {/* 删除确认弹窗 */}
      {deleteConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setDeleteConfirmOpen(false)}></div>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md z-10 animate-in zoom-in duration-200 overflow-hidden">
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 size={28} />
              </div>
              <h3 className="text-xl font-black text-slate-800 mb-2">确认删除供应商</h3>
              <p className="text-sm text-slate-500 mb-6">确定要删除供应商 <span className="font-black text-slate-700">{supplier.name}</span> 吗？此操作不可撤销。</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirmOpen(false)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-black hover:bg-slate-200 transition-all">取消</button>
                <button onClick={handleDelete} className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-black hover:bg-rose-600 transition-all shadow-lg shadow-rose-500/30">确认删除</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isReviewModalOpen && (
        <Modal title="新增复盘评价" onClose={() => setIsReviewModalOpen(false)} onSubmit={handleAddReview}>
          <div className="space-y-4">
             <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">评价内容</label><textarea required name="content" rows={4} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-medium text-slate-600 shadow-inner" /></div>
             <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">内部评分</label><input required name="rating" type="number" step="0.5" max="5" min="1" defaultValue="5" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold" /></div>
          </div>
        </Modal>
      )}

      {isBillModalOpen && (
        <Modal title="新增账单记录" onClose={() => setIsBillModalOpen(false)} onSubmit={handleAddBill}>
          <div className="space-y-4">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">活动名称 (大项)</label><input required name="activityName" placeholder="例如：2024全球科技峰会" className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold shadow-inner" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">合作项目/内容 (细项)</label><input required name="projectName" placeholder="例如：主展台灯光音响工程" className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold shadow-inner" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">金额 (¥)</label><input required name="amount" type="number" className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold shadow-inner" /></div>
              <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">结算状态</label><select name="status" className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl font-bold"><option value="已结清">已结清</option><option value="待结算">待结算</option></select></div>
            </div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase">结算日期</label><input required name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl outline-none font-bold" /></div>
          </div>
        </Modal>
      )}

      {isEditModalOpen && (
        <SupplierFormModal editingSupplier={supplier} onClose={() => setIsEditModalOpen(false)} onSubmit={handleEditSupplierSubmit} />
      )}
    </div>
  );
};

const InfoItem = ({ icon, label, value, onCopy }: { icon: any, label: string, value: string, onCopy?: () => void }) => (
  <div className="flex gap-4 items-start group">
    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center shadow-sm shrink-0">{icon}</div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <div className="flex items-center gap-2">
        <p className="font-bold text-slate-800 text-sm tracking-tight truncate">{value}</p>
        {onCopy && value !== '未提供' && (
          <button onClick={onCopy} className="p-1.5 text-slate-300 hover:text-indigo-600 transition-colors rounded-lg bg-slate-50 hover:bg-white shadow-sm" title="一键复制">
            <Copy size={12} />
          </button>
        )}
      </div>
    </div>
  </div>
);

interface ModalProps {
  title: string;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ title, onClose, onSubmit, children }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
    <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg z-10 animate-in zoom-in duration-200 overflow-hidden">
      <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
        <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={20} /></button>
      </div>
      <form onSubmit={onSubmit} className="p-10 space-y-4 max-h-[70vh] overflow-y-auto">
        {children}
        <div className="pt-6">
          <button type="submit" className="w-full py-4 bg-indigo-600 text-white rounded-xl font-black shadow-lg shadow-indigo-500/20 active:scale-95 transition-all uppercase tracking-widest text-sm">提交记录</button>
        </div>
      </form>
    </div>
  </div>
);

export { SupplierDetailView };
export default SupplierManager;
