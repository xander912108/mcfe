import { useState } from 'react';
import {
  ChevronRight, Info, CreditCard,
  Wallet, TrendingUp, Users, Check,
  Clock, AlertTriangle, Shield
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

/* ===== DATA: MONETIZATION ===== */
const statsCards = [
  { label: 'Выручка за месяц', value: '₽84,500', change: '+12%', positive: true, icon: Wallet },
  { label: 'Активных подписчиков', value: '47', change: '+5', positive: true, icon: Users },
  { label: 'Конверсия', value: '3.2%', change: '+0.4%', positive: true, icon: TrendingUp },
  { label: 'Проблемных платежей', value: '2', change: 'требуют внимания', positive: false, icon: AlertTriangle },
];

const transactions = [
  { id: 1, user: 'Мария Козлова', avatar: '/team-4.jpg', amount: 2500, status: 'success', date: '2 часа назад', method: 'Карта ·••• 4242' },
  { id: 2, user: 'Дмитрий Коваль', avatar: '/avatar-1.jpg', amount: 2500, status: 'success', date: '5 часов назад', method: 'Карта ·••• 8888' },
  { id: 3, user: 'Елена Васильева', avatar: '/avatar-4.jpg', amount: 2500, status: 'pending', date: '1 день назад', method: 'Ожидает подтверждения' },
  { id: 4, user: 'Алексей Новиков', avatar: '/team-3.jpg', amount: 5000, status: 'success', date: '2 дня назад', method: 'Карта ·••• 1234' },
  { id: 5, user: 'Ольга Романова', avatar: '/team-2.jpg', amount: 2500, status: 'failed', date: '2 дня назад', method: 'Ошибка оплаты' },
  { id: 6, user: 'Павел Миронов', avatar: '/avatar-3.jpg', amount: 2500, status: 'success', date: '3 дня назад', method: 'Карта ·••• 7777' },
];

const subscribers = [
  { id: 1, name: 'Мария Козлова', avatar: '/team-4.jpg', plan: 'Базовый', since: '2 месяца', nextPayment: '15 июня', status: 'active' },
  { id: 2, name: 'Дмитрий Коваль', avatar: '/avatar-1.jpg', plan: 'Базовый', since: '1 месяц', nextPayment: '18 июня', status: 'active' },
  { id: 3, name: 'Елена Васильева', avatar: '/avatar-4.jpg', plan: 'Премиум', since: '3 месяца', nextPayment: '10 июня', status: 'pending' },
  { id: 4, name: 'Алексей Новиков', avatar: '/team-3.jpg', plan: 'Премиум', since: '2 недели', nextPayment: '20 июня', status: 'active' },
  { id: 5, name: 'Павел Миронов', avatar: '/avatar-3.jpg', plan: 'Базовый', since: '1 неделя', nextPayment: '22 июня', status: 'active' },
];

const pricingPlans = [
  {
    name: 'Базовый',
    price: '₽2,500',
    period: '/ месяц',
    description: 'Доступ к основным материалам и встречам сообщества',
    features: ['Доступ к чату', 'Участие в встречах', 'Базовые треки', 'Общие каналы'],
    subscribers: 35,
    color: 'var(--gold)',
  },
  {
    name: 'Премиум',
    price: '₽5,000',
    period: '/ месяц',
    description: 'Полный доступ с разборами, менторингом и закрытыми материалами',
    features: ['Всё из Базового', 'Разборы проектов', 'Менторинг', 'Закрытые треки', 'Приоритетная поддержка'],
    subscribers: 12,
    color: SAGE,
  },
];

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  success: { label: 'Успешно', color: SAGE, bg: SAGE_LIGHT },
  pending: { label: 'В обработке', color: 'var(--gold)', bg: GOLD_GLOW },
  failed: { label: 'Ошибка', color: TERRACOTTA, bg: TERRACOTTA_LIGHT },
};

/* ===== COMPONENT ===== */
export default function LeaderConsoleMonetization() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'subscribers' | 'plans'>('overview');
  const [showActionModal, setShowActionModal] = useState<'refund' | 'changePlan' | null>(null);

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  const handleAction = () => {
    if (showActionModal === 'refund') {
      showToast('Возврат инициирован', 'success');
    } else if (showActionModal === 'changePlan') {
      showToast('Тариф изменён', 'success');
    }
    setShowActionModal(null);
  };

  const tabs = [
    { key: 'overview' as const, label: 'Обзор', icon: TrendingUp },
    { key: 'transactions' as const, label: 'Транзакции', icon: CreditCard },
    { key: 'subscribers' as const, label: 'Подписчики', icon: Users },
    { key: 'plans' as const, label: 'Тарифы', icon: Shield },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>

          {/* ===== HEADER ===== */}
          <div className="px-6 md:px-8 pt-8 pb-6 section-fade-in">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Монетизация</span>
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Монетизация
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              Управление подписками, транзакциями и тарифами сообщества. Следите за выручкой и помогайте участникам с доступом.
            </p>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== STATS ROW ===== */}
          <div className="px-6 md:px-8 py-4 section-fade-in" style={{ animationDelay: '50ms' }}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {statsCards.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <div key={i} className="p-3 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Icon className="w-3.5 h-3.5" style={{ color: stat.positive ? (i === 3 ? TERRACOTTA : 'var(--gold)') : TERRACOTTA }} />
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                    </div>
                    <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{stat.value}</p>
                    <p className="text-[10px] font-medium" style={{ color: stat.positive ? (i === 3 ? TERRACOTTA : SAGE) : TERRACOTTA }}>{stat.change}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== TABS ===== */}
          <div className="px-6 md:px-8 py-4 section-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-1 p-1 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)' }}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200`}
                    style={{
                      backgroundColor: activeTab === tab.key ? 'var(--bg-card)' : 'transparent',
                      color: activeTab === tab.key ? 'var(--gold)' : 'var(--text-secondary)',
                      boxShadow: activeTab === tab.key ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== TAB CONTENT ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '150ms' }}>

            {/* OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Revenue chart placeholder */}
                <div className="p-5 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Выручка за 30 дней</h3>
                    <span className="text-xs font-medium px-2 py-1 rounded-lg" style={{ backgroundColor: SAGE_LIGHT, color: SAGE }}>+12% к прошлому месяцу</span>
                  </div>
                  <div className="flex items-end gap-1.5 h-32">
                    {[40, 55, 45, 60, 50, 70, 65, 80, 75, 85, 90, 78].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, backgroundColor: i === 11 ? 'var(--gold)' : 'var(--border-color)', opacity: i === 11 ? 1 : 0.5 }} />
                    ))}
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>15 мая</span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Сегодня</span>
                  </div>
                </div>

                {/* Recent transactions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Последние транзакции</h3>
                    <button onClick={() => setActiveTab('transactions')} className="text-xs font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>
                      Все транзакции
                    </button>
                  </div>
                  <div className="space-y-2">
                    {transactions.slice(0, 3).map((tx) => {
                      const st = statusConfig[tx.status];
                      return (
                        <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                          <img src={tx.avatar} alt={tx.user} className="w-8 h-8 rounded-full object-cover shrink-0" style={{ border: '1px solid var(--border-color)' }} />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{tx.user}</p>
                            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tx.method}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>+{tx.amount.toLocaleString()} ₽</p>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium" style={{ backgroundColor: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => showToast('Открываю настройки тарифов...', 'info')}
                    className="p-4 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5"
                    style={{ backgroundColor: GOLD_GLOW, border: `1px solid rgba(201,169,110,0.15)` }}
                  >
                    <Shield className="w-5 h-5 mb-2" style={{ color: 'var(--gold)' }} />
                    <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Настроить тарифы</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Изменить цены и условия подписок</p>
                  </button>
                  <button
                    onClick={() => showToast('Открываю отчёт...', 'info')}
                    className="p-4 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5"
                    style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}` }}
                  >
                    <TrendingUp className="w-5 h-5 mb-2" style={{ color: SAGE }} />
                    <p className="text-sm font-semibold mb-0.5" style={{ color: 'var(--text-primary)' }}>Финансовый отчёт</p>
                    <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Выгрузить данные за период</p>
                  </button>
                </div>
              </div>
            )}

            {/* TRANSACTIONS */}
            {activeTab === 'transactions' && (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const st = statusConfig[tx.status];
                  return (
                    <div
                      key={tx.id}
                      className="hover-border-gold transition-all duration-200 rounded-xl p-4 cursor-pointer"
                      style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                      
                    >
                      <div className="flex items-center gap-3">
                        <img src={tx.avatar} alt={tx.user} className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: '2px solid var(--border-color)' }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{tx.user}</p>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: st.bg, color: st.color }}>
                              {st.label}
                            </span>
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{tx.method}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-base font-bold" style={{ color: tx.status === 'failed' ? TERRACOTTA : 'var(--text-primary)' }}>
                            {tx.status === 'failed' ? '' : '+'}{tx.amount.toLocaleString()} ₽
                          </p>
                          <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{tx.date}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* SUBSCRIBERS */}
            {activeTab === 'subscribers' && (
              <div className="space-y-3">
                {subscribers.map((sub) => (
                  <div
                    key={sub.id}
                    className="hover-border-gold transition-all duration-200 rounded-xl p-4"
                    style={{ border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}
                  >
                    <div className="flex items-center gap-3">
                      <img src={sub.avatar} alt={sub.name} className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: '2px solid var(--border-color)' }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sub.name}</p>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                            style={{
                              backgroundColor: sub.plan === 'Премиум' ? SAGE_LIGHT : GOLD_GLOW,
                              color: sub.plan === 'Премиум' ? SAGE : 'var(--gold)',
                            }}>
                            {sub.plan}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          <span>С {sub.since}</span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Следующий платёж: {sub.nextPayment}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowActionModal('changePlan')}
                        className="text-xs px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80 shrink-0"
                        style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}
                      >
                        Изменить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PLANS */}
            {activeTab === 'plans' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pricingPlans.map((plan, i) => (
                  <div
                    key={i}
                    className="rounded-xl p-5 transition-all duration-200 hover:-translate-y-0.5"
                    style={{
                      backgroundColor: 'var(--hover-bg)',
                      border: `1px solid ${i === 1 ? SAGE_BORDER : 'var(--border-color)'}`,
                      boxShadow: i === 1 ? `0 4px 20px ${SAGE_LIGHT}` : 'none',
                    }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{plan.name}</h3>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ backgroundColor: i === 1 ? SAGE_LIGHT : GOLD_GLOW, color: i === 1 ? SAGE : 'var(--gold)' }}>
                        <Users className="w-3 h-3" />
                        {plan.subscribers}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1 mb-3">
                      <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{plan.price}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{plan.period}</span>
                    </div>
                    <p className="text-xs leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>{plan.description}</p>
                    <div className="space-y-2 mb-5">
                      {plan.features.map((feature, j) => (
                        <div key={j} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 shrink-0" style={{ color: i === 1 ? SAGE : 'var(--gold)' }} />
                          <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{feature}</span>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => showToast('Редактирование тарифа...', 'info')}
                      className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                      style={{ backgroundColor: i === 1 ? SAGE : 'var(--gold)', color: '#fff' }}
                    >
                      Редактировать
                    </button>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </main>

      {/* ===== MODAL: Actions ===== */}
      {showActionModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowActionModal(null)}>
          <div className="modal-enter rounded-2xl max-w-sm w-full p-6" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-bold mb-2" style={{ color: 'var(--text-primary)' }}>
              {showActionModal === 'refund' ? 'Инициировать возврат' : 'Изменить тариф'}
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              {showActionModal === 'refund'
                ? 'Участник получит полный возврат средств за текущий период. Доступ будет закрыт.'
                : 'Выберите новый тариф для участника. Изменения вступят в силу со следующего платёжного периода.'}
            </p>
            {showActionModal === 'changePlan' && (
              <div className="space-y-2 mb-5">
                {pricingPlans.map((plan, i) => (
                  <button
                    key={i}
                    className="w-full flex items-center justify-between p-3 rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5"
                    style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}
                  >
                    <div>
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{plan.name}</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{plan.price}{plan.period}</p>
                    </div>
                    <ChevronRight className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={handleAction}
                className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
                style={{ backgroundColor: showActionModal === 'refund' ? TERRACOTTA : 'var(--gold)', color: '#fff' }}
              >
                {showActionModal === 'refund' ? 'Вернуть средства' : 'Сохранить'}
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

        {/* Revenue breakdown */}
        <div className="sidebar-section">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>Выручка</h3>
          <div className="space-y-3">
            {[
              { label: 'Базовый', value: '₽87,500', share: 58, color: 'var(--gold)' },
              { label: 'Премиум', value: '₽60,000', share: 40, color: SAGE },
              { label: 'Возвраты', value: '-₽3,500', share: 2, color: TERRACOTTA },
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                  <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{item.value}</span>
                </div>
                <div className="micro-progress">
                  <div className="micro-progress-fill" style={{ width: `${item.share}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Alerts */}
        <div className="sidebar-section">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-3.5 h-3.5" style={{ color: TERRACOTTA }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Требуют внимания</h3>
          </div>
          <div className="space-y-2">
            <div className="p-3 rounded-xl" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
              <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>2 проблемных платежа</p>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Ольга Романова и Елена Васильева — проверьте статус оплаты.</p>
            </div>
          </div>
        </div>

        {/* Tip */}
        <div className="sidebar-section">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Рекомендация</h3>
          </div>
          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Рассмотрите добавление годового тарифа со скидкой 20%. Это увеличит LTV подписчиков.
          </p>
        </div>
      </aside>
    </div>
  );
}
