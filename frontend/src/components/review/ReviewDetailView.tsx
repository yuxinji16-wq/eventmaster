import React, { useState } from 'react';
import { useReviewsData, useActivitiesData } from '../../utils/hooks';
import { Review, ReviewFeedback, ReviewStatus } from '../../types';
import {
  Plus, ArrowLeft, Check, AlertTriangle,
  Users, TrendingUp, Award, Sparkles, Bell, Target,
  Calendar, MapPin, ClipboardCheck, CheckCircle
} from 'lucide-react';

import FeedbackCard from './FeedbackCard';
import AddFeedbackModal from './AddFeedbackModal';
import ScoreCard from './ScoreCard';
import { useToast } from '../../shared/Toast';

// ==================== 复盘详情页 ====================
const ReviewDetailView: React.FC<{
  review: Review;
  onBack: () => void;
  onUpdate?: (updated: Partial<Review>) => void;
}> = ({ review, onBack, onUpdate }) => {
  const toast = useToast();
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const { generateSummary, fetchReviewActivities } = useReviewsData();
  const { activities } = useActivitiesData();

  const activity = activities.find(a => a.id === review.activityId);
  const submittedFeedbacks = review.feedbacks?.filter((f: any) => f.isSubmitted) || [];
  const unsubmittedCount = review.expectedParticipants - submittedFeedbacks.length;

  const handleAddFeedback = async (feedback: ReviewFeedback) => {
    if (!onUpdate) {
      setActiveModal(null);
      return;
    }
    const newFeedbacks = [...(review.feedbacks || []), feedback];
    onUpdate({ feedbacks: newFeedbacks });
    setActiveModal(null);
  };

  const handleDeleteFeedback = (feedbackId: string) => {
    if (!onUpdate) return;
    if (!window.confirm('确定要删除这条评价吗？')) return;
    const newFeedbacks = (review.feedbacks || []).filter((f: any) => f.id !== feedbackId);
    onUpdate({ feedbacks: newFeedbacks });
  };

  const handleConfirmReview = () => {
    if (!onUpdate) return;
    if (!window.confirm('确认完成复盘？完成后可以补充评价，但已有评价将被锁定。')) return;
    onUpdate({
      status: ReviewStatus.COMPLETED,
      confirmedAt: new Date().toLocaleString('zh-CN'),
      confirmedBy: '当前用户'
    });
  };

  const handleGenerateAI = async () => {
    setIsGeneratingAI(true);
    try {
      const result = await generateSummary(Number(review.id));
      await fetchReviewActivities();
    } catch (err) {
      console.error('Failed to generate AI summary:', err);
      toast.error('生成失败', '生成AI总结失败，请重试');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleRemind = () => {
    if (unsubmittedCount <= 0) {
      toast.info('无需提醒', '所有评价已提交，无需提醒');
      return;
    }
    toast.success('已发送提醒', `已向 ${unsubmittedCount} 位未评价人员发送提醒`);
  };

  return (
    <div className="space-y-4">
      {/* 返回按钮 */}
      <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-indigo-600 font-bold text-sm transition-all">
        <ArrowLeft size={18} /> 返回复盘列表
      </button>

      {/* 模块1：基础信息区 */}
      {activity && (
        <div className="bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className={`px-3 py-1 rounded-xl text-xs font-black ${
                  review.status === ReviewStatus.COMPLETED ? 'bg-emerald-400/30 text-emerald-100' :
                  review.status === ReviewStatus.PENDING_CONFIRM ? 'bg-purple-400/30 text-purple-100' :
                  review.status === ReviewStatus.IN_PROGRESS ? 'bg-blue-400/30 text-blue-100' :
                  'bg-slate-400/30 text-slate-100'
                }`}>
                  {review.status}
                </span>
                <span className="px-3 py-1 bg-white/20 rounded-xl text-xs font-bold">{activity.category}</span>
              </div>
              <h1 className="text-2xl font-black mb-2">{activity.name}</h1>
              <div className="flex items-center gap-4 text-sm text-white/80">
                <span className="flex items-center gap-1"><Calendar size={14} /> {activity.date}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {activity.location}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {activity.reviewData?.reviewer || '负责人'}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs mb-1">实际花费</p>
              <p className="text-2xl font-black">¥{(activity.actualSpend / 10000).toFixed(1)}w</p>
              <p className="text-xs text-white/60">预算 ¥{(activity.budget / 10000).toFixed(1)}w</p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60">到场人数</p>
              <p className="text-lg font-black">{review.participantCount || '-'}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60">留资数</p>
              <p className="text-lg font-black">{review.leadCount || '-'}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60">ROI</p>
              <p className="text-lg font-black">{review.conclusion?.overallScore?.toFixed(1) || '-'}</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs text-white/60">预算执行率</p>
              <p className="text-lg font-black">{((activity.actualSpend / activity.budget) * 100).toFixed(0)}%</p>
            </div>
          </div>
        </div>
      )}

      {/* 模块2：复盘进度区 */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-500" /> 复盘进度
          </h3>
          <div className="flex items-center gap-3">
            {unsubmittedCount > 0 && review.status !== ReviewStatus.COMPLETED && (
              <button
                onClick={handleRemind}
                className="flex items-center gap-1 px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-all"
              >
                <Bell size={14} /> 一键提醒
              </button>
            )}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">预期参与</span>
              <input
                type="number"
                min="1"
                max="20"
                value={review.expectedParticipants}
                onChange={(e) => onUpdate?.({ expectedParticipants: parseInt(e.target.value) || 0 })}
                className="w-12 text-center font-black text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1"
                disabled={review.status === ReviewStatus.COMPLETED}
              />
              <span className="text-slate-400">人</span>
            </div>
          </div>
        </div>

        {/* 进度条 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-600">评价进度</span>
            <span className="text-sm font-bold text-indigo-600">
              {submittedFeedbacks.length}/{review.expectedParticipants} 人已完成
            </span>
          </div>
          <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                review.status === ReviewStatus.COMPLETED ? 'bg-emerald-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min((submittedFeedbacks.length / review.expectedParticipants) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* 参与人状态 */}
        <div className="flex flex-wrap gap-2">
          {review.feedbacks.map(f => (
            <div key={f.id} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
              <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {f.evaluatorName[0]}
              </div>
              <span className="text-sm font-bold text-slate-700">{f.evaluatorName}</span>
              <CheckCircle size={14} className="text-emerald-500" />
            </div>
          ))}
          {Array.from({ length: Math.max(0, review.expectedParticipants - review.feedbacks.length) }).map((_, i) => (
            <div key={`empty-${i}`} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full">
              <div className="w-6 h-6 bg-slate-300 rounded-full flex items-center justify-center text-white text-xs">?</div>
              <span className="text-sm text-slate-400">待评价</span>
            </div>
          ))}
        </div>

        {/* 状态提示 */}
        {review.status !== ReviewStatus.COMPLETED && unsubmittedCount > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <span className="text-sm text-amber-700">还有 <strong>{unsubmittedCount}</strong> 人未提交评价</span>
          </div>
        )}
      </div>

      {/* 模块3：团队评价区 */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-black text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-indigo-500" /> 团队评价（输入层）
          </h3>
          <button
            onClick={() => setActiveModal('addFeedback')}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-all"
          >
            <Plus size={16} /> 添加评价
          </button>
        </div>

        {submittedFeedbacks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {submittedFeedbacks.map(feedback => (
              <FeedbackCard
                key={feedback.id}
                feedback={feedback}
                canEdit={review.status !== ReviewStatus.COMPLETED}
                onDelete={() => handleDeleteFeedback(feedback.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <ClipboardCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold">暂无评价</p>
            <p className="text-slate-400 text-sm mt-1">点击"添加评价"开始填写</p>
          </div>
        )}
      </div>

      {/* 模块4：复盘结果摘要（输出层） */}
      {(review.status === ReviewStatus.PENDING_CONFIRM || review.status === ReviewStatus.COMPLETED) && (
        <div className="bg-white rounded-xl p-6 border border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-800 flex items-center gap-2">
              <Award size={18} className="text-emerald-500" /> 复盘结论（输出层）
            </h3>
            {review.status !== ReviewStatus.COMPLETED && (
              <button
                onClick={handleGenerateAI}
                disabled={isGeneratingAI}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all disabled:opacity-50"
              >
                <Sparkles size={16} /> {isGeneratingAI ? '生成中...' : '生成AI总结'}
              </button>
            )}
          </div>

          {/* 评分汇总 */}
          {review.conclusion && (
            <>
              <div className="grid grid-cols-5 gap-4 mb-6">
                <ScoreCard label="目标达成度" score={review.conclusion.avgGoalScore || 0} color="indigo" />
                <ScoreCard label="线索质量" score={review.conclusion.avgLeadQualityScore || 0} color="emerald" />
                <ScoreCard label="执行稳定性" score={review.conclusion.avgExecutionScore || 0} color="blue" />
                <ScoreCard label="资源效率" score={review.conclusion.avgResourceScore || 0} color="amber" />
                <ScoreCard label="品牌曝光" score={review.conclusion.avgBrandScore || 0} color="purple" />
              </div>

              {/* AI总结 */}
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles size={16} className="text-indigo-500" />
                  <span className="text-sm font-black text-indigo-600">AI洞察</span>
                </div>
                <p className="text-sm text-slate-700">{review.conclusion.aiSummary}</p>
              </div>

              {/* 汇总内容 */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-emerald-50 rounded-xl p-4">
                  <p className="text-xs font-black text-emerald-600 mb-2">共性成功点</p>
                  <ul className="space-y-1">
                    {review.conclusion.keySuccesses?.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-amber-50 rounded-xl p-4">
                  <p className="text-xs font-black text-amber-600 mb-2">高频问题</p>
                  <ul className="space-y-1">
                    {review.conclusion.commonProblems?.map((p, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <AlertTriangle size={14} className="text-amber-500 mt-0.5 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-xs font-black text-indigo-600 mb-2">行动建议</p>
                  <ul className="space-y-1">
                    {review.conclusion.actionSuggestions?.map((s, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <Target size={14} className="text-indigo-500 mt-0.5 shrink-0" />
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* 模块5：复盘状态控制 */}
      <div className="bg-white rounded-xl p-6 border border-slate-100">
        <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
          <ClipboardCheck size={18} className="text-purple-500" /> 复盘状态控制
        </h3>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-600">当前状态: <strong className="text-slate-800">{review.status}</strong></p>
            {review.confirmedAt && (
              <p className="text-xs text-slate-400 mt-1">由 {review.confirmedBy} 于 {review.confirmedAt} 确认</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {review.status === ReviewStatus.PENDING_CONFIRM && (
              <button
                onClick={handleConfirmReview}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all"
              >
                <Check size={18} /> 确认完成复盘
              </button>
            )}
            {review.status === ReviewStatus.COMPLETED && (
              <button
                onClick={() => onUpdate?.({ ...review, status: ReviewStatus.IN_PROGRESS })}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
              >
                重新打开复盘
              </button>
            )}
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4">
          * 完成后仍可补充评价，但已有评价将被锁定
        </p>
      </div>

      {/* 添加评价模态框 */}
      {activeModal === 'addFeedback' && (
        <AddFeedbackModal
          reviewId={review.id}
          onClose={() => setActiveModal(null)}
          onSave={handleAddFeedback}
        />
      )}
    </div>
  );
};

export default ReviewDetailView;
