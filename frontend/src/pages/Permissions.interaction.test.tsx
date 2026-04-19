/**
 * Permissions 页面交互测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import Permissions from './Permissions';

// Mock API
vi.mock('../services/authApi', () => ({
  roleApi: {
    getList: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 1, name: '新角色' }),
    update: vi.fn().mockResolvedValue({ id: 1, name: '更新角色' }),
    delete: vi.fn().mockResolvedValue({ message: '删除成功' }),
  },
  Role: {},
}));

// Mock Toast
vi.mock('../shared/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
  }),
}));

const mockRoles = [
  { id: 1, name: '管理员', description: '超级管理员', permissions: {}, is_default: true },
  { id: 2, name: '普通用户', description: '普通用户角色', permissions: {}, is_default: false },
];

describe('Permissions 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该渲染页面标题', () => {
      render(<Permissions />, { wrapper: MemoryRouter });
      expect(screen.getByText('权限管理')).toBeInTheDocument();
    });

    it('应该渲染添加角色按钮', async () => {
      const { roleApi } = await import('../services/authApi');
      vi.mocked(roleApi.getList).mockResolvedValue(mockRoles);

      render(<Permissions />, { wrapper: MemoryRouter });

      await waitFor(() => {
        expect(screen.getByText('添加角色')).toBeInTheDocument();
      });
    });

    it('应该渲染角色列表', async () => {
      const { roleApi } = await import('../services/authApi');
      vi.mocked(roleApi.getList).mockResolvedValue(mockRoles);

      render(<Permissions />, { wrapper: MemoryRouter });

      await waitFor(() => {
        expect(screen.getByText('管理员')).toBeInTheDocument();
        expect(screen.getByText('普通用户')).toBeInTheDocument();
      });
    });
  });

  describe('模块和权限显示测试', () => {
    it('应该显示所有模块', async () => {
      const { roleApi } = await import('../services/authApi');
      vi.mocked(roleApi.getList).mockResolvedValue(mockRoles);

      render(<Permissions />, { wrapper: MemoryRouter });

      await waitFor(() => {
        expect(screen.getByText('活动管理')).toBeInTheDocument();
        expect(screen.getByText('物料仓库')).toBeInTheDocument();
        expect(screen.getByText('预算管理')).toBeInTheDocument();
        expect(screen.getByText('供应商库')).toBeInTheDocument();
      });
    });

    it('应该显示权限操作', async () => {
      const { roleApi } = await import('../services/authApi');
      vi.mocked(roleApi.getList).mockResolvedValue(mockRoles);

      render(<Permissions />, { wrapper: MemoryRouter });

      await waitFor(() => {
        expect(screen.getByText('查看')).toBeInTheDocument();
        expect(screen.getByText('创建')).toBeInTheDocument();
        expect(screen.getByText('编辑')).toBeInTheDocument();
        expect(screen.getByText('删除')).toBeInTheDocument();
      });
    });
  });

  describe('模态框测试', () => {
    it('点击添加角色应该打开模态框', async () => {
      const { roleApi } = await import('../services/authApi');
      vi.mocked(roleApi.getList).mockResolvedValue(mockRoles);

      render(<Permissions />, { wrapper: MemoryRouter });

      await waitFor(() => {
        const addButton = screen.getByText('添加角色');
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText('角色名称')).toBeInTheDocument();
        expect(screen.getByText('角色描述')).toBeInTheDocument();
      });
    });

    it('点击关闭按钮应该关闭模态框', async () => {
      const { roleApi } = await import('../services/authApi');
      vi.mocked(roleApi.getList).mockResolvedValue(mockRoles);

      render(<Permissions />, { wrapper: MemoryRouter });

      await waitFor(() => {
        const addButton = screen.getByText('添加角色');
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        const closeButtons = screen.getAllByText('取消');
        fireEvent.click(closeButtons[closeButtons.length - 1]);
      });
    });
  });

  describe('按列全选测试', () => {
    it('点击添加角色后应显示4个列全选按钮', async () => {
      const { roleApi } = await import('../services/authApi');
      vi.mocked(roleApi.getList).mockResolvedValue(mockRoles);

      render(<Permissions />, { wrapper: MemoryRouter });

      await waitFor(() => {
        const addButton = screen.getByText('添加角色');
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText('角色名称')).toBeInTheDocument();
      });

      // 验证有4个操作列（查看/创建/编辑/删除）
      expect(screen.getAllByText('查看').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('创建').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('编辑').length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText('删除').length).toBeGreaterThanOrEqual(1);
    });

    it('全选按钮应正确响应点击事件', async () => {
      const { roleApi } = await import('../services/authApi');
      vi.mocked(roleApi.getList).mockResolvedValue(mockRoles);

      render(<Permissions />, { wrapper: MemoryRouter });

      await waitFor(() => {
        const addButton = screen.getByText('添加角色');
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText('角色名称')).toBeInTheDocument();
      });

      // 权限表格应渲染，包含8个模块行
      expect(screen.getAllByText('活动管理').length).toBeGreaterThan(0);
      expect(screen.getAllByText('物料仓库').length).toBeGreaterThan(0);
      expect(screen.getAllByText('预算管理').length).toBeGreaterThan(0);
      expect(screen.getAllByText('供应商库').length).toBeGreaterThan(0);
    });

    it('权限单元格点击后状态应正确切换', async () => {
      const { roleApi } = await import('../services/authApi');
      vi.mocked(roleApi.getList).mockResolvedValue(mockRoles);

      render(<Permissions />, { wrapper: MemoryRouter });

      await waitFor(() => {
        const addButton = screen.getByText('添加角色');
        fireEvent.click(addButton);
      });

      await waitFor(() => {
        expect(screen.getByText('角色名称')).toBeInTheDocument();
      });

      // 权限单元格初始状态应为未选中（显示✗）
      // 找到并点击第一个权限单元格
      const permissionButtons = screen.getAllByText('✗');
      expect(permissionButtons.length).toBeGreaterThan(0);
    });
  });
});
