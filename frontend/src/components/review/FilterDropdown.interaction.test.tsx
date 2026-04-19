/**
 * FilterDropdown 组件交互测试
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import FilterDropdown from './FilterDropdown';

describe('FilterDropdown 组件', () => {
  const mockOptions = [
    { label: '全部', value: 'all' },
    { label: '已完成', value: 'completed' },
    { label: '进行中', value: 'in_progress' },
    { label: '未开始', value: 'pending' },
  ];

  describe('渲染测试', () => {
    it('应该渲染下拉选择框', () => {
      render(
        <FilterDropdown
          value="all"
          onChange={vi.fn()}
          options={mockOptions}
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('应该显示所有选项', () => {
      render(
        <FilterDropdown
          value="all"
          onChange={vi.fn()}
          options={mockOptions}
        />
      );
      expect(screen.getByText('全部')).toBeInTheDocument();
      expect(screen.getByText('已完成')).toBeInTheDocument();
      expect(screen.getByText('进行中')).toBeInTheDocument();
      expect(screen.getByText('未开始')).toBeInTheDocument();
    });

    it('应该显示 ChevronDown 图标', () => {
      render(
        <FilterDropdown
          value="all"
          onChange={vi.fn()}
          options={mockOptions}
        />
      );
      const chevrons = document.querySelectorAll('svg');
      expect(chevrons.length).toBeGreaterThan(0);
    });
  });

  describe('交互测试', () => {
    it('选择改变时应该调用 onChange', () => {
      const onChange = vi.fn();
      render(
        <FilterDropdown
          value="all"
          onChange={onChange}
          options={mockOptions}
        />
      );

      const select = screen.getByRole('combobox');
      fireEvent.change(select, { target: { value: 'completed' } });

      expect(onChange).toHaveBeenCalledWith('completed');
    });

    it('初始值应该正确显示', () => {
      render(
        <FilterDropdown
          value="completed"
          onChange={vi.fn()}
          options={mockOptions}
        />
      );

      const select = screen.getByRole('combobox') as HTMLSelectElement;
      expect(select.value).toBe('completed');
    });
  });

  describe('边界测试', () => {
    it('空选项列表应该正常渲染', () => {
      render(
        <FilterDropdown
          value=""
          onChange={vi.fn()}
          options={[]}
        />
      );
      const select = screen.getByRole('combobox');
      expect(select).toBeInTheDocument();
    });

    it('单个选项应该正常渲染', () => {
      render(
        <FilterDropdown
          value="only"
          onChange={vi.fn()}
          options={[{ label: '唯一选项', value: 'only' }]}
        />
      );
      expect(screen.getByText('唯一选项')).toBeInTheDocument();
    });
  });
});
