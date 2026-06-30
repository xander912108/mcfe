import type { User, UserSummary } from '../types';
import type { PaginatedResponse, PaginationParams } from '@/lib/pagination';
import { users } from '../mocks/users.mock';
import { paginateArray } from '@/lib/pagination';
import { simulateLatency } from './client';

// TODO: Заменить чтение моков на вызовы Tarantool: callTarantool('users.get_*', args).
export const usersApi = {
  async getAll(): Promise<User[]> {
    await simulateLatency();
    return users;
  },

  async getAllPaginated(params: PaginationParams = {}): Promise<PaginatedResponse<User>> {
    await simulateLatency();
    return paginateArray(users, params);
  },

  async getById(id: string): Promise<User | undefined> {
    await simulateLatency(100);
    return users.find((u) => u.id === id);
  },

  async getSummaries(communityId: string): Promise<UserSummary[]> {
    await simulateLatency();

    return users
      .filter((u) => u.community_ids.includes(communityId))
      .map(({ id, name, avatar_url, city, role, activity_score }) => ({
        id,
        name,
        avatar_url,
        city,
        role,
        activity_score,
      }));
  },

  async getByRole(role: User['role']): Promise<User[]> {
    await simulateLatency();
    return users.filter((u) => u.role === role);
  },
};
