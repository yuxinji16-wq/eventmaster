import React from 'react';
import type { SearchResultItem as SearchResultItemType } from './types';
import { MODULE_ICONS } from './types';

import { ChevronRight } from 'lucide-react';

interface SearchResultItemProps {
  item: SearchResultItemType;
  isActive: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
}

const SearchResultItem: React.FC<SearchResultItemProps> = ({
  item,
  isActive,
  onClick,
  onMouseEnter,
}) => {
  return (
    <div
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all ${
        isActive
          ? 'bg-indigo-50 text-indigo-700'
          : 'hover:bg-slate-50 text-slate-700'
      }`}
    >
      <span className="text-base">{MODULE_ICONS[item.type]}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm truncate">{item.title}</span>
          {item.extra && (
            <span className="text-xs text-slate-400 shrink-0">{item.extra}</span>
          )}
        </div>
        <p className="text-xs text-slate-400 truncate mt-0.5">{item.subtitle}</p>
      </div>
      <ChevronRight
        size={14}
        className={`shrink-0 transition-colors ${
          isActive ? 'text-indigo-500' : 'text-slate-300'
        }`}
      />
    </div>
  );
};

export default SearchResultItem;
