import { useEffect, useState } from 'react';
import { Bell, Menu, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/app/layouts/components/Breadcrumbs';
import { CommandPalette } from '@/app/layouts/components/CommandPalette';

export function Header() {
  const [commandOpen, setCommandOpen] = useState(false);
  useEffect(() => { const handler = (event: KeyboardEvent) => { if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setCommandOpen(true); } }; window.addEventListener('keydown', handler); return () => window.removeEventListener('keydown', handler); }, []);
  return <><header className="fixed left-0 right-0 top-0 z-30 h-16 border-b border-border bg-background/80 backdrop-blur-xl transition-all duration-300 md:left-64"><div className="flex h-full items-center justify-between px-4 md:px-6"><div className="flex items-center gap-3"><Button variant="ghost" size="icon" className="md:hidden" aria-label="Открыть меню"><Menu className="h-5 w-5" /></Button><Breadcrumbs /></div><div className="flex items-center gap-2"><button type="button" onClick={() => setCommandOpen(true)} className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label="Открыть поиск"><Search className="h-4 w-4" /><span className="hidden sm:inline">Поиск</span><kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] md:inline-flex">⌘K</kbd></button><Button variant="ghost" size="icon" className="relative" aria-label="Уведомления"><Bell className="h-5 w-5" /><span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-orange-500" /></Button><Button variant="ghost" size="icon" aria-label="Профиль"><User className="h-5 w-5" /></Button></div></div></header>{commandOpen && <CommandPalette open={commandOpen} onClose={() => setCommandOpen(false)} />}</>;
}
