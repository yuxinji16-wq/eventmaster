/**
 * 复盘 Tab
 * 从 pages/ActivityDetail.tsx 行 362-561 迁移而来
 */
import React, { useState } from 'react';
import { Plus, Star, Loader2 } from 'lucide-react';
import { Card, Button } from '../../../shared';
import { useReviewData } from '../../../utils/hooks';
import { useToast } from '../../../shared/Toast';
import { FeedbackCard } from './FeedbackCard';
import { FeedbackModal } from './FeedbackModal';

interface ReviewTabProps {
  activityId: string;
}

export const ReviewTab: React.FC<ReviewTabProps> = ({ activityId }) => {
  const toast = useToast();
  const {
    review, feedbacks, conclusion, avgScores, loading,
    loadReview, createReview, addFeedback, submitFeedback, generateAiSummary
  } = useReviewData(activityId);
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);

  const submittedFeedbacks = (feedbacks || []).filter(fb => fb.is_submitted);

  const handleAddFeedback = async (data: any) => {
    try {
      await addFeedback(data);
      setFeedbackModalOpen(false);
      toast.success('评价已添加');
    } catch {
      toast.error('添加评价失败');
    }
  };

  const handleSubmitFeedback = async (feedbackId: number) => {
    try {
      await submitFeedback(feedbackId);
      toast.success('评价已提交');
      loadReview();
    } catch {
      toast.error('提交失败');
    }
  };

  const handleGenerateAi = async () => {
    if (!review) {
      try {
        await createReview();
      } catch {
        toast.error('创建复盘失败');
        return;
      }
    }
    setGeneratingAi(true);
    try {
      await generateAiSummary();
      toast.success('AI摘要已生成');
      loadReview();
    } catch {
      toast.error('生成失败');
    } finally {
      setGeneratingAi(false);
    }
  };

  const getScoreLabel = (score: number | undefined) => {
    if (score === undefined || score === null) return '-';
    return score.toFixed(1);
  };

  const getOverallLabel = (score: number | undefined) => {
    if (score === undefined || score === null) return '-';
    if (score >= 4.5) return '优秀';
    if (score >= 3.5) return '良好';
    if (score >= 2.5) return '一般';
    return '需改进';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {avgScores && (
        <Card className="bg-gradient-to-r from-indigo-50 to-white border-indigo-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800">综合评分</h3>
            <span className={`px-3 py-1 rounded-xl text-sm font-bold ${
              (avgScores.overall_score || 0) >= 4 ? 'bg-emerald-100 text-emerald-600' :
              (avgScores.overall_score || 0) >= 3 ? 'bg-amber-100 text-amber-600' :
              'bg-rose-100 text-rose-600'
            }`}>
              {getOverallLabel(avgScores.overall_score)}
            </span>
          </div>
          <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">目标达成</p>
              <p className="text-xl font-black text-indigo-600">{getScoreLabel(avgScores.avg_goal_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">线索质量</p>
              <p className="text-xl font-black text-emerald-600">{getScoreLabel(avgScores.avg_lead_quality_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">执行稳定</p>
              <p className="text-xl font-black text-blue-600">{getScoreLabel(avgScores.avg_execution_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">资源效率</p>
              <p className="text-xl font-black text-amber-600">{getScoreLabel(avgScores.avg_resource_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">品牌曝光</p>
              <p className="text-xl font-black text-purple-600">{getScoreLabel(avgScores.avg_brand_score)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-slate-400 mb-1">综合</p>
              <p className="text-xl font-black text-slate-800">{getScoreLabel(avgScores.overall_score)}</p>
            </div>
          </div>
        </Card>
      )}

      {conclusion?.ai_summary && (
        <Card>
          <div className="flex items-center gap-2 mb-3">
            <Star size={18} className="text-amber-500" />
            <h3 className="font-bold text-slate-800">AI 总结</h3>
          </div>
          <p className="text-slate-600 text-sm leading-relaxed">{conclusion.ai_summary}</p>
          {conclusion.key_successes && conclusion.key_successes.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-emerald-600 uppercase mb-2">亮点</p>
              <div className="flex flex-wrap gap-1">
                {conclusion.key_successes.map((s: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-600 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
          {conclusion.common_problems && conclusion.common_problems.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-rose-600 uppercase mb-2">问题</p>
              <div className="flex flex-wrap gap-1">
                {conclusion.common_problems.map((p: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-rose-50 text-rose-600 rounded text-xs">{p}</span>
                ))}
              </div>
            </div>
          )}
          {conclusion.action_suggestions && conclusion.action_suggestions.length > 0 && (
            <div className="mt-3">
              <p className="text-xs font-bold text-indigo-600 uppercase mb-2">建议</p>
              <div className="flex flex-wrap gap-1">
                {conclusion.action_suggestions.map((s: string, i: number) => (
                  <span key={i} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded text-xs">{s}</span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={() => setFeedbackModalOpen(true)}>
            添加评价
          </Button>
          <Button size="sm" variant="outline" icon={generatingAi ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
            onClick={handleGenerateAi} disabled={generatingAi}>
            {generatingAi ? '生成中...' : 'AI 总结'}
          </Button>
        </div>
        <span className="text-sm text-slate-400">
          {feedbacks.length} 条评价 / {submittedFeedbacks.length} 条已提交
        </span>
      </div>

      {feedbacks.length === 0 ? (
        <Card className="text-center py-8">
          <Loader2 size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-slate-500 mb-2">暂无评价</p>
          <p className="text-xs text-slate-400">点击"添加评价"开始复盘</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {feedbacks.map(fb => (
            <FeedbackCard key={fb.id} feedback={fb} onSubmit={() => handleSubmitFeedback(fb.id)} />
          ))}
        </div>
      )}

      {feedbackModalOpen && (
        <FeedbackModal
          onClose={() => setFeedbackModalOpen(false)}
          onSave={handleAddFeedback}
        />
      )}
    </div>
  );
};

export default ReviewTab;
