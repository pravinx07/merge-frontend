import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export const StatCard = ({ icon, val, label, isLive }: { icon: any, val: string, label: string, isLive?: boolean }) => {
  const [displayVal, setDisplayVal] = useState(val);

  useEffect(() => {
    if (isLive) {
      const interval = setInterval(() => {
        // Subtle live updates simulation
        const base = parseInt(val.replace(/[,+]/g, ''));
        if (!isNaN(base)) {
          const randomChange = Math.floor(Math.random() * 5);
          const newVal = (base + randomChange).toLocaleString() + (val.includes('+') ? '+' : '');
          setDisplayVal(newVal);
        }
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [val, isLive]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5, borderColor: 'rgba(124, 58, 237, 0.5)' }}
      className="relative flex items-center gap-4 p-6 rounded-2xl bg-dark-card/70 backdrop-blur-xl border border-dark-border transition-colors group"
    >
      {isLive && (
        <div className="absolute top-4 right-4 flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">Live</span>
        </div>
      )}
      
      <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-brand-cyan group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold text-white flex items-baseline gap-1">
          <motion.span
            key={displayVal}
            initial={{ opacity: 0.5, y: -2 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {displayVal}
          </motion.span>
        </div>
        <div className="text-xs text-slate-500 uppercase tracking-widest">{label}</div>
      </div>

      {/* Subtle border pulse for live cards */}
      {isLive && (
        <div className="absolute inset-0 rounded-2xl border border-brand-cyan/20 animate-pulse pointer-events-none"></div>
      )}
    </motion.div>
  );
};
