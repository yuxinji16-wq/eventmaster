
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaterialsData } from '../../utils/hooks';
import { Material } from '../../types';
import { 
  Package, AlertCircle, CheckCircle2, XCircle, Search, Filter, History, Clock, 
  Tag, ChevronDown, Plus, X, Check, Layers, Boxes, FileText, Database, 
  ChevronRight, ArrowLeftRight, User, MapPin, Calendar, Info, MinusCircle, ArrowUpRight,
  ArrowLeft, ListFilter, LayoutGrid, Download, Share2
} from 'lucide-react';

const INITIAL_CATEGORIES = ['产品宣传册', '易拉宝', '会议定制', '礼品', '办公用品', '其他'];

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
}

const MaterialManager: React.FC = () => {
  const navigate = useNavigate();
  const { materials, loading, addMaterial, updateMaterial, deleteMaterial, addStock, withdraw } = useMaterialsData();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('所有分类');
  const [displayMode, setDisplayMode] = useState<'stock' | 'usage'>('stock');
  const [dynamicCategories, setDynamicCategories] = useState<string[]>(INITIAL_CATEGORIES);

  // 核心记录状态
  const [warehousingLogs, setWarehousingLogs] = useState<WarehousingLog[]>([
    { id: 'l1', materialName: 'AI产品白皮书 2024版', count: 200, operator: '张三', date: '2024-03-22 14:00', isNewType: false },
    { id: 'l2', materialName: 'NUMAP宣传册', count: 300, operator: '李四', date: '2024-02-05 17:03', isNewType: true },
  ]);

  const [withdrawalLogs, setWithdrawalLogs] = useState<WithdrawalLog[]>([
    { id: 'w1', materialName: 'AI产品白皮书 2024版', count: 50, unit: '本', user: '市场部-张伟', reason: 'Q1巡回展-上海站', date: '2024-03-22 10:30:12' },
    { id: 'w2', materialName: '品牌定制不锈钢保温杯', count: 20, unit: '个', user: '行政部-李芳', reason: '新员工入职礼包', date: '2024-03-21 15:45:00' },
  ]);

  // 交互状态
  const [isWarehousingOpen, setIsWarehousingOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isWithdrawalInquiryOpen, setIsWithdrawalInquiryOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  
  // 入库表单状态
  const [isNewTypeEntry, setIsNewTypeEntry] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>(INITIAL_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(INITIAL_CATEGORIES);

  // 领用流水搜索
  const [withdrawalSearch, setWithdrawalSearch] = useState('');

  // 1. 过滤逻辑
  const filteredMaterials = useMemo(() => {
    return materials.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === '所有分类' || item.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [materials, searchQuery, categoryFilter]);

  // 2. 分类分组
  const groupedMaterials = useMemo(() => {
    const groups: Record<string, Material[]> = {};
    filteredMaterials.forEach(item => {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredMaterials]);

  // 3. 领用流水过滤
  const filteredWithdrawals = useMemo(() => {
    return withdrawalLogs.filter(log => 
      log.materialName.toLowerCase().includes(withdrawalSearch.toLowerCase()) ||
      log.user.toLowerCase().includes(withdrawalSearch.toLowerCase())
    );
  }, [withdrawalLogs, withdrawalSearch]);

  const toggleCategory = (cat: string) => {
    setExpandedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleQuickAdd = (e: React.MouseEvent, category: string) => {
    e.stopPropagation();
    setSelectedCategory(category === '其他' ? '其他' : category);
    setIsNewTypeEntry(true);
    setIsWarehousingOpen(true);
  };

  const handleWarehousingSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const nowStr = new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-');

    if (isNewTypeEntry) {
      const stock = Number(formData.get('stock'));
      let finalCategory = selectedCategory;

      if (selectedCategory === '其他' && customCategory.trim()) {
        finalCategory = customCategory.trim();
        if (!dynamicCategories.includes(finalCategory)) {
          setDynamicCategories(prev => [...prev.filter(c => c !== '其他'), finalCategory, '其他']);
        }
      }

      addMaterial({
        name: formData.get('name') as string,
        category: finalCategory,
        type: formData.get('type') as '常规' | '定制',
        stock: stock,
        unit: formData.get('unit') as string,
      });

      setWarehousingLogs([{
        id: `log-${Date.now()}`,
        materialName: formData.get('name') as string,
        count: stock,
        operator: '当前用户',
        date: nowStr,
        isNewType: true
      }, ...warehousingLogs]);

      if (!expandedCategories.includes(finalCategory)) {
        setExpandedCategories([...expandedCategories, finalCategory]);
      }
    } else {
      const targetId = formData.get('existingMaterialId') as string;
      const addCount = Number(formData.get('stock'));

      addStock(targetId, addCount);

      const targetMat = materials.find(m => m.id === targetId);
      setWarehousingLogs([{
        id: `log-${Date.now()}`,
        materialName: targetMat?.name || '未知',
        count: addCount,
        operator: '当前用户',
        date: nowStr,
        isNewType: false
      }, ...warehousingLogs]);
    }

    setIsWarehousingOpen(false);
    setCustomCategory('');
  };

  const handleWithdraw = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedMaterial) return;
    const formData = new FormData(e.currentTarget);
    const count = Number(formData.get('count'));
    const user = formData.get('user') as string;
    const reason = formData.get('reason') as string;
    const withdrawalTime = formData.get('withdrawalTime') as string;

    withdraw(selectedMaterial.id, count);

    // 同步到领用流水
    const newWithdrawalLog: WithdrawalLog = {
      id: `wlog-${Date.now()}`,
      materialName: selectedMaterial.name,
      count: count,
      unit: selectedMaterial.unit,
      user: user,
      reason: reason,
      date: withdrawalTime
    };
    setWithdrawalLogs([newWithdrawalLog, ...withdrawalLogs]);

    setIsWithdrawOpen(false);
    setSelectedMaterial(null);
  };

  // 导出领用流水为 CSV 文件
  const handleExportExcel = () => {
    if (filteredWithdrawals.length === 0) {
      alert('暂无领用记录可导出');
      return;
    }

    const headers = ['领用时间', '物料名称', '领用数量', '单位', '领用人/部门', '领用用途'];
    const csvRows = [
      headers.join(','),
      ...filteredWithdrawals.map(log => [
        log.date,
        `"${log.materialName}"`,
        log.count,
        log.unit,
        `"${log.user}"`,
        `"${log.reason}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `物料领用流水_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* 顶部操作区 */}
      <div className="flex justify-end gap-3 mb-2">
        <button 
          onClick={() => setIsWithdrawalInquiryOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <ArrowLeftRight size={18} className="text-indigo-400" />
          领用情况查询
        </button>
        <button 
          onClick={() => setIsLogsOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm"
        >
          <History size={18} className="text-slate-400" />
          入库流转记录
        </button>
        <button 
          onClick={() => { 
            setSelectedCategory(dynamicCategories[0]); 
            setIsNewTypeEntry(true); 
            setIsWarehousingOpen(true); 
          }}
          className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 transition-all active:scale-95"
        >
          <Database size={18} />
          资产入库登记
        </button>
      </div>

      <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="在仓库中检索物料名称、规格或存放位置..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 py-3 bg-slate-50 border-2 border-transparent rounded-[1.25rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner"
          />
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-slate-50 p-1 rounded-xl border border-slate-100 shadow-inner">
            <button 
              onClick={() => setDisplayMode('stock')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${displayMode === 'stock' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <Boxes size={14} /> 剩余库存
            </button>
            <button 
              onClick={() => setDisplayMode('usage')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${displayMode === 'usage' ? 'bg-white text-indigo-600 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <ArrowLeftRight size={14} /> 累计领用
            </button>
          </div>

          <div className="relative">
            <select 
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="appearance-none bg-slate-50 border-2 border-slate-50 rounded-[1.25rem] pl-5 pr-10 py-3 text-xs font-black text-slate-600 outline-none hover:border-indigo-200 cursor-pointer shadow-sm transition-all"
            >
              <option value="所有分类">所有物料大类</option>
              {dynamicCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
          </div>
        </div>
      </div>

      <div className="space-y-4 pb-12">
        {(Object.entries(groupedMaterials) as [string, Material[]][]).map(([category, items]) => (
          <div key={category} className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden transition-all group/card">
            <div 
              onClick={() => toggleCategory(category)}
              className="w-full px-8 py-5 flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 transition-colors border-b border-slate-100 cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm bg-indigo-50 text-indigo-600`}>
                  <Package size={20} />
                </div>
                <div className="text-left">
                  <h4 className="font-black text-slate-800 text-lg tracking-tight flex items-center gap-2">
                    {category}
                    <span className="bg-slate-200/50 text-slate-500 text-[10px] px-2 py-0.5 rounded-full font-black">{items.length}</span>
                  </h4>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Category Storage Group</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button 
                  onClick={(e) => handleQuickAdd(e, category)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase rounded-lg border border-emerald-100 hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
                >
                  <Plus size={12} /> 快速入库
                </button>
                <ChevronDown className={`text-slate-300 transition-transform duration-300 ${expandedCategories.includes(category) ? 'rotate-180 text-indigo-500' : ''}`} size={20} />
              </div>
            </div>

            {expandedCategories.includes(category) && (
              <div className="overflow-x-auto animate-in slide-in-from-top-2 duration-300">
                <table className="w-full text-left">
                  <thead className="bg-white border-b border-slate-50">
                    <tr>
                      <th className="px-10 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">物料详情与子类</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">属性类型</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">当前状态</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        {displayMode === 'stock' ? '剩余可用库存' : '累计领用统计'}
                      </th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">最后更新</th>
                      <th className="px-8 py-4 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">管理操作</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item) => (
                      <tr key={item.id} className="hover:bg-indigo-50/20 transition-colors group/row">
                        <td className="px-10 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-200 group-hover/row:text-indigo-200 transition-colors">
                               <Plus size={20} strokeWidth={3} />
                            </div>
                            <div>
                              <p className="font-black text-slate-800 tracking-tight leading-none mb-1.5 group-hover/row:text-indigo-600 transition-colors">{item.name}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.category}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                            item.type === '定制' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-slate-50 text-slate-500 border border-slate-100'
                          }`}>
                            {item.type}
                          </span>
                        </td>
                        <td className="px-8 py-6">
                          <StatusBadge status={item.status} />
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-end gap-1">
                              <span className={`text-base font-black ${displayMode === 'stock' ? 'text-slate-800' : 'text-indigo-600'}`}>
                                {displayMode === 'stock' ? item.stock : item.usageCount}
                              </span>
                              <span className="text-[10px] font-bold text-slate-400 mb-0.5">{item.unit}</span>
                            </div>
                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                              <div 
                                className={`h-full transition-all duration-700 ${displayMode === 'stock' ? (item.status === 'Low Stock' ? 'bg-amber-400' : (item.status === 'Out of Stock' ? 'bg-rose-400' : 'bg-emerald-400')) : 'bg-indigo-500'}`}
                                style={{width: `${displayMode === 'stock' ? Math.min(100, (item.stock / 500) * 100) : Math.min(100, (item.usageCount / 1000) * 100)}%`}}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-slate-400">
                           <p className="text-[11px] font-bold flex items-center gap-1.5 whitespace-nowrap">
                             <Clock size={12} /> {item.lastUpdated}
                           </p>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => { setSelectedMaterial(item); setIsWithdrawOpen(true); }}
                              className="px-4 py-2 bg-indigo-50 text-indigo-600 text-[11px] font-black uppercase rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                              领用
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                console.log('详情 clicked, id:', item.id, 'path:', `/materials/${item.id}`);
                                navigate(`/materials/${item.id}`);
                              }}
                              className="px-4 py-2 bg-slate-50 text-slate-400 text-[11px] font-black uppercase rounded-xl hover:bg-slate-200 hover:text-slate-600 transition-all"
                            >
                              详情
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 全局领用情况查询 模态框 */}
      {isWithdrawalInquiryOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xl transition-opacity" onClick={() => setIsWithdrawalInquiryOpen(false)}></div>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-5xl z-10 overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[90vh]">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-4 bg-indigo-600 text-white rounded-3xl shadow-lg shadow-indigo-500/30">
                  <ArrowLeftRight size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">全库领用情况流水</h3>
                  <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">Full Asset Consumption Audit Log</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                 <button 
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl text-sm font-black uppercase tracking-wider hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                >
                  <Download size={18} /> 导出 Excel 报表
                </button>
                <button onClick={() => setIsWithdrawalInquiryOpen(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
              </div>
            </div>

            <div className="px-10 py-6 bg-white border-b border-slate-50 shrink-0 flex items-center gap-4">
               <div className="relative flex-1">
                 <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                 <input 
                  type="text" 
                  value={withdrawalSearch}
                  onChange={(e) => setWithdrawalSearch(e.target.value)}
                  placeholder="搜索物料名、领用人或关联活动..." 
                  className="w-full pl-14 pr-6 py-3.5 bg-slate-50 border-2 border-transparent rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner" 
                />
               </div>
               <div className="flex items-center gap-3">
                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">记录总数:</span>
                 <span className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-xs font-black">{filteredWithdrawals.length}</span>
               </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-4 bg-slate-50/30">
               {filteredWithdrawals.length > 0 ? (
                 <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-slate-50/50">
                        <tr>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">领用时间</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">领用物料</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">领用数量</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">领用人/部门</th>
                          <th className="px-8 py-5 text-[9px] font-black text-slate-400 uppercase tracking-wider">领用用途</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {filteredWithdrawals.map(log => (
                          <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="px-8 py-6 whitespace-nowrap">
                              <p className="text-[11px] font-black text-indigo-600 flex items-center gap-2">
                                <Clock size={12} /> {log.date}
                              </p>
                            </td>
                            <td className="px-8 py-6">
                              <p className="font-black text-slate-800 tracking-tight">{log.materialName}</p>
                            </td>
                            <td className="px-8 py-6">
                              <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-black">
                                {log.count} {log.unit}
                              </span>
                            </td>
                            <td className="px-8 py-6">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-[10px] text-slate-500 font-black">
                                  {log.user[0]}
                                </div>
                                <span className="text-sm font-bold text-slate-600">{log.user}</span>
                              </div>
                            </td>
                            <td className="px-8 py-6">
                              <p className="text-xs text-slate-400 font-medium italic">“{log.reason}”</p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                 </div>
               ) : (
                 <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                    <Search size={64} strokeWidth={1} className="mb-4 opacity-30" />
                    <p className="text-sm font-black uppercase tracking-widest">未检索到相关领用记录</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      )}

      {/* 资产入库登记 模态框 */}
      {isWarehousingOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity" onClick={() => setIsWarehousingOpen(false)}></div>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-xl z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">资产入库登记</h3>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">Asset Entry & Stock Receipt</p>
              </div>
              <button onClick={() => setIsWarehousingOpen(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleWarehousingSubmit} className="p-10 space-y-4">
              <div className="flex items-center justify-between p-4 bg-indigo-50/50 rounded-xl border border-indigo-100">
                <div>
                   <p className="text-sm font-black text-indigo-900">是否为新增物料类型？</p>
                   <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Add as a completely new SKU item</p>
                </div>
                <button 
                  type="button"
                  onClick={() => setIsNewTypeEntry(!isNewTypeEntry)}
                  className={`w-14 h-8 rounded-full transition-all relative ${isNewTypeEntry ? 'bg-indigo-600' : 'bg-slate-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-md transition-all ${isNewTypeEntry ? 'left-7' : 'left-1'}`}></div>
                </button>
              </div>

              {isNewTypeEntry ? (
                <div className="space-y-4 animate-in fade-in duration-300">
                   <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><FileText size={14} className="text-indigo-400"/> 新物料全称</label>
                    <input required name="name" placeholder="例如：NUMAP 2024 年度品牌白皮书" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">分类</label>
                      <select 
                        name="category" 
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                      >
                        {dynamicCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">计量单位</label>
                      <input required name="unit" placeholder="本 / 套 / 个" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700" />
                    </div>
                  </div>

                  {selectedCategory === '其他' && (
                    <div className="space-y-2 animate-in slide-in-from-top-4 duration-300">
                      <label className="text-[11px] font-black text-indigo-400 uppercase tracking-widest px-1 flex items-center gap-2">
                        <Tag size={14} /> 具体其他分类名称
                      </label>
                      <input 
                        required 
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="请输入新分类名称（如：宣传礼包）" 
                        className="w-full px-6 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 outline-none font-bold text-indigo-900 shadow-inner" 
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">属性</label>
                      <select name="type" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700">
                        <option value="常规">常规备货</option>
                        <option value="定制">会议定制</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">初始入库数量</label>
                      <input required name="stock" type="number" defaultValue="100" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                   <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2"><ListFilter size={14} className="text-indigo-400"/> 选择现有物料</label>
                    <select name="existingMaterialId" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700">
                      {materials.map(m => <option key={m.id} value={m.id}>{m.name} (当前库存: {m.stock})</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">补充入库数量</label>
                    <input required name="stock" type="number" defaultValue="50" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner" />
                  </div>
                </div>
              )}

              <div className="pt-6 flex gap-4">
                <button type="button" onClick={() => setIsWarehousingOpen(false)} className="flex-1 py-5 text-sm font-black text-slate-400 bg-slate-100 rounded-xl hover:bg-slate-200 uppercase tracking-widest">取消</button>
                <button type="submit" className="flex-1 py-5 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Check size={20} /> 确认入库登记
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 入库流转记录 */}
      {isLogsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity" onClick={() => setIsLogsOpen(false)}></div>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-2xl z-10 overflow-hidden animate-in zoom-in duration-300 flex flex-col max-h-[85vh]">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-slate-50/30 shrink-0">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">入库流转历史</h3>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">Full Warehousing Audit Log</p>
              </div>
              <button onClick={() => setIsLogsOpen(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-4">
               {warehousingLogs.map(log => (
                 <div key={log.id} className="p-6 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-between group hover:bg-white hover:border-indigo-100 hover:shadow-xl hover:shadow-slate-200/20 transition-all">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm ${log.isNewType ? 'bg-indigo-600 text-white' : 'bg-emerald-50 text-emerald-600'}`}>
                        {log.isNewType ? <Plus size={20} /> : <ArrowUpRight size={20} />}
                      </div>
                      <div>
                        <p className="font-black text-slate-800 tracking-tight leading-none mb-1.5">{log.materialName}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-2">
                           <User size={10} /> 操作人: {log.operator} · <Clock size={10} /> {log.date}
                        </p>
                      </div>
                   </div>
                   <div className="text-right">
                      <p className="text-xl font-black text-slate-800">+{log.count}</p>
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{log.isNewType ? '首批入库' : '库存增补'}</p>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* 领用表单 模态框 (增强领用时间) */}
      {isWithdrawOpen && selectedMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl transition-opacity" onClick={() => setIsWithdrawOpen(false)}></div>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="px-10 py-8 border-b border-slate-50 flex justify-between items-center bg-indigo-50/30">
              <div>
                <h3 className="text-2xl font-black text-slate-800 tracking-tight">物料领用登记</h3>
                <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">Asset Withdrawal Form</p>
              </div>
              <button onClick={() => setIsWithdrawOpen(false)} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleWithdraw} className="p-10 space-y-4">
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm"><Package size={22} /></div>
                <div>
                  <p className="text-sm font-black text-slate-800 leading-none mb-1">{selectedMaterial.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">当前库存剩余：{selectedMaterial.stock} {selectedMaterial.unit}</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">领用数量 ({selectedMaterial.unit})</label>
                <input required name="count" type="number" min="1" max={selectedMaterial.stock} defaultValue="1" className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-black text-slate-700 shadow-inner" />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">领用登记时间 (自动生成)</label>
                <div className="relative">
                  <Clock className="absolute left-5 top-1/2 -translate-y-1/2 text-indigo-400" size={18} />
                  <input 
                    name="withdrawalTime" 
                    readOnly 
                    defaultValue={new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-')} 
                    className="w-full pl-14 pr-6 py-4 bg-indigo-50/30 border-2 border-indigo-100 rounded-xl outline-none font-black text-indigo-600 cursor-not-allowed" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">领用人 / 领用部门</label>
                <div className="relative">
                   <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                   <input required name="user" placeholder="请输入领用人姓名" className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700 shadow-inner" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">领用用途 / 关联活动</label>
                <textarea required name="reason" placeholder="如：华东区合作伙伴大会展台派发" rows={3} className="w-full px-6 py-4 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-medium text-slate-600 resize-none shadow-inner" />
              </div>

              <div className="pt-4 flex gap-4">
                <button type="button" onClick={() => setIsWithdrawOpen(false)} className="flex-1 py-5 text-sm font-black text-slate-400 bg-slate-100 rounded-xl hover:bg-slate-200 uppercase tracking-widest">取消</button>
                <button type="submit" className="flex-1 py-5 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/20 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Check size={20} /> 确认领用
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// 状态标签
const StatusBadge: React.FC<{status: string}> = ({status}) => {
  if (status === 'In Stock') return <span className="flex items-center gap-1.5 text-emerald-600 font-black text-[10px] bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100 uppercase tracking-wider"><CheckCircle2 size={12} /> 充足</span>;
  if (status === 'Low Stock') return <span className="flex items-center gap-1.5 text-amber-600 font-black text-[10px] bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-100 uppercase tracking-wider"><AlertCircle size={12} /> 预警</span>;
  return <span className="flex items-center gap-1.5 text-rose-600 font-black text-[10px] bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-100 uppercase tracking-wider"><XCircle size={12} /> 缺货</span>;
};

export const MaterialDetailView: React.FC<{
  material: Material;
  onBack: () => void;
  onEdit?: (updated: Material) => void;
  warehousingLogs?: WarehousingLog[];
  withdrawalLogs?: WithdrawalLog[];
}> = ({ material, onBack, onEdit, warehousingLogs = [], withdrawalLogs = [] }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(material);

  // 合并并排序所有流水记录
  const allLogs = [
    ...warehousingLogs.map(log => ({ date: log.date, type: '入库' as const, user: log.operator, count: log.count, reason: log.isNewType ? '新增物料入库' : '库存增补入库' })),
    ...withdrawalLogs.filter(log => log.materialName === material.name).map(log => ({ date: log.date, type: '出库' as const, user: log.user, count: log.count, reason: log.reason }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // 导出入库流水
  const handleExport = () => {
    if (allLogs.length === 0) {
      alert('暂无入库流水记录可导出');
      return;
    }

    const csvRows = [
      ['日期', '类型', '操作人', '数量', '事由'].join(','),
      ...allLogs.map(log => [log.date, log.type, `"${log.user}"`, log.count, `"${log.reason}"`].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${material.name}_入库流水_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSaveEdit = () => {
    if (onEdit) {
      onEdit(editForm);
    }
    setIsEditModalOpen(false);
  };

  return (
    <div className="max-w-[1120px] mx-auto origin-top scale-[0.96] animate-in fade-in slide-in-from-right-4 duration-500 space-y-8 pb-10">
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-black text-sm transition-colors uppercase tracking-widest">
          <ArrowLeft size={18} /> 返回仓库列表
        </button>
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="px-5 py-2.5 text-sm font-black text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest"
          >
            编辑信息
          </button>
          <button
            onClick={handleExport}
            className="px-5 py-2.5 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-widest"
          >
            导出入库流水
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 flex flex-col md:flex-row gap-10 items-start relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32"></div>
             <div className="w-40 h-40 bg-slate-50 rounded-[2rem] flex items-center justify-center text-slate-200 shadow-inner shrink-0 border border-slate-100">
               <Package size={80} strokeWidth={1} />
             </div>
             <div className="flex-1 space-y-4">
               <div>
                 <span className="px-3 py-1.5 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-lg">{material.category}</span>
                 <h2 className="text-4xl font-black text-slate-800 mt-4 tracking-tight">{material.name}</h2>
               </div>
               <div className="flex flex-wrap gap-8 pt-6">
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">库存剩余</p>
                   <p className="text-2xl font-black text-slate-800">{material.stock} <span className="text-base text-slate-400">{material.unit}</span></p>
                 </div>
                 <div className="h-10 w-px bg-slate-100 mt-2"></div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">累计领用</p>
                   <p className="text-2xl font-black text-indigo-600">{material.usageCount} <span className="text-base text-indigo-300">次</span></p>
                 </div>
                 <div className="h-10 w-px bg-slate-100 mt-2"></div>
                 <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">当前状态</p>
                   <div className="mt-1"><StatusBadge status={material.status} /></div>
                 </div>
               </div>
             </div>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
            <h3 className="text-lg font-black text-slate-800 mb-8 flex items-center gap-2">
              <History size={20} className="text-indigo-500" />
              最近变更记录 (Activity Logs)
            </h3>
            <div className="space-y-4">
              {[
                { type: 'withdraw', user: '市场部-张伟', count: 50, date: '2024-03-22 10:30', reason: 'Q1智能制造路演-上海站' },
                { type: 'stockin', user: '仓库管理员', count: 200, date: '2024-03-15 14:00', reason: '年度常规补充入库' },
                { type: 'withdraw', user: '大客户部-李娜', count: 20, date: '2024-03-10 16:45', reason: '新客户拜访礼赠' }
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-6 bg-slate-50/50 rounded-xl border border-slate-100 group hover:bg-white hover:shadow-xl hover:shadow-slate-200/20 transition-all">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${log.type === 'withdraw' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {log.type === 'withdraw' ? <MinusCircle size={22} /> : <ArrowUpRight size={22} />}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-1">
                      <p className="font-black text-slate-800 tracking-tight">{log.type === 'withdraw' ? '出库领用' : '资产入库'}</p>
                      <span className="text-[11px] font-bold text-slate-400">{log.date}</span>
                    </div>
                    <p className="text-sm text-slate-500 font-medium mb-3">操作人：{log.user} · 数量：{log.type === 'withdraw' ? '-' : '+'}{log.count} {material.unit}</p>
                    <div className="p-3 bg-white rounded-xl border border-slate-100 text-[13px] text-slate-400 font-medium">
                       理由：{log.reason}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 space-y-8 h-fit">
            <h3 className="text-lg font-black text-slate-800 tracking-tight">物料基础规格</h3>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300"><Tag size={18} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">资产类型</p>
                  <p className="font-bold text-slate-700">{material.type}项目</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300"><MapPin size={18} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">库房存放位置</p>
                  <p className="font-bold text-slate-700">A区-04货架-2层</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300"><Calendar size={18} /></div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">最后盘点日期</p>
                  <p className="font-bold text-slate-700">{material.lastUpdated.split(' ')[0]}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 编辑物料模态框 */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={() => setIsEditModalOpen(false)}></div>
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md z-10 overflow-hidden animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
              <h3 className="text-xl font-black text-slate-800">编辑物料信息</h3>
              <button onClick={() => setIsEditModalOpen(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase">物料名称</label>
                <input
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase">分类</label>
                  <select
                    value={editForm.category}
                    onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                    className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                  >
                    {INITIAL_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-black text-slate-400 uppercase">计量单位</label>
                  <input
                    value={editForm.unit}
                    onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                    className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase">属性</label>
                <select
                  value={editForm.type}
                  onChange={(e) => setEditForm({ ...editForm, type: e.target.value as '常规' | '定制' })}
                  className="w-full px-6 py-3 bg-slate-50 border-2 border-slate-100 rounded-xl focus:border-indigo-500 outline-none font-bold text-slate-700"
                >
                  <option value="常规">常规备货</option>
                  <option value="定制">会议定制</option>
                </select>
              </div>
              <div className="pt-4 flex gap-4">
                <button onClick={() => setIsEditModalOpen(false)} className="flex-1 py-3 text-sm font-black text-slate-400 bg-slate-100 rounded-xl hover:bg-slate-200 uppercase tracking-widest">取消</button>
                <button onClick={handleSaveEdit} className="flex-1 py-3 text-sm font-black text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 uppercase tracking-widest flex items-center justify-center gap-2">
                  <Check size={20} /> 保存修改
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialManager;
