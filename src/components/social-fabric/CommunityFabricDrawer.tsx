import React from 'react';
import { AlertTriangle, Heart, Info, Play, TrendingDown, TrendingUp, Users, X } from 'lucide-react';

interface CommunityFabricDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  leaderNodes: any[];
  setSelectedNode: (node: any) => void;
}

export const CommunityFabricDrawer: React.FC<CommunityFabricDrawerProps> = ({
  isOpen,
  onClose,
  leaderNodes,
  setSelectedNode,
}) => {
  const [showPageInfo, setShowPageInfo] = React.useState(false);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-[320px] z-50 flex flex-col"
        style={{
          background: 'var(--bg-card)',
          borderLeft: '1px solid var(--border-color)',
          boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 shrink-0"
          style={{ borderBottom: '1px solid var(--border-color)' }}
        >
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium text-[var(--text-primary)]">Ткань сообщества</h2>
            <button
              onClick={() => setShowPageInfo(!showPageInfo)}
              className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
              title="О странице"
            >
              <Info className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
              className="w-full lg:w-[240px] shrink-0 space-y-5 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto"
              style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
          >
            {/* Header */}
            <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium text-[var(--text-primary)]">Ткань сообщества</h2>
                  <button onClick={() => setShowPageInfo(!showPageInfo)} className="text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors" title="О странице">
                    <Info className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1">{leaderNodes.length} участников · обновлено 2 мин назад</p>
              {showPageInfo && (
                <div className="mt-2 p-2.5 rounded-lg" style={{ background: 'rgba(201,169,110,0.06)', border: '1px solid rgba(201,169,110,0.1)' }}>
                  <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">Эта страница показывает, как участники связаны между собой: где уже появилась взаимная поддержка, где всё ещё держится на лидере, кто соединяет группы, кому нужна первая связь и где пора выращивать новые роли.</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1.5 leading-relaxed italic">Не рейтинг участников и не контроль активности. Это карта заботы.</p>
                </div>
              )}
              {/* Period selector */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-[10px] text-[var(--text-muted)]">Период:</span>
                <div className="flex items-center gap-0.5 rounded-lg p-0.5 border" style={{ background: 'var(--hover-bg)', borderColor: 'var(--border-color)' }}>
                  {[7, 30, 90].map((d) => (
                    <button
                      key={d}
                      onClick={() => topology === 'density' && setPulsePeriod(d)}
                      disabled={topology !== 'density'}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-medium transition-all ${
                        topology !== 'density'
                          ? 'text-[var(--text-muted)] cursor-not-allowed'
                          : pulsePeriod === d
                            ? 'bg-[var(--gold)]/20 text-[var(--gold)] border border-[var(--gold)]/30'
                            : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                      }`}
                    >
                      {d}д
                    </button>
                  ))}
                </div>
                {topology !== 'density' && <span className="text-[10px] text-[var(--text-muted)]">для Пульс</span>}
              </div>
            </div>

            {/* What changed */}
            <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-2">Что изменилось за {pulsePeriod} дней</p>
              <div className="p-2.5 rounded-xl" style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <div className="space-y-1.5">
                  {pulseMetricsByPeriod[pulsePeriod]?.changed.map((item, i) => {
                    const colorMap: Record<string, { text: string; dot: string }> = {
                      emerald: { text: '#4ade80', dot: '#22c55e' },
                      amber: { text: '#fbbf24', dot: '#f59e0b' },
                      red: { text: '#f87171', dot: '#ef4444' },
                      slate: { text: 'var(--text-muted)', dot: 'var(--text-muted)' },
                    };
                    const c = colorMap[item.color] || colorMap.slate;
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: c.dot }} />
                        <span className="text-[11px]" style={{ color: c.text }}>{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Metrics */}
            <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Метрики</p>
              <div className="space-y-2">
                {(() => {
                  const pm = pulseMetricsByPeriod[pulsePeriod] || pulseMetricsByPeriod[7];
                  return [
                    { key: 'density', label: 'Плотность связей', desc: 'Насколько участники связаны', value: `${pm.density}%`, trend: pm.trend.density, bar: pm.density, color: '#C9A96E' },
                    { key: 'leaderDependency', label: 'Зависимость от лидера', desc: 'Сигнал выращивать помощников', value: `${pm.leaderDependency}%`, trend: pm.trend.leaderDependency, bar: pm.leaderDependency, color: pm.leaderDependency > 60 ? '#f59e0b' : '#C9A96E', warning: pm.leaderDependency > 60 },
                    { key: 'isolation', label: 'Нужна первая связь', desc: 'Точка заботы', value: `${pm.isolation} уч.`, trend: pm.trend.isolation, bar: pm.isolation * 25, color: '#ef4444' },
                    { key: 'decaying', label: 'Угасание связей', desc: 'Сигнал для ритуала', value: `${pm.decaying}`, trend: pm.trend.decaying, bar: pm.decaying * 20, color: '#f59e0b' },
                    { key: 'overloaded', label: 'Перегрузка помощников', desc: 'Стоит беречь', value: `${pm.overload || 0}`, trend: pm.trend.overloaded || 0, bar: (pm.overload || 0) * 25, color: '#ed8936' },
                  ];
                })().map((metric: any) => {
                  const dir = metricDirections[metric.key] || 'neutral';
                  const trendGood = dir === 'good' ? metric.trend > 0 : dir === 'bad' ? metric.trend < 0 : false;
                  const trendBad = dir === 'good' ? metric.trend < 0 : dir === 'bad' ? metric.trend > 0 : false;
                  return (
                    <div key={metric.label} className="p-2.5 rounded-xl" style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] text-[var(--text-secondary)]">{metric.label}</span>
                        <div className="flex items-center gap-1">
                          {metric.trend > 0 ? <TrendingUp className={`w-3 h-3 ${trendGood ? 'text-emerald-500' : trendBad ? 'text-red-400' : 'text-[var(--text-muted)]'}`} />
                           : metric.trend < 0 ? <TrendingDown className={`w-3 h-3 ${trendGood ? 'text-emerald-500' : trendBad ? 'text-red-400' : 'text-[var(--text-muted)]'}`} /> : null}
                          <span className={`text-[11px] font-medium ${metric.warning ? 'text-[var(--gold)]' : 'text-[var(--text-primary)]'}`}>{metric.value}</span>
                          {metric.trend !== 0 && <span className={`text-[10px] ${trendGood ? 'text-emerald-500' : trendBad ? 'text-red-400' : 'text-[var(--text-muted)]'}`}>{metric.trend > 0 ? '+' : ''}{metric.trend}%</span>}
                        </div>
                      </div>
                      <p className="text-[10px] text-[var(--text-muted)] mb-1.5">{metric.desc}</p>
                      <div className="h-1 rounded-full overflow-hidden isolate" style={{ background: 'var(--hover-bg)' }}>
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(metric.bar, 100)}%`, background: metric.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Signals */}
            <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Сигналы ({leaderSignals.length})</p>
              <div className="space-y-2">
                {leaderSignals.map((signal, i) => (
                  <button
                    key={i}
                    className="w-full flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all"
                    style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
                    onClick={() => { const node = leaderNodes.find((n) => n.id === signal.nodeId); if (node) setSelectedNode(node); }}
                  >
                    {signalIcons[signal.type]}
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-[var(--text-secondary)]">{signal.message}</p>
                      {(signal as any).desc && <p className="text-[10px] text-[var(--text-muted)] mt-1">{(signal as any).desc}</p>}
                      <button
                        className="mt-1.5 text-[10px] font-medium px-2.5 py-1 rounded-lg transition-all"
                        style={{
                          background: signal.type === 'isolation' ? 'rgba(245,158,11,0.12)' : signal.type === 'overload' ? 'rgba(239,68,68,0.1)' : 'rgba(201,169,110,0.12)',
                          color: signal.type === 'isolation' ? '#fbbf24' : signal.type === 'overload' ? '#f87171' : 'var(--gold)',
                          border: `1px solid ${signal.type === 'isolation' ? 'rgba(245,158,11,0.2)' : signal.type === 'overload' ? 'rgba(239,68,68,0.15)' : 'rgba(201,169,110,0.2)'}`,
                        }}
                        onClick={(e) => { e.stopPropagation(); console.log('Action:', signal.action, signal.nodeId); }}
                      >
                        {signal.action.replace('Назначить', 'Подобрать')}
                      </button>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="px-4 py-3">
              <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">Действия</p>
              <div className="space-y-2">
                {[
                  { icon: <Users className="w-4 h-4" />, label: 'Welcome Loop', color: 'var(--gold)' },
                  { icon: <Play className="w-4 h-4" />, label: 'День разборов', color: 'var(--text-secondary)' },
                  { icon: <Heart className="w-4 h-4" />, label: 'Помощь-день', color: 'var(--text-secondary)' },
                  { icon: <AlertTriangle className="w-4 h-4" />, label: 'Назначить наставников', color: 'var(--gold)' },
                ].map((btn) => (
                  <button
                    key={btn.label}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-medium transition-all"
                    style={{ background: 'var(--hover-bg)', color: btn.color, border: '1px solid var(--border-color)' }}
                  >
                    {btn.icon}
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
      </div>
    </>
  );
};
