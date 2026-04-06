/**
 * 认证 API 服务
 */
import { request } from './backendApi';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    username: string;
    email: string;
    is_active: boolean;
    is_superadmin: boolean;
    role_id: number | null;
  };
}

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superadmin: boolean;
  role_id: number | null;
  created_at: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Record<string, Record<string, boolean>>;
  is_default: boolean;
}

export interface PermissionInfo {
  user_id: number;
  username: string;
  role_id: number | null;
  role_name: string | null;
  permissions: Record<string, Record<string, boolean>>;
  is_superadmin: boolean;
}

export const authApi = {
  login: (data: LoginRequest) =>
    request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getCurrentUser: () =>
    request<User>('/auth/me'),

  register: (data: { username: string; email: string; password: string }) =>
    request<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const userApi = {
  getList: () =>
    request<User[]>('/users'),

  get: (id: number) =>
    request<User>(`/users/${id}`),

  create: (data: { username: string; email: string; password: string; role_id?: number }) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<{ username: string; email: string; password: string; role_id: number; is_active: boolean }>) =>
    request<User>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/users/${id}`, {
      method: 'DELETE',
    }),

  getMyPermissions: () =>
    request<PermissionInfo>('/users/permissions/me'),
};

export const roleApi = {
  getList: () =>
    request<Role[]>('/roles'),

  get: (id: number) =>
    request<Role>(`/roles/${id}`),

  create: (data: { name: string; description?: string; permissions?: Record<string, Record<string, boolean>> }) =>
    request<Role>('/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<{ name: string; description: string; permissions: Record<string, Record<string, boolean>> }>) =>
    request<Role>(`/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: number) =>
    request<{ message: string }>(`/roles/${id}`, {
      method: 'DELETE',
    }),
};

export const settingsApi = {
  get: () =>
    request<any>('/settings'),

  update: (data: any) =>
    request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  testEmail: (email: string) =>
    request<{ message: string }>('/settings/test-email', {
      method: 'POST',
      body: JSON.stringify({ test_email: email }),
    }),
};
