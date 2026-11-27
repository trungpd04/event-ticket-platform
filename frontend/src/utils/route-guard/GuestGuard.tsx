import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

// project-imports
import { APP_DEFAULT_PATH } from 'config';
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

// ==============================|| GUEST GUARD ||============================== //

export default function GuestGuard({ children }: GuardProps) {
  const { isLoggedIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isLoggedIn) {
      const destination = location?.state?.from || (user?.roles?.includes('ADMIN') ? '/admin' : APP_DEFAULT_PATH);
      navigate(destination, {
        state: { from: '' },
        replace: true
      });
    }
  }, [isLoggedIn, user, navigate, location]);

  return children;
}
