import { useMemo, useState } from 'react';
import { Calendar, Check, Clock, HandHeart, MessageCircleQuestion, Send, Sparkles, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/ToastContext';
import { PageHero } from '@/components/layout/PageHero';

type MeetingType = 'welcome' | 'review' | 'qa' | 'office_hours' | 'live' | 'ritual';

type Meeting = {
  id: number;
  type: MeetingType;
  title: string;
  dateLabel: string;
  timeLabel: string;
  format: 'online' | 'offline' | 'hybrid';
  audience: string;
  description: string;
  canJustListen: boolean;
  matchesMyStep: boolean;
  isRegistered: boolean;
  badge?: string;
  actions: string[];
};

type ModalType = 'details' | 'register' | 'prepare' | null;

type Filter = 'Все' | 'Welcome' | 'Эфиры' | 'Q&A' | 'Разборы' | 'Office hours' | 'Ритуалы' | 'Для моего шага' | 'Можно просто послушать' | 'Я записан';

const filters: Filter[] = ['Все', 'Welcome', 'Эфиры', 'Q&A', 'Разборы', 'Office hours', 'Ритуалы', 'Для моего шага', 'Можно просто послушать', 'Я записан'];

const typeLabels: Record<MeetingType, string> = {
  welcome: 'Welcome-встреча',
  review: 'Разбор работ',
  qa: 'Q&A',
  office_hours: 'Office hours',
  live: 'Эфир',
  ritual: 'День помощи',
};

const meetings: Meeting[] = [
  { id: 1, type: 'review', title: 'Разбор pet-проектов', dateLabel: 'Завтра', timeLabel: '19:00', format: 'online', audience: 'Для frontend pet-проекта', description: 'Можно показать один экран, задать вопрос или спокойно послушать разборы других участников.', canJustListen: true, matchesMyStep: true, isRegistered: true, badge: 'Можно прийти без выступления', actions: ['Подробнее', 'Подготовить работу', 'Добавить в мой путь'] },
  { id: 2, type: 'welcome', title: 'Welcome-встреча для новых участников', dateLabel: 'Среда', timeLabel: '17:00', format: 'online', audience: 'Для первой связи', description: 'Мягкое знакомство с сообществом: кто рядом, где задавать вопросы и как получить первый отклик.', canJustListen: true, matchesMyStep: false, isRegistered: false, badge: 'Хорошо для первой связи', actions: ['Подробнее', 'Записаться'] },
  { id: 3, type: 'qa', title: 'Q&A: первые шаги в backend', dateLabel: 'Четверг', timeLabel: '18:30', format: 'online', audience: 'Тем, кто хочет задать вопрос заранее', description: 'Куратор отвечает на вопросы участников, а похожие ситуации помогают другим не застрять.', canJustListen: true, matchesMyStep: false, isRegistered: true, badge: 'Можно задать вопрос заранее', actions: ['Подробнее', 'Задать вопрос заранее'] },
  { id: 4, type: 'office_hours', title: 'Office hours: не застрять на шаге', dateLabel: 'Пятница', timeLabel: '16:00', format: 'hybrid', audience: 'Для тех, кто застрял', description: 'Короткие вопросы, спокойный разбор препятствий и подсказка следующего маленького шага.', canJustListen: false, matchesMyStep: false, isRegistered: false, badge: 'Для тех, кто застрял', actions: ['Подробнее', 'Записаться'] },
  { id: 5, type: 'live', title: 'Эфир про первый проект', dateLabel: 'Суббота', timeLabel: '12:00', format: 'online', audience: 'Можно без подготовки', description: 'Живой эфир о том, как не усложнить первый проект и дойти до первого показа.', canJustListen: true, matchesMyStep: false, isRegistered: false, badge: 'Можно просто послушать', actions: ['Подробнее', 'Добавить в мой путь'] },
  { id: 6, type: 'ritual', title: 'День помощи', dateLabel: 'Воскресенье', timeLabel: '11:30', format: 'online', audience: 'Тем, кто хочет получить или дать короткий отклик', description: 'Ритуал взаимной поддержки: можно задать небольшой вопрос или ответить там, где ваш опыт уже полезен.', canJustListen: true, matchesMyStep: false, isRegistered: false, badge: 'Можно просто послушать', actions: ['Подробнее', 'Я готов помочь'] },
];

const summaryCards = [
  { label: 'Ближайшая встреча', value: 'Завтра · 19:00', text: 'Разбор pet-проектов' },
  { label: 'Мои записи', value: '2 встречи', text: 'На этой неделе' },
  { label: 'Можно прийти без подготовки', value: '3 встречи', text: 'Можно просто слушать' },
  { label: 'Подходит моему шагу', value: '1 встреча', text: 'Для frontend pet-проекта' },
];

function SoftButton({ children, variant = 'ghost', onClick }: { children: React.ReactNode; variant?: 'primary' | 'ghost' | 'quiet'; onClick?: () => void }) {
  const styles = variant === 'primary'
    ? 'border-transparent bg-[var(--gold)] text-white shadow-[0_14px_32px_rgba(201,169,110,0.22)] hover:translate-y-[-1px]'
    : variant === 'quiet'
      ? 'border-[var(--border-color)] bg-transparent text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
      : 'border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)] hover:bg-[var(--hover-bg)]';
  return <button onClick={onClick} className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${styles}`}>{children}</button>;
}

const formatLabel = (format: Meeting['format']) => format === 'online' ? 'онлайн' : format === 'offline' ? 'офлайн' : 'гибрид';

export default function MeetingsPage() {
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState<Filter>('Все');
  const [modal, setModal] = useState<ModalType>(null);
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting>(meetings[0]);
  const featured = meetings[0];

  const filteredMeetings = useMemo(() => meetings.filter((meeting) => {
    if (activeFilter === 'Все') return true;
    if (activeFilter === 'Для моего шага') return meeting.matchesMyStep;
    if (activeFilter === 'Можно просто послушать') return meeting.canJustListen;
    if (activeFilter === 'Я записан') return meeting.isRegistered;
    const map: Partial<Record<Filter, MeetingType>> = { Welcome: 'welcome', Эфиры: 'live', 'Q&A': 'qa', Разборы: 'review', 'Office hours': 'office_hours', Ритуалы: 'ritual' };
    return meeting.type === map[activeFilter];
  }), [activeFilter]);

  const openModal = (type: ModalType, meeting = featured) => { setSelectedMeeting(meeting); setModal(type); };
  const toastAction = (message: string) => showToast(message, 'success');

  return (
    <main className="flex-1 min-w-0 space-y-5 pb-8">
      <PageHero
        breadcrumbs={['IT технологии', 'Встречи']}
        title="Встречи"
        description="Живые форматы сообщества: welcome-встречи, эфиры, Q&A, разборы, office hours и ритуалы, где можно получить поддержку, показать работу или просто послушать."
        updatedLabel="Обновлено 5 минут назад"
        onRefresh={() => showToast('Данные встреч обновлены.', 'info')}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => <article key={card.label} className="rounded-2xl border bg-[var(--bg-card)] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.035)]" style={{ borderColor: 'var(--border-color)' }}><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">{card.label}</p><h2 className="mt-2 text-lg font-semibold text-[var(--text-primary)]">{card.value}</h2><p className="mt-2 text-sm text-[var(--text-secondary)]">{card.text}</p></article>)}
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_240px]">
        <div className="space-y-5">
          <section className="rounded-[28px] border p-5 md:p-7" style={{ borderColor: 'rgba(201,169,110,0.42)', background: 'linear-gradient(135deg, rgba(201,169,110,0.18), var(--bg-card) 45%, var(--bg-card))' }}>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-[var(--gold)]"><Sparkles className="h-3.5 w-3.5" /> Можно прийти без выступления</div>
            <h2 className="text-2xl font-semibold text-[var(--text-primary)]">{featured.title}</h2>
            <p className="mt-2 text-sm font-semibold text-[var(--gold)]">{featured.dateLabel} · {featured.timeLabel} · {formatLabel(featured.format)}</p>
            <p className="mt-4 text-sm font-semibold text-[var(--text-primary)]">Формат: Разбор работ участников</p>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[var(--text-secondary)]">Можно прийти просто послушать. Показывать работу необязательно. Если хотите получить обратную связь, подготовьте короткий вопрос и ссылку на проект.</p>
            <div className="mt-5 rounded-2xl border bg-[var(--bg-card)] p-4" style={{ borderColor: 'var(--border-color)' }}><p className="font-semibold text-[var(--text-primary)]">Подходит вам, потому что:</p><p className="mt-2 text-sm text-[var(--text-secondary)]">Вы сейчас готовите frontend pet-проект к первому разбору.</p><p className="mt-4 font-semibold text-[var(--text-primary)]">Что можно сделать:</p><ul className="mt-3 grid gap-2 text-sm text-[var(--text-secondary)] md:grid-cols-2">{['прийти послушать', 'показать один экран', 'задать вопрос', 'посмотреть, как разбирают работы других'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />{item}</li>)}</ul></div>
            <div className="mt-6 flex flex-wrap gap-2.5"><SoftButton variant="primary" onClick={() => openModal('register')}>Записаться</SoftButton><SoftButton onClick={() => openModal('prepare')}>Подготовить работу</SoftButton><SoftButton variant="quiet" onClick={() => toastAction('Встреча добавлена в ваш путь.')}>Добавить в мой путь</SoftButton></div>
          </section>

          <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Ближайшие форматы</h2>
            <div className="mt-4 flex flex-wrap gap-2">{filters.map((filter) => <button key={filter} onClick={() => setActiveFilter(filter)} className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${activeFilter === filter ? 'border-transparent bg-[var(--gold)] text-white' : 'border-[var(--border-color)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}>{filter}</button>)}</div>
            {filteredMeetings.length === 0 ? <EmptyState title={activeFilter === 'Для моего шага' ? 'Сейчас нет встреч под ваш шаг' : 'Пока нет ближайших встреч'} text={activeFilter === 'Для моего шага' ? 'Можно выбрать общую Q&A-встречу или попросить помощь у участника рядом.' : 'Когда команда добавит welcome-встречу, Q&A, разбор или эфир, они появятся здесь. Пока можно задать вопрос в сообществе или найти человека рядом.'} /> : <div className="mt-4 grid gap-3 lg:grid-cols-2">{filteredMeetings.map((meeting) => <MeetingCard key={meeting.id} meeting={meeting} onDetails={() => openModal('details', meeting)} onRegister={() => openModal('register', meeting)} onPrepare={() => openModal('prepare', meeting)} onToast={toastAction} />)}</div>}
          </section>

          <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">Мои записи</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2">{meetings.filter((m) => m.isRegistered).map((meeting) => <article key={meeting.id} className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><h3 className="font-semibold text-[var(--text-primary)]">{meeting.title}</h3><p className="mt-1 text-sm text-[var(--gold)]">{meeting.dateLabel} · {meeting.timeLabel}</p><p className="mt-3 text-sm text-[var(--text-secondary)]">Статус: Вы записаны</p><p className="mt-1 text-sm text-[var(--text-secondary)]">{meeting.type === 'review' ? 'Подготовка: Работа пока не добавлена' : 'Вопрос: Пока не задан'}</p><div className="mt-4 flex flex-wrap gap-2"><SoftButton variant="ghost" onClick={() => meeting.type === 'review' ? openModal('prepare', meeting) : toastAction('Вопрос сохранён для встречи.')}>{meeting.type === 'review' ? 'Подготовить работу' : 'Задать вопрос заранее'}</SoftButton><SoftButton variant="quiet" onClick={() => toastAction('Запись отменена.')}>Отменить запись</SoftButton></div></article>)}</div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar">
          <SideCard icon={<Calendar className="h-5 w-5 text-[var(--gold)]" />} title="Подходит вашему шагу"><h3 className="font-semibold text-[var(--text-primary)]">Разбор pet-проектов</h3><p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Вы готовите frontend pet-проект. На разборе можно показать один экран или просто послушать.</p><div className="mt-4"><SoftButton variant="quiet" onClick={() => openModal('details')}>Посмотреть</SoftButton></div></SideCard>
          <SideCard icon={<Clock className="h-5 w-5 text-[var(--gold)]" />} title="Можно без подготовки"><ul className="space-y-2 text-sm text-[var(--text-secondary)]"><li>Welcome-встреча</li><li>Эфир про первый проект</li><li>День помощи</li></ul><p className="mt-3 text-xs text-[var(--text-muted)]">На эти встречи можно прийти просто послушать.</p></SideCard>
          <SideCard icon={<Users className="h-5 w-5 text-[var(--gold)]" />} title="Для первой связи"><p className="text-sm leading-6 text-[var(--text-secondary)]">Если вы недавно вошли в сообщество, welcome-встреча и день помощи помогут быстрее получить первый живой отклик.</p><div className="mt-4"><SoftButton variant="quiet" onClick={() => setActiveFilter('Welcome')}>Найти встречу</SoftButton></div></SideCard>
          <SideCard icon={<HandHeart className="h-5 w-5 text-[var(--gold)]" />} title="Можно быть полезным"><p className="text-sm leading-6 text-[var(--text-secondary)]">На Дне помощи есть вопросы по теме, которую вы уже проходили. Можно ответить коротко и без обязательств.</p><div className="mt-4 flex flex-col gap-2"><SoftButton variant="ghost" onClick={() => toastAction('Готовность помочь обновлена.')}>Посмотреть вопросы</SoftButton><SoftButton variant="quiet" onClick={() => toastAction('Вернёмся к этому позже.')}>Не сейчас</SoftButton></div></SideCard>
        </aside>
      </div>

      <DetailsDialog meeting={selectedMeeting} open={modal === 'details'} onClose={() => setModal(null)} onRegister={() => setModal('register')} onPrepare={() => setModal('prepare')} onToast={toastAction} />
      <RegisterDialog meeting={selectedMeeting} open={modal === 'register'} onClose={() => setModal(null)} onSubmit={() => { setModal(null); toastAction('Вы записаны на встречу. Она появилась в вашем пути.'); }} />
      <PrepareDialog open={modal === 'prepare'} onClose={() => setModal(null)} onSubmit={(message) => { setModal(null); toastAction(message); }} />
    </main>
  );
}

function MeetingCard({ meeting, onDetails, onRegister, onPrepare, onToast }: { meeting: Meeting; onDetails: () => void; onRegister: () => void; onPrepare: () => void; onToast: (message: string) => void }) {
  return <article className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><div className="flex items-start justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--gold)]">{typeLabels[meeting.type]}</p>{meeting.badge && <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-[var(--gold)]">{meeting.badge}</span>}</div><h3 className="mt-3 font-semibold text-[var(--text-primary)]">{meeting.title}</h3><p className="mt-1 text-sm text-[var(--gold)]">{meeting.dateLabel} · {meeting.timeLabel} · {formatLabel(meeting.format)}</p><p className="mt-3 text-sm text-[var(--text-secondary)]">Кому подходит: {meeting.audience}</p><p className="mt-2 text-sm leading-5 text-[var(--text-secondary)]">{meeting.description}</p><p className="mt-3 text-xs text-[var(--text-muted)]">Статус записи: {meeting.isRegistered ? 'Вы записаны' : 'Можно записаться'}</p><p className="mt-2 text-xs text-[var(--gold)]">Связано с {meeting.matchesMyStep ? 'Моим путём' : 'живым Вкладом'}.</p><div className="mt-4 flex flex-wrap gap-2"><SoftButton variant="ghost" onClick={onDetails}>Подробнее</SoftButton>{meeting.isRegistered || meeting.type === 'review' ? <SoftButton variant="quiet" onClick={onPrepare}>Подготовить работу</SoftButton> : <SoftButton variant="quiet" onClick={onRegister}>Записаться</SoftButton>}<SoftButton variant="quiet" onClick={() => onToast(meeting.actions.includes('Я готов помочь') ? 'Готовность помочь обновлена.' : meeting.actions.includes('Задать вопрос заранее') ? 'Вопрос сохранён для встречи.' : 'Встреча добавлена в ваш путь.')}>{meeting.actions.find((action) => !['Подробнее', 'Записаться', 'Подготовить работу'].includes(action)) ?? 'Добавить в мой путь'}</SoftButton></div></article>;
}

function SideCard({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return <section className="rounded-3xl border bg-[var(--bg-card)] p-5" style={{ borderColor: 'var(--border-color)' }}><h2 className="flex items-center gap-2 text-lg font-semibold text-[var(--text-primary)]">{icon}{title}</h2><div className="mt-3">{children}</div></section>;
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return <div className="mt-4 rounded-2xl border p-6 text-center" style={{ borderColor: 'var(--border-color)' }}><MessageCircleQuestion className="mx-auto h-8 w-8 text-[var(--gold)]" /><h3 className="mt-3 font-semibold text-[var(--text-primary)]">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--text-secondary)]">{text}</p><div className="mt-4 flex justify-center gap-2"><SoftButton variant="ghost">Задать вопрос</SoftButton><SoftButton variant="quiet">Найти человека рядом</SoftButton></div></div>;
}

function DetailsDialog({ meeting, open, onClose, onRegister, onPrepare, onToast }: { meeting: Meeting; open: boolean; onClose: () => void; onRegister: () => void; onPrepare: () => void; onToast: (message: string) => void }) {
  return <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>{meeting.title}</DialogTitle><DialogDescription>{meeting.dateLabel} · {meeting.timeLabel} · {formatLabel(meeting.format)}</DialogDescription></DialogHeader><div className="space-y-4 text-sm text-[var(--text-secondary)]"><div><p className="font-semibold text-[var(--text-primary)]">Что будет:</p><p className="mt-2 leading-6">Участники показывают небольшие фрагменты проектов и получают бережный отклик от куратора и сообщества.</p></div><div><p className="font-semibold text-[var(--text-primary)]">Можно прийти, если:</p><ul className="mt-2 space-y-2">{['вы хотите показать работу;', 'вы хотите просто послушать;', 'вы застряли на шаге;', 'вы хотите увидеть, как другие проходят похожий путь.'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />{item}</li>)}</ul></div><div><p className="font-semibold text-[var(--text-primary)]">Что подготовить:</p><p className="mt-2">Если хотите показать работу: ссылку на проект, 1–2 вопроса и что именно хотите получить от разбора.</p><p className="mt-2">Если хотите слушать: ничего готовить не нужно.</p></div></div><DialogFooter><SoftButton variant="primary" onClick={onRegister}>Записаться</SoftButton><SoftButton onClick={onPrepare}>Подготовить работу</SoftButton><SoftButton variant="quiet" onClick={() => onToast('Встреча добавлена в ваш путь.')}>Добавить в мой путь</SoftButton><SoftButton variant="quiet" onClick={onClose}>Закрыть</SoftButton></DialogFooter></DialogContent></Dialog>;
}

function RegisterDialog({ meeting, open, onClose, onSubmit }: { meeting: Meeting; open: boolean; onClose: () => void; onSubmit: () => void }) {
  return <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Записаться на встречу?</DialogTitle><DialogDescription>Встреча появится в ваших записях и в “Моём пути”. Вы сможете прийти просто послушать или подготовить вопрос заранее.</DialogDescription></DialogHeader><div className="rounded-2xl border p-4" style={{ borderColor: 'var(--border-color)' }}><p className="font-semibold">{meeting.title}</p><p className="mt-1 text-sm text-[var(--gold)]">{meeting.dateLabel} · {meeting.timeLabel}</p><p className="mt-4 font-semibold">Что произойдёт:</p><ul className="mt-2 space-y-2 text-sm text-[var(--text-secondary)]">{['встреча добавится в “Мои записи”;', 'она появится в “Моём пути”;', 'за час до встречи будет напоминание;', 'если нужна подготовка, мы покажем короткую подсказку.'].map((item) => <li key={item} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />{item}</li>)}</ul></div><DialogFooter><SoftButton variant="primary" onClick={onSubmit}>Записаться</SoftButton><SoftButton variant="quiet" onClick={onClose}>Вернуться</SoftButton></DialogFooter></DialogContent></Dialog>;
}

function PrepareDialog({ open, onClose, onSubmit }: { open: boolean; onClose: () => void; onSubmit: (message: string) => void }) {
  return <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}><DialogContent className="border-[var(--border-color)] bg-[var(--bg-card)] text-[var(--text-primary)]"><DialogHeader><DialogTitle>Подготовить работу к разбору</DialogTitle><DialogDescription>Работа не должна быть идеальной. Разбор нужен, чтобы увидеть следующий шаг.</DialogDescription></DialogHeader><div className="grid gap-3 text-sm"><input placeholder="Название работы" className="rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }} /><input placeholder="Ссылка или файл" className="rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }} /><textarea rows={3} placeholder="Что хотите получить от разбора?" className="rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }} /><textarea rows={3} placeholder="Комментарий" className="rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }} /><div><p className="mb-2 font-semibold">Готовые варианты для разбора:</p><div className="flex flex-wrap gap-2">{['структура компонентов', 'визуальная ясность', 'логика состояния', 'архитектура', 'следующий шаг'].map((item) => <span key={item} className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-[var(--gold)]">{item}</span>)}</div></div></div><DialogFooter><SoftButton variant="primary" onClick={() => onSubmit('Работа добавлена к встрече. Её можно будет показать на разборе.')}><Send className="h-4 w-4" /> Отправить работу</SoftButton><SoftButton onClick={() => onSubmit('Черновик работы сохранён.')} >Сохранить черновик</SoftButton><SoftButton variant="quiet" onClick={onClose}>Вернуться</SoftButton></DialogFooter></DialogContent></Dialog>;
}
