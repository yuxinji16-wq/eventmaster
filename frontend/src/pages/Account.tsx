/**
 * 账号管理页面
 */
import React, { useState, useEffect } from 'react';
import { User, Plus, Edit2, Trash2, Shield, X, Loader2 } from 'lucide-react';
import { userApi, roleApi, User as UserType, Role } from '../services/authApi';

interface UserFormData {
  username: string;
  email: string;
  password: string;
  role_id: number | null;
  is_active: boolean;
}

const Account: React.FC = () => {
  const [users, setUsers] = useState<UserType[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    password: '',
    role_id: null,
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [usersData, rolesData] = await Promise.all([
        userApi.getList(),
        roleApi.getList(),
      ]);
      setUsers(usersData);
      setRoles(rolesData);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role_id: null,
      is_active: true,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (user: UserType) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role_id: user.role_id,
      is_active: user.is_active,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.username.trim()) {
      setError('用户名不能为空');
      return;
    }
    if (!formData.email.trim()) {
      setError('邮箱不能为空');
      return;
    }
    if (!editingUser && !formData.password.trim()) {
      setError('密码不能为空');
      return;
    }

    setIsSaving(true);
    try {
      if (editingUser) {
        const updateData: Partial<UserFormData> = {
          username: formData.username,
          email: formData.email,
          role_id: formData.role_id,
          is_active: formData.is_active,
        };
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        await userApi.update(editingUser.id, updateData);
      } else {
        await userApi.create({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role_id: formData.role_id || undefined,
        });
      }
      await loadData();
      closeModal();
    } catch (err: any) {
      setError(err.message || (editingUser ? '更新失败' : '创建失败'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此用户吗？')) return;
    try {
      await userApi.delete(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (err) {
      console.error('Failed to delete user:', err);
      alert('删除失败');
    }
  };

  const getRoleName = (roleId: number | null) => {
    if (!roleId) return '无角色';
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : `角色${roleId}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">账号管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理系统用户账号</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> 添加用户
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">用户名</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">邮箱</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">角色</th>
              <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase">状态</th>
              <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {users.map(user => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <User size={18} className="text-indigo-600" />
                    </div>
                    <span className="font-bold text-slate-700">{user.username}</span>
                    {user.is_superadmin && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs font-bold">超级管理员</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-slate-600">{user.email}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold">
                    {user.is_superadmin ? '超级管理员' : getRoleName(user.role_id)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-lg text-sm font-bold ${user.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                    {user.is_active ? '活跃' : '禁用'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!user.is_superadmin && (
                      <>
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && !isLoading && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  暂无用户数据
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {/* 添加/编辑用户弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingUser ? '编辑用户' : '添加用户'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {error && (
                <div className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold">
                  {error}
                </div>
              )}

              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">用户名</label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                  placeholder="请输入用户名"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">邮箱</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                  placeholder="请输入邮箱"
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">
                  密码 {editingUser && <span className="text-slate-400 font-normal">(留空则不修改)</span>}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                  placeholder={editingUser ? '输入新密码可修改' : '请输入密码'}
                />
              </div>

              <div>
                <label className="text-sm font-bold text-slate-600 block mb-2">角色</label>
                <select
                  value={formData.role_id || ''}
                  onChange={(e) => setFormData({ ...formData, role_id: e.target.value ? Number(e.target.value) : null })}
                  className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                >
                  <option value="">无角色</option>
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name}</option>
                  ))}
                </select>
              </div>

              {editingUser && (
                <div className="flex items-center gap-3">
                  <label className="text-sm font-bold text-slate-600">账号状态</label>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, is_active: !formData.is_active })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      formData.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                        formData.is_active ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                  <span className="text-sm text-slate-600">
                    {formData.is_active ? '启用' : '禁用'}
                  </span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-all"
                >
                  取消
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-2.5 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
                >
                  {isSaving ? '保存中...' : (editingUser ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Account;
