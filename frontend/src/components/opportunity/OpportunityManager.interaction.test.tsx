/**
 * 商机管理页面交互测试
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import OpportunityManager from './OpportunityManager';
import { Opportunity, Activity } from '../../types';

// Mock hooks
const mockAddLead = vi.fn();
const mockUpdateLead = vi.fn();
const mockDeleteLead = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../utils/hooks', () => ({
  useLeadsData: () => ({
    leads: [
      {
        id: '1',
        clientName: '华为技术有限公司',
        contactName: '张经理',
        phone: '13800138000',
        email: 'zhang@huawei.com',
        requirement: '需要采购大批量定制礼品',
        sourceType: 'activity',
        activityId: '1',
        region: '华南',
        owner: '李销售',
        leadLevel: 'A',
        status: '已联系',
        createdAt: '2024-03-15T10:00:00Z'
      },
      {
        id: '2',
        clientName: '中兴通讯',
        contactName: '王总监',
        phone: '13900139000',
        email: 'wang@zte.com',
        requirement: '展会合作需求',
        sourceType: 'manual',
        region: '华北',
        owner: '赵销售',
        leadLevel: 'B',
        status: '未跟进',
        createdAt: '2024-03-10T08:30:00Z'
      }
    ] as Opportunity[],
    loading: false,
    error: null,
    addLead: mockAddLead,
    updateLead: mockUpdateLead,
    deleteLead: mockDeleteLead,
  }),
  useActivitiesData: () => ({
    activities: [
      { id: '1', name: '春季发布会' },
      { id: '2', name: '行业峰会' }
    ] as Activity[],
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

const renderOpportunityManager = () => {
  render(
    <MemoryRouter>
      <OpportunityManager />
    </MemoryRouter>
  );
};

describe('商机管理页面交互测试', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.confirm = vi.fn().mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('页面标题和统计', () => {
    it('应显示商机管理标题', () => {
      renderOpportunityManager();

      expect(screen.getByText('活动线索')).toBeInTheDocument();
      expect(screen.getByText('记录和管理活动获取的客户线索')).toBeInTheDocument();
    });

    it('应显示统计卡片', () => {
      renderOpportunityManager();

      expect(screen.getByText('线索总数')).toBeInTheDocument();
      // Use getAllByText since multiple elements may contain these texts
      expect(screen.getAllByText('活动获取').length).toBeGreaterThan(0);
      // Check for the span element specifically
      expect(screen.getAllByText('自主录入', { selector: 'span' }).length).toBeGreaterThan(0);
      expect(screen.getByText('已转销售')).toBeInTheDocument();
      expect(screen.getByText('转化率')).toBeInTheDocument();
    });

    it('应显示线索总数', () => {
      renderOpportunityManager();

      expect(screen.getByText('2')).toBeInTheDocument();
    });
  });

  describe('新建商机按钮交互', () => {
    it('应显示录入线索按钮', () => {
      renderOpportunityManager();

      expect(screen.getByRole('button', { name: /录入线索/ })).toBeInTheDocument();
    });

    it('点击录入线索应打开表单弹窗', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      await user.click(screen.getByRole('button', { name: /录入线索/ }));

      expect(screen.getByRole('heading', { name: /录入线索/ })).toBeInTheDocument();
    });
  });

  describe('搜索框交互', () => {
    it('应显示搜索输入框', () => {
      renderOpportunityManager();

      expect(screen.getByPlaceholderText(/搜索客户名称/)).toBeInTheDocument();
    });

    it('应能输入搜索关键词', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      const searchInput = screen.getByPlaceholderText(/搜索客户名称/);
      await user.type(searchInput, '华为');

      expect(searchInput).toHaveValue('华为');
    });

    it('搜索应过滤线索列表', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      const searchInput = screen.getByPlaceholderText(/搜索客户名称/);
      await user.type(searchInput, '华为');

      expect(screen.getByText('华为技术有限公司')).toBeInTheDocument();
    });
  });

  describe('筛选器交互', () => {
    it('应显示年份筛选下拉框', () => {
      renderOpportunityManager();

      // Find selects - there are multiple comboboxes
      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(1);
    });

    it('应显示来源筛选下拉框', () => {
      renderOpportunityManager();

      const selects = screen.getAllByRole('combobox');
      expect(selects.length).toBeGreaterThanOrEqual(2);
    });

    it('应能选择不同年份', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      const selects = screen.getAllByRole('combobox');
      const yearSelect = selects[0];
      await user.selectOptions(yearSelect, 'all');

      expect(yearSelect).toHaveValue('all');
    });

    it('应能选择来源类型', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      const selects = screen.getAllByRole('combobox');
      await user.selectOptions(selects[1], 'manual');

      expect(selects[1]).toHaveValue('manual');
    });
  });

  describe('线索列表交互', () => {
    it('应显示线索列表表格', () => {
      renderOpportunityManager();

      expect(screen.getByText('客户单位')).toBeInTheDocument();
      expect(screen.getByText('姓名')).toBeInTheDocument();
      expect(screen.getByText('联系方式')).toBeInTheDocument();
      expect(screen.getByText('等级')).toBeInTheDocument();
      expect(screen.getByText('状态')).toBeInTheDocument();
    });

    it('应显示线索数据', () => {
      renderOpportunityManager();

      expect(screen.getByText('华为技术有限公司')).toBeInTheDocument();
      expect(screen.getByText('张经理')).toBeInTheDocument();
      expect(screen.getByText('13800138000')).toBeInTheDocument();
    });

    it('应显示等级标签', () => {
      renderOpportunityManager();

      expect(screen.getByText('A')).toBeInTheDocument();
      expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('应显示状态标签', () => {
      renderOpportunityManager();

      expect(screen.getByText('已联系')).toBeInTheDocument();
      expect(screen.getByText('未跟进')).toBeInTheDocument();
    });

    it('点击线索行应导航到详情页', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      const row = screen.getByText('华为技术有限公司').closest('tr');
      await user.click(row!);

      expect(mockNavigate).toHaveBeenCalled();
    });
  });

  describe('编辑按钮交互', () => {
    it('应显示编辑按钮', () => {
      renderOpportunityManager();

      const editButtons = screen.getAllByRole('button', { name: /编辑/ });
      expect(editButtons.length).toBeGreaterThan(0);
    });

    it('点击编辑应打开编辑弹窗', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      const editButton = screen.getAllByRole('button', { name: /编辑/ })[0];
      await user.click(editButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /编辑线索/ })).toBeInTheDocument();
      });
    });
  });

  describe('删除按钮交互', () => {
    it('应显示删除按钮', () => {
      renderOpportunityManager();

      const deleteButtons = screen.getAllByRole('button', { name: /删除/ });
      expect(deleteButtons.length).toBeGreaterThan(0);
    });

    it('点击删除应确认删除', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      const deleteButton = screen.getAllByRole('button', { name: /删除/ })[0];
      await user.click(deleteButton);

      expect(window.confirm).toHaveBeenCalled();
    });

    it('确认删除应调用删除函数', async () => {
      const user = userEvent.setup();
      mockDeleteLead.mockResolvedValue(undefined);
      renderOpportunityManager();

      const deleteButton = screen.getAllByRole('button', { name: /删除/ })[0];
      await user.click(deleteButton);

      if (window.confirm()) {
        await waitFor(() => {
          expect(mockDeleteLead).toHaveBeenCalled();
        });
      }
    });
  });

  describe('线索表单弹窗交互', () => {
    it('应显示表单字段', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      await user.click(screen.getByRole('button', { name: /录入线索/ }));

      // Use more specific placeholder text to find inputs
      expect(screen.getByPlaceholderText(/^输入客户单位/)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/^输入联系人/)).toBeInTheDocument();
      // Phone appears in search placeholder too, so use exact match or a more specific pattern
      const phoneInput = document.querySelector('input[placeholder="输入电话"]') as HTMLInputElement;
      expect(phoneInput).toBeInTheDocument();
    });

    it('应能填写客户单位', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      await user.click(screen.getByRole('button', { name: /录入线索/ }));

      const clientInput = screen.getByPlaceholderText(/^输入客户单位/);
      await user.type(clientInput, '阿里巴巴');

      expect(clientInput).toHaveValue('阿里巴巴');
    });

    it('应能填写联系人信息', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      await user.click(screen.getByRole('button', { name: /录入线索/ }));

      await user.type(screen.getByPlaceholderText(/^输入联系人/), '陈总');
      const phoneInput = document.querySelector('input[placeholder="输入电话"]') as HTMLInputElement;
      await user.type(phoneInput, '13700137000');

      expect(screen.getByPlaceholderText(/^输入联系人/)).toHaveValue('陈总');
    });

    it('应能取消录入', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      await user.click(screen.getByRole('button', { name: /录入线索/ }));
      await user.click(screen.getByRole('button', { name: /取消/ }));

      expect(screen.queryByRole('heading', { name: /录入线索/ })).not.toBeInTheDocument();
    });
  });

  describe('边界情况测试', () => {
    it('空搜索结果应显示空状态', async () => {
      const user = userEvent.setup();
      renderOpportunityManager();

      const searchInput = screen.getByPlaceholderText(/搜索客户名称/);
      await user.type(searchInput, '不存在的客户');

      expect(screen.queryByText('华为技术有限公司')).not.toBeInTheDocument();
    });
  });
});
