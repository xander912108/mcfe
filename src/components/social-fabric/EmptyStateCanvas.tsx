import { Network, Users, Sparkles } from 'lucide-react';

interface EmptyStateCanvasProps {
  mode: 'participant' | 'leader';
  hasFilters?: boolean;
  onClearFilters?: () => void;
}

export function EmptyStateCanvas({ mode, hasFilters, onClearFilters }: EmptyStateCanvasProps) {
  const isLeader = mode === 'leader';

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center" style={{ background: 'var(--bg-main)' }}>
      {/* Animated background rings */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full animate-pulse" style={{ animationDuration: '3s', border: '1px solid var(--border-color)' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full animate-pulse" style={{ animationDuration: '2.5s', animationDelay: '0.5s', border: '1px solid var(--border-color)' }} />
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full animate-pulse" style={{ animationDuration: '2s', animationDelay: '1s', border: '1px solid var(--border-color)' }} />
        </div>

        {/* Center icon */}
        <div
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(201, 169, 110, 0.08)',
            border: '1px solid rgba(201, 169, 110, 0.15)',
          }}
        >
          {isLeader ? (
            <Users className="w-6 h-6" style={{ color: 'var(--gold)', opacity: 0.6 }} />
          ) : (
            <Network className="w-6 h-6" style={{ color: 'var(--gold)', opacity: 0.6 }} />
          )}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-base font-medium mb-2 text-center" style={{ color: 'var(--text-secondary)' }}>
        {isLeader ? 'Сообщество только формируется' : 'Ваша сеть только формируется'}
      </h3>

      {/* Description */}
      <p className="text-sm text-center max-w-[360px] leading-relaxed mb-6" style={{ color: 'var(--text-muted)' }}>
        {isLeader
          ? 'Здесь появятся участники, когда они начнут взаимодействовать. Карта заботы покажет, кто нуждается в поддержке, а кто уже стал опорой для других.'
          : 'Здесь появятся люди, с которыми вы пересеклись в сообществе. Пройдите первый шаг, примите участие в разборе или просто напишите кому-то из потока.'
        }
      </p>

      {/* CTA */}
      <div className="flex flex-col items-center gap-3">
        {hasFilters && onClearFilters ? (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300"
            style={{
              background: 'rgba(201, 169, 110, 0.12)',
              color: 'var(--gold)',
              border: '1px solid rgba(201, 169, 110, 0.2)',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(201, 169, 110, 0.2)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(201, 169, 110, 0.12)'; }}
          >
            <Sparkles className="w-4 h-4" />
            Сбросить фильтры
          </button>
        ) : (
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm"
            style={{
              background: 'var(--hover-bg)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
            }}
          >
            {isLeader ? 'Добавьте участников в сообщество' : 'Начните с малого — напишите вопрос'}
          </div>
        )}

        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
          {isLeader
            ? 'Ткань сообщества растёт из первых связей'
            : 'Связь начинается с одного живого действия'
          }
        </p>
      </div>
    </div>
  );
}
