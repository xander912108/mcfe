import { createContext, useContext } from 'react';

import type { NavigationFeatureFlag, UserRole } from '@/lib/navigation/types';

export type NavigationFeatureFlagState = Partial<Record<NavigationFeatureFlag, boolean>>;

export interface NavigationAccessContextValue {
  role?: UserRole;
  isFeatureEnabled: (flag: NavigationFeatureFlag) => boolean;
}

export const defaultFeatureFlags: Record<NavigationFeatureFlag, boolean> = {
  command_palette: true,
  insights_v2: true,
  leader_console_v2: true,
  navigation_config_v2: true,
};

const defaultNavigationAccess: NavigationAccessContextValue = {
  role: 'leader',
  isFeatureEnabled: (flag) => defaultFeatureFlags[flag],
};

export const NavigationAccessContext = createContext<NavigationAccessContextValue>(defaultNavigationAccess);

export function useNavigationAccess(): NavigationAccessContextValue {
  return useContext(NavigationAccessContext);
}
