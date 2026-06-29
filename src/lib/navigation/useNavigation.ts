import { useMemo } from 'react';

import { navigationConfig } from '@/lib/navigation/config';
import { useNavigationAccess } from '@/lib/navigation/accessContext';
import type { NavigationFeatureFlag, NavigationGroup, NavigationItem, UserRole } from '@/lib/navigation/types';

export const roleHierarchy: Record<UserRole, number> = {
  guest: 0,
  newcomer: 1,
  member: 2,
  mentor: 3,
  leader: 4,
};

export interface NavigationContext {
  role?: UserRole;
  isFeatureEnabled: (flag: NavigationFeatureFlag) => boolean;
}

export function hasMinRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
  if (!userRole) return false;

  return roleHierarchy[userRole] >= roleHierarchy[minRole];
}

export function isNavigationItemVisible(item: NavigationItem, context: NavigationContext): boolean {
  if (!hasMinRole(context.role, item.minRole)) return false;
  if (item.featureFlag && !context.isFeatureEnabled(item.featureFlag)) return false;

  return true;
}

export function filterNavigationItems(
  items: readonly NavigationItem[],
  context: NavigationContext,
): NavigationItem[] {
  return items.filter((item) => isNavigationItemVisible(item, context));
}

export function groupNavigationItems(items: readonly NavigationItem[]): Record<NavigationGroup, NavigationItem[]> {
  return items.reduce<Record<NavigationGroup, NavigationItem[]>>(
    (groups, item) => {
      groups[item.group].push(item);
      return groups;
    },
    {
      public: [],
      main: [],
      community: [],
      leadership: [],
    },
  );
}

export function useNavigation(): NavigationItem[] {
  const { role, isFeatureEnabled } = useNavigationAccess();

  return useMemo(
    () => filterNavigationItems(navigationConfig, { role, isFeatureEnabled }),
    [isFeatureEnabled, role],
  );
}

export function useNavigationByGroup(): Record<NavigationGroup, NavigationItem[]> {
  const items = useNavigation();

  return useMemo(() => groupNavigationItems(items), [items]);
}
