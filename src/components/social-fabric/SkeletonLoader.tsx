export function SkeletonCard() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 rounded-xl animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-10 h-10 rounded-full shrink-0" style={{ background: 'var(--hover-bg)' }} />
      {/* Content skeleton */}
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3.5 w-24 rounded" style={{ background: 'var(--hover-bg)' }} />
          <div className="h-3 w-16 rounded-full" style={{ background: 'var(--hover-bg)' }} />
        </div>
        <div className="h-2.5 w-3/4 rounded" style={{ background: 'var(--hover-bg)' }} />
      </div>
      {/* Chevron skeleton */}
      <div className="w-4 h-4 rounded shrink-0" style={{ background: 'var(--hover-bg)' }} />
    </div>
  );
}

export function SkeletonList({ count = 5 }: { count?: number }) {
  return (
    <div className="p-4 space-y-1">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonCanvas() {
  return (
    <div className="w-full h-full animate-pulse flex flex-col items-center justify-center gap-4">
      {/* Center node skeleton */}
      <div className="relative">
        <div className="w-16 h-16 rounded-full" style={{ background: 'var(--hover-bg)' }} />
        {/* Orbiting dots */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute -top-2 left-1/2 w-3 h-3 rounded-full" style={{ background: 'var(--hover-bg)' }} />
        </div>
      </div>
      <div className="h-3 w-32 rounded" style={{ background: 'var(--hover-bg)' }} />
      <div className="h-2 w-48 rounded" style={{ background: 'var(--hover-bg)' }} />
    </div>
  );
}
