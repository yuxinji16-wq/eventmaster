/**
 * 登录页面交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Login from './Login';

// Mock AuthContext
const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

// Mock Toast
vi.mock('../shared/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
  ToastProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderLogin = () => {
  render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
};

describe('登录页面交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('基本UI元素', () => {
    it('应正确渲染登录表单元素', () => {
      renderLogin();

      expect(screen.getByText('EventMaster Pro')).toBeInTheDocument();
      expect(screen.getByText('市场活动全生命周期管理平台')).toBeInTheDocument();
      expect(screen.getByLabelText(/用户名/)).toBeInTheDocument();
      expect(screen.getByLabelText(/密码/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /登录/ })).toBeInTheDocument();
    });

    it('应显示默认账号提示', () => {
      renderLogin();
      expect(screen.getByText(/默认账号/)).toBeInTheDocument();
    });
  });

  describe('输入框交互', () => {
    it('应能输入用户名', async () => {
      const user = userEvent.setup();
      renderLogin();

      const usernameInput = screen.getByLabelText(/用户名/);
      await user.type(usernameInput, 'testuser');

      expect(usernameInput).toHaveValue('testuser');
    });

    it('应能输入密码', async () => {
      const user = userEvent.setup();
      renderLogin();

      const passwordInput = screen.getByLabelText(/密码/);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('用户名输入应触发 onChange', async () => {
      const user = userEvent.setup();
      renderLogin();

      const usernameInput = screen.getByLabelText(/用户名/);
      await user.type(usernameInput, 'admin');

      expect(usernameInput).toHaveValue('admin');
    });

    it('密码输入应为密码类型', () => {
      renderLogin();

      const passwordInput = screen.getByLabelText(/密码/);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('表单提交交互', () => {
    it('点击登录按钮应调用 login 函数', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'admin');
      await user.type(screen.getByLabelText(/密码/), 'admin123');
      await user.click(screen.getByRole('button', { name: /登录/ }));

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('admin', 'admin123');
      });
    });

    it('登录成功后应跳转到首页', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'admin');
      await user.type(screen.getByLabelText(/密码/), 'admin123');
      await user.click(screen.getByRole('button', { name: /登录/ }));

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('表单提交应阻止默认行为', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValueOnce(undefined);

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'admin');
      await user.type(screen.getByLabelText(/密码/), 'admin123');

      const form = screen.getByTestId('login-form');
      fireEvent.submit(form);

      expect(mockLogin).toHaveBeenCalled();
    });
  });

  describe('错误处理交互', () => {
    it('登录失败应显示错误信息', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('用户名或密码错误'));

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'wronguser');
      await user.type(screen.getByLabelText(/密码/), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /登录/ }));

      await waitFor(() => {
        expect(screen.getByText(/用户名或密码错误/)).toBeInTheDocument();
      });
    });

    it('错误信息应包含具体错误描述', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('账户已被禁用'));

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'disableduser');
      await user.type(screen.getByLabelText(/密码/), 'pass123');
      await user.click(screen.getByRole('button', { name: /登录/ }));

      await waitFor(() => {
        const errorElement = screen.getByText(/账户已被禁用/);
        expect(errorElement).toBeInTheDocument();
      });
    });

    it('错误信息应为红色提示样式', async () => {
      const user = userEvent.setup();
      mockLogin.mockRejectedValueOnce(new Error('登录失败'));

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'user');
      await user.type(screen.getByLabelText(/密码/), 'pass');
      await user.click(screen.getByRole('button', { name: /登录/ }));

      await waitFor(() => {
        const errorElement = screen.getByText(/登录失败/);
        expect(errorElement.closest('div')).toHaveClass(/rose/);
      });
    });
  });

  describe('Loading 状态交互', () => {
    it('登录过程中按钮应显示 Loading 状态', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(() => {}));

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'admin');
      await user.type(screen.getByLabelText(/密码/), 'admin123');
      await user.click(screen.getByRole('button', { name: /登录/ }));

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /登录中/ });
        expect(button).toBeDisabled();
      });
    });

    it('登录按钮在 Loading 时应禁用', async () => {
      const user = userEvent.setup();
      mockLogin.mockImplementation(() => new Promise(() => {}));

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'admin');
      await user.type(screen.getByLabelText(/密码/), 'admin123');
      await user.click(screen.getByRole('button', { name: /登录/ }));

      await waitFor(() => {
        const button = screen.getByRole('button', { name: /登录中/ });
        expect(button).toBeDisabled();
      });
    });

    it('Loading 结束后按钮应恢复可点击状态', async () => {
      const user = userEvent.setup();
      let resolvePromise!: () => void;
      mockLogin.mockImplementation(() => new Promise(resolve => { resolvePromise = resolve; }));

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'admin');
      await user.type(screen.getByLabelText(/密码/), 'admin123');
      await user.click(screen.getByRole('button', { name: /登录/ }));

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /登录中/ })).toBeDisabled();
      });

      resolvePromise();

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /登录/ });
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('边界情况测试', () => {
    it('连续快速点击登录按钮应只提交一次', async () => {
      const user = userEvent.setup();
      // 使用永不resolve的Promise，模拟长时间登录
      mockLogin.mockImplementation(() => new Promise(() => {}));

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), 'admin');
      await user.type(screen.getByLabelText(/密码/), 'admin123');

      // 快速点击多次
      const button = screen.getByRole('button', { name: /登录/ });
      await user.click(button);
      await user.click(button);
      await user.click(button);

      // 由于有 isLoading guard，只应提交一次
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('输入超长用户名应正常处理', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(undefined);

      renderLogin();

      const longUsername = 'a'.repeat(100);
      await user.type(screen.getByLabelText(/用户名/), longUsername);

      expect(screen.getByLabelText(/用户名/)).toHaveValue(longUsername);
    });

    it('输入特殊字符应正常处理', async () => {
      const user = userEvent.setup();
      mockLogin.mockResolvedValue(undefined);

      renderLogin();

      await user.type(screen.getByLabelText(/用户名/), "admin' OR '1'='1");
      await user.type(screen.getByLabelText(/密码/), 'password@#$%');

      expect(screen.getByLabelText(/用户名/)).toHaveValue("admin' OR '1'='1");
      expect(screen.getByLabelText(/密码/)).toHaveValue('password@#$%');
    });
  });
});
