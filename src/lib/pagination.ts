/**
 * Cursor-based пагинация для работы с большими датасетами.
 *
 * Почему не offset/limit:
 * - Offset пагинация на больших данных = O(N) (медленно)
 * - Cursor пагинация = O(1) (всегда быстро)
 * - Tarantool итераторы работают именно через cursor
 *
 * @example
 * Первая страница: getItems()
 * Следующая: getItems({ cursor: lastItem.id })
 */

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
  hasMore: boolean;
  totalCount?: number;
}

export interface PaginationParams {
  cursor?: string;
  limit?: number;
}

/**
 * Утилита для пагинации массива (используется в моках).
 * TODO: В проде заменить на Tarantool iterator.
 */
export function paginateArray<T extends { id: string }>(
  items: T[],
  params: PaginationParams = {},
): PaginatedResponse<T> {
  const { cursor, limit = 20 } = params;

  let startIndex = 0;
  if (cursor) {
    const cursorIndex = items.findIndex((item) => item.id === cursor);
    startIndex = cursorIndex === -1 ? 0 : cursorIndex + 1;
  }

  const data = items.slice(startIndex, startIndex + limit);
  const nextIndex = startIndex + data.length;
  const hasMore = nextIndex < items.length;

  return {
    data,
    nextCursor: hasMore && data.length > 0 ? data[data.length - 1].id : null,
    hasMore,
    totalCount: items.length,
  };
}

/** Тип для будущих React Query infinite queries. */
export interface InfinitePage<T> {
  data: T[];
  nextCursor: string | null;
}
