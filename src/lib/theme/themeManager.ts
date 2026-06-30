export type Theme = 'light' | 'dark' | 'system';

type ThemeListener = (theme: Theme) => void;

const STORAGE_KEY = 'mentori-theme';
const LEGACY_STORAGE_KEY = 'theme';
const canUseDOM = typeof window !== 'undefined' && typeof document !== 'undefined';

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system';
}

/**
 * Theme Manager для Mentori Club.
 *
 * Решает проблемы:
 * 1. FOUT — тема применяется до рендера React через inline script в index.html.
 * 2. Persistence — запоминает выбор пользователя.
 * 3. System preference — реагирует на настройки ОС.
 */
class ThemeManager {
  private current: Theme = 'system';
  private mediaQuery: MediaQueryList | null = null;
  private listeners: Set<ThemeListener> = new Set();

  constructor() {
    if (!canUseDOM) return;

    this.current = this.getStoredTheme();
    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.mediaQuery.addEventListener('change', this.handleSystemThemeChange);
    this.apply();
  }

  private handleSystemThemeChange = () => {
    if (this.current === 'system') {
      this.apply();
      this.notifyListeners();
    }
  };

  private getStoredTheme(): Theme {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (isTheme(stored)) return stored;

      const legacy = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy === 'light' || legacy === 'dark') return legacy;
    } catch {
      // localStorage недоступен — используем системную тему.
    }

    return 'system';
  }

  private isDarkMode(): boolean {
    if (this.current === 'dark') return true;
    if (this.current === 'light') return false;
    return this.mediaQuery?.matches ?? false;
  }

  private apply() {
    if (!canUseDOM) return;

    const isDark = this.isDarkMode();
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', isDark ? '#0C0A09' : '#FFFFFF');
    }
  }

  set(theme: Theme) {
    this.current = theme;

    try {
      localStorage.setItem(STORAGE_KEY, theme);
      localStorage.setItem(LEGACY_STORAGE_KEY, theme === 'system' ? this.effectiveTheme : theme);
    } catch {
      // localStorage недоступен — продолжаем без persistence.
    }

    this.apply();
    this.notifyListeners();
  }

  get theme(): Theme {
    return this.current;
  }

  get effectiveTheme(): 'light' | 'dark' {
    return this.isDarkMode() ? 'dark' : 'light';
  }

  subscribe(listener: ThemeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.current));
  }
}

export const themeManager = new ThemeManager();
