import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light-green' | 'dark' | 'white';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem('voting_system_theme_v3');
    if (saved === 'dark' || saved === 'white' || saved === 'light-green') return saved as Theme;
    // Default immediately to 'light-green' as requested by user
    return 'light-green';
  });

  const applyTheme = (t: Theme) => {
    const root = document.documentElement;
    root.classList.remove('dark', 'light', 'theme-light-green', 'theme-white');
    if (t === 'light-green') {
      root.classList.add('light', 'theme-light-green');
      root.setAttribute('data-theme', 'light-green');
    } else if (t === 'white') {
      root.classList.add('light', 'theme-white');
      root.setAttribute('data-theme', 'white');
    } else {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    }
    localStorage.setItem('voting_system_theme_v3', t);
  };

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
  };

  const toggleTheme = () => {
    const next = theme === 'light-green' ? 'dark' : 'light-green';
    setTheme(next);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
