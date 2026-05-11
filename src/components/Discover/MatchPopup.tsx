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
      <div className="fixed inset-0 z-100 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-dark-bg/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative w-full max-w-md bg-dark-card border border-white/10 rounded-[40px] p-8 text-center shadow-[0_0_50px_rgba(0,229,255,0.2)] overflow-hidden"
        >
          {/* Animated Background Elements */}
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1/2 -left-1/2 w-full h-full bg-brand-cyan/5 blur-[100px] rounded-full"
            />
            <motion.div 
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-brand-purple/5 blur-[100px] rounded-full"
            />
          </div>

          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/5 text-slate-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10">
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-brand-cyan p-1 bg-dark-bg">
                  <img src={match.user1.avatar || '/default-avatar.png'} className="w-full h-full rounded-full object-cover" alt="" />
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-brand-cyan to-brand-purple flex items-center justify-center shadow-lg">
                <Heart className="w-6 h-6 text-white fill-white" />
              </div>
              <div className="relative">
                <div className="w-20 h-20 rounded-full border-2 border-brand-purple p-1 bg-dark-bg">
                  <img src={match.user2.avatar || '/default-avatar.png'} className="w-full h-full rounded-full object-cover" alt="" />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-brand-cyan" />
              <h2 className="text-3xl font-black italic tracking-tighter text-white">IT'S A MATCH!</h2>
              <Sparkles className="w-5 h-5 text-brand-purple" />
            </div>
            
            <p className="text-slate-400 mb-8 px-4">
              You and <span className="text-white font-bold">{otherUser.name}</span> liked each other. You can now start building together.
            </p>

            <div className="space-y-3">
              <button 
                onClick={handleSendMessage}
                className="w-full py-4 bg-brand-cyan text-dark-bg rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_0_20px_rgba(0,229,255,0.4)] hover:scale-[1.02] transition-all flex items-center justify-center gap-3"
              >
                <MessageSquare className="w-5 h-5" />
                Send Message
              </button>
              <button 
                onClick={onClose}
                className="w-full py-4 bg-white/5 text-white border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/10 transition-all"
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
