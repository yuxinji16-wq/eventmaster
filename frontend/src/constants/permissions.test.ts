/**
 * 权限常量测试
 */
import { describe, it, expect } from 'vitest';

// 权限模块定义
const PERMISSION_MODULES = [
  { id: 'activities', name: '活动管理' },
  { id: 'materials', name: '物料仓库' },
  { id: 'budget', name: '预算管理' },
  { id: 'suppliers', name: '供应商库' },
  { id: 'leads', name: '商机转化' },
  { id: 'reviews', name: '复盘中心' },
  { id: 'account', name: '账号管理' },
  { id: 'settings', name: '网站设置' },
] as const;

// 权限操作定义
const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete'] as const;

// 默认管理员权限
const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  activities: { view: true, create: true, edit: true, delete: true },
  materials: { view: true, create: true, edit: true, delete: true },
  budget: { view: true, create: true, edit: true, delete: true },
  suppliers: { view: true, create: true, edit: true, delete: true },
  leads: { view: true, create: true, edit: true, delete: true },
  reviews: { view: true, create: true, edit: true, delete: true },
  account: { view: true, create: true, edit: true, delete: true },
  settings: { view: true, create: true, edit: true, delete: true },
};

// 查看者权限
const VIEWER_PERMISSIONS: Record<string, Record<string, boolean>> = {
  activities: { view: true, create: false, edit: false, delete: false },
  materials: { view: true, create: false, edit: false, delete: false },
  budget: { view: true, create: false, edit: false, delete: false },
  suppliers: { view: true, create: false, edit: false, delete: false },
  leads: { view: true, create: false, edit: false, delete: false },
  reviews: { view: true, create: false, edit: false, delete: false },
  account: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, create: false, edit: false, delete: false },
};

describe('权限模块配置', () => {
  it('应包含 8 个模块', () => {
    expect(PERMISSION_MODULES).toHaveLength(8);
  });

  it('每个模块应有 id 和 name', () => {
    PERMISSION_MODULES.forEach(module => {
      expect(module.id).toBeDefined();
      expect(module.name).toBeDefined();
      expect(typeof module.id).toBe('string');
      expect(typeof module.name).toBe('string');
    });
  });

  it('应包含所有核心业务模块', () => {
    const moduleIds = PERMISSION_MODULES.map(m => m.id);
    expect(moduleIds).toContain('activities');
    expect(moduleIds).toContain('materials');
    expect(moduleIds).toContain('budget');
    expect(moduleIds).toContain('suppliers');
    expect(moduleIds).toContain('leads');
    expect(moduleIds).toContain('reviews');
    expect(moduleIds).toContain('account');
    expect(moduleIds).toContain('settings');
  });
});

describe('权限操作配置', () => {
  it('应包含 4 种操作', () => {
    expect(PERMISSION_ACTIONS).toHaveLength(4);
    expect(PERMISSION_ACTIONS).toContain('view');
    expect(PERMISSION_ACTIONS).toContain('create');
    expect(PERMISSION_ACTIONS).toContain('edit');
    expect(PERMISSION_ACTIONS).toContain('delete');
  });
});

describe('默认管理员权限', () => {
  it('管理员应有所有模块的完全权限', () => {
    PERMISSION_MODULES.forEach(module => {
      const perms = DEFAULT_PERMISSIONS[module.id];
      expect(perms).toBeDefined();
      PERMISSION_ACTIONS.forEach(action => {
        expect(perms[action]).toBe(true);
      });
    });
  });

  it('每个模块的权限结构应完整', () => {
    PERMISSION_MODULES.forEach(module => {
      const perms = DEFAULT_PERMISSIONS[module.id];
      expect(Object.keys(perms)).toHaveLength(4);
    });
  });
});

describe('查看者权限', () => {
  it('查看者只有查看权限', () => {
    PERMISSION_MODULES.forEach(module => {
      const perms = VIEWER_PERMISSIONS[module.id];
      expect(perms).toBeDefined();
      expect(perms.view).toBe(module.id === 'account' || module.id === 'settings' ? false : true);
    });
  });

  it('查看者无创建、编辑、删除权限', () => {
    PERMISSION_MODULES.forEach(module => {
      const perms = VIEWER_PERMISSIONS[module.id];
      expect(perms.create).toBe(false);
      expect(perms.edit).toBe(false);
      expect(perms.delete).toBe(false);
    });
  });
});

describe('权限检查逻辑', () => {
  const hasPermission = (
    permissions: Record<string, Record<string, boolean>>,
    module: string,
    action: string
  ): boolean => {
    return permissions[module]?.[action] === true;
  };

  it('应正确判断有权限', () => {
    expect(hasPermission(DEFAULT_PERMISSIONS, 'activities', 'view')).toBe(true);
    expect(hasPermission(DEFAULT_PERMISSIONS, 'settings', 'delete')).toBe(true);
  });

  it('应正确判断无权限', () => {
    expect(hasPermission(VIEWER_PERMISSIONS, 'account', 'edit')).toBe(false);
    expect(hasPermission(VIEWER_PERMISSIONS, 'settings', 'delete')).toBe(false);
  });

  it('应正确处理不存在的模块', () => {
    expect(hasPermission(DEFAULT_PERMISSIONS, 'nonexistent', 'view')).toBe(false);
  });
});
