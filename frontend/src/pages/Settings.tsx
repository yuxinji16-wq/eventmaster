/**
 * 网站设置页面
 */
import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Mail, Globe, Save, Send } from 'lucide-react';
import { settingsApi } from '../services/authApi';
import { useToast } from '../shared/Toast';

interface SiteSettings {
  id?: number;
  site_name: string;
  site_logo: string;
  contact_email: string;
  contact_phone: string;
  address: string;
  smtp_host: string;
  smtp_port: number;
  smtp_username: string;
  smtp_password: string;
  smtp_from_email: string;
  email_template: string;
}

const Settings: React.FC = () => {
  const toast = useToast();
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: 'EventMaster Pro',
    site_logo: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    smtp_host: '',
    smtp_port: 587,
    smtp_username: '',
    smtp_password: '',
    smtp_from_email: '',
    email_template: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await settingsApi.get();
      setSettings(data);
    } catch (err) {
      console.error('Failed to load settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      await settingsApi.update(settings);
      setMessage({ type: 'success', text: '设置已保存' });
    } catch (err) {
      console.error('Failed to save settings:', err);
      setMessage({ type: 'error', text: '保存失败' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!settings.contact_email) {
      toast.warning('无法发送', '请先填写测试邮箱地址');
      return;
    }
    setIsTestingEmail(true);
    setMessage(null);
    try {
      const result = await settingsApi.testEmail(settings.contact_email);
      setMessage({ type: 'success', text: result.message });
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || '发送失败' });
    } finally {
      setIsTestingEmail(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-800">网站设置</h1>
          <p className="text-sm text-slate-500 mt-1">配置网站基本信息和邮件服务</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all disabled:opacity-50"
        >
          <Save size={18} /> {isSaving ? '保存中...' : '保存设置'}
        </button>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-xl text-sm font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* 基础信息 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe size={20} className="text-indigo-500" />
            <h2 className="font-bold text-slate-700">基础信息</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">网站名称</label>
              <input
                type="text"
                value={settings.site_name}
                onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">网站 Logo URL</label>
              <input
                type="text"
                value={settings.site_logo}
                onChange={(e) => setSettings({ ...settings, site_logo: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">联系邮箱</label>
              <input
                type="email"
                value={settings.contact_email}
                onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">联系电话</label>
              <input
                type="text"
                value={settings.contact_phone}
                onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">地址</label>
              <input
                type="text"
                value={settings.address}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 邮件设置 */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Mail size={20} className="text-indigo-500" />
              <h2 className="font-bold text-slate-700">邮件服务设置</h2>
            </div>
            <button
              onClick={handleTestEmail}
              disabled={isTestingEmail || !settings.smtp_host}
              className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-bold hover:bg-emerald-100 transition-all disabled:opacity-50"
            >
              <Send size={14} /> {isTestingEmail ? '发送中...' : '测试邮件'}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">SMTP 服务器</label>
              <input
                type="text"
                value={settings.smtp_host}
                onChange={(e) => setSettings({ ...settings, smtp_host: e.target.value })}
                placeholder="smtp.gmail.com"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">SMTP 端口</label>
              <input
                type="number"
                value={settings.smtp_port}
                onChange={(e) => setSettings({ ...settings, smtp_port: parseInt(e.target.value) || 587 })}
                placeholder="587"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">用户名</label>
              <input
                type="text"
                value={settings.smtp_username}
                onChange={(e) => setSettings({ ...settings, smtp_username: e.target.value })}
                placeholder="your@email.com"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">密码</label>
              <input
                type="password"
                value={settings.smtp_password}
                onChange={(e) => setSettings({ ...settings, smtp_password: e.target.value })}
                placeholder="应用专用密码"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-slate-600 block mb-2">发件人邮箱</label>
              <input
                type="email"
                value={settings.smtp_from_email}
                onChange={(e) => setSettings({ ...settings, smtp_from_email: e.target.value })}
                placeholder="noreply@example.com"
                className="w-full px-4 py-2 border-2 border-slate-200 rounded-xl focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
