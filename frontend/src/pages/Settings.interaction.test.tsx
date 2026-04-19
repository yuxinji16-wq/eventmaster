/**
 * Settings 页面测试
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import React from 'react';
import Settings from './Settings';

// Mock settingsApi
vi.mock('../services/authApi', () => ({
  settingsApi: {
    get: vi.fn().mockResolvedValue({
      site_name: 'EventMaster Pro',
      site_logo: '',
      contact_email: 'admin@example.com',
      contact_phone: '1234567890',
      address: '测试地址',
      smtp_host: 'smtp.example.com',
      smtp_port: 587,
      smtp_username: 'test@example.com',
      smtp_password: '',
      smtp_from_email: 'noreply@example.com',
      email_template: '',
    }),
    update: vi.fn().mockResolvedValue({ success: true }),
    testEmail: vi.fn().mockResolvedValue({ message: '测试邮件发送成功' }),
  },
}));

// Mock Toast
vi.mock('../shared/Toast', () => ({
  useToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  }),
}));

describe('Settings 页面', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('渲染测试', () => {
    it('应该渲染页面标题', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText('网站设置')).toBeInTheDocument();
      });
    });

    it('应该渲染保存按钮', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText('保存设置')).toBeInTheDocument();
      });
    });

    it('应该渲染基础信息卡片', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText('基础信息')).toBeInTheDocument();
      });
    });

    it('应该渲染邮件服务设置卡片', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText('邮件服务设置')).toBeInTheDocument();
      });
    });
  });

  describe('表单交互测试', () => {
    it('应该能够修改网站名称', async () => {
      render(<Settings />);

      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('EventMaster Pro');
        fireEvent.change(nameInput, { target: { value: '新网站名称' } });
      });
    });

    it('应该能够修改联系邮箱', async () => {
      render(<Settings />);

      await waitFor(() => {
        const emailInput = screen.getByDisplayValue('admin@example.com');
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
      });
    });

    it('应该能够修改 SMTP 服务器', async () => {
      render(<Settings />);

      await waitFor(() => {
        const smtpInput = screen.getByDisplayValue('smtp.example.com');
        fireEvent.change(smtpInput, { target: { value: 'smtp.new.com' } });
      });
    });
  });

  describe('按钮测试', () => {
    it('点击保存设置应该调用 update API', async () => {
      const { settingsApi } = await import('../services/authApi');

      render(<Settings />);

      await waitFor(() => {
        const saveButton = screen.getByText('保存设置');
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(settingsApi.update).toHaveBeenCalled();
      });
    });

    it('点击测试邮件按钮应该调用 testEmail API', async () => {
      const { settingsApi } = await import('../services/authApi');

      render(<Settings />);

      await waitFor(() => {
        const testButton = screen.getByText('测试邮件');
        fireEvent.click(testButton);
      });

      await waitFor(() => {
        expect(settingsApi.testEmail).toHaveBeenCalled();
      });
    });
  });

  describe('边界测试', () => {
    it('应该渲染所有表单字段', async () => {
      render(<Settings />);

      await waitFor(() => {
        expect(screen.getByText('网站名称')).toBeInTheDocument();
        expect(screen.getByText('联系邮箱')).toBeInTheDocument();
        expect(screen.getByText('SMTP 服务器')).toBeInTheDocument();
      });
    });
  });
});
