import type { PathProgress, PathStep, DailyStep } from '../types';
import { pathProgressMap, pathSteps, dailySteps } from '../mocks/path.mock';
import { simulateLatency } from './client';

// TODO: Заменить чтение и обновление моков на Tarantool: callTarantool('path.*', args).
export const pathApi = {
  async getProgress(userId: string): Promise<PathProgress | undefined> {
    await simulateLatency(150);
    return pathProgressMap[userId];
  },

  async getTimeline(userId: string): Promise<PathStep[]> {
    await simulateLatency(100);
    console.log(`[MOCK] Load timeline for ${userId}`);
    return pathSteps;
  },

  async getDailyStep(userId: string): Promise<DailyStep | undefined> {
    await simulateLatency(100);
    return dailySteps[userId];
  },

  async toggleChecklistItem(stepId: string, itemId: string): Promise<DailyStep | undefined> {
    await simulateLatency(100);
    console.log(`[MOCK] Toggle checklist item ${itemId} in step ${stepId}`);

    return Object.values(dailySteps).find((s) => s.id === stepId);
  },
};
