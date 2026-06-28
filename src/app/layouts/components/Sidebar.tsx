import { memo, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useNavigationByGroup } from '@/lib/navigation/useNavigation';
import type { NavGroup, NavItem } from '@/lib/navigation/types';
import { cn } from '@/lib/utils';

const groupLabels: Record<NavGroup, string> = { main: 'Основное', community: 'Сообщество', leadership: 'Лидерство' };

export const Sidebar = memo(function Sidebar({ variant = 'main' }: { variant?: 'main' | 'leader' }) {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const groupedItems = useNavigationByGroup();
  const location = useLocation();
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  useEffect(() => { if (isMobile) queueMicrotask(() => setCollapsed(true)); }, [isMobile]);
  return <><AnimatePresence>{isMobile && !collapsed && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setCollapsed(true)} />}</AnimatePresence><motion.aside initial={false} animate={{ width: collapsed ? 72 : 256, x: isMobile && collapsed ? -256 : 0 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }} className="fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-border bg-card/80 backdrop-blur-xl" aria-label={variant === 'leader' ? 'Навигация консоли лидера' : 'Основная навигация'}><div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4"><motion.div animate={{ opacity: collapsed ? 0 : 1 }} className="flex items-center gap-2 overflow-hidden"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent"><Users className="h-4 w-4 text-accent-foreground" /></div><span className="whitespace-nowrap font-semibold text-foreground">Mentori Club</span></motion.div>{!isMobile && <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Развернуть меню' : 'Свернуть меню'}>{collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}</Button>}</div><nav className="flex-1 space-y-6 overflow-y-auto px-2 py-4">{(Object.entries(groupedItems) as [NavGroup, NavItem[]][]).map(([group, items]) => <div key={group}><AnimatePresence>{!collapsed && <motion.h3 initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-2 overflow-hidden px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">{groupLabels[group]}</motion.h3>}</AnimatePresence><ul className="space-y-0.5">{items.map((item) => <SidebarItem key={item.id} item={item} collapsed={collapsed} isActive={location.pathname === item.path} />)}</ul></div>)}</nav></motion.aside></>;
});

function SidebarItem({ item, collapsed, isActive }: { item: NavItem; collapsed: boolean; isActive: boolean }) {
  const Icon = item.icon;
  return <li><NavLink to={item.path} aria-current={isActive ? 'page' : undefined} title={item.labelKey} className={cn('group relative flex items-center gap-3 rounded-lg px-3 py-2 transition-all duration-200 ease-out hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', isActive && 'bg-accent text-accent-foreground')}>{isActive && <motion.div layoutId="active-nav-indicator" className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-yellow-500" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />}<Icon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-110" /><AnimatePresence>{!collapsed && <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-sm font-medium">{item.labelKey}</motion.span>}</AnimatePresence>{item.badge && !collapsed && <span className="ml-auto rounded-full bg-orange-500/10 px-2 py-0.5 text-xs font-medium text-orange-600">{item.badge.type === 'count' ? '3' : '•'}</span>}{!collapsed && item.shortcut && <kbd className="hidden rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground md:inline-flex">⌘{item.shortcut}</kbd>}</NavLink></li>;
}
