/**
 * Генерация стабильных UUID-подобных ID для моков.
 * Используем префиксы для читаемости в логах.
 */
export function mockId(prefix: string, index: number): string {
  return `${prefix}_${String(index).padStart(3, '0')}`;
}

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
