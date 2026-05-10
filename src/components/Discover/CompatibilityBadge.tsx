import { motion } from 'framer-motion';

const CompatibilityBadge = ({ score }: { score: number }) => {
  const getColor = (s: number) => {
    if (s >= 80) return 'text-brand-cyan border-brand-cyan/30 bg-brand-cyan/10';
    if (s >= 50) return 'text-brand-purple border-brand-purple/30 bg-brand-purple/10';
    return 'text-slate-400 border-slate-700 bg-slate-800/50';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`px-3 py-1 rounded-full border text-[10px] font-bold flex items-center gap-1.5 ${getColor(score)} shadow-[0_0_15px_rgba(0,0,0,0.2)]`}
    >
      <div className="w-1 h-1 rounded-full bg-current animate-pulse"></div>
      {score}% Match
    </motion.div>
  );
};

export default CompatibilityBadge;
