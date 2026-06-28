import { useMemo, useState } from 'react';
import { Check, ChevronDown, HandHeart, Heart, MessageCircle, PauseCircle, RefreshCw, Send, Settings, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/ToastContext';

type ContributionState =
  | 'empty'
  | 'first_gratitude'
  | 'active'
  | 'can_help'
  | 'role_ready'
  | 'overload_protection';

type ContributionActionType =
  | 'answer'
  | 'newcomer_help'
  | 'review'
  | 'insight'
  | 'gratitude'
  | 'ritual';

type ContributionAction = {
  id: number;
  type: ContributionActionType;
  title: string;
  person?: string;
  description: string;
  confirmation?: string;
  status: string;
  actions: string[];
};

type ModalType = 'help-ready' | 'answer' | 'gratitude' | null;
type FootprintTab = 'Действия' | 'Благодарности';

const contributionMock: {
  state: ContributionState;
  level: number;
  levelTitle: string;
  usefulActions: number;
  thanks: number;
  opportunities: number;
  comfortLimit: number;
  helpPaused: boolean;
} = {
  state: 'active',
  level: 2,
  levelTitle: 'Помогающий на шаге',
  usefulActions: 7,
  thanks: 3,
  opportunities: 2,
  comfortLimit: 1,
  helpPaused: false,
};

const usefulActions: ContributionAction[] = [
  { id: 1, type: 'answer', title: 'Ответ помог участнику', person: 'Мария', description: 'Вы коротко подсказали, как выбрать первый frontend-проект без лишней сложности.', confirmation: 'Мария отметила ответ полезным.', status: 'Засчитано во Вклад', actions: ['Открыть ответ', 'Поблагодарить за отклик'] },
  { id: 2, type: 'insight', title: 'Вопрос стал полезным', person: 'Новички потока', description: 'Ваш вопрос помог сформулировать Инсайт о том, как не усложнять первый pet-проект.', confirmation: 'Инсайт сохранён для других участников.', status: 'След пользы', actions: ['Открыть Инсайт', 'Сохранить себе'] },
  { id: 3, type: 'newcomer_help', title: 'Помощь новичку', person: 'Елена', description: 'Вы поддержали участницу на первом шаге и помогли выбрать маленькое действие.', confirmation: 'Елена сделала следующий шаг.', status: 'Помощь на старте', actions: ['Посмотреть диалог', 'Предложить следующий шаг'] },
  { id: 4, type: 'review', title: 'Бережный разбор', person: 'Пётр', description: 'Вы дали спокойный разбор структуры карточки и предложили одно улучшение.', confirmation: 'Пётр отметил разбор полезным.', status: 'Польза подтверждена', actions: ['Открыть разбор', 'Сохранить вывод'] },
];

const gratitudeActions: ContributionAction[] = [
  { id: 5, type: 'gratitude', title: 'Мария поблагодарила вас', person: 'Мария', description: 'Ответ помог ей выбрать первый проект и не брать слишком сложную идею.', confirmation: 'Благодарность стала видимым следом пользы.', status: 'Польза подтверждена', actions: ['Открыть благодарность', 'Ответить тепло'] },
  { id: 6, type: 'review', title: 'Пётр отметил разбор полезным', person: 'Пётр', description: 'Разбор помог аккуратнее оформить состояние карточки и подготовиться к встрече.', confirmation: 'Польза подтверждена участником.', status: 'Засчитано во Вклад', actions: ['Открыть разбор'] },
  { id: 7, type: 'gratitude', title: 'Вы поблагодарили Анну', person: 'Анна', description: 'Анна помогла выбрать первый шаг, а ваша благодарность поддержала культуру Вклада.', confirmation: 'Полезное действие стало видимым.', status: 'След пользы', actions: ['Открыть сообщение'] },
];

const opportunities = [
  { title: 'Ответить новичку', text: 'Новичок выбирает первый frontend-проект.', meta: 'Нагрузка: короткий ответ · 5–10 минут.', primary: 'Ответить', secondary: 'Не сейчас' },
  { title: 'Поблагодарить', text: 'Анна помогла вам выбрать первый шаг.', meta: 'Благодарность поддержит живой цикл помощи.', primary: 'Поблагодарить', secondary: 'Позже' },
  { title: 'Готовность помогать', text: 'Отметьте, где вы готовы быть полезны. Это не обязанность.', meta: 'Можно изменить лимит или поставить паузу.', primary: 'Настроить готовность', secondary: 'Поставить паузу' },
];

const contributionLevels = ['Первый след', 'Помогающий на шаге', 'Участник ритма', 'Надёжный отклик', 'Опора рядом', 'Помощник на старте', 'Связующий', 'Хранитель знания', 'Носитель ценности'];
const helpTopics = ['первый шаг', 'frontend pet-проект', 'подготовка к разбору', 'как задать вопрос', 'портфолио', 'участие во встречах', 'другое'];
const lifeBook = ['Сергей ответил новичку', 'Мария поблагодарила Анну', 'Пётр получил разбор', 'из ответа сохранён Инсайт'];

function SoftButton({ children, variant = 'ghost', onClick }: { children: React.ReactNode; variant?: 'primary' | 'ghost' | 'quiet'; onClick?: () => void }) {
  const styles = variant === 'primary'
    ? 'border-transparent bg-[var(--gold)] text-white shadow-[0_14px_32px_rgba(201,169,110,0.22)] hover:translate-y-[-1px]'
    : variant === 'quiet'
      ? 'border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]';
  return <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${styles}`}>{children}</button>;
}

function StatusPill({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold text-[var(--gold)]" style={{ borderColor: 'rgba(201,169,110,0.36)', backgroundColor: 'rgba(201,169,110,0.1)' }}>{children}</span>;
}

function SectionCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-3xl border bg-[var(--bg-card)] p-5 shadow-[var(--card-shadow)] ${className}`} style={{ borderColor: 'var(--border-color)' }}>{children}</section>;
}

export default function ContributionPage() {
  const { showToast } = useToast();
  const [tab, setTab] = useState<FootprintTab>('Действия');
  const [modal, setModal] = useState<ModalType>(null);
  const [levelsOpen, setLevelsOpen] = useState(false);
  const [whatOpen, setWhatOpen] = useState(false);
  const [helpPaused, setHelpPaused] = useState(contributionMock.helpPaused);
  const footprintItems = useMemo(() => tab === 'Действия' ? usefulActions : gratitudeActions, [tab]);
  const toast = (message: string) => showToast(message, 'success');

  const handleOpportunity = (label: string) => {
    if (label === 'Ответить') setModal('answer');
    else if (label === 'Поблагодарить') setModal('gratitude');
    else if (label === 'Настроить готовность') setModal('help-ready');
    else if (label === 'Поставить паузу') { setHelpPaused(true); showToast('Помощь поставлена на паузу. Новые обращения не будут предлагаться.', 'info'); }
    else showToast('Хорошо, можно вернуться к этому позже.', 'info');
  };

  return <main className="flex-1 min-w-0 space-y-5">
    <section className="rounded-3xl border bg-[var(--bg-card)] p-6 shadow-[var(--card-shadow)]" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text-muted)]">Сообщество · Вклад</p><h1 className="mt-2 text-3xl font-bold text-[var(--text-primary)]">Вклад</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">Ваш полезный след в сообществе: ответы, благодарности, разборы, инсайты и помощь людям, которые помогли кому-то сделать следующий шаг.</p></div>
        <button onClick={() => showToast('Данные обновлены.', 'info')} className="inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]" style={{ borderColor: 'var(--border-color)' }}><RefreshCw className="h-4 w-4" />Обновлено 4 минуты назад · Обновить</button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
        ['Уровень', `${contributionMock.level} из 9`, 'Вы начинаете помогать другим'], ['Полезные действия', String(contributionMock.usefulActions), 'За последние 30 дней'], ['Благодарности', String(contributionMock.thanks), 'Польза подтверждена'], ['Можно помочь', `${contributionMock.opportunities} возможности`, 'Без обязательств']
      ].map(([label, value, text]) => <div key={label} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}><p className="text-xs text-[var(--text-muted)]">{label}</p><p className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">{value}</p><p className="mt-1 text-sm text-[var(--text-secondary)]">{text}</p></div>)}</div>
    </section>

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
      <div className="space-y-5">
        <SectionCard><div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><StatusPill>Польза подтверждена</StatusPill><h2 className="mt-4 text-2xl font-semibold text-[var(--text-primary)]">Ваш вклад уже заметен</h2><p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">За последние недели вы сделали 7 полезных действий: ответили на вопросы, поблагодарили за помощь и помогли сохранить один Инсайт для других участников.</p></div><Heart className="h-10 w-10 text-[var(--gold)]" /></div><div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}><p className="font-semibold text-[var(--text-primary)]">Что особенно важно:</p><ul className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)] md:grid-cols-2">{['Мария отметила ваш ответ полезным', 'ваш вопрос помог сохранить Инсайт для новичков', 'вы поддержали участника на первом шаге', 'одна благодарность стала видимым Вкладом'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />{item}</li>)}</ul></div><div className="mt-4 flex flex-wrap gap-2"><SoftButton onClick={() => setTab('Действия')}>Посмотреть действия</SoftButton><SoftButton onClick={() => setTab('Благодарности')}>Посмотреть благодарности</SoftButton><SoftButton variant="primary" onClick={() => setModal('help-ready')}>Готов помогать</SoftButton></div></SectionCard>

        <SectionCard><div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><div><h2 className="text-xl font-semibold text-[var(--text-primary)]">Полезный след</h2><p className="mt-1 text-sm text-[var(--text-secondary)]">Действия и благодарности, где польза стала видимой.</p></div><div className="flex rounded-2xl border p-1" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>{(['Действия', 'Благодарности'] as FootprintTab[]).map((item) => <button key={item} onClick={() => setTab(item)} className="rounded-xl px-4 py-2 text-sm font-semibold transition" style={{ backgroundColor: tab === item ? 'var(--bg-card)' : 'transparent', color: tab === item ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{item}</button>)}</div></div>{footprintItems.length ? <div className="mt-4 grid gap-3 md:grid-cols-2">{footprintItems.map((item) => <article key={item.id} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-[var(--text-primary)]">{item.title}</h3><StatusPill>{item.status}</StatusPill></div><p className="mt-2 text-sm text-[var(--text-muted)]">Кому помогло: {item.person}</p><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.description}</p>{item.confirmation && <p className="mt-3 rounded-xl p-3 text-sm text-[var(--text-primary)]" style={{ backgroundColor: 'var(--hover-bg)' }}>{item.confirmation}</p>}<div className="mt-3 flex flex-wrap gap-2">{item.actions.map((action) => <SoftButton key={action} variant="quiet" onClick={() => showToast(`${action}: действие будет доступно в следующей итерации.`, 'info')}>{action}</SoftButton>)}</div></article>)}</div> : <EmptyState kind="thanks" onAction={() => setModal('answer')} />}</SectionCard>

        <SectionCard><h2 className="text-xl font-semibold text-[var(--text-primary)]">Можно помочь без давления</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Небольшие действия, где ваш опыт может быть полезен. Можно выбрать одно или спокойно пропустить.</p>{helpPaused ? <EmptyState kind="paused" onAction={() => { setHelpPaused(false); showToast('Помощь снова доступна, с учётом вашего лимита.', 'success'); }} /> : <div className="mt-4 grid gap-3 lg:grid-cols-3">{opportunities.map((item) => <article key={item.title} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}><h3 className="font-semibold text-[var(--text-primary)]">{item.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{item.text}</p><p className="mt-2 text-xs text-[var(--text-muted)]">{item.meta}</p><div className="mt-4 flex flex-wrap gap-2"><SoftButton variant="primary" onClick={() => handleOpportunity(item.primary)}>{item.primary}</SoftButton><SoftButton variant="quiet" onClick={() => handleOpportunity(item.secondary)}>{item.secondary}</SoftButton></div></article>)}</div>}</SectionCard>

        <SectionCard><div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between"><div><h2 className="text-xl font-semibold text-[var(--text-primary)]">Уровни Вклада</h2><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Уровень показывает не статус “лучше других”, а то, как растёт ваш полезный след в сообществе.</p></div><Sparkles className="h-8 w-8 text-[var(--gold)]" /></div><div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'rgba(201,169,110,0.38)', backgroundColor: 'rgba(201,169,110,0.08)' }}><p className="font-semibold text-[var(--text-primary)]">Уровень 2 · Помогающий на шаге</p><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Вы уже можете быть полезны тем, кто проходит похожий шаг. Важно помогать спокойно и не брать больше, чем комфортно.</p><p className="mt-3 text-sm font-semibold text-[var(--text-primary)]">Следующий мягкий шаг:</p><p className="mt-1 text-sm text-[var(--text-secondary)]">Ответить на один вопрос новичка или поблагодарить человека, который помог вам.</p></div><div className="mt-4 flex flex-wrap gap-2"><SoftButton onClick={() => setModal('answer')}>Посмотреть возможности</SoftButton><SoftButton onClick={() => setModal('help-ready')}>Настроить готовность помогать</SoftButton><SoftButton variant="quiet" onClick={() => setLevelsOpen(!levelsOpen)}>{levelsOpen ? 'Скрыть уровни' : 'Показать все уровни'}<ChevronDown className={`h-4 w-4 transition ${levelsOpen ? 'rotate-180' : ''}`} /></SoftButton></div>{levelsOpen && <ol className="mt-4 grid gap-2 sm:grid-cols-3">{contributionLevels.map((level, index) => <li key={level} className="rounded-2xl border p-3 text-sm" style={{ borderColor: index + 1 === contributionMock.level ? 'rgba(201,169,110,0.55)' : 'var(--border-color)', backgroundColor: index + 1 === contributionMock.level ? 'rgba(201,169,110,0.08)' : 'transparent', color: 'var(--text-primary)' }}><span className="font-semibold">{index + 1}.</span> {level}</li>)}</ol>}<div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><button onClick={() => setWhatOpen(!whatOpen)} className="flex w-full items-center justify-between text-left font-semibold text-[var(--text-primary)]">Что считается Вкладом?<ChevronDown className={`h-4 w-4 transition ${whatOpen ? 'rotate-180' : ''}`} /></button>{whatOpen && <div className="mt-3 text-sm leading-6 text-[var(--text-secondary)]"><p>Вклад — это полезное действие, которое помогло человеку или сообществу.</p><ul className="mt-2 grid gap-1">{['ответ помог участнику сделать шаг', 'благодарность подтвердила пользу', 'разбор помог улучшить работу', 'помощь новичку дала первую связь', 'Инсайт сохранил полезный вывод для других', 'участие в ритуале поддержало ритм сообщества'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-1 h-4 w-4 shrink-0 text-[var(--gold)]" />{item}</li>)}</ul><p className="mt-3 text-[var(--text-muted)]">Вклад не сравнивает вас с другими. Он показывает ваш полезный след.</p></div>}</div></SectionCard>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar"><SideBlock title="Сейчас можно" icon={<MessageCircle className="h-5 w-5 text-[var(--gold)]" />}><p className="font-semibold text-[var(--text-primary)]">Ответить на один вопрос</p><p className="mt-1 text-sm text-[var(--text-secondary)]">Елена выбирает frontend pet-проект.</p><div className="mt-3"><SoftButton variant="primary" onClick={() => setModal('answer')}>Посмотреть</SoftButton></div></SideBlock><SideBlock title="Ваш комфорт важен" icon={<PauseCircle className="h-5 w-5 text-[var(--gold)]" />}><p className="text-sm text-[var(--text-secondary)]">Вы можете помогать только тогда, когда есть ресурс.</p><p className="mt-3 text-sm text-[var(--text-muted)]">Текущий лимит:</p><p className="font-semibold text-[var(--text-primary)]">{contributionMock.comfortLimit} активное обращение</p><div className="mt-3"><SoftButton onClick={() => setModal('help-ready')}>Настроить лимит</SoftButton></div></SideBlock><SideBlock title="Мои темы помощи" icon={<Settings className="h-5 w-5 text-[var(--gold)]" />}><ul className="space-y-2 text-sm text-[var(--text-secondary)]">{helpTopics.slice(0, 3).map((topic) => <li key={topic} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-[var(--gold)]" />{topic}</li>)}</ul><div className="mt-3"><SoftButton variant="quiet" onClick={() => setModal('help-ready')}>Изменить темы</SoftButton></div></SideBlock><SideBlock title="Книга жизни сообщества" icon={<HandHeart className="h-5 w-5 text-[var(--gold)]" />}><p className="text-sm text-[var(--text-secondary)]">Сегодня уже произошло 4 полезных действия:</p><ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">{lifeBook.map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 text-[var(--gold)]" />{item}</li>)}</ul><p className="mt-3 text-xs leading-5 text-[var(--text-muted)]">Это не рейтинг. Это тихое напоминание, что добро в сообществе видно.</p><div className="mt-3"><SoftButton variant="quiet" onClick={() => showToast('Книга жизни сообщества откроется в следующей итерации.', 'info')}>Посмотреть хорошие действия</SoftButton></div></SideBlock></aside>
    </div>

    <HelpReadyDialog open={modal === 'help-ready'} onClose={() => setModal(null)} onSubmit={() => { setModal(null); toast('Готовность помогать обновлена. Мы будем учитывать вашу комфортную нагрузку.'); }} />
    <AnswerDialog open={modal === 'answer'} onClose={() => setModal(null)} onSubmit={(draft) => { setModal(null); showToast(draft ? 'Черновик ответа сохранён.' : 'Ответ отправлен. Если Елена отметит его полезным, он станет видимым Вкладом.', draft ? 'info' : 'success'); }} />
    <GratitudeDialog open={modal === 'gratitude'} onClose={() => setModal(null)} onSubmit={() => { setModal(null); toast('Благодарность отправлена. Полезное действие стало видимым.'); }} />
  </main>;
}

function SideBlock({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return <section className="rounded-3xl border bg-[var(--bg-card)] p-5 shadow-[var(--card-shadow)]" style={{ borderColor: 'var(--border-color)' }}><h2 className="flex items-center gap-2 font-semibold text-[var(--text-primary)]">{icon}{title}</h2><div className="mt-3">{children}</div></section>;
}

function EmptyState({ kind, onAction }: { kind: 'empty' | 'thanks' | 'opportunities' | 'paused'; onAction: () => void }) {
  const data = {
    empty: ['Ваш Вклад ещё впереди', 'Вклад начинается с маленьких действий: поблагодарить за помощь, задать хороший вопрос, поддержать новичка или сохранить полезный Инсайт.', 'Посмотреть, где можно помочь'],
    thanks: ['Благодарности ещё впереди', 'Когда ваша помощь кому-то пригодится, участник сможет отметить пользу. Это станет видимым следом Вклада.', 'Посмотреть возможности помочь'],
    opportunities: ['Сейчас нет подходящих возможностей', 'Хороший знак: по вашим темам пока никто не ждёт помощи. Можно вернуться позже или поставить готовность помогать на паузу.', 'Настроить готовность'],
    paused: ['Помощь сейчас на паузе', 'Мы не будем предлагать вам новые обращения, пока пауза включена. Уже сделанный Вклад остаётся видимым.', 'Возобновить помощь'],
  }[kind];
  return <div className="mt-4 rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}><Heart className="mx-auto h-8 w-8 text-[var(--gold)]" /><h3 className="mt-3 font-semibold text-[var(--text-primary)]">{data[0]}</h3><p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">{data[1]}</p><div className="mt-4"><SoftButton variant="primary" onClick={onAction}>{data[2]}</SoftButton></div></div>;
}

function HelpReadyDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: () => void }) {
  return <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Готовность помогать</DialogTitle><DialogDescription>Отметьте, где вы готовы быть полезны другим. Это не обязанность: можно отказаться, поставить помощь на паузу или изменить лимит в любой момент.</DialogDescription></DialogHeader><div className="space-y-4"><div><p className="mb-2 text-sm font-semibold">Темы:</p><div className="grid gap-2 sm:grid-cols-2">{helpTopics.map((topic, index) => <label key={topic} className="flex items-center gap-2 rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--border-color)' }}><input type="checkbox" defaultChecked={index < 3} />{topic}</label>)}</div></div><div><p className="mb-2 text-sm font-semibold">Сколько активных обращений комфортно?</p><div className="grid gap-2 sm:grid-cols-2">{['1 человек', '2 человека', 'только разово', 'сейчас не готов помогать'].map((limit, index) => <label key={limit} className="flex items-center gap-2 rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--border-color)' }}><input type="radio" name="limit" defaultChecked={index === 0} />{limit}</label>)}</div></div><label className="flex items-center gap-2 rounded-xl border p-3 text-sm" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}><input type="checkbox" />Поставить помощь на паузу</label></div><DialogFooter><SoftButton variant="primary" onClick={onSubmit}>Сохранить готовность</SoftButton><SoftButton variant="quiet" onClick={onClose}>Вернуться</SoftButton></DialogFooter></DialogContent></Dialog>;
}

function AnswerDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (draft?: boolean) => void }) {
  return <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Ответить Елене</DialogTitle><DialogDescription>Ответ не обязан быть идеальным. Достаточно короткого отклика, который поможет сделать следующий шаг.</DialogDescription></DialogHeader><div className="space-y-3 text-sm"><div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}><p className="font-semibold">Вопрос Елены:</p><p className="mt-2">“Какой проект лучше выбрать, чтобы не сделать слишком сложно?”</p></div><label className="grid gap-2"><span className="font-semibold">Ваш ответ</span><textarea rows={4} placeholder="Напишите один спокойный совет или следующий шаг." className="rounded-xl border bg-transparent p-3 outline-none" style={{ borderColor: 'var(--border-color)' }} /></label><label className="flex items-center gap-2"><input type="checkbox" />Предложить сохранить ответ как Инсайт, если он поможет другим</label></div><DialogFooter><SoftButton variant="primary" onClick={() => onSubmit(false)}><Send className="h-4 w-4" />Отправить ответ</SoftButton><SoftButton onClick={() => onSubmit(true)}>Сохранить черновик</SoftButton><SoftButton variant="quiet" onClick={onClose}>Вернуться</SoftButton></DialogFooter></DialogContent></Dialog>;
}

function GratitudeDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: () => void }) {
  return <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Поблагодарить за помощь</DialogTitle><DialogDescription>Благодарность помогает человеку понять, что его помощь была полезной. Это поддерживает культуру Вклада.</DialogDescription></DialogHeader><div className="space-y-3 text-sm"><div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}><p className="font-semibold">За что благодарим:</p><p className="mt-1">Анна помогла вам выбрать первый шаг.</p></div><div><p className="mb-2 font-semibold">Готовые варианты:</p><div className="flex flex-wrap gap-2">{['помогла выбрать первый шаг', 'объяснила сложную тему', 'дала полезный разбор', 'поддержала на старте', 'помогла не застрять'].map((item) => <StatusPill key={item}>{item}</StatusPill>)}</div></div><label className="grid gap-2"><span className="font-semibold">Сообщение:</span><textarea rows={3} defaultValue="Спасибо! Твой совет помог мне спокойнее выбрать первый шаг и не пытаться сделать весь проект сразу." className="rounded-xl border bg-transparent p-3 outline-none" style={{ borderColor: 'var(--border-color)' }} /></label></div><DialogFooter><SoftButton variant="primary" onClick={onSubmit}>Отправить благодарность</SoftButton><SoftButton variant="quiet" onClick={onClose}>Вернуться</SoftButton></DialogFooter></DialogContent></Dialog>;
}
