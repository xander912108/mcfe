export type UserRole = 'leader' | 'mentor' | 'member' | 'newcomer';
export type UserStatus = 'active' | 'inactive' | 'suspended';

export interface User {
  id: string;
  name: string;
  avatar_url: string | null;
  city: string;
  role: UserRole;
  status: UserStatus;
  bio: string;
  activity_score: number;
  trust_level: number;
  telegram_username: string | null;
  community_ids: string[];
  created_at: string;
  last_seen_at: string;
}

export interface UserSummary {
  id: string;
  name: string;
  avatar_url: string | null;
  city: string;
  role: UserRole;
  activity_score: number;
}
