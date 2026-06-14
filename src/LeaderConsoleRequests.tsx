import { useState, useEffect } from 'react';
import {
  ChevronRight, X, Info, AlertTriangle,
  Clock, Check, Search, RefreshCw,
  MessageSquare, FileText, Users, Settings,
  Star, ArrowRight, Lightbulb, BookOpen,
  Eye, Send, UserCheck, HelpCircle,
  BarChart3, TrendingUp, TrendingDown, PauseCircle
} from 'lucide-react';
import { useToast } from './ToastContext';
import { images } from './assets/images';

/* ===== PREMIUM COLORS ===== */
const TERRACOTTA = '#C9706A';
const TERRACOTTA_LIGHT = 'rgba(201,112,106,0.08)';
const TERRACOTTA_BORDER = 'rgba(201,112,106,0.15)';
const SAGE = '#6B9E7C';
const SAGE_LIGHT = 'rgba(107,158,124,0.08)';
const GOLD_GLOW = 'rgba(201,169,110,0.08)';

/* ===== SECTION TYPE ===== */
type SectionKey = 'attention' | 'requests' | 'reviews' | 'insights' | 'settings';

/* ===== DATA: ATTENTION CARDS ===== */
const attentionCards = [
  {
    id: 1,
    title: '3 запроса ждут ответа',
    text: 'Участники уже сформулировали вопросы, но пока не получили живого отклика. Один запрос ждёт больше суток.',
    primary: 'Открыть запросы',
    accent: 'terracotta' as const,
    targetSection: 'requests' as SectionKey,
    why: 'Запросы без ответа больше 12 часов снижают доверие к сообществу. Быстрый ответ помогает участнику почувствовать, что его заметили.',
  },
  {
    id: 2,
    title: '2 работы ждут разбора',
    text: 'Работы уже загружены. Лучше назначить разбор или передать их участникам, которые могут дать обратную связь.',
    primary: 'Открыть разборы',
    accent: 'gold' as const,
    targetSection: 'reviews' as SectionKey,
    why: 'Разборы — это главная ценность для участников. Долгие ожидания разбора снижают вовлечённость.',
  },
  {
    id: 3,
    title: '1 запрос лучше передать эксперту',
    text: 'Вопрос технический и требует глубокой экспертизы. Система нашла подходящего человека с нормальной нагрузкой.',
    primary: 'Посмотреть запрос',
    accent: 'terracotta' as const,
    targetSection: 'requests' as SectionKey,
    why: 'Технические вопросы без экспертного ответа оставляют участника без продвижения. Передача эксперту сохраняет время лидера.',
  },
  {
    id: 4,
    title: 'Сессия подтверждена, но оплата не завершена',
    text: 'Разбор запланирован, но исполнение пока заблокировано оплатой.',
    primary: 'Открыть сессию',
    accent: 'gold' as const,
    targetSection: 'reviews' as SectionKey,
    why: 'Участник ждёт разбора, а оплата не завершена. Лучше напомнить об оплате или уточнить статус.',
  },
];

/* ===== DATA: REQUESTS ===== */
interface RequestItem {
  id: number;
  author: string;
  avatar: string;
  status: 'waiting' | 'expert' | 'peer' | 'clarify' | 'resolved';
  hours: number;
  question: string;
  context: string;
  topic: string;
  track: string;
  level: string;
  history: string[];
  suggestion?: { name: string; reason: string };
}

const requestsData: RequestItem[] = [
  {
    id: 1,
    author: 'Денис Воронов',
    avatar: images.avatar1,
    status: 'waiting',
    hours: 14,
    question: 'Как настроить webhook на стороне партнёра, если у них нет публичного URL?',
    context: 'Пытаюсь интегрироваться с внутренней CRM заказчика. У них нет публичного endpoint, а мне нужно получать уведомления об изменениях статусов.',
    topic: 'backend · интеграции',
    track: 'backend pet-проект',
    level: 'middle-',
    history: [
      'Денис задал вопрос',
      'Ответа пока нет',
      'Похожие вопросы уже решал Игорь К.',
      'Запрос ждёт больше 12 часов',
    ],
    suggestion: { name: 'Игорь К.', reason: 'уже отвечал на похожие темы, не перегружен' },
  },
  {
    id: 2,
    author: 'Марина Соколова',
    avatar: images.avatar2,
    status: 'expert',
    hours: 6,
    question: 'Как правильно организовать слой доступа к данным в Go?',
    context: 'Начала писать pet-проект на Go. Не уверена, как структурировать repository layer — делать один большой интерфейс или разбивать по доменам.',
    topic: 'backend · архитектура',
    track: 'backend pet-проект',
    level: 'junior+',
    history: [
      'Марина задала вопрос',
      'Вопрос требует экспертизы в Go',
      'Система рекомендует передать Игорю К.',
    ],
    suggestion: { name: 'Игорь К.', reason: 'эксперт по Go, свободен' },
  },
  {
    id: 3,
    author: 'Алексей Петров',
    avatar: images.avatar3,
    status: 'peer',
    hours: 3,
    question: 'Посоветуйте подход к тестированию форм с валидацией на React?',
    context: 'В проекте много сложных форм с кастомной валидацией. Хочу понять, как лучше писать тесты — через React Testing Library или стоит посмотреть на e2e.',
    topic: 'frontend · тестирование',
    track: 'frontend pet-проект',
    level: 'middle',
    history: [
      'Алексей задал вопрос',
      'Вопрос не требует эксперта — можно передать участнику с похожим опытом',
      'Анна П. недавно разбирала похожий кейс',
    ],
    suggestion: { name: 'Анна П.', reason: 'недавно решала похожий вопрос' },
  },
  {
    id: 4,
    author: 'Елена Васильева',
    avatar: images.avatar4,
    status: 'clarify',
    hours: 20,
    question: 'Какой стек выбрать для MVP мобильного приложения?',
    context: 'Хочу быстро проверить гипотезу. Нужно понять, хватит ли React Native или стоит сразу натив.',
    topic: 'mobile · выбор стека',
    track: 'mobile pet-проект',
    level: 'junior',
    history: [
      'Елена задала вопрос',
      'Лидер попросил уточнить требования к производительности',
      'Ждём ответа от Елены',
    ],
  },
  {
    id: 5,
    author: 'Ольга Миронова',
    avatar: images.avatar5,
    status: 'resolved',
    hours: 48,
    question: 'Как структурировать компоненты в большом React-проекте?',
    context: 'Проект растёт, компонентов много. Хочу понять, как лучше организовать структуру папок и разделение ответственности.',
    topic: 'frontend · архитектура',
    track: 'frontend pet-проект',
    level: 'middle',
    history: [
      'Ольга задала вопрос',
      'Анна П. дала развёрнутый ответ',
      'Ольга отметила вопрос решённым',
    ],
  },
];

const requestFilters = [
  { key: 'all', label: 'Все' },
  { key: 'waiting', label: 'Ждут ответа' },
  { key: 'expert', label: 'Нужен эксперт' },
  { key: 'peer', label: 'Можно передать участнику' },
  { key: 'clarify', label: 'На уточнении' },
  { key: 'resolved', label: 'История' },
] as const;

type RequestFilterKey = typeof requestFilters[number]['key'];

/* ===== DATA: REVIEWS & SESSIONS ===== */
interface ReviewItem {
  id: number;
  author: string;
  avatar: string;
  status: 'waiting' | 'in_progress' | 'needs_agreement' | 'blocked' | 'done' | 'archived';
  hours: number;
  workTitle: string;
  workLink: string;
  requestDetails: string;
  context: string;
  track: string;
  format: string;
  history: string[];
  suggestion?: { name: string; reason: string };
  sessionDate?: string;
  blockReason?: string;
}

const reviewsData: ReviewItem[] = [
  {
    id: 1,
    author: 'Ольга Миронова',
    avatar: images.avatar5,
    status: 'waiting',
    hours: 18,
    workTitle: 'Frontend pet-проект: личный кабинет',
    workLink: 'GitHub',
    requestDetails: 'Хочу понять, насколько структура компонентов нормальная и что стоит улучшить перед портфолио.',
    context: 'Подготовка проекта к портфолио',
    track: 'frontend pet-проект',
    format: 'разбор работы',
    history: [
      'Работа загружена',
      'Разбор пока не назначен',
      'Анна П. уже разбирала похожие проекты',
      'Нагрузка Анны комфортная',
    ],
    suggestion: { name: 'Анна П.', reason: 'уже разбирала похожие проекты' },
  },
  {
    id: 2,
    author: 'Дмитрий Коваль',
    avatar: images.avatar1,
    status: 'waiting',
    hours: 26,
    workTitle: 'Backend: API для маркетплейса',
    workLink: 'GitHub',
    requestDetails: 'Нужен разбор архитектуры endpoints и обработки ошибок. Не уверен, что правильно разделил слои.',
    context: 'Проверка архитектуры перед продакшеном',
    track: 'backend pet-проект',
    format: 'разбор работы',
    history: [
      'Работа загружена',
      'Разбор пока не назначен',
      'Игорь К. — эксперт по backend-архитектуре',
    ],
    suggestion: { name: 'Игорь К.', reason: 'эксперт по backend-архитектуре' },
  },
  {
    id: 3,
    author: 'Марина Соколова',
    avatar: images.avatar2,
    status: 'in_progress',
    hours: 4,
    workTitle: 'Система авторизации с JWT',
    workLink: 'GitHub',
    requestDetails: 'Проверить реализацию refresh-токенов и логику выхода из всех сессий.',
    context: 'Реализация auth для pet-проекта',
    track: 'backend pet-проект',
    format: 'экспертная сессия',
    history: [
      'Работа загружена',
      'Назначен разбор — Игорь К.',
      'Игорь начал разбор',
    ],
  },
  {
    id: 4,
    author: 'Алексей Петров',
    avatar: images.avatar3,
    status: 'needs_agreement',
    hours: 8,
    workTitle: 'Landing page с анимациями',
    workLink: 'Figma',
    requestDetails: 'Хочу разобрать подход к анимациям — какие библиотеки выбрать и как не перегрузить страницу.',
    context: 'Подготовка лендинга для портфолио',
    track: 'frontend pet-проект',
    format: 'сессия',
    sessionDate: 'Предлагается: завтра, 15:00',
    history: [
      'Работа загружена',
      'Предложено время сессии',
      'Ждём подтверждения от Алексея',
    ],
  },
  {
    id: 5,
    author: 'Елена Васильева',
    avatar: images.avatar4,
    status: 'blocked',
    hours: 12,
    workTitle: 'Мобильное приложение: трекер привычек',
    workLink: 'Figma + файл',
    requestDetails: 'Разбор UI/UX и архитектуры навигации.',
    context: 'Подготовка MVP для тестирования гипотезы',
    track: 'mobile pet-проект',
    format: 'разбор работы',
    blockReason: 'Оплата не завершена',
    history: [
      'Работа загружена',
      'Разбор запланирован',
      'Оплата не завершена — исполнение заблокировано',
    ],
  },
  {
    id: 6,
    author: 'Никита Орлов',
    avatar: images.avatar5,
    status: 'done',
    hours: 72,
    workTitle: 'CI/CD pipeline для pet-проекта',
    workLink: 'GitHub',
    requestDetails: 'Разбор настройки GitHub Actions и деплоя на VPS.',
    context: 'Автоматизация деплоя',
    track: 'backend pet-проект',
    format: 'разбор работы',
    history: [
      'Работа загружена',
      'Назначен разбор',
      'Разбор проведён',
      'Получен отзыв от участника',
    ],
  },
];

const reviewFilters = [
  { key: 'all', label: 'Все' },
  { key: 'waiting', label: 'Ждут разбора' },
  { key: 'in_progress', label: 'В работе' },
  { key: 'needs_agreement', label: 'Нужно согласовать' },
  { key: 'blocked', label: 'Заблокировано' },
  { key: 'done', label: 'Прошли' },
  { key: 'archived', label: 'История' },
] as const;

type ReviewFilterKey = typeof reviewFilters[number]['key'];

/* ===== DATA: INSIGHTS ===== */
const insightMetrics = [
  { label: 'Запросов получили ответ', value: '82%', period: 'за последние 7 дней', icon: Check, positive: true },
  { label: 'Среднее время до первого ответа', value: '6 часов', period: 'без учёта ночного времени', icon: Clock, positive: true },
  { label: 'Работ разобрано', value: '14', period: 'за последние 7 дней', icon: FileText, positive: true },
  { label: 'Участников помогали другим', value: '6', period: 'не только эксперты', icon: Users, positive: true },
  { label: 'Инсайтов можно сохранить', value: '4', period: 'из ответов и разборов', icon: Lightbulb, positive: true },
];

const goodSignals = [
  'Участники стали чаще отвечать друг другу',
  'Больше работ дошли до разбора',
  'Экспертная нагрузка распределена ровнее',
];

const improveAreas = [
  'Часть технических вопросов всё ещё ждёт экспертов',
  'Мало участников берут взаимные разборы',
  'Не все разборы превращаются в инсайты для базы знаний',
];

/* ===== DATA: SETTINGS BLOCKS ===== */
const settingsBlocks = [
  {
    id: 'request-rules',
    title: 'Правила запросов',
    desc: 'Кто может задавать запросы, какие поля обязательны, когда запрос считается зависшим.',
    icon: MessageSquare,
  },
  {
    id: 'templates',
    title: 'Шаблоны ответов',
    desc: 'Первый ответ, уточнение, передача эксперту, закрытие запроса.',
    icon: FileText,
  },
  {
    id: 'review-rules',
    title: 'Правила разборов',
    desc: 'Как участник отправляет работу, какие материалы нужны, кто может брать разбор.',
    icon: BookOpen,
  },
  {
    id: 'limits',
    title: 'Лимиты нагрузки',
    desc: 'Сколько запросов или разборов может брать эксперт, куратор или активный участник.',
    icon: PauseCircle,
  },
  {
    id: 'quality',
    title: 'Качество и отзывы',
    desc: 'Когда просим отзыв после разбора, какие оценки показываем лидеру, что уходит в доверие.',
    icon: Star,
  },
];

/* ===== COMPONENT ===== */
export default function LeaderConsoleRequests() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionKey>('attention');
  const [reqFilter, setReqFilter] = useState<RequestFilterKey>('all');
  const [revFilter, setRevFilter] = useState<ReviewFilterKey>('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* Side panel states */
  const [selectedRequest, setSelectedRequest] = useState<RequestItem | null>(null);
  const [showRequestPanel, setShowRequestPanel] = useState(false);
  const [selectedReview, setSelectedReview] = useState<ReviewItem | null>(null);
  const [showReviewPanel, setShowReviewPanel] = useState(false);

  /* Body scroll lock */
  useEffect(() => {
    if (showRequestPanel || showReviewPanel) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showRequestPanel, showReviewPanel]);

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  /* ---- Section cards data ---- */
  const sectionCards: { key: SectionKey; label: string; subtitle: string; icon: typeof AlertTriangle }[] = [
    { key: 'attention', label: 'Ваше внимание', subtitle: '3 ситуации требуют реакции', icon: AlertTriangle },
    { key: 'requests', label: 'Запросы', subtitle: '5 ждут ответа или передачи', icon: MessageSquare },
    { key: 'reviews', label: 'Разборы и сессии', subtitle: '12 работ и 3 сессии в работе', icon: FileText },
    { key: 'insights', label: 'Что получается', subtitle: 'Помощь, скорость и качество', icon: BarChart3 },
    { key: 'settings', label: 'Настройки', subtitle: 'Правила, шаблоны и лимиты', icon: Settings },
  ];

  /* ---- Filtered data ---- */
  const filteredRequests = requestsData.filter(r => {
    if (reqFilter === 'all') return r.status !== 'resolved';
    if (reqFilter === 'resolved') return r.status === 'resolved';
    return r.status === reqFilter;
  }).filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.author.toLowerCase().includes(q) || r.question.toLowerCase().includes(q) || r.topic.toLowerCase().includes(q);
  });

  const filteredReviews = reviewsData.filter(r => {
    if (revFilter === 'all') return r.status !== 'archived';
    if (revFilter === 'archived') return r.status === 'done' || r.status === 'archived';
    return r.status === revFilter;
  }).filter(r => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return r.author.toLowerCase().includes(q) || r.workTitle.toLowerCase().includes(q) || r.track.toLowerCase().includes(q);
  });

  /* ---- Status helpers ---- */
  const requestStatusLabel = (s: RequestItem['status']) => {
    switch (s) {
      case 'waiting': return { label: 'ждёт ответа', color: TERRACOTTA, bg: TERRACOTTA_LIGHT };
      case 'expert': return { label: 'нужен эксперт', color: 'var(--gold)', bg: GOLD_GLOW };
      case 'peer': return { label: 'можно передать участнику', color: SAGE, bg: SAGE_LIGHT };
      case 'clarify': return { label: 'на уточнении', color: 'var(--text-muted)', bg: 'var(--hover-bg)' };
      case 'resolved': return { label: 'решён', color: SAGE, bg: SAGE_LIGHT };
    }
  };

  const reviewStatusLabel = (s: ReviewItem['status']) => {
    switch (s) {
      case 'waiting': return { label: 'ждёт разбора', color: TERRACOTTA, bg: TERRACOTTA_LIGHT };
      case 'in_progress': return { label: 'в работе', color: 'var(--gold)', bg: GOLD_GLOW };
      case 'needs_agreement': return { label: 'нужно согласовать', color: 'var(--gold)', bg: GOLD_GLOW };
      case 'blocked': return { label: 'заблокировано', color: TERRACOTTA, bg: TERRACOTTA_LIGHT };
      case 'done': return { label: 'прошёл', color: SAGE, bg: SAGE_LIGHT };
      case 'archived': return { label: 'в архиве', color: 'var(--text-muted)', bg: 'var(--hover-bg)' };
    }
  };

  /* ---- Actions ---- */
  const openRequest = (r: RequestItem) => {
    setSelectedRequest(r);
    setShowRequestPanel(true);
  };

  const openReview = (r: ReviewItem) => {
    setSelectedReview(r);
    setShowReviewPanel(true);
  };

  const handleAction = (action: string, itemName?: string) => {
    switch (action) {
      case 'assign_expert':
        showToast(`Запрос передан ${itemName || 'эксперту'}`, 'success');
        break;
      case 'answer':
        showToast('Открыт редактор ответа', 'success');
        break;
      case 'ask_clarify':
        showToast('Отправлен запрос на уточнение', 'warning');
        break;
      case 'close':
        showToast('Запрос закрыт', 'success');
        break;
      case 'assign_review':
        showToast('Разбор назначен', 'success');
        break;
      case 'peer_review':
        showToast('Предложен взаимный разбор', 'success');
        break;
      default:
        showToast('Действие выполнено', 'success');
    }
    setShowRequestPanel(false);
    setShowReviewPanel(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0 space-y-6">

        {/* ===== HEADER ===== */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 md:px-8 pt-8 pb-6 section-fade-in">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Запросы и разборы</span>
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Запросы и разборы
            </h1>
            <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              Здесь видно, какие вопросы участников ждут помощи, какие работы ждут обратной связи и где разборы требуют внимания команды.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Обновлено 4 минуты назад</span>
              <span>·</span>
              <button className="flex items-center gap-1 transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                <RefreshCw className="w-3 h-3" />Обновить
              </button>
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

        {/* ===== SECTION: ATTENTION ===== */}
        {activeSection === 'attention' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                Ваше внимание
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Ситуации, где сейчас нужно действие.
              </p>
            </div>
            <div className="px-6 md:px-8 pb-6 space-y-3">
              {attentionCards.map((card) => (
                <div
                  key={card.id}
                  className="p-4 md:p-5 rounded-xl transition-all duration-200 hover:translate-y-[-2px]"
                  style={{
                    backgroundColor: card.accent === 'terracotta' ? TERRACOTTA_LIGHT : GOLD_GLOW,
                    border: `1px solid ${card.accent === 'terracotta' ? TERRACOTTA_BORDER : 'rgba(201,169,110,0.15)'}`,
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-semibold mb-1" style={{ color: card.accent === 'terracotta' ? TERRACOTTA : 'var(--gold)' }}>
                        {card.title}
                      </h3>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{card.text}</p>
                      <button
                        onClick={() => setActiveSection(card.targetSection)}
                        className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                        style={{ color: card.accent === 'terracotta' ? TERRACOTTA : 'var(--gold)' }}
                      >
                        {card.primary}<ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <span title={card.why}><Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--text-muted)', opacity: 0.5 }} /></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== SECTION: REQUESTS ===== */}
        {activeSection === 'requests' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            {/* Header */}
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                Запросы
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Вопросы и просьбы участников, которые ждут ответа, передачи или уточнения.
              </p>
            </div>

            <div className="px-6 md:px-8"><GradientDivider /></div>

            {/* Search + Filters */}
            <div className="px-6 md:px-8 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Поиск по запросам..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm outline-none w-full"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}><X className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {requestFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setReqFilter(f.key)}
                    className={`filter-pill ${reqFilter === f.key ? 'active' : ''}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 md:px-8"><GradientDivider /></div>

            {/* List */}
            <div className="px-6 md:px-8 py-6">
              {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                  <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Запросов не найдено</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Попробуйте изменить фильтр или поисковый запрос</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((r) => {
                    const st = requestStatusLabel(r.status);
                    return (
                      <div
                        key={r.id}
                        onClick={() => openRequest(r)}
                        className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                        style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                      >
                        <div className="flex items-start gap-3 md:gap-4">
                          <img src={r.avatar} alt={r.author} className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5" style={{ border: '2px solid var(--border-color)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                                {st.label}
                              </span>
                              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                <Clock className="w-3 h-3" />{r.hours} часов
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{r.author}</h3>
                            <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)' }}>{r.question}</p>
                            <p className="text-[10px] mb-1" style={{ color: 'var(--text-muted)' }}>Тема: {r.topic}</p>
                            {r.suggestion && (
                              <p className="text-[10px]" style={{ color: SAGE }}>Можно передать: {r.suggestion.name}</p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 mt-1 hidden md:block" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== SECTION: REVIEWS & SESSIONS ===== */}
        {activeSection === 'reviews' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            {/* Header */}
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                Разборы и сессии
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Работы, разборы, экспертные сессии и состояния их исполнения.
              </p>
            </div>

            <div className="px-6 md:px-8"><GradientDivider /></div>

            {/* Search + Filters */}
            <div className="px-6 md:px-8 py-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Поиск по работам и сессиям..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-sm outline-none w-full"
                    style={{ color: 'var(--text-primary)' }}
                  />
                  {searchQuery && (
                    <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}><X className="w-3.5 h-3.5" /></button>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {reviewFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setRevFilter(f.key)}
                    className={`filter-pill ${revFilter === f.key ? 'active' : ''}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="px-6 md:px-8"><GradientDivider /></div>

            {/* List */}
            <div className="px-6 md:px-8 py-6">
              {filteredReviews.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Ничего не найдено</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Попробуйте изменить фильтр или поисковый запрос</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReviews.map((r) => {
                    const st = reviewStatusLabel(r.status);
                    return (
                      <div
                        key={r.id}
                        onClick={() => openReview(r)}
                        className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                        style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                      >
                        <div className="flex items-start gap-3 md:gap-4">
                          <img src={r.avatar} alt={r.author} className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5" style={{ border: '2px solid var(--border-color)' }} />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold" style={{ backgroundColor: st.bg, color: st.color }}>
                                {st.label}
                              </span>
                              <span className="flex items-center gap-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                                <Clock className="w-3 h-3" />{r.hours} часов
                              </span>
                              {r.blockReason && (
                                <span className="text-[10px]" style={{ color: TERRACOTTA }}>· {r.blockReason}</span>
                              )}
                            </div>
                            <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{r.author}</h3>
                            <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>{r.workTitle}</p>
                            <p className="text-xs leading-relaxed line-clamp-2 mb-2" style={{ color: 'var(--text-secondary)', opacity: 0.8 }}>{r.requestDetails}</p>
                            <div className="flex items-center gap-3 text-[10px]" style={{ color: 'var(--text-muted)' }}>
                              <span>Трек: {r.track}</span>
                              <span>·</span>
                              <span>Формат: {r.format}</span>
                              {r.sessionDate && (
                                <><span>·</span><span>{r.sessionDate}</span></>
                              )}
                            </div>
                            {r.suggestion && (
                              <p className="text-[10px] mt-1" style={{ color: SAGE }}>Можно передать: {r.suggestion.name}</p>
                            )}
                          </div>
                          <ChevronRight className="w-4 h-4 shrink-0 mt-1 hidden md:block" style={{ color: 'var(--text-muted)' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== SECTION: INSIGHTS ===== */}
        {activeSection === 'insights' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                Что получается
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Спокойная картина качества помощи: ответы, разборы, скорость, вклад участников.
              </p>
            </div>

            <div className="px-6 md:px-8"><GradientDivider /></div>

            {/* Metrics */}
            <div className="px-6 md:px-8 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {insightMetrics.map((m, i) => {
                  const Icon = m.icon;
                  return (
                    <div key={i} className="p-4 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: m.positive ? SAGE_LIGHT : TERRACOTTA_LIGHT }}>
                          <Icon className="w-4 h-4" style={{ color: m.positive ? SAGE : TERRACOTTA }} />
                        </div>
                        <p className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{m.label}</p>
                      </div>
                      <p className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{m.value}</p>
                      <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.period}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-6 md:px-8"><GradientDivider /></div>

            {/* Good signals + improvements */}
            <div className="px-6 md:px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4" style={{ color: SAGE }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Хорошие сигналы</p>
                </div>
                <ul className="space-y-2">
                  {goodSignals.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: SAGE }} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <TrendingDown className="w-4 h-4" style={{ color: TERRACOTTA }} />
                  <p className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Что можно улучшить</p>
                </div>
                <ul className="space-y-2">
                  {improveAreas.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: TERRACOTTA, opacity: 0.7 }} />
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="px-6 md:px-8 pb-6">
              <button
                className="inline-flex items-center gap-1.5 text-xs font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--gold)' }}
              >
                <Info className="w-3.5 h-3.5" />Как считаются показатели
              </button>
            </div>
          </div>
        )}

        {/* ===== SECTION: SETTINGS ===== */}
        {activeSection === 'settings' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
                Настройки
              </h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                Правила запросов, шаблоны ответов, лимиты разборов и правила экспертной работы.
              </p>
            </div>

            <div className="px-6 md:px-8"><GradientDivider /></div>

            <div className="px-6 md:px-8 py-6 space-y-3">
              {settingsBlocks.map((block) => {
                const Icon = block.icon;
                return (
                  <div
                    key={block.id}
                    className="p-4 md:p-5 rounded-xl transition-all duration-200 hover:translate-y-[-2px] cursor-pointer"
                    style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
                    onClick={() => showToast(`Открываем: ${block.title}`, 'success')}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: GOLD_GLOW }}>
                        <Icon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{block.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{block.desc}</p>
                      </div>
                      <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--text-muted)' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* ===== SIDE PANEL: REQUEST DETAIL ===== */}
      {showRequestPanel && selectedRequest && (
        <div className="slide-in-right fixed inset-y-0 right-0 w-full sm:w-[460px] lg:w-[400px] xl:w-[460px] z-50 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRequest.author}</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {requestStatusLabel(selectedRequest.status).label} · {selectedRequest.hours} часов
              </p>
            </div>
            <button onClick={() => setShowRequestPanel(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Question */}
            <div>
              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Запрос участника</p>
              <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>«{selectedRequest.question}»</p>
            </div>

            {/* Context */}
            {selectedRequest.context && (
              <div>
                <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Контекст</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedRequest.context}</p>
              </div>
            )}

            {/* Meta */}
            <div className="flex flex-wrap gap-3">
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Тема: {selectedRequest.topic}</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Уровень: {selectedRequest.level}</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Трек: {selectedRequest.track}</span>
            </div>

            <GradientDivider />

            {/* History */}
            <div>
              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что произошло</p>
              <ul className="space-y-1.5">
                {selectedRequest.history.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next step suggestion */}
            <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: '1px solid rgba(201,169,110,0.15)' }}>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {selectedRequest.suggestion
                    ? `Лучше передать вопрос ${selectedRequest.suggestion.name} — ${selectedRequest.suggestion.reason}.`
                    : selectedRequest.status === 'clarify'
                      ? 'Ждём уточнения от участника. Если ответа не будет в течение 24 часов, запрос можно закрыть.'
                      : 'Лучше дать короткий первый ответ, чтобы участник не остался без реакции.'
                  }
                </p>
              </div>
            </div>

            <GradientDivider />

            {/* Actions */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Действия</p>
              {selectedRequest.suggestion && (
                <button
                  onClick={() => handleAction('assign_expert', selectedRequest.suggestion?.name)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                >
                  <UserCheck className="w-4 h-4" />
                  Передать {selectedRequest.suggestion?.name}
                </button>
              )}
              <button
                onClick={() => handleAction('answer')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: SAGE, color: '#fff' }}
              >
                <Send className="w-4 h-4" />
                Ответить лично
              </button>
              {selectedRequest.status !== 'clarify' && (
                <button
                  onClick={() => handleAction('ask_clarify')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <HelpCircle className="w-4 h-4" />
                  Попросить уточнение
                </button>
              )}
              {selectedRequest.status !== 'resolved' && (
                <button
                  onClick={() => handleAction('close')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                  style={{ color: TERRACOTTA, border: `1px solid ${TERRACOTTA_BORDER}` }}
                >
                  <Check className="w-4 h-4" />
                  Закрыть запрос
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== SIDE PANEL: REVIEW DETAIL ===== */}
      {showReviewPanel && selectedReview && (
        <div className="slide-in-right fixed inset-y-0 right-0 w-full sm:w-[460px] lg:w-[400px] xl:w-[460px] z-50 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
            <div>
              <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedReview.author}</h2>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                {reviewStatusLabel(selectedReview.status).label} · {selectedReview.hours} часов
              </p>
            </div>
            <button onClick={() => setShowReviewPanel(false)} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Work title */}
            <div>
              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Работа на разбор</p>
              <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{selectedReview.workTitle}</p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Ссылка: {selectedReview.workLink}</p>
            </div>

            {/* Request details */}
            <div>
              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что участник просит посмотреть</p>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«{selectedReview.requestDetails}»</p>
            </div>

            {/* Context */}
            <div className="flex flex-wrap gap-3">
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Цель: {selectedReview.context}</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Трек: {selectedReview.track}</span>
              <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
              <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Формат: {selectedReview.format}</span>
              {selectedReview.sessionDate && (
                <><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span><span className="text-[11px]" style={{ color: 'var(--gold)' }}>{selectedReview.sessionDate}</span></>
              )}
            </div>

            {selectedReview.blockReason && (
              <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: TERRACOTTA }} />
                  <p className="text-xs font-medium" style={{ color: TERRACOTTA }}>{selectedReview.blockReason}</p>
                </div>
              </div>
            )}

            <GradientDivider />

            {/* History */}
            <div>
              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что произошло</p>
              <ul className="space-y-1.5">
                {selectedReview.history.map((h, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span style={{ color: 'var(--text-muted)' }}>—</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Next step suggestion */}
            <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: '1px solid rgba(201,169,110,0.15)' }}>
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {selectedReview.status === 'blocked'
                    ? 'Участник ждёт разбора, а оплата не завершена. Лучше напомнить об оплате или уточнить статус.'
                    : selectedReview.status === 'needs_agreement'
                      ? 'Нужно согласовать время или формат сессии. Свяжитесь с участником для подтверждения.'
                      : selectedReview.suggestion
                        ? `Лучше назначить разбор или предложить ${selectedReview.suggestion.name} — ${selectedReview.suggestion.reason}.`
                        : 'Разбор идёт по плану. Следите за прогрессом и соберите отзыв после завершения.'
                  }
                </p>
              </div>
            </div>

            <GradientDivider />

            {/* Actions */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Действия</p>
              {selectedReview.suggestion && selectedReview.status === 'waiting' && (
                <button
                  onClick={() => handleAction('assign_review', selectedReview.suggestion?.name)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                >
                  <UserCheck className="w-4 h-4" />
                  Назначить {selectedReview.suggestion?.name}
                </button>
              )}
              {selectedReview.status === 'waiting' && (
                <button
                  onClick={() => handleAction('assign_review')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: SAGE, color: '#fff' }}
                >
                  <Eye className="w-4 h-4" />
                  Назначить разбор
                </button>
              )}
              {selectedReview.status === 'waiting' && (
                <button
                  onClick={() => handleAction('peer_review')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <Users className="w-4 h-4" />
                  Предложить взаимный разбор
                </button>
              )}
              {(selectedReview.status === 'waiting' || selectedReview.status === 'needs_agreement') && (
                <button
                  onClick={() => handleAction('ask_clarify')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                  style={{ color: TERRACOTTA, border: `1px solid ${TERRACOTTA_BORDER}` }}
                >
                  <HelpCircle className="w-4 h-4" />
                  Попросить уточнить запрос
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== RIGHT PANEL (contextual) ===== */}
      <aside className="w-full lg:w-[240px] shrink-0 space-y-5 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar">

        {/* ADVISOR — Requests section */}
        {activeSection === 'requests' && (
          <div className="sidebar-section" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: TERRACOTTA }} />
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: TERRACOTTA }}>Советник</h3>
            </div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Сначала передайте технический запрос
            </p>
            <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              Один запрос ждёт больше 12 часов и требует глубокой экспертизы. Игорь К. уже отвечал на похожие темы и сейчас не перегружен.
            </p>
            <button
              onClick={() => { const r = requestsData.find(x => x.id === 1); if (r) openRequest(r); }}
              className="text-[11px] font-medium transition-colors hover:opacity-80 flex items-center gap-1"
              style={{ color: TERRACOTTA }}
            >
              Показать запрос<ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* MAY NEED — Requests section */}
        {activeSection === 'requests' && (
          <div className="sidebar-section">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
            <div className="space-y-3">
              <button
                onClick={() => showToast('Открываем шаблоны ответов', 'success')}
                className="w-full text-left group"
              >
                <p className="text-xs font-medium mb-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>
                  Шаблоны ответов
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Первый ответ, уточнение и закрытие запроса</p>
              </button>
              <GradientDivider />
              <button
                onClick={() => showToast('Открываем правила запросов', 'success')}
                className="w-full text-left group"
              >
                <p className="text-xs font-medium mb-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>
                  Правила запросов
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Поля, сроки ожидания и условия передачи эксперту</p>
              </button>
            </div>
          </div>
        )}

        {/* ADVISOR — Reviews section */}
        {activeSection === 'reviews' && (
          <div className="sidebar-section" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: TERRACOTTA }} />
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: TERRACOTTA }}>Советник</h3>
            </div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Две работы ждут разбора больше суток
            </p>
            <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              Лучше назначить разбор или предложить взаимную обратную связь, пока участники ещё ждут результата.
            </p>
            <button
              onClick={() => { const r = reviewsData.find(x => x.status === 'waiting'); if (r) openReview(r); }}
              className="text-[11px] font-medium transition-colors hover:opacity-80 flex items-center gap-1"
              style={{ color: TERRACOTTA }}
            >
              Открыть работы<ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* MAY NEED — Reviews section */}
        {activeSection === 'reviews' && (
          <div className="sidebar-section">
            <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
            <div className="space-y-3">
              <button
                onClick={() => showToast('Открываем правила разборов', 'success')}
                className="w-full text-left group"
              >
                <p className="text-xs font-medium mb-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>
                  Правила разборов
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Что нужно приложить к работе и кто может её разобрать</p>
              </button>
              <GradientDivider />
              <button
                onClick={() => showToast('Открываем нагрузку экспертов', 'success')}
                className="w-full text-left group"
              >
                <p className="text-xs font-medium mb-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>
                  Нагрузка экспертов
                </p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Кто свободен, кто перегружен и кому можно передать следующий разбор</p>
              </button>
            </div>
          </div>
        )}

        {/* ADVISOR — Settings section (only if problem) */}
        {activeSection === 'settings' && (
          <div className="sidebar-section" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: TERRACOTTA }} />
              <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: TERRACOTTA }}>Советник</h3>
            </div>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Запросы закрываются без причины
            </p>
            <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              В шаблоне закрытия запроса нет поля для объяснения участнику, что произошло дальше.
            </p>
            <button
              onClick={() => showToast('Открываем настройку шаблона', 'success')}
              className="text-[11px] font-medium transition-colors hover:opacity-80 flex items-center gap-1"
              style={{ color: TERRACOTTA }}
            >
              Настроить шаблон<ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Attention & Insights sections — no right panel */}
        {(activeSection === 'attention' || activeSection === 'insights') && null}

      </aside>
    </div>
  );
}
