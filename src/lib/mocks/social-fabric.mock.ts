import type { SocialConnection } from '../types';
import { mockId, daysAgo } from './helpers';

export const socialConnections: SocialConnection[] = [
  { id: mockId('sc', 1), from_user_id: mockId('u', 1), to_user_id: mockId('u', 4), strength: 0.85, type: 'mentorship', formed_at: daysAgo(140) },
  { id: mockId('sc', 2), from_user_id: mockId('u', 1), to_user_id: mockId('u', 5), strength: 0.72, type: 'collaboration', formed_at: daysAgo(170) },
  { id: mockId('sc', 3), from_user_id: mockId('u', 1), to_user_id: mockId('u', 8), strength: 0.78, type: 'mentorship', formed_at: daysAgo(88) },
  { id: mockId('sc', 4), from_user_id: mockId('u', 4), to_user_id: mockId('u', 9), strength: 0.65, type: 'friendship', formed_at: daysAgo(100) },
  { id: mockId('sc', 5), from_user_id: mockId('u', 8), to_user_id: mockId('u', 9), strength: 0.7, type: 'collaboration', formed_at: daysAgo(80) },
  { id: mockId('sc', 6), from_user_id: mockId('u', 1), to_user_id: mockId('u', 13), strength: 0.25, type: 'acquaintance', formed_at: daysAgo(3) },
  { id: mockId('sc', 7), from_user_id: mockId('u', 3), to_user_id: mockId('u', 10), strength: 0.6, type: 'mentorship', formed_at: daysAgo(80) },
  { id: mockId('sc', 8), from_user_id: mockId('u', 3), to_user_id: mockId('u', 11), strength: 0.72, type: 'collaboration', formed_at: daysAgo(100) },
  { id: mockId('sc', 9), from_user_id: mockId('u', 10), to_user_id: mockId('u', 14), strength: 0.2, type: 'acquaintance', formed_at: daysAgo(5) },
];
