export type DelegationStatus = 'proposed' | 'accepted' | 'declined' | 'completed';

export interface Delegation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  community_id: string;
  title: string;
  description: string;
  status: DelegationStatus;
  created_at: string;
  accepted_at: string | null;
  completed_at: string | null;
}
