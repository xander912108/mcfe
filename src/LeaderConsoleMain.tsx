import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ChevronRight, Check,
  X, Info, Zap,
  ChevronDown, Activity, ListChecks, HeartHandshake, UserPlus, ShieldAlert,
} from 'lucide-react';

/* ===== PREMIUM COLORS ===== */
const TERRACOTTA = '#C9706A';
const TERRACOTTA_LIGHT = 'rgba(201,112,106,0.08)';
const TERRACOTTA_BORDER = 'rgba(201,112,106,0.15)';
const SAGE = '#6B9E7C';
const SAGE_LIGHT = 'rgba(107,158,124,0.08)';
const SAGE_BORDER = 'rgba(107,158,124,0.15)';
const GOLD_GLOW = 'rgba(201,169,110,0.08)';
const GOLD_BORDER = 'rgba(201,169,110,0.2)';

/* ===== SECTION TYPE ===== */
type SectionKey = 'map' | 'plan' | 'rhythm' | 'delegate' | 'risk';

/* ===== DATA ===== */
const planItems = [
  {
    id: 1,
    title: 'Проверить доступ после оплаты',
    text: 'Иван Петров оплатил участие, но доступ в сообщество не открылся автоматически.',
    primary: 'Открыть доступ вручную',
    link: 'monetization',
    accent: 'terracotta' as const,
    why: 'Платёж отмечен как успешный, но доступ участнику не был открыт. Обычно доступ должен открываться сразу после оплаты.',
  },
  {
    id: 2,
    title: 'Дать первую связь новичкам',
    text: '3 новичка уже вошли, но пока не получили живого отклика: ответа, встречи, благодарности или Помощника на старте.',
    primary: 'Подобрать опору',
    link: 'entry',
    accent: 'gold' as const,
    why: 'Эти участники находятся в первые 7 дней после вступления. Первая связь помогает новичку почувствовать, что он не один.',
  },
  {
    id: 3,
    title: 'Ответить на заявки старше суток',
    text: '2 заявки ждут больше 24 часов. Лучше ответить, пока интерес к сообществу ещё тёплый.',
    primary: 'Открыть Вступление',
    link: 'entry',
    accent: 'gold' as const,
    why: 'Кандидаты уже проявили интерес к сообществу. Если заявка долго остаётся без ответа, человек может потерять мотивацию.',
  },
];

const rhythmItems = [
  'Запросов без ответа в Backend нет',
  '2 Помощника на старте активны',
  '9 действий Вклада признаны',
  'Встреча «Разбор пет-проектов» завтра',
];

const delegateCards = [
  {
    title: 'Анна может взять новичка на 7 дней',
    text: 'Анна Морозова уже помогала новичкам и сейчас не перегружена. Ей можно предложить функцию «Помощник на старте».',
    primary: 'Предложить функцию',
    secondary: 'Открыть кандидата',
  },
  {
    title: 'Сергей может ответить на запрос по Docker',
    text: 'Он уже помогал по этой теме и сейчас не перегружен. Это хороший момент не отвечать самому.',
    primary: 'Предложить ответить',
  },
];

const risks = [
  {
    title: 'У Помощника на старте не задан лимит нагрузки',
    text: 'Без лимита участника можно случайно перегрузить новыми назначениями. Лучше заранее указать, сколько новичков можно сопровождать одновременно.',
    action: 'Настроить лимит',
  },
];

const pulseItems = [
  { label: 'Первая связь', value: 60, desc: '3 новичка пока не получили живого отклика: ответа, встречи, благодарности или Помощника на старте.' },
  { label: 'Запросы', value: 82, desc: 'Большинство запросов получает ответ вовремя. Есть один первый запрос новичка, который лучше не откладывать.' },
  { label: 'Вклад', value: 91, desc: 'Участники помогают друг другу, а полезные действия замечаются и признаются.' },
  { label: 'Взаимопомощь', value: 76, desc: 'В сообществе уже есть поддержка между участниками, но часть нагрузки ещё можно передать активным людям.' },
  { label: 'Доступ и оплата', value: 47, desc: 'Есть слабое место: один участник оплатил участие, но доступ не открылся автоматически.' },
  { label: 'Настройки и риски', value: 88, desc: 'Ключевые настройки в целом в порядке. Осталось задать лимит нагрузки для функции «Помощник на старте».' },
];

const pulseDownItems = [
  'Один участник оплатил доступ, но доступ не открылся автоматически.',
  '3 новичка пока без первой связи.',
  '2 заявки ждут больше 24 часов.',
  'У функции «Помощник на старте» не задан лимит нагрузки.',
];

const pulseUpItems = [
  'В теме Backend сейчас нет запросов без ответа.',
  '2 Помощника на старте активны.',
  '9 действий Вклада признаны.',
  'Завтра проходит встреча «Разбор пет-проектов».',
];

const paramDescriptions = [
  { label: 'Первая связь', desc: 'Показывает, получают ли новички живой контакт после входа: ответ, отклик, встречу, благодарность, Помощника на старте или участника рядом.' },
  { label: 'Запросы', desc: 'Показывает, остаются ли вопросы участников без ответа и есть ли первые вопросы новичков, которые лучше не откладывать.' },
  { label: 'Вклад', desc: 'Показывает, замечаются ли полезные действия участников: ответы, разборы, помощь новичкам, инсайты и вклад в ритуалы.' },
  { label: 'Взаимопомощь', desc: 'Показывает, помогает ли сообщество само себе, а не держится ли вся нагрузка только на лидере.' },
  { label: 'Доступ и оплата', desc: 'Показывает, проходят ли оплаты корректно и открывается ли доступ после оплаты без ручной проверки.' },
  { label: 'Настройки и риски', desc: 'Показывает, есть ли настройки, которые могут создать перегрузку, подвесить доступ или оставить людей без понятного сценария.' },
  { label: 'Индекс отдачи', desc: 'Показывает соотношение между запросами помощи и полезными откликами. Если индекс выше 1, участники не только получают помощь, но и начинают отдавать её другим.' },
];

/* ===== COMPONENT ===== */
export default function LeaderConsoleMain() {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<SectionKey>('map');
  const [showPulseModal, setShowPulseModal] = useState(false);
  const [showWhyId, setShowWhyId] = useState<number | null>(null);
  const [showAdvisorWhy, setShowAdvisorWhy] = useState(false);
  const [showParamDescriptions, setShowParamDescriptions] = useState(false);
  const [showPulseInfo, setShowPulseInfo] = useState(false);
  const [showIndexInfo, setShowIndexInfo] = useState(false);
  const [advisorFocus, setAdvisorFocus] = useState<'payment' | 'newcomer' | 'applications'>('payment');

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  /* Section nav cards */
  const sectionCards = [
    { key: 'map' as SectionKey, label: 'Карта дня', subtitle: '74/100 · Среда стабильна', icon: Activity },
    { key: 'plan' as SectionKey, label: 'План на сегодня', subtitle: '3 действия по порядку', icon: ListChecks },
    { key: 'rhythm' as SectionKey, label: 'Сообщество держит ритм', subtitle: '4 positive-сигнала', icon: HeartHandshake },
    { key: 'delegate' as SectionKey, label: 'Можно передать участникам', subtitle: '2 рекомендации', icon: UserPlus },
    { key: 'risk' as SectionKey, label: 'Не откладывать', subtitle: '1 главный риск', icon: ShieldAlert },
  ];

  /* Advisor content based on focus */
  const advisorContent = {
    payment: {
      title: 'Начните с доступа после оплаты',
      text: 'Участник уже оплатил, но пока не получил вход в сообщество. Это важнее обычных заявок, потому что человек уже сделал шаг доверия.',
      why: 'Система ставит выше ситуации, где участник уже сделал важное действие: оплатил, вошёл в сообщество, задал первый вопрос или долго ждёт ответа. Сейчас самый чувствительный участок — доступ после оплаты.',
      action: 'Начать с доступа',
      next: 'newcomer' as const,
    },
    newcomer: {
      title: 'Теперь лучше заняться первой связью новичков',
      text: 'Три человека уже вошли в сообщество, но пока не получили живого отклика: ответа, встречи, благодарности или Помощника на старте.',
      why: 'Новички в первые дни особенно чувствительны к тишине. Если у человека быстро появляется живой контакт, ему проще войти в ритм сообщества.',
      action: 'Подобрать опору',
      next: 'applications' as const,
    },
    applications: {
      title: 'Сегодня можно спокойно разобрать заявки',
      text: 'Заявки, которые ждут больше суток, лучше ответить, пока интерес к сообществу ещё тёплый.',
      why: 'Система смотрит на время ожидания и показывает заявки, где задержка может повлиять на доверие кандидата.',
      action: 'Открыть заявки',
      next: 'payment' as const,
    },
  };

  const ac = advisorContent[advisorFocus];

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0 space-y-6">

        {/* ===== HEADER BLOCK ===== */}
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
          <div className="px-6 md:px-8 pt-8 pb-6">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Главное сейчас</span>
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Главное сейчас
            </h1>
            <p className="text-sm leading-relaxed max-w-3xl" style={{ color: 'var(--text-secondary)' }}>
              Собрали только то, что важно увидеть сегодня: доверие, первая связь, запросы, Вклад и точки, где сообщество может взять часть нагрузки на себя.
            </p>
            <div className="flex items-center gap-2 mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>
              <span>Обновлено 4 минуты назад</span>
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


        {/* ===== КАРТА ДНЯ ===== */}
        {activeSection === 'map' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Карта дня</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Как сегодня дела в сообществе.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6">
              <div className="flex items-center gap-4 mb-3">
                <div className="text-3xl font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>74<span className="text-lg" style={{ color: 'var(--text-muted)' }}>/100</span></div>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Среда стабильна</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Есть три точки внимания, но в целом сообщество держит хороший ритм.</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed mb-4" style={{ color: 'var(--text-secondary)' }}>
                Есть три точки внимания: один доступ нужно проверить, трём новичкам нужна первая связь, а часть нагрузки уже можно передать участникам.
              </p>
              <button
                onClick={() => setShowPulseModal(true)}
                className="text-xs font-medium transition-colors hover:opacity-80 flex items-center gap-1"
                style={{ color: 'var(--gold)' }}
              >
                Подробнее <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ===== ПЛАН НА СЕГОДНЯ ===== */}
        {activeSection === 'plan' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>План на сегодня</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Максимум 3 действия в порядке приоритета.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6">
              <div className="space-y-4">
                {planItems.map((item, idx) => (
                  <div key={item.id} className="flex gap-4">
                    {/* Number */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                      style={{ backgroundColor: idx === 0 ? TERRACOTTA_LIGHT : GOLD_GLOW, border: `1px solid ${idx === 0 ? TERRACOTTA_BORDER : GOLD_BORDER}`, color: idx === 0 ? TERRACOTTA : 'var(--gold)' }}>
                      {item.id}
                    </div>
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                      <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>{item.text}</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => {
                            if (item.link === 'monetization') navigate('/leader/monetization');
                            else navigate('/leader/entry');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-90"
                          style={item.accent === 'terracotta' ? { backgroundColor: TERRACOTTA, color: '#fff' } : { backgroundColor: 'var(--gold)', color: '#fff' }}
                        >
                          {item.primary}
                        </button>
                        {item.why && (
                          <button onClick={() => setShowWhyId(showWhyId === item.id ? null : item.id)} className="px-2 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                            {showWhyId === item.id ? 'Скрыть' : 'Почему?'}
                          </button>
                        )}
                      </div>
                      {showWhyId === item.id && item.why && (
                        <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item.why}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== СООБЩЕСТВО ДЕРЖИТ РИТМ ===== */}
        {activeSection === 'rhythm' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Сообщество держит ритм</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Где участники уже поддерживают друг друга, а нагрузка не держится только на лидере.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6">
              <div className="space-y-3">
                {rhythmItems.map((text, i) => (
                  <div key={i} className="flex items-start gap-3 py-2">
                    <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: SAGE }} />
                    <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== МОЖНО ПЕРЕДАТЬ УЧАСТНИКАМ ===== */}
        {activeSection === 'delegate' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Можно передать участникам</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Рекомендации на передачу нагрузки от лидера к сообществу.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6 space-y-4">
              {delegateCards.map((card, i) => (
                <div key={i} className="rounded-xl p-5" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}` }}>
                  <h3 className="text-sm font-bold mb-2" style={{ color: SAGE }}>{card.title}</h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{card.text}</p>
                  <div className="flex flex-wrap gap-2">
                    <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>
                      {card.primary}
                    </button>
                    {card.secondary && (
                      <button className="px-2 py-1.5 rounded-lg text-xs transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>
                        {card.secondary}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button className="text-xs transition-colors hover:opacity-80 flex items-center gap-1" style={{ color: 'var(--gold)' }}>
                Показать ещё 1 рекомендацию <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ===== НЕ ОТКЛАДЫВАТЬ ===== */}
        {activeSection === 'risk' && (
          <div className="rounded-2xl overflow-hidden section-fade-in" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <div className="px-6 md:px-8 pt-6 pb-4">
              <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Не откладывать</h2>
              <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Главный риск, который лучше закрыть сегодня.</p>
            </div>
            <div className="px-6 md:px-8"><GradientDivider /></div>
            <div className="px-6 md:px-8 py-6">
              {risks.map((risk, i) => (
                <div key={i} className="rounded-xl p-5" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}`, borderLeft: `3px solid ${TERRACOTTA}` }}>
                  <div className="flex items-start gap-3 mb-2">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: TERRACOTTA }} />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{risk.title}</h3>
                  </div>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{risk.text}</p>
                  <button className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>
                    {risk.action}
                  </button>
                </div>
              ))}
              <button className="text-xs mt-4 transition-colors hover:opacity-80 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                Открыть все риски <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

      </main>

      {/* ===== RIGHT COLUMN ===== */}
      <aside className="w-full lg:w-[240px] shrink-0 space-y-5 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar">

        {/* Focus of the day */}
        <div className="sidebar-section">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
            <h3 className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Фокус дня</h3>
          </div>
          <div className="p-3 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid ${GOLD_BORDER}` }}>
            <p className="text-xs font-medium mb-2" style={{ color: 'var(--gold)' }}>{ac.title}</p>
            <p className="text-[11px] leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{ac.text}</p>
            <button
              onClick={() => {
                if (advisorFocus === 'payment') { setActiveSection('plan'); setShowWhyId(1); }
                if (advisorFocus === 'newcomer') { setActiveSection('plan'); setShowWhyId(2); }
                if (advisorFocus === 'applications') { setActiveSection('plan'); setShowWhyId(3); }
              }}
              className="text-[11px] px-3 py-1.5 rounded-lg font-medium transition-all duration-200 hover:opacity-90 w-full"
              style={{ backgroundColor: 'var(--gold)', color: '#fff' }}
            >
              {ac.action}
            </button>
          </div>
          {/* Why */}
          <button onClick={() => setShowAdvisorWhy(!showAdvisorWhy)} className="text-[11px] mt-2 transition-colors hover:opacity-80 flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
            {showAdvisorWhy ? 'Скрыть' : 'Почему я это вижу?'} <ChevronDown className="w-3 h-3" style={{ transform: showAdvisorWhy ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>
          {showAdvisorWhy && (
            <p className="text-[11px] mt-2 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{ac.why}</p>
          )}
          {/* Next focus button (for demo) */}
          <button
            onClick={() => setAdvisorFocus(ac.next)}
            className="text-[10px] mt-2 transition-colors hover:opacity-80"
            style={{ color: 'var(--text-muted)' }}
          >
            Следующий фокус (демо)
          </button>
        </div>

        {/* Quiet link */}
        <div className="sidebar-section">
          <button onClick={() => setShowPulseModal(true)} className="text-[11px] transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
            Что означают параметры Пульса
          </button>
        </div>

      </aside>


      {/* ===== MODAL: ПУЛЬС СООБЩЕСТВА ===== */}
      {showPulseModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-start justify-center p-4 overflow-y-auto" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowPulseModal(false)}>
          <div className="modal-enter rounded-2xl max-w-xl w-full relative overflow-hidden my-8" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPulseModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>

            <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Пульс сообщества</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Показывает, насколько сейчас в сообществе всё работает без заметных провалов: новички получают первую связь, запросы не остаются без ответа, Вклад замечается, оплата и доступ работают корректно, а настройки не создают перегрузку.</p>

              {/* Top score */}
              <div className="flex items-center gap-4 mb-6 p-4 rounded-xl" style={{ backgroundColor: GOLD_GLOW, border: `1px solid ${GOLD_BORDER}` }}>
                <div className="text-4xl font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>
                  74<span className="text-xl" style={{ color: 'var(--text-muted)' }}>/100</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Среда стабильна</p>
                    <button onClick={() => setShowPulseInfo(!showPulseInfo)} className="p-0.5 rounded transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}><Info className="w-3.5 h-3.5" /></button>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Есть точки внимания, но в целом сообщество держит хороший ритм.</p>
                </div>
              </div>

              {/* Popover: How Pulse is calculated */}
              {showPulseInfo && (
                <div className="mb-6 p-5 rounded-xl relative" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--gold)', boxShadow: 'var(--card-shadow)' }}>
                  <button onClick={() => setShowPulseInfo(false)} className="absolute top-3 right-3 p-0.5 rounded transition-colors" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
                  <p className="text-xs font-bold mb-3" style={{ color: 'var(--gold)' }}>Как считается Пульс</p>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Пульс — это среднее значение шести параметров:
                  </p>
                  <ul className="space-y-1 mb-3">
                    {['первая связь', 'запросы', 'вклад', 'взаимопомощь', 'доступ и оплата', 'настройки и риски'].map((p) => (
                      <li key={p} className="text-xs flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--hover-bg)' }}>
                    <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Формула:</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>(60 + 82 + 91 + 76 + 47 + 88) / 6 = 74</p>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Каждый параметр считается по шкале от 0 до 100. Чем выше значение, тем меньше заметных провалов в этой части сообщества. Пульс не оценивает лидера и не является рейтингом. Это спокойный индикатор состояния среды.
                  </p>
                </div>
              )}



              {/* Parameters */}
              <div className="mb-6">
                <p className="text-[11px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что влияет на Пульс</p>
                <div className="space-y-3">
                  {pulseItems.map((p) => (
                    <div key={p.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                        <span className="text-xs font-bold" style={{ color: p.value < 60 ? TERRACOTTA : p.value >= 85 ? SAGE : 'var(--gold)' }}>{p.value}/100</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--hover-bg)' }}>
                        <div className="h-full rounded-full transition-all" style={{ width: `${p.value}%`, backgroundColor: p.value < 60 ? TERRACOTTA : p.value >= 85 ? SAGE : 'var(--gold)' }} />
                      </div>
                      <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px mb-6" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />

              {/* Down */}
              <div className="mb-6">
                <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что снижает Пульс сейчас</p>
                <ul className="space-y-1.5">
                  {pulseDownItems.map((t, i) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <span className="mt-1.5 w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: TERRACOTTA }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Up */}
              <div className="mb-6">
                <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что поддерживает Пульс</p>
                <ul className="space-y-1.5">
                  {pulseUpItems.map((t, i) => (
                    <li key={i} className="text-xs flex items-start gap-2" style={{ color: 'var(--text-secondary)' }}>
                      <Check className="w-3 h-3 shrink-0 mt-0.5" style={{ color: SAGE }} />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="h-px mb-6" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />

              {/* Index */}
              <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[11px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Индекс отдачи</p>
                  <button onClick={() => setShowIndexInfo(!showIndexInfo)} className="p-0.5 rounded transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}><Info className="w-3.5 h-3.5" /></button>
                </div>
                <p className="text-2xl font-bold heading-accent mb-1" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--gold)' }}>1.34</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>На 1 запрос помощи приходится 1.34 полезного отклика: ответ, благодарность, разбор, помощь новичку или сохранённый Инсайт.</p>
                <p className="text-xs leading-relaxed mt-2" style={{ color: 'var(--text-secondary)' }}>Значение выше 1 — хороший знак: участники не только получают помощь, но и начинают отдавать её другим.</p>
              </div>

              {/* Popover: How Index is calculated */}
              {showIndexInfo && (
                <div className="mb-6 p-5 rounded-xl relative" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--gold)', boxShadow: 'var(--card-shadow)' }}>
                  <button onClick={() => setShowIndexInfo(false)} className="absolute top-3 right-3 p-0.5 rounded transition-colors" style={{ color: 'var(--text-muted)' }}><X className="w-4 h-4" /></button>
                  <p className="text-xs font-bold mb-3" style={{ color: 'var(--gold)' }}>Как считается Индекс отдачи</p>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
                    Индекс отдачи показывает, сколько полезных откликов появляется на один запрос помощи.
                  </p>
                  <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--hover-bg)' }}>
                    <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Формула:</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Полезные отклики / Запросы помощи = Индекс отдачи</p>
                  </div>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>В полезные отклики входят:</p>
                  <ul className="space-y-1 mb-3">
                    {['ответы на запросы', 'благодарности за помощь', 'разборы работ', 'помощь новичкам', 'сохранённые Инсайты'].map((item) => (
                      <li key={item} className="text-[11px] flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                        <span className="w-1 h-1 rounded-full shrink-0" style={{ backgroundColor: 'var(--gold)' }} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div className="p-3 rounded-lg mb-3" style={{ backgroundColor: 'var(--hover-bg)' }}>
                    <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Пример:</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>47 полезных откликов / 35 запросов помощи = 1.34</p>
                  </div>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                    Если значение выше 1, значит сообщество не только просит помощь, но и возвращает её другим участникам.
                  </p>
                </div>
              )}

              {/* Parameter descriptions (expandable) */}
              <div className="mb-4">
                <button onClick={() => setShowParamDescriptions(!showParamDescriptions)} className="flex items-center gap-2 text-xs font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>
                  <Info className="w-3.5 h-3.5" />
                  Что означают параметры
                  <ChevronDown className="w-3 h-3" style={{ transform: showParamDescriptions ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {showParamDescriptions && (
                  <div className="mt-3 space-y-2 pl-1">
                    {paramDescriptions.map((p) => (
                      <div key={p.label}>
                        <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{p.label}</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{p.desc}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Close button */}
              <button onClick={() => setShowPulseModal(false)} className="w-full py-2.5 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>
                Понятно
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

