/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light Green & Mint Palette (NO DARK COLORS)
        primary: {
          DEFAULT: '#F0FDF4',
          bg: '#F0FDF4',
        },
        secondary: {
          DEFAULT: '#E6F7EC',
          bg: '#E6F7EC',
        },
        card: {
          DEFAULT: '#FFFFFF',
          bg: '#FFFFFF',
          hover: '#F0FDF4',
          border: '#A7F3D0',
        },
        gold: {
          DEFAULT: '#047857',
          bright: '#059669',
          deep: '#065F46',
          glow: 'rgba(16, 185, 129, 0.25)',
          muted: 'rgba(16, 185, 129, 0.1)',
        },
        ivory: {
          DEFAULT: '#0F172A',
          white: '#FFFFFF',
        },
        muted: {
          DEFAULT: '#334155',
          dark: '#1E293B',
        },
        success: {
          DEFAULT: '#10B981',
          glow: 'rgba(16, 185, 129, 0.25)',
        },
        danger: {
          DEFAULT: '#EF4444',
          glow: 'rgba(239, 68, 68, 0.25)',
        },
        // Preservation of existing names for compatibility
        obsidian: {
          DEFAULT: '#F0FDF4',
          light: '#E6F7EC',
          dark: '#DCF5E6',
        },
        charcoal: {
          DEFAULT: '#E6F7EC',
          light: '#FFFFFF',
          hover: '#F0FDF4',
        },
        platinum: {
          DEFAULT: '#0F172A',
          muted: '#334155',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'Plus Jakarta Sans', 'Inter', 'sans-serif'],
        serif: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        editorial: ['Playfair Display', 'Cormorant Garamond', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'luxury': '0 10px 25px -5px rgba(5, 150, 105, 0.08), 0 0 1px 1px rgba(16, 185, 129, 0.12)',
        'luxury-hover': '0 15px 35px -10px rgba(5, 150, 105, 0.15), 0 0 15px 0px rgba(16, 185, 129, 0.2)',
        'gold-glow': '0 0 20px rgba(16, 185, 129, 0.25)',
        'card-glow': '0 10px 25px -5px rgba(5, 150, 105, 0.08), 0 0 1px 1px rgba(16, 185, 129, 0.12)',
      },
      backgroundImage: {
        'gold-gradient': 'linear-gradient(135deg, #059669 0%, #10B981 50%, #34D399 100%)',
        'dark-gradient': 'linear-gradient(180deg, #E6F7EC 0%, #F0FDF4 100%)',
        'card-gradient': 'linear-gradient(145deg, #FFFFFF 0%, #F0FDF4 100%)',
        'chakra-radial': 'radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, rgba(240, 253, 244, 0) 70%)',
      },
    },
  },
  plugins: [],
}
