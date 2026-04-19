import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import { Bell, Settings } from 'lucide-react';
import { AppRoutes } from '../../utils/routes';
import NotificationCenter from '../../shared/NotificationCenter';
import { useNotification } from '../../shared/NotificationContext';
import { GlobalSearch } from '../search';

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
  const { unreadCount, setIsOpen, isOpen } = useNotification();

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
            <div className="hidden lg:block">
              <GlobalSearch className="w-64" />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative" id="notification-bell">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className={`p-2 bg-white border border-slate-200 rounded-xl transition-all relative shadow-sm cursor-pointer ${
                    isOpen || unreadCount > 0 ? 'text-indigo-500 bg-indigo-50 border-indigo-100' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 hover:border-indigo-100'
                  }`}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </button>
                <NotificationCenter />
              </div>
              <button className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 hover:border-indigo-100 transition-all shadow-sm cursor-pointer">
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
