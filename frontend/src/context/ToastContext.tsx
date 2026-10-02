import React, { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
}

interface ToastContextType {
  toast: (item: Omit<ToastItem, 'id'>) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ type, title, message }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 5000);
    },
    [removeToast]
  );

  const success = useCallback(
    (message: string, title = 'Success') => toast({ type: 'success', title, message }),
    [toast]
  );
  const error = useCallback(
    (message: string, title = 'Security Error') => toast({ type: 'error', title, message }),
    [toast]
  );
  const info = useCallback(
    (message: string, title = 'Notice') => toast({ type: 'info', title, message }),
    [toast]
  );
  const warning = useCallback(
    (message: string, title = 'Attention') => toast({ type: 'warning', title, message }),
    [toast]
  );

  return (
    <ToastContext.Provider value={{ toast, success, error, info, warning }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none px-4">
        <AnimatePresence>
          {toasts.map((t) => {
            const icons = {
              success: <CheckCircle2 className="w-5 h-5 text-emerald-accent flex-shrink-0" />,
              error: <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />,
              warning: <AlertTriangle className="w-5 h-5 text-gold-soft flex-shrink-0" />,
              info: <Info className="w-5 h-5 text-gold flex-shrink-0" />,
            };

            const borders = {
              success: 'border-emerald-accent/40 shadow-emerald-glow',
              error: 'border-error/40 shadow-error-glow',
              warning: 'border-gold-soft/40 shadow-gold-glow',
              info: 'border-gold/30 shadow-luxury',
            };

            return (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl bg-charcoal/95 backdrop-blur-xl border ${borders[t.type]} shadow-2xl text-platinum`}
              >
                {icons[t.type]}
                <div className="flex-1 text-sm">
                  {t.title && <div className="font-semibold text-platinum text-xs tracking-wider uppercase mb-0.5">{t.title}</div>}
                  <div className="text-platinum-muted leading-relaxed text-xs sm:text-sm">{t.message}</div>
                </div>
                <button
                  onClick={() => removeToast(t.id)}
                  className="text-platinum-muted hover:text-platinum transition-colors p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
