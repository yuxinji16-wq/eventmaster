import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './stores/AppContext';
import { ToastProvider } from './shared/Toast';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { initializeErrorTracking } from './services/errorApi';
import { AuthProvider } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import ActivityManager from './components/activity/ActivityManager';
import MaterialManager from './components/material/MaterialManager';
import BudgetManager from './components/budget/BudgetManager';
import SupplierManager from './components/supplier/SupplierManager';
import OpportunityManager from './components/opportunity/OpportunityManager';
import ReviewCenter from './components/review/ReviewCenter';
import ActivityDetail from './pages/ActivityDetail';
import MaterialDetail from './pages/MaterialDetail';
import SupplierDetail from './pages/SupplierDetail';
import OpportunityDetail from './pages/OpportunityDetail';
import ReviewDetail from './pages/ReviewDetail';
import Login from './pages/Login';
import Account from './pages/Account';
import Permissions from './pages/Permissions';
import Settings from './pages/Settings';
import { AppRoutes } from './utils/routes';

// 初始化全局错误跟踪
initializeErrorTracking();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-slate-400">加载中...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={AppRoutes.LOGIN} replace />;
  }

  return <>{children}</>;
};

// 临时导入用于 ProtectedRoute（实际应使用 Context）
import { useAuth } from './context/AuthContext';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppProvider>
            <BrowserRouter>
              <Routes>
                {/* 公开路由 */}
                <Route path={AppRoutes.LOGIN} element={<Login />} />

                {/* 受保护的路由 */}
                <Route path={AppRoutes.HOME} element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path={AppRoutes.ACTIVITIES} element={<ActivityManager />} />
                  <Route path={AppRoutes.ACTIVITY_DETAIL} element={<ActivityDetail />} />
                  <Route path={AppRoutes.MATERIALS} element={<MaterialManager />} />
                  <Route path={AppRoutes.MATERIAL_DETAIL} element={<MaterialDetail />} />
                  <Route path={AppRoutes.BUDGET} element={<BudgetManager />} />
                  <Route path={AppRoutes.SUPPLIERS} element={<SupplierManager />} />
                  <Route path={AppRoutes.SUPPLIER_DETAIL} element={<SupplierDetail />} />
                  <Route path={AppRoutes.OPPORTUNITIES} element={<OpportunityManager />} />
                  <Route path={AppRoutes.OPPORTUNITY_DETAIL} element={<OpportunityDetail />} />
                  <Route path={AppRoutes.REVIEWS} element={<ReviewCenter />} />
                  <Route path={AppRoutes.REVIEW_DETAIL} element={<ReviewDetail />} />
                  <Route path={AppRoutes.ACCOUNT} element={<Account />} />
                  <Route path={AppRoutes.PERMISSIONS} element={<Permissions />} />
                  <Route path={AppRoutes.SETTINGS} element={<Settings />} />
                  <Route path="*" element={<Navigate to={AppRoutes.HOME} replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </AppProvider>
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
