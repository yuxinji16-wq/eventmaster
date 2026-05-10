/**
 * 统计卡片组件
 * 从 pages/ActivityDetail.tsx 行 208-215 迁移而来
 */
import React from 'react';

interface StatCardProps {
  label: string;
  value: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value }) => {
  return (
    <div className="bg-white/10 rounded-xl p-4">
      <p className="text-xs text-white/60 mb-1">{label}</p>
      <p className="text-2xl font-black">{value}</p>
    </div>
  );
};

export default StatCard;
