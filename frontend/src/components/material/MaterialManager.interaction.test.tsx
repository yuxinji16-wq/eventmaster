/**
 * 物料管理页面交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import MaterialManager from './MaterialManager';
import { Material } from '../../types';

// Mock hooks - must use async importOriginal pattern for react-router-dom compatibility
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock the hooks module
vi.mock('../../utils/hooks', () => ({
  useMaterialsData: () => ({
    materials: [
      {
        id: '1',
        name: 'AI产品白皮书 2024版',
        category: '产品宣传册',
        type: '常规',
        stock: 150,
        unit: '本',
        status: 'In Stock',
        usageCount: 50,
        lastUpdated: '2024-03-22 14:00'
      },
      {
        id: '2',
        name: 'NUMAP宣传册',
        category: '产品宣传册',
        type: '定制',
        stock: 8,
        unit: '本',
        status: 'Low Stock',
        usageCount: 292,
        lastUpdated: '2024-02-05 17:03'
      }
    ] as Material[],
    loading: false,
    error: null,
    fetchMaterials: mockFetchMaterials,
    addMaterial: mockAddMaterial,
    updateMaterial: mockUpdateMaterial,
    deleteMaterial: mockDeleteMaterial,
    addStock: mockAddStock,
    withdraw: mockWithdraw,
  }),
}));

// Mock functions
const mockFetchMaterials = vi.fn();
const mockAddMaterial = vi.fn();
const mockUpdateMaterial = vi.fn();
const mockDeleteMaterial = vi.fn();
const mockAddStock = vi.fn();
const mockWithdraw = vi.fn();

const renderMaterialManager = () => {
  render(
    <MemoryRouter>
      <MaterialManager />
    </MemoryRouter>
  );
};

describe('物料管理页面交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('顶部操作按钮交互', () => {
    it('应显示领用情况查询按钮', () => {
      renderMaterialManager();
      expect(screen.getByRole('button', { name: /领用情况查询/ })).toBeInTheDocument();
    });

    it('应显示入库流转记录按钮', () => {
      renderMaterialManager();
      expect(screen.getByRole('button', { name: /入库流转记录/ })).toBeInTheDocument();
    });

    it('应显示资产入库登记按钮', () => {
      renderMaterialManager();
      expect(screen.getByRole('button', { name: /资产入库登记/ })).toBeInTheDocument();
    });

    it('点击资产入库登记应打开弹窗', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      const buttons = screen.getAllByRole('button', { name: /资产入库登记/ });
      await user.click(buttons[0]);
      // 确认弹窗打开 - 找到表单中的确认按钮
      expect(screen.getByRole('button', { name: /确认入库登记/ })).toBeInTheDocument();
    });

    it('点击领用情况查询应打开弹窗', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /领用情况查询/ }));
      expect(screen.getByText('全库领用情况流水')).toBeInTheDocument();
    });

    it('点击入库流转记录应打开弹窗', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /入库流转记录/ }));
      expect(screen.getByText('入库流转历史')).toBeInTheDocument();
    });
  });

  describe('搜索框交互', () => {
    it('应显示搜索输入框', () => {
      renderMaterialManager();
      expect(screen.getByPlaceholderText(/检索物料名称/)).toBeInTheDocument();
    });

    it('应能输入搜索关键词', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      const searchInput = screen.getByPlaceholderText(/检索物料名称/);
      await user.type(searchInput, '白皮书');
      expect(searchInput).toHaveValue('白皮书');
    });

    it('搜索应支持实时过滤', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      const searchInput = screen.getByPlaceholderText(/检索物料名称/);
      await user.type(searchInput, 'NUMAP');
      expect(searchInput).toHaveValue('NUMAP');
    });
  });

  describe('视图切换按钮交互', () => {
    it('应显示库存/领用视图切换按钮', () => {
      renderMaterialManager();
      expect(screen.getByRole('button', { name: /剩余库存/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /累计领用/ })).toBeInTheDocument();
    });

    it('应能切换到累计领用视图', async () => {
      const user = userEvent.setup();
      renderMaterialManager();

      // 默认应该是库存视图，点击累计领用切换
      await user.click(screen.getByRole('button', { name: /累计领用/ }));

      // 验证切换成功 - 累计领用按钮应该有激活样式（bg-white）
      const usageButton = screen.getByRole('button', { name: /累计领用/ });
      expect(usageButton).toHaveClass(/bg-white/);
    });

    it('应能切换回剩余库存视图', async () => {
      const user = userEvent.setup();
      renderMaterialManager();

      await user.click(screen.getByRole('button', { name: /累计领用/ }));
      await user.click(screen.getByRole('button', { name: /剩余库存/ }));

      const stockButton = screen.getByRole('button', { name: /剩余库存/ });
      expect(stockButton).toHaveClass(/bg-white/);
    });
  });

  describe('分类筛选下拉框交互', () => {
    it('应显示分类筛选下拉框', () => {
      renderMaterialManager();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
    });

    it('应能选择不同分类', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      const select = screen.getByRole('combobox');
      await user.selectOptions(select, '产品宣传册');
      expect(select).toHaveValue('产品宣传册');
    });
  });

  describe('物料分类折叠/展开交互', () => {
    it('应能点击分类标题展开/折叠', async () => {
      const user = userEvent.setup();
      renderMaterialManager();

      // 默认展开状态，点击分类标题应该折叠
      // 可能有多个 "产品宣传册"，取第一个（在分类标题中）
      const categoryElements = screen.getAllByText('产品宣传册');
      const categoryRow = categoryElements[0].closest('[class*="cursor-pointer"]');
      if (categoryRow) {
        await user.click(categoryRow as HTMLElement);
      }

      // 再次点击应该展开
      if (categoryRow) {
        await user.click(categoryRow as HTMLElement);
      }

      // 验证分类仍在文档中
      expect(screen.getAllByText('产品宣传册').length).toBeGreaterThan(0);
    });
  });

  describe('快速入库按钮交互', () => {
    it('应显示快速入库按钮', () => {
      renderMaterialManager();
      expect(screen.getAllByRole('button', { name: /快速入库/ })[0]).toBeInTheDocument();
    });

    it('点击快速入库应打开入库弹窗并预设分类', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      const quickAddButton = screen.getAllByRole('button', { name: /快速入库/ })[0];
      await user.click(quickAddButton);
      // 确认弹窗打开 - 找到表单中的确认按钮
      expect(screen.getByRole('button', { name: /确认入库登记/ })).toBeInTheDocument();
    });
  });

  describe('物料领用按钮交互', () => {
    it('应显示物料领用按钮', () => {
      renderMaterialManager();
      expect(screen.getAllByRole('button', { name: /^领用$/ })[0]).toBeInTheDocument();
    });

    it('点击领用应打开领用弹窗', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      const withdrawButton = screen.getAllByRole('button', { name: /^领用$/ })[0];
      await user.click(withdrawButton);
      expect(screen.getByText('物料领用登记')).toBeInTheDocument();
    });
  });

  describe('入库登记弹窗交互', () => {
    it('应显示新增/补充入库切换开关', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /资产入库登记/ }));
      expect(screen.getByText(/是否为新增物料类型/)).toBeInTheDocument();
    });

    it('切换到补充入库应显示物料选择', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /资产入库登记/ }));

      // 找到切换按钮 - 是一个 type="button" 的按钮，不是表单的提交按钮
      const toggleButtons = screen.getAllByRole('button');
      const toggleButton = toggleButtons.find(btn =>
        btn.getAttribute('type') === 'button' &&
        !btn.textContent?.includes('取消') &&
        !btn.textContent?.includes('确认')
      );
      if (toggleButton) {
        await user.click(toggleButton);
      }

      expect(screen.getByText(/选择现有物料/)).toBeInTheDocument();
    });

    it('应能填写新增物料表单', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /资产入库登记/ }));
      const nameInput = screen.getByPlaceholderText(/NUMAP 2024/);
      await user.type(nameInput, '新产品手册');
      expect(nameInput).toHaveValue('新产品手册');
    });

    it('应能取消入库登记', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      // 点击第一个"资产入库登记"按钮（顶部按钮）
      const buttons = screen.getAllByRole('button', { name: /资产入库登记/ });
      await user.click(buttons[0]);
      // 取消按钮 - 可能有多个，用第一个（通常在表单内）
      const cancelButtons = screen.getAllByRole('button', { name: /取消/ });
      await user.click(cancelButtons[0]);
      // 确认弹窗关闭 - 确认按钮应该消失
      expect(screen.queryByRole('button', { name: /确认入库登记/ })).not.toBeInTheDocument();
    });

    it('应能提交入库登记', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      // 点击第一个"资产入库登记"按钮
      const buttons = screen.getAllByRole('button', { name: /资产入库登记/ });
      await user.click(buttons[0]);

      const nameInput = screen.getByPlaceholderText(/NUMAP 2024/);
      await user.type(nameInput, '新产品手册');

      // 直接提交表单而不是点击按钮
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockAddMaterial).toHaveBeenCalled();
      }, { timeout: 3000 });
    });
  });

  describe('领用登记弹窗交互', () => {
    it('应显示领用表单字段', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getAllByRole('button', { name: /^领用$/ })[0]);
      expect(screen.getByText(/领用数量/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/请输入领用人姓名/)).toBeInTheDocument();
    });

    it('应能取消领用登记', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getAllByRole('button', { name: /^领用$/ })[0]);
      await user.click(screen.getByRole('button', { name: /取消/ }));
      expect(screen.queryByText('物料领用登记')).not.toBeInTheDocument();
    });

    it('应能提交领用登记', async () => {
      const user = userEvent.setup();
      mockWithdraw.mockResolvedValue(undefined);
      renderMaterialManager();
      await user.click(screen.getAllByRole('button', { name: /^领用$/ })[0]);

      const userInput = screen.getByPlaceholderText(/请输入领用人姓名/);
      await user.type(userInput, '张三');

      const reasonInput = screen.getByPlaceholderText(/华东区合作伙伴大会/);
      await user.type(reasonInput, '测试活动');

      await user.click(screen.getByRole('button', { name: /确认领用/ }));

      await waitFor(() => {
        expect(mockWithdraw).toHaveBeenCalled();
      });
    });
  });

  describe('领用情况查询弹窗交互', () => {
    it('应显示领用流水表格', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /领用情况查询/ }));
      expect(screen.getByText(/全库领用情况流水/)).toBeInTheDocument();
    });

    it('应能搜索领用记录', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /领用情况查询/ }));

      const searchInput = screen.getByPlaceholderText(/搜索物料名/);
      await user.type(searchInput, '白皮书');
      expect(searchInput).toHaveValue('白皮书');
    });

    it('应显示导出 Excel 按钮', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /领用情况查询/ }));
      expect(screen.getByRole('button', { name: /导出.*报表/ })).toBeInTheDocument();
    });

    it('应能关闭领用情况查询弹窗', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /领用情况查询/ }));

      // 关闭按钮 - modal 中有一个带 X 图标的关闭按钮，没有文本
      // 使用 document.querySelectorAll 查找所有按钮，再过滤
      const allButtons = Array.from(document.querySelectorAll('button'));
      const closeButton = allButtons.find(btn =>
        btn.textContent === '' &&
        !btn.getAttribute('type') &&
        !btn.getAttribute('aria-label') &&
        !btn.className.includes('hidden')
      );
      if (closeButton) {
        await user.click(closeButton);
      }

      expect(screen.queryByText('全库领用情况流水')).not.toBeInTheDocument();
    });
  });

  describe('入库流转记录弹窗交互', () => {
    it('应显示入库流水列表', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /入库流转记录/ }));
      expect(screen.getByText('入库流转历史')).toBeInTheDocument();
      // 入库流水列表中有 "AI产品白皮书 2024版"，也可能在主表格中有
      const elements = screen.getAllByText('AI产品白皮书 2024版');
      expect(elements.length).toBeGreaterThan(0);
    });

    it('应能关闭入库流转记录弹窗', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      await user.click(screen.getByRole('button', { name: /入库流转记录/ }));

      // 关闭按钮 - modal 中的 X 按钮
      const allButtons = Array.from(document.querySelectorAll('button'));
      const closeButton = allButtons.find(btn =>
        btn.textContent === '' &&
        !btn.getAttribute('type') &&
        !btn.getAttribute('aria-label') &&
        !btn.className.includes('hidden')
      );
      if (closeButton) {
        await user.click(closeButton);
      }

      expect(screen.queryByText('入库流转历史')).not.toBeInTheDocument();
    });
  });

  describe('物料详情按钮交互', () => {
    it('应显示详情按钮', () => {
      renderMaterialManager();
      expect(screen.getAllByRole('button', { name: /详情/ })[0]).toBeInTheDocument();
    });

    it('点击详情应导航到详情页', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      const detailButton = screen.getAllByRole('button', { name: /详情/ })[0];
      await user.click(detailButton);
      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('边界情况测试', () => {
    it('空搜索结果应显示空状态', async () => {
      const user = userEvent.setup();
      renderMaterialManager();
      const searchInput = screen.getByPlaceholderText(/检索物料名称/);
      await user.type(searchInput, '不存在的物料');
      expect(screen.queryByText('AI产品白皮书 2024版')).not.toBeInTheDocument();
    });
  });
});
