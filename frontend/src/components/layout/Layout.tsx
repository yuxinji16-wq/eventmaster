import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Search, Settings } from 'lucide-react';
import { AppRoutes, RouteMetaMap } from '../../utils/routes';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', path: AppRoutes.HOME, label: '数据仪表盘' },
  { id: 'activities', path: AppRoutes.ACTIVITIES, label: '活动管理' },
  { id: 'materials', path: AppRoutes.MATERIALS, label: '物料仓库' },
  { id: 'budget', path: AppRoutes.BUDGET, label: '预算仓库' },
  { id: 'suppliers', path: AppRoutes.SUPPLIERS, label: '供应商库' },
  { id: 'leads', path: AppRoutes.OPPORTUNITIES, label: '商机转化' },
  { id: 'reviews', path: AppRoutes.REVIEWS, label: '复盘中心' },
];

const getPageTitle = (path: string): string => {
  const item = SIDEBAR_ITEMS.find(i => path === i.path || path.startsWith(i.path + '/'));
  return item?.label || '仪表盘';
};

const Layout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pageTitle = getPageTitle(location.pathname);

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const currentTab = SIDEBAR_ITEMS.find(
    i => i.path === location.pathname || (i.path !== '/' && location.pathname.startsWith(i.path + '/'))
  )?.id || 'dashboard';

  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar activeTab={currentTab} onTabChange={(id) => {
        const item = SIDEBAR_ITEMS.find(i => i.id === id);
        if (item) navigate(item.path);
      }} />

      <main className="flex-1 ml-56 p-4">
        {/* Top Header */}
        <header className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">市场运营管理 / {pageTitle}</p>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group hidden lg:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors" size={16} />
              <input
                type="text"
                placeholder="键入关键词快速检索..."
                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all w-64 text-sm font-medium text-slate-700"
              />
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 hover:border-indigo-100 transition-all relative shadow-sm">
                <Bell size={18} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
              </button>
              <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm">
                <Settings size={18} />
              </button>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
