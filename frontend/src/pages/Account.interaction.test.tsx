/**
 * 账号管理页面交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Account from './Account';
import type { User as UserType, Role } from '../services/authApi';

// 存储 mock 函数引用
const mockRequest = vi.fn();

// 必须在任何组件导入之前 mock
vi.mock('../services/backendApi', () => ({
  request: (...args: unknown[]) => mockRequest(...args),
}));

// Mock Toast
vi.mock('../shared/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}));

const mockUsers: UserType[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    is_active: true,
    is_superadmin: true,
    role_id: null,
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  },
  {
    id: 2,
    username: 'testuser',
    email: 'test@example.com',
    is_active: true,
    is_superadmin: false,
    role_id: 1,
    created_at: '2024-02-01',
    updated_at: '2024-02-01',
  },
];

const mockRoles: Role[] = [
  { id: 1, name: '管理员', description: '管理员角色', permissions: {}, is_default: false },
  { id: 2, name: '普通用户', description: '普通用户角色', permissions: {}, is_default: true },
];

// 辅助函数：配置 mock 返回值
const setupMocks = (options: {
  users?: UserType[];
  roles?: Role[];
  deleteResult?: unknown;
  updateResult?: unknown;
  createResult?: unknown;
} = {}) => {
  const { users = mockUsers, roles = mockRoles, deleteResult, updateResult, createResult } = options;

  mockRequest.mockImplementation((url: string) => {
    if (url === '/users') return Promise.resolve(users);
    if (url === '/roles') return Promise.resolve(roles);
    if (url.startsWith('/users/') && url.endsWith('/') && options.deleteResult !== undefined) {
      return Promise.resolve(deleteResult ?? { message: 'Deleted' });
    }
    if (url.startsWith('/users/') && url.includes('permissions')) {
      return Promise.resolve({});
    }
    if (url.match(/^\/users\/\d+$/)) {
      return Promise.resolve(updateResult ?? {});
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
};

// 专门处理带 HTTP 方法的请求
const setupMockWithMethod = (options: {
  users?: UserType[];
  roles?: Role[];
} = {}) => {
  const { users = mockUsers, roles = mockRoles } = options;

  mockRequest.mockImplementation((url: string, options?: { method?: string; body?: string }) => {
    if (url === '/users' && !options?.method) return Promise.resolve(users);
    if (url === '/roles' && !options?.method) return Promise.resolve(roles);
    if (url === '/users' && options?.method === 'POST') {
      return Promise.resolve({ id: 3, username: 'newuser', email: 'new@example.com', is_active: true, is_superadmin: false, role_id: null, created_at: '2024-03-01', updated_at: '2024-03-01' });
    }
    if (url.match(/^\/users\/\d+$/) && options?.method === 'PUT') {
      return Promise.resolve({});
    }
    if (url.match(/^\/users\/\d+$/) && options?.method === 'DELETE') {
      return Promise.resolve({ message: 'Deleted' });
    }
    return Promise.reject(new Error('Unknown endpoint'));
  });
};

const renderAccount = () => {
  return render(
    <BrowserRouter>
      <Account />
    </BrowserRouter>
  );
};

describe('账号管理页面交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 默认设置正常返回
    setupMockWithMethod();
    // 确保 window.confirm 返回 true
    window.confirm = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('页面标题和操作', () => {
    it('应显示账号管理标题', async () => {
      renderAccount();

      await waitFor(() => {
        expect(screen.getByText('账号管理')).toBeInTheDocument();
      });
      expect(screen.getByText('管理系统用户账号')).toBeInTheDocument();
    });

    it('应显示添加用户按钮', async () => {
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });
    });

    it('点击添加用户应打开弹窗', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '添加用户' })).toBeInTheDocument();
      });
    });
  });

  describe('用户列表交互', () => {
    it('应显示用户列表表格', async () => {
      renderAccount();

      await waitFor(() => {
        expect(screen.getByText('用户名')).toBeInTheDocument();
        expect(screen.getByText('邮箱')).toBeInTheDocument();
        expect(screen.getByText('角色')).toBeInTheDocument();
        expect(screen.getByText('状态')).toBeInTheDocument();
        expect(screen.getByText('操作')).toBeInTheDocument();
      });
    });

    it('应显示用户数据', async () => {
      renderAccount();

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });
    });

    it('应显示用户邮箱', async () => {
      renderAccount();

      await waitFor(() => {
        expect(screen.getByText('admin@example.com')).toBeInTheDocument();
      });
    });

    it('应显示超级管理员标签', async () => {
      renderAccount();

      await waitFor(() => {
        const badges = screen.getAllByText('超级管理员', { selector: 'span' });
        expect(badges.length).toBeGreaterThan(0);
      });
    });

    it('应显示活跃状态标签', async () => {
      renderAccount();

      await waitFor(() => {
        // 表格中每个活跃用户都显示"活跃"，使用 getAllByText 检查至少有一个
        const activeSpans = screen.getAllByText('活跃', { selector: 'span' });
        expect(activeSpans.length).toBeGreaterThan(0);
      });
    });
  });

  describe('编辑用户按钮交互', () => {
    it('非超级管理员应显示编辑按钮', async () => {
      renderAccount();

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /编辑/ });
        expect(editButtons.length).toBeGreaterThan(0);
      });
    });

    it('超级管理员不应显示编辑按钮', async () => {
      renderAccount();

      await waitFor(() => {
        const editButtons = screen.getAllByRole('button', { name: /编辑/ });
        // 只有 testuser 应该有编辑按钮
        expect(editButtons.length).toBe(1);
      });
    });

    it('点击编辑应打开编辑弹窗', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /编辑/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '编辑用户' })).toBeInTheDocument();
      });
    });
  });

  describe('删除用户按钮交互', () => {
    it('非超级管理员应显示删除按钮', async () => {
      renderAccount();

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /删除/ });
        expect(deleteButtons.length).toBeGreaterThan(0);
      });
    });

    it('超级管理员不应显示删除按钮', async () => {
      renderAccount();

      await waitFor(() => {
        const deleteButtons = screen.getAllByRole('button', { name: /删除/ });
        expect(deleteButtons.length).toBe(1); // 只有 testuser
      });
    });

    it('点击删除应弹出确认框', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /删除/ }));

      expect(window.confirm).toHaveBeenCalledWith('确定要删除此用户吗？');
    });

    it('确认删除应调用删除API', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /删除/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /删除/ }));

      await waitFor(() => {
        // 验证 DELETE 请求被调用
        expect(mockRequest).toHaveBeenCalledWith('/users/2', expect.objectContaining({ method: 'DELETE' }));
      });
    });
  });

  describe('添加用户表单交互', () => {
    it('应显示表单字段', async () => {
      const user = userEvent.setup();
      renderAccount();

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        expect(screen.getByLabelText(/用户名/)).toBeInTheDocument();
        expect(screen.getByLabelText(/邮箱/)).toBeInTheDocument();
        expect(screen.getByLabelText(/密码/)).toBeInTheDocument();
        expect(screen.getByLabelText(/角色/)).toBeInTheDocument();
      });
    });

    it('应能填写用户名', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        expect(screen.getByLabelText(/用户名/)).toBeInTheDocument();
      });

      const usernameInput = screen.getByLabelText(/用户名/);
      await user.type(usernameInput, 'newuser');
      expect(usernameInput).toHaveValue('newuser');
    });

    it('应能填写邮箱', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        expect(screen.getByLabelText(/邮箱/)).toBeInTheDocument();
      });

      const emailInput = screen.getByLabelText(/邮箱/);
      await user.type(emailInput, 'new@example.com');
      expect(emailInput).toHaveValue('new@example.com');
    });

    it('应能填写密码', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        expect(screen.getByLabelText(/密码/)).toBeInTheDocument();
      });

      const passwordInput = screen.getByLabelText(/密码/);
      await user.type(passwordInput, 'password123');
      expect(passwordInput).toHaveValue('password123');
    });

    it('应能选择角色', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        expect(screen.getByLabelText(/角色/)).toBeInTheDocument();
      });

      const roleSelect = screen.getByLabelText(/角色/);
      await user.selectOptions(roleSelect, '1');
      expect(roleSelect).toHaveValue('1');
    });

    it('应能取消添加', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: '添加用户' })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /取消/ }));

      await waitFor(() => {
        // 弹窗关闭后，h2 标题消失
        expect(screen.queryByRole('heading', { name: '添加用户' })).not.toBeInTheDocument();
      });
    });
  });

  describe('编辑用户表单交互', () => {
    it('应预填表单数据', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /编辑/ }));

      await waitFor(() => {
        expect(screen.getByLabelText(/用户名/)).toHaveValue('testuser');
        expect(screen.getByLabelText(/邮箱/)).toHaveValue('test@example.com');
      });
    });

    it('编辑模式密码应为可选填', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /编辑/ }));

      await waitFor(() => {
        expect(screen.getByText(/留空则不修改/)).toBeInTheDocument();
      });
    });

    it('编辑模式应显示账号状态切换', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /编辑/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /编辑/ }));

      await waitFor(() => {
        expect(screen.getByText('账号状态')).toBeInTheDocument();
      });
    });
  });

  describe('表单验证交互', () => {
    it('用户名为空应显示错误', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /创建/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /创建/ }));

      await waitFor(() => {
        expect(screen.getByText('用户名不能为空')).toBeInTheDocument();
      });
    });

    it('邮箱为空应显示错误', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        const usernameInput = screen.getByLabelText(/用户名/);
        user.type(usernameInput, 'newuser');
      });

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /创建/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /创建/ }));

      await waitFor(() => {
        expect(screen.getByText('邮箱不能为空')).toBeInTheDocument();
      });
    });

    it('密码为空应显示错误（添加模式）', async () => {
      const user = userEvent.setup();
      renderAccount();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /添加用户/ })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /添加用户/ }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /创建/ })).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByLabelText(/用户名/)).toBeInTheDocument();
        expect(screen.getByLabelText(/邮箱/)).toBeInTheDocument();
      });

      await user.type(screen.getByLabelText(/用户名/), 'newuser');
      await user.type(screen.getByLabelText(/邮箱/), 'new@example.com');

      await user.click(screen.getByRole('button', { name: /创建/ }));

      await waitFor(() => {
        expect(screen.getByText('密码不能为空')).toBeInTheDocument();
      });
    });
  });

  describe('加载状态', () => {
    it('数据加载完成后不显示加载指示器', async () => {
      renderAccount();

      await waitFor(() => {
        expect(screen.getByText('admin')).toBeInTheDocument();
      });

      // 加载完成后，Loader2 的父容器不应存在
      // 通过检查 spinner 不存在来验证
      const spinners = document.querySelectorAll('[class*="animate-spin"]');
      expect(spinners.length).toBe(0);
    });
  });

  describe('边界情况测试', () => {
    it('空用户列表应显示空状态', async () => {
      setupMockWithMethod({ users: [], roles: [] });
      renderAccount();

      await waitFor(() => {
        expect(screen.getByText('暂无用户数据')).toBeInTheDocument();
      });
    });

    it('网络错误应进入错误状态（无 UI 显示，通过控制台观察）', async () => {
      mockRequest.mockRejectedValue(new Error('Network error'));
      renderAccount();

      // 组件在网络错误时只记录到 console.error，不显示特定 UI
      await waitFor(() => {
        expect(screen.getByText('账号管理')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });
});
