import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Map, Users, BookOpen, Calendar, Link2, Heart,
  Sun, Moon, Search, Bell, MessageCircle, Crown,
  Star, Settings, HelpCircle, LogOut,
  User, Shield, ChevronDown, Compass,
  TrendingUp, Check, BookMarked, Sparkles, Gem, Eye,
  ArrowRight, Target, Lightbulb, HandHeart, MessageSquareQuote,
  Award, UserPlus, Workflow, Repeat,
  Lock, Wallet, CreditCard, Crown as CrownIcon, Plus, MoreHorizontal, Zap
} from 'lucide-react';
import LeaderConsoleMain from './LeaderConsoleMain';
import LeaderConsoleEntry from './LeaderConsoleEntry';
import LeaderConsoleRequests from './LeaderConsoleRequests';
import LeaderConsoleConnections from './LeaderConsoleConnections';
import LeaderConsoleContribution from './LeaderConsoleContribution';
import LeaderConsoleMonetization from './LeaderConsoleMonetization';
import LeaderConsoleSettings from './LeaderConsoleSettings';
import { ToastProvider } from './ToastContext';

/* ===== DATA ===== */
const navItems = [
  { icon: Map, label: 'Мой путь', active: false },
  { icon: Users, label: 'Сообщество', active: false },
  { icon: BookOpen, label: 'Обучение', active: false },
  { icon: Calendar, label: 'Встречи', active: false },
  { icon: Link2, label: 'Связи', active: false },
  { icon: Lightbulb, label: 'Инсайты', active: false },
  { icon: Heart, label: 'Вклад', active: false },
];



const myCommunitiesList = [
  { name: 'AI & ML', icon: Sparkles, members: '1,203', role: 'участник' },
  { name: 'Финтех', icon: TrendingUp, members: '856', role: 'лидер' },
  { name: 'DevOps', icon: Workflow, members: '634', role: 'участник' },
];

const teamAvatars = [
  '/team-1.jpg', '/team-2.jpg', '/team-3.jpg', '/team-4.jpg',
  '/team-5.jpg', '/team-6.jpg', '/team-7.jpg',
];

const memberAvatars = [
  '/avatar-1.jpg', '/avatar-2.jpg', '/avatar-3.jpg',
  '/avatar-4.jpg', '/avatar-5.jpg', '/avatar-founder.jpg',
];

const quickLinks = [
  { icon: CrownIcon, label: 'Перейти на Premium', gold: true },
  { icon: Sparkles, label: 'Создать своё сообщество' },
];

const receiveSupport = [
  { icon: BookMarked, title: 'Обучение через практику', desc: 'Треки, разборы кейсов и пошаговые программы от менторов' },
  { icon: Users, title: 'Поддержка сообщества', desc: 'Новички не остаются одни — везде есть люди, готовые помочь' },
  { icon: Calendar, title: 'Живые встречи и разборы', desc: 'Онлайн- и офлайн-мероприятия с практиками и обратной связью' },
];

const becomeEnvironment = [
  { icon: Link2, title: 'Связи, которые ведут', desc: 'Нетворкинг с профессионалами, не случайные знакомства' },
  { icon: Heart, title: 'Вклад, который замечают', desc: 'Ваши ответы, разборы и поддержка становятся видимым следом пользы' },
  { icon: Gem, title: 'Путь от новичка до носителя ценности', desc: '9 уровней развития внутри сообщества через реальный вклад' },
];

const pathSteps = [
  { num: 1, label: 'Присоединяюсь', desc: 'Вступаю в сообщество, знакомлюсь с правилами' },
  { num: 2, label: 'Указываю цель', desc: 'Формулирую запрос — куда хочу прийти' },
  { num: 3, label: 'Получаю поддержку', desc: 'Задаю вопросы, прошу помощь, получаю отклики' },
  { num: 4, label: 'Участвую в треках', desc: 'Прохожу программы, практикую, делаю шаги' },
  { num: 5, label: 'Делаю Вклад', desc: 'Помогаю другим, участвую в разборах, делюсь опытом' },
  { num: 6, label: 'Становлюсь опорой', desc: 'Признаюсь как носитель ценности для сообщества' },
];

const supportCycle = [
  { icon: Target, label: 'Застрял', desc: 'Столкнулся с трудностью' },
  { icon: MessageSquareQuote, label: 'Попросил помощь', desc: 'Описал ситуацию в сообществе' },
  { icon: HandHeart, label: 'Получил отклик', desc: 'Кто-то откликнулся и помог' },
  { icon: TrendingUp, label: 'Продвинулся', desc: 'Сделал шаг благодаря поддержке' },
  { icon: Heart, label: 'Поблагодарил', desc: 'Признал пользу — закрыл цикл' },
];

const learningRoute = [
  { icon: Workflow, label: 'Трек', desc: 'Маршрут развития' },
  { icon: Target, label: 'Шаг', desc: 'Конкретное действие' },
  { icon: BookOpen, label: 'Практика', desc: 'Применение на деле' },
  { icon: HandHeart, label: 'Помощь', desc: 'Поддержка при сложностях' },
  { icon: MessageSquareQuote, label: 'Разбор', desc: 'Обратная связь' },
  { icon: Lightbulb, label: 'Инсайт', desc: 'Осознание и рост' },
];

const contributionLoop = [
  { icon: HandHeart, label: 'Помог', desc: 'Ответил, поддержал, разобрал' },
  { icon: Check, label: 'Пользу отметили', desc: 'Другой участник признал пользу' },
  { icon: Star, label: 'Вклад накопился', desc: 'Видимый след полезности' },
  { icon: Award, label: 'Признание', desc: 'Статус и уровень отражают вклад' },
  { icon: UserPlus, label: 'Роль', desc: 'Становлюсь опорой для других' },
];

const weekRhythm = [
  { day: 'Пн', label: 'Эфир', desc: 'Живая встреча сообщества', highlight: false },
  { day: 'Вт', label: 'Практика', desc: 'Самостоятельная работа', highlight: false },
  { day: 'Ср', label: 'День разборов', desc: 'Разборы кейсов участников', highlight: true },
  { day: 'Чт', label: 'Помощь', desc: 'Взаимная поддержка', highlight: false },
  { day: 'Пт', label: 'Помощь-день', desc: 'Консультации и ответы', highlight: true },
  { day: 'Сб', label: 'Office Hours', desc: 'Встречи с менторами', highlight: true },
  { day: 'Вс', label: 'Отдых', desc: 'Восстановление', highlight: false },
];

const faqItems = [
  { q: 'Как вступить в сообщество?', a: 'Нажмите «Вступить в сообщество» на этой странице. Доступ открыт — заявка рассматривается в течение 24 часов.' },
  { q: 'Что такое Вклад?', a: 'Вклад — это видимый след вашей пользы сообществу. Помощь новичкам, полезные ответы, разборы — всё это признаётся и накапливается.' },
  { q: 'Сообщество платное?', a: 'Вступление бесплатно. PREMIUM-уровень даёт доступ к закрытым материалам и ускоренному росту.' },
  { q: 'Как проходят встречи?', a: 'Основной формат — онлайн-разборы 1-2 раза в неделю. Также проводятся офлайн-встречи в крупных городах.' },
  { q: 'Кто видит мои цели и запросы?', a: 'Вы управляете тем, кто видит ваши цели, запросы, Вклад и работы на разбор. Чувствительные действия не становятся публичными без выбранной видимости или согласия.' },
];

/* ===== COMPONENT ===== */
function App({ leaderMode = false, leaderTab = 'main' }: { leaderMode?: boolean; leaderTab?: 'main' | 'entry' | 'requests' | 'connections' | 'contribution' | 'monetization' | 'settings' }) {
  const navigate = useNavigate();
  const location = useLocation();
  const leaderConsoleMode = leaderMode || location.pathname === '/leader' || location.pathname === '/leader/entry';
  const activeConsoleTab = leaderMode ? leaderTab : 'main';
  const [darkMode, setDarkMode] = useState(true);
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
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

  const sectionDivider = <div className="mx-[-20px] md:mx-[-32px] h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />;
  const sectionSpacing = "py-6 md:py-8";

  return (
    <ToastProvider>
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-main)' }}>

        {/* ===== HEADER ===== */}
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
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl w-full" style={{ backgroundColor: darkMode ? '#1A1A1E' : '#F5F4F0', border: '1px solid var(--border-color)' }}>
                <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <input type="text" placeholder="Поиск по сообществу..." className="bg-transparent text-sm outline-none w-full" style={{ color: 'var(--text-primary)' }} />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-1.5 md:gap-2">
              <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}</button>
              <button className="theme-toggle relative"><Bell className="w-5 h-5" /><span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1" style={{ background: 'linear-gradient(135deg, #B85C57, #C9706A)' }}>3</span></button>
              <button className="theme-toggle relative hidden sm:flex"><MessageCircle className="w-5 h-5" /><span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>7</span></button>
              <div className="relative ml-1" ref={avatarRef}>
                <div className="w-8 h-8 md:w-9 md:h-9 rounded-full overflow-hidden cursor-pointer" style={{ border: '2px solid var(--gold)' }} onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}>
                  <img src="/avatar-founder.jpg" alt="Profile" className="w-full h-full object-cover" />
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

        {/* ===== MAIN LAYOUT ===== */}
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="flex flex-col lg:flex-row gap-4 md:gap-6">

            {/* LEFT SIDEBAR — TWO LAYERS */}
            <aside className="hidden lg:flex flex-col w-[240px] shrink-0 sticky top-[88px] h-[calc(100vh-104px)]">
              {/* Layer 1: Community navigation */}
              {!leaderConsoleMode && (
                <div className="flex flex-col h-full">
                  <nav className="space-y-1 flex-1">
                    {navItems.map((item, i) => (
                      <div key={i} className={`nav-item ${item.active ? 'active' : ''}`}>
                        <item.icon className="nav-icon" /><span>{item.label}</span>
                      </div>
                    ))}
                  </nav>
                  {/* Leader Console CTA */}
                  <div className="pt-4 pb-2 px-1">
                    <div className="h-px mb-4" style={{ backgroundColor: 'var(--border-color)' }} />
                    <button
                      onClick={() => navigate('/leader')}
                      className="w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group"
                      style={{
                        background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))',
                        boxShadow: '0 4px 20px rgba(212, 175, 55, 0.2)',
                        color: '#fff',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 6px 28px rgba(212, 175, 55, 0.35)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(212, 175, 55, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      <Crown className="w-4 h-4" />
                      <span>Консоль лидера</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Layer 2: Leader Console navigation */}
              {leaderConsoleMode && (
                <div className="flex flex-col h-full">
                  <nav className="space-y-1 flex-1 pt-2">
                    {[
                      { label: 'Главное сейчас', icon: Zap, count: undefined, tab: 'main' as const },
                      { label: 'Вступление', icon: UserPlus, count: 5, tab: 'entry' as const },
                      { label: 'Запросы', icon: HelpCircle, count: 0, tab: 'requests' as const },
                      { label: 'Связи', icon: Link2, count: undefined, tab: 'connections' as const },
                      { label: 'Вклад', icon: Heart, count: 9, tab: 'contribution' as const },
                      { label: 'Монетизация', icon: CreditCard, count: 1, tab: 'monetization' as const },
                      { label: 'Настройки', icon: Settings, count: undefined, tab: 'settings' as const },
                    ].map((item) => (
                      <button
                        key={item.tab}
                        onClick={() => navigate(`/leader${item.tab === 'main' ? '' : `/${item.tab}`}`)}
                        className={`nav-item ${activeConsoleTab === item.tab ? 'active' : ''} justify-between w-full text-left`}
                      >
                        <div className="flex items-center gap-3">
                          <item.icon className="nav-icon" /><span>{item.label}</span>
                        </div>
                        {item.count !== undefined && (
                          <span
                            className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-semibold"
                            style={{
                              backgroundColor: item.count > 5 ? 'rgba(201, 112, 106, 0.15)' : 'rgba(212, 175, 55, 0.12)',
                              color: item.count > 5 ? '#C9706A' : 'var(--gold)',
                            }}
                          >{item.count}</span>
                        )}
                      </button>
                    ))}
                  </nav>
                  {/* Back to community */}
                  <div className="pt-4 pb-2 px-1">
                    <div className="h-px mb-4" style={{ backgroundColor: 'var(--border-color)' }} />
                    <button
                      onClick={() => navigate('/')}
                      className="hover-text-primary w-full flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-medium"
                      style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                    >
                      <ArrowRight className="w-4 h-4 rotate-180" />
                      <span>Вернуться в сообщество</span>
                    </button>
                  </div>
                </div>
              )}
            </aside>

            <div className="flex-1 min-w-0 flex flex-col lg:flex-row gap-4 md:gap-6">
              {/* ===== LEADER CONSOLE ===== */}
              {leaderConsoleMode && (
                (() => {
                  switch (activeConsoleTab) {
                    case 'entry': return <LeaderConsoleEntry />;
                    case 'requests': return <LeaderConsoleRequests />;
                    case 'connections': return <LeaderConsoleConnections />;
                    case 'contribution': return <LeaderConsoleContribution />;
                    case 'monetization': return <LeaderConsoleMonetization />;
                    case 'settings': return <LeaderConsoleSettings />;
                    default: return <LeaderConsoleMain />;
                  }
                })()
              )}

              {/* ===== COMMUNITY PAGE ===== */}
              {!leaderConsoleMode && (
              <>
              <main className="flex-1 min-w-0">
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>

                  {/* CAROUSEL — hero + 6 thumbnails */}
                  <div className="px-4 md:px-5 pt-4 md:pt-5 pb-3 md:pb-4">
                    {/* Main hero — full width, equal left/right padding */}
                    <div className="relative rounded-xl overflow-hidden mb-5" style={{ height: 'clamp(200px, 30vw, 360px)' }}>
                      <img src="/hero-cover.jpg" alt="IT технологии" className="w-full h-full object-cover" />
                    </div>
                    {/* 6 thumbnails — increased gap and border-radius */}
                    <div className="grid grid-cols-6 gap-3 md:gap-4">
                      {['/preview-1.jpg','/preview-2.jpg','/preview-3.jpg','/preview-4.jpg','/preview-5.jpg','/preview-6.jpg'].map((src, i) => (
                        <div key={i} className="relative rounded-xl overflow-hidden cursor-pointer transition-transform duration-200 hover:scale-[1.03]" style={{ aspectRatio: '1/1' }}>
                          <img src={src} alt={`Preview ${i+1}`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* TEAM + META BAR — compact single row */}
                  <div className="px-5 md:px-8 pt-3 pb-4">
                    <div className="flex items-center gap-3 md:gap-4 flex-nowrap">
                      {/* 3 avatars + counter */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className="flex -space-x-1.5">
                          {teamAvatars.slice(0, 3).map((src, i) => (
                            <img key={i} src={src} alt={`Команда ${i+1}`} className="w-7 h-7 md:w-8 md:h-8 rounded-full object-cover border-2" style={{ borderColor: 'var(--bg-card)', zIndex: 3 - i }} />
                          ))}
                        </div>
                        <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-md" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--hover-bg)' }}>+4</span>
                      </div>
                      <span className="w-px h-4 shrink-0" style={{ backgroundColor: 'var(--border-color)' }} />
                      {/* Meta — always on same row */}
                      <span className="flex items-center gap-1 text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                        <Lock className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                        <span className="whitespace-nowrap">Закрытое</span>
                      </span>
                      <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--border-color)' }} />
                      <span className="flex items-center gap-1 text-xs shrink-0" style={{ color: 'var(--text-secondary)' }}>
                        <Wallet className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                        <span className="whitespace-nowrap">Бесплатно</span>
                      </span>
                    </div>
                  </div>

                  <div className="h-px mx-5 md:mx-8" style={{ backgroundColor: 'var(--border-color)' }} />

                  {/* О СООБЩЕСТВЕ — IT-specific first */}
                  <div className={`${sectionSpacing} px-5 md:px-8`}>
                    <h2 className="text-lg md:text-xl font-semibold mb-3 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>О сообществе</h2>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                      В IT технологии мы фокусируемся на системной архитектуре, искусственном интеллекте, машинном обучении и разработке масштабируемых решений. Здесь разбирают реальные кейсы от ML-моделей до микросервисной инфраструктуры, а менторы — практикующие техлиды и senior-разработчики из крупных технологических компаний.
                    </p>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Здесь можно проходить треки, задавать вопросы, получать разборы, находить людей рядом и постепенно самому становиться опорой для других.
                    </p>
                  </div>

                  {sectionDivider}

                  {/* ЧТО ДАЁТ УЧАСТИЕ */}
                  <div className={`${sectionSpacing} px-5 md:px-8`}>
                    <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Что даёт участие</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          <HandHeart className="w-4 h-4" style={{ color: 'var(--gold)' }} /> Получаю поддержку
                        </h3>
                        <div className="space-y-3">
                          {receiveSupport.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl premium-card" style={{ backgroundColor: 'var(--hover-bg)' }}>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                                <item.icon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                          <Sparkles className="w-4 h-4" style={{ color: 'var(--gold)' }} /> Становлюсь частью среды
                        </h3>
                        <div className="space-y-3">
                          {becomeEnvironment.map((item, i) => (
                            <div key={i} className="flex items-start gap-3 p-3 rounded-xl premium-card" style={{ backgroundColor: 'var(--hover-bg)' }}>
                              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                                <item.icon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                              </div>
                              <div>
                                <h4 className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</h4>
                                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {sectionDivider}

                  {/* ПУТЬ УЧАСТНИКА */}
                  <div className={`${sectionSpacing} px-5 md:px-8`}>
                    <h2 className="text-lg md:text-xl font-semibold mb-3 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Путь участника</h2>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      Участник не просто потребляет материалы. Сначала осваивается, указывает цель и делает первый шаг. Затем получает поддержку, участвует в треках и разборах, а позже может помогать другим.
                    </p>
                    <div className="hidden md:block">
                      <div className="flex items-start gap-2">
                        {pathSteps.map((step, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center text-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-2" style={{ backgroundColor: i < 3 ? 'var(--gold)' : 'var(--hover-bg)', color: i < 3 ? '#fff' : 'var(--text-muted)', border: i < 3 ? '2px solid var(--gold)' : '2px solid var(--border-color)' }}>
                              {step.num}
                            </div>
                            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{step.label}</p>
                            <p className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="md:hidden flex flex-col items-start gap-0 relative pl-4">
                      <div className="absolute left-[11px] top-2 bottom-2 w-px" style={{ backgroundColor: 'var(--border-color)' }} />
                      {pathSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 relative z-10">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5" style={{ backgroundColor: i < 3 ? 'var(--gold)' : 'var(--bg-card)', color: i < 3 ? '#fff' : 'var(--text-muted)', border: i < 3 ? '2px solid var(--gold)' : '2px solid var(--border-color)' }}>
                            {step.num}
                          </div>
                          <div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{step.label}</span>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sectionDivider}

                  {/* ЦИКЛ ПОДДЕРЖКИ */}
                  <div className={`${sectionSpacing} px-5 md:px-8`}>
                    <h2 className="text-lg md:text-xl font-semibold mb-3 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Как работает поддержка</h2>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      Поддержка в сообществе — это не разовый совет, а замкнутый цикл. Каждый шаг ведёт к следующему, и цикл завершается благодарностью.
                    </p>
                    <div className="hidden md:flex items-center gap-2">
                      {supportCycle.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 flex-1">
                          <div className="flex-1 flex flex-col items-center text-center p-4 rounded-xl premium-card" style={{ backgroundColor: 'var(--hover-bg)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                              <step.icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                            </div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{step.label}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                          </div>
                          {i < supportCycle.length - 1 && <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />}
                        </div>
                      ))}
                    </div>
                    <div className="md:hidden flex flex-col gap-2">
                      {supportCycle.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl premium-card" style={{ backgroundColor: 'var(--hover-bg)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                            <step.icon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{step.label}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sectionDivider}

                  {/* МАРШРУТ ОБУЧЕНИЯ */}
                  <div className={`${sectionSpacing} px-5 md:px-8`}>
                    <h2 className="text-lg md:text-xl font-semibold mb-3 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Обучение и треки</h2>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      Обучение построено как треки роста: маршрут из шагов, практики, помощи, разборов и инсайтов сообщества.
                    </p>
                    <div className="hidden md:flex items-center gap-2">
                      {learningRoute.map((step, i) => (
                        <div key={i} className="flex items-center gap-2 flex-1">
                          <div className="flex-1 flex flex-col items-center text-center p-4 rounded-xl premium-card" style={{ backgroundColor: 'var(--hover-bg)' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                              <step.icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                            </div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{step.label}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                          </div>
                          {i < learningRoute.length - 1 && <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />}
                        </div>
                      ))}
                    </div>
                    <div className="md:hidden flex flex-col gap-2">
                      {learningRoute.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl premium-card" style={{ backgroundColor: 'var(--hover-bg)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                            <step.icon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{step.label}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sectionDivider}

                  {/* ВСТРЕЧИ И РИТМ */}
                  <div className={`${sectionSpacing} px-5 md:px-8`}>
                    <h2 className="text-lg md:text-xl font-semibold mb-3 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Встречи и разборы</h2>
                    <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Живой ритм сообщества — каждый день недели имеет своё назначение. Основные события проходят в середине недели и в субботу.
                    </p>
                    <div className="hidden md:grid grid-cols-7 gap-2">
                      {weekRhythm.map((item, i) => (
                        <div key={i} className="flex flex-col items-center text-center p-3 rounded-xl premium-card" style={{ backgroundColor: item.highlight ? 'rgba(212, 175, 55, 0.08)' : 'var(--hover-bg)', border: item.highlight ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid transparent' }}>
                          <span className="text-xs font-bold mb-1" style={{ color: item.highlight ? 'var(--gold)' : 'var(--text-primary)' }}>{item.day}</span>
                          <span className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                          <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
                        </div>
                      ))}
                    </div>
                    <div className="md:hidden flex flex-col gap-2">
                      {weekRhythm.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl premium-card" style={{ backgroundColor: item.highlight ? 'rgba(212, 175, 55, 0.08)' : 'var(--hover-bg)', border: item.highlight ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid transparent' }}>
                          <span className="text-sm font-bold w-8 shrink-0" style={{ color: item.highlight ? 'var(--gold)' : 'var(--text-primary)' }}>{item.day}</span>
                          <div>
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{item.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sectionDivider}

                  {/* СВЯЗИ И ПОДДЕРЖКА */}
                  <div className={`${sectionSpacing} px-5 md:px-8`}>
                    <h2 className="text-lg md:text-xl font-semibold mb-3 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Связи и поддержка</h2>
                    <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                      Главная ценность — не только материалы, а люди рядом. Вы можете видеть, кто проходит похожий путь, кто уже проходил ваш текущий этап, кто готов помочь.
                    </p>
                    <div className="hidden md:flex items-center justify-center py-4">
                      <div className="relative flex items-center justify-center" style={{ width: '400px', height: '260px' }}>
                        <div className="absolute rounded-full flex items-center justify-center" style={{ width: '260px', height: '260px', border: '2px solid var(--border-color)', backgroundColor: 'rgba(212, 175, 55, 0.02)' }}>
                          <span className="absolute text-xs font-medium px-2 py-1 rounded-md" style={{ top: '8px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>Эксперты</span>
                        </div>
                        <div className="absolute rounded-full flex items-center justify-center" style={{ width: '200px', height: '200px', border: '2px solid var(--border-color)', backgroundColor: 'rgba(212, 175, 55, 0.04)' }}>
                          <span className="absolute text-xs font-medium px-2 py-1 rounded-md" style={{ top: '6px', color: 'var(--text-muted)', backgroundColor: 'var(--bg-card)' }}>Кураторы</span>
                        </div>
                        <div className="absolute rounded-full flex items-center justify-center" style={{ width: '140px', height: '140px', border: '2px solid rgba(212, 175, 55, 0.3)', backgroundColor: 'rgba(212, 175, 55, 0.06)' }}>
                          <span className="absolute text-xs font-medium px-2 py-1 rounded-md" style={{ top: '4px', color: 'var(--gold-light)', backgroundColor: 'var(--bg-card)' }}>Менторы</span>
                        </div>
                        <div className="absolute rounded-full flex items-center justify-center" style={{ width: '80px', height: '80px', border: '2px solid rgba(212, 175, 55, 0.5)', backgroundColor: 'rgba(212, 175, 55, 0.1)' }}>
                          <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Участники</span>
                        </div>
                        <div className="absolute w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', boxShadow: '0 2px 12px rgba(212, 175, 55, 0.3)' }}>
                          <span className="text-[10px] font-bold text-white">Я</span>
                        </div>
                      </div>
                    </div>
                    <div className="md:hidden space-y-2">
                      {[{label:'Эксперты',desc:'Глубокая экспертиза'},{label:'Кураторы',desc:'Сопровождают треки'},{label:'Менторы',desc:'Опытные наставники'},{label:'Участники',desc:'Люди рядом с похожим путём'},{label:'Я',desc:'Ваш путь и запрос'}].map((layer, i, arr) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl premium-card" style={{ backgroundColor: i === arr.length-1 ? 'rgba(212, 175, 55, 0.08)' : 'var(--hover-bg)', border: i === arr.length-1 ? '1px solid rgba(212, 175, 55, 0.2)' : '1px solid transparent', marginLeft: `${(arr.length - 1 - i) * 12}px` }}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background: i === arr.length-1 ? 'linear-gradient(135deg, var(--gold-dark), var(--gold))' : 'var(--bg-card)', border: i === arr.length-1 ? 'none' : '1px solid var(--border-color)' }}>
                            <span className="text-[9px] font-bold" style={{ color: i === arr.length-1 ? '#fff' : 'var(--text-muted)' }}>{i === arr.length-1 ? 'Я' : layer.label[0]}</span>
                          </div>
                          <div>
                            <span className="text-sm font-medium" style={{ color: i === arr.length-1 ? 'var(--gold)' : 'var(--text-primary)' }}>{layer.label}</span>
                            <span className="text-xs ml-2" style={{ color: 'var(--text-muted)' }}>{layer.desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {sectionDivider}

                  {/* КУЛЬТУРА */}
                  <div className={`${sectionSpacing} px-5 md:px-8`}>
                    <h2 className="text-lg md:text-xl font-semibold mb-4 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Культура участия</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-4">
                      {[
                        { title: 'Задавать вопросы', desc: 'Нет глупых вопросов — только незаданные' },
                        { title: 'Просить помощь без стыда', desc: 'Поддержка — основа сообщества' },
                        { title: 'Давать бережный разбор', desc: 'Конкретно, уважительно, полезно' },
                        { title: 'Благодарить за пользу', desc: 'Признание — часть культуры' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="w-4 h-4 mt-0.5 shrink-0" style={{ color: 'var(--gold)' }} />
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.title}</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="p-3 md:p-4 rounded-xl" style={{ backgroundColor: darkMode ? 'rgba(201, 112, 106, 0.04)' : 'rgba(201, 112, 106, 0.03)', border: '1px solid rgba(201, 112, 106, 0.1)' }}>
                      <p className="text-xs md:text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span style={{ color: '#C9706A' }}>Не поддерживается:</span> токсичная критика, давление и обесценивание других участников.
                      </p>
                    </div>
                  </div>

                  {sectionDivider}

                  {/* ПРИВАТНОСТЬ */}
                  <div className={`${sectionSpacing} px-5 md:px-8`}>
                    <h2 className="text-lg md:text-xl font-semibold mb-3 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Приватность и безопасность</h2>
                    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      Вы управляете тем, кто видит ваши цели, запросы, Вклад и работы на разбор. Чувствительные действия не становятся публичными без выбранной видимости или согласия.
                    </p>
                  </div>

                </div>
                {/* ===== END UNIFIED SURFACE ===== */}

                {/* ВКЛАД */}
                <div className="rounded-2xl p-5 md:p-8 my-4 md:my-6 relative overflow-hidden" style={{ background: darkMode ? 'linear-gradient(135deg, #1A1810, #2A2218)' : 'linear-gradient(135deg, #FDF8F0, #F5EFE3)', border: '1px solid rgba(212, 175, 55, 0.25)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }} />
                  <div className="relative z-10">
                    <h2 className="text-lg md:text-xl font-bold mb-3 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Как здесь появляется Вклад</h2>
                    <p className="text-sm leading-relaxed mb-5 max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                      Вклад появляется, когда ваша помощь становится полезной другим. Это не гонка за баллами, а видимый след пользы, который накапливается и отражается в вашем статусе.
                    </p>
                    <div className="hidden md:flex items-center justify-center gap-2 mb-6">
                      {contributionLoop.map((step, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <div className="flex flex-col items-center text-center p-4 rounded-xl premium-card" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.15)', width: '130px' }}>
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: 'rgba(212, 175, 55, 0.12)' }}>
                              <step.icon className="w-5 h-5" style={{ color: 'var(--gold)' }} />
                            </div>
                            <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{step.label}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                          </div>
                          {i < contributionLoop.length - 1 && <ArrowRight className="w-4 h-4 shrink-0" style={{ color: 'var(--gold)' }} />}
                          {i === contributionLoop.length - 1 && <Repeat className="w-4 h-4" style={{ color: 'var(--gold)' }} />}
                        </div>
                      ))}
                    </div>
                    <div className="md:hidden flex flex-col gap-2 mb-5">
                      {contributionLoop.map((step, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl premium-card" style={{ backgroundColor: 'rgba(212, 175, 55, 0.08)', border: '1px solid rgba(212, 175, 55, 0.15)' }}>
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: 'rgba(212, 175, 55, 0.12)' }}>
                            <step.icon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                          </div>
                          <div>
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{step.label}</p>
                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{step.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button className="px-6 py-3 rounded-xl text-sm font-semibold text-white transition-all duration-200" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', boxShadow: '0 4px 20px rgba(212, 175, 55, 0.25)' }}>
                      Посмотреть мой Вклад
                    </button>
                  </div>
                </div>

                {/* FAQ */}
                <div className="rounded-2xl p-5 md:p-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
                  <h2 className="text-lg md:text-xl font-semibold mb-4 md:mb-5 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Частые вопросы</h2>
                  <div className="space-y-2">
                    {faqItems.map((faq, i) => (
                      <div key={i} className="rounded-xl overflow-hidden premium-card" style={{ border: '1px solid var(--border-color)' }}>
                        <button className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-medium transition-colors duration-150" style={{ color: 'var(--text-primary)' }} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                          <span>{faq.q}</span>
                          <ChevronDown className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: 'var(--text-muted)', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                        </button>
                        {openFaq === i && (
                          <div className="px-4 pb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>{faq.a}</div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </main>

              {/* ===== RIGHT SIDEBAR ===== */}
              <aside className="hidden lg:block w-[240px] shrink-0 space-y-5">

                {/* Community Card — REDESIGNED */}
                <div className="sidebar-section overflow-hidden">
                  {/* Cover — different from hero, taller */}
                  <div className="mx-[-20px] mt-[-20px] mb-4" style={{ height: '140px' }}>
                    <img src="/card-cover.jpg" alt="IT технологии" className="w-full h-full object-cover" style={{ borderRadius: '0.75rem 0.75rem 0 0' }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>IT технологии</h3>
                  <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                    Сообщество для разработчиков, архитекторов и специалистов по ИИ, которые растут через практику, разборы и связи.
                  </p>
                  {/* Stats: 2,847 · 87 онлайн · 7 команда */}
                  <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                    <div className="p-2 rounded-lg premium-card" style={{ backgroundColor: 'var(--hover-bg)' }}>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>2,847</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>участников</p>
                    </div>
                    <div className="p-2 rounded-lg premium-card" style={{ backgroundColor: 'var(--hover-bg)' }}>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>87</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>онлайн</p>
                    </div>
                    <div className="p-2 rounded-lg premium-card" style={{ backgroundColor: 'var(--hover-bg)' }}>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>7</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>команда</p>
                    </div>
                  </div>
                  {/* Quick links */}
                  <div className="space-y-2 mb-4">
                    {quickLinks.map((link, i) => (
                      <button key={i} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-150 text-left" style={{ color: link.gold ? 'var(--gold)' : 'var(--text-secondary)', backgroundColor: 'var(--hover-bg)' }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = link.gold ? 'var(--gold-light)' : 'var(--text-primary)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = link.gold ? 'var(--gold)' : 'var(--text-secondary)'; }}>
                        <link.icon className="w-3.5 h-3.5 shrink-0" />
                        <span>{link.label}</span>
                      </button>
                    ))}
                  </div>
                  {/* Member avatars — spaced out, no count */}
                  <div className="flex items-center gap-1 mb-4">
                    {memberAvatars.map((src, i) => (
                      <img key={i} src={src} alt={`Участник ${i+1}`} className="w-8 h-8 rounded-full object-cover border-2" style={{ borderColor: 'var(--hover-bg)' }} />
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 mb-3" style={{ border: '1px solid var(--gold)', color: 'var(--gold)', background: 'transparent' }}>
                    Пригласить участника
                  </button>
                  {/* Mini-link: Подробнее о сообществе */}
                  <button
                    onClick={() => navigate('/community')}
                    className="hover-text-primary w-full flex items-center justify-center gap-1.5 py-2 text-[11px] rounded-lg transition-colors"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    <InfoIcon className="w-3 h-3" />
                    <span>Подробнее о сообществе</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>

                {/* Culture */}
                <div className="sidebar-section">
                  <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text-primary)' }}>Здесь принято</h3>
                  <div className="space-y-2">
                    {['Задавать вопросы', 'Просить помощь без стыда', 'Давать бережный разбор', 'Благодарить за пользу', 'Делиться опытом'].map((item, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <Check className="w-3 h-3" style={{ color: 'var(--gold)' }} />
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Privacy */}
                <div className="sidebar-section">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                    <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Приватность</h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Вы управляете тем, кто видит ваши цели, запросы, Вклад и работы на разбор.</p>
                </div>
              </aside>
            </>
            )}
            </div>
          </div>
        </div>

        {/* MOBILE BOTTOM NAV */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 pb-[env(safe-area-inset-bottom)]" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', backdropFilter: 'blur(12px)' }}>
          <div className="flex items-center justify-around py-2 px-4">
            {[{ icon: Map, label: 'Путь' }, { icon: Users, label: 'Сообщество' }, { icon: BookOpen, label: 'Обучение' }, { icon: Link2, label: 'Связи' }, { icon: MoreHorizontal, label: 'Ещё' }].map((item, i) => (
              <button key={i} className="flex flex-col items-center gap-1 py-1 px-2">
                <item.icon className="w-5 h-5" style={{ color: i === 1 ? 'var(--gold)' : 'var(--text-muted)' }} />
                <span className="text-[10px]" style={{ color: i === 1 ? 'var(--gold)' : 'var(--text-muted)' }}>{item.label}</span>
              </button>
            ))}
          </div>
        </nav>
        <div className="lg:hidden h-20" />
      </div>
    </div>
    </ToastProvider>
  );
}

/* Inline info icon component */
function InfoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

export default App;