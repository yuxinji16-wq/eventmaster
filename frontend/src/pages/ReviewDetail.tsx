import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReviewsData } from '../utils/hooks';
import { BackButton, Card, LoadingSpinner } from '../shared';
import ReviewDetailView from '../components/review/ReviewCenter';

const ReviewDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reviewActivities, loading, updateReview } = useReviewsData();
  const [review, setReview] = useState<any>(null);

  useEffect(() => {
    if (id && reviewActivities.length > 0) {
      const found = reviewActivities.find((r: any) => r.id === id);
      setReview(found || null);
    }
  }, [id, reviewActivities]);

  const handleBack = () => {
    navigate('/reviews');
  };

  const handleUpdate = (updated: any) => {
    if (!id) return;
    updateReview(id, updated);
    setReview((prev: any) => ({ ...prev, ...updated }));
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回复盘列表" />
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (!review) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回复盘列表" />
        <Card>
          <div className="text-center py-12">
            <p className="text-slate-500">复盘不存在或已被删除</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={handleBack} label="返回复盘列表" />
      <ReviewDetailView review={review} onBack={handleBack} onUpdate={handleUpdate} />
    </div>
  );
};

export default ReviewDetail;
