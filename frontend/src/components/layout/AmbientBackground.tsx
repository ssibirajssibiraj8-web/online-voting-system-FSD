import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const AmbientBackground: React.FC = () => {
  const { theme } = useTheme();
  const isLightGreen = theme === 'light-green';
  const isWhite = theme === 'white';
  const isLight = isLightGreen || isWhite;

  const getBaseBg = () => {
    if (isWhite) return 'bg-[#FFFFFF]';      // Crisp pure white
    return 'bg-[#F0FDF4]';                   // Soft electoral light green
  };

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
    >
      {/* 1. Base Layer: Soft Electoral Light Green or Pure White */}
      <div className={`absolute inset-0 transition-colors duration-500 ${getBaseBg()}`} />

      {/* 2. Top-Center Emerald Green & Saffron Aurora */}
      <div
        className={`absolute -top-[15%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[120px] animate-pulse-slow ${
          isLightGreen
            ? 'bg-gradient-to-b from-[#10B981]/25 via-[#34D399]/18 to-transparent'
            : isWhite
            ? 'bg-gradient-to-b from-[#C9A96E]/25 via-[#FF9933]/15 to-transparent'
            : 'bg-gradient-to-b from-[#C9A96E]/20 via-[#FF9933]/10 to-transparent'
        }`}
      />

      {/* 3. Top-Right Royal TVK Purple Ambient Orb */}
      <div
        className={`absolute top-[10%] -right-[10%] w-[650px] h-[650px] rounded-full blur-[130px] animate-float-slow ${
          isLightGreen
            ? 'bg-gradient-to-bl from-[#8E24AA]/12 via-[#10B981]/10 to-transparent'
            : isWhite
            ? 'bg-gradient-to-bl from-[#8E24AA]/15 via-[#7B1FA2]/08 to-transparent'
            : 'bg-gradient-to-bl from-[#8E24AA]/25 via-[#7B1FA2]/12 to-transparent'
        }`}
      />

      {/* 4. Mid-Left Emerald Green Sovereign Aura */}
      <div
        className={`absolute top-[40%] -left-[10%] w-[600px] h-[600px] rounded-full blur-[120px] animate-float-reverse ${
          isLightGreen
            ? 'bg-gradient-to-tr from-[#059669]/20 via-[#10B981]/15 to-transparent'
            : isWhite
            ? 'bg-gradient-to-tr from-[#16A085]/15 via-[#0E6251]/08 to-transparent'
            : 'bg-gradient-to-tr from-[#16A085]/20 via-[#0E6251]/10 to-transparent'
        }`}
      />

      {/* 5. Bottom Imperial Gold Horizon Glow */}
      <div
        className={`absolute -bottom-[20%] left-1/3 w-[800px] h-[550px] rounded-full blur-[140px] animate-pulse-slow ${
          isLightGreen
            ? 'bg-gradient-to-t from-[#10B981]/15 via-[#34D399]/10 to-transparent'
            : isWhite
            ? 'bg-gradient-to-t from-[#C9A96E]/20 via-[#B39154]/10 to-transparent'
            : 'bg-gradient-to-t from-[#C9A96E]/18 via-[#B39154]/8 to-transparent'
        }`}
      />

      {/* 6. Geometric Guilloche Lattice Pattern (Subtle Constitutional Grid) */}
      <div
        className={`absolute inset-0 bg-electoral-grid transition-opacity duration-500 ${
          isLight ? 'opacity-[0.25] mix-blend-multiply' : 'opacity-[0.14] mix-blend-screen'
        }`}
      />

      {/* 7. Subtle Rotating Constitutional Geometric Concentric Rings */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[950px] h-[950px] rounded-full border border-[#10B981]/20 animate-subtle-spin pointer-events-none">
        <div className="w-full h-full rounded-full border border-dashed border-[#10B981]/15 p-16">
          <div className="w-full h-full rounded-full border border-[#10B981]/15 p-24">
            <div className="w-full h-full rounded-full border border-dotted border-[#10B981]/25" />
          </div>
        </div>
      </div>

      {/* 8. Vignette Framing */}
      <div
        className={`absolute inset-0 ${
          isLight ? 'opacity-25' : 'opacity-80'
        } bg-radial-vignette`}
      />
    </div>
  );
};
