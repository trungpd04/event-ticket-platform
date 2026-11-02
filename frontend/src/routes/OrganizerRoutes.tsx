import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project-imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoleGuard from 'utils/route-guard/RoleGuard';

// render - organizer pages
const CreateEventPage = Loadable(lazy(() => import('features/organizer/pages/CreateEventPage')));
const OrganizerEventsPage = Loadable(lazy(() => import('features/organizer/pages/OrganizerEventsPage')));

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
    }
  ]
};

export default OrganizerRoutes;
