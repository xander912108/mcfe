import { Lightbulb, X } from 'lucide-react';

interface AdvisorTip {
  level: 1 | 2 | 3 | 4;
  message: string;
  action?: string;
  context?: string;
}

interface AdvisorTooltipProps {
  tips: AdvisorTip[];
  onDismiss: (index: number) => void;
  onAction: (tip: AdvisorTip) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

const LEVEL_CONFIG: Record<number, { color: string; bg: string; border: string; label: string }> = {
  1: { color: '#94a3b8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.15)', label: 'Подсказка' },
  2: { color: '#60a5fa', bg: 'rgba(96,165,250,0.08)', border: 'rgba(96,165,250,0.15)', label: 'Совет' },
  3: { color: '#fbbf24', bg: 'rgba(251,191,36,0.08)', border: 'rgba(251,191,36,0.15)', label: 'Внимание' },
  4: { color: '#f87171', bg: 'rgba(248,113,113,0.08)', border: 'rgba(248,113,113,0.15)', label: 'Важно' },
};

// Premium styles
const PREMIUM_BG = 'var(--bg-card)';
const PREMIUM_BLUR = 'blur(32px)';
const PREMIUM_BORDER = '1px solid var(--border-color)';
const PREMIUM_SHADOW = 'var(--card-shadow)';

export function AdvisorTooltip({ tips, onDismiss, onAction, isOpen = false, onToggle }: AdvisorTooltipProps) {
  if (tips.length === 0) return null;

  const topTip = tips[0];
  const cfg = LEVEL_CONFIG[topTip.level];

  // Compact button
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute right-4 top-[156px] z-30 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)',
        }}
        title="Подсказки"
      >
        <Lightbulb className="w-4 h-4 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
        <span
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold rounded-full"
          style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399', border: '1px solid rgba(52,211,153,0.25)' }}
        >
          {tips.length}
        </span>
      </button>
    );
  }

  // Expanded panel
  return (
    <div
      className="absolute right-4 top-[156px] w-80 z-40 overflow-hidden rounded-2xl"
      style={{ background: PREMIUM_BG, backdropFilter: PREMIUM_BLUR, border: PREMIUM_BORDER, boxShadow: PREMIUM_SHADOW }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          <Lightbulb className="w-3.5 h-3.5" style={{ color: cfg.color }} />
        </div>
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">{cfg.label}</h4>
        <span className="ml-auto text-[10px] text-[var(--text-muted)] px-2 py-0.5 rounded-full" style={{ background: 'var(--border-color)' }}>
          {tips.length}
        </span>
        <button onClick={onToggle} className="p-1 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main tip */}
      <div className="p-4">
        {/* Priority indicator */}
        <div className="flex items-center gap-1.5 mb-3">
          {[1, 2, 3, 4].map((l) => (
            <div
              key={l}
              className="h-1 rounded-full flex-1 transition-all"
              style={{
                background: l <= topTip.level ? cfg.color : 'var(--border-color)',
                opacity: l <= topTip.level ? 1 : 0.3,
              }}
            />
          ))}
        </div>

        <p className="text-sm text-[var(--text-primary)] leading-relaxed">{topTip.message}</p>

        {topTip.context && (
          <p className="text-xs text-[var(--text-muted)] mt-3 pt-3 leading-relaxed" style={{ borderTop: '1px solid var(--border-color)' }}>
            {topTip.context}
          </p>
        )}

        {topTip.action && (
          <button
            onClick={() => onAction(topTip)}
            className="mt-3 text-xs font-medium transition-colors hover:underline"
            style={{ color: cfg.color }}
          >
            {topTip.action}
          </button>
        )}
      </div>

      {/* Additional tips */}
      {tips.length > 1 && (
        <div className="px-4 pb-4 space-y-1.5">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Ещё подсказки</p>
          {tips.slice(1, 3).map((tip, i) => {
            const c = LEVEL_CONFIG[tip.level];
            return (
              <div
                key={i + 1}
                className="rounded-lg p-2.5 cursor-pointer transition-all duration-200"
                style={{ background: c.bg, border: `1px solid ${c.border}`, opacity: 0.7 }}
                onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.7'; }}
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-3 h-3 shrink-0" style={{ color: c.color }} />
                  <span className="text-xs text-[var(--text-secondary)] truncate flex-1">{tip.message}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onDismiss(i + 1); }}
                    className="p-0.5 rounded hover:bg-[var(--hover-bg)] text-[var(--text-muted)] shrink-0"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
