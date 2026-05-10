/**
 * 媒体与传播 Tab
 */
import React, { useState } from 'react';
import {
  Plus, Loader2, Newspaper, Video, Share2, Star, TrendingUp,
  Eye, ThumbsUp, MessageCircle, Share, Award, Users, FileText, ExternalLink,
  Check, X
} from 'lucide-react';
import { Card, Button } from '../../../shared';
import { useMediaData, MediaRecord } from '../../../utils/hooks';
import { useToast } from '../../../shared/Toast';
import { MediaModal } from '../modals/MediaModal';

interface MediaTabProps {
  activityId: string;
}

export const MediaTab: React.FC<MediaTabProps> = ({ activityId }) => {
  const toast = useToast();
  const {
    stats, mediaRecords, premiumResource, loading,
    createMediaRecord, updateMediaRecord, deleteMediaRecord, updatePremiumResource
  } = useMediaData(activityId);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MediaRecord | null>(null);
  const [activeSection, setActiveSection] = useState<'media' | 'content' | 'premium'>('media');

  const mediaRecordsData = mediaRecords.filter(r => r.category === 'media_coop');
  const contentRecords = mediaRecords.filter(r => r.category === 'content_pub');

  const handleAddRecord = () => {
    setEditingRecord(null);
    setModalOpen(true);
  };

  const handleEditRecord = (record: MediaRecord) => {
    setEditingRecord(record);
    setModalOpen(true);
  };

  const handleSaveRecord = async (data: any) => {
    try {
      if (editingRecord) {
        await updateMediaRecord(parseInt(editingRecord.id), data);
        toast.success('媒体记录已更新');
      } else {
        await createMediaRecord(data);
        toast.success('媒体记录已添加');
      }
      setModalOpen(false);
    } catch {
      toast.error(editingRecord ? '更新失败' : '添加失败');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('确定要删除这条媒体记录吗？')) return;
    try {
      await deleteMediaRecord(parseInt(recordId));
      toast.success('记录已删除');
    } catch {
      toast.error('删除失败');
    }
  };

  const handleTogglePremium = async (field: keyof typeof premiumResource, currentValue: boolean) => {
    if (!premiumResource && field === 'hasOfficialInterview') {
      // 首次创建溢价资源
      try {
        await updatePremiumResource({ [field]: !currentValue });
        toast.success('已更新');
      } catch {
        toast.error('更新失败');
      }
    } else if (premiumResource) {
      try {
        await updatePremiumResource({ [field]: !currentValue });
        toast.success('已更新');
      } catch {
        toast.error('更新失败');
      }
    }
  };

  const getMediaTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'interview': '采访',
      'press_release': '通稿',
      'video': '视频',
      'wechat': '公众号',
      'video_content': '视频内容',
      'social': '小红书/微博',
    };
    return labels[type] || type;
  };

  const getMediaLevelLabel = (level?: string) => {
    const labels: Record<string, string> = {
      'central': '央级',
      'industry': '行业',
      'local': '地方',
    };
    return labels[level || ''] || '-';
  };

  const getEffectivenessColor = (score: number) => {
    if (score >= 60) return 'text-emerald-600 bg-emerald-50';
    if (score >= 30) return 'text-amber-600 bg-amber-50';
    return 'text-slate-600 bg-slate-50';
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
      {/* 统计概览 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
          <div className="flex items-center gap-2 mb-2">
            <Newspaper size={16} className="text-indigo-500" />
            <span className="text-xs text-slate-500">媒体合作</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats?.totalMediaCount || 0}</p>
          <p className="text-xs text-slate-400 mt-1">个媒体</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-white border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Share2 size={16} className="text-purple-500" />
            <span className="text-xs text-slate-500">内容发布</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">{stats?.totalContentCount || 0}</p>
          <p className="text-xs text-slate-400 mt-1">条内容</p>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-white border-amber-100">
          <div className="flex items-center gap-2 mb-2">
            <Eye size={16} className="text-amber-500" />
            <span className="text-xs text-slate-500">总曝光</span>
          </div>
          <p className="text-2xl font-bold text-slate-800">
            {((stats?.totalViews || 0) >= 10000
              ? ((stats?.totalViews || 0) / 10000).toFixed(1) + 'w'
              : (stats?.totalViews || 0).toLocaleString())}
          </p>
          <p className="text-xs text-slate-400 mt-1">阅读+播放</p>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-emerald-500" />
            <span className="text-xs text-slate-500">传播效果</span>
          </div>
          <p className={`text-2xl font-bold ${getEffectivenessColor(stats?.effectivenessScore || 0).split(' ')[0]}`}>
            {stats?.effectivenessScore?.toFixed(0) || 0}
          </p>
          <p className={`text-xs mt-1 px-2 py-0.5 rounded-full inline-block ${getEffectivenessColor(stats?.effectivenessScore || 0)}`}>
            {stats?.effectivenessScore && stats.effectivenessScore >= 60 ? '优秀'
              : stats?.effectivenessScore && stats.effectivenessScore >= 30 ? '良好' : '一般'}
          </p>
        </Card>
      </div>

      {/* 详细数据 */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="flex border-b border-slate-100">
          <button
            onClick={() => setActiveSection('media')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'media'
                ? 'text-indigo-600 border-indigo-600 bg-indigo-50/50'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}>
            <Newspaper size={14} className="inline mr-1" />
            媒体合作 ({mediaRecordsData.length})
          </button>
          <button
            onClick={() => setActiveSection('content')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'content'
                ? 'text-purple-600 border-purple-600 bg-purple-50/50'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}>
            <Share2 size={14} className="inline mr-1" />
            内容发布 ({contentRecords.length})
          </button>
          <button
            onClick={() => setActiveSection('premium')}
            className={`flex-1 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              activeSection === 'premium'
                ? 'text-amber-600 border-amber-600 bg-amber-50/50'
                : 'text-slate-400 border-transparent hover:text-slate-600'
            }`}>
            <Award size={14} className="inline mr-1" />
            溢价资源
          </button>
        </div>

        <div className="p-4">
          {/* 媒体合作 */}
          {activeSection === 'media' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" icon={<Plus size={14} />} onClick={() => { setEditingRecord(null); setModalOpen(true); }}>
                  新增记录
                </Button>
              </div>

              {mediaRecordsData.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Newspaper size={32} className="mx-auto mb-2 opacity-50" />
                  <p>暂无媒体合作记录</p>
                  <p className="text-xs mt-1">点击上方按钮添加</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mediaRecordsData.map(record => (
                    <div key={record.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          record.mediaLevel === 'central' ? 'bg-red-50 text-red-500' :
                          record.mediaLevel === 'industry' ? 'bg-amber-50 text-amber-500' :
                          'bg-slate-100 text-slate-400'
                        }`}>
                          <Newspaper size={18} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            {record.url ? (
                              <a
                                href={record.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-medium text-slate-800 hover:text-indigo-600 hover:underline flex items-center gap-1"
                                title="点击查看报道"
                              >
                                {record.name}
                              </a>
                            ) : (
                              <p className="font-medium text-slate-800">{record.name}</p>
                            )}
                            {record.isKeyMedia && (
                              <Star size={12} className="text-amber-500 fill-amber-500" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-xs text-slate-400">
                              {getMediaTypeLabel(record.mediaType)} · {getMediaLevelLabel(record.mediaLevel)}
                            </span>
                            {record.hasInterview === true && (
                              <span className="text-xs bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded">采访</span>
                            )}
                            {record.hasPublished === true && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">已发稿</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {record.views > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-medium text-slate-600">{record.views.toLocaleString()}</p>
                            <p className="text-xs text-slate-400">曝光</p>
                          </div>
                        )}
                        <div className="flex gap-1">
                          {record.url && (
                            <a
                              href={record.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 hover:bg-indigo-100 rounded text-slate-400 hover:text-indigo-600"
                              title="查看链接"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="p-1.5 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-600"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1.5 hover:bg-rose-100 rounded text-slate-400 hover:text-rose-600"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 内容发布 */}
          {activeSection === 'content' && (
            <div className="space-y-3">
              <div className="flex justify-end">
                <Button size="sm" icon={<Plus size={14} />} onClick={() => {
                  setEditingRecord(null);
                  setModalOpen(true);
                }}>
                  新增内容
                </Button>
              </div>

              {contentRecords.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Share2 size={32} className="mx-auto mb-2 opacity-50" />
                  <p>暂无内容发布记录</p>
                  <p className="text-xs mt-1">点击上方按钮添加</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {contentRecords.map(record => (
                    <div key={record.id} className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {record.mediaType === 'wechat' && <span className="text-green-500 text-sm shrink-0">公众号</span>}
                          {record.mediaType === 'video_content' && <Video size={14} className="text-red-500 shrink-0" />}
                          {record.mediaType === 'social' && <Share2 size={14} className="text-pink-500 shrink-0" />}
                          {record.url ? (
                            <a
                              href={record.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-medium text-slate-800 hover:text-purple-600 hover:underline truncate min-w-0"
                              title="点击查看内容"
                            >
                              {record.name}
                            </a>
                          ) : (
                            <span className="font-medium text-slate-800 truncate">{record.name}</span>
                          )}
                        </div>
                        <div className="flex gap-1 shrink-0">
                          {record.url && (
                            <a
                              href={record.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-purple-100 rounded text-slate-400 hover:text-purple-600"
                              title="查看链接"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                          <button
                            onClick={() => handleEditRecord(record)}
                            className="p-1 hover:bg-slate-200 rounded text-xs text-slate-400 hover:text-slate-600"
                          >
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="p-1 hover:bg-rose-100 rounded text-xs text-slate-400 hover:text-rose-600"
                          >
                            删除
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {record.views > 0 && (
                          <span className="flex items-center gap-1">
                            <Eye size={12} /> {record.views.toLocaleString()}
                          </span>
                        )}
                        {record.interactions > 0 && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={12} /> {record.interactions.toLocaleString()}
                          </span>
                        )}
                        {record.likes > 0 && (
                          <span className="flex items-center gap-1">
                            <ThumbsUp size={12} /> {record.likes}
                          </span>
                        )}
                        {record.comments > 0 && (
                          <span className="flex items-center gap-1">
                            <MessageCircle size={12} /> {record.comments}
                          </span>
                        )}
                        {record.shares > 0 && (
                          <span className="flex items-center gap-1">
                            <Share size={12} /> {record.shares}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 内容统计 */}
              {contentRecords.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-slate-100">
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-700">{contentRecords.reduce((sum, r) => sum + r.views, 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">总曝光</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-700">{contentRecords.reduce((sum, r) => sum + r.interactions, 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">总互动</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-700">{contentRecords.reduce((sum, r) => sum + r.likes, 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">总点赞</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-700">{contentRecords.reduce((sum, r) => sum + (r.comments || 0) + (r.shares || 0), 0).toLocaleString()}</p>
                    <p className="text-xs text-slate-400">评论+转发</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 溢价资源 */}
          {activeSection === 'premium' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {/* 官方采访 */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        premiumResource?.hasOfficialInterview ? 'bg-emerald-100' : 'bg-slate-100'
                      }`}>
                        <Newspaper size={18} className={premiumResource?.hasOfficialInterview ? 'text-emerald-600' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">官方采访</p>
                        <p className="text-xs text-slate-400">是否有官方媒体采访</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePremium('hasOfficialInterview', premiumResource?.hasOfficialInterview || false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        premiumResource?.hasOfficialInterview
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                    >
                      {premiumResource?.hasOfficialInterview ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </div>
                </div>

                {/* 行业大号联合报道 */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        premiumResource?.hasIndustryCoverage ? 'bg-amber-100' : 'bg-slate-100'
                      }`}>
                        <Share2 size={18} className={premiumResource?.hasIndustryCoverage ? 'text-amber-600' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">行业联合报道</p>
                        <p className="text-xs text-slate-400">行业大号联合报道</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePremium('hasIndustryCoverage', premiumResource?.hasIndustryCoverage || false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        premiumResource?.hasIndustryCoverage
                          ? 'bg-amber-500 text-white'
                          : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                    >
                      {premiumResource?.hasIndustryCoverage ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </div>
                </div>

                {/* 奖项/标准发布 */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        premiumResource?.hasAwardParticipation ? 'bg-purple-100' : 'bg-slate-100'
                      }`}>
                        <Award size={18} className={premiumResource?.hasAwardParticipation ? 'text-purple-600' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">奖项/标准</p>
                        <p className="text-xs text-slate-400">参与奖项或标准发布</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePremium('hasAwardParticipation', premiumResource?.hasAwardParticipation || false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        premiumResource?.hasAwardParticipation
                          ? 'bg-purple-500 text-white'
                          : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                    >
                      {premiumResource?.hasAwardParticipation ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </div>
                </div>

                {/* 参会名单 */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        premiumResource?.hasContactList ? 'bg-blue-100' : 'bg-slate-100'
                      }`}>
                        <Users size={18} className={premiumResource?.hasContactList ? 'text-blue-600' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">参会名单</p>
                        <p className="text-xs text-slate-400">获取参会名单资源</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePremium('hasContactList', premiumResource?.hasContactList || false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        premiumResource?.hasContactList
                          ? 'bg-blue-500 text-white'
                          : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                    >
                      {premiumResource?.hasContactList ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </div>
                </div>

                {/* 白皮书 */}
                <div className="p-4 bg-slate-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        premiumResource?.hasWhitepaper ? 'bg-rose-100' : 'bg-slate-100'
                      }`}>
                        <FileText size={18} className={premiumResource?.hasWhitepaper ? 'text-rose-600' : 'text-slate-400'} />
                      </div>
                      <div>
                        <p className="font-medium text-slate-800">白皮书</p>
                        <p className="text-xs text-slate-400">获取白皮书资源</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePremium('hasWhitepaper', premiumResource?.hasWhitepaper || false)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        premiumResource?.hasWhitepaper
                          ? 'bg-rose-500 text-white'
                          : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                      }`}
                    >
                      {premiumResource?.hasWhitepaper ? <Check size={16} /> : <X size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* 重点媒体 */}
              {stats && stats.keyMediaCount > 0 && (
                <div className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Star size={16} className="text-amber-500 fill-amber-500" />
                    <span className="font-medium text-amber-700">重点媒体 {stats.keyMediaCount} 个</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mediaRecords.filter(r => r.isKeyMedia).map(r => (
                      <span key={r.id} className="px-2 py-1 bg-white rounded-full text-xs text-amber-700 border border-amber-200">
                        {r.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 媒体记录弹窗 */}
      <MediaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveRecord}
        editingRecord={editingRecord}
        activityId={activityId}
      />
    </div>
  );
};
