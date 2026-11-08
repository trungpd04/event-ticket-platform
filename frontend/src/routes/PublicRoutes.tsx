import { lazy } from 'react';

// project-imports
import Loadable from 'components/Loadable';
import PublicLayout from 'features/public/layout/PublicLayout';
import AuthGuard from 'utils/route-guard/AuthGuard';

// render - public pages
const HomePage = Loadable(lazy(() => import('features/public/pages/HomePage')));
const EventsPage = Loadable(lazy(() => import('features/public/pages/EventsPage')));
const EventDetailPage = Loadable(lazy(() => import('features/public/pages/EventDetailPage')));
const CheckoutPage = Loadable(lazy(() => import('features/booking/pages/CheckoutPage')));
const PaymentSuccessPage = Loadable(lazy(() => import('features/booking/pages/PaymentSuccessPage')));
const MyOrdersPage = Loadable(lazy(() => import('features/booking/pages/MyOrdersPage')));

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
      path: 'events',
      element: <EventsPage />
    },
    {
      path: 'events/:id',
      element: <EventDetailPage />
    },
    {
      path: 'checkout',
      element: (
        <AuthGuard>
          <CheckoutPage />
        </AuthGuard>
      )
    },
    {
      path: 'payment/success',
      element: (
        <AuthGuard>
          <PaymentSuccessPage />
        </AuthGuard>
      )
    },
    {
      path: 'my-orders',
      element: (
        <AuthGuard>
          <MyOrdersPage />
        </AuthGuard>
      )
    }
  ]
};

export default PublicRoutes;
