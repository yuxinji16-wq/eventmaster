/**
 * 评价卡片
 * 从 pages/ActivityDetail.tsx 行 565-678 迁移而来
 */
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Card, Button } from '../../../shared';

interface FeedbackCardProps {
  feedback: any;
  onSubmit: () => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ feedback, onSubmit }) => {
  const [expanded, setExpanded] = useState(false);

  const getScoreColor = (score: number) => {
    if (score >= 4) return 'text-emerald-600';
    if (score >= 3) return 'text-amber-600';
    return 'text-rose-600';
  };

  const overall = feedback.goal_score * 0.2 + feedback.lead_quality_score * 0.2 +
    feedback.execution_score * 0.2 + feedback.resource_score * 0.2 + feedback.brand_score * 0.2;

  return (
    <Card className={feedback.is_submitted ? 'border-emerald-200 bg-emerald-50/30' : 'border-slate-100'}>
      <div className="flex items-start justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
            feedback.is_submitted ? 'bg-emerald-500' : 'bg-indigo-500'
          }`}>
            {feedback.evaluator_name?.charAt(0) || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{feedback.evaluator_name}</span>
              {feedback.evaluator_role && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded text-xs">{feedback.evaluator_role}</span>
              )}
              {feedback.is_submitted ? (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-600 rounded text-xs">已提交</span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 text-amber-600 rounded text-xs">草稿</span>
              )}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date(feedback.created_at).toLocaleDateString('zh-CN')}
              {feedback.submitted_at && ` · 提交于 ${new Date(feedback.submitted_at).toLocaleDateString('zh-CN')}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className={`text-lg font-black ${getScoreColor(overall)}`}>{overall.toFixed(1)}</p>
            <p className="text-xs text-slate-400">综合评分</p>
          </div>
          <button className="p-1 rounded hover:bg-slate-100">
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="grid grid-cols-5 gap-2 mb-4">
            {[
              { label: '目标达成', score: feedback.goal_score },
              { label: '线索质量', score: feedback.lead_quality_score },
              { label: '执行稳定', score: feedback.execution_score },
              { label: '资源效率', score: feedback.resource_score },
              { label: '品牌曝光', score: feedback.brand_score },
            ].map(item => (
              <div key={item.label} className="text-center">
                <p className={`text-sm font-bold ${getScoreColor(item.score)}`}>{item.score.toFixed(1)}</p>
                <p className="text-xs text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>

          {feedback.successes && (
            <div className="mb-3">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-1">做得好</p>
              <p className="text-sm text-slate-600">{feedback.successes}</p>
            </div>
          )}

          {feedback.problems && (
            <div className="mb-3">
              <p className="text-xs font-bold text-rose-600 uppercase mb-1">问题点</p>
              <p className="text-sm text-slate-600">{feedback.problems}</p>
            </div>
          )}

          {feedback.suggestions && (
            <div className="mb-3">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-1">建议</p>
              <p className="text-sm text-slate-600">{feedback.suggestions}</p>
            </div>
          )}

          {feedback.tags && feedback.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {feedback.tags.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs">{tag}</span>
              ))}
            </div>
          )}

          {!feedback.is_submitted && (
            <div className="flex justify-end">
              <Button size="sm" variant="primary" onClick={onSubmit}>
                提交评价
              </Button>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default FeedbackCard;
