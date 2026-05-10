/**
 * 商机行组件
 * 从 pages/ActivityDetail.tsx 行 334-357 迁移而来
 */
import React from 'react';

interface OpportunityRowProps {
  opportunity: {
    clientName: string;
    region?: string;
    contactName?: string;
    phone?: string;
    requirement?: string;
    owner?: string;
  };
}

export const OpportunityRow: React.FC<OpportunityRowProps> = ({ opportunity }) => {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl border border-slate-100">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-medium text-slate-700">{opportunity.clientName}</p>
          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-50 text-blue-600">
            {opportunity.region || '区域待定'}
          </span>
        </div>
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
          <span>{opportunity.contactName}</span>
          <span>{opportunity.phone}</span>
        </div>
        {opportunity.requirement && (
          <p className="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{opportunity.requirement}</p>
        )}
      </div>
      <div className="text-xs text-slate-400 ml-2">
        {opportunity.owner}
      </div>
    </div>
  );
};

export default OpportunityRow;
