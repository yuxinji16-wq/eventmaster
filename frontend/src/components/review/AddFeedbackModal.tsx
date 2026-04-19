import React, { useState } from 'react';
import { PRESET_REVIEW_TAGS } from '../../types';
import { ReviewFeedback } from '../../types';
import { Check } from 'lucide-react';
import ScoreInput from './ScoreInput';

interface AddFeedbackModalProps {
  reviewId: string;
  onClose: () => void;
  onSave: (feedback: ReviewFeedback) => void;
}

const AddFeedbackModal: React.FC<AddFeedbackModalProps> = ({ reviewId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    evaluatorName: '',
    evaluatorRole: '',
    goalScore: 4,
    leadQualityScore: 4,
    executionScore: 4,
    resourceScore: 4,
    brandScore: 4,
    successes: '',
    problems: '',
    suggestions: '',
    tags: [] as string[]
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.evaluatorName) newErrors.evaluatorName = '请填写姓名';
    if (!formData.successes) newErrors.successes = '请填写成功经验';
    if (!formData.problems) newErrors.problems = '请填写存在问题';
    if (!formData.suggestions) newErrors.suggestions = '请填写优化建议';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const feedback: ReviewFeedback = {
      id: `fb-${Date.now()}`,
      reviewId,
      evaluatorId: `u-${Date.now()}`,
      ...formData,
      isSubmitted: true,
      submittedAt: new Date().toLocaleString('zh-CN'),
      createdAt: new Date().toLocaleString('zh-CN')
    };
    onSave(feedback);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xl" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl z-10 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-xl font-black text-slate-800">添加活动评价</h3>
          <p className="text-xs text-slate-500">请填写您的评价，所有主观评价为必填项</p>
        </div>

        <div className="p-6 space-y-4">
          {/* 基本信息 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-black text-slate-400">您的姓名 *</label>
              <input
                value={formData.evaluatorName}
                onChange={(e) => setFormData({ ...formData, evaluatorName: e.target.value })}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-bold text-slate-700 mt-1 ${errors.evaluatorName ? 'border-rose-300' : 'border-slate-200'}`}
              />
              {errors.evaluatorName && <p className="text-xs text-rose-500 mt-1">{errors.evaluatorName}</p>}
            </div>
            <div>
              <label className="text-xs font-black text-slate-400">您的角色</label>
              <input
                value={formData.evaluatorRole}
                onChange={(e) => setFormData({ ...formData, evaluatorRole: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 mt-1"
              />
            </div>
          </div>

          {/* 评分维度 */}
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs font-black text-slate-400 mb-4">评分维度（1-5分）</p>
            <div className="space-y-4">
              <ScoreInput
                label="目标达成度"
                value={formData.goalScore}
                onChange={(v) => setFormData({ ...formData, goalScore: v })}
              />
              <ScoreInput
                label="线索质量"
                value={formData.leadQualityScore}
                onChange={(v) => setFormData({ ...formData, leadQualityScore: v })}
              />
              <ScoreInput
                label="执行稳定性"
                value={formData.executionScore}
                onChange={(v) => setFormData({ ...formData, executionScore: v })}
              />
              <ScoreInput
                label="资源利用效率"
                value={formData.resourceScore}
                onChange={(v) => setFormData({ ...formData, resourceScore: v })}
              />
              <ScoreInput
                label="品牌曝光效果"
                value={formData.brandScore}
                onChange={(v) => setFormData({ ...formData, brandScore: v })}
              />
            </div>
          </div>

          {/* 主观评价 */}
          <div className="space-y-4">
            <div>
              <label className="text-xs font-black text-emerald-500">成功经验 *</label>
              <textarea
                value={formData.successes}
                onChange={(e) => setFormData({ ...formData, successes: e.target.value })}
                placeholder="活动中做得好的地方..."
                rows={2}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium text-slate-600 mt-1 resize-none ${errors.successes ? 'border-rose-300' : 'border-slate-200'}`}
              />
              {errors.successes && <p className="text-xs text-rose-500 mt-1">{errors.successes}</p>}
            </div>
            <div>
              <label className="text-xs font-black text-rose-500">存在问题 *</label>
              <textarea
                value={formData.problems}
                onChange={(e) => setFormData({ ...formData, problems: e.target.value })}
                placeholder="活动中遇到的问题..."
                rows={2}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium text-slate-600 mt-1 resize-none ${errors.problems ? 'border-rose-300' : 'border-slate-200'}`}
              />
              {errors.problems && <p className="text-xs text-rose-500 mt-1">{errors.problems}</p>}
            </div>
            <div>
              <label className="text-xs font-black text-indigo-500">优化建议 *</label>
              <textarea
                value={formData.suggestions}
                onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                placeholder="下次可以改进的地方..."
                rows={2}
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl font-medium text-slate-600 mt-1 resize-none ${errors.suggestions ? 'border-rose-300' : 'border-slate-200'}`}
              />
              {errors.suggestions && <p className="text-xs text-rose-500 mt-1">{errors.suggestions}</p>}
            </div>
          </div>

          {/* 标签选择 */}
          <div>
            <label className="text-xs font-black text-slate-400 mb-2 block">选择标签（可选）</label>
            <div className="flex flex-wrap gap-2">
              {PRESET_REVIEW_TAGS.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    const newTags = formData.tags.includes(tag.id)
                      ? formData.tags.filter(t => t !== tag.id)
                      : [...formData.tags, tag.id];
                    setFormData({ ...formData, tags: newTags });
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                    formData.tags.includes(tag.id)
                      ? tag.category === '问题类' ? 'bg-rose-500 text-white' :
                        tag.category === '成功类' ? 'bg-emerald-500 text-white' :
                        'bg-indigo-500 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">取消</button>
          <button onClick={handleSubmit} className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 flex items-center justify-center gap-2">
            <Check size={16} /> 提交评价
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddFeedbackModal;
