import type { ReactNode } from 'react';

interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Безопасная оболочка для будущего React Query Provider.
 *
 * Сейчас пакет @tanstack/react-query недоступен из-за 403 на npm registry,
 * поэтому provider не меняет поведение приложения и не ломает текущий роутинг.
 * После установки зависимости внутрь этого компонента можно добавить
 * QueryClientProvider и ReactQueryDevtools.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  return <>{children}</>;
}
