/**
 * Query keys — единый источник правды для будущего server-state кэша.
 *
 * Файл не импортирует @tanstack/react-query, потому что установка пакета сейчас
 * заблокирована npm registry. После восстановления доступа сюда можно добавить
 * настоящий QueryClient без изменения ключей у потребителей.
 */
export const queryKeys = {
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
  },
  communities: {
    all: ['communities'] as const,
    lists: () => [...queryKeys.communities.all, 'list'] as const,
    list: (filters: Record<string, unknown>) => [...queryKeys.communities.lists(), filters] as const,
    details: () => [...queryKeys.communities.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.communities.details(), id] as const,
  },
  applications: {
    all: ['applications'] as const,
    lists: () => [...queryKeys.applications.all, 'list'] as const,
    list: (communityId: string) => [...queryKeys.applications.lists(), communityId] as const,
    details: () => [...queryKeys.applications.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.applications.details(), id] as const,
  },
  pulse: {
    all: ['pulse'] as const,
    detail: (communityId: string) => [...queryKeys.pulse.all, communityId] as const,
    history: (communityId: string) => [...queryKeys.pulse.all, 'history', communityId] as const,
  },
  recommendations: {
    all: ['recommendations'] as const,
    list: (userId: string) => [...queryKeys.recommendations.all, userId] as const,
  },
  path: {
    all: ['path'] as const,
    progress: (userId: string) => [...queryKeys.path.all, 'progress', userId] as const,
    timeline: (userId: string) => [...queryKeys.path.all, 'timeline', userId] as const,
    dailyStep: (userId: string) => [...queryKeys.path.all, 'dailyStep', userId] as const,
  },
} as const;
