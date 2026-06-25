import React, { useEffect, useMemo } from 'react';
import { X, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { GraphNode } from '@/data/graphData';

export interface SignalItem {
  type: string;
  nodeId: string;
  message: string;
  action: string;
  desc?: string;
}

export interface PulseMetric {
  density: number;
  leaderDependency: number;
  isolation: number;
  decaying: number;
  overload: number;
  trend: {
    density: number;
    leaderDependency: number;
    isolation: number;
    decaying: number;
    overloaded: number;
  };
  changed: { label: string; color: 'emerald' | 'amber' | 'red' | 'slate' }[];
}

export interface CommunityFabricDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  topology: string;
  setPulsePeriod: (p: number) => void;
  pulsePeriod: number;
  pulseMetricsByPeriod: Record<number, PulseMetric>;
  metricDirections: Record<string, 'good' | 'bad' | 'neutral'>;
  leaderSignals: SignalItem[];
  signalIcons: Record<string, React.ReactNode>;
}

const METRIC_LABELS: Record<string, { label: string; desc: string; key: string }> = {
  density: { label: 'Плотность', desc: 'Связанность участников', key: 'density' },
  leaderDependency: { label: 'Зависимость от лидера', desc: 'Связи через лидера', key: 'leaderDependency' },
  isolation: { label: 'Изоляция', desc: 'Без устойчивых связей', key: 'isolation' },
  decaying: { label: 'Угасание', desc: 'Связи на исходе', key: 'decaying' },
  overload: { label: 'Перегрузка', desc: 'Много запросов помощи', key: 'overload' },
};

const PERIODS = [
  { value: 7, label: '7 дн' },
  { value: 30, label: '30 дн' },
  { value: 90, label: '90 дн' },
];

export const CommunityFabricDrawer: React.FC<CommunityFabricDrawerProps> = ({
  isOpen,
  onClose,
  setPulsePeriod,
  pulsePeriod,
  pulseMetricsByPeriod,
  metricDirections,
  leaderSignals,
  signalIcons,
}) => {
  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const metrics = pulseMetricsByPeriod[pulsePeriod] || pulseMetricsByPeriod[7];

  const metricEntries = useMemo(() => {
    return Object.entries(METRIC_LABELS).map(([k, v]) => {
      const val = (metrics as any)[k] as number;
      const trend = (metrics.trend as any)[k === 'overload' ? 'overloaded' : k] as number;
      const dir = metricDirections[k] || 'neutral';
      return { ...v, value: val, trend, dir, rawKey: k };
    });
  }, [metrics, metricDirections]);

  const colorMap: Record<string, string> = {
    emerald: '#10b981',
    amber: '#f59e0b',
    red: '#ef4444',
    slate: '#64748b',
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(4px)' }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col overflow-hidden"
        style={{
          width: 'clamp(280px, 85vw, 380px)',
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-8px 0 32px rgba(0,0,0,0.2)',
          animation: 'slideInDrawer 300ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        }}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">Ткань сообщества</h2>
            <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Метрики и сигналы в реальном времени</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg transition-all hover:scale-105"
            style={{ background: 'var(--hover-bg)', color: 'var(--text-muted)' }}
            title="Закрыть (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

          {/* Period switcher */}
          <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
            {PERIODS.map((p) => (
              <button
                key={p.value}
                onClick={() => setPulsePeriod(p.value)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-medium transition-all duration-200 ${
                  pulsePeriod === p.value
                    ? 'shadow-sm'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                }`}
                style={{
                  background: pulsePeriod === p.value ? 'var(--bg-card)' : 'transparent',
                  color: pulsePeriod === p.value ? 'var(--text-primary)' : undefined,
                  border: pulsePeriod === p.value ? '1px solid var(--border-color)' : '1px solid transparent',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Metrics grid */}
          <div className="space-y-3">
            <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Показатели пульса</p>
            <div className="space-y-2.5">
              {metricEntries.map((m) => {
                const trendGood = m.dir === 'good' ? m.trend > 0 : m.dir === 'bad' ? m.trend < 0 : false;
                const trendBad = m.dir === 'good' ? m.trend < 0 : m.dir === 'bad' ? m.trend > 0 : false;
                const isGood = m.dir === 'good';
                const isBad = m.dir === 'bad';
                const barColor = isGood ? 'rgba(16,185,129,0.8)' : isBad ? 'rgba(239,68,68,0.7)' : 'rgba(100,116,139,0.6)'';
                return (
                  <div key={m.rawKey} className="p-3 rounded-xl" style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div>
                        <span className="text-[11px] font-medium text-[var(--text-primary)]">{m.label}</span>
                        <p className="text-[10px] text-[var(--text-muted)]">{m.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {m.trend > 0 ? (
                          <TrendingUp className={`w-3 h-3 ${trendGood ? 'text-emerald-500' : trendBad ? 'text-red-400' : 'text-[var(--text-muted)]'}`} />
                        ) : m.trend < 0 ? (
                          <TrendingDown className={`w-3 h-3 ${trendGood ? 'text-emerald-500' : trendBad ? 'text-red-400' : 'text-[var(--text-muted)]'}`} />
                        ) : (
                          <Minus className="w-3 h-3 text-[var(--text-muted)]" />
                        )}
                        <span className={`text-[11px] font-semibold ${trendGood ? 'text-emerald-500' : trendBad ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
                          {m.value}{m.rawKey === 'density' ? '%' : ''}
                        </span>
                        {m.trend !== 0 && (
                          <span className={`text-[10px] ${trendGood ? 'text-emerald-500' : trendBad ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>
                            {m.trend > 0 ? '+' : ''}{m.trend}%
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.08)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${Math.min(m.value, 100)}%`, background: barColor }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Changed items */}
          {metrics.changed && metrics.changed.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">Изменения за период</p>
              <div className="space-y-1.5">
                {metrics.changed.map((c, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg text-[11px]" style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: colorMap[c.color] || 'var(--text-muted)' }} />
                    <span className="text-[var(--text-secondary)]">{c.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signals */}
          {leaderSignals.length > 0 && (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
                Сигналы <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>{leaderSignals.length}</span>
              </p>
              <div className="space-y-2">
                {leaderSignals.map((signal, idx) => (
                  <div key={idx} className="p-3 rounded-xl space-y-2" style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-start gap-2.5">
                      <div className="shrink-0 mt-0.5 text-[var(--gold)]">
                        {signalIcons[signal.type] || <span className="w-3 h-3 block rounded-full bg-[var(--gold)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">{signal.message}</p>
                        {signal.desc && <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">{signal.desc}</p>}
                      </div>
                    </div>
                    <button
                      className="w-full text-[10px] font-medium px-3 py-1.5 rounded-lg transition-all hover:opacity-90"
                      style={{
                        background: signal.type === 'isolation' ? 'rgba(245,158,11,0.12)' : signal.type === 'overload' ? 'rgba(239,68,68,0.1)' : 'rgba(201,169,110,0.12)',
                        color: signal.type === 'isolation' ? '#fbbf24' : signal.type === 'overload' ? '#f87171' : 'var(--gold)',
                        border: `1px solid ${signal.type === 'isolation' ? 'rgba(245,158,11,0.2)' : signal.type === 'overload' ? 'rgba(239,68,68,0.15)' : 'rgba(201,169,110,0.2)'}`,
                      }}
                      onClick={() => console.log('Action:', signal.action, signal.nodeId)}
                    >
                      {signal.action.replace('Назначить', 'Подобрать')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state if no signals */}
          {leaderSignals.length === 0 && (
            <div className="py-8 text-center">
              <p className="text-[11px] text-[var(--text-muted)]">Нет активных сигналов</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">Все участники в хорошей форме</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideInDrawer {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </>
  );
};
