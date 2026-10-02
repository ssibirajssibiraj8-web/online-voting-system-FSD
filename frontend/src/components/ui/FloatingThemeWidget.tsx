import React from 'react';
import { useTheme, Theme } from '../../context/ThemeContext';
import { Sun, Moon, Leaf } from 'lucide-react';

export const FloatingThemeWidget: React.FC = () => {
  const { theme, toggleTheme, setTheme } = useTheme();

  return (
    <aside
      aria-label="Theme selector controls"
      className="fixed bottom-5 right-5 z-50 flex items-center gap-2 p-1.5 rounded-2xl bg-white/95 dark:bg-[#151820]/95 border border-emerald-300 dark:border-[#C9A96E]/40 backdrop-blur-xl shadow-2xl transition-all duration-300"
    >
      <label htmlFor="floating-theme-select" className="sr-only">
        Select background theme
      </label>
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={`Current theme: ${theme}. Click to switch theme.`}
        className="p-2 rounded-xl bg-emerald-50 dark:bg-[#101217] text-emerald-700 dark:text-[#E5C98A] hover:scale-105 transition-transform"
      >
        {theme === 'light-green' ? (
          <Leaf className="w-4 h-4 text-emerald-600" />
        ) : theme === 'white' ? (
          <Sun className="w-4 h-4 text-amber-500" />
        ) : (
          <Moon className="w-4 h-4 text-[#C9A96E]" />
        )}
      </button>

      <select
        id="floating-theme-select"
        value={theme}
        onChange={(e) => setTheme(e.target.value as Theme)}
        aria-label="Select background color"
        className="bg-transparent text-xs font-mono font-semibold text-slate-800 dark:text-[#F5F5F2] outline-none pr-2 cursor-pointer"
      >
        <option value="light-green" className="bg-[#F0FDF4] text-emerald-900">
          🌱 Light Green
        </option>
        <option value="white" className="bg-white text-slate-900">
          ☀️ Clean White
        </option>
        <option value="dark" className="bg-[#101217] text-[#F5F5F2]">
          🌙 Dark Mode
        </option>
      </select>
    </aside>
  );
};
