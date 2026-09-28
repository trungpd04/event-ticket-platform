import { ReactElement } from 'react';
import { Navigate } from 'react-router-dom';

// project-imports
import useAuth from 'hooks/useAuth';

// types
import { GuardProps } from 'types/auth';

interface RoleGuardProps extends GuardProps {
  roles: string[];
}

// ==============================|| ROLE GUARD ||============================== //

export default function RoleGuard({ children, roles }: RoleGuardProps) {
  const { isLoggedIn, user } = useAuth();

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  const hasRequiredRole = roles.some((role) => user?.roles?.includes(role));
  if (!hasRequiredRole) {
    return <Navigate to="/" replace />;
  }

  return children as ReactElement;
}
