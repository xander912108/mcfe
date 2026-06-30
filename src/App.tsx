import { Suspense, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { AppHeader } from '@/components/layout/AppHeader';
import { AppRouteSurface } from '@/components/layout/AppRouteSurface';
import { AppWorkspaceFrame } from '@/components/layout/AppWorkspaceFrame';
import { LeaderSidebar } from '@/components/layout/LeaderSidebar';
import { ParticipantSidebar } from '@/components/layout/ParticipantSidebar';
import { CommandPalette } from '@/components/navigation/CommandPalette';
import { navigationConfig, type NavigationItemId } from '@/lib/navigation/config';
import { NavigationAccessProvider } from '@/lib/navigation/NavigationAccessProvider';
import { getNavigationLabel } from '@/lib/navigation/labels';
import { ToastProvider } from './ToastContext';
import { useTheme } from '@/lib/theme/useTheme';

/* ===== DATA ===== */
const mobileBottomNavItemIds = new Set<NavigationItemId>([
  'my-path',
  'community',
  'learning',
  'meetings',
  'connections',
]);

const mobileBottomNavItems = navigationConfig.filter((item) => mobileBottomNavItemIds.has(item.id));

const mobileBottomNavLabels: Partial<Record<NavigationItemId, string>> = {
  'my-path': 'Путь',
  connections: 'Связи',
};


function getMobileBottomNavLabel(item: (typeof mobileBottomNavItems)[number]): string {
  return mobileBottomNavLabels[item.id] ?? getNavigationLabel(item);
}





/* ===== COMPONENT ===== */
function App({ leaderMode = false, leaderTab = 'main', connectionsPage = false, myPathPage = false, learningPage = false, meetingsPage = false, communityFeedPage = false, insightsPage = false, contributionPage = false }: { leaderMode?: boolean; leaderTab?: 'main' | 'entry' | 'requests' | 'connections' | 'contribution' | 'monetization' | 'settings'; connectionsPage?: boolean; myPathPage?: boolean; learningPage?: boolean; meetingsPage?: boolean; communityFeedPage?: boolean; insightsPage?: boolean; contributionPage?: boolean }) {
  const navigate = useNavigate();
  const location = useLocation();
  const leaderConsoleMode = !connectionsPage && !myPathPage && !learningPage && !meetingsPage && !communityFeedPage && !insightsPage && !contributionPage && (leaderMode || location.pathname === '/leader' || location.pathname === '/leader/entry');
  const activeConsoleTab = leaderMode ? leaderTab : 'main';
  const { effectiveTheme, toggleTheme } = useTheme();
  const darkMode = effectiveTheme === 'dark';
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useEffect(() => {
    const handleCommandShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleCommandShortcut);
    return () => window.removeEventListener('keydown', handleCommandShortcut);
  }, []);


  return (
    <ToastProvider>
    <NavigationAccessProvider>
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>
        <CommandPalette open={commandPaletteOpen} onOpenChange={setCommandPaletteOpen} />

        {/* ===== HEADER ===== */}
        <AppHeader
          darkMode={darkMode}
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
          onToggleDarkMode={toggleTheme}
        />

        {/* ===== MAIN LAYOUT ===== */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
            <Suspense fallback={<div className="flex-1 rounded-2xl p-6 text-sm" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Загружаем пространство…</div>}>

            {/* LEFT SIDEBAR — TWO LAYERS */}
            <aside className="hidden lg:flex flex-col w-[240px] shrink-0 sticky top-[88px] h-[calc(100vh-104px)]">
              {/* Layer 1: Community navigation */}
              {!leaderConsoleMode && <ParticipantSidebar />}

              {/* Layer 2: Leader Console navigation */}
              {leaderConsoleMode && <LeaderSidebar activeConsoleTab={activeConsoleTab} />}
            </aside>

            <AppWorkspaceFrame routeName={location.pathname}>
              <AppRouteSurface
                leaderConsoleMode={leaderConsoleMode}
                activeConsoleTab={activeConsoleTab}
                darkMode={darkMode}
                connectionsPage={connectionsPage}
                myPathPage={myPathPage}
                learningPage={learningPage}
                meetingsPage={meetingsPage}
                communityFeedPage={communityFeedPage}
                insightsPage={insightsPage}
                contributionPage={contributionPage}
                openFaq={openFaq}
                setOpenFaq={setOpenFaq}
              />
            </AppWorkspaceFrame>
            </Suspense>
            </div>
          </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-around py-2 px-4">
            {mobileBottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.path === location.pathname;

              return (
                <button key={item.id} onClick={() => navigate(item.path)} className="flex flex-col items-center gap-1 py-1 px-2">
                  <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }} />
                  <span className="text-[10px]" style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }}>{getMobileBottomNavLabel(item)}</span>
                </button>
              );
            })}
            <button className="flex flex-col items-center gap-1 py-1 px-2">
              <MoreHorizontal className="w-5 h-5" style={{ color: 'var(--text-muted)' }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Ещё</span>
            </button>
          </div>
        </nav>
        <div className="lg:hidden h-20" />
      </div>
    </div>
    </NavigationAccessProvider>
    </ToastProvider>
  );
}

export default App;