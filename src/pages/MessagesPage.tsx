import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Search, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/axios';
import { useSocket } from '../context/SocketContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { DashboardContainer, EmptyState } from '../components/DashboardComponents';

const MessagesPage = () => {
  const [chats, setChats] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { onlineUsers } = useSocket();

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await api.get('/matches');
        setChats(response.data);
      } catch (error) {
        console.error('Fetch chats error:', error);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 800);
      }
    };

    fetchChats();
  }, []);

  const filteredChats = chats.filter(chat => 
    chat.user.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <DashboardContainer>
        <div className="animate-pulse space-y-8">
          <div className="space-y-2">
            <div className="h-8 bg-white/5 rounded-full w-48" />
            <div className="h-4 bg-white/5 rounded-full w-64" />
          </div>
          <LoadingSkeleton type="list" />
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Search Bar - Moved below title */}
      <div className="mb-8">
        <div className="relative group max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-cyan transition-colors" />
          <input 
            type="text" 
            placeholder="Search messages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-11 bg-zinc-900/50 border border-zinc-800 rounded-xl pl-10 pr-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all w-full"
          />
        </div>
      </div>

      <div className="space-y-3">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat, idx) => {
            const isOnline = onlineUsers.includes(chat.user.id);
            return (
              <motion.div
                key={chat.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => navigate(`/chat/${chat.chatId}`)}
                className="group relative bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-800/50 rounded-2xl p-4 flex items-center gap-4 cursor-pointer transition-all duration-300"
              >
                <div className="relative shrink-0">
                  <img 
                    src={chat.user.avatar || '/default-avatar.png'} 
                    className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl object-cover border border-white/10" 
                    alt="" 
                  />
                  {isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-zinc-900 rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-white group-hover:text-brand-cyan transition-colors">
                      {chat.user.name}
                    </h3>
                    <span className="text-[10px] font-medium text-zinc-500">
                      {new Date(chat.matchedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-zinc-400 truncate max-w-[80%]">
                        Click to continue your conversation...
                    </p>
                    {isOnline && (
                        <span className="flex h-2 w-2 rounded-full bg-brand-cyan shadow-[0_0_8px_rgba(0,229,255,0.5)]" />
                    )}
                  </div>
                </div>

                <div className="shrink-0 p-2 text-zinc-600 group-hover:text-white transition-colors">
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            );
          })
        ) : (
          <EmptyState 
            icon={MessageSquare}
            title="No conversations found"
            description={searchQuery ? "No matches found for your search." : "Match with other builders to start chatting! Your inbox is waiting for its first legend."}
            actionLabel="Discover Builders"
            onAction={() => navigate('/discover')}
          />
        )}
      </div>
    </DashboardContainer>
  );
};

export default MessagesPage;
