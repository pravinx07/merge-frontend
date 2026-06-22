import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, X, Heart, SlidersHorizontal, Sparkles, Filter, Brain, Zap, Star } from 'lucide-react';
import FilterSidebar from '../components/Discover/FilterSidebar';
import SwipeCard from '../components/Discover/SwipeCard';
import MatchPopup from '../components/Discover/MatchPopup';
import { UpgradeModal } from '../components/Premium';
import { useAuth } from '../context/AuthContext';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import { EmptyState } from '../components/DashboardComponents';

const getScoreLabel = (s: number) => {
  if (s >= 80) return { label: `${s}% Elite Match`, cls: 'text-[#00e5ff] bg-[#00e5ff]/10 border-[#00e5ff]/25' };
  if (s >= 60) return { label: `${s}% Strong Match`, cls: 'text-violet-400 bg-violet-500/10 border-violet-500/25' };
  if (s >= 35) return { label: `${s}% Good Match`,  cls: 'text-amber-400  bg-amber-500/10  border-amber-500/25' };
  return null;
};

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
      let targetIntent = filters.intent;

      const q = new URLSearchParams({
        ...(targetIntent              && { intent: targetIntent }),
        ...(filters.experienceLevel   && { experienceLevel: filters.experienceLevel }),
        ...(filters.skills.length > 0 && { skills: filters.skills.join(',') }),
      });
      const res = await api.get(`/swipe/feed?${q}`);
      setDevelopers(res.data);
    } catch { toast.error('Failed to load builders'); }
    finally  { setIsLoading(false); }
  }, [filters, myIntent]);

  useEffect(() => { fetchDevelopers(); }, [fetchDevelopers]);

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

  const updateIntent = async (newIntent: string) => {
    setIsUpdatingIntent(true);
    try {
      await api.put('/users/profile', { intent: newIntent });
      setMyIntent(newIntent);
      toast.success(`Goal updated to ${newIntent}`);
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
    <div className="min-h-[calc(100vh-64px)] bg-[#0a0a0b] flex flex-col items-center justify-center relative overflow-hidden p-4 md:p-8">
      {/* Ambient glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#00e5ff]/[0.025] rounded-full blur-[120px]" />
        <div className="absolute top-1/2 right-1/4 w-[400px] h-[400px] bg-violet-600/[0.03] rounded-full blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto flex flex-col h-full items-center">
        
        {/* Intent Selector & Filters */}
        <div className="w-full flex items-center justify-between mb-6">
          <div className="flex bg-[#111115] border border-zinc-800/80 rounded-xl p-1 shadow-inner">
            {['BUILDING', 'MENTORING', 'LEARNING'].map(intent => (
              <button
                key={intent}
                onClick={() => updateIntent(intent)}
                disabled={isUpdatingIntent}
                className={`px-3 py-1.5 rounded-lg text-[10px] sm:text-xs font-black tracking-wide transition-all duration-300 ${
                  myIntent === intent
                    ? 'bg-gradient-to-r from-violet-600 to-[#00e5ff] text-white shadow-lg shadow-[#00e5ff]/20'
                    : 'text-zinc-500 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                {intent}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowFilters(true)}
            className={`flex items-center justify-center w-10 h-10 rounded-xl border transition-all ${
              hasFilters ? 'bg-[#00e5ff]/10 border-[#00e5ff]/30 text-[#00e5ff]' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            {hasFilters && <span className="absolute top-2 right-2 w-2 h-2 bg-[#00e5ff] rounded-full" />}
          </button>
        </div>

        {/* ── Card container ── */}
        <div className="relative w-full h-[500px] md:h-[550px]">
          <AnimatePresence mode="popLayout">
            {isLoading ? (
              <div key="loading" className="absolute inset-0 bg-[#111115] border border-zinc-800/70 rounded-[28px] overflow-hidden flex flex-col shadow-2xl">
                <div className="h-[140px] bg-zinc-800/30 animate-pulse relative">
                  <div className="absolute bottom-[-44px] left-1/2 -translate-x-1/2 w-[100px] h-[100px] rounded-[24px] bg-zinc-800 animate-pulse border-[3px] border-zinc-700" />
                </div>
                <div className="flex flex-col items-center px-6 pt-12 gap-3">
                  <div className="h-6 w-44 bg-zinc-800 rounded-full animate-pulse" />
                  <div className="h-3 w-28 bg-zinc-800/80 rounded-full animate-pulse" />
                  <div className="flex gap-2 mt-3">
                    {[1,2,3].map(i => <div key={i} className="h-6 w-16 bg-zinc-800/50 rounded-lg animate-pulse" />)}
                  </div>
                </div>
              </div>
            ) : developers.length > 0 ? (
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

          {/* Action buttons */}
          {!isLoading && developers.length > 0 && (
            <div className="absolute -bottom-24 left-0 right-0 flex items-center justify-center gap-6 z-30">
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleSwipe('left')}
                className="relative w-16 h-16 rounded-full bg-[#111115] border border-zinc-800 flex items-center justify-center text-red-400 hover:border-red-500/50 hover:bg-red-500/10 transition-all shadow-xl"
              >
                <X className="w-7 h-7" />
              </motion.button>

              <div className="flex flex-col items-center gap-1.5">
                {scoreInfo && (
                  <div className={`px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-widest ${scoreInfo.cls}`}>
                    {scoreInfo.label}
                  </div>
                )}
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                  {developers.length} left
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleSwipe('right')}
                className="relative w-16 h-16 rounded-full bg-[#111115] border border-zinc-800 flex items-center justify-center text-emerald-400 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-all shadow-xl"
              >
                <Heart className="w-7 h-7" />
              </motion.button>
            </div>
          )}
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
                  <h2 className="text-base font-black text-white">Filters</h2>
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
