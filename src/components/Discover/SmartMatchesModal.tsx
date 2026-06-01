import { motion, AnimatePresence } from 'framer-motion';
import ReactDOM from 'react-dom';
import { X, Brain, Sparkles, Zap, Target, GitBranch, Trophy, Clock, Check } from 'lucide-react';

interface SmartMatchesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MATCH_FACTORS = [
  { icon: Zap,       label: 'Skills Match',      desc: '35% — shared technologies', color: 'text-[#00e5ff]',  bg: 'bg-[#00e5ff]/10',  border: 'border-[#00e5ff]/20'  },
  { icon: Target,    label: 'Startup Intent',     desc: '20% — same builder goals',  color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20' },
  { icon: GitBranch, label: 'GitHub Similarity',  desc: '15% — coding patterns',     color: 'text-amber-400',  bg: 'bg-amber-500/10',  border: 'border-amber-500/20'  },
  { icon: Brain,     label: 'Builder Score',      desc: '10% — ambition level',      color: 'text-emerald-400',bg: 'bg-emerald-500/10',border: 'border-emerald-500/20'},
  { icon: Trophy,    label: 'Hackathon Activity', desc: '10% — event participation', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
  { icon: Clock,     label: 'Availability',       desc: '10% — build schedule',      color: 'text-pink-400',   bg: 'bg-pink-500/10',   border: 'border-pink-500/20'   },
];

const PRO_BENEFITS = [
  'Top 10 curated builder matches',
  'Full compatibility breakdown',
  'Smart "Why you match" insights',
  'Weekly fresh recommendations',
  'Builder Score comparisons',
];

export const SmartMatchesModal = ({ isOpen, onClose }: SmartMatchesModalProps) => {
  return ReactDOM.createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── Backdrop ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-[9998]"
          />

          {/* ── Scroll shell: fixed + overflow-y-auto so the modal is scrollable on short screens ── */}
          <div className="fixed inset-0 z-[9999] overflow-y-auto" onClick={onClose}>

            {/* Inner centering wrapper — min-h-full keeps items-center working even when content is taller than viewport */}
            <div className="flex min-h-full items-center justify-center p-4 sm:p-6">

              {/* ── Modal card ── */}
              <motion.div
                initial={{ opacity: 0, scale: 0.93, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 20 }}
                transition={{ type: 'spring', damping: 28, stiffness: 320 }}
                className="relative w-full max-w-lg"
                onClick={e => e.stopPropagation()}
              >
                <div className="relative bg-gradient-to-b from-[#13131a] to-[#0d0d12] border border-zinc-800/80 rounded-3xl shadow-2xl overflow-hidden">

                  {/* Glows */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-48 bg-[#00e5ff]/10 blur-[100px] pointer-events-none" />
                  <div className="absolute bottom-0 right-0 w-48 h-48 bg-violet-600/10 blur-[80px] pointer-events-none" />

                  {/* Close */}
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-xl hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>

                  <div className="relative p-6 sm:p-8">

                    {/* Header */}
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-[#00e5ff]/20 to-violet-600/20 border border-[#00e5ff]/30 mb-4 shadow-lg shadow-[#00e5ff]/10">
                        <Brain className="w-7 h-7 text-[#00e5ff]" />
                      </div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#00e5ff]/8 border border-[#00e5ff]/20 mb-3">
                        <Sparkles className="w-3 h-3 text-[#00e5ff]" />
                        <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">Merge Pro Feature</span>
                      </div>
                      <h2 className="text-2xl font-black text-white mb-2">AI Smart Matches</h2>
                      <p className="text-sm text-zinc-400 leading-relaxed">
                        Stop scrolling. Let our compatibility engine surface your best builder matches automatically.
                      </p>
                    </div>

                    {/* Example match preview */}
                    <div className="relative mb-5 bg-[#0a0a0e] border border-zinc-800/60 rounded-2xl p-4 overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff]/5 to-violet-600/5 pointer-events-none" />
                      <div className="relative flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                          <span className="text-xl">👤</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-black text-white">Example Match</p>
                          <p className="text-xs text-zinc-500">Full Stack + AI Engineer</p>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0">
                          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/25">
                            <Sparkles className="w-3 h-3 text-[#00e5ff]" />
                            <span className="text-sm font-black text-[#00e5ff]">94%</span>
                          </div>
                          <span className="text-[9px] text-zinc-600 font-bold mt-1 uppercase tracking-widest">Elite Match</span>
                        </div>
                      </div>
                      <div className="relative mt-3 pt-3 border-t border-zinc-800/50 space-y-1.5">
                        {['⚡ Both use React + AI', '🎯 Same cofounder goal', '🐙 Similar GitHub activity'].map(r => (
                          <p key={r} className="text-[11px] text-zinc-400 font-medium">{r}</p>
                        ))}
                      </div>
                    </div>

                    {/* Matching factors */}
                    <div className="mb-5">
                      <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-3">Matching Factors</p>
                      <div className="grid grid-cols-2 gap-2">
                        {MATCH_FACTORS.map(({ icon: Icon, label, desc, color, bg, border }) => (
                          <div key={label} className={`flex items-center gap-2.5 p-2.5 rounded-xl ${bg} border ${border}`}>
                            <Icon className={`w-4 h-4 ${color} flex-shrink-0`} />
                            <div className="min-w-0">
                              <p className={`text-[11px] font-black ${color} leading-tight`}>{label}</p>
                              <p className="text-[9px] text-zinc-600 font-semibold leading-tight truncate">{desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pro benefits */}
                    <div className="mb-5 p-4 bg-gradient-to-r from-violet-500/8 to-purple-600/8 border border-violet-500/20 rounded-2xl">
                      <p className="text-[10px] font-black text-violet-400 uppercase tracking-widest mb-3">🚀 What Pro unlocks</p>
                      <div className="space-y-2">
                        {PRO_BENEFITS.map(b => (
                          <div key={b} className="flex items-center gap-2.5">
                            <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                              <Check className="w-2.5 h-2.5 text-emerald-400" />
                            </div>
                            <span className="text-xs text-zinc-300 font-medium">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA */}
                    <button
                      disabled
                      className="w-full py-4 bg-gradient-to-r from-[#00e5ff] to-violet-500 text-[#0a0a0b] font-black rounded-2xl text-sm uppercase tracking-widest opacity-60 cursor-not-allowed shadow-lg shadow-[#00e5ff]/10"
                    >
                      Coming Soon — Merge Pro
                    </button>
                    <p className="text-center text-[10px] text-zinc-600 mt-3">
                      We're building something premium for serious builders.
                    </p>

                  </div>
                </div>
              </motion.div>

            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default SmartMatchesModal;
