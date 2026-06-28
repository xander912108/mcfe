import type { Community } from '../types';
import { mockId, daysAgo } from './helpers';

export const communities: Community[] = [
  {
    id: mockId('c', 1),
    name: 'Предприниматели Москвы',
    description:
      'Закрытое сообщество владельцев малого и среднего бизнеса. Еженедельные встречи, разбор кейсов, нетворкинг.',
    leader_id: mockId('u', 1),
    city: 'Москва',
    category: 'business',
    member_count: 47,
    max_members: 80,
    is_private: true,
    health_score: 0.82,
    founded_at: daysAgo(400),
  },
  {
    id: mockId('c', 2),
    name: 'Творческая мастерская «Поток»',
    description:
      'Сообщество художников, дизайнеров и фотографов. Совместные проекты, выставки, менторство.',
    leader_id: mockId('u', 2),
    city: 'Санкт-Петербург',
    category: 'creative',
    member_count: 28,
    max_members: null,
    is_private: false,
    health_score: 0.91,
    founded_at: daysAgo(280),
  },
  {
    id: mockId('c', 3),
    name: 'IT-менторы России',
    description:
      'Сообщество опытных разработчиков, помогающих junior-специалистам найти первую работу и вырасти.',
    leader_id: mockId('u', 3),
    city: 'Казань',
    category: 'tech',
    member_count: 63,
    max_members: 100,
    is_private: false,
    health_score: 0.45,
    founded_at: daysAgo(200),
  },
  {
    id: mockId('c', 4),
    name: 'Wellness-клуб «Баланс»',
    description:
      'Йога, медитация, осознанность. Еженедельные онлайн-практики и оффлайн-ретриты.',
    leader_id: mockId('u', 6),
    city: 'Москва',
    category: 'wellness',
    member_count: 35,
    max_members: 50,
    is_private: true,
    health_score: 0.76,
    founded_at: daysAgo(160),
  },
  {
    id: mockId('c', 5),
    name: 'Образовательный хаб «Знание»',
    description:
      'Публичные лекции, книжные клубы, дискуссионные вечера для тех, кто любит учиться.',
    leader_id: mockId('u', 2),
    city: 'Санкт-Петербург',
    category: 'education',
    member_count: 91,
    max_members: null,
    is_private: false,
    health_score: 0.68,
    founded_at: daysAgo(350),
  },
];
