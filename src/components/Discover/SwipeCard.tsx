import React from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { Heart, X, User, MapPin, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompatibilityBadge from './CompatibilityBadge';

interface SwipeCardProps {
  developer: any;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

const SwipeCard = ({ developer, onSwipe, isTop }: SwipeCardProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  
  const heartOpacity = useTransform(x, [50, 150], [0, 1]);
  const xOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x > 100) {
      onSwipe('right');
    } else if (info.offset.x < -100) {
      onSwipe('left');
    }
  };

  if (!isTop) {
    return (
      <div className="absolute inset-0 bg-zinc-900/40 border border-zinc-800/50 rounded-[40px] p-8 shadow-2xl scale-[0.95] translate-y-4">
        <div className="w-full h-full opacity-20 pointer-events-none">
             {/* Background card content (blurred/simplified) */}
             <div className="w-32 h-32 bg-zinc-800 rounded-3xl mx-auto mb-8" />
             <div className="h-6 bg-zinc-800 rounded-full w-3/4 mx-auto mb-4" />
             <div className="h-4 bg-zinc-800 rounded-full w-1/2 mx-auto" />
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
      className="absolute inset-0 bg-zinc-900 border border-zinc-800 rounded-[32px] md:rounded-[40px] p-6 md:p-8 shadow-2xl cursor-grab active:cursor-grabbing z-20"
    >
      {/* Swipe Indicators */}
      <motion.div 
        style={{ opacity: heartOpacity }}
        className="absolute top-6 right-6 md:top-10 md:right-10 z-30 bg-green-500/20 border-2 border-green-500 rounded-xl md:rounded-2xl px-4 py-1 md:px-6 md:py-2 rotate-12"
      >
        <span className="text-green-500 font-black text-xl md:text-2xl uppercase tracking-wider">Match</span>
      </motion.div>

      <motion.div 
        style={{ opacity: xOpacity }}
        className="absolute top-6 left-6 md:top-10 md:left-10 z-30 bg-red-500/20 border-2 border-red-500 rounded-xl md:rounded-2xl px-4 py-1 md:px-6 md:py-2 -rotate-12"
      >
        <span className="text-red-500 font-black text-xl md:text-2xl uppercase tracking-wider">Skip</span>
      </motion.div>

      <div className="relative h-full flex flex-col">
        <div className="absolute top-0 right-0">
          <CompatibilityBadge score={developer.compatibilityScore} />
        </div>

        <div className="flex flex-col items-center text-center mt-2 md:mt-4">
          <div className="relative mb-4 md:mb-6">
            <div className="w-24 h-24 md:w-40 md:h-40 rounded-[24px] md:rounded-[40px] overflow-hidden bg-zinc-800 border-2 border-zinc-700/50 shadow-2xl">
                {developer.avatar ? (
                <img src={developer.avatar} alt={developer.name} className="w-full h-full object-cover" />
                ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600">
                    <User className="w-10 h-10 md:w-16 md:h-16" />
                </div>
                )}
            </div>
            <div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-green-500 border-4 border-zinc-900 shadow-xl"></div>
          </div>

          <h2 className="text-xl md:text-3xl font-bold text-white mb-0.5 md:mb-1">{developer.name}</h2>
          <p className="text-[10px] md:text-sm font-semibold text-brand-cyan uppercase tracking-widest mb-3 md:mb-4">
            {developer.experienceLevel || 'Full Stack Developer'}
          </p>
          
          <div className="flex items-center gap-1.5 md:gap-2 text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-widest mb-4 md:mb-8">
            <MapPin className="w-3 md:w-3.5 h-3 md:h-3.5" />
            {developer.location || 'Remote'}
          </div>

          <p className="text-[11px] md:text-sm text-zinc-400 leading-relaxed mb-4 md:mb-8 max-w-sm line-clamp-2 md:line-clamp-3">
            {developer.bio || "Passionate builder focused on AI and scalable systems. Always looking for innovative collaborators."}
          </p>

          <div className="flex flex-wrap justify-center gap-1.5 md:gap-2 mb-4 md:mb-8">
            {developer.skills.slice(0, 3).map((skill: string) => (
                <span key={skill} className="px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl bg-white/5 border border-white/5 text-[9px] md:text-[11px] font-bold text-zinc-300">
                    {skill}
                </span>
            ))}
          </div>

          <div className="mt-auto w-full pt-4 md:pt-8 border-t border-zinc-800/50 flex items-center justify-between">
            <Link 
              to={`/profile/${developer.id}`}
              className="flex items-center gap-1.5 md:gap-2 text-zinc-500 hover:text-white transition-colors text-[9px] md:text-xs font-bold uppercase tracking-widest"
            >
              <Eye className="w-3.5 md:w-4 h-3.5 md:h-4" />
              Profile
            </Link>
            <div className="flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50">
                <span className="text-[8px] md:text-[10px] font-black text-zinc-600 uppercase">Target:</span>
                <span className="text-[8px] md:text-[10px] font-bold text-brand-purple uppercase">{developer.intent || 'Collaboration'}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
