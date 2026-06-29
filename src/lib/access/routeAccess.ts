import { navigationConfig } from '@/lib/navigation/config';
import type { NavigationFeatureFlag, NavigationItem, UserRole } from '@/lib/navigation/types';

const roleHierarchy: Record<UserRole, number> = {
  guest: 0,
  newcomer: 1,
  member: 2,
  mentor: 3,
  leader: 4,
};

export type AccessDecisionReason =
  | 'allowed'
  | 'feature-disabled'
  | 'missing-role'
  | 'unknown-route';

export type RouteAccessFallbackKind =
  | 'allow'
  | 'not-found'
  | 'request-access'
  | 'sign-in'
  | 'soft-redirect';

export interface RouteAccessContext {
  role?: UserRole;
  isDemoMode?: boolean;
  isFeatureEnabled?: (flag: NavigationFeatureFlag) => boolean;
}

export interface RouteAccessFallback {
  kind: RouteAccessFallbackKind;
  to?: string;
  messageKey?: string;
}

export interface NavigationItemAccessDecision {
  allowed: boolean;
  reason: AccessDecisionReason;
  requiredRole?: UserRole;
  currentRole: UserRole;
  featureFlag?: NavigationFeatureFlag;
}

export interface RouteAccessDecision extends NavigationItemAccessDecision {
  path: string;
  item?: NavigationItem;
  fallback: RouteAccessFallback;
}

function normalizePath(path: string): string {
  const [withoutHash] = path.split('#');
  const [withoutQuery] = withoutHash.split('?');

  if (withoutQuery.length > 1 && withoutQuery.endsWith('/')) {
    return withoutQuery.slice(0, -1);
  }

  return withoutQuery || '/';
}

function getEffectiveRole(role: UserRole | undefined): UserRole {
  return role ?? 'guest';
}

export function hasRouteMinRole(userRole: UserRole | undefined, minRole: UserRole): boolean {
  const effectiveRole = getEffectiveRole(userRole);

  return roleHierarchy[effectiveRole] >= roleHierarchy[minRole];
}

export function findNavigationItemByPath(
  path: string,
  items: readonly NavigationItem[] = navigationConfig,
): NavigationItem | undefined {
  const normalizedPath = normalizePath(path);

  return items.find((item) => normalizePath(item.path) === normalizedPath);
}

export function canAccessNavigationItem(
  item: NavigationItem,
  context: RouteAccessContext,
): NavigationItemAccessDecision {
  const currentRole = getEffectiveRole(context.role);

  if (!hasRouteMinRole(context.role, item.minRole)) {
    return {
      allowed: false,
      reason: 'missing-role',
      requiredRole: item.minRole,
      currentRole,
    };
  }

  if (item.featureFlag && context.isFeatureEnabled?.(item.featureFlag) === false) {
    return {
      allowed: false,
      reason: 'feature-disabled',
      requiredRole: item.minRole,
      currentRole,
      featureFlag: item.featureFlag,
    };
  }

  return {
    allowed: true,
    reason: 'allowed',
    requiredRole: item.minRole,
    currentRole,
    featureFlag: item.featureFlag,
  };
}

export function getRouteAccessFallback(
  item: NavigationItem | undefined,
  decision: NavigationItemAccessDecision | Pick<RouteAccessDecision, 'reason' | 'currentRole'>,
  context: RouteAccessContext,
): RouteAccessFallback {
  if (decision.reason === 'allowed') {
    return { kind: 'allow' };
  }

  if (!item || decision.reason === 'unknown-route') {
    return { kind: 'not-found', messageKey: 'access.routeNotFound' };
  }

  if (decision.reason === 'feature-disabled') {
    return {
      kind: 'soft-redirect',
      to: '/',
      messageKey: 'access.featureUnavailable',
    };
  }

  if (item.surface === 'leader') {
    if (context.isDemoMode) {
      return {
        kind: 'request-access',
        messageKey: 'access.leaderDemoRoleRequired',
      };
    }

    return {
      kind: 'soft-redirect',
      to: '/my-path',
      messageKey: 'access.leaderRoleRequired',
    };
  }

  if (decision.currentRole === 'guest') {
    return {
      kind: 'sign-in',
      messageKey: 'access.signInRequired',
    };
  }

  return {
    kind: 'soft-redirect',
    to: '/my-path',
    messageKey: 'access.routeRoleRequired',
  };
}

export function canAccessRoute(
  path: string,
  context: RouteAccessContext,
  items: readonly NavigationItem[] = navigationConfig,
): RouteAccessDecision {
  const item = findNavigationItemByPath(path, items);

  if (!item) {
    const currentRole = getEffectiveRole(context.role);

    return {
      allowed: false,
      reason: 'unknown-route',
      currentRole,
      path: normalizePath(path),
      fallback: getRouteAccessFallback(undefined, { reason: 'unknown-route', currentRole }, context),
    };
  }

  const itemDecision = canAccessNavigationItem(item, context);

  return {
    ...itemDecision,
    path: normalizePath(path),
    item,
    fallback: getRouteAccessFallback(item, itemDecision, context),
  };
}
