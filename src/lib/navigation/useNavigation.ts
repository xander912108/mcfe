import { useMemo } from 'react';
import { navigationConfig } from '@/lib/navigation/config';
import type { NavGroup, NavItem, UserRole } from '@/lib/navigation/types';

const roleHierarchy: Record<UserRole, number> = { newcomer: 0, member: 1, mentor: 2, leader: 3 };

export function hasMinRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
  return Boolean(userRole && roleHierarchy[userRole] >= roleHierarchy[minRole]);
}

function useAuth() {
  return { user: { role: 'leader' as UserRole, id: 'u_001' } };
}

function useFeatureFlags() {
  return useMemo(() => ({ isEnabled: (_flag: string) => Boolean(_flag) || true }), []);
}

export function useNavigation(): NavItem[] {
  const { user } = useAuth();
  const { isEnabled } = useFeatureFlags();
  return useMemo(() => navigationConfig.filter((item) => hasMinRole(user.role, item.minRole) && (!item.featureFlag || isEnabled(item.featureFlag))), [isEnabled, user.role]);
}

export function useNavigationByGroup(): Partial<Record<NavGroup, NavItem[]>> {
  const items = useNavigation();
  return useMemo(() => items.reduce<Partial<Record<NavGroup, NavItem[]>>>((acc, item) => ({ ...acc, [item.group]: [...(acc[item.group] ?? []), item] }), {}), [items]);
}
