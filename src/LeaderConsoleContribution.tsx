import { useState } from 'react';
import {
  ChevronRight, X, Info, Heart,
  Award, TrendingUp, HandHeart,
  Clock, Check, Search,
  MessageSquareQuote, Zap, UserPlus
} from 'lucide-react';
import { useToast } from './ToastContext';
import { images } from './assets/images';

/* ===== PREMIUM COLORS ===== */
const TERRACOTTA = '#C9706A';
const TERRACOTTA_LIGHT = 'rgba(201,112,106,0.08)';
const SAGE = '#6B9E7C';
const SAGE_LIGHT = 'rgba(107,158,124,0.08)';
const GOLD_GLOW = 'rgba(201,169,110,0.08)';

/* ===== DATA: CONTRIBUTIONS ===== */
const contributionFilters = [
  { key: 'recent', label: 'Недавние', count: 9 },
  { key: 'top', label: 'Топ вклад', count: 6 },
  { key: 'pending', label: 'Ожидают признания', count: 3 },
  { key: 'my', label: 'Мой вклад', count: 4 },
] as const;

type ContributionFilterKey = typeof contributionFilters[number]['key'];

interface ContributionData {
  id: number;
  author: string;
  avatar: string;
  role: string;
  type: 'help' | 'review' | 'insight' | 'mentor' | 'support';
  title: string;
  description: string;
  impact: number;
  recognized: boolean;
  recognizedBy?: string;
  createdAt: string;
  likes: number;
  responses: number;
}

const contributionsByFilter: Record<ContributionFilterKey, ContributionData[]> = {
  recent: [
    {
      id: 1,
      author: 'Сергей Иванов',
      avatar: images.avatarFounder,
      role: 'Tech Lead',
      type: 'review',
      title: 'Разбор архитектуры pet-проекта',
      description: 'Провёл детальный разбор архитектуры проекта на React для трёх участников. Дал рекомендации по структуре папок, выбору state-менеджера и организации API-слоя.',
      impact: 12,
      recognized: true,
      recognizedBy: 'Марина Соколова',
      createdAt: '2 часа назад',
      likes: 8,
      responses: 3,
    },
    {
      id: 2,
      author: 'Анна Морозова',
      avatar: images.avatar5,
      role: 'Frontend-разработчик',
      type: 'help',
      title: 'Помощь с TypeScript generics',
      description: 'Объяснила на примерах, как работают generics в TypeScript. Подготовила 4 практических примера и провела мини-сессию в голосовом чате.',
      impact: 8,
      recognized: true,
      recognizedBy: 'Дмитрий Коваль',
      createdAt: '5 часов назад',
      likes: 5,
      responses: 2,
    },
    {
      id: 3,
      author: 'Павел Миронов',
      avatar: images.avatar3,
      role: 'DevOps Engineer',
      type: 'insight',
      title: 'Инсайт: настройка CI/CD для монорепозитория',
      description: 'Опубликовал пошаговое руководство по настройке GitHub Actions для монорепозитория с несколькими пакетами. Включает примеры конфигов и типичные ошибки.',
      impact: 25,
      recognized: true,
      recognizedBy: '3 участника',
      createdAt: '1 день назад',
      likes: 18,
      responses: 7,
    },
    {
      id: 4,
      author: 'Марина Соколова',
      avatar: images.avatar2,
      role: 'Backend-разработчик',
      type: 'mentor',
      title: 'Менторинг новичка: первые шаги в Go',
      description: 'Провела 3 сессии с новичком, помогла разобраться с основами Go, настроить окружение и написать первый REST API сервис.',
      impact: 15,
      recognized: false,
      createdAt: '2 дня назад',
      likes: 6,
      responses: 1,
    },
    {
      id: 5,
      author: 'Елена Васильева',
      avatar: images.avatar4,
      role: 'ML Engineer',
      type: 'support',
      title: 'Поддержка в обсуждении ML-трека',
      description: 'Активно участвовала в обсуждении нового трека по машинному обучению. Предложила структуру модулей и поделилась полезными ресурсами.',
      impact: 10,
      recognized: true,
      recognizedBy: 'Сергей Иванов',
      createdAt: '3 дня назад',
      likes: 9,
      responses: 4,
    },
    {
      id: 6,
      author: 'Дмитрий Коваль',
      avatar: images.avatar1,
      role: 'Fullstack-разработчик',
      type: 'help',
      title: 'Помощь с Docker Compose',
      description: 'Помог 2 участникам настроить docker-compose для их проектов. Разобрал типичные ошибки и дал шаблоны конфигураций.',
      impact: 7,
      recognized: false,
      createdAt: '3 дня назад',
      likes: 4,
      responses: 2,
    },
    {
      id: 7,
      author: 'Алексей Новиков',
      avatar: images.team3,
      role: 'Backend-разработчик',
      type: 'review',
      title: 'Code review для 4 проектов',
      description: 'Провёл code review для проектов участников, оставил 15+ комментариев с конкретными рекомендациями по улучшению кода.',
      impact: 14,
      recognized: true,
      recognizedBy: '2 участника',
      createdAt: '4 дня назад',
      likes: 11,
      responses: 5,
    },
    {
      id: 8,
      author: 'Сергей Иванов',
      avatar: images.avatarFounder,
      role: 'Tech Lead',
      type: 'insight',
      title: 'Инсайт: выбор технологий для стартапа',
      description: 'Опубликовал разбор технологического стека для стартапа на ранней стадии. Сравнил 3 подхода с плюсами и минусами.',
      impact: 32,
      recognized: true,
      recognizedBy: '5 участников',
      createdAt: '5 дней назад',
      likes: 22,
      responses: 9,
    },
    {
      id: 9,
      author: 'Ольга Романова',
      avatar: images.team2,
      role: 'Junior Frontend',
      type: 'support',
      title: 'Помощь в организации встречи',
      description: 'Помогла организовать еженедельную встречу по разборам: подготовила повестку, пригласила участников, записала основные выводы.',
      impact: 6,
      recognized: false,
      createdAt: '6 дней назад',
      likes: 3,
      responses: 1,
    },
  ],
  top: [
    {
      id: 10,
      author: 'Сергей Иванов',
      avatar: images.avatarFounder,
      role: 'Tech Lead',
      type: 'insight',
      title: 'Инсайт: выбор технологий для стартапа',
      description: 'Опубликовал разбор технологического стека для стартапа на ранней стадии. Сравнил 3 подхода с плюсами и минусами.',
      impact: 32,
      recognized: true,
      recognizedBy: '5 участников',
      createdAt: '5 дней назад',
      likes: 22,
      responses: 9,
    },
    {
      id: 11,
      author: 'Павел Миронов',
      avatar: images.avatar3,
      role: 'DevOps Engineer',
      type: 'insight',
      title: 'Инсайт: настройка CI/CD для монорепозитория',
      description: 'Опубликовал пошаговое руководство по настройке GitHub Actions для монорепозитория.',
      impact: 25,
      recognized: true,
      recognizedBy: '3 участника',
      createdAt: '1 день назад',
      likes: 18,
      responses: 7,
    },
    {
      id: 12,
      author: 'Марина Соколова',
      avatar: images.avatar2,
      role: 'Backend-разработчик',
      type: 'mentor',
      title: 'Менторинг новичка: первые шаги в Go',
      description: 'Провела 3 сессии с новичком, помогла разобраться с основами Go.',
      impact: 15,
      recognized: false,
      createdAt: '2 дня назад',
      likes: 6,
      responses: 1,
    },
    {
      id: 13,
      author: 'Алексей Новиков',
      avatar: images.team3,
      role: 'Backend-разработчик',
      type: 'review',
      title: 'Code review для 4 проектов',
      description: 'Провёл code review для проектов участников.',
      impact: 14,
      recognized: true,
      recognizedBy: '2 участника',
      createdAt: '4 дня назад',
      likes: 11,
      responses: 5,
    },
    {
      id: 14,
      author: 'Елена Васильева',
      avatar: images.avatar4,
      role: 'ML Engineer',
      type: 'support',
      title: 'Поддержка в обсуждении ML-трека',
      description: 'Активно участвовала в обсуждении нового трека по ML.',
      impact: 10,
      recognized: true,
      recognizedBy: 'Сергей Иванов',
      createdAt: '3 дня назад',
      likes: 9,
      responses: 4,
    },
    {
      id: 15,
      author: 'Анна Морозова',
      avatar: images.avatar5,
      role: 'Frontend-разработчик',
      type: 'help',
      title: 'Помощь с TypeScript generics',
      description: 'Объяснила на примерах, как работают generics.',
      impact: 8,
      recognized: true,
      recognizedBy: 'Дмитрий Коваль',
      createdAt: '5 часов назад',
      likes: 5,
      responses: 2,
    },
  ],
  pending: [
    {
      id: 16,
      author: 'Марина Соколова',
      avatar: images.avatar2,
      role: 'Backend-разработчик',
      type: 'mentor',
      title: 'Менторинг новичка: первые шаги в Go',
      description: 'Провела 3 сессии с новичком, помогла разобраться с основами Go.',
      impact: 15,
      recognized: false,
      createdAt: '2 дня назад',
      likes: 6,
      responses: 1,
    },
    {
      id: 17,
      author: 'Дмитрий Коваль',
      avatar: images.avatar1,
      role: 'Fullstack-разработчик',
      type: 'help',
      title: 'Помощь с Docker Compose',
      description: 'Помог 2 участникам настроить docker-compose.',
      impact: 7,
      recognized: false,
      createdAt: '3 дня назад',
      likes: 4,
      responses: 2,
    },
    {
      id: 18,
      author: 'Ольга Романова',
      avatar: images.team2,
      role: 'Junior Frontend',
      type: 'support',
      title: 'Помощь в организации встречи',
      description: 'Помогла организовать еженедельную встречу по разборам.',
      impact: 6,
      recognized: false,
      createdAt: '6 дней назад',
      likes: 3,
      responses: 1,
    },
  ],
  my: [
    {
      id: 19,
      author: 'Александр Шилов',
      avatar: images.avatarFounder,
      role: 'Лидер сообщества',
      type: 'review',
      title: 'Разбор стратегии роста сообщества',
      description: 'Провёл разбор текущей стратегии роста и предложил 3 конкретных шага для увеличения вовлечённости.',
      impact: 20,
      recognized: true,
      createdAt: '1 день назад',
      likes: 12,
      responses: 5,
    },
    {
      id: 20,
      author: 'Александр Шилов',
      avatar: images.avatarFounder,
      role: 'Лидер сообщества',
      type: 'mentor',
      title: 'Менторинг 2 новичков',
      description: 'Провёл вводные сессии для новых участников, помог определить цели и первые шаги.',
      impact: 18,
      recognized: false,
      createdAt: '3 дня назад',
      likes: 7,
      responses: 2,
    },
    {
      id: 21,
      author: 'Александр Шилов',
      avatar: images.avatarFounder,
      role: 'Лидер сообщества',
      type: 'insight',
      title: 'Инсайт: структура обратной связи',
      description: 'Разработал шаблон структурированной обратной связи для разборов кода.',
      impact: 28,
      recognized: true,
      recognizedBy: '4 участника',
      createdAt: '1 неделю назад',
      likes: 19,
      responses: 8,
    },
    {
      id: 22,
      author: 'Александр Шилов',
      avatar: images.avatarFounder,
      role: 'Лидер сообщества',
      type: 'support',
      title: 'Модерация обсуждения по Backend',
      description: 'Модерировал жаркое обсуждение выбора фреймворка, помог найти компромисс.',
      impact: 14,
      recognized: true,
      recognizedBy: 'Сергей Иванов',
      createdAt: '2 недели назад',
      likes: 10,
      responses: 4,
    },
  ],
};

const typeConfig = {
  help: { icon: HandHeart, label: 'Помощь', color: SAGE, bg: SAGE_LIGHT },
  review: { icon: MessageSquareQuote, label: 'Разбор', color: 'var(--gold)', bg: GOLD_GLOW },
  insight: { icon: Zap, label: 'Инсайт', color: 'var(--gold)', bg: GOLD_GLOW },
  mentor: { icon: UserPlus, label: 'Менторинг', color: SAGE, bg: SAGE_LIGHT },
  support: { icon: Heart, label: 'Поддержка', color: SAGE, bg: SAGE_LIGHT },
};

/* ===== COMPONENT ===== */
export default function LeaderConsoleContribution() {
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState<ContributionFilterKey>('recent');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedContribution, setSelectedContribution] = useState<ContributionData | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [showRecognizeModal, setShowRecognizeModal] = useState(false);

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  const currentContributions = contributionsByFilter[activeFilter];
  const filteredContributions = currentContributions.filter(c =>
    searchQuery === '' ||
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.author.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDetail = (c: ContributionData) => {
    setSelectedContribution(c);
    setShowDetail(true);
  };

  const handleRecognize = () => {
    showToast('Вклад признан! Участник получит уведомление.', 'success');
    setShowRecognizeModal(false);
    setShowDetail(false);
    setSelectedContribution(null);
  };

  // Total stats
  const totalImpact = contributionsByFilter.recent.reduce((sum, c) => sum + c.impact, 0);
  const recognizedCount = contributionsByFilter.recent.filter(c => c.recognized).length;

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>

          {/* ===== HEADER ===== */}
          <div className="px-6 md:px-8 pt-8 pb-6 section-fade-in">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Вклад</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Вклад
                </h1>
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  Видимый след пользы, который участники оставляют в сообществе. Разборы, помощь, инсайты, менторинг — всё, что делает среду лучше.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== METRICS BAR ===== */}
          <div className="px-6 md:px-8 py-4 section-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Всего вкладов', value: 9, color: 'var(--gold)' },
                { label: 'Общий импакт', value: totalImpact, color: SAGE },
                { label: 'Признано', value: recognizedCount, color: SAGE },
                { label: 'Ожидает', value: 3, color: TERRACOTTA },
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
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Поиск по вкладам..."
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
            </div>

            <div className="flex flex-wrap gap-2">
              {contributionFilters.map((f) => (
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

          {/* ===== CONTRIBUTIONS LIST ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '150ms' }}>
            {filteredContributions.length === 0 ? (
              <div className="text-center py-12">
                <Heart className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Вкладов не найдено</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Попробуйте изменить фильтр или поисковый запрос</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredContributions.map((contrib) => {
                  const tc = typeConfig[contrib.type];
                  const TypeIcon = tc.icon;

                  return (
                    <div
                      key={contrib.id}
                      onClick={() => handleOpenDetail(contrib)}
                      className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                      style={{
                        border: '1px solid var(--border-color)',
                        backgroundColor: contrib.recognized ? 'var(--bg-card)' : TERRACOTTA_LIGHT,
                      }}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <img src={contrib.avatar} alt={contrib.author} className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5" style={{ border: '2px solid var(--border-color)' }} />

                        <div className="flex-1 min-w-0">
                          {/* Top row */}
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ backgroundColor: tc.bg, color: tc.color }}>
                              <TypeIcon className="w-3 h-3" />
                              {tc.label}
                            </span>
                            {!contrib.recognized && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                style={{ backgroundColor: TERRACOTTA_LIGHT, color: TERRACOTTA }}>
                                <Clock className="w-3 h-3" />
                                Ожидает признания
                              </span>
                            )}
                            {contrib.recognized && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                                style={{ backgroundColor: SAGE_LIGHT, color: SAGE }}>
                                <Check className="w-3 h-3" />
                                Признано
                              </span>
                            )}
                          </div>

                          {/* Title */}
                          <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{contrib.title}</h3>

                          {/* Description preview */}
                          <p className="text-xs leading-relaxed line-clamp-2 mb-3" style={{ color: 'var(--text-secondary)' }}>{contrib.description}</p>

                          {/* Meta */}
                          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{contrib.author}</span>
                            <span>·</span>
                            <span>{contrib.createdAt}</span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" style={{ color: 'var(--gold)' }} />
                              импакт {contrib.impact}
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Heart className="w-3 h-3" />
                              {contrib.likes}
                            </span>
                          </div>
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
      </main>

      {/* ===== SIDE PANEL: Detail ===== */}
      {showDetail && selectedContribution && (
        <div className="slide-in-right fixed inset-y-0 right-0 w-full sm:w-[420px] lg:w-[380px] xl:w-[420px] z-50 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Детали вклада</h2>
            <button onClick={() => { setShowDetail(false); setSelectedContribution(null); }} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Author */}
            <div className="flex items-center gap-3">
              <img src={selectedContribution.avatar} alt={selectedContribution.author} className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid var(--gold)' }} />
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedContribution.author}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{selectedContribution.role}</p>
              </div>
            </div>

            {/* Type + status */}
            <div className="flex items-center gap-2">
              {(() => {
                const tc = typeConfig[selectedContribution.type];
                const TIcon = tc.icon;
                return (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{ backgroundColor: tc.bg, color: tc.color }}>
                    <TIcon className="w-3.5 h-3.5" />
                    {tc.label}
                  </span>
                );
              })()}
              {selectedContribution.recognized ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                  style={{ backgroundColor: SAGE_LIGHT, color: SAGE }}>
                  <Check className="w-3.5 h-3.5" />
                  Признано {selectedContribution.recognizedBy && `· ${selectedContribution.recognizedBy}`}
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                  style={{ backgroundColor: TERRACOTTA_LIGHT, color: TERRACOTTA }}>
                  <Clock className="w-3.5 h-3.5" />
                  Ожидает признания
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{selectedContribution.title}</h3>

            {/* Description */}
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{selectedContribution.description}</p>

            {/* Impact */}
            <div className="p-4 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                <span className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>Импакт: {selectedContribution.impact}</span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                Это количество участников, которым принесла пользу данная активность.
              </p>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 py-3" style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-center gap-1.5">
                <Heart className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{selectedContribution.likes} лайков</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageSquareQuote className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{selectedContribution.responses} ответов</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{selectedContribution.createdAt}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Действия</p>
              {!selectedContribution.recognized && (
                <button
                  onClick={() => setShowRecognizeModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                >
                  <Award className="w-4 h-4" />
                  Признать вклад
                </button>
              )}
              <button
                onClick={() => showToast('Ссылка скопирована', 'success')}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
              >
                Поделиться
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Recognize ===== */}
      {showRecognizeModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowRecognizeModal(false)}>
          <div className="modal-enter rounded-2xl max-w-sm w-full p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: GOLD_GLOW }}>
                <Award className="w-5 h-5" style={{ color: 'var(--gold)' }} />
              </div>
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Признать вклад</h3>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{selectedContribution?.author}</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              Участник получит уведомление о признании его вклада. Это поощряет дальнейшую активность и укрепляет культуру благодарности.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleRecognize}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
              >
                Признать
              </button>
              <button
                onClick={() => setShowRecognizeModal(false)}
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

        {/* Weekly stats */}
        <div className="sidebar-section">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Недельная сводка</h3>
          <div className="space-y-3">
            {[
              { label: 'Новых вкладов', value: 9, change: '+4', positive: true },
              { label: 'Признано', value: 6, change: '+2', positive: true },
              { label: 'Средний импакт', value: '12.4', change: '+1.8', positive: true },
              { label: 'Активных авторов', value: 7, change: '+1', positive: true },
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

        {/* Top contributors */}
        <div className="sidebar-section">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Топ авторов</h3>
          <div className="space-y-3">
            {[
              { name: 'Сергей Иванов', avatar: images.avatarFounder, impact: 47 },
              { name: 'Павел Миронов', avatar: images.avatar3, impact: 25 },
              { name: 'Марина Соколова', avatar: images.avatar2, impact: 15 },
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <span className="text-xs font-bold w-4" style={{ color: 'var(--gold)' }}>#{i + 1}</span>
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" style={{ border: '1px solid var(--border-color)' }} />
                <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>{user.impact}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tip */}
        <div className="sidebar-section">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Совет</h3>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Признавайте вклад публично — это мотивирует других участников активнее помогать сообществу.
          </p>
        </div>
      </aside>
    </div>
  );
}
