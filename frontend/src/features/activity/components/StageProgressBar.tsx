/**
 * 阶段进度条组件
 * 从 pages/ActivityDetail.tsx 行 173-196 迁移而来
 */
import React from 'react';
import { Check } from 'lucide-react';
import { ACTIVITY_STAGES } from '../../../types';
import { getStageIndex } from '../utils';

interface StageProgressBarProps {
  currentStage: string;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({ currentStage }) => {
  const currentIndex = getStageIndex(currentStage);
  return (
    <div className="flex items-center gap-0">
      {ACTIVITY_STAGES.map((stage, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;
        return (
          <React.Fragment key={stage}>
            <div className="flex flex-col items-center">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isDone ? 'bg-emerald-500 text-white shadow-md' : isCurrent ? 'bg-indigo-500 text-white shadow-lg ring-4 ring-indigo-200' : 'bg-slate-100 text-slate-400'}`}>
                {isDone ? <Check size={16} /> : index + 1}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${isCurrent ? 'text-indigo-600' : 'text-slate-400'}`}>{stage}</span>
            </div>
            {index < ACTIVITY_STAGES.length - 1 && (
              <div className={`flex-1 h-1.5 mx-1 rounded ${index < currentIndex ? 'bg-emerald-400' : 'bg-slate-100'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StageProgressBar;
