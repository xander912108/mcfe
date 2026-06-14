import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { Check, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

let toastIdCounter = 0;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<(Toast & { exiting?: boolean })[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const dismissToast = useCallback((id: string) => {
    // Start exit animation
    setToasts(prev => prev.map(t => t.id === id ? { ...t, exiting: true } : t));
    // Actually remove after animation completes
    setTimeout(() => removeToast(id), 200);
  }, [removeToast]);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = `toast-${++toastIdCounter}`;
    setToasts(prev => [...prev, { id, message, type }]);
    const timer = setTimeout(() => dismissToast(id), 4000);
    timersRef.current.set(id, timer);
  }, [dismissToast]);

  const iconMap = {
    success: <Check className="w-3.5 h-3.5" style={{ color: '#6B9E7C' }} />,
    error: <X className="w-3.5 h-3.5" style={{ color: '#C9706A' }} />,
    warning: <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#C9A96E' }} />,
    info: <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />,
  };

  const borderMap = {
    success: 'rgba(107,158,124,0.4)',
    error: 'rgba(201,112,106,0.4)',
    warning: 'rgba(201,169,110,0.4)',
    info: 'rgba(201,169,110,0.3)',
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${toast.exiting ? 'toast-exit' : 'toast-enter'} pointer-events-auto flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium min-w-[280px] max-w-[400px]`}
            style={{
              backgroundColor: 'var(--bg-card)',
              border: `1px solid ${borderMap[toast.type]}`,
              boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {iconMap[toast.type]}
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              className="p-0.5 rounded transition-colors"
              style={{ color: 'var(--text-muted)' }}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
