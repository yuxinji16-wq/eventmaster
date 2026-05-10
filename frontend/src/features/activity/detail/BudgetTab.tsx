/**
 * 预算 Tab
 * 从 pages/ActivityDetail.tsx 行 177-232 迁移而来
 */
import React, { useState } from 'react';
import { Plus, ChevronUp, ChevronDown, Wallet } from 'lucide-react';
import { Card, Button } from '../../../shared';
import { Activity, ExpenseItem } from '../../../types';
import { ExpenseRow } from '../rows/ExpenseRow';
import { RiskAlert } from '../components/RiskAlert';
import { formatCurrency } from '../utils';

interface BudgetTabProps {
  activity: Activity;
  expenses: ExpenseItem[];
  onAddExpense: () => void;
  onEditExpense: (item: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
}

export const BudgetTab: React.FC<BudgetTabProps> = ({ activity, expenses, onAddExpense, onEditExpense, onDeleteExpense }) => {
  const [showDetails, setShowDetails] = useState(true);
  const totalPlanned = activity?.budget || 0;
  const totalActual = (expenses || []).reduce((sum: number, e: ExpenseItem) => sum + (e.actualAmount || 0), 0) || activity?.actualSpend || 0;
  const remaining = totalPlanned - totalActual;
  const executionRate = totalPlanned > 0 ? (totalActual / totalPlanned * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="text-center"><p className="text-xs text-slate-400 mb-1">总预算</p><p className="text-xl font-black text-slate-800">{formatCurrency(totalPlanned)}</p></Card>
        <Card className="text-center"><p className="text-xs text-slate-400 mb-1">已支出</p><p className="text-xl font-black text-slate-800">{formatCurrency(totalActual)}</p></Card>
        <Card className="text-center"><p className="text-xs text-slate-400 mb-1">剩余</p><p className={`text-xl font-black ${remaining < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(Math.abs(remaining))}{remaining < 0 ? ' (超支)' : ''}</p></Card>
        <Card className="text-center"><p className="text-xs text-slate-400 mb-1">执行率</p><p className={`text-xl font-black ${executionRate > 100 ? 'text-rose-600' : executionRate > 80 ? 'text-amber-600' : 'text-emerald-600'}`}>{executionRate.toFixed(1)}%</p></Card>
      </div>

      {executionRate >= 90 && (
        <RiskAlert risk={executionRate >= 100 ? 'danger' : 'warning'} message={executionRate >= 100 ? '预算已超支！' : `预算执行率${executionRate.toFixed(1)}%，接近上限`} />
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">费用明细 ({expenses.length})</h3>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              {showDetails ? '收起' : '展开'}
            </Button>
            <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAddExpense}>新增</Button>
          </div>
        </div>

        {showDetails && expenses.length > 0 && (
          <div className="space-y-2">
            {expenses.map(item => (
              <ExpenseRow key={item.id} item={item} onEdit={() => onEditExpense(item)} onDelete={() => onDeleteExpense(item.id)} />
            ))}
          </div>
        )}

        {expenses.length === 0 && (
          <div className="text-center py-8 text-slate-400">
            <Wallet size={24} className="mx-auto mb-2" />
            <p>暂无费用记录</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default BudgetTab;
