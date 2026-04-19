import React from 'react';
import { SearchResultItem, MODULE_LABELS, toSearchResultItems, SearchResult } from './types';
import SearchResultItemComponent from './SearchResultItem';
import { Loader2 } from 'lucide-react';

interface SearchDropdownProps {
  result: SearchResult | null;
  isLoading: boolean;
  activeIndex: number;
  allItems: SearchResultItem[];
  onItemClick: (item: SearchResultItem) => void;
}

const SearchDropdown: React.FC<SearchDropdownProps> = ({
  result,
  isLoading,
  activeIndex,
  allItems,
  onItemClick,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white rounded-2xl shadow-xl border border-slate-100">
        <Loader2 size={24} className="text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const items = toSearchResultItems(result);
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center">
        <p className="text-sm font-medium text-slate-400">未找到相关结果</p>
        <p className="text-xs text-slate-300 mt-1">尝试使用不同的关键词搜索</p>
      </div>
    );
  }

  // 按模块分组显示
  const sections: { type: SearchResultItem['type']; label: string; items: SearchResultItem[] }[] = [
    { type: 'activity', label: MODULE_LABELS.activity, items: result.activities.slice(0, 5).map((a) => ({
      id: a.id, type: 'activity' as const, title: a.name,
      subtitle: `${a.date} · ${a.location || '未知地点'}`, extra: a.status, url: `/activities/${a.id}`,
    })) },
    { type: 'material', label: MODULE_LABELS.material, items: result.materials.slice(0, 5).map((m) => ({
      id: m.id, type: 'material' as const, title: m.name,
      subtitle: `库存: ${m.stock} ${m.unit}`, extra: m.category, url: `/materials/${m.id}`,
    })) },
    { type: 'supplier', label: MODULE_LABELS.supplier, items: result.suppliers.slice(0, 5).map((s) => ({
      id: s.id, type: 'supplier' as const, title: s.name,
      subtitle: s.category, extra: '★'.repeat(Math.round(s.rating)) + '☆'.repeat(5 - Math.round(s.rating)), url: `/suppliers/${s.id}`,
    })) },
    { type: 'opportunity', label: MODULE_LABELS.opportunity, items: result.opportunities.slice(0, 5).map((o) => ({
      id: o.id, type: 'opportunity' as const, title: o.client_name,
      subtitle: o.company || '', extra: `¥${o.estimated_value.toLocaleString()}`, url: `/opportunities/${o.id}`,
    })) },
  ].filter((s) => s.items.length > 0);

  // 计算每个 item 在 allItems 中的索引
  let globalIndex = 0;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      {sections.map((section) => (
        <div key={section.type}>
          {/* 模块标题 */}
          <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
            <span className="text-xs font-black text-slate-500 uppercase tracking-wider">
              {section.label}
            </span>
            <span className="text-xs text-slate-400">({section.items.length})</span>
          </div>
          {/* 结果列表 */}
          {section.items.map((item) => {
            const currentIndex = globalIndex++;
            return (
              <SearchResultItemComponent
                key={`${item.type}-${item.id}`}
                item={item}
                isActive={activeIndex === currentIndex}
                onClick={() => onItemClick(item)}
                onMouseEnter={() => {}}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default SearchDropdown;
