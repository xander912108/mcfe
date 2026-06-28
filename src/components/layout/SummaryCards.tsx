import type { ReactNode } from 'react';

type SummaryCard = {
  label: string;
  value: string;
  text: string;
  icon?: ReactNode;
};

type SummaryCardsProps = {
  cards: SummaryCard[];
  columnsClassName?: string;
};

export function SummaryCards({ cards, columnsClassName = 'sm:grid-cols-2 xl:grid-cols-4' }: SummaryCardsProps) {
  return (
    <section className={`grid gap-3 ${columnsClassName}`}>
      {cards.map((card) => (
        <article key={card.label} className="rounded-2xl border bg-[var(--bg-card)] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.035)]" style={{ borderColor: 'var(--border-color)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{card.label}</p>
              <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{card.value}</h2>
            </div>
            {card.icon}
          </div>
          <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{card.text}</p>
        </article>
      ))}
    </section>
  );
}
