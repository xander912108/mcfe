import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, Users, HandHeart,
  Sparkles, Check, Shield
} from 'lucide-react';

/* ===== DATA ===== */
const values = [
  { icon: HandHeart, title: 'Системная поддержка', desc: 'Треки по направлениям, разборы проектов, помощь с выбором инструментов. Здесь не дают готовых ответов — помогают разобраться.' },
  { icon: Sparkles, title: 'Менторство', desc: 'Практикующие техлиды и senior-разработчики из крупных технологических компаний. Каждый ментор проходит отбор.' },
  { icon: Users, title: 'Среда роста', desc: 'Сообщество, где участники становятся опорой друг для друга. Сегодня новичок — завтра наставник.' },
];

const tracks = [
  { name: 'Frontend', level: 'React · TypeScript · Next.js', members: 34 },
  { name: 'Backend', level: 'Go · Python · Node.js', members: 28 },
  { name: 'DevOps', level: 'Docker · Kubernetes · CI/CD', members: 19 },
  { name: 'ML / AI', level: 'Python · PyTorch · MLOps', members: 15 },
  { name: 'System Design', level: 'Архитектура · Масштабирование', members: 12 },
];

const culture = [
  'Задавать вопросы без страха показаться неопытным',
  'Просить помощь без стыда — это нормально',
  'Давать бережный разбор, а не критику',
  'Благодарить за пользу открыто',
  'Делиться опытом, даже если кажется, что он мал',
  'Подключаться к разборам других — учиться на чужих кейсах',
];

const stats = [
  { value: '200+', label: 'участников' },
  { value: '5', label: 'треков' },
  { value: '40+', label: 'менторов' },
  { value: '150+', label: 'разборов в год' },
];

/* ===== COLORS ===== */
const GOLD = 'var(--gold)';
const GOLD_BG = 'rgba(212, 175, 55, 0.1)';

/* ===== COMPONENT ===== */
export default function CommunityLanding() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl" style={{ backgroundColor: 'var(--bg-header)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Left: back + community */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-sm font-medium transition-colors hover:opacity-80"
              style={{ color: 'var(--text-secondary)' }}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Назад</span>
            </button>
            <div className="h-4 w-px" style={{ backgroundColor: 'var(--border-color)' }} />
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--gold-dark), var(--gold))' }}>
                <Shield className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
              <span className="text-sm font-semibold hidden sm:block" style={{ color: 'var(--text-primary)' }}>IT технологии</span>
            </div>
          </div>
          {/* Right: page title */}
          <h1 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>О сообществе</h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-6 py-8 md:py-12">

        {/* Hero */}
        <section className="mb-12 md:mb-16 section-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: GOLD_BG }}>
              <Users className="w-5 h-5" style={{ color: GOLD }} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>IT технологии</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            Сообщество для разработчиков, архитекторов и специалистов по ИИ
          </h1>
          <p className="text-base md:text-lg leading-relaxed max-w-3xl mb-6" style={{ color: 'var(--text-secondary)' }}>
            Здесь разбирают реальные кейсы от ML-моделей до микросервисной инфраструктуры. Менторы — практикующие техлиды и senior-разработчики из крупных технологических компаний.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((s, i) => (
              <div key={i} className="p-4 rounded-xl text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-2xl font-bold" style={{ color: GOLD }}>{s.value}</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What gives participation */}
        <section className="mb-12 md:mb-16 section-fade-in" style={{ animationDelay: '50ms' }}>
          <h2 className="text-xl md:text-2xl font-bold mb-6 heading-accent" style={{ fontFamily: "'Playfair Display', serif" }}>
            Что даёт участие
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {values.map((v, i) => (
              <div key={i} className="p-5 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: GOLD_BG }}>
                  <v.icon className="w-5 h-5" style={{ color: GOLD }} />
                </div>
                <h3 className="text-base font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{v.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tracks */}
        <section className="mb-12 md:mb-16 section-fade-in" style={{ animationDelay: '100ms' }}>
          <h2 className="text-xl md:text-2xl font-bold mb-6 heading-accent" style={{ fontFamily: "'Playfair Display', serif" }}>
            Треки
          </h2>
          <div className="space-y-3">
            {tracks.map((t, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: GOLD_BG, color: GOLD }}>
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.level}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{t.members}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-12 md:mb-16 section-fade-in" style={{ animationDelay: '150ms' }}>
          <h2 className="text-xl md:text-2xl font-bold mb-6 heading-accent" style={{ fontFamily: "'Playfair Display', serif" }}>
            Как устроено сообщество
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { step: '1', title: 'Вступление', desc: 'Заполняете заявку, проходите короткое интервью. Мы хотим понять ваши цели и подобрать правильный трек.' },
              { step: '2', title: 'Первый шаг', desc: 'После входа вы получаете стартовый гайд и персональные рекомендации. Важно не остаться одному в первые дни.' },
              { step: '3', title: 'Треки и разборы', desc: 'Выбираете направление, проходите трек, участвуете в разборах. Каждый разбор — это живой разбор реального проекта.' },
              { step: '4', title: 'Становление опорой', desc: 'Со временем вы сами начинаете помогать другим. Это естественный путь: от получателя поддержки — к наставнику.' },
            ].map((s, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: GOLD_BG, color: GOLD }}>
                  {s.step}
                </div>
                <div>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{s.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Culture */}
        <section className="mb-12 md:mb-16 section-fade-in" style={{ animationDelay: '200ms' }}>
          <h2 className="text-xl md:text-2xl font-bold mb-6 heading-accent" style={{ fontFamily: "'Playfair Display', serif" }}>
            Здесь принято
          </h2>
          <div className="p-5 md:p-6 rounded-xl" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
            <div className="space-y-3">
              {culture.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-4 h-4 shrink-0 mt-0.5" style={{ color: GOLD }} />
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="mb-8 section-fade-in" style={{ animationDelay: '250ms' }}>
          <div className="p-6 md:p-8 rounded-2xl text-center" style={{ backgroundColor: GOLD_BG, border: '1px solid rgba(212,175,55,0.2)' }}>
            <h2 className="text-xl md:text-2xl font-bold mb-3 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>
              Хотите присоединиться?
            </h2>
            <p className="text-sm leading-relaxed max-w-lg mx-auto mb-5" style={{ color: 'var(--text-secondary)' }}>
              Заполните заявку, и мы свяжемся с вами для короткого интервью. Это поможет понять ваши цели и подобрать правильный трек.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:opacity-90"
              style={{ backgroundColor: GOLD, color: '#fff' }}
            >
              Подать заявку на вступление
            </button>
          </div>
        </section>

      </main>
    </div>
  );
}
