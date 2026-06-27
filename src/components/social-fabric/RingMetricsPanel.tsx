import { useState } from 'react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
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
  { key: 'opora', shortLabel: 'Опоры', color: '#C9A96E' },
  { key: 'blizkie', shortLabel: 'Близкие', color: '#B89CC0' },
  { key: 'kollegi', shortLabel: 'Коллеги', color: '#6B9E7C' },
  { key: 'znakomye', shortLabel: 'Знакомые', color: '#9A9895' },
  { key: 'potencial', shortLabel: 'Потенц.', color: '#787673' },
] as const;

export function RingMetricsPanel({ edges }: RingMetricsPanelProps) {
  const [expanded, setExpanded] = useState(false);

  const m = computeMetrics(edges);
  const advice = getBalanceAdvice(m);

  return (
    <div className="absolute top-3 left-1/2 z-30 w-[min(760px,calc(100%-32px))] -translate-x-1/2 pointer-events-none transition-all duration-300">
      <div className="mx-auto flex w-fit max-w-full flex-col items-center gap-1.5">
        <div
          className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-hidden rounded-2xl border px-1.5 py-1 shadow-[0_18px_45px_rgba(56,48,34,0.10)] backdrop-blur-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,252,246,0.86), rgba(241,236,226,0.72))',
            borderColor: 'rgba(201,169,110,0.18)',
          }}
        >
          <button
            onClick={() => setExpanded((value) => !value)}
            className="flex shrink-0 items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[10px] font-medium whitespace-nowrap transition-all duration-200 hover:translate-y-[-1px]"
            style={{
              background: expanded ? 'rgba(201,169,110,0.16)' : 'rgba(255,255,255,0.58)',
              borderColor: expanded ? 'rgba(201,169,110,0.26)' : 'rgba(201,169,110,0.14)',
              color: expanded ? '#A37D33' : '#B99A5B',
              boxShadow: expanded ? '0 8px 18px rgba(201,169,110,0.12)' : 'none',
            }}
            title={expanded ? 'Скрыть пояснение' : 'Показать пояснение'}
          >
            <span>Баланс связей</span>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <div className="flex min-w-0 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {METRIC_CONFIG.map((cfg) => (
              <span
                key={cfg.key}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl border px-2.5 py-1.5 text-[10px] font-medium whitespace-nowrap"
                style={{
                  color: cfg.color,
                  background: `${cfg.color}14`,
                  borderColor: `${cfg.color}36`,
                }}
              >
                <strong className="text-[11px] font-semibold">{m[cfg.key as keyof RingMetrics]}</strong>
                <span className="text-[#77716A]">{cfg.shortLabel}</span>
              </span>
            ))}
          </div>
        </div>

        {expanded && (
          <div
            className="pointer-events-auto flex w-fit max-w-[min(620px,100%)] items-start gap-2 rounded-2xl border px-3.5 py-2 shadow-[0_16px_38px_rgba(56,48,34,0.08)] backdrop-blur-2xl animate-in fade-in-0 slide-in-from-top-1 duration-200"
            style={{
              background: 'linear-gradient(180deg, rgba(255,252,246,0.84), rgba(241,236,226,0.70))',
              borderColor: 'rgba(201,169,110,0.16)',
            }}
          >
            <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C9A96E]" />
            <p className="text-[11px] leading-relaxed text-[#6F6960]">
              {advice}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
