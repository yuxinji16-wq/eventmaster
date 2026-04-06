
import React from 'react';
import { NAV_ITEMS } from '../../constants';

interface SidebarProps {
  activeTab: string;
  onTabChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-56 bg-slate-900 h-screen fixed left-0 top-0 flex flex-col text-white shadow-xl">
      <div className="p-4 border-b border-slate-800">
        <h1 className="text-lg font-bold flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center shadow-lg shadow-indigo-500/50">E</div>
          EventMaster <span className="text-indigo-400">Pro</span>
        </h1>
      </div>

      <nav className="flex-1 mt-3 px-3">
        <ul className="space-y-1">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg transition-all duration-200 ${
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
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2.5 p-2.5 bg-slate-800/50 rounded-xl border border-white/5">
          <img src="https://picsum.photos/80/80?random=1" className="w-8 h-8 rounded-lg border border-indigo-500 shadow-sm" alt="avatar" />
          <div className="overflow-hidden">
            <p className="text-xs font-bold truncate leading-tight">市场部负责人</p>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider truncate">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
