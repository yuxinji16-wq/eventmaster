import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './stores/AppContext';
import { ToastProvider } from './shared/Toast';
import { NotificationProvider } from './shared/NotificationContext';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { initializeErrorTracking } from './services/errorApi';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import { AppRoutes } from './utils/routes';

const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const ActivityManager = React.lazy(() => import('./components/activity/ActivityManager'));
const MaterialManager = React.lazy(() => import('./components/material/MaterialManager'));
const BudgetManager = React.lazy(() => import('./components/budget/BudgetManager'));
const SupplierManager = React.lazy(() => import('./components/supplier/SupplierManager'));
const OpportunityManager = React.lazy(() => import('./components/opportunity/OpportunityManager'));
const ReviewCenter = React.lazy(() => import('./components/review/ReviewCenter'));
const ActivityDetail = React.lazy(() => import('./pages/ActivityDetail'));
const MaterialDetail = React.lazy(() => import('./pages/MaterialDetail'));
const SupplierDetail = React.lazy(() => import('./pages/SupplierDetail'));
const OpportunityDetail = React.lazy(() => import('./pages/OpportunityDetail'));
const ReviewDetail = React.lazy(() => import('./pages/ReviewDetail'));
const Login = React.lazy(() => import('./pages/Login'));
const Account = React.lazy(() => import('./pages/Account'));
const Permissions = React.lazy(() => import('./pages/Permissions'));
const Settings = React.lazy(() => import('./pages/Settings'));

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

const RouteFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="text-slate-400">加载中...</div>
  </div>
);

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <NotificationProvider>
          <AuthProvider>
            <AppProvider>
              <BrowserRouter>
                <Suspense fallback={<RouteFallback />}>
                  <Routes>
                    {/* 公开路由 */}
                    <Route path={AppRoutes.LOGIN} element={<Login />} />

                    {/* 受保护的路由 */}
                    <Route
                      path={AppRoutes.HOME}
                      element={(
                        <ProtectedRoute>
                          <Layout />
                        </ProtectedRoute>
                      )}
                    >
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
                </Suspense>
              </BrowserRouter>
            </AppProvider>
          </AuthProvider>
        </NotificationProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
