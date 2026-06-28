import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useSearchParams } from 'react-router';
import { Sparkles, ArrowRight, UserPlus, Maximize2, Minimize2, Lightbulb } from 'lucide-react';
import { useCamera } from '@/hooks/useCamera';
import { currentUser, participantNodes, participantEdges, recommendations, bridgeContexts } from '@/data/graphData';
import { PremiumStarGraph } from '@/components/social-fabric/PremiumStarGraph';
import { CirclesTopology } from '@/components/social-fabric/CirclesTopology';

import { TopologySwitcher } from '@/components/social-fabric/TopologySwitcher';
import { RingMetricsPanel } from '@/components/social-fabric/RingMetricsPanel';
import { FilterPanel } from '@/components/social-fabric/FilterPanel';
import { FocusLegendOverlay } from '@/components/social-fabric/FocusLegendOverlay';
import { NodeCard } from '@/components/social-fabric/NodeCard';
import { RingCard } from '@/components/social-fabric/RingCard';
import { NodeTooltip } from '@/components/social-fabric/NodeTooltip';
import { ConnectionList } from '@/components/social-fabric/ConnectionList';
import { EmptyStateCanvas } from '@/components/social-fabric/EmptyStateCanvas';
import { PageHero } from '@/components/layout/PageHero';
import { SkeletonList, SkeletonCanvas } from '@/components/social-fabric/SkeletonLoader';
import { ZoomButton } from '@/components/social-fabric/ZoomButton';
import type { GraphNode, GraphEdge, BridgeContext } from '@/data/graphData';

type FilterableGraphNode = GraphNode & { topics?: string[] };
type FilterableGraphEdge = GraphEdge & { stepContext?: string };

function getRingLabel(nodeId: string, edges: GraphEdge[]): string {
  const edge = edges.find((e) => (e.source === 'me' && e.target === nodeId) || (e.target === 'me' && e.source === nodeId));
  const weight = edge?.weight ?? 0;
  if (weight >= 7) return 'Опоры';
  if (weight >= 5) return 'Близкие';
  if (weight >= 3) return 'Коллеги';
  if (weight >= 1) return 'Знакомые';
  return 'Потенциальные';
}

export default function MyConnections({ darkMode = true }: { darkMode?: boolean }) {
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
  const topology = searchParams.get('tab') || 'star';
  const setTopology = useCallback((value: string) => {
    setSearchParams({ tab: value }, { replace: true });
  }, [setSearchParams]);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);
  const [hoveredScreenPos, setHoveredScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [hoveredBridge, setHoveredBridge] = useState<BridgeContext | null>(null);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedRing, setSelectedRing] = useState<number | null>(null);
  const [hoveredRing, setHoveredRing] = useState<number | null>(null);
  const [hoveredRingScreenPos, setHoveredRingScreenPos] = useState<{ x: number; y: number } | null>(null);
  const [listScenario, setListScenario] = useState('');

  const defaultFilters = useMemo<Record<string, boolean>>(() => ({
    helpedMe: false, iHelped: false, sameFlow: false, sameStep: false,
    gratitude: false, helpReady: false, mentors: false,
    topicDesign: false, topicMarketing: false, topicProduct: false,
    topicAnalytics: false, topicLaunch: false, online: false,
    ringOpora: false, ringBlizkie: false, ringKollegi: false,
    ringZnakomye: false, ringPotencial: false,
  }), []);
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>(defaultFilters);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayTopology, setDisplayTopology] = useState(topology);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const pendingTopologyRef = useRef<string | null>(null);

  const tabOrder = useMemo(() => ['star', 'circles', 'list'], []);

  const handleTopologyChange = useCallback((value: string) => {
    if (value === topology || isTransitioning) return;
    const oldIdx = tabOrder.indexOf(topology);
    const newIdx = tabOrder.indexOf(value);
    setSlideDir(newIdx > oldIdx ? 'right' : 'left');
    pendingTopologyRef.current = value;
    setIsTransitioning(true);
    setTimeout(() => {
      setDisplayTopology(value);
      setTopology(value);
      requestAnimationFrame(() => setIsTransitioning(false));
    }, 180);
  }, [topology, isTransitioning, tabOrder, setTopology]);

  const [advisorTips, setAdvisorTips] = useState([
    {
      level: 1 as const,
      message: 'Петр и Иван проходят тот же трек. Вы можете обменяться опытом.',
      action: 'Посмотреть',
      context: 'Мы показываем это, потому что у вас совпадают цели в треке «Запуск продукта».',
    },
  ]);

  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 700 });
  const containerDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerDivRef.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setCanvasSize({ width: entry.contentRect.width, height: entry.contentRect.height });
      }
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [displayTopology]); // Re-observe when tab changes

  // Camera for zoom controls (shared across all canvas tabs)
  const cam = useCamera(canvasSize.width, canvasSize.height, 0.82);

  const activeFilterKeys = useMemo(() => Object.entries(activeFilters).filter(([, v]) => v).map(([k]) => k), [activeFilters]);
  const hasActiveFilters = activeFilterKeys.length > 0;

  const { filteredNodes, highlightNodeIds, matchingNodes } = useMemo(() => {
    const nodes = participantNodes;
    const nodeMeEdges = (nodeId: string) =>
      participantEdges.filter((e) => (e.source === nodeId && e.target === 'me') || (e.target === nodeId && e.source === 'me'));

    const matchesFilters = (node: GraphNode): boolean => {
      if (!hasActiveFilters) return true;
      const ne = nodeMeEdges(node.id);
      return activeFilterKeys.some((key) => {
        switch (key) {
          case 'helpReady': return node.isHelpReady;
          case 'helpedMe': return ne.some((e) => e.source === node.id && e.target === 'me');
          case 'iHelped': return ne.some((e) => e.source === 'me' && e.target === node.id);
          case 'sameFlow': return ne.some((e) => e.type === 'flow');
          case 'sameStep': return ne.some((e) => Boolean((e as FilterableGraphEdge).stepContext));
          case 'gratitude': return ne.some((e) => e.type === 'gratitude');
          case 'mentors': return node.role === 'Куратор' || node.role === 'Хранитель знаний';
          case 'topicDesign': return (node as FilterableGraphNode).topics?.includes('дизайн') ?? false;
          case 'topicMarketing': return (node as FilterableGraphNode).topics?.includes('маркетинг') ?? false;
          case 'topicProduct': return (node as FilterableGraphNode).topics?.includes('продукт') ?? false;
          case 'topicAnalytics': return (node as FilterableGraphNode).topics?.includes('аналитика') ?? false;
          case 'topicLaunch': return (node as FilterableGraphNode).topics?.includes('запуск') ?? false;
          case 'online': return node.isOnline;
          case 'ringOpora': return ne.some((e) => (e.weight ?? 0) >= 7);
          case 'ringBlizkie': { const w = ne[0]?.weight ?? 0; return w >= 5 && w < 7; }
          case 'ringKollegi': { const w = ne[0]?.weight ?? 0; return w >= 3 && w < 5; }
          case 'ringZnakomye': { const w = ne[0]?.weight ?? 0; return w >= 1 && w < 3; }
          case 'ringPotencial': return ne.length === 0; 
          default: return false;
        }
      });
    };

    const matchingNodes = nodes.filter(matchesFilters);
    const visibleNodes = displayTopology === 'list' ? matchingNodes : nodes;
    const hIds = hasActiveFilters ? new Set(matchingNodes.map((n) => n.id)) : null;
    return { filteredNodes: visibleNodes, highlightNodeIds: hIds, matchingNodes };
  }, [hasActiveFilters, activeFilterKeys, displayTopology]);

  const activeFilterCount = activeFilterKeys.length;


  const listScenarioMatches = useCallback((node: GraphNode, scenario: string) => {
    if (!scenario) return true;
    const ne = participantEdges.filter((e) => e.source === node.id || e.target === node.id);
    switch (scenario) {
      case 'gratitude': return ne.some((e) => e.type === 'gratitude');
      case 'advice': return node.isHelpReady || node.role === 'Куратор' || node.role === 'Хранитель знаний';
      case 'offerHelp': return ne.some((e) => e.source === 'me' && e.target === node.id) || node.goals?.length > 0;
      case 'meet': return ne.length === 0 || ne.every((e) => (e.weight ?? 0) <= 2);
      default: return true;
    }
  }, []);

  const listNodes = useMemo(() => {
    const base = hasActiveFilters ? matchingNodes : participantNodes;
    return base.filter((node) => listScenarioMatches(node, listScenario));
  }, [hasActiveFilters, matchingNodes, listScenario, listScenarioMatches]);

  const listScenarioCounts = useMemo(() => {
    const base = hasActiveFilters ? matchingNodes : participantNodes;
    return {
      all: base.length,
      gratitude: base.filter((node) => listScenarioMatches(node, 'gratitude')).length,
      advice: base.filter((node) => listScenarioMatches(node, 'advice')).length,
      offerHelp: base.filter((node) => listScenarioMatches(node, 'offerHelp')).length,
      meet: base.filter((node) => listScenarioMatches(node, 'meet')).length,
    };
  }, [hasActiveFilters, matchingNodes, listScenarioMatches]);

  const handleNodeHover = useCallback((node: GraphNode | null) => {
    setHoveredNode(node);
  }, []);

  const handleNodeClick = useCallback((node: GraphNode) => {
    setSelectedNode((prev) => (prev?.id === node.id ? null : node));
  }, []);

  const handleDismissTip = useCallback((index: number) => {
    setAdvisorTips((prev) => prev.filter((_, i) => i !== index));
  }, []);

  useEffect(() => {
    if (!focusMode) return;
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocusMode(false); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [focusMode]);

  const slideOverRoot = typeof document === 'undefined' ? null : document.body;

  // Tab descriptions
  const tabDescriptions: Record<string, { title: string; text: string }> = {
    star: { title: 'Ваш личный круг', text: 'Кто уже рядом, кто помогал, кому вы можете быть полезны и с кем можно продолжить связь.' },
    circles: { title: 'Круги близости', text: 'Круги показывают не «важность» людей, а близость живого взаимодействия: кто уже рядом, с кем связь слабее и с кем её можно мягко усилить.' },
    list: { title: 'Список связей', text: 'Быстрый способ найти человека, написать, поблагодарить, попросить совет или предложить помощь.' },
  };

  if (participantEdges.length === 0) {
    return (
      <div className="h-full flex items-center justify-center px-8">
        <div className="text-center max-w-lg">
          <div className="relative mb-8 mx-auto w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-amber-500/10 animate-pulse" />
            <div className="absolute inset-2 rounded-full bg-amber-500/15 animate-pulse" style={{ animationDelay: '0.5s' }} />
            <div className="absolute inset-4 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-amber-300" />
            </div>
            <div className="absolute -inset-4 animate-spin" style={{ animationDuration: '8s' }}>
              <div className="absolute top-0 left-1/2 w-2 h-2 rounded-full bg-amber-400/60" />
            </div>
          </div>
          <h2 className="text-2xl font-light text-[var(--text-primary)] mb-3 tracking-wide">Ваша карта только начинает загораться</h2>
          <p className="text-[var(--text-secondary)] mb-10 leading-relaxed">Сделайте первый шаг в треке — и здесь появятся люди, которые идут рядом или готовы помочь.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-amber-600/90 hover:bg-amber-600 text-white rounded-2xl font-medium transition-all shadow-lg shadow-amber-900/30 border border-amber-500/20">
              <ArrowRight className="w-4 h-4" /> Начать первый трек
            </button>
            <button className="flex items-center justify-center gap-2 px-8 py-3.5 bg-[var(--hover-bg)] text-[var(--text-secondary)] border border-[var(--border-color)] rounded-2xl font-medium transition-all">
              <UserPlus className="w-4 h-4" /> Отметить, с чем нужна помощь
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={darkMode ? 'dark' : ''} style={{ height: focusMode ? '100vh' : 'auto', minHeight: focusMode ? '100vh' : '100%' }}>
    <div className={`${focusMode ? 'h-screen' : 'min-h-full'} flex flex-col ${focusMode ? 'bg-[var(--bg-main)]' : ''}`}>
      {/* ═══ PAGE HEADER ═══ */}
      {!focusMode && (
        <div className="shrink-0 pt-4 pb-3 lg:pr-[260px]">
          <PageHero
            breadcrumbs={['IT технологии', 'Мои связи']}
            title="Мои связи"
            description={tabDescriptions[topology]?.text}
            updatedLabel={`${filteredNodes.length} связей · ${filteredNodes.filter((n) => n.isOnline).length} онлайн · ${recommendations.length} рекомендаций${activeFilterCount > 0 ? ` · ${activeFilterCount} фильтров` : ''}`}
          />
        </div>
      )}

      {/* ═══ CONTENT: Canvas + Right Sidebar ═══ */}
      <div className={`flex-1 flex min-h-0 ${focusMode ? 'h-full overflow-hidden p-4 gap-4' : 'overflow-visible pb-4 gap-5'}`}>
        {/* Left: Canvas area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Toolbar: tabs + filter + focus + search */}
          <div className={`flex items-center mb-3 shrink-0 ${focusMode ? 'justify-end' : 'justify-between'}`}>
            {!focusMode && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <TopologySwitcher value={topology} onChange={handleTopologyChange} mode="participant" />
                {/* Search — only for list tab */}

              </div>
            )}
            <div className="flex items-center gap-2">
              <div className="relative w-9 h-9">
                <FilterPanel
                  mode="participant"
                  activeFilters={activeFilters}
                  activeCount={activeFilterCount}
                  onFilterChange={setActiveFilters}
                  topology={topology}
                  buttonPositionClassName="top-0 right-0"
                  panelPositionClassName="top-12 right-0"
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
          <div className={`relative isolate min-h-0 ${focusMode ? 'flex-1 h-full p-0' : 'w-full aspect-square flex-none rounded-2xl p-px'}`} style={focusMode ? {} : { background: 'linear-gradient(135deg, rgba(201,169,110,0.25), rgba(201,169,110,0.05) 40%, rgba(201,169,110,0.08) 60%, rgba(201,169,110,0.2))' }}>
            <div
              ref={containerDivRef}
              className={`relative overflow-hidden w-full ${focusMode ? 'h-full' : 'h-full rounded-2xl'}`}
              style={{ background: 'var(--bg-card)' }}
            >
            {participantNodes.length === 0 && topology !== 'list' && (
              <EmptyStateCanvas mode="participant" hasFilters={activeFilterCount > 0} onClearFilters={activeFilterCount > 0 ? () => setActiveFilters({}) : undefined} />
            )}

            {/* Legend overlay */}
            {topology !== 'list' && (
              <FocusLegendOverlay topology={topology} mode="participant" focusMode={focusMode} />
            )}

            {/* Skeleton during tab transition */}
            {isTransitioning && (
              <div className="absolute inset-0 z-40" style={{ background: 'var(--bg-card)' }}>
                {displayTopology === 'list' ? <SkeletonList count={6} /> : <SkeletonCanvas />}
              </div>
            )}

            {displayTopology === 'list' ? (
              <div className="h-full flex flex-col overflow-hidden" style={{ background: 'var(--bg-card)' }}>
                {/* Filter bar */}
                <div className="shrink-0 py-3 px-5" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { key: '', label: 'Все', count: listScenarioCounts.all },
                      { key: 'gratitude', label: 'Поблагодарить', count: listScenarioCounts.gratitude },
                      { key: 'advice', label: 'Попросить совет', count: listScenarioCounts.advice },
                      { key: 'offerHelp', label: 'Предложить помощь', count: listScenarioCounts.offerHelp },
                      { key: 'meet', label: 'Познакомиться', count: listScenarioCounts.meet },
                    ].map((f) => (
                      <button
                        key={f.key}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border"
                        style={{
                          borderColor: listScenario === f.key ? 'var(--gold)' : 'var(--border-color)',
                          color: listScenario === f.key ? 'var(--gold)' : 'var(--text-muted)',
                          backgroundColor: listScenario === f.key ? 'rgba(201,169,110,0.08)' : 'transparent',
                        }}
                        onClick={() => setListScenario(f.key)}
                      >
                        {f.label}
                        <span style={{ color: listScenario === f.key ? 'var(--gold)' : 'var(--text-muted)', opacity: 0.7 }}>{f.count}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                    Сегодня можно сделать 3 мягких действия: поблагодарить одного участника, попросить совет и создать новую связь.
                  </p>
                </div>
                <div className="flex-1 min-h-0 overflow-y-auto">
                <ConnectionList
                  nodes={listNodes}
                  edges={participantEdges}
                  currentUserId="me"
                  onNodeClick={handleNodeClick}
                  onMessage={(node) => console.log('Message', node.name)}
                  selectedNodeId={selectedNode?.id || null}
                  activeFilters={activeFilters}
                  onQuickFilter={setActiveFilters}
                  highlightNodeIds={highlightNodeIds ?? undefined}
                />
                </div>
              </div>
            ) : (
              <div
                className="w-full h-full transition-all duration-200 ease-out"
                style={{
                  opacity: isTransitioning ? 0 : 1,
                  transform: isTransitioning ? `translateX(${slideDir === 'right' ? '-16px' : '16px'}) scale(0.985)` : 'translateX(0) scale(1)',
                }}
              >
                {displayTopology === 'circles' ? (
                  <div className="w-full h-full relative">
                    <RingMetricsPanel edges={participantEdges} />
                    <CirclesTopology key="circles-graph"
                      centerNode={currentUser}
                      nodes={participantNodes}
                      edges={participantEdges}
                      onNodeHover={(node) => { setHoveredNode(node); if (!node) setHoveredScreenPos(null); }}
                      onNodeClick={handleNodeClick}
                      onRingClick={(ri) => setSelectedRing(ri)}
                      onRingHover={setHoveredRing}
                      onRingHoverScreenPos={setHoveredRingScreenPos}
                      onHoverScreenPos={setHoveredScreenPos}
                      highlightNodeId={hoveredNode?.id || null}
                      highlightNodeIds={hasActiveFilters ? (highlightNodeIds ?? undefined) : undefined}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      focusMode={focusMode}
                      darkMode={darkMode}
                      camera={cam}
                    />
                    {hoveredRing !== null && !selectedRing && !hoveredNode && hoveredRingScreenPos && (
                      <div className="absolute z-50 pointer-events-none max-w-[240px]" style={{ left: hoveredRingScreenPos.x + 18, top: hoveredRingScreenPos.y - 20 }}>
                        <div className="rounded-xl px-3.5 py-3 shadow-2xl border bg-[var(--bg-card)]/95 backdrop-blur-xl" style={{ borderColor: 'rgba(201,169,110,0.25)' }}>
                          <div className="text-xs font-semibold text-[var(--text-primary)] mb-1">{['Опоры', 'Близкие', 'Коллеги', 'Знакомые', 'Потенциальные'][hoveredRing]}</div>
                          <div className="text-[11px] leading-relaxed text-[var(--text-secondary)]">{['Устойчивые связи: можно попросить совет.', 'Тёплые связи — можно продолжить контакт.', 'Общий контекст — удобно обменяться опытом.', 'Связь пока слабая — её можно мягко оживить.', 'Связи ещё нет, но есть хороший повод познакомиться.'][hoveredRing]}</div>
                        </div>
                      </div>
                    )}
                    {hoveredNode && !selectedNode && hoveredScreenPos && (
                      <div className="absolute z-50 pointer-events-none" style={{ left: hoveredScreenPos.x + 50, top: hoveredScreenPos.y - 30 }}>
                        <NodeTooltip node={hoveredNode} edges={participantEdges} currentUserId="me" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div
                    className="w-full h-full relative"
                    onMouseMove={(e) => setMousePos({ x: e.clientX - e.currentTarget.getBoundingClientRect().left, y: e.clientY - e.currentTarget.getBoundingClientRect().top })}
                  >
                    <PremiumStarGraph key="star-graph"
                      centerNode={currentUser}
                      connectedNodes={participantNodes}
                      edges={participantEdges}
                      onNodeHover={(node) => { handleNodeHover(node); if (!node) setHoveredScreenPos(null); }}
                      onNodeClick={handleNodeClick}
                      onBridgeHover={setHoveredBridge}
                      onHoverScreenPos={setHoveredScreenPos}
                      highlightNodeId={hoveredNode?.id || null}
                      highlightNodeIds={hasActiveFilters ? (highlightNodeIds ?? undefined) : undefined}
                      mode="participant"
                      width={canvasSize.width}
                      height={canvasSize.height}
                      focusMode={focusMode}
                      bridgeContexts={bridgeContexts}
                      darkMode={darkMode}
                      camera={cam}
                    />
                    {hoveredNode && !selectedNode && hoveredScreenPos && (
                      <div className="absolute z-50 pointer-events-none" style={{ left: hoveredScreenPos.x + 50, top: hoveredScreenPos.y - 30 }}>
                        <NodeTooltip node={hoveredNode} edges={participantEdges} currentUserId="me" />
                      </div>
                    )}
                    {hoveredBridge && !selectedNode && (
                      <div className="absolute z-50 pointer-events-none max-w-xs" style={{ left: mousePos.x + 16, top: mousePos.y - 10 }}>
                        <div className="px-3 py-2.5 rounded-xl" style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', border: '1px solid var(--border-color)' }}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            <span className="text-[10px] font-semibold text-teal-400 uppercase tracking-wider">Возможная связь</span>
                          </div>
                          <p className="text-xs text-[var(--text-secondary)] leading-relaxed">{hoveredBridge.description}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Zoom controls — only for canvas tabs */}
            {topology !== 'list' && (
              <div className="absolute bottom-4 right-4 z-20 flex flex-col gap-1">
                <ZoomButton label="Увеличить" onClick={cam.zoomIn}>+</ZoomButton>
                <ZoomButton label="Уменьшить" onClick={cam.zoomOut}>{'\u2212'}</ZoomButton>
                <ZoomButton label="Сбросить вид" onClick={cam.reset}>{'\u2316'}</ZoomButton>
              </div>
            )}
          </div>
          </div>{/* gold border wrapper */}
        </div>

        {/* Right sidebar: recommendations + advisor */}
        {!focusMode && (
          <aside className="hidden lg:flex w-[240px] shrink-0 flex-col gap-3 self-start lg:mt-[49px]">
            {/* ===== РЕКОМЕНДАЦИИ ===== */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Рекомендации</h3>
              </div>
              <div className="space-y-3">
                {recommendations.slice(0, 3).map((rec) => (
                  <div key={rec.id} className="group cursor-pointer" onClick={() => console.log('Connect', rec.id)}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>{rec.name}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed mb-1.5" style={{ color: 'var(--text-secondary)' }}>{rec.reason}</p>
                    <button className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--gold)' }}>{rec.action} →</button>
                  </div>
                ))}
              </div>
            </div>

            {/* ===== ПОДСКАЗКИ ===== */}
            <div className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Подсказки</h3>
              </div>
              <div className="space-y-3">
                {advisorTips.map((tip, i) => (
                  <div key={i}>
                    <p className="text-[11px] leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{tip.message}</p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => console.log('Action', tip.action)} className="text-[10px] px-2.5 py-1 rounded-lg transition-all" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>{tip.action}</button>
                      <button onClick={() => handleDismissTip(i)} className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Скрыть</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* ═══ Slide-over panels ═══ */}
      {slideOverRoot && selectedRing !== null && createPortal(
        <>
          <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={() => setSelectedRing(null)} />
          <div className="fixed inset-y-0 right-0 z-[70] w-96 overflow-y-auto"
            style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)' }}>
            <RingCard
              ringIndex={selectedRing}
              ringLabel={['Опоры', 'Близкие', 'Коллеги', 'Знакомые', 'Потенциальные'][selectedRing]}
              nodes={participantNodes}
              edges={participantEdges}
              onClose={() => setSelectedRing(null)}
              onNodeClick={(node) => { setSelectedRing(null); setSelectedNode(node); }}
            />
          </div>
        </>,
        slideOverRoot
      )}

      {slideOverRoot && selectedNode && createPortal(
        <>
          <div className="fixed inset-0 z-[60]" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={() => setSelectedNode(null)} />
          <div className="fixed inset-y-0 right-0 z-[70] w-96 overflow-y-auto"
            style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)' }}>
            <NodeCard
              node={selectedNode}
              edges={participantEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)}
              currentUserId="me"
              onClose={() => setSelectedNode(null)}
              mode="participant"
              ringLabel={topology === 'circles' ? getRingLabel(selectedNode.id, participantEdges) : undefined}
              bridgeContexts={bridgeContexts}
            />
          </div>
        </>,
        slideOverRoot
      )}
    </div>
    </div>
  );
}

