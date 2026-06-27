import { useState } from 'react';
import {
  ChevronRight, X, AlertTriangle, Zap,
  Star, Users, Award, BarChart3, Settings,
  Check, ArrowRight, Info,
  Shield, Eye
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

const GradientDivider = () => (
  <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
);

/* ===== SECTION TYPE ===== */
type SectionKey = 'attention' | 'members' | 'recognition' | 'insights' | 'settings';

/* ===== DATA: ATTENTION CARDS ===== */
const attentionCards = [
  {
    id: 1,
    title: '2 полезных действия ждут подтверждения',
    text: 'Участники отметили, что получили помощь, но действие ещё не подтверждено системой или получателем.',
    primary: 'Проверить вклад',
    accent: 'terracotta' as const,
    why: 'Вклад появляется только от подтверждённых действий. Неподтверждённые действия лучше проверить до признания или роста уровня.',
  },
  {
    id: 2,
    title: 'Вероника готова к роли куратора разборов',
    text: 'Она регулярно даёт сильную обратную связь, её ответы сохраняют участники, а нагрузка пока комфортная.',
    primary: 'Посмотреть кандидата',
    accent: 'gold' as const,
    why: 'Роль — это ответственность, а не награда. Когда человек уже стабильно помогает, роль помогает формализовать это как заботу о сообществе.',
  },
  {
    id: 3,
    title: 'Есть кандидат на Признание недели',
    text: 'Игорь помог трём участникам с backend-вопросами и превратил один ответ в полезный инсайт.',
    primary: 'Подготовить признание',
    accent: 'gold' as const,
    why: 'Признание недели — спокойная альтернатива лидерборду. Замечает полезное действие без сравнения с другими.',
  },
  {
    id: 4,
    title: 'Анна помогает слишком часто',
    text: 'Анна уже поддерживает двух новичков и взяла ещё один разбор. Лучше не предлагать ей новую роль прямо сейчас.',
    primary: 'Посмотреть нагрузку',
    accent: 'terracotta' as const,
    why: 'Роль лучше предложить до перегруза. Когда человек уже перегружен, новая ответственность может вызвать выгорание.',
  },
];

/* ===== DATA: MEMBER FILTERS ===== */
const memberFilters = [
  { key: 'all', label: 'Все', count: 12 },
  { key: 'help', label: 'Помогают другим', count: 5 },
  { key: 'review', label: 'Дают разборы', count: 4 },
  { key: 'insight', label: 'Создают инсайты', count: 3 },
  { key: 'role', label: 'Готовы к роли', count: 2 },
  { key: 'check', label: 'Нужна проверка', count: 2 },
] as const;
type MemberFilterKey = typeof memberFilters[number]['key'];

/* ===== DATA: MEMBERS ===== */
interface MemberData {
  id: number;
  name: string;
  initials: string;
  level: string;
  badge: string;
  period: string;
  stats: { label: string; value: number }[];
  description: string;
  contributions: string[];
  notCounted: string[];
  trend: string;
  nextStep: string;
}

const membersData: MemberData[] = [
  {
    id: 1,
    name: 'Вероника Л.',
    initials: 'В',
    level: 'вклад хорошо заметен',
    badge: 'Искра',
    period: '30 дней',
    stats: [
      { label: 'разборов', value: 6 },
      { label: 'ответов', value: 3 },
      { label: 'инсайтов', value: 2 },
    ],
    description: 'Вероника качественно разбирает работы и помогает участникам доводить проекты до результата.',
    contributions: [
      '6 разборов работ',
      '3 ответа на запросы',
      '2 ответа сохранены как инсайты',
      '1 новичок получил от неё первую опору',
    ],
    notCounted: [
      'лайки под ответами',
      'просмотры комментариев',
      'присутствие на встречах без действия',
    ],
    trend: 'За последние 30 дней вклад вырос: Вероника стала чаще помогать не только в комментариях, но и в разборах работ.',
    nextStep: 'Веронике может подойти роль куратора разборов. Роль нужно предложить явно и дождаться согласия.',
  },
  {
    id: 2,
    name: 'Игорь К.',
    initials: 'И',
    level: 'вклад заметен',
    badge: 'Искра',
    period: '7 дней',
    stats: [
      { label: 'ответов', value: 3 },
      { label: 'инсайтов', value: 1 },
      { label: 'помог', value: 3 },
    ],
    description: 'Игорь помогает участникам с backend-вопросами и объясняет не только "как сделать", но и "почему лучше так".',
    contributions: [
      '3 полезных ответа за неделю',
      '2 участника отметили, что ответ помог',
      '1 ответ подходит для базы инсайтов',
    ],
    notCounted: [
      'лайки',
      'просмотры',
      'короткие комментарии без разбора',
    ],
    trend: 'Вклад стабильный: Игорь регулярно отвечает на backend-запросы и помогает новичкам с архитектурой.',
    nextStep: 'Кандидат на Признание недели. Можно подготовить публичное признание.',
  },
  {
    id: 3,
    name: 'Анна М.',
    initials: 'А',
    level: 'вклад хорошо заметен',
    badge: 'Пламя',
    period: '30 дней',
    stats: [
      { label: 'разборов', value: 8 },
      { label: 'помощи', value: 5 },
      { label: 'новичков', value: 2 },
    ],
    description: 'Анна активно помогает новичкам и даёт разборы. Нагрузка высокая — важно следить, чтобы не перегрузить.',
    contributions: [
      '8 разборов работ',
      '5 ответов с подтверждённой помощью',
      '2 новичка получили первую опору',
    ],
    notCounted: [
      'лайки',
      'просмотры',
      'присутствие на встречах',
    ],
    trend: 'Вклад растёт, но нагрузка растёт быстрее. Анна берёт на себя много — важно предложить ротацию.',
    nextStep: 'Роль лучше отложить. Сначала проверить нагрузку и предложить помощь.',
  },
  {
    id: 4,
    name: 'Дмитрий К.',
    initials: 'Д',
    level: 'вклад появляется',
    badge: 'Свет',
    period: '14 дней',
    stats: [
      { label: 'ответов', value: 2 },
      { label: 'разборов', value: 1 },
      { label: 'инсайтов', value: 0 },
    ],
    description: 'Дмитрий даёт точные ответы по frontend и помогает с Docker. Готов взять участника на старт.',
    contributions: [
      '2 ответа на запросы',
      '1 разбор работы',
    ],
    notCounted: [
      'лайки',
      'просмотры',
    ],
    trend: 'Вклад начинает появляться. Дмитрий отвечает точно и по делу.',
    nextStep: 'Можно предложить роль участника рядом, когда появится стабильность.',
  },
];

/* ===== DATA: RECOGNITION CANDIDATES ===== */
interface RecognitionCandidate {
  id: number;
  name: string;
  type: 'weekly' | 'strong_review' | 'helped_newcomer' | 'insight' | 'bridge';
  status: 'candidate' | 'draft' | 'published' | 'hidden';
  reason: string[];
  draftText: string;
}

const recognitionCandidates: RecognitionCandidate[] = [
  {
    id: 1,
    name: 'Игорь К.',
    type: 'weekly',
    status: 'candidate',
    reason: [
      '3 полезных ответа за неделю',
      '2 участника отметили, что ответ помог',
      '1 ответ подходит для базы инсайтов',
      'вклад был повторным, не разовым',
    ],
    draftText: 'Игорь, спасибо за помощь участникам с backend-вопросами. На этой неделе ваши ответы помогли сразу нескольким людям разобраться с API, webhook и структурой проекта.\n\nОсобенно ценно, что вы объясняли не только "как сделать", но и почему лучше выбрать такой подход.',
  },
  {
    id: 2,
    name: 'Анна М.',
    type: 'helped_newcomer',
    status: 'candidate',
    reason: [
      '2 новичка получили от неё первую опору',
      'ответы были подробными и с понятным следующим шагом',
      'оба новичка продолжили активность после помощи',
    ],
    draftText: 'Анна, спасибо, что стали первой опорой для новичков. Ваши ответы помогли им не потеряться на старте и сделать первый шаг увереннее.',
  },
];

/* ===== DATA: ROLE CANDIDATES ===== */
interface RoleCandidate {
  id: number;
  name: string;
  role: string;
  status: 'candidate' | 'offered' | 'accepted' | 'declined' | 'paused';
  reason: string[];
  expectations: string[];
  permissions: { label: string; has: boolean }[];
}

const roleCandidates: RoleCandidate[] = [
  {
    id: 1,
    name: 'Вероника Л.',
    role: 'куратор разборов',
    status: 'candidate',
    reason: [
      '6 качественных разборов за месяц',
      '3 работы сейчас в процессе',
      'участники сохраняют её ответы',
      'хорошо понимает тему продуктового дискавери',
      'нагрузка пока комфортная',
    ],
    expectations: [
      'смотреть работы участников',
      'давать обратную связь по правилам сообщества',
      'соблюдать лимиты нагрузки',
      'помогать сохранять сильные ответы как инсайты',
    ],
    permissions: [
      { label: 'Бейдж роли в профиле', has: true },
      { label: 'Брать разборы из очереди', has: true },
      { label: 'Доступ к заметкам по разбору', has: true },
      { label: 'Лимит: до 3 активных разборов', has: true },
      { label: 'Возможность поставить роль на паузу', has: true },
    ],
  },
];

/* ===== DATA: RECOGNITION FILTERS ===== */
const recFilters = [
  { key: 'all', label: 'Все', count: 3 },
  { key: 'recognition', label: 'Кандидаты на признание', count: 2 },
  { key: 'role', label: 'Кандидаты на роль', count: 1 },
  { key: 'offered', label: 'Предложения отправлены', count: 0 },
  { key: 'published', label: 'Признание опубликовано', count: 0 },
  { key: 'history', label: 'История', count: 0 },
] as const;
type RecFilterKey = typeof recFilters[number]['key'];

/* ===== DATA: INSIGHTS ===== */
const insightsMetrics = [
  { label: 'участников сделали полезный вклад', value: '38', period: 'за последние 30 дней' },
  { label: 'помощи идёт от участников к участникам', value: '41%', period: '' },
  { label: 'разборов дали участники', value: '14', period: 'peer-разборы и обратная связь' },
  { label: 'инсайтов появилось из ответов и разборов', value: '9', period: 'можно сохранить в базу знаний' },
  { label: 'участников получили признание', value: '5', period: 'без лидерборда и мест' },
  { label: 'роли предложены', value: '3', period: 'ожидают согласия' },
];

const goodSignals = [
  { text: 'Участники чаще отвечают друг другу', sub: 'Самоорганизация растёт' },
  { text: 'Разборы стали распределяться не только на лидера', sub: 'Peer-разборы активны' },
  { text: 'Появились участники, которые стабильно помогают новичкам', sub: '8 активных помощников' },
  { text: 'Ответы превращаются в инсайты', sub: '9 инсайтов за месяц' },
  { text: 'Признание стало регулярным, а не случайным', sub: '5 признаний за 30 дней' },
];

const improveAreas = [
  { text: 'Часть помощи всё ещё держится на нескольких людях', sub: '3 участника дают 60% разборов' },
  { text: 'Не все полезные действия превращаются в признание', sub: 'Только 15% отмечены' },
  { text: 'Некоторые сильные ответы не сохраняются как инсайты', sub: '34% сильных ответов не сохранены' },
  { text: 'Роли лучше предлагать до перегруза, а не после', sub: '2 кандидата уже перегружены' },
];

/* ===== COMPONENT ===== */
export default function LeaderConsoleContribution() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionKey>('attention');
  const [showWhyId, setShowWhyId] = useState<number | null>(null);

  /* Members section state */
  const [memberFilter, setMemberFilter] = useState<MemberFilterKey>('all');
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);

  /* Recognition section state */
  const [recFilter, setRecFilter] = useState<RecFilterKey>('all');
  const [selectedRec, setSelectedRec] = useState<RecognitionCandidate | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleCandidate | null>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [pubText, setPubText] = useState('');
  const [pubWhere, setPubWhere] = useState({ feed: true, book: true, private: false });
  const [roleText, setRoleText] = useState('');

  /* Settings state */
  const [contribSources, setContribSources] = useState({
    answer: true, help: true, review: true, expert: true,
    insight: true, meeting: true, connect: true, thank: true,
  });
  const [notContrib, setNotContrib] = useState({
    likes: true, views: true, posts: true, presence: true, self: true,
  });
  const [levelSettings, setLevelSettings] = useState({
    showProfile: true, showName: true, noPlace: true, noRating: true, explain: true,
  });
  const [badgeSettings, setBadgeSettings] = useState({
    profile: true, card: true, comments: true, answers: true, reviews: true, catalog: false,
  });
  const [recogSettings, setRecogSettings] = useState({
    weekly: true, showReason: true, noPlace: true, allowPrivate: true, saveHistory: true,
  });
  const [roleSettings, setRoleSettings] = useState({
    needConsent: true, showWhy: true, showLimits: true, canDecline: true, canPause: true, saveHistory: true,
  });

  /* Section nav cards */
  const sectionCards = [
    { key: 'attention' as SectionKey, label: 'Ваше внимание', subtitle: '4 ситуации требуют решения', icon: AlertTriangle },
    { key: 'members' as SectionKey, label: 'Вклад участников', subtitle: 'Кто помогает и как', icon: Users },
    { key: 'recognition' as SectionKey, label: 'Признание и роли', subtitle: 'Кого заметить и кому предложить роль', icon: Award },
    { key: 'insights' as SectionKey, label: 'Что получается', subtitle: 'Динамика вклада и признания', icon: BarChart3 },
    { key: 'settings' as SectionKey, label: 'Настройки', subtitle: 'Правила, уровни и видимость', icon: Settings },
  ];

  /* Filtered members */
  const filteredMembers = memberFilter === 'all'
    ? membersData
    : membersData.filter(m => {
        if (memberFilter === 'help') return m.stats.some(s => s.label === 'ответов' || s.label === 'помощи');
        if (memberFilter === 'review') return m.stats.some(s => s.label === 'разборов');
        if (memberFilter === 'insight') return m.stats.some(s => s.label === 'инсайтов');
        if (memberFilter === 'role') return m.nextStep.includes('роль');
        if (memberFilter === 'check') return m.name === 'Анна М.';
        return true;
      });

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0 space-y-6">

        {/* ===== HEADER BLOCK ===== */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 md:px-8 pt-8 pb-6">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Вклад</span>
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Вклад
            </h1>
            <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              Здесь видно, кто помогает сообществу расти: отвечает, разбирает работы, поддерживает новичков, создаёт инсайты и берёт на себя полезные роли.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Обновлено 6 минут назад</span>
              <span>·</span>
              <button className="text-[11px] font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Обновить</button>
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
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Ситуации, где сейчас нужно действие.</p>
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
                          if (card.id === 1) setActiveSection('members');
                          if (card.id === 2) { setActiveSection('recognition'); setSelectedRole(roleCandidates[0]); }
                          if (card.id === 3) setActiveSection('recognition');
                          if (card.id === 4) setActiveSection('members');
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

        {/* ===== MEMBERS SECTION ===== */}
        {activeSection === 'members' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Вклад участников</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Живая картина полезных действий: помощь, ответы, разборы, инсайты, поддержка новичков.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6">

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-5">
                {memberFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setMemberFilter(f.key)}
                    className="pill-link"
                    style={{
                      borderColor: memberFilter === f.key ? 'var(--gold)' : 'var(--border-color)',
                      color: memberFilter === f.key ? 'var(--gold)' : 'var(--text-muted)',
                      backgroundColor: memberFilter === f.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                    }}
                  >
                    <span>{f.label}</span>
                    <span className="text-[10px]" style={{ color: memberFilter === f.key ? 'var(--gold)' : 'var(--text-muted)' }}>{f.count}</span>
                  </button>
                ))}
              </div>

              {/* Members list */}
              {filteredMembers.length === 0 ? (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас нет участников в этом срезе</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Когда появятся участники с вкладом, они отобразятся здесь.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      onClick={() => setSelectedMember(selectedMember?.id === member.id ? null : member)}
                      className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                      style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                    >
                      {/* Preview */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0" style={{ backgroundColor: GOLD_GLOW, border: '1px solid rgba(201,169,110,0.15)', color: 'var(--gold)' }}>
                          {member.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{member.name}</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: GOLD_GLOW, color: 'var(--gold)', border: '1px solid rgba(201,169,110,0.2)' }}>
                              {member.badge}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{member.period}</span>
                          </div>
                          <p className="text-[11px] mb-1.5" style={{ color: member.level.includes('появляется') ? 'var(--text-muted)' : 'var(--gold)' }}>{member.level}</p>
                          <div className="flex gap-3 mb-2">
                            {member.stats.map((s, i) => (
                              <span key={i} className="text-[11px]">
                                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.value}</span>
                                <span style={{ color: 'var(--text-muted)' }}> {s.label}</span>
                              </span>
                            ))}
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{member.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--text-muted)', transform: selectedMember?.id === member.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {/* Expanded detail */}
                      {selectedMember?.id === member.id && (
                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                          {/* Contributions */}
                          <div className="mb-4">
                            <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что засчитано во Вклад</p>
                            <ul className="space-y-1">
                              {member.contributions.map((c, i) => (
                                <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                                  <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color: SAGE }} />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Not counted */}
                          <div className="mb-4">
                            <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что не засчитывается</p>
                            <ul className="space-y-1">
                              {member.notCounted.map((c, i) => (
                                <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-muted)' }}>
                                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--text-muted)' }} />
                                  {c}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Trend */}
                          <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                            <p className="text-[11px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Динамика</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{member.trend}</p>
                          </div>

                          {/* Next step */}
                          <div className="mb-4">
                            <p className="text-[11px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что дальше</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{member.nextStep}</p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {member.nextStep.includes('роль') && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedRole(roleCandidates.find(r => member.name.includes(r.name.split(' ')[0])) || null);
                                  setActiveSection('recognition');
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                                style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                              >
                                Предложить роль
                              </button>
                            )}
                            <button onClick={(e) => e.stopPropagation()} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                              Подготовить признание
                            </button>
                            <button onClick={(e) => e.stopPropagation()} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                              Посмотреть историю
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== RECOGNITION SECTION ===== */}
        {activeSection === 'recognition' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Признание и роли</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Кандидаты на признание, предложения ролей и история решений.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6">

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-5">
                {recFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRecFilter(f.key)}
                    className="pill-link"
                    style={{
                      borderColor: recFilter === f.key ? 'var(--gold)' : 'var(--border-color)',
                      color: recFilter === f.key ? 'var(--gold)' : 'var(--text-muted)',
                      backgroundColor: recFilter === f.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                    }}
                  >
                    <span>{f.label}</span>
                    <span className="text-[10px]" style={{ color: recFilter === f.key ? 'var(--gold)' : 'var(--text-muted)' }}>{f.count}</span>
                  </button>
                ))}
              </div>

              {/* Recognition candidates */}
              {recFilter === 'all' || recFilter === 'recognition' ? (
                <div className="mb-6">
                  <p className="text-[11px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Кандидаты на признание</p>
                  <div className="space-y-3">
                    {recognitionCandidates.map((rec) => (
                      <div
                        key={rec.id}
                        onClick={() => setSelectedRec(selectedRec?.id === rec.id ? null : rec)}
                        className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                        style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0" style={{ backgroundColor: GOLD_GLOW, border: '1px solid rgba(201,169,110,0.15)', color: 'var(--gold)' }}>
                            {rec.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{rec.name}</h3>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: GOLD_GLOW, color: 'var(--gold)', border: '1px solid rgba(201,169,110,0.2)' }}>
                                {rec.type === 'weekly' ? 'Признание недели' : rec.type === 'strong_review' ? 'Сильный разбор' : rec.type === 'helped_newcomer' ? 'Помощь новичку' : rec.type === 'insight' ? 'Инсайт' : 'Мост'}
                              </span>
                            </div>
                            <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{rec.draftText.split('\n')[0]}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--text-muted)', transform: selectedRec?.id === rec.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>

                        {selectedRec?.id === rec.id && (
                          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <div className="mb-4">
                              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Почему система предлагает признание</p>
                              <ul className="space-y-1">
                                {rec.reason.map((r, i) => (
                                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="mb-4">
                              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Черновик признания</p>
                              <p className="text-xs leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-secondary)' }}>{rec.draftText}</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={(e) => { e.stopPropagation(); setPubText(rec.draftText); setShowPublishModal(true); }}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                                style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                              >
                                Опубликовать признание
                              </button>
                              <button onClick={(e) => e.stopPropagation()} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                                Скрыть рекомендацию
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* Role candidates */}
              {recFilter === 'all' || recFilter === 'role' ? (
                <div>
                  <p className="text-[11px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Кандидаты на роль</p>
                  <div className="space-y-3">
                    {roleCandidates.map((role) => (
                      <div
                        key={role.id}
                        onClick={() => setSelectedRole(selectedRole?.id === role.id ? null : role)}
                        className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                        style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}`, color: SAGE }}>
                            {role.name.charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{role.name}</h3>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: SAGE_LIGHT, color: SAGE, border: `1px solid ${SAGE_BORDER}` }}>
                                кандидат в {role.role}
                              </span>
                            </div>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              {role.reason[0]} · {role.reason[1]}
                            </p>
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--text-muted)', transform: selectedRole?.id === role.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>

                        {selectedRole?.id === role.id && (
                          <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                            <div className="mb-4">
                              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Почему появилась рекомендация</p>
                              <ul className="space-y-1">
                                {role.reason.map((r, i) => (
                                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
                                    {r}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="mb-4">
                              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что означает роль</p>
                              <ul className="space-y-1">
                                {role.expectations.map((e, i) => (
                                  <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                                    <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color: SAGE }} />
                                    {e}
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              <p className="text-[11px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что дальше</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Лучше предложить роль и дождаться согласия. До согласия доступы и ожидания не меняются.</p>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRoleText(`Привет!\n\nМы видим, что вы регулярно помогаете участникам с разборами работ: даёте понятную обратную связь, помогаете улучшать проекты и ваши ответы сохраняют другие участники.\n\nХотим предложить вам роль ${role.role} в треке «Продуктовый дискавери».\n\nЭто не обязанность и не автоматическое назначение. Если вам интересно — вы сможете принять роль. Если сейчас неудобно — можно спокойно отказаться.\n\nРоль предполагает: брать разборы в комфортном объёме, давать обратную связь по правилам сообщества и помогать сохранять сильные ответы как инсайты.`);
                                  setShowRoleModal(true);
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                                style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                              >
                                Предложить роль {role.role}
                              </button>
                              <button onClick={(e) => e.stopPropagation()} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                                Посмотреть историю вклада
                              </button>
                              <button onClick={(e) => e.stopPropagation()} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                                Скрыть рекомендацию
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}

        {/* ===== INSIGHTS SECTION ===== */}
        {activeSection === 'insights' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Что получается</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Спокойный обзор того, как развивается культура вклада.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-6">

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {insightsMetrics.map((m, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <p className="text-xl font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: i === 4 ? 'var(--gold)' : 'var(--text-primary)' }}>{m.value}</p>
                    <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                    {m.period && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{m.period}</p>}
                  </div>
                ))}
              </div>

              {/* Good signals */}
              <div>
                <p className="text-[11px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Хорошие сигналы</p>
                <div className="space-y-3">
                  {goodSignals.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SAGE }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.text}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* What can improve */}
              <div>
                <p className="text-[11px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что можно улучшить</p>
                <div className="space-y-3">
                  {improveAreas.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <ArrowRight className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{item.text}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Как считается Вклад</button>
            </div>
          </div>
        )}

        {/* ===== SETTINGS SECTION ===== */}
        {activeSection === 'settings' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Настройки</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Что считается Вкладом, как работают уровни, бейджи, признание и правила ролей.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-8">

              {/* Block 1: What counts */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Что считается Вкладом</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'answer', label: 'Ответ на запрос участника' },
                    { key: 'help', label: 'Подтверждённая помощь новичку' },
                    { key: 'review', label: 'Peer-разбор работы' },
                    { key: 'expert', label: 'Кураторский или экспертный разбор' },
                    { key: 'insight', label: 'Опубликованный инсайт' },
                    { key: 'meeting', label: 'Проведённая встреча или сессия' },
                    { key: 'connect', label: 'Ручное соединение людей, которое привело к помощи' },
                    { key: 'thank', label: 'Благодарность, подтверждённая получателем' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: contribSources[item.key as keyof typeof contribSources] ? 'var(--gold)' : 'transparent', borderColor: contribSources[item.key as keyof typeof contribSources] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setContribSources(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof contribSources] }))}>
                        {contribSources[item.key as keyof typeof contribSources] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Вклад — это полезное действие, которое помогло другому человеку или сообществу. Важно не количество активности, а подтверждённая польза.</p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 2: What does NOT count */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Что не даёт Вклад</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'likes', label: 'Лайки не дают Вклад' },
                    { key: 'views', label: 'Просмотры не дают Вклад' },
                    { key: 'posts', label: 'Просто количество постов не даёт Вклад' },
                    { key: 'presence', label: 'Простое присутствие на встрече не даёт Вклад' },
                    { key: 'self', label: 'Самооценка без подтверждения не даёт Вклад' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: notContrib[item.key as keyof typeof notContrib] ? 'var(--gold)' : 'transparent', borderColor: notContrib[item.key as keyof typeof notContrib] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setNotContrib(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof notContrib] }))}>
                        {notContrib[item.key as keyof typeof notContrib] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Это защищает сообщество от гонки за видимостью. Вклад появляется там, где есть польза, помощь или подтверждённое действие.</p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 3: Levels */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Уровни Вклада</h3>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>9 уровней роста активны. Уровень показывает не статус "лучше других", а степень включённости в помощь и жизнь сообщества.</p>
                <div className="space-y-2.5">
                  {[
                    { key: 'showProfile', label: 'Показывать уровень в профиле участника' },
                    { key: 'showName', label: 'Показывать уровень рядом с именем' },
                    { key: 'noPlace', label: 'Не показывать место участника среди других' },
                    { key: 'noRating', label: 'Не показывать общий рейтинг участников' },
                    { key: 'explain', label: 'Объяснять, за какие действия вырос уровень' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: levelSettings[item.key as keyof typeof levelSettings] ? 'var(--gold)' : 'transparent', borderColor: levelSettings[item.key as keyof typeof levelSettings] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setLevelSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof levelSettings] }))}>
                        {levelSettings[item.key as keyof typeof levelSettings] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 4: Badge */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Бейдж Вклада</h3>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Бейдж Вклада — компактный визуальный знак рядом с именем участника. Где показывать:</p>
                <div className="space-y-2.5">
                  {[
                    { key: 'profile', label: 'В профиле участника' },
                    { key: 'card', label: 'В карточке участника' },
                    { key: 'comments', label: 'В комментариях' },
                    { key: 'answers', label: 'В ответах на запросы' },
                    { key: 'reviews', label: 'В карточках разборов' },
                    { key: 'catalog', label: 'В публичном каталоге сообщества' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: badgeSettings[item.key as keyof typeof badgeSettings] ? 'var(--gold)' : 'transparent', borderColor: badgeSettings[item.key as keyof typeof badgeSettings] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setBadgeSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof badgeSettings] }))}>
                        {badgeSettings[item.key as keyof typeof badgeSettings] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Бейдж должен помогать ориентироваться, а не создавать публичную иерархию.</p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 5: Recognition */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Признание</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'weekly', label: 'Использовать Признание недели вместо лидерборда' },
                    { key: 'showReason', label: 'Показывать причину признания' },
                    { key: 'noPlace', label: 'Не показывать место в рейтинге' },
                    { key: 'allowPrivate', label: 'Разрешить личное признание без публикации' },
                    { key: 'saveHistory', label: 'Сохранять признание в истории участника' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: recogSettings[item.key as keyof typeof recogSettings] ? 'var(--gold)' : 'transparent', borderColor: recogSettings[item.key as keyof typeof recogSettings] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setRecogSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof recogSettings] }))}>
                        {recogSettings[item.key as keyof typeof recogSettings] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 6: Roles */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Роли</h3>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Роль — это ответственность, доступы и ожидания. Не назначается автоматически по уровню Вклада.</p>
                <div className="space-y-2.5">
                  {[
                    { key: 'needConsent', label: 'Предлагать роль только после согласия участника' },
                    { key: 'showWhy', label: 'Показывать, почему роль предложена' },
                    { key: 'showLimits', label: 'Указывать ожидания и лимиты нагрузки' },
                    { key: 'canDecline', label: 'Давать возможность отказаться без потери Вклада' },
                    { key: 'canPause', label: 'Давать возможность поставить роль на паузу' },
                    { key: 'saveHistory', label: 'Сохранять историю роли' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: roleSettings[item.key as keyof typeof roleSettings] ? 'var(--gold)' : 'transparent', borderColor: roleSettings[item.key as keyof typeof roleSettings] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setRoleSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof roleSettings] }))}>
                        {roleSettings[item.key as keyof typeof roleSettings] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 7: Review */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Проверка и спорные случаи</h3>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Когда Вклад требует проверки:</p>
                <div className="space-y-2.5">
                  {[
                    'Действие отмечено участником, но получатель не подтвердил пользу',
                    'Ответ был жалован или скрыт',
                    'Один участник массово просит засчитать действия',
                    'Действие похоже на формальную активность без пользы',
                    'Есть конфликт вокруг разбора или ответа',
                  ].map((label, i) => (
                    <div key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" style={{ color: TERRACOTTA }} />
                      {label}
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

        {/* Attention & Insights: hide advisor */}
        {(activeSection === 'attention' || activeSection === 'insights') && null}

        {/* Members: advisor */}
        {activeSection === 'members' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Сначала проверьте неподтверждённый вклад</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Два действия отмечены как полезные, но получатель ещё не подтвердил помощь. Лучше проверить до признания.</p>
                <button onClick={() => setMemberFilter('check')} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: TERRACOTTA }}>Показать проверку</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Как считается Вклад</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Что даёт Вклад, что не даёт</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Бейдж Вклада</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Где участники видят уровень</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Recognition: advisor */}
        {activeSection === 'recognition' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Роль лучше предложить до перегруза</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Вероника уже регулярно даёт разборы, но нагрузка пока комфортная. Это хороший момент предложить роль.</p>
                <button onClick={() => setSelectedRole(roleCandidates[0])} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Показать кандидата</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Шаблоны признания</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Для недели, разбора, помощи новичку</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Правила ролей</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Доступы, пауза, лимиты</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Settings: advisor only if problem */}
        {activeSection === 'settings' && (
          <div className="sidebar-section">
            <div className="flex items-center gap-2 mb-3">
              <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
              <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Вклад может выглядеть как рейтинг</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Если бейдж показывается слишком широко или участники видят сравнение, Вклад может восприниматься как соревнование.</p>
              <button className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: TERRACOTTA }}>Настроить видимость</button>
            </div>
          </div>
        )}
      </aside>

      {/* ===== MODAL: Publish Recognition ===== */}
      {showPublishModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowPublishModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPublishModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
            <div className="shrink-0 px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold mb-1 heading-accent pr-8" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Опубликовать признание?</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Признание покажет полезное действие без сравнения с другими и без лидерборда.</p>
            </div>
            <div className="shrink-0 px-6 md:px-8" style={{ borderBottom: '1px solid var(--border-color)' }} />
            <div className="flex-1 overflow-y-auto modal-scroll px-6 md:px-8 py-4">
              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Тип признания</p>
                <div className="flex flex-wrap gap-2">
                  {['Признание недели', 'Сильный разбор', 'Помощь новичку', 'Инсайт сообщества', 'Мост между людьми'].map((t, i) => (
                    <button key={i} className="text-[11px] px-2.5 py-1 rounded-full" style={{ backgroundColor: i === 0 ? 'rgba(212,175,55,0.08)' : 'var(--hover-bg)', border: `1px solid ${i === 0 ? 'var(--gold)' : 'var(--border-color)'}`, color: i === 0 ? 'var(--gold)' : 'var(--text-muted)' }}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Текст признания</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  maxLength={1000}
                  value={pubText}
                  onChange={(e) => setPubText(e.target.value)}
                  rows={6}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content', overflow: 'hidden' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{pubText.length} / 1000</span>
                </div>
              </div>
              <div className="mb-2">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Где опубликовать</p>
                <div className="space-y-2">
                  {[
                    { key: 'feed', label: 'Лента сообщества' },
                    { key: 'book', label: 'Книга жизни сообщества' },
                    { key: 'private', label: 'Личное уведомление без публикации' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: pubWhere[item.key as keyof typeof pubWhere] ? 'var(--gold)' : 'transparent', borderColor: pubWhere[item.key as keyof typeof pubWhere] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setPubWhere(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof pubWhere] }))}>
                        {pubWhere[item.key as keyof typeof pubWhere] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="shrink-0 px-6 md:px-8 py-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => { showToast('Признание опубликовано. Участник получит уведомление.', 'success'); setShowPublishModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                Опубликовать признание
              </button>
              <button onClick={() => setShowPublishModal(false)} className="px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                Сохранить черновик
              </button>
              <button onClick={() => setShowPublishModal(false)} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                Вернуться
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Offer Role ===== */}
      {showRoleModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowRoleModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowRoleModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
            <div className="shrink-0 px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold mb-1 heading-accent pr-8" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Предложить роль куратора разборов?</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Вероника получит предложение роли. Роль не будет назначена автоматически: она появится только после согласия участника.</p>
            </div>
            <div className="shrink-0 px-6 md:px-8" style={{ borderBottom: '1px solid var(--border-color)' }} />
            <div className="flex-1 overflow-y-auto modal-scroll px-6 md:px-8 py-4">
              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что увидит Вероника</p>
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Заголовок</p>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl text-sm mb-3" value="Предложение роли куратора разборов" readOnly style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Сообщение</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  maxLength={1000}
                  value={roleText}
                  onChange={(e) => setRoleText(e.target.value)}
                  rows={10}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content', overflow: 'hidden' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{roleText.length} / 1000</span>
                </div>
              </div>
              <div className="rounded-lg p-3 mb-2" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что получит роль после согласия</p>
                <ul className="space-y-1">
                  {['Бейдж роли в профиле', 'Возможность брать разборы из очереди', 'Доступ к заметкам по разбору', 'Лимит: до 3 активных разборов', 'Возможность поставить роль на паузу'].map((t, i) => (
                    <li key={i} className="text-[11px] flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color: SAGE }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="shrink-0 px-6 md:px-8 py-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => { showToast('Предложение роли отправлено Веронике. Роль станет активной только после её согласия.', 'success'); setShowRoleModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                Отправить предложение
              </button>
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                Вернуться к кандидату
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

