import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface PremiumFeatureLockProps {
  children: React.ReactNode;
  isLocked: boolean;
  onLockedClick: () => void;
  className?: string;
}

export const PremiumFeatureLock = ({ 
  children, 
  isLocked, 
  onLockedClick,
  className = '' 
}: PremiumFeatureLockProps) => {
  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <motion.div
      className={`relative cursor-pointer group ${className}`}
      onClick={onLockedClick}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Locked overlay */}
      <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-[1px] rounded-xl z-10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 border border-violet-500/30 rounded-lg">
          <Lock className="w-3 h-3 text-violet-400" />
          <span className="text-[10px] font-bold text-violet-400">Unlock Pro</span>
        </div>
      </div>
      
      {/* Content with reduced opacity */}
      <div className="opacity-50 pointer-events-none">
        {children}
      </div>
      
      {/* Lock icon */}
      <div className="absolute top-2 right-2 z-20">
        <div className="w-6 h-6 rounded-lg bg-zinc-800/90 border border-zinc-700 flex items-center justify-center">
          <Lock className="w-3 h-3 text-zinc-400" />
        </div>
      </div>
    </motion.div>
  );
};

export default PremiumFeatureLock;
