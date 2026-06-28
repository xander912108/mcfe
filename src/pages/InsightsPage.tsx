import { useMemo, useState } from 'react';
import { BookOpen, Check, FileText, HandHeart, Lightbulb, MessageCircleQuestion, RefreshCw, Sparkles } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/ToastContext';

type InsightType =
  | 'from_question'
  | 'from_review'
  | 'from_gratitude'
  | 'for_newcomers'
  | 'from_experience'
  | 'my_trace';

type Insight = {
  id: number;
  type: InsightType;
  title: string;
  summary: string;
  source: string;
  usefulFor: string[];
  applySteps: string[];
  contributionNote?: string;
  badge?: string;
  saved?: boolean;
  relatedToMyStep?: boolean;
  myTrace?: boolean;
};

type ModalType = 'suggest' | 'save' | 'source' | null;

const insights: Insight[] = [
  {
    id: 1,
    type: 'from_question',
    title: 'Не начинайте pet-проект с авторизации',
    summary: 'Сначала лучше собрать простое ядро: сущность, базовые действия и сохранение данных. Авторизацию стоит добавлять позже, когда уже есть работающий результат.',
    source: 'Ответ Сергея Волкова на вопрос Артёма про первый API на Go',
    usefulFor: ['первый pet-проект', 'Backend', 'новичкам'],
    applySteps: ['выбрать одну главную сущность', 'сделать 2–3 базовых действия', 'не добавлять авторизацию до первого результата', 'показать простую версию на разборе'],
    contributionNote: 'Вопрос участника стал спокойной опорой для тех, кто начинает похожий проект.',
    badge: 'Родился из вопроса участника',
    relatedToMyStep: true,
  },
  {
    id: 2,
    type: 'from_review',
    title: 'Показывайте один экран, а не весь проект',
    summary: 'На первом разборе полезнее показать один понятный сценарий и попросить обратную связь по нему, чем приносить весь проект сразу.',
    source: 'Разбор работы Иры про экран списка задач',
    usefulFor: ['Frontend', 'первый разбор'],
    applySteps: ['выбрать один пользовательский сценарий', 'подготовить 1–2 вопроса', 'показать только важный фрагмент'],
    contributionNote: 'Разбор участницы превратился в знание, которое снижает тревогу перед первой встречей.',
    badge: 'Из живого разбора',
    relatedToMyStep: true,
  },
  {
    id: 3,
    type: 'from_gratitude',
    title: 'Благодарность помогает понять, что ответ сработал',
    summary: 'Если ответ помог сделать шаг, короткая благодарность фиксирует пользу и помогает сохранить вывод для других участников.',
    source: 'Благодарность Даниила за помощь с состоянием формы',
    usefulFor: ['Вклад', 'Frontend'],
    applySteps: ['коротко описать, что помогло', 'отметить следующий шаг', 'сохранить вывод как Инсайт'],
    contributionNote: 'Польза подтверждена живым действием, а не оценкой или рейтингом.',
    badge: 'Польза подтверждена',
    saved: true,
  },
  {
    id: 4,
    type: 'for_newcomers',
    title: 'Первый вопрос можно задать неидеально',
    summary: 'Достаточно описать, что пробовали, где стало непонятно и какой следующий шаг хочется сделать. Идеальная формулировка не нужна.',
    source: 'Welcome-обсуждение новичков июльского потока',
    usefulFor: ['новичкам', 'первые 7 дней'],
    applySteps: ['написать контекст в 2–3 предложениях', 'показать, где стало сложно', 'попросить один конкретный совет'],
    contributionNote: 'Инсайт помогает быстрее получить первую связь и не оставаться одному с вопросом.',
    badge: 'Хорошо для первых 7 дней',
  },
  {
    id: 5,
    type: 'from_experience',
    title: 'Перед рефакторингом зафиксируйте рабочую версию',
    summary: 'Если проект уже запускается, лучше сначала сохранить рабочий шаг, а потом спокойно улучшать структуру.',
    source: 'Опыт участников после недели работы над pet-проектами',
    usefulFor: ['Frontend', 'Backend', 'практика'],
    applySteps: ['сделать короткую заметку о текущей версии', 'проверить основной сценарий', 'после этого выделить место для улучшения'],
    contributionNote: 'Общий опыт участников стал подсказкой, которая помогает не застрять.',
    badge: 'Помогает не застрять',
  },
  {
    id: 6,
    type: 'my_trace',
    title: 'Маленький вопрос может стать опорой для других',
    summary: 'Ваш вопрос про первый экран помог сохранить вывод: начинать лучше с одного живого сценария пользователя.',
    source: 'Ваш вопрос в обсуждении про первый экран проекта',
    usefulFor: ['мой след', 'Frontend', 'новичкам'],
    applySteps: ['сформулировать один сценарий', 'попросить обратную связь', 'сохранить вывод после ответа'],
    contributionNote: 'Ваш след пользы: вопрос помог другим участникам начать спокойнее.',
    badge: 'Ваш след пользы',
    myTrace: true,
    saved: true,
  },
];

const filters = ['Все', 'Для моего шага', 'Из вопросов', 'Из разборов', 'Из благодарностей', 'Сохранённые', 'Мои следы', 'Frontend', 'Backend', 'Новичкам'];
const typeLabels: Record<InsightType, string> = {
  from_question: 'Инсайт из вопроса',
  from_review: 'Инсайт из разбора',
  from_gratitude: 'Инсайт из благодарности',
  for_newcomers: 'Инсайт для новичков',
  from_experience: 'Инсайт из опыта участников',
  my_trace: 'Инсайт из моего вопроса',
};

function SoftButton({ children, variant = 'ghost', onClick }: { children: React.ReactNode; variant?: 'primary' | 'ghost' | 'quiet'; onClick?: () => void }) {
  const styles = variant === 'primary' ? 'border-transparent bg-[var(--gold)] text-white shadow-[0_14px_32px_rgba(201,169,110,0.22)]' : variant === 'quiet' ? 'border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]' : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]';
  return <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all hover:translate-y-[-1px] ${styles}`}>{children}</button>;
}

export default function InsightsPage() {
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState('Все');
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedInsight, setSelectedInsight] = useState<Insight>(insights[0]);

  const filteredInsights = useMemo(() => insights.filter((insight) => {
    if (activeFilter === 'Все') return true;
    if (activeFilter === 'Для моего шага') return Boolean(insight.relatedToMyStep);
    if (activeFilter === 'Из вопросов') return insight.type === 'from_question';
    if (activeFilter === 'Из разборов') return insight.type === 'from_review';
    if (activeFilter === 'Из благодарностей') return insight.type === 'from_gratitude';
    if (activeFilter === 'Сохранённые') return Boolean(insight.saved);
    if (activeFilter === 'Мои следы') return Boolean(insight.myTrace);
    return insight.usefulFor.some((item) => item.toLowerCase().includes(activeFilter.toLowerCase().replace('новичкам', 'нович')));
  }), [activeFilter]);

  const openModal = (type: ModalType, insight = selectedInsight) => { setSelectedInsight(insight); setModal(type); };
  const addToStep = () => showToast('Инсайт добавлен к текущему шагу.', 'success');

  return <main className="flex-1 min-w-0 space-y-5 pb-8">
    <section className="rounded-3xl border bg-[var(--bg-card)] p-5 shadow-[var(--card-shadow)] md:p-7" style={{ borderColor: 'var(--border-color)' }}>
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]"><span>IT технологии</span><span className="text-[var(--gold)]">›</span><span className="text-[var(--text-secondary)]">Инсайты</span></div><h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Инсайты</h1><p className="mt-3 max-w-4xl text-sm leading-6 text-[var(--text-secondary)]">Живые выводы сообщества: полезные ответы, находки из разборов, вопросы участников и практические советы, которые помогают другим двигаться быстрее и спокойнее.</p></div><button className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-bg)]" style={{ borderColor: 'var(--border-color)' }}>Обновлено 6 минут назад · <RefreshCw className="h-3.5 w-3.5" /> Обновить</button></div>
    </section>

    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      ['18 Инсайтов', 'Сохранено в сообществе'], ['4 для моего шага', 'Можно применить сейчас'], ['3 из разборов', 'Родились из работ участников'], ['2 моих следа', 'Ваши вопросы помогли другим'],
    ].map(([value, text]) => <article key={value} className="rounded-2xl border bg-[var(--bg-card)] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.035)]" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-lg font-semibold text-[var(--text-primary)]">{value}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{text}</p></article>)}</section>

    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]"><div className="space-y-5">
      <section className="rounded-[28px] border p-5 md:p-7" style={{ borderColor: 'rgba(201,169,110,0.42)', background: 'linear-gradient(135deg, rgba(201,169,110,0.18), var(--bg-card) 45%, var(--bg-card))' }}>
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-[var(--gold)]"><Sparkles className="h-3.5 w-3.5" /> Полезно для первого проекта</div><h2 className="text-2xl font-semibold text-[var(--text-primary)]">Подходит вашему шагу</h2><h3 className="mt-4 text-xl font-semibold text-[var(--text-primary)]">{insights[0].title}</h3><p className="mt-2 text-sm font-semibold text-[var(--gold)]">Источник: {insights[0].source}</p><p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">{insights[0].summary}</p><div className="mt-5 rounded-2xl border bg-[var(--bg-card)] p-4" style={{ borderColor: 'var(--border-color)' }}><p className="font-semibold text-[var(--text-primary)]">Почему это полезно вам:</p><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Вы сейчас готовите первый pet-проект. Этот Инсайт поможет не усложнить старт и быстрее показать результат на разборе.</p><p className="mt-4 font-semibold text-[var(--text-primary)]">Как применить:</p><ul className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)] md:grid-cols-2">{insights[0].applySteps.map((step) => <li key={step} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />{step}</li>)}</ul></div><div className="mt-6 flex flex-wrap gap-2.5"><SoftButton variant="primary" onClick={() => openModal('save', insights[0])}>Сохранить себе</SoftButton><SoftButton onClick={addToStep}>Добавить к моему шагу</SoftButton><SoftButton variant="quiet" onClick={() => openModal('source', insights[0])}>Открыть источник</SoftButton></div>
      </section>

      <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold text-[var(--text-primary)]">Лента Инсайтов</h2><div className="mt-4 flex flex-wrap gap-2">{filters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${activeFilter === filter ? 'border-transparent bg-[var(--gold)] text-white' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}>{filter}</button>)}</div>{filteredInsights.length === 0 ? <InsightsEmptyState activeFilter={activeFilter} onAll={() => setActiveFilter('Все')} onSuggest={() => setModal('suggest')} /> : <div className="mt-4 grid gap-3 lg:grid-cols-2">{filteredInsights.map((insight, index) => <InsightCard key={insight.id} insight={insight} onSave={() => openModal('save', insight)} onSource={() => openModal('source', insight)} onStep={addToStep} onToast={(message) => showToast(message, 'info')} extra={index === 2 ? <SuggestBlock onSuggest={() => setModal('suggest')} /> : null} />)}</div>}</section>
    </div><aside className="space-y-4 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar"><SideCard icon={<Lightbulb className="h-5 w-5 text-[var(--gold)]" />} title="Живое знание"><p className="text-sm leading-6 text-[var(--text-secondary)]">Инсайт связывает источник, пользу, применение и Вклад — так ответы не пропадают после обсуждения.</p></SideCard><SideCard icon={<Sparkles className="h-5 w-5 text-[var(--gold)]" />} title="Для вашего шага"><ul className="space-y-2 text-sm text-[var(--text-secondary)]"><li>Показывайте один экран, а не весь проект</li><li>Первый вопрос можно задать неидеально</li><li>Не усложняйте pet-проект на старте</li></ul><div className="mt-4"><SoftButton variant="quiet" onClick={() => setActiveFilter('Для моего шага')}>Посмотреть все</SoftButton></div></SideCard><SideCard icon={<BookOpen className="h-5 w-5 text-[var(--gold)]" />} title="Сохранённые"><p className="text-sm text-[var(--text-secondary)]">3 Инсайта сохранены в ваш путь.</p><div className="mt-4"><SoftButton variant="quiet" onClick={() => setActiveFilter('Сохранённые')}>Открыть сохранённые</SoftButton></div></SideCard><SideCard icon={<HandHeart className="h-5 w-5 text-[var(--gold)]" />} title="Мои следы"><ul className="space-y-2 text-sm text-[var(--text-secondary)]"><li>1 Инсайт из вашего вопроса</li><li>1 благодарность помогла подтвердить пользу</li></ul><div className="mt-4"><SoftButton variant="quiet" onClick={() => setActiveFilter('Мои следы')}>Открыть мои следы</SoftButton></div></SideCard><SideCard icon={<FileText className="h-5 w-5 text-[var(--gold)]" />} title="Можно предложить Инсайт"><p className="text-sm leading-6 text-[var(--text-secondary)]">Ваш ответ в обсуждении про первый экран может быть полезен другим новичкам.</p><div className="mt-4 flex flex-col gap-2"><SoftButton variant="ghost" onClick={() => setModal('suggest')}>Предложить Инсайт</SoftButton><SoftButton variant="quiet" onClick={() => showToast('Вернёмся к этому позже.', 'info')}>Не сейчас</SoftButton></div></SideCard></aside></div>

    <SuggestDialog open={modal === 'suggest'} onClose={() => setModal(null)} onSubmit={(draft = false) => { setModal(null); showToast(draft ? 'Черновик Инсайта сохранён.' : 'Инсайт сохранён. Он появился в черновиках сообщества.', 'success'); }} />
    <SaveDialog insight={selectedInsight} open={modal === 'save'} onClose={() => setModal(null)} onSubmit={() => { setModal(null); showToast('Инсайт сохранён в ваш путь.', 'success'); }} />
    <SourceDialog insight={selectedInsight} open={modal === 'source'} onClose={() => setModal(null)} onSave={() => { setModal(null); showToast('Инсайт сохранён в ваш путь.', 'success'); }} />
  </main>;
}

function InsightCard({ insight, onSave, onSource, onStep, onToast, extra }: { insight: Insight; onSave: () => void; onSource: () => void; onStep: () => void; onToast: (message: string) => void; extra?: React.ReactNode }) {
  return <>{extra}<article className="rounded-2xl border bg-[var(--bg-card)] p-4" style={{ borderColor: 'var(--border-color)' }}><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">{typeLabels[insight.type]}</p>{insight.badge && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-[var(--gold)]">{insight.badge}</span>}</div><h3 className="mt-3 font-semibold text-[var(--text-primary)]">{insight.title}</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">{insight.summary}</p><p className="mt-3 text-sm text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">Источник:</span> {insight.source}</p><p className="mt-2 text-sm text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">Кому полезно:</span> {insight.usefulFor.join(' · ')}</p><div className="mt-3 rounded-2xl border p-3" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}><p className="text-sm font-semibold text-[var(--text-primary)]">Как применить</p><ul className="mt-2 space-y-1.5 text-sm text-[var(--text-secondary)]">{insight.applySteps.slice(0, 3).map((step) => <li key={step} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />{step}</li>)}</ul></div>{insight.contributionNote && <p className="mt-3 text-xs leading-5 text-[var(--gold)]">{insight.contributionNote}</p>}<div className="mt-4 flex flex-wrap gap-2"><SoftButton variant="ghost" onClick={onSave}>Сохранить себе</SoftButton><SoftButton variant="quiet" onClick={onSource}>Открыть источник</SoftButton><SoftButton variant="quiet" onClick={onStep}>Добавить к моему шагу</SoftButton>{insight.type === 'from_question' && <SoftButton variant="quiet" onClick={() => onToast('Вопрос открыт в сообществе.')}>Задать вопрос</SoftButton>}{insight.type === 'from_review' && <SoftButton variant="quiet" onClick={() => onToast('Разбор открыт.')}>Открыть разбор</SoftButton>}{insight.type === 'from_gratitude' && <SoftButton variant="quiet" onClick={() => onToast('Благодарность открыта.')}>Открыть благодарность</SoftButton>}</div></article></>;
}

function SuggestBlock({ onSuggest }: { onSuggest: () => void }) { return <section className="rounded-2xl border p-4" style={{ borderColor: 'rgba(201,169,110,0.42)', background: 'linear-gradient(135deg, rgba(201,169,110,0.14), var(--bg-card))' }}><h3 className="font-semibold text-[var(--text-primary)]">Предложить Инсайт</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Если вы заметили полезный вывод из вопроса, разбора или своего опыта, его можно сохранить для других участников.</p><p className="mt-2 text-xs leading-5 text-[var(--text-muted)]">Инсайт не должен быть большим. Достаточно короткого вывода, источника и применения.</p><div className="mt-4"><SoftButton variant="primary" onClick={onSuggest}>Предложить Инсайт</SoftButton></div></section>; }
function SideCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) { return <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">{icon}{title}</h2><div className="mt-3">{children}</div></section>; }
function InsightsEmptyState({ activeFilter, onAll, onSuggest }: { activeFilter: string; onAll: () => void; onSuggest: () => void }) { const map = activeFilter === 'Для моего шага' ? ['Пока нет Инсайтов под ваш шаг', 'Можно посмотреть общие Инсайты или задать вопрос в сообществе. Иногда хороший вопрос становится первым полезным Инсайтом для других.', ['Смотреть все', 'Задать вопрос']] : activeFilter === 'Сохранённые' ? ['Вы пока не сохраняли Инсайты', 'Сохраняйте полезные выводы, чтобы возвращаться к ним в “Моём пути” и применять на своих шагах.', ['Смотреть Инсайты']] : activeFilter === 'Мои следы' ? ['Ваши следы пользы ещё впереди', 'Задавайте вопросы, благодарите за помощь, делитесь выводами и отвечайте другим. Иногда маленький вопрос помогает всему сообществу.', ['Задать вопрос', 'Предложить Инсайт']] : ['Инсайты пока не появились', 'Когда участники начнут задавать вопросы, получать ответы, благодарить и сохранять выводы из разборов, полезные Инсайты появятся здесь.', ['Предложить первый Инсайт']]; return <div className="mt-4 rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--border-color)' }}><MessageCircleQuestion className="mx-auto h-8 w-8 text-[var(--gold)]" /><h3 className="mt-3 font-semibold text-[var(--text-primary)]">{map[0]}</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">{map[1]}</p><div className="mt-4 flex flex-wrap justify-center gap-2">{(map[2] as string[]).map((label, i) => <SoftButton key={label} variant={i === 0 ? 'ghost' : 'quiet'} onClick={label.includes('Смотреть') ? onAll : label.includes('Инсайт') ? onSuggest : undefined}>{label}</SoftButton>)}</div></div>; }

function SuggestDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (draft?: boolean) => void }) { return <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Предложить Инсайт</DialogTitle><DialogDescription>Сохраните короткий полезный вывод. Он может помочь другим участникам не застрять на похожем шаге.</DialogDescription></DialogHeader><div className="grid gap-3 text-sm"><input placeholder="Название Инсайта" className="rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }} /><textarea rows={3} placeholder="Короткий вывод" className="rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }} /><select className="rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>{['из вопроса', 'из ответа', 'из разбора', 'из благодарности', 'из личного опыта', 'из встречи'].map((item) => <option key={item}>{item}</option>)}</select><input placeholder="Кому полезно?" className="rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }} /><textarea rows={3} placeholder="Как применить?" className="rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }} /></div><DialogFooter><SoftButton variant="primary" onClick={() => onSubmit(false)}>Сохранить Инсайт</SoftButton><SoftButton onClick={() => onSubmit(true)}>Сохранить черновик</SoftButton><SoftButton variant="quiet" onClick={onClose}>Вернуться</SoftButton></DialogFooter></DialogContent></Dialog>; }
function SaveDialog({ insight, open, onClose, onSubmit }: { insight: Insight; open: boolean; onClose: () => void; onSubmit: () => void }) { return <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Сохранить Инсайт себе?</DialogTitle><DialogDescription>Инсайт появится в вашем пути. Вы сможете вернуться к нему, когда будете делать следующий шаг или готовить работу на разбор.</DialogDescription></DialogHeader><div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><p className="font-semibold">{insight.title}</p><p className="mt-4 font-semibold">Что произойдёт:</p><ul className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">{['Инсайт сохранится в вашем списке;', 'его можно будет открыть из “Моего пути”;', 'если он связан с текущим шагом, он появится рядом с ним.'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />{item}</li>)}</ul></div><DialogFooter><SoftButton variant="primary" onClick={onSubmit}>Сохранить себе</SoftButton><SoftButton variant="quiet" onClick={onClose}>Вернуться</SoftButton></DialogFooter></DialogContent></Dialog>; }
function SourceDialog({ insight, open, onClose, onSave }: { insight: Insight; open: boolean; onClose: () => void; onSave: () => void }) { return <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Источник Инсайта</DialogTitle><DialogDescription>{insight.source}</DialogDescription></DialogHeader><div className="space-y-4 text-sm text-[var(--text-secondary)]"><p>Инсайт появился из вопроса Артёма:</p><blockquote className="rounded-2xl border p-4 text-[var(--text-primary)]" style={{ borderColor: 'var(--border-color)', backgroundColor: 'var(--hover-bg)' }}>“С чего лучше начать API на Go: сначала авторизация или простые endpoints?”</blockquote><p className="font-semibold text-[var(--text-primary)]">Ответ Сергея:</p><p>“Я бы начал с простого ядра: задачи, базовые endpoints и сохранение в базе. Авторизацию лучше добавить позже, когда будет работающий результат.”</p><p className="font-semibold text-[var(--text-primary)]">Почему сохранили:</p><p>Ответ помог участнику сделать следующий шаг и может быть полезен другим новичкам.</p></div><DialogFooter><SoftButton variant="primary" onClick={() => undefined}>Открыть обсуждение</SoftButton><SoftButton onClick={onSave}>Сохранить себе</SoftButton><SoftButton variant="quiet" onClick={onClose}>Закрыть</SoftButton></DialogFooter></DialogContent></Dialog>; }
