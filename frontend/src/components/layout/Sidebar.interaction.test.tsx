/**
 * 侧边栏组件交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Sidebar from './Sidebar';

// Mock AuthContext
const mockLogout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      username: 'testuser',
      is_superadmin: false,
    },
    logout: mockLogout,
  }),
}));

vi.mock('../../constants', () => ({
  NAV_ITEMS: [
    { id: 'dashboard', label: '数据仪表盘', icon: <span>图标</span> },
    { id: 'activities', label: '活动管理', icon: <span>图标</span> },
    { id: 'materials', label: '物料仓库', icon: <span>图标</span> },
    { id: 'budget', label: '预算仓库', icon: <span>图标</span> },
    { id: 'suppliers', label: '供应商库', icon: <span>图标</span> },
    { id: 'opportunities', label: '商机转化', icon: <span>图标</span> },
    { id: 'reviews', label: '复盘中心', icon: <span>图标</span> },
  ],
  SYSTEM_NAV_ITEMS: [
    { id: 'account', label: '账号管理', icon: <span>图标</span>, path: '/account' },
    { id: 'settings', label: '系统设置', icon: <span>图标</span>, path: '/settings' },
    { id: 'permissions', label: '权限管理', icon: <span>图标</span>, path: '/permissions' },
  ],
}));

const mockOnTabChange = vi.fn();

const renderSidebar = (activeTab = 'dashboard') => {
  render(
    <BrowserRouter>
      <Sidebar activeTab={activeTab} onTabChange={mockOnTabChange} />
    </BrowserRouter>
  );
};

describe('侧边栏组件交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('品牌标识', () => {
    it('应显示品牌名称', () => {
      renderSidebar();

      expect(screen.getByText('EventMaster')).toBeInTheDocument();
      expect(screen.getByText(/Pro/)).toBeInTheDocument();
    });
  });

  describe('主导航项交互', () => {
    it('应显示所有主导航项', () => {
      renderSidebar();

      expect(screen.getByText('数据仪表盘')).toBeInTheDocument();
      expect(screen.getByText('活动管理')).toBeInTheDocument();
      expect(screen.getByText('物料仓库')).toBeInTheDocument();
      expect(screen.getByText('预算仓库')).toBeInTheDocument();
      expect(screen.getByText('供应商库')).toBeInTheDocument();
      expect(screen.getByText('商机转化')).toBeInTheDocument();
      expect(screen.getByText('复盘中心')).toBeInTheDocument();
    });

    it('应显示7个主导航项', () => {
      renderSidebar();

      const navButtons = screen.getAllByRole('button').filter(
        button => !button.className.includes('bg-indigo') && button.textContent !== '退出登录'
      );
      expect(navButtons.length).toBeGreaterThanOrEqual(7);
    });

    it('点击主导航项应调用 onTabChange', async () => {
      const user = userEvent.setup();
      renderSidebar();

      const activitiesButton = screen.getByText('活动管理');
      await user.click(activitiesButton);

      expect(mockOnTabChange).toHaveBeenCalledWith('activities');
    });

    it('活跃项应有高亮样式', () => {
      renderSidebar('dashboard');

      const dashboardButton = screen.getByText('数据仪表盘');
      expect(dashboardButton.closest('button')).toHaveClass(/bg-indigo/);
    });

    it('非活跃项不应有高亮样式', () => {
      renderSidebar('dashboard');

      const activitiesButton = screen.getByText('活动管理');
      expect(activitiesButton.closest('button')).not.toHaveClass(/bg-indigo/);
    });
  });

  describe('系统导航项交互', () => {
    it('应显示系统分组标题', () => {
      renderSidebar();

      expect(screen.getByText('系统')).toBeInTheDocument();
    });

    it('应显示所有系统导航项', () => {
      renderSidebar();

      expect(screen.getByText('账号管理')).toBeInTheDocument();
      expect(screen.getByText('系统设置')).toBeInTheDocument();
      expect(screen.getByText('权限管理')).toBeInTheDocument();
    });

    it('点击系统导航项应导航到对应路径', async () => {
      const user = userEvent.setup();
      renderSidebar();

      const accountButton = screen.getByText('账号管理');
      await user.click(accountButton);

      expect(mockNavigate).toHaveBeenCalledWith('/account');
    });

    it('系统导航项应支持 activeTab 高亮', () => {
      renderSidebar('account');

      const accountButton = screen.getByText('账号管理');
      expect(accountButton.closest('button')).toHaveClass(/bg-indigo/);
    });
  });

  describe('用户信息区交互', () => {
    it('应显示用户名', () => {
      renderSidebar();

      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('应显示用户角色', () => {
      renderSidebar();

      expect(screen.getByText('用户')).toBeInTheDocument();
    });
  });

  describe('退出登录按钮交互', () => {
    it('应显示退出登录按钮', () => {
      renderSidebar();

      expect(screen.getByRole('button', { name: /退出登录/ })).toBeInTheDocument();
    });

    it('点击退出登录应调用 logout', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.click(screen.getByRole('button', { name: /退出登录/ }));

      expect(mockLogout).toHaveBeenCalled();
    });

    it('点击退出登录后应导航到登录页', async () => {
      const user = userEvent.setup();
      renderSidebar();

      await user.click(screen.getByRole('button', { name: /退出登录/ }));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('导航切换交互', () => {
    it('切换到活动管理应高亮对应项', async () => {
      const user = userEvent.setup();
      renderSidebar('dashboard');

      const activitiesButton = screen.getByText('活动管理');
      await user.click(activitiesButton);

      expect(mockOnTabChange).toHaveBeenCalledWith('activities');
    });

    it('连续切换应正常工作', async () => {
      const user = userEvent.setup();
      renderSidebar('dashboard');

      await user.click(screen.getByText('活动管理'));
      expect(mockOnTabChange).toHaveBeenCalledWith('activities');

      await user.click(screen.getByText('物料仓库'));
      expect(mockOnTabChange).toHaveBeenCalledWith('materials');

      await user.click(screen.getByText('预算仓库'));
      expect(mockOnTabChange).toHaveBeenCalledWith('budget');
    });
  });

  describe('边界情况测试', () => {
    it('无用户名应显示默认文本', () => {
      renderSidebar();

      expect(screen.getByText('用户')).toBeInTheDocument();
    });

    it('快速点击应正常工作', async () => {
      const user = userEvent.setup();
      renderSidebar('dashboard');

      // 快速点击多个导航项
      await user.click(screen.getByText('活动管理'));
      await user.click(screen.getByText('物料仓库'));
      await user.click(screen.getByText('预算仓库'));

      expect(mockOnTabChange).toHaveBeenCalledTimes(3);
    });
  });

  describe('样式和布局', () => {
    it('侧边栏应有固定宽度', () => {
      renderSidebar();

      const sidebar = document.querySelector('.w-56');
      expect(sidebar).toBeInTheDocument();
    });

    it('侧边栏应全屏高度', () => {
      renderSidebar();

      const sidebar = document.querySelector('.h-screen');
      expect(sidebar).toBeInTheDocument();
    });

    it('品牌标识应有 logo 背景', () => {
      renderSidebar();

      const logo = document.querySelector('[class*="bg-indigo"]');
      expect(logo).toBeInTheDocument();
    });
  });
});
