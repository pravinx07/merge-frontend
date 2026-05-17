import { usePWA } from '../context/PWAContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';

export const PWAInstallBanner = () => {
  const { isInstallable, isInstallDismissed, installApp, dismissInstall } = usePWA();

  // Only render if installable and not dismissed by the user in this session
  const showBanner = isInstallable && !isInstallDismissed;

  return (
    <AnimatePresence>
      {showBanner && (
        <div className="fixed bottom-6 left-0 right-0 z-[100] flex justify-center px-5 pointer-events-none">
          <motion.div
            initial={{ opacity: 0, y: 70, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.95 }}
            transition={{ type: 'spring', damping: 20, stiffness: 250 }}
            className="bg-dark-card/90 backdrop-blur-xl border border-white/10 p-3.5 rounded-2xl shadow-2xl flex items-center justify-between gap-5 max-w-md w-full pointer-events-auto"
          >
            {/* Left Side: App Icon */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 bg-linear-to-br from-brand-cyan to-brand-purple rounded-xl flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(0,229,255,0.3)]">
                <span className="text-white font-black text-lg italic tracking-tighter select-none">
                  M
                </span>
              </div>
              <div className="min-w-0">
                <h4 className="text-sm font-bold text-white tracking-tight truncate">
                  Install Merge
                </h4>
                <p className="text-[10px] md:text-xs text-slate-400 mt-0.5 truncate leading-relaxed">
                  Fast access · Add to home screen
                </p>
              </div>
            </div>

            {/* Right Side: Install Button & Close Icon */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={installApp}
                className="px-4 py-2 bg-brand-cyan text-dark-bg text-[10px] md:text-xs font-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.35)] flex items-center gap-1 cursor-pointer uppercase tracking-wider"
              >
                <Download className="w-3 h-3 stroke-[3]" />
                Install
              </button>
              
              <button
                onClick={dismissInstall}
                className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
