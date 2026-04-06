import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Opportunity } from '../types';
import { useOpportunitiesData } from '../utils/hooks';
import { BackButton, Card, LoadingSpinner } from '../shared';
import OpportunityDetailView from '../components/opportunity/OpportunityManager';

const OpportunityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { opportunities, loading, updateOpportunity, deleteOpportunity } = useOpportunitiesData();
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (id && opportunities.length > 0) {
      const found = opportunities.find(o => o.id === id);
      setOpportunity(found || null);
    }
  }, [id, opportunities]);

  const handleBack = () => {
    navigate('/opportunities');
  };

  const handleUpdate = async (data: Partial<Opportunity>) => {
    if (!opportunity) return;
    try {
      await updateOpportunity(parseInt(opportunity.id), data);
      setOpportunity({ ...opportunity, ...data });
    } catch (error) {
      console.error('Failed to update opportunity:', error);
    }
  };

  const handleDelete = async () => {
    if (!opportunity) return;
    if (window.confirm('确定要永久删除这个商机吗？')) {
      try {
        await deleteOpportunity(parseInt(opportunity.id));
        navigate('/opportunities');
      } catch (error) {
        console.error('Failed to delete opportunity:', error);
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(!isEditing);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回商机列表" />
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="space-y-4">
        <BackButton onClick={handleBack} label="返回商机列表" />
        <Card>
          <div className="text-center py-12">
            <p className="text-slate-500">商机不存在或已被删除</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <BackButton onClick={handleBack} label="返回商机列表" />
      <Card>
        <OpportunityDetailView
          opportunity={opportunity}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
          onEdit={handleEdit}
          isEditing={isEditing}
        />
      </Card>
    </div>
  );
};

export default OpportunityDetail;
