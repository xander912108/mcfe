export type CommunityCategory =
  | 'business'
  | 'education'
  | 'creative'
  | 'wellness'
  | 'tech'
  | 'social';

export interface Community {
  id: string;
  name: string;
  description: string;
  leader_id: string;
  city: string;
  category: CommunityCategory;
  member_count: number;
  max_members: number | null;
  is_private: boolean;
  health_score: number;
  founded_at: string;
}

export interface CommunitySummary {
  id: string;
  name: string;
  city: string;
  category: CommunityCategory;
  member_count: number;
  health_score: number;
}
