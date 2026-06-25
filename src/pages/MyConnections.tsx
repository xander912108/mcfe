import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router';
import { Sparkles, ArrowRight, UserPlus, Maximize2, Minimize2, Lightbulb, Search, Users, Zap, MessageCircle } from 'lucide-react';
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
import { SkeletonList, SkeletonCanvas } from '@/components/social-fabric/SkeletonLoader';
import { ZoomButton } from '@/components/social-fabric/ZoomButton';
import type { GraphNode, GraphEdge, BridgeContext } from '@/data/graphData';

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
    if (focusMode) document.body.classList.add('focus-mode-active');
    else document.body.classList.remove('focus-mode-active');
    return () => document.body.classList.remove('focus-mode-active');
  }, [focusMode]);
  const [searchQuery, setSearchQuery] = useState('');

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

  const defaultFilters: Record<string, boolean> = {
    helpedMe: true, iHelped: true, sameFlow: false, sameStep: false,
    gratitude: false, helpReady: false, mentors: false,
    topicDesign: false, topicMarketing: false, topicProduct: false,
    topicAnalytics: false, topicLaunch: false, online: false,
    ringOpora: false, ringBlizkie: false, ringKollegi: false,
    ringZnakomye: false, ringPotencial: false,
  };
  const [activeFilters, setActiveFilters] = useState<Record<string, boolean>>(defaultFilters);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [displayTopology, setDisplayTopology] = useState(topology);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const pendingTopologyRef = useRef<string | null>(null);

  const tabOrder = ['star', 'circles', 'list'];

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
  }, [topology, isTransitioning, setTopology]);

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

  const activeFilterKeys = Object.entries(activeFilters).filter(([, v]) => v).map(([k]) => k);
  const hasActiveFilters = activeFilterKeys.length > 0;

  const { filteredNodes, filteredEdges, highlightNodeIds } = useMemo(() => {
    let nodes = participantNodes;
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
          case 'sameStep': return ne.some((e) => (e as any).stepContext);
          case 'gratitude': return ne.some((e) => e.type === 'gratitude');
          case 'mentors': return node.role === 'Куратор' || node.role === 'Хранитель знаний';
          case 'topicDesign': return (node as any).topics?.includes('дизайн');
          case 'topicMarketing': return (node as any).topics?.includes('маркетинг');
          case 'topicProduct': return (node as any).topics?.includes('продукт');
          case 'topicAnalytics': return (node as any).topics?.includes('аналитика');
          case 'topicLaunch': return (node as any).topics?.includes('запуск');
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

    nodes = nodes.filter(matchesFilters);
    const nodeIds = new Set(nodes.map((n) => n.id));
    // Include edges between filtered nodes AND edges connecting to 'me' (center)
    const edges = participantEdges.filter((e) =>
      (nodeIds.has(e.source) && nodeIds.has(e.target)) ||
      (e.source === 'me' && nodeIds.has(e.target)) ||
      (e.target === 'me' && nodeIds.has(e.source))
    );
    const hIds = hasActiveFilters ? new Set(nodes.map((n) => n.id)) : null;
    return { filteredNodes: nodes, filteredEdges: edges, highlightNodeIds: hIds };
  }, [activeFilters, hasActiveFilters, activeFilterKeys]);

  const activeFilterCount = activeFilterKeys.length;

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
    <div className={darkMode ? 'dark' : ''} style={{ height: focusMode ? '100vh' : '100%' }}>
    <div className={`${focusMode ? 'h-screen' : 'h-full'} flex flex-col ${focusMode ? 'bg-[var(--bg-main)]' : ''}`}>
      {/* ═══ PAGE HEADER ═══ */}
      {!focusMode && (
        <div className="shrink-0 px-5 pt-4 pb-3">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs mb-2">
            <span className="text-[var(--text-muted)]">IT технологии</span>
            <span className="text-[var(--gold)]">{'>'}</span>
            <span className="text-[var(--text-secondary)] font-medium">Мои связи</span>
          </div>
          {/* Title + description */}
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-1 tracking-tight">{tabDescriptions[topology]?.title}</h1>
          <p className="text-sm text-[var(--text-muted)] leading-relaxed max-w-2xl">{tabDescriptions[topology]?.text}</p>
          {/* Micro-stats */}
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Users className="w-3.5 h-3.5" /> <strong style={{ color: 'var(--text-primary)' }}>{filteredNodes.length}</strong> связей
            </span>
            <span className="w-px h-3" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--success)' }} /> <strong style={{ color: 'var(--success)' }}>{filteredNodes.filter((n) => n.isOnline).length}</strong> онлайн
            </span>
            <span className="w-px h-3" style={{ background: 'var(--border-color)' }} />
            <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
              <Zap className="w-3.5 h-3.5" /> <strong style={{ color: 'var(--gold)' }}>{recommendations.length}</strong> рекомендаций
            </span>
            {activeFilterCount > 0 && (
              <>
                <span className="w-px h-3" style={{ background: 'var(--border-color)' }} />
                <span className="text-xs flex items-center gap-1.5" style={{ color: 'var(--gold)' }}>
                  <MessageCircle className="w-3.5 h-3.5" /> <strong>{activeFilterCount}</strong> фильтров
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* ═══ CONTENT: Canvas + Right Sidebar ═══ */}
      <div className={`flex-1 flex gap-4 min-h-0 ${focusMode ? '' : 'px-5 pb-4'}`}>
        {/* Left: Canvas area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Toolbar: tabs + filter + focus + search */}
          <div className={`flex items-center mb-3 shrink-0 ${focusMode ? 'justify-end absolute top-3 right-3 z-50' : 'justify-between'}`}>
            {!focusMode && (
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <TopologySwitcher value={topology} onChange={handleTopologyChange} mode="participant" />
                {/* Search — only for list tab */}
                {topology === 'list' && (
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Поиск по имени, роли..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs outline-none transition-all"
                      style={{ background: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--gold)'; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-color)'; }}
                    />
                  </div>
                )}
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
          <div className="flex-1 relative rounded-2xl p-px isolate" style={{ background: 'linear-gradient(135deg, rgba(201,169,110,0.25), rgba(201,169,110,0.05) 40%, rgba(201,169,110,0.08) 60%, rgba(201,169,110,0.2))' }}>
            <div
              ref={containerDivRef}
              className="relative rounded-2xl overflow-hidden h-full"
              style={{ background: 'var(--bg-card)' }}
            >
            {filteredNodes.length === 0 && topology !== 'list' && (
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
              <div className="h-full overflow-y-auto" style={{ background: 'var(--bg-card)' }}>
                {/* Filter bar */}
                <div className="sticky top-0 z-10 py-3 px-5" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { key: '', label: 'Все', count: filteredNodes.length },
                      { key: 'gratitude', label: 'Поблагодарить', count: filteredEdges.filter((e) => e.type === 'gratitude').length },
                      { key: 'help', label: 'Попросить совет', count: filteredNodes.filter((n) => n.isHelpReady).length },
                      { key: 'mentorship', label: 'Предложить помощь', count: filteredNodes.filter((n) => n.role === 'Куратор' || n.role === 'Помощник по практике').length },
                      { key: 'new', label: 'Познакомиться', count: filteredNodes.filter((n) => filteredEdges.filter((e) => e.source === n.id || e.target === n.id).length === 0).length },
                    ].map((f) => (
                      <button
                        key={f.key}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all border"
                        style={{
                          borderColor: activeFilters[f.key] ? 'var(--gold)' : 'var(--border-color)',
                          color: activeFilters[f.key] ? 'var(--gold)' : 'var(--text-muted)',
                          backgroundColor: activeFilters[f.key] ? 'rgba(201,169,110,0.08)' : 'transparent',
                        }}
                        onClick={() => setActiveFilters((prev) => ({ ...prev, [f.key]: !prev[f.key] }))}
                      >
                        {f.label}
                        <span style={{ color: activeFilters[f.key] ? 'var(--gold)' : 'var(--text-muted)', opacity: 0.7 }}>{f.count}</span>
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] mt-2" style={{ color: 'var(--text-muted)' }}>
                    Сегодня можно сделать 3 мягких действия: поблагодарить одного участника, попросить совет и создать новую связь.
                  </p>
                </div>
                <ConnectionList
                  nodes={searchFilteredNodes}
                  edges={filteredEdges}
                  currentUserId="me"
                  onNodeClick={handleNodeClick}
                  onMessage={(node) => console.log('Message', node.name)}
                  selectedNodeId={selectedNode?.id || null}
                  activeFilters={activeFilters}
                  onQuickFilter={setActiveFilters}
                  highlightNodeIds={highlightNodeIds ?? undefined}
                />
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
                    <RingMetricsPanel edges={filteredEdges} />
                    <CirclesTopology key="circles-graph"
                      centerNode={currentUser}
                      nodes={filteredNodes}
                      edges={filteredEdges}
                      onNodeHover={(node) => { setHoveredNode(node); if (!node) setHoveredScreenPos(null); }}
                      onNodeClick={handleNodeClick}
                      onRingClick={(ri) => setSelectedRing(ri)}
                      onHoverScreenPos={setHoveredScreenPos}
                      highlightNodeId={hoveredNode?.id || null}
                      highlightNodeIds={hasActiveFilters ? (highlightNodeIds ?? undefined) : undefined}
                      width={canvasSize.width}
                      height={canvasSize.height}
                      focusMode={focusMode}
                      darkMode={darkMode}
                      camera={cam}
                    />
                    {hoveredNode && !selectedNode && hoveredScreenPos && (
                      <div className="absolute z-50 pointer-events-none" style={{ left: hoveredScreenPos.x + 50, top: hoveredScreenPos.y - 30 }}>
                        <NodeTooltip node={hoveredNode} edges={filteredEdges} currentUserId="me" />
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
                      connectedNodes={filteredNodes}
                      edges={filteredEdges}
                      onNodeHover={handleNodeHover}
                      onNodeClick={handleNodeClick}
                      onBridgeHover={setHoveredBridge}
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
                    {hoveredNode && !selectedNode && (
                      <div className="absolute z-50 pointer-events-none" style={{ left: (hoveredNode.x || 0) + 50, top: (hoveredNode.y || 0) - 30 }}>
                        <NodeTooltip node={hoveredNode} edges={filteredEdges} currentUserId="me" />
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
          <aside className="hidden lg:flex w-[240px] shrink-0 flex-col gap-4 overflow-y-auto lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)]">
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
      {selectedRing !== null && (
        <>
          <div className="fixed inset-0 z-30" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={() => setSelectedRing(null)} />
          <div className="fixed inset-y-0 right-0 z-40 w-96 overflow-y-auto"
            style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)' }}>
            <RingCard
              ringIndex={selectedRing}
              ringLabel={['Опоры', 'Близкие', 'Коллеги', 'Знакомые', 'Потенциальные'][selectedRing]}
              nodes={filteredNodes}
              edges={filteredEdges}
              onClose={() => setSelectedRing(null)}
              onNodeClick={(node) => { setSelectedRing(null); setSelectedNode(node); }}
            />
          </div>
        </>
      )}

      {selectedNode && (
        <>
          <div className="fixed inset-0 z-30" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={() => setSelectedNode(null)} />
          <div className="fixed inset-y-0 right-0 z-40 w-96 overflow-y-auto"
            style={{ background: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)' }}>
            <NodeCard
              node={selectedNode}
              edges={filteredEdges.filter((e) => e.source === selectedNode.id || e.target === selectedNode.id)}
              currentUserId="me"
              onClose={() => setSelectedNode(null)}
              mode="participant"
              ringLabel={topology === 'circles' ? getRingLabel(selectedNode.id, participantEdges) : undefined}
              bridgeContexts={bridgeContexts}
            />
          </div>
        </>
      )}
    </div>
    </div>
  );
}


