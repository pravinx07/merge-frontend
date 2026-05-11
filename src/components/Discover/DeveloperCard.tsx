import { motion } from 'framer-motion';
import { User, MapPin, Heart, Eye, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import CompatibilityBadge from './CompatibilityBadge';

interface Developer {
  id: string;
  name: string;
  avatar: string | null;
  bio: string | null;
  skills: string[];
  experienceLevel: string | null;
  intent: string | null;
  location: string | null;
  compatibilityScore: number;
}

interface Props {
  developer: Developer;
  onLike: (id: string) => void;
  isLiked?: boolean;
}

const DeveloperCard = ({ developer, onLike, isLiked }: Props) => {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 transition-all duration-300"
    >
      <div className="absolute top-4 right-4 z-10">
        <CompatibilityBadge score={developer.compatibilityScore} />
      </div>

      <div className="flex items-start gap-4 mb-4">
        <div className="relative shrink-0">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50 group-hover:border-brand-cyan/50 transition-colors">
            {developer.avatar ? (
              <img src={developer.avatar} alt={developer.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-600">
                <User className="w-6 h-6" />
              </div>
            )}
          </div>
          <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-[#0A0A0B]"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-white truncate group-hover:text-brand-cyan transition-colors">{developer.name}</h3>
          <p className="text-[11px] text-zinc-400 truncate font-medium">{developer.experienceLevel || 'Developer'}</p>
          <div className="flex items-center gap-1 mt-0.5 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
            <MapPin className="w-2.5 h-2.5" />
            {developer.location || 'Remote'}
          </div>
        </div>
      </div>

      <p className="text-[11px] text-zinc-400 line-clamp-2 mb-4 h-8 leading-relaxed">
        {developer.bio || "Building something amazing. Let's connect!"}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-5 h-[40px] overflow-hidden">
        {developer.skills.slice(0, 3).map(skill => (
          <span key={skill} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-medium text-zinc-400">
            {skill}
          </span>
        ))}
        {developer.skills.length > 3 && (
          <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-medium text-zinc-600">
            +{developer.skills.length - 3}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-zinc-900/50 border border-zinc-800/50 mb-5">
        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Target:</span>
        <span className="text-[10px] font-bold text-brand-purple truncate">{developer.intent || 'Collaboration'}</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link 
          to={`/profile/${developer.id}`}
          className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-zinc-800 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
        >
          <Eye className="w-3.5 h-3.5" />
          Profile
        </Link>
        <button 
          onClick={() => onLike(developer.id)}
          disabled={isLiked}
          className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold transition-all ${
            isLiked 
              ? 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20 cursor-default' 
              : 'bg-brand-cyan text-dark-bg hover:scale-105 active:scale-95 cursor-pointer shadow-lg shadow-brand-cyan/10'
          }`}
        >
          {isLiked ? (
            <>
              <Check className="w-3.5 h-3.5" />
              Sent
            </>
          ) : (
            <>
              <Heart className="w-3.5 h-3.5" />
              Match
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
};

export default DeveloperCard;
