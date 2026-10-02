import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { AmbientBackground } from './components/layout/AmbientBackground';
import { FloatingThemeWidget } from './components/ui/FloatingThemeWidget';
import { AppRoutes } from './routes/AppRoutes';

const AppShell: React.FC = () => {
  const { theme } = useTheme();

  const getShellBg = () => {
    if (theme === 'light-green') return 'bg-[#F0FDF4] text-[#0F172A]';
    if (theme === 'white') return 'bg-white text-slate-900';
    return 'bg-[#07080B] text-platinum';
  };

  return (
    <div className={`min-h-screen flex flex-col ${getShellBg()} antialiased selection:bg-emerald-500/20 selection:text-emerald-900 relative transition-colors duration-300`}>
      <AmbientBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1">
          <AppRoutes />
        </main>
        <Footer />
      </div>
      <FloatingThemeWidget />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppShell />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
};

export default App;
