import { createBrowserRouter } from 'react-router-dom';

// project-imports
import LoginRoutes from './LoginRoutes';
import OrganizerRoutes from './OrganizerRoutes';
import PublicRoutes from './PublicRoutes';
import AdminRoutes from './AdminRoutes';

// ==============================|| ROUTES RENDER ||============================== //

const router = createBrowserRouter([PublicRoutes, LoginRoutes, OrganizerRoutes, AdminRoutes], {
  basename: import.meta.env.VITE_APP_BASE_NAME
});

export default router;
