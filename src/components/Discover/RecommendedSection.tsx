import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Heart, X, ChevronRight, Brain, Lock,
  Zap, Target, GitBranch, Trophy, ChevronDown, ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../lib/axios';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import SmartMatchesModal from './SmartMatchesModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface MatchReason {
  icon: string;
  label: string;
  category: string;
}

interface CompatibilityBreakdown {
  skills: number;
  projects: number;
  intent: number;
  github: number;
  hackathon: number;
  location: number;
}

interface SmartDev {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  intent?: string;
  experienceLevel?: string;
  location?: string;
  builderScore?: number;
  builderLevel?: string;
  compatibilityScore: number;
  matchReasons: MatchReason[];
  compatibilityBreakdown: CompatibilityBreakdown;
}

interface RecommendedSectionProps {
  intent?: string;
  onSwipeFromRecommended?: (direction: 'left' | 'right', devId: string) => void;
  fallback?: React.ReactNode;
  onUpgrade?: () => void;
}

// ─── Score style helpers ──────────────────────────────────────────────────────

const scoreStyle = (s: number) => {
  if (s >= 80) return { ring: '#00e5ff', textCls: 'text-[#00e5ff]', bgCls: 'bg-[#00e5ff]/10', borderCls: 'border-[#00e5ff]/25', label: 'Elite' };
  if (s >= 60) return { ring: '#7c3aed', textCls: 'text-violet-400', bgCls: 'bg-violet-500/10', borderCls: 'border-violet-500/25', label: 'Strong' };
  if (s >= 35) return { ring: '#f59e0b', textCls: 'text-amber-400', bgCls: 'bg-amber-500/10', borderCls: 'border-amber-500/25', label: 'Good' };
  return { ring: '#6b7280', textCls: 'text-zinc-400', bgCls: 'bg-zinc-800/50', borderCls: 'border-zinc-700', label: 'Match' };
};

const BREAKDOWN_META: Record<keyof CompatibilityBreakdown, { icon: typeof Zap; label: string; color: string; max: number }> = {
  skills:    { icon: Zap,       label: 'Skills',    color: 'text-[#00e5ff]',   max: 30 },
  projects:  { icon: GitBranch, label: 'Projects',  color: 'text-violet-400',  max: 20 },
  intent:    { icon: Target,    label: 'Intent',    color: 'text-emerald-400', max: 20 },
  github:    { icon: GitBranch, label: 'GitHub',    color: 'text-amber-400',   max: 15 },
  hackathon: { icon: Trophy,    label: 'Hackathon', color: 'text-orange-400',  max: 10 },
  location:  { icon: Zap,       label: 'Location',  color: 'text-pink-400',    max: 5  },
};

// ─── Mini score ring ──────────────────────────────────────────────────────────

const MiniRing = ({ score }: { score: number }) => {
  const { ring, textCls, label } = scoreStyle(score);
  const r = 14; const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative w-10 h-10">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3.5" />
          <motion.circle cx="18" cy="18" r={r} fill="none" stroke={ring} strokeWidth="3.5"
            strokeLinecap="round" strokeDasharray={c}
            initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: off }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[10px] font-black ${textCls}`}>
          {score}
        </span>
      </div>
      <div>
        <p className={`text-[11px] font-black ${textCls}`}>{score}%</p>
        <p className="text-[9px] text-zinc-600 font-bold">{label}</p>
      </div>
    </div>
  );
};

// ─── Breakdown bar ────────────────────────────────────────────────────────────

const BreakdownBar = ({ label, value, max, color }: { label: string; value: number; max: number; color: string }) => {
  const pct = Math.round((value / max) * 100);
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] font-bold text-zinc-600 w-14 shrink-0 uppercase tracking-wide">{label}</span>
      <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full bg-current ${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
      <span className={`text-[9px] font-black w-6 text-right ${color}`}>{value}</span>
    </div>
  );
};

// ─── Pro Blur Overlay (for free users) ────────────────────────────────────────

const ProBlurOverlay = ({ onUpgrade }: { onUpgrade: () => void }) => (
  <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl overflow-hidden">
    {/* Frosted glass */}
    <div className="absolute inset-0 backdrop-blur-md bg-[#0a0a0b]/70 rounded-3xl" />
    <div className="relative z-10 flex flex-col items-center gap-3 px-4 text-center">
      <div className="w-10 h-10 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/30 flex items-center justify-center">
        <Lock className="w-5 h-5 text-[#00e5ff]" />
      </div>
      <div>
        <p className="text-sm font-black text-white">PRO Only</p>
        <p className="text-[10px] text-zinc-500 mt-0.5">Unlock AI Smart Matches</p>
      </div>
      <button
        onClick={onUpgrade}
        className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00e5ff] to-violet-500 text-[#0a0a0b] text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#00e5ff]/20"
      >
        Upgrade to Pro
      </button>
    </div>
  </div>
);

// ─── Smart Match Card ─────────────────────────────────────────────────────────

interface SmartCardProps {
  dev: SmartDev;
  idx: number;
  isPro: boolean;
  isBlurred: boolean;
  connectingId: string | null;
  onConnect: (dev: SmartDev) => void;
  onSkip: (dev: SmartDev) => void;
  onUpgrade: () => void;
}

const SmartCard = ({ dev, idx, isPro, isBlurred, connectingId, onConnect, onSkip, onUpgrade }: SmartCardProps) => {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { textCls } = scoreStyle(dev.compatibilityScore);
  const avatarUrl = dev.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dev.name)}`;
  const breakdown = dev.compatibilityBreakdown || {};

  return (
    <motion.div
      key={dev.id}
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, y: -8 }}
      transition={{ duration: 0.3, delay: idx * 0.05 }}
      className="group relative bg-[#111114] border border-zinc-800/70 rounded-2xl overflow-hidden hover:border-zinc-700 transition-all duration-300 flex flex-col sm:flex-row items-center p-3 gap-4"
    >
      {/* PRO blur overlay for non-pro slots */}
      {isBlurred && <ProBlurOverlay onUpgrade={onUpgrade} />}

      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#00e5ff]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#00e5ff]/[0.03] via-transparent to-violet-600/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl" />

        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-3 flex-shrink-0 w-full sm:w-[200px] z-10">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-700/60 shadow-lg">
              <img src={avatarUrl} alt={dev.name} className="w-full h-full object-cover" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#111114]" />
          </div>

          <div className="flex-1 min-w-0">
            <Link to={`/profile/${dev.id}`} className="text-sm font-black text-white hover:text-brand-cyan transition-colors truncate block leading-tight">{dev.name}</Link>
            <p className={`text-[10px] font-bold uppercase tracking-wider truncate mt-0.5 ${textCls}`}>
              {dev.experienceLevel || 'Developer'}
            </p>
            {dev.intent && (
              <p className="text-[9px] text-zinc-500 font-semibold mt-0.5 truncate">{dev.intent}</p>
            )}
          </div>
        </div>

        {/* Skills and Match Ring */}
        <div className="flex-1 flex items-center justify-between gap-4 w-full sm:w-auto z-10">
          <div className="flex flex-col gap-1.5 flex-1 min-w-0 hidden md:flex">
             <div className="flex flex-wrap gap-1.5">
              {(dev.skills || []).slice(0, 3).map(skill => (
                <span key={skill} className="px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/[0.07] text-[9px] font-bold text-zinc-400 truncate max-w-[80px]">
                  {skill}
                </span>
              ))}
              {(dev.skills || []).length > 3 && (
                <span className="px-2 py-0.5 rounded-md bg-white/[0.03] text-[9px] font-bold text-zinc-600">
                  +{dev.skills.length - 3}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4 flex-shrink-0">
             <MiniRing score={dev.compatibilityScore} />
             
             <div className="flex gap-2">
                <button
                  onClick={() => onConnect(dev)}
                  disabled={connectingId === dev.id}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#00e5ff] text-[#0a0a0b] text-[10px] font-black hover:opacity-90 active:scale-95 transition-all uppercase tracking-widest shadow-lg shadow-[#00e5ff]/20 disabled:opacity-50"
                >
                  {connectingId === dev.id ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <><Heart className="w-3 h-3 fill-[#0a0a0b]" /> Connect</>
                  )}
                </button>
                <button
                  onClick={() => onSkip(dev)}
                  className="flex items-center justify-center w-8 h-8 rounded-xl bg-zinc-800/80 border border-zinc-700/50 text-[10px] font-black text-zinc-400 hover:text-white hover:bg-zinc-700/80 transition-all shadow-sm"
                  title="Remove from list"
                >
                  <X className="w-3 h-3" />
                </button>
             </div>
          </div>
        </div>
    </motion.div>
  );
};

// ─── Free User Teaser Strip ───────────────────────────────────────────────────

const FreeTeaser = ({ onUpgrade }: { onUpgrade: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="mt-4 p-5 bg-gradient-to-r from-[#00e5ff]/5 to-violet-600/5 border border-[#00e5ff]/20 rounded-3xl flex flex-col sm:flex-row items-center gap-4"
  >
    <div className="flex items-center gap-3 flex-1">
      <div className="w-10 h-10 rounded-2xl bg-[#00e5ff]/10 border border-[#00e5ff]/25 flex items-center justify-center flex-shrink-0">
        <Brain className="w-5 h-5 text-[#00e5ff]" />
      </div>
      <div>
        <p className="text-sm font-black text-white">See 7 more smart matches</p>
        <p className="text-xs text-zinc-500 mt-0.5">Pro unlocks top-10 curated builder recommendations</p>
      </div>
    </div>
    <button
      onClick={onUpgrade}
      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#00e5ff] to-violet-500 text-[#0a0a0b] text-[10px] font-black uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#00e5ff]/15 whitespace-nowrap"
    >
      <Sparkles className="w-3.5 h-3.5" />
      Unlock Pro
    </button>
  </motion.div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const RecommendedSection = ({ intent, onSwipeFromRecommended, fallback, onUpgrade }: RecommendedSectionProps) => {
  const { user } = useAuth();
  const isPro = user?.plan === 'pro';

  const [devs, setDevs]                 = useState<SmartDev[]>([]);
  const [isLoading, setIsLoading]       = useState(true);
  const [dismissed, setDismissed]       = useState<Set<string>>(new Set());
  const [connectingId, setConnectingId] = useState<string | null>(null);
  const [showModal, setShowModal]       = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRecommended = useCallback(async (refresh = false) => {
    if (refresh) setIsRefreshing(true);
    else setIsLoading(true);
    try {
      // Use the smart matches endpoint for richer data
      const res = await api.get('/matches/smart');
      setDevs(res.data.matches || []);
      setDismissed(new Set()); // reset dismissals on refresh
    } catch {
      // Fallback to swipe/recommended
      try {
        const res = await api.get('/swipe/recommended?limit=6');
        setDevs(res.data || []);
      } catch {}
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchRecommended(); }, [fetchRecommended, intent]);

  const handleConnect = async (dev: SmartDev) => {
    if (connectingId) return;
    setConnectingId(dev.id);
    try {
      const res = await api.post('/swipe/right', { receiverId: dev.id });
      setDismissed(p => new Set([...p, dev.id]));
      if (res.data.isMatch) toast.success(`🎉 It's a match with ${dev.name}!`);
      else                  toast.success(`💌 Connect request sent to ${dev.name}`);
      onSwipeFromRecommended?.('right', dev.id);
    } catch { toast.error('Failed to connect'); }
    finally  { setConnectingId(null); }
  };

  const handleSkip = async (dev: SmartDev) => {
    setDismissed(p => new Set([...p, dev.id]));
    try { await api.post('/swipe/left', { receiverId: dev.id }); } catch {}
    onSwipeFromRecommended?.('left', dev.id);
  };

  const visible = devs.filter(d => !dismissed.has(d.id));

  // For free users: show top 3 (first 1 real, rest blurred)
  const displayDevs   = isPro ? visible : visible.slice(0, 3);
  const blurredIndices = isPro ? new Set<number>() : new Set([1, 2]);

  // Loading skeleton
  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="h-5 w-52 bg-zinc-800 rounded-full animate-pulse mb-4" />
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-20 bg-zinc-900/70 border border-zinc-800/50 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (visible.length === 0) return fallback ? <>{fallback}</> : null;

  return (
    <div className="mb-10">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-[#00e5ff]/20 to-violet-600/20 border border-[#00e5ff]/20 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-[#00e5ff]" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#00e5ff] rounded-full border-2 border-[#0a0a0b] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-[15px] font-black text-white tracking-tight">AI Smart Matches</h3>
              {!isPro && (
                <span className="px-2 py-0.5 rounded-lg bg-[#00e5ff]/10 border border-[#00e5ff]/25 text-[9px] font-black text-[#00e5ff] uppercase tracking-widest">
                  PRO
                </span>
              )}
            </div>
            <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
              Rule-based compatibility engine · V1
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Refresh button */}
          <button
            onClick={() => fetchRecommended(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl hover:bg-white/5 text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-40"
            title="Refresh recommendations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Info / upgrade button */}
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00e5ff]/8 border border-[#00e5ff]/15 hover:bg-[#00e5ff]/12 transition-colors"
          >
            <Sparkles className="w-3 h-3 text-[#00e5ff]" />
            <span className="text-[10px] font-black text-[#00e5ff] uppercase tracking-widest">
              {isPro ? `${visible.length} picks` : 'Upgrade'}
            </span>
          </button>
        </div>
      </div>

      {/* Cards list */}
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {displayDevs.map((dev, idx) => (
            <SmartCard
              key={dev.id}
              dev={dev}
              idx={idx}
              isPro={isPro}
              isBlurred={blurredIndices.has(idx)}
              connectingId={connectingId}
              onConnect={handleConnect}
              onSkip={handleSkip}
              onUpgrade={() => setShowModal(true)}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Free-user upsell strip */}
      {!isPro && visible.length > 0 && (
        <FreeTeaser onUpgrade={() => setShowModal(true)} />
      )}

      {/* AI Smart Matches Modal */}
      <SmartMatchesModal 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onUpgradeClick={onUpgrade}
      />
    </div>
  );
};

export default RecommendedSection;
