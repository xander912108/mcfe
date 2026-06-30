/**
 * Генератор time-sortable уникальных идентификаторов.
 *
 * Использует ULID-совместимый формат Crockford Base32:
 * - уникален для клиентских операций;
 * - сортируется по времени создания;
 * - не раскрывает количество записей, в отличие от u_001/u_002.
 *
 * TODO: При подключении Tarantool использовать тот же формат как primary key в spaces.
 */

export type Prefix =
  | 'u'
  | 'c'
  | 'app'
  | 'pm'
  | 'sc'
  | 'rec'
  | 'del'
  | 'ses'
  | 'msg'
  | 'not';

const CROCKFORD_BASE32 = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
const ULID_PATTERN = /^[0-9A-HJKMNP-TV-Z]{26}$/;

function stripPrefix(id: string): string {
  const separatorIndex = id.indexOf('_');
  return separatorIndex === -1 ? id : id.slice(separatorIndex + 1);
}

function encodeTime(time: number): string {
  let value = Math.floor(time);
  let encoded = '';

  for (let i = 0; i < 10; i += 1) {
    encoded = CROCKFORD_BASE32[value % 32] + encoded;
    value = Math.floor(value / 32);
  }

  return encoded;
}

function decodeTime(value: string): number {
  return value.split('').reduce((timestamp, char) => {
    const index = CROCKFORD_BASE32.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid ULID timestamp character: ${char}`);
    }
    return timestamp * 32 + index;
  }, 0);
}

function randomBase32(length: number): string {
  const cryptoApi = globalThis.crypto;
  const bytes = new Uint8Array(length);

  if (cryptoApi?.getRandomValues) {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (byte) => CROCKFORD_BASE32[byte % 32]).join('');
}

/**
 * Генерирует уникальный ID с опциональным префиксом для читаемости в логах.
 *
 * @example
 * generateId('u')      // 'u_01HXYZ...'
 * generateId()         // '01HXYZ...'
 */
export function generateId(prefix?: Prefix): string {
  const id = `${encodeTime(Date.now())}${randomBase32(16)}`;
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Извлекает timestamp из ULID.
 * Полезно для отладки и аналитики.
 */
export function extractTimestamp(id: string): Date {
  const rawId = stripPrefix(id);
  return new Date(decodeTime(rawId.substring(0, 10)));
}

/**
 * Проверяет, что строка является валидным ULID.
 */
export function isValidUlid(id: string): boolean {
  return ULID_PATTERN.test(stripPrefix(id));
}

export const __ulidInternals = {
  crockfordBase32: CROCKFORD_BASE32,
  encodeTime,
} as const;
