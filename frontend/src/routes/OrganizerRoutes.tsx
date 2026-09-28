import { lazy } from 'react';
import { Navigate } from 'react-router-dom';

// project-imports
import Loadable from 'components/Loadable';
import PublicLayout from 'features/public/layout/PublicLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';
import RoleGuard from 'utils/route-guard/RoleGuard';

// render - organizer pages
const CreateEventPage = Loadable(lazy(() => import('features/organizer/pages/CreateEventPage')));

// ==============================|| ORGANIZER ROUTES ||============================== //

const OrganizerRoutes = {
  path: '/organizer',
  element: (
    <AuthGuard>
      <RoleGuard roles={['ORGANIZER']}>
        <PublicLayout />
      </RoleGuard>
    </AuthGuard>
  ),
  children: [
    {
      path: '',
      element: <Navigate to="events/create" replace />
    },
    {
      path: 'events/create',
      element: <CreateEventPage />
    }
  ]
};

export default OrganizerRoutes;
