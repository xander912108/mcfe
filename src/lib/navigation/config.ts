import { lazy } from 'react';
import { BookOpen, Calendar, Crown, Heart, Home, Lightbulb, Network, Users } from 'lucide-react';
import type { NavItem } from '@/lib/navigation/types';

export const navigationConfig: NavItem[] = [
  { id: 'my-path', path: '/my-path', labelKey: 'nav.myPath', icon: Home, group: 'main', minRole: 'newcomer', shortcut: '1', component: lazy(() => import('@/pages/MyPathPage')) },
  { id: 'community', path: '/community', labelKey: 'nav.community', icon: Users, group: 'community', minRole: 'member', shortcut: '2', component: lazy(() => import('@/pages/CommunityPage')) },
  { id: 'learning', path: '/learning', labelKey: 'nav.learning', icon: BookOpen, group: 'community', minRole: 'member', shortcut: '3', component: lazy(() => import('@/pages/LearningPage')) },
  { id: 'meetings', path: '/meetings', labelKey: 'nav.meetings', icon: Calendar, group: 'community', minRole: 'member', shortcut: '4', badge: { type: 'count', source: 'notifications' }, component: lazy(() => import('@/pages/MeetingsPage')) },
  { id: 'connections', path: '/connections', labelKey: 'nav.connections', icon: Network, group: 'community', minRole: 'member', shortcut: '5', component: lazy(() => import('@/pages/ConnectionsPage')) },
  { id: 'insights', path: '/insights', labelKey: 'nav.insights', icon: Lightbulb, group: 'community', minRole: 'member', featureFlag: 'insights_v2', shortcut: '6', component: lazy(() => import('@/pages/InsightsPage')) },
  { id: 'contribution', path: '/contribution', labelKey: 'nav.contribution', icon: Heart, group: 'community', minRole: 'member', shortcut: '7', component: lazy(() => import('@/pages/ContributionPage')) },
  { id: 'leader-console', path: '/leader', labelKey: 'nav.leaderConsole', icon: Crown, group: 'leadership', minRole: 'leader', featureFlag: 'leader_console_v2', badge: { type: 'count', source: 'applications' }, component: lazy(() => import('@/pages/LeaderConsolePage')) },
];
