import { motion } from 'framer-motion';

interface CompatibilityBadgeProps {
  score: number;
  size?: 'sm' | 'md';
}

const getColors = (s: number) => {
  if (s >= 80) return { text: 'text-[#00e5ff]', border: 'border-[#00e5ff]/30', bg: 'bg-[#00e5ff]/10', dot: 'bg-[#00e5ff]', label: 'Elite' };
  if (s >= 60) return { text: 'text-violet-400', border: 'border-violet-500/30', bg: 'bg-violet-500/10', dot: 'bg-violet-400', label: 'Strong' };
  if (s >= 35) return { text: 'text-amber-400',  border: 'border-amber-500/30',  bg: 'bg-amber-500/10',  dot: 'bg-amber-400',  label: 'Good' };
  return         { text: 'text-zinc-400',    border: 'border-zinc-700',      bg: 'bg-zinc-800/60',   dot: 'bg-zinc-500',   label: '' };
};

const CompatibilityBadge = ({ score, size = 'sm' }: CompatibilityBadgeProps) => {
  const { text, border, bg, dot, label } = getColors(score);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.75 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${text} ${border} ${bg}
        ${size === 'md' ? 'text-xs' : 'text-[10px]'} font-black`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse`} />
      {score}%{label ? ` ${label}` : ' Match'}
    </motion.div>
  );
};

export default CompatibilityBadge;
