import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, RefreshCw, Sparkles, Filter, X, Heart, MessageSquare, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import FilterSidebar from '../components/Discover/FilterSidebar';
import SwipeCard from '../components/Discover/SwipeCard';
import MatchPopup from '../components/Discover/MatchPopup';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { PageHeader, DashboardContainer, EmptyState } from '../components/DashboardComponents';

const DiscoverPage = () => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    skills: [] as string[],
    intent: '',
    experienceLevel: '',
  });
  const [matchData, setMatchData] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  const fetchDevelopers = useCallback(async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        ...(filters.intent && { intent: filters.intent }),
        ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }),
        ...(filters.skills.length > 0 && { skills: filters.skills.join(',') })
      });

      const response = await api.get(`/swipe/feed?${queryParams}`);
      setDevelopers(response.data);
    } catch (error) {
      console.error('Fetch swipe feed error:', error);
      toast.error('Failed to load builders');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    }
  }, [filters]);

  useEffect(() => {
    fetchDevelopers();
  }, [filters]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (matchData || isLoading || developers.length === 0) return;
      
      if (e.key === 'ArrowLeft') {
        handleSwipe('left');
      } else if (e.key === 'ArrowRight') {
        handleSwipe('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [developers, isLoading, matchData]);

  const handleSwipe = async (direction: 'left' | 'right') => {
    if (developers.length === 0) return;
    
    const currentDev = developers[0];
    const remainingDevs = developers.slice(1);
    
    setDevelopers(remainingDevs);

    try {
      if (direction === 'right') {
        const response = await api.post('/swipe/right', { receiverId: currentDev.id });
        if (response.data.isMatch) {
          setMatchData(response.data.match);
        }
      } else {
        await api.post('/swipe/left', { receiverId: currentDev.id });
      }
    } catch (error) {
      console.error('Swipe action error:', error);
    }

    if (remainingDevs.length === 3) {
      // Pre-fetch more devs when running low? 
      // For now we'll just let it finish.
    }
  };

  const handleClearFilters = () => {
    setFilters({
      skills: [],
      intent: '',
      experienceLevel: '',
    });
  };

  return (
    <DashboardContainer>
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
                <button 
                  onClick={() => setShowFilters(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-bold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
                >
                  <Filter className="w-3.5 h-3.5" />
                  Filters
                  {(filters.intent || filters.experienceLevel || filters.skills.length > 0) && (
                    <span className="w-1.5 h-1.5 bg-brand-cyan rounded-full" />
                  )}
                </button>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                <Users className="w-3 h-3" />
                <span>{developers.length} in stack</span>
            </div>
        </div>

        <div className="relative">
          {/* Filter Overlay / Drawer */}
          <AnimatePresence>
            {showFilters && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setShowFilters(false)}
                  className="fixed inset-0 bg-[#0A0A0B]/80 backdrop-blur-sm z-[60]"
                />
                <motion.aside 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed top-0 right-0 h-full w-full max-w-sm bg-zinc-900 border-l border-zinc-800 p-8 z-[70] shadow-2xl overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 flex items-center justify-center text-brand-cyan">
                          <Filter className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-white tracking-tight">Discovery Filters</h2>
                      </div>
                      <button 
                        onClick={() => setShowFilters(false)}
                        className="p-2 hover:bg-white/5 rounded-full text-zinc-500 transition-colors"
                      >
                        <X className="w-6 h-6" />
                      </button>
                  </div>
                  
                  <FilterSidebar 
                      filters={filters as any} 
                      setFilters={setFilters as any} 
                      onClear={handleClearFilters}
                  />

                  <div className="mt-12">
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="w-full py-4 bg-brand-cyan text-dark-bg font-bold rounded-2xl text-sm uppercase tracking-widest shadow-lg shadow-brand-cyan/10"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.aside>
              </>
            )}
          </AnimatePresence>

          {/* Swipe Stack Area */}
          <main className="w-full max-w-xl mx-auto py-2 md:py-4">
            <div className="relative h-[340px] md:h-[400px] w-full">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <div className="absolute inset-0 bg-zinc-900/40 border border-zinc-800/50 rounded-[40px] p-8 flex flex-col items-center justify-center space-y-4 animate-pulse">
                     <div className="w-40 h-40 bg-zinc-800 rounded-[40px]" />
                     <div className="h-8 bg-zinc-800 rounded-full w-48" />
                     <div className="h-4 bg-zinc-800 rounded-full w-32" />
                  </div>
                ) : developers.length > 0 ? (
                  <>
                    {developers.slice(0, 2).reverse().map((dev, idx) => (
                      <SwipeCard 
                        key={dev.id}
                        developer={dev}
                        onSwipe={handleSwipe}
                        isTop={idx === (developers.length === 1 ? 0 : 1)}
                      />
                    ))}
                    
                    {/* Swipe Buttons Controls */}
                    <div className="absolute -bottom-16 md:-bottom-20 left-0 right-0 flex items-center justify-center gap-6 md:gap-8 z-30">
                        <button 
                            onClick={() => handleSwipe('left')}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all shadow-xl active:scale-90 group"
                        >
                            <X className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform" />
                        </button>
                        <button 
                            onClick={() => handleSwipe('right')}
                            className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-green-500 hover:bg-green-500/10 hover:border-green-500/50 transition-all shadow-xl active:scale-90 group"
                        >
                            <Heart className="w-6 h-6 md:w-7 md:h-7 group-hover:scale-110 transition-transform fill-green-500/10" />
                        </button>
                    </div>
                  </>
                ) : (
                  <EmptyState 
                    icon={Users}
                    title="Stack finished"
                    description="You've seen all builders matching your criteria. Try resetting filters or check back later for new talents."
                    actionLabel="Reset Filters"
                    onAction={handleClearFilters}
                  />
                )}
              </AnimatePresence>
            </div>
            
            <div className="mt-24 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600 mb-2">Keyboard Shortcuts</p>
                <div className="flex justify-center gap-4">
                    <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-400">← Skip</span>
                    <span className="px-2 py-1 bg-zinc-900 border border-zinc-800 rounded text-[10px] text-zinc-400">→ Match</span>
                </div>
            </div>
          </main>
        </div>

      {/* Match Popup */}
      <MatchPopup match={matchData} onClose={() => setMatchData(null)} />
    </DashboardContainer>
  );
};

export default DiscoverPage;
