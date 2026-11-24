import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project-imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoleGuard from 'utils/route-guard/RoleGuard';

// render - organizer pages
const CreateEventPage = Loadable(lazy(() => import('features/organizer/pages/CreateEventPage')));
const EditEventPage = Loadable(lazy(() => import('features/organizer/pages/EditEventPage')));
const OrganizerEventsPage = Loadable(lazy(() => import('features/organizer/pages/OrganizerEventsPage')));
const OrganizerEventDetailPage = Loadable(lazy(() => import('features/organizer/pages/OrganizerEventDetailPage')));
const OrganizerFinancePage = Loadable(lazy(() => import('features/organizer/pages/OrganizerFinancePage')));

// ==============================|| ORGANIZER ROUTES ||============================== //

const OrganizerRoutes = {
  path: '/organizer',
  element: (
    <AuthGuard>
      <RoleGuard roles={['ORGANIZER']}>
        <DashboardLayout />
      </RoleGuard>
    </AuthGuard>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="events" replace />
    },
    {
      path: 'events',
      element: <OrganizerEventsPage />
    },
    {
      path: 'events/create',
      element: <CreateEventPage />
    },
    {
      path: 'events/:eventId',
      element: <OrganizerEventDetailPage />
    },
    {
      path: 'events/:eventId/edit',
      element: <EditEventPage />
    },
    {
      path: 'finance',
      element: <OrganizerFinancePage />
    }
  ]
};

export default OrganizerRoutes;
