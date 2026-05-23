import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, User, ArrowRight, Heart, ChevronRight, Brain } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import CompatibilityBadge from './CompatibilityBadge';
import { toast } from 'react-hot-toast';

interface MatchReason {
  icon: string;
  label: string;
  category: string;
}

interface RecommendedDev {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  intent?: string;
  experienceLevel?: string;
  location?: string;
  compatibilityScore: number;
  matchReasons: MatchReason[];
  compatibilityBreakdown?: Record<string, number>;
}

interface RecommendedSectionProps {
  onSwipeFromRecommended?: (direction: 'left' | 'right', devId: string) => void;
}

const RecommendedSection = ({ onSwipeFromRecommended }: RecommendedSectionProps) => {
  const [devs, setDevs]           = useState<RecommendedDev[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    const fetchRecommended = async () => {
      try {
        const res = await api.get('/swipe/recommended?limit=6');
        setDevs(res.data);
      } catch {
        // Silently fail — section just won't render
      } finally {
        setIsLoading(false);
      }
    };
    fetchRecommended();
  }, []);

  const handleConnect = async (dev: RecommendedDev) => {
    if (connectingId) return;
    setConnectingId(dev.id);
    try {
      const res = await api.post('/swipe/right', { receiverId: dev.id });
      setDismissed(prev => new Set([...prev, dev.id]));
      if (res.data.isMatch) {
        toast.success(`🎉 It's a match with ${dev.name}!`);
      } else {
        toast.success(`💌 Connect request sent to ${dev.name}`);
      }
      onSwipeFromRecommended?.('right', dev.id);
    } catch {
      toast.error('Failed to send connect request');
    } finally {
      setConnectingId(null);
    }
  };

  const handleDismiss = async (dev: RecommendedDev) => {
    setDismissed(prev => new Set([...prev, dev.id]));
    try {
      await api.post('/swipe/left', { receiverId: dev.id });
      onSwipeFromRecommended?.('left', dev.id);
    } catch { /* ignore */ }
  };

  const visible = devs.filter(d => !dismissed.has(d.id));

  if (isLoading) {
    return (
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-zinc-800 rounded-lg animate-pulse" />
          <div className="h-4 w-48 bg-zinc-800 rounded-full animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 bg-zinc-900/60 border border-zinc-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (visible.length === 0) return null;

  return (
    <div className="mb-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-cyan/10 border border-brand-cyan/20 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-brand-cyan" />
          </div>
          <div>
            <h3 className="text-sm font-black text-white tracking-tight">Recommended For You</h3>
            <p className="text-[10px] text-zinc-500 font-bold">AI-powered matches · V1 Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-cyan/5 border border-brand-cyan/15">
          <Sparkles className="w-3 h-3 text-brand-cyan" />
          <span className="text-[9px] font-black text-brand-cyan uppercase tracking-widest">{visible.length} picks</span>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <AnimatePresence mode="popLayout">
          {visible.map((dev, idx) => (
            <motion.div
              key={dev.id}
              layout
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ duration: 0.25, delay: idx * 0.06 }}
              onMouseEnter={() => setHoveredId(dev.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="relative group bg-zinc-900 border border-zinc-800 rounded-2xl p-4 overflow-hidden hover:border-zinc-700 transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,229,255,0.06)]"
            >
              {/* Glow Effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-cyan/[0.04] via-transparent to-brand-purple/[0.04] rounded-2xl" />
              </div>

              {/* Score Badge */}
              <div className="absolute top-3 right-3">
                <CompatibilityBadge score={dev.compatibilityScore} size="sm" />
              </div>

              {/* Avatar + Name */}
              <div className="flex items-start gap-3 mb-3">
                <div className="relative flex-shrink-0">
                  <div className="w-11 h-11 rounded-xl overflow-hidden bg-zinc-800 border border-zinc-700/50">
                    {dev.avatar ? (
                      <img src={dev.avatar} alt={dev.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-600">
                        <User className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border border-zinc-900" />
                </div>
                <div className="min-w-0 flex-1 pr-16">
                  <p className="text-sm font-bold text-white truncate">{dev.name}</p>
                  <p className="text-[10px] text-brand-cyan font-semibold uppercase tracking-wider truncate">
                    {dev.experienceLevel || 'Developer'}
                  </p>
                </div>
              </div>

              {/* Match Reasons */}
              {dev.matchReasons && dev.matchReasons.length > 0 && (
                <div className="mb-3 space-y-1">
                  {dev.matchReasons.slice(0, 2).map((reason, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-xs">{reason.icon}</span>
                      <span className="text-[10px] text-zinc-400 font-medium truncate">{reason.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Skills */}
              <div className="flex flex-wrap gap-1 mb-3">
                {(dev.skills || []).slice(0, 3).map(skill => (
                  <span key={skill} className="px-1.5 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.06] text-[9px] font-bold text-zinc-400">
                    {skill}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <AnimatePresence>
                {hoveredId === dev.id ? (
                  <motion.div
                    key="actions"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.15 }}
                    className="flex gap-2"
                  >
                    <button
                      onClick={() => handleDismiss(dev)}
                      className="flex-1 py-1.5 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-[10px] font-black text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-all uppercase tracking-widest"
                    >
                      Skip
                    </button>
                    <button
                      onClick={() => handleConnect(dev)}
                      disabled={connectingId === dev.id}
                      className="flex-[2] flex items-center justify-center gap-1.5 py-1.5 rounded-xl bg-brand-cyan text-dark-bg text-[10px] font-black hover:opacity-90 transition-all uppercase tracking-widest shadow-lg shadow-brand-cyan/20 disabled:opacity-50"
                    >
                      {connectingId === dev.id ? (
                        <span className="animate-pulse">Sending…</span>
                      ) : (
                        <>
                          <Heart className="w-3 h-3 fill-dark-bg" />
                          Connect
                        </>
                      )}
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="footer"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between"
                  >
                    <Link
                      to={`/profile/${dev.id}`}
                      className="flex items-center gap-1 text-[10px] font-bold text-zinc-500 hover:text-white transition-colors"
                    >
                      View profile
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                    <span className="text-[9px] text-zinc-600 font-bold uppercase">
                      {dev.intent || 'Open to connect'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* "See All" link */}
      <div className="mt-3 flex justify-end">
        <button
          onClick={() => window.scrollTo({ top: 999, behavior: 'smooth' })}
          className="flex items-center gap-1 text-[10px] font-black text-zinc-500 hover:text-brand-cyan transition-colors uppercase tracking-widest"
        >
          Discover more in the stack below
          <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
};

export default RecommendedSection;
