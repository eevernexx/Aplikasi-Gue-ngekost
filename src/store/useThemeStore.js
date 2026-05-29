import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const THEME_COLORS = { light: '#1B4332', dark: '#0F1511' };

// Applies the theme to <html> and syncs the browser UI (PWA status bar) color.
const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.toggle('dark', theme === 'dark');
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', THEME_COLORS[theme] ?? THEME_COLORS.light);
};

// Default to the OS preference the first time, before anything is persisted.
const systemTheme = () =>
  typeof window !== 'undefined' &&
  window.matchMedia?.('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: systemTheme(),
      setTheme: (theme) => {
        applyTheme(theme);
        set({ theme });
      },
      toggleTheme: () => get().setTheme(get().theme === 'dark' ? 'light' : 'dark'),
    }),
    {
      name: 'gue-ngekost-theme',
      // Re-apply the stored theme to the DOM once it's rehydrated.
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    }
  )
);
