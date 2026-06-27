import { useState } from 'react';
import { ArrowRight, Check, HandHeart, Heart, RefreshCw, Sparkles, Target } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/ToastContext';

const summaryCards = [
  { label: 'Этап', value: 'Движусь', text: 'Вы уже вошли в ритм: есть цель, первый шаг и первые связи.' },
  { label: 'Цель', value: 'Frontend pet-проект', text: 'Цель можно уточнить в любой момент.' },
  { label: 'Первая связь', value: 'Появилась', text: 'Есть живой отклик от участника рядом.' },
  { label: 'Вклад', value: '3 полезных действия', text: 'Ваши ответы, благодарности и помощь начинают складываться в полезный след.' },
];

const pathStages = ['Новичок', 'Принятый', 'Движущийся', 'Получающий поддержку', 'Помогающий', 'Признанный', 'Носитель ценности'];

const supportPeople = [
  {
    name: 'Анна Морозова',
    text: 'Проходила похожий frontend-путь и уже помогала с pet-проектами.',
    meta: 'Нагрузка: комфортная',
    primary: 'Попросить совет',
    secondary: 'Посмотреть профиль',
  },
  {
    name: 'Сергей Волков',
    text: 'Помощник на старте. Может помочь с первым вопросом и сориентировать в сообществе.',
    meta: 'Доступен: до 2 новичков одновременно',
    primary: 'Попросить помощь',
    secondary: 'Как работает Помощник',
  },
];

const contributionCards = [
  { title: 'Благодарность за ответ', text: 'Ваш короткий ответ помог участнику выбрать направление для первого шага.' },
  { title: 'Можно помочь', text: 'Есть хороший повод подсказать новичку, как подготовить вопрос к разбору.' },
];

function SoftButton({ children, variant = 'ghost', onClick }: { children: React.ReactNode; variant?: 'primary' | 'ghost' | 'quiet'; onClick?: () => void }) {
  const styles = variant === 'primary'
    ? 'bg-[var(--gold)] text-white border-transparent shadow-[0_14px_32px_rgba(201,169,110,0.22)] hover:translate-y-[-1px]'
    : variant === 'quiet'
      ? 'bg-transparent text-[var(--text-secondary)] border-[var(--border-color)] hover:bg-[var(--hover-bg)]'
      : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--border-color)] hover:bg-[var(--hover-bg)]';

  return (
    <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${styles}`}>
      {children}
    </button>
  );
}

export default function MyPath() {
  const { showToast } = useToast();
  const [helpOpen, setHelpOpen] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const showStub = (message: string) => showToast(message, 'info');

  return (
    <main className="flex-1 min-w-0 space-y-5 pb-8">
      <section className="rounded-3xl border bg-[var(--bg-card)] p-5 md:p-7 shadow-[0_18px_50px_rgba(0,0,0,0.06)]" style={{ borderColor: 'var(--border-color)' }}>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-medium text-[var(--text-muted)]">
              <span>IT технологии</span><span className="text-[var(--gold)]">›</span><span className="text-[var(--text-secondary)]">Мой путь</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[var(--text-primary)]">Мой путь</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">Здесь видно, где вы сейчас в сообществе, какой следующий шаг лучше сделать и как рядом появляются люди, поддержка и ваш Вклад.</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:bg-[var(--hover-bg)]" style={{ borderColor: 'var(--border-color)' }}>
            Обновлено 4 минуты назад · <RefreshCw className="h-3.5 w-3.5" /> Обновить
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <article key={card.label} className="rounded-2xl border bg-[var(--bg-card)] p-4" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{card.label}</p>
            <h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{card.value}</h2>
            <p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{card.text}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[28px] border p-5 md:p-7" style={{ borderColor: 'rgba(201,169,110,0.35)', background: 'linear-gradient(135deg, rgba(201,169,110,0.16), var(--bg-card) 42%, var(--bg-card))' }}>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-[var(--gold)]"><Sparkles className="h-3.5 w-3.5" /> Главное сейчас</div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">Сделайте следующий шаг без перегруза</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Сейчас лучше закончить небольшой шаг по frontend pet-проекту: выбрать экран, который вы покажете на первом разборе.</p>
          </div>
          <article className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Первый шаг на сегодня</p>
            <h3 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">Выбрать один экран для pet-проекта и коротко описать, что хотите получить от разбора.</h3>
            <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">Что это даст:</p>
            <ul className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">
              {['будет проще попросить обратную связь;', 'участникам будет понятнее, как помочь;', 'вы быстрее получите первый полезный отклик.'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />{item}</li>)}
            </ul>
            <div className="mt-5 flex flex-wrap gap-2.5">
              <SoftButton variant="primary" onClick={() => showStub('Первый шаг откроем в следующей итерации.')}>Открыть первый шаг <ArrowRight className="h-4 w-4" /></SoftButton>
              <SoftButton onClick={() => setHelpOpen(true)}>Попросить помощь</SoftButton>
              <SoftButton variant="quiet" onClick={() => setGoalOpen(true)}>Изменить шаг</SoftButton>
            </div>
          </article>
        </div>
      </section>

      <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}>
        <h2 className="text-xl font-semibold text-[var(--text-primary)]">Мой путь в сообществе</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-7">
          {pathStages.map((stage, index) => {
            const isPast = index < 2;
            const isCurrent = index === 2;
            return <div key={stage} className={`rounded-2xl border p-3 text-sm ${isCurrent ? 'bg-amber-500/10' : isPast ? 'bg-[var(--hover-bg)]' : 'bg-transparent'}`} style={{ borderColor: isCurrent ? 'rgba(201,169,110,0.7)' : 'var(--border-color)' }}><div className={`mb-2 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${isCurrent ? 'bg-[var(--gold)] text-white' : isPast ? 'bg-emerald-500/15 text-emerald-500' : 'bg-[var(--hover-bg)] text-[var(--text-muted)]'}`}>{index + 1}</div><p className="font-semibold text-[var(--text-primary)]">{stage}</p></div>;
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]"><HandHeart className="h-5 w-5 text-[var(--gold)]" /> Поддержка рядом</h2>
          <div className="mt-4 space-y-3">{supportPeople.map((person) => <article key={person.name} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><h3 className="font-semibold text-[var(--text-primary)]">{person.name}</h3><p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{person.text}</p><p className="mt-3 text-xs font-semibold text-[var(--gold)]">{person.meta}</p><div className="mt-4 flex flex-wrap gap-2"><SoftButton onClick={() => setHelpOpen(true)}>{person.primary}</SoftButton><SoftButton variant="quiet" onClick={() => showStub('Профиль и подробное описание роли добавим после MVP.')}>{person.secondary}</SoftButton></div></article>)}</div>
        </div>
        <div className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-[var(--text-primary)]"><Heart className="h-5 w-5 text-[var(--gold)]" /> Мой Вклад</h2>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center"><div className="rounded-2xl bg-[var(--hover-bg)] p-3"><b className="block text-lg text-[var(--text-primary)]">3</b><span className="text-xs text-[var(--text-muted)]">полезных действия</span></div><div className="rounded-2xl bg-[var(--hover-bg)] p-3"><b className="block text-lg text-[var(--text-primary)]">2 из 9</b><span className="text-xs text-[var(--text-muted)]">уровень</span></div><div className="rounded-2xl bg-[var(--hover-bg)] p-3"><b className="block text-lg text-[var(--text-primary)]">1</b><span className="text-xs text-[var(--text-muted)]">благодарность</span></div></div>
          <div className="mt-4 space-y-3">{contributionCards.map((card) => <article key={card.title} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><h3 className="font-semibold text-[var(--text-primary)]">{card.title}</h3><p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{card.text}</p></article>)}</div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-3xl border bg-[var(--bg-card)] p-5 md:flex-row md:items-center md:justify-between" style={{ borderColor: 'var(--border-color)' }}>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Выберите один следующий шаг. Не нужно делать всё сразу.</p>
        <div className="flex flex-wrap gap-2"><SoftButton variant="primary" onClick={() => showStub('Продолжение первого шага появится в следующей итерации.')}>Продолжить первый шаг</SoftButton><SoftButton onClick={() => setHelpOpen(true)}>Попросить обратную связь</SoftButton><SoftButton variant="quiet" onClick={() => showStub('Подбор людей для помощи добавим после просмотра MVP.')}>Посмотреть, кому можно помочь</SoftButton></div>
      </section>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]">
          <DialogHeader><DialogTitle>Попросить помощь</DialogTitle><DialogDescription>Коротко опишите, где нужна подсказка. Это мягкое приглашение к поддержке, а не обязательство.</DialogDescription></DialogHeader>
          <div className="rounded-2xl border p-4 text-sm text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-color)' }}>Например: «Хочу выбрать экран для первого разбора и понять, что лучше показать».</div>
          <DialogFooter><SoftButton variant="quiet" onClick={() => setHelpOpen(false)}>Отмена</SoftButton><SoftButton variant="primary" onClick={() => { setHelpOpen(false); showToast('Запрос помощи сохранён как черновик.', 'success'); }}>Сохранить запрос</SoftButton></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={goalOpen} onOpenChange={setGoalOpen}>
        <DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]">
          <DialogHeader><DialogTitle>Уточнить цель</DialogTitle><DialogDescription>Цель можно менять спокойно: она помогает людям рядом понять, как лучше поддержать ваш путь.</DialogDescription></DialogHeader>
          <div className="rounded-2xl border p-4 text-sm text-[var(--text-secondary)]" style={{ borderColor: 'var(--border-color)' }}><Target className="mb-2 h-5 w-5 text-[var(--gold)]" /> Текущая цель: Frontend pet-проект.</div>
          <DialogFooter><SoftButton variant="quiet" onClick={() => setGoalOpen(false)}>Оставить как есть</SoftButton><SoftButton variant="primary" onClick={() => { setGoalOpen(false); showToast('Цель можно будет отредактировать в следующей итерации.', 'info'); }}>Уточнить позже</SoftButton></DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
