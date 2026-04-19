/**
 * 供应商管理页面交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import SupplierManager from './SupplierManager';
import { Supplier } from '../../types';

// Mock hooks
const mockAddSupplier = vi.fn();
const mockUpdateSupplier = vi.fn();
const mockDeleteSupplier = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../utils/hooks', () => ({
  useSuppliersData: () => ({
    suppliers: [
      {
        id: '1',
        name: '上海搭建公司',
        serviceType: '搭建',
        rating: 4.5,
        contact: '李经理',
        phone: '13800138000',
        email: 'li@shanghai.com',
        tags: ['自有工厂', '高配合度'],
        orderCount: 5
      },
      {
        id: '2',
        name: '北京设计工作室',
        serviceType: '设计',
        rating: 4.8,
        contact: '王设计师',
        phone: '13900139000',
        email: 'wang@beijing.com',
        tags: ['创意好'],
        orderCount: 3
      }
    ] as Supplier[],
    loading: false,
    error: null,
    addSupplier: mockAddSupplier,
    updateSupplier: mockUpdateSupplier,
    deleteSupplier: mockDeleteSupplier,
  }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock Toast
vi.mock('../../shared/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}));

const renderSupplierManager = () => {
  render(
    <MemoryRouter>
      <SupplierManager />
    </MemoryRouter>
  );
};

describe('供应商管理页面交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('页面标题和统计', () => {
    it('应显示供应商管理标题', () => {
      renderSupplierManager();

      expect(screen.getByText(/共管理/)).toBeInTheDocument();
      expect(screen.getByText(/家核心合作伙伴档案/)).toBeInTheDocument();
    });

    it('应显示供应商总数', () => {
      renderSupplierManager();

      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('新建供应商按钮交互', () => {
    it('应显示新建供应商按钮', () => {
      renderSupplierManager();

      expect(screen.getByRole('button', { name: /录入新供应商/ })).toBeInTheDocument();
    });

    it('点击新建供应商应打开表单弹窗', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      // Click the button (not the modal title)
      await user.click(screen.getByRole('button', { name: /录入新供应商/ }));

      // Check modal title which has h3 tag
      expect(screen.getByRole('heading', { name: /录入新供应商/ })).toBeInTheDocument();
    });

    it('弹窗标题应为录入新供应商', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /录入新供应商/ }));

      expect(screen.getByRole('heading', { name: /录入新供应商/ })).toBeInTheDocument();
    });
  });

  describe('搜索框交互', () => {
    it('应显示搜索输入框', () => {
      renderSupplierManager();

      expect(screen.getByPlaceholderText(/搜索供应商/)).toBeInTheDocument();
    });

    it('应能输入搜索关键词', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      const searchInput = screen.getByPlaceholderText(/搜索供应商/);
      await user.type(searchInput, '上海');

      expect(searchInput).toHaveValue('上海');
    });

    it('搜索应过滤供应商列表', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      const searchInput = screen.getByPlaceholderText(/搜索供应商/);
      await user.type(searchInput, '北京');

      expect(screen.getByText('北京设计工作室')).toBeInTheDocument();
      expect(screen.queryByText('上海搭建公司')).not.toBeInTheDocument();
    });
  });

  describe('分类筛选按钮交互', () => {
    it('应显示分类筛选按钮组', () => {
      renderSupplierManager();

      expect(screen.getByRole('button', { name: /全部/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /搭建/ })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /设计/ })).toBeInTheDocument();
    });

    it('应能切换到搭建分类', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /搭建/ }));

      const button = screen.getByRole('button', { name: /搭建/ });
      expect(button.closest('button')).toHaveClass(/bg-indigo-600/);
    });

    it('应能切换到设计分类', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /设计/ }));

      const button = screen.getByRole('button', { name: /设计/ });
      expect(button.closest('button')).toHaveClass(/bg-indigo-600/);
    });

    it('切换分类应更新列表', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /设计/ }));

      expect(screen.getByText('北京设计工作室')).toBeInTheDocument();
      expect(screen.queryByText('上海搭建公司')).not.toBeInTheDocument();
    });
  });

  describe('供应商卡片交互', () => {
    it('应显示供应商卡片列表', () => {
      renderSupplierManager();

      expect(screen.getByText('上海搭建公司')).toBeInTheDocument();
      expect(screen.getByText('北京设计工作室')).toBeInTheDocument();
    });

    it('应显示卡片中的供应商信息', () => {
      renderSupplierManager();

      expect(screen.getByText('4.5')).toBeInTheDocument();
      expect(screen.getByText('李经理')).toBeInTheDocument();
    });

    it('应显示查看档案按钮', () => {
      renderSupplierManager();

      expect(screen.getAllByText(/查看档案/)[0]).toBeInTheDocument();
    });

    it('点击查看档案应导航到详情页', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      const detailButton = screen.getAllByText(/查看档案/)[0];
      await user.click(detailButton);

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('供应商表单弹窗交互', () => {
    it('应显示表单字段', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /录入新供应商/ }));

      // Find inputs by name attribute
      expect(document.querySelector('input[name="name"]')).toBeInTheDocument();
      expect(document.querySelector('select[name="serviceType"]')).toBeInTheDocument();
      expect(document.querySelector('input[name="contact"]')).toBeInTheDocument();
    });

    it('应能填写公司名称', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /录入新供应商/ }));

      // Find input by name attribute
      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      await user.type(nameInput, '广州传媒公司');

      expect(nameInput).toHaveValue('广州传媒公司');
    });

    it('应能选择服务类别', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /录入新供应商/ }));

      const categorySelect = document.querySelector('select[name="serviceType"]') as HTMLSelectElement;
      await user.selectOptions(categorySelect, '设计');

      expect(categorySelect).toHaveValue('设计');
    });

    it('应能填写联系人信息', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /录入新供应商/ }));

      const contactInput = document.querySelector('input[name="contact"]') as HTMLInputElement;
      const phoneInput = document.querySelector('input[name="phone"]') as HTMLInputElement;
      await user.type(contactInput, '张总');
      await user.type(phoneInput, '13600136000');

      expect(contactInput).toHaveValue('张总');
    });

    it('应能填写银行信息', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /录入新供应商/ }));

      const bankNameInput = document.querySelector('input[name="bankName"]') as HTMLInputElement;
      const bankAccountInput = document.querySelector('input[name="bankAccount"]') as HTMLInputElement;
      await user.type(bankNameInput, '中国银行');
      await user.type(bankAccountInput, '1234567890');

      expect(bankNameInput).toHaveValue('中国银行');
    });

    it('应能关闭表单弹窗', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /录入新供应商/ }));

      // Find the X close button in the modal
      const closeButton = screen.getAllByRole('button').find(btn => btn.className.includes('hover:bg-slate-200'));
      if (closeButton) {
        await user.click(closeButton);
      }

      expect(screen.queryByRole('heading', { name: /录入新供应商/ })).not.toBeInTheDocument();
    });

    it('应能提交供应商表单', async () => {
      const user = userEvent.setup();
      mockAddSupplier.mockResolvedValue({});
      renderSupplierManager();

      await user.click(screen.getByRole('button', { name: /录入新供应商/ }));

      const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement;
      await user.type(nameInput, '深圳科技有限公司');

      const categorySelect = document.querySelector('select[name="serviceType"]') as HTMLSelectElement;
      await user.selectOptions(categorySelect, '搭建');

      // Submit the form
      const form = document.querySelector('form');
      if (form) {
        fireEvent.submit(form);
      }

      await waitFor(() => {
        expect(mockAddSupplier).toHaveBeenCalled();
      });
    });
  });

  describe('边界情况测试', () => {
    it('空搜索结果应隐藏供应商卡片', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      const searchInput = screen.getByPlaceholderText(/搜索供应商/);
      await user.type(searchInput, '不存在的供应商');

      expect(screen.queryByText('上海搭建公司')).not.toBeInTheDocument();
    });

    it('特殊字符搜索应正常处理', async () => {
      const user = userEvent.setup();
      renderSupplierManager();

      const searchInput = screen.getByPlaceholderText(/搜索供应商/);
      await user.type(searchInput, "test' OR '1'='1");

      expect(searchInput).toHaveValue("test' OR '1'='1");
    });
  });
});
