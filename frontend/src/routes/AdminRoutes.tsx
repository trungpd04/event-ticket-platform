import { Navigate } from 'react-router-dom';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoleGuard from 'utils/route-guard/RoleGuard';

// render - admin pages
import AdminDashboardPage from 'features/admin/pages/AdminDashboardPage';
import EventApprovalPage from 'features/admin/pages/EventApprovalPage';
import EventApprovalDetailPage from 'features/admin/pages/EventApprovalDetailPage';
import EventUpdateRequestApprovalPage from 'features/admin/pages/EventUpdateRequestApprovalPage';
import EventUpdateRequestApprovalDetailPage from 'features/admin/pages/EventUpdateRequestApprovalDetailPage';
import CategoryManagementPage from 'features/admin/pages/CategoryManagementPage';
import FeePolicyManagementPage from 'features/admin/pages/FeePolicyManagementPage';
import CheckerManagementPage from 'features/admin/pages/CheckerManagementPage';
import AdminPayoutPage from 'features/admin/pages/AdminPayoutPage';

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
      path: 'event-update-requests',
      element: <EventUpdateRequestApprovalPage />
    },
    {
      path: 'event-update-requests/:id',
      element: <EventUpdateRequestApprovalDetailPage />
    },
    {
      path: 'categories',
      element: <CategoryManagementPage />
    },
    {
      path: 'fee-policies',
      element: <FeePolicyManagementPage />
    },
    {
      path: 'checkers',
      element: <CheckerManagementPage />
    },
    {
      path: 'payouts',
      element: <AdminPayoutPage />
    }
  ]
};

export default AdminRoutes;
