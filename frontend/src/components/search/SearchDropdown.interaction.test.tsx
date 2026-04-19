/**
 * SearchDropdown 组件交互测试
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import SearchDropdown from './SearchDropdown';

describe('SearchDropdown 组件', () => {
  const mockResult = {
    activities: [
      { id: 1, name: '2024春季新品发布会', date: '2024-03-20', location: '深圳', status: '已完成' },
      { id: 2, name: '智能制造行业峰会', date: '2024-04-15', location: '上海', status: '进行中' },
    ],
    materials: [
      { id: 1, name: '品牌易拉宝', stock: 50, unit: '个', category: '宣传品' },
    ],
    suppliers: [
      { id: 1, name: '深圳市印刷集团', category: '印刷', rating: 4.5 },
    ],
    opportunities: [
      { id: 1, client_name: '头部金融机构', company: '某某银行', estimated_value: 2000000 },
    ],
  };

  describe('渲染测试', () => {
    it('加载状态应该显示加载动画', () => {
      render(
        <SearchDropdown
          result={null}
          isLoading={true}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      const loader = document.querySelector('.animate-spin');
      expect(loader).toBeInTheDocument();
    });

    it('null 结果不应该渲染', () => {
      const { container } = render(
        <SearchDropdown
          result={null}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('空结果应该显示空态提示', () => {
      const emptyResult = {
        activities: [],
        materials: [],
        suppliers: [],
        opportunities: [],
      };
      render(
        <SearchDropdown
          result={emptyResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText('未找到相关结果')).toBeInTheDocument();
    });
  });

  describe('结果显示测试', () => {
    it('应该显示活动模块标题', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText(/活动/)).toBeInTheDocument();
    });

    it('应该显示物料模块标题', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText(/物料/)).toBeInTheDocument();
    });

    it('应该显示供应商模块标题', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText(/供应商/)).toBeInTheDocument();
    });

    it('应该显示商机模块标题', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText(/商机/)).toBeInTheDocument();
    });
  });

  describe('活动结果显示测试', () => {
    it('应该显示活动名称', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText('2024春季新品发布会')).toBeInTheDocument();
    });

    it('应该显示活动日期和地点', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText(/2024-03-20/)).toBeInTheDocument();
    });
  });

  describe('物料结果显示测试', () => {
    it('应该显示物料名称', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText('品牌易拉宝')).toBeInTheDocument();
    });

    it('应该显示库存信息', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText(/库存: 50/)).toBeInTheDocument();
    });
  });

  describe('供应商结果显示测试', () => {
    it('应该显示供应商名称', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText('深圳市印刷集团')).toBeInTheDocument();
    });
  });

  describe('商机结果显示测试', () => {
    it('应该显示商机客户名称', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText('头部金融机构')).toBeInTheDocument();
    });

    it('应该显示预估价值', () => {
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={() => {}}
        />
      );
      expect(screen.getByText(/¥2,000,000/)).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('点击结果项应该调用 onItemClick', () => {
      const onItemClick = vi.fn();
      render(
        <SearchDropdown
          result={mockResult}
          isLoading={false}
          activeIndex={-1}
          allItems={[]}
          onItemClick={onItemClick}
        />
      );

      const activityItem = screen.getByText('2024春季新品发布会');
      activityItem.click();

      expect(onItemClick).toHaveBeenCalled();
    });
  });
});
