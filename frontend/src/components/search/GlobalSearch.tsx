import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { globalSearch, SearchResult, hasResults } from '../../services/globalSearchApi';
import { SearchResultItem, toSearchResultItems } from './types';
import SearchDropdown from './SearchDropdown';

interface GlobalSearchProps {
  className?: string;
}

const GlobalSearch: React.FC<GlobalSearchProps> = ({ className = '' }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<SearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  // 搜索
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResult(null);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    setIsLoading(true);
    setIsOpen(true);
    setActiveIndex(-1);

    globalSearch(debouncedQuery.trim())
      .then((res) => {
        setResult(res);
        if (!hasResults(res)) {
          setIsOpen(false);
        }
      })
      .catch(() => {
        setResult(null);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [debouncedQuery]);

  // 点击外部关闭
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // 获取所有扁平化的结果项
  const allItems: SearchResultItem[] = result ? toSearchResultItems(result) : [];

  // 键盘导航
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || allItems.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) => (prev < allItems.length - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) => (prev > 0 ? prev - 1 : -1));
          break;
        case 'Enter':
          e.preventDefault();
          if (activeIndex >= 0 && activeIndex < allItems.length) {
            handleItemClick(allItems[activeIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          inputRef.current?.blur();
          break;
      }
    },
    [isOpen, allItems, activeIndex]
  );

  // 点击结果项
  const handleItemClick = (item: SearchResultItem) => {
    navigate(item.url);
    setIsOpen(false);
    setQuery('');
    setResult(null);
  };

  // 清空搜索
  const handleClear = () => {
    setQuery('');
    setResult(null);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={`relative group ${className}`}>
      {/* 搜索输入框 */}
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-500 transition-colors"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (result && hasResults(result)) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder="键入关键词快速检索..."
          className="w-full pl-10 pr-10 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all text-sm font-medium text-slate-700"
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
          >
            ×
          </button>
        )}
      </div>

      {/* 下拉结果 */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-3 w-[420px] z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <SearchDropdown
            result={result}
            isLoading={isLoading}
            activeIndex={activeIndex}
            allItems={allItems}
            onItemClick={handleItemClick}
          />
        </div>
      )}
    </div>
  );
};

export default GlobalSearch;
