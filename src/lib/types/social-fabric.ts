export type ConnectionType =
  | 'mentorship'
  | 'collaboration'
  | 'friendship'
  | 'acquaintance';

export interface SocialConnection {
  id: string;
  from_user_id: string;
  to_user_id: string;
  strength: number;
  type: ConnectionType;
  formed_at: string;
}

export interface ClusterNode {
  user_id: string;
  x: number;
  y: number;
  label: string;
  role: string;
  activity_score: number;
  connections_count: number;
}

export interface ClusterEdge {
  from: string;
  to: string;
  weight: number;
  type: ConnectionType;
}
