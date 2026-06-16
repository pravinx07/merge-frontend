import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Heart, SlidersHorizontal, Sparkles, Filter, Brain, Zap, Star } from 'lucide-react';
import FilterSidebar from '../components/Discover/FilterSidebar';
import SwipeCard from '../components/Discover/SwipeCard';
import MatchPopup from '../components/Discover/MatchPopup';
import RecommendedSection from '../components/Discover/RecommendedSection';
import { UpgradeModal } from '../components/Premium';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import { EmptyState } from '../components/DashboardComponents';

/* ─── Score label helper ─────────────────────────────────────── */
const getScoreLabel = (s: number) => {
  if (s >= 80) return { label: `${s}% Elite Match`, cls: 'text-[#00e5ff] bg-[#00e5ff]/10 border-[#00e5ff]/25' };
  if (s >= 60) return { label: `${s}% Strong Match`, cls: 'text-violet-400 bg-violet-500/10 border-violet-500/25' };
  if (s >= 35) return { label: `${s}% Good Match`,  cls: 'text-amber-400  bg-amber-500/10  border-amber-500/25' };
  return null; // Don't show pill for 0%
};

/* ─── How It Works mini panel (shown when no recommendations) ─── */
const HowItWorks = () => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.3 }}
    className="bg-[#111115] border border-zinc-800/70 rounded-3xl p-5 mb-5"
  >
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-8 h-8 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center">
        <Brain className="w-4 h-4 text-[#00e5ff]" />
      </div>
      <div>
        <h3 className="text-sm font-black text-white">AI Matching Engine</h3>
        <p className="text-[10px] text-zinc-500">Complete your profile to see matches</p>
      </div>
    </div>
    <div className="space-y-2.5">
      {[
        { icon: Zap, label: 'Skills Match', desc: '30% weight — shared technologies', color: 'text-[#00e5ff]', bg: 'bg-[#00e5ff]/10' },
        { icon: Star, label: 'Intent Match', desc: '20% weight — same goals', color: 'text-violet-400', bg: 'bg-violet-500/10' },
        { icon: Brain, label: 'GitHub Activity', desc: '15% weight — coding patterns', color: 'text-amber-400', bg: 'bg-amber-500/10' },
      ].map(({ icon: Icon, label, desc, color, bg }) => (
        <div key={label} className="flex items-center gap-3">
          <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
            <Icon className={`w-3.5 h-3.5 ${color}`} />
          </div>
          <div>
            <p className={`text-[11px] font-bold ${color}`}>{label}</p>
            <p className="text-[10px] text-zinc-600">{desc}</p>
          </div>
        </div>
      ))}
    </div>
  </motion.div>
);

/* ═══════════════════════════════════════════════════════════════
   DISCOVER PAGE
═══════════════════════════════════════════════════════════════ */
const DiscoverPage = () => {
  const { user } = useAuth();
  const [developers, setDevelopers]   = useState<any[]>([]);
  const [myIntent, setMyIntent]       = useState(user?.intent || 'BUILDING');
  const [isUpdatingIntent, setIsUpdatingIntent] = useState(false);
  const [isLoading, setIsLoading]     = useState(true);
  const [filters, setFilters]         = useState({ skills: [] as string[], intent: '', experienceLevel: '' });
  const [matchData, setMatchData]     = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [swipeDir, setSwipeDir]       = useState<'left' | 'right' | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  
  const isPro = user?.plan === 'pro';

  const fetchDevelopers = useCallback(async () => {
    try {
      setIsLoading(true);
      const q = new URLSearchParams({
        ...(filters.intent            && { intent: filters.intent }),
        ...(filters.experienceLevel   && { experienceLevel: filters.experienceLevel }),
        ...(filters.skills.length > 0 && { skills: filters.skills.join(',') }),
      });
      const res = await api.get(`/swipe/feed?${q}`);
      setDevelopers(res.data);
    } catch { toast.error('Failed to load builders'); }
    finally  { setIsLoading(false); }
  }, [filters]);

  useEffect(() => { fetchDevelopers(); }, [filters]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (matchData || isLoading || developers.length === 0) return;
      if (e.key === 'ArrowLeft')  handleSwipe('left');
      if (e.key === 'ArrowRight') handleSwipe('right');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [developers, isLoading, matchData]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (developers.length === 0) return;
    const curr = developers[0];
    setSwipeDir(direction);
    setTimeout(() => setSwipeDir(null), 700);
    setDevelopers(prev => prev.slice(1));
    try {
      if (direction === 'right') {
        const res = await api.post('/swipe/right', { receiverId: curr.id });
        if (res.data.isMatch) setMatchData(res.data.match);
      } else {
        await api.post('/swipe/left', { receiverId: curr.id });
      }
    } catch { /* noop */ }
  };

  const handleRecommendedAction = (_dir: 'left' | 'right', devId: string) => {
    setDevelopers(prev => prev.filter(d => d.id !== devId));
  };

  const updateIntent = async (newIntent: string) => {
    setIsUpdatingIntent(true);
    try {
      await api.put('/users/profile', { intent: newIntent });
      setMyIntent(newIntent);
      toast.success(`Goal updated to ${newIntent}`);
      fetchDevelopers();
    } catch (error) {
      toast.error('Failed to update goal');
    } finally {
      setIsUpdatingIntent(false);
    }
  };

  const clearFilters  = () => setFilters({ skills: [], intent: '', experienceLevel: '' });
  const topDev        = developers[0];
  const hasFilters    = filters.intent || filters.experienceLevel || filters.skills.length > 0;
  const scoreInfo     = topDev ? getScoreLabel(topDev.compatibilityScore ?? 0) : null;

  return (
    <div className="min-h-screen bg-[#0a0a0b]">

      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] bg-[#00e5ff]/[0.025] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-violet-600/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 md:px-6 py-6">

        {/* ── Top Bar ── */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-bold transition-all
              ${hasFilters
                ? 'bg-[#00e5ff]/10 border-[#00e5ff]/30 text-[#00e5ff]'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'}`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
            {hasFilters && <span className="w-2 h-2 bg-[#00e5ff] rounded-full animate-pulse" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <Users className="w-3.5 h-3.5" />
              <span>{developers.length} builders</span>
            </div>
            <AnimatePresence mode="wait">
              {scoreInfo && (
                <motion.div
                  key={topDev?.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${scoreInfo.cls}`}
                >
                  <Sparkles className="w-3 h-3" />
                  {scoreInfo.label}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── Intent Selector ── */}
        <div className="mb-8 p-4 sm:px-6 sm:py-5 rounded-3xl bg-zinc-900/40 border border-zinc-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <h3 className="text-sm font-black text-white">What are you looking for today?</h3>
            <p className="text-[11px] font-medium text-zinc-500 mt-1">Update your goal to find the right cofounders, mentors, or learners.</p>
          </div>
          <div className="flex bg-[#111115] border border-zinc-800/80 rounded-xl p-1 shadow-inner">
            {['BUILDING', 'MENTORING', 'LEARNING'].map(intent => (
              <button
                key={intent}
                onClick={() => updateIntent(intent)}
                disabled={isUpdatingIntent}
                className={`px-4 py-2 rounded-lg text-xs font-black tracking-wide transition-all duration-300 ${
                  myIntent === intent
                    ? 'bg-gradient-to-r from-violet-600 to-[#00e5ff] text-white shadow-lg shadow-[#00e5ff]/20'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {intent}
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════════════════
            MAIN SPLIT: Left = swipe, Right = recommended
        ═══════════════════════════════════════════════════ */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* ── LEFT COLUMN: Swipe Stack ── */}
          <div className="w-full lg:w-[400px] xl:w-[420px] flex-shrink-0">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-zinc-800/60" />
              <span className="text-[10px] font-black uppercase tracking-[0.22em] text-zinc-600">Swipe Stack</span>
              <div className="flex-1 h-px bg-zinc-800/60" />
            </div>

            {/* ── Card container ── */}
            <div className="relative h-[580px]">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  /* Skeleton */
                  <div key="loading" className="absolute inset-0 bg-[#111115] border border-zinc-800/70 rounded-[28px] overflow-hidden flex flex-col">
                    <div className="h-[180px] bg-zinc-800/30 animate-pulse relative">
                      <div className="absolute bottom-[-44px] left-1/2 -translate-x-1/2 w-[100px] h-[100px] rounded-[24px] bg-zinc-800 animate-pulse border-[3px] border-zinc-700" />
                    </div>
                    <div className="flex flex-col items-center px-6 pt-16 gap-3">
                      <div className="h-6 w-44 bg-zinc-800 rounded-full animate-pulse" />
                      <div className="h-3 w-28 bg-zinc-800/80 rounded-full animate-pulse" />
                      <div className="h-3 w-20 bg-zinc-800/60 rounded-full animate-pulse" />
                      <div className="flex gap-2 mt-3">
                        {[1,2,3].map(i => <div key={i} className="h-6 w-16 bg-zinc-800/50 rounded-lg animate-pulse" />)}
                      </div>
                    </div>
                  </div>
                ) : developers.length > 0 ? (
                  /* Render top 2 cards — each is a single DOM element, no Fragment */
                  developers.slice(0, 2).reverse().map((dev, idx) => (
                    <SwipeCard
                      key={dev.id}
                      developer={dev}
                      onSwipe={handleSwipe}
                      isTop={idx === (developers.length === 1 ? 0 : 1)}
                    />
                  ))
                ) : (
                  <EmptyState
                    icon={Users}
                    title="Stack's empty"
                    description="You've seen everyone matching your criteria. Try resetting filters or check back later."
                    actionLabel="Reset Filters"
                    onAction={clearFilters}
                  />
                )}
              </AnimatePresence>

              {/* Action buttons — outside AnimatePresence, shown only when stack has cards */}
              {!isLoading && developers.length > 0 && (
                <div className="absolute -bottom-20 left-0 right-0 flex items-center justify-center gap-4 z-30">
                  {/* Skip */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleSwipe('left')}
                    className="relative w-14 h-14 rounded-full bg-[#111115] border-2 border-zinc-700 flex items-center justify-center text-red-400 hover:border-red-500/50 hover:bg-red-500/8 transition-all shadow-xl"
                  >
                    <X className="w-6 h-6" />
                    {swipeDir === 'left' && (
                      <motion.div initial={{ scale: 0.5, opacity: 0.5 }} animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 rounded-full bg-red-500/25 pointer-events-none"
                      />
                    )}
                  </motion.button>

                  {/* Centre: count + dots */}
                  <div className="flex flex-col items-center gap-1.5">
                    <div className="px-4 py-1.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        {developers.length} left
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {developers.slice(0, Math.min(5, developers.length)).map((_, i) => (
                        <div key={i} className={`h-0.5 rounded-full transition-all duration-300 ${i === 0 ? 'w-5 bg-[#00e5ff]' : 'w-2 bg-zinc-700'}`} />
                      ))}
                    </div>
                  </div>

                  {/* Match */}
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => handleSwipe('right')}
                    className="relative w-14 h-14 rounded-full bg-[#111115] border-2 border-zinc-700 flex items-center justify-center text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/8 transition-all shadow-xl"
                  >
                    <Heart className="w-6 h-6" />
                    {swipeDir === 'right' && (
                      <motion.div initial={{ scale: 0.5, opacity: 0.5 }} animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 rounded-full bg-emerald-500/25 pointer-events-none"
                      />
                    )}
                  </motion.button>
                </div>
              )}
            </div>

            {/* Keyboard hint */}
            <div className="mt-24 flex items-center justify-center gap-4">
              <kbd className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-500 font-mono">← Skip</kbd>
              <span className="text-[9px] text-zinc-700 font-bold uppercase tracking-widest">keyboard shortcuts</span>
              <kbd className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] text-zinc-500 font-mono">→ Match</kbd>
            </div>
          </div>

          {/* ── RIGHT COLUMN: Recommended + Stats ── */}
          <div className="flex-1 min-w-0">
            {/* Stats row (always visible) */}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-3 mb-6"
              >
                {[
                  { label: 'In Stack',  value: developers.length,           color: 'text-white' },
                  { label: 'Top Match', value: topDev ? `${topDev.compatibilityScore ?? 0}%` : '—', color: 'text-[#00e5ff]' },
                  { label: 'AI Engine', value: 'V1',                        color: 'text-violet-400' },
                ].map(s => (
                  <div key={s.label} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl py-3.5 px-4 text-center">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Recommended Section */}
            <RecommendedSection
              onSwipeFromRecommended={handleRecommendedAction}
              fallback={<HowItWorks />}
              onUpgrade={() => setShowUpgradeModal(true)}
            />
          </div>
        </div>
      </div>

      {/* ── Filter Drawer ── */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-[#111115] border-l border-zinc-800/70 z-[70] shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-zinc-800/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#00e5ff]/10 border border-[#00e5ff]/20 flex items-center justify-center">
                    <Filter className="w-4 h-4 text-[#00e5ff]" />
                  </div>
                  <h2 className="text-base font-black text-white">Discovery Filters</h2>
                </div>
                <button onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                <FilterSidebar 
                  filters={filters as any} 
                  setFilters={setFilters as any} 
                  onClear={clearFilters}
                  isPro={isPro}
                  onProFilterClick={() => setShowUpgradeModal(true)}
                />
              </div>
              <div className="p-6 border-t border-zinc-800/60 space-y-2">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3.5 bg-[#00e5ff] text-[#0a0a0b] font-black rounded-2xl text-sm uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-[#00e5ff]/15"
                >
                  Apply Filters
                </button>
                {hasFilters && (
                  <button onClick={clearFilters}
                    className="w-full py-2.5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <MatchPopup match={matchData} onClose={() => setMatchData(null)} />
      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};

export default DiscoverPage;
