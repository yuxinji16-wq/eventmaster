/**
 * 风险提示组件
 * 从 pages/ActivityDetail.tsx 行 198-206 迁移而来
 */
import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { RiskLevel } from '../../../types';
import { getRiskColor } from '../utils';

interface RiskAlertProps {
  risk: RiskLevel;
  message: string;
}

export const RiskAlert: React.FC<RiskAlertProps> = ({ risk, message }) => {
  const colors = getRiskColor(risk);
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${colors.bg} ${colors.text}`}>
      <AlertTriangle size={16} />
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

export default RiskAlert;
