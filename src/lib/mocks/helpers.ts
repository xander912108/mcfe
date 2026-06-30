import { __ulidInternals, type Prefix } from '@/lib/id';

/** ISO-строка, смещённая на N дней назад от "сейчас" */
export function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

/** ISO-строка, смещённая на N часов назад */
export function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours);
  return d.toISOString();
}

/** Случайное число в диапазоне */
export function randomBetween(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 100) / 100;
}

const mockIdCache = new Map<string, string>();

function stableHash(seed: string): number {
  return Array.from(seed).reduce((acc, char) => {
    return Math.imul(acc ^ char.charCodeAt(0), 16777619) >>> 0;
  }, 2166136261);
}

function stableRandomPart(seed: string): string {
  let hash = stableHash(seed);
  let result = '';

  for (let i = 0; i < 16; i += 1) {
    hash = Math.imul(hash ^ (i + 1), 16777619) >>> 0;
    result += __ulidInternals.crockfordBase32[hash % 32];
  }

  return result;
}

/**
 * Стабильный генератор ID для моков.
 * В отличие от runtime generateId(), возвращает одинаковый ID при повторных вызовах.
 */
export function stableMockId(prefix: Prefix, seed: string): string {
  const key = `${prefix}:${seed}`;

  if (!mockIdCache.has(key)) {
    const hash = stableHash(key);
    const timestamp = 1_700_000_000_000 + (hash % 100_000_000_000);
    mockIdCache.set(
      key,
      `${prefix}_${__ulidInternals.encodeTime(timestamp)}${stableRandomPart(key)}`,
    );
  }

  return mockIdCache.get(key)!;
}

/**
 * Обратная совместимость для существующих моков.
 * Старые вызовы mockId('u', 1) продолжают работать, но теперь возвращают ULID-совместимый ID.
 */
export function mockId(prefix: Prefix, index: number): string {
  return stableMockId(prefix, `${prefix}-${index}`);
}
