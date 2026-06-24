// Mock data for Social Fabric graph

export interface GraphNode {
  id: string;
  name: string;
  avatar: string;
  role: string | null;
  contributionLevel: number;
  status: 'active' | 'stuck' | 'inactive' | 'burnout_risk';
  isHelpReady: boolean;
  isOnline: boolean;
  goals: string[];
  competencies: string[];
  x?: number;
  y?: number;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'help' | 'review' | 'flow' | 'mentorship' | 'gratitude' | 'mutual';
  weight: number;
  lastInteraction: string;
}

export interface BridgeContext {
  targetId: string;       // к кому ведёт мост
  type: 'common_track' | 'common_step' | 'common_goal' | 'common_flow' | 'common_topic' | 'person_bridge';
  description: string;    // человеческое описание
  viaPersonId?: string;   // через кого (для person_bridge)
  viaPersonName?: string; // имя посредника
}

export const currentUser: GraphNode = {
  id: 'me',
  name: 'Анна К.',
  avatar: '',
  role: null,
  contributionLevel: 3,
  status: 'active',
  isHelpReady: true,
  isOnline: true,
  goals: ['Запуск продукта'],
  competencies: ['Дизайн', 'UX'],
};

// Leader view: community as center (not "me")
export const communityCenter: GraphNode = {
  id: 'community',
  name: 'Сообщество',
  avatar: '',
  role: null,
  contributionLevel: 0,
  status: 'active',
  isHelpReady: false,
  isOnline: true,
  goals: [],
  competencies: [],
};

export const participantNodes: GraphNode[] = [
  {
    id: 'p1',
    name: 'Петр И.',
    avatar: '',
    role: 'Помощник по практике',
    contributionLevel: 7,
    status: 'active',
    isHelpReady: true,
    isOnline: true,
    goals: ['Запуск продукта'],
    competencies: ['Реклама', 'Маркетинг'],
  },
  {
    id: 'p2',
    name: 'Мария С.',
    avatar: '',
    role: null,
    contributionLevel: 4,
    status: 'active',
    isHelpReady: false,
    isOnline: false,
    goals: ['Изучение языка'],
    competencies: ['Дизайн'],
  },
  {
    id: 'p3',
    name: 'Сергей В.',
    avatar: '',
    role: 'Помощник на старт',
    contributionLevel: 6,
    status: 'active',
    isHelpReady: true,
    isOnline: true,
    goals: ['Запуск продукта'],
    competencies: ['Разработка', 'Продукт'],
  },
  {
    id: 'p4',
    name: 'Ольга М.',
    avatar: '',
    role: null,
    contributionLevel: 2,
    status: 'stuck',
    isHelpReady: false,
    isOnline: false,
    goals: ['Дизайн интерфейсов'],
    competencies: ['Дизайн'],
  },
  {
    id: 'p5',
    name: 'Иван Д.',
    avatar: '',
    role: null,
    contributionLevel: 5,
    status: 'active',
    isHelpReady: true,
    isOnline: true,
    goals: ['Запуск продукта'],
    competencies: ['Продажи', 'Реклама'],
  },
  {
    id: 'p6',
    name: 'Елена П.',
    avatar: '',
    role: 'Хранитель знаний',
    contributionLevel: 8,
    status: 'active',
    isHelpReady: true,
    isOnline: false,
    goals: ['Обучение'],
    competencies: ['Менторство', 'Аналитика'],
  },
  {
    id: 'p7',
    name: 'Дмитрий Н.',
    avatar: '',
    role: null,
    contributionLevel: 3,
    status: 'active',
    isHelpReady: false,
    isOnline: true,
    goals: ['Продуктовая аналитика'],
    competencies: ['Аналитика'],
  },
  {
    id: 'p8',
    name: 'Татьяна Р.',
    avatar: '',
    role: null,
    contributionLevel: 2,
    status: 'inactive',
    isHelpReady: false,
    isOnline: false,
    goals: ['Дизайн'],
    competencies: ['Дизайн', 'Иллюстрация'],
  },
  {
    id: 'p13',
    name: 'Кирилл А.',
    avatar: '',
    role: null,
    contributionLevel: 4,
    status: 'active',
    isHelpReady: true,
    isOnline: false,
    goals: ['Продуктовая аналитика'],
    competencies: ['Аналитика', 'Продукт'],
  },
  {
    id: 'p14',
    name: 'София Л.',
    avatar: '',
    role: null,
    contributionLevel: 3,
    status: 'active',
    isHelpReady: true,
    isOnline: false,
    goals: ['Дизайн интерфейсов'],
    competencies: ['Дизайн', 'UX'],
  },
  // Extra strong ties to demonstrate adaptive ring expansion
  {
    id: 'p15',
    name: 'Андрей М.',
    avatar: '',
    role: 'Помощник по практике',
    contributionLevel: 8,
    status: 'active',
    isHelpReady: true,
    isOnline: true,
    goals: ['Запуск продукта'],
    competencies: ['Продукт', 'Маркетинг'],
  },
  {
    id: 'p16',
    name: 'Виктория К.',
    avatar: '',
    role: 'Хранитель знаний',
    contributionLevel: 7,
    status: 'active',
    isHelpReady: true,
    isOnline: false,
    goals: ['Обучение'],
    competencies: ['Менторство', 'Дизайн'],
  },
  {
    id: 'p17',
    name: 'Никита П.',
    avatar: '',
    role: 'Куратор',
    contributionLevel: 9,
    status: 'active',
    isHelpReady: true,
    isOnline: true,
    goals: ['Управление сообществом'],
    competencies: ['Менторство', 'Продукт'],
  },
  {
    id: 'p18',
    name: 'Галина С.',
    avatar: '',
    role: 'Помощник на старт',
    contributionLevel: 6,
    status: 'active',
    isHelpReady: true,
    isOnline: false,
    goals: ['Запуск продукта'],
    competencies: ['Реклама', 'Продажи'],
  },
];

// Bridges between participants (inter-participant connections visible in Network tab)
export const participantBridges: GraphEdge[] = [
  { source: 'p1', target: 'p3', type: 'mutual', weight: 6, lastInteraction: '2026-06-10' },
  { source: 'p1', target: 'p5', type: 'flow', weight: 7, lastInteraction: '2026-06-11' },
  { source: 'p3', target: 'p5', type: 'mutual', weight: 5, lastInteraction: '2026-06-09' },
  { source: 'p4', target: 'p6', type: 'mutual', weight: 4, lastInteraction: '2026-06-07' },
  { source: 'p7', target: 'p1', type: 'mutual', weight: 5, lastInteraction: '2026-06-06' },
  { source: 'p2', target: 'p5', type: 'flow', weight: 3, lastInteraction: '2026-06-05' },
];

export const participantEdges: GraphEdge[] = [
  { source: 'p1', target: 'me', type: 'help', weight: 8, lastInteraction: '2026-06-13' },
  { source: 'p1', target: 'me', type: 'review', weight: 6, lastInteraction: '2026-06-10' },
  { source: 'me', target: 'p2', type: 'help', weight: 5, lastInteraction: '2026-06-12' },
  { source: 'p3', target: 'me', type: 'mentorship', weight: 7, lastInteraction: '2026-06-14' },
  { source: 'me', target: 'p4', type: 'help', weight: 3, lastInteraction: '2026-06-08' },
  { source: 'p5', target: 'me', type: 'help', weight: 6, lastInteraction: '2026-06-11' },
  { source: 'me', target: 'p5', type: 'gratitude', weight: 4, lastInteraction: '2026-06-11' },
  { source: 'p6', target: 'me', type: 'help', weight: 5, lastInteraction: '2026-06-09' },
  { source: 'p1', target: 'p5', type: 'mutual', weight: 7, lastInteraction: '2026-06-13' },
  { source: 'p3', target: 'p6', type: 'flow', weight: 4, lastInteraction: '2026-06-07' },
  { source: 'p2', target: 'p7', type: 'flow', weight: 3, lastInteraction: '2026-06-05' },
  // p7 (Дмитрий Н.) — weight 2, Знакомые in Circles, solid in Мой мир
  { source: 'me', target: 'p7', type: 'help', weight: 2, lastInteraction: '2026-06-06' },
  // p8 (Татьяна Р.) — NO direct edge, Potential ring, dashed in Мой мир
  // { source: 'me', target: 'p8', ... }, // REMOVED → Potential
  { source: 'p13', target: 'p3', type: 'mutual', weight: 3, lastInteraction: '2026-05-15' },
  { source: 'p14', target: 'p2', type: 'flow', weight: 2, lastInteraction: '2026-05-10' },
  // Potential connections (weight 0): dashed in Мой мир, Potential ring in Circles
  { source: 'me', target: 'p8', type: 'flow', weight: 0, lastInteraction: '2026-05-20' },
  { source: 'me', target: 'p13', type: 'flow', weight: 0, lastInteraction: '2026-05-15' },
  { source: 'me', target: 'p14', type: 'flow', weight: 0, lastInteraction: '2026-05-10' },
  // p13 (Кирилл А.) and p14 (София Л.) — NO direct edges to 'me'
  // They appear in Potential ring via bridge contexts only
  // { source: 'me', target: 'p13', ... }, // REMOVED → Potential
  // { source: 'me', target: 'p14', ... }, // REMOVED → Potential
  // Strong ties for adaptive ring demo (ring 0 — Опоры)
  { source: 'p15', target: 'me', type: 'mentorship', weight: 8, lastInteraction: '2026-06-14' },
  { source: 'p16', target: 'me', type: 'help', weight: 7, lastInteraction: '2026-06-12' },
  { source: 'p17', target: 'me', type: 'mentorship', weight: 9, lastInteraction: '2026-06-15' },
  { source: 'p18', target: 'me', type: 'help', weight: 8, lastInteraction: '2026-06-13' },
];

// Bridge contexts — shared contexts that help create connections
// These appear in NodeCard as "How to approach" suggestions
export const bridgeContexts: BridgeContext[] = [
  // Only dashed edges (weight <= 2) get bridge contexts — "why create this connection"
  {
    targetId: 'p5',
    type: 'person_bridge',
    description: 'Через Петра И. — вы оба взаимодействовали с ним. Можно попросить познакомить.',
    viaPersonId: 'p3',
    viaPersonName: 'Пётр И.',
  },
  {
    targetId: 'p6',
    type: 'common_flow',
    description: 'Были в одном потоке по маркетингу. Хороший повод продолжить разговор.',
  },
  {
    targetId: 'p8',
    type: 'common_goal',
    description: 'Похожие цели в дизайне — можно обсудить подходы и инструменты.',
  },
  {
    targetId: 'p13',
    type: 'person_bridge',
    description: 'Через Сергея В. — вы оба знаете его. Можно попросить представить.',
    viaPersonId: 'p1',
    viaPersonName: 'Сергей В.',
  },
  {
    targetId: 'p14',
    type: 'common_topic',
    description: 'Общая тема «Дизайн» через Марию С. — можно начать разговор с этого.',
  },
  {
    targetId: 'p7',
    type: 'common_flow',
    description: 'Был в потоке по маркетингу — можно спросить про опыт или поделиться своим.',
  },
  {
    targetId: 'p14',
    type: 'common_topic',
    description: 'София тоже в дизайне — можно обсудить подходы и инструменты.',
  },
  {
    targetId: 'p13',
    type: 'common_track',
    description: 'Кирилл проходит трек по продуктовой аналитике — есть общая тема для разговора.',
  },
];

// Leader view: full community data
export const leaderNodes: GraphNode[] = [
  ...participantNodes,
  currentUser,
  {
    id: 'p9',
    name: 'Алексей К.',
    avatar: '',
    role: 'Куратор',
    contributionLevel: 9,
    status: 'active',
    isHelpReady: true,
    isOnline: true,
    goals: ['Управление сообществом'],
    competencies: ['Менторство', 'Продукт'],
  },
  {
    id: 'p10',
    name: 'Наталья Б.',
    avatar: '',
    role: null,
    contributionLevel: 1,
    status: 'stuck',
    isHelpReady: false,
    isOnline: false,
    goals: ['Запуск продукта'],
    competencies: [],
  },
  {
    id: 'p11',
    name: 'Константин Ш.',
    avatar: '',
    role: 'Связующий',
    contributionLevel: 7,
    status: 'active',
    isHelpReady: true,
    isOnline: true,
    goals: ['Нетворкинг'],
    competencies: ['Продажи', 'Реклама', 'Дизайн'],
  },
  {
    id: 'p12',
    name: 'Юлия В.',
    avatar: '',
    role: null,
    contributionLevel: 4,
    status: 'burnout_risk',
    isHelpReady: true,
    isOnline: true,
    goals: ['Обучение'],
    competencies: ['Аналитика', 'Продукт'],
  },
];

export const leaderEdges: GraphEdge[] = [
  ...participantEdges,
  { source: 'p9', target: 'me', type: 'mentorship', weight: 8, lastInteraction: '2026-06-14' },
  { source: 'p9', target: 'p1', type: 'mentorship', weight: 7, lastInteraction: '2026-06-13' },
  { source: 'p9', target: 'p3', type: 'mentorship', weight: 6, lastInteraction: '2026-06-12' },
  { source: 'p10', target: 'p9', type: 'help', weight: 2, lastInteraction: '2026-06-01' },
  { source: 'p11', target: 'p1', type: 'mutual', weight: 5, lastInteraction: '2026-06-11' },
  { source: 'p11', target: 'p6', type: 'mutual', weight: 6, lastInteraction: '2026-06-10' },
  { source: 'p11', target: 'p12', type: 'help', weight: 4, lastInteraction: '2026-06-09' },
  { source: 'p12', target: 'p7', type: 'help', weight: 5, lastInteraction: '2026-06-08' },
  { source: 'p12', target: 'p4', type: 'help', weight: 6, lastInteraction: '2026-06-07' },
  { source: 'p12', target: 'p2', type: 'review', weight: 4, lastInteraction: '2026-06-06' },
];

export const recommendations = [
  { id: 'p5', name: 'Иван Д.', reason: 'Проходит тот же трек «Запуск продукта»', action: 'Написать' },
  { id: 'p6', name: 'Елена П.', reason: 'Готова помочь с менторством и аналитикой', action: 'Попросить помощь' },
  { id: 'p3', name: 'Сергей В.', reason: 'Помощник на старт — может сопроводить', action: 'Связаться' },
];

// Network-tab recommendations: routed through connections
export const networkRecommendations = [
  { id: 'p5', name: 'Иван Д.', reason: 'Через Петра: общий трек «Запуск продукта»', action: 'Написать' },
  { id: 'p6', name: 'Елена П.', reason: 'Через тему: дизайн интерфейсов', action: 'Попросить помощь' },
  { id: 'p3', name: 'Сергей В.', reason: 'Через сопровождение: наставник на старт', action: 'Связаться' },
  { id: 'p7', name: 'Дмитрий Н.', reason: 'Через продуктовую аналитику: мост к Петру', action: 'Обменяться опытом' },
];

export const leaderSignals = [
  { type: 'isolation' as const, nodeId: 'p10', message: 'Наталья Б. — 7 дней без устойчивых связей', action: 'Подобрать наставника', desc: 'Участник вошёл в сообщество, но пока не получил живой опоры. Лучше мягко соединить с наставником или человеком с похожим шагом.' },
  { type: 'connector' as const, nodeId: 'p11', message: 'Константин Ш. — связывает 2 кластера', action: 'Предложить роль', desc: 'Участник помогает разным группам соприкасаться. Это важный носитель социальной ткани, которому можно предложить роль или признание.' },
  { type: 'overload' as const, nodeId: 'p12', message: 'Юлия В. — 6 активных запросов помощи', action: 'Предложить перерыв', desc: 'Участник много помогает другим, но может перегореть. Лучше предложить паузу, распределить запросы или подключить ещё одного помощника.' },
  { type: 'potential' as const, nodeId: 'p7', message: 'Дмитрий Н. — накопил вклад, без роли', action: 'Предложить роль', desc: 'Участник уже приносит пользу сообществу. Возможно, его пора признать, предложить роль или пригласить в круг помощников.' },
];

export const leaderMetrics = {
  density: 62,
  leaderDependency: 78,
  isolation: 1,
  decaying: 3,
  overload: 1,
  trend: { density: +5, leaderDependency: -3, isolation: 0, decaying: -2, overloaded: +1 },
};

// Direction: whether metric increase is 'good' or 'bad' for community health
export type MetricDirection = 'good' | 'bad' | 'neutral';

export const metricDirections: Record<string, MetricDirection> = {
  density: 'good',
  leaderDependency: 'bad',
  isolation: 'bad',
  decaying: 'bad',
  overload: 'bad',
  overloaded: 'bad',
};

// Metrics by period for Pulse topology
export const pulseMetricsByPeriod: Record<number, {
  density: number; leaderDependency: number; isolation: number; decaying: number; overload: number;
  trend: { density: number; leaderDependency: number; isolation: number; decaying: number; overloaded: number };
  changed: { label: string; color: 'emerald' | 'amber' | 'red' | 'slate' }[];
}> = {
  7: {
    density: 62, leaderDependency: 78, isolation: 1, decaying: 3, overload: 1,
    trend: { density: +5, leaderDependency: -3, isolation: 0, decaying: -2, overloaded: +1 },
    changed: [
      { label: '+6 новых связей', color: 'emerald' },
      { label: '+3 благодарности', color: 'emerald' },
      { label: '2 связи угасают', color: 'amber' },
      { label: '1 участнику нужна первая связь', color: 'red' },
    ],
  },
  30: {
    density: 58, leaderDependency: 82, isolation: 3, decaying: 8, overload: 2,
    trend: { density: +12, leaderDependency: -8, isolation: -1, decaying: -5, overloaded: +2 },
    changed: [
      { label: '+14 новых связей за месяц', color: 'emerald' },
      { label: 'Плотность растет (+12%)', color: 'emerald' },
      { label: '3 участника задержались на шаге', color: 'amber' },
      { label: '2 участникам нужна первая связь', color: 'red' },
      { label: 'Welcome Loop сработал 3 раза', color: 'emerald' },
    ],
  },
  90: {
    density: 55, leaderDependency: 85, isolation: 5, decaying: 15, overload: 3,
    trend: { density: +28, leaderDependency: -15, isolation: -3, decaying: -12, overloaded: +3 },
    changed: [
      { label: '+34 связи за квартал', color: 'emerald' },
      { label: 'Зависимость от лидера -15%', color: 'emerald' },
      { label: '6 помощников выросли в роли', color: 'emerald' },
      { label: '3 участника задержались на шаге', color: 'amber' },
      { label: '4 участникам нужна первая связь', color: 'red' },
      { label: 'Проведено 2 квартальных ритуала', color: 'emerald' },
    ],
  },
};
