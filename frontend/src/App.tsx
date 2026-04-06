import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './stores/AppContext';
import { ToastProvider } from './shared/Toast';
import { ErrorBoundary } from './shared/ErrorBoundary';
import { initializeErrorTracking } from './services/errorApi';
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
import { AppRoutes } from './utils/routes';

// 初始化全局错误跟踪
initializeErrorTracking();

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppProvider>
          <BrowserRouter>
            <Routes>
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
                <Route path="*" element={<Navigate to={AppRoutes.HOME} replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AppProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;
