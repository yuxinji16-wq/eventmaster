import React, { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useReviewsData, useActivitiesData } from '../../utils/hooks';
import { Review, ReviewStatus } from '../../types';
import YearlyDashboard from './YearlyDashboard';
import ReviewList from './ReviewList';
import ReviewDetailView from './ReviewDetailView';

const ReviewCenter: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { reviewActivities } = useReviewsData();
  const { activities } = useActivitiesData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('所有状态');
  const [yearFilter, setYearFilter] = useState('所有年份');
  const [categoryFilter, setCategoryFilter] = useState('所有类型');

  // 使用 hook 返回的数据作为 reviews
  const reviews = reviewActivities;

  // 动态获取所有可用年份
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    activities.forEach(a => { if (a.year) years.add(a.year); });
    const currentYear = new Date().getFullYear().toString();
    years.add(currentYear);
    years.add((parseInt(currentYear) - 1).toString());
    return Array.from(years).sort((a, b) => parseInt(b) - parseInt(a));
  }, [activities]);

  // 根据 URL 参数判断是列表页还是详情页
  const isDetailView = !!id;

  // 获取当前复盘详情
  const currentReview = useMemo(() => {
    if (!id) return null;
    return reviews.find(r => r.id === id) || null;
  }, [id, reviews]);

  // 详情页返回处理
  const handleBackToList = () => {
    navigate('/reviews');
  };

  // 详情页更新处理
  const handleUpdateReview = (updated: Partial<Review>) => {
    // 由于使用了 hook，数据会自动更新
    // 这里可以添加额外的更新逻辑
    console.log('Review updated:', updated);
  };

  // 渲染详情页
  if (isDetailView && currentReview) {
    return (
      <ReviewDetailView
        review={currentReview}
        onBack={handleBackToList}
        onUpdate={handleUpdateReview}
      />
    );
  }

  // 渲染列表页（默认）
  return (
    <div className="space-y-4">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">复盘中心</h1>
          <p className="text-sm text-slate-500 mt-1">年度复盘分析 + 活动复盘列表</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all cursor-pointer"
          >
            <option value="所有年份">所有年份</option>
            {availableYears.map(year => (
              <option key={year} value={year}>{year} 年度</option>
            ))}
          </select>
        </div>
      </div>

      {/* 年度仪表盘 */}
      <YearlyDashboard yearFilter={yearFilter} />

      {/* 复盘列表 */}
      <ReviewList
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        yearFilter={yearFilter}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />
    </div>
  );
};

export default ReviewCenter;
