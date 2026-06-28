import type { Application, ApplicationStatus } from '../types';
import { applications } from '../mocks/applications.mock';
import { simulateLatency } from './client';

// TODO: Заменить чтение и обновление моков на Tarantool: callTarantool('applications.*', args).
export const applicationsApi = {
  async getAll(): Promise<Application[]> { await simulateLatency(); return applications; },
  async getByCommunity(communityId: string): Promise<Application[]> { await simulateLatency(); return applications.filter((a) => a.community_id === communityId); },
  async getByStatus(status: ApplicationStatus): Promise<Application[]> { await simulateLatency(); return applications.filter((a) => a.status === status); },
  async getStale(daysThreshold = 3): Promise<Application[]> {
    await simulateLatency();
    const cutoff = Date.now() - daysThreshold * 24 * 60 * 60 * 1000;
    return applications.filter((a) => a.status === 'pending' && new Date(a.created_at).getTime() < cutoff);
  },
  async updateStatus(id: string, status: ApplicationStatus, reviewedBy: string, note?: string): Promise<Application | undefined> {
    await simulateLatency(300);
    const app = applications.find((a) => a.id === id);
    if (!app) return undefined;
    console.log(`[MOCK] Application ${id} → ${status} by ${reviewedBy}`);
    return { ...app, status, reviewed_by: reviewedBy, review_note: note ?? null, updated_at: new Date().toISOString() };
  },
};
