import { useState, useRef, useEffect } from 'react';
import {
  AlertTriangle, ChevronRight, Check,
  X, Info, Users, Zap, Lightbulb,
  BookOpen, Pause, Clock, ArrowRight,
  FileText, Search
} from 'lucide-react';
import { useToast } from './ToastContext';

/* ===== PREMIUM COLORS ===== */
const TERRACOTTA = '#C9706A';
const TERRACOTTA_LIGHT = 'rgba(201,112,106,0.08)';
const TERRACOTTA_BORDER = 'rgba(201,112,106,0.15)';
const SAGE = '#6B9E7C';
const SAGE_LIGHT = 'rgba(107,158,124,0.08)';
const SAGE_BORDER = 'rgba(107,158,124,0.15)';
/* ===== DATA (placeholder for future metrics if needed) ===== */
/* ===== DATA: ATTENTION CARDS ===== */
const attentionCards = [
  {
    id: 1,
    title: '3 заявки требуют ответа',
    text: 'Кандидаты уже проявили интерес к сообществу. Лучше ответить, пока этот интерес ещё тёплый.',
    primary: 'Рассмотреть заявки',
    accent: 'terracotta' as const,
    why: 'Заявки без ответа больше суток могут снижать доверие к сообществу ещё до входа. Быстрый ответ помогает человеку почувствовать, что его заметили.',
  },
  {
    id: 2,
    title: '3 новичкам нужна первая связь',
    text: 'Один ждёт ответа на вопрос, двум ещё нужен первый живой отклик.',
    primary: 'Посмотреть новичков',
    accent: 'gold' as const,
    why: 'Эти участники находятся в первые 7 дней после вступления. Первая связь помогает новичку почувствовать, что он не один, и повышает шанс, что он начнёт путь в сообществе.',
  },
  {
    id: 3,
    title: 'Для двух новичков пока не найдена опора',
    text: 'Можно посмотреть подходящих Помощников на старте и участников рядом.',
    primary: 'Посмотреть новичков',
    accent: 'gold' as const,
    why: 'Если опоры не хватает, лидер снова становится единственной точкой входа. Лучше подключить участников, которые уже помогали другим и готовы взять небольшую нагрузку.',
  },
];

/* ===== DATA: APPLICATIONS BY FILTER ===== */
const applicationFilters = [
  { key: 'waiting', label: 'Требуют ответа', count: 3 },
  { key: 'clarify', label: 'На уточнении', count: 2 },
  { key: 'approved', label: 'Одобрены', count: 2 },
  { key: 'history', label: 'История', count: 4 },
] as const;

type FilterKey = typeof applicationFilters[number]['key'];

interface ApplicationData {
  name: string;
  waitTime: string;
  goal?: string;
  answer?: string;
  applicationQuestion?: string;
  clarifyingAnswer?: string;
  status?: string;
  sub?: string;
  badge?: string;
  badgeColor?: 'terracotta' | 'gold' | 'sage';
  timeline?: string[];
  nextStep?: string;
  clarifyingQuestion?: string;
  rejectionReason?: string;
  candidateMessage?: string;
  decidedBy?: string;
  decidedAt?: string;
}

const applicationsByFilter: Record<FilterKey, Array<ApplicationData>> = {
  waiting: [
    {
      name: 'Ольга Романова',
      waitTime: '12 час. назад',
      sub: 'Нужен ответ',
      badge: 'нужен ответ',
      badgeColor: 'gold',
      goal: 'перейти из junior в middle frontend',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Хочу попасть в среду, где можно получать разборы и не учиться в одиночку.',
      timeline: ['заявка отправлена', 'ответа от сообщества пока нет'],
      nextStep: 'Посмотрите заявку и решите, что лучше сделать: одобрить, задать уточнение или пока не открывать вход.',
    },
    {
      name: 'Анна Белова',
      waitTime: '1 день назад',
      sub: 'Нужен ответ · больше суток',
      badge: 'больше суток',
      badgeColor: 'terracotta',
      goal: 'найти среду для роста во frontend',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Хочу получать обратную связь по коду и понимать, что улучшать дальше.',
      timeline: ['заявка отправлена', 'ответа от сообщества пока нет', 'заявка ждёт больше суток'],
      nextStep: 'Кандидат уже проявил интерес к сообществу. Лучше ответить, пока запрос ещё тёплый.',
    },
    {
      name: 'Павел Миронов',
      waitTime: '2 час. назад',
      sub: 'Нужен ответ · ответил на уточнение',
      badge: 'ответил',
      badgeColor: 'sage',
      goal: 'перейти в backend-разработку',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Хочу за месяц собрать pet-проект и получить разбор архитектуры.',
      clarifyingQuestion: 'Какой pet-проект вы хотите собрать за месяц и какой разбор архитектуры вам нужен?',
      clarifyingAnswer: 'Я хочу собрать небольшой REST API на Go с подключением к базе данных и Docker. Мне нужен разбор, чтобы понять, правильно ли я строю архитектуру — боюсь, что накидаю всё в одном файле и потом не разберусь.',
      timeline: ['заявка отправлена', 'уточнение было отправлено', 'кандидат ответил на уточнение'],
      nextStep: 'Теперь можно принять решение по заявке или задать ещё один вопрос, если контекста пока недостаточно.',
    },
  ],
  clarify: [
    {
      name: 'Алексей Новиков',
      waitTime: '1 день назад',
      sub: 'На уточнении',
      badge: 'на уточнении',
      badgeColor: 'gold',
      goal: 'освоить Docker и CI/CD',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Работаю backend-разработчиком, хочу перейти в DevOps-направление.',
      clarifyingQuestion: 'Расскажите подробнее о вашем текущем опыте с Docker и CI/CD — что уже пробовали и что хотели бы освоить первым?',
      timeline: ['заявка отправлена', 'лидером задан уточняющий вопрос', 'ответа от кандидата пока нет'],
      nextStep: 'Ждём ответ кандидата. Если заявка важная, можно отправить мягкое напоминание.',
    },
    {
      name: 'Екатерина Смирнова',
      waitTime: '1 день назад',
      sub: 'На уточнении · больше суток без ответа',
      badge: 'без ответа',
      badgeColor: 'terracotta',
      goal: 'получить разбор первых проектов',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Хочу понять, что улучшить в портфолио перед поиском работы.',
      clarifyingQuestion: 'Можете поделиться ссылкой на своё портфолио и рассказать, какие проекты в нём считаете сильными?',
      timeline: ['заявка отправлена', 'уточняющий вопрос отправлен', 'кандидат пока не ответил', 'прошло больше суток'],
      nextStep: 'Можно мягко напомнить кандидату об уточнении, если заявка всё ещё актуальна.',
    },
  ],
  approved: [
    {
      name: 'Мария Козлова',
      waitTime: '1 день назад',
      sub: 'Одобрена · оплата не завершена',
      badge: 'оплата не завершена',
      badgeColor: 'gold',
      goal: 'перейти из junior в middle frontend',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Хочу попасть в среду, где можно получать разборы кода и рекомендации по росту. Сейчас работаю один и не понимаю, насколько мой код соответствует middle-уровню.',
      timeline: ['заявка одобрена', 'оплата пока не завершена', 'доступ откроется после оплаты'],
      nextStep: 'После успешной оплаты доступ откроется автоматически.',
    },
    {
      name: 'Елена Васильева',
      waitTime: '2 дня назад',
      sub: 'Одобрена · доступ не открылся',
      badge: 'доступ не открылся',
      badgeColor: 'terracotta',
      goal: 'сделать первый pet-проект на React',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Недавно закончила курсы по frontend, но не знаю, с чего начать реальный проект. Хочу среду, где можно показать код и получить конкретные советы.',
      timeline: ['заявка одобрена', 'оплата прошла', 'доступ пока не открылся'],
      nextStep: 'Человек прошёл вход, но ещё не может попасть в сообщество. Ситуацию лучше проверить сразу.',
    },

  ],
  history: [
    {
      name: 'Никита Орлов',
      waitTime: '1 день назад',
      sub: 'Не принимаем сейчас',
      badge: 'не принимаем сейчас',
      badgeColor: 'terracotta',
      goal: 'найти индивидуального ментора для ежедневной проверки задач',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Мне нужен человек, который каждый день будет проверять мои задания и говорить, что делать дальше.',
      clarifyingQuestion: 'В Mentori Club нет ежедневного менторства с проверкой задач. У нас разборы, встречи и Помощники на старте. Этот формат подходит вам?',
      clarifyingAnswer: 'Мне нужен человек, который каждый день будет проверять мои задания и говорить, что делать дальше.',
      rejectionReason: 'Кандидат ищет индивидуального ментора с ежедневной проверкой. Это выходит за рамки формата сообщества.',
      candidateMessage: 'Спасибо за заявку. Сейчас формат сообщества может не полностью совпасть с вашим запросом, поэтому пока не открываем доступ. Если запрос изменится, вы сможете подать заявку позже.',
      decidedBy: 'Алексей Петров',
      decidedAt: 'Сегодня, 10:24',
      timeline: ['заявка отправлена', 'задан уточняющий вопрос', 'кандидат ответил на уточнение', 'заявка рассмотрена', 'решение отправлено кандидату', 'доступ не открыт'],
      nextStep: 'Если кандидат вернётся с другим запросом, заявку можно вернуть в работу или предложить подать новую заявку.',
    },
    {
      name: 'Марина Соколова',
      waitTime: '6 дней назад',
      sub: 'Доступ открыт',
      badge: 'доступ открыт',
      badgeColor: 'sage',
      goal: 'получить разбор портфолио',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Хочу показать портфолио и понять, что улучшить перед поиском работы.',
      timeline: ['заявка одобрена', 'доступ открыт', 'кандидат стал участником сообщества'],
      nextStep: 'Заявка завершена и сохранена в истории входа. Участник уже находится в сообществе, дальнейшая работа с ним продолжается в профиле, пути участника и разделах сообщества.',
    },
    {
      name: 'Олег Кузнецов',
      waitTime: '4 дня назад',
      sub: 'Кандидат отменил заявку',
      badge: 'отменил заявку',
      badgeColor: 'gold',
      goal: 'попасть в среду для разборов backend-задач',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Хочу задавать вопросы по реальным задачам и получать обратную связь.',
      timeline: ['заявка была отправлена', 'кандидат сам отменил заявку до решения', 'заявка сохранена в истории'],
      nextStep: 'Действий не требуется. Если человек захочет вернуться позже, он сможет подать новую заявку.',
    },
    {
      name: 'Дарья Лебедева',
      waitTime: '10 дней назад',
      sub: 'Срок ответа истёк',
      badge: 'срок истёк',
      badgeColor: 'terracotta',
      goal: 'получить поддержку в первом проекте',
      applicationQuestion: 'Почему хотите вступить?',
      answer: 'Хочу понять, как начать проект и не бросить его через неделю.',
      clarifyingQuestion: 'Какой проект вы хотите начать и какое у вас сейчас главное препятствие?',
      timeline: ['заявка отправлена', 'лидером задан уточняющий вопрос', 'кандидат не ответил в установленный срок', 'заявка перенесена в историю'],
      nextStep: 'Заявка больше не находится в рабочей очереди. Если кандидат вернулся или ответил позже, её можно вернуть в работу. Если прошло много времени, лучше предложить подать новую заявку.',
    },
  ],
};

/* ===== DATA: ARCHIVE APPLICATIONS ===== */
const archiveApplications: Array<ApplicationData & { isArchive: true }> = [
  { name: 'Марина Соколова', waitTime: '4 месяца назад', sub: 'Доступ открыт', badge: 'доступ открыт', badgeColor: 'sage', goal: 'получить разбор портфолио', answer: 'Хочу показать портфолио и понять, что улучшить перед поиском работы.', timeline: ['заявка одобрена', 'доступ открыт', 'кандидат стал участником сообщества'], nextStep: 'Заявка завершена и сохранена в истории входа.', isArchive: true },
  { name: 'Никита Орлов', waitTime: '5 месяцев назад', sub: 'Не принимаем сейчас', badge: 'не принимаем сейчас', badgeColor: 'terracotta', goal: 'найти индивидуального ментора для ежедневной проверки задач', answer: 'Мне нужен человек, который будет каждый день проверять мои задания.', clarifyingQuestion: 'В Mentori Club нет ежедневного менторства с проверкой задач. У нас разборы, встречи и Помощники на старте. Этот формат подходит вам?', rejectionReason: 'Кандидат ищет индивидуального ментора с ежедневной проверкой. Это выходит за рамки формата сообщества.', candidateMessage: 'Спасибо за заявку. Сейчас формат сообщества может не полностью совпасть с вашим запросом, поэтому пока не открываем доступ. Если запрос изменится, вы сможете подать заявку позже.', decidedBy: 'Алексей Петров', decidedAt: '5 месяцев назад, 14:30', timeline: ['заявка отправлена', 'задан уточняющий вопрос', 'кандидат ответил на уточнение', 'заявка рассмотрена', 'решение отправлено', 'доступ не открыт', 'заявка сохранена в истории'], nextStep: 'Заявка завершена. Если кандидат вернётся с другим запросом, её можно вернуть в работу.', isArchive: true },
  { name: 'Олег Кузнецов', waitTime: '7 месяцев назад', sub: 'Кандидат отменил заявку', badge: 'отменил заявку', badgeColor: 'gold', goal: 'попасть в среду для разборов backend-задач', answer: 'Хочу задавать вопросы по реальным задачам и получать обратную связь.', timeline: ['заявка была отправлена', 'кандидат сам отменил заявку до решения', 'заявка сохранена в истории'], nextStep: 'Действий не требуется. Если человек вернётся позже, он сможет подать новую заявку.', isArchive: true },
  { name: 'Дарья Лебедева', waitTime: '8 месяцев назад', sub: 'Срок ответа истёк', badge: 'срок истёк', badgeColor: 'terracotta', goal: 'получить поддержку в первом проекте', answer: 'Хочу понять, как начать проект и не бросить его через неделю.', clarifyingQuestion: 'Какой проект вы хотите начать и какое у вас сейчас главное препятствие?', timeline: ['заявка отправлена', 'лидером задан уточняющий вопрос', 'кандидат не ответил в установленный срок', 'заявка ушла в архив'], nextStep: 'Заявка сохранена для контекста. Если кандидат вернулся спустя долгое время, лучше предложить ему подать новую заявку.', isArchive: true },
  { name: 'Сергей Волков', waitTime: '3 месяца назад', sub: 'Доступ открыт', badge: 'доступ открыт', badgeColor: 'sage', goal: 'перейти в middle backend', answer: 'Ищу среду, где можно обсуждать архитектуру и получать обратную связь на реальных задачах.', timeline: ['заявка одобрена', 'оплата прошла', 'доступ открыт', 'стал участником'], nextStep: 'Участник успешно вошёл в сообщество.', isArchive: true },
  { name: 'Анна Морозова', waitTime: '10 месяцев назад', sub: 'Не принимаем сейчас', badge: 'не принимаем сейчас', badgeColor: 'terracotta', goal: 'стать Помощником на старте', answer: 'Хочу помогать новичкам осваиваться. Уже имею опыт менторства в другом сообществе.', rejectionReason: 'На момент заявки не было открытой потребности в Помощниках на старте.', candidateMessage: 'Спасибо за интерес к роли Помощника на старте. Сейчас мы не набираем в эту роль, но мы сохранили вашу заявку. Когда откроется набор, мы с вами свяжемся.', decidedBy: 'Алексей Петров', decidedAt: '10 месяцев назад, 09:15', timeline: ['заявка рассмотрена', 'решение отправлено', 'доступ не открыт'], nextStep: 'Заявка сохранена в архиве.', isArchive: true },
];

/* ===== DATA: NEWCOMER FILTERS ===== */
const newcomerFilters = [
  { key: 'all', label: 'Все' },
  { key: 'ждёт первой связи', label: 'Ждут первой связи' },
  { key: 'Без цели', label: 'Без цели' },
  { key: 'нужен первый шаг', label: 'Без первого шага' },
  { key: 'нужна опора', label: 'Нужна опора' },
] as const;
type NewcomerFilterKey = typeof newcomerFilters[number]['key'];

function getNewcomerFilterCount(key: NewcomerFilterKey): number {
  if (key === 'all') return newcomers.length;
  if (key === 'ждёт первой связи') return newcomers.filter(nc => nc.statusLabel === 'ждёт первой связи' || (nc as any).hasFirstQuestion === true).length;
  return newcomers.filter(nc => nc.statusLabel === key).length;
}

/* ===== DATA: NEWCOMERS ===== */
const newcomers = [
  {
    name: 'Мария Козлова',
    day: '2-й день',
    goal: 'стать frontend-разработчиком',
    applicationQuestion: 'Почему вступили?',
    answer: 'Хочу получать разборы кода и понимать, насколько мой код соответствует уровню middle.',
    hasGoal: true,
    hasFirstStep: true,
    hasConnection: false,
    hasSupport: false,
    firstResponseReceived: false,
    statusLabel: 'ждёт первой связи' as const,
    statusColor: 'terracotta' as const,
    timeline: ['заявка одобрена', 'доступ открыт', 'Мария вошла в сообщество', 'первый шаг выбран', 'первая связь пока не появилась', 'опора пока не назначена'],
    nextStep: 'Нужно помочь Марии получить первую живую связь: подобрать опору, пригласить на встречу или дать первый ответ.',
    panelIntro: 'Мария уже вошла в сообщество. Здесь видно, есть ли у неё понятная цель, первый шаг, первая связь и человек рядом.',
    panelTimeline: ['заявка одобрена', 'доступ открыт', 'Мария вошла в сообщество', 'первый шаг выбран', 'живого отклика пока не было', 'человек рядом пока не подобран'],
    panelProgress: [
      { label: 'Цель указана', ok: true },
      { label: 'Первый шаг: стартовый гайд', ok: true },
      { label: 'Первая связь пока не появилась', ok: false },
      { label: 'Опора пока не назначена', ok: false },
    ],
    panelNextStep: 'Лучше дать Марии первый живой контакт: написать короткий отклик, подобрать человека рядом или пригласить на ближайшую встречу.',
  },
  {
    name: 'Артём Нестеров',
    day: '3-й день',
    goal: 'разобраться с backend-разработкой и собрать первый pet-проект на Go',
    applicationQuestion: 'Почему вступили?',
    answer: 'Хочу не просто смотреть курсы, а делать реальный проект и получать обратную связь по архитектуре, коду и ошибкам.',
    firstQuestion: 'Я хочу сделать API для трекера задач на Go, но не понимаю, с чего лучше начать: сначала база данных, структура проекта или авторизация?',
    hasGoal: true,
    hasFirstStep: true,
    hasConnection: false,
    hasSupport: false,
    firstResponseReceived: false,
    statusLabel: 'ждёт ответа на первый вопрос' as const,
    statusColor: 'terracotta' as const,
    hasFirstQuestion: true,
    timeline: ['заявка одобрена', 'доступ открыт', 'Артём вошёл в сообщество', 'первый шаг выбран', 'Артём задал первый вопрос', 'ответа пока нет', 'первая связь пока не появилась'],
    nextStep: 'Артёму важно получить первый живой ответ. Лучше коротко ответить на вопрос, дать понятный следующий шаг и при необходимости подобрать человека рядом.',
    panelIntro: 'Артём уже вошёл в сообщество и сделал важный шаг — задал первый вопрос. Здесь видно, есть ли у него цель, первый шаг, первая связь и человек рядом.',
    panelTimeline: ['заявка одобрена', 'доступ открыт', 'Артём вошёл в сообщество', 'первый шаг выбран', 'Артём задал первый вопрос', 'живого ответа пока не было', 'человек рядом пока не подобран'],
    panelProgress: [
      { label: 'Цель указана', ok: true },
      { label: 'Первый шаг: стартовый гайд', ok: true },
      { label: 'Первый вопрос пока без ответа', ok: false },
      { label: 'Первая связь пока не появилась', ok: false },
      { label: 'Опора пока не назначена', ok: false },
    ],
    panelNextStep: 'Артём уже сделал важный шаг — задал первый вопрос. Лучше ответить ему сейчас, пока вопрос свежий: коротко сориентировать, подсказать понятный первый шаг и показать, что в сообществе есть живой отклик. После ответа можно будет подобрать опору или пригласить Артёма на ближайшую встречу.',
  },
  {
    name: 'Илья Громов',
    day: '4-й день',
    goal: 'собрать первый backend pet-проект и понять, как правильно строить архитектуру',
    applicationQuestion: 'Почему вступили?',
    answer: 'Хочу сделать не учебный пример, а нормальный backend-проект, который можно показать в портфолио. Больше всего путаюсь в архитектуре и структуре кода.',
    firstQuestion: 'Я хочу сделать API для личного трекера привычек, но не понимаю, как правильно разложить проект на слои: handlers, services, repository. С чего лучше начать, чтобы не усложнить?',
    hasGoal: true,
    hasFirstStep: true,
    hasConnection: false,
    hasSupport: false,
    firstResponseReceived: false,
    statusLabel: 'ждёт ответа на первый вопрос' as const,
    statusColor: 'terracotta' as const,
    hasFirstQuestion: true,
    hasDraft: true,
    draftTitle: 'Илья, начни с простой структуры проекта',
    draftText: 'Илья, привет! Хороший вопрос — на старте действительно легко переусложнить архитектуру.\n\nЯ бы начал с простой структуры: сначала сделать handlers для входящих запросов, отдельный слой services для логики и repository для работы с данными. Не нужно сразу строить \"идеальную архитектуру\" — важнее быстро собрать рабочий поток: создать привычку, получить список привычек и отметить выполнение.\n\nПервый шаг на неделю: собрать минимальное API без авторизации, но с понятным разделением handlers / services / repository. После этого можно будет посмотреть код и аккуратно улучшить структуру.',
    timeline: ['заявка одобрена', 'доступ открыт', 'Илья вошёл в сообщество', 'первый шаг выбран', 'Илья задал первый вопрос', 'черновик ответа сохранён', 'ответ пока не отправлен', 'первая связь пока не появилась'],
    nextStep: 'Лучше завершить и отправить ответ, пока вопрос ещё свежий. После этого можно подобрать человека рядом или пригласить Илью на встречу с разборами.',
    panelIntro: 'Илья уже вошёл в сообщество и задал первый вопрос. Ответ пока не отправлен, но по нему уже сохранён черновик.',
    panelTimeline: ['заявка одобрена', 'доступ открыт', 'Илья вошёл в сообщество', 'первый шаг выбран', 'Илья задал первый вопрос', 'черновик ответа сохранён', 'ответ пока не отправлен', 'первая связь пока не появилась'],
    panelProgress: [
      { label: 'Цель указана', ok: true },
      { label: 'Первый шаг: стартовый гайд по backend pet-проекту', ok: true },
      { label: 'Первый вопрос пока без ответа', ok: false },
      { label: 'Первая связь пока не появилась', ok: false },
      { label: 'Опора пока не назначена', ok: false },
    ],
    panelNextStep: 'Черновик уже сохранён. Лучше завершить и отправить ответ, пока вопрос ещё свежий. После отправки Илья получит первый живой отклик, а дальше можно будет подобрать опору или пригласить его на встречу.',
  },
  {
    name: 'Алексей Новиков',
    day: '4-й день',
    goal: 'освоить Docker и CI/CD',
    applicationQuestion: 'Почему вступили?',
    answer: 'Ищу сообщество, где можно показать свой pet-проект и получить обратную связь по архитектуре.',
    hasGoal: true,
    hasFirstStep: false,
    hasConnection: false,
    hasSupport: false,
    firstResponseReceived: false,
    statusLabel: 'нужен первый шаг' as const,
    statusColor: 'terracotta' as const,
    timeline: ['заявка одобрена', 'доступ открыт', 'Алексей вошёл в сообщество', 'цель указана', 'первый шаг пока не выбран'],
    nextStep: 'Нужно помочь Алексею выбрать первый шаг: загрузить проект для разбора или открыть гайд по Docker.',
  },
  {
    name: 'Елена Васильева',
    day: '1-й день',
    goal: '',
    applicationQuestion: 'Почему вступили?',
    answer: 'Хочу среду, где можно показать код и получить конкретные советы по улучшению.',
    hasGoal: false,
    hasFirstStep: false,
    hasConnection: false,
    hasSupport: false,
    firstResponseReceived: false,
    statusLabel: 'Без цели' as const,
    statusColor: 'terracotta' as const,
    timeline: ['заявка одобрена', 'доступ открыт', 'Елена вошла в сообщество', 'цель пока не указана', 'первый шаг выбран как базовый стартовый гайд', 'первая связь пока не появилась', 'опора пока не назначена'],
    nextStep: 'Лучше помочь Елене сформулировать цель: что она хочет получить в сообществе и какой результат был бы полезен в первые 7 дней. После этого будет проще подобрать первый шаг, опору или ближайшую встречу.',
    panelIntro: 'Елена уже вошла в сообщество. Сейчас важно понять, с какой целью она пришла: так будет проще подобрать первый шаг, встречу, разбор или человека рядом.',
    panelProgress: [
      { label: 'Цель пока не указана', ok: false },
      { label: 'Первый шаг: стартовый гайд', ok: true },
      { label: 'Первая связь пока не появилась', ok: false },
      { label: 'Опора пока не назначена', ok: false },
    ],
    panelTimeline: ['заявка одобрена', 'доступ открыт', 'Елена вошла в сообщество', 'цель пока не указана', 'первый шаг выбран как базовый стартовый гайд', 'первая связь пока не появилась', 'опора пока не назначена'],
    showGoalInline: true,
  },
  {
    name: 'Сергей Волков',
    day: '6-й день',
    goal: 'перейти в middle backend',
    applicationQuestion: 'Почему вступили?',
    answer: 'Ищу среду для обсуждения архитектуры и обратной связи на реальных задачах.',
    hasGoal: true,
    hasFirstStep: true,
    hasConnection: true,
    hasSupport: true,
    firstResponseReceived: true,
    statusLabel: 'с опорой' as const,
    statusColor: 'sage' as const,
    timeline: ['заявка одобрена', 'доступ открыт', 'Сергей вошёл в сообщество', 'цель указана', 'первый шаг выбран', 'первая связь появилась', 'опора назначена'],
    nextStep: 'Сергей хорошо вошёл. Важно поддержать связь и помочь продолжить путь после первых 7 дней.',
  },
  {
    name: 'Анна Морозова',
    day: '3-й день',
    goal: 'сделать первый пет-проект',
    hasGoal: true,
    hasFirstStep: true,
    hasConnection: true,
    hasSupport: true,
    firstResponseReceived: true,
    statusLabel: 'с опорой' as const,
    statusColor: 'sage' as const,
  },
  {
    name: 'Павел Миронов',
    day: '5-й день',
    goal: 'научиться DevOps',
    hasGoal: true,
    hasFirstStep: true,
    hasConnection: true,
    hasSupport: false,
    firstResponseReceived: true,
    statusLabel: 'первый отклик появился' as const,
    statusColor: 'gold' as const,
  },
  {
    name: 'Дарья Лебедева',
    day: '2-й день',
    goal: 'стартовать в data science',
    hasGoal: true,
    hasFirstStep: false,
    hasConnection: false,
    hasSupport: false,
    firstResponseReceived: false,
    statusLabel: 'нужен первый шаг' as const,
    statusColor: 'terracotta' as const,
  },
  {
    name: 'Ольга Романова',
    day: '7-й день',
    goal: 'перейти из junior в middle frontend',
    hasGoal: true,
    hasFirstStep: true,
    hasConnection: true,
    hasSupport: false,
    firstResponseReceived: true,
    statusLabel: 'готов выйти из входа' as const,
    statusColor: 'sage' as const,
  },
];

/* ===== DATA: WHAT WORKS ===== */
const selfManaging = [
  { text: 'Заявки за сегодня получили первый отклик', sub: 'Кандидаты не остаются без внимания' },
  { text: '2 Помощника на старте активны', sub: 'Новички получают опору не только от лидера' },
  { text: '5 новичков уже получили первую связь', sub: 'Первые контакты появляются вовремя' },
];

/* ===== DATA: SETTINGS RISKS ===== */
const settingsRisks = [
  {
    title: 'В форме заявки нет вопроса о цели',
    text: 'Без цели сложнее подобрать первый шаг и первую связь после вступления.',
    action: 'Настроить форму',
  },
];

/* ===== COMPONENT ===== */
export default function LeaderConsoleEntry() {
  const [showWhyId, setShowWhyId] = useState<number | null>(null);
  const [advisorHidden, setAdvisorHidden] = useState(false);
  const [showAdvisorWhy, setShowAdvisorWhy] = useState(false);
  const [showClarifyModal, setShowClarifyModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectText, setRejectText] = useState(`Спасибо за заявку. Сейчас формат сообщества может не полностью совпасть с вашим запросом. Поэтому мы пока не открываем доступ.\n\nЕсли ваш запрос изменится, вы сможете подать заявку позже.`);
  const [rejectReason, setRejectReason] = useState(`Кандидат ищет индивидуального ментора с ежедневной проверкой задач. Это выходит за рамки формата сообщества: у нас разборы, встречи, участники рядом и Помощники на старте.`);
  const [rejectSubject, setRejectSubject] = useState('По вашей заявке в IT Технологии');
  const [clarifyText, setClarifyText] = useState(`Спасибо за заявку. Хочу чуть лучше понять ваш запрос, чтобы честно подсказать, подойдёт ли вам формат сообщества.\n\nРасскажите, пожалуйста, какой результат вы хотите получить в ближайший месяц?`);
  const [clarifySubject, setClarifySubject] = useState('Уточнение по вашей заявке в IT Технологии');
  const [clarifyDirty, setClarifyDirty] = useState(false);
  const [rejectDirty, setRejectDirty] = useState(false);
  const [showClarifyConfirm, setShowClarifyConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [approveSubject, setApproveSubject] = useState('Заявка одобрена: следующий шаг');
  const [approveText, setApproveText] = useState(`Привет! Ваша заявка в IT Технологии одобрена.\n\nСледующий шаг — оплатить участие. После успешной оплаты доступ откроется автоматически, и вы сможете начать путь в сообществе.\n\nПосле входа мы поможем выбрать первый шаг и найти людей рядом.`);
  const [approveDirty, setApproveDirty] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [showMentorAssignModal, setShowMentorAssignModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showMeetingInviteModal, setShowMeetingInviteModal] = useState(false);
  const [showFirstReplyModal, setShowFirstReplyModal] = useState(false);
  const [showPathPanel, setShowPathPanel] = useState(false);
  const [newcomerSidePanel, setNewcomerSidePanel] = useState<typeof newcomers[0] | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showLimitsModal, setShowLimitsModal] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('waiting');
  const [historySubFilter, setHistorySubFilter] = useState<string>('all');
  const [newcomerFilter, setNewcomerFilter] = useState<NewcomerFilterKey>('all');
  const [showAllNewcomers, setShowAllNewcomers] = useState(false);
  const newcomersRef = useRef<HTMLDivElement>(null);

  /* ===== SIDE PANEL STATE ===== */
  const [sidePanelApp, setSidePanelApp] = useState<ApplicationData & { isArchive?: boolean } | null>(null);
  const [showDecisionBlock, setShowDecisionBlock] = useState(false);
  const [showAppContextCollapse, setShowAppContextCollapse] = useState(false);
  const [showAppTimelineCollapse, setShowAppTimelineCollapse] = useState(false);
  const [showAppNoteCollapse, setShowAppNoteCollapse] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [showRemindModal, setShowRemindModal] = useState(false);
  const [remindSubject, setRemindSubject] = useState('Напоминание по вашей заявке в IT Технологии');
  const [remindText, setRemindText] = useState(`Алексей, привет! Хотел мягко напомнить про уточнение по заявке в «IT Технологии».\n\nМы спрашивали: «Расскажите подробнее о вашем текущем опыте с Docker и CI/CD — что уже пробовали и что хотели бы освоить первым?»\n\nОтвет поможет честно понять, подойдёт ли вам формат сообщества и какой первый шаг лучше предложить.\n\nЕсли запрос уже не актуален — ничего страшного.`);
  const [remindDirty, setRemindDirty] = useState(false);
  const [showPaymentRemindModal, setShowPaymentRemindModal] = useState(false);
  const [showOpenAccessModal, setShowOpenAccessModal] = useState(false);
  const [showCheckPaymentModal, setShowCheckPaymentModal] = useState(false);
  const [showMonetizationModal, setShowMonetizationModal] = useState(false);
  const [paymentRemindSubject, setPaymentRemindSubject] = useState('Следующий шаг для входа в IT Технологии');
  const [paymentRemindText, setPaymentRemindText] = useState(`Мария, привет! Ваша заявка в IT Технологии одобрена.\n\nСледующий шаг — завершить оплату участия. После успешной оплаты доступ к сообществу откроется автоматически.\n\nЕсли возникнут сложности с оплатой, напишите нам — поможем разобраться.`);
  const [paymentRemindDirty, setPaymentRemindDirty] = useState(false);
  const [showAllApps, setShowAllApps] = useState(false);
  const [showAllHistoryApps, setShowAllHistoryApps] = useState(false);
  const [appNotes, setAppNotes] = useState<Record<string, string>>({
    'Павел Мироновответил 2 часа назад': 'Подходит по теме и мотивации. Важно уточнить ожидания: человеку нужны разборы и среда, но не ежедневное индивидуальное менторство.',
    'Никита Орловвчера': 'Кандидат ищет формат, который не совпадает с нашим. Решение мягкое — оставили дверь открытой для новой заявки. Если вернётся с другим запросом, рассмотрим заново.',
  });

  /* ===== ARCHIVE SIDE PANEL STATE ===== */
  const [archivePanelOpen, setArchivePanelOpen] = useState(false);
  const [archiveDetailApp, setArchiveDetailApp] = useState<any>(null);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [archivePeriod, setArchivePeriod] = useState<'6m' | '1y' | 'all'>('6m');
  const [archiveStatusFilter, setArchiveStatusFilter] = useState<string>('all');

  /* ===== TOAST ===== */
  const { showToast } = useToast();

  /* ===== SECTIONS STATE ===== */
  type SectionKey = 'attention' | 'applications' | 'newcomers' | 'progress' | 'settings';
  const [activeSection, setActiveSection] = useState<SectionKey>('attention');

  const sections: { key: SectionKey; label: string; count: string }[] = [
    { key: 'attention', label: 'Ваше внимание', count: `${attentionCards.length} точки требуют заботы` },
    { key: 'applications', label: 'Заявки', count: `${applicationsByFilter.waiting.length} ждут ответа` },
    { key: 'newcomers', label: 'Новички', count: `${newcomers.length} в первые 7 дней` },
    { key: 'progress', label: 'Что получается', count: `${selfManaging.length} хороших сигнала` },
    { key: 'settings', label: 'Настройки входа', count: `${settingsRisks.length} настройка мешает входу` },
  ];

  const filteredNewcomers = newcomers.filter((nc) => {
    if (newcomerFilter === 'all') return true;
    if (newcomerFilter === 'ждёт первой связи') return nc.statusLabel === 'ждёт первой связи' || (nc as any).hasFirstQuestion === true;
    return nc.statusLabel === newcomerFilter;
  });

  const visibleNewcomers = showAllNewcomers ? filteredNewcomers : filteredNewcomers.slice(0, 3);

  function pluralizeNewcomer(n: number): string {
    if (n % 10 === 1 && n % 100 !== 11) return `${n} новичок`;
    if ([2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100)) return `${n} новичка`;
    return `${n} новичков`;
  }
  const [meetingText, setMeetingText] = useState(`Привет! Завтра будет встреча "Разбор пет-проектов". Можно просто прийти, послушать и посмотреть, как проходит разбор. Это хороший способ почувствовать сообщество.`);
  const [connectText, setConnectText] = useState(`Мария, привет! Хочу познакомить тебя с Сергеем. Он уже проходил похожий путь и может подсказать, с чего лучше начать.\n\nСергей, если будет удобно, помоги Марии с первым шагом.`);
  const [replyText, setReplyText] = useState(`Мария, привет! Рады, что ты с нами.\n\nВижу, что ты хочешь расти во frontend и понять, насколько твой код соответствует уровню middle. Хороший первый шаг — открыть стартовый гайд по первому frontend pet-проекту и выбрать одну небольшую задачу на неделю.\n\nЕсли хочешь, напиши, с чем сейчас сложнее всего: идея проекта, структура, React, код-ревью или план роста. Подберём человека рядом, встречу или разбор.`);
  const [mentorTitle, setMentorTitle] = useState('Предложение: стать Помощником на старте');
  const [mentorMessage, setMentorMessage] = useState(`Анна, привет! Видим, что ты уже помогала новичкам и сейчас не перегружена.\n\nМожешь взять одного участника на старт на 7 дней? Ты поможешь с первым шагом, ответишь на вопросы и не дашь человеку остаться одному.\n\nЭто временная функция — можно поставить на паузу в любой момент.`);
  const [assignTitle, setAssignTitle] = useState('Предложение: сопроводить новичка');
  const [assignMessage, setAssignMessage] = useState(`Анна, привет! Видим, что ты уже помогала новичкам. Можешь взять одного участника на старт на 7 дней?`);
  const [meetingTitle, setMeetingTitle] = useState('Приглашение на встречу сообщества');
  const [replyTitle, setReplyTitle] = useState('Мария, давай спокойно начнём с первого проекта');

  /* ===== FIRST QUESTION REPLY MODAL STATE (for Artem) ===== */
  const [showFirstQuestionReplyModal, setShowFirstQuestionReplyModal] = useState(false);
  const [questionReplyText, setQuestionReplyText] = useState(`Артём, привет! Хороший вопрос — на старте правда легко потеряться.\n\nЯ бы начал с простого ядра: задачи, базовые endpoints и сохранение в базе. Не спеши с авторизацией — сначала лучше увидеть работающий результат.\n\nПервый шаг на неделю: сделать создание задачи, список задач и отметку «выполнено».\n\nПотом уже добавим авторизацию, роли и структуру проекта. Когда будет первый вариант — покажи, подберём разбор или человека рядом.`);
  const [questionReplyTitle, setQuestionReplyTitle] = useState('Артём, вот с чего лучше начать API на Go');

  /* ===== ILYA DRAFT MODALS STATE ===== */
  const [showEditDraftModal, setShowEditDraftModal] = useState(false);
  const [editDraftText, setEditDraftText] = useState(`Илья, привет! Хороший вопрос — на старте действительно легко переусложнить архитектуру.\n\nЯ бы начал с простой структуры: сначала сделать handlers для входящих запросов, отдельный слой services для логики и repository для работы с данными. Не нужно сразу строить \"идеальную архитектуру\" — важнее быстро собрать рабочий поток: создать привычку, получить список привычек и отметить выполнение.\n\nПервый шаг на неделю: собрать минимальное API без авторизации, но с понятным разделением handlers / services / repository. После этого можно будет посмотреть код и аккуратно улучшить структуру.`);
  const [editDraftTitle, setEditDraftTitle] = useState('Илья, начни с простой структуры проекта');
  const [showSendDraftConfirmModal, setShowSendDraftConfirmModal] = useState(false);

  /* ===== GOAL HELP MODAL STATE (for Elena) ===== */
  const [showGoalHelpModal, setShowGoalHelpModal] = useState(false);
  const [goalHelpTitle, setGoalHelpTitle] = useState('Елена, давай уточним твою цель на старт');
  const [goalHelpText, setGoalHelpText] = useState(`Елена, привет! Рады, что ты с нами.

Ты написала, что хочешь показывать код и получать конкретные советы по улучшению. Чтобы мы лучше помогли тебе на старте, давай уточним цель.

Что для тебя сейчас важнее всего?

— улучшить портфолио;
— разобрать первый pet-проект;
— понять ошибки в коде;
— подготовиться к поиску работы;
— выбрать, с чего начать.

Можешь ответить своими словами. После этого мы подберём тебе понятный первый шаг, встречу или человека рядом.`);
  const [goalHelpSuggestGoal, setGoalHelpSuggestGoal] = useState(true);
  const [goalHelpKeepGuide, setGoalHelpKeepGuide] = useState(false);
  const [goalHelpSuggestSupport, setGoalHelpSuggestSupport] = useState(true);

  /* ===== APP MESSAGE TEMPLATES MODAL STATE ===== */
  const [showAppMessageModal, setShowAppMessageModal] = useState(false);
  const [appMsgTab, setAppMsgTab] = useState<'approve' | 'clarify' | 'reject'>('approve');
  const [appMsgApproveTitle, setAppMsgApproveTitle] = useState('Заявка одобрена: следующий шаг');
  const [appMsgApproveBody, setAppMsgApproveBody] = useState('{Имя}, привет!\n\nВаша заявка в «{Сообщество}» одобрена.\n\n{Следующий шаг}\n\nПосле входа вы появитесь в разделе для новичков. Там будет видно, с чего начать и где можно получить первый живой отклик.');
  const [appMsgClarifyTitle, setAppMsgClarifyTitle] = useState('Нужно уточнить вашу заявку');
  const [appMsgClarifyBody, setAppMsgClarifyBody] = useState('{Имя}, привет!\n\nСпасибо за заявку в «{Сообщество}». Хочу чуть лучше понять ваш запрос, чтобы честно подсказать, подойдёт ли вам формат сообщества.\n\n{Уточняющий вопрос}\n\nМожно ответить своими словами — после ответа заявка снова появится у команды на рассмотрении.');
  const [appMsgRejectTitle, setAppMsgRejectTitle] = useState('По вашей заявке в «{Сообщество}»');
  const [appMsgRejectBody, setAppMsgRejectBody] = useState('{Имя}, спасибо за заявку.\n\nСейчас формат сообщества может не полностью совпасть с вашим запросом, поэтому мы пока не открываем доступ.\n\nЕсли ваш запрос изменится, вы сможете подать новую заявку позже.');
  const [appMsgAllowReapply, setAppMsgAllowReapply] = useState(true);
  const [appMsgAddLink, setAppMsgAddLink] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  /* ===== FIRST 7 DAYS MODAL STATE ===== */
  const [showFirst7DaysModal, setShowFirst7DaysModal] = useState(false);
  const [showPickMaterialModal, setShowPickMaterialModal] = useState(false);
  type MaterialId = 'guide_community' | 'guide_backend' | 'guide_frontend' | 'guide_first_question';
  const [f7MaterialId, setF7MaterialId] = useState<MaterialId>('guide_community');
  const [f7SuggestGuide, setF7SuggestGuide] = useState(true);
  const [f7SignalDay3, setF7SignalDay3] = useState(true);
  const [f7SignalNoAction, setF7SignalNoAction] = useState(true);
  const [f7SignalNoVisit, setF7SignalNoVisit] = useState(false);
  const [f7HelpGoal, setF7HelpGoal] = useState(true);
  const [f7GoalTitle, setF7GoalTitle] = useState('Давай уточним твою цель на старт');
  const [f7GoalBody, setF7GoalBody] = useState('{Имя}, привет! Чтобы мы помогли точнее, напиши, пожалуйста, какой результат для тебя сейчас важнее всего.\n\nМожно выбрать готовый вариант или ответить своими словами. После этого будет проще подобрать первый шаг, встречу, разбор или человека рядом.');
  const [f7GoalProject, setF7GoalProject] = useState(true);
  const [f7GoalReview, setF7GoalReview] = useState(true);
  const [f7GoalTool, setF7GoalTool] = useState(true);
  const [f7GoalInterview, setF7GoalInterview] = useState(true);
  const [f7GoalOther, setF7GoalOther] = useState(true);
  const [f7GoalOtherLabel, setF7GoalOtherLabel] = useState('');
  const [f7PrepareDraft, setF7PrepareDraft] = useState(true);
  const [f7DraftTitle, setF7DraftTitle] = useState('{Имя}, давай спокойно начнём с первого шага');
  const [f7DraftBody, setF7DraftBody] = useState('{Имя}, привет! Рады, что ты с нами.\n\nВижу, что тебе важно: {Цель}. Чтобы не перегружаться в первые дни, лучше начать с одного понятного действия: {Первый шаг}.\n\nЕсли появится вопрос, можно написать в сообщество — рядом будут участники и команда, которые помогут сориентироваться.');
  const [f7SigNoConnection, setF7SigNoConnection] = useState(true);
  const [f7SigNoAnswer, setF7SigNoAnswer] = useState(true);
  const [f7SigDraftUnsent, setF7SigDraftUnsent] = useState(true);
  const [f7SigNoStepDay3, setF7SigNoStepDay3] = useState(true);
  const [f7SigNoGoalDay5, setF7SigNoGoalDay5] = useState(true);
  const [f7SigSupportUnconfirmed, setF7SigSupportUnconfirmed] = useState(true);
  const [showF7RestoreConfirm, setShowF7RestoreConfirm] = useState(false);
  const [showF7DiscardConfirm, setShowF7DiscardConfirm] = useState(false);
  const [pickMatDiscardConfirm, setPickMatDiscardConfirm] = useState(false);
  const [pickMatSelected, setPickMatSelected] = useState<MaterialId>('guide_community');

  /* ===== COLLAPSE STATES ===== */
  const [showDraftFull, setShowDraftFull] = useState(false);
  const [showContextCollapse, setShowContextCollapse] = useState(false);
  const [showTimelineCollapse, setShowTimelineCollapse] = useState(false);
  const [showNoteCollapse, setShowNoteCollapse] = useState(false);

  const MessageCounter = ({ count }: { count: number }) => (
    <div className="text-right">
      <span className="text-[11px]" style={{ color: count > 900 ? TERRACOTTA : 'var(--text-muted)' }}>{count} / 1000</span>
      {count > 500 && count <= 900 && (
        <p className="text-[11px] mt-0.5">Сообщение получилось длиннее обычного. Лучше оставить самое важное и один понятный следующий шаг.</p>
      )}
      {count > 900 && (
        <p className="text-[11px] mt-0.5" style={{ color: TERRACOTTA }}>Почти предел. Попробуйте сократить текст, чтобы его было легче прочитать.</p>
      )}
    </div>
  );

  const TitleCounter = ({ count }: { count: number }) => (
    <div className="text-right">
      <span className="text-[11px]" style={{ color: count > 100 ? TERRACOTTA : 'var(--text-muted)' }}>{count} / 120</span>
      {count > 100 && (
        <p className="text-[11px] mt-0.5" style={{ color: TERRACOTTA }}>Заголовок слишком длинный. Лучше сделать его короче, чтобы в письме отображалось полностью.</p>
      )}
    </div>
  );

  const GradientDivider = () => (
    <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
  );

  /* ===== BODY SCROLL LOCK ===== */
  useEffect(() => {
    if (newcomerSidePanel || archivePanelOpen || sidePanelApp || showAppMessageModal || showRestoreConfirm || showDiscardConfirm || showFirst7DaysModal || showF7RestoreConfirm || showF7DiscardConfirm || showPickMaterialModal || pickMatDiscardConfirm) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [newcomerSidePanel, archivePanelOpen, sidePanelApp, showAppMessageModal, showRestoreConfirm, showDiscardConfirm, showFirst7DaysModal, showF7RestoreConfirm, showF7DiscardConfirm, showPickMaterialModal, pickMatDiscardConfirm]);

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
      <main className="flex-1 min-w-0">
        <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>

          {/* ===== HEADER ===== */}
          <div className="px-6 md:px-8 pt-8 pb-6">
            <div className="flex items-center gap-2 text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
              <span>Консоль лидера</span><ChevronRight className="w-3 h-3" />
              <span style={{ color: 'var(--text-secondary)' }}>Вступление</span>
            </div>
            <h1 className="text-2xl md:text-[30px] font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Вступление
            </h1>
            <p className="text-sm leading-relaxed max-w-xl" style={{ color: 'var(--text-secondary)' }}>
              Здесь видно, кто хочет войти в сообщество, кто уже вошёл и кому в первые дни нужна первая связь, опора или понятный первый шаг.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Обновлено 4 минуты назад</p>
              <button className="text-[11px] font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Обновить</button>
            </div>
          </div>

          <div className="px-6 md:px-8"><GradientDivider /></div>

          {/* ===== SECTIONS NAVIGATION ===== */}
          <div className="px-6 md:px-8 py-6">
            <h3 className="text-[11px] font-semibold tracking-widest mb-4" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Разделы входа</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {sections.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setActiveSection(s.key); if (s.key === 'newcomers') setNewcomerFilter('all'); }}
                  className="rounded-xl p-4 text-left transition-all duration-300"
                  style={{
                    backgroundColor: activeSection === s.key ? 'var(--hover-bg)' : 'var(--bg-card)',
                    border: `1.5px solid ${activeSection === s.key ? 'var(--gold)' : 'var(--border-color)'}`,
                    boxShadow: activeSection === s.key ? '0 0 20px rgba(212,175,55,0.12), var(--card-shadow-hover)' : 'var(--card-shadow)',
                    transform: activeSection === s.key ? 'translateY(-1px)' : 'translateY(0)',
                  }}
                  onMouseEnter={(e) => { if (activeSection !== s.key) { e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--card-shadow-hover)'; } }}
                  onMouseLeave={(e) => { if (activeSection !== s.key) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--card-shadow)'; } }}
                >
                  <p className="text-sm font-semibold mb-1" style={{ color: activeSection === s.key ? 'var(--gold)' : 'var(--text-primary)' }}>{s.label}</p>
                  <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>{s.count}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="px-6 md:px-8">
            <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(212,175,55,0.2), transparent)' }} />
          </div>

          {/* ===== ATTENTION SECTION ===== */}
          {activeSection === 'attention' && (
          <div className="section-fade-in px-6 md:px-8 py-6">
            <h2 className="section-heading">Ваше внимание во Вступлении</h2>
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
                  <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>{card.text}</p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        if (card.id === 1) { setActiveSection('applications'); setActiveFilter('waiting'); }
                        if (card.id === 2) { setActiveSection('newcomers'); setNewcomerFilter('ждёт первой связи'); }
                        if (card.id === 3) { setActiveSection('newcomers'); setNewcomerFilter('ждёт первой связи'); }
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90"
                      style={card.accent === 'terracotta' ? { backgroundColor: TERRACOTTA, color: '#fff' } : { backgroundColor: 'var(--gold)', color: '#fff' }}>
                      {card.primary}
                    </button>
                    {card.why && (
                      <button onClick={() => setShowWhyId(showWhyId === card.id ? null : card.id)} className="px-3 py-2 rounded-lg text-sm transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                        {showWhyId === card.id ? 'Скрыть' : 'Почему?'}
                      </button>
                    )}
                  </div>
                  {card.why && showWhyId === card.id && (
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.why}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          )}

          {activeSection === 'applications' && (<>{/* ===== APPLICATIONS ===== */}
          <div className="section-fade-in px-6 md:px-8 py-6">
            <h2 className="section-heading">Заявки на вступление</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--text-secondary)' }}>
              {activeFilter === 'waiting' && 'Здесь заявки, где сейчас нужен ваш ответ: рассмотреть, задать уточнение, одобрить вход или мягко не принимать сейчас.'}
              {activeFilter === 'clarify' && 'Здесь заявки, по которым уже задан уточняющий вопрос. Когда кандидат ответит, заявка вернётся в список «Требуют ответа» со статусом «Ответил».'}
              {activeFilter === 'approved' && 'Здесь одобренные заявки, где вход ещё не завершён: оплата не завершена или доступ не открылся автоматически.'}
              {activeFilter === 'history' && 'Здесь завершённые заявки за последние 90 дней: доступ открыт, кандидат отменил заявку, срок ответа истёк или вход сейчас не открываем. Более старые записи доступны через поиск в архиве.'}
            </p>

            {/* Filter tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              {applicationFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setActiveFilter(f.key); setShowAllApps(false); setShowAllHistoryApps(false); if (f.key === 'history') setHistorySubFilter('all'); }}
                  className="pill-link"
                  style={{
                    borderColor: activeFilter === f.key ? 'var(--gold)' : 'var(--border-color)',
                    color: activeFilter === f.key ? 'var(--gold)' : 'var(--text-muted)',
                    backgroundColor: activeFilter === f.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                  }}
                >
                  <span>{f.label}</span>
                  <span className="text-[10px]" style={{ color: activeFilter === f.key ? 'var(--gold)' : 'var(--text-muted)' }}>{f.count}</span>
                </button>
              ))}
            </div>

            {/* History sub-filters */}
            {activeFilter === 'history' && (
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { key: 'all', label: 'Все' },
                  { key: 'доступ открыт', label: 'Доступ открыт' },
                  { key: 'не принимаем сейчас', label: 'Не принимаем сейчас' },
                  { key: 'отменил заявку', label: 'Отменил заявку' },
                  { key: 'срок истёк', label: 'Срок истёк' },
                ].map((sf) => (
                  <button
                    key={sf.key}
                    onClick={() => { setHistorySubFilter(sf.key); setShowAllHistoryApps(false); }}
                    className="text-xs px-3 py-1.5 rounded-full transition-all duration-200"
                    style={{
                      border: `1px solid ${historySubFilter === sf.key ? 'var(--gold)' : 'var(--border-color)'}`,
                      color: historySubFilter === sf.key ? 'var(--gold)' : 'var(--text-muted)',
                      backgroundColor: historySubFilter === sf.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                    }}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            )}

            {/* Applications by active filter */}
            {applicationsByFilter[activeFilter].length === 0 ? (
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                {activeFilter === 'waiting' && (
                  <>
                    <Check className="w-8 h-8 mx-auto mb-3" style={{ color: SAGE }} />
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас нет заявок, где нужен ваш ответ</p>
                    <p className="text-xs text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Хороший знак: все новые заявки уже рассмотрены, уточнения отправлены, а решения не ждут внимания. Когда появится новая заявка или кандидат ответит на уточнение, она появится здесь.
                    </p>
                    <button onClick={() => { setActiveFilter('history'); setHistorySubFilter('all'); }} className="pill-link inline-flex">
                      <span>Посмотреть все заявки</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
                {activeFilter === 'clarify' && (
                  <>
                    <Info className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--gold)' }} />
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас никто не ждёт уточнения</p>
                    <p className="text-xs text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Здесь появятся заявки, по которым вы уже задали кандидату дополнительный вопрос. Когда кандидат ответит, заявка вернётся в список «Требуют ответа» со статусом «Ответил».
                    </p>
                    <button onClick={() => setActiveFilter('waiting')} className="pill-link inline-flex">
                      <span>Посмотреть заявки</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
                {activeFilter === 'approved' && (
                  <>
                    <Check className="w-8 h-8 mx-auto mb-3" style={{ color: SAGE }} />
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Нет одобренных заявок с незавершённым входом</p>
                    <p className="text-xs text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Здесь появляются одобренные заявки, где вход ещё не завершён: оплата не завершена или доступ не открылся автоматически. Если список пустой, значит после одобрения сейчас ничего не зависло.
                    </p>
                    <button onClick={() => { setActiveFilter('history'); setHistorySubFilter('all'); }} className="pill-link inline-flex">
                      <span>Посмотреть историю</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
                {activeFilter === 'history' && (
                  <>
                    <Clock className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>История входа пока пустая</p>
                    <p className="text-xs text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Здесь будут завершённые заявки: доступ открыт, кандидат отменил заявку, срок ответа истёк или вход сейчас не открываем. Когда появятся первые завершённые решения, они сохранятся здесь.
                    </p>
                    <button onClick={() => setActiveFilter('waiting')} className="pill-link inline-flex">
                      <span>Вернуться к заявкам</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            ) : (<>

            {/* PREVIEW LIST — all filters */}
            {(() => {
              const allApps = activeFilter === 'history' && historySubFilter !== 'all'
                ? applicationsByFilter.history.filter((a) => a.badge === historySubFilter)
                : applicationsByFilter[activeFilter];
              const isHistory = activeFilter === 'history';
              const showAll = isHistory ? showAllHistoryApps : showAllApps;
              const visibleApps = showAll ? allApps : allApps.slice(0, 3);
              const remaining = allApps.length - 3;

              return (
                <>
            <div>
              {visibleApps.map((app, i) => {
                const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
                  terracotta: { bg: TERRACOTTA_LIGHT, text: TERRACOTTA, border: TERRACOTTA_BORDER },
                  gold: { bg: 'rgba(212,175,55,0.08)', text: 'var(--gold)', border: 'rgba(212,175,55,0.2)' },
                  sage: { bg: SAGE_LIGHT, text: SAGE, border: SAGE_BORDER },
                };
                const bc = app.badgeColor ? badgeColors[app.badgeColor] : badgeColors.terracotta;
                return (
                  <div
                    key={i}
                    onClick={() => { setSidePanelApp(app); setApproveDirty(false); }}
                    className="hover-border-gold transition-all duration-200 group flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer"
                    style={{ border: '1px solid transparent' }}
                  >
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{app.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{app.name}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{ backgroundColor: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>{app.badge}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{app.waitTime} · {app.sub}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
                  </div>
                );
              })}
            </div>

            {/* Show all button */}
            {!showAll && remaining > 0 && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => isHistory ? setShowAllHistoryApps(true) : setShowAllApps(true)}
                  className="pill-link"
                >
                  <span>Показать все {allApps.length} {allApps.length === 1 ? 'заявку' : allApps.length < 5 ? 'заявки' : 'заявок'}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            )}
            </>
              );
            })()}

            {activeFilter === 'history' && (
            <div className="mt-4 text-center space-y-2">
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>В истории показаны последние 90 дней.</p>
              <button
                onClick={() => {
                  setArchivePanelOpen(true);
                  setArchiveDetailApp(null);
                  if (historySubFilter !== 'all') setArchiveStatusFilter(historySubFilter);
                }}
                className="pill-link"
              >
                <span>Искать в архиве</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            )}
            </>)}
          </div>{/* APPLICATIONS end */}</>)}

          {activeSection === 'newcomers' && (<>{/* ===== NEWCOMERS ===== */}
          <div ref={newcomersRef} className="section-fade-in px-6 md:px-8 py-6">
            <h2 className="section-heading">Новички в первые <span style={{ fontFamily: 'inherit' }}>7</span> дней</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>
              {newcomerFilter === 'all' && 'Здесь видно, как новички проходят первые дни после открытия доступа: есть ли у них цель, первый шаг, первая связь и опора.'}
              {newcomerFilter === 'ждёт первой связи' && 'Здесь новички, у которых пока не было первого живого контакта: ответа, встречи, Помощника на старте, участника рядом или другого значимого отклика.'}
              {newcomerFilter === 'Без цели' && 'Здесь новички, у которых пока не указана цель входа в сообщество. Без цели сложнее подобрать первый шаг, участника рядом, встречу или подходящий разбор.'}
              {newcomerFilter === 'нужен первый шаг' && 'Здесь новички, которым ещё не выбран понятный первый шаг. Первый шаг помогает человеку не потеряться после входа и начать движение в сообществе.'}
              {newcomerFilter === 'нужна опора' && 'Здесь новички, у которых пока нет опоры: Помощника на старте, участника рядом, встречи или другого живого контакта. Это сигнал, что человек может остаться один в первые дни.'}
            </p>
            {newcomers.length === 0 ? (
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас нет участников в первые 7 дней</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Когда новый участник войдёт в сообщество, здесь появится его стартовый путь: цель, первый шаг, первая связь и опора.</p>
              </div>
            ) : (<>
            {/* Newcomer filters */}
            <div className="flex flex-wrap gap-2 mb-5">
              {newcomerFilters.map((f) => (
                <button
                  key={f.key}
                  onClick={() => { setNewcomerFilter(f.key); setShowAllNewcomers(false); }}
                  className="pill-link"
                  style={{
                    borderColor: newcomerFilter === f.key ? 'var(--gold)' : 'var(--border-color)',
                    color: newcomerFilter === f.key ? 'var(--gold)' : 'var(--text-muted)',
                    backgroundColor: newcomerFilter === f.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                  }}
                >
                  <span>{f.label}</span>
                  <span className="text-[10px]" style={{ color: newcomerFilter === f.key ? 'var(--gold)' : 'var(--text-muted)' }}>{getNewcomerFilterCount(f.key)}</span>
                </button>
              ))}
            </div>

            {/* Newcomer preview cards */}
            <div>
              {visibleNewcomers.map((nc, i) => {
                const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
                  terracotta: { bg: TERRACOTTA_LIGHT, text: TERRACOTTA, border: TERRACOTTA_BORDER },
                  sage: { bg: SAGE_LIGHT, text: SAGE, border: SAGE_BORDER },
                  gold: { bg: 'rgba(212,175,55,0.08)', text: 'var(--gold)', border: 'rgba(212,175,55,0.2)' },
                };
                const bc = badgeColors[nc.statusColor] || badgeColors.terracotta;
                return (
                  <div key={i} onClick={() => setNewcomerSidePanel(nc)} className="hover-border-gold transition-all duration-200 group flex items-center gap-4 px-5 py-3.5 rounded-xl cursor-pointer" style={{ border: '1px solid transparent' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{nc.name.charAt(0)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }}>{nc.name}</h3>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{ backgroundColor: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>{nc.statusLabel}</span>
                        {(nc as any).hasDraft && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium shrink-0" style={{ backgroundColor: 'rgba(212,175,55,0.08)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)' }}>черновик ответа</span>
                        )}
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>{nc.day} в сообществе · {nc.goal || 'цель пока не указана'}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200 group-hover:translate-x-1" style={{ color: 'var(--text-muted)' }} />
                  </div>
                );
              })}
            </div>
            {filteredNewcomers.length === 0 && (
              <div className="rounded-xl p-6 text-center" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                {newcomerFilter === 'all' && (
                  <>
                    <Users className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Пока нет новичков в первые 7 дней</p>
                    <p className="text-xs text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Когда участник получит доступ к сообществу, он появится здесь. В первые дни будет видно, есть ли у него цель, первый шаг, первая связь и опора.
                    </p>
                    <button
                      onClick={() => { setActiveSection('applications'); setActiveFilter('waiting'); }}
                      className="pill-link inline-flex"
                    >
                      <span>Открыть заявки</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
                {newcomerFilter === 'ждёт первой связи' && (
                  <>
                    <Check className="w-8 h-8 mx-auto mb-3" style={{ color: SAGE }} />
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас никто не ждёт первой связи</p>
                    <p className="text-xs text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Хороший знак: у новичков уже появился первый живой контакт — ответ, встреча, Помощник на старте, участник рядом или другой отклик.
                    </p>
                    <button
                      onClick={() => setNewcomerFilter('all')}
                      className="pill-link inline-flex"
                    >
                      <span>Посмотреть всех новичков</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
                {newcomerFilter === 'Без цели' && (
                  <>
                    <Check className="w-8 h-8 mx-auto mb-3" style={{ color: SAGE }} />
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>У всех новичков указана цель</p>
                    <p className="text-xs text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Это помогает точнее подобрать первый шаг, встречу, разбор или человека рядом. Если цель изменится, её можно будет обновить в карточке новичка.
                    </p>
                    <button
                      onClick={() => setNewcomerFilter('all')}
                      className="pill-link inline-flex"
                    >
                      <span>Посмотреть всех новичков</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
                {newcomerFilter === 'нужен первый шаг' && (
                  <>
                    <Check className="w-8 h-8 mx-auto mb-3" style={{ color: SAGE }} />
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>У всех новичков есть первый шаг</p>
                    <p className="text-xs text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Хороший старт: каждому понятно, с чего начать после входа. Дальше важно смотреть, появился ли живой отклик и не нужна ли дополнительная опора.
                    </p>
                    <button
                      onClick={() => setNewcomerFilter('all')}
                      className="pill-link inline-flex"
                    >
                      <span>Посмотреть всех новичков</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
                {newcomerFilter === 'нужна опора' && (
                  <>
                    <Check className="w-8 h-8 mx-auto mb-3" style={{ color: SAGE }} />
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас нет новичков, которым срочно нужна опора</p>
                    <p className="text-xs text-center mb-4" style={{ color: 'var(--text-secondary)' }}>
                      Похоже, у новичков уже есть первый контакт или достаточно понятный старт. Если кто-то начнёт теряться, система снова покажет его здесь.
                    </p>
                    <button
                      onClick={() => setNewcomerFilter('all')}
                      className="pill-link inline-flex"
                    >
                      <span>Посмотреть всех новичков</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </>
                )}
              </div>
            )}
            {filteredNewcomers.length > 3 && !showAllNewcomers && (
            <div className="mt-4 text-center">
              <button onClick={() => setShowAllNewcomers(true)} className="pill-link">
                <span>Показать всех {pluralizeNewcomer(filteredNewcomers.length)}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            )}
            </>)}
          </div>{/* NEWCOMERS end */}</>)}

          {/* ===== NEWCOMER SIDE PANEL ===== */}
          {newcomerSidePanel && (
            <>
              <div className="fixed inset-0 z-40" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setNewcomerSidePanel(null)} />
              <div className="slide-in-right fixed top-0 right-0 h-full w-[420px] max-w-full z-50 overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-20px 0 60px rgba(0,0,0,0.12)' }}>
                <div className="p-6 pb-24">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{newcomerSidePanel.name.charAt(0)}</div>
                      <div>
                        <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>{newcomerSidePanel.name}</h2>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{newcomerSidePanel.day} в сообществе · <span className="cursor-pointer hover:underline" style={{ color: 'var(--gold)' }}>Открыть профиль</span></p>
                      </div>
                    </div>
                    <button onClick={() => setNewcomerSidePanel(null)} className="p-1 rounded-lg transition-colors -mt-0.5" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
                  </div>

                  {/* Goal highlight — for newcomers without goal */}
                  {(newcomerSidePanel as any).showGoalInline && !newcomerSidePanel.hasGoal && (
                    <div className="mt-3 rounded-lg p-3" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                      <p className="text-sm font-semibold" style={{ color: TERRACOTTA }}>Цель пока не указана</p>
                    </div>
                  )}

                  {/* Badge */}
                  <div className="mb-4 mt-3 flex flex-wrap gap-1.5">
                    <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: newcomerSidePanel.statusColor === 'terracotta' ? TERRACOTTA_LIGHT : SAGE_LIGHT, color: newcomerSidePanel.statusColor === 'terracotta' ? TERRACOTTA : SAGE, border: `1px solid ${newcomerSidePanel.statusColor === 'terracotta' ? TERRACOTTA_BORDER : SAGE_BORDER}` }}>
                      {newcomerSidePanel.statusLabel}
                    </span>
                    {(newcomerSidePanel as any).hasDraft && (
                      <span className="text-[10px] px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'rgba(212,175,55,0.1)', color: 'var(--gold)', border: '1px solid rgba(212,175,55,0.2)' }}>
                        черновик ответа
                      </span>
                    )}
                  </div>

                  {/* First 7 days */}
                  <div className="mb-5">
                    <h3 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Первые 7 дней</h3>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                      {(newcomerSidePanel as any).panelIntro || `Здесь видно, как ${newcomerSidePanel.name.split(' ')[0]} входит в сообщество: есть ли цель, первый шаг, первая связь и опора.`}
                    </p>
                  </div>

                  {/* First question — GOLD (attention, not problem) */}
                  {(newcomerSidePanel as any).firstQuestion && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Первый вопрос новичка</p>
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                        <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}><strong>{newcomerSidePanel.name.split(' ')[0]} спросил:</strong></p>
                        <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«{(newcomerSidePanel as any).firstQuestion}»</p>
                        <p className="text-[11px] mt-2 font-medium" style={{ color: 'var(--gold)' }}>Статус: вопрос пока без ответа</p>
                      </div>
                    </div>
                  )}

                  {/* Draft answer — compact preview */}
                  {(newcomerSidePanel as any).hasDraft && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Черновик ответа</p>
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}>
                        <p className="text-[11px] mb-1" style={{ color: 'var(--gold)' }}><strong>{(newcomerSidePanel as any).draftTitle}</strong></p>
                        <p className={`text-xs leading-relaxed ${showDraftFull ? '' : 'line-clamp-3'}`} style={{ color: 'var(--text-secondary)' }}>{(newcomerSidePanel as any).draftText}</p>
                        {!showDraftFull && (
                          <button onClick={() => setShowDraftFull(true)} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Показать весь черновик</button>
                        )}
                        {showDraftFull && (
                          <button onClick={() => setShowDraftFull(false)} className="text-[11px] mt-2 font-medium transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>Скрыть</button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress — visible */}
                  <div className="mt-4">
                    <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Прогресс входа</p>
                    <div className="space-y-2">
                      {((newcomerSidePanel as any).panelProgress || [
                        { label: 'Цель указана', ok: newcomerSidePanel.hasGoal },
                        { label: 'Первый шаг: стартовый гайд', ok: newcomerSidePanel.hasFirstStep },
                        { label: 'Первая связь пока не появилась', ok: newcomerSidePanel.hasConnection },
                        { label: 'Опора не назначена', ok: newcomerSidePanel.hasSupport },
                      ]).map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.ok ? SAGE : TERRACOTTA }} />
                          <p className="text-xs" style={{ color: item.ok ? 'var(--text-secondary)' : TERRACOTTA }}>{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Next step — amber for draft, sage for others */}
                  {(newcomerSidePanel.nextStep || (newcomerSidePanel as any).panelNextStep) && (
                    <div className="mt-4 rounded-lg p-3" style={{
                      backgroundColor: (newcomerSidePanel as any).hasDraft ? 'rgba(212,175,55,0.08)' : SAGE_LIGHT,
                      border: `1px solid ${(newcomerSidePanel as any).hasDraft ? 'rgba(212,175,55,0.2)' : SAGE_BORDER}`
                    }}>
                      <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: (newcomerSidePanel as any).hasDraft ? 'var(--gold)' : SAGE, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что дальше</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{(newcomerSidePanel as any).panelNextStep || newcomerSidePanel.nextStep}</p>
                    </div>
                  )}

                  {/* Collapse: Context from application */}
                  <div className="mt-5">
                    <button onClick={() => setShowContextCollapse(!showContextCollapse)} className="flex items-center gap-2 w-full text-left py-1 group">
                      <p className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Контекст из заявки</p>
                      <ChevronRight className="w-3 h-3 transition-transform" style={{ color: 'var(--text-muted)', transform: showContextCollapse ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                    </button>
                    <div className={`collapse-content ${showContextCollapse ? 'open' : ''}`}>
                      <div className="pt-3">
                        {newcomerSidePanel.goal && (
                          <div className="mb-3">
                            <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Цель из заявки</p>
                            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{newcomerSidePanel.goal}</p>
                          </div>
                        )}
                        {!newcomerSidePanel.goal && (
                          <div className="mb-3 rounded-lg p-3" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                            <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: TERRACOTTA, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Цель из заявки</p>
                            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Цель пока не указана. Без цели сложнее подобрать первый шаг и участника рядом.</p>
                          </div>
                        )}
                        {newcomerSidePanel.answer && (
                          <div>
                            <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ответы кандидата</p>
                            <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              {newcomerSidePanel.applicationQuestion && <p className="text-[11px] mb-1.5" style={{ color: 'var(--text-muted)' }}>{newcomerSidePanel.applicationQuestion}</p>}
                              <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«{newcomerSidePanel.answer}»</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Collapse: Timeline */}
                  {((newcomerSidePanel as any).panelTimeline || newcomerSidePanel.timeline) && (
                    <div className="mt-4">
                      <button onClick={() => setShowTimelineCollapse(!showTimelineCollapse)} className="flex items-center gap-2 w-full text-left py-1 group">
                        <p className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что произошло</p>
                        <ChevronRight className="w-3 h-3 transition-transform" style={{ color: 'var(--text-muted)', transform: showTimelineCollapse ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                      </button>
                      <div className={`collapse-content ${showTimelineCollapse ? 'open' : ''}`}>
                        <div className="pt-3 space-y-1.5">
                          {((newcomerSidePanel as any).panelTimeline || newcomerSidePanel.timeline).map((step: string, idx: number, arr: string[]) => (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: idx === arr.length - 1 ? 'var(--gold)' : SAGE }} />
                              <p className="text-xs" style={{ color: idx === arr.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Collapse: Internal note */}
                  <div className="mt-5">
                    <button onClick={() => setShowNoteCollapse(!showNoteCollapse)} className="flex items-center gap-2 w-full text-left py-1 group">
                      <p className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Внутренняя заметка</p>
                      <ChevronRight className="w-3 h-3 transition-transform" style={{ color: 'var(--text-muted)', transform: showNoteCollapse ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                    </button>
                    <div className={`collapse-content ${showNoteCollapse ? 'open' : ''}`}>
                      <div className="pt-3">
                        <textarea
                          className="w-full px-3 py-2 rounded-lg text-xs resize-none overflow-hidden"
                          placeholder="Заметка видна только команде..."
                          style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content', overflow: 'hidden' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions — sticky footer */}
                <div className="sticky bottom-0 px-6 py-4" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                  <div className="flex flex-wrap gap-2">
                    {(newcomerSidePanel as any).hasDraft ? (
                      <>
                        <button onClick={() => setShowEditDraftModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Продолжить редактирование</button>
                        <button onClick={() => setShowSendDraftConfirmModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Отправить ответ</button>
                        <button className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: TERRACOTTA }}>Удалить черновик</button>
                      </>
                    ) : (newcomerSidePanel as any).hasFirstQuestion ? (
                      <button onClick={() => setShowFirstQuestionReplyModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Ответить на первый вопрос</button>
                    ) : (newcomerSidePanel as any).showGoalInline && !newcomerSidePanel.hasGoal ? (
                      <>
                        <button onClick={() => setShowGoalHelpModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Помочь с целью</button>
                        {!newcomerSidePanel.firstResponseReceived && (
                          <button onClick={() => setShowFirstReplyModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Написать первый отклик</button>
                        )}
                      </>
                    ) : (
                      <>
                        {!newcomerSidePanel.firstResponseReceived && (
                          <button onClick={() => setShowFirstReplyModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Написать первый отклик</button>
                        )}
                        {!newcomerSidePanel.hasSupport && (
                          <button onClick={() => setShowSupportModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Подобрать опору</button>
                        )}
                        <button onClick={() => setShowMeetingInviteModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Пригласить на встречу</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}


          {activeSection === 'progress' && (<>{/* ===== WHAT WORKS ===== */}
          <div className="section-fade-in px-6 md:px-8 py-6">
            <h2 className="section-heading">Что уже получается</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Здесь видно, где вход уже работает без постоянного участия лидера.</p>
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

          {/* PROGRESS end */}</>)}

          {activeSection === 'settings' && (<>{/* ===== SETTINGS RISKS ===== */}
          <div className="section-fade-in px-6 md:px-8 py-6">
            <h2 className="section-heading">Настройки входа</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Здесь появляются только настройки, которые могут помешать человеку войти, получить доступ или начать путь.</p>
            <div className="space-y-4">
              {settingsRisks.map((risk, i) => (
                <div key={i} className="premium-card rounded-xl p-5" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}`, borderLeft: `3px solid ${TERRACOTTA}`, boxShadow: 'var(--card-shadow)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: TERRACOTTA }} />
                    <h3 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{risk.title}</h3>
                  </div>
                  <p className="text-sm leading-relaxed mb-4 pl-8" style={{ color: 'var(--text-secondary)' }}>{risk.text}</p>
                  <div className="pl-8">
                    <button onClick={() => { if (risk.action === 'Настроить форму') setShowSettingsModal(true); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>{risk.action}</button>
                  </div>
                </div>
              ))}
            </div>
          </div>{/* SETTINGS end */}</>)}

        </div>
      </main>

      {/* ===== 1. CLARIFY MODAL ===== */}
      {showClarifyModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowClarifyModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowClarifyModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Задать уточнение</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Кандидат получит сообщение ниже. После отправки заявка перейдёт в статус «На уточнении». Когда кандидат ответит, карточка вернётся в список «Требуют ответа» со статусом «Ответил».</p>

              <div className="mb-2">
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Заголовок сообщения</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-1"
                  maxLength={120}
                  value={clarifySubject}
                  onChange={(e) => { setClarifyDirty(true); setClarifySubject(e.target.value); }}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <div className="flex justify-end mb-3">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{clarifySubject.length} / 120</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Сообщение</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm resize-none leading-relaxed"
                  maxLength={1000}
                  value={clarifyText}
                  onChange={(e) => { setClarifyDirty(true); setClarifyText(e.target.value); }}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' , fieldSizing: 'content', overflow: 'hidden' }}
                />
              </div>
              <div className="flex justify-end mb-2">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{clarifyText.length} / 1000</span>
              </div>
              <p className="text-[11px] mb-4" style={{ color: 'var(--gold)' }}>Можно отредактировать перед отправкой.</p>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setClarifyDirty(false); setShowClarifyModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Отправить уточнение</button>
                <button onClick={() => { if (clarifyDirty) { setShowClarifyConfirm(true); } else { setShowClarifyModal(false); } }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к заявке</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CLARIFY CONFIRM: exit without saving ===== */}
      {showClarifyConfirm && (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onClick={() => setShowClarifyConfirm(false)}>
          <div className="modal-enter rounded-2xl max-w-sm w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Выйти без сохранения?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Вы изменили текст уточнения. Если вернуться к заявке, изменения не будут отправлены.</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowClarifyConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Остаться в модалке</button>
                <button onClick={() => { setClarifyDirty(false); setShowClarifyConfirm(false); setShowClarifyModal(false); }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Выйти без сохранения</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== PAYMENT REMIND MODAL ===== */}
      {showPaymentRemindModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowPaymentRemindModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowPaymentRemindModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Напомнить об оплате</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Кандидат получит сообщение ниже. Статус заявки останется «Одобрена · оплата не завершена». После успешной оплаты доступ откроется автоматически.</p>

              {/* Context */}
              {sidePanelApp && (
                <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Контекст</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sidePanelApp.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Заявка одобрена · оплата не завершена</p>
                </div>
              )}

              {/* Message to candidate */}
              <div className="mb-2">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение кандидату</p>
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Заголовок сообщения</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-1"
                  maxLength={120}
                  value={paymentRemindSubject}
                  onChange={(e) => { setPaymentRemindDirty(true); setPaymentRemindSubject(e.target.value); }}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <div className="flex justify-end mb-3">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{paymentRemindSubject.length} / 120</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Сообщение</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  maxLength={1000}
                  value={paymentRemindText}
                  onChange={(e) => { setPaymentRemindDirty(true); setPaymentRemindText(e.target.value); }}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' , fieldSizing: 'content', overflow: 'hidden' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{paymentRemindText.length} / 1000</span>
                </div>
                <p className="text-[11px] mb-4" style={{ color: 'var(--gold)' }}>Можно отредактировать перед отправкой.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setPaymentRemindDirty(false); setShowPaymentRemindModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Отправить напоминание</button>
                <button onClick={() => { if (paymentRemindDirty) { setPaymentRemindDirty(false); } setShowPaymentRemindModal(false); }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к заявке</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 2. APPROVE MODAL ===== */}
      {showApproveModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowApproveModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowApproveModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Одобрить заявку?</h2>

              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Кандидат получит сообщение ниже. После одобрения он сможет сделать следующий шаг: оплатить участие, если вход платный, или сразу войти в сообщество. После открытия доступа участник появится в блоке «Новички в первые 7 дней».</p>

              {/* Message to candidate */}
              <div className="mb-5">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение кандидату</p>
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Заголовок сообщения</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-1"
                  maxLength={120}
                  value={approveSubject}
                  onChange={(e) => { setApproveDirty(true); setApproveSubject(e.target.value); }}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <div className="flex justify-end mb-3">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{approveSubject.length} / 120</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Сообщение</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  maxLength={1000}
                  value={approveText}
                  onChange={(e) => { setApproveDirty(true); setApproveText(e.target.value); }}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' , fieldSizing: 'content', overflow: 'hidden' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{approveText.length} / 1000</span>
                </div>
                <p className="text-[11px] mb-4" style={{ color: 'var(--gold)' }}>Можно отредактировать перед отправкой.</p>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setApproveDirty(false); setShowApproveModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Одобрить заявку</button>
                <button onClick={() => { if (approveDirty) { setShowApproveConfirm(true); } else { setShowApproveModal(false); } }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к заявке</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== APPROVE CONFIRM: exit without saving ===== */}
      {showApproveConfirm && (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onClick={() => setShowApproveConfirm(false)}>
          <div className="modal-enter rounded-2xl max-w-sm w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Выйти без сохранения?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Вы изменили текст сообщения. Если вернуться к заявке, изменения не будут отправлены.</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowApproveConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Остаться в модалке</button>
                <button onClick={() => { setApproveDirty(false); setShowApproveConfirm(false); setShowApproveModal(false); }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Выйти без сохранения</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== OPEN ACCESS MANUALLY MODAL ===== */}
      {showOpenAccessModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowOpenAccessModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowOpenAccessModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Открыть доступ вручную?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Участник уже одобрен, но доступ не открылся автоматически. Перед ручным открытием проверьте, что оплата прошла или что доступ можно открыть без оплаты.</p>

              {/* Context */}
              {sidePanelApp && (
                <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Контекст</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sidePanelApp.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Заявка одобрена · доступ не открылся</p>
                </div>
              )}

              {/* Timeline */}
              {sidePanelApp?.timeline && (
                <div className="mb-4">
                  <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что произошло</p>
                  <div className="space-y-1.5">
                    {sidePanelApp.timeline.map((step: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: idx === (sidePanelApp.timeline || []).length - 1 ? 'var(--gold)' : SAGE }} />
                        <p className="text-xs" style={{ color: idx === (sidePanelApp.timeline || []).length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warning */}
              <div className="mb-5 rounded-lg p-3" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: TERRACOTTA }}>После ручного открытия участник сможет войти в сообщество.</span> Действие сохранится в истории заявки и в журнале изменений.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowOpenAccessModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>Открыть доступ вручную</button>
                <button onClick={() => setShowOpenAccessModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к заявке</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== CHECK PAYMENT MODAL ===== */}
      {showCheckPaymentModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowCheckPaymentModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowCheckPaymentModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Проверить оплату</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Здесь видно, что произошло с оплатой и почему доступ мог не открыться автоматически.</p>

              {/* Context */}
              {sidePanelApp && (
                <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Контекст</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sidePanelApp.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Заявка одобрена · доступ не открылся</p>
                </div>
              )}

              {/* Payment details */}
              <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Детали оплаты</p>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Статус оплаты:</span><span className="font-medium" style={{ color: SAGE }}>успешна</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Сумма:</span><span style={{ color: 'var(--text-primary)' }}>3 000 ₽</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Способ:</span><span style={{ color: 'var(--text-primary)' }}>СБП</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Время:</span><span style={{ color: 'var(--text-primary)' }}>сегодня · 14:18</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Webhook:</span><span style={{ color: 'var(--text-primary)' }}>получен, но доступ не открылся</span></div>
                  <div className="flex justify-between"><span style={{ color: 'var(--text-muted)' }}>Entitlement:</span><span style={{ color: TERRACOTTA }}>не создан</span></div>
                </div>
              </div>

              {/* What it means */}
              <div className="mb-5 rounded-lg p-3" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}` }}>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: SAGE }}>Оплата прошла, но право доступа не было создано автоматически.</span> Можно открыть доступ вручную и позже проверить обработку webhook.
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setShowCheckPaymentModal(false); setShowOpenAccessModal(true); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>Открыть доступ вручную</button>
                <button onClick={() => { setShowCheckPaymentModal(false); setShowMonetizationModal(true); }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Открыть Монетизацию</button>
                <button onClick={() => setShowCheckPaymentModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к заявке</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MONETIZATION MODAL ===== */}
      {showMonetizationModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowMonetizationModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowMonetizationModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Открыть Монетизацию?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Вы перейдёте в раздел «Монетизация», где можно проверить оплату, доступы, webhook и правила открытия доступа после оплаты.</p>

              {/* Context */}
              {sidePanelApp && (
                <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Контекст</p>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{sidePanelApp.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Заявка одобрена · доступ не открылся</p>
                </div>
              )}

              {/* What to check */}
              <div className="mb-5 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что можно проверить в Монетизации</p>
                <div className="space-y-1.5">
                  {['прошла ли оплата', 'создался ли доступ', 'сработал ли webhook', 'не зависла ли выдача доступа', 'нужно ли открыть доступ вручную'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: SAGE }} />
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowMonetizationModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Открыть Монетизацию</button>
                <button onClick={() => setShowMonetizationModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к заявке</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== REMIND MODAL ===== */}
      {showRemindModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowRemindModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowRemindModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Напомнить мягко</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Кандидат получит сообщение ниже. Статус заявки останется «На уточнении». Когда кандидат ответит, карточка вернётся в список «Требуют ответа» со статусом «Ответил».</p>

              {/* Current clarifying question */}
              {sidePanelApp?.clarifyingQuestion && (
                <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что уточняем</p>
                  <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>«{sidePanelApp.clarifyingQuestion}»</p>
                </div>
              )}

              {/* Message to candidate */}
              <div className="mb-2">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение кандидату</p>
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Заголовок сообщения</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-1"
                  maxLength={120}
                  value={remindSubject}
                  onChange={(e) => { setRemindDirty(true); setRemindSubject(e.target.value); }}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <div className="flex justify-end mb-3">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{remindSubject.length} / 120</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Сообщение</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  maxLength={1000}
                  value={remindText}
                  onChange={(e) => { setRemindDirty(true); setRemindText(e.target.value); }}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' , fieldSizing: 'content', overflow: 'hidden' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{remindText.length} / 1000</span>
                </div>
                <p className="text-[11px] mb-4" style={{ color: 'var(--gold)' }}>Можно отредактировать перед отправкой.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setRemindDirty(false); setShowRemindModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Отправить напоминание</button>
                <button onClick={() => { if (remindDirty) { setShowRemindModal(false); } else { setShowRemindModal(false); } }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к заявке</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 3. REJECT MODAL ===== */}
      {showRejectModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowRejectModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowRejectModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Не принимать сейчас?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Кандидат получит сообщение ниже. После подтверждения заявка перейдёт в статус «Не принимаем сейчас», доступ к сообществу не откроется. Причина решения сохранится для команды.</p>

              {/* Reason for decision — team only */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-semibold tracking-widest" style={{ color: TERRACOTTA, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Причина решения</p>
                  <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Видно только команде</span>
                </div>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  maxLength={1000}
                  value={rejectReason}
                  onChange={(e) => { setRejectDirty(true); setRejectReason(e.target.value); }}
                  placeholder="Почему принято это решение..."
                  style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}`, color: 'var(--text-primary)', outline: 'none' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{rejectReason.length} / 1000</span>
                </div>
              </div>

              {/* Message to candidate */}
              <div className="mb-2">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение кандидату</p>
                <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}>Заголовок сообщения</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl text-sm mb-1"
                  maxLength={120}
                  value={rejectSubject}
                  onChange={(e) => { setRejectDirty(true); setRejectSubject(e.target.value); }}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <div className="flex justify-end mb-3">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{rejectSubject.length} / 120</span>
                </div>
                <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Сообщение</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  maxLength={1000}
                  value={rejectText}
                  onChange={(e) => { setRejectDirty(true); setRejectText(e.target.value); }}
                  placeholder="Что получит кандидат..."
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{rejectText.length} / 1000</span>
                </div>
                <p className="text-[11px] mb-4" style={{ color: 'var(--gold)' }}>Можно отредактировать перед отправкой.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setRejectDirty(false); setShowRejectModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>Не принимать сейчас</button>
                <button onClick={() => { if (rejectDirty) { setShowRejectConfirm(true); } else { setShowRejectModal(false); } }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к заявке</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== REJECT CONFIRM: exit without saving ===== */}
      {showRejectConfirm && (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.45)' }} onClick={() => setShowRejectConfirm(false)}>
          <div className="modal-enter rounded-2xl max-w-sm w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <div className="p-6 md:p-8">
              <h2 className="text-lg font-bold mb-2 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Выйти без сохранения?</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>Вы изменили текст причины или сообщения. Если вернуться к заявке, изменения не будут сохранены.</p>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowRejectConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Остаться в модалке</button>
                <button onClick={() => { setRejectDirty(false); setShowRejectConfirm(false); setShowRejectModal(false); }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Выйти без сохранения</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 4. RETURN TO WORK MODAL ===== */}
      {showReturnModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowReturnModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowReturnModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Вернуть заявку в работу?</h2>
              <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--text-secondary)' }}>
                Заявка снова появится в фильтре «Требуют ответа». Решение «Не принимаем сейчас» останется в истории заявки, но вы сможете заново рассмотреть её, задать уточнение или одобрить вход.
              </p>
              <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <span style={{ color: TERRACOTTA }}>Кандидату ничего не отправится автоматически.</span> Новое сообщение уйдёт только после вашего следующего действия.
                </p>
              </div>
              <div className="mb-2">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Причина возврата в работу</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  rows={3}
                  maxLength={300}
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  placeholder="Кандидат вернулся с новым контекстом. Нужно пересмотреть решение."
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{returnReason.length} / 300</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setShowReturnModal(false); setReturnReason(''); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Вернуть в работу</button>
                <button onClick={() => { setShowReturnModal(false); setReturnReason(''); }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к заявке</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 5. SIDE PANEL: VIEW PATH ===== */}
      {showPathPanel && (
        <>
          <div className="fixed inset-0 z-[55]" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setShowPathPanel(false)} />
          <div className="slide-in-right fixed top-0 right-0 h-full w-[420px] max-w-full z-[60] overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-20px 0 60px rgba(0,0,0,0.12)' }}>
            <div className="p-6 md:p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-1">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>М</div>
                  <div>
                    <h2 className="text-xl font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Марина Соколова</h2>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>6-й день в сообществе · <span className="cursor-pointer hover:underline" style={{ color: 'var(--gold)' }}>Открыть профиль</span></p>
                  </div>
                </div>
                <button onClick={() => setShowPathPanel(false)} className="p-1 rounded-lg transition-colors -mt-0.5" style={{ color: 'var(--text-muted)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h3 className="text-lg font-bold mb-1 mt-5 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Стартовый путь</h3>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Здесь видно, с чего Марине лучше начать после входа: цель, первый шаг, первая связь и опора.</p>

              {/* Goal */}
              <div className="py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Цель из заявки</p>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>получить разбор портфолио</p>
              </div>

              {/* First step */}
              <div className="py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Первый шаг</p>
                <p className="text-sm font-medium mb-1" style={{ color: TERRACOTTA }}>пока не выбран</p>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Рекомендуемый первый шаг:</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Загрузить портфолио для первого разбора</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Марина сможет добавить ссылку на портфолио, выбрать 1–2 проекта и написать, что хочет улучшить перед поиском работы.</p>
              </div>

              {/* First connection */}
              <div className="py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Первая связь</p>
                <p className="text-sm font-medium" style={{ color: TERRACOTTA }}>ждёт первой связи</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Пока нет живого контакта: ответа, встречи, Помощника на старте, участника рядом или первого разбора.</p>
              </div>

              {/* Support */}
              <div className="py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Опора</p>
                <p className="text-sm font-medium" style={{ color: TERRACOTTA }}>не назначена</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Можно подобрать участника рядом, который уже проходил подготовку портфолио, или пригласить Марину на ближайшую встречу с разборами.</p>
              </div>

              {/* Next meeting */}
              <div className="py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Ближайшая подходящая встреча</p>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Разбор портфолио и pet-проектов</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>завтра · 19:00</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Встреча подходит как мягкая первая связь: можно прийти, посмотреть формат и задать первый вопрос.</p>
              </div>

              {/* First request */}
              <div className="py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-wider mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Первый запрос</p>
                <p className="text-sm font-medium mb-1" style={{ color: TERRACOTTA }}>пока не задан</p>
                <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Можно мягко подсказать Марине первый запрос:</p>
                <p className="text-sm italic" style={{ color: 'var(--text-secondary)' }}>«Покажите портфолио и напишите, что хотите улучшить перед откликами на вакансии.»</p>
              </div>

              {/* Timeline */}
              <div className="py-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-wider mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Что произошло</p>
                <div className="space-y-1.5">
                  {['заявка одобрена', 'доступ открыт', 'Марина вошла в сообщество', 'участник находится в первых 7 днях входа', 'первый шаг пока не выбран', 'первая связь пока не появилась'].map((step, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: idx < 2 ? SAGE : 'var(--gold)' }} />
                      <p className="text-xs" style={{ color: idx < 2 ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next step */}
              <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}` }}>
                <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: SAGE, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что дальше</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Марине лучше помочь начать с понятного действия: выбрать первый шаг, загрузить портфолио и получить первую связь через встречу, участника рядом или первый ответ.</p>
              </div>

              <div className="flex flex-wrap gap-2 mt-6">
                <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Назначить первый шаг</button>
                <button onClick={() => { setShowPathPanel(false); setShowSupportModal(true); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Подобрать опору</button>
                <button className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Пригласить на встречу</button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== 5. MENTOR ASSIGN MODAL ===== */}
      {showMentorAssignModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowMentorAssignModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full max-h-[90vh] relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowMentorAssignModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="modal-scroll overflow-y-auto max-h-[90vh] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Назначить Помощника на старте</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Помощник на старте помогает новичку освоиться в первые дни: ответить на первый вопрос, подсказать первый шаг и не дать человеку остаться одному.</p>

              {/* Newcomers without connection */}
              <div className="mb-5">
                <h3 className="text-[11px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Новички без первой связи</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Мария Козлова', day: '2-й день', goal: 'frontend' },
                    { name: 'Алексей Новиков', day: '4-й день', goal: 'Docker и CI/CD' },
                    { name: 'Елена Васильева', day: '5-й день', goal: 'не указана' },
                  ].map((nc, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                      <input type="checkbox" className="w-4 h-4 rounded accent-gold" defaultChecked />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{nc.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{nc.day} · цель: {nc.goal}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Candidates */}
              <div className="mb-5">
                <h3 className="text-[11px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Кого можно предложить</h3>
                <div className="space-y-3">
                  <div className="rounded-lg p-4" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}` }}>
                    <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Анна Морозова</p>
                    <p className="text-xs mb-1" style={{ color: 'var(--text-muted)' }}>Помогала новичкам 4 раза за последние 14 дней</p>
                    <p className="text-xs" style={{ color: SAGE }}>Нагрузка: комфортная · Темы: первый шаг, стартовый трек</p>
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-5">
                <h3 className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение участнику</h3>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg text-sm mb-3"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <textarea
                  className="w-full px-3 py-3 rounded-xl text-sm resize-none leading-relaxed"
                  maxLength={1000}
                  value={assignMessage}
                  onChange={(e) => setAssignMessage(e.target.value)}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' , fieldSizing: 'content', overflow: 'hidden' }}
                />
                <div className="flex justify-end mt-2">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{assignMessage.length} / 1000</span>
                </div>
              </div>

              {/* Note */}
              <div className="rounded-lg p-3 mb-5" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Функция не назначается автоматически. Участник получит предложение и сможет согласиться или отказаться.</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowMentorAssignModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Предложить функцию</button>
                <button onClick={() => setShowMentorAssignModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 6. CONNECT MODAL ===== */}
      {showConnectModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowConnectModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowConnectModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Предложить познакомиться</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Первая связь не обязана идти от лидера. Иногда новичку достаточно познакомиться с участником, который проходил похожий путь.</p>

              {/* Newcomer */}
              <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Мария Козлова · 2-й день</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Цель: стать frontend-разработчиком. Первой связи пока нет.</p>
              </div>

              {/* Member nearby */}
              <div className="rounded-lg p-4 mb-4" style={{ backgroundColor: SAGE_LIGHT, border: `1px solid ${SAGE_BORDER}` }}>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Сергей Волков</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Проходил похожий путь · уже отвечал по теме frontend · сейчас не перегружен</p>
              </div>

              {/* Message */}
              <div className="mb-2">
                <textarea
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  maxLength={1000}
                  value={connectText}
                  onChange={(e) => setConnectText(e.target.value)}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' , fieldSizing: 'content', overflow: 'hidden' }}
                />
              </div>
              <div className="flex justify-end mb-5">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{connectText.length} / 1000</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowConnectModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Предложить участника рядом</button>
                <button onClick={() => setShowConnectModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 7. MEETING INVITE MODAL ===== */}
      {showMeetingInviteModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowMeetingInviteModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full max-h-[90vh] relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowMeetingInviteModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="modal-scroll overflow-y-auto max-h-[90vh] p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Пригласить новичков на встречу</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Встреча может стать первой живой связью для новичка: человек увидит участников, услышит вопросы других и почувствует ритм сообщества.</p>

              {/* Meeting */}
              <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'rgba(201,169,110,0.08)', border: '1px solid rgba(201,169,110,0.2)' }}>
                <p className="text-sm font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Разбор пет-проектов</p>
                <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>Завтра · 19:00 · тема понятна новичкам, мягкий вход без обязательного выступления</p>
              </div>

              {/* Newcomers to invite */}
              <div className="mb-5">
                <h3 className="text-[11px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Кого пригласить</h3>
                <div className="space-y-2">
                  {[
                    { name: 'Мария Козлова', day: '2-й день', note: 'без первой связи' },
                    { name: 'Алексей Новиков', day: '4-й день', note: 'без первой связи' },
                    { name: 'Елена Васильева', day: '5-й день', note: 'цель не указана' },
                  ].map((nc, i) => (
                    <label key={i} className="flex items-center gap-3 p-3 rounded-lg cursor-pointer" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                      <input type="checkbox" className="w-4 h-4 rounded" defaultChecked />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{nc.name}</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{nc.day} · {nc.note}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div className="mb-2">
                <h3 className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение новичкам</h3>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg text-sm mb-3"
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <textarea
                  className="w-full px-3 py-2 rounded-lg text-sm resize-none"
                  maxLength={1000}
                  value={meetingText}
                  onChange={(e) => setMeetingText(e.target.value)}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' , fieldSizing: 'content', overflow: 'hidden' }}
                />
              </div>
              <div className="flex justify-end mb-5">
                <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{meetingText.length} / 1000</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowMeetingInviteModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Пригласить новичков</button>
                <button onClick={() => setShowMeetingInviteModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 8. FIRST REPLY MODAL ===== */}
      {showFirstReplyModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowFirstReplyModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowFirstReplyModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Написать первый отклик</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Первый отклик помогает новичку почувствовать, что его заметили. Он не должен быть длинным — важно поприветствовать человека, связать сообщение с его целью и подсказать ближайший понятный шаг.</p>

              {/* Context */}
              <div className="mb-5 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Мария Козлова · 2-й день</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Цель: стать frontend-разработчиком</p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Первый шаг выбран · первой связи пока нет · опора не назначена</p>
              </div>

              {/* Subject */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заголовок сообщения</p>
                <input
                  type="text"
                  className="w-full px-4 py-2.5 rounded-xl text-sm"
                  value={replyTitle}
                  onChange={(e) => setReplyTitle(e.target.value)}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
              </div>

              {/* Message */}
              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение новичку</p>
                <textarea
                  className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                  maxLength={1000}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' , fieldSizing: 'content', overflow: 'hidden' }}
                />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{replyText.length} / 1000</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowFirstReplyModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Отправить отклик</button>
                <button onClick={() => setShowFirstReplyModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Сохранить как черновик</button>
                <button onClick={() => setShowFirstReplyModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Вернуться к новичку</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== FIRST QUESTION REPLY MODAL (Artem) ===== */}
      {showFirstQuestionReplyModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowFirstQuestionReplyModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowFirstQuestionReplyModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8 overflow-y-auto">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Ответить на первый вопрос</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Первый ответ особенно важен: по нему новичок понимает, что в сообществе есть живой отклик. Ответ не должен быть большим — достаточно помочь сориентироваться, дать первый шаг и показать, куда можно двигаться дальше.</p>

              <div className="mb-5">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Вопрос новичка</p>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}><strong>Артём спросил:</strong></p>
                  <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«Я хочу сделать API для трекера задач на Go, но не понимаю, с чего лучше начать: сначала база данных, структура проекта или авторизация?»</p>
                  <p className="text-[11px] mt-2 font-medium" style={{ color: 'var(--gold)' }}>Статус: вопрос пока без ответа</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заголовок сообщения</p>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl text-sm" value={questionReplyTitle} onChange={(e) => setQuestionReplyTitle(e.target.value)} maxLength={120} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{questionReplyTitle.length} / 120</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение новичку</p>
                <textarea className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none overflow-hidden" value={questionReplyText} onChange={(e) => setQuestionReplyText(e.target.value)} maxLength={1000} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content', overflow: 'hidden' }} />
                <div className="flex justify-end mt-1">
                  <MessageCounter count={questionReplyText.length} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowFirstQuestionReplyModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Отправить ответ</button>
                <button onClick={() => setShowFirstQuestionReplyModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Сохранить как черновик</button>
                <button onClick={() => setShowFirstQuestionReplyModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Вернуться к новичку</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== GOAL HELP MODAL (for Elena) ===== */}
      {showGoalHelpModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowGoalHelpModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            {/* Header — fixed */}
            <div className="shrink-0 px-6 md:px-8 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Помочь с целью</h2>
                  <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Цель помогает новичку не потеряться в первые дни: понять, с чего начать, какой первый шаг выбрать и кого можно подключить рядом.</p>
                </div>
                <button onClick={() => setShowGoalHelpModal(false)} className="p-1 rounded-lg transition-colors z-10 shrink-0 ml-2 -mt-1" style={{ color: 'var(--text-muted)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto modal-scroll">
              <div className="px-6 md:px-8 py-5">
                {/* Newcomer info */}
                <div className="mb-5 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Елена Васильева · 1-й день</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <span className="inline-flex items-center gap-1 text-[11px]" style={{ color: TERRACOTTA }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: TERRACOTTA }} />
                      Цель пока не указана
                    </span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Первый шаг: стартовый гайд</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Первая связь пока не появилась</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>·</span>
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Опора пока не назначена</span>
                  </div>
                </div>

                {/* Context from application */}
                <div className="mb-5">
                  <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Контекст</p>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Елена написала в заявке:</p>
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«Хочу среду, где можно показать код и получить конкретные советы по улучшению.»</p>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>По этому ответу видно направление, но пока непонятно, какой результат для неё важнее всего в первые дни.</p>
                </div>

                {/* Subject */}
                <div className="mb-4">
                  <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заголовок сообщения</p>
                  <input
                    type="text"
                    className="w-full px-4 py-2.5 rounded-xl text-sm"
                    value={goalHelpTitle}
                    onChange={(e) => setGoalHelpTitle(e.target.value)}
                    maxLength={120}
                    style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{goalHelpTitle.length} / 120</span>
                  </div>
                </div>

                {/* Message */}
                <div className="mb-4">
                  <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение новичку</p>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none"
                    value={goalHelpText}
                    onChange={(e) => setGoalHelpText(e.target.value)}
                    maxLength={1000}
                    style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content', overflow: 'hidden' }}
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{goalHelpText.length} / 1000</span>
                  </div>
                </div>

                {/* Additional options */}
                <div className="mb-2">
                  <p className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Дополнительно</p>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Выберите, что система подготовит после отправки сообщения.</p>
                  <div className="space-y-3">
                    {/* Checkbox 1 */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        onClick={() => setGoalHelpSuggestGoal(!goalHelpSuggestGoal)}
                        className="w-4 h-4 rounded border shrink-0 mt-0.5 transition-colors flex items-center justify-center"
                        style={{
                          borderColor: goalHelpSuggestGoal ? 'var(--gold)' : 'var(--border-color)',
                          backgroundColor: goalHelpSuggestGoal ? 'var(--gold)' : 'transparent',
                        }}
                      >
                        {goalHelpSuggestGoal && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Предложить выбрать цель</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Елена сможет выбрать вариант или написать цель своими словами.</p>
                      </div>
                    </label>
                    {/* Checkbox 2 */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        onClick={() => setGoalHelpKeepGuide(!goalHelpKeepGuide)}
                        className="w-4 h-4 rounded border shrink-0 mt-0.5 transition-colors flex items-center justify-center"
                        style={{
                          borderColor: goalHelpKeepGuide ? 'var(--gold)' : 'var(--border-color)',
                          backgroundColor: goalHelpKeepGuide ? 'var(--gold)' : 'transparent',
                        }}
                      >
                        {goalHelpKeepGuide && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Оставить стартовый гайд первым шагом</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Пока цель не уточнена, базовый стартовый гайд останется первым шагом.</p>
                      </div>
                    </label>
                    {/* Checkbox 3 */}
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        onClick={() => setGoalHelpSuggestSupport(!goalHelpSuggestSupport)}
                        className="w-4 h-4 rounded border shrink-0 mt-0.5 transition-colors flex items-center justify-center"
                        style={{
                          borderColor: goalHelpSuggestSupport ? 'var(--gold)' : 'var(--border-color)',
                          backgroundColor: goalHelpSuggestSupport ? 'var(--gold)' : 'transparent',
                        }}
                      >
                        {goalHelpSuggestSupport && <Check className="w-3 h-3 text-white" />}
                      </button>
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>После ответа предложить опору</p>
                        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Когда Елена уточнит цель, система подскажет, кого можно подключить рядом.</p>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions — sticky footer */}
            <div className="shrink-0 px-6 md:px-8 py-4" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setShowGoalHelpModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Отправить сообщение</button>
                <button onClick={() => { setShowGoalHelpModal(false); }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Сохранить как черновик</button>
                <button onClick={() => setShowGoalHelpModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Вернуться к новичку</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ILYA: EDIT DRAFT MODAL ===== */}
      {showEditDraftModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowEditDraftModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowEditDraftModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8 overflow-y-auto">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Продолжить ответ</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Первый ответ особенно важен: по нему новичок понимает, что в сообществе есть живой отклик. Черновик уже сохранён — вы можете поправить текст и отправить его Илье.</p>

              <div className="mb-5">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Вопрос новичка</p>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <p className="text-[11px] mb-1" style={{ color: 'var(--text-muted)' }}><strong>Илья спросил:</strong></p>
                  <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«Я хочу сделать API для личного трекера привычек, но не понимаю, как правильно разложить проект на слои: handlers, services, repository. С чего лучше начать, чтобы не усложнить?»</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заголовок сообщения</p>
                <input type="text" className="w-full px-4 py-2.5 rounded-xl text-sm" value={editDraftTitle} onChange={(e) => setEditDraftTitle(e.target.value)} maxLength={120} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                <div className="flex justify-end mt-1">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{editDraftTitle.length} / 120</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение новичку</p>
                <textarea className="w-full px-4 py-3 rounded-xl text-sm leading-relaxed resize-none overflow-hidden" value={editDraftText} onChange={(e) => setEditDraftText(e.target.value)} maxLength={1000} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content', overflow: 'hidden' }} />
                <div className="flex justify-end mt-1">
                  <MessageCounter count={editDraftText.length} />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setShowEditDraftModal(false); setShowSendDraftConfirmModal(true); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Отправить ответ</button>
                <button onClick={() => setShowEditDraftModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Сохранить изменения</button>
                <button onClick={() => setShowEditDraftModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Вернуться к новичку</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== ILYA: SEND DRAFT CONFIRM MODAL ===== */}
      {showSendDraftConfirmModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowSendDraftConfirmModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden max-h-[90vh] flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSendDraftConfirmModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8 overflow-y-auto">
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Отправить ответ Илье?</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Илья получит сохранённый черновик ниже. После отправки вопрос перестанет быть без ответа, а в истории входа появится событие «первый ответ отправлен».</p>

              <div className="mb-4">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Вопрос новичка</p>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)' }}>
                  <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«Я хочу сделать API для личного трекера привычек, но не понимаю, как правильно разложить проект на слои: handlers, services, repository. С чего лучше начать, чтобы не усложнить?»</p>
                </div>
              </div>

              <div className="mb-5">
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ответ, который получит Илья</p>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Заголовок сообщения</p>
                  <p className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>{editDraftTitle}</p>
                  <p className="text-[11px] font-medium mb-1" style={{ color: 'var(--text-muted)' }}>Сообщение</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{editDraftText}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button onClick={() => { setShowSendDraftConfirmModal(false); setShowEditDraftModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Отправить ответ</button>
                <button onClick={() => { setShowSendDraftConfirmModal(false); setShowEditDraftModal(true); }} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Продолжить редактирование</button>
                <button onClick={() => setShowSendDraftConfirmModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Вернуться к новичку</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== 10. SETTINGS TRANSITION MODAL ===== */}
      {showSettingsModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowSettingsModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSettingsModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Настроить форму заявки</h2>
              <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-sm leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>Форма заявки помогает понять, кто хочет войти в сообщество и с каким запросом человек приходит.</p>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Сейчас в форме не хватает вопроса о цели. Без цели сложнее подобрать новичку первый шаг, участника рядом или Помощника на старте.</p>
              </div>
              <div className="mb-5">
                <h3 className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что можно настроить</h3>
                <div className="space-y-1.5">
                  {['Вопросы заявки', 'Вопрос о цели', 'Вопрос об опыте', 'Текст после отправки заявки', 'Что происходит после одобрения'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Перейти к настройке формы</button>
                <button onClick={() => setShowSettingsModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Позже</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== LIMITS MODAL ===== */}
      {showLimitsModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowLimitsModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowLimitsModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              <h2 className="text-xl font-bold mb-4 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Лимиты Помощника на старте</h2>
              <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Без лимита участника можно случайно перегрузить новыми назначениями. Лучше заранее указать, сколько новичков можно сопровождать одновременно.</p>
              </div>
              <div className="mb-5">
                <h3 className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что можно настроить</h3>
                <div className="space-y-1.5">
                  {['Лимит новичков на одного Помощника', 'Срок функции (по умолчанию 7 дней)', 'Возможность поставить помощь на паузу', 'Темы, по которым Помощник помогает', 'Уведомления о перегрузе'].map((item, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>—</span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowLimitsModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Перейти к настройкам</button>
                <button onClick={() => setShowLimitsModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Позже</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== SUPPORT MODAL ===== */}
      {showSupportModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowSupportModal(false)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full max-h-[90vh] relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowSupportModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="modal-scroll overflow-y-auto max-h-[90vh] p-6 md:p-8">
              {/* Header */}
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Подобрать опору</h2>
              <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
                Мария на 2-м дне в сообществе. Цель — стать frontend-разработчиком. Первой связи пока нет.
              </p>

              {/* Options */}
              <div className="space-y-4">
                {/* Mentor on start */}
                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: 'rgba(107,158,124,0.15)', color: SAGE }}>А</div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Анна Морозова</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Помогала новичкам 4 раза за последние 14 дней</p>
                      <p className="text-xs mt-0.5" style={{ color: SAGE }}>Нагрузка: комфортная</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowSupportModal(false); setShowMentorModal(true); }} className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Предложить функцию</button>
                </div>

                {/* Participant nearby */}
                <div className="rounded-xl p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: 'rgba(212,175,55,0.12)', color: 'var(--gold)' }}>С</div>
                    <div>
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>Сергей Волков</p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Проходил похожий путь и уже отвечал по теме frontend</p>
                    </div>
                  </div>
                  <button onClick={() => { setShowSupportModal(false); setShowConnectModal(true); }} className="w-full px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Предложить участника рядом</button>
                </div>


              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MENTOR FUNCTION MODAL ===== */}
      {showMentorModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowMentorModal(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowMentorModal(false)} className="absolute top-4 right-4 p-1 rounded-lg transition-colors z-10" style={{ color: 'var(--text-muted)' }}>
              <X className="w-5 h-5" />
            </button>
            <div className="p-6 md:p-8">
              {/* Header */}
              <h2 className="text-xl font-bold mb-1 heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Предложить функцию</h2>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>
                Предложить Анне функцию «Помощник на старте»? Она сможет согласиться или отказаться.
              </p>
              <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Анна уже помогала новичкам и сейчас не перегружена. Можно предложить ей сопровождать новичка 7 дней.
                </p>
              </div>

              {/* Message */}
              <div className="mb-5">
                <h3 className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение для Анны</h3>
                <input
                  type="text"
                  className="w-full px-3 py-2 rounded-lg text-sm mb-3"
                  value={mentorTitle}
                  onChange={(e) => setMentorTitle(e.target.value)}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                />
                <textarea
                  className="w-full px-3 py-3 rounded-xl text-sm resize-none leading-relaxed"
                  maxLength={1000}
                  value={mentorMessage}
                  onChange={(e) => setMentorMessage(e.target.value)}
                  style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' , fieldSizing: 'content', overflow: 'hidden' }}
                />
                <div className="flex justify-end mt-2">
                  <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{mentorMessage.length} / 1000</span>
                </div>
              </div>

              {/* Settings */}
              <div className="mb-6 space-y-3">
                <h3 className="text-xs font-semibold tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Настройки предложения</h3>
                <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <Clock className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Срок:</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>7 дней</span>
                </div>
                <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <Users className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Лимит:</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>до 2 новичков</span>
                </div>
                <div className="flex items-center gap-3 py-2" style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <BookOpen className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Темы:</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>первый шаг, стартовый трек, как задать вопрос</span>
                </div>
                <div className="flex items-center gap-3 py-2">
                  <Pause className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                  <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>Можно поставить на паузу</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setShowMentorModal(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Предложить функцию</button>
                <button onClick={() => setShowMentorModal(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== RIGHT PANEL: DYNAMIC ADVISOR & TIPS ===== */}
      <aside className="w-full lg:w-[240px] shrink-0 space-y-5 lg:sticky lg:top-[88px] lg:h-[calc(100vh-104px)] lg:overflow-y-auto right-scrollbar">
        {/* ===== Ваше внимание — правую колонку скрываем полностью ===== */}
        {/* ===== Что получается — правую колонку скрываем полностью ===== */}
        {(() => {
          /* ---- DYNAMIC ADVISOR LOGIC ---- */
          /* Заявки: приоритеты */
          const staleApp = applicationsByFilter.waiting.find(a => a.badge === 'больше суток');
          const repliedApp = applicationsByFilter.waiting.find(a => a.badge === 'ответил');
          const stuckApp = applicationsByFilter.approved.find(a => a.badge === 'доступ не открылся');
          /* Новички: приоритеты */
          const unansweredNc = newcomers.find(n => n.hasFirstQuestion && !n.firstResponseReceived);
          const draftNc = newcomers.find(n => n.hasDraft);
          const noConnectionNc = newcomers.find(n => n.day.includes('5') && !n.hasConnection);
          /* Показываем ли правую колонку */
          const showColumn = activeSection === 'applications' || activeSection === 'newcomers' || activeSection === 'settings';
          const hasAdvisorContent = activeSection === 'applications' || activeSection === 'newcomers' || activeSection === 'settings';
          if (!showColumn) return null;
          return (
            <>
              {/* ===== СОВЕТНИК ===== */}
              {hasAdvisorContent && !advisorHidden && (
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

                  {/* --- РАЗДЕЛ: ЗАЯВКИ --- */}
                  {activeSection === 'applications' && (
                    <>
                      {staleApp ? (
                        <>
                          <p className="text-xs font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>Одна заявка ждёт ответа больше суток</p>
                          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>Начните с неё, пока запрос кандидата ещё актуален. Остальные заявки можно рассмотреть следом.</p>
                          <button onClick={() => setShowAdvisorWhy(!showAdvisorWhy)} className="text-[11px] mb-3 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                            {showAdvisorWhy ? 'Скрыть' : 'Почему я это вижу?'}
                          </button>
                          {showAdvisorWhy && (
                            <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Система учитывает время ожидания, ответы на уточнения и ситуации, где после одобрения не завершились оплата или открытие доступа.</p>
                            </div>
                          )}
                          <button onClick={() => { setSidePanelApp(staleApp); setApproveDirty(false); }} className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Показать эту заявку</button>
                        </>
                      ) : repliedApp ? (
                        <>
                          <p className="text-xs font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>Кандидат ответил на уточнение</p>
                          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>Теперь можно принять решение по заявке или задать ещё один вопрос, если контекста пока недостаточно.</p>
                          <button onClick={() => setShowAdvisorWhy(!showAdvisorWhy)} className="text-[11px] mb-3 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                            {showAdvisorWhy ? 'Скрыть' : 'Почему я это вижу?'}
                          </button>
                          {showAdvisorWhy && (
                            <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Система учитывает время ожидания, ответы на уточнения и ситуации, где после одобрения не завершились оплата или открытие доступа.</p>
                            </div>
                          )}
                          <button onClick={() => { setSidePanelApp(repliedApp); setApproveDirty(false); }} className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Показать эту заявку</button>
                        </>
                      ) : stuckApp ? (
                        <>
                          <p className="text-xs font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>Оплата прошла, но доступ не открылся</p>
                          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>Человек прошёл вход, но ещё не может попасть в сообщество. Ситуацию лучше проверить сразу.</p>
                          <button onClick={() => setShowAdvisorWhy(!showAdvisorWhy)} className="text-[11px] mb-3 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                            {showAdvisorWhy ? 'Скрыть' : 'Почему я это вижу?'}
                          </button>
                          {showAdvisorWhy && (
                            <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Система учитывает время ожидания, ответы на уточнения и ситуации, где после одобрения не завершились оплата или открытие доступа.</p>
                            </div>
                          )}
                          <button onClick={() => { setActiveFilter('approved'); setSidePanelApp(stuckApp); setApproveDirty(false); }} className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Показать эту заявку</button>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас срочных ситуаций нет</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Все заявки обработаны, ожидают решения в обычном порядке.</p>
                        </>
                      )}
                    </>
                  )}

                  {/* --- РАЗДЕЛ: НОВИЧКИ --- */}
                  {activeSection === 'newcomers' && (
                    <>
                      {unansweredNc ? (
                        <>
                          <p className="text-xs font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>Сначала ответьте на первый вопрос</p>
                          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>Один новичок уже задал вопрос и ждёт живого ответа.{draftNc ? ' Ещё по одному ответу сохранён черновик — его можно завершить следом.' : ''}</p>
                          <button onClick={() => setShowAdvisorWhy(!showAdvisorWhy)} className="text-[11px] mb-3 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                            {showAdvisorWhy ? 'Скрыть' : 'Почему я это вижу?'}
                          </button>
                          {showAdvisorWhy && (
                            <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Система учитывает день участия, вопросы без ответа, незавершённые черновики, первую связь и состояние опоры.</p>
                            </div>
                          )}
                          <div className="mt-2">
                            <button onClick={() => setNewcomerSidePanel(unansweredNc)} className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Показать вопрос</button>
                          </div>
                        </>
                      ) : draftNc ? (
                        <>
                          <p className="text-xs font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>Есть неотправленный черновик ответа</p>
                          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>Лучше завершить и отправить ответ, пока вопрос ещё свежий.</p>
                          <button onClick={() => setShowAdvisorWhy(!showAdvisorWhy)} className="text-[11px] mb-3 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                            {showAdvisorWhy ? 'Скрыть' : 'Почему я это вижу?'}
                          </button>
                          {showAdvisorWhy && (
                            <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Система учитывает день участия, вопросы без ответа, незавершённые черновики, первую связь и состояние опоры.</p>
                            </div>
                          )}
                          <div className="mt-2">
                            <button onClick={() => setNewcomerSidePanel(draftNc)} className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Показать черновик</button>
                          </div>
                        </>
                      ) : noConnectionNc ? (
                        <>
                          <p className="text-xs font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>Пятый день без первой связи</p>
                          <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>Новичок уже почти неделю в сообществе, но живого контакта пока не было. Стоит подключить опору или пригласить на встречу.</p>
                          <button onClick={() => setShowAdvisorWhy(!showAdvisorWhy)} className="text-[11px] mb-3 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                            {showAdvisorWhy ? 'Скрыть' : 'Почему я это вижу?'}
                          </button>
                          {showAdvisorWhy && (
                            <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Система учитывает день участия, вопросы без ответа, незавершённые черновики, первую связь и состояние опоры.</p>
                            </div>
                          )}
                          <div className="mt-2">
                            <button onClick={() => setNewcomerSidePanel(noConnectionNc)} className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Показать новичка</button>
                          </div>
                        </>
                      ) : (
                        <>
                          <p className="text-xs font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>Сейчас срочных ситуаций нет</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>У новичков нет вопросов без ответа.</p>
                        </>
                      )}
                    </>
                  )}

                  {/* --- РАЗДЕЛ: НАСТРОЙКИ ВХОДА --- */}
                  {activeSection === 'settings' && (
                    <>
                      <p className="text-xs font-semibold leading-relaxed mb-1" style={{ color: 'var(--text-primary)' }}>После одобрения не указан понятный следующий шаг</p>
                      <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-secondary)' }}>Кандидат получает решение, но может не понять, что делать дальше: войти сразу, перейти к оплате или дождаться открытия доступа.</p>
                      <button onClick={() => setShowAdvisorWhy(!showAdvisorWhy)} className="text-[11px] mb-3 transition-colors hover:opacity-80" style={{ color: 'var(--text-muted)' }}>
                        {showAdvisorWhy ? 'Скрыть' : 'Почему я это вижу?'}
                      </button>
                      {showAdvisorWhy && (
                        <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                          <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>Система проверяет форму заявки, сообщения после решений, условия оплаты и правила открытия доступа.</p>
                        </div>
                      )}
                      <button onClick={() => setShowSettingsModal(true)} className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Настроить следующий шаг</button>
                    </>
                  )}
                </div>
              )}

              {/* ===== РАЗДЕЛИТЕЛЬ ===== */}
              {hasAdvisorContent && !advisorHidden && <div className="h-px mx-1" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />}

              {/* ===== МОЖЕТ ПРИГОДИТЬСЯ (динамический) ===== */}
              {hasAdvisorContent && !advisorHidden && (
                <div className="p-1">
                  <p className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Может пригодиться</p>
                  <div className="space-y-3">
                    {/* --- ЗАЯВКИ --- */}
                    {activeSection === 'applications' && (
                      <>
                        <button onClick={() => setShowSettingsModal(true)} className="w-full text-left group flex items-start gap-2.5">
                          <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-muted)' }} />
                          <div>
                            <p className="text-xs font-medium transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>Форма заявки</p>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Вопросы, цель и сообщение, которое человек увидит после отправки заявки</p>
                          </div>
                        </button>
                        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
                        <button onClick={() => setShowAppMessageModal(true)} className="w-full text-left group flex items-start gap-2.5">
                          <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-muted)' }} />
                          <div>
                            <p className="text-xs font-medium transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>Сообщения по заявке</p>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Заголовки и тексты для одобрения, уточнения и решения «Не принимать сейчас»</p>
                          </div>
                        </button>
                      </>
                    )}
                    {/* --- НОВИЧКИ --- */}
                    {activeSection === 'newcomers' && (
                      <>
                        <button onClick={() => setShowFirst7DaysModal(true)} className="w-full text-left group flex items-start gap-2.5">
                          <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-muted)' }} />
                          <div>
                            <p className="text-xs font-medium transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>Первые 7 дней</p>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Базовый первый шаг, запрос цели и сценарий первого сообщения новичку</p>
                          </div>
                        </button>
                        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
                        <button onClick={() => setShowLimitsModal(true)} className="w-full text-left group flex items-start gap-2.5">
                          <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-muted)' }} />
                          <div>
                            <p className="text-xs font-medium transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>Лимиты Помощника</p>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Срок функции, допустимая нагрузка, темы помощи и возможность поставить поддержку на паузу</p>
                          </div>
                        </button>
                      </>
                    )}
                    {/* --- НАСТРОЙКИ ВХОДА --- */}
                    {activeSection === 'settings' && (
                      <>
                        <button onClick={() => setShowSettingsModal(true)} className="w-full text-left group flex items-start gap-2.5">
                          <FileText className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-muted)' }} />
                          <div>
                            <p className="text-xs font-medium transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>Форма заявки</p>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Вопросы, цель и сообщение после отправки заявки</p>
                          </div>
                        </button>
                        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />
                        <button onClick={() => setShowLimitsModal(true)} className="w-full text-left group flex items-start gap-2.5">
                          <BookOpen className="w-3.5 h-3.5 shrink-0 mt-0.5 transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-muted)' }} />
                          <div>
                            <p className="text-xs font-medium transition-colors group-hover:text-[var(--gold)]" style={{ color: 'var(--text-secondary)' }}>Оплата и открытие доступа</p>
                            <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>Что происходит после одобрения, успешной оплаты и автоматического открытия доступа</p>
                          </div>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ===== КНОПКА ПОКАЗАТЬ (если скрыт) ===== */}
              {advisorHidden && (
                <button onClick={() => setAdvisorHidden(false)} className="w-full text-left p-1 transition-all duration-200 hover:-translate-y-0.5">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--gold)' }}>Показать Советника</span>
                  </div>
                </button>
              )}
            </>
          );
        })()}
      </aside>

      {/* ===== SIDE PANEL for applications ===== */}
      {sidePanelApp && (
        <>
          <div className="fixed inset-0 z-40 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => setSidePanelApp(null)} />
          <div className="slide-in-right fixed top-0 right-0 h-full w-[420px] max-w-full z-50 overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-20px 0 60px rgba(0,0,0,0.12)' }}>
            <div className="p-6 pb-24">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{sidePanelApp.name.charAt(0)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>{sidePanelApp.name}</h2>
                      {sidePanelApp.isArchive && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Архив</span>
                      )}
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{sidePanelApp.waitTime}</p>
                  </div>
                </div>
                <button onClick={() => setSidePanelApp(null)} className="p-1 rounded transition-colors" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
              </div>

              {/* Status badge */}
              {(() => {
                const colors: Record<string, { bg: string; text: string; border: string }> = {
                  terracotta: { bg: TERRACOTTA_LIGHT, text: TERRACOTTA, border: TERRACOTTA_BORDER },
                  gold: { bg: 'rgba(212,175,55,0.08)', text: 'var(--gold)', border: 'rgba(212,175,55,0.2)' },
                  sage: { bg: SAGE_LIGHT, text: SAGE, border: SAGE_BORDER },
                };
                const bc = sidePanelApp.badgeColor ? (colors[sidePanelApp.badgeColor] || colors.terracotta) : colors.terracotta;
                return <span className="text-[11px] px-3 py-1 rounded-full font-medium" style={{ backgroundColor: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>{sidePanelApp.badge}</span>;
              })()}

              {/* Goal — visible immediately */}
              {sidePanelApp.goal && (
                <div className="mt-5">
                  <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Цель из заявки</p>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{sidePanelApp.goal}</p>
                </div>
              )}

              {/* Answer — visible immediately */}
              {sidePanelApp.answer && (
                <div className="mt-4">
                  <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ответы кандидата</p>
                  <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    {sidePanelApp.applicationQuestion && <p className="text-[11px] mb-1.5" style={{ color: 'var(--text-muted)' }}>{sidePanelApp.applicationQuestion}</p>}
                    <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«{sidePanelApp.answer}»</p>
                  </div>
                </div>
              )}

              {/* Next step — visible immediately */}
              {sidePanelApp.nextStep && (
                <div className="mt-4 rounded-lg p-3" style={{
                  backgroundColor: ['нужен ответ', 'больше суток', 'ответил', 'на уточнении', 'без ответа', 'оплата не завершена', 'вошёл в новички', 'не принимаем сейчас', 'доступ открыт', 'отменил заявку', 'срок истёк'].includes(sidePanelApp.badge || '') ? SAGE_LIGHT : sidePanelApp.badgeColor === 'terracotta' ? TERRACOTTA_LIGHT : 'var(--hover-bg)',
                  border: `1px solid ${['нужен ответ', 'больше суток', 'ответил', 'на уточнении', 'без ответа', 'оплата не завершена', 'вошёл в новички', 'не принимаем сейчас', 'доступ открыт', 'отменил заявку', 'срок истёк'].includes(sidePanelApp.badge || '') ? SAGE_BORDER : sidePanelApp.badgeColor === 'terracotta' ? TERRACOTTA_BORDER : 'var(--border-color)'}`
                }}>
                  <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: ['нужен ответ', 'больше суток', 'ответил', 'на уточнении', 'без ответа', 'оплата не завершена', 'вошёл в новички', 'не принимаем сейчас', 'доступ открыт', 'отменил заявку', 'срок истёк'].includes(sidePanelApp.badge || '') ? SAGE : sidePanelApp.badgeColor === 'terracotta' ? TERRACOTTA : 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что дальше</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sidePanelApp.nextStep}</p>
                </div>
              )}

              {/* Collapse: Timeline */}
              {sidePanelApp.timeline && (
                <div className="mt-5">
                  <button onClick={() => setShowAppTimelineCollapse(!showAppTimelineCollapse)} className="flex items-center gap-2 w-full text-left py-1 group">
                    <p className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что произошло</p>
                    <ChevronRight className="w-3 h-3 transition-transform" style={{ color: 'var(--text-muted)', transform: showAppTimelineCollapse ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                  </button>
                  <div className={`collapse-content ${showAppTimelineCollapse ? 'open' : ''}`}>
                    <div className="pt-3 space-y-1.5">
                      {sidePanelApp.timeline.map((step: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: idx === (sidePanelApp.timeline || []).length - 1 ? 'var(--gold)' : SAGE }} />
                          <p className="text-xs" style={{ color: idx === (sidePanelApp.timeline || []).length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Collapse: Clarifying question */}
              {sidePanelApp.clarifyingQuestion && (
                <div className="mt-4">
                  <button onClick={() => setShowAppContextCollapse(!showAppContextCollapse)} className="flex items-center gap-2 w-full text-left py-1 group">
                    <p className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Уточнение и ответ</p>
                    <ChevronRight className="w-3 h-3 transition-transform" style={{ color: 'var(--text-muted)', transform: showAppContextCollapse ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                  </button>
                  <div className={`collapse-content ${showAppContextCollapse ? 'open' : ''}`}>
                    <div className="pt-3">
                      <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                        <p className="text-[11px] mb-1.5" style={{ color: 'var(--text-muted)' }}>{sidePanelApp.clarifyingQuestion}</p>
                        {sidePanelApp.clarifyingAnswer ? (
                          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«{sidePanelApp.clarifyingAnswer}»</p>
                        ) : (
                          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-muted)' }}>Ответа пока нет. Кандидат ещё не ответил на уточнение.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Collapse: Decision */}
              {(sidePanelApp.rejectionReason || sidePanelApp.candidateMessage) && (
                <div className="mt-4">
                  <button onClick={() => setShowDecisionBlock(!showDecisionBlock)} className="flex items-center gap-2 w-full text-left py-1 group">
                    <p className="text-[10px] font-semibold tracking-widest" style={{ color: TERRACOTTA, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Решение и сообщение</p>
                    <ChevronRight className="w-3 h-3 transition-transform" style={{ color: TERRACOTTA, transform: showDecisionBlock ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                  </button>
                  <div className={`collapse-content ${showDecisionBlock ? 'open' : ''}`}>
                    <div className="pt-3 space-y-3">
                      {sidePanelApp.rejectionReason && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: TERRACOTTA_LIGHT, border: `1px solid ${TERRACOTTA_BORDER}` }}>
                          <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: TERRACOTTA, letterSpacing: '0.12em', textTransform: 'uppercase' }}>Причина решения</p>
                          <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{sidePanelApp.rejectionReason}</p>
                        </div>
                      )}
                      {sidePanelApp.candidateMessage && (
                        <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                          <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение кандидату</p>
                          <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«{sidePanelApp.candidateMessage}»</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Collapse: Internal note */}
              <div className="mt-5">
                <button onClick={() => setShowAppNoteCollapse(!showAppNoteCollapse)} className="flex items-center gap-2 w-full text-left py-1 group">
                  <p className="text-[10px] font-semibold tracking-widest" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Внутренняя заметка</p>
                  <ChevronRight className="w-3 h-3 transition-transform" style={{ color: 'var(--text-muted)', transform: showAppNoteCollapse ? 'rotate(90deg)' : 'rotate(0deg)' }} />
                </button>
                <div className={`collapse-content ${showAppNoteCollapse ? 'open' : ''}`}>
                  <div className="pt-3">
                    <textarea
                      className="w-full px-3 py-2 rounded-lg text-xs resize-none overflow-hidden"
                      placeholder="Заметка видна только вам..."
                      value={appNotes[(sidePanelApp.name || '') + (sidePanelApp.waitTime || '')] || ''}
                      onChange={(e) => setAppNotes({ ...appNotes, [(sidePanelApp.name || '') + (sidePanelApp.waitTime || '')]: e.target.value })}
                      style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content', overflow: 'hidden' }}
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{(appNotes[(sidePanelApp.name || '') + (sidePanelApp.waitTime || '')] || '').length} / 300</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky footer: Actions */}
            <div className="sticky bottom-0 px-6 py-4" style={{ backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
              <div className="flex flex-wrap gap-2">
                {sidePanelApp.badge && ['нужен ответ', 'больше суток', 'ответил'].includes(sidePanelApp.badge) && (
                  <>
                    <button onClick={() => setShowApproveModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Одобрить</button>
                    <button onClick={() => setShowClarifyModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Задать уточнение</button>
                    <button onClick={() => setShowRejectModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Не принимать сейчас</button>
                  </>
                )}
                {sidePanelApp.badge && ['на уточнении', 'без ответа'].includes(sidePanelApp.badge) && (
                  <>
                    <button onClick={() => setShowApproveModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Одобрить</button>
                    <button onClick={() => setShowRejectModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Не принимать сейчас</button>
                    <button onClick={() => setShowRemindModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Напомнить мягко</button>
                  </>
                )}
                {sidePanelApp.badge === 'оплата не завершена' && (
                  <>
                    <button onClick={() => setShowPaymentRemindModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Напомнить об оплате</button>
                    <button onClick={() => setShowMonetizationModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Открыть Монетизацию</button>
                  </>
                )}
                {sidePanelApp.badge === 'вошёл в новички' && (
                  <>
                    <button onClick={() => setShowPathPanel(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Посмотреть путь</button>
                    <button onClick={() => setShowSupportModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Подобрать опору</button>
                  </>
                )}
                {sidePanelApp.badge === 'доступ не открылся' && (
                  <>
                    <button onClick={() => setShowOpenAccessModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>Открыть доступ вручную</button>
                    <button onClick={() => setShowCheckPaymentModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Проверить оплату</button>
                    <button onClick={() => setShowMonetizationModal(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Открыть Монетизацию</button>
                  </>
                )}
                {sidePanelApp.badge === 'не принимаем сейчас' && (
                  <>
                    {sidePanelApp.isArchive ? (
                      <>
                        <button onClick={() => setShowReturnModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Вернуть в работу</button>
                        <button className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Предложить новую заявку</button>
                      </>
                    ) : (
                      <button onClick={() => setShowReturnModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Вернуть в работу</button>
                    )}
                  </>
                )}
                {sidePanelApp.badge && ['доступ открыт', 'отменил заявку', 'срок истёк'].includes(sidePanelApp.badge) && (
                  <>
                    {sidePanelApp.badge === 'доступ открыт' && (
                      <button onClick={() => setShowPathPanel(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Посмотреть путь</button>
                    )}
                    {sidePanelApp.badge === 'срок истёк' && (
                      <button onClick={() => setShowReturnModal(true)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Вернуть в работу</button>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== ARCHIVE SIDE PANEL ===== */}
      {archivePanelOpen && (
        <>
          <div className="fixed inset-0 z-40 modal-backdrop" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={() => { setArchivePanelOpen(false); setArchiveDetailApp(null); }} />
          <div className="slide-in-right fixed top-0 right-0 h-full w-[420px] max-w-full z-50 overflow-y-auto" style={{ backgroundColor: 'var(--bg-card)', borderLeft: '1px solid var(--border-color)', boxShadow: '-20px 0 60px rgba(0,0,0,0.12)' }}>
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold heading-accent" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Архив заявок</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>{archiveApplications.length}</span>
                </div>
                <button onClick={() => { setArchivePanelOpen(false); setArchiveDetailApp(null); }} className="p-1 rounded transition-colors" style={{ color: 'var(--text-muted)' }}><X className="w-5 h-5" /></button>
              </div>

              {/* Back to list */}
              {archiveDetailApp && (
                <button onClick={() => setArchiveDetailApp(null)} className="flex items-center gap-1 text-xs mb-4 transition-colors hover:opacity-80" style={{ color: 'var(--gold)' }}>
                  <ChevronRight className="w-3 h-3 rotate-180" /> Назад к архиву
                </button>
              )}

              {archiveDetailApp ? (
                /* ===== ARCHIVE DETAIL VIEW ===== */
                <div className="slide-in-right">
                  {/* Person header */}
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{archiveDetailApp.name.charAt(0)}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{archiveDetailApp.name}</h3>
                        <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-muted)', border: '1px solid var(--border-color)' }}>Архив</span>
                      </div>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{archiveDetailApp.waitTime}</p>
                    </div>
                  </div>

                  {/* Status badge */}
                  {(() => {
                    const colors: Record<string, { bg: string; text: string; border: string }> = {
                      terracotta: { bg: TERRACOTTA_LIGHT, text: TERRACOTTA, border: TERRACOTTA_BORDER },
                      gold: { bg: 'rgba(212,175,55,0.08)', text: 'var(--gold)', border: 'rgba(212,175,55,0.2)' },
                      sage: { bg: SAGE_LIGHT, text: SAGE, border: SAGE_BORDER },
                    };
                    const bc = archiveDetailApp.badgeColor ? (colors[archiveDetailApp.badgeColor] || colors.terracotta) : colors.terracotta;
                    return <span className="text-[11px] px-3 py-1 rounded-full font-medium" style={{ backgroundColor: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>{archiveDetailApp.badge}</span>;
                  })()}

                  {/* Goal */}
                  {archiveDetailApp.goal && (
                    <div className="mt-5">
                      <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Цель</p>
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{archiveDetailApp.goal}</p>
                    </div>
                  )}

                  {/* Answer */}
                  {archiveDetailApp.answer && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Ответ на вопрос</p>
                      <p className="text-sm italic leading-relaxed" style={{ color: 'var(--text-secondary)' }}>«{archiveDetailApp.answer}»</p>
                    </div>
                  )}

                  {/* Timeline */}
                  {archiveDetailApp.timeline && (
                    <div className="mt-4">
                      <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что произошло</p>
                      <div className="space-y-1.5">
                        {archiveDetailApp.timeline.map((step: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: idx === archiveDetailApp.timeline.length - 1 ? 'var(--gold)' : SAGE }} />
                            <p className="text-xs" style={{ color: idx === archiveDetailApp.timeline.length - 1 ? 'var(--text-primary)' : 'var(--text-secondary)' }}>{step}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Next step */}
                  {archiveDetailApp.nextStep && (
                    <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                      <p className="text-[10px] font-semibold tracking-widest mb-1" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что дальше</p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{archiveDetailApp.nextStep}</p>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="my-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2">
                    {archiveDetailApp.badge === 'доступ открыт' && (
                      <>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Посмотреть профиль</button>
                        <button className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Предложить новую заявку</button>
                      </>
                    )}
                    {archiveDetailApp.badge === 'не принимаем сейчас' && (
                      <>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--gold)', color: '#fff' }}>Посмотреть решение</button>
                        <button className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Предложить новую заявку</button>
                      </>
                    )}
                    {archiveDetailApp.badge === 'отменил заявку' && (
                      <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Посмотреть профиль</button>
                    )}
                    {archiveDetailApp.badge === 'срок истёк' && (
                      <>
                        <button className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Посмотреть профиль</button>
                        <button className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Предложить новую заявку</button>
                      </>
                    )}
                    <button onClick={() => setArchiveDetailApp(null)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-muted)' }}>Назад</button>
                  </div>
                </div>
              ) : (
                /* ===== ARCHIVE LIST VIEW ===== */
                <div className="slide-in-right space-y-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                    <input
                      type="text"
                      placeholder="Поиск по имени, цели или тексту..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-lg text-sm"
                      value={archiveSearch}
                      onChange={(e) => setArchiveSearch(e.target.value)}
                      style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }}
                    />
                  </div>

                  {/* Period filters */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: '6m', label: '6 мес' },
                      { key: '1y', label: '12 мес' },
                      { key: 'all', label: 'Всё время' },
                    ].map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setArchivePeriod(p.key as any)}
                        className="text-xs px-3 py-1 rounded-full transition-all duration-200"
                        style={{
                          border: `1px solid ${archivePeriod === p.key ? 'var(--gold)' : 'var(--border-color)'}`,
                          color: archivePeriod === p.key ? 'var(--gold)' : 'var(--text-muted)',
                          backgroundColor: archivePeriod === p.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                        }}
                      >{p.label}</button>
                    ))}
                  </div>

                  {/* Status filters */}
                  <div className="flex gap-2 flex-wrap">
                    {[
                      { key: 'all', label: 'Все статусы' },
                      { key: 'доступ открыт', label: 'Доступ открыт' },
                      { key: 'не принимаем сейчас', label: 'Не принимаем' },
                      { key: 'отменил заявку', label: 'Отменил заявку' },
                      { key: 'срок истёк', label: 'Срок истёк' },
                    ].map((s) => (
                      <button
                        key={s.key}
                        onClick={() => setArchiveStatusFilter(s.key)}
                        className="text-xs px-3 py-1 rounded-full transition-all duration-200"
                        style={{
                          border: `1px solid ${archiveStatusFilter === s.key ? 'var(--gold)' : 'var(--border-color)'}`,
                          color: archiveStatusFilter === s.key ? 'var(--gold)' : 'var(--text-muted)',
                          backgroundColor: archiveStatusFilter === s.key ? 'rgba(212,175,55,0.08)' : 'transparent',
                        }}
                      >{s.label}</button>
                    ))}
                  </div>

                  <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>В обычной истории показываем последние 90 дней. Более старые заявки можно найти здесь.</p>

                  {/* Results */}
                  {(() => {
                    let results = archiveApplications;
                    if (archiveStatusFilter !== 'all') {
                      results = results.filter((a) => a.badge === archiveStatusFilter);
                    }
                    if (archiveSearch.trim()) {
                      const q = archiveSearch.toLowerCase();
                      results = results.filter((a) =>
                        a.name.toLowerCase().includes(q) ||
                        (a.goal && a.goal.toLowerCase().includes(q)) ||
                        (a.answer && a.answer.toLowerCase().includes(q))
                      );
                    }
                    if (results.length === 0) {
                      return (
                        <div className="text-center py-10">
                          <Search className="w-8 h-8 mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
                          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Ничего не нашли</p>
                          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Попробуйте изменить фильтры или поискать по другим словам.</p>
                        </div>
                      );
                    }
                    return (
                      <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border-color)' }}>
                        {results.map((app, i) => {
                          const badgeColors: Record<string, { bg: string; text: string; border: string }> = {
                            terracotta: { bg: TERRACOTTA_LIGHT, text: TERRACOTTA, border: TERRACOTTA_BORDER },
                            gold: { bg: 'rgba(212,175,55,0.08)', text: 'var(--gold)', border: 'rgba(212,175,55,0.2)' },
                            sage: { bg: SAGE_LIGHT, text: SAGE, border: SAGE_BORDER },
                          };
                          const bc = badgeColors[app.badgeColor || ''] || badgeColors.terracotta;
                          return (
                            <button
                              key={i}
                              onClick={() => setArchiveDetailApp(app)}
                              className="w-full flex items-center gap-4 px-5 py-4 text-left transition-all duration-200"
                              style={{ backgroundColor: 'var(--bg-card)', borderBottom: i < results.length - 1 ? '1px solid var(--border-color)' : 'none' }}
                              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--hover-bg)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'var(--bg-card)'; }}
                            >
                              <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>{app.name.charAt(0)}</div>
                              <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>{app.name}</h3>
                                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{app.waitTime}</p>
                              </div>
                              <span className="text-[11px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ backgroundColor: bc.bg, color: bc.text, border: `1px solid ${bc.border}` }}>{app.badge}</span>
                              <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--text-muted)' }} />
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          </div>
        </>
      )}

      {/* ===== APP MESSAGE TEMPLATES MODAL ===== */}
      {showAppMessageModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowDiscardConfirm(true)}>
          <div className="modal-enter rounded-2xl max-w-2xl w-full max-h-[90vh] relative overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between p-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h2 className="text-xl font-bold heading-accent mb-1" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Сообщения по заявке</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Настройте стандартные сообщения для решений по заявке. Перед отправкой конкретному кандидату текст можно будет изменить.</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Изменения применятся только к новым сообщениям. Уже отправленные сообщения не изменятся.</p>
              </div>
              <button onClick={() => setShowDiscardConfirm(true)} className="p-1 rounded transition-colors shrink-0 ml-4" style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="shrink-0 flex gap-1 px-6 pt-4 pb-0">
              {([
                { key: 'approve' as const, label: 'Одобрение' },
                { key: 'clarify' as const, label: 'Уточнение' },
                { key: 'reject' as const, label: 'Не принимаем сейчас' },
              ]).map((t) => (
                <button
                  key={t.key}
                  onClick={() => setAppMsgTab(t.key)}
                  className="px-4 py-2 text-sm font-medium transition-all duration-200 rounded-t-lg"
                  style={{
                    color: appMsgTab === t.key ? 'var(--gold)' : 'var(--text-muted)',
                    borderBottom: appMsgTab === t.key ? '2px solid var(--gold)' : '2px solid transparent',
                  }}
                >{t.label}</button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {/* ===== TAB: APPROVE ===== */}
              {appMsgTab === 'approve' && (
                <div className="space-y-5">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Это сообщение получит кандидат после одобрения заявки. Следующий шаг система подставит автоматически с учётом режима входа: открыть доступ, перейти к оплате или дождаться ручного подтверждения.</p>
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заголовок сообщения</label>
                    <input type="text" maxLength={120} value={appMsgApproveTitle} onChange={(e) => setAppMsgApproveTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm mb-1" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                    <TitleCounter count={appMsgApproveTitle.length} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение</label>
                    <textarea maxLength={1000} value={appMsgApproveBody} onChange={(e) => setAppMsgApproveBody(e.target.value)} className="w-full px-3 py-3 rounded-xl text-sm resize-none leading-relaxed" rows={8} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content' }} />
                    <div className="mt-1"><MessageCounter count={appMsgApproveBody.length} /></div>
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Переменные в сообщении</p>
                    <div className="space-y-1.5">
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><code className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--gold)' }}>{'{Имя}'}</code> — имя кандидата</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><code className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--gold)' }}>{'{Сообщество}'}</code> — название сообщества</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><code className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--gold)' }}>{'{Следующий шаг}'}</code> — автоматически зависит от условий входа</p>
                    </div>
                    <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                      <p className="text-[11px] font-semibold mb-2" style={{ color: 'var(--text-muted)' }}>Как система подставит следующий шаг</p>
                      <div className="space-y-2">
                        <div><p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>Бесплатный вход</p><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Доступ уже открыт — можно войти в сообщество.</p></div>
                        <div><p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>Платный вход</p><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Чтобы войти в сообщество, завершите оплату. После подтверждения платежа доступ откроется автоматически.</p></div>
                        <div><p className="text-[11px] font-medium" style={{ color: 'var(--text-primary)' }}>Ручное открытие доступа</p><p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Заявка одобрена. Мы сообщим, когда доступ будет открыт.</p></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB: CLARIFY ===== */}
              {appMsgTab === 'clarify' && (
                <div className="space-y-5">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Это сообщение получит кандидат, когда для решения не хватает информации. Сам уточняющий вопрос лидер добавит при рассмотрении заявки.</p>
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заголовок сообщения</label>
                    <input type="text" maxLength={120} value={appMsgClarifyTitle} onChange={(e) => setAppMsgClarifyTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm mb-1" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                    <TitleCounter count={appMsgClarifyTitle.length} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение</label>
                    <textarea maxLength={1000} value={appMsgClarifyBody} onChange={(e) => setAppMsgClarifyBody(e.target.value)} className="w-full px-3 py-3 rounded-xl text-sm resize-none leading-relaxed" rows={8} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content' }} />
                    <div className="mt-1"><MessageCounter count={appMsgClarifyBody.length} /></div>
                  </div>
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                    <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Переменные в сообщении</p>
                    <div className="space-y-1.5">
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><code className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--gold)' }}>{'{Имя}'}</code> — имя кандидата</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><code className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--gold)' }}>{'{Сообщество}'}</code> — название сообщества</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}><code className="text-[11px] px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--bg-card)', color: 'var(--gold)' }}>{'{Уточняющий вопрос}'}</code> — вопрос, который лидер добавит перед отправкой</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ===== TAB: REJECT ===== */}
              {appMsgTab === 'reject' && (
                <div className="space-y-5">
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Это сообщение получит кандидат, если доступ пока не открывается. Причина для команды хранится отдельно и кандидату не показывается автоматически.</p>
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заголовок сообщения</label>
                    <input type="text" maxLength={120} value={appMsgRejectTitle} onChange={(e) => setAppMsgRejectTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm mb-1" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                    <TitleCounter count={appMsgRejectTitle.length} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение</label>
                    <textarea maxLength={1000} value={appMsgRejectBody} onChange={(e) => setAppMsgRejectBody(e.target.value)} className="w-full px-3 py-3 rounded-xl text-sm resize-none leading-relaxed" rows={8} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content' }} />
                    <div className="mt-1"><MessageCounter count={appMsgRejectBody.length} /></div>
                  </div>
                  <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={appMsgAllowReapply} onChange={(e) => setAppMsgAllowReapply(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Оставить возможность подать новую заявку</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Кандидат увидит, что решение не окончательное и сможет вернуться с другим запросом.</p>
                      </div>
                    </label>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" checked={appMsgAddLink} onChange={(e) => setAppMsgAddLink(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Добавить ссылку на описание формата сообщества</p>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Поможет человеку лучше понять, какие виды поддержки доступны внутри.</p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* ===== PREVIEW (all tabs) ===== */}
              <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-color)' }}>
                <p className="text-[10px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Как кандидат увидит сообщение</p>
                <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                  {appMsgTab === 'approve' && (
                    <>
                      <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{appMsgApproveTitle}</p>
                      <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)' }}>
                        <p>Алексей, привет!</p>
                        <p>Ваша заявка в «IT Технологии» одобрена.</p>
                        <p>Чтобы войти в сообщество, завершите оплату. После подтверждения платежа доступ откроется автоматически.</p>
                        <p>После входа вы появитесь в разделе для новичков. Там будет видно, с чего начать и где можно получить первый живой отклик.</p>
                      </div>
                    </>
                  )}
                  {appMsgTab === 'clarify' && (
                    <>
                      <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{appMsgClarifyTitle}</p>
                      <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)' }}>
                        <p>Алексей, привет!</p>
                        <p>Спасибо за заявку в «IT Технологии». Хочу чуть лучше понять ваш запрос, чтобы честно подсказать, подойдёт ли вам формат сообщества.</p>
                        <p><span style={{ color: 'var(--gold)' }}>Расскажите подробнее о вашем текущем опыте с Docker и CI/CD — что уже пробовали и что хотели бы освоить первым?</span></p>
                        <p>Можно ответить своими словами — после ответа заявка снова появится у команды на рассмотрении.</p>
                      </div>
                    </>
                  )}
                  {appMsgTab === 'reject' && (
                    <>
                      <p className="text-sm font-bold mb-3" style={{ color: 'var(--text-primary)' }}>{appMsgRejectTitle.replace('{Сообщество}', 'IT Технологии')}</p>
                      <div className="text-sm leading-relaxed space-y-2" style={{ color: 'var(--text-secondary)' }}>
                        <p>Алексей, спасибо за заявку.</p>
                        <p>Сейчас формат сообщества может не полностью совпасть с вашим запросом, поэтому мы пока не открываем доступ.</p>
                        {appMsgAllowReapply && <p>Если ваш запрос изменится, вы сможете подать новую заявку позже.</p>}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 flex flex-wrap items-center gap-3 p-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => { setShowAppMessageModal(false); showToast('Сообщения по заявке обновлены. Изменения применятся к новым отправлениям.', 'success'); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Сохранить сообщения</button>
              <button onClick={() => setShowRestoreConfirm(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Восстановить исходные тексты</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== RESTORE CONFIRM MODAL ===== */}
      {showRestoreConfirm && (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowRestoreConfirm(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full p-6 relative" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Восстановить исходные тексты?</h3>
            <p className="text-sm mb-1" style={{ color: 'var(--text-secondary)' }}>Все изменения в шаблонах одобрения, уточнения и решения «Не принимаем сейчас» будут заменены исходными текстами.</p>
            <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>Уже отправленные сообщения не изменятся.</p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={() => setShowRestoreConfirm(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к настройке</button>
              <button onClick={() => {
                setAppMsgApproveTitle('Заявка одобрена: следующий шаг');
                setAppMsgApproveBody('{Имя}, привет!\n\nВаша заявка в «{Сообщество}» одобрена.\n\n{Следующий шаг}\n\nПосле входа вы появитесь в разделе для новичков. Там будет видно, с чего начать и где можно получить первый живой отклик.');
                setAppMsgClarifyTitle('Нужно уточнить вашу заявку');
                setAppMsgClarifyBody('{Имя}, привет!\n\nСпасибо за заявку в «{Сообщество}». Хочу чуть лучше понять ваш запрос, чтобы честно подсказать, подойдёт ли вам формат сообщества.\n\n{Уточняющий вопрос}\n\nМожно ответить своими словами — после ответа заявка снова появится у команды на рассмотрении.');
                setAppMsgRejectTitle('По вашей заявке в «{Сообщество}»');
                setAppMsgRejectBody('{Имя}, спасибо за заявку.\n\nСейчас формат сообщества может не полностью совпасть с вашим запросом, поэтому мы пока не открываем доступ.\n\nЕсли ваш запрос изменится, вы сможете подать новую заявку позже.');
                setAppMsgAllowReapply(true);
                setAppMsgAddLink(false);
                setShowRestoreConfirm(false);
                showToast('Исходные тексты восстановлены.', 'success');
              }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>Восстановить тексты</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FIRST 7 DAYS MODAL ===== */}
      {showFirst7DaysModal && (
        <div className="modal-backdrop fixed inset-0 z-[60] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setShowF7DiscardConfirm(true)}>
          <div className="modal-enter rounded-2xl max-w-2xl w-full max-h-[90vh] relative overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between p-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h2 className="text-xl font-bold heading-accent mb-1" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Первые 7 дней</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Настройте базовый сценарий входа новичка: какой первый шаг предлагать по умолчанию, как уточнять цель и какой первый отклик подготавливать для лидера.</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Эти настройки помогают не оставлять новичка без ориентира, но не отправляют сообщения автоматически. Перед отправкой лидер сможет отредактировать текст в карточке конкретного новичка.</p>
              </div>
              <button onClick={() => setShowF7DiscardConfirm(true)} className="p-1 rounded transition-colors shrink-0 ml-4" style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
              {/* Starter material */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer mb-3">
                  <input type="checkbox" checked={f7SuggestGuide} onChange={(e) => setF7SuggestGuide(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Предлагать стартовый материал, если персональный первый шаг ещё не выбран</p>
                </label>
                {f7SuggestGuide && (
                  <div className="ml-7">
                    <div className="rounded-lg p-4 mb-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                      <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Стартовый материал по умолчанию</p>
                      {(() => {
                        const materials: Record<MaterialId, { title: string; desc: string; type: string; duration: string; audience: string }> = {
                          guide_community: { title: 'Стартовый гайд по сообществу', desc: 'Как всё устроено, где задавать вопросы, где искать материалы и как получить первый живой отклик.', type: 'гайд', duration: '10–15 минут', audience: 'подходит всем новичкам' },
                          guide_backend: { title: 'Гайд: первый backend pet-проект', desc: 'Как выбрать идею, настроить окружение и собрать первый небольшой API.', type: 'гайд', duration: '30–40 минут', audience: 'лучше подходит backend-новичкам' },
                          guide_frontend: { title: 'Гайд: первый frontend pet-проект', desc: 'Как выбрать простую идею, собрать первый экран и подготовить проект к разбору.', type: 'гайд', duration: '30–40 минут', audience: 'лучше подходит frontend-новичкам' },
                          guide_first_question: { title: 'Как задать первый вопрос', desc: 'Короткая инструкция: как описать задачу, показать контекст и получить полезный ответ от сообщества.', type: 'инструкция', duration: '5–7 минут', audience: 'подходит большинству новичков' },
                        };
                        const m = materials[f7MaterialId];
                        return (
                          <>
                            <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{m.title}</p>
                            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>{m.desc}</p>
                            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Тип: {m.type} · {m.duration} · {m.audience}</p>
                          </>
                        );
                      })()}
                    </div>
                    <button onClick={() => setShowPickMaterialModal(true)} className="text-[11px] px-3 py-1.5 rounded-lg transition-all duration-200 hover:opacity-80 mb-2" style={{ color: 'var(--gold)', border: '1px solid var(--gold)' }}>Выбрать другой материал</button>
                    <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>Этот материал будет предлагаться новым новичкам, если персональный первый шаг ещё не выбран.</p>
                    <p className="text-[11px] mb-3 font-medium" style={{ color: 'var(--gold)' }}>Материал выбран. Не забудьте сохранить настройки.</p>
                    <div className="space-y-2">
                      <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Когда показывать сигнал лидеру</p>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={f7SignalDay3} onChange={(e) => setF7SignalDay3(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Если к 3-му дню персональный первый шаг не выбран</p>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={f7SignalNoAction} onChange={(e) => setF7SignalNoAction(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Если новичок открыл стартовый материал, но не сделал ни одного действия</p>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input type="checkbox" checked={f7SignalNoVisit} onChange={(e) => setF7SignalNoVisit(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Если новичок не заходил в сообщество больше суток после открытия доступа</p>
                      </label>
                    </div>
                  </div>
                )}
              </div>

              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />

              {/* Goal help */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={f7HelpGoal} onChange={(e) => setF7HelpGoal(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Помогать новичку уточнить цель</p>
                </label>
                {f7HelpGoal && (
                  <div className="ml-7 mt-3 space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заголовок сообщения</label>
                    <input type="text" maxLength={120} value={f7GoalTitle} onChange={(e) => setF7GoalTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm mb-1" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                    <TitleCounter count={f7GoalTitle.length} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение новичку</label>
                    <textarea maxLength={1000} value={f7GoalBody} onChange={(e) => setF7GoalBody(e.target.value)} className="w-full px-3 py-3 rounded-xl text-sm resize-none leading-relaxed" rows={6} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content' }} />
                    <div className="mt-1"><MessageCounter count={f7GoalBody.length} /></div>
                  </div>
                  <div>
                    <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Варианты цели</p>
                    <div className="space-y-2">
                      {[
                        { key: 'f7GoalProject', label: 'Собрать первый pet-проект', state: f7GoalProject, setter: setF7GoalProject },
                        { key: 'f7GoalReview', label: 'Получить разбор проекта или кода', state: f7GoalReview, setter: setF7GoalReview },
                        { key: 'f7GoalTool', label: 'Освоить конкретный инструмент', state: f7GoalTool, setter: setF7GoalTool },
                        { key: 'f7GoalInterview', label: 'Подготовиться к собеседованию', state: f7GoalInterview, setter: setF7GoalInterview },
                      ].map((opt) => (
                        <label key={opt.key} className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" checked={opt.state} onChange={(e) => opt.setter(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{opt.label}</p>
                        </label>
                      ))}
                      <div>
                        <label className="flex items-start gap-2 cursor-pointer">
                          <input type="checkbox" checked={f7GoalOther} onChange={(e) => setF7GoalOther(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Другая цель — написать своими словами</p>
                        </label>
                        {f7GoalOther && (
                          <div className="mt-3 ml-6">
                            <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Название варианта цели</label>
                            <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)' }}>Напишите вариант, который новичок сможет выбрать при уточнении цели.</p>
                            <input type="text" maxLength={120} value={f7GoalOtherLabel} onChange={(e) => setF7GoalOtherLabel(e.target.value)} placeholder="Например: Понять, куда двигаться дальше" className="w-full px-3 py-2.5 rounded-lg text-sm mb-1" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                            <TitleCounter count={f7GoalOtherLabel.length} />
                            <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Этот вариант появится рядом с готовыми целями. Новичок сможет выбрать его или написать цель своими словами.</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                )}
              </div>

              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />

              {/* First response draft */}
              <div>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input type="checkbox" checked={f7PrepareDraft} onChange={(e) => setF7PrepareDraft(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Подготавливать черновик первого отклика для новичка</p>
                </label>
                {f7PrepareDraft && (
                  <div className="ml-7 mt-3 space-y-4">
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Заголовок сообщения</label>
                    <input type="text" maxLength={120} value={f7DraftTitle} onChange={(e) => setF7DraftTitle(e.target.value)} className="w-full px-3 py-2.5 rounded-lg text-sm mb-1" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none' }} />
                    <TitleCounter count={f7DraftTitle.length} />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold tracking-widest block mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сообщение новичку</label>
                    <textarea maxLength={1000} value={f7DraftBody} onChange={(e) => setF7DraftBody(e.target.value)} className="w-full px-3 py-3 rounded-xl text-sm resize-none leading-relaxed" rows={6} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', outline: 'none', fieldSizing: 'content' }} />
                    <div className="mt-1"><MessageCounter count={f7DraftBody.length} /></div>
                  </div>
                </div>
                )}
              </div>

              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />

              {/* Signals */}
              <div>
                <p className="text-[11px] font-semibold tracking-widest mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Сигналы первых дней</p>
                <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>Показывать в разделе «Новички», если:</p>
                <div className="space-y-2">
                  {[
                    { key: 'f7SigNoConnection', label: 'Первой связи нет больше 24 часов', state: f7SigNoConnection, setter: setF7SigNoConnection },
                    { key: 'f7SigNoAnswer', label: 'Первый вопрос остаётся без ответа', state: f7SigNoAnswer, setter: setF7SigNoAnswer },
                    { key: 'f7SigDraftUnsent', label: 'Есть сохранённый черновик, но сообщение не отправлено', state: f7SigDraftUnsent, setter: setF7SigDraftUnsent },
                    { key: 'f7SigNoStepDay3', label: 'К 3-му дню не выбран первый шаг', state: f7SigNoStepDay3, setter: setF7SigNoStepDay3 },
                    { key: 'f7SigNoGoalDay5', label: 'К 5-му дню цель не указана или слишком общая', state: f7SigNoGoalDay5, setter: setF7SigNoGoalDay5 },
                    { key: 'f7SigSupportUnconfirmed', label: 'Опора предложена, но не подтверждена больше суток', state: f7SigSupportUnconfirmed, setter: setF7SigSupportUnconfirmed },
                  ].map((sig) => (
                    <label key={sig.key} className="flex items-start gap-2 cursor-pointer">
                      <input type="checkbox" checked={sig.state} onChange={(e) => sig.setter(e.target.checked)} className="w-4 h-4 rounded accent-gold mt-0.5" />
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{sig.label}</p>
                    </label>
                  ))}
                </div>
              </div>

              <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--border-color), transparent)' }} />

              {/* What changes */}
              <div className="rounded-lg p-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что изменится</p>
                <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex gap-2"><span>—</span><span>Новые карточки новичков будут получать стартовый материал, если персональный шаг ещё не выбран</span></li>
                  <li className="flex gap-2"><span>—</span><span>При отсутствии цели система предложит сценарий уточнения</span></li>
                  <li className="flex gap-2"><span>—</span><span>Для первого отклика будет готовиться черновик</span></li>
                  <li className="flex gap-2"><span>—</span><span>Сигналы первых дней будут попадать в соответствующие срезы раздела «Новички»</span></li>
                  <li className="flex gap-2"><span>—</span><span>Уже отправленные сообщения и завершённые действия не изменятся</span></li>
                </ul>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 flex flex-wrap items-center gap-3 p-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => { setShowFirst7DaysModal(false); showToast('Настройки первых 7 дней сохранены.', 'success'); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Сохранить настройки</button>
              <button onClick={() => setShowF7RestoreConfirm(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Восстановить исходные настройки</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FIRST 7 DAYS: RESTORE CONFIRM ===== */}
      {showF7RestoreConfirm && (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowF7RestoreConfirm(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full p-6 relative" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Восстановить исходные настройки?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Все изменения в настройках первых 7 дней будут заменены исходными значениями. Уже отправленные сообщения и завершённые действия не изменятся.</p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={() => setShowF7RestoreConfirm(false)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к настройке</button>
              <button onClick={() => {
                setF7SuggestGuide(true); setF7SignalDay3(true); setF7SignalNoAction(true); setF7SignalNoVisit(false);
                setF7HelpGoal(true); setF7GoalTitle('Давай уточним твою цель на старт');
                setF7GoalBody('{Имя}, привет! Чтобы мы помогли точнее, напиши, пожалуйста, какой результат для тебя сейчас важнее всего.\n\nМожно выбрать готовый вариант или ответить своими словами. После этого будет проще подобрать первый шаг, встречу, разбор или человека рядом.');
                setF7GoalProject(true); setF7GoalReview(true); setF7GoalTool(true); setF7GoalInterview(true); setF7GoalOther(true);
                setF7PrepareDraft(true); setF7DraftTitle('{Имя}, давай спокойно начнём с первого шага');
                setF7DraftBody('{Имя}, привет! Рады, что ты с нами.\n\nВижу, что тебе важно: {Цель}. Чтобы не перегружаться в первые дни, лучше начать с одного понятного действия: {Первый шаг}.\n\nЕсли появится вопрос, можно написать в сообщество — рядом будут участники и команда, которые помогут сориентироваться.');
                setF7SigNoConnection(true); setF7SigNoAnswer(true); setF7SigDraftUnsent(true); setF7SigNoStepDay3(true); setF7SigNoGoalDay5(true); setF7SigSupportUnconfirmed(true);
                setShowF7RestoreConfirm(false);
                showToast('Исходные настройки первых 7 дней восстановлены.', 'success');
              }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: TERRACOTTA, color: '#fff' }}>Восстановить настройки</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PICK MATERIAL MODAL ===== */}
      {showPickMaterialModal && (
        <div className="modal-backdrop fixed inset-0 z-[65] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.35)' }} onClick={() => setPickMatDiscardConfirm(true)}>
          <div className="modal-enter rounded-2xl max-w-lg w-full max-h-[90vh] relative overflow-hidden flex flex-col" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="shrink-0 flex items-start justify-between p-6 pb-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div>
                <h2 className="text-xl font-bold heading-accent mb-1" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Выбрать другой материал</h2>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Выберите материал, который будет предлагаться новичкам как стартовый первый шаг, если персональный шаг ещё не выбран.</p>
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>Материал должен быть коротким, понятным и безопасным для старта: без перегруза, сложных условий и обязательного участия в разборе.</p>
              </div>
              <button onClick={() => setPickMatDiscardConfirm(true)} className="p-1 rounded transition-colors shrink-0 ml-4" style={{ color: 'var(--text-muted)' }}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Current material */}
              <div>
                <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Текущий материал</p>
                <div className="rounded-lg p-3" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                {(() => {
                  const current = {
                    guide_community: { title: 'Стартовый гайд по сообществу', desc: 'Помогает понять, как устроено сообщество, где задавать вопросы, где искать материалы и с чего начать.' },
                    guide_backend: { title: 'Гайд: первый backend pet-проект', desc: 'Как выбрать идею, настроить окружение и собрать первый небольшой API.' },
                    guide_frontend: { title: 'Гайд: первый frontend pet-проект', desc: 'Как выбрать простую идею, собрать первый экран и подготовить проект к разбору.' },
                    guide_first_question: { title: 'Как задать первый вопрос', desc: 'Короткая инструкция о том, как описать задачу, показать контекст и получить полезный ответ.' },
                  }[f7MaterialId];
                  return <><p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{current.title}</p><p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{current.desc}</p></>;
                })()}
              </div>
                </div>
              </div>

              {/* Material options */}
              <div className="space-y-3">
              <p className="text-[10px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Доступные материалы</p>
              {[
                { id: 'guide_community' as MaterialId, title: 'Стартовый гайд по сообществу', desc: 'Как всё устроено, где задавать вопросы, где искать материалы и как получить первый живой отклик.', type: 'гайд', duration: '10–15 минут', audience: 'Подходит всем новичкам', universal: true },
                { id: 'guide_backend' as MaterialId, title: 'Гайд: первый backend pet-проект', desc: 'Как выбрать идею, настроить окружение и собрать первый небольшой API.', type: 'гайд', duration: '30–40 минут', audience: 'Подходит новичкам с технической целью', universal: false },
                { id: 'guide_frontend' as MaterialId, title: 'Гайд: первый frontend pet-проект', desc: 'Как выбрать простую идею, собрать первый экран и подготовить проект к разбору.', type: 'гайд', duration: '30–40 минут', audience: 'Подходит новичкам, которые хотят развиваться во frontend', universal: false },
                { id: 'guide_first_question' as MaterialId, title: 'Как задать первый вопрос', desc: 'Короткий материал о том, как описать задачу, показать контекст и получить полезный ответ от сообщества.', type: 'инструкция', duration: '5–7 минут', audience: 'Подходит новичкам без понятного первого шага', universal: true },
              ].map((mat) => (
                <label key={mat.id} className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${pickMatSelected === mat.id ? 'ring-1' : ''}`} style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)', ...(pickMatSelected === mat.id ? { ringColor: 'var(--gold)' } : {}) }}>
                  <input type="radio" name="starterMaterial" checked={pickMatSelected === mat.id} onChange={() => setPickMatSelected(mat.id)} className="w-4 h-4 accent-gold mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>{mat.title}</p>
                    <p className="text-xs mb-1.5" style={{ color: 'var(--text-secondary)' }}>{mat.desc}</p>
                    <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Тип: {mat.type} · {mat.duration} · {mat.audience}</p>
                    {!mat.universal && pickMatSelected === mat.id && (
                      <div className="mt-2 rounded-lg p-3" style={{ backgroundColor: 'rgba(192,119,87,0.08)', border: '1px solid rgba(192,119,87,0.3)' }}>
                        <p className="text-xs font-medium mb-1" style={{ color: TERRACOTTA }}>Этот материал подходит не всем новичкам</p>
                        <p className="text-[11px]" style={{ color: 'var(--text-secondary)' }}>Гайд связан с {mat.id === 'guide_backend' ? 'backend' : 'frontend'}-разработкой. Если в сообщество приходят участники с разными целями, лучше оставить универсальный стартовый гайд, а {mat.id === 'guide_backend' ? 'backend' : 'frontend'}-гайд назначать персонально.</p>
                      </div>
                    )}
                  </div>
                </label>
              ))}

              {/* What changes */}
              <div className="rounded-lg p-4 mt-4" style={{ backgroundColor: 'var(--hover-bg)', border: '1px solid var(--border-color)' }}>
                <p className="text-[11px] font-semibold tracking-widest mb-2" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Что изменится</p>
                <ul className="space-y-1.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                  <li className="flex gap-2"><span>—</span><span>Выбранный материал станет базовым первым шагом для новых новичков</span></li>
                  <li className="flex gap-2"><span>—</span><span>Он будет подставляться только там, где персональный первый шаг ещё не выбран</span></li>
                  <li className="flex gap-2"><span>—</span><span>Уже назначенные первые шаги у текущих новичков не изменятся</span></li>
                  <li className="flex gap-2"><span>—</span><span>Лидер всё равно сможет выбрать другой шаг в карточке конкретного новичка</span></li>
                </ul>
              </div>
            </div>

            {/* Sticky footer */}
            <div className="shrink-0 flex flex-wrap items-center gap-3 p-6 pt-4" style={{ borderTop: '1px solid var(--border-color)' }}>
              <button onClick={() => { setF7MaterialId(pickMatSelected); setShowPickMaterialModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: SAGE, color: '#fff' }}>Выбрать материал</button>
              <button onClick={() => setPickMatDiscardConfirm(true)} className="px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:opacity-80" style={{ color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>Вернуться к настройкам</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PICK MATERIAL: DISCARD CONFIRM ===== */}
      {pickMatDiscardConfirm && (
        <div className="modal-backdrop fixed inset-0 z-[75] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setPickMatDiscardConfirm(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full p-6 relative" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Выйти без сохранения?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Выбранный материал не станет базовым первым шагом.</p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={() => setPickMatDiscardConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Продолжить выбор</button>
              <button onClick={() => { setPickMatDiscardConfirm(false); setShowPickMaterialModal(false); setPickMatSelected(f7MaterialId); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ color: TERRACOTTA }}>Выйти без сохранения</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== FIRST 7 DAYS: DISCARD CONFIRM ===== */}
      {showF7DiscardConfirm && (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowF7DiscardConfirm(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full p-6 relative" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Закрыть без сохранения?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Изменения в настройках первых 7 дней не сохранятся.</p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={() => setShowF7DiscardConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Продолжить редактирование</button>
              <button onClick={() => { setShowF7DiscardConfirm(false); setShowFirst7DaysModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ color: TERRACOTTA }}>Закрыть без сохранения</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== DISCARD CONFIRM MODAL ===== */}
      {showDiscardConfirm && (
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }} onClick={() => setShowDiscardConfirm(false)}>
          <div className="modal-enter rounded-2xl max-w-md w-full p-6 relative" style={{ backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow-hover)' }} onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: 'var(--text-primary)' }}>Выйти без сохранения?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--text-secondary)' }}>Изменения в сообщениях будут потеряны.</p>
            <div className="flex flex-wrap gap-2 justify-end">
              <button onClick={() => setShowDiscardConfirm(false)} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ backgroundColor: 'var(--hover-bg)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' }}>Остаться</button>
              <button onClick={() => { setShowDiscardConfirm(false); setShowAppMessageModal(false); }} className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-90" style={{ color: TERRACOTTA }}>Выйти без сохранения</button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
