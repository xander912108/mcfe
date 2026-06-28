/**
 * Имитация сетевой задержки для реалистичности.
 * Удалить при подключении реального бэкенда.
 */
function simulateLatency(ms = 200): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * TODO: Заменить на реальный клиент Tarantool (iproto/msgpack или REST).
 * Пример будущей реализации:
 *
 * import { Connector } from 'tarantool-driver';
 * const conn = new Connector({ host: 'localhost', port: 3301 });
 * export async function callTarantool(fn: string, args: unknown[]) {
 *   const result = await conn.call(fn, args);
 *   return result.data;
 * }
 */
export { simulateLatency };
