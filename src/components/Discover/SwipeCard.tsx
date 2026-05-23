import { useState } from 'react';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { User, MapPin, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompatibilityBadge from './CompatibilityBadge';

interface MatchReason {
  icon: string;
  label: string;
  category: string;
}

interface SwipeCardProps {
  developer: any;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

const SwipeCard = ({ developer, onSwipe, isTop }: SwipeCardProps) => {
  const [showReasons, setShowReasons] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);

  const heartOpacity = useTransform(x, [50, 150], [0, 1]);
  const xOpacity     = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100)       onSwipe('right');
    else if (info.offset.x < -100) onSwipe('left');
  };

  const reasons: MatchReason[] = developer.matchReasons || [];
  const score: number = developer.compatibilityScore ?? 0;

  if (!isTop) {
    return (
      <div className="absolute inset-0 bg-zinc-900/40 border border-zinc-800/50 rounded-[32px] p-6 shadow-2xl scale-[0.95] translate-y-4">
        <div className="w-full h-full opacity-20 pointer-events-none">
          <div className="w-24 h-24 bg-zinc-800 rounded-3xl mx-auto mb-6" />
          <div className="h-4 bg-zinc-800 rounded-full w-3/4 mx-auto mb-3" />
          <div className="h-3 bg-zinc-800 rounded-full w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.05 }}
      className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-[28px] md:rounded-[32px] shadow-2xl cursor-grab active:cursor-grabbing z-20 overflow-hidden"
    >
      {/* Swipe Indicators */}
      <motion.div
        style={{ opacity: heartOpacity }}
        className="absolute top-6 right-6 md:top-8 md:right-8 z-30 bg-green-500/20 border-2 border-green-500 rounded-xl px-4 py-1 md:px-6 md:py-2 rotate-12"
      >
        <span className="text-green-500 font-black text-xl md:text-2xl uppercase tracking-wider">Match</span>
      </motion.div>
      <motion.div
        style={{ opacity: xOpacity }}
        className="absolute top-6 left-6 md:top-8 md:left-8 z-30 bg-red-500/20 border-2 border-red-500 rounded-xl px-4 py-1 md:px-6 md:py-2 -rotate-12"
      >
        <span className="text-red-500 font-black text-xl md:text-2xl uppercase tracking-wider">Skip</span>
      </motion.div>

      {/* Main Content */}
      <div className="relative h-full flex flex-col p-5 pb-3 md:p-6 md:pb-4">
        {/* Score Badge */}
        <div className="absolute top-0 right-0">
          <CompatibilityBadge score={score} />
        </div>

        {/* Avatar + Info */}
        <div className="flex flex-col items-center text-center mt-1 md:mt-2">
          <div className="relative mb-3 md:mb-4">
            <div className="w-20 h-20 md:w-28 md:h-28 rounded-[20px] md:rounded-[28px] overflow-hidden bg-zinc-800 border-2 border-zinc-700/50 shadow-2xl">
              {developer.avatar ? (
                <img src={developer.avatar} alt={developer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                  <User className="w-8 h-8 md:w-12 md:h-12" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-zinc-900" />
          </div>

          <h2 className="text-xl md:text-2xl font-bold text-white mb-0.5">{developer.name}</h2>
          <p className="text-[10px] md:text-xs font-semibold text-brand-cyan uppercase tracking-widest mb-1.5">
            {developer.experienceLevel || 'Full Stack Developer'}
          </p>

          <div className="flex items-center gap-1.5 text-zinc-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-2 md:mb-3">
            <MapPin className="w-3 h-3" />
            {developer.location || 'Remote'}
          </div>

          <p className="text-[10px] md:text-xs text-zinc-400 leading-relaxed mb-3 max-w-sm line-clamp-2">
            {developer.bio || 'Passionate builder focused on innovative solutions. Always looking for great collaborators.'}
          </p>

          {/* Skills chips */}
          <div className="flex flex-wrap justify-center gap-1.5 mb-3">
            {(developer.skills || []).slice(0, 3).map((skill: string) => (
              <span key={skill} className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/5 text-[9px] md:text-[10px] font-bold text-zinc-300">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* ── Why Matched Panel ── */}
        {reasons.length > 0 && (
          <div className="mt-auto">
            <button
              onClick={(e) => { e.stopPropagation(); setShowReasons(v => !v); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5 hover:bg-white/[0.06] transition-all text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white"
              onPointerDown={e => e.stopPropagation()}
            >
              <span>✨ Why you match</span>
              {showReasons ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {showReasons && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: 'easeOut' }}
                  className="overflow-hidden"
                  onPointerDown={e => e.stopPropagation()}
                >
                  <div className="pt-2 grid grid-cols-2 gap-1.5">
                    {reasons.map((reason, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-brand-cyan/5 border border-brand-cyan/10"
                      >
                        <span className="text-sm">{reason.icon}</span>
                        <span className="text-[9px] font-bold text-zinc-300 leading-tight">{reason.label}</span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Footer */}
        <div className="mt-2 pt-2.5 border-t border-zinc-800/50 flex items-center justify-between">
          <Link
            to={`/profile/${developer.id}`}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-[9px] md:text-[10px] font-bold uppercase tracking-widest"
          >
            <Eye className="w-3.5 h-3.5" />
            Profile
          </Link>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
            <span className="text-[8px] md:text-[9px] font-black text-zinc-600 uppercase">Goal:</span>
            <span className="text-[8px] md:text-[9px] font-bold text-brand-purple uppercase">
              {developer.intent || 'Collaboration'}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
