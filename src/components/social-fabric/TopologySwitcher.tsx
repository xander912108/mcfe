import { Globe, Circle, Share2, List, LayoutGrid, Activity } from 'lucide-react';

/* Custom icon: 3 concentric circles for "Круги" */
function CirclesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5.5" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export type Topology = 'star' | 'circles' | 'network' | 'list';
export type LeaderTopology = 'network' | 'density' | 'clusters' | 'health' | 'list';

interface TopologySwitcherProps {
  value: string;
  onChange: (t: string) => void;
  mode: 'participant' | 'leader';
}

const participantTopologies = [
  { id: 'star', label: 'Мой мир', icon: Globe },
  { id: 'circles', label: 'Круги', icon: CirclesIcon },
  { id: 'list', label: 'Список', icon: List },
];

const leaderTopologies = [
  { id: 'network', label: 'Сеть', icon: Share2 },
  { id: 'density', label: 'Пульс', icon: Activity },
  { id: 'clusters', label: 'Кластеры', icon: LayoutGrid },
  { id: 'health', label: 'Состояние', icon: Circle },
  { id: 'list', label: 'Список', icon: List },
];

export function TopologySwitcher({ value, onChange, mode }: TopologySwitcherProps) {
  const items = mode === 'leader' ? leaderTopologies : participantTopologies;

  return (
    <div className="flex items-center gap-1">
      {items.map((t) => {
        const Icon = t.icon;
        const isActive = value === t.id;
        const activeClasses = isActive
          ? 'border shadow-[0_0_12px_rgba(201,169,110,0.2)]'
          : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]/50 border border-transparent';
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 ' +
              activeClasses
            }
            style={isActive ? { background: 'rgba(201,169,110,0.2)', color: 'var(--gold)', borderColor: 'rgba(201,169,110,0.3)' } : {}}
            title={t.label}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        );
      })}
    </div>
  );
}
