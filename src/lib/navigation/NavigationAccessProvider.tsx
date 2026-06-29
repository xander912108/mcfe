import { useMemo, type ReactNode } from 'react';

import {
  defaultFeatureFlags,
  NavigationAccessContext,
  type NavigationAccessContextValue,
  type NavigationFeatureFlagState,
} from '@/lib/navigation/accessContext';
import type { UserRole } from '@/lib/navigation/types';

interface NavigationAccessProviderProps {
  children: ReactNode;
  featureFlags?: NavigationFeatureFlagState;
  role?: UserRole;
}

export function NavigationAccessProvider({
  children,
  featureFlags,
  role = 'leader',
}: NavigationAccessProviderProps) {
  const value = useMemo<NavigationAccessContextValue>(
    () => ({
      role,
      isFeatureEnabled: (flag) => featureFlags?.[flag] ?? defaultFeatureFlags[flag],
    }),
    [featureFlags, role],
  );

  return <NavigationAccessContext.Provider value={value}>{children}</NavigationAccessContext.Provider>;
}
