import React, { useState, useEffect, useCallback } from 'react';

/**
 * 异步数据获取Hook
 */
export function useAsyncData<T>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFn();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取数据失败');
    } finally {
      setLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

/**
 * 模态框状态Hook
 */
export function useModalState() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const open = useCallback((item?: any) => {
    setEditingItem(item ?? null);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setEditingItem(null);
  }, []);

  return { isOpen, editingItem, open, close };
}

/**
 * 分页Hook
 */
export function usePagination<T>(items: T[], pageSize: number = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(items.length / pageSize);
  const paginatedItems = items.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
  };
}

/**
 * 筛选Hook
 */
export function useFilters<T extends Record<string, any>>(
  items: T[],
  filterKeys: (keyof T)[]
) {
  const [filters, setFilters] = useState<Partial<T>>({});

  const filteredItems = items.filter(item => {
    return Object.entries(filters).every(([key, value]) => {
      if (value === '' || value === undefined || value === null) return true;
      const itemValue = item[key as keyof T];
      if (typeof itemValue === 'string' && typeof value === 'string') {
        return itemValue.toLowerCase().includes(value.toLowerCase());
      }
      return itemValue === value;
    });
  });

  const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return { filters, filteredItems, updateFilter, clearFilters };
}
