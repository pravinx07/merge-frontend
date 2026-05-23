import { motion } from 'framer-motion';

interface CompatibilityBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showRing?: boolean;
}

const CompatibilityBadge = ({ score, size = 'sm', showRing = false }: CompatibilityBadgeProps) => {
  const getColorClass = (s: number) => {
    if (s >= 80) return { text: 'text-brand-cyan',   border: 'border-brand-cyan/40',  bg: 'bg-brand-cyan/10',   glow: 'shadow-[0_0_16px_rgba(0,229,255,0.3)]',   ring: '#00e5ff' };
    if (s >= 60) return { text: 'text-brand-purple', border: 'border-brand-purple/40',bg: 'bg-brand-purple/10', glow: 'shadow-[0_0_16px_rgba(124,58,237,0.3)]',  ring: '#7c3aed' };
    if (s >= 35) return { text: 'text-amber-400',    border: 'border-amber-400/40',   bg: 'bg-amber-400/10',    glow: 'shadow-[0_0_16px_rgba(251,191,36,0.3)]',  ring: '#fbbf24' };
    return        { text: 'text-slate-400',    border: 'border-slate-700',      bg: 'bg-slate-800/50',    glow: '',                                         ring: '#64748b' };
  };

  const colors = getColorClass(score);

  const label = score >= 80 ? 'Elite Match' : score >= 60 ? 'Strong Match' : score >= 35 ? 'Good Match' : 'Match';

  if (showRing) {
    const radius = 22;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;

    return (
      <div className="flex flex-col items-center gap-1.5">
        <div className="relative w-16 h-16">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 56 56">
            {/* Track */}
            <circle cx="28" cy="28" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="4" />
            {/* Progress */}
            <motion.circle
              cx="28" cy="28" r={radius}
              fill="none"
              stroke={colors.ring}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: offset }}
              transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-sm font-black ${colors.text}`}>{score}%</span>
          </div>
        </div>
        <span className={`text-[9px] font-black uppercase tracking-widest ${colors.text}`}>{label}</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`px-3 py-1 rounded-full border text-[10px] font-black flex items-center gap-1.5 ${colors.text} ${colors.border} ${colors.bg} ${colors.glow}`}
    >
      <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
      {score}% {size !== 'sm' ? label : 'Match'}
    </motion.div>
  );
};

export default CompatibilityBadge;
