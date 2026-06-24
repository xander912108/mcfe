import { Sparkles, X } from 'lucide-react';

interface Recommendation {
  id: string;
  name: string;
  reason: string;
  action: string;
}

interface RecommendationPanelProps {
  recommendations: Recommendation[];
  onConnect?: (id: string) => void;
  isOpen?: boolean;
  onToggle?: () => void;
}

// Premium panel styles (synced with RingMetricsPanel)
const PREMIUM_BG = 'var(--bg-card)';
const PREMIUM_BLUR = 'blur(32px)';
const PREMIUM_BORDER = '1px solid var(--border-color)';
const PREMIUM_SHADOW = 'var(--card-shadow)';

export function RecommendationPanel({ recommendations, isOpen = false, onToggle }: RecommendationPanelProps) {
  if (recommendations.length === 0) return null;

  // Compact dock mode
  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="absolute right-4 top-[108px] z-30 w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-300 group"
        style={{
          background: 'var(--bg-card)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--border-color)',
          boxShadow: 'var(--card-shadow)',
        }}
        title="Рекомендации"
      >
        <Sparkles className="w-4 h-4 text-amber-400 group-hover:text-amber-300 transition-colors" />
        <span
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[9px] font-bold rounded-full"
          style={{ background: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}
        >
          {recommendations.length}
        </span>
      </button>
    );
  }

  // Expanded panel
  return (
    <div
      className="absolute right-4 top-[108px] w-80 z-40 overflow-hidden rounded-2xl"
      style={{ background: PREMIUM_BG, backdropFilter: PREMIUM_BLUR, border: PREMIUM_BORDER, boxShadow: PREMIUM_SHADOW }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border-color)' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(251,191,36,0.12)' }}>
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        </div>
        <h4 className="text-sm font-semibold text-[var(--text-primary)]">Рекомендации</h4>
        <span className="ml-auto text-[10px] text-[var(--text-muted)] px-2 py-0.5 rounded-full" style={{ background: 'var(--border-color)' }}>
          {recommendations.length}
        </span>
        <button onClick={onToggle} className="p-1 rounded-lg hover:bg-[var(--hover-bg)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Summary */}
      <div className="p-4">
        <p className="text-sm font-medium text-[var(--text-secondary)] mb-3">Сейчас в вашем мире</p>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-micro text-[var(--text-secondary)]">3 живые связи</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-micro text-[var(--text-secondary)]">2 связи можно оживить</span>
          <span className="text-[var(--text-muted)]">·</span>
          <span className="text-micro text-[var(--text-secondary)]">2 возможные новые связи</span>
        </div>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed" style={{ borderLeft: '2px solid rgba(251,191,36,0.3)', paddingLeft: '10px' }}>
          Вывод: начните с одного мягкого действия — поблагодарите того, кто уже помогал, или напишите человеку с общим шагом.
        </p>
      </div>
    </div>
  );
}
