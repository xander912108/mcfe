import type { ReactNode } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { useState } from 'react';

type AdvisorSidebarProps = {
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AdvisorSidebar({ title = 'Советник', children, footer }: AdvisorSidebarProps) {
  const [hidden, setHidden] = useState(false);

  if (hidden) {
    return (
      <button onClick={() => setHidden(false)} className="w-full rounded-2xl border p-4 text-left text-sm transition hover:bg-[var(--hover-bg)]" style={{ borderColor: 'var(--border-color)', color: 'var(--text-secondary)' }}>
        Показать Советника
      </button>
    );
  }

  return (
    <section className="rounded-2xl border bg-[var(--bg-card)] p-4 shadow-[var(--card-shadow)]" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-[var(--gold)]" />
          <h2 className="text-sm font-semibold text-[var(--text-primary)]">{title}</h2>
        </div>
        <button onClick={() => setHidden(true)} className="rounded-lg p-1 text-[var(--text-muted)] transition hover:bg-[var(--hover-bg)]" aria-label="Скрыть Советника">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className="mt-3 space-y-3 text-sm leading-6 text-[var(--text-secondary)]">{children}</div>
      {footer && <div className="mt-4 border-t pt-3" style={{ borderColor: 'var(--border-color)' }}>{footer}</div>}
    </section>
  );
}
