import { Navigate } from 'react-router-dom';

// project-imports
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoleGuard from 'utils/route-guard/RoleGuard';

// render - admin pages
import AdminDashboardPage from 'features/admin/pages/AdminDashboardPage';
import EventApprovalPage from 'features/admin/pages/EventApprovalPage';
import EventApprovalDetailPage from 'features/admin/pages/EventApprovalDetailPage';
import CategoryManagementPage from 'features/admin/pages/CategoryManagementPage';
import FeePolicyManagementPage from 'features/admin/pages/FeePolicyManagementPage';

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
