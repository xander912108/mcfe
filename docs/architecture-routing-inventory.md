# Этап 2A — инвентаризация маршрутов и экранов

Документ фиксирует текущую карту маршрутов Mentori Club перед дальнейшей архитектурной работой. Его задача — защитить уже реализованные страницы от случайной подмены заглушками, удаления вкладок или резкой смены layout.

## Принципы этапа 2A

- Не менять визуальный интерфейс.
- Не менять текущий роутинг без отдельного решения.
- Не заменять живые страницы новыми заглушками.
- Считать текущие маршруты и компоненты источником правды для этапов 2B–2F.
- Любая будущая декларативная навигация должна описывать эти реальные маршруты, а не целевую структуру с нуля.

## Текущий routing-shell

Сейчас точка входа использует `HashRouter`, а маршруты в `src/main.tsx` рендерят `App` с разными props. Это важно для GitHub Pages и текущей структуры приложения.

| Маршрут | Текущий render | Зона продукта | Статус для миграции |
| --- | --- | --- | --- |
| `/` | `<App />` | Основной опыт / стартовый экран | Сохранять |
| `/community` | `<App communityFeedPage />` | Участник / сообщество | Сохранять |
| `/community/about` | `<CommunityLanding />` | Публичная страница сообщества | Сохранять отдельно от app-shell |
| `/connections` | `<App connectionsPage />` | Участник / Мои связи | Сохранять живой экран |
| `/contribution` | `<App contributionPage />` | Участник / вклад | Сохранять |
| `/insights` | `<App insightsPage />` | Участник / инсайты | Сохранять |
| `/learning` | `<App learningPage />` | Участник / обучение | Сохранять |
| `/meetings` | `<App meetingsPage />` | Участник / встречи | Сохранять |
| `/my-path` | `<App myPathPage />` | Участник / мой путь | Сохранять |
| `/leader` | `<App leaderMode />` | Лидер / главная консоли | Сохранять |
| `/leader/entry` | `<App leaderMode leaderTab="entry" />` | Лидер / вход и заявки | Сохранять |
| `/leader/requests` | `<App leaderMode leaderTab="requests" />` | Лидер / запросы | Сохранять |
| `/leader/connections` | `<App leaderMode leaderTab="connections" />` | Лидер / связи сообщества | Сохранять |
| `/leader/contribution` | `<App leaderMode leaderTab="contribution" />` | Лидер / вклад | Сохранять |
| `/leader/monetization` | `<App leaderMode leaderTab="monetization" />` | Лидер / монетизация | Сохранять |
| `/leader/settings` | `<App leaderMode leaderTab="settings" />` | Лидер / настройки | Сохранять |

## Реальные страницы и модули, которые нельзя подменять заглушками

### Участник

| Экран | Файл | Примечание для будущего navigation config |
| --- | --- | --- |
| Мой путь | `src/pages/MyPath.tsx` | Использовать для `/my-path`, не создавать конкурирующий `MyPathPage` без миграционного плана. |
| Сообщество | `src/pages/CommunityFeed.tsx` | Использовать для `/community`. |
| Обучение | `src/pages/LearningPage.tsx` | Использовать для `/learning`. |
| Встречи | `src/pages/MeetingsPage.tsx` | Использовать для `/meetings`. |
| Мои связи | `src/pages/MyConnections.tsx` | Критичный живой экран КМЗ; не заменять заглушкой `ConnectionsPage`. |
| Инсайты | `src/pages/InsightsPage.tsx` | Использовать для `/insights`. |
| Вклад | `src/pages/ContributionPage.tsx` | Использовать для `/contribution`. |

### Лидер

| Экран | Файл | Примечание для будущего navigation config |
| --- | --- | --- |
| Главная консоли | `src/LeaderConsoleMain.tsx` | Использовать для `/leader`. |
| Вход и заявки | `src/LeaderConsoleEntry.tsx` | Использовать для `/leader/entry`. |
| Запросы | `src/LeaderConsoleRequests.tsx` | Использовать для `/leader/requests`. |
| Связи | `src/LeaderConsoleConnections.tsx` | Обёртка над `src/pages/LeaderConnections.tsx`; использовать для `/leader/connections`. |
| Вклад | `src/LeaderConsoleContribution.tsx` | Использовать для `/leader/contribution`. |
| Монетизация | `src/LeaderConsoleMonetization.tsx` | Использовать для `/leader/monetization`. |
| Настройки | `src/LeaderConsoleSettings.tsx` | Использовать для `/leader/settings`. |

### Публичные страницы

| Экран | Файл | Примечание |
| --- | --- | --- |
| Лендинг сообщества | `src/CommunityLanding.tsx` | Сейчас живёт на `/community/about` вне `App` shell. |

## Текущие lazy-loaded границы

`App` уже lazy-load'ит основные страницы участника и разделы консоли лидера. Поэтому этапы 2B–2F должны переиспользовать существующие lazy imports или переносить их постепенно, а не создавать параллельные заглушки.

## Важные ограничения для этапов 2B–2F

1. `HashRouter` не менять на `BrowserRouter` без отдельного решения по GitHub Pages.
2. `App.tsx` не сокращать до минимальной точки входа одним PR: он сейчас является рабочим shell приложения.
3. Не схлопывать лидерскую консоль до одного маршрута `/leader`.
4. Не удалять маршруты `/leader/entry`, `/leader/requests`, `/leader/connections`, `/leader/contribution`, `/leader/monetization`, `/leader/settings`.
5. Не создавать новые страницы-заглушки с тем же смыслом, если уже есть рабочая страница.
6. Любой будущий `navigationConfig` должен сначала описать текущую карту маршрутов из этого документа.
7. Роли и feature flags на первом этапе должны управлять видимостью пунктов навигации, а не ломать прямой доступ к существующим route без отдельного решения.

## Критерии готовности 2A

- Карта текущих route зафиксирована.
- Реальные компоненты страниц зафиксированы.
- Лидерские вложенные маршруты явно защищены от потери при будущей миграции.
- Риски прямой реализации старой спецификации описаны.
- Визуальный интерфейс не изменён.
