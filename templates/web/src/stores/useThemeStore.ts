import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface ThemeState {
  theme: Theme;
  resolvedTheme: 'light' | 'dark';
  setTheme: (theme: Theme) => void;
  setResolvedTheme: (theme: 'light' | 'dark') => void;
}

/**
 * Theme Store (Zustand)
 *
 * Manages theme state with Zustand and persists to localStorage.
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useThemeStore } from '@/stores/useThemeStore';
 *
 * export default function ThemeToggle() {
 *   const { theme, resolvedTheme, setTheme } = useThemeStore();
 *
 *   const toggleTheme = () => {
 *     setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
 *   };
 *
 *   return (
 *     <button onClick={toggleTheme}>
 *       {resolvedTheme === 'dark' ? '🌙 Dark' : '☀️ Light'}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Initialize theme in root layout
 * 'use client';
 *
 * import { useThemeStore, initializeTheme } from '@/stores/useThemeStore';
 * import { useEffect } from 'react';
 *
 * export default function RootLayout({ children }) {
 *   useEffect(() => {
 *     const cleanup = initializeTheme();
 *     return cleanup;
 *   }, []);
 *
 *   return <html suppressHydrationWarning><body>{children}</body></html>;
 * }
 * ```
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      resolvedTheme: 'light',

      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme);
      },

      setResolvedTheme: (resolvedTheme) => set({ resolvedTheme }),
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  let effectiveTheme: 'light' | 'dark';

  if (theme === 'system') {
    effectiveTheme = mediaQuery.matches ? 'dark' : 'light';
  } else {
    effectiveTheme = theme;
  }

  useThemeStore.getState().setResolvedTheme(effectiveTheme);

  // Apply dark class for Tailwind
  if (effectiveTheme === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

/**
 * Initialize theme and listen for system preference changes
 * Call this in your root layout component
 */
export function initializeTheme() {
  const { theme } = useThemeStore.getState();
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  // Apply initial theme
  applyTheme(theme);

  // Listen for system theme changes
  const handler = () => {
    const currentTheme = useThemeStore.getState().theme;
    if (currentTheme === 'system') {
      applyTheme(currentTheme);
    }
  };

  mediaQuery.addEventListener('change', handler);

  return () => {
    mediaQuery.removeEventListener('change', handler);
  };
}
