import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { BookOpen, CheckCircle2, Heart, Lightbulb, MessageCircle, PenLine, Sparkles, Users } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/ToastContext';
import { PageHero } from '@/components/layout/PageHero';

type FeedPostType =
  | 'question'
  | 'answer'
  | 'step'
  | 'gratitude'
  | 'review_request'
  | 'insight'
  | 'life_book';

type FeedPost = {
  id: number;
  type: FeedPostType;
  author: string;
  role?: string;
  track?: string;
  time: string;
  title: string;
  text: string;
  context?: string;
  status?: string;
  badge?: string;
  actions: string[];
  canHelp?: boolean;
  myTrack?: boolean;
};

type FeedFilter = 'all' | 'questions' | 'steps' | 'gratitude' | 'reviews' | 'insights' | 'my_track' | 'can_help';

const feedPosts: FeedPost[] = [
  {
    id: 1,
    type: 'question',
    author: 'Артём',
    role: 'Участник · Backend',
    track: 'Backend',
    time: '12 минут назад',
    title: 'Как аккуратно разложить первый API на Go?',
    text: 'Собрал минимальный сервис и запутался, где держать handlers, services и модели. Буду рад короткому примеру структуры.',
    context: 'первый API на Go',
    status: 'Ждёт отклика',
    badge: 'Вопрос',
    actions: ['Ответить', 'Сохранить как Инсайт'],
    canHelp: true,
  },
  {
    id: 2,
    type: 'answer',
    author: 'Денис',
    role: 'Помощник по практике',
    track: 'Backend',
    time: '28 минут назад',
    title: 'Ответ про авторизацию без лишней сложности',
    text: 'Предложил начать с одной middleware и явного сценария проверки токена, а уже после первого рабочего потока отделять роли и refresh-логику.',
    context: 'Backend · авторизация',
    status: 'Засчитано во Вклад',
    badge: 'Ответ с пользой',
    actions: ['Поблагодарить', 'Сохранить как Инсайт'],
  },
  {
    id: 3,
    type: 'step',
    author: 'Мария',
    role: 'Участница · Frontend',
    track: 'Frontend',
    time: '46 минут назад',
    title: 'Первый экран pet-проекта собран',
    text: 'Сегодня довела пустое состояние и форму добавления задачи. Следующий шаг — подключить сохранение и показать проект на разборе.',
    context: 'frontend pet-проект',
    status: 'Шаг виден сообществу',
    badge: 'Шаг',
    actions: ['Поддержать', 'Поблагодарить'],
    canHelp: true,
    myTrack: true,
  },
  {
    id: 4,
    type: 'gratitude',
    author: 'Анна',
    role: 'Участница',
    track: 'Frontend',
    time: '1 час назад',
    title: 'Спасибо за разбор состояния загрузки',
    text: 'После подсказки Ильи стало понятно, как отделить skeleton от пустого состояния. Интерфейс стал спокойнее и понятнее.',
    context: 'разбор интерфейса',
    status: 'Вклад Анны стал видимым',
    badge: 'Благодарность',
    actions: ['Поблагодарить'],
    myTrack: true,
  },
  {
    id: 5,
    type: 'review_request',
    author: 'Кирилл',
    role: 'Участник · DevOps',
    track: 'DevOps',
    time: '2 часа назад',
    title: 'Нужен бережный взгляд на docker-compose',
    text: 'Поднял приложение и базу, но не уверен, что правильно развёл переменные и healthcheck. Буду рад короткому разбору.',
    context: 'работа на разбор',
    status: 'Можно дать мягкий отклик',
    badge: 'Работа на разбор',
    actions: ['Ответить', 'Поблагодарить'],
    canHelp: true,
  },
  {
    id: 6,
    type: 'insight',
    author: 'Лена',
    role: 'Хранитель знаний',
    track: 'Frontend',
    time: '3 часа назад',
    title: 'Инсайт из обсуждения форм',
    text: 'Если форма сложная, сначала помогите человеку понять следующий маленький шаг, а потом показывайте все проверки и подсказки.',
    context: 'UX форм',
    status: 'Сохранено из обсуждения',
    badge: 'Инсайт',
    actions: ['Сохранить как Инсайт', 'Поблагодарить'],
    myTrack: true,
  },
  {
    id: 7,
    type: 'life_book',
    author: 'Команда сообщества',
    role: 'Книга жизни',
    time: 'Сегодня',
    title: 'Как участники помогли друг другу на этой неделе',
    text: 'Вопросы по API, разбор pet-проектов и благодарности собраны в короткую историю недели, чтобы польза не потерялась в потоке.',
    context: 'жизнь сообщества',
    status: 'Полезные действия стали видимыми',
    badge: 'Книга жизни сообщества',
    actions: ['Открыть историю'],
  },
];

const filters: { id: FeedFilter; label: string }[] = [
  { id: 'all', label: 'Все' },
  { id: 'questions', label: 'Вопросы' },
  { id: 'steps', label: 'Шаги' },
  { id: 'gratitude', label: 'Благодарности' },
  { id: 'reviews', label: 'Работы на разбор' },
  { id: 'insights', label: 'Инсайты' },
  { id: 'my_track', label: 'Мой трек' },
  { id: 'can_help', label: 'Можно помочь' },
];

const postTypeStyle: Record<FeedPostType, { icon: typeof MessageCircle; tone: string }> = {
  question: { icon: MessageCircle, tone: 'rgba(212,175,55,0.13)' },
  answer: { icon: CheckCircle2, tone: 'rgba(107,158,124,0.13)' },
  step: { icon: Sparkles, tone: 'rgba(112,151,201,0.13)' },
  gratitude: { icon: Heart, tone: 'rgba(201,112,106,0.12)' },
  review_request: { icon: PenLine, tone: 'rgba(155,126,200,0.13)' },
  insight: { icon: Lightbulb, tone: 'rgba(212,175,55,0.15)' },
  life_book: { icon: BookOpen, tone: 'rgba(126,169,151,0.13)' },
};

function initials(name: string) {
  return name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

export default function CommunityFeed() {
  const { showToast } = useToast();
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');
  const [newMessageOpen, setNewMessageOpen] = useState(false);
  const [replyTo, setReplyTo] = useState<FeedPost | null>(null);

  const visiblePosts = useMemo(() => feedPosts.filter((post) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'questions') return post.type === 'question';
    if (activeFilter === 'steps') return post.type === 'step';
    if (activeFilter === 'gratitude') return post.type === 'gratitude';
    if (activeFilter === 'reviews') return post.type === 'review_request';
    if (activeFilter === 'insights') return post.type === 'insight';
    if (activeFilter === 'my_track') return post.myTrack;
    if (activeFilter === 'can_help') return post.canHelp;
    return true;
  }), [activeFilter]);

  const handleAction = (action: string, post: FeedPost) => {
    if (action === 'Ответить') {
      setReplyTo(post);
      return;
    }
    if (action === 'Поблагодарить' || action === 'Поддержать') {
      showToast('Благодарность отправлена. Полезное действие стало видимым.', 'success');
      return;
    }
    if (action === 'Сохранить как Инсайт') {
      showToast('Инсайт сохранён. Теперь его смогут найти другие участники.', 'success');
      return;
    }
    showToast('Действие сохранено в вашем пространстве сообщества.', 'info');
  };

  const emptyState = activeFilter === 'questions'
    ? ['Сейчас нет вопросов без отклика', 'Хороший знак: участники получают ответы или пока не задавали новых вопросов.']
    : activeFilter === 'can_help'
      ? ['Сейчас нет вопросов, где нужна ваша помощь', 'Когда появится вопрос по вашей теме или похожему шагу, он появится здесь.']
      : ['Пока в сообществе тихо', 'Когда участники зададут вопросы, поделятся шагами, поблагодарят или сохранят Инсайт, сообщения появятся здесь.'];

  return (
    <main className="flex-1 min-w-0 space-y-5">
      <PageHero
        breadcrumbs={['IT технологии', 'Сообщество']}
        title="Сообщество"
        description="Живая лента сообщений участников: вопросы, шаги, разборы, благодарности и инсайты, которые помогают двигаться вместе."
        updatedLabel="Обновлено 3 минуты назад"
        onRefresh={() => showToast('Лента сообщества обновлена.', 'info')}
      />

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[['7 новых сообщений', 'За сегодня'], ['3 вопроса ждут отклика', 'Можно помочь'], ['4 благодарности', 'Польза замечена'], ['2 инсайта', 'Сохранены из обсуждений']].map(([value, label]) => (
          <article key={value} className="rounded-2xl border bg-[var(--bg-card)] p-4 shadow-[0_10px_26px_rgba(0,0,0,0.035)]" style={{ borderColor: 'var(--border-color)' }}>
            <h2 className="text-lg font-semibold text-[var(--text-primary)]">{value}</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{label}</p>
          </article>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5">
        <div className="space-y-4">
          <section className="rounded-2xl p-4 md:p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
            <button onClick={() => setNewMessageOpen(true)} className="w-full text-left rounded-2xl px-4 py-3 text-sm" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>Что хотите написать сообществу?</button>
            <p className="text-xs mt-3" style={{ color: 'var(--text-secondary)' }}>Можно задать вопрос, поделиться шагом, поблагодарить, показать работу или сохранить инсайт.</p>
            <div className="flex flex-wrap gap-2 mt-4">
              {['Вопрос', 'Шаг', 'Благодарность', 'Работа на разбор', 'Инсайт'].map((mode) => <span key={mode} className="px-3 py-1.5 rounded-full text-xs" style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>{mode}</span>)}
              <span className="px-3 py-1.5 rounded-full text-xs opacity-60" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--hover-bg)', border: '1px dashed var(--border-color)' }}>Объявления публикует команда сообщества.</span>
              <button onClick={() => setNewMessageOpen(true)} className="ml-auto px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#fff' }}>Написать</button>
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter) => <button key={filter.id} onClick={() => setActiveFilter(filter.id)} className="px-3 py-2 rounded-full text-xs font-medium transition-all" style={{ color: activeFilter === filter.id ? '#fff' : 'var(--text-secondary)', background: activeFilter === filter.id ? 'linear-gradient(135deg, var(--gold-dark), var(--gold))' : 'var(--bg-card)', border: '1px solid var(--border-color)' }}>{filter.label}</button>)}
          </div>

          {visiblePosts.length === 0 ? (
            <section className="rounded-2xl p-8 text-center" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
              <h2 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>{emptyState[0]}</h2>
              <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>{emptyState[1]}</p>
              {activeFilter === 'all' && <button onClick={() => setNewMessageOpen(true)} className="mt-5 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#fff' }}>Написать первое сообщение</button>}
            </section>
          ) : visiblePosts.map((post) => {
            const Icon = postTypeStyle[post.type].icon;
            return (
              <article key={post.id} className="rounded-2xl p-5" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold shrink-0" style={{ color: '#fff', background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>{initials(post.author)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{post.author}</h2>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{post.role}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {post.time}</span>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs" style={{ color: 'var(--text-secondary)', backgroundColor: postTypeStyle[post.type].tone, border: '1px solid var(--border-color)' }}><Icon className="w-3.5 h-3.5" />{post.badge}</div>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>{post.title}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{post.text}</p>
                <div className="flex flex-wrap gap-2 mt-4 text-xs">
                  {post.context && <span className="px-2.5 py-1 rounded-full" style={{ color: 'var(--text-muted)', backgroundColor: 'var(--hover-bg)' }}>{post.context}</span>}
                  {post.status && <span className="px-2.5 py-1 rounded-full" style={{ color: 'var(--gold)', backgroundColor: 'rgba(212,175,55,0.1)' }}>{post.status}</span>}
                </div>
                <p className="mt-4 text-xs" style={{ color: 'var(--text-muted)' }}>{post.type === 'question' ? 'Ответ может стать вашим Вкладом, если поможет участнику продвинуться.' : post.status}</p>
                <div className="flex flex-wrap gap-2 mt-4 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
                  {post.actions.map((action) => <button key={action} onClick={() => handleAction(action, post)} className="px-3 py-2 rounded-xl text-xs font-medium" style={{ color: action === 'Ответить' ? '#fff' : 'var(--text-secondary)', background: action === 'Ответить' ? 'linear-gradient(135deg, var(--gold-dark), var(--gold))' : 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>{action}</button>)}
                </div>
              </article>
            );
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar">
          <SideCard title="Можно помочь" icon={<HandIcon />}> 
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Есть 2 вопроса, где ваш опыт может быть полезен.</p>
            <HelpRow name="Артём" text="первый API на Go" action="Ответить" onClick={() => setReplyTo(feedPosts[0])} />
            <HelpRow name="Мария" text="frontend pet-проект" action="Поддержать" onClick={() => showToast('Благодарность отправлена. Полезное действие стало видимым.', 'success')} />
            <p className="text-xs pt-2" style={{ color: 'var(--text-muted)' }}>Можно помочь коротко. Это не обязанность.</p>
          </SideCard>
          <SideCard title="Моя активность" icon={<Users className="w-4 h-4" />}>
            {['1 вопрос задан', '2 ответа получены', '1 благодарность отправлена', '3 полезных действия во Вклад'].map((item) => <p key={item} className="text-sm" style={{ color: 'var(--text-secondary)' }}>• {item}</p>)}
            <button className="mt-3 w-full px-3 py-2 rounded-xl text-xs font-semibold" style={{ color: 'var(--gold)', backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>Открыть Мой путь</button>
          </SideCard>
          <SideCard title="Ближайшее" icon={<BookOpen className="w-4 h-4" />}>
            <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Разбор pet-проектов</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Завтра · 19:00</p>
            <button className="mt-3 w-full px-3 py-2 rounded-xl text-xs font-semibold" style={{ color: '#fff', background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>Посмотреть встречу</button>
          </SideCard>
        </aside>
      </div>

      <MessageDialog open={newMessageOpen} onOpenChange={setNewMessageOpen} onSubmit={() => { setNewMessageOpen(false); showToast('Сообщение опубликовано в сообществе.', 'success'); }} />
      <ReplyDialog post={replyTo} onOpenChange={(open) => !open && setReplyTo(null)} onSubmit={() => { setReplyTo(null); showToast('Ответ отправлен. Если Артём отметит его полезным, он станет видимым Вкладом.', 'success'); }} />
    </main>
  );
}

function HandIcon() {
  return <Heart className="w-4 h-4" />;
}

function SideCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return <section className="rounded-2xl p-4" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}><div className="flex items-center gap-2 mb-3" style={{ color: 'var(--text-primary)' }}><span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ color: 'var(--gold)', backgroundColor: 'rgba(212,175,55,0.1)' }}>{icon}</span><h2 className="font-semibold">{title}</h2></div><div className="space-y-2">{children}</div></section>;
}

function HelpRow({ name, text, action, onClick }: { name: string; text: string; action: string; onClick: () => void }) {
  return <div className="flex items-center justify-between gap-2 text-sm"><span style={{ color: 'var(--text-secondary)' }}><b style={{ color: 'var(--text-primary)' }}>{name}</b> · {text}</span><button onClick={onClick} className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>{action}</button></div>;
}

function MessageDialog({ open, onOpenChange, onSubmit }: { open: boolean; onOpenChange: (open: boolean) => void; onSubmit: () => void }) {
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}><DialogHeader><DialogTitle>Новое сообщение</DialogTitle><DialogDescription>Выберите формат и оставьте короткий контекст, чтобы участникам было проще откликнуться.</DialogDescription></DialogHeader><FormFields /><DialogFooter><button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--text-secondary)' }}>Вернуться</button><button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--gold)', border: '1px solid var(--border-color)' }}>Сохранить черновик</button><button onClick={onSubmit} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#fff' }}>Опубликовать</button></DialogFooter></DialogContent></Dialog>;
}

function ReplyDialog({ post, onOpenChange, onSubmit }: { post: FeedPost | null; onOpenChange: (open: boolean) => void; onSubmit: () => void }) {
  return <Dialog open={Boolean(post)} onOpenChange={onOpenChange}><DialogContent className="rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', color: 'var(--text-primary)' }}><DialogHeader><DialogTitle>Ответить {post?.author ? `${post.author.replace('Артём', 'Артёму')}` : 'участнику'}</DialogTitle><DialogDescription>Ответ не обязан быть идеальным. Достаточно короткого отклика, который поможет участнику сделать следующий шаг.</DialogDescription></DialogHeader><label className="space-y-2 text-sm"><span>Ответ</span><textarea rows={6} className="w-full rounded-xl p-3 outline-none" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }} /></label><label className="flex items-start gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}><input type="checkbox" className="mt-1" />Предложить сохранить ответ как Инсайт, если он поможет другим</label><DialogFooter><button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--text-secondary)' }}>Вернуться</button><button onClick={() => onOpenChange(false)} className="px-4 py-2 rounded-xl text-sm" style={{ color: 'var(--gold)', border: '1px solid var(--border-color)' }}>Сохранить черновик</button><button onClick={onSubmit} className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))', color: '#fff' }}>Отправить ответ</button></DialogFooter></DialogContent></Dialog>;
}

function FormFields() {
  const inputStyle = { backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' };
  return <div className="space-y-3"><label className="space-y-1 text-sm block"><span>Тип сообщения</span><select className="w-full rounded-xl p-3 outline-none" style={inputStyle}>{['Вопрос', 'Шаг', 'Благодарность', 'Работа на разбор', 'Инсайт'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="space-y-1 text-sm block"><span>Заголовок до 120 символов</span><input maxLength={120} className="w-full rounded-xl p-3 outline-none" style={inputStyle} /></label><label className="space-y-1 text-sm block"><span>Сообщение до 1000 символов</span><textarea maxLength={1000} rows={5} className="w-full rounded-xl p-3 outline-none" style={inputStyle} /></label><div className="grid grid-cols-1 md:grid-cols-2 gap-3"><label className="space-y-1 text-sm block"><span>Контекст</span><select className="w-full rounded-xl p-3 outline-none" style={inputStyle}>{['Мой путь', 'Frontend', 'Backend', 'DevOps', 'Разборы', 'Вопросы новичков', 'Без темы'].map((item) => <option key={item}>{item}</option>)}</select></label><label className="space-y-1 text-sm block"><span>Видимость</span><select className="w-full rounded-xl p-3 outline-none" style={inputStyle}>{['Все участники', 'Участники моего трека', 'Кураторы и команда', 'Только участники рядом'].map((item) => <option key={item}>{item}</option>)}</select></label></div></div>;
}
