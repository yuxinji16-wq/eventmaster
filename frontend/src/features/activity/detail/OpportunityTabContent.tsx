/**
 * 商机 Tab 内容
 * 从 pages/ActivityDetail.tsx 行 307-360 迁移而来
 */
import React, { useMemo } from 'react';
import { TrendingUp, Plus } from 'lucide-react';
import { Card, Button } from '../../../shared';
import { OpportunityRow } from '../rows/OpportunityRow';
import { StatusPanelItem } from '../components/StatusPanelItem';

interface OpportunityTabContentProps {
  opportunities: any[];
  onAdd: () => void;
  onOpen: (id: string) => void;
}

export const OpportunityTabContent: React.FC<OpportunityTabContentProps> = ({ opportunities, onAdd, onOpen }) => {
  const oppList = opportunities || [];

  const stats = useMemo(() => {
    const total = oppList.length;
    const transferred = oppList.filter((o: any) => o.status === '已转销售').length;
    const converted = oppList.filter((o: any) => o.converted || o.conversionStatus === '已转化').length;
    const notConverted = oppList.filter((o: any) => o.conversionStatus === '未转化').length;
    const conversionRate = transferred > 0 ? ((converted / transferred) * 100).toFixed(1) : '0';
    return { total, transferred, converted, notConverted, conversionRate };
  }, [oppList]);

  return (
    <div className="space-y-4">
      <StatusPanelItem
        icon={<TrendingUp size={18} />}
        title="商机线索"
        stats={[
          { label: '线索总数', value: stats.total },
          { label: '已转销售', value: stats.transferred },
          { label: '已转化', value: stats.converted },
          { label: '转化率', value: `${stats.conversionRate}%` },
        ]}
        status={stats.total > 0 ? { type: 'success', text: `已获取 ${stats.total} 条线索` } : { type: 'neutral', text: '暂无线索' }}
      />
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-800">关联线索 ({oppList.length})</h3>
          <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onAdd}>新增</Button>
        </div>
        {oppList.length > 0 ? (
          <div className="space-y-2">
            {oppList.map(o => (
              <div key={o.id} onClick={() => onOpen(o.id)} className="cursor-pointer">
                <OpportunityRow opportunity={o} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400">
            <TrendingUp size={24} className="mx-auto mb-2" />
            <p>暂无关联线索</p>
            <p className="text-xs mt-1">点击上方按钮添加</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default OpportunityTabContent;
