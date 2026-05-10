/**
 * 评价弹窗
 * 从 pages/ActivityDetail.tsx 行 682-852 迁移而来
 */
import React, { useState } from 'react';
import { Modal, Button, Input, Select } from '../../../shared';
import { useToast } from '../../../shared/Toast';
import { PRESET_REVIEW_TAGS } from '../../../types';

interface FeedbackModalProps {
  onClose: () => void;
  onSave: (data: any) => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose, onSave }) => {
  const toast = useToast();
  const [form, setForm] = useState({
    evaluator_id: `user-${Date.now()}`,
    evaluator_name: '',
    evaluator_role: '',
    goal_score: 4,
    lead_quality_score: 4,
    execution_score: 4,
    resource_score: 4,
    brand_score: 4,
    successes: '',
    problems: '',
    suggestions: '',
    tags: [] as string[],
  });

  const DEPARTMENTS = [
    { value: '市场部', label: '市场部' },
    { value: '销售部', label: '销售部' },
    { value: '运营部', label: '运营部' },
    { value: '产品部', label: '产品部' },
    { value: '设计部', label: '设计部' },
    { value: '技术部', label: '技术部' },
    { value: '行政部', label: '行政部' },
    { value: '其他', label: '其他' },
  ];

  const SCORE_OPTIONS = [1, 2, 3, 4, 5];

  const toggleTag = (tagName: string) => {
    setForm(prev => ({
      ...prev,
      tags: prev.tags.includes(tagName)
        ? prev.tags.filter(t => t !== tagName)
        : [...prev.tags, tagName]
    }));
  };

  const handleSave = () => {
    if (!form.evaluator_name.trim()) {
      toast.warning('请填写评价人姓名');
      return;
    }
    onSave(form);
  };

  const renderScoreSelect = (label: string, field: string) => (
    <div>
      <label className="text-xs font-bold text-slate-500 uppercase">{label}</label>
      <div className="flex gap-1 mt-1">
        {SCORE_OPTIONS.map(score => (
          <button
            key={score}
            type="button"
            onClick={() => setForm({ ...form, [field]: score })}
            className={`w-9 h-9 rounded-lg font-bold text-sm transition-colors ${
              (form as any)[field] === score
                ? 'bg-indigo-500 text-white'
                : 'bg-slate-100 text-slate-400 hover:bg-indigo-100'
            }`}
          >
            {score}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Modal title="添加评价" onClose={onClose} size="lg">
      <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">评价人姓名 *</label>
            <Input
              value={form.evaluator_name}
              onChange={e => setForm({ ...form, evaluator_name: e.target.value })}
              placeholder="输入姓名"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase">部门/角色</label>
            <Select
              value={form.evaluator_role}
              onChange={e => setForm({ ...form, evaluator_role: e.target.value })}
              options={DEPARTMENTS}
              placeholder="选择部门"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">评分 (1-5分)</label>
          <div className="grid grid-cols-5 gap-4">
            {renderScoreSelect('目标达成', 'goal_score')}
            {renderScoreSelect('线索质量', 'lead_quality_score')}
            {renderScoreSelect('执行稳定', 'execution_score')}
            {renderScoreSelect('资源效率', 'resource_score')}
            {renderScoreSelect('品牌曝光', 'brand_score')}
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">做得好 (成功经验)</label>
          <textarea
            value={form.successes}
            onChange={e => setForm({ ...form, successes: e.target.value })}
            placeholder="分享本次活动的成功经验..."
            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">问题点 (存在问题)</label>
          <textarea
            value={form.problems}
            onChange={e => setForm({ ...form, problems: e.target.value })}
            placeholder="指出本次活动中需要改进的地方..."
            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase">优化建议</label>
          <textarea
            value={form.suggestions}
            onChange={e => setForm({ ...form, suggestions: e.target.value })}
            placeholder="提出具体的改进建议..."
            className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl outline-none resize-none"
            rows={3}
          />
        </div>

        <div>
          <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">快速标签</label>
          <div className="flex flex-wrap gap-2">
            {PRESET_REVIEW_TAGS.map(tag => (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  form.tags.includes(tag.name)
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-indigo-100'
                }`}
              >
                {tag.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2 mt-6">
        <Button variant="ghost" onClick={onClose}>取消</Button>
        <Button variant="primary" onClick={handleSave}>保存评价</Button>
      </div>
    </Modal>
  );
};

export default FeedbackModal;
