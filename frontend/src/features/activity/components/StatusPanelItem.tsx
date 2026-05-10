/**
 * 状态面板项组件
 * 从 pages/ActivityDetail.tsx 行 217-243 迁移而来
 */
import React from 'react';

interface StatusPanelItemProps {
  icon: React.ReactNode;
  title: string;
  stats: { label: string; value: string | number; color?: string }[];
  status?: { type: 'success' | 'warning' | 'danger' | 'neutral'; text: string };
}

export const StatusPanelItem: React.FC<StatusPanelItemProps> = ({ icon, title, stats, status }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-500">{icon}</div>
        <span className="font-bold text-slate-800">{title}</span>
      </div>
      <div className="space-y-2">
        {stats.map((stat, i) => (
          <div key={i} className="flex justify-between text-sm">
            <span className="text-slate-400">{stat.label}</span>
            <span className={`font-bold ${stat.color || 'text-slate-800'}`}>{stat.value}</span>
          </div>
        ))}
      </div>
      {status && (
        <div className={`mt-3 px-2 py-1 rounded text-xs font-medium inline-block ${
          status.type === 'success' ? 'bg-emerald-50 text-emerald-600' :
          status.type === 'warning' ? 'bg-amber-50 text-amber-600' :
          'bg-rose-50 text-rose-600'
        }`}>
          {status.text}
        </div>
      )}
    </div>
  );
};

export default StatusPanelItem;
