import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useSocket } from '../context/SocketContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { DashboardContainer, EmptyState } from '../components/DashboardComponents';

const MatchesPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await api.get('/matches');
        setMatches(response.data);
      } catch (error) {
        console.error('Fetch matches error:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    fetchMatches();
  }, []);

  const filteredMatches = matches.filter(match => 
    match.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardContainer>
        <div className="animate-pulse space-y-8">
          <div className="space-y-2">
            <div className="h-8 bg-white/5 rounded-full w-48" />
            <div className="h-4 bg-white/5 rounded-full w-64" />
          </div>
          <LoadingSkeleton type="card" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <div className="mb-8">
        <div className="relative group max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-cyan transition-colors" />
          <input 
            type="text" 
            placeholder="Search connections..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all w-full"
          />
        </div>
      </div>

      {filteredMatches.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredMatches.map((match, idx) => {
            const isOnline = onlineUsers.includes(match.user.id);
            return (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="group relative bg-zinc-900/40 hover:bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-5 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <img
                        src={match.user.avatar || '/default-avatar.png'}
                        alt={match.user.name}
                        className="w-12 h-12 rounded-xl object-cover border border-white/5"
                      />
                      {isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-900 rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white group-hover:text-brand-cyan transition-colors">
                        {match.user.name}
                      </h3>
                      <p className="text-xs text-zinc-500 font-medium truncate">
                        {match.user.personality || 'Full Stack Developer'}
                      </p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${isOnline ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-zinc-500'}`}>
                    {isOnline ? 'Online' : 'Offline'}
                  </div>
                </div>

                {/* Skills Tag Area */}
                <div className="flex flex-wrap gap-1.5 mb-6">
                  {(match.user.skills?.slice(0, 3) || ['React', 'Node', 'AI']).map((skill: string) => (
                    <span key={skill} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-medium text-zinc-400">
                      {skill}
                    </span>
                  ))}
                  {match.user.skills?.length > 3 && (
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[10px] font-medium text-zinc-500">
                      +{match.user.skills.length - 3}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-purple" style={{ width: '92%' }} />
                    </div>
                    <span className="text-[10px] font-bold text-brand-purple uppercase">92% Match</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate(`/chat/${match.chatId}`)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-brand-cyan text-dark-bg rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Message
                  </button>
                  <button
                    onClick={() => navigate(`/profile/${match.user.id}`)}
                    className="flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-all"
                  >
                    View Profile
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <EmptyState 
          icon={Users}
          title="No connections yet"
          description="Start discovering builders and create meaningful collaborations. Your next big project starts with a single match."
          actionLabel="Explore Developers"
          onAction={() => navigate('/discover')}
        />
      )}
    </DashboardContainer>
  );
};

export default MatchesPage;
