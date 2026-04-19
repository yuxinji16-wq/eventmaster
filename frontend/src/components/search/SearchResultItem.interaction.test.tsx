/**
 * SearchResultItem 组件交互测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import SearchResultItem from './SearchResultItem';

describe('SearchResultItem 组件', () => {
  const mockActivityItem = {
    id: 1,
    type: 'activity' as const,
    title: '2024春季新品发布会',
    subtitle: '2024-03-20 · 深圳',
    extra: '已完成',
    url: '/activities/1',
  };

  const mockMaterialItem = {
    id: 2,
    type: 'material' as const,
    title: '品牌易拉宝',
    subtitle: '库存: 50 个',
    extra: '宣传品',
    url: '/materials/2',
  };

  const mockSupplierItem = {
    id: 3,
    type: 'supplier' as const,
    title: '深圳市印刷集团',
    subtitle: '印刷',
    extra: '★★★★☆',
    url: '/suppliers/3',
  };

  const mockOpportunityItem = {
    id: 4,
    type: 'opportunity' as const,
    title: '头部金融机构',
    subtitle: '某某银行',
    extra: '¥2,000,000',
    url: '/opportunities/4',
  };

  describe('渲染测试', () => {
    it('应该显示标题', () => {
      render(
        <SearchResultItem
          item={mockActivityItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      expect(screen.getByText('2024春季新品发布会')).toBeInTheDocument();
    });

    it('应该显示副标题', () => {
      render(
        <SearchResultItem
          item={mockActivityItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      expect(screen.getByText('2024-03-20 · 深圳')).toBeInTheDocument();
    });

    it('应该显示额外信息', () => {
      render(
        <SearchResultItem
          item={mockActivityItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      expect(screen.getByText('已完成')).toBeInTheDocument();
    });

    it('应该显示活动图标', () => {
      render(
        <SearchResultItem
          item={mockActivityItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      expect(screen.getByText('📅')).toBeInTheDocument();
    });

    it('应该显示物料图标', () => {
      render(
        <SearchResultItem
          item={mockMaterialItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      expect(screen.getByText('📦')).toBeInTheDocument();
    });

    it('应该显示供应商图标', () => {
      render(
        <SearchResultItem
          item={mockSupplierItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      expect(screen.getByText('🏢')).toBeInTheDocument();
    });

    it('应该显示商机图标', () => {
      render(
        <SearchResultItem
          item={mockOpportunityItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      expect(screen.getByText('💼')).toBeInTheDocument();
    });
  });

  describe('样式状态测试', () => {
    it('非激活状态应该有正确样式', () => {
      render(
        <SearchResultItem
          item={mockActivityItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      const item = document.querySelector('.hover\\:bg-slate-50');
      expect(item).toBeInTheDocument();
    });

    it('激活状态应该有高亮样式', () => {
      render(
        <SearchResultItem
          item={mockActivityItem}
          isActive={true}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      const item = document.querySelector('.bg-indigo-50');
      expect(item).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击应该调用 onClick', () => {
      const onClick = vi.fn();
      render(
        <SearchResultItem
          item={mockActivityItem}
          isActive={false}
          onClick={onClick}
          onMouseEnter={() => {}}
        />
      );

      const item = document.querySelector('.cursor-pointer');
      item?.click();

      expect(onClick).toHaveBeenCalled();
    });

    it('鼠标进入应该调用 onMouseEnter', () => {
      const onMouseEnter = vi.fn();
      render(
        <SearchResultItem
          item={mockActivityItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={onMouseEnter}
        />
      );

      const item = screen.getByText('2024春季新品发布会').parentElement;
      if (item) {
        fireEvent.mouseEnter(item);
      }

      expect(onMouseEnter).toHaveBeenCalled();
    });
  });

  describe('导航图标测试', () => {
    it('应该显示 ChevronRight 图标', () => {
      render(
        <SearchResultItem
          item={mockActivityItem}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      const chevron = document.querySelector('svg');
      expect(chevron).toBeInTheDocument();
    });
  });

  describe('边界测试', () => {
    it('没有 extra 信息时应该正常渲染', () => {
      const itemWithoutExtra = { ...mockActivityItem, extra: undefined };
      render(
        <SearchResultItem
          item={itemWithoutExtra}
          isActive={false}
          onClick={() => {}}
          onMouseEnter={() => {}}
        />
      );
      expect(screen.getByText('2024春季新品发布会')).toBeInTheDocument();
    });
  });
});
