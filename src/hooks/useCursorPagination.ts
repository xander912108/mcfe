import { useCallback, useEffect, useState } from 'react';
import type { PaginatedResponse, PaginationParams } from '@/lib/pagination';

interface UseCursorPaginationOptions<T> {
  fetcher: (params: PaginationParams) => Promise<PaginatedResponse<T>>;
  initialLimit?: number;
}

interface UseCursorPaginationResult<T> {
  items: T[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  error: Error | null;
}

export function useCursorPagination<T>({
  fetcher,
  initialLimit = 20,
}: UseCursorPaginationOptions<T>): UseCursorPaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadInitial = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetcher({ limit: initialLimit });
      setItems(response.data);
      setCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [fetcher, initialLimit]);

  const loadMore = useCallback(async () => {
    if (!hasMore || !cursor || isLoadingMore) return;

    setIsLoadingMore(true);

    try {
      const response = await fetcher({ cursor, limit: initialLimit });
      setItems((prev) => [...prev, ...response.data]);
      setCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoadingMore(false);
    }
  }, [cursor, fetcher, hasMore, initialLimit, isLoadingMore]);

  useEffect(() => {
    void loadInitial();
  }, [loadInitial]);

  return {
    items,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    refresh: loadInitial,
    error,
  };
}
