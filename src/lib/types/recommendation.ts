export type RecommendationType =
  | 'delegate'
  | 'onboard'
  | 'engage'
  | 'connect'
  | 'celebrate'
  | 'urgent'
  | 'weekly_review';

export type RecommendationPriority = 1 | 2 | 3 | 4 | 5;

export interface Recommendation {
  id: string;
  user_id: string;
  community_id: string | null;
  type: RecommendationType;
  title: string;
  message: string;
  explanation: string;
  priority: RecommendationPriority;
  target_user_ids: string[];
  is_read: boolean;
  is_dismissed: boolean;
  created_at: string;
  expires_at: string | null;
}
