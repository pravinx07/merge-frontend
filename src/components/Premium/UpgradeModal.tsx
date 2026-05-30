import { motion, AnimatePresence } from 'framer-motion';
import { X, Rocket, Check, Sparkles, Zap, Eye, TrendingUp } from 'lucide-react';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FEATURES = [
  { icon: Sparkles, label: 'Advanced Filters', desc: 'Find builders with precision' },
  { icon: Zap, label: 'AI Smart Matches', desc: 'AI-powered recommendations' },
  { icon: Eye, label: 'Profile Visitors', desc: 'See who viewed your profile' },
  { icon: TrendingUp, label: 'Boost Profile', desc: 'Get more visibility' },
];

export const UpgradeModal = ({ isOpen, onClose }: UpgradeModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 flex items-center justify-center z-[90] p-4"
          >
            <div className="relative w-full max-w-md bg-gradient-to-b from-[#151518] to-[#0d0d0f] border border-zinc-800/70 rounded-3xl overflow-hidden shadow-2xl">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors z-10"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Glow effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-violet-500/20 blur-[100px] pointer-events-none" />

              {/* Content */}
              <div className="relative p-8">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 mb-4 shadow-lg shadow-violet-500/25">
                    <Rocket className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-white mb-2">Merge Pro</h2>
                  <p className="text-sm text-zinc-400">Unlock premium builder tools</p>
                </div>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {FEATURES.map(({ icon: Icon, label, desc }) => (
                    <div
                      key={label}
                      className="flex items-center gap-4 p-4 bg-white/[0.02] border border-zinc-800/50 rounded-2xl"
                    >
                      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <Icon className="w-5 h-5 text-violet-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-white">{label}</p>
                        <p className="text-xs text-zinc-500">{desc}</p>
                      </div>
                      <Check className="w-5 h-5 text-emerald-400" />
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className="w-full py-4 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:opacity-90 active:scale-[0.98] transition-all shadow-lg shadow-violet-500/25 cursor-not-allowed opacity-80"
                  disabled
                >
                  Coming Soon
                </button>

                <p className="text-center text-[10px] text-zinc-600 mt-4">
                  We're working hard to bring you these features
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default UpgradeModal;
