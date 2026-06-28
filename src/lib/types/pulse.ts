export type PulseTrend = 'up' | 'stable' | 'down';

export interface PulseMetric {
  community_id: string;
  activity: number;
  engagement: number;
  retention: number;
  mentorship: number;
  overall_health: number;
  trend: PulseTrend;
  measured_at: string;
}

export interface PulseHistory {
  community_id: string;
  history: PulseMetric[];
}
