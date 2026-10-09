import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import PublicLayout from 'features/public/layout/PublicLayout';

// render - public pages
const HomePage = Loadable(lazy(() => import('features/public/pages/HomePage')));
const EventsPage = Loadable(lazy(() => import('features/public/pages/EventsPage')));

// ==============================|| PUBLIC ROUTES ||============================== //

const PublicRoutes = {
  path: '/',
  element: <PublicLayout />,
  children: [
    {
      path: '/',
      element: <HomePage />
    },
    {
      path: '/events',
      element: <EventsPage />
    }
  ]
};

export default PublicRoutes;
