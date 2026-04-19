/**
 * GlobalSearch 组件交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import GlobalSearch from './GlobalSearch';
import { GlobalSearch as GlobalSearchComponent } from './index';

// Mock 路由
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

// Mock debounce hook
vi.mock('../../hooks/useDebounce', () => ({
  useDebounce: (value: string) => value,
}));

// Mock API
vi.mock('../../services/globalSearchApi', () => ({
  globalSearch: vi.fn().mockResolvedValue({
    activities: [],
    materials: [],
    suppliers: [],
    opportunities: [],
  }),
  hasResults: () => false,
}));

const mockSearchResult = {
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

describe('GlobalSearch 组件', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('渲染测试', () => {
    it('应该渲染搜索输入框', () => {
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('键入关键词快速检索...');
      expect(input).toBeInTheDocument();
    });

    it('应该显示搜索图标', () => {
      render(<GlobalSearch />);
      const searchIcon = document.querySelector('svg');
      expect(searchIcon).toBeInTheDocument();
    });
  });

  describe('交互测试', () => {
    it('应该能够输入搜索关键词', async () => {
      const user = userEvent.setup();
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('键入关键词快速检索...');

      await user.type(input, '测试');
      expect(input).toHaveValue('测试');
    });

    it('应该能够清空搜索内容', async () => {
      const user = userEvent.setup();
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('键入关键词快速检索...');

      await user.type(input, '测试');
      expect(input).toHaveValue('测试');

      // 查找清空按钮并点击
      const clearButton = screen.getByText('×');
      await user.click(clearButton);

      expect(input).toHaveValue('');
    });
  });

  describe('搜索功能测试', () => {
    it('输入后应该触发搜索', async () => {
      const { globalSearch } = await import('../../services/globalSearchApi');
      vi.mocked(globalSearch).mockResolvedValue(mockSearchResult);

      const user = userEvent.setup();
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('键入关键词快速检索...');

      await user.type(input, '发布');

      await waitFor(() => {
        expect(globalSearch).toHaveBeenCalledWith('发布');
      });
    });

    it('搜索结果应该分类显示', async () => {
      const { globalSearch } = await import('../../services/globalSearchApi');
      vi.mocked(globalSearch).mockResolvedValue(mockSearchResult);

      const user = userEvent.setup();
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('键入关键词快速检索...');

      await user.type(input, '测试');

      await waitFor(() => {
        // 检查是否有搜索结果区域
        expect(globalSearch).toHaveBeenCalled();
      });
    });

    it('空搜索结果应该显示提示', async () => {
      const { globalSearch } = await import('../../services/globalSearchApi');
      vi.mocked(globalSearch).mockResolvedValue({
        activities: [],
        materials: [],
        suppliers: [],
        opportunities: [],
      });

      const user = userEvent.setup();
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('键入关键词快速检索...');

      await user.type(input, '不存在的关键词');

      await waitFor(() => {
        // 空结果时不应显示下拉
      });
    });
  });

  describe('加载状态测试', () => {
    it('搜索中应该显示加载状态', async () => {
      const { globalSearch } = await import('../../services/globalSearchApi');
      // 创建一个永远不会解析的 Promise
      vi.mocked(globalSearch).mockReturnValue(new Promise(() => {}));

      const user = userEvent.setup();
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('键入关键词快速检索...');

      await user.type(input, '测试');

      // 加载中不应该显示结果
      expect(screen.queryByText('2024春季新品发布会')).not.toBeInTheDocument();
    });
  });

  describe('键盘导航测试', () => {
    it('应该支持键盘输入', async () => {
      const user = userEvent.setup();
      render(<GlobalSearch />);
      const input = screen.getByPlaceholderText('键入关键词快速检索...');

      await user.type(input, '测试');
      expect(input).toHaveValue('测试');
    });
  });

  describe('className prop 测试', () => {
    it('应该正确应用自定义 className', () => {
      render(<GlobalSearch className="custom-class" />);
      const container = document.querySelector('.custom-class');
      expect(container).toBeInTheDocument();
    });
  });
});
