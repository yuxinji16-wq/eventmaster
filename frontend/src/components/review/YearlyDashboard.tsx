import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PRESET_REVIEW_TAGS } from '../../types';
import { ReviewStatus, Activity } from '../../types';
import {
  Activity as ActivityIcon, Wallet, TrendingUp, Star, BarChart3,
  Building, Building2, Trophy, AlertCircle, CheckCircle
} from 'lucide-react';

interface YearlyDashboardProps {
  yearFilter: string;
  reviewActivities: any[];
  activities: any[];
}

const YearlyDashboard: React.FC<YearlyDashboardProps> = ({ yearFilter, reviewActivities, activities }) => {
  const reviews = reviewActivities;

  // 根据年份筛选的活动和复盘
  const yearFilteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const activity = activities.find(a => String(a.id) === String(review.activityId));
      // 如果是"所有年份"，则显示所有
      if (yearFilter === '所有年份') return true;
      return activity?.year === yearFilter;
    });
  }, [reviews, activities, yearFilter]);

  // 年度统计数据
  const yearStats = useMemo(() => {
    const completedReviews = yearFilteredReviews.filter(r => r.status === ReviewStatus.COMPLETED);

    // 按年份筛选活动计算总花费
    const yearActivities = yearFilter === '所有年份'
      ? activities
      : activities.filter(a => a.year === yearFilter);
    const totalSpend = yearActivities.reduce((sum, a) => sum + a.actualSpend, 0);
    const avgROI = completedReviews.length > 0
      ? completedReviews.reduce((sum, r) => sum + (r.conclusion?.overallScore || 0), 0) / completedReviews.length
      : 0;
    const avgScore = completedReviews.length > 0
      ? completedReviews.reduce((sum, r) => sum + (r.conclusion?.overallScore || 0), 0) / completedReviews.length
      : 0;

    return {
      activityCount: yearFilteredReviews.length,
      totalSpend,
      avgROI,
      avgScore
    };
  }, [yearFilteredReviews, activities, yearFilter]);

  // 活动类型对比数据
  const categoryStats = useMemo(() => {
    const selfActivities = yearFilteredReviews
      .map(r => activities.find(a => String(a.id) === String(r.activityId)))
      .filter(a => a?.category === '自办活动') as Activity[];

    const externalActivities = yearFilteredReviews
      .map(r => activities.find(a => String(a.id) === String(r.activityId)))
      .filter(a => a?.category === '外部市场活动') as Activity[];

    const selfReviews = yearFilteredReviews.filter(r => {
      const a = activities.find(act => String(act.id) === String(r.activityId));
      return a?.category === '自办活动' && r.status === ReviewStatus.COMPLETED;
    });

    const externalReviews = yearFilteredReviews.filter(r => {
      const a = activities.find(act => String(act.id) === String(r.activityId));
      return a?.category === '外部市场活动' && r.status === ReviewStatus.COMPLETED;
    });

    return {
      self: {
        count: selfActivities.length,
        avgScore: selfReviews.length > 0
          ? selfReviews.reduce((sum, r) => sum + (r.conclusion?.overallScore || 0), 0) / selfReviews.length
          : 0,
        avgROI: selfReviews.length > 0
          ? selfReviews.reduce((sum, r) => sum + (r.conclusion?.overallScore || 0), 0) / selfReviews.length
          : 0,
        leadCount: selfReviews.reduce((sum, r) => sum + (r.leadCount || 0), 0)
      },
      external: {
        count: externalActivities.length,
        avgScore: externalReviews.length > 0
          ? externalReviews.reduce((sum, r) => sum + (r.conclusion?.overallScore || 0), 0) / externalReviews.length
          : 0,
        avgROI: externalReviews.length > 0
          ? externalReviews.reduce((sum, r) => sum + (r.conclusion?.overallScore || 0), 0) / externalReviews.length
          : 0,
        leadCount: externalReviews.reduce((sum, r) => sum + (r.leadCount || 0), 0)
      }
    };
  }, [yearFilteredReviews, activities]);

  // 年度问题Top（基于标签）
  const topProblems = useMemo(() => {
    const tagCounts: Record<string, number> = {};

    yearFilteredReviews.forEach(review => {
      review.feedbacks.forEach(feedback => {
        feedback.tags?.forEach(tagId => {
          const tag = PRESET_REVIEW_TAGS.find(t => t.id === tagId);
          if (tag && tag.category === '问题类') {
            tagCounts[tag.name] = (tagCounts[tag.name] || 0) + 1;
          }
        });
      });
    });

    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [yearFilteredReviews]);

  // 优秀案例（评分最高的3个）
  const topCases = useMemo(() => {
    return yearFilteredReviews
      .filter(r => r.status === ReviewStatus.COMPLETED && r.conclusion?.overallScore)
      .sort((a, b) => (b.conclusion?.overallScore || 0) - (a.conclusion?.overallScore || 0))
      .slice(0, 3);
  }, [yearFilteredReviews]);

  return (
    <div className="space-y-4">
      {/* 年度总览 */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <ActivityIcon size={20} className="text-white/70" />
            <span className="text-xs text-white/60">年度</span>
          </div>
          <p className="text-3xl font-black">{yearStats.activityCount}</p>
          <p className="text-sm text-white/80">活动数量</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <Wallet size={20} className="text-white/70" />
            <span className="text-xs text-white/60">年度</span>
          </div>
          <p className="text-3xl font-black">¥{(yearStats.totalSpend / 10000).toFixed(0)}w</p>
          <p className="text-sm text-white/80">总花费</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp size={20} className="text-white/70" />
            <span className="text-xs text-white/60">平均</span>
          </div>
          <p className="text-3xl font-black">{yearStats.avgROI.toFixed(1)}</p>
          <p className="text-sm text-white/80">平均ROI</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-2">
            <Star size={20} className="text-white/70" />
            <span className="text-xs text-white/60">平均</span>
          </div>
          <p className="text-3xl font-black">{yearStats.avgScore.toFixed(1)}</p>
          <p className="text-sm text-white/80">平均评分</p>
        </div>
      </div>

      {/* 活动类型对比 + 年度问题Top + 优秀案例 */}
      <div className="grid grid-cols-3 gap-4">
        {/* 活动类型对比 */}
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={18} className="text-indigo-500" /> 活动类型对比
          </h3>
          <div className="space-y-4">
            {/* 自办活动 */}
            <div className="bg-indigo-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building size={16} className="text-indigo-600" />
                <span className="font-bold text-indigo-700">自办活动</span>
                <span className="ml-auto text-xs bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                  {categoryStats.self.count} 个
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-black text-indigo-600">{categoryStats.self.avgScore.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">平均评分</p>
                </div>
                <div>
                  <p className="text-lg font-black text-indigo-600">{categoryStats.self.avgROI.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">平均ROI</p>
                </div>
                <div>
                  <p className="text-lg font-black text-indigo-600">{categoryStats.self.leadCount}</p>
                  <p className="text-xs text-slate-500">留资数</p>
                </div>
              </div>
            </div>
            {/* 外部活动 */}
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Building2 size={16} className="text-emerald-600" />
                <span className="font-bold text-emerald-700">外部活动</span>
                <span className="ml-auto text-xs bg-emerald-200 text-emerald-700 px-2 py-0.5 rounded-full font-bold">
                  {categoryStats.external.count} 个
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-lg font-black text-emerald-600">{categoryStats.external.avgScore.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">平均评分</p>
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-600">{categoryStats.external.avgROI.toFixed(1)}</p>
                  <p className="text-xs text-slate-500">平均ROI</p>
                </div>
                <div>
                  <p className="text-lg font-black text-emerald-600">{categoryStats.external.leadCount}</p>
                  <p className="text-xs text-slate-500">留资数</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 年度问题Top */}
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-500" /> 年度问题 Top
          </h3>
          {topProblems.length > 0 ? (
            <div className="space-y-2">
              {topProblems.map((problem, index) => (
                <div key={problem.name} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-black ${
                      index === 0 ? 'bg-rose-500 text-white' :
                      index === 1 ? 'bg-rose-400 text-white' :
                      'bg-rose-300 text-white'
                    }`}>
                      {index + 1}
                    </span>
                    <span className="text-sm font-bold text-slate-700">{problem.name}</span>
                  </div>
                  <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded-full">
                    {problem.count}次
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <CheckCircle size={32} className="mx-auto mb-2 text-emerald-300" />
              <p className="text-sm">暂无问题记录</p>
            </div>
          )}
        </div>

        {/* 优秀案例 */}
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <h3 className="font-black text-slate-800 mb-4 flex items-center gap-2">
            <Trophy size={18} className="text-amber-500" /> 优秀案例
          </h3>
          {topCases.length > 0 ? (
            <div className="space-y-2">
              {topCases.map((review, index) => {
                const activity = activities.find(a => String(a.id) === String(review.activityId));
                return (
                  <div
                    key={review.id}
                    onClick={() => navigate(`/reviews/${review.id}`)}
                    className="flex items-center justify-between p-3 bg-amber-50 rounded-xl cursor-pointer hover:bg-amber-100 transition-all"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-500 font-black text-lg">#{index + 1}</span>
                      <div>
                        <p className="text-sm font-bold text-slate-700 truncate max-w-[120px]">{activity?.name}</p>
                        <p className="text-xs text-slate-400">{activity?.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star size={14} className="text-amber-500 fill-amber-500" />
                      <span className="font-black text-amber-600">{review.conclusion?.overallScore?.toFixed(1)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              <Trophy size={32} className="mx-auto mb-2 text-amber-300" />
              <p className="text-sm">暂无已完成的复盘</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearlyDashboard;
