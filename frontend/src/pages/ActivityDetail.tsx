import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, ActivityStatus } from '../types';
import { useActivitiesData } from '../utils/hooks';
import { BackButton, Card, LoadingSpinner, Button } from '../shared';
import {
  Calendar, MapPin, Edit2, Trash2
} from 'lucide-react';

const ActivityDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { activities, loading, updateActivity, deleteActivity } = useActivitiesData();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Activity>>({});

  useEffect(() => {
    if (id && activities.length > 0) {
      const found = activities.find(a => a.id === id);
      setActivity(found || null);
      setEditForm(found || {});
    }
  }, [id, activities]);

  const handleSave = async () => {
    if (!activity || !editForm || !id) return;
    try {
      await updateActivity(parseInt(id), editForm as Partial<Activity>);
      const updated = { ...activity, ...editForm };
      setActivity(updated);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update:', error);
    }
  };

  const handleDelete = async () => {
    if (!activity || !id) return;
    if (window.confirm('确定要永久删除这个活动吗？')) {
      try {
        await deleteActivity(parseInt(id));
        navigate('/activities');
      } catch (error) {
        console.error('Failed to delete:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => navigate('/activities')} />
        <Card>
          <LoadingSpinner />
        </Card>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="space-y-4">
        <BackButton onClick={() => navigate('/activities')} />
        <Card>
          <div className="text-center py-12 text-slate-500">
            活动不存在或已被删除
          </div>
        </Card>
      </div>
    );
  }

  const totalExpenses = activity.expenses?.reduce((sum, e) => sum + e.amount, 0) || activity.actualSpend || 0;
  const budgetHealth = totalExpenses > activity.budget ? 'over' : totalExpenses > activity.budget * 0.9 ? 'warning' : 'healthy';
  const executionRate = activity.budget > 0 ? (totalExpenses / activity.budget) * 100 : 0;

  return (
    <div className="space-y-4">
      <BackButton onClick={() => navigate('/activities')} label="返回活动列表" />

      {/* 顶部信息卡 */}
      <div className={`rounded-xl p-6 text-white ${activity.status === ActivityStatus.COMPLETED ? 'bg-gradient-to-r from-emerald-500 to-emerald-600' : activity.status === ActivityStatus.ONGOING ? 'bg-gradient-to-r from-blue-500 to-blue-600' : 'bg-gradient-to-r from-indigo-500 to-indigo-600'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`px-3 py-1 rounded-xl text-xs font-bold bg-white/20`}>
                {activity.status}
              </span>
              <span className="px-3 py-1 bg-white/10 rounded-xl text-xs font-bold">
                {activity.category}
              </span>
            </div>
            <h1 className="text-2xl font-black mb-2">{activity.name}</h1>
            <div className="flex items-center gap-4 text-sm text-white/80">
              <span className="flex items-center gap-1"><Calendar size={14} /> {activity.date}</span>
              <span className="flex items-center gap-1"><MapPin size={14} /> {activity.location}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 size={14} /> 编辑
                </Button>
                <Button variant="danger" size="sm" onClick={handleDelete}>
                  <Trash2 size={14} /> 删除
                </Button>
              </>
            ) : (
              <>
                <Button size="sm" onClick={handleSave}>保存</Button>
                <Button variant="ghost" size="sm" onClick={() => { setIsEditing(false); setEditForm(activity); }}>取消</Button>
              </>
            )}
          </div>
        </div>

        {/* 统计指标 */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-white/60 mb-1">预算</p>
            <p className="text-2xl font-black">¥{(activity.budget / 10000).toFixed(1)}w</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-white/60 mb-1">已支出</p>
            <p className="text-2xl font-black">¥{(totalExpenses / 10000).toFixed(1)}w</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="text-xs text-white/60 mb-1">到场人数</p>
            <p className="text-2xl font-black">{activity.leads || 0}</p>
          </div>
          <div className={`rounded-xl p-4 ${budgetHealth === 'over' ? 'bg-rose-500/30' : budgetHealth === 'warning' ? 'bg-amber-500/30' : 'bg-emerald-500/30'}`}>
            <p className="text-xs text-white/60 mb-1">执行率</p>
            <p className="text-2xl font-black">{executionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* 编辑表单 */}
      {isEditing && (
        <Card className="space-y-4">
          <h3 className="font-bold text-slate-800">编辑活动信息</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">活动名称</label>
              <input
                type="text"
                value={editForm.name || ''}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">日期</label>
              <input
                type="date"
                value={editForm.date || ''}
                onChange={e => setEditForm({ ...editForm, date: e.target.value })}
                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">地点</label>
              <input
                type="text"
                value={editForm.location || ''}
                onChange={e => setEditForm({ ...editForm, location: e.target.value })}
                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-500 uppercase">预算</label>
              <input
                type="number"
                value={editForm.budget || 0}
                onChange={e => setEditForm({ ...editForm, budget: Number(e.target.value) })}
                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-bold text-slate-500 uppercase">描述</label>
              <textarea
                value={editForm.description || ''}
                onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                className="w-full mt-1 px-4 py-2 border border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                rows={3}
              />
            </div>
          </div>
        </Card>
      )}

      {/* 基本信息 */}
      <Card>
        <h3 className="font-bold text-slate-800 mb-4">基本信息</h3>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">活动类型</p>
            <p className="font-medium text-slate-700">{activity.type || activity.category}</p>
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">年份</p>
            <p className="font-medium text-slate-700">{activity.year}</p>
          </div>
          <div className="col-span-2">
            <p className="text-xs font-bold text-slate-400 uppercase mb-1">详细描述</p>
            <p className="font-medium text-slate-700">{activity.description || '暂无描述'}</p>
          </div>
        </div>
      </Card>

      {/* 费用明细 */}
      <Card>
        <h3 className="font-bold text-slate-800 mb-4">费用明细</h3>
        {activity.expenses && activity.expenses.length > 0 ? (
          <div className="space-y-2">
            {activity.expenses.map((expense, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-medium text-slate-700">{expense.description || expense.name}</p>
                  <p className="text-xs text-slate-400">{expense.category}</p>
                </div>
                <p className="font-bold text-slate-800">¥{expense.amount.toLocaleString()}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400 text-sm">暂无费用记录</p>
        )}
      </Card>
    </div>
  );
};

export default ActivityDetail;
