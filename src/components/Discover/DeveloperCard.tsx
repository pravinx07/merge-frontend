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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="group relative bg-dark-card/40 backdrop-blur-xl border border-dark-border rounded-3xl overflow-hidden shadow-2xl hover:border-brand-cyan/30 transition-all duration-300"
    >
      {/* Compatibility Badge */}
      <div className="absolute top-4 right-4 z-10">
        <CompatibilityBadge score={developer.compatibilityScore} />
      </div>

      {/* Profile Image & Basic Info */}
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl overflow-hidden bg-slate-900 border border-dark-border group-hover:border-brand-cyan/50 transition-colors">
              {developer.avatar ? (
                <img src={developer.avatar} alt={developer.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-500">
                  <User className="w-7 h-7" />
                </div>
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-dark-bg"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white truncate">{developer.name}</h3>
            <p className="text-xs text-slate-400 truncate">{developer.experienceLevel || 'Developer'}</p>
            <div className="flex items-center gap-1 mt-0.5 text-[9px] text-slate-500 font-medium uppercase tracking-wider">
              <MapPin className="w-2.5 h-2.5" />
              {developer.location || 'Remote'}
            </div>
          </div>
        </div>

        {/* Bio */}
        <p className="text-xs text-slate-400 line-clamp-2 mb-4 h-8 italic">
          {developer.bio || "Building something amazing. Let's connect!"}
        </p>

        {/* Skills */}
        <div className="flex flex-wrap gap-1 mb-5 h-[44px] overflow-hidden">
          {developer.skills.slice(0, 5).map(skill => (
            <span key={skill} className="px-2 py-0.5 rounded-lg bg-white/5 border border-dark-border text-[10px] font-medium text-slate-300">
              {skill}
            </span>
          ))}
          {developer.skills.length > 5 && (
            <span className="px-2 py-0.5 rounded-lg bg-white/5 border border-dark-border text-[10px] font-medium text-slate-500">
              +{developer.skills.length - 5}
            </span>
          )}
        </div>

        {/* Intent */}
        <div className="flex items-center gap-2 py-2 px-3 rounded-xl bg-slate-900/50 border border-dark-border mb-5">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Looking for:</span>
          <span className="text-[10px] font-bold text-brand-purple">{developer.intent || 'Collaboration'}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          <Link 
            to={`/profile/${developer.id}`}
            className="flex items-center justify-center gap-2 py-2 rounded-xl border border-dark-border text-[10px] font-bold text-slate-300 hover:bg-white/5 transition-all"
          >
            <Eye className="w-3.5 h-3.5" />
            Profile
          </Link>
          <button 
            onClick={() => onLike(developer.id)}
            disabled={isLiked}
            className={`flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-bold transition-all shadow-lg ${
              isLiked 
                ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30 cursor-default' 
                : 'bg-brand-cyan text-dark-bg hover:scale-105 active:scale-95 cursor-pointer shadow-brand-cyan/20'
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
                Connect
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DeveloperCard;
