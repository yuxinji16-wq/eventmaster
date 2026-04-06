import React from 'react';
import { ReviewFeedback } from '../../types';
import { Trash2 } from 'lucide-react';

interface FeedbackCardProps {
  feedback: ReviewFeedback;
  canEdit: boolean;
  onDelete: () => void;
}

const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, canEdit, onDelete }) => {
  return (
    <div className="border border-slate-100 rounded-xl overflow-hidden hover:shadow-md transition-all">
      <div className="flex items-center justify-between p-4 bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-white font-black">
            {feedback.evaluatorName[0]}
          </div>
          <div>
            <p className="font-black text-slate-800">{feedback.evaluatorName}</p>
            <p className="text-xs text-slate-400">{feedback.evaluatorRole}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{feedback.submittedAt}</span>
          {canEdit && (
            <button
              onClick={() => {
                if (window.confirm('确定要删除这条评价吗？')) onDelete();
              }}
              className="p-1.5 hover:bg-rose-100 rounded-lg text-slate-400 hover:text-rose-600 transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 border-b border-slate-100">
        <div className="grid grid-cols-5 gap-2 text-center">
          <div>
            <p className="text-xs text-slate-400 mb-1">目标达成</p>
            <p className="font-black text-indigo-600">{feedback.goalScore}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">线索质量</p>
            <p className="font-black text-emerald-600">{feedback.leadQualityScore}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">执行稳定</p>
            <p className="font-black text-blue-600">{feedback.executionScore}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">资源效率</p>
            <p className="font-black text-amber-600">{feedback.resourceScore}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 mb-1">品牌曝光</p>
            <p className="font-black text-purple-600">{feedback.brandScore}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs font-black text-emerald-500 mb-1">成功经验</p>
          <p className="text-sm text-slate-600">{feedback.successes}</p>
        </div>
        <div>
          <p className="text-xs font-black text-rose-500 mb-1">存在问题</p>
          <p className="text-sm text-slate-600">{feedback.problems}</p>
        </div>
        <div>
          <p className="text-xs font-black text-indigo-500 mb-1">优化建议</p>
          <p className="text-sm text-slate-600">{feedback.suggestions}</p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackCard;
