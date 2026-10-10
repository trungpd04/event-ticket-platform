import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project-imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoleGuard from 'utils/route-guard/RoleGuard';

// render - admin pages
const AdminDashboardPage = Loadable(lazy(() => import('features/admin/pages/AdminDashboardPage')));
const EventApprovalPage = Loadable(lazy(() => import('features/admin/pages/EventApprovalPage')));
const EventApprovalDetailPage = Loadable(lazy(() => import('features/admin/pages/EventApprovalDetailPage')));
const CategoryManagementPage = Loadable(lazy(() => import('features/admin/pages/CategoryManagementPage')));
const FeePolicyManagementPage = Loadable(lazy(() => import('features/admin/pages/FeePolicyManagementPage')));

// ==============================|| ADMIN ROUTES ||============================== //

const AdminRoutes = {
  path: '/admin',
  element: (
    <AuthGuard>
      <RoleGuard roles={['ADMIN']}>
        <DashboardLayout />
      </RoleGuard>
    </AuthGuard>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="dashboard" replace />
    },
    {
      path: 'dashboard',
      element: <AdminDashboardPage />
    },
    {
      path: 'events/approval',
      element: <EventApprovalPage />
    },
    {
      path: 'events/approval/:id',
      element: <EventApprovalDetailPage />
    },
    {
      path: 'categories',
      element: <CategoryManagementPage />
    },
    {
      path: 'fee-policies',
      element: <FeePolicyManagementPage />
    }
  ]
};

export default AdminRoutes;
