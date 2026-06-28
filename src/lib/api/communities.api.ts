import type { Community, CommunitySummary } from '../types';
import { communities } from '../mocks/communities.mock';
import { simulateLatency } from './client';

// TODO: Заменить чтение моков на вызовы Tarantool: callTarantool('communities.get_*', args).
export const communitiesApi = {
  async getAll(): Promise<Community[]> {
    await simulateLatency();
    return communities;
  },

  async getById(id: string): Promise<Community | undefined> {
    await simulateLatency(100);
    return communities.find((c) => c.id === id);
  },

  async getByLeader(leaderId: string): Promise<Community[]> {
    await simulateLatency();
    return communities.filter((c) => c.leader_id === leaderId);
  },

  async getSummaries(): Promise<CommunitySummary[]> {
    await simulateLatency();

    return communities.map(({ id, name, city, category, member_count, health_score }) => ({
      id,
      name,
      city,
      category,
      member_count,
      health_score,
    }));
  },
};
