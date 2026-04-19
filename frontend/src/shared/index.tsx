import React from 'react';

// ============================================
// 通用卡片组件
// ============================================
interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hover = false,
  padding = 'md'
}) => {
  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  return (
    <div
      className={`
        bg-white rounded-xl border border-slate-100
        ${paddingClasses[padding]}
        ${hover ? 'transition-all duration-200 hover:shadow-md hover:border-indigo-200 cursor-pointer' : 'shadow-sm'}
        ${className}
      `}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

// ============================================
// 通用按钮组件
// ============================================
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  loading = false,
  icon,
  disabled,
  ...props
}) => {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed';

  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800 shadow-sm hover:shadow-md',
    secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800 shadow-sm',
    ghost: 'text-slate-600 hover:bg-slate-100 active:bg-slate-200',
    outline: 'border-2 border-slate-200 text-slate-700 hover:border-indigo-300 hover:text-indigo-600 active:bg-indigo-50',
  };

  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon ? (
        <span className="flex-shrink-0">{icon}</span>
      ) : null}
      {children}
    </button>
  );
};

// ============================================
// 统计卡片组件
// ============================================
interface StatCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'blue';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendUp = true,
  color = 'indigo',
  className = '',
}) => {
  const colorClasses = {
    indigo: 'bg-indigo-50 text-indigo-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600',
    blue: 'bg-blue-50 text-blue-600',
  };

  return (
    <Card className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 truncate">{title}</p>
        <p className="text-2xl font-bold text-slate-800 truncate">{value}</p>
        {trend && (
          <p className={`text-xs font-semibold mt-1.5 ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
            {trendUp ? '↑' : '↓'} {trend}
          </p>
        )}
      </div>
      {icon && (
        <div className={`p-3 rounded-xl flex-shrink-0 ${colorClasses[color]}`}>
          {icon}
        </div>
      )}
    </Card>
  );
};

// ============================================
// 状态徽章组件
// ============================================
interface BadgeProps {
  status: string;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
}

const statusVariantMap: Record<string, BadgeProps['variant']> = {
  '已完成': 'success',
  '执行中': 'info',
  '筹备中': 'warning',
  '已取消': 'danger',
  '超预算': 'danger',
  '进行中': 'info',
  '待启动': 'default',
  '高意向': 'purple',
  '中意向': 'info',
  '低意向': 'default',
};

export const Badge: React.FC<BadgeProps> = ({ status, variant, size = 'sm' }) => {
  const v = variant || statusVariantMap[status] || 'default';

  const variantClasses = {
    default: 'bg-slate-100 text-slate-600',
    success: 'bg-emerald-100 text-emerald-700',
    warning: 'bg-amber-100 text-amber-700',
    danger: 'bg-rose-100 text-rose-700',
    info: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`inline-flex items-center font-semibold rounded-md ${variantClasses[v]} ${sizeClasses[size]}`}>
      {status}
    </span>
  );
};

// ============================================
// 返回按钮组件
// ============================================
interface BackButtonProps {
  onClick: () => void;
  label?: string;
}

export const BackButton: React.FC<BackButtonProps> = ({ onClick, label = '返回' }) => (
  <button
    onClick={onClick}
    className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-indigo-600 transition-colors duration-200 mb-4 group"
  >
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="transition-transform duration-200 group-hover:-translate-x-1"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
    {label}
  </button>
);

// ============================================
// 页面标题组件
// ============================================
interface PageTitleProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title, subtitle, action }) => (
  <div className="flex items-start justify-between gap-4 mb-6">
    <div>
      <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title}</h1>
      {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
    </div>
    {action && <div className="flex-shrink-0">{action}</div>}
  </div>
);

// ============================================
// 空状态组件
// ============================================
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 text-center">
    {icon && <div className="text-slate-300 mb-4">{icon}</div>}
    <p className="text-slate-600 font-semibold text-lg">{title}</p>
    {description && <p className="text-sm text-slate-400 mt-2 max-w-sm">{description}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

// ============================================
// 加载状态组件
// ============================================
export const LoadingSpinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = { sm: 'h-4 w-4', md: 'h-8 w-8', lg: 'h-12 w-12' };
  return (
    <div className="flex items-center justify-center py-12">
      <div className={`${sizeClasses[size]} border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`} />
    </div>
  );
};

// ============================================
// 统一模态框组件
// ============================================
interface ModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children, size = 'md', footer }) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity duration-200"
        onClick={onClose}
      />
      {/* 内容 */}
      <div
        className={`
          relative bg-white rounded-2xl shadow-xl w-full z-10 overflow-hidden
          transform transition-all duration-200
          ${sizeClasses[size]}
        `}
      >
        {/* 头部 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* 身体 */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {children}
        </div>
        {/* 底部 */}
        {footer && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================
// 输入框组件
// ============================================
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 text-sm
          bg-white border rounded-lg
          transition-all duration-200
          placeholder:text-slate-400
          ${error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-rose-600">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
};

// ============================================
// 选择框组件
// ============================================
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  options,
  className = '',
  ...props
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
      )}
      <select
        className={`
          w-full px-4 py-2.5 text-sm
          bg-white border rounded-lg
          transition-all duration-200
          cursor-pointer
          appearance-none
          ${error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
            : 'border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20'
          }
          ${className}
        `}
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
};

// ============================================
// 分隔线组件
// ============================================
interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export const Divider: React.FC<DividerProps> = ({ orientation = 'horizontal', className = '' }) => {
  if (orientation === 'vertical') {
    return <div className={`w-px bg-slate-200 mx-3 ${className}`} />;
  }
  return <div className={`h-px bg-slate-200 my-4 ${className}`} />;
};

// ============================================
// Toast 通知系统导出
// ============================================
export { ToastProvider, useToast } from './Toast';
export type { Toast, ToastType } from './Toast';

// ============================================
// ErrorBoundary 导出
// ============================================
export { ErrorBoundary } from './ErrorBoundary';
export { AsyncState } from './AsyncState';
