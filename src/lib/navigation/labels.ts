import type { NavigationItem } from '@/lib/navigation/types';

const navigationLabels: Record<string, string> = {
  'nav.home': 'Главная',
  'nav.myPath': 'Мой путь',
  'nav.community': 'Сообщество',
  'nav.learning': 'Обучение',
  'nav.meetings': 'Встречи',
  'nav.connections': 'Мои связи',
  'nav.insights': 'Инсайты',
  'nav.contribution': 'Вклад',
  'nav.communityAbout': 'О сообществе',
  'nav.leaderConsole': 'Консоль лидера',
  'nav.leaderEntry': 'Вступление',
  'nav.leaderRequests': 'Запросы',
  'nav.leaderConnections': 'Связи',
  'nav.leaderContribution': 'Вклад лидера',
  'nav.leaderMonetization': 'Монетизация',
  'nav.leaderSettings': 'Настройки',
};

export function getNavigationLabel(item: NavigationItem): string {
  return navigationLabels[item.labelKey] ?? item.labelKey;
}
