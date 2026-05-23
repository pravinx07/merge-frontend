import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, X, ChevronRight, Cpu } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
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
}

interface RecommendedSectionProps {
  onSwipeFromRecommended?: (direction: 'left' | 'right', devId: string) => void;
  fallback?: React.ReactNode;
}

/* ── Score colour map ──────────────────────────────────────────── */
const scoreStyle = (s: number) => {
  if (s >= 80) return { ring: '#00e5ff', textCls: 'text-[#00e5ff]', bgCls: 'bg-[#00e5ff]/10', borderCls: 'border-[#00e5ff]/25', label: 'Elite' };
  if (s >= 60) return { ring: '#7c3aed', textCls: 'text-violet-400', bgCls: 'bg-violet-500/10', borderCls: 'border-violet-500/25', label: 'Strong' };
  if (s >= 35) return { ring: '#f59e0b', textCls: 'text-amber-400', bgCls: 'bg-amber-500/10', borderCls: 'border-amber-500/25', label: 'Good' };
  return { ring: '#6b7280', textCls: 'text-zinc-400', bgCls: 'bg-zinc-800/50', borderCls: 'border-zinc-700', label: 'Match' };
};

/* ── Inline mini ring ───────────────────────────────────────────── */
const MiniRing = ({ score }: { score: number }) => {
  const { ring, textCls, label } = scoreStyle(score);
  const r = 14; const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-9 h-9">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
          <motion.circle cx="18" cy="18" r={r} fill="none" stroke={ring} strokeWidth="3.5"
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${textCls}`}>
          {score}
        </span>
      </div>
      <div>
        <p className={`text-[10px] font-black ${textCls}`}>{score}%</p>
        <p className="text-[9px] text-zinc-600 font-bold">{label}</p>
      </div>
    </div>
  );
};

/* ── Main Component ─────────────────────────────────────────────── */
const RecommendedSection = ({ onSwipeFromRecommended, fallback }: RecommendedSectionProps) => {
  const [devs, setDevs]               = useState<RecommendedDev[]>([]);
  const [isLoading, setIsLoading]     = useState(true);
  const [dismissed, setDismissed]     = useState<Set<string>>(new Set());
  const [connectingId, setConnectingId] = useState<string | null>(null);

  useEffect(() => {
    api.get('/swipe/recommended?limit=6')
      .then(r => setDevs(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const handleConnect = async (dev: RecommendedDev) => {
    if (connectingId) return;
    setConnectingId(dev.id);
    try {
      const res = await api.post('/swipe/right', { receiverId: dev.id });
      setDismissed(p => new Set([...p, dev.id]));
      if (res.data.isMatch) toast.success(`🎉 It's a match with ${dev.name}!`);
      else                  toast.success(`💌 Connect request sent to ${dev.name}`);
      onSwipeFromRecommended?.('right', dev.id);
    } catch { toast.error('Failed'); }
    finally  { setConnectingId(null); }
  };

  const handleSkip = async (dev: RecommendedDev) => {
    setDismissed(p => new Set([...p, dev.id]));
    try { await api.post('/swipe/left', { receiverId: dev.id }); } catch {}
    onSwipeFromRecommended?.('left', dev.id);
  };

  const visible = devs.filter(d => !dismissed.has(d.id));

  /* ── Loading skeleton ── */
  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="h-5 w-52 bg-zinc-800 rounded-full animate-pulse mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-44 bg-zinc-900/70 border border-zinc-800/50 rounded-3xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (visible.length === 0) return fallback ? <>{fallback}</> : null;

  return (
    <div className="mb-10">
      {/* ── Section header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          {/* Animated icon badge */}
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00e5ff]/20 to-violet-600/20 border border-[#00e5ff]/20 flex items-center justify-center">
              <Cpu className="w-4.5 h-4.5 text-[#00e5ff]" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00e5ff] rounded-full border-2 border-[#0a0a0b] animate-pulse" />
          </div>
          <div>
            <h3 className="text-[15px] font-black text-white tracking-tight">Recommended For You</h3>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">AI Compatibility Engine · V1</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00e5ff]/8 border border-[#00e5ff]/15">
          <Sparkles className="w-3 h-3 text-[#00e5ff]" />
          <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">{visible.length} picks</span>
        </div>
      </div>

      {/* ── Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {visible.map((dev, idx) => {
            const {  textCls } = scoreStyle(dev.compatibilityScore);
            const avatarUrl = dev.avatar ||
              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dev.name)}`;

            return (
              <motion.div
                key={dev.id}
                layout
                initial={{ opacity: 0, y: 16, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92, y: -8 }}
                transition={{ duration: 0.3, delay: idx * 0.07 }}
                className="group relative bg-[#111114] border border-zinc-800/70 rounded-3xl overflow-hidden hover:border-zinc-700 transition-all duration-300"
              >
                {/* Subtle top gradient accent */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00e5ff]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Inner glow on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#00e5ff]/[0.03] via-transparent to-violet-600/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />

                <div className="relative p-4">
                  {/* ── Top row: avatar + name + score ── */}
                  <div className="flex items-center gap-3 mb-3.5">
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-zinc-700/60 shadow-lg">
                        <img src={avatarUrl} alt={dev.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#111114]" />
                    </div>

                    {/* Name + Level */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-black text-white truncate leading-tight">{dev.name}</p>
                      <p className={`text-[10px] font-bold uppercase tracking-wider truncate mt-0.5 ${textCls}`}>
                        {dev.experienceLevel || 'Developer'}
                      </p>
                      {dev.intent && (
                        <div className="flex items-center gap-1 mt-0.5">
                          <span className="text-[9px] text-zinc-600 font-semibold">{dev.intent}</span>
                        </div>
                      )}
                    </div>

                    {/* Score ring */}
                    <div className="flex-shrink-0">
                      <MiniRing score={dev.compatibilityScore} />
                    </div>
                  </div>

                  {/* ── Match Reasons ── */}
                  {dev.matchReasons && dev.matchReasons.length > 0 && (
                    <div className="mb-3">
                      {dev.matchReasons.slice(0, 2).map((r, i) => (
                        <div key={i} className="flex items-center gap-1.5 py-0.5">
                          <span className="text-sm leading-none">{r.icon}</span>
                          <span className="text-[10px] text-zinc-400 font-medium leading-snug truncate">{r.label}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── Skills ── */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(dev.skills || []).slice(0, 3).map(skill => (
                      <span key={skill}
                        className="px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.07] text-[9px] font-bold text-zinc-400"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* ── Action buttons (always visible) ── */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSkip(dev)}
                      className="flex items-center justify-center gap-1 flex-1 py-2 rounded-2xl bg-zinc-800/80 border border-zinc-700/50 text-[10px] font-black text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-all uppercase tracking-widest"
                    >
                      <X className="w-3 h-3" />
                      Skip
                    </button>
                    <button
                      onClick={() => handleConnect(dev)}
                      disabled={connectingId === dev.id}
                      className="flex items-center justify-center gap-1.5 flex-[2] py-2 rounded-2xl bg-[#00e5ff] text-[#0a0a0b] text-[10px] font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest shadow-lg shadow-[#00e5ff]/20 disabled:opacity-50"
                    >
                      {connectingId === dev.id ? (
                        <span className="animate-pulse">Sending…</span>
                      ) : (
                        <>
                          <Heart className="w-3 h-3 fill-[#0a0a0b]" />
                          Connect
                        </>
                      )}
                    </button>
                  </div>

                  {/* Profile link */}
                  <Link
                    to={`/profile/${dev.id}`}
                    className="flex items-center justify-center gap-1 mt-2.5 text-[9px] font-bold text-zinc-600 hover:text-zinc-300 transition-colors uppercase tracking-widest"
                  >
                    View full profile
                    <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RecommendedSection;
