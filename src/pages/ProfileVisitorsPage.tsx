import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Users, Lock, Crown, Clock, MapPin, Code2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UpgradeModal } from '../components/Premium';
import api from '../lib/axios';
import toast from 'react-hot-toast';

interface Visitor {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  skills: string[];
  experienceLevel?: string;
  location?: string;
  visitedAt: string;
}

interface VisitorData {
  isPro: boolean;
  totalVisitors: number;
  uniqueVisitorsCount: number;
  visitors: Visitor[];
}

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const ProfileVisitorsPage = () => {
  const { user } = useAuth();
  const [data, setData] = useState<VisitorData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const res = await api.get('/user/visitors');
        setData(res.data);
      } catch (error) {
        toast.error('Failed to load visitors');
      } finally {
        setIsLoading(false);
      }
    };
    fetchVisitors();
  }, []);

  const isPro = user?.plan === 'pro';

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/3 w-[500px] h-[500px] bg-violet-500/[0.03] rounded-full blur-[120px]" />
      </div>

      <div className="relative max-w-3xl mx-auto px-4 md:px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
              <Eye className="w-6 h-6 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white">Profile Visitors</h1>
              <p className="text-sm text-zinc-500">Developers interested in your profile</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        {data && (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-5 h-5 text-violet-400" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Unique Visitors</span>
              </div>
              <p className="text-3xl font-black text-white">{data.uniqueVisitorsCount}</p>
              <p className="text-[10px] text-zinc-600 mt-1">Last 30 days</p>
            </div>
            <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-5 h-5 text-[#00e5ff]" />
                <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Total Views</span>
              </div>
              <p className="text-3xl font-black text-white">{data.totalVisitors}</p>
              <p className="text-[10px] text-zinc-600 mt-1">All time</p>
            </div>
          </div>
        )}

        {/* Visitors List */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeleton
            [...Array(4)].map((_, i) => (
              <div key={i} className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-32 bg-zinc-800 rounded-lg animate-pulse" />
                    <div className="h-3 w-48 bg-zinc-800/60 rounded-lg animate-pulse" />
                  </div>
                </div>
              </div>
            ))
          ) : data?.visitors && data.visitors.length > 0 ? (
            <AnimatePresence>
              {data.visitors.map((visitor, idx) => (
                <motion.div
                  key={visitor.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`relative bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 transition-all ${
                    isPro ? 'hover:border-violet-500/30 hover:bg-violet-500/5' : ''
                  }`}
                >
                  {/* Blur overlay for free users */}
                  {!isPro && (
                    <div 
                      className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md rounded-2xl z-10 flex items-center justify-center cursor-pointer group"
                      onClick={() => setShowUpgradeModal(true)}
                    >
                      <div className="flex items-center gap-2 px-4 py-2 bg-violet-500/20 border border-violet-500/30 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
                        <Lock className="w-4 h-4 text-violet-400" />
                        <span className="text-sm font-bold text-violet-400">Unlock with Pro</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4">
                    {visitor.avatar ? (
                      <img
                        src={visitor.avatar}
                        alt={visitor.name}
                        className="w-14 h-14 rounded-2xl border border-zinc-700 object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20 flex items-center justify-center">
                        <span className="text-lg font-black text-violet-400">
                          {visitor.name?.charAt(0)?.toUpperCase() || '?'}
                        </span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-white truncate">{visitor.name}</h3>
                        {visitor.experienceLevel && (
                          <span className="px-2 py-0.5 rounded-lg bg-zinc-800 text-[10px] font-bold text-zinc-400">
                            {visitor.experienceLevel}
                          </span>
                        )}
                      </div>

                      {visitor.skills && visitor.skills.length > 0 && (
                        <div className="flex items-center gap-1.5 mb-2">
                          <Code2 className="w-3 h-3 text-zinc-600" />
                          <span className="text-xs text-zinc-500 truncate">
                            {visitor.skills.slice(0, 3).join(' • ')}
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-3 text-[10px] text-zinc-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Viewed {getRelativeTime(visitor.visitedAt)}</span>
                        </div>
                        {visitor.location && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            <span>{visitor.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {isPro && (
                      <Link
                        to={`/profile/${visitor.id}`}
                        className="px-4 py-2 bg-violet-500/10 border border-violet-500/20 rounded-xl text-xs font-bold text-violet-400 hover:bg-violet-500/20 transition-all"
                      >
                        View Profile
                      </Link>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            // Empty state
            <div className="text-center py-20 bg-zinc-900/60 rounded-3xl border border-zinc-800/60">
              <Eye className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No visitors yet</h3>
              <p className="text-zinc-500 text-sm max-w-xs mx-auto">
                When developers view your profile, they'll appear here.
              </p>
            </div>
          )}
        </div>

        {/* Pro upsell for free users */}
        {!isPro && data && data.visitors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gradient-to-br from-violet-500/10 to-purple-500/10 border border-violet-500/20 rounded-3xl text-center"
          >
            <div className="w-14 h-14 rounded-2xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-7 h-7 text-violet-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-2">
              {data.uniqueVisitorsCount} developers viewed your profile
            </h3>
            <p className="text-sm text-zinc-400 mb-5 max-w-md mx-auto">
              Upgrade to Merge Pro to see who's interested in connecting with you and unlock powerful networking insights.
            </p>
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold rounded-2xl text-sm hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
            >
              Unlock Profile Visitors
            </button>
          </motion.div>
        )}
      </div>

      <UpgradeModal isOpen={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
};

export default ProfileVisitorsPage;
