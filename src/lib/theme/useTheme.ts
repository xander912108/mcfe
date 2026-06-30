import { useEffect, useState } from 'react';
import { themeManager, type Theme } from '@/lib/theme/themeManager';

interface UseThemeResult {
  theme: Theme;
  effectiveTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

/** React hook для работы с темой. */
export function useTheme(): UseThemeResult {
  const [theme, setThemeState] = useState<Theme>(themeManager.theme);
  const [effectiveTheme, setEffectiveTheme] = useState<'light' | 'dark'>(themeManager.effectiveTheme);

  useEffect(() => {
    return themeManager.subscribe((newTheme) => {
      setThemeState(newTheme);
      setEffectiveTheme(themeManager.effectiveTheme);
    });
  }, []);

  const setTheme = (newTheme: Theme) => {
    themeManager.set(newTheme);
    setThemeState(themeManager.theme);
    setEffectiveTheme(themeManager.effectiveTheme);
  };

  const toggleTheme = () => {
    themeManager.set(themeManager.effectiveTheme === 'dark' ? 'light' : 'dark');
    setThemeState(themeManager.theme);
    setEffectiveTheme(themeManager.effectiveTheme);
  };

  return {
    theme,
    effectiveTheme,
    setTheme,
    toggleTheme,
  };
}
