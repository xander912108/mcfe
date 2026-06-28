import type { Recommendation } from '../types';
import { recommendations } from '../mocks/recommendations.mock';
import { simulateLatency } from './client';

// TODO: Заменить чтение и статусы моков на Tarantool: callTarantool('recommendations.*', args).
export const recommendationsApi = {
  async getByUser(userId: string): Promise<Recommendation[]> { await simulateLatency(); return recommendations.filter((r) => r.user_id === userId && !r.is_dismissed).sort((a, b) => a.priority - b.priority); },
  async getUnread(userId: string): Promise<Recommendation[]> { await simulateLatency(); return recommendations.filter((r) => r.user_id === userId && !r.is_read && !r.is_dismissed).sort((a, b) => a.priority - b.priority); },
  async markRead(id: string): Promise<void> { await simulateLatency(100); console.log(`[MOCK] Recommendation ${id} marked as read`); },
  async dismiss(id: string): Promise<void> { await simulateLatency(100); console.log(`[MOCK] Recommendation ${id} dismissed`); },
};
