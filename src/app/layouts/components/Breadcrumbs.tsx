import { ChevronRight } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const pathLabels: Record<string, string> = { 'my-path': 'Мой путь', community: 'Сообщество', learning: 'Обучение', meetings: 'Встречи', connections: 'Мои связи', insights: 'Инсайты', contribution: 'Вклад', leader: 'Консоль лидера' };

export function Breadcrumbs() {
  const segments = useLocation().pathname.split('/').filter(Boolean);
  if (segments.length === 0) return null;
  return <nav className="hidden items-center gap-1 text-sm text-muted-foreground md:flex" aria-label="Хлебные крошки"><Link to="/my-path" className="transition-colors hover:text-foreground">Главная</Link>{segments.map((segment, index) => <span key={`${segment}-${index}`} className="flex items-center gap-1"><ChevronRight className="h-3 w-3" /><span className={index === segments.length - 1 ? 'font-medium text-foreground' : 'transition-colors hover:text-foreground'}>{pathLabels[segment] ?? segment}</span></span>)}</nav>;
}
