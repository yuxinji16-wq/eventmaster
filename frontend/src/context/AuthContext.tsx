/**
 * 认证状态管理
 */
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, userApi, LoginResponse, User, PermissionInfo } from '../services/authApi';

interface AuthContextType {
  user: User | null;
  permissions: PermissionInfo | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string, action: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'auth_token';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<PermissionInfo | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY));
  const [isLoading, setIsLoading] = useState(true);

  // 加载当前用户信息
  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.getCurrentUser();
        setUser(userData);

        const perms = await userApi.getMyPermissions();
        setPermissions(perms);
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem(TOKEN_KEY);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = useCallback(async (username: string, password: string) => {
    const response = await authApi.login({ username, password });
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);
    setUser(response.user);

    const perms = await userApi.getMyPermissions();
    setPermissions(perms);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
    setPermissions(null);
  }, []);

  const hasPermission = useCallback((module: string, action: string): boolean => {
    // 超级管理员拥有所有权限
    if (user?.is_superadmin) return true;

    // 无权限信息时默认拒绝
    if (!permissions) return false;

    const modulePerms = permissions.permissions[module];
    if (!modulePerms) return false;

    return modulePerms[action] === true;
  }, [user, permissions]);

  return (
    <AuthContext.Provider value={{
      user,
      permissions,
      token,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout,
      hasPermission,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
