import type { PulseMetric, PulseHistory } from '../types';
import { mockId, daysAgo } from './helpers';

function makeMetric(
  communityId: string,
  daysOffset: number,
  overrides: Partial<PulseMetric> = {},
): PulseMetric {
  return {
    community_id: communityId,
    activity: 0.7,
    engagement: 0.65,
    retention: 0.72,
    mentorship: 0.6,
    overall_health: 0.67,
    trend: 'stable',
    measured_at: daysAgo(daysOffset),
    ...overrides,
  };
}

export const pulseMetrics: PulseMetric[] = [
  makeMetric(mockId('c', 1), 0, {
    activity: 0.82,
    engagement: 0.78,
    retention: 0.85,
    mentorship: 0.75,
    overall_health: 0.82,
    trend: 'up',
  }),
  makeMetric(mockId('c', 2), 0, {
    activity: 0.88,
    engagement: 0.92,
    retention: 0.9,
    mentorship: 0.85,
    overall_health: 0.91,
    trend: 'up',
  }),
  makeMetric(mockId('c', 3), 0, {
    activity: 0.55,
    engagement: 0.4,
    retention: 0.38,
    mentorship: 0.42,
    overall_health: 0.45,
    trend: 'down',
  }),
  makeMetric(mockId('c', 4), 0, {
    activity: 0.7,
    engagement: 0.75,
    retention: 0.8,
    mentorship: 0.72,
    overall_health: 0.76,
    trend: 'stable',
  }),
  makeMetric(mockId('c', 5), 0, {
    activity: 0.62,
    engagement: 0.6,
    retention: 0.7,
    mentorship: 0.55,
    overall_health: 0.68,
    trend: 'down',
  }),
];

export const pulseHistory: PulseHistory[] = [
  {
    community_id: mockId('c', 1),
    history: [
      makeMetric(mockId('c', 1), 30, { overall_health: 0.72 }),
      makeMetric(mockId('c', 1), 23, { overall_health: 0.75 }),
      makeMetric(mockId('c', 1), 16, { overall_health: 0.78 }),
      makeMetric(mockId('c', 1), 9, { overall_health: 0.8 }),
      makeMetric(mockId('c', 1), 0, { overall_health: 0.82 }),
    ],
  },
  {
    community_id: mockId('c', 3),
    history: [
      makeMetric(mockId('c', 3), 30, { overall_health: 0.65 }),
      makeMetric(mockId('c', 3), 23, { overall_health: 0.6 }),
      makeMetric(mockId('c', 3), 16, { overall_health: 0.55 }),
      makeMetric(mockId('c', 3), 9, { overall_health: 0.5 }),
      makeMetric(mockId('c', 3), 0, { overall_health: 0.45 }),
    ],
  },
];
