import { useState, useRef, useCallback } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import type { GraphEdge } from '@/data/graphData';

interface RingMetricsPanelProps {
  edges: GraphEdge[];
}

interface RingMetrics {
  opora: number;
  blizkie: number;
  kollegi: number;
  znakomye: number;
  potencial: number;
}

function computeMetrics(edges: GraphEdge[]): RingMetrics {
  // Group edges by the OTHER node (not 'me'), take max weight per node
  const nodeMaxWeight = new Map<string, number>();
  edges.forEach((e) => {
    const otherId = e.source === 'me' ? e.target : e.target === 'me' ? e.source : null;
    if (!otherId || otherId === 'me') return;
    const current = nodeMaxWeight.get(otherId) ?? -1;
    if (e.weight > current) nodeMaxWeight.set(otherId, e.weight);
  });

  let opora = 0;
  let blizkie = 0;
  let kollegi = 0;
  let znakomye = 0;
  let potencial = 0;

  nodeMaxWeight.forEach((w) => {
    if (w >= 7) opora++;
    else if (w >= 5) blizkie++;
    else if (w >= 3) kollegi++;
    else if (w >= 1) znakomye++;
    else potencial++;
  });

  return { opora, blizkie, kollegi, znakomye, potencial };
}

function getBalanceAdvice(m: RingMetrics): string {
  const total = m.opora + m.blizkie + m.kollegi + m.znakomye + m.potencial;

  if (total === 0) {
    return 'Ваши связи ещё формируются. Пройдите первый шаг или обратитесь к помощнику на старт.';
  }

  if (m.opora === 0 && m.blizkie === 0) {
    return 'Опоры и тёплые связи ещё формируются. Обратитесь к помощнику на старт.';
  }

  if (m.potencial >= 3) {
    return 'У вас сильная поддержка и много возможностей для новых связей. Попробуйте создать один новый контакт.';
  }

  if (m.znakomye >= 1 && m.blizkie <= 1) {
    return 'Есть знакомые, но мало тёплых связей. Напишите кому-то из Знакомых — это мягкий шаг.';
  }

  if (m.opora >= 3) {
    return 'У вас сильная поддержка. Поблагодарите одну из опор.';
  }

  if (m.kollegi >= 2) {
    return 'Много общего контекста. Обменяйтесь опытом с кем-то из Коллег.';
  }

  return 'Ваш круг поддержки складывается. Попробуйте написать кому-то из ближнего круга.';
}

const METRIC_CONFIG = [
  { key: 'opora', label: 'Опоры', color: '#fbbf24' },
  { key: 'blizkie', label: 'Близкие', color: '#818cf8' },
  { key: 'kollegi', label: 'Коллеги', color: '#2dd4bf' },
  { key: 'znakomye', label: 'Знакомые', color: '#94a3b8' },
  { key: 'potencial', label: 'Потенц.', color: '#64748b' },
] as const;

export function RingMetricsPanel({ edges }: RingMetricsPanelProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 16 }); // y=16px from top
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef({ startX: 0, startY: 0, origX: 0, origY: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const m = computeMetrics(edges);
  const advice = getBalanceAdvice(m);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('button')) return; // Don't drag on button
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: position.x,
      origY: position.y,
    };
  }, [position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setPosition({
      x: dragRef.current.origX + dx,
      y: Math.max(0, dragRef.current.origY + dy),
    });
  }, [isDragging]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  return (
    <div
      className="absolute z-30 pointer-events-none"
      style={{
        left: 16,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div
        ref={panelRef}
        className="rounded-xl pointer-events-auto select-none"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.05)',
          boxShadow: 'var(--card-shadow)',
          padding: collapsed ? '5px 12px' : '10px 16px',
          minWidth: collapsed ? 'auto' : '360px',
          transition: isDragging ? 'none' : 'padding 0.25s ease, min-width 0.25s ease',
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Header + toggle */}
        <div className="flex items-center justify-between gap-3">
          <span className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] font-medium whitespace-nowrap">
            Баланс связей
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
            className="p-0.5 rounded hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors pointer-events-auto"
          >
            {collapsed ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
          </button>
        </div>

        {/* Expanded: metrics row + advice */}
        {!collapsed && (
          <>
            <div className="mt-2 flex items-center gap-3 flex-wrap">
              {METRIC_CONFIG.map((cfg) => (
                <div key={cfg.key} className="flex items-center gap-1">
                  <span className="text-sm font-bold" style={{ color: cfg.color }}>
                    {m[cfg.key as keyof RingMetrics]}
                  </span>
                  <span className="text-[10px] text-[var(--text-muted)]">{cfg.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
              <p className="text-[11px] text-[var(--text-secondary)] leading-relaxed">
                {advice}
              </p>
            </div>
          </>
        )}

        {/* Collapsed: mini indicator */}
        {collapsed && (
          <div className="flex items-center gap-2 mt-0.5">
            {METRIC_CONFIG.map((cfg) => (
              <span key={cfg.key} className="text-[10px] font-medium" style={{ color: cfg.color }}>
                {m[cfg.key as keyof RingMetrics]}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
