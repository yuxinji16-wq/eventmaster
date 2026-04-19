/**
 * 权限管理页面
 */
import React, { useState, useEffect } from 'react';
import { Shield, Plus, Edit2, Trash2, X, Loader2, AlertTriangle } from 'lucide-react';
import { roleApi, Role } from '../services/authApi';
import { useToast } from '../shared/Toast';

const MODULES = [
  { id: 'activities', name: '活动管理' },
  { id: 'materials', name: '物料仓库' },
  { id: 'budget', name: '预算管理' },
  { id: 'suppliers', name: '供应商库' },
  { id: 'leads', name: '商机转化' },
  { id: 'reviews', name: '复盘中心' },
  { id: 'account', name: '账号管理' },
  { id: 'settings', name: '网站设置' },
];

const ACTIONS = [
  { id: 'view', name: '查看' },
  { id: 'create', name: '创建' },
  { id: 'edit', name: '编辑' },
  { id: 'delete', name: '删除' },
] as const;

const DEFAULT_PERMISSIONS: Record<string, Record<string, boolean>> = {
  activities: { view: false, create: false, edit: false, delete: false },
  materials: { view: false, create: false, edit: false, delete: false },
  budget: { view: false, create: false, edit: false, delete: false },
  suppliers: { view: false, create: false, edit: false, delete: false },
  leads: { view: false, create: false, edit: false, delete: false },
  reviews: { view: false, create: false, edit: false, delete: false },
  account: { view: false, create: false, edit: false, delete: false },
  settings: { view: false, create: false, edit: false, delete: false },
};

interface RoleFormData {
  name: string;
  description: string;
  permissions: Record<string, Record<string, boolean>>;
}

const Permissions: React.FC = () => {
  const toast = useToast();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<RoleFormData>({
    name: '',
    description: '',
    permissions: { ...DEFAULT_PERMISSIONS },
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const rolesData = await roleApi.getList();
      setRoles(rolesData);
    } catch (err) {
      console.error('Failed to load roles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingRole(null);
    setFormData({
      name: '',
      description: '',
      permissions: JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)),
    });
    setError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (role: Role) => {
    setEditingRole(role);
    setFormData({
      name: role.name,
      description: role.description || '',
      permissions: role.permissions ? JSON.parse(JSON.stringify(role.permissions)) : JSON.parse(JSON.stringify(DEFAULT_PERMISSIONS)),
    });
    setError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingRole(null);
    setError(null);
  };

  const togglePermission = (moduleId: string, action: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [moduleId]: {
          ...prev.permissions[moduleId],
          [action]: !prev.permissions[moduleId][action],
        },
      },
    }));
  };

  // 按列全选/取消：切换某一操作权限在所有模块上的状态
  const toggleColumnPermission = (action: string) => {
    const currentColumnValues = MODULES.map(m => formData.permissions[m.id]?.[action] ?? false);
    const allChecked = currentColumnValues.every(v => v);
    const newValue = !allChecked;
    setFormData(prev => {
      const updatedPermissions = { ...prev.permissions };
      MODULES.forEach(m => {
        updatedPermissions[m.id] = {
          ...updatedPermissions[m.id],
          [action]: newValue,
        };
      });
      return { ...prev, permissions: updatedPermissions };
    });
  };

  // 判断某列是否已全部勾选
  const isColumnAllChecked = (action: string) => {
    return MODULES.every(m => formData.permissions[m.id]?.[action] === true);
  };

  // 判断某列是否已全部取消
  const isColumnAllUnchecked = (action: string) => {
    return MODULES.every(m => formData.permissions[m.id]?.[action] === false);
  };

  // 获取列复选框状态：'all' | 'none' | 'indeterminate'
  const getColumnState = (action: string): 'all' | 'none' | 'indeterminate' => {
    if (isColumnAllChecked(action)) return 'all';
    if (isColumnAllUnchecked(action)) return 'none';
    return 'indeterminate';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('角色名称不能为空');
      return;
    }

    setIsSaving(true);
    try {
      if (editingRole) {
        await roleApi.update(editingRole.id, {
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
      } else {
        await roleApi.create({
          name: formData.name,
          description: formData.description,
          permissions: formData.permissions,
        });
      }
      await loadData();
      closeModal();
    } catch (err: any) {
      setError(err.message || (editingRole ? '更新失败' : '创建失败'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除此角色吗？')) return;
    try {
      await roleApi.delete(id);
      setRoles(roles.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error('删除失败', err.message || '删除角色失败');
    }
  };

  const getPermissionBadge = (perms: Record<string, Record<string, boolean>> | undefined, module: string, action: string) => {
    if (!perms || !perms[module]) return <span className="text-slate-300">-</span>;
    return perms[module][action]
      ? <span className="w-6 h-6 bg-emerald-500 text-white rounded flex items-center justify-center text-xs">✓</span>
      : <span className="w-6 h-6 bg-slate-200 text-slate-400 rounded flex items-center justify-center text-xs">✗</span>;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">权限管理</h1>
          <p className="text-sm text-slate-500 mt-1">管理角色和模块权限</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all"
        >
          <Plus size={18} /> 添加角色
        </button>
      </div>

      {/* 权限矩阵 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-left text-xs font-black text-slate-400 uppercase w-40">角色</th>
                {MODULES.map(m => (
                  <th key={m.id} className="px-4 py-4 text-center text-xs font-black text-slate-400 uppercase min-w-[100px]">
                    {m.name}
                  </th>
                ))}
                <th className="px-6 py-4 text-right text-xs font-black text-slate-400 uppercase w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {roles.map(role => (
                <tr key={role.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Shield size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-slate-700">{role.name}</p>
                        <p className="text-xs text-slate-400">{role.description || '无描述'}</p>
                      </div>
                    </div>
                  </td>
                  {MODULES.map(m => (
                    <td key={m.id} className="px-4 py-4">
                      <div className="flex items-center justify-center gap-1">
                        {ACTIONS.map(action => (
                          <span key={action.id} title={`${action.name}`}>
                            {getPermissionBadge(role.permissions, m.id, action.id)}
                          </span>
                        ))}
                      </div>
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(role)}
                        className="p-2 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600"
                      >
                        <Edit2 size={16} />
                      </button>
                      {!role.is_default && (
                        <button
                          onClick={() => handleDelete(role.id)}
                          className="p-2 hover:bg-rose-50 rounded-lg text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {roles.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={MODULES.length + 2} className="px-6 py-12 text-center text-slate-400">
                    暂无角色数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        )}
      </div>

      {/* 权限说明 */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <h3 className="font-bold text-slate-700 mb-4">权限说明</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          {ACTIONS.map(action => (
            <div key={action.id} className="flex items-center gap-2">
              <span className="w-6 h-6 bg-emerald-500 text-white rounded flex items-center justify-center text-xs">✓</span>
              <span className="text-slate-600">{action.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 添加/编辑角色弹窗 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl mx-4">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <h2 className="text-lg font-bold text-slate-800">
                {editingRole ? '编辑角色' : '添加角色'}
              </h2>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {error && (
                <div className="px-4 py-3 bg-rose-50 text-rose-600 rounded-xl text-sm font-bold">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">角色名称</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                    placeholder="如：运营主管"
                  />
                </div>
                <div>
                  <label className="text-sm font-bold text-slate-600 block mb-2">角色描述</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2.5 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
                    placeholder="简要描述角色职责"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle size={16} className="text-amber-500" />
                  <span className="text-sm font-bold text-slate-600">权限配置</span>
                </div>
                <div className="border-2 border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-slate-50">
                        <th className="px-4 py-3 text-left text-xs font-black text-slate-400 uppercase w-32">模块</th>
                        {ACTIONS.map(action => (
                          <th key={action.id} className="px-4 py-3 text-center text-xs font-black text-slate-400 uppercase">
                            <button
                              type="button"
                              onClick={() => toggleColumnPermission(action.id)}
                              title={`按列全选 ${action.name}`}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto transition-all ${
                                getColumnState(action.id) === 'all'
                                  ? 'bg-indigo-600 text-white'
                                  : getColumnState(action.id) === 'indeterminate'
                                  ? 'bg-indigo-300 text-white'
                                  : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                              }`}
                            >
                              {getColumnState(action.id) === 'all' ? '✓' : getColumnState(action.id) === 'indeterminate' ? '⚟' : '✗'}
                            </button>
                          </th>
                        ))}
                      </tr>
                      <tr className="bg-slate-100 border-t border-slate-200">
                        <td className="px-4 py-2"></td>
                        {ACTIONS.map(action => (
                          <td key={action.id} className="px-4 py-2 text-center text-xs font-bold text-slate-500">
                            {action.name}
                          </td>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MODULES.map(module => (
                        <tr key={module.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-bold text-slate-700">{module.name}</td>
                          {ACTIONS.map(action => (
                            <td key={action.id} className="px-4 py-3 text-center">
                              <button
                                type="button"
                                onClick={() => togglePermission(module.id, action.id)}
                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all mx-auto ${
                                  formData.permissions[module.id]?.[action.id]
                                    ? 'bg-emerald-500 text-white shadow-md'
                                    : 'bg-slate-200 text-slate-400 hover:bg-slate-300'
                                }`}
                              >
                                {formData.permissions[module.id]?.[action.id] ? '✓' : '✗'}
                              </button>
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
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
                  {isSaving ? '保存中...' : (editingRole ? '更新' : '创建')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Permissions;
