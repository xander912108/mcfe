import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import type { UserRole } from '@/lib/navigation/types';

const roleHierarchy: Record<UserRole, number> = { newcomer: 0, member: 1, mentor: 2, leader: 3 };

function useAuth() {
  return { user: { role: 'leader' as UserRole } };
}

export function RoleGuard({ minRole, children }: { minRole: UserRole; children?: ReactNode }) {
  const { user } = useAuth();
  if (!user || roleHierarchy[user.role] < roleHierarchy[minRole]) return <Navigate to="/my-path" replace />;
  return children ? <>{children}</> : <Outlet />;
}
