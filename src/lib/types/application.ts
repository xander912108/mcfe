export type ApplicationStatus =
  | 'pending'
  | 'interview'
  | 'approved'
  | 'rejected'
  | 'withdrawn';

export interface Application {
  id: string;
  community_id: string;
  applicant_id: string;
  status: ApplicationStatus;
  message: string;
  reviewed_by: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
}
