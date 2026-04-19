
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { NAV_ITEMS, SYSTEM_NAV_ITEMS } from '../../constants';
import { useAuth } from '../../context/AuthContext';
import { AppRoutes } from '../../utils/routes';

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate(AppRoutes.LOGIN);
  };

  return (
    <div className="w-56 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col text-white shadow-xl">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/50">E</div>
          EventMaster <span className="text-indigo-400">Pro</span>
        </h1>
      </div>

      <nav className="flex-1 mt-3 px-3 overflow-y-auto">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeTab === item.id
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {item.icon}
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 pt-4 border-t border-slate-800">
          <p className="px-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">系统</p>
          <ul className="space-y-1">
            {SYSTEM_NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="font-medium text-sm">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/50 rounded-xl border border-white/5 mb-2">
          <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center text-sm font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate leading-tight">{user?.username || '用户'}</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate">
              {user?.is_superadmin ? '超级管理员' : '用户'}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full py-2 text-sm text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
        >
          退出登录
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
