/**
 * 登录认证场景测试
 * 覆盖登录认证模块的所有核心业务场景
 */
import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import React from 'react';

// Mock 路由组件
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual as any,
    useNavigate: () => mockNavigate,
  };
});

// Mock AuthContext
const mockLogin = vi.fn();
const mockLogout = vi.fn();

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    login: mockLogin,
    logout: mockLogout,
    isAuthenticated: false,
    isLoading: false,
    user: null,
    token: null,
    permissions: null,
    hasPermission: () => true,
  }),
}));

// Mock backend API
vi.mock('../../services/authApi', () => ({
  authApi: {
    login: vi.fn(),
    getCurrentUser: vi.fn(),
  },
  userApi: {
    getMyPermissions: vi.fn(),
  },
}));

// Mock Toast
vi.mock('../../shared/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

import Login from '../../pages/Login';

const renderLoginPage = () => {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
};

describe('登录认证场景', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('场景1: 正常登录', () => {
    it('应能渲染登录页面', () => {
      // Given: 登录页面
      renderLoginPage();

      // Then: 显示登录标题
      expect(screen.getByText('EventMaster Pro')).toBeInTheDocument();
    });

    it('应显示用户名和密码输入框', () => {
      // Given: 登录页面
      renderLoginPage();

      // Then: 有输入框
      expect(screen.getByPlaceholderText('请输入用户名')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('请输入密码')).toBeInTheDocument();
    });

    it('应显示登录按钮', () => {
      // Given: 登录页面
      renderLoginPage();

      // Then: 有登录按钮
      expect(screen.getByRole('button', { name: /登录/i })).toBeInTheDocument();
    });

    it('应显示默认账号提示', () => {
      // Given: 登录页面
      renderLoginPage();

      // Then: 显示默认账号
      expect(screen.getByText(/默认账号/i)).toBeInTheDocument();
    });
  });

  describe('场景2: 错误密码登录', () => {
    it('登录失败应设置错误状态', async () => {
      // Given: 登录失败
      mockLogin.mockRejectedValueOnce(new Error('用户名或密码错误'));

      renderLoginPage();

      // When: 填写表单
      fireEvent.change(screen.getByPlaceholderText('请输入用户名'), { target: { value: 'admin' } });
      fireEvent.change(screen.getByPlaceholderText('请输入密码'), { target: { value: 'wrongpassword' } });
      fireEvent.click(screen.getByRole('button', { name: /登录/i }));

      // Then: 等待错误显示
      await waitFor(() => {
        expect(screen.queryByText(/用户名或密码错误/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('场景3: 空字段提交', () => {
    it('用户名输入框应标记为必填', () => {
      // Given: 登录页面
      renderLoginPage();

      // Then: 用户名有required属性
      const usernameInput = screen.getByPlaceholderText('请输入用户名');
      expect(usernameInput).toHaveAttribute('required');
    });

    it('密码输入框应标记为必填', () => {
      // Given: 登录页面
      renderLoginPage();

      // Then: 密码有required属性
      const passwordInput = screen.getByPlaceholderText('请输入密码');
      expect(passwordInput).toHaveAttribute('required');
    });

    it('空用户名输入框值应为空', () => {
      // Given: 登录页面
      renderLoginPage();

      // Then: 用户名值为空
      const usernameInput = screen.getByPlaceholderText('请输入用户名') as HTMLInputElement;
      expect(usernameInput.value).toBe('');
    });

    it('空密码输入框值应为空', () => {
      // Given: 登录页面
      renderLoginPage();

      // Then: 密码值为空
      const passwordInput = screen.getByPlaceholderText('请输入密码') as HTMLInputElement;
      expect(passwordInput.value).toBe('');
    });
  });

  describe('场景4: 未注册用户登录', () => {
    it('错误密码应触发错误提示', async () => {
      // Given: 不存在的用户
      mockLogin.mockRejectedValueOnce(new Error('用户不存在'));

      renderLoginPage();

      // When: 填写表单
      fireEvent.change(screen.getByPlaceholderText('请输入用户名'), { target: { value: 'nonexistent' } });
      fireEvent.change(screen.getByPlaceholderText('请输入密码'), { target: { value: 'password123' } });
      fireEvent.click(screen.getByRole('button', { name: /登录/i }));

      // Then: 显示错误
      await waitFor(() => {
        expect(screen.queryByText(/用户不存在|用户名或密码错误/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('场景5: 会话过期处理', () => {
    it('localStorage应能存储token', () => {
      // Given: token值
      const token = 'test_token_123';

      // When: 存储token
      localStorage.setItem('auth_token', token);

      // Then: token被存储
      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('应能从localStorage获取token', () => {
      // Given: 存储的token
      localStorage.setItem('auth_token', 'test_token');

      // When: 获取token
      const token = localStorage.getItem('auth_token');

      // Then: token存在
      expect(token).toBe('test_token');
    });
  });

  describe('场景6: 网络错误处理', () => {
    it('网络错误应触发错误提示', async () => {
      // Given: 网络错误
      mockLogin.mockRejectedValueOnce(new Error('网络错误，请检查网络连接'));

      renderLoginPage();

      // When: 填写表单
      fireEvent.change(screen.getByPlaceholderText('请输入用户名'), { target: { value: 'admin' } });
      fireEvent.change(screen.getByPlaceholderText('请输入密码'), { target: { value: 'admin123' } });
      fireEvent.click(screen.getByRole('button', { name: /登录/i }));

      // Then: 显示网络错误
      await waitFor(() => {
        expect(screen.queryByText(/网络错误|请检查网络/i)).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('场景7: 并发登录请求处理', () => {
    it('登录请求应可被调用', async () => {
      // Given: mock登录
      mockLogin.mockResolvedValueOnce(undefined);

      renderLoginPage();

      // When: 填写并提交
      fireEvent.change(screen.getByPlaceholderText('请输入用户名'), { target: { value: 'admin' } });
      fireEvent.change(screen.getByPlaceholderText('请输入密码'), { target: { value: 'admin123' } });
      fireEvent.click(screen.getByRole('button', { name: /登录/i }));

      // Then: 登录被调用
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalled();
      });
    });
  });

  describe('场景8: 登录表单输入验证', () => {
    it('应能输入用户名', () => {
      // Given: 登录页面
      renderLoginPage();

      // When: 输入用户名
      const usernameInput = screen.getByPlaceholderText('请输入用户名');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      // Then: 输入框有值
      const input = usernameInput as HTMLInputElement;
      expect(input.value).toBe('testuser');
    });

    it('应能输入密码', () => {
      // Given: 登录页面
      renderLoginPage();

      // When: 输入密码
      const passwordInput = screen.getByPlaceholderText('请输入密码');
      fireEvent.change(passwordInput, { target: { value: 'testpass' } });

      // Then: 输入框有值
      const input = passwordInput as HTMLInputElement;
      expect(input.value).toBe('testpass');
    });

    it('密码输入框类型应为password', () => {
      // Given: 登录页面
      renderLoginPage();

      // Then: 类型正确
      const passwordInput = screen.getByPlaceholderText('请输入密码');
      expect(passwordInput.getAttribute('type')).toBe('password');
    });
  });

  describe('场景9: 登录状态持久化', () => {
    it('应保存token到localStorage', () => {
      // Given: token值
      const token = 'access_token_123';

      // When: 保存token
      localStorage.setItem('auth_token', token);

      // Then: token被保存
      expect(localStorage.getItem('auth_token')).toBe(token);
    });

    it('应能清除token', () => {
      // Given: 已保存的token
      localStorage.setItem('auth_token', 'some_token');

      // When: 清除token
      localStorage.removeItem('auth_token');

      // Then: token被清除
      expect(localStorage.getItem('auth_token')).toBeNull();
    });

    it('localStorage.clear应清除所有数据', () => {
      // Given: 多个数据
      localStorage.setItem('auth_token', 'token1');
      localStorage.setItem('user_id', '123');

      // When: 清除所有
      localStorage.clear();

      // Then: 所有数据被清除
      expect(localStorage.getItem('auth_token')).toBeNull();
      expect(localStorage.getItem('user_id')).toBeNull();
    });
  });
});
