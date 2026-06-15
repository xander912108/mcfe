import { useState } from 'react';
import {
  ChevronRight, X, AlertTriangle, Zap,
  Globe, Users, Sliders, Shield,
  Check, ArrowRight, Info,
  Mail, CreditCard, HardDrive, Webhook,
  Bell, Star, Calendar,
  Eye, FileText, Lock, Clock,
} from 'lucide-react';
import { useToast } from './ToastContext';

/* ===== PREMIUM COLORS ===== */
const TERRACOTTA = '#C9706A';
const TERRACOTTA_LIGHT = 'rgba(201,112,106,0.08)';
const TERRACOTTA_BORDER = 'rgba(201,112,106,0.15)';
const SAGE = '#6B9E7C';
const SAGE_LIGHT = 'rgba(107,158,124,0.08)';
const SAGE_BORDER = 'rgba(107,158,124,0.15)';
const GOLD_GLOW = 'rgba(201,169,110,0.08)';

/* ===== SECTION TYPE ===== */
type SectionKey = 'attention' | 'community' | 'team' | 'rules' | 'security';

/* ===== DATA: ATTENTION CARDS ===== */
const attentionCards = [
  {
    id: 1,
    title: 'У роли куратора слишком широкие права',
    text: 'Кураторы могут менять настройки доступа, хотя обычно им достаточно работать с запросами, разборами и новичками.',
    primary: 'Проверить права',
    accent: 'terracotta' as const,
    why: 'Чем шире права, тем выше риск случайного изменения. Лучше давать права по принципу минимума: только то, что нужно для задачи.',
  },
  {
    id: 2,
    title: 'Не заполнено сообщение при задержке доступа',
    text: 'Если оплата пройдёт, но доступ не откроется автоматически, кандидат может остаться без понятного объяснения.',
    primary: 'Настроить сообщение',
    accent: 'gold' as const,
    why: 'Участник, который заплатил и не получил доступ, испытывает тревогу. Понятное сообщение снижает тревогу и снижает нагрузку на поддержку.',
  },
  {
    id: 3,
    title: 'Не настроено согласие на публикацию кейсов',
    text: 'Участники могут загружать работы, но правило публикации кейсов и результатов ещё не заполнено.',
    primary: 'Настроить согласия',
    accent: 'gold' as const,
    why: 'Без явного согласия публикация работ участников создаёт юридический риск. Лучше заранее спросить разрешение.',
  },
  {
    id: 4,
    title: 'Интеграция оплаты требует проверки',
    text: 'Webhook подключён, но последнее тестовое событие не прошло.',
    primary: 'Проверить интеграцию',
    accent: 'terracotta' as const,
    why: 'Если webhook не работает, оплата может пройти, а доступ не откроется. Это создаёт ручную работу и недовольство участников.',
  },
];

/* ===== DATA: TEAM ===== */
interface TeamMember {
  id: number;
  name: string;
  initials: string;
  role: string;
  access: string[];
  lastAction: string;
  active: boolean;
}

const teamMembers: TeamMember[] = [
  { id: 1, name: 'Анна Морозова', initials: 'А', role: 'куратор', access: ['Вступление', 'Запросы', 'Связи'], lastAction: 'сегодня · 11:42', active: true },
  { id: 2, name: 'Игорь Козлов', initials: 'И', role: 'администратор', access: ['Все разделы'], lastAction: 'вчера · 16:20', active: true },
  { id: 3, name: 'Вероника Лебедева', initials: 'В', role: 'модератор', access: ['Запросы', 'Вклад'], lastAction: '3 дня назад', active: true },
  { id: 4, name: 'Павел Семёнов', initials: 'П', role: 'финансы', access: ['Монетизация', 'Настройки'], lastAction: 'неделю назад', active: false },
];

const roleOptions = [
  { key: 'admin', label: 'Администратор' },
  { key: 'curator', label: 'Куратор' },
  { key: 'moderator', label: 'Модератор' },
  { key: 'finance', label: 'Финансы' },
  { key: 'support', label: 'Поддержка' },
  { key: 'observer', label: 'Наблюдатель' },
];

/* ===== DATA: PERMISSIONS MATRIX ===== */
const permissionSections = [
  {
    section: 'Вступление',
    rights: [
      { label: 'Смотреть заявки', admin: true, curator: true, moderator: false, finance: false, support: true, observer: false },
      { label: 'Отвечать на заявки', admin: true, curator: true, moderator: false, finance: false, support: false, observer: false },
      { label: 'Открывать доступ', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
      { label: 'Менять форму заявки', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
    ],
  },
  {
    section: 'Запросы',
    rights: [
      { label: 'Смотреть запросы', admin: true, curator: true, moderator: true, finance: false, support: true, observer: true },
      { label: 'Отвечать', admin: true, curator: true, moderator: true, finance: false, support: false, observer: false },
      { label: 'Назначать разборы', admin: true, curator: true, moderator: false, finance: false, support: false, observer: false },
      { label: 'Менять правила', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
    ],
  },
  {
    section: 'Связи',
    rights: [
      { label: 'Смотреть карту', admin: true, curator: true, moderator: false, finance: false, support: true, observer: true },
      { label: 'Предлагать связи', admin: true, curator: true, moderator: false, finance: false, support: false, observer: false },
      { label: 'Назначать опору', admin: true, curator: true, moderator: false, finance: false, support: false, observer: false },
      { label: 'Менять приватность', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
    ],
  },
  {
    section: 'Вклад',
    rights: [
      { label: 'Смотреть вклад', admin: true, curator: true, moderator: true, finance: false, support: true, observer: true },
      { label: 'Признавать вклад', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
      { label: 'Предлагать роли', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
      { label: 'Менять правила', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
    ],
  },
  {
    section: 'Монетизация',
    rights: [
      { label: 'Смотреть платежи', admin: true, curator: false, moderator: false, finance: true, support: true, observer: false },
      { label: 'Открывать доступ вручную', admin: true, curator: false, moderator: false, finance: true, support: false, observer: false },
      { label: 'Оформлять возвраты', admin: true, curator: false, moderator: false, finance: true, support: false, observer: false },
      { label: 'Менять цены', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
    ],
  },
  {
    section: 'Настройки',
    rights: [
      { label: 'Менять настройки', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
      { label: 'Менять права команды', admin: true, curator: false, moderator: false, finance: false, support: false, observer: false },
      { label: 'Смотреть журнал', admin: true, curator: false, moderator: false, finance: true, support: false, observer: true },
    ],
  },
];

/* ===== DATA: LOG ENTRIES ===== */
interface LogEntry {
  id: number;
  person: string;
  action: string;
  target: string;
  oldValue?: string;
  newValue?: string;
  time: string;
}

const logEntries: LogEntry[] = [
  { id: 1, person: 'Анна Морозова', action: 'изменила правила доступа', target: 'Монетизация', oldValue: 'доступ открывается вручную', newValue: 'доступ открывается автоматически', time: 'сегодня · 14:20' },
  { id: 2, person: 'Игорь Козлов', action: 'добавил в команду', target: 'Вероника Лебедева', newValue: 'роль: модератор', time: 'вчера · 10:15' },
  { id: 3, person: 'Игорь Козлов', action: 'изменил цену', target: 'Backend pet-проект', oldValue: '6 900 ₽', newValue: '7 900 ₽', time: '3 дня назад' },
  { id: 4, person: 'Анна Морозова', action: 'изменил приватность', target: 'Карта связей', newValue: 'скрыть приватные цели', time: '5 дней назад' },
  { id: 5, person: 'Система', action: 'автоматическое открытие', target: 'Мария Козлова', newValue: 'доступ открыт после оплаты', time: '6 дней назад' },
];

/* ===== DATA: INTEGRATIONS ===== */
const integrations = [
  { id: 'email', name: 'Email', status: 'connected', icon: Mail, desc: 'Уведомления, заявки, доступ' },
  { id: 'payments', name: 'ЮKassa', status: 'connected', icon: CreditCard, desc: 'Оплата входа, треков, потоков, сессий, разборов' },
  { id: 'storage', name: 'Хранилище файлов', status: 'connected', icon: HardDrive, desc: 'Работы, материалы, обложки, вложения' },
  { id: 'webhook', name: 'Webhook', status: 'error', icon: Webhook, desc: 'Внешние интеграции' },
];

/* ===== COMPONENT ===== */
export default function LeaderConsoleSettings() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionKey>('attention');
  const [showWhyId, setShowWhyId] = useState<number | null>(null);

  /* Community state */
  const [communityName, setCommunityName] = useState('IT Vkladka');
  const [communityDesc, setCommunityDesc] = useState('Сообщество для IT-специалистов, где участники помогают друг другу расти через разборы, сессии и живые связи.');
  const [visibility, setVisibility] = useState<'public' | 'link' | 'hidden'>('public');
  const [whoCanInvite, setWhoCanInvite] = useState<'leader' | 'team' | 'role' | 'all'>('team');
  const [inviteText, setInviteText] = useState('Привет! Приглашаю тебя в наше сообщество — здесь мы помогаем друг другу расти через разборы, сессии и живые связи.');

  /* Team state */
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showPermSection, setShowPermSection] = useState<string | null>(null);
  const [protectedActions, setProtectedActions] = useState({
    price: true, refund: true, manualAccess: true, adminRights: true, removeTeam: true, exportData: true,
  });

  /* Rules state */
  const [advisorSettings, setAdvisorSettings] = useState({
    show: true, hideCalm: true, allowDismiss: true, oneAtTime: true, noAuto: true,
  });
  const [signalCategories, setSignalCategories] = useState({
    entry: true, noAnswer: true, reviews: true, connections: true, contribution: true, monetization: true, overload: true,
  });
  const [notifyChannels, setNotifyChannels] = useState({ platform: true, email: true, telegram: false, webhook: false });
  const [rituals, setRituals] = useState({
    newcomer: true, helpDay: true, reviewDay: true, peerReview: true, insightDay: true, weeklyWin: true, demoDay: true, alumni: true, trustCircle: true,
  });

  /* Security state */
  const [privacy, setPrivacy] = useState({
    hideGoals: true, hideNoConn: true, hideRatings: true, hidePrivateReviews: true, hideClosedRequests: true, allowHideHelp: true, allowHideProfile: true,
  });
  const [consents, setConsents] = useState({
    publishWork: true, publishCase: true, usePromo: true, publicReview: true, notifications: true, sharePayment: true,
  });

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  /* Section nav cards */
  const sectionCards = [
    { key: 'attention' as SectionKey, label: 'Ваше внимание', subtitle: '2 настройки требуют проверки', icon: AlertTriangle },
    { key: 'community' as SectionKey, label: 'Сообщество', subtitle: 'Профиль и видимость', icon: Globe },
    { key: 'team' as SectionKey, label: 'Доступы и команда', subtitle: 'Роли и права', icon: Users },
    { key: 'rules' as SectionKey, label: 'Правила системы', subtitle: 'Сценарии, сигналы, уведомления', icon: Sliders },
    { key: 'security' as SectionKey, label: 'Безопасность и журнал', subtitle: 'Приватность, данные, история', icon: Shield },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0 space-y-6">

        {/* ===== HEADER BLOCK ===== */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 md:px-8 pt-8 pb-6">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Настройки</span>
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Настройки
            </h1>
            <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              Управляйте правилами сообщества: доступами команды, приватностью, уведомлениями, сценариями системы, интеграциями и журналом изменений.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Последнее изменение: сегодня · 14:20 · Анна Морозова</span>
            </div>
          </div>
        </div>

        {/* ===== NAVIGATION CARDS ===== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 section-fade-in" style={{ animationDelay: '50ms' }}>
          {sectionCards.map((sc) => {
            const Icon = sc.icon;
            const isActive = activeSection === sc.key;
            return (
              <button
                key={sc.key}
                onClick={() => setActiveSection(sc.key)}
                className={`text-left p-4 rounded-xl transition-all duration-200 border ${isActive ? 'ring-1' : 'hover:translate-y-[-2px]'}`}
                style={{
                  backgroundColor: isActive ? 'var(--bg-card)' : 'var(--hover-bg)',
                  borderColor: isActive ? 'var(--gold)' : 'var(--border-color)',
                  boxShadow: isActive ? 'var(--card-shadow)' : 'none',
                }}
              >
                <Icon className="w-4 h-4 mb-2" style={{ color: isActive ? 'var(--gold)' : 'var(--text-muted)' }} />
                <p className="text-xs font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>{sc.label}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{sc.subtitle}</p>
              </button>
            );
          })}
        </div>


        {/* ===== ATTENTION SECTION ===== */}
        {activeSection === 'attention' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Ваше внимание</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Настройки, где есть риск или незавершённое действие.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6">
              <div className="space-y-4">
                {attentionCards.map((card) => (
                  <div key={card.id}
                    className="premium-card rounded-xl p-5 md:p-6"
                    style={{
                      backgroundColor: card.accent === 'terracotta' ? TERRACOTTA_LIGHT : 'var(--hover-bg)',
                      border: card.accent === 'terracotta' ? `1px solid ${TERRACOTTA_BORDER}` : '1px solid var(--border-color)',
                      borderLeft: card.accent === 'terracotta' ? `3px solid ${TERRACOTTA}` : '1px solid var(--border-color)',
                      boxShadow: 'var(--card-shadow)',
                    }}>
                    <div className="flex items-start gap-3 mb-3">
                      {card.accent === 'terracotta' ? (
                        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: TERRACOTTA }} />
                      ) : (
                        <Zap className="w-5 h-5 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                      )}
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
                    </div>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{card.text}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => {
                          if (card.id === 1) { setActiveSection('team'); setSelectedMember(teamMembers[0]); }
                          if (card.id === 2) setActiveSection('rules');
                          if (card.id === 3) { setActiveSection('security'); }
                          if (card.id === 4) { setActiveSection('security'); }
                        }}
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                        style={card.accent === 'terracotta' ? { backgroundColor: TERRACOTTA, color: '#fff' } : { backgroundColor: 'var(--gold)', color: '#fff' }}>
                        {card.primary}
                      </button>
                      {card.why && (
                        <button onClick={() => setShowWhyId(showWhyId === card.id ? null : card.id)} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                          {showWhyId === card.id ? 'Скрыть' : 'Почему это важно?'}
                        </button>
                      )}
                    </div>
                    {card.why && showWhyId === card.id && (
                      <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.why}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== COMMUNITY SECTION ===== */}
        {activeSection === 'community' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Сообщество</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Профиль, внешний вид, видимость и приглашения.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-8">

              {/* Block 1: Basic info */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Globe className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Основное</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Название сообщества</p>
                    <input type="text" value={communityName} onChange={(e) => setCommunityName(e.target.value)} maxLength={120} className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                    <p className="text-[10px] mt-0.5 text-right" style={{ color: 'var(--text-muted)' }}>{communityName.length} / 120</p>
                  </div>
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Короткое описание</p>
                    <textarea value={communityDesc} onChange={(e) => setCommunityDesc(e.target.value)} maxLength={300} rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm resize-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content' }} />
                    <p className="text-[10px] mt-0.5 text-right" style={{ color: 'var(--text-muted)' }}>{communityDesc.length} / 300</p>
                  </div>
                  <div>
                    <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Тематика</p>
                    <div className="flex flex-wrap gap-2">
                      {['IT', 'Дизайн', 'Маркетинг', 'Предпринимательство', 'Образование'].map((t) => (
                        <button key={t} className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: t === 'IT' ? 'rgba(212,175,55,0.08)' : 'var(--hover-bg)', border: `1px solid ${t === 'IT' ? 'var(--gold)' : 'var(--border-color)'}`, color: t === 'IT' ? 'var(--gold)' : 'var(--text-muted)' }}>{t}</button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 2: Visual */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Визуальное оформление</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: GOLD_GLOW, color: 'var(--gold)' }}>IT</div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Обложка сообщества</p>
                      <button className="text-[11px] mt-0.5 transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Загрузить обложку</button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: 'var(--hover-bg)', border: '2px solid var(--gold)', color: 'var(--gold)' }}>IT</div>
                    <div>
                      <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>Логотип / аватар</p>
                      <button className="text-[11px] mt-0.5 transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Загрузить логотип</button>
                    </div>
                  </div>
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Цвет влияет только на оформление сообщества. Системные состояния и ошибки остаются едиными для всей платформы.</p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 3: Visibility */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Видимость</h3>
                </div>
                <div className="flex gap-3 mb-4">
                  {([['public', 'Публичное'], ['link', 'Только по ссылке'], ['hidden', 'Скрыто']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setVisibility(key)} className="text-xs px-3 py-1.5 rounded-full transition-all" style={{ backgroundColor: visibility === key ? 'rgba(212,175,55,0.08)' : 'transparent', color: visibility === key ? 'var(--gold)' : 'var(--text-muted)', border: `1px solid ${visibility === key ? 'var(--gold)' : 'var(--border-color)'}` }}>
                      {label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что видит человек до вступления</p>
                <div className="space-y-2">
                  {[
                    { key: 'name', label: 'Название' },
                    { key: 'cover', label: 'Обложку' },
                    { key: 'desc', label: 'Описание' },
                    { key: 'format', label: 'Формат сообщества' },
                    { key: 'entry', label: 'Условия входа' },
                    { key: 'members', label: 'Список участников' },
                    { key: 'materials', label: 'Внутренние материалы' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: ['members', 'materials'].includes(item.key) ? 'transparent' : 'var(--gold)', borderColor: ['members', 'materials'].includes(item.key) ? 'var(--border-color)' : 'var(--gold)' }}>
                        { !['members', 'materials'].includes(item.key) && <Check className="w-3 h-3" style={{ color: '#fff' }} /> }
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 4: Invitations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Приглашения</h3>
                </div>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Кто может приглашать новых людей:</p>
                <div className="flex gap-3 mb-4">
                  {([['leader', 'Только лидер'], ['team', 'Команда'], ['role', 'Участники с ролью'], ['all', 'Все участники']] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setWhoCanInvite(key)} className="text-[11px] px-2.5 py-1 rounded-full transition-all" style={{ backgroundColor: whoCanInvite === key ? 'rgba(212,175,55,0.08)' : 'transparent', color: whoCanInvite === key ? 'var(--gold)' : 'var(--text-muted)', border: `1px solid ${whoCanInvite === key ? 'var(--gold)' : 'var(--border-color)'}` }}>{label}</button>
                  ))}
                </div>
                <div>
                  <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Текст приглашения по умолчанию</p>
                  <textarea value={inviteText} onChange={(e) => setInviteText(e.target.value)} maxLength={500} rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm resize-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content' }} />
                  <p className="text-[10px] mt-0.5 text-right" style={{ color: 'var(--text-muted)' }}>{inviteText.length} / 500</p>
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 5: Public card preview */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Публичная карточка</h3>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-lg font-bold" style={{ backgroundColor: GOLD_GLOW, color: 'var(--gold)' }}>IT</div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{communityName}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>IT · Закрытое сообщество</p>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{communityDesc}</p>
                  <div className="flex gap-2">
                    <button className="text-[11px] px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Вступить</button>
                    <button className="text-[11px] px-3 py-1.5 rounded-lg" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Подробнее</button>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Предпросмотр карточки</button>
                  <button onClick={() => showToast('Изменения сохранены', 'success')} className="text-[11px] px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Сохранить</button>
                </div>
              </div>

            </div>
          </div>
        )}


        {/* ===== TEAM SECTION ===== */}
        {activeSection === 'team' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Доступы и команда</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Роли, права, приглашения и защита важных действий.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-8">

              {/* Block 1: Team list */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Команда</h3>
                  </div>
                  <button onClick={() => setShowInviteModal(true)} className="text-[11px] px-3 py-1.5 rounded-lg font-medium" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>+ Пригласить</button>
                </div>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member.id}
                      onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                      className="hover-border-gold transition-all duration-200 rounded-xl p-4 cursor-pointer"
                      style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', opacity: member.active ? 1 : 0.6 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: member.role === 'куратор' ? SAGE_LIGHT : member.role === 'администратор' ? GOLD_GLOW : 'var(--hover-bg)', border: `1px solid ${member.role === 'куратор' ? SAGE_BORDER : member.role === 'администратор' ? 'rgba(201,169,110,0.15)' : 'var(--border-color)'}`, color: member.role === 'куратор' ? SAGE : member.role === 'администратор' ? 'var(--gold)' : 'var(--text-muted)' }}>
                          {member.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: member.active ? SAGE_LIGHT : 'var(--hover-bg)', color: member.active ? SAGE : 'var(--text-muted)', border: `1px solid ${member.active ? SAGE_BORDER : 'var(--border-color)'}` }}>
                              {member.role}
                            </span>
                          </div>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Доступ: {member.access.join(', ')} · {member.lastAction}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)', transform: selectedMember?.id === member.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {selectedMember?.id === member.id && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Права по разделам</p>
                          <div className="space-y-1">
                            {member.access.map((a, i) => (
                              <div key={i} className="flex items-center gap-2 text-xs">
                                <Check className="w-3 h-3" style={{ color: SAGE }} />
                                <span style={{ color: 'var(--text-secondary)' }}>{a}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-3">
                            <button className="text-[11px] px-3 py-1.5 rounded-lg transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Изменить роль</button>
                            {!member.active && <button className="text-[11px] px-3 py-1.5 rounded-lg transition-colors hover:opacity-80" style={{ color: TERRACOTTA, border: `1px solid ${TERRACOTTA_BORDER}` }}>Удалить из команды</button>}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 2: Permissions matrix */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Права по разделам</h3>
                </div>
                <div className="space-y-4">
                  {permissionSections.map((sec) => (
                    <div key={sec.section}>
                      <button
                        onClick={() => setShowPermSection(showPermSection === sec.section ? null : sec.section)}
                        className="flex items-center justify-between w-full text-left py-2"
                      >
                        <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sec.section}</span>
                        <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)', transform: showPermSection === sec.section ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </button>
                      {showPermSection === sec.section && (
                        <div className="mt-2 space-y-2 pl-2">
                          {sec.rights.map((r, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs">
                              <span className="mt-0.5 w-24 shrink-0" style={{ color: 'var(--text-secondary)' }}>{r.label}</span>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.entries(r).filter(([k]) => k !== 'label').map(([role, has]) => (
                                  <span key={role} className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: has ? SAGE_LIGHT : 'var(--hover-bg)', color: has ? SAGE : 'var(--text-muted)', border: `1px solid ${has ? SAGE_BORDER : 'var(--border-color)'}` }}>
                                    {role === 'admin' ? 'Адм' : role === 'curator' ? 'Кур' : role === 'moderator' ? 'Мод' : role === 'finance' ? 'Фин' : role === 'support' ? 'Под' : 'Наб'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 3: Protected actions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Защита важных действий</h3>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Для важных действий требуется подтверждение владельца:</p>
                <div className="space-y-2.5">
                  {[
                    { key: 'price', label: 'Изменение платных условий' },
                    { key: 'refund', label: 'Оформление возврата' },
                    { key: 'manualAccess', label: 'Ручное открытие доступа' },
                    { key: 'adminRights', label: 'Изменение прав администратора' },
                    { key: 'removeTeam', label: 'Удаление участника из команды' },
                    { key: 'exportData', label: 'Экспорт данных' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: protectedActions[item.key as keyof typeof protectedActions] ? 'var(--gold)' : 'transparent', borderColor: protectedActions[item.key as keyof typeof protectedActions] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setProtectedActions(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof protectedActions] }))}>
                        {protectedActions[item.key as keyof typeof protectedActions] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ===== RULES SECTION ===== */}
        {activeSection === 'rules' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Правила системы</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Сценарии, сигналы, уведомления, ритуалы и локальные настройки.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-8">

              {/* Block 1: Advisor */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Советник</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'show', label: 'Показывать Советника в рабочих разделах' },
                    { key: 'hideCalm', label: 'Не показывать Советника в спокойных разделах «Что получается»' },
                    { key: 'allowDismiss', label: 'Разрешить скрыть Советника до перезагрузки страницы' },
                    { key: 'oneAtTime', label: 'Показывать не больше одной рекомендации на экран' },
                    { key: 'noAuto', label: 'Не отправлять действия автоматически без подтверждения лидера' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: advisorSettings[item.key as keyof typeof advisorSettings] ? 'var(--gold)' : 'transparent', borderColor: advisorSettings[item.key as keyof typeof advisorSettings] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setAdvisorSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof advisorSettings] }))}>
                        {advisorSettings[item.key as keyof typeof advisorSettings] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Советник предлагает следующий шаг, но не действует вместо лидера.</p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 2: Signals */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Сигналы</h3>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Категории сигналов:</p>
                <div className="space-y-2.5">
                  {[
                    { key: 'entry', label: 'Вступление и новички' },
                    { key: 'noAnswer', label: 'Запросы без ответа' },
                    { key: 'reviews', label: 'Разборы и работы' },
                    { key: 'connections', label: 'Связи и опора' },
                    { key: 'contribution', label: 'Вклад и признание' },
                    { key: 'monetization', label: 'Монетизация и доступ' },
                    { key: 'overload', label: 'Перегрузка команды или помощников' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: signalCategories[item.key as keyof typeof signalCategories] ? 'var(--gold)' : 'transparent', borderColor: signalCategories[item.key as keyof typeof signalCategories] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setSignalCategories(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof signalCategories] }))}>
                        {signalCategories[item.key as keyof typeof signalCategories] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <div className="rounded-lg p-3 mt-3" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>В «Вашем внимании» показывается только то, где нужно действие. Не более 3 сигналов одновременно. Позитивные состояния — в «Что получается».</p>
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 3: Notifications */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Bell className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Уведомления</h3>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Каналы:</p>
                <div className="space-y-2.5 mb-4">
                  {[
                    { key: 'platform', label: 'Внутри платформы' },
                    { key: 'email', label: 'Email' },
                    { key: 'telegram', label: 'Telegram' },
                    { key: 'webhook', label: 'Webhook' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: notifyChannels[item.key as keyof typeof notifyChannels] ? 'var(--gold)' : 'transparent', borderColor: notifyChannels[item.key as keyof typeof notifyChannels] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setNotifyChannels(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notifyChannels] }))}>
                        {notifyChannels[item.key as keyof typeof notifyChannels] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Частота:</p>
                <div className="flex flex-wrap gap-2">
                  {['Сразу', 'Дайджест раз в день', 'Дайджест раз в неделю', 'Только критические'].map((f, i) => (
                    <button key={f} className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: i === 0 ? 'rgba(212,175,55,0.08)' : 'var(--hover-bg)', border: `1px solid ${i === 0 ? 'var(--gold)' : 'var(--border-color)'}`, color: i === 0 ? 'var(--gold)' : 'var(--text-muted)' }}>{f}</button>
                  ))}
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Уведомления должны помогать, а не создавать усталость.</p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 4: Rituals */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Ритуалы</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'newcomer', label: 'Встреча для новичков' },
                    { key: 'helpDay', label: 'Помощь-день' },
                    { key: 'reviewDay', label: 'День разборов' },
                    { key: 'peerReview', label: 'Peer Review Day' },
                    { key: 'insightDay', label: 'День инсайтов' },
                    { key: 'weeklyWin', label: 'Победы недели' },
                    { key: 'demoDay', label: 'Demo Day' },
                    { key: 'alumni', label: 'Alumni-сценарий' },
                    { key: 'trustCircle', label: 'Trust Circle' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: rituals[item.key as keyof typeof rituals] ? 'var(--gold)' : 'transparent', borderColor: rituals[item.key as keyof typeof rituals] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setRituals(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof rituals] }))}>
                        {rituals[item.key as keyof typeof rituals] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 5: Quick links */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Локальные настройки разделов</h3>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Не дублируем настройки, даём быстрые переходы:</p>
                <div className="space-y-2">
                  {[
                    { label: 'Вступление', desc: 'Форма заявки · Первые 7 дней · Оплата и открытие доступа' },
                    { label: 'Запросы', desc: 'Правила запросов · Шаблоны ответов · Лимиты разборов' },
                    { label: 'Связи', desc: 'Что считается связью · Приватность карты · Лимиты помощников' },
                    { label: 'Вклад', desc: 'Что считается вкладом · Признание · Роли · Бейджи' },
                    { label: 'Монетизация', desc: 'Платёжный провайдер · Возвраты · Платный вход · Доступ после оплаты' },
                  ].map((link) => (
                    <div key={link.label} className="flex items-center justify-between py-2">
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{link.label}</p>
                        <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{link.desc}</p>
                      </div>
                      <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Открыть</button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}


        {/* ===== SECURITY SECTION ===== */}
        {activeSection === 'security' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Безопасность и журнал</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Приватность, согласия, данные, интеграции, тариф и история изменений.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-8">

              {/* Block 1: Privacy */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Lock className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Приватность участников</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'hideGoals', label: 'Не показывать участникам чужие приватные цели' },
                    { key: 'hideNoConn', label: 'Не показывать, что кто-то «без связей»' },
                    { key: 'hideRatings', label: 'Не показывать публичные рейтинги участников' },
                    { key: 'hidePrivateReviews', label: 'Скрывать приватные разборы' },
                    { key: 'hideClosedRequests', label: 'Скрывать закрытые запросы' },
                    { key: 'allowHideHelp', label: 'Разрешить участнику скрыть готовность помогать' },
                    { key: 'allowHideProfile', label: 'Разрешить участнику скрыть часть профиля' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: privacy[item.key as keyof typeof privacy] ? 'var(--gold)' : 'transparent', borderColor: privacy[item.key as keyof typeof privacy] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof privacy] }))}>
                        {privacy[item.key as keyof typeof privacy] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Приватность нужна, чтобы карта связей и Вклад не превращались в наблюдение или соревнование.</p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 2: Consents */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Согласия</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'publishWork', label: 'Публикация работы в сообществе' },
                    { key: 'publishCase', label: 'Публикация кейса' },
                    { key: 'usePromo', label: 'Использование результата в промо сообщества' },
                    { key: 'publicReview', label: 'Участие в публичном разборе' },
                    { key: 'notifications', label: 'Получение уведомлений' },
                    { key: 'sharePayment', label: 'Передача данных платёжному провайдеру' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: consents[item.key as keyof typeof consents] ? 'var(--gold)' : 'transparent', borderColor: consents[item.key as keyof typeof consents] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setConsents(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof consents] }))}>
                        {consents[item.key as keyof typeof consents] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <button className="text-[11px] mt-3 transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Настроить тексты согласий</button>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 3: Integrations */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Webhook className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Интеграции</h3>
                </div>
                <div className="space-y-3">
                  {integrations.map((int) => {
                    const Icon = int.icon;
                    return (
                      <div key={int.id} className="flex items-start gap-3 p-3 rounded-xl" style={{ backgroundColor: int.status === 'error' ? TERRACOTTA_LIGHT : 'var(--hover-bg)', border: `1px solid ${int.status === 'error' ? TERRACOTTA_BORDER : 'var(--border-color)'}` }}>
                        <Icon className="w-5 h-5 shrink-0 mt-0.5" style={{ color: int.status === 'error' ? TERRACOTTA : int.status === 'connected' ? SAGE : 'var(--gold)' }} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{int.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: int.status === 'connected' ? SAGE_LIGHT : int.status === 'error' ? TERRACOTTA_LIGHT : GOLD_GLOW, color: int.status === 'connected' ? SAGE : int.status === 'error' ? TERRACOTTA : 'var(--gold)', border: `1px solid ${int.status === 'connected' ? SAGE_BORDER : int.status === 'error' ? TERRACOTTA_BORDER : 'rgba(201,169,110,0.2)'}` }}>
                              {int.status === 'connected' ? 'подключено' : int.status === 'error' ? 'требует проверки' : 'не настроено'}
                            </span>
                          </div>
                          <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{int.desc}</p>
                        </div>
                        <button className="text-[11px] shrink-0 transition-colors hover:opacity-80" style={{ color: int.status === 'error' ? TERRACOTTA : 'var(--gold)' }}>
                          {int.status === 'error' ? 'Проверить' : 'Настроить'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 4: Platform tariff */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Тариф платформы</h3>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
                  <p className="text-sm font-bold mb-1" style={{ color: 'var(--gold)' }}>Ментори+</p>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Статус: активен · Следующее списание: 15 июля</p>
                  <div className="space-y-1">
                    {['Расширенные настройки сообщества', 'Больше сценариев', 'Больше ролей команды', 'Расширенная аналитика', 'Больше лимитов'].map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <Check className="w-3 h-3" style={{ color: 'var(--gold)' }} />
                        <span style={{ color: 'var(--text-secondary)' }}>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Тариф платформы — это оплата лидера за Mentori Club. Это не платные продукты, которые лидер продаёт участникам.</p>
                <div className="flex gap-2 mt-2">
                  <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Изменить тариф</button>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>История оплат</button>
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 5: Change log */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Журнал изменений</h3>
                </div>
                <div className="space-y-3">
                  {logEntries.map((entry) => (
                    <div key={entry.id} className="rounded-xl p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-start gap-2 mb-2">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{entry.person}</span>
                        <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{entry.time}</span>
                      </div>
                      <p className="text-xs mb-1" style={{ color: 'var(--text-secondary)' }}>{entry.action} · <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{entry.target}</span></p>
                      {entry.oldValue && entry.newValue && (
                        <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Было: {entry.oldValue}</p>
                          <p className="text-[10px]" style={{ color: SAGE }}>Стало: {entry.newValue}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* ===== RIGHT COLUMN ===== */}
      <aside className="w-full lg:w-[240px] shrink-0 space-y-5 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar">

        {/* Attention: hide advisor */}
        {activeSection === 'attention' && null}

        {/* Community: advisor */}
        {activeSection === 'community' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Описание сообщества слишком общее</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Кандидат может не понять, для кого это сообщество и какой результат он может получить.</p>
                <button onClick={() => {}} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Открыть описание</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Публичная карточка</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Как кандидат видит сообщество</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Приглашения</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Кто может приглашать</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Team: advisor */}
        {activeSection === 'team' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Проверьте права куратора</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>У роли куратора есть доступ к настройкам оплаты. Обычно такие права лучше оставить владельцу.</p>
                <button onClick={() => setShowPermSection('Монетизация')} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: TERRACOTTA }}>Показать права</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Роли команды</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Владелец, админ, куратор, модератор</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>История команды</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Кто менял права и роли</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Rules: advisor */}
        {activeSection === 'rules' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Сигналов может быть слишком много</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Если включить все сигналы без приоритета, лидер будет видеть шум вместо важных действий.</p>
                <button onClick={() => {}} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Настроить приоритеты</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Советник</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Как система предлагает действия</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Локальные настройки</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Вступление, Запросы, Связи, Вклад</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Security: advisor */}
        {activeSection === 'security' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Не настроено согласие на публикацию кейсов</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Если участник загружает работу, лучше заранее указать, можно ли показывать её в сообществе.</p>
                <button onClick={() => {}} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: TERRACOTTA }}>Настроить согласие</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Журнал изменений</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Кто менял настройки</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Приватность участников</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Что видит лидер, команда, участники</p>
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ===== MODAL: Invite to team ===== */}
      {showInviteModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowInviteModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowInviteModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
            <div className="shrink-0 px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold mb-1 heading-accent pr-8" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Пригласить в команду</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Новый участник получит приглашение с выбранной ролью и правами.</p>
            </div>
            <div className="shrink-0 px-6 md:px-8" style={{ borderBottom: '1px solid var(--border-color)' }} />
            <div className="flex-1 overflow-y-auto modal-scroll px-6 md:px-8 py-4">
              <div className="mb-4">
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Email</p>
                <input type="email" placeholder="name@example.com" className="w-full px-4 py-2.5 rounded-xl text-sm" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
              </div>
              <div className="mb-4">
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Роль</p>
                <div className="flex flex-wrap gap-2">
                  {roleOptions.map((r) => (
                    <button key={r.key} className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>{r.label}</button>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Комментарий к приглашению</p>
                <textarea placeholder="Привет! Приглашаю тебя в команду сообщества..." maxLength={300} rows={3} className="w-full px-4 py-2.5 rounded-xl text-sm resize-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content' }} />
              </div>
            </div>
            <div className="shrink-0 px-6 md:px-8 py-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => { showToast('Приглашение отправлено.', 'success'); setShowInviteModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                Отправить приглашение
              </button>
              <button onClick={() => setShowInviteModal(false)} className="px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                Вернуться к команде
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

