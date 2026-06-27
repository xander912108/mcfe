import { useState, useRef, useEffect } from 'react';
import { Filter, Check } from 'lucide-react';

interface FilterPanelProps {
  mode: 'participant' | 'leader';
  onFilterChange: (filters: Record<string, boolean>) => void;
  activeFilters?: Record<string, boolean>;
  activeCount?: number;
  buttonPositionClassName?: string;
  panelPositionClassName?: string;
  topology?: string;
}

// ── Participant filters per tab ──────────────────────────

const starFilterGroups = [
  {
    title: 'Тип связи',
    filters: [
      { key: 'helpedMe', label: 'Кто помогал мне', default: true },
      { key: 'iHelped', label: 'Кому помог я', default: true },
      { key: 'gratitude', label: 'Была благодарность', default: false },
      { key: 'sameFlow', label: 'Были со мной в потоке', default: false },
    ],
  },
  {
    title: 'Повод обратиться',
    filters: [
      { key: 'goodReason', label: 'Есть хороший повод', default: false },
      { key: 'possibleNew', label: 'Возможная новая связь', default: false },
      { key: 'stale', label: 'Связь давно не обновлялась', default: false },
      { key: 'helpReady', label: 'Готовы помочь', default: false },
    ],
  },
  {
    title: 'Контекст',
    filters: [
      { key: 'sameTrack', label: 'Общий трек', default: false },
      { key: 'sameStep', label: 'Общий шаг', default: false },
      { key: 'similarGoal', label: 'Похожая цель', default: false },
      { key: 'myTopic', label: 'Моя тема', default: false },
    ],
  },
  {
    title: 'Доступность',
    filters: [
      { key: 'online', label: 'Онлайн', default: false },
      { key: 'helpReadyAvail', label: 'Готов помочь', default: false },
    ],
  },
];

const circlesFilterGroups = [
  {
    title: 'Круг близости',
    filters: [
      { key: 'ringOpora', label: 'Опоры', default: false },
      { key: 'ringBlizkie', label: 'Ближние', default: false },
      { key: 'ringKollegi', label: 'Коллеги', default: false },
      { key: 'ringZnakomye', label: 'Знакомые', default: false },
      { key: 'ringPotencial', label: 'Потенциальные', default: false },
    ],
  },
  {
    title: 'Состояние связи',
    filters: [
      { key: 'alive', label: 'Живые связи', default: false },
      { key: 'stale', label: 'Давно не обновлялись', default: false },
      { key: 'canCreate', label: 'Можно создать новую связь', default: false },
    ],
  },
  {
    title: 'Действие',
    filters: [
      { key: 'thank', label: 'Кого поблагодарить', default: false },
      { key: 'askAdvice', label: 'У кого попросить совет', default: false },
      { key: 'offerHelp', label: 'Кому можно помочь', default: false },
      { key: 'meet', label: 'С кем познакомиться', default: false },
    ],
  },
  {
    title: 'Повод',
    filters: [
      { key: 'sameStep', label: 'Общий шаг', default: false },
      { key: 'similarGoal', label: 'Похожая цель', default: false },
      { key: 'helpReady', label: 'Готов помочь', default: false },
      { key: 'recommended', label: 'Рекомендован системой', default: false },
    ],
  },
];

const participantListFilterGroups = [
  {
    title: 'Группа',
    filters: [
      { key: 'ringOpora', label: 'Опоры', default: false },
      { key: 'ringBlizkie', label: 'Ближние', default: false },
      { key: 'ringKollegi', label: 'Коллеги', default: false },
      { key: 'ringZnakomye', label: 'Знакомые', default: false },
      { key: 'ringPotencial', label: 'Потенциальные', default: false },
    ],
  },
  {
    title: 'Статус',
    filters: [
      { key: 'helpReady', label: 'Готов помочь', default: false },
      { key: 'online', label: 'Онлайн', default: false },
      { key: 'hasReason', label: 'Есть повод обратиться', default: false },
      { key: 'stale', label: 'Связь давно не обновлялась', default: false },
    ],
  },
  {
    title: 'Контекст',
    filters: [
      { key: 'sameTrack', label: 'Мой трек', default: false },
      { key: 'sameStep', label: 'Мой шаг', default: false },
      { key: 'similarGoal', label: 'Похожая цель', default: false },
      { key: 'myTopic', label: 'Тема', default: false },
    ],
  },
];

function getParticipantFilterGroups(topology?: string) {
  switch (topology) {
    case 'star': return starFilterGroups;
    case 'circles': return circlesFilterGroups;
    case 'list': return participantListFilterGroups;
    default: return starFilterGroups;
  }
}

// ── Leader filters per tab ───────────────────────────────

const networkFilters = [
  { key: 'edgeType', label: 'Тип связи', default: false },
  { key: 'roles', label: 'Роли', default: false },
  { key: 'helpReady', label: 'Готовы помочь', default: false },
  { key: 'throughLeader', label: 'Через лидера', default: false },
  { key: 'betweenMembers', label: 'Между участниками', default: false },
  { key: 'attention', label: 'Требуют внимания', default: false },
];

const pulseFilters = [
  { key: 'newConnections', label: 'Новые связи', default: false },
  { key: 'gratitude', label: 'Благодарности', default: false },
  { key: 'help', label: 'Помощь', default: false },
  { key: 'review', label: 'Разборы', default: false },
  { key: 'fading', label: 'Угасают', default: false },
  { key: 'firstConnection', label: 'Первая связь', default: false },
];

const clusterFilters = [
  { key: 'tightGroups', label: 'Тесные группы', default: false },
  { key: 'bridges', label: 'Мосты', default: false },
  { key: 'periphery', label: 'Периферия', default: false },
  { key: 'firstConnection', label: 'Нужна первая связь', default: false },
  { key: 'byTopics', label: 'По темам', default: false },
  { key: 'byFlows', label: 'По потокам', default: false },
];

const healthFilters = [
  { key: 'active', label: 'В движении', default: true },
  { key: 'support', label: 'Нужен импульс', default: true },
  { key: 'burnout_risk', label: 'Может устать', default: true },
  { key: 'firstConnection', label: 'Первая связь', default: true },
  { key: 'stuck', label: 'Задержался на шаге', default: true },
];

const listFilters = [
  { key: 'attention', label: 'Требуют внимания', default: false },
  { key: 'connectors', label: 'Связующие', default: false },
  { key: 'helpReady', label: 'Готовы помогать', default: false },
  { key: 'roleCandidates', label: 'Кандидаты на роль', default: false },
  { key: 'stable', label: 'Устойчивые', default: false },
];

function getLeaderFilters(topology?: string) {
  switch (topology) {
    case 'network': return networkFilters;
    case 'density': return pulseFilters;
    case 'clusters': return clusterFilters;
    case 'health': return healthFilters;
    case 'list': return listFilters;
    default: return networkFilters;
  }
}





export function FilterPanel({ mode, onFilterChange, activeFilters: externalFilters, activeCount = 0, buttonPositionClassName, panelPositionClassName, topology }: FilterPanelProps) {
  const currentLeaderFilters = mode === 'leader' ? getLeaderFilters(topology) : [];
  const currentParticipantGroups = mode === 'participant' ? getParticipantFilterGroups(topology) : [];
  const allCurrentParticipantFilters = mode === 'participant'
    ? currentParticipantGroups.flatMap((g) => g.filters)
    : [];

  const [isOpen, setIsOpen] = useState(false);
  const [internalFilters, setInternalFilters] = useState<Record<string, boolean>>(() => {
    const defaults: Record<string, boolean> = {};
    if (mode === 'leader') {
      currentLeaderFilters.forEach((f) => { defaults[f.key] = f.default; });
    } else {
      allCurrentParticipantFilters.forEach((f) => { defaults[f.key] = f.default; });
    }
    return defaults;
  });

  const filters = externalFilters ?? internalFilters;
  const setFilters = externalFilters ? (next: Record<string, boolean>) => onFilterChange(next) : setInternalFilters;
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen]);

  const toggleFilter = (key: string) => {
    const next = { ...filters, [key]: !filters[key] };
    setFilters(next);
    onFilterChange(next);
  };

  return (
    <div className="absolute inset-0 overflow-visible pointer-events-none" ref={panelRef}>
      {/* Compact button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`absolute z-30 overflow-visible w-9 h-9 flex items-center justify-center rounded-lg transition-all duration-300 group pointer-events-auto border backdrop-blur bg-[var(--bg-card)]/80 border-[var(--border-color)] hover:border-[var(--border-color)] ${buttonPositionClassName ?? 'right-14 top-3'}`}
        style={{
          background: isOpen ? 'rgba(201,169,110,0.12)' : 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          border: isOpen ? '1px solid rgba(201,169,110,0.2)' : '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)',
        }}
        title="Фильтры"
      >
        <Filter className={`w-4 h-4 transition-colors ${isOpen ? 'text-[var(--gold)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-primary)]'}`} />
        {activeCount > 0 && (
          <span
            className="absolute -top-2 -right-2 flex min-w-[18px] h-[18px] items-center justify-center rounded-full px-1 text-[9px] font-semibold shadow-[0_8px_18px_rgba(201,169,110,0.22)] ring-2 ring-[var(--bg-card)]"
            style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.95), rgba(176,141,76,0.92))', color: '#17130d', border: '1px solid rgba(255,255,255,0.28)' }}
          >
            {activeCount}
          </span>
        )}
      </button>

      {/* Expanded panel */}
      {isOpen && (
        <div
          className={`absolute w-80 z-50 max-h-[70vh] overflow-y-auto rounded-2xl pointer-events-auto ${panelPositionClassName ?? 'right-14 top-14'}`}
          style={{ background: 'var(--bg-card)', backdropFilter: 'blur(32px)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(201,169,110,0.12)' }}>
                <Filter className="w-3.5 h-3.5 text-[var(--gold)]" />
              </div>
              <h4 className="text-sm font-semibold text-[var(--text-primary)]">Фильтры</h4>
            </div>

            {mode === 'leader' ? (
              <>
                <h5 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">
                  {topology === 'network' && 'Структура'}
                  {topology === 'density' && 'Активность'}
                  {topology === 'clusters' && 'Группы'}
                  {topology === 'health' && 'Состояние'}
                  {topology === 'list' && 'Диагностика'}
                  {!topology && 'Фильтры'}
                </h5>
                <div className="space-y-0.5">
                  {currentLeaderFilters.map((item) => (
                    <PremiumCheckbox
                      key={item.key}
                      checked={filters[item.key] ?? false}
                      onChange={() => toggleFilter(item.key)}
                      label={item.label}
                    />
                  ))}
                </div>
                <div className="mt-3 pt-3 flex gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => { const allOn: Record<string, boolean> = {}; currentLeaderFilters.forEach((f) => (allOn[f.key] = true)); setFilters(allOn); onFilterChange(allOn); }}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                  >Все</button>
                  <button
                    onClick={() => { const allOff: Record<string, boolean> = {}; currentLeaderFilters.forEach((f) => (allOff[f.key] = false)); setFilters(allOff); onFilterChange(allOff); }}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                  >Сбросить</button>
                </div>
              </>
            ) : (
              <>
                {currentParticipantGroups.map((group, gi) => (
                  <div key={group.title} className={gi > 0 ? 'mt-4 pt-3' : ''} style={gi > 0 ? { borderTop: '1px solid var(--border-color)' } : {}}>
                    <h5 className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-2">{group.title}</h5>
                    <div className="space-y-0.5">
                      {group.filters.map((item) => (
                        <PremiumCheckbox
                          key={item.key}
                          checked={filters[item.key] ?? false}
                          onChange={() => toggleFilter(item.key)}
                          label={item.label}
                        />
                      ))}
                    </div>
                  </div>
                ))}
                <div className="mt-4 pt-3 flex gap-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                  <button
                    onClick={() => { const allOn: Record<string, boolean> = {}; allCurrentParticipantFilters.forEach((f) => (allOn[f.key] = true)); setFilters(allOn); onFilterChange(allOn); }}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                  >Все</button>
                  <button
                    onClick={() => { const allOff: Record<string, boolean> = {}; allCurrentParticipantFilters.forEach((f) => (allOff[f.key] = false)); setFilters(allOff); onFilterChange(allOff); }}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
                  >Сбросить</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Premium custom checkbox — entire row is clickable
function PremiumCheckbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 group"
      onClick={onChange}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--hover-bg)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div
        className="w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all duration-200 pointer-events-none"
        style={{
          background: checked ? 'rgba(201,169,110,0.2)' : 'var(--border-color)',
          border: checked ? '1px solid rgba(201,169,110,0.4)' : '1px solid var(--border-color)',
        }}
      >
        {checked && <Check className="w-3 h-3 text-[var(--gold)]" />}
      </div>
      <span className={`text-sm transition-colors pointer-events-none ${checked ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)] group-hover:text-[var(--text-secondary)]'}`}>{label}</span>
    </div>
  );
}
