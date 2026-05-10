/**
 * 媒体记录弹窗
 */
import React, { useState, useEffect } from 'react';
import { X, Newspaper, Video, Share2, Star } from 'lucide-react';
import { Card, Button, Input, Select } from '../../../shared';
import { MediaRecord } from '../../../utils/hooks';

interface MediaModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  editingRecord: MediaRecord | null;
  activityId: string;
}

const CATEGORY_OPTIONS = [
  { value: 'media_coop', label: '媒体合作' },
  { value: 'content_pub', label: '内容发布' },
];

const MEDIA_TYPE_OPTIONS = [
  { value: 'interview', label: '采访' },
  { value: 'press_release', label: '通稿' },
  { value: 'video', label: '视频' },
  { value: 'wechat', label: '公众号文章' },
  { value: 'video_content', label: '视频内容' },
  { value: 'social', label: '小红书/微博' },
];

const MEDIA_LEVEL_OPTIONS = [
  { value: 'central', label: '央级' },
  { value: 'industry', label: '行业' },
  { value: 'local', label: '地方' },
];

// URL 自动补全：如果没有协议前缀，自动添加 https://
const normalizeUrl = (url: string): string => {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (!trimmed.match(/^https?:\/\//i)) {
    return 'https://' + trimmed;
  }
  return trimmed;
};

export const MediaModal: React.FC<MediaModalProps> = ({
  open,
  onClose,
  onSave,
  editingRecord,
}) => {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<'media_coop' | 'content_pub'>('media_coop');
  const [formData, setFormData] = useState({
    name: '',
    mediaType: 'interview',
    mediaLevel: '',
    channel: '',
    url: '',
    publishDate: '',
    views: 0,
    interactions: 0,
    likes: 0,
    comments: 0,
    shares: 0,
    hasInterview: false,
    hasPublished: false,
    hasVideoInterview: false,
    isKeyMedia: false,
    notes: '',
  });

  useEffect(() => {
    if (editingRecord) {
      setCategory(editingRecord.category);
      setFormData({
        name: editingRecord.name || '',
        mediaType: editingRecord.mediaType || 'interview',
        mediaLevel: editingRecord.mediaLevel || '',
        channel: editingRecord.channel || '',
        url: editingRecord.url || '',
        publishDate: editingRecord.publishDate || '',
        views: editingRecord.views || 0,
        interactions: editingRecord.interactions || 0,
        likes: editingRecord.likes || 0,
        comments: editingRecord.comments || 0,
        shares: editingRecord.shares || 0,
        hasInterview: editingRecord.hasInterview || false,
        hasPublished: editingRecord.hasPublished || false,
        hasVideoInterview: editingRecord.hasVideoInterview || false,
        isKeyMedia: editingRecord.isKeyMedia || false,
        notes: editingRecord.notes || '',
      });
    } else {
      setCategory('media_coop');
      setFormData({
        name: '',
        mediaType: 'interview',
        mediaLevel: '',
        channel: '',
        url: '',
        publishDate: '',
        views: 0,
        interactions: 0,
        likes: 0,
        comments: 0,
        shares: 0,
        hasInterview: false,
        hasPublished: false,
        hasVideoInterview: false,
        isKeyMedia: false,
        notes: '',
      });
    }
  }, [editingRecord, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('请输入名称');
      return;
    }
    setLoading(true);
    try {
      await onSave({
        name: formData.name,
        category,
        mediaType: formData.mediaType,
        mediaLevel: formData.mediaLevel || undefined,
        channel: formData.channel || undefined,
        url: normalizeUrl(formData.url) || undefined,
        publishDate: formData.publishDate || undefined,
        views: formData.views,
        interactions: formData.interactions,
        likes: formData.likes,
        comments: formData.comments,
        shares: formData.shares,
        hasInterview: formData.hasInterview,
        hasPublished: formData.hasPublished,
        hasVideoInterview: formData.hasVideoInterview,
        isKeyMedia: formData.isKeyMedia,
        notes: formData.notes || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800">
            {editingRecord ? '编辑媒体记录' : '新增媒体记录'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* 分类 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">分类 *</label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setCategory('media_coop')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors ${
                  category === 'media_coop'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Newspaper size={16} />
                <span className="font-medium">媒体合作</span>
              </button>
              <button
                type="button"
                onClick={() => setCategory('content_pub')}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border-2 transition-colors ${
                  category === 'content_pub'
                    ? 'border-purple-500 bg-purple-50 text-purple-600'
                    : 'border-slate-200 text-slate-500 hover:border-slate-300'
                }`}
              >
                <Share2 size={16} />
                <span className="font-medium">内容发布</span>
              </button>
            </div>
          </div>

          {/* 名称 */}
          <Input
            label="名称 *"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder={category === 'media_coop' ? '如：新华网、央视新闻' : '如：活动回顾文章、精彩视频'}
            required
          />

          {/* 类型 */}
          <Select
            label="类型"
            value={formData.mediaType}
            onChange={e => setFormData(prev => ({ ...prev, mediaType: e.target.value }))}
            options={MEDIA_TYPE_OPTIONS}
          />

          {/* 媒体级别（仅媒体合作） */}
          {category === 'media_coop' && (
            <Select
              label="媒体级别"
              value={formData.mediaLevel}
              onChange={e => setFormData(prev => ({ ...prev, mediaLevel: e.target.value }))}
              options={[{ value: '', label: '请选择' }, ...MEDIA_LEVEL_OPTIONS]}
            />
          )}

          {/* 渠道 */}
          <Input
            label="渠道/平台"
            value={formData.channel}
            onChange={e => setFormData(prev => ({ ...prev, channel: e.target.value }))}
            placeholder={category === 'media_coop' ? '如：财经频道' : '如：官方公众号、抖音'}
          />

          {/* 链接 */}
          <Input
            label={category === 'media_coop' ? '报道链接' : '发布链接'}
            value={formData.url}
            onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
            placeholder={formData.url ? '' : 'https://...'}
          />

          {/* 发布日期 */}
          <Input
            label="发布日期"
            type="date"
            value={formData.publishDate}
            onChange={e => setFormData(prev => ({ ...prev, publishDate: e.target.value }))}
          />

          {/* 媒体合作特有字段 */}
          {category === 'media_coop' && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">合作情况</label>
              <div className="flex flex-wrap gap-2">
                <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.hasInterview}
                    onChange={e => setFormData(prev => ({ ...prev, hasInterview: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-600">有采访</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.hasPublished}
                    onChange={e => setFormData(prev => ({ ...prev, hasPublished: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-600">已发布稿件</span>
                </label>
                <label className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg cursor-pointer hover:bg-slate-100">
                  <input
                    type="checkbox"
                    checked={formData.hasVideoInterview}
                    onChange={e => setFormData(prev => ({ ...prev, hasVideoInterview: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-slate-600">视频采访</span>
                </label>
                <label className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer transition-colors ${
                  formData.isKeyMedia ? 'bg-amber-100' : 'bg-slate-50 hover:bg-slate-100'
                }`}>
                  <input
                    type="checkbox"
                    checked={formData.isKeyMedia}
                    onChange={e => setFormData(prev => ({ ...prev, isKeyMedia: e.target.checked }))}
                    className="rounded"
                  />
                  <Star size={14} className={formData.isKeyMedia ? 'text-amber-500 fill-amber-500' : 'text-slate-400'} />
                  <span className={`text-sm ${formData.isKeyMedia ? 'text-amber-700' : 'text-slate-600'}`}>重点媒体</span>
                </label>
              </div>
            </div>
          )}

          {/* 数据指标 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">数据指标</label>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-slate-500 mb-1">阅读/播放量</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.views}
                  onChange={e => setFormData(prev => ({ ...prev, views: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">点赞数</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.likes}
                  onChange={e => setFormData(prev => ({ ...prev, likes: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">评论数</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.comments}
                  onChange={e => setFormData(prev => ({ ...prev, comments: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">转发数</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.shares}
                  onChange={e => setFormData(prev => ({ ...prev, shares: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">互动量</label>
                <Input
                  type="number"
                  min="0"
                  value={formData.interactions}
                  onChange={e => setFormData(prev => ({ ...prev, interactions: parseInt(e.target.value) || 0 }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* 备注 */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">备注</label>
            <textarea
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="补充说明..."
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              取消
            </Button>
            <Button type="submit" loading={loading}>
              {editingRecord ? '保存' : '添加'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
