import { usePWA } from '../context/PWAContext';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCw, Wifi, X } from 'lucide-react';

export const PWAPrompt = () => {
  const { needRefresh, offlineReady, updateServiceWorker, closePrompt } = usePWA();

  const handleUpdate = () => {
    updateServiceWorker(true);
  };

  return (
    <AnimatePresence>
      {(needRefresh || offlineReady) && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 30, scale: 0.95 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="fixed bottom-6 right-6 z-[100] max-w-sm w-[calc(100vw-3rem)] bg-dark-card/85 backdrop-blur-xl border border-white/10 p-4 rounded-2xl shadow-2xl flex flex-col gap-3"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-3 items-center">
              <div className="w-10 h-10 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center text-brand-purple shadow-[0_0_15px_rgba(124,58,237,0.15)] flex-shrink-0 animate-pulse">
                {needRefresh ? (
                  <RefreshCw className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                ) : (
                  <Wifi className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {needRefresh ? 'Update Available' : 'Ready Offline'}
                </h4>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  {needRefresh
                    ? 'A new version of Merge is ready. Reload to experience the latest features!'
                    : 'Merge has been cached. You can now use the application offline!'}
                </p>
              </div>
            </div>
            <button
              onClick={closePrompt}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-all flex-shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {needRefresh && (
            <div className="flex justify-end gap-2 border-t border-white/5 pt-3">
              <button
                onClick={closePrompt}
                className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Later
              </button>
              <button
                onClick={handleUpdate}
                className="px-4 py-1.5 rounded-lg bg-linear-to-r from-brand-cyan to-brand-purple text-dark-bg font-black text-xs uppercase tracking-wider shadow-lg shadow-brand-cyan/20 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                Reload
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
