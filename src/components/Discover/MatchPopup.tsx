import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Heart, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface Props {
  match: any;
  onClose: () => void;
}

const MatchPopup = ({ match, onClose }: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (!match) return null;

  const otherUser = match.user1Id === user?.id ? match.user2 : match.user1;

  const handleSendMessage = () => {
    onClose();
    navigate(`/chat/${match.chatId || match.chat?.id}`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-[#0A0A0B]/90 backdrop-blur-sm"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-[40px] p-10 text-center shadow-2xl overflow-hidden"
        >
          {/* Subtle Glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-brand-cyan/10 blur-[100px] rounded-full" />
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-brand-purple/10 blur-[100px] rounded-full" />

          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 rounded-full hover:bg-white/5 text-zinc-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-6 mb-10">
              <div className="relative">
                <div className="w-20 h-20 rounded-[24px] border-2 border-zinc-800 p-1 bg-zinc-900 shadow-xl">
                  <img src={user?.avatar || '/default-avatar.png'} className="w-full h-full rounded-[18px] object-cover" alt="" />
                </div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-brand-cyan to-brand-purple flex items-center justify-center shadow-lg shadow-brand-cyan/20">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="relative">
                <div className="w-20 h-20 rounded-[24px] border-2 border-zinc-800 p-1 bg-zinc-900 shadow-xl">
                  <img src={otherUser.avatar || '/default-avatar.png'} className="w-full h-full rounded-[18px] object-cover" alt="" />
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-10">
              <h2 className="text-3xl font-bold tracking-tight text-white uppercase italic">It's a Match!</h2>
              <p className="text-sm text-zinc-400 max-w-[280px] mx-auto leading-relaxed">
                You and <span className="text-white font-bold">{otherUser.name}</span> are now connected. Start building your next big project!
              </p>
            </div>

            <div className="space-y-4">
              <button 
                onClick={handleSendMessage}
                className="w-full py-4 bg-brand-cyan text-dark-bg rounded-2xl font-bold text-sm uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-xl shadow-brand-cyan/20"
              >
                <MessageSquare className="w-5 h-5" />
                Send Message
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-zinc-800/50 text-white border border-zinc-700/50 rounded-2xl font-bold text-sm hover:bg-zinc-800 transition-all"
              >
                Keep Discovering
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MatchPopup;
