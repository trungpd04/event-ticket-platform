import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import PublicLayout from 'features/public/layout/PublicLayout';

// render - public pages
const HomePage = Loadable(lazy(() => import('features/public/pages/HomePage')));

// ==============================|| PUBLIC ROUTES ||============================== //

const PublicRoutes = {
  path: '/',
  element: <PublicLayout />,
  children: [
    {
      path: '/',
      element: <HomePage />
    }
  ]
};

export default PublicRoutes;
