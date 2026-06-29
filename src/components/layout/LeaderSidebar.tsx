import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { navigationConfig, type NavigationItemId } from '@/lib/navigation/config';
import { getNavigationLabel } from '@/lib/navigation/labels';

type NavigationConfigItem = (typeof navigationConfig)[number];
type LeaderSidebarItem = Extract<NavigationConfigItem, { surface: 'leader' }>;
type LeaderTab = 'main' | 'entry' | 'requests' | 'connections' | 'contribution' | 'monetization' | 'settings';

interface LeaderSidebarProps {
  activeConsoleTab: LeaderTab;
}

const leaderSidebarItems = navigationConfig.filter(
  (item): item is LeaderSidebarItem => item.surface === 'leader' && item.binding.owner === 'leader-shell',
);

const leaderSidebarLabels: Partial<Record<NavigationItemId, string>> = {
  'leader-console': 'Главное сейчас',
  'leader-contribution': 'Вклад',
};

const leaderSidebarCounts: Partial<Record<NavigationItemId, number>> = {
  'leader-entry': 5,
  'leader-requests': 0,
  'leader-contribution': 9,
  'leader-monetization': 1,
};

function getLeaderSidebarLabel(item: LeaderSidebarItem): string {
  return leaderSidebarLabels[item.id] ?? getNavigationLabel(item);
}

export function LeaderSidebar({ activeConsoleTab }: LeaderSidebarProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <nav className="space-y-1 flex-1 pt-2">
        {leaderSidebarItems.map((item) => {
          const Icon = item.icon;
          const tab = item.binding.leaderTab ?? 'main';
          const count = leaderSidebarCounts[item.id];

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`nav-item ${activeConsoleTab === tab ? 'active' : ''} justify-between w-full text-left`}
            >
              <div className="flex items-center gap-3">
                <Icon className="nav-icon" /><span>{getLeaderSidebarLabel(item)}</span>
              </div>
              {count !== undefined && (
                <span
                  className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold"
                  style={{
                    backgroundColor: count > 5 ? 'rgba(201, 112, 106, 0.15)' : 'rgba(212, 175, 55, 0.12)',
                    color: count > 5 ? '#C9706A' : 'var(--gold)',
                  }}
                >{count}</span>
              )}
            </button>
          );
        })}
      </nav>
      {/* Back to community */}
      <div className="pt-4 pb-2 px-1">
        <div className="h-px mb-4" style={{ backgroundColor: 'var(--border-color)' }} />
        <button
          onClick={() => navigate('/')}
          className="hover-text-primary w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium"
          style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>Вернуться в сообщество</span>
        </button>
      </div>
    </div>
  );
}
