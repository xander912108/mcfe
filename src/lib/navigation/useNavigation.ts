import { useMemo } from 'react';

import { navigationConfig } from '@/lib/navigation/config';
import type { NavigationFeatureFlag, NavigationGroup, NavigationItem, UserRole } from '@/lib/navigation/types';

export const roleHierarchy: Record<UserRole, number> = {
  guest: 0,
  newcomer: 1,
  member: 2,
  mentor: 3,
  leader: 4,
};

export interface NavigationFeatureFlags {
  isEnabled: (flag: NavigationFeatureFlag) => boolean;
}

export interface NavigationContext {
  role?: UserRole;
  featureFlags: NavigationFeatureFlags;
}

const enabledFeatureFlags: NavigationFeatureFlags = {
  isEnabled: () => true,
};

function useNavigationContext(): NavigationContext {
  // TODO: заменить на реальные auth/store и feature flags, когда появится единый источник пользователя.
  return {
    role: 'leader',
    featureFlags: enabledFeatureFlags,
  };
}

export function hasMinRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
  if (!userRole) return false;

  return roleHierarchy[userRole] >= roleHierarchy[minRole];
}

export function isNavigationItemVisible(item: NavigationItem, context: NavigationContext): boolean {
  if (!hasMinRole(context.role, item.minRole)) return false;
  if (item.featureFlag && !context.featureFlags.isEnabled(item.featureFlag)) return false;

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
  const { role, featureFlags } = useNavigationContext();

  return useMemo(
    () => filterNavigationItems(navigationConfig, { role, featureFlags }),
    [role, featureFlags],
  );
}

export function useNavigationByGroup(): Record<NavigationGroup, NavigationItem[]> {
  const items = useNavigation();

  return useMemo(() => groupNavigationItems(items), [items]);
}
