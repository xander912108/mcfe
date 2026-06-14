# Mentori Club — Спецификация визуальных эффектов

> Этот файл фиксирует все CSS-анимации, hover-эффекты и интерактивные паттерны, используемые в проекте. Любое изменение эффектов должно начинаться с обновления этой спецификации.

---

## 1. GOLD GLOW — золотое/терракотовое свечение чисел

Использование: крупные числа (74/100, метрики, показатели)

### 1.1 gold-glow (золотой вариант)
```css
.gold-glow {
  animation: goldGlow 1400ms ease-out;
}

@keyframes goldGlow {
  0%   { filter: brightness(1); text-shadow: 0 0 0px rgba(255,255,255,0), 0 0 0px rgba(212,175,55,0); }
  20%  { filter: brightness(1.35); text-shadow: 0 0 16px rgba(255,255,255,0.7), 0 0 40px rgba(212,175,55,0.6), 0 0 64px rgba(212,175,55,0.3); }
  45%  { filter: brightness(1.15); text-shadow: 0 0 10px rgba(255,255,255,0.3), 0 0 24px rgba(212,175,55,0.35); }
  70%  { filter: brightness(1.05); text-shadow: 0 0 4px rgba(255,255,255,0.1), 0 0 10px rgba(212,175,55,0.12); }
  100% { filter: brightness(1); text-shadow: 0 0 0px rgba(255,255,255,0), 0 0 0px rgba(212,175,55,0); }
}
```

**Эффект:** яркая вспышка белого+золотого свечения вокруг числа, затем плавное затухание. В пике число становится на 35% ярче.

**Где используется:**
- Главное сейчас — `74/100` (Pulse Score)
- Вступление — метрики с золотым цветом (заявок: 5, новичков: 8, помощника: 2)

### 1.2 gold-glow-terracotta (терракотовый вариант)
```css
.gold-glow-terracotta {
  animation: goldGlowTerracotta 1400ms ease-out;
}

@keyframes goldGlowTerracotta {
  0%   { filter: brightness(1); text-shadow: 0 0 0px rgba(255,255,255,0), 0 0 0px rgba(201,112,106,0); }
  20%  { filter: brightness(1.3); text-shadow: 0 0 16px rgba(255,255,255,0.6), 0 0 40px rgba(201,112,106,0.55), 0 0 64px rgba(201,112,106,0.25); }
  45%  { filter: brightness(1.12); text-shadow: 0 0 10px rgba(255,255,255,0.25), 0 0 24px rgba(201,112,106,0.3); }
  70%  { filter: brightness(1.04); text-shadow: 0 0 4px rgba(255,255,255,0.08), 0 0 10px rgba(201,112,106,0.1); }
  100% { filter: brightness(1); text-shadow: 0 0 0px rgba(255,255,255,0), 0 0 0px rgba(201,112,106,0); }
}
```

**Где используется:**
- Вступление — метрики с терракотовым цветом (заявки: 2, новичка: 3)

### Принцип выбора варианта
| Цвет метрики | Класс |
|---|---|
| `var(--gold)` (#C9A96E) | `.gold-glow` |
| `TERRACOTTA` (#C9706A) | `.gold-glow-terracotta` |

---

## 2. FILL BAR — анимация заполнения прогресс-бара

```css
.fill-bar {
  animation: fillBar 600ms ease-out;
  animation-delay: 100ms;
}

@keyframes fillBar {
  from { width: 0%; }
  to   { width: var(--target-width); }
}
```

**Эффект:** полоска растёт слева направо от 0 до целевого значения. Задержка 100мс позволяет модалке сначала появиться, потом заполниться.

**Где используется:**
- Главное сейчас — прогресс-бары в модалке Pulse (Энергия, Рост, Связи, Ритм)

---

## 3. MODAL ENTER — появление модальных окон

```css
.modal-enter {
  animation: modalEnter 200ms ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: translateY(16px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
```

**Эффект:** модальное окно выезжает снизу с лёгким масштабированием, создавая ощущение "всплытия".

**Где используется:** все 12+ модальных окон в проекте.

---

## 4. MODAL BACKDROP — затемнение фона

```css
.modal-backdrop {
  animation: modalBackdrop 150ms ease-out;
}

@keyframes modalBackdrop {
  from { background-color: rgba(0,0,0,0); }
  to   { background-color: rgba(0,0,0,0.35); }
}
```

**Эффект:** плавное затемнение фона за 150мс. Модалка появляется чуть раньше фона — создаётся глубина.

---

## 5. HOVER-ЭФФЕКТЫ

Все hover-эффекты реализованы через CSS-классы, **не через inline onMouseEnter/onMouseLeave**.

### 5.1 hover-border-gold — золотая рамка при наведении
```css
.hover-border-gold {
  border: 1px solid var(--border-color);
  transition: border-color 200ms ease;
}
.hover-border-gold:hover {
  border-color: var(--gold);
}
```

**Где используется:** карточки в секции "Первая связь и опора", опции в модалках, элементы списков.

### 5.2 hover-bg — фон при наведении
```css
.hover-bg {
  transition: background-color 200ms ease;
}
.hover-bg:hover {
  background-color: var(--hover-bg);
}
```

**Где используется:** строки таблиц, элементы навигации, кликабельные блоки.

### 5.3 hover-text-primary — смена цвета текста
```css
.hover-text-primary {
  transition: color 200ms ease;
}
.hover-text-primary:hover {
  color: var(--text-primary);
}
```

### 5.4 hover:opacity
```css
/* Для вторичных кнопок */
hover:opacity-80   /* opacity: 0.8 */

/* Для primary кнопок */
hover:opacity-90   /* opacity: 0.9 */
```

---

## 6. MICRO PROGRESS BAR — миниатюрный индикатор дня

```css
.micro-progress {
  width: 64px;
  height: 4px;
  border-radius: 2px;
  background-color: var(--border-color);
  overflow: hidden;
}

.micro-progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 300ms ease;
}
```

**Цвет в зависимости от дня:**
| День | Цвет |
|---|---|
| 1–3 | Sage (#6B9E7C) — начало пути, всё свежо |
| 4–5 | Gold (#C9A96E) — середина, требует внимания |
| 6–7 | Terracotta (#C9706A) — конец периода, нужна связь |

**Где используется:** карточки новичков — показывает сколько дней прошло из 7.

---

## 7. PILL LINK — стиль "таблетки"

```css
.pill-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border-radius: 999px;
  border: 1px solid var(--border-color);
  font-size: 13px;
  color: var(--text-muted);
  transition: all 200ms ease;
}
.pill-link:hover {
  border-color: var(--gold);
  color: var(--gold);
}
```

**Эффект:** при наведении рамка и текст становятся золотыми. Мягкая индикация кликабельности без агрессивного акцента.

**Где используется:**
- "Показать все заявки"
- "Показать всех новичков"
- Фильтры (активный фильтр получает золотую рамку и цвет через inline-стили)

---

## 8. CARD SHADOW — система теней для карточек

```css
:root {
  --card-shadow:        0 2px 16px rgba(0,0,0,0.06);
  --card-shadow-hover:  0 8px 32px rgba(0,0,0,0.1);
}
```

**Premium Card** — базовый стиль карточек:
```css
.premium-card {
  transition: transform 200ms ease, box-shadow 200ms ease;
}
.premium-card:hover {
  transform: translateY(-1px);
  box-shadow: var(--card-shadow-hover);
}
```

**Эффект:** при наведении карточка слегка приподнимается и тень усиливается — создаётся ощущение "всплытия" над поверхностью.

---

## 9. HEADING ACCENT — декоративная линия под заголовками

```css
.heading-accent {
  position: relative;
}
.heading-accent::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  width: 40px;
  height: 2px;
  background-color: var(--gold);
  border-radius: 1px;
}
```

**Эффект:** короткая золотая линия под заголовками модалок — маркер премиальности.

**Где используется:** заголовки всех модальных окон.

---

## 10. SECTION HEADING — стиль секционных заголовков

```css
.section-heading {
  font-family: 'Playfair Display', serif;
  font-size: 20px;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 16px;
  letter-spacing: -0.01em;
}
```

---

## 11. SIDEBAR SECTION — стиль блоков правой панели

```css
.sidebar-section {
  padding: 20px;
  border-radius: 16px;
  background-color: var(--bg-card);
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
}
```

---

## 12. CUSTOM SCROLLBAR — стилизация скролла

```css
/* В модальных окнах */
.modal-scroll::-webkit-scrollbar {
  width: 4px;
}
.modal-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.modal-scroll::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 2px;
}
```

---

## 13. TOOLTIP — кастомная подсказка

**Появление:** мгновенное (0ms delay)
**Скрытие:** мгновенное
**Стили:**
- Фон: `var(--bg-card)`
- Рамка: `1px solid var(--border-color)`
- Тень: `0 4px 20px rgba(0,0,0,0.15)`
- Размер: `max-width: 280px`
- Текст: `text-xs`

**Где используется:** иконки `Info` рядом с метриками.

---

## 14. GRADIENT DIVIDER — разделитель секций

```css
background: linear-gradient(90deg, transparent, var(--border-color), transparent);
height: 1px;
```

**Эффект:** линия плавно растворяется по краям — мягкое разделение без жёстких границ.

---

## 15. STATUS BADGE — цветные метки статуса

| Статус | Фон | Цвет текста | Рамка |
|---|---|---|---|
| terracotta | `rgba(201,112,106,0.08)` | `#C9706A` | `rgba(201,112,106,0.15)` |
| gold | `rgba(212,175,55,0.08)` | `#C9A96E` | `rgba(212,175,55,0.2)` |
| sage | `rgba(107,158,124,0.08)` | `#6B9E7C` | `rgba(107,158,124,0.15)` |

**Форма:** `border-radius: 999px`, `font-size: 11px`, `padding: 2px 10px`

---

## 16. ATTENTION CARD — карточки внимания

**Terracotta вариант (опасность):**
- `background: rgba(201,112,106,0.08)`
- `border-left: 3px solid #C9706A`
- Иконка: `AlertTriangle`

**Gold вариант (внимание):**
- `background: var(--hover-bg)`
- `border: 1px solid var(--border-color)`
- Иконка: `Zap`

---

## 17. RISK CARD — карточки рисков

- `background: rgba(201,112,106,0.08)`
- `border-left: 3px solid #C9706A`
- Тень: `var(--card-shadow)`
- Иконка: `AlertTriangle`

---

## 18. КНОПКИ — иерархия стилей

### Primary (золотая)
```
background: var(--gold); color: #fff;
hover: opacity 0.9
```

### Secondary (обводная)
```
border: 1px solid var(--border-color); color: var(--text-secondary);
hover: opacity 0.8
```

### Tertiary (текстовая)
```
color: var(--text-muted);
hover: opacity 0.8
```

### Danger (терракотовая)
```
background: #C9706A; color: #fff;
```

### Success (зелёная)
```
background: #6B9E7C; color: #fff;
```

---

## 19. RESPONSIVE GRID — метрики

```
mobile:  grid-cols-3 (3 метрики в ряд)
desktop: grid-cols-5 (5 метрик в ряд)
```

---

## 20. STICKY ADVISOR — прилипающий советник

```css
aside {
  position: sticky;
  top: 16px;
  align-self: flex-start;
}
```

**Эффект:** правый советник остаётся видимым при скролле страницы.

---

## 21. ACCORDION — раскрывающиеся блоки

**"Почему я это вижу?"**
- Плавное раскрытие контента
- `border-top: 1px solid var(--border-color)` для отделения
- Анимация: мгновенное (React условный рендеринг)

**"Что означают параметры" (Pulse модалка)**
- Аналогичный паттерн с заголовком и стрелкой

---

## 22. ICON COLOR TRANSITIONS

```css
transition: color 200ms ease, transform 200ms ease;
```

**Где используется:** иконки внутри интерактивных элементов наследуют цвет родителя при hover.

---

## Палитра проекта

| Название | Hex | Применение |
|---|---|---|
| Gold | #C9A96E | Primary actions, метрики, акценты |
| Gold Light | #D4B87A | Hover состояния |
| Terracotta | #C9706A | Опасность, требует внимания |
| Sage | #6B9E7C | Успех, спокойствие |
| Text Primary | #1A1A1A | Заголовки |
| Text Secondary | #666666 | Описания |
| Text Muted | #999999 | Второстепенный текст |
| BG Main | #FAFAF8 | Фон страницы |
| BG Card | #FFFFFF | Карточки |
| Border | #E8E5DF | Рамки, разделители |
| Hover BG | #F0EFEA | Hover фон |

---

## Шрифты

| Назначение | Шрифт | Вес |
|---|---|---|
| Заголовки страниц | Playfair Display | 700 |
| Заголовки секций | Playfair Display | 700 |
| Заголовки модалок | Playfair Display | 700 |
| Основной текст | Inter | 400–500 |
| Метрики/числа | Inter | 700 |
| Подписи | Inter | 400 |
| Uppercase labels | Inter | 600 |
