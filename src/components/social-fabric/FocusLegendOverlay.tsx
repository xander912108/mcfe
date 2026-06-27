import { useState, useEffect, useRef, useCallback } from 'react';
import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown, ArrowRight } from 'lucide-react';

interface FocusLegendOverlayProps {
  topology?: string;
  mode?: 'participant' | 'leader';
  focusMode?: boolean;
}

const EDGES = {
  help: '#C9A96E',
  review: '#a78bfa',
  flow: '#34d399',
  mentorship: '#f472b6',
  gratitude: '#fbbf24',
};

const STATUS = {
  active:       { border: '#22c55e', bg: 'rgba(34,197,94,0.12)' },
  stuck:        { border: '#eab308', bg: 'rgba(234,179,8,0.12)' },
  burnout_risk: { border: '#f97316', bg: 'rgba(249,115,22,0.12)' },
  inactive:     { border: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
};

interface LegendBlock {
  id: string;
  title: string;
  content: ReactNode;
}

function getMyWorldBlocks(): LegendBlock[] {
  return [
    {
      id: 'edges', title: 'Мои связи',
      content: (
        <div className="space-y-2">
          {[
            { color: EDGES.help, label: 'Помощь', desc: 'Связь через вопрос, совет или поддержку по шагу' },
            { color: EDGES.review, label: 'Разбор', desc: 'Пересечение через разбор, обратную связь или обсуждение' },
            { color: EDGES.flow, label: 'Поток', desc: 'Были в одном потоке, группе или общем учебном ритме' },
            { color: EDGES.mentorship, label: 'Наставничество', desc: 'Сопровождение, помощь на старте или регулярная поддержка' },
            { color: EDGES.gratitude, label: 'Благодарность', desc: 'Признание помощи, вклада или поддержки' },
          ].map((e) => (
            <div key={e.label} className="flex items-start gap-2">
              <div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: e.color }} />
              <div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{e.label}</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>{e.desc}</span></div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'direction', title: 'Направление связи',
      content: (
        <div className="flex items-start gap-2">
          <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }} />
          <div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Стрелка на линии</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Показывает направление действия: кто помогал вам или кому можете быть полезны вы.</span></div>
        </div>
      ),
    },
    {
      id: 'activity', title: 'Активность связи',
      content: (
        <div className="space-y-3">
          <div><div className="flex items-start gap-2 mb-1"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(201,169,110,0.8)' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Яркая линия</span></div><p className="text-[11px] leading-relaxed pl-7" style={{ color: 'var(--text-muted)' }}>Связь недавно обновлялась: был вопрос, помощь, благодарность, разбор или общий шаг. Это живая связь, которую стоит поддерживать.</p></div>
          <div><div className="flex items-start gap-2 mb-1"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(201,169,110,0.25)' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Тусклая линия</span></div><p className="text-[11px] leading-relaxed pl-7" style={{ color: 'var(--text-muted)' }}>Связь есть, но давно не обновлялась. Её можно мягко оживить: написать, поблагодарить или предложить помощь.</p></div>
          <div><div className="flex items-start gap-2 mb-1"><svg width="20" height="4" className="shrink-0 mt-1.5"><line x1="0" y1="2" x2="20" y2="2" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 5" /></svg><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Пунктирная линия</span></div><p className="text-[11px] leading-relaxed pl-7" style={{ color: 'var(--text-muted)' }}>Связи ещё нет, но есть хороший повод её создать: общий трек, похожий шаг, общий поток, совпадающая цель или готовность человека помочь.</p></div>
        </div>
      ),
    },
    {
      id: 'status', title: 'Статус',
      content: (
        <div className="space-y-3">
          <div><div className="flex items-start gap-2 mb-1"><div className="w-6 h-6 rounded-full shrink-0" style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.3) 0%, rgba(201,169,110,0.1) 45%, transparent 70%)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Ореол актуальности</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Сейчас есть хороший повод обратить внимание на этого человека</span></div></div><p className="text-[11px] leading-relaxed pl-8" style={{ color: 'var(--text-muted)' }}>Ореол появляется, когда человек особенно релевантен вам сейчас: общий шаг, похожая цель, готовность помочь, полезная роль или рекомендация системы. Ореол не означает рейтинг — он подсказывает, с кем можно сделать следующий живой шаг.</p></div>
          <div className="flex items-start gap-2"><div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: 'rgba(201,169,110,0.4)', boxShadow: '0 0 5px rgba(201,169,110,0.3)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Готов помочь</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Можно обратиться с вопросом, советом или просьбой</span></div></div>
          <div className="flex items-start gap-2"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(201,169,110,0.7)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Онлайн</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Голубая пульсация — мягкий сигнал доступности</span></div></div>
        </div>
      ),
    },
    {
      id: 'roles', title: 'Роли',
      content: (
        <div className="space-y-2">
          {[
            { c: '#C9A96E', l: 'Помощник по практике', d: 'Может помочь с конкретным шагом или задачей' },
            { c: '#B89cc0', l: 'Помощник на старт', d: 'Помогает новичкам пройти первые дни' },
            { c: '#d69e2e', l: 'Хранитель знаний', d: 'Помогает находить опыт, материалы, ответы' },
            { c: '#ed64a6', l: 'Куратор', d: 'Направляет, поддерживает движение' },
            { c: '#6B9E7C', l: 'Связующий', d: 'Соединяет людей, темы и группы' },
          ].map((r) => (
            <div key={r.l} className="flex items-start gap-2"><div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: r.c }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{r.l}</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>{r.d}</span></div></div>
          ))}
        </div>
      ),
    },
  ];
}

function getCirclesBlocks(): LegendBlock[] {
  return [
    {
      id: 'rings', title: 'Круги близости',
      content: (
        <div className="space-y-1.5">
          {[
            { c: '#fbbf24', l: 'Опоры', d: 'Устойчивые связи — попросить совет' },
            { c: '#C9A96E', l: 'Близкие', d: 'Тёплые связи — написать, продолжить' },
            { c: '#2dd4bf', l: 'Коллеги', d: 'Общий контекст — обменяться опытом' },
            { c: '#9A9895', l: 'Знакомые', d: 'Слабая связь — мягко оживить' },
            { c: '#6A6865', l: 'Потенциальные', d: 'Связи ещё нет — познакомиться' },
          ].map((r) => (
            <div key={r.l} className="flex items-start gap-2"><div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: r.c }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{r.l}</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>{r.d}</span></div></div>
          ))}
        </div>
      ),
    },
    {
      id: 'activity', title: 'Активность связи',
      content: (
        <div className="space-y-2">
          <div className="flex items-start gap-2"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(201,169,110,0.8)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Яркая линия</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Связь недавно обновлялась — живая связь, которую стоит поддерживать.</span></div></div>
          <div className="flex items-start gap-2"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(201,169,110,0.25)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Тусклая линия</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Связь давно не обновлялась. Её можно мягко оживить.</span></div></div>
          <div className="flex items-start gap-2"><svg width="20" height="4" className="shrink-0 mt-1.5"><line x1="0" y1="2" x2="20" y2="2" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 5" /></svg><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Пунктирная линия</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Связи ещё нет, но есть хороший повод её создать.</span></div></div>
        </div>
      ),
    },
    {
      id: 'status', title: 'Статус',
      content: (
        <div className="space-y-2">
          <div className="flex items-start gap-2"><div className="w-6 h-6 rounded-full shrink-0" style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.3) 0%, rgba(201,169,110,0.1) 45%, transparent 70%)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Ореол актуальности</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Сейчас есть хороший повод обратить внимание на этого человека</span></div></div>
          <div className="flex items-start gap-2"><div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: 'rgba(201,169,110,0.4)', boxShadow: '0 0 5px rgba(201,169,110,0.3)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Готов помочь</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Можно обратиться с вопросом, советом или просьбой</span></div></div>
          <div className="flex items-start gap-2"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(201,169,110,0.7)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Онлайн</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Голубая пульсация — мягкий сигнал доступности</span></div></div>
        </div>
      ),
    },
    {
      id: 'roles', title: 'Роли',
      content: (
        <div className="space-y-2">
          {[
            { c: '#C9A96E', l: 'Помощник по практике', d: 'Может помочь с конкретным шагом или задачей' },
            { c: '#B89cc0', l: 'Помощник на старт', d: 'Помогает новичкам пройти первые дни' },
            { c: '#d69e2e', l: 'Хранитель знаний', d: 'Помогает находить опыт, материалы, ответы' },
            { c: '#ed64a6', l: 'Куратор', d: 'Направляет, поддерживает движение' },
            { c: '#6B9E7C', l: 'Связующий', d: 'Соединяет людей, темы и группы' },
          ].map((r) => (
            <div key={r.l} className="flex items-start gap-2"><div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: r.c }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{r.l}</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>{r.d}</span></div></div>
          ))}
        </div>
      ),
    },
  ];
}

function getPulseBlocks(): LegendBlock[] {
  return [
    {
      id: 'temperature', title: 'Температура',
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-2"><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Холодно</span><div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, rgb(15,50,195), rgb(40,180,255), rgb(70,250,100), rgb(255,80,25), rgb(255,40,40))' }} /><span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Горячо</span></div>
          <div className="space-y-1.5">
            {[
              { c: 'rgb(15,50,195)', l: 'Мало взаимодействий' },
              { c: 'rgb(40,180,255)', l: 'Появились связи' },
              { c: 'rgb(70,250,100)', l: 'Активно помогает' },
              { c: 'rgb(255,80,25)', l: 'Много помощи, разборов' },
              { c: 'rgb(255,40,40)', l: 'Ядро активности' },
            ].map((t) => (
              <div key={t.l} className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full" style={{ background: t.c }} /><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{t.l}</span></div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'care', title: 'Точка заботы',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border-2" style={{ borderColor: '#ef4444' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Нет связей или застрял</span></div>
          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Красное кольцо — участник пока не вошёл в живые связи сообщества. Это сигнал для лидера мягко подобрать наставника.</p>
        </div>
      ),
    },
  ];
}

function getClusterBlocks(): LegendBlock[] {
  return [
    {
      id: 'types', title: 'Типы',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border" style={{ borderColor: 'rgba(201,169,110,0.4)', background: 'rgba(201,169,110,0.15)' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Тесная группа</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border" style={{ borderColor: 'rgba(251,191,36,0.6)', background: 'rgba(251,191,36,0.15)' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Мост — соединяет группы</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full border" style={{ borderColor: 'rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.1)' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Нужна первая связь</span></div>
        </div>
      ),
    },
    {
      id: 'saturation', title: 'Насыщенность',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: 'rgba(201,169,110,0.6)' }} /><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Яркий — ближе к ядру</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: 'rgba(201,169,110,0.2)' }} /><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Бледный — периферия</span></div>
          <p className="text-[11px] leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>Группы формируются автоматически по силе связей. Мосты — участники, которые соединяют разные группы и помогают сообществу не распадаться на островки.</p>
        </div>
      ),
    },
  ];
}

function getHealthBlocks(): LegendBlock[] {
  return [
    {
      id: 'status', title: 'Цвет контура',
      content: (
        <div className="space-y-2">
          {[
            { b: STATUS.active.border, bg: STATUS.active.bg, l: 'Зелёный — в устойчивом движении' },
            { b: STATUS.stuck.border, bg: STATUS.stuck.bg, l: 'Жёлтый — нужен мягкий импульс' },
            { b: STATUS.burnout_risk.border, bg: STATUS.burnout_risk.bg, l: 'Оранжевый — много помогает, может устать' },
            { b: STATUS.inactive.border, bg: STATUS.inactive.bg, l: 'Красный — нужна первая связь' },
          ].map((s) => (
            <div key={s.l} className="flex items-center gap-2.5"><div className="w-3.5 h-3.5 rounded-full border-2" style={{ borderColor: s.b, background: s.bg }} /><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>{s.l}</span></div>
          ))}
        </div>
      ),
    },
    {
      id: 'map', title: 'На карте',
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full" style={{ background: '#22c55e' }} /><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Зелёная точка — онлайн</span></div>
          <div className="flex items-center gap-2"><div className="w-8 h-px" style={{ background: 'var(--text-muted)' }} /><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Тонкая линия — связь</span></div>
          <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#C9A96E' }} /><span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Пульсация — сигнал заботы</span></div>
          <p className="text-[11px] leading-relaxed mt-2" style={{ color: 'var(--text-muted)' }}>Каждый кружок — участник. Цвет контура показывает состояние. Жёлтый, оранжевый и красный мягко пульсируют — это точки заботы.</p>
        </div>
      ),
    },
  ];
}

function getNetworkBlocks(): LegendBlock[] {
  return [
    {
      id: 'signals', title: 'Сигналы',
      content: (
        <div className="space-y-2">
          <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: '#f59e0b' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Задержался на шаге</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Участник надолго остановился на одном шаге — стоит мягко спросить, нужна ли помощь</span></div></div>
          <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: '#ef4444' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Риск перегруза</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Слишком много помогает другим — риск выгорания, стоит разгрузить</span></div></div>
          <div className="flex items-start gap-2"><div className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: '#C9A96E' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Готов помочь</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Открыл готовность помогать — можно направить запрос от других участников</span></div></div>
        </div>
      ),
    },
    {
      id: 'edges', title: 'Связи',
      content: (
        <div className="space-y-2">
          {[
            { color: EDGES.help, label: 'Помощь', desc: 'Связь через вопрос, совет или поддержку по шагу' },
            { color: EDGES.review, label: 'Разбор', desc: 'Пересечение через разбор, обратную связь или обсуждение' },
            { color: EDGES.flow, label: 'Поток', desc: 'Были в одном потоке, группе или общем учебном ритме' },
            { color: EDGES.mentorship, label: 'Наставничество', desc: 'Сопровождение, помощь на старте или регулярная поддержка' },
            { color: EDGES.gratitude, label: 'Благодарность', desc: 'Признание помощи, вклада или поддержки' },
          ].map((e) => (
            <div key={e.label} className="flex items-start gap-2"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: e.color }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{e.label}</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>{e.desc}</span></div></div>
          ))}
        </div>
      ),
    },
    {
      id: 'direction', title: 'Направление связи',
      content: (
        <div className="flex items-start gap-2">
          <ArrowRight className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: 'var(--text-secondary)' }} />
          <div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Стрелка на линии</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Показывает направление действия: кто помогал вам или кому можете быть полезны вы.</span></div>
        </div>
      ),
    },
    {
      id: 'activity', title: 'Активность связи',
      content: (
        <div className="space-y-3">
          <div><div className="flex items-start gap-2 mb-1"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(201,169,110,0.8)' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Яркая линия</span></div><p className="text-[11px] leading-relaxed pl-7" style={{ color: 'var(--text-muted)' }}>Связь недавно обновлялась: был вопрос, помощь, благодарность, разбор или общий шаг. Это живая связь, которую стоит поддерживать.</p></div>
          <div><div className="flex items-start gap-2 mb-1"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(201,169,110,0.25)' }} /><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Тусклая линия</span></div><p className="text-[11px] leading-relaxed pl-7" style={{ color: 'var(--text-muted)' }}>Связь есть, но давно не обновлялась. Её можно мягко оживить: написать, поблагодарить или предложить помощь.</p></div>
          <div><div className="flex items-start gap-2 mb-1"><svg width="20" height="4" className="shrink-0 mt-1.5"><line x1="0" y1="2" x2="20" y2="2" stroke="var(--text-muted)" strokeWidth="1.5" strokeDasharray="4 5" /></svg><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Пунктирная линия</span></div><p className="text-[11px] leading-relaxed pl-7" style={{ color: 'var(--text-muted)' }}>Связи ещё нет, но есть хороший повод её создать: общий трек, похожий шаг, общий поток, совпадающая цель или готовность человека помочь.</p></div>
        </div>
      ),
    },
    {
      id: 'status', title: 'Статус',
      content: (
        <div className="space-y-3">
          <div><div className="flex items-start gap-2 mb-1"><div className="w-6 h-6 rounded-full shrink-0" style={{ background: 'radial-gradient(circle, rgba(201,169,110,0.3) 0%, rgba(201,169,110,0.1) 45%, transparent 70%)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Ореол актуальности</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Сейчас есть хороший повод обратить внимание на этого человека</span></div></div><p className="text-[11px] leading-relaxed pl-8" style={{ color: 'var(--text-muted)' }}>Ореол появляется, когда человек особенно релевантен вам сейчас: общий шаг, похожая цель, готовность помочь, полезная роль или рекомендация системы. Ореол не означает рейтинг — он подсказывает, с кем можно сделать следующий живой шаг.</p></div>
          <div className="flex items-start gap-2"><div className="w-5 h-0.5 rounded-full shrink-0 mt-1.5" style={{ background: 'rgba(201,169,110,0.7)' }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>Онлайн</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>Голубая пульсация — мягкий сигнал доступности</span></div></div>
        </div>
      ),
    },
    {
      id: 'roles', title: 'Роли',
      content: (
        <div className="space-y-2">
          {[
            { c: '#C9A96E', l: 'Помощник по практике', d: 'Может помочь с конкретным шагом или задачей' },
            { c: '#B89cc0', l: 'Помощник на старт', d: 'Помогает новичкам пройти первые дни' },
            { c: '#d69e2e', l: 'Хранитель знаний', d: 'Помогает находить опыт, материалы, ответы' },
            { c: '#ed64a6', l: 'Куратор', d: 'Направляет, поддерживает движение' },
            { c: '#6B9E7C', l: 'Связующий', d: 'Соединяет людей, темы и группы' },
          ].map((r) => (
            <div key={r.l} className="flex items-start gap-2"><div className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5" style={{ background: r.c }} /><div><span className="text-[11px] font-medium" style={{ color: 'var(--text-secondary)' }}>{r.l}</span><span className="text-[11px] block" style={{ color: 'var(--text-muted)' }}>{r.d}</span></div></div>
          ))}
        </div>
      ),
    },
  ];
}

function getBlocks(topology: string, mode: string): LegendBlock[] {
  switch (topology) {
    case 'star':      return mode === 'leader' ? getNetworkBlocks() : getMyWorldBlocks();
    case 'circles':   return getCirclesBlocks();
    case 'density':   return getPulseBlocks();
    case 'clusters':  return getClusterBlocks();
    case 'health':    return getHealthBlocks();
    case 'network':   return getNetworkBlocks();
    default:          return getMyWorldBlocks();
  }
}

export function FocusLegendOverlay({ topology = 'star', mode: _mode = 'participant', focusMode = false }: FocusLegendOverlayProps) {
  const blocks = getBlocks(topology, _mode);
  const firstBlockId = blocks[0]?.id || 'edges';
  const [expanded, setExpanded] = useState(false);
  const [activeBlock, setActiveBlock] = useState(firstBlockId);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const [triggerVisible, setTriggerVisible] = useState(true);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!focusMode) {
      setTriggerVisible(true);
      return;
    }
    setTriggerVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      if (!expanded) setTriggerVisible(false);
    }, 4000);
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [focusMode, expanded]);

  useEffect(() => {
    if (focusMode && expanded) setTriggerVisible(true);
  }, [expanded, focusMode]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!focusMode) return;
    const bottomZone = window.innerHeight * 0.15;
    const isNearBottom = e.clientY > window.innerHeight - bottomZone;
    if (isNearBottom) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      setTriggerVisible(true);
    } else if (!expanded) {
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = setTimeout(() => setTriggerVisible(false), 600);
    }
  }, [focusMode, expanded]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, [handleMouseMove]);

  useEffect(() => {
    if (!expanded) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current && triggerRef.current && !panelRef.current.contains(target) && !triggerRef.current.contains(target)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [expanded]);

  const effectiveActive = blocks.find((b) => b.id === activeBlock) ? activeBlock : firstBlockId;

  return (
    <>
      <div className="absolute bottom-4 left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <div
            ref={triggerRef}
            onClick={() => setExpanded(!expanded)}
            className={`flex items-center justify-center gap-1.5 cursor-pointer select-none transition-all duration-500 w-full ${
              focusMode && !triggerVisible && !expanded ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'
            }`}
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; }}
          >
            <span className="text-[11px] uppercase tracking-widest font-medium">Как читать карту</span>
            {expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </div>

          {expanded && (
            <div
              ref={panelRef}
              className="mt-2 rounded-xl"
              style={{
                width: '620px',
                height: '240px',
                background: 'var(--bg-card)',
                backdropFilter: 'blur(32px)',
                border: '1px solid var(--border-color)',
                boxShadow: 'var(--card-shadow), 0 0 1px var(--border-color)',
              }}
            >
              <div className="p-4 h-full">
                <div className="flex h-full gap-3">
                  <div className="w-[140px] shrink-0 flex flex-col gap-0.5">
                    {blocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => setActiveBlock(block.id)}
                        className="text-left px-3 py-2 rounded-md text-[11px] font-medium transition-all duration-150"
                        style={{
                          background: effectiveActive === block.id ? 'rgba(201,169,110,0.12)' : 'transparent',
                          color: effectiveActive === block.id ? '#C9A96E' : 'var(--text-muted)',
                        }}
                        onMouseEnter={(e) => {
                          if (effectiveActive !== block.id) {
                            e.currentTarget.style.background = 'var(--hover-bg)';
                            e.currentTarget.style.color = 'var(--text-muted)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (effectiveActive !== block.id) {
                            e.currentTarget.style.background = 'transparent';
                            e.currentTarget.style.color = 'var(--text-muted)';
                          }
                        }}
                      >
                        {block.title}
                      </button>
                    ))}
                  </div>
                  <div className="w-px shrink-0 self-stretch my-1" style={{ background: 'var(--border-color)' }} />
                  <div className="flex-1 overflow-y-auto pr-1" style={{ maxHeight: '200px' }}>
                    <div className="transition-opacity duration-150" key={effectiveActive}>
                      {blocks.find((b) => b.id === effectiveActive)?.content}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
