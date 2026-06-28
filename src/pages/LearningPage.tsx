import { useState } from 'react';
import { ArrowRight, BookOpen, Check, ChevronDown, HandHeart, Layers, Send, Sparkles, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/ToastContext';
import { PageHero } from '@/components/layout/PageHero';

type LearningState =
  | 'no_track'
  | 'track_started'
  | 'stuck'
  | 'work_ready'
  | 'can_help';

type TrackStatus =
  | 'active'
  | 'paused'
  | 'available'
  | 'locked';

type ModalType = 'pick-track' | 'ask-help' | 'show-work' | null;

const learningMock: {
  currentState: LearningState;
  activeTrack: {
    title: string;
    progress: number;
    totalSteps: number;
    currentStep: string;
    supportPerson: string;
  };
  contributionHint: {
    title: string;
    text: string;
  };
} = {
  currentState: 'track_started',
  activeTrack: {
    title: 'Frontend pet-проект',
    progress: 3,
    totalSteps: 8,
    currentStep: 'Подготовить экран к первому разбору',
    supportPerson: 'Анна Морозова',
  },
  contributionHint: {
    title: 'Можно помочь новичку',
    text: 'Вы уже прошли первый шаг. Один участник сейчас выбирает проект и может получить пользу от вашего опыта.',
  },
};

const summaryCards = [
  { label: 'Текущий трек', value: 'Frontend pet-проект', text: '3 из 8 шагов' },
  { label: 'Следующий шаг', value: 'Подготовить экран к разбору', text: 'На этой неделе' },
  { label: 'Поддержка', value: '2 человека рядом', text: 'Можно попросить совет' },
  { label: 'Практика', value: '1 работа ждёт продолжения', text: 'Можно показать на разбор' },
];

const myTracks: Array<{ title: string; status: TrackStatus; progress: string; text: string; support?: string; actions: string[] }> = [
  {
    title: 'Frontend pet-проект',
    status: 'active',
    progress: '3 из 8 шагов',
    text: 'Текущий шаг: Подготовить экран к первому разбору',
    support: 'Поддержка: Анна может помочь с компонентами',
    actions: ['Открыть трек', 'Попросить помощь'],
  },
  {
    title: 'Основы TypeScript',
    status: 'paused',
    progress: '1 из 6 шагов',
    text: 'Подсказка: Можно вернуться позже. Пауза не считается провалом.',
    actions: ['Продолжить', 'Оставить на паузе'],
  },
];

const growthRoutes = ['Frontend pet-проект', 'Backend API с нуля', 'Docker и CI/CD для pet-проекта'];
const flowRoutes = ['Frontend pet-проект · июльский поток', 'Backend API · вечерний поток'];
const materialFilters = ['Все', 'Гайды', 'Шаблоны', 'Видео', 'Практика', 'Для моего шага', 'Сохранённые'];
const materials = [
  { type: 'Гайд', title: 'Как выбрать первый экран для pet-проекта' },
  { type: 'Шаблон', title: 'Шаблон описания работы на разбор' },
  { type: 'Практика', title: 'Опишите один экран проекта' },
  { type: 'Видео', title: 'Как не усложнить первый проект' },
];

function SoftButton({ children, variant = 'ghost', onClick }: { children: React.ReactNode; variant?: 'primary' | 'ghost' | 'quiet'; onClick?: () => void }) {
  const styles = variant === 'primary'
    ? 'border-transparent bg-[var(--gold)] text-white shadow-[0_14px_32px_rgba(201,169,110,0.22)] hover:translate-y-[-1px]'
    : variant === 'quiet'
      ? 'border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]';

  return <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${styles}`}>{children}</button>;
}

function statusLabel(status: TrackStatus) {
  return status === 'active' ? 'В процессе' : status === 'paused' ? 'На паузе' : status === 'available' ? 'Доступен' : 'Откроется позже';
}

export default function LearningPage() {
  const { showToast } = useToast();
  const [modal, setModal] = useState<ModalType>(null);
  const [routeTab, setRouteTab] = useState<'tracks' | 'flows'>('tracks');
  const [flowInfoOpen, setFlowInfoOpen] = useState(true);
  const [materialFilter, setMaterialFilter] = useState('Все');
  const activeTrack = learningMock.activeTrack;
  const routes = routeTab === 'tracks' ? growthRoutes : flowRoutes;

  const addToPath = (title: string) => showToast(`${title}: трек добавлен в ваш путь.`, 'success');

  return (
    <main className="flex-1 min-w-0 space-y-5 pb-8">
      <div className="space-y-5 lg:mr-[260px]">
        <PageHero
          breadcrumbs={['IT технологии', 'Обучение']}
          title="Обучение"
          description="Треки, потоки, материалы и практика, которые помогают двигаться по цели не в одиночку: с поддержкой, вопросами, разборами и людьми рядом."
          updatedLabel="Обновлено 5 минут назад"
          onRefresh={() => showToast('Данные обучения обновлены.', 'info')}
        />

        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => <article key={card.label} className="rounded-2xl border bg-[var(--bg-card)] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.035)]" style={{ borderColor: 'var(--border-color)' }}><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{card.label}</p><h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{card.value}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{card.text}</p></article>)}
        </section>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-5">
          <section className="rounded-[28px] border p-5 md:p-7" style={{ borderColor: 'rgba(201,169,110,0.42)', background: 'linear-gradient(135deg, rgba(201,169,110,0.18), var(--bg-card) 45%, var(--bg-card))' }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-[var(--gold)]"><Sparkles className="h-3.5 w-3.5" /> Продолжить сейчас</div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{activeTrack.title}</h2>
            <p className="mt-2 text-sm font-semibold text-[var(--gold)]">Шаг {activeTrack.progress} из {activeTrack.totalSteps} · {activeTrack.currentStep}</p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">Вы уже выбрали экран для pet-проекта. Сейчас лучше коротко описать, что хотите получить от разбора: структуру компонентов, логику состояния или визуальную ясность.</p>
            <div className="mt-5 rounded-2xl border bg-[var(--bg-card)] p-4" style={{ borderColor: 'var(--border-color)' }}><p className="font-semibold text-[var(--text-primary)]">Что это даст:</p><ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">{['участникам будет проще дать полезный отклик;', 'куратору будет понятнее, куда смотреть;', 'вы быстрее получите первый разбор без перегруза.'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />{item}</li>)}</ul></div>
            <div className="mt-5"><div className="mb-2 flex items-center justify-between text-sm"><span className="font-semibold text-[var(--text-primary)]">Прогресс</span><span className="text-[var(--text-secondary)]">{activeTrack.progress} / {activeTrack.totalSteps} шагов</span></div><div className="h-2 rounded-full bg-[var(--hover-bg)]"><div className="h-2 rounded-full bg-[var(--gold)]" style={{ width: `${(activeTrack.progress / activeTrack.totalSteps) * 100}%` }} /></div></div>
            <div className="mt-6 flex flex-wrap gap-2.5"><SoftButton variant="primary">Продолжить шаг <ArrowRight className="h-4 w-4" /></SoftButton><SoftButton onClick={() => setModal('ask-help')}>Попросить помощь</SoftButton><SoftButton variant="quiet" onClick={() => setModal('show-work')}>Показать работу</SoftButton></div>
          </section>

          <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-[var(--text-primary)]">Мои треки</h2><SoftButton variant="quiet" onClick={() => setModal('pick-track')}>Подобрать трек</SoftButton></div><div className="mt-4 grid gap-3 lg:grid-cols-2">{myTracks.map((track) => <article key={track.title} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><div className="flex items-start justify-between gap-3"><h3 className="font-semibold text-[var(--text-primary)]">{track.title}</h3><span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-[var(--gold)]">{statusLabel(track.status)}</span></div><p className="mt-2 text-sm font-semibold text-[var(--text-secondary)]">{track.progress}</p><p className="mt-3 text-sm leading-5 text-[var(--text-secondary)]">{track.text}</p>{track.support && <p className="mt-2 text-sm text-[var(--gold)]">{track.support}</p>}<div className="mt-4 flex flex-wrap gap-2">{track.actions.map((action, index) => <SoftButton key={action} variant={index === 0 ? 'ghost' : 'quiet'} onClick={() => action.includes('Попросить') ? setModal('ask-help') : undefined}>{action}</SoftButton>)}</div></article>)}</div></section>

          <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold text-[var(--text-primary)]">Доступные маршруты</h2><div className="mt-4 inline-flex rounded-2xl border bg-[var(--hover-bg)] p-1" style={{ borderColor: 'var(--border-color)' }}><button onClick={() => setRouteTab('tracks')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${routeTab === 'tracks' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>Треки роста</button><button onClick={() => setRouteTab('flows')} className={`rounded-xl px-4 py-2 text-sm font-semibold ${routeTab === 'flows' ? 'bg-[var(--bg-card)] text-[var(--text-primary)] shadow-sm' : 'text-[var(--text-secondary)]'}`}>Потоки</button></div>{routeTab === 'flows' && <div className="mt-4 rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><button onClick={() => setFlowInfoOpen(!flowInfoOpen)} className="flex w-full items-center justify-between text-left font-semibold text-[var(--text-primary)]">Чем поток отличается от трека?<ChevronDown className={`h-4 w-4 transition-transform ${flowInfoOpen ? 'rotate-180' : ''}`} /></button>{flowInfoOpen && <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Трек можно проходить самостоятельно в своём темпе. Поток — это тот же маршрут, но с группой, общим ритмом, встречами и большим количеством живого контакта.</p>}</div>}<div className="mt-4 grid gap-3 md:grid-cols-3">{routes.map((title) => <article key={title} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><Layers className="h-5 w-5 text-[var(--gold)]" /><h3 className="mt-3 font-semibold text-[var(--text-primary)]">{title}</h3><p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">Маршрут доступен в вашем учебном центре. Можно добавить спокойно, без гонки.</p><div className="mt-4"><SoftButton variant="quiet" onClick={() => addToPath(title)}>Добавить в мой путь</SoftButton></div></article>)}</div></section>

          <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><h2 className="text-xl font-semibold text-[var(--text-primary)]">Материалы к текущему шагу</h2><div className="mt-4 flex flex-wrap gap-2">{materialFilters.map((filter) => <button key={filter} onClick={() => setMaterialFilter(filter)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${materialFilter === filter ? 'border-transparent bg-[var(--gold)] text-white' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}>{filter}</button>)}</div><div className="mt-4 grid gap-3 md:grid-cols-2">{materials.map((item) => <article key={item.title} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">{item.type}</p><h3 className="mt-2 font-semibold text-[var(--text-primary)]">{item.title}</h3><p className="mt-2 text-sm text-[var(--text-secondary)]">Связано с шагом: {activeTrack.currentStep}.</p></article>)}</div></section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[88px]">
          <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]"><HandHeart className="h-5 w-5 text-[var(--gold)]" /> Если застряли</h2><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Можно попросить помощь по текущему шагу. Вопрос не обязан быть идеальным — достаточно описать, где стало непонятно.</p><div className="mt-4 flex flex-col gap-2"><SoftButton variant="primary" onClick={() => setModal('ask-help')}>Попросить помощь</SoftButton><SoftButton variant="quiet">Найти человека рядом</SoftButton></div></section>
          <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]"><Users className="h-5 w-5 text-[var(--gold)]" /> Люди рядом</h2><div className="mt-4 space-y-3">{[{ name: 'Анна Морозова', text: 'Проходила похожий frontend-путь.', action: 'Попросить совет' }, { name: 'Сергей Волков', text: 'Помощник на старте, помогает с первыми шагами.', action: 'Связаться' }].map((person) => <article key={person.name} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><h3 className="font-semibold text-[var(--text-primary)]">{person.name}</h3><p className="mt-2 text-sm text-[var(--text-secondary)]">{person.text}</p><div className="mt-3"><SoftButton variant="quiet" onClick={() => setModal('ask-help')}>{person.action}</SoftButton></div></article>)}</div></section>
          <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]"><BookOpen className="h-5 w-5 text-[var(--gold)]" /> Ближайший разбор</h2><h3 className="mt-3 font-semibold text-[var(--text-primary)]">Разбор pet-проектов</h3><p className="mt-1 text-sm text-[var(--gold)]">Завтра · 19:00</p><p className="mt-2 text-sm text-[var(--text-secondary)]">Можно прийти просто послушать.</p><div className="mt-4"><SoftButton variant="quiet">Посмотреть встречу</SoftButton></div></section>
          <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]"><Sparkles className="h-5 w-5 text-[var(--gold)]" /> Маленький Вклад</h2><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">Вы уже прошли первый шаг. Есть один новичок, которому может быть полезен ваш опыт.</p><p className="mt-2 text-xs text-[var(--text-muted)]">{learningMock.contributionHint.title}</p><div className="mt-4 flex flex-col gap-2"><SoftButton variant="ghost">Посмотреть вопрос</SoftButton><SoftButton variant="quiet">Не сейчас</SoftButton></div></section>
        </aside>
      </div>

      <Dialog open={modal === 'pick-track'} onOpenChange={(open) => !open && setModal(null)}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Подобрать трек</DialogTitle><DialogDescription>Ответьте на пару спокойных вопросов — маршрут подберём под цель и текущий ритм.</DialogDescription></DialogHeader><div className="rounded-2xl border p-4 text-sm text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-color)' }}>Сейчас в мокапе доступен мягкий подбор: frontend pet-проект, Backend API и Docker для проекта.</div><DialogFooter><SoftButton variant="quiet" onClick={() => setModal(null)}>Закрыть</SoftButton><SoftButton variant="primary" onClick={() => { setModal(null); addToPath('Frontend pet-проект'); }}>Выбрать frontend-трек</SoftButton></DialogFooter></DialogContent></Dialog>
      <Dialog open={modal === 'ask-help'} onOpenChange={(open) => !open && setModal(null)}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Попросить помощь</DialogTitle><DialogDescription>Опишите, где стало непонятно. Вопрос не обязан быть идеальным — рядом есть люди, которые помогут с первым шагом.</DialogDescription></DialogHeader><div className="rounded-2xl border p-4 text-sm text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-color)' }}>Например: «Хочу показать экран на разбор, но не понимаю, как лучше описать состояние и компоненты».</div><DialogFooter><SoftButton variant="quiet" onClick={() => setModal(null)}>Отмена</SoftButton><SoftButton variant="primary" onClick={() => { setModal(null); showToast('Запрос помощи сохранён как черновик.', 'success'); }}><Send className="h-4 w-4" /> Сохранить запрос</SoftButton></DialogFooter></DialogContent></Dialog>
      <Dialog open={modal === 'show-work'} onOpenChange={(open) => !open && setModal(null)}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Показать работу</DialogTitle><DialogDescription>Подготовьте короткое описание работы на разбор: что уже сделано, где нужна ясность и какой отклик будет полезен.</DialogDescription></DialogHeader><div className="rounded-2xl border p-4 text-sm text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-color)' }}>Можно показать один экран, черновой компонент или описание логики. Этого достаточно для первого живого отклика.</div><DialogFooter><SoftButton variant="quiet" onClick={() => setModal(null)}>Позже</SoftButton><SoftButton variant="primary" onClick={() => { setModal(null); showToast('Работа сохранена как черновик для разбора.', 'success'); }}>Подготовить описание</SoftButton></DialogFooter></DialogContent></Dialog>
    </main>
  );
}
