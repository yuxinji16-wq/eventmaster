/**
 * 测试工具函数
 */
import React, { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './shared/Toast';

// 默认的 AuthContext 值
export const defaultAuthContext = {
  user: { id: 1, username: 'testuser', email: 'test@example.com', is_active: true, is_superadmin: false, role_id: null, created_at: '', updated_at: '' },
  login: async (username: string, password: string) => { return { token: 'test-token' }; },
  logout: () => {},
  isAuthenticated: true,
  isLoading: false,
};

/**
 * 测试用的包裹器
 */
export function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          {children}
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

/**
 * 渲染带测试包裹器的组件
 */
export function renderWithProviders(ui: ReactElement) {
  return render(ui, { wrapper: TestWrapper });
}
