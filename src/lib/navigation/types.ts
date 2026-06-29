import type { LucideIcon } from 'lucide-react';

export type UserRole = 'guest' | 'newcomer' | 'member' | 'mentor' | 'leader';

export type NavigationGroup = 'public' | 'main' | 'community' | 'leadership';

export type NavigationSurface = 'public' | 'participant' | 'leader';

export type ExistingRouteOwner = 'main-entry' | 'app-shell' | 'leader-shell' | 'standalone';

export interface NavigationBadge {
  type: 'count' | 'dot';
  source: 'applications' | 'messages' | 'notifications' | 'recommendations';
}

export interface ExistingRouteBinding {
  owner: ExistingRouteOwner;
  componentPath: string;
  appProp?:
    | 'communityFeedPage'
    | 'connectionsPage'
    | 'contributionPage'
    | 'insightsPage'
    | 'learningPage'
    | 'meetingsPage'
    | 'myPathPage'
    | 'leaderMode';
  leaderTab?: 'main' | 'entry' | 'requests' | 'connections' | 'contribution' | 'monetization' | 'settings';
}

export type NavigationFeatureFlag =
  | 'command_palette'
  | 'insights_v2'
  | 'leader_console_v2'
  | 'navigation_config_v2';

export interface NavigationItem {
  id: string;
  path: string;
  labelKey: string;
  icon: LucideIcon;
  group: NavigationGroup;
  surface: NavigationSurface;
  minRole: UserRole;
  binding: ExistingRouteBinding;
  badge?: NavigationBadge;
  shortcut?: string;
  featureFlag?: NavigationFeatureFlag;
  preserveExistingRoute: true;
}
