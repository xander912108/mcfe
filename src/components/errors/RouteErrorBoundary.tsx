import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface RouteErrorBoundaryProps {
  children: ReactNode;
  routeName: string;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
}

export class RouteErrorBoundary extends Component<RouteErrorBoundaryProps, RouteErrorBoundaryState> {
  state: RouteErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): RouteErrorBoundaryState {
    return { hasError: true };
  }

  componentDidUpdate(previousProps: RouteErrorBoundaryProps) {
    if (previousProps.routeName !== this.props.routeName && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(`[RouteError] ${this.props.routeName}`, error, info);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <main className="flex-1 min-w-0">
        <section
          role="alert"
          aria-live="polite"
          className="rounded-2xl p-6 md:p-8 text-center"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
            color: 'var(--text-primary)',
          }}
        >
          <div
            className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: 'rgba(201, 112, 106, 0.12)' }}
          >
            <AlertTriangle className="h-6 w-6" style={{ color: '#C9706A' }} />
          </div>
          <h2 className="mb-2 text-lg font-semibold">Раздел временно не открылся</h2>
          <p className="mx-auto mb-5 max-w-md text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Можно обновить страницу или перейти в другой раздел. Остальная часть пространства продолжает работать.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200 hover:opacity-90"
            style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
          >
            Обновить страницу
          </button>
        </section>
      </main>
    );
  }
}
