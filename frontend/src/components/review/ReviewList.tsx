import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRESET_REVIEW_TAGS } from '../../types';
import { ReviewStatus, ReviewTag } from '../../types';
import { Search, ClipboardCheck, Star } from 'lucide-react';

import FilterDropdown from './FilterDropdown';

interface ReviewListProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  statusFilter: string;
  setStatusFilter: (val: string) => void;
  yearFilter: string;
  categoryFilter: string;
  setCategoryFilter: (val: string) => void;
  reviewActivities: any[];
  activities: any[];
}

const ReviewList: React.FC<ReviewListProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  yearFilter,
  categoryFilter,
  setCategoryFilter,
  reviewActivities,
  activities
}) => {
  const navigate = useNavigate();
  const reviews = reviewActivities;

  // 筛选后的复盘列表
  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      // 确保类型一致
      const activity = activities.find(a => String(a.id) === String(review.activityId));
      const activityName = activity?.name || '';
      const matchesSearch = activityName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === '所有状态' || review.status === statusFilter;
      const matchesYear = yearFilter === '所有年份' || activity?.year === yearFilter;
      const matchesCategory = categoryFilter === '所有类型' || activity?.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesYear && matchesCategory;
    });
  }, [reviews, activities, searchQuery, statusFilter, yearFilter, categoryFilter]);

  return (
    <>
      {/* 筛选栏 */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[280px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            placeholder="搜索活动名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border-2 border-transparent rounded-xl focus:bg-white focus:border-indigo-500 outline-none font-bold text-slate-700"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <FilterDropdown
            value={categoryFilter}
            onChange={setCategoryFilter}
            options={[
              { label: '所有类型', value: '所有类型' },
              { label: '自办活动', value: '自办活动' },
              { label: '外部活动', value: '外部市场活动' }
            ]}
          />
          <FilterDropdown
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { label: '所有状态', value: '所有状态' },
              { label: '未开始', value: ReviewStatus.NOT_STARTED },
              { label: '进行中', value: ReviewStatus.IN_PROGRESS },
              { label: '待确认', value: ReviewStatus.PENDING_CONFIRM },
              { label: '已完成', value: ReviewStatus.COMPLETED }
            ]}
          />
        </div>
      </div>

      {/* 复盘列表 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50 border-b border-slate-100 text-xs font-black text-slate-400 uppercase">
          <div className="col-span-3">活动名称</div>
          <div className="col-span-2">活动时间</div>
          <div className="col-span-1">类型</div>
          <div className="col-span-1">花费</div>
          <div className="col-span-1">评分</div>
          <div className="col-span-1">状态</div>
          <div className="col-span-2">标签/进度</div>
          <div className="col-span-1">操作</div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredReviews.map(review => {
            const activity = activities.find(a => String(a.id) === String(review.activityId));
            if (!activity) return null;

            const submittedCount = review.feedbacks.filter(f => f.isSubmitted).length;
            const progressPercent = Math.round((submittedCount / review.expectedParticipants) * 100);
            const avgScore = review.conclusion?.overallScore;

            // 获取该复盘的所有标签
            const allTags = review.feedbacks
              .flatMap(f => f.tags || [])
              .map(tagId => PRESET_REVIEW_TAGS.find(t => t.id === tagId))
              .filter(Boolean) as ReviewTag[];

            return (
              <div key={review.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-all">
                <div className="col-span-3">
                  <p className="font-black text-slate-800 truncate">{activity.name}</p>
                </div>
                <div className="col-span-2">
                  <p className="font-bold text-slate-700">{activity.date}</p>
                </div>
                <div className="col-span-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    activity.category === '自办活动'
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'bg-emerald-100 text-emerald-700'
                  }`}>
                    {activity.category === '自办活动' ? '自办' : '外部'}
                  </span>
                </div>
                <div className="col-span-1">
                  <p className="font-black text-slate-700">¥{(activity.actualSpend / 10000).toFixed(1)}w</p>
                </div>
                <div className="col-span-1">
                  {avgScore ? (
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="font-black text-slate-700">{avgScore.toFixed(1)}</span>
                    </div>
                  ) : (
                    <span className="text-slate-300">-</span>
                  )}
                </div>
                <div className="col-span-1">
                  <span className={`px-2 py-1 rounded-lg text-xs font-black ${
                    review.status === ReviewStatus.COMPLETED ? 'bg-emerald-100 text-emerald-700' :
                    review.status === ReviewStatus.PENDING_CONFIRM ? 'bg-purple-100 text-purple-700' :
                    review.status === ReviewStatus.IN_PROGRESS ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-500'
                  }`}>
                    {review.status}
                  </span>
                </div>
                <div className="col-span-2">
                  <div className="flex flex-wrap gap-1 mb-2">
                    {allTags.slice(0, 2).map(tag => (
                      <span
                        key={tag.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          tag.category === '问题类' ? 'bg-rose-100 text-rose-600' :
                          tag.category === '成功类' ? 'bg-emerald-100 text-emerald-600' :
                          'bg-indigo-100 text-indigo-600'
                        }`}
                      >
                        #{tag.name}
                      </span>
                    ))}
                    {allTags.length > 2 && (
                      <span className="text-[10px] text-slate-400">+{allTags.length - 2}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${progressPercent >= 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                        style={{ width: `${Math.min(progressPercent, 100)}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500">{submittedCount}/{review.expectedParticipants}</span>
                  </div>
                </div>
                <div className="col-span-1">
                  <button
                    onClick={() => navigate(`/reviews/${review.id}`)}
                    className="px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-xs font-bold hover:bg-indigo-100 transition-all"
                  >
                    进入复盘
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredReviews.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-400 font-bold">暂无复盘记录</p>
          </div>
        )}
      </div>
    </>
  );
};

export default ReviewList;
