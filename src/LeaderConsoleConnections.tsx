import { useState } from 'react';
import {
  ChevronRight, X, Info, Link2,
  MessageCircle,
  Clock, Check, Search,
  Mail, Pause
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

/* ===== DATA: CONNECTIONS ===== */
const connectionFilters = [
  { key: 'active', label: 'Активные', count: 6 },
  { key: 'my', label: 'Мои связи', count: 4 },
  { key: 'requests', label: 'Запросы на связь', count: 2 },
  { key: 'paused', label: 'На паузе', count: 1 },
] as const;

type ConnectionFilterKey = typeof connectionFilters[number]['key'];

interface ConnectionData {
  id: number;
  name: string;
  avatar: string;
  role: string;
  level: string;
  status: 'active' | 'pending' | 'paused' | 'new';
  connectedAt: string;
  lastContact: string;
  topics: string[];
  mutualConnections: number;
  message?: string;
  requestType?: 'incoming' | 'outgoing';
}

const connectionsByFilter: Record<ConnectionFilterKey, ConnectionData[]> = {
  active: [
    {
      id: 1,
      name: 'Анна Морозова',
      avatar: images.avatar5,
      role: 'Frontend-разработчик',
      level: 'Пламя',
      status: 'active',
      connectedAt: '2 недели назад',
      lastContact: '3 часа назад',
      topics: ['React', 'TypeScript', 'Обучение'],
      mutualConnections: 5,
    },
    {
      id: 2,
      name: 'Сергей Иванов',
      avatar: images.avatarFounder,
      role: 'Tech Lead',
      level: 'Созвездие',
      status: 'active',
      connectedAt: '1 месяц назад',
      lastContact: '1 день назад',
      topics: ['Архитектура', 'Менторство', 'DevOps'],
      mutualConnections: 8,
    },
    {
      id: 3,
      name: 'Марина Соколова',
      avatar: images.avatar2,
      role: 'Backend-разработчик',
      level: 'Искра',
      status: 'active',
      connectedAt: '3 недели назад',
      lastContact: '5 часов назад',
      topics: ['Go', 'PostgreSQL', 'API Design'],
      mutualConnections: 3,
    },
    {
      id: 4,
      name: 'Дмитрий Коваль',
      avatar: images.avatar1,
      role: 'Fullstack-разработчик',
      level: 'Пламя',
      status: 'active',
      connectedAt: '1 неделю назад',
      lastContact: '12 часов назад',
      topics: ['Docker', 'Node.js', 'React'],
      mutualConnections: 4,
    },
    {
      id: 5,
      name: 'Елена Васильева',
      avatar: images.avatar4,
      role: 'ML Engineer',
      level: 'Искра',
      status: 'active',
      connectedAt: '5 дней назад',
      lastContact: '1 день назад',
      topics: ['ML', 'Python', 'Data Science'],
      mutualConnections: 2,
    },
    {
      id: 6,
      name: 'Павел Миронов',
      avatar: images.avatar3,
      role: 'DevOps Engineer',
      level: 'Свет',
      status: 'active',
      connectedAt: '4 дня назад',
      lastContact: '2 дня назад',
      topics: ['Kubernetes', 'CI/CD', 'AWS'],
      mutualConnections: 6,
    },
  ],
  my: [
    {
      id: 7,
      name: 'Анна Морозова',
      avatar: images.avatar5,
      role: 'Frontend-разработчик',
      level: 'Пламя',
      status: 'active',
      connectedAt: '2 недели назад',
      lastContact: '3 часа назад',
      topics: ['React', 'TypeScript'],
      mutualConnections: 5,
    },
    {
      id: 8,
      name: 'Сергей Иванов',
      avatar: images.avatarFounder,
      role: 'Tech Lead',
      level: 'Созвездие',
      status: 'active',
      connectedAt: '1 месяц назад',
      lastContact: '1 день назад',
      topics: ['Архитектура', 'Менторство'],
      mutualConnections: 8,
    },
    {
      id: 9,
      name: 'Марина Соколова',
      avatar: images.avatar2,
      role: 'Backend-разработчик',
      level: 'Искра',
      status: 'active',
      connectedAt: '3 недели назад',
      lastContact: '5 часов назад',
      topics: ['Go', 'PostgreSQL'],
      mutualConnections: 3,
    },
    {
      id: 10,
      name: 'Павел Миронов',
      avatar: images.avatar3,
      role: 'DevOps Engineer',
      level: 'Свет',
      status: 'active',
      connectedAt: '4 дня назад',
      lastContact: '2 дня назад',
      topics: ['Kubernetes', 'CI/CD'],
      mutualConnections: 6,
    },
  ],
  requests: [
    {
      id: 11,
      name: 'Ольга Романова',
      avatar: images.team2,
      role: 'Junior Frontend',
      level: 'Заря',
      status: 'pending',
      connectedAt: '—',
      lastContact: '—',
      topics: ['JavaScript', 'React'],
      mutualConnections: 1,
      message: 'Привет! Хотел бы связаться для обмена опытом по React. Можешь помочь с несколькими вопросами?',
      requestType: 'incoming',
    },
    {
      id: 12,
      name: 'Алексей Новиков',
      avatar: images.team3,
      role: 'Backend-разработчик',
      level: 'Искра',
      status: 'pending',
      connectedAt: '—',
      lastContact: '—',
      topics: ['Go', 'Docker'],
      mutualConnections: 3,
      message: 'Здравствуйте! Видел ваш разбор по микросервисам. Хотел бы обсудить подход к проектированию API.',
      requestType: 'incoming',
    },
  ],
  paused: [
    {
      id: 13,
      name: 'Никита Орлов',
      avatar: images.team1,
      role: 'Mobile Developer',
      level: 'Пламя',
      status: 'paused',
      connectedAt: '2 месяца назад',
      lastContact: '2 недели назад',
      topics: ['React Native', 'iOS'],
      mutualConnections: 4,
    },
  ],
};

const statusConfig = {
  active: { label: 'Активна', color: SAGE, bg: SAGE_LIGHT },
  pending: { label: 'Ожидает', color: 'var(--gold)', bg: GOLD_GLOW },
  paused: { label: 'На паузе', color: 'var(--text-muted)', bg: 'var(--hover-bg)' },
  new: { label: 'Новая', color: 'var(--gold)', bg: GOLD_GLOW },
};

/* ===== COMPONENT ===== */
export default function LeaderConsoleConnections() {
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState<ConnectionFilterKey>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConnection, setSelectedConnection] = useState<ConnectionData | null>(null);
  const [showConnectionDetail, setShowConnectionDetail] = useState(false);
  const [showActionModal, setShowActionModal] = useState<'message' | 'pause' | 'remove' | null>(null);

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  const currentConnections = connectionsByFilter[activeFilter];
  const filteredConnections = currentConnections.filter(c =>
    searchQuery === '' ||
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleOpenDetail = (conn: ConnectionData) => {
    setSelectedConnection(conn);
    setShowConnectionDetail(true);
  };

  const handleConfirmAction = () => {
    if (showActionModal === 'message') {
      showToast('Сообщение отправлено', 'success');
    } else if (showActionModal === 'pause') {
      showToast('Связь поставлена на паузу', 'warning');
    } else if (showActionModal === 'remove') {
      showToast('Связь удалена', 'success');
    }
    setShowActionModal(null);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>

          {/* ===== HEADER ===== */}
          <div className="px-6 md:px-8 pt-8 pb-6 section-fade-in">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Связи</span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
                  Связи
                </h1>
                <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                  Управление связями участников: кто с кем общается, кто помогает, кто ждёт ответа. Следите за тем, чтобы никто не остался без связи.
                </p>
              </div>
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== METRICS BAR ===== */}
          <div className="px-6 md:px-8 py-4 section-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: 'Активных связей', value: 6, color: SAGE },
                { label: 'Запросов на связь', value: 2, color: 'var(--gold)' },
                { label: 'На паузе', value: 1, color: 'var(--text-muted)' },
                { label: 'Новых за неделю', value: 3, color: 'var(--gold)' },
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
                  placeholder="Поиск по связям..."
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
              {connectionFilters.map((f) => (
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

          {/* ===== CONNECTIONS LIST ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '150ms' }}>
            {filteredConnections.length === 0 ? (
              <div className="text-center py-12">
                <Link2 className="w-10 h-10 mx-auto mb-3" style={{ color: 'var(--text-muted)', opacity: 0.4 }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>Связей не найдено</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Попробуйте изменить фильтр или поисковый запрос</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredConnections.map((conn) => {
                  const stCfg = statusConfig[conn.status];

                  return (
                    <div
                      key={conn.id}
                      onClick={() => handleOpenDetail(conn)}
                      className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                      style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                    >
                      <div className="flex items-start gap-3 md:gap-4">
                        <img src={conn.avatar} alt={conn.name} className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: '2px solid var(--border-color)' }} />

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{conn.name}</h3>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                              style={{ backgroundColor: stCfg.bg, color: stCfg.color }}>
                              {stCfg.label}
                            </span>
                          </div>

                          <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{conn.role} · {conn.level}</p>

                          {/* Topics */}
                          <div className="flex items-center gap-1.5 flex-wrap mb-3">
                            {conn.topics.map((topic, i) => (
                              <span key={i} className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                                {topic}
                              </span>
                            ))}
                          </div>

                          {/* Meta */}
                          <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                            <span className="flex items-center gap-1">
                              <Link2 className="w-3 h-3" />
                              {conn.mutualConnections} общих
                            </span>
                            <span>·</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {conn.connectedAt !== '—' ? `с ${conn.connectedAt}` : '—'}
                            </span>
                            {conn.lastContact !== '—' && (
                              <>
                                <span>·</span>
                                <span className="flex items-center gap-1">
                                  <MessageCircle className="w-3 h-3" />
                                  {conn.lastContact}
                                </span>
                              </>
                            )}
                          </div>

                          {/* Request message if pending */}
                          {conn.message && (
                            <div className="mt-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{conn.message}"</p>
                            </div>
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
      </main>

      {/* ===== SIDE PANEL: Connection Detail ===== */}
      {showConnectionDetail && selectedConnection && (
        <div className="slide-in-right fixed inset-y-0 right-0 w-full sm:w-[420px] lg:w-[380px] xl:w-[420px] z-50 overflow-y-auto"
          style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-4px 0 24px rgba(0,0,0,0.1)' }}>
          <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4" style={{ backgroundColor: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)' }}>
            <h2 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Детали связи</h2>
            <button onClick={() => { setShowConnectionDetail(false); setSelectedConnection(null); }} className="p-1.5 rounded-lg transition-colors" style={{ color: 'var(--text-muted)' }}>
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 space-y-5">
            {/* Profile */}
            <div className="flex items-center gap-4">
              <img src={selectedConnection.avatar} alt={selectedConnection.name} className="w-14 h-14 rounded-full object-cover" style={{ border: '2px solid var(--gold)' }} />
              <div>
                <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{selectedConnection.name}</h3>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{selectedConnection.role}</p>
                <p className="text-[11px] mt-0.5" style={{ color: 'var(--gold)' }}>{selectedConnection.level}</p>
              </div>
            </div>

            {/* Status */}
            {(() => {
              const sc = statusConfig[selectedConnection.status];
              return (
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{ backgroundColor: sc.bg, color: sc.color }}>
                    {sc.label}
                  </span>
                </div>
              );
            })()}

            {/* Topics */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Темы</p>
              <div className="flex items-center gap-1.5 flex-wrap">
                {selectedConnection.topics.map((topic, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-full text-xs font-medium"
                    style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{selectedConnection.mutualConnections}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Общих связей</p>
              </div>
              <div className="p-3 rounded-xl text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{selectedConnection.lastContact}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Последний контакт</p>
              </div>
            </div>

            {/* Message if pending */}
            {selectedConnection.message && (
              <div className="p-4 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--gold)' }}>Сообщение</p>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>"{selectedConnection.message}"</p>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>Действия</p>
              {selectedConnection.status === 'pending' ? (
                <>
                  <button
                    onClick={() => { showToast('Запрос на связь принят', 'success'); setShowConnectionDetail(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: SAGE, color: '#fff' }}
                  >
                    <Check className="w-4 h-4" />
                    Принять запрос
                  </button>
                  <button
                    onClick={() => { showToast('Запрос отклонён', 'info'); setShowConnectionDetail(false); }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                    style={{ color: TERRACOTTA, border: `1px solid ${TERRACOTTA_BORDER}`, backgroundColor: TERRACOTTA_LIGHT }}
                  >
                    <X className="w-4 h-4" />
                    Отклонить
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setShowActionModal('message')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                    style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                  >
                    <Mail className="w-4 h-4" />
                    Написать сообщение
                  </button>
                  <button
                    onClick={() => setShowActionModal('pause')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                    style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}
                  >
                    <Pause className="w-4 h-4" />
                    Поставить на паузу
                  </button>
                  <button
                    onClick={() => setShowActionModal('remove')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-200 hover:opacity-80"
                    style={{ color: TERRACOTTA, border: `1px solid ${TERRACOTTA_BORDER}` }}
                  >
                    <X className="w-4 h-4" />
                    Удалить связь
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Actions ===== */}
      {showActionModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowActionModal(null)}>
          <div className="modal-enter rounded-2xl max-w-sm w-full p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {showActionModal === 'message' ? 'Отправить сообщение' : showActionModal === 'pause' ? 'Поставить на паузу' : 'Удалить связь'}
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              {showActionModal === 'message'
                ? 'Откроется чат для личной переписки с участником.'
                : showActionModal === 'pause'
                  ? 'Связь будет временно приостановлена. Вы сможете возобновить её в любой момент.'
                  : 'Связь будет удалена безвозвратно. Вы уверены?'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleConfirmAction}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: showActionModal === 'remove' ? TERRACOTTA : 'var(--gold)', color: '#fff' }}
              >
                {showActionModal === 'message' ? 'Открыть чат' : showActionModal === 'pause' ? 'Поставить на паузу' : 'Удалить'}
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

        {/* Network stats */}
        <div className="sidebar-section">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Сеть сообщества</h3>
          <div className="space-y-3">
            {[
              { label: 'Всего связей', value: 45 },
              { label: 'Активных', value: 32, color: SAGE },
              { label: 'Запросов на связь', value: 5, color: 'var(--gold)' },
              { label: 'На паузе', value: 3, color: 'var(--text-muted)' },
            ].map((stat, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{stat.label}</span>
                <span className="text-sm font-semibold" style={{ color: stat.color || 'var(--text-primary)' }}>{stat.value}</span>
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
          <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
            <p className="text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Связи укрепляют сообщество</p>
            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Участники с 3+ связями в 2.5 раза чаще остаются в сообществе дольше 6 месяцев.</p>
          </div>
        </div>

        {/* Top connectors */}
        <div className="sidebar-section">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Топ коннекторы</h3>
          <div className="space-y-2.5">
            {[
              { name: 'Сергей Иванов', avatar: images.avatarFounder, count: 12 },
              { name: 'Анна Морозова', avatar: images.avatar5, count: 9 },
              { name: 'Павел Миронов', avatar: images.avatar3, count: 7 },
            ].map((user, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" style={{ border: '1px solid var(--border-color)' }} />
                <span className="text-xs flex-1" style={{ color: 'var(--text-secondary)' }}>{user.name}</span>
                <span className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>{user.count}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
