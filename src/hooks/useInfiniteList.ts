import { useCallback, useMemo } from 'react';
import { useCursorPagination } from '@/hooks/useCursorPagination';
import type { PaginatedResponse, PaginationParams } from '@/lib/pagination';

interface UseInfiniteListOptions<T> {
  queryKey: readonly unknown[];
  fetcher: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  limit?: number;
  enabled?: boolean;
}

/**
 * Временная dependency-free обёртка для cursor-based списков.
 *
 * После установки @tanstack/react-query этот hook можно заменить на
 * useInfiniteQuery с тем же внешним контрактом: queryKey/fetcher/limit/enabled.
 */
export function useInfiniteList<T>({
  queryKey,
  fetcher,
  limit = 20,
  enabled = true,
}: UseInfiniteListOptions<T>) {
  const disabledFetcher = useCallback(async (): Promise<PaginatedResponse<T>> => {
    return { data: [], nextCursor: null, hasMore: false };
  }, []);

  const pagination = useCursorPagination<T>({
    fetcher: enabled ? fetcher : disabledFetcher,
    initialLimit: limit,
  });

  const data = useMemo(
    () => ({
      pageParams: [undefined],
      pages: [
        {
          data: pagination.items,
          nextCursor: pagination.hasMore ? null : null,
        },
      ],
    }),
    [pagination.hasMore, pagination.items],
  );

  return {
    queryKey,
    data,
    fetchNextPage: pagination.loadMore,
    hasNextPage: pagination.hasMore,
    isFetchingNextPage: pagination.isLoadingMore,
    isLoading: pagination.isLoading,
    error: pagination.error,
    refetch: pagination.refresh,
  };
}
