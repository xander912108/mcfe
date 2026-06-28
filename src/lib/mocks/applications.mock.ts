import type { Application } from '../types';
import { mockId, daysAgo, hoursAgo } from './helpers';

export const applications: Application[] = [
  { id: mockId('app', 1), community_id: mockId('c', 1), applicant_id: mockId('u', 13), status: 'pending', message: 'Хочу развивать свой бизнес и найти единомышленников.', reviewed_by: null, review_note: null, created_at: daysAgo(5), updated_at: daysAgo(5) },
  { id: mockId('app', 2), community_id: mockId('c', 1), applicant_id: mockId('u', 18), status: 'pending', message: 'Ранее был участником, хочу вернуться.', reviewed_by: null, review_note: null, created_at: daysAgo(8), updated_at: daysAgo(8) },
  { id: mockId('app', 3), community_id: mockId('c', 3), applicant_id: mockId('u', 14), status: 'pending', message: 'Хочу найти ментора в React-разработке.', reviewed_by: null, review_note: null, created_at: hoursAgo(6), updated_at: hoursAgo(6) },
  { id: mockId('app', 4), community_id: mockId('c', 2), applicant_id: mockId('u', 15), status: 'interview', message: 'Я начинающий иллюстратор, хочу расти в комьюнити.', reviewed_by: mockId('u', 2), review_note: 'Запланирована встреча на пятницу.', created_at: daysAgo(3), updated_at: daysAgo(1) },
  { id: mockId('app', 5), community_id: mockId('c', 1), applicant_id: mockId('u', 8), status: 'approved', message: 'Маркетолог, хочу делиться опытом.', reviewed_by: mockId('u', 1), review_note: 'Отличный кандидат, активный в Telegram.', created_at: daysAgo(92), updated_at: daysAgo(90) },
  { id: mockId('app', 6), community_id: mockId('c', 1), applicant_id: mockId('u', 20), status: 'rejected', message: 'Хочу присоединиться.', reviewed_by: mockId('u', 1), review_note: 'Не подходит по профилю на текущем этапе.', created_at: daysAgo(310), updated_at: daysAgo(305) },
];
