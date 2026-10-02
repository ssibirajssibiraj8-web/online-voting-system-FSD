import React from 'react';
import { useTheme, Theme } from '../../context/ThemeContext';
import { Sun, Moon, Palette, Sparkles, Leaf } from 'lucide-react';

interface ThemeSelectorProps {
  variant?: 'select' | 'button' | 'compact';
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = 'select',
  className = '',
}) => {
  const { theme, setTheme, toggleTheme } = useTheme();

  if (variant === 'button' || variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label="Toggle light/dark background color"
        className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all duration-200 ${
          theme === 'light-green'
            ? 'bg-[#E8F8F0] text-[#064E3B] border-[#A7F3D0] shadow-sm hover:border-[#10B981]'
            : theme === 'white'
            ? 'bg-white text-slate-800 border-slate-300 shadow-sm hover:border-[#C9A96E]'
            : 'bg-[#151820] text-[#E5C98A] border-[#242834] hover:border-[#C9A96E]'
        } ${className}`}
      >
        {theme === 'light-green' ? (
          <>
            <Leaf className="w-3.5 h-3.5 text-[#10B981]" />
            <span>Light Green</span>
          </>
        ) : theme === 'white' ? (
          <>
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>White Theme</span>
          </>
        ) : (
          <>
            <Moon className="w-3.5 h-3.5 text-[#C9A96E]" />
            <span>Dark Theme</span>
          </>
        )}
      </button>
    );
  }

  // Default 'select' dropdown variant
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <Palette className="w-3.5 h-3.5 text-[#10B981] dark:text-[#C9A96E] shrink-0" />
      <div className="relative">
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          aria-label="Select background color theme"
          className="bg-[#E8F8F0] text-[#064E3B] dark:bg-[#151820] dark:text-[#F5F5F2] border border-[#A7F3D0] dark:border-[#242834] focus:border-[#10B981] text-xs font-mono font-medium rounded-xl px-3 py-1.5 outline-none cursor-pointer shadow-sm transition-colors"
        >
          <option value="light-green" className="bg-[#E8F8F0] text-[#064E3B]">
            Light Green Theme (Electoral Mint)
          </option>
          <option value="dark" className="bg-[#151820] text-[#F5F5F2]">
            Dark Theme (Obsidian)
          </option>
          <option value="white" className="bg-white text-slate-900">
            White Theme (Clean White)
          </option>
        </select>
      </div>
    </div>
  );
};
