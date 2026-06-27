import { useState } from 'react';
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

  const m = computeMetrics(edges);
  const advice = getBalanceAdvice(m);

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 pointer-events-none transition-all duration-300">
      <div className="pointer-events-auto flex max-w-[min(680px,calc(100vw-48px))] items-center gap-1 rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)]/70 p-1 shadow-[var(--card-shadow)] backdrop-blur-2xl">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-medium whitespace-nowrap transition-all duration-200 ${
            collapsed
              ? 'border-[var(--border-color)] bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
              : 'border-[var(--gold)]/25 bg-[var(--gold)]/15 text-[var(--gold)]'
          }`}
        >
          <span>Баланс связей</span>
          {collapsed ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
        </button>

        <div className="flex items-center gap-1 overflow-hidden">
          {METRIC_CONFIG.map((cfg) => (
            <span
              key={cfg.key}
              className={`rounded-md border px-2 py-1 text-[10px] font-medium whitespace-nowrap transition-all duration-200 ${collapsed ? 'hidden sm:inline-flex' : 'inline-flex'} items-center gap-1`}
              style={{
                color: cfg.color,
                background: `${cfg.color}14`,
                borderColor: `${cfg.color}30`,
              }}
            >
              <strong className="font-semibold">{m[cfg.key as keyof RingMetrics]}</strong>
              <span className="text-[var(--text-muted)]">{cfg.label}</span>
            </span>
          ))}
        </div>

        {!collapsed && (
          <p className="ml-1 hidden max-w-[260px] truncate px-2 text-[10px] leading-relaxed text-[var(--text-secondary)] xl:block">
            {advice}
          </p>
        )}
      </div>
    </div>
  );
}
