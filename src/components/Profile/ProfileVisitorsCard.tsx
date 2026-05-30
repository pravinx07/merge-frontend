import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Eye, Users, ArrowRight, Lock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/axios';

interface VisitorStats {
  recentVisitors: number;
  totalVisitors: number;
}

export const ProfileVisitorsCard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<VisitorStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isPro = user?.plan === 'pro';

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/user/visitors/stats');
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch visitor stats');
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 animate-pulse">
        <div className="h-5 w-32 bg-zinc-800 rounded-lg mb-4" />
        <div className="h-8 w-20 bg-zinc-800 rounded-lg mb-2" />
        <div className="h-4 w-40 bg-zinc-800/60 rounded-lg" />
      </div>
    );
  }

  return (
    <Link
      to="/profile/visitors"
      className="block bg-zinc-900/60 border border-zinc-800/60 rounded-2xl p-5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
            <Eye className="w-4 h-4 text-violet-400" />
          </div>
          <h3 className="text-sm font-bold text-white">Profile Visitors</h3>
        </div>
        {!isPro && (
          <div className="px-2 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
            <Lock className="w-3 h-3 text-zinc-500" />
          </div>
        )}
      </div>

      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-black text-white mb-1">
            {stats?.recentVisitors ?? 0}
          </p>
          <p className="text-xs text-zinc-500">
            {stats?.recentVisitors === 1 ? 'developer' : 'developers'} visited this week
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Mini stat */}
      {stats && stats.totalVisitors > 0 && (
        <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center gap-2">
          <Users className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-[11px] text-zinc-500">
            {stats.totalVisitors} total {isPro ? 'unique visitors' : 'profile views'}
          </span>
        </div>
      )}
    </Link>
  );
};

export default ProfileVisitorsCard;
