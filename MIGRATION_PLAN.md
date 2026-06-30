# План переноса дизайна `mcfe` → `mentori-club`

> Цель: перенести премиальный дизайн и уникальную фичу графа связей (social-fabric)
> из дизайн-мокапа `mcfe` (Vite SPA) в продакшен-фронт `mentori-club` (`apps/web`, Next.js),
> сохранив весь существующий бэкенд и инфраструктуру.

## Итоговое архитектурное решение

| Слой | Решение | Откуда |
|---|---|---|
| Framework / рендеринг | **Next.js 16 (App Router)** — оставляем | `mentori-club` |
| UI-компоненты | **shadcn/ui + Radix** — берём | `mcfe` |
| Дизайн-токены (gold/terracotta/sage) | берём, переписываем под Tailwind v4 | `mcfe` |
| Граф связей (social-fabric) | берём как новую фичу | `mcfe` |
| Формы | react-hook-form + zod | `mcfe` |
| Server state | TanStack Query | `mcfe` |
| Бэкенд / данные / API | **оставляем как есть** | `mentori-club` |
| Vite / react-router | ❌ выбрасываем | — |
| `lib/api` и `lib/mocks` из `mcfe` | ❌ НЕ переносим (бэкенд реальный) | — |

**Принцип:** framework и данные — от `mentori-club`, внешний вид и граф — от `mcfe`.
Это возможно, потому что shadcn — это просто `.tsx`-файлы, а не привязка к Vite.

## Почему Next.js, а не Vite SPA (премиальность + масштаб)

- **Премиальность:** Next отдаёт готовый HTML (SSR/SSG) → мгновенная отдача,
  нет белого экрана; OG-превью для ссылок на сообщества из коробки.
- **Масштаб:** публичные страницы сообществ генерируются как статика (SSG/ISR),
  кешируются на edge CDN → бэкенд не перегружается на росте трафика.
- **Клиент-сервер:** гибридный рендеринг по типу страницы (см. ниже).

### Модель рендеринга по типам страниц
| Тип | Рендеринг | Почему |
|---|---|---|
| Лендинг / публичные страницы сообществ | SSG + ISR | SEO, OG, отдача с CDN |
| Дашборд / личный кабинет (за auth) | SSR + Client | свежие данные, SEO не нужен |
| Граф связей, фиды, формы | Client + TanStack Query | живые данные, кеш, optimistic |
| Картинки/аватары | next/image | автооптимизация |

### Раздача по CDN
- `_next/static/**` (JS/CSS/шрифты/иконки) — хешированные имена, immutable-кеш на CDN.
- SSG/ISR-страницы — кешируются на edge.
- SSR-страницы — через Node-сервер Next (малая доля запросов).
- Перед фронтом — существующий Nginx + blue/green (152-ФЗ).

---

## Фаза 0 — Аудит (ВЫПОЛНЕНО, факты по коду)

| Параметр | `mentori-club` (цель) | `mcfe` (источник) | Вывод |
|---|---|---|---|
| Каркас | Next.js 16.1.6 App Router | Vite SPA | ✅ Next остаётся |
| React | 19.2.3 | 19.2.0 | ✅ совпадает |
| Tailwind | **v4** (CSS-first `@theme`) | **v3** (JS config) | ⚠️ главная адаптация |
| Тема | `next-themes` уже стоит | — | ✅ используем |
| UI-кит | нет (hand-rolled) | shadcn + Radix (53) | ставим с нуля |
| Палитра | индиго `#5d5fef` | gold/terracotta/sage | меняем |
| Иконки | Material Symbols (шрифт) | lucide-react | переходим |
| Бэкенд | большой, реальный (~80 API-routes, Tarantool, S3) | моки | данные не трогаем |

### Структура `mentori-club/apps/web`
- `src/app/api/**` — ~80 route-хендлеров (auth, communities, posts, messages, notifications, upload).
- `src/app/**` — страницы: home, `communities/[slug]/{feed,console,learning,events,members,rating,...}`, dashboard, profile, login, register.
- `src/components/**` — `home/*` (лендинг), `community/*` (модалки), `layout/*` (Header/Footer), `Toast.tsx`.
- `src/lib/**` — `tarantool.ts`, `s3.ts`, `session.ts`, `mentions.tsx`, `caretPosition.ts`.

### Три ключевых вывода
1. **Tailwind v3 → v4** — токены переписать в `@theme` (globals.css), не копировать JS-конфиг. Использовать `shadcn init` под v4.
2. **Бэкенд реальный** — это рескин + граф, НЕ перенос данных. `lib/api`/`lib/mocks` из `mcfe` не тащим.
3. **IA не совпадает** — рескиним существующие маршруты `mentori-club`, граф прививаем как новую фичу.

---

## Фаза 1 — Фундамент: токены в Tailwind v4
- [ ] Переписать токены gold/terracotta/sage/neutral/semantic в `@theme` (globals.css, формат v4).
- [ ] Перенести CSS-переменные shadcn (`--background`, `--primary`…) и Social-Fabric vars в v4-синтаксисе.
- [ ] Сменить основной цвет с индиго `#5d5fef` на премиум-палитру.
- [ ] Шрифты Playfair Display + Inter через `next/font`.
- [ ] Перенести `deep-background.css`.

## Фаза 2 — UI-кит (shadcn под Tailwind v4)
- [ ] `npx shadcn init` под Tailwind v4 → корректные `components.json` + базовые vars.
- [ ] Установить Radix-зависимости + lucide-react, cmdk, sonner, vaul, embla, recharts, react-hook-form, zod, @hookform/resolvers, @tanstack/react-query.
- [ ] Скопировать `src/components/ui/*` (53) + `lib/utils.ts` (`cn`).
- [ ] Расставить `"use client"` в интерактивных компонентах.
- [ ] `next build` — кит компилируется до страниц.

## Фаза 3 — Иконки и базовые примитивы
- [ ] Material Symbols → lucide-react.
- [ ] `Toast.tsx` → shadcn `sonner`; `ConfirmModal/ChatModal/...` → shadcn `dialog`/`drawer`.

## Фаза 4 — Рескин страниц (по одной, визуальная проверка)
- [ ] Лендинг (`home/*`) → shadcn + премиум-палитра → SSG/ISR.
- [ ] `communities/[slug]/{feed,console,learning,events,members,rating}` → shadcn.
- [ ] `dashboard`, `profile`, `login`, `register` → рескин.

## Фаза 5 — Граф (social-fabric)
- [ ] Перенести 21 компонент `social-fabric` + `canvasLabels.ts`, `"use client"`.
- [ ] Встроить: новый маршрут `communities/[slug]/connections` или профиль/дашборд.
- [ ] Подключить к реальным данным (members/connections API) вместо моков.

## Фаза 6 — Сборка, CDN, деплой
- [ ] `next build`: статика → CDN (immutable).
- [ ] ISR для публичных страниц сообществ.
- [ ] Встроить в существующий pipeline (Nginx/blue-green/152-ФЗ).

---

## Главные риски
1. **Tailwind v4-токены** — делать через `shadcn init` под v4, не копировать v3-конфиг.
2. **`"use client"`** при переносе SPA-компонентов.
3. **Не тащить `lib/api`/`mocks` из `mcfe`** — у `mentori-club` свой реальный бэкенд.
4. **IA-решение** — рескин существующих маршрутов, граф как новая фича.

---

## Рекомендованный порядок старта
1. Фаза 1 + 2 на отдельной ветке в `mentori-club` (фундамент + UI-кит, без страниц).
2. Одна пилотная страница (например, лендинг) — проверить, что палитра/шрифты/компоненты смотрятся «премиально».
3. Дальше рескин по страницам + граф.

Работу удобнее вести локально в VS Code (видно diff и рендер вживую) либо в облачной сессии с пушем в ветку.
