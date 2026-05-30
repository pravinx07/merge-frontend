import { Crown } from 'lucide-react';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProBadge = ({ size = 'sm', className = '' }: ProBadgeProps) => {
  const sizes = {
    sm: 'text-[8px] px-1.5 py-0.5 gap-0.5',
    md: 'text-[10px] px-2 py-1 gap-1',
    lg: 'text-xs px-3 py-1.5 gap-1.5',
  };

  const iconSizes = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  return (
    <span
      className={`inline-flex items-center ${sizes[size]} rounded-full bg-gradient-to-r from-violet-500/20 to-purple-500/20 border border-violet-500/30 text-violet-400 font-black uppercase tracking-wider ${className}`}
    >
      <Crown className={iconSizes[size]} />
      Pro
    </span>
  );
};

export default ProBadge;
