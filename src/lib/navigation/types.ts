import type { LucideIcon } from 'lucide-react';
import type { ComponentType, LazyExoticComponent } from 'react';

export type UserRole = 'newcomer' | 'member' | 'mentor' | 'leader';
export type NavGroup = 'main' | 'community' | 'leadership';

export interface NavBadge {
  type: 'count' | 'dot';
  source: 'recommendations' | 'applications' | 'messages' | 'notifications';
}

export interface NavItem {
  id: string;
  path: string;
  labelKey: string;
  icon: LucideIcon;
  group: NavGroup;
  minRole: UserRole;
  featureFlag?: string;
  badge?: NavBadge;
  shortcut?: string;
  component: LazyExoticComponent<ComponentType>;
}
