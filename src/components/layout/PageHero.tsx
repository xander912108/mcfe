import type { ReactNode } from 'react';
import { ChevronRight, RefreshCw } from 'lucide-react';

type PageHeroProps = {
  breadcrumbs: string[];
  title: string;
  description: string;
  updatedLabel?: string;
  onRefresh?: () => void;
  actions?: ReactNode;
};

export function PageHero({ breadcrumbs, title, description, updatedLabel, onRefresh, actions }: PageHeroProps) {
  return (
    <section className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
      <div className="px-6 md:px-8 pt-8 pb-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              {breadcrumbs.map((item, index) => (
                <span key={`${item}-${index}`} className="inline-flex items-center gap-2">
                  <span style={{ color: index === breadcrumbs.length - 1 ? 'var(--text-secondary)' : undefined }}>{item}</span>
                  {index < breadcrumbs.length - 1 && <ChevronRight className="w-3 h-3" />}
                </span>
              ))}
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{title}</h1>
            <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'var(--text-secondary)' }}>{description}</p>
            {updatedLabel && (
              <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
                <span>{updatedLabel}</span>
                {onRefresh && (
                  <>
                    <span>·</span>
                    <button onClick={onRefresh} className="text-[11px] font-medium transition-colors hover:opacity-80 inline-flex items-center gap-1" style={{ color: 'var(--gold)' }}><RefreshCw className="h-3 w-3" />Обновить</button>
                  </>
                )}
              </div>
            )}
          </div>
          {actions}
        </div>
      </div>
    </section>
  );
}
