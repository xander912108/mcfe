import { useState } from 'react';
import {
  ChevronRight, X, Link2, AlertTriangle, Info,
  Users, Map, GitMerge, BarChart3, Settings,
  Zap, Check, ArrowRight,
  MessageSquare, Shield, Sliders
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
type SectionKey = 'attention' | 'map' | 'connect' | 'insights' | 'settings';

/* ===== DATA: ATTENTION CARDS ===== */
const attentionCards = [
  {
    id: 1,
    title: '2 участника пока без живой связи',
    text: 'Они уже вошли в сообщество, но пока не получили отклик, опору или контакт с участником рядом.',
    primary: 'Показать участников',
    accent: 'terracotta' as const,
    why: 'Первая связь в первые сутки повышает вероятность, что человек почувствует себя частью сообщества.',
  },
  {
    id: 2,
    title: 'Один помощник близок к перегрузке',
    text: 'Анна помогает двум новичкам и взяла ещё один разбор. Лучше подобрать другого человека для следующего запроса.',
    primary: 'Посмотреть нагрузку',
    accent: 'terracotta' as const,
    why: 'Если помощник перегружается, качество помощи падает и человек может выгореть. Ротация сохраняет энергию активных участников.',
  },
  {
    id: 3,
    title: 'Есть хороший мост между двумя группами',
    text: 'Участники из backend и DevOps часто решают похожие задачи, но почти не пересекаются. Можно предложить мягкое знакомство через общий вопрос или разбор.',
    primary: 'Посмотреть рекомендацию',
    accent: 'gold' as const,
    why: 'Мосты между группами делают сообщество устойчивее. Без них каждая группа живёт изолированно и не получает пользы от общих ресурсов.',
  },
  {
    id: 4,
    title: 'Новичку можно предложить участника рядом',
    text: 'У Марии есть цель и первый шаг. Система нашла участника, который недавно проходил похожий путь.',
    primary: 'Открыть рекомендацию',
    accent: 'gold' as const,
    why: 'Участник рядом с похожим опытом помогает новичку не потеряться и нач двигаться. Это снижает нагрузку на лидера.',
  },
];

/* ===== DATA: MAP VIEW MODES ===== */
const mapModes = [
  { key: 'overview', label: 'Обзор' },
  { key: 'help', label: 'Помощь' },
  { key: 'bridges', label: 'Мосты' },
] as const;
type MapModeKey = typeof mapModes[number]['key'];

/* ===== DATA: CONNECTION PERIODS ===== */
const mapPeriods = [
  { key: '7d', label: '7 дней' },
  { key: '14d', label: '14 дней' },
  { key: '30d', label: '30 дней' },
  { key: '90d', label: '90 дней' },
] as const;

/* ===== DATA: CONNECTION TYPES ===== */
const connectionTypes = [
  { key: 'helped', label: 'помог', active: true },
  { key: 'reviewed', label: 'дал разбор', active: true },
  { key: 'flow', label: 'вместе в потоке', active: true },
  { key: 'mentored', label: 'наставничество', active: true },
  { key: 'thanked', label: 'благодарность', active: true },
  { key: 'connected', label: 'соединил людей', active: true },
  { key: 'interest', label: 'общий интерес', active: true },
];

/* ===== DATA: MAP NODES (participants) ===== */
interface MapNode {
  id: string;
  name: string;
  x: number;
  y: number;
  group: 'frontend' | 'backend' | 'devops' | 'ml' | 'newcomer';
  connections: number;
  label?: string;
}

const mapNodes: MapNode[] = [
  { id: 'a1', name: 'Анна М.', x: 20, y: 25, group: 'frontend', connections: 8, label: 'коннектор' },
  { id: 's1', name: 'Сергей И.', x: 50, y: 20, group: 'backend', connections: 12, label: 'коннектор' },
  { id: 'm1', name: 'Марина С.', x: 75, y: 30, group: 'backend', connections: 5 },
  { id: 'd1', name: 'Дмитрий К.', x: 30, y: 55, group: 'frontend', connections: 4 },
  { id: 'e1', name: 'Елена В.', x: 70, y: 60, group: 'ml', connections: 3 },
  { id: 'p1', name: 'Павел М.', x: 50, y: 70, group: 'devops', connections: 7, label: 'мост' },
  { id: 'mk', name: 'Мария К.', x: 15, y: 75, group: 'newcomer', connections: 0, label: 'нужна связь' },
  { id: 'o1', name: 'Ольга Р.', x: 85, y: 45, group: 'ml', connections: 2 },
  { id: 'a2', name: 'Алексей Н.', x: 45, y: 42, group: 'backend', connections: 6 },
  { id: 'n1', name: 'Никита О.', x: 80, y: 15, group: 'devops', connections: 4 },
];

/* ===== DATA: MAP LINKS ===== */
const mapLinks = [
  { from: 'a1', to: 'd1', strength: 3, type: 'helped' },
  { from: 's1', to: 'm1', strength: 2, type: 'mentored' },
  { from: 's1', to: 'a2', strength: 3, type: 'reviewed' },
  { from: 'p1', to: 'n1', strength: 2, type: 'flow' },
  { from: 'p1', to: 's1', strength: 1, type: 'helped' },
  { from: 'a1', to: 's1', strength: 2, type: 'connected' },
  { from: 'e1', to: 'o1', strength: 2, type: 'interest' },
  { from: 'mk', to: 'a1', strength: 0, type: 'interest' },
  { from: 'd1', to: 'a2', strength: 1, type: 'helped' },
  { from: 'p1', to: 'e1', strength: 1, type: 'thanked' },
];

const groupColors: Record<string, { fill: string; stroke: string }> = {
  frontend: { fill: 'rgba(201,112,106,0.12)', stroke: TERRACOTTA },
  backend: { fill: 'rgba(107,158,124,0.12)', stroke: SAGE },
  devops: { fill: 'rgba(201,169,110,0.12)', stroke: 'var(--gold)' },
  ml: { fill: 'rgba(150,130,180,0.12)', stroke: '#9682B4' },
  newcomer: { fill: 'rgba(180,180,180,0.08)', stroke: 'var(--text-muted)' },
};

/* ===== DATA: RECOMMENDATIONS ===== */
interface Recommendation {
  id: number;
  personA: { name: string; day: string; goal: string; firstStep: string };
  personB?: { name: string; topics: string; load: string; format: string };
  type: 'first_connection' | 'similar_path' | 'bridge' | 'rotate';
  status: 'recommendation' | 'waiting' | 'confirmed' | 'connected' | 'hidden';
  reason: string[];
}

const recommendations: Recommendation[] = [
  {
    id: 1,
    personA: { name: 'Мария Козлова', day: '2-й день', goal: 'frontend pet-проект', firstStep: 'собрать первый компонент' },
    personB: { name: 'Анна Морозова', topics: 'frontend, pet-проекты, первый разбор', load: 'комфортная', format: 'короткий отклик или мини-чат' },
    type: 'first_connection',
    status: 'recommendation',
    reason: [
      'Мария вошла 2 дня назад',
      'цель указана',
      'первый шаг выбран',
      'первой связи пока нет',
      'Анна помогала с похожими frontend-проектами',
      'нагрузка Анны комфортная',
    ],
  },
  {
    id: 2,
    personA: { name: 'Ольга Романова', day: '4-й день', goal: 'backend API на Go', firstStep: 'сделать первый endpoint' },
    personB: { name: 'Алексей Новиков', topics: 'Go, Docker, backend', load: 'комфортная', format: 'участник рядом' },
    type: 'similar_path',
    status: 'recommendation',
    reason: [
      'Ольга выбрала backend pet-проект на Go',
      'Алексей недавно проходил похожий путь',
      'общие темы: Go, Docker, API design',
      'нагрузка Алексея комфортная',
    ],
  },
  {
    id: 3,
    personA: { name: 'Группа backend', day: '', goal: '', firstStep: '' },
    type: 'bridge',
    status: 'recommendation',
    reason: [
      'backend-группа активно общается внутри себя',
      'DevOps-группа почти не пересекается с backend',
      'обе группы решают похожие задачи деплоя и архитектуры',
      'Павел М. может стать мостом между группами',
    ],
  },
  {
    id: 4,
    personA: { name: 'Анна Морозова', day: '', goal: '', firstStep: '' },
    type: 'rotate',
    status: 'recommendation',
    reason: [
      'Анна помогает 2 новичкам одновременно',
      'взяла ещё один разбор на этой неделе',
      'при новом запросе лучше предложить другого помощника',
      'Дмитрий К. готов взять участника на старт',
    ],
  },
];

/* ===== DATA: RECOMMENDATION FILTERS ===== */
const recFilters = [
  { key: 'all', label: 'Все', count: 5 },
  { key: 'first_connection', label: 'Нужна первая связь', count: 1 },
  { key: 'similar_path', label: 'Похожий путь', count: 1 },
  { key: 'bridge', label: 'Мост между группами', count: 1 },
  { key: 'rotate', label: 'Нагрузка помощников', count: 1 },
  { key: 'history', label: 'История', count: 0 },
] as const;
type RecFilterKey = typeof recFilters[number]['key'];

/* ===== DATA: INSIGHTS ===== */
const insightsMetrics = [
  { label: 'новичков получили первую связь', value: '74%', period: 'за последние 7 дней' },
  { label: 'помощи идёт от участников к участникам', value: '41%', period: '' },
  { label: 'подтверждённых опор', value: '12', period: 'людей согласились помочь' },
  { label: 'мостов между группами', value: '6', period: 'связи между разными кругами' },
  { label: 'помощника близки к перегрузке', value: '2', period: 'нужна ротация' },
];

const goodSignals = [
  { text: 'Участники чаще помогают друг другу без участия лидера', sub: 'Самоорганизация растёт' },
  { text: 'Новички быстрее получают первый живой контакт', sub: 'Среднее время сократилось до 18 часов' },
  { text: 'Появились мосты между разными треками', sub: 'Frontend и DevOps начали пересекаться' },
  { text: 'Помощь не держится только на одном человеке', sub: 'Активных помощников: 8' },
];

const improveAreas = [
  { text: 'Часть новичков всё ещё получает первую связь позже суток', sub: '3 из 10 новичков' },
  { text: 'Некоторые темы завязаны на одного помощника', sub: 'ML-разборы — только Елена' },
  { text: 'Между отдельными группами мало пересечений', sub: 'Backend и ML почти не пересекаются' },
  { text: 'Не все участники включают готовность помогать', sub: 'Только 34% отметили опцию' },
];

/* ===== COMPONENT ===== */
export default function LeaderConsoleConnections() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionKey>('attention');
  const [showWhyId, setShowWhyId] = useState<number | null>(null);

  /* Map state */
  const [mapMode, setMapMode] = useState<MapModeKey>('overview');
  const [mapPeriod, setMapPeriod] = useState('30d');
  const [selectedMapNode, setSelectedMapNode] = useState<MapNode | null>(null);
  const [selectedMapLink, setSelectedMapLink] = useState<{ from: MapNode; to: MapNode; strength: number; type: string } | null>(null);

  /* Recommendations state */
  const [recFilter, setRecFilter] = useState<RecFilterKey>('all');
  const [selectedRec, setSelectedRec] = useState<Recommendation | null>(null);
  const [showAskModal, setShowAskModal] = useState(false);
  const [askTitle, setAskTitle] = useState('');
  const [askBody, setAskBody] = useState('');

  /* Settings state */
  const [linkSources, setLinkSources] = useState<Record<string, boolean>>({
    answer: true, review: true, mentor: true, flow: true,
    thank: true, manual: true, interest: true,
  });
  const [privacy, setPrivacy] = useState({
    hideGoals: true, hideNoConnection: true, hideRatings: true,
    visibleOnly: true, hidePrivate: true,
  });
  const [recRules, setRecRules] = useState({
    noConn24h: true, hasQuestion: true, hasGoal: true,
    fewBridges: true, overload: true,
  });
  const [limits, setLimits] = useState({
    starter: 2, peer: 3, curator: 999, repeatDays: 3,
  });

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  /* Section nav cards data */
  const sectionCards = [
    { key: 'attention' as SectionKey, label: 'Ваше внимание', subtitle: '3 ситуации требуют реакции', icon: AlertTriangle },
    { key: 'map' as SectionKey, label: 'Карта связей', subtitle: 'Посмотреть социальную ткань', icon: Map },
    { key: 'connect' as SectionKey, label: 'Соединить людей', subtitle: '4 мягких рекомендации', icon: GitMerge },
    { key: 'insights' as SectionKey, label: 'Что получается', subtitle: 'Связи, опоры и взаимопомощь', icon: BarChart3 },
    { key: 'settings' as SectionKey, label: 'Настройки', subtitle: 'Приватность, правила и лимиты', icon: Settings },
  ];

  /* Helpers for map */
  const getNodeById = (id: string) => mapNodes.find(n => n.id === id);
  const getLinkOpacity = (strength: number) => {
    if (strength === 0) return 0.15;
    if (strength === 1) return 0.3;
    if (strength === 2) return 0.55;
    return 0.85;
  };
  const getLinkWidth = (strength: number) => {
    if (strength === 0) return 1;
    if (strength === 1) return 1.5;
    if (strength === 2) return 2.5;
    return 4;
  };

  /* Filtered recommendations */
  const filteredRecs = recFilter === 'all'
    ? recommendations.filter(r => r.status !== 'hidden')
    : recFilter === 'history'
      ? recommendations.filter(r => ['confirmed', 'connected', 'hidden'].includes(r.status))
      : recommendations.filter(r => r.type === recFilter && r.status === 'recommendation');

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0 space-y-6">

        {/* ===== HEADER BLOCK ===== */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 md:px-8 pt-8 pb-6">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Связи</span>
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Связи
            </h1>
            <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              Здесь видно, как участники связаны между собой: кто помогает, кто может стать опорой, где появляются мосты и кому сейчас важно не остаться одному.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Обновлено 5 минут назад</span>
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
                          if (card.id === 1 || card.id === 4) { setActiveSection('connect'); setRecFilter('first_connection'); }
                          if (card.id === 2) { setActiveSection('connect'); setRecFilter('rotate'); }
                          if (card.id === 3) { setActiveSection('connect'); setRecFilter('bridge'); }
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

        {/* ===== MAP SECTION ===== */}
        {activeSection === 'map' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Карта связей</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Спокойная визуализация социальной ткани: группы, связи, опоры, мосты.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-5">

              {/* View mode tabs */}
              <div className="flex flex-wrap gap-2">
                {mapModes.map((m) => (
                  <button
                    key={m.key}
                    onClick={() => setMapMode(m.key)}
                    className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                    style={{
                      border: `1px solid ${mapMode === m.key ? 'var(--gold)' : 'var(--border-color)'}`,
                      color: mapMode === m.key ? 'var(--gold)' : 'var(--text-muted)',
                      backgroundColor: mapMode === m.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                    }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {/* Period + type filters */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex gap-1.5">
                  {mapPeriods.map((p) => (
                    <button
                      key={p.key}
                      onClick={() => setMapPeriod(p.key)}
                      className="text-[11px] px-2.5 py-1 rounded-full transition-all"
                      style={{
                        backgroundColor: mapPeriod === p.key ? 'var(--hover-bg)' : 'transparent',
                        color: mapPeriod === p.key ? 'var(--text-primary)' : 'var(--text-muted)',
                        border: `1px solid ${mapPeriod === p.key ? 'var(--border-color)' : 'transparent'}`,
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
                <div className="h-4 w-px" style={{ backgroundColor: 'var(--border-color)' }} />
                <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Тип связи:</span>
                <div className="flex flex-wrap gap-1.5">
                  {connectionTypes.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => {}}
                      className="text-[10px] px-2 py-0.5 rounded-full transition-all"
                      style={{
                        backgroundColor: t.active ? 'var(--hover-bg)' : 'transparent',
                        color: t.active ? 'var(--text-secondary)' : 'var(--text-muted)',
                        border: `1px solid ${t.active ? 'var(--border-color)' : 'transparent'}`,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Network map visualization */}
              <div
                className="relative rounded-xl overflow-hidden cursor-crosshair"
                style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', height: 420 }}
                onClick={() => { setSelectedMapNode(null); setSelectedMapLink(null); }}
              >
                {/* SVG layer */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  {/* Links */}
                  {mapLinks.map((link, i) => {
                    const from = getNodeById(link.from);
                    const to = getNodeById(link.to);
                    if (!from || !to) return null;
                    const isHelpMode = mapMode === 'help' && link.type !== 'helped' && link.type !== 'mentored' && link.type !== 'reviewed';
                    const isBridgeMode = mapMode === 'bridges' && link.strength < 2;
                    if (isHelpMode || isBridgeMode) return null;
                    return (
                      <line
                        key={i}
                        x1={from.x} y1={from.y} x2={to.x} y2={to.y}
                        stroke={link.strength >= 3 ? 'var(--gold)' : link.strength >= 2 ? 'var(--text-secondary)' : 'var(--text-muted)'}
                        strokeWidth={getLinkWidth(link.strength)}
                        strokeOpacity={getLinkOpacity(link.strength)}
                        strokeLinecap="round"
                        className="transition-all duration-300"
                        onClick={(e) => { e.stopPropagation(); setSelectedMapLink({ from, to, strength: link.strength, type: link.type }); setSelectedMapNode(null); }}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                  {/* Nodes */}
                  {mapNodes.map((node) => {
                    const gc = groupColors[node.group];
                    const isNewcomer = node.group === 'newcomer';
                    const isSelected = selectedMapNode?.id === node.id;
                    return (
                      <g
                        key={node.id}
                        onClick={(e) => { e.stopPropagation(); setSelectedMapNode(node); setSelectedMapLink(null); }}
                        style={{ cursor: 'pointer' }}
                      >
                        <circle
                          cx={node.x} cy={node.y}
                          r={isSelected ? 5.5 : node.label === 'коннектор' ? 5 : node.label === 'мост' ? 4.5 : isNewcomer ? 3.5 : 4}
                          fill={gc.fill}
                          stroke={isSelected ? 'var(--gold)' : gc.stroke}
                          strokeWidth={isSelected ? 1.5 : 0.8}
                          className="transition-all duration-200"
                        />
                        {node.label === 'коннектор' && (
                          <circle cx={node.x} cy={node.y} r={2} fill={gc.stroke} opacity={0.6} />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Node labels */}
                {mapNodes.map((node) => (
                  <div
                    key={`label-${node.id}`}
                    className="absolute text-[10px] font-medium whitespace-nowrap pointer-events-none select-none"
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y + 4}%`,
                      transform: 'translateX(-50%)',
                      color: node.group === 'newcomer' ? 'var(--text-muted)' : 'var(--text-secondary)',
                    }}
                  >
                    {node.name}
                    {node.label && (
                      <span className="ml-1 text-[9px] px-1 py-0.5 rounded-full" style={{
                        backgroundColor: node.label === 'коннектор' ? 'rgba(212,175,55,0.12)' : node.label === 'мост' ? 'rgba(107,158,124,0.12)' : 'rgba(201,112,106,0.08)',
                        color: node.label === 'коннектор' ? 'var(--gold)' : node.label === 'мост' ? SAGE : TERRACOTTA,
                      }}>
                        {node.label}
                      </span>
                    )}
                  </div>
                ))}

                {/* Legend */}
                <div className="absolute bottom-3 left-3 flex flex-wrap gap-2">
                  {Object.entries(groupColors).map(([key, gc]) => (
                    <div key={key} className="flex items-center gap-1">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: gc.stroke, opacity: 0.6 }} />
                      <span className="text-[9px]" style={{ color: 'var(--text-muted)' }}>
                        {key === 'frontend' ? 'Frontend' : key === 'backend' ? 'Backend' : key === 'devops' ? 'DevOps' : key === 'ml' ? 'ML' : 'Новички'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Click hint */}
                {!selectedMapNode && !selectedMapLink && (
                  <div className="absolute top-3 right-3 text-[10px] px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                    Нажмите на участника или связь
                  </div>
                )}
              </div>

              {/* Selected node panel */}
              {selectedMapNode && (
                <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{selectedMapNode.name}</h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        {selectedMapNode.group === 'frontend' ? 'Frontend' : selectedMapNode.group === 'backend' ? 'Backend' : selectedMapNode.group === 'devops' ? 'DevOps' : selectedMapNode.group === 'ml' ? 'ML' : 'Новичок'}
                        {' · '}
                        {selectedMapNode.connections === 0 ? 'пока без связей' : `${selectedMapNode.connections} связей`}
                      </p>
                    </div>
                    <button onClick={() => setSelectedMapNode(null)} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
                  </div>

                  {selectedMapNode.connections === 0 ? (
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      Пока мало живых контактов. Есть цель и первый шаг, но первая связь ещё не появилась.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Связи</p>
                      {mapLinks
                        .filter(l => l.from === selectedMapNode!.id || l.to === selectedMapNode!.id)
                        .map((l, i) => {
                          const other = getNodeById(l.from === selectedMapNode!.id ? l.to : l.from);
                          return other ? (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <ArrowRight className="w-3 h-3" style={{ color: 'var(--text-muted)' }} />
                              <span style={{ color: 'var(--text-primary)' }}>{other.name}</span>
                              <span style={{ color: 'var(--text-muted)' }}>· {l.type === 'helped' ? 'помог' : l.type === 'mentored' ? 'наставник' : l.type === 'reviewed' ? 'разбор' : l.type === 'flow' ? 'в потоке' : l.type === 'interest' ? 'общий интерес' : 'соединил'}</span>
                            </div>
                          ) : null;
                        })}
                    </div>
                  )}

                  {selectedMapNode.label === 'нужна связь' && (
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => { setActiveSection('connect'); setRecFilter('first_connection'); }} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                        Предложить участника рядом
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Selected link panel */}
              {selectedMapLink && (
                <div className="rounded-xl p-5" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {selectedMapLink.from.name} → {selectedMapLink.to.name}
                      </h3>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Тип: {selectedMapLink.type === 'helped' ? 'помог' : selectedMapLink.type === 'mentored' ? 'наставничество' : selectedMapLink.type === 'reviewed' ? 'разбор' : selectedMapLink.type === 'flow' ? 'в потоке' : selectedMapLink.type === 'thanked' ? 'благодарность' : selectedMapLink.type === 'interest' ? 'общий интерес' : 'соединил людей'}
                        {' · Сила: '}
                        {selectedMapLink.strength >= 3 ? 'сильная' : selectedMapLink.strength >= 2 ? 'средняя' : selectedMapLink.strength >= 1 ? 'новая' : 'потенциальная'}
                      </p>
                    </div>
                    <button onClick={() => setSelectedMapLink(null)} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}


        {/* ===== CONNECT PEOPLE SECTION ===== */}
        {activeSection === 'connect' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Соединить людей</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Рабочая очередь рекомендаций: кого с кем можно бережно связать.</p>
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

              {/* Recommendations list */}
              {filteredRecs.length === 0 ? (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <Link2 className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас нет рекомендаций в этом срезе</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Когда появятся подходящие участники, рекомендации отобразятся здесь.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRecs.map((rec) => (
                    <div
                      key={rec.id}
                      onClick={() => setSelectedRec(selectedRec?.id === rec.id ? null : rec)}
                      className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                      style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                    >
                      {/* Preview */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0" style={{ backgroundColor: rec.type === 'first_connection' ? TERRACOTTA_LIGHT : rec.type === 'bridge' ? SAGE_LIGHT : GOLD_GLOW, border: `1px solid ${rec.type === 'first_connection' ? TERRACOTTA_BORDER : rec.type === 'bridge' ? SAGE_BORDER : 'rgba(212,175,55,0.15)'}` }}>
                          {rec.personA.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{rec.personA.name}</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: rec.type === 'first_connection' ? TERRACOTTA_LIGHT : rec.type === 'bridge' ? SAGE_LIGHT : GOLD_GLOW, color: rec.type === 'first_connection' ? TERRACOTTA : rec.type === 'bridge' ? SAGE : 'var(--gold)', border: `1px solid ${rec.type === 'first_connection' ? TERRACOTTA_BORDER : rec.type === 'bridge' ? SAGE_BORDER : 'rgba(212,175,55,0.2)'}` }}>
                              {rec.type === 'first_connection' ? 'нужна первая связь' : rec.type === 'similar_path' ? 'похожий путь' : rec.type === 'bridge' ? 'мост между группами' : 'нагрузка помощников'}
                            </span>
                            {rec.personA.day && <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{rec.personA.day}</span>}
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                            {rec.type === 'first_connection' && `У ${rec.personA.name.split(' ')[0]} есть цель и первый шаг, но пока нет живого контакта. ${rec.personB ? `${rec.personB.name} недавно помогала с похожим ${rec.personB.topics.split(',')[0]}-проектом.` : ''}`}
                            {rec.type === 'similar_path' && `${rec.personA.name.split(' ')[0]} выбрала ${rec.personA.goal}. ${rec.personB ? `${rec.personB.name} недавно проходил похожий путь.` : ''}`}
                            {rec.type === 'bridge' && 'Участники из backend и DevOps часто решают похожие задачи, но почти не пересекаются.'}
                            {rec.type === 'rotate' && `${rec.personA.name} помогает 2 новичкам и взяла ещё один разбор. Лучше подобрать другого человека.`}
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--text-muted)', transform: selectedRec?.id === rec.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {/* Expanded detail */}
                      {selectedRec?.id === rec.id && (
                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                          {/* Why this recommendation */}
                          <div className="mb-4">
                            <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Почему появилась рекомендация</p>
                            <ul className="space-y-1">
                              {rec.reason.map((r, i) => (
                                <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                                  <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
                                  {r}
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Who to ask */}
                          {rec.personB && (
                            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Кого можно спросить</p>
                              <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}`, color: SAGE }}>
                                  {rec.personB.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{rec.personB.name}</p>
                                  <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{rec.personB.topics}</p>
                                </div>
                              </div>
                              <div className="flex gap-3 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                                <span>Нагрузка: <span style={{ color: SAGE }}>{rec.personB.load}</span></span>
                                <span>·</span>
                                <span>Формат: {rec.personB.format}</span>
                              </div>
                            </div>
                          )}

                          {/* Bridge specific */}
                          {rec.type === 'bridge' && (
                            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}` }}>
                              <p className="text-sm font-medium mb-1" style={{ color: SAGE }}>Рекомендация: создать мягкий мост</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Предложить общий разбор или встречу, где участники из обеих групп смогут познакомиться через практическую задачу.</p>
                            </div>
                          )}

                          {/* Rotate specific */}
                          {rec.type === 'rotate' && (
                            <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                              <p className="text-sm font-medium mb-1" style={{ color: TERRACOTTA }}>Рекомендация: ротация помощников</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Дмитрий К. готов взять участника на старт. При следующем запросе предложите его вместо Анны.</p>
                            </div>
                          )}

                          {/* What next */}
                          <div className="mb-4">
                            <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что дальше</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                              Лучше сначала спросить {rec.personB ? rec.personB.name.split(' ')[0] : 'помощника'}, готова ли {rec.personB ? 'она' : 'он'} помочь. {rec.personA.name.split(' ')[0]} получит сообщение только после согласия.
                            </p>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-wrap gap-2">
                            {rec.personB && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setAskTitle(`Спросить ${rec.personB!.name.split(' ')[0]}, готова ли ${rec.personB!.name.split(' ')[0] === 'Анна' ? 'она' : 'он'} помочь ${rec.personA.name.split(' ')[0]}?`);
                                  setAskBody(`${rec.personB!.name.split(' ')[0]}, привет!\n\n${rec.personA.name.split(' ')[0]} недавно вошла в сообщество и хочет начать с ${rec.personA.goal || 'первого шага'}. У неё уже есть первый шаг, но пока нет живого контакта.\n\nВы недавно помогали участникам с похожими задачами. Если сейчас есть возможность, можно коротко поддержать ${rec.personA.name.split(' ')[0]}: ответить на первый вопрос или помочь сориентироваться.\n\nЕсли сейчас неудобно — можно спокойно отказаться. Это не повлияет на ваш вклад.`);
                                  setShowAskModal(true);
                                }}
                                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                                style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                              >
                                Спросить {rec.personB.name.split(' ')[0]}
                              </button>
                            )}
                            <button onClick={(e) => e.stopPropagation()} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                              Скрыть рекомендацию
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


        {/* ===== INSIGHTS SECTION ===== */}
        {activeSection === 'insights' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Что получается</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Спокойный обзор того, как развивается социальная ткань.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-6">

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {insightsMetrics.map((m, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <p className="text-xl font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: i === 4 ? TERRACOTTA : 'var(--text-primary)' }}>{m.value}</p>
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

              <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Как считаются связи</button>
            </div>
          </div>
        )}

        {/* ===== SETTINGS SECTION ===== */}
        {activeSection === 'settings' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Настройки</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Правила видимости, что считается связью, лимиты помощников и рекомендации.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-8">

              {/* Block 1: What counts as connection */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Link2 className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Что считается связью</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'answer', label: 'Ответ на запрос' },
                    { key: 'review', label: 'Разбор работы' },
                    { key: 'mentor', label: 'Наставник на старте' },
                    { key: 'flow', label: 'Участие в одном потоке' },
                    { key: 'thank', label: 'Благодарность' },
                    { key: 'manual', label: 'Ручное соединение людей' },
                    { key: 'interest', label: 'Общий интерес' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div
                        className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: linkSources[item.key] ? 'var(--gold)' : 'transparent',
                          borderColor: linkSources[item.key] ? 'var(--gold)' : 'var(--border-color)',
                        }}
                        onClick={() => setLinkSources(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                      >
                        {linkSources[item.key] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Общий интерес создаёт слабую потенциальную связь. Живой связью он станет только после действия: ответа, разбора, согласия помочь или взаимодействия.
                </p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 2: Privacy */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Приватность карты</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'hideGoals', label: 'Не показывать участникам чужие приватные цели' },
                    { key: 'hideNoConnection', label: 'Не показывать участникам, что кто-то «без связей»' },
                    { key: 'hideRatings', label: 'Не показывать публичные рейтинги связности' },
                    { key: 'visibleOnly', label: 'Показывать только те связи, где есть разрешённый уровень видимости' },
                    { key: 'hidePrivate', label: 'Скрывать приватные разборы и закрытые запросы' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div
                        className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: privacy[item.key as keyof typeof privacy] ? 'var(--gold)' : 'transparent',
                          borderColor: privacy[item.key as keyof typeof privacy] ? 'var(--gold)' : 'var(--border-color)',
                        }}
                        onClick={() => setPrivacy(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof privacy] }))}
                      >
                        {privacy[item.key as keyof typeof privacy] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Карта должна помогать найти опору, а не создавать ощущение наблюдения.
                </p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 3: Recommendation rules */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Sliders className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Рекомендации связей</h3>
                </div>
                <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>Когда система может предлагать связь:</p>
                <div className="space-y-2.5">
                  {[
                    { key: 'noConn24h', label: 'Новичок без первой связи больше 24 часов' },
                    { key: 'hasQuestion', label: 'Участник задал вопрос, и есть человек с похожим опытом' },
                    { key: 'hasGoal', label: 'Участник выбрал цель, которую уже проходили другие' },
                    { key: 'fewBridges', label: 'В группе мало мостов с другими участниками' },
                    { key: 'overload', label: 'Помощник перегружен, нужна ротация' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div
                        className="w-4 h-4 rounded border flex items-center justify-center transition-colors"
                        style={{
                          backgroundColor: recRules[item.key as keyof typeof recRules] ? 'var(--gold)' : 'transparent',
                          borderColor: recRules[item.key as keyof typeof recRules] ? 'var(--gold)' : 'var(--border-color)',
                        }}
                        onClick={() => setRecRules(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof recRules] }))}
                      >
                        {recRules[item.key as keyof typeof recRules] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 4: Load limits */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Лимиты нагрузки</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'starter', label: 'Помощник на старте', unit: 'новичков одновременно' },
                    { key: 'peer', label: 'Участник рядом', unit: 'активных контактов' },
                    { key: 'repeatDays', label: 'Повторное предложение помощи', unit: 'дней между предложениями' },
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setLimits(prev => ({ ...prev, [item.key]: Math.max(1, prev[item.key as keyof typeof limits] - 1) }))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                          style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                        >
                          -
                        </button>
                        <span className="text-sm font-medium w-8 text-center" style={{ color: 'var(--text-primary)' }}>
                          {limits[item.key as keyof typeof limits] === 999 ? '∞' : limits[item.key as keyof typeof limits]}
                        </span>
                        <button
                          onClick={() => setLimits(prev => ({ ...prev, [item.key]: prev[item.key as keyof typeof limits] === 999 ? 999 : prev[item.key as keyof typeof limits] + 1 }))}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                          style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-muted)' }}
                        >
                          +
                        </button>
                        <span className="text-[11px] ml-1" style={{ color: 'var(--text-muted)' }}>{item.unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] mt-4 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Лимиты нужны не для контроля, а чтобы не сжигать самых полезных людей.
                </p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 5: Message templates */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <MessageSquare className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Сообщения для предложений</h3>
                </div>
                <div className="space-y-2">
                  {[
                    'Спросить помощника',
                    'Предложить участника рядом',
                    'Создать мини-чат',
                    'Поблагодарить за помощь',
                    'Мягко отозвать предложение',
                  ].map((label, i) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{label}</span>
                      <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Редактировать</button>
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

        {/* Map: contextual advisor */}
        {activeSection === 'map' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Один круг почти не связан с остальным</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Участники frontend активно общаются внутри себя, но почти не пересекаются с backend. Можно создать мягкий мост.</p>
                <button onClick={() => setActiveSection('connect')} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Показать мост</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Что считается связью</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Ответы, разборы, благодарности, наставничество</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Приватность карты</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Что видит лидер и участник</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Connect: advisor with recommendation */}
        {activeSection === 'connect' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Сначала дайте связь новичку без контакта</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Мария уже выбрала первый шаг, но пока не получила живой отклик. Система нашла участника рядом.</p>
                <button onClick={() => setRecFilter('first_connection')} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: TERRACOTTA }}>Показать рекомендацию</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Лимиты помощников</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Как не перегружать тех, кто часто помогает</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Шаблоны предложений</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Для помощника, участника рядом, мини-чата</p>
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
            <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--gold)' }}>Общий интерес создаёт много рекомендаций</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Слабые совпадения целей попадают в рекомендации. Лучше оставить их как подсказку, но не считать живой связью.</p>
              <button className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Настроить правила</button>
            </div>
          </div>
        )}
      </aside>

      {/* ===== MODAL: Ask helper ===== */}
      {showAskModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowAskModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAskModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="shrink-0 px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold mb-1 heading-accent pr-8" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>{askTitle}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Помощник получит предложение. Участник ничего не получит, пока помощник не согласится.</p>
            </div>
            <div className="shrink-0 px-6 md:px-8" style={{ borderBottom: '1px solid var(--border-color)' }} />
            <div className="flex-1 overflow-y-auto modal-scroll px-6 md:px-8 py-4">
              <div className="mb-2">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что увидит помощник</p>
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Заголовок сообщения</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-3"
                  maxLength={120}
                  value={askTitle.split('?')[0].replace('Спросить ', '') + ', помоги новичку на старте'}
                  onChange={() => {}}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Сообщение</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  maxLength={1000}
                  value={askBody}
                  onChange={(e) => setAskBody(e.target.value)}
                  rows={8}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content', overflow: 'hidden' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{askBody.length} / 1000</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: 'var(--gold)' }}>Можно отредактировать перед отправкой.</p>
              </div>
              <div className="rounded-lg p-3 mb-2" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что произойдёт</p>
                <ul className="space-y-1">
                  {['Помощник получит предложение', 'Участник пока ничего не получит', 'Рекомендация перейдёт в статус «ждём подтверждение»', 'Если помощник согласится — система предложит создать мини-чат', 'Если откажется — можно выбрать другого участника'].map((t, i) => (
                    <li key={i} className="text-[11px] flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="shrink-0 px-6 md:px-8 py-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                <button onClick={() => { showToast('Предложение отправлено. Ждём, готова ли помощник помочь.', 'success'); setShowAskModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                  Отправить предложение
                </button>
                <button onClick={() => setShowAskModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                  Вернуться к рекомендации
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

