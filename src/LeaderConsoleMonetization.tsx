import { useState } from 'react';
import {
  ChevronRight, X, AlertTriangle, Zap,
  Package, CreditCard, BarChart3, Settings,
  Check, ArrowRight, Info,
  Shield, Calendar, Users, FileText
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
type SectionKey = 'attention' | 'formats' | 'payments' | 'insights' | 'settings';

/* ===== DATA: ATTENTION CARDS ===== */
const attentionCards = [
  {
    id: 1,
    title: 'Оплата прошла, но доступ не открылся',
    text: 'У одного участника платёж подтверждён, но доступ к сообществу не создан автоматически.',
    primary: 'Проверить доступ',
    accent: 'terracotta' as const,
    why: 'Деньги и доступ — разные события. Платёж может пройти, но доступ должен быть создан отдельно. Участник уже заплатил и ждёт.',
  },
  {
    id: 2,
    title: '2 платежа не завершены после одобрения',
    text: 'Кандидаты получили ссылку на оплату, но пока не завершили вход. Можно отправить мягкое напоминание.',
    primary: 'Открыть платежи',
    accent: 'gold' as const,
    why: 'Не все кандидаты завершают оплату сразу. Мягкое напоминание помогает, но не давит.',
  },
  {
    id: 3,
    title: 'В разборе не указаны правила возврата',
    text: 'Формат уже доступен для покупки, но участник не видит, что происходит при отмене или переносе.',
    primary: 'Настроить формат',
    accent: 'gold' as const,
    why: 'Правила возврата до оплаты защищают и участника, и лидера. Без них спорные ситуации решаются сложнее.',
  },
  {
    id: 4,
    title: 'Есть спорный платёж',
    text: 'Банк или платёжный провайдер запросил проверку. Лучше ответить до истечения срока.',
    primary: 'Открыть спор',
    accent: 'terracotta' as const,
    why: 'Спорные платежи нужно закрывать быстро. Просроченный ответ может привести к автоматическому возврату.',
  },
];

/* ===== DATA: FORMATS ===== */
interface FormatData {
  id: number;
  name: string;
  type: 'трек' | 'поток' | 'сессия' | 'разбор';
  status: 'active' | 'draft' | 'check' | 'paused' | 'archived';
  price: string;
  access: string;
  sales30d: number;
  description: string;
  whatIncluded: string[];
  checks: { label: string; done: boolean }[];
}

const formatsData: FormatData[] = [
  {
    id: 1,
    name: 'Backend pet-проект за 4 недели',
    type: 'трек',
    status: 'active',
    price: '7 900 ₽',
    access: 'сразу после оплаты',
    sales30d: 12,
    description: 'Трек для самостоятельного прохождения backend pet-проекта.',
    whatIncluded: [
      'доступ к материалам',
      '4 недели шагов',
      'задания',
      'финальный разбор проекта',
      'доступ к обсуждению трека',
    ],
    checks: [
      { label: 'цена указана', done: true },
      { label: 'срок доступа указан', done: true },
      { label: 'что получает участник указано', done: true },
      { label: 'ответственный указан', done: true },
      { label: 'правила возврата заполнены', done: false },
    ],
  },
  {
    id: 2,
    name: 'Поток: Frontend portfolio sprint',
    type: 'поток',
    status: 'active',
    price: '12 900 ₽',
    access: 'в дату старта',
    sales30d: 8,
    description: 'Групповое прохождение трека с датой старта, дедлайнами и разборами.',
    whatIncluded: [
      'доступ к материалам потока',
      'групповые встречи',
      'разборы работ',
      'доступ к чату потока',
      'записи встреч',
    ],
    checks: [
      { label: 'цена указана', done: true },
      { label: 'дата старта указана', done: true },
      { label: 'что получает участник указано', done: true },
      { label: 'ответственный указан', done: true },
      { label: 'правила возврата заполнены', done: true },
    ],
  },
  {
    id: 3,
    name: '1:1 сессия по карьерному плану',
    type: 'сессия',
    status: 'check',
    price: '4 500 ₽',
    access: 'после ручной проверки',
    sales30d: 3,
    description: 'Индивидуальная встреча с экспертом по карьерному планированию.',
    whatIncluded: [
      '60-минутная сессия',
      'разбор текущей ситуации',
      'план следующих шагов',
      'запись встречи',
    ],
    checks: [
      { label: 'цена указана', done: true },
      { label: 'длительность указана', done: true },
      { label: 'что получает участник указано', done: true },
      { label: 'ответственный указан', done: false },
      { label: 'правила переноса заполнены', done: false },
    ],
  },
  {
    id: 4,
    name: 'Разбор pet-проекта',
    type: 'разбор',
    status: 'paused',
    price: '3 900 ₽',
    access: 'после загрузки работы',
    sales30d: 0,
    description: 'Обратная связь по pet-проекту: код, архитектура, деплой.',
    whatIncluded: [
      'разбор работы экспертом',
      'письменная обратная связь',
      'рекомендации по улучшению',
      'возможность уточнить вопросы',
    ],
    checks: [
      { label: 'цена указана', done: true },
      { label: 'что получает участник указано', done: true },
      { label: 'ответственный указан', done: true },
      { label: 'правила возврата заполнены', done: true },
    ],
  },
];

/* ===== DATA: FORMAT FILTERS ===== */
const formatFilters = [
  { key: 'all', label: 'Все', count: 4 },
  { key: 'active', label: 'Активные', count: 2 },
  { key: 'draft', label: 'Черновики', count: 0 },
  { key: 'check', label: 'Нужно проверить', count: 1 },
  { key: 'paused', label: 'Приостановлены', count: 1 },
  { key: 'archived', label: 'Архив', count: 0 },
] as const;
type FormatFilterKey = typeof formatFilters[number]['key'];

/* ===== DATA: PAYMENTS ===== */
interface PaymentData {
  id: number;
  person: string;
  status: 'passed' | 'pending' | 'failed' | 'no_access' | 'dispute' | 'refund';
  format: string;
  amount: string;
  provider: string;
  time: string;
}

const paymentsData: PaymentData[] = [
  { id: 1, person: 'Мария Козлова', status: 'no_access', format: 'Backend pet-проект за 4 недели', amount: '7 900 ₽', provider: 'ЮKassa', time: '12 минут назад' },
  { id: 2, person: 'Алексей Новиков', status: 'dispute', format: 'Поток: Frontend portfolio sprint', amount: '12 900 ₽', provider: 'ЮKassa', time: '1 день назад' },
  { id: 3, person: 'Ольга Романова', status: 'pending', format: 'Backend pet-проект за 4 недели', amount: '7 900 ₽', provider: 'ЮKassa', time: '2 дня назад' },
  { id: 4, person: 'Дмитрий Ковалёв', status: 'pending', format: '1:1 сессия по карьерному плану', amount: '4 500 ₽', provider: 'ЮKassa', time: '3 дня назад' },
  { id: 5, person: 'Елена Васильева', status: 'passed', format: 'Поток: Frontend portfolio sprint', amount: '12 900 ₽', provider: 'ЮKassa', time: '4 дня назад' },
  { id: 6, person: 'Павел Морозов', status: 'passed', format: 'Backend pet-проект за 4 недели', amount: '7 900 ₽', provider: 'ЮKassa', time: '5 дней назад' },
];

/* ===== DATA: PAYMENT FILTERS ===== */
const paymentFilters = [
  { key: 'all', label: 'Все актуальные', count: 6 },
  { key: 'passed', label: 'Прошли', count: 2 },
  { key: 'pending', label: 'Ждут оплаты', count: 2 },
  { key: 'failed', label: 'Не прошли', count: 0 },
  { key: 'no_access', label: 'Доступ не открылся', count: 1 },
  { key: 'dispute', label: 'Возвраты и споры', count: 1 },
  { key: 'history', label: 'История', count: 0 },
] as const;
type PaymentFilterKey = typeof paymentFilters[number]['key'];

/* ===== DATA: INSIGHTS ===== */
const insightsMetrics = [
  { label: 'выручки за 30 дней', value: '186 400 ₽', period: 'с учётом успешных платежей, без возвратов' },
  { label: 'выручки дают потоки', value: '64%', period: 'основной источник дохода' },
  { label: 'оплаты прошли успешно', value: '23', period: 'за последние 30 дней' },
  { label: 'оплаты не завершены', value: '3', period: 'после одобрения или покупки' },
  { label: 'доступ не открылся автоматически', value: '1', period: 'требует проверки' },
  { label: 'возврата оформлены', value: '2', period: 'за последние 30 дней' },
];

const goodSignals = [
  { text: 'После оплаты участники получают доступ быстрее', sub: 'Среднее время: 2 минуты' },
  { text: 'Платные форматы стали понятнее по обещанию результата', sub: 'Все активные форматы имеют описание' },
  { text: 'Разборы покупают не только новички', sub: '40% покупателей — активные участники' },
  { text: 'Большинство платежей завершается без ручной проверки', sub: '91% автоматически' },
];

const improveAreas = [
  { text: 'Часть кандидатов не завершает оплату после одобрения', sub: '3 из 10 кандидатов' },
  { text: 'В некоторых форматах не указаны правила возврата', sub: '1 из 4 форматов' },
  { text: 'Доступ после оплаты проверяется отдельно от статуса платежа', sub: '1 случай за 30 дней' },
  { text: 'У сессий важно заранее показывать правила переноса', sub: 'Не заполнено в 1 формате' },
];

/* ===== COMPONENT ===== */
export default function LeaderConsoleMonetization() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState<SectionKey>('attention');
  const [showWhyId, setShowWhyId] = useState<number | null>(null);

  /* Formats state */
  const [formatFilter, setFormatFilter] = useState<FormatFilterKey>('all');
  const [selectedFormat, setSelectedFormat] = useState<FormatData | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  /* Payments state */
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilterKey>('all');
  const [selectedPayment, setSelectedPayment] = useState<PaymentData | null>(null);
  const [showAccessModal, setShowAccessModal] = useState(false);

  /* Settings state */
  const [accessSettings, setAccessSettings] = useState({
    autoOpen: true, webhookConfirm: true, signalIfFail: true, notifyDelay: true,
  });
  const [entryMode, setEntryMode] = useState<'free' | 'paid' | 'manual'>('paid');
  const [entryPrice, setEntryPrice] = useState('7900');
  const [subsSettings, setSubsSettings] = useState({
    allow: true, remind: true, showFailed: true, closeAfterFail: true,
  });
  const [refundSettings, setRefundSettings] = useState({
    showRules: true, allowManual: true, closeAccess: true, saveReason: true,
  });

  /* Section nav cards */
  const sectionCards = [
    { key: 'attention' as SectionKey, label: 'Ваше внимание', subtitle: '3 ситуации требуют проверки', icon: AlertTriangle },
    { key: 'formats' as SectionKey, label: 'Платные форматы', subtitle: 'Треки, потоки, сессии, разборы', icon: Package },
    { key: 'payments' as SectionKey, label: 'Платежи и доступ', subtitle: 'Оплаты, доступы, возвраты', icon: CreditCard },
    { key: 'insights' as SectionKey, label: 'Что получается', subtitle: 'Выручка и устойчивость', icon: BarChart3 },
    { key: 'settings' as SectionKey, label: 'Настройки', subtitle: 'Оплата, доступ, возвраты', icon: Settings },
  ];

  /* Filtered formats */
  const filteredFormats = formatFilter === 'all'
    ? formatsData
    : formatsData.filter(f => f.status === formatFilter);

  /* Filtered payments */
  const filteredPayments = paymentFilter === 'all'
    ? paymentsData
    : paymentFilter === 'history'
      ? []
      : paymentsData.filter(p => p.status === paymentFilter);

  /* Helpers */
  const getStatusLabel = (status: string) => {
    const map: Record<string, string> = {
      passed: 'оплата прошла', pending: 'ждёт оплаты', failed: 'не прошла',
      no_access: 'доступ не открылся', dispute: 'спорный платёж', refund: 'возврат',
    };
    return map[status] || status;
  };
  const getStatusColor = (status: string) => {
    if (status === 'no_access' || status === 'dispute') return TERRACOTTA;
    if (status === 'passed') return SAGE;
    return 'var(--gold)';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0 space-y-6">

        {/* ===== HEADER BLOCK ===== */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 md:px-8 pt-8 pb-6">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Монетизация</span>
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Монетизация
            </h1>
            <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              Здесь видно, какие платные форматы работают, как проходят платежи и где нужно проверить открытие доступа после оплаты.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Обновлено 3 минуты назад</span>
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
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Ситуации, где сейчас нужна реакция.</p>
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
                          if (card.id === 1 || card.id === 2) { setActiveSection('payments'); setPaymentFilter(card.id === 1 ? 'no_access' : 'pending'); }
                          if (card.id === 3) { setActiveSection('formats'); setFormatFilter('check'); }
                          if (card.id === 4) { setActiveSection('payments'); setPaymentFilter('dispute'); }
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

        {/* ===== FORMATS SECTION ===== */}
        {activeSection === 'formats' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Платные форматы</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Что продаётся внутри сообщества: треки, потоки, сессии и разборы.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6">

              {/* Create button + filters */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex flex-wrap gap-2">
                  {formatFilters.map((f) => (
                    <button
                      key={f.key}
                      onClick={() => setFormatFilter(f.key)}
                      className="pill-link"
                      style={{
                        borderColor: formatFilter === f.key ? 'var(--gold)' : 'var(--border-color)',
                        color: formatFilter === f.key ? 'var(--gold)' : 'var(--text-muted)',
                        backgroundColor: formatFilter === f.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                      }}
                    >
                      <span>{f.label}</span>
                      <span className="text-[10px]" style={{ color: formatFilter === f.key ? 'var(--gold)' : 'var(--text-muted)' }}>{f.count}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all duration-200 hover:opacity-90"
                  style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
                >
                  + Создать формат
                </button>
              </div>

              {/* Formats list */}
              {filteredFormats.length === 0 ? (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <Package className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас нет форматов в этом срезе</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Создайте первый платный формат или измените фильтр.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredFormats.map((fmt) => (
                    <div
                      key={fmt.id}
                      onClick={() => setSelectedFormat(selectedFormat?.id === fmt.id ? null : fmt)}
                      className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                      style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                    >
                      {/* Preview */}
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0" style={{ backgroundColor: fmt.status === 'active' ? SAGE_LIGHT : fmt.status === 'check' ? TERRACOTTA_LIGHT : GOLD_GLOW, border: `1px solid ${fmt.status === 'active' ? SAGE_BORDER : fmt.status === 'check' ? TERRACOTTA_BORDER : 'rgba(201,169,110,0.15)'}`, color: fmt.status === 'active' ? SAGE : fmt.status === 'check' ? TERRACOTTA : 'var(--gold)' }}>
                          {fmt.type === 'трек' ? 'Т' : fmt.type === 'поток' ? 'П' : fmt.type === 'сессия' ? 'С' : 'Р'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{fmt.name}</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: fmt.status === 'active' ? SAGE_LIGHT : fmt.status === 'check' ? TERRACOTTA_LIGHT : GOLD_GLOW, color: fmt.status === 'active' ? SAGE : fmt.status === 'check' ? TERRACOTTA : 'var(--gold)', border: `1px solid ${fmt.status === 'active' ? SAGE_BORDER : fmt.status === 'check' ? TERRACOTTA_BORDER : 'rgba(201,169,110,0.2)'}` }}>
                              {fmt.type} · {fmt.status === 'active' ? 'активен' : fmt.status === 'draft' ? 'черновик' : fmt.status === 'check' ? 'нужна проверка' : fmt.status === 'paused' ? 'приостановлен' : 'архив'}
                            </span>
                          </div>
                          <div className="flex gap-3 text-[11px] mb-1.5">
                            <span style={{ color: 'var(--text-primary)' }}><span className="font-medium">{fmt.price}</span></span>
                            <span style={{ color: 'var(--text-muted)' }}>·</span>
                            <span style={{ color: 'var(--text-secondary)' }}>Доступ: {fmt.access}</span>
                            <span style={{ color: 'var(--text-muted)' }}>·</span>
                            <span style={{ color: 'var(--text-secondary)' }}>Продаж за 30 дней: {fmt.sales30d}</span>
                          </div>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{fmt.description}</p>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--text-muted)', transform: selectedFormat?.id === fmt.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {/* Expanded detail */}
                      {selectedFormat?.id === fmt.id && (
                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <div className="mb-4">
                            <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что получает участник</p>
                            <ul className="space-y-1">
                              {fmt.whatIncluded.map((item, i) => (
                                <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                                  <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color: SAGE }} />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="mb-4">
                            <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что важно проверить</p>
                            <div className="space-y-1.5">
                              {fmt.checks.map((c, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs">
                                  {c.done ? (
                                    <Check className="w-3.5 h-3.5 shrink-0" style={{ color: SAGE }} />
                                  ) : (
                                    <span className="w-3.5 h-3.5 rounded-full border shrink-0 flex items-center justify-center text-[8px]" style={{ borderColor: TERRACOTTA, color: TERRACOTTA }}>!</span>
                                  )}
                                  <span style={{ color: c.done ? 'var(--text-secondary)' : TERRACOTTA }}>{c.label}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2">
                            <button onClick={(e) => e.stopPropagation()} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                              Настроить формат
                            </button>
                            <button onClick={(e) => e.stopPropagation()} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                              Приостановить продажи
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); setActiveSection('payments'); }} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                              Посмотреть платежи
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

        {/* ===== PAYMENTS SECTION ===== */}
        {activeSection === 'payments' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Платежи и доступ</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Связка: платёж → статус → доступ → действие.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6">

              {/* Filter tabs */}
              <div className="flex flex-wrap gap-2 mb-5">
                {paymentFilters.map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setPaymentFilter(f.key)}
                    className="pill-link"
                    style={{
                      borderColor: paymentFilter === f.key ? 'var(--gold)' : 'var(--border-color)',
                      color: paymentFilter === f.key ? 'var(--gold)' : 'var(--text-muted)',
                      backgroundColor: paymentFilter === f.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                    }}
                  >
                    <span>{f.label}</span>
                    <span className="text-[10px]" style={{ color: paymentFilter === f.key ? 'var(--gold)' : 'var(--text-muted)' }}>{f.count}</span>
                  </button>
                ))}
              </div>

              {/* Payments list */}
              {filteredPayments.length === 0 ? (
                <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <CreditCard className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                  <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас нет платежей в этом срезе</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Когда появятся платежи, они отобразятся здесь.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredPayments.map((pay) => (
                    <div
                      key={pay.id}
                      onClick={() => setSelectedPayment(selectedPayment?.id === pay.id ? null : pay)}
                      className="hover-border-gold transition-all duration-200 rounded-xl p-4 md:p-5 cursor-pointer"
                      style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold shrink-0" style={{ backgroundColor: pay.status === 'passed' ? SAGE_LIGHT : pay.status === 'no_access' || pay.status === 'dispute' ? TERRACOTTA_LIGHT : GOLD_GLOW, border: `1px solid ${pay.status === 'passed' ? SAGE_BORDER : pay.status === 'no_access' || pay.status === 'dispute' ? TERRACOTTA_BORDER : 'rgba(201,169,110,0.15)'}`, color: getStatusColor(pay.status) }}>
                          {pay.person.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{pay.person}</h3>
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: pay.status === 'passed' ? SAGE_LIGHT : pay.status === 'no_access' || pay.status === 'dispute' ? TERRACOTTA_LIGHT : GOLD_GLOW, color: getStatusColor(pay.status), border: `1px solid ${pay.status === 'passed' ? SAGE_BORDER : pay.status === 'no_access' || pay.status === 'dispute' ? TERRACOTTA_BORDER : 'rgba(201,169,110,0.2)'}` }}>
                              {getStatusLabel(pay.status)}
                            </span>
                            <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{pay.time}</span>
                          </div>
                          <div className="flex gap-3 text-[11px]">
                            <span style={{ color: 'var(--text-primary)' }}><span className="font-medium">{pay.amount}</span></span>
                            <span style={{ color: 'var(--text-muted)' }}>·</span>
                            <span style={{ color: 'var(--text-secondary)' }}>{pay.format}</span>
                            <span style={{ color: 'var(--text-muted)' }}>·</span>
                            <span style={{ color: 'var(--text-muted)' }}>{pay.provider}</span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 shrink-0 mt-1" style={{ color: 'var(--text-muted)', transform: selectedPayment?.id === pay.id ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                      </div>

                      {selectedPayment?.id === pay.id && (
                        <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <p className="text-[11px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Платёж</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Сумма: <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{pay.amount}</span></p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Провайдер: {pay.provider}</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Время: {pay.time}</p>
                            </div>
                            <div>
                              <p className="text-[11px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Доступ</p>
                              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Формат: {pay.format}</p>
                              <p className="text-xs" style={{ color: pay.status === 'no_access' ? TERRACOTTA : 'var(--text-secondary)' }}>
                                Статус: {pay.status === 'no_access' ? 'не создан' : pay.status === 'passed' ? 'открыт' : 'в процессе'}
                              </p>
                            </div>
                          </div>

                          {pay.status === 'no_access' && (
                            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                              <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Что произошло</p>
                              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Платёж подтверждён провайдером, webhook получен, но доступ не создался автоматически. Участник получил сообщение о временной проверке.</p>
                            </div>
                          )}

                          {pay.status === 'dispute' && (
                            <div className="rounded-lg p-3 mb-4" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                              <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Спорный платёж</p>
                              <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Банк запросил подтверждение оказания услуги. Срок ответа: 2 дня. В системе: платёж прошёл, доступ открыт, участник заходил в материалы.</p>
                            </div>
                          )}

                          <div className="flex flex-wrap gap-2">
                            {pay.status === 'no_access' && (
                              <button onClick={(e) => { e.stopPropagation(); setShowAccessModal(true); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                                Открыть доступ вручную
                              </button>
                            )}
                            {pay.status === 'dispute' && (
                              <button onClick={(e) => e.stopPropagation()} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>
                                Ответить провайдеру
                              </button>
                            )}
                            <button onClick={(e) => e.stopPropagation()} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                              Написать участнику
                            </button>
                            <button onClick={(e) => e.stopPropagation()} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                              Передать в поддержку
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
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Спокойная финансовая картина без тревожной перегрузки.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-6">

              {/* Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {insightsMetrics.map((m, i) => (
                  <div key={i} className="rounded-xl p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <p className="text-xl font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: i === 3 ? TERRACOTTA : i === 4 ? TERRACOTTA : 'var(--text-primary)' }}>{m.value}</p>
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

              <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Как считаются показатели монетизации</button>
            </div>
          </div>
        )}

        {/* ===== SETTINGS SECTION ===== */}
        {activeSection === 'settings' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Настройки</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Правила оплаты и доступа: провайдер, автоматика, возвраты, сообщения.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-8">

              {/* Block 1: Payment provider */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Платёжный провайдер</h3>
                </div>
                <div className="rounded-lg p-4 mb-3" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}` }}>
                  <div className="flex items-center gap-2 mb-1">
                    <Check className="w-4 h-4" style={{ color: SAGE }} />
                    <span className="text-sm font-medium" style={{ color: SAGE }}>ЮKassa подключён</span>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Основной провайдер оплаты</p>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'card', label: 'Принимать оплату картой' },
                    { key: 'sbp', label: 'Принимать оплату через СБП' },
                    { key: 'webhook', label: 'Получать webhook после оплаты' },
                    { key: 'autoCheck', label: 'Автоматически проверять статус платежа' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: 'var(--gold)', borderColor: 'var(--gold)' }}><Check className="w-3 h-3" style={{ color: '#fff' }} /></div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Проверить подключение</button>
                  <span style={{ color: 'var(--text-muted)' }}>·</span>
                  <button className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Настройки ЮKassa</button>
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 2: Access after payment */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Доступ после оплаты</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'autoOpen', label: 'Открывать доступ автоматически после успешного платежа' },
                    { key: 'webhookConfirm', label: 'Создавать доступ только после подтверждённого webhook' },
                    { key: 'signalIfFail', label: 'Показывать сигнал, если платёж прошёл, но доступ не создан' },
                    { key: 'notifyDelay', label: 'Отправлять участнику сообщение при задержке доступа' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: accessSettings[item.key as keyof typeof accessSettings] ? 'var(--gold)' : 'transparent', borderColor: accessSettings[item.key as keyof typeof accessSettings] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setAccessSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof accessSettings] }))}>
                        {accessSettings[item.key as keyof typeof accessSettings] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
                <p className="text-[11px] mt-3 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Деньги и доступ — разные события. Платёж может пройти, но доступ должен быть создан отдельно.</p>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 3: Paid entry */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Платный вход в сообщество</h3>
                </div>
                <div className="flex gap-3 mb-4">
                  {(['free', 'paid', 'manual'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setEntryMode(mode)}
                      className="text-xs px-3 py-1.5 rounded-full transition-all"
                      style={{
                        backgroundColor: entryMode === mode ? 'rgba(212,175,55,0.08)' : 'transparent',
                        color: entryMode === mode ? 'var(--gold)' : 'var(--text-muted)',
                        border: `1px solid ${entryMode === mode ? 'var(--gold)' : 'var(--border-color)'}`,
                      }}
                    >
                      {mode === 'free' ? 'Бесплатный' : mode === 'paid' ? 'Платный' : 'Ручное открытие'}
                    </button>
                  ))}
                </div>
                {entryMode === 'paid' && (
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Цена входа:</span>
                    <input
                      type="text"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                      className="px-3 py-1.5 rounded-lg text-sm w-24"
                      style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                    <span className="text-sm" style={{ color: 'var(--text-muted)' }}>₽</span>
                  </div>
                )}
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 4: Subscriptions */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Подписки</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'allow', label: 'Разрешить подписку на сообщество' },
                    { key: 'remind', label: 'Напоминать перед списанием' },
                    { key: 'showFailed', label: 'Показывать лидеру неуспешные списания' },
                    { key: 'closeAfterFail', label: 'Закрывать доступ после нескольких неуспешных попыток' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: subsSettings[item.key as keyof typeof subsSettings] ? 'var(--gold)' : 'transparent', borderColor: subsSettings[item.key as keyof typeof subsSettings] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setSubsSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof subsSettings] }))}>
                        {subsSettings[item.key as keyof typeof subsSettings] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 5: Refunds */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <ArrowRight className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Возвраты</h3>
                </div>
                <div className="space-y-2.5">
                  {[
                    { key: 'showRules', label: 'Показывать правила возврата до оплаты' },
                    { key: 'allowManual', label: 'Разрешить ручной возврат' },
                    { key: 'closeAccess', label: 'Закрывать доступ после возврата' },
                    { key: 'saveReason', label: 'Сохранять причину возврата во внутренней истории' },
                  ].map((item) => (
                    <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                      <div className="w-4 h-4 rounded border flex items-center justify-center transition-colors" style={{ backgroundColor: refundSettings[item.key as keyof typeof refundSettings] ? 'var(--gold)' : 'transparent', borderColor: refundSettings[item.key as keyof typeof refundSettings] ? 'var(--gold)' : 'var(--border-color)' }} onClick={() => setRefundSettings(prev => ({ ...prev, [item.key]: !prev[item.key as keyof typeof refundSettings] }))}>
                        {refundSettings[item.key as keyof typeof refundSettings] && <Check className="w-3 h-3" style={{ color: '#fff' }} />}
                      </div>
                      <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="px-6 md:px-8"><GradientDivider /></div>

              {/* Block 6: Messages */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Сообщения</h3>
                </div>
                <div className="space-y-2">
                  {[
                    'После одобрения',
                    'После успешной оплаты',
                    'Доступ открыт',
                    'Доступ временно проверяется',
                    'Напоминание об оплате',
                    'Возврат оформлен',
                    'Доступ закрыт после возврата',
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

        {/* Formats: advisor */}
        {activeSection === 'formats' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Перед продажей уточните правила возврата</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Один активный формат уже продаётся, но участник не видит, что происходит при отмене или переносе.</p>
                <button onClick={() => { setFormatFilter('check'); setSelectedFormat(formatsData.find(f => f.id === 3) || null); }} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: TERRACOTTA }}>Открыть формат</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Шаблон платного формата</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Результат, срок, доступ, возврат</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Правила возврата</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Как объяснить до оплаты</p>
                </button>
              </div>
            </div>
          </>
        )}

        {/* Payments: advisor */}
        {activeSection === 'payments' && (
          <>
            <div className="sidebar-section">
              <div className="flex items-center gap-2 mb-3">
                <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Советник</h3>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Сначала проверьте доступ после оплаты</p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Один платёж прошёл, но доступ не открылся автоматически. Это важнее, чем неуспешные оплаты: участник уже заплатил.</p>
                <button onClick={() => setPaymentFilter('no_access')} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: TERRACOTTA }}>Показать платёж</button>
              </div>
            </div>
            <div className="sidebar-section">
              <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Может пригодиться</h3>
              <div className="space-y-2">
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>Оплата и открытие доступа</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Что происходит после одобрения</p>
                </button>
                <button className="text-left w-full text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)' }}>
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>История платежей</span>
                  <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>Webhook, возврат, ручное открытие</p>
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
              <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Доступ открывается без проверки webhook</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Лучше открывать доступ только после подтверждённого события оплаты, чтобы не выдавать доступ при незавершённом платеже.</p>
              <button className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: TERRACOTTA }}>Настроить доступ</button>
            </div>
          </div>
        )}
      </aside>

      {/* ===== MODAL: Create Format ===== */}
      {showCreateModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowCreateModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowCreateModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
            <div className="shrink-0 px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold mb-1 heading-accent pr-8" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Создать платный формат</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Выберите, что участник сможет купить. Сначала создаётся черновик, опубликовать можно после проверки.</p>
            </div>
            <div className="shrink-0 px-6 md:px-8" style={{ borderBottom: '1px solid var(--border-color)' }} />
            <div className="flex-1 overflow-y-auto modal-scroll px-6 md:px-8 py-4">
              <div className="space-y-3 mb-2">
                {[
                  { type: 'Трек', desc: 'Пошаговая программа для самостоятельного прохождения' },
                  { type: 'Поток', desc: 'Групповое прохождение трека с датой старта' },
                  { type: 'Сессия', desc: 'Встреча, консультация или работа 1:1 / в малой группе' },
                  { type: 'Разбор', desc: 'Обратная связь по работе, проекту, коду, портфолио' },
                ].map((f) => (
                  <div key={f.type} className="flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all hover:translate-y-[-1px]" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: GOLD_GLOW, color: 'var(--gold)' }}>{f.type.charAt(0)}</div>
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{f.type}</p>
                      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="shrink-0 px-6 md:px-8 py-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => { showToast('Черновик платного формата создан.', 'success'); setShowCreateModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                Создать черновик
              </button>
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                Вернуться к форматам
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL: Open Access Manually ===== */}
      {showAccessModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowAccessModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowAccessModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
            <div className="shrink-0 px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold mb-1 heading-accent pr-8" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Открыть доступ вручную?</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Платёж прошёл, но доступ не открылся автоматически. Перед ручным открытием проверьте, что оплата подтверждена.</p>
            </div>
            <div className="shrink-0 px-6 md:px-8" style={{ borderBottom: '1px solid var(--border-color)' }} />
            <div className="flex-1 overflow-y-auto modal-scroll px-6 md:px-8 py-4">
              <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Проверка</p>
                <div className="space-y-1.5">
                  {[
                    { label: 'Платёж подтверждён', done: true },
                    { label: 'Сумма совпадает', done: true },
                    { label: 'Формат активен', done: true },
                    { label: 'Доступ ещё не создан', done: false },
                  ].map((c, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {c.done ? <Check className="w-3.5 h-3.5 shrink-0" style={{ color: SAGE }} /> : <span className="w-3.5 h-3.5 rounded-full border shrink-0" style={{ borderColor: 'var(--text-muted)' }} />}
                      <span style={{ color: c.done ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{c.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-lg p-3 mb-2" style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}>
                <p className="text-[11px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что произойдёт</p>
                <ul className="space-y-1">
                  {['Участнику откроется доступ к формату', 'В истории появится ручное открытие доступа', 'Участник получит уведомление «Доступ открыт»', 'Ситуация уйдёт из списка «Доступ не открылся»'].map((t, i) => (
                    <li key={i} className="text-[11px] flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <div className="shrink-0 px-6 md:px-8 py-4 flex flex-wrap gap-2" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => { showToast('Доступ открыт вручную. Участник получил уведомление.', 'success'); setShowAccessModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                Открыть доступ вручную
              </button>
              <button onClick={() => setShowAccessModal(false)} className="px-4 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                Вернуться к платежу
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

