import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props { children: ReactNode; routeName: string; }
interface State { hasError: boolean; error: Error | null; }

export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
  componentDidCatch(error: Error, info: ErrorInfo) { console.error(`[RouteError] ${this.props.routeName}:`, error, info); }
  componentDidUpdate(prevProps: Props) { if (prevProps.routeName !== this.props.routeName && this.state.hasError) this.setState({ hasError: false, error: null }); }
  render() { if (this.state.hasError) return <div className="flex min-h-[60vh] flex-col items-center justify-center p-8 text-center"><div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10"><AlertTriangle className="h-8 w-8 text-orange-600" /></div><h2 className="mb-2 text-xl font-semibold">Что-то пошло не так</h2><p className="mb-6 max-w-md text-muted-foreground">Мы уже знаем о проблеме и работаем над ней. Попробуйте обновить страницу.</p><Button onClick={() => window.location.reload()}>Обновить страницу</Button></div>; return this.props.children; }
}
