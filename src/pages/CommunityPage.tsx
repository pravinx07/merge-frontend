import React, { useState, useEffect } from 'react';
import api from '../lib/axios';
import MainLayout from '../components/MainLayout';
import PostCard from '../components/Feed/PostCard';
import CreatePostModal from '../components/Feed/CreatePostModal';
import TrendingSidebar from '../components/Feed/TrendingSidebar';
import { PenSquare, Activity, Users, Search, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CommunityPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'builders'>('feed');
  const [posts, setPosts] = useState<any[]>([]);
  const [builders, setBuilders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/posts/feed');
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchBuilders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/users/community');
      setBuilders(response.data);
    } catch (error) {
      console.error('Error fetching builders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'feed') {
      fetchPosts();
    } else {
      fetchBuilders();
    }
  }, [activeTab]);

  const filteredBuilders = builders.filter(builder => 
    builder.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    builder.skills.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Community Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-2">Community</h2>
              <p className="text-slate-400 text-sm">Connect with fellow builders and share your journey.</p>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 w-fit">
              <button
                onClick={() => setActiveTab('feed')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'feed' 
                    ? 'bg-brand-cyan text-dark-bg shadow-[0_0_20px_rgba(0,229,255,0.3)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Activity className="w-4 h-4" />
                Activity
              </button>
              <button
                onClick={() => setActiveTab('builders')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeTab === 'builders' 
                    ? 'bg-brand-cyan text-dark-bg shadow-[0_0_20px_rgba(0,229,255,0.3)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Users className="w-4 h-4" />
                Builders
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content Area */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              {activeTab === 'feed' ? (
                <motion.div
                  key="feed"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  {/* Create Post Banner */}
                  <div 
                    className="bg-white/5 border border-white/10 rounded-3xl p-5 mb-8 flex items-center gap-4 cursor-pointer hover:border-white/20 hover:bg-white/[0.07] transition-all group" 
                    onClick={() => setIsModalOpen(true)}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-purple to-brand-cyan flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform">
                      <PenSquare className="w-6 h-6 text-dark-bg" />
                    </div>
                    <div className="flex-1 text-slate-400 text-sm font-medium">
                      What's happening in your builder journey?
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 border border-white/5 group-hover:text-white transition-colors">
                      Post Update
                    </div>
                  </div>

                  {isLoading ? (
                    <div className="space-y-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 animate-pulse">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-white/10"></div>
                            <div className="space-y-2 flex-1">
                              <div className="h-4 bg-white/10 rounded w-1/4"></div>
                              <div className="h-3 bg-white/10 rounded w-1/3"></div>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="h-4 bg-white/10 rounded w-full"></div>
                            <div className="h-4 bg-white/10 rounded w-5/6"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : posts.length > 0 ? (
                    <div className="space-y-6">
                      {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl border-dashed">
                      <Activity className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">No activity yet. Be the first to share an update!</p>
                    </div>
                  )}
                </motion.div>
              ) : (
                <motion.div
                  key="builders"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  {/* Search Bar */}
                  <div className="relative mb-8">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text"
                      placeholder="Search builders by name or skills..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-14 pr-6 text-white focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/20 transition-all"
                    />
                  </div>

                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-6 h-48 animate-pulse"></div>
                      ))}
                    </div>
                  ) : filteredBuilders.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {filteredBuilders.map(builder => (
                        <Link 
                          to={`/profile/${builder.id}`} 
                          key={builder.id}
                          className="bg-white/5 border border-white/10 rounded-3xl p-6 hover:border-brand-cyan/30 hover:bg-white/[0.07] transition-all group relative overflow-hidden"
                        >
                          <div className="flex gap-4 relative z-10">
                            <div className="w-16 h-16 rounded-2xl border border-white/10 overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                              <img 
                                src={builder.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${builder.name}`} 
                                alt={builder.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-black text-white truncate group-hover:text-brand-cyan transition-colors">{builder.name}</h3>
                              <p className="text-xs text-slate-500 line-clamp-1 mb-3">{builder.bio || 'Building the future.'}</p>
                              <div className="flex flex-wrap gap-1.5">
                                {builder.skills.slice(0, 3).map((skill: string, idx: number) => (
                                  <span key={idx} className="px-2 py-0.5 rounded-full bg-white/5 border border-white/5 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                                    {skill}
                                  </span>
                                ))}
                                {builder.skills.length > 3 && (
                                  <span className="text-[9px] font-bold text-slate-600 px-1">+{builder.skills.length - 3}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          {/* Glow effect on hover */}
                          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-cyan/5 blur-3xl rounded-full group-hover:bg-brand-cyan/10 transition-all"></div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-white/5 border border-white/10 rounded-3xl border-dashed">
                      <Users className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                      <p className="text-slate-400 font-bold">No builders found matching your search.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Sidebar - Trending */}
          <div className="hidden lg:block shrink-0">
            <TrendingSidebar />
          </div>
        </div>
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={fetchPosts}
      />
    </MainLayout>
  );
};

export default CommunityPage;
