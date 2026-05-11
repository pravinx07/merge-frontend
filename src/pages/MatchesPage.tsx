import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Users, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useSocket } from '../context/SocketContext';

const MatchesPage = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        setIsLoading(false);
      }
    };

    fetchMatches();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-24 pb-20 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-12">
          <div className="p-3 rounded-2xl bg-linear-to-br from-brand-cyan to-brand-purple text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-black italic tracking-tighter text-white uppercase">Your Matches</h1>
            <p className="text-slate-400 font-medium">Connect with developers you've matched with.</p>
          </div>
        </div>

        {matches.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match) => {
              const isOnline = onlineUsers.includes(match.user.id);
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-dark-card border border-white/5 rounded-3xl p-6 hover:border-brand-cyan/30 transition-all group"
                >
                  <div className="flex items-center gap-4 mb-6">
                    <div className="relative">
                      <img
                        src={match.user.avatar || '/default-avatar.png'}
                        alt={match.user.name}
                        className="w-16 h-16 rounded-full object-cover border-2 border-white/10"
                      />
                      {isOnline && (
                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-dark-card rounded-full" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-brand-cyan transition-colors">
                        {match.user.name}
                      </h3>
                      <div className="flex items-center gap-2">
                        {isOnline ? (
                          <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Online</span>
                        ) : (
                          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Offline</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/chat/${match.chatId}`)}
                    className="w-full py-4 bg-white/5 hover:bg-brand-cyan hover:text-dark-bg border border-white/10 hover:border-brand-cyan rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 text-white"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </button>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-dark-card/20 rounded-[40px] border border-dashed border-dark-border">
            <Sparkles className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">No matches yet</h3>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">
              Keep discovering and liking profiles to find your next collaborator!
            </p>
            <button
              onClick={() => navigate('/discover')}
              className="px-8 py-3 bg-brand-cyan text-dark-bg rounded-xl font-bold hover:scale-105 transition-all"
            >
              Discover Developers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchesPage;
