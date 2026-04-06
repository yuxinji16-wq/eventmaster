/**
 * 认证 API 类型测试
 */
import { describe, it, expect } from 'vitest';
import {
  LoginRequest,
  LoginResponse,
  User,
  Role,
  PermissionInfo,
} from '../services/authApi';

describe('LoginRequest 接口', () => {
  it('应包含 username 和 password 字段', () => {
    const loginRequest: LoginRequest = {
      username: 'testuser',
      password: 'test123',
    };
    expect(loginRequest.username).toBe('testuser');
    expect(loginRequest.password).toBe('test123');
  });
});

describe('LoginResponse 接口', () => {
  it('应包含 access_token, token_type 和 user 字段', () => {
    const loginResponse: LoginResponse = {
      access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
      token_type: 'bearer',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        is_active: true,
        is_superadmin: false,
        role_id: null,
      },
    };
    expect(loginResponse.access_token).toBeDefined();
    expect(loginResponse.token_type).toBe('bearer');
    expect(loginResponse.user.username).toBe('testuser');
  });
});

describe('User 接口', () => {
  it('应包含所有必要字段', () => {
    const user: User = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      is_active: true,
      is_superadmin: true,
      role_id: null,
      created_at: '2026-04-06T12:00:00Z',
    };
    expect(user.id).toBe(1);
    expect(user.username).toBe('admin');
    expect(user.is_superadmin).toBe(true);
  });

  it('应支持可选的 updated_at 字段', () => {
    const user: User = {
      id: 1,
      username: 'admin',
      email: 'admin@example.com',
      is_active: true,
      is_superadmin: false,
      role_id: 1,
      created_at: '2026-04-06T12:00:00Z',
      updated_at: '2026-04-06T13:00:00Z',
    };
    expect(user.updated_at).toBe('2026-04-06T13:00:00Z');
  });
});

describe('Role 接口', () => {
  it('应包含权限矩阵结构', () => {
    const role: Role = {
      id: 1,
      name: '管理员',
      description: '系统管理员',
      permissions: {
        activities: { view: true, create: true, edit: true, delete: true },
        materials: { view: true, create: true, edit: true, delete: true },
        budget: { view: true, create: true, edit: true, delete: true },
        suppliers: { view: true, create: true, edit: true, delete: true },
        leads: { view: true, create: true, edit: true, delete: true },
        reviews: { view: true, create: true, edit: true, delete: true },
        account: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
      },
      is_default: false,
    };
    expect(role.permissions.activities.view).toBe(true);
    expect(role.permissions.settings.delete).toBe(true);
  });

  it('应支持 is_default 字段', () => {
    const viewerRole: Role = {
      id: 2,
      name: '查看者',
      description: '只读用户',
      permissions: {
        activities: { view: true, create: false, edit: false, delete: false },
        materials: { view: true, create: false, edit: false, delete: false },
        budget: { view: true, create: false, edit: false, delete: false },
        suppliers: { view: true, create: false, edit: false, delete: false },
        leads: { view: true, create: false, edit: false, delete: false },
        reviews: { view: true, create: false, edit: false, delete: false },
        account: { view: false, create: false, edit: false, delete: false },
        settings: { view: false, create: false, edit: false, delete: false },
      },
      is_default: true,
    };
    expect(viewerRole.is_default).toBe(true);
    expect(viewerRole.permissions.account.view).toBe(false);
  });
});

describe('PermissionInfo 接口', () => {
  it('应包含完整的权限信息', () => {
    const perms: PermissionInfo = {
      user_id: 1,
      username: 'admin',
      role_id: 1,
      role_name: '管理员',
      permissions: {
        activities: { view: true, create: true, edit: true, delete: true },
        materials: { view: true, create: true, edit: true, delete: true },
        budget: { view: true, create: true, edit: true, delete: true },
        suppliers: { view: true, create: true, edit: true, delete: true },
        leads: { view: true, create: true, edit: true, delete: true },
        reviews: { view: true, create: true, edit: true, delete: true },
        account: { view: true, create: true, edit: true, delete: true },
        settings: { view: true, create: true, edit: true, delete: true },
      },
      is_superadmin: true,
    };
    expect(perms.user_id).toBe(1);
    expect(perms.role_name).toBe('管理员');
    expect(perms.is_superadmin).toBe(true);
  });

  it('应支持无角色情况', () => {
    const perms: PermissionInfo = {
      user_id: 2,
      username: 'newuser',
      role_id: null,
      role_name: null,
      permissions: {},
      is_superadmin: false,
    };
    expect(perms.role_id).toBeNull();
    expect(perms.role_name).toBeNull();
  });
});
