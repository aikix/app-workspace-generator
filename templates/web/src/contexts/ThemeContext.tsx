'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

/**
 * Theme Provider Component
 *
 * Manages theme state and applies dark mode class to the document.
 * Supports light, dark, and system preference modes.
 *
 * @example
 * ```tsx
 * // In your root layout.tsx
 * import { ThemeProvider } from '@/contexts/ThemeContext';
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html suppressHydrationWarning>
 *       <body>
 *         <ThemeProvider>
 *           {children}
 *         </ThemeProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('system');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // Load saved theme from localStorage
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
      setThemeState(savedTheme);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      let effectiveTheme: 'light' | 'dark';

      if (theme === 'system') {
        effectiveTheme = mediaQuery.matches ? 'dark' : 'light';
      } else {
        effectiveTheme = theme;
      }

      setResolvedTheme(effectiveTheme);

      // Apply dark class for Tailwind
      if (effectiveTheme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    };

    applyTheme();

    // Listen for system theme changes
    const handler = () => {
      if (theme === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handler);

    return () => {
      mediaQuery.removeEventListener('change', handler);
    };
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const value = {
    theme,
    setTheme,
    resolvedTheme,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Hook to access theme context
 *
 * @example
 * ```tsx
 * 'use client';
 *
 * import { useTheme } from '@/contexts/ThemeContext';
 *
 * export default function ThemeToggle() {
 *   const { theme, setTheme, resolvedTheme } = useTheme();
 *
 *   return (
 *     <button onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}>
 *       {resolvedTheme === 'dark' ? '🌙' : '☀️'}
 *     </button>
 *   );
 * }
 * ```
 */
export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
