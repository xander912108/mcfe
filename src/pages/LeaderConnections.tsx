import { useState, useMemo, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import {
  TrendingUp, TrendingDown, Users, AlertTriangle, Star, Zap,
  Heart, Play, Info, X, Maximize2, Minimize2, Activity,
} from 'lucide-react';
import {
  communityCenter, leaderNodes, leaderEdges, leaderSignals,
  pulseMetricsByPeriod, metricDirections,
} from '@/data/graphData';
import { PremiumStarGraph } from '@/components/social-fabric/PremiumStarGraph';
import { PulseTopology } from '@/components/social-fabric/PulseTopology';
import {
  ClustersTopology, findClusters, findBridges,
  computeCentrality, getClusterName,
} from '@/components/social-fabric/ClustersTopology';
import { HealthTopology, STATUS_COLORS } from '@/components/social-fabric/HealthTopology';
import { TopologySwitcher } from '@/components/social-fabric/TopologySwitcher';
import { FilterPanel } from '@/components/social-fabric/FilterPanel';
import { FocusLegendOverlay } from '@/components/social-fabric/FocusLegendOverlay';
import { EmptyStateCanvas } from '@/components/social-fabric/EmptyStateCanvas';
import { NodeCard } from '@/components/social-fabric/NodeCard';
import { LeaderConnectionList } from '@/components/social-fabric/LeaderConnectionList';
import { SkeletonList, SkeletonCanvas } from '@/components/social-fabric/SkeletonLoader';
import { ZoomButton } from '@/components/social-fabric/ZoomButton';
import { useCamera } from '@/hooks/useCamera';
import type { GraphNode } from '@/data/graphData';

export default function LeaderConnections({ darkMode = true }: { darkMode?: boolean }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [focusMode, setFocusMode] = useState(false);
  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode-active');
      document.body.style.overflow = 'hidden';
    } else {
      document.body.classList.remove('focus-mode-active');
      document.body.style.overflow = '';
    }
    return () => {
      document.body.classList.remove('focus-mode-active');
      document.body.style.overflow = '';
    };
  }, [focusMode]);

  const topology = searchParams.get('tab') || 'network';
  const setTopology = useCallback((value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  }, [setSearchParams]);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<{
    id: number; name: string; members: GraphNode[];
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, boolean>>({});
  const [showPageInfo, setShowPageInfo] = useState(false);
  const [pulsePeriod, setPulsePeriod] = useState(7);
  const [searchQuery] = useState('');
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  // Camera for zoom controls
  const cam = useCamera(canvasSize.width, canvasSize.height, 0.82);

  // Smooth tab transition: fade + slide
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayTopology, setDisplayTopology] = useState(topology);
  const pendingTopologyRef = useRef<string | null>(null);

  const handleTopologyChange = useCallback((value: string) => {
    if (value === topology || isTransitioning) return;
    pendingTopologyRef.current = value;
    setIsTransitioning(true);
    // Phase 1: fade out (150ms)
    setTimeout(() => {
      setDisplayTopology(value);
      setTopology(value);
      // Phase 2: fade in after swap
      requestAnimationFrame(() => {
        setIsTransitioning(false);
      });
    }, 180);
  }, [topology, isTransitioning, setTopology]);

  const containerDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerDivRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [displayTopology]);

  const allNodes = useMemo(() => leaderNodes.filter((n) => n.id !== 'me'), []);

  const activeFilterCount = useMemo(
    () => Object.values(filters).filter(Boolean).length,
    [filters]
  );

  // Status counts for Health tab inline filters
  const statusCounts = useMemo(() => ({
    active: allNodes.filter((n) => n.status === 'active').length,
    stuck: allNodes.filter((n) => n.status === 'stuck').length,
    burnout_risk: allNodes.filter((n) => n.status === 'burnout_risk').length,
    inactive: allNodes.filter((n) => n.status === 'inactive').length,
  }), [allNodes]);
  const totalCount = allNodes.length;
  const STATUS_FILTER_ORDER = ['', 'active', 'stuck', 'burnout_risk', 'inactive'] as const;
  const filteredNodes = useMemo(() => {
    let nodes = [...allNodes];
    const activeFilters = Object.entries(filters)
      .filter(([, v]) => v)
      .map(([k]) => k);
    if (activeFilters.length > 0) {
      nodes = nodes.filter((n) =>
        activeFilters.some((key) => {
          switch (key) {
            case 'active': return n.status === 'active';
            case 'attention':
              return n.status === 'inactive'
                || n.status === 'stuck'
                || n.status === 'burnout_risk';
            case 'support': return n.status === 'stuck';
            case 'stuck': return n.status === 'stuck';
            case 'connectors': return n.role === 'Связующий';
            case 'helpReady': return n.isHelpReady;
            default: return true;
          }
        })
      );
    }
    return nodes;
  }, [allNodes, filters]);

  const filteredEdges = useMemo(() => {
    const nodeIds = new Set([...filteredNodes.map((n) => n.id), 'me']);
    return leaderEdges.filter(
      (e) => nodeIds.has(e.source) && nodeIds.has(e.target)
    );
  }, [filteredNodes]);

  // Search filtering
  const searchFilteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return filteredNodes;
    const q = searchQuery.toLowerCase();
    return filteredNodes.filter((n) =>
      n.name.toLowerCase().includes(q) ||
      (n.role && n.role.toLowerCase().includes(q)) ||
      (n.goals && n.goals.some((g) => g.toLowerCase().includes(q)))
    );
  }, [filteredNodes, searchQuery]);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedCluster(null);
    setSelectedNode(node);
  }, []);



  const handleClusterClick = useCallback(
    (clusterId: number, clusterName: string, members: GraphNode[]) => {
      setSelectedNode(null);
      setSelectedCluster({ id: clusterId, name: clusterName, members });
    },
    []
  );

  const signalIcons: Record<string, React.ReactNode> = {
    isolation: <AlertTriangle className="w-4 h-4 text-red-400" />,
    connector: <Star className="w-4 h-4 text-amber-400" />,
    overload: <Zap className="w-4 h-4 text-orange-400" />,
    potential: <Heart className="w-4 h-4 text-pink-400" />,
  };

  // ESC exits focus mode
  useEffect(() => {
    if (!focusMode) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFocusMode(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focusMode]);

  /* ── render ────────────────────────────────────────────── */
  return (
    <div className={darkMode ? 'dark' : ''} style={{ height: focusMode ? '100vh' : '100%' }}>
    <div className={`${focusMode ? 'h-screen' : 'h-full'} flex flex-col ${focusMode ? 'bg-[var(--bg-main)]' : ''}`}>

      {/* ═══ PAGE HEADER ═══ */}
      {!focusMode && (
        <div className="shrink-0 px-5 pb-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-[var(--text-muted)]">Консоль лидера</span>
            <span className="text-[var(--gold)]">{'>'}</span>
            <span className="text-[var(--text-secondary)] font-medium">Связи</span>
          </div>
          <h1 className="text-xl font-semibold text-[var(--text-primary)] tracking-tight">
            {topology === 'network' ? 'Структура сообщества'
              : topology === 'density' ? 'Пульс сообщества'
              : topology === 'clusters' ? 'Естественные группы'
              : topology === 'health' ? 'Состояние ткани'
              : 'Список действий'}
          </h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">
            {topology === 'network' ? 'Где есть опора, где держится на лидере, кто соединяет группы и кому нужна поддержка.'
              : topology === 'density' ? `Живые действия за ${pulsePeriod} дней — не счётчик сообщений, а реальная активность.`
              : topology === 'clusters' ? 'Кто уже связан между собой, кто соединяет группы и кому нужна первая связь.'
              : topology === 'health' ? 'Бережная диагностика участников и связей — кто в ядре, кто на периферии, кто нуждается в поддержке.'
              : 'Кому помочь, кого разгрузить, кого признать и где укрепить связи.'}
          </p>
          {/* Micro-stats */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Users className="w-3.5 h-3.5" /> <strong style={{ color: 'var(--text-primary)' }}>{allNodes.length}</strong> участников
            </span>
            <span className="w-px h-3" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Activity className="w-3.5 h-3.5" /> <strong style={{ color: 'var(--gold)' }}>{(pulseMetricsByPeriod[pulsePeriod] || pulseMetricsByPeriod[7]).density}%</strong> плотность
            </span>
            <span className="w-px h-3" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <AlertTriangle className="w-3.5 h-3.5" /> <strong style={{ color: '#f59e0b' }}>{leaderSignals.length}</strong> сигналов
            </span>
            {activeFilterCount > 0 && (
              <>
                <span className="w-px h-3" style={{ background: 'var(--border-color)' }} />
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--gold)' }}>
                  <Zap className="w-3.5 h-3.5" /> <strong>{activeFilterCount}</strong> фильтров
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ CONTENT: Canvas + Right Sidebar ═══ */}
      <div className={`flex-1 flex gap-4 min-h-0 overflow-hidden ${focusMode ? 'h-full p-4' : 'px-5 pb-4'}`}>
        <div className="flex-1 min-w-0 flex flex-col">

          {/* Toolbar */}
          <div className={`flex items-center ${focusMode ? 'justify-end p-4' : 'justify-between'}`}>
            {!focusMode && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <TopologySwitcher value={topology} onChange={handleTopologyChange} mode="leader" />
              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9">
                <FilterPanel
                  mode="leader"
                  onFilterChange={setFilters}
                  activeCount={activeFilterCount}
                  buttonPositionClassName="top-0 right-0"
                  panelPositionClassName="top-10 right-0"
                  topology={topology}
                />
              </div>
              <button
                onClick={() => setFocusMode(!focusMode)}
                className="w-8 h-8 flex items-center justify-center rounded-lg transition-all border"
                style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
                title={focusMode ? 'Выйти из фокуса (ESC)' : 'Фокус-режим'}
              >
                {focusMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Canvas container with gold gradient border */}
          <div className={`flex-1 relative isolate min-h-0 ${focusMode ? 'h-full p-0' : 'rounded-2xl p-px'}`} style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.25), rgba(201,169,110,0.05) 40%, rgba(201,169,110,0.08) 60%, rgba(201,169,110,0.2))' }}>
            <div
              ref={containerDivRef}
              className={`relative overflow-hidden w-full h-full ${focusMode ? '' : 'rounded-2xl'}`}
              style={{ background: 'var(--bg-card)' }}
            >
            {filteredNodes.length === 0 && topology !== 'list' && (
              <EmptyStateCanvas mode="leader" hasFilters={activeFilterCount > 0} onClearFilters={activeFilterCount > 0 ? () => setFilters({}) : undefined} />
            )}

            {/* Legend overlay */}
            {topology !== 'list' && (
              <FocusLegendOverlay topology={topology} mode="leader" focusMode={focusMode} />
            )}

            {/* Status filters — health tab */}
            {topology === 'health' && (
              <div className={`absolute z-30 flex items-center gap-2 transition-all duration-300 left-1/2 -translate-x-1/2 ${focusMode ? 'top-14' : 'top-3'}`}>
                <div className="flex flex-wrap items-center gap-1.5">
                  {STATUS_FILTER_ORDER.map((key) => {
                    const sc = key ? STATUS_COLORS[key] : null;
                    const count = key ? statusCounts[key as keyof typeof statusCounts] : totalCount;
                    const label = key ? sc!.shortLabel : 'Все';
                    const isActive = (key === '' && !statusFilter) || statusFilter === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key || null)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] font-medium transition-all duration-200 border ${
                          isActive
                            ? 'bg-[var(--gold)]/15 text-[var(--gold)] border-[var(--gold)]/25'
                            : 'bg-[var(--hover-bg)] text-[var(--text-muted)] border-[var(--border-color)] hover:text-[var(--text-secondary)]'
                        }`}
                      >
                        {sc && <div className="w-1.5 h-1.5 rounded-full" style={{ background: sc.border }} />}
                        <span>{label}</span>
                        <span className={isActive ? 'text-[var(--gold)]/70' : 'text-[var(--text-muted)]'}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Skeleton during tab transition */}
            {isTransitioning && (
              <div className="absolute inset-0 z-40" style={{ background: 'var(--bg-card)' }}>
                {displayTopology === 'list' ? <SkeletonList count={6} /> : <SkeletonCanvas />}
              </div>
            )}

            {/* Canvas content — with key for guaranteed remount */}
            {topology === 'list' ? (
              <div className="w-full h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                <div className="flex-1 min-h-0 overflow-y-auto">
                <LeaderConnectionList
                  nodes={searchFilteredNodes}
                  edges={filteredEdges}
                  signals={leaderSignals}
                  currentUserId="me"
                  selectedNodeId={selectedNode?.id || null}
                  onNodeClick={handleNodeClick}
                  onMessage={(node) => console.log('Message', node.name)}
                  onRequestHelp={(node) => console.log('Help', node.name)}
                />
                </div>
              </div>
            ) : (
              <div className="w-full h-full">
                {displayTopology === 'density' ? (
                  <PulseTopology nodes={filteredNodes}
                    edges={filteredEdges}
                    onNodeHover={() => {}}
                    onNodeClick={handleNodeClick}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    focusMode={focusMode}
                    darkMode={darkMode}
                    period={pulsePeriod}
                    onPeriodChange={setPulsePeriod}
                    camera={cam}
                  />
                ) : displayTopology === 'clusters' ? (
                  <ClustersTopology nodes={filteredNodes}
                    edges={filteredEdges}
                    onNodeHover={() => {}}
                    onNodeClick={handleNodeClick}
                    onClusterClick={handleClusterClick}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    focusMode={focusMode}
                    darkMode={darkMode}
                    camera={cam}
                  />
                ) : displayTopology === 'health' ? (
                  <HealthTopology nodes={allNodes}
                    edges={filteredEdges}
                    onNodeHover={() => {}}
                    onNodeClick={handleNodeClick}
                    onStatusFilter={setStatusFilter}
                    activeStatusFilter={statusFilter}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    focusMode={focusMode}
                    darkMode={darkMode}
                    camera={cam}
                  />
                ) : (
                  <PremiumStarGraph centerNode={communityCenter}
                    connectedNodes={filteredNodes}
                    edges={filteredEdges}
                    onNodeHover={() => {}}
                    onNodeClick={handleNodeClick}
                    mode="leader"
                    width={canvasSize.width}
                    height={canvasSize.height}
                    centerLabel="MC"
                    centerSubtitle="Mentori Club"
                    focusMode={focusMode}
                    darkMode={darkMode}
                    camera={cam}
                  />
                )}
              </div>
            )}

            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
              <ZoomButton label="Увеличить" onClick={cam.zoomIn}>+</ZoomButton>
              <ZoomButton label="Уменьшить" onClick={cam.zoomOut}>{'\u2212'}</ZoomButton>
              <ZoomButton label="Сбросить вид" onClick={cam.reset}>{'\u2316'}</ZoomButton>
            </div>
          </div>
          </div>{/* gold border wrapper */}
        </div>

        {/* ═══ RIGHT SIDEBAR: Ткань сообщества ═══ */}
        {!focusMode && (
            <aside
              className="hidden lg:flex w-[240px] shrink-0 flex-col gap-3 self-start"
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
          </aside>
        )}
      </div>

      {/* ═══ SLIDE-OVER PANELS ═══ */}
      {/* Selected cluster */}
      {selectedCluster && topology === 'clusters' && (
        <>
          <div className="fixed inset-0 z-30" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={() => setSelectedCluster(null)} />
          <div className="fixed inset-y-0 right-0 z-40 w-96 overflow-y-auto" style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)' }}>
            {(() => {
              const cEdges = filteredEdges.filter((e) => selectedCluster.members.some((m) => m.id === e.source) && selectedCluster.members.some((m) => m.id === e.target));
              const coreCount = selectedCluster.members.filter((m) => {
                const me = cEdges.filter((e) => e.source === m.id || e.target === m.id);
                const tw = me.reduce((s, e) => s + e.weight, 0);
                return me.length >= 2 && tw / Math.max(me.length, 1) > 4;
              }).length;
              const bridgeCount = filteredEdges.filter((e) => {
                const sIn = selectedCluster.members.some((m) => m.id === e.source);
                const tIn = selectedCluster.members.some((m) => m.id === e.target);
                return sIn !== tIn;
              }).length;
              const isoCount = selectedCluster.members.filter((m) => cEdges.filter((e) => e.source === m.id || e.target === m.id).length === 0).length;
              return (
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-[var(--text-primary)] text-sm">{selectedCluster.name}</h3>
                      <p className="text-[11px] text-[var(--text-muted)] mt-1">{selectedCluster.members.length} участников</p>
                    </div>
                    <button onClick={() => setSelectedCluster(null)} className="p-1.5 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-xs"><span className="text-[var(--text-secondary)]">В ядре группы</span><span className="text-[var(--text-primary)] font-medium">{coreCount}</span></div>
                    <div className="flex items-center justify-between text-xs"><span className="text-[var(--text-secondary)]">На периферии</span><span className="text-[var(--text-primary)] font-medium">{selectedCluster.members.length - coreCount - isoCount}</span></div>
                    {isoCount > 0 && <div className="flex items-center justify-between text-xs text-red-400"><span>Нужна первая связь</span><span className="font-medium">{isoCount}</span></div>}
                    {bridgeCount > 0 && <div className="flex items-center justify-between text-xs text-amber-400"><span>Связей с другими группами</span><span className="font-medium">{bridgeCount}</span></div>}
                  </div>
                  <div className="space-y-1.5">
                    {selectedCluster.members.map((m) => (
                      <button key={m.id} onClick={() => handleNodeClick(m)} className="w-full flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors hover:bg-[var(--hover-bg)]">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0 ${m.isOnline ? 'bg-[var(--hover-bg)] text-[var(--text-secondary)]' : 'bg-[var(--bg-card)] text-[var(--text-muted)]'}`}>
                          {m.name.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs text-[var(--text-secondary)] truncate">{m.name}</p>
                          {m.role && <p className="text-[10px] text-[var(--text-muted)] truncate">{m.role}</p>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>
        </>
      )}

      {/* Selected node */}
      {selectedNode && (() => {
        const cMap = findClusters(filteredNodes, filteredEdges);
        const bridges = findBridges(filteredEdges, cMap);
        const cid = cMap.get(selectedNode.id) ?? -1;
        const cNodes = filteredNodes.filter((n) => (cMap.get(n.id) ?? -1) === cid);
        const cName = cid === -1 ? null : getClusterName(cNodes);
        const isBridge = bridges.has(selectedNode.id);
        const centrality = computeCentrality(selectedNode.id, filteredEdges);
        const cRole = cid === -1 ? ('isolated' as const) : isBridge ? ('bridge' as const) : centrality > 0.5 ? ('core' as const) : ('periphery' as const);
        return (
          <>
            <div className="fixed inset-0 z-30" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={() => setSelectedNode(null)} />
            <div className="fixed inset-y-0 right-0 z-40 w-96 overflow-y-auto" style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)' }}>
              <NodeCard
                node={selectedNode}
                edges={filteredEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)}
                currentUserId="me"
                onClose={() => setSelectedNode(null)}
                mode="leader"
                period={pulsePeriod}
                clusterName={cName || undefined}
                clusterRole={cRole}
                statusExplanation={(() => {
                  const s = selectedNode.status;
                  const name = selectedNode.name.split(' ')[0];
                  const ne = filteredEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id);
                  if (s === 'inactive') return `${name} пока не вошла в живые связи сообщества — нет устойчивых контактов. Стоит мягко подобрать наставника или включить в Welcome Loop.`;
                  if (s === 'stuck') return `${name} задержалась на шаге — у неё ${ne.length} связей, но движение приостановилось. Может помочь мягкий разбор или новый импульс.`;
                  if (s === 'burnout_risk') return `${name} активно помогает другим (${ne.length} связей помощи), но близка к перегрузке. Ей может понадобиться разгрузка.`;
                  return `${name} стабильно участвует в группе — ${ne.length} связей, устойчивое движение. Может стать опорой для новичков.`;
                })()}
              />
            </div>
          </>
        );
      })()}
    </div>
    </div>
  );
}


