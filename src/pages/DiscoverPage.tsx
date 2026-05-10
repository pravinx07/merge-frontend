import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Users, Search, RefreshCw, LayoutGrid } from 'lucide-react';
import SearchBar from '../components/Discover/SearchBar';
import FilterSidebar from '../components/Discover/FilterSidebar';
import DeveloperCard from '../components/Discover/DeveloperCard';
import MatchPopup from '../components/Discover/MatchPopup';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';

const DiscoverPage = () => {
  const [developers, setDevelopers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState({
    skills: [] as string[],
    intent: '',
    experienceLevel: '',
    search: ''
  });
  const [matchData, setMatchData] = useState<any>(null);

  const fetchDevelopers = useCallback(async (isNewSearch = false) => {
    try {
      if (isNewSearch) setIsLoading(true);
      
      const queryParams = new URLSearchParams({
        page: String(isNewSearch ? 1 : page),
        ...(filters.search && { search: filters.search }),
        ...(filters.intent && { intent: filters.intent }),
        ...(filters.experienceLevel && { experienceLevel: filters.experienceLevel }),
        ...(filters.skills.length > 0 && { skills: filters.skills.join(',') })
      });

      const response = await api.get(`/users/discover?${queryParams}`);
      const newDevs = response.data;

      if (isNewSearch) {
        setDevelopers(newDevs);
        setPage(2);
      } else {
        setDevelopers(prev => [...prev, ...newDevs]);
        setPage(prev => prev + 1);
      }

      setHasMore(newDevs.length === 10);
    } catch (error) {
      console.error('Fetch developers error:', error);
      toast.error('Failed to load developers');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchDevelopers(true);
  }, [filters.intent, filters.experienceLevel, filters.skills, filters.search]);

  const handleLike = async (receiverId: string) => {
    try {
      const response = await api.post('/matches/like', { receiverId });
      
      if (response.data.isMatch) {
        setMatchData(response.data.match);
      } else {
        toast.success(response.data.message);
      }

      // Remove the liked user from the feed
      setDevelopers(prev => prev.filter(dev => dev.id !== receiverId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to connect');
    }
  };

  const handleClearFilters = () => {
    setFilters({
      skills: [],
      intent: '',
      experienceLevel: '',
      search: ''
    });
  };

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-2xl bg-linear-to-br from-brand-cyan to-brand-purple text-white shadow-lg shadow-brand-purple/20">
                <LayoutGrid className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">Discover Builders</h1>
            </div>
            <p className="text-slate-400 font-medium">Explore and connect with developers worldwide.</p>
          </div>
          
          <div className="w-full md:w-1/2 max-w-lg">
            <SearchBar onSearch={(query) => setFilters({ ...filters, search: query })} />
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-28 bg-dark-card/30 backdrop-blur-xl border border-dark-border rounded-[32px] p-8 shadow-2xl">
              <FilterSidebar 
                filters={filters} 
                setFilters={setFilters} 
                onClear={handleClearFilters}
              />
            </div>
          </aside>

          {/* Feed Grid */}
          <main className="flex-1">
            <AnimatePresence mode="popLayout">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 text-brand-cyan animate-spin" />
                    <div className="absolute inset-0 blur-xl bg-brand-cyan/20 animate-pulse"></div>
                  </div>
                  <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Finding matches...</p>
                </div>
              ) : developers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {developers.map((dev) => (
                    <DeveloperCard 
                      key={dev.id} 
                      developer={dev} 
                      onLike={handleLike}
                    />
                  ))}
                </div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center justify-center py-32 text-center bg-dark-card/20 rounded-[40px] border border-dashed border-dark-border"
                >
                  <div className="w-20 h-20 rounded-full bg-slate-900 flex items-center justify-center mb-6">
                    <Users className="w-10 h-10 text-slate-700" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No builders found</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mb-8">
                    Try adjusting your filters or search terms to find more developers.
                  </p>
                  <button 
                    onClick={handleClearFilters}
                    className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-dark-border rounded-2xl text-sm font-bold text-white hover:bg-white/10 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reset Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Load More */}
            {hasMore && !isLoading && (
              <div className="mt-16 flex justify-center">
                <button 
                  onClick={() => fetchDevelopers()}
                  className="px-10 py-4 bg-dark-card/50 backdrop-blur-xl border border-dark-border rounded-2xl text-sm font-bold text-slate-300 hover:text-white hover:border-brand-cyan/50 transition-all shadow-xl"
                >
                  Load More Developers
                </button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Match Popup */}
      <MatchPopup match={matchData} onClose={() => setMatchData(null)} />
    </div>
  );
};

export default DiscoverPage;
