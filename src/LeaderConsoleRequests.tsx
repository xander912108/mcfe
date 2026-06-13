import { useState } from 'react';
import {
  ChevronRight, X, Info, HelpCircle,
  MessageSquareQuote, HandHeart, MessageSquare,
  Clock, Check, AlertTriangle, Search, Filter,
  ChevronDown, Star, Zap
} from 'lucide-react';
import { useToast } from './ToastContext';
import { images } from './assets/images';

/* ===== PREMIUM COLORS ===== */
const TERRACOTTA = '#C9706A';
const TERRACOTTA_LIGHT = 'rgba(201,112,106,0.08)';
const TERRACOTTA_BORDER = 'rgba(201,112,106,0.15)';
const SAGE = '#6B9E7C';
const SAGE_LIGHT = 'rgba(107,158,124,0.08)';
const SAGE_BORDER = 'rgba(107,158,124,0.15)';
const GOLD_GLOW = 'rgba(201,169,110,0.08)';

/* ===== DATA: REQUESTS ===== */
const requestFilters = [
  { key: 'active', label: 'Активные', count: 4 },
  { key: 'my', label: 'Мои', count: 2 },
  { key: 'unanswered', label: 'Без ответа', count: 1 },
  { key: 'resolved', label: 'Решены', count: 12 },
] as const;

type RequestFilterKey = typeof requestFilters[number]['key'];

interface RequestData {
  id: number;
  author: string;
  avatar: string;
  topic: string;
  content: string;
  type: 'help' | 'feedback' | 'review' | 'question';
  status: 'open' | 'answered' | 'resolved' | 'urgent';
  createdAt: string;
  responses: number;
  likes: number;
  isNew?: boolean;
  isUrgent?: boolean;
  lastActivity?: string;
}

const requestsByFilter: Record<RequestFilterKey, RequestData[]> = {
  active: [
    {
      id: 1,
      author: 'Дмитрий Коваль',
      avatar: images.avatar1,
      topic: 'Помощь с Docker-контейнеризацией',
      content: 'Не получается настроить docker-compose для микросервиса. База не подключается при сборке. Кто-то сталкивался?',
      type: 'help',
      status: 'open',
      createdAt: '2 часа назад',
      responses: 0,
      likes: 2,
      isNew: true,
      lastActivity: '2 часа назад',
    },
    {
      id: 2,
      author: 'Марина Соколова',
      avatar: images.avatar2,
      topic: 'Разбор pet-проекта на React',
      content: 'Собрала приложение для отслеживания задач. Хочу понять, правильно ли организована архитектура и стоит ли добавить state-manager.',
      type: 'review',
      status: 'answered',
      createdAt: '5 часов назад',
      responses: 3,
      likes: 5,
      lastActivity: '30 минут назад',
    },
    {
      id: 3,
      author: 'Алексей Петров',
      avatar: images.avatar3,
      topic: 'Срочно: проблема с деплоем',
      content: 'После обновления CI/CD pipeline падает на этапе сборки. Логи прикрепил, нужна помощь — завтра дедлайн.',
      type: 'help',
      status: 'urgent',
      createdAt: '30 минут назад',
      responses: 1,
      likes: 1,
      isUrgent: true,
      lastActivity: '10 минут назад',
    },
    {
      id: 4,
      author: 'Елена Васильева',
      avatar: images.avatar4,
      topic: 'Обратная связь по треку Backend',
      content: 'Прошла трек "Go для начинающих". Хотелось бы больше практики с concurrency. Остальное — отлично!',
      type: 'feedback',
      status: 'open',
      createdAt: '1 день назад',
      responses: 0,
      likes: 8,
      lastActivity: '1 день назад',
    },
  ],
  my: [
    {
      id: 5,
      author: 'Анна Морозова',
      avatar: images.avatar5,
      topic: 'Помощь с Kubernetes',
      content: 'Подскажите, как правильно настроить ingress для нескольких сервисов? Документацию читала, но не хватает практического примера.',
      type: 'help',
      status: 'open',
      createdAt: '3 часа назад',
      responses: 0,
      likes: 3,
      isNew: true,
      lastActivity: '3 часа назад',
    },
    {
      id: 6,
      author: 'Сергей Иванов',
      avatar: images.avatarFounder,
      topic: 'Ревью архитектуры микросервисов',
      content: 'Планирую разделить монолит на 3 сервиса. Подготовил схему — посмотрите, пожалуйста, не переусложнил ли?',
      type: 'review',
      status: 'answered',
      createdAt: '6 часов назад',
      responses: 4,
      likes: 6,
      lastActivity: '1 час назад',
    },
  ],
  unanswered: [
    {
      id: 7,
      author: 'Дмитрий Коваль',
      avatar: images.avatar1,
      topic: 'Помощь с Docker-контейнеризацией',
      content: 'Не получается настроить docker-compose для микросервиса. База не подключается при сборке. Кто-то сталкивался?',
      type: 'help',
      status: 'open',
      createdAt: '2 часа назад',
      responses: 0,
      likes: 2,
      isNew: true,
      lastActivity: '2 часа назад',
    },
  ],
  resolved: [
    {
      id: 8,
      author: 'Никита Орлов',
      avatar: images.team1,
      topic: 'Проблема с CORS в API',
      content: 'Не работают запросы с фронтенда на локальном хосте. Как правильно настроить CORS для development?',
      type: 'help',
      status: 'resolved',
      createdAt: '3 дня назад',
      responses: 5,
      likes: 12,
      lastActivity: '1 день назад',
    },
    {
      id: 9,
      author: 'Ольга Романова',
      avatar: images.team2,
      topic: 'Выбор ORM для Node.js',
      content: 'Сравниваю Prisma и TypeORM. Какой опыт у сообщества? Нужно для среднего проекта с ~20 таблицами.',
      type: 'question',
      status: 'resolved',
      createdAt: '5 дней назад',
      responses: 8,
      likes: 15,
      lastActivity: '2 дня назад',
    },
    {
      id: 10,
      author: 'Павел Миронов',
      avatar: images.team3,
      topic: 'Обратная связь: встреча по разборам',
      content: 'Отличный формат! Хотелось бы больше времени на разбор каждого проекта. Может, сделать более частые, но короткие сессии?',
      type: 'feedback',
      status: 'resolved',
      createdAt: '1 неделю назад',
      responses: 6,
      likes: 20,
      lastActivity: '3 дня назад',
    },
  ],
};

const typeConfig = {
  help: { icon: HandHeart, label: 'Помощь', color: TERRACOTTA, bg: TERRACOTTA_LIGHT },
  feedback: { icon: MessageSquareQuote, label: 'Обратная связь', color: SAGE, bg: SAGE_LIGHT },
  review: { icon: Star, label: 'Разбор', color: 'var(--gold)', bg: GOLD_GLOW },
  question: { icon: HelpCircle, label: 'Вопрос', color: 'var(--gold)', bg: GOLD_GLOW },
};

const statusConfig = {
  open: { label: 'Открыт', color: 'var(--gold)', bg: GOLD_GLOW },
  answered: { label: 'Есть ответ', color: SAGE, bg: SAGE_LIGHT },
  resolved: { label: 'Решён', color: SAGE, bg: SAGE_LIGHT },
  urgent: { label: 'Срочно', color: TERRACOTTA, bg: TERRACOTTA_LIGHT },
};

/* ===== COMPONENT ===== */
export default function LeaderConsoleRequests() {
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState<RequestFilterKey>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<RequestData | null>(null);
  const [showRequestDetail, setShowRequestDetail] = useState(false);
  const [showActionModal, setShowActionModal] = useState<'assign' | 'escalate' | 'close' | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'responses' | 'likes'>('newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  const currentRequests = requestsByFilter[activeFilter];
  const filteredRequests = currentRequests.filter(r =>
    searchQuery === '' ||
    r.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedRequests = [...filteredRequests].sort((a, b) => {
    if (sortBy === 'responses') return b.responses - a.responses;
    if (sortBy === 'likes') return b.likes - a.likes;
    return 0;
  });

  const handleOpenDetail = (request: RequestData) => {
    setSelectedRequest(request);
    setShowRequestDetail(true);
  };

  const handleAction = (action: 'assign' | 'escalate' | 'close') => {
    setShowActionModal(action);
  };

  const handleConfirmAction = () => {
    if (showActionModal === 'assign') {
      showToast('Запрос назначен на участника', 'success');
    } else if (showActionModal === 'escalate') {
      showToast('Запрос эскалирован — уведомление отправлено', 'warning');
    } else if (showActionModal === 'close') {
      showToast('Запрос закрыт', 'success');
    }
    setShowActionModal(null);
    setShowRequestDetail(false);
    setSelectedRequest(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>

          {/* ===== HEADER ===== */}
          <div className="px-6 md:px-8 pt-8 pb-6 section-fade-in">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Запросы</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Запросы
                </h1>
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  Запросы участников на помощь, разборы, обратную связь и ответы. Следите, чтобы никто не остался без внимания.
                </p>
              </div>
              <div className="hidden md:flex items-center gap-2">
                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: TERRACOTTA }}>1</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>без ответа</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== METRICS BAR ===== */}
          <div className="px-6 md:px-8 py-4 section-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Всего активных', value: 4, color: 'var(--gold)' },
                { label: 'Без ответа', value: 1, color: TERRACOTTA },
                { label: 'С ответом', value: 2, color: SAGE },
                { label: 'Срочных', value: 1, color: TERRACOTTA },
              ].map((m, i) => (
                <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <p className="text-lg font-bold" style={{ color: m.color }}>{m.value}</p>
                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{m.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== SEARCH + FILTERS ===== */}
          <div className="px-6 md:px-8 py-4 section-fade-in" style={{ animationDelay: '100ms' }}>
            {/* Search */}
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
                  <button onClick={() => setSearchQuery('')} style={{ color: 'var(--text-muted)' }}>
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {/* Sort dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium"
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}
                >
                  <Filter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{sortBy === 'newest' ? 'Сначала новые' : sortBy === 'responses' ? 'По ответам' : 'По лайкам'}</span>
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showSortDropdown && (
                  <div className="absolute right-0 top-12 w-44 rounded-xl py-1.5 z-50" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 8px 32px rgba(0,0,0,0.15)' }}>
                    {[
                      { key: 'newest' as const, label: 'Сначала новые' },
                      { key: 'responses' as const, label: 'По количеству ответов' },
                      { key: 'likes' as const, label: 'По лайкам' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => { setSortBy(s.key); setShowSortDropdown(false); }}
                        className="w-full text-left px-3 py-2 text-xs transition-colors"
                        style={{ color: sortBy === s.key ? 'var(--gold)' : 'var(--text-secondary)' }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-2">
              {requestFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`filter-pill ${activeFilter === f.key ? 'active' : ''}`}
                >
                  {f.label}
                  <span className="ml-1.5 text-[10px] opacity-60">{f.count}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== REQUESTS LIST ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '150ms' }}>
            {sortedRequests.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Запросов не найдено</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Попробуйте изменить фильтр или поисковый запрос</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sortedRequests.map((request) => {
                  const typeCfg = typeConfig[request.type];
                  const statusCfg = statusConfig[request.status];
                  const TypeIcon = typeCfg.icon;

                  return (
                    <div
                      key={request.id}
                      onClick={() => handleOpenDetail(request)}
                      className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                      style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        {/* Avatar */}
                        <img src={request.avatar} alt={request.author} className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5" style={{ border: '2px solid var(--border-color)' }} />

                        <div className="flex-1 min-w-0">
                          {/* Top row: type badge + status + time */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ backgroundColor: typeCfg.bg, color: typeCfg.color, border: `1px solid ${typeCfg.color}20` }}>
                              <TypeIcon className="w-3 h-3" />
                              {typeCfg.label}
                            </span>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ backgroundColor: statusCfg.bg, color: statusCfg.color }}>
                              {statusCfg.label}
                            </span>
                            {request.isNew && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ backgroundColor: GOLD_GLOW, color: 'var(--gold)' }}>
                                <Zap className="w-3 h-3" />
                                Новый
                              </span>
                            )}
                            {request.isUrgent && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ backgroundColor: TERRACOTTA_LIGHT, color: TERRACOTTA }}>
                                <AlertTriangle className="w-3 h-3" />
                                Срочно
                              </span>
                            )}
                          </div>

                          {/* Topic */}
                          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{request.topic}</h3>

                          {/* Content preview */}
                          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>{request.content}</p>

                          {/* Meta row */}
                          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{request.author}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {request.createdAt}
                            </span>
                            {request.responses > 0 && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1" style={{ color: request.responses > 0 ? SAGE : undefined }}>
                                  <MessageSquare className="w-3 h-3" />
                                  {request.responses} {request.responses === 1 ? 'ответ' : request.responses < 5 ? 'ответа' : 'ответов'}
                                </span>
                              </>
                            )}
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <HandHeart className="w-3 h-3" />
                              {request.likes}
                            </span>
                          </div>
                        </div>

                        {/* Arrow */}
                        <ChevronRight className="w-4 h-4 shrink-0 mt-1 hidden md:block" style={{ color: 'var(--text-muted)' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </main>

      {/* ===== SIDE PANEL: Request Detail ===== */}
      {showRequestDetail && selectedRequest && (
        <div className="slide-in-right fixed inset-y-0 right-0 w-full sm:w-[420px] lg:w-[380px] xl:w-[420px] z-50 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Детали запроса</h2>
            <button onClick={() => { setShowRequestDetail(false); setSelectedRequest(null); }} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Author + time */}
            <div className="flex items-center gap-3">
              <img src={selectedRequest.avatar} alt={selectedRequest.author} className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid var(--border-color)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedRequest.author}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{selectedRequest.createdAt}</p>
              </div>
            </div>

            {/* Type + status badges */}
            <div className="flex items-center gap-2 flex-wrap">
              {(() => {
                const tc = typeConfig[selectedRequest.type];
                const TIcon = tc.icon;
                return (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ backgroundColor: tc.bg, color: tc.color }}>
                    <TIcon className="w-3.5 h-3.5" />
                    {tc.label}
                  </span>
                );
              })()}
              {(() => {
                const sc = statusConfig[selectedRequest.status];
                return (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: sc.bg, color: sc.color }}>
                    {sc.label}
                  </span>
                );
              })()}
            </div>

            {/* Topic */}
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{selectedRequest.topic}</h3>

            {/* Content */}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedRequest.content}</p>

            {/* Stats */}
            <div className="flex items-center gap-4 py-3" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{selectedRequest.responses} ответов</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HandHeart className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{selectedRequest.likes} лайков</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{selectedRequest.lastActivity}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Действия</p>
              <button
                onClick={() => handleAction('assign')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
              >
                <Check className="w-4 h-4" />
                Назначить ответственного
              </button>
              <button
                onClick={() => handleAction('escalate')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                style={{ color: TERRACOTTA, border: `1px solid ${TERRACOTTA_BORDER}`, backgroundColor: TERRACOTTA_LIGHT }}
              >
                <Zap className="w-4 h-4" />
                Эскалировать
              </button>
              {selectedRequest.status !== 'resolved' && (
                <button
                  onClick={() => handleAction('close')}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                  style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                >
                  <Check className="w-4 h-4" />
                  Закрыть запрос
                </button>
              )}
            </div>

            {/* Hint */}
            <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: 'var(--gold)' }} />
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Если запрос требует экспертизы, которой нет в сообществе — эскалируйте. Лучше передать выше, чем оставить без ответа.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Actions ===== */}
      {showActionModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowActionModal(null)}>
          <div className="modal-enter rounded-2xl max-w-sm w-full p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {showActionModal === 'assign' ? 'Назначить ответственного' : showActionModal === 'escalate' ? 'Эскалировать запрос' : 'Закрыть запрос'}
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              {showActionModal === 'assign'
                ? 'Участник получит уведомление и сможет взять запрос в работу.'
                : showActionModal === 'escalate'
                  ? 'Запрос будет передан на уровень выше с пометкой "срочно". Все заинтересованные получат уведомление.'
                  : 'Запрос будет отмечен как решённый. Автор получит уведомление.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmAction}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: showActionModal === 'escalate' ? TERRACOTTA : 'var(--gold)', color: '#fff' }}
              >
                {showActionModal === 'assign' ? 'Назначить' : showActionModal === 'escalate' ? 'Эскалировать' : 'Закрыть'}
              </button>
              <button
                onClick={() => setShowActionModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RIGHT PANEL ===== */}
      <aside className="w-full lg:w-[240px] shrink-0 space-y-5 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar">

        {/* Quick Stats */}
        <div className="sidebar-section">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Статистика недели</h3>
          <div className="space-y-3">
            {[
              { label: 'Всего запросов', value: 18, change: '+3', positive: true },
              { label: 'Среднее время ответа', value: '4.2ч', change: '-0.8ч', positive: true },
              { label: 'Решено', value: 12, change: '+5', positive: true },
              { label: 'Без ответа > 24ч', value: 1, change: '-2', positive: true },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{stat.value}</span>
                  <span className="text-[10px] font-medium" style={{ color: stat.positive ? SAGE : TERRACOTTA }}>{stat.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="sidebar-section">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Рекомендации</h3>
          </div>
          <div className="space-y-3">
            <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
              <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Срочно: запрос без ответа</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Docker-контейнеризация — уже 2 часа без ответа. Назначьте эксперта.</p>
            </div>
            <div className="p-3 rounded-xl" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}` }}>
              <p className="text-xs font-medium mb-1" style={{ color: SAGE }}>Хорошая динамика</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Среднее время ответа сократилось на 16% по сравнению с прошлой неделей.</p>
            </div>
          </div>
        </div>

        {/* Top responders */}
        <div className="sidebar-section">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Топ отвечающих</h3>
          <div className="space-y-2.5">
            {[
              { name: 'Сергей Иванов', avatar: images.avatarFounder, count: 8 },
              { name: 'Анна Морозова', avatar: images.avatar5, count: 5 },
              { name: 'Мария Козлова', avatar: images.team4, count: 4 },
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" style={{ border: '1px solid var(--border-color)' }} />
                <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
                <span className="text-xs font-semibold" style={{ color: SAGE }}>{user.count}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
