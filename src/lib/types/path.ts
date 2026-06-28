export type PathStage = 'onboarding' | 'active' | 'mentor' | 'leader';
export type TimelineStepStatus = 'completed' | 'active' | 'locked';

export interface PathProgress {
  user_id: string;
  stage: PathStage;
  stage_label: string;
  stage_description: string;
  goal_title: string;
  goal_description: string;
  first_connection: {
    exists: boolean;
    user_id: string | null;
    name: string | null;
    avatar_url: string | null;
  };
  contribution_count: number;
  contribution_goal: number;
  completed_at: string | null;
}

export interface PathStep {
  id: string;
  label: string;
  description: string;
  status: TimelineStepStatus;
  icon_name: string;
  order: number;
}

export interface DailyStep {
  id: string;
  title: string;
  description: string;
  benefits: string[];
  checklist: ChecklistItem[];
  cta_label: string;
  cta_href: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  done: boolean;
}
