import type { ReactNode } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

function useAuth() {
  return { isAuthenticated: true };
}

export function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />;
  return children ? <>{children}</> : <Outlet />;
}
