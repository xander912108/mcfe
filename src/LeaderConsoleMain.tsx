import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, ChevronRight, Check,
  TrendingUp as TrendIcon, X, Info, Users, Zap, Lightbulb,
  ChevronDown
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
const GOLD_BORDER = 'rgba(201,169,110,0.2)';

/* ===== DATA ===== */

const attentionCards = [
  {
    id: 1,
    title: 'Оплата прошла, но доступ не открылся',
    text: 'Иван Петров оплатил участие, но доступ в сообщество не открылся автоматически. Это лучше проверить сразу: человек уже сделал шаг доверия.',
    primary: 'Открыть доступ вручную',
    secondary: 'Открыть Монетизацию',
    accent: 'terracotta' as const,
    why: 'Платёж отмечен как успешный, но доступ участнику не был открыт. Обычно доступ должен открываться сразу после оплаты. Поэтому система подняла этот сигнал как критичный для доверия.',
  },
  {
    id: 2,
    title: '3 новичкам нужна первая связь',
    text: 'Они уже вошли в «IT Технологии», но пока не получили живого отклика: ответа, встречи, благодарности или Помощника на старте.',
    extra: 'Сейчас нет активных Помощников на старте, поэтому нужна опора вручную.',
    primary: 'Подобрать опору',
    secondary: 'Открыть Вступление',
    accent: 'gold' as const,
    why: 'Эти участники находятся в первые 7 дней после вступления. Первая связь помогает новичку почувствовать, что он не один, и повышает шанс, что он начнёт путь в сообществе.',
  },
  {
    id: 3,
    title: '5 заявок ждут решения',
    text: '2 заявки ждут больше 24 часов. Лучше ответить, пока интерес к сообществу ещё тёплый.',
    primary: 'Открыть Вступление',
    accent: 'gold' as const,
    why: 'Кандидаты уже проявили интерес к сообществу. Если заявка долго остаётся без ответа, человек может потерять мотивацию вступить.',
  },
];

const selfManaging = [
  { text: 'Запросов без ответа в «Backend» нет', sub: 'Участники помогают друг другу вовремя' },
  { text: '2 Помощника на старте активны', sub: 'Новички получают опору не только от лидера' },
  { text: '9 действий Вклада признаны', sub: 'Люди видят, что их польза замечена' },
  { text: 'Встреча «Разбор пет-проектов» завтра', sub: 'Ритм сообщества продолжает работать' },
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
    text: 'Он уже помогал по этой теме и сейчас не перегружен. Это хороший момент не отвечать самому, а передать отклик участнику.',
    primary: 'Предложить ответить',
  },
  {
    title: 'Ответ Дмитрия можно сохранить как Инсайт',
    text: 'Сильный ответ по пет-проектам может помочь другим участникам и не потеряться в ленте.',
    primary: 'Оформить Инсайт',
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
  { label: 'Доступ и оплата', value: 47, desc: 'Есть слабое место: один участник оплатил участие, но доступ не открылся автоматически. Это лучше проверить сразу, потому что человек уже сделал шаг доверия.' },
  { label: 'Настройки и риски', value: 88, desc: 'Ключевые настройки в целом в порядке. Осталось задать лимит нагрузки для функции «Помощник на старте».' },
];

const paramDescriptions = [
  { label: 'Первая связь', desc: 'Получили ли новички живой человеческий отклик.' },
  { label: 'Запросы', desc: 'Насколько быстро участники получают ответы и разборы.' },
  { label: 'Вклад', desc: 'Замечается ли польза участников.' },
  { label: 'Взаимопомощь', desc: 'Помогает ли сообщество само себе.' },
  { label: 'Доступ и оплата', desc: 'Нет ли проблем с оплатой и открытием доступа.' },
  { label: 'Настройки и риски', desc: 'Не создают ли роли, лимиты и доступы перегрузку или ошибки.' },
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

/* ===== CUSTOM TOOLTIP COMPONENT ===== */
function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex items-center" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}>
      {children}
      {visible && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 rounded-lg text-xs max-w-[260px] z-50 whitespace-normal"
          style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', color: 'var(--text-secondary)' }}>
          {text}
          <span className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent" style={{ borderTopColor: 'var(--border-color)' }} />
        </span>
      )}
    </span>
  );
}

/* ===== COMPONENT ===== */
export default function LeaderConsoleMain() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [showPulseModal, setShowPulseModal] = useState(false);
  const [showWhyId, setShowWhyId] = useState<number | null>(null);
  const [advisorHidden, setAdvisorHidden] = useState(false);
  const [showAdvisorWhy, setShowAdvisorWhy] = useState(false);
  const [showParamDescriptions, setShowParamDescriptions] = useState(false);

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>

          {/* ===== HEADER ===== */}
          <div className="px-6 md:px-8 pt-8 pb-6 section-fade-in">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Главное сейчас</span>
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Главное сейчас
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              Собрали только то, что важно увидеть сегодня: доверие, первая связь, запросы, Вклад и точки, где сообщество может взять часть нагрузки на себя.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Обновлено 4 минуты назад</p>
              <button className="text-[11px] font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Обновить</button>
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== HUMAN SUMMARY ===== */}
          <div className="px-6 md:px-8 py-5 section-fade-in" style={{ animationDelay: '50ms' }}>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Среда стабильна. Есть три точки внимания: один доступ нужно проверить, трём новичкам нужна первая связь, а часть нагрузки уже можно передать участникам.
            </p>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== PULSE ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="flex items-center gap-1.5 mb-3">
              <p className="section-heading mb-0">Пульс сообщества</p>
              <Tooltip text="Пульс — это общая оценка состояния среды: первая связь, запросы, Вклад, взаимопомощь, доступ и оплата, настройки. Это не рейтинг людей, а ориентир для лидера.">
                <Info className="w-3 h-3 cursor-help" style={{ color: 'var(--text-muted)' }} />
              </Tooltip>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-3xl font-bold gold-glow" style={{ color: 'var(--gold)' }}>74<span className="text-base ml-1" style={{ color: 'var(--text-muted)' }}>/100</span></p>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Среда стабильна</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Есть несколько точек внимания, но в целом спокойно</p>
              </div>
              <button onClick={() => setShowPulseModal(true)} className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Подробнее</button>
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== YOUR ATTENTION TODAY ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '150ms' }}>
            <h2 className="section-heading">Ваше внимание сегодня</h2>
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
                  <p className="text-sm leading-relaxed mb-2 pl-8" style={{ color: 'var(--text-secondary)' }}>{card.text}</p>
                  {card.extra && <p className="text-sm leading-relaxed mb-3 pl-8" style={{ color: 'var(--text-muted)' }}>{card.extra}</p>}
                  <div className="flex flex-wrap gap-2 pl-8">
                    <button
                      onClick={() => {
                        if (card.primary === 'Открыть Вступление' || card.primary === 'Рассмотреть заявки') {
                          navigate('/leader/entry');
                        } else if (card.primary === 'Открыть доступ вручную') {
                          showToast('Доступ открыт. Участник получил уведомление.', 'success');
                        } else if (card.primary === 'Подобрать опору') {
                          showToast('Открываю раздел подбора опоры для новичков...', 'info');
                        } else {
                          showToast('Функция в разработке', 'info');
                        }
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                      style={card.accent === 'terracotta' ? { backgroundColor: TERRACOTTA, color: '#fff' } : { backgroundColor: 'var(--gold)', color: '#fff' }}>
                      {card.primary}
                    </button>
                    {card.secondary && (
                      <button
                        onClick={() => {
                          if (card.secondary === 'Открыть Вступление') {
                            navigate('/leader/entry');
                          } else if (card.secondary === 'Открыть Монетизацию') {
                            showToast('Открываю Монетизацию...', 'info');
                          } else {
                            showToast('Функция в разработке', 'info');
                          }
                        }}
                        className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                        {card.secondary}
                      </button>
                    )}
                    {card.why && (
                      <button onClick={() => setShowWhyId(showWhyId === card.id ? null : card.id)} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                        {showWhyId === card.id ? 'Скрыть' : 'Почему?'}
                      </button>
                    )}
                  </div>
                  {card.why && showWhyId === card.id && (
                    <div className="mt-3 pt-3 pl-8" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.why}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== SELF-MANAGING COMMUNITY ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '200ms' }}>
            <h2 className="section-heading">Сообщество справляется само</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Здесь видно, где участники уже поддерживают друг друга, а нагрузка не держится только на лидере.</p>
            <div className="space-y-3">
              {selfManaging.map((item, i) => (
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

          {/* ===== DELEGATE TO COMMUNITY ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '250ms' }}>
            <h2 className="section-heading">Что можно передать сообществу</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Здесь участники, которым можно доверить задачу. Это снимает нагрузку с лидера и развивает людей.</p>
            <div className="space-y-4">
              {delegateCards.map((card, i) => (
                <div key={i}
                  className="premium-card rounded-xl p-5"
                  style={{
                    backgroundColor: SAGE_LIGHT,
                    border: `1px solid ${SAGE_BORDER}`,
                    boxShadow: 'var(--card-shadow)',
                  }}>
                  <div className="flex items-start gap-3 mb-3">
                    <Users className="w-5 h-5 shrink-0 mt-0.5" style={{ color: SAGE }} />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{card.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed mb-4 pl-8" style={{ color: 'var(--text-secondary)' }}>{card.text}</p>
                  <div className="flex flex-wrap gap-2 pl-8">
                    <button
                      onClick={() => showToast(card.primary === 'Предложить функцию' ? 'Предложение отправлено Анне Морозовой' : card.primary === 'Предложить ответить' ? 'Запрос отправлен Сергею' : 'Инсайт сохранён' , 'success')}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>
                      {card.primary}
                    </button>
                    {card.secondary && (
                      <button
                        onClick={() => showToast('Функция в разработке', 'info')}
                        className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                        {card.secondary}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== RISKS ===== */}
          <div className="px-6 md:px-8 py-6 section-fade-in" style={{ animationDelay: '300ms' }}>
            <h2 className="section-heading">Риски, которые лучше не откладывать</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Здесь видно, где не хватает защиты: лимитов, ролей, доступов. Если не настроить заранее — проблема вырастет.</p>
            <div className="space-y-4">
              {risks.map((risk, i) => (
                <div key={i}
                  className="premium-card rounded-xl p-5"
                  style={{
                    backgroundColor: TERRACOTTA_LIGHT,
                    border: `1px solid ${TERRACOTTA_BORDER}`,
                    borderLeft: `3px solid ${TERRACOTTA}`,
                    boxShadow: 'var(--card-shadow)',
                  }}>
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: TERRACOTTA }} />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{risk.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed mb-4 pl-8" style={{ color: 'var(--text-secondary)' }}>{risk.text}</p>
                  <div className="pl-8">
                    <button
                      onClick={() => showToast('Настройки открыты. Лимит можно задать в разделе ролей.', 'info')}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>
                      {risk.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ===== PULSE MODAL ===== */}
      {showPulseModal && (
        <div className="modal-backdrop fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowPulseModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full max-h-[90vh] relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPulseModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>

            <div className="modal-scroll overflow-y-auto max-h-[90vh] p-6 md:p-8">
              {/* Title */}
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Пульс сообщества</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Показывает, насколько сейчас в сообществе всё работает без заметных провалов: новички получают первую связь, запросы не остаются без ответа, Вклад замечается, оплата и доступ работают корректно, а настройки не создают перегрузку.</p>

              {/* Score */}
              <div className="flex items-center gap-4 mb-6 pb-5" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-4xl font-bold" style={{ color: 'var(--gold)' }}>74<span className="text-lg ml-1" style={{ color: 'var(--text-muted)' }}>/100</span></p>
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Среда стабильна</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Есть точки внимания, но в целом сообщество держит хороший ритм.</p>
                </div>
              </div>

              {/* Scales */}
              <div className="mb-6">
                <h3 className="section-heading">Что влияет на Пульс</h3>
                <div className="space-y-4">
                  {pulseItems.map((item) => (
                    <div key={item.label}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>{item.label}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.value}/100</span>
                      </div>
                      <div className="micro-progress mb-1.5">
                        <div className="micro-progress-fill fill-bar" style={{ ['--target-width' as string]: `${item.value}%`, width: `${item.value}%`, backgroundColor: item.value >= 70 ? SAGE : item.value >= 50 ? 'var(--gold)' : TERRACOTTA }} />
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What lowers pulse */}
              <div className="mb-6">
                <h3 className="section-heading">Что снижает Пульс сейчас</h3>
                <div className="space-y-2">
                  {pulseDownItems.map((text, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-sm mt-0.5" style={{ color: TERRACOTTA }}>—</span>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* What supports pulse */}
              <div className="mb-6">
                <h3 className="section-heading">Что поддерживает Пульс</h3>
                <div className="space-y-2">
                  {pulseUpItems.map((text, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: SAGE }} />
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Return Index */}
              <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: GOLD_GLOW, border: `1px solid ${GOLD_BORDER}` }}>
                <div className="flex items-center gap-2 mb-2">
                  <TrendIcon className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Индекс отдачи: 1.34</span>
                </div>
                <p className="text-xs leading-relaxed mb-2" style={{ color: 'var(--text-secondary)' }}>
                  На 1 запрос помощи приходится 1.34 полезного отклика: ответ, благодарность, разбор, помощь новичку или сохранённый Инсайт.
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  Значение выше 1 — хороший знак: участники не только получают помощь, но и начинают отдавать её другим.
                </p>
              </div>

              {/* What it means now */}
              <div className="mb-6">
                <h3 className="section-heading">Что это значит сейчас</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Среда стабильна. Главные слабые места — доступ после оплаты и первая связь новичков. Сильные стороны — Вклад, запросы и взаимопомощь.
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => { showToast('Доступ открыт. Участник получил уведомление.', 'success'); }} className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>Проверить доступ</button>
                <button onClick={() => { showToast('Открываю раздел подбора опоры...', 'info'); }} className="px-4 py-2 rounded-lg text-xs font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Подобрать опору новичкам</button>
                <button onClick={() => { showToast('Функция в разработке', 'info'); }} className="px-4 py-2 rounded-lg text-xs transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Настроить лимит Помощника на старте</button>
              </div>

              {/* How it's calculated - collapsed by default */}
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                <button
                  onClick={() => setShowParamDescriptions(!showParamDescriptions)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left"
                >
                  <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{showParamDescriptions ? 'Как считается Пульс' : 'Что означают параметры'}</span>
                  <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ color: 'var(--text-muted)', transform: showParamDescriptions ? 'rotate(180deg)' : 'rotate(0deg)' }} />
                </button>
                {showParamDescriptions && (
                  <div className="px-4 pb-4 space-y-3">
                    {paramDescriptions.map((p, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-xs font-medium shrink-0" style={{ color: 'var(--text-primary)' }}>{p.label}</span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>— {p.desc}</span>
                      </div>
                    ))}
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-xs font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Формула</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        Первая связь + Запросы + Вклад + Взаимопомощь + Доступ и оплата + Настройки и риски / 6
                      </p>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                        60 + 82 + 91 + 76 + 47 + 88 = 444 / 6 = 74
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RIGHT PANEL ===== */}
      <aside className="w-full lg:w-[240px] shrink-0 space-y-5 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar">

        {/* Advisor */}
        {!advisorHidden && (
          <div className="p-1">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
                <h3 className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>Советник</h3>
              </div>
              <button onClick={() => setAdvisorHidden(true)} className="p-0.5 rounded transition-colors" style={{ color: 'var(--text-muted)' }}>
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>
              Сегодня хороший день, чтобы передать одну задачу участнику. Попробуйте предложить Анне функцию «Помощник на старте» — она уже помогала новичкам.
            </p>

            {/* Why I see this */}
            <button
              onClick={() => setShowAdvisorWhy(!showAdvisorWhy)}
              className="text-[11px] mb-3 transition-colors hover:opacity-80"
              style={{ color: 'var(--text-muted)' }}
            >
              {showAdvisorWhy ? 'Скрыть' : 'Почему я это вижу?'}
            </button>
            {showAdvisorWhy && (
              <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Советник показывает этот совет, потому что 3 новичка находятся в первые 7 дней и пока не получили первой связи. Сейчас нет активных Помощников на старте, поэтому системе важно предложить лидеру подобрать опору вручную.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-2 mb-2">
              <button onClick={() => showToast('Предложение отправлено Анне Морозовой', 'success')} className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Предложить Анне</button>
            </div>
          </div>
        )}

        {/* Compact tip when advisor is hidden */}
        {advisorHidden && (
          <button onClick={() => setAdvisorHidden(false)} className="w-full text-left p-1 transition-all duration-200 hover:-translate-y-0.5">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-3.5 h-3.5" style={{ color: 'var(--gold)' }} />
              <span className="text-xs font-medium" style={{ color: 'var(--gold)' }}>Показать Советника</span>
            </div>
          </button>
        )}

      </aside>
    </div>
  );
}
