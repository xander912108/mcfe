import type { PulseMetric, PulseHistory } from '../types';
import { pulseMetrics, pulseHistory } from '../mocks/pulse.mock';
import { simulateLatency } from './client';

// TODO: Заменить чтение моков на Tarantool: callTarantool('pulse.get_*', args).
export const pulseApi = {
  async getCurrent(communityId: string): Promise<PulseMetric | undefined> { await simulateLatency(150); return pulseMetrics.find((p) => p.community_id === communityId); },
  async getAllCurrent(): Promise<PulseMetric[]> { await simulateLatency(); return pulseMetrics; },
  async getHistory(communityId: string): Promise<PulseHistory | undefined> { await simulateLatency(200); return pulseHistory.find((h) => h.community_id === communityId); },
};
