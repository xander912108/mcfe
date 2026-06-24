interface ZoomButtonProps {
  children: React.ReactNode;
  label: string;
}

export function ZoomButton({ children, label }: ZoomButtonProps) {
  return (
    <button
      className="w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all border"
      style={{ background: 'var(--bg-card)', color: 'var(--text-secondary)', borderColor: 'var(--border-color)' }}
      title={label}
      onClick={() => {}}
    >
      {children}
    </button>
  );
}
