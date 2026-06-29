import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  Compass,
  Crown,
  HelpCircle,
  LogOut,
  MessageCircle,
  Moon,
  Plus,
  Search,
  Settings,
  Shield,
  Sparkles,
  Sun,
  TrendingUp,
  User,
  UserPlus,
  Workflow,
} from 'lucide-react';

import { images } from '@/assets/images';

interface AppHeaderProps {
  darkMode: boolean;
  onOpenCommandPalette: () => void;
  onToggleDarkMode: () => void;
}

const myCommunitiesList = [
  { name: 'AI & ML', icon: Sparkles, members: '1,203', role: 'участник' },
  { name: 'Финтех', icon: TrendingUp, members: '856', role: 'лидер' },
  { name: 'DevOps', icon: Workflow, members: '634', role: 'участник' },
];

export function AppHeader({ darkMode, onOpenCommandPalette, onToggleDarkMode }: AppHeaderProps) {
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const communityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarMenuOpen(false);
      if (communityRef.current && !communityRef.current.contains(e.target as Node)) setCommunityDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* Community Selector — UPDATED */}
        <div className="relative" ref={communityRef}>
          <div className="flex items-center gap-2 cursor-pointer px-2.5 md:px-3 py-2 rounded-xl transition-all duration-200" style={{ border: '1px solid var(--border-color)' }} onClick={() => setCommunityDropdownOpen(!communityDropdownOpen)}>
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>
              <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)' }}>IT технологии</span>
            <ChevronDown className="w-4 h-4 transition-transform duration-200" style={{ color: 'var(--text-muted)', transform: communityDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </div>

          {communityDropdownOpen && (
            <div className="absolute top-14 left-0 w-72 md:w-80 rounded-2xl py-2 z-50" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0,0,0,0.12)' }}>
              {/* Search */}
              <div className="px-3 pb-2">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <input type="text" placeholder="Поиск сообществ..." className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--text-primary)' }} />
                </div>
              </div>
              {/* Actions */}
              <div className="px-3 pb-2 space-y-1">
                <button className="hover-bg w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--text-primary)' }}>
                  <Plus className="w-4 h-4" style={{ color: 'var(--gold)' }} /> Создать сообщество
                </button>
                <button className="hover-bg w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--text-primary)' }}>
                  <Compass className="w-4 h-4" style={{ color: 'var(--gold)' }} /> Поиск сообществ
                </button>
              </div>
              {/* Single divider + all communities */}
              <div className="mx-3 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
              <div className="px-3 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider mb-1 px-1" style={{ color: 'var(--text-muted)' }}>Мои сообщества</p>
                {/* IT технологии — no crown, moved here */}
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 mb-1" style={{ backgroundColor: 'var(--hover-bg)' }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>
                    <Shield className="w-4.5 h-4.5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>IT технологии</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>2,847 участников · Вы участник</p>
                  </div>
                </button>
                {/* Other communities */}
                {myCommunitiesList.map((comm, i) => (
                  <button key={i} className="hover-text-primary w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--hover-bg)' }}>
                      <comm.icon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-sm">{comm.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{comm.members} участников · Вы {comm.role}</p>
                    </div>
                    {comm.name === 'Финтех' && <Crown className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
          <button
            type="button"
            onClick={onOpenCommandPalette}
            className="flex items-center gap-2 px-4 py-2 rounded-xl w-full text-left transition-all duration-200"
            style={{ backgroundColor: darkMode ? '#1A1A1E' : '#F5F4F0', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
            aria-label="Открыть быстрый переход"
          >
            <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
            <span className="text-sm flex-1">Поиск по сообществу...</span>
            <kbd className="hidden lg:inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>⌘K</kbd>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button className="theme-toggle" onClick={onToggleDarkMode}>{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
          <button className="theme-toggle relative"><Bell className="w-5 h-5" /><span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1" style={{ background: 'linear-gradient(135deg, #B85C57, #C9706A)' }}>3</span></button>
          <button className="theme-toggle relative hidden sm:flex"><MessageCircle className="w-5 h-5" /><span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>7</span></button>
          <div className="relative ml-1" ref={avatarRef}>
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden cursor-pointer" style={{ border: '2px solid var(--gold)' }} onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}>
              <img src={images.avatarFounder} alt="Profile" className="w-full h-full object-cover" />
            </div>
            {avatarMenuOpen && (
              <div className="absolute right-0 top-11 md:top-12 w-56 rounded-2xl py-2 z-50" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: darkMode ? '0 8px 32px rgba(0,0,0,0.45)' : '0 8px 32px rgba(0,0,0,0.12)' }}>
                <div className="px-4 py-3 mb-1" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Александр Шилов</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--gold)' }}>Уровень: Пламя</p>
                </div>
                <button className="hover-text-primary w-full flex items-center gap-3 px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <User className="w-4 h-4" /><span>Мой профиль</span>
                </button>
                <button className="hover-text-primary w-full flex items-center gap-3 px-4 py-2.5 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  <Settings className="w-4 h-4" /><span>Настройки участия</span>
                </button>
                {/* NEW: Пригласить участника */}
                <button className="hover-bg w-full flex items-center gap-3 px-4 py-2.5 text-sm" style={{ color: 'var(--gold)', fontWeight: 500 }}>
                  <UserPlus className="w-4 h-4" /><span>Пригласить участника</span>
                </button>
                {/* Divider */}
                <div className="mx-4 my-1 h-px" style={{ backgroundColor: 'var(--border-color)' }} />
                {/* Dimmed items */}
                <button className="hover-text-primary w-full flex items-center gap-3 px-4 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <HelpCircle className="w-4 h-4" /><span>Служба поддержки</span>
                </button>
                <button className="hover-text-primary w-full flex items-center gap-3 px-4 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Plus className="w-4 h-4" /><span>Создать сообщество</span>
                </button>
                <button className="hover-text-primary w-full flex items-center gap-3 px-4 py-2.5 text-sm" style={{ color: 'var(--text-muted)' }}>
                  <Compass className="w-4 h-4" /><span>Поиск сообществ</span>
                </button>
                <button className="hover-bg w-full flex items-center gap-3 px-4 py-2.5 text-sm" style={{ color: '#C9706A' }}>
                  <LogOut className="w-4 h-4" /><span>Выйти</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
