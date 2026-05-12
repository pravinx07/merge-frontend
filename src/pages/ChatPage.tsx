import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../lib/axios';

const ChatPage = () => {
  const { chatId } = useParams();
  const { user } = useAuth();
  const { socket, onlineUsers } = useSocket();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const fetchChatData = async () => {
      try {
        const [messagesRes, matchesRes] = await Promise.all([
          api.get(`/matches/${chatId}/messages`),
          api.get('/matches')
        ]);

        setMessages(messagesRes.data);
        
        // Find the match to get the other user's info
        const currentMatch = matchesRes.data.find((m: any) => m.chatId === chatId);
        if (currentMatch) {
          setOtherUser(currentMatch.user);
        }
      } catch (error) {
        console.error('Fetch chat error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChatData();
  }, [chatId]);

  useEffect(() => {
    if (!socket || !chatId) return;

    socket.emit('join_chat', chatId);

    socket.on('message_received', (message: any) => {
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on('typing', (room: string) => {
      if (room === chatId) setIsTyping(true);
    });

    socket.on('stop_typing', (room: string) => {
      if (room === chatId) setIsTyping(false);
    });

    return () => {
      socket.off('message_received');
      socket.off('typing');
      socket.off('stop_typing');
    };
  }, [socket, chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !socket || !user) return;

    const messageData = {
      chatId,
      senderId: user.id,
      content: newMessage,
      participants: [user, otherUser]
    };

    socket.emit('new_message', messageData);
    
    // Optimistic update
    const optimisticMessage = {
      id: Date.now().toString(),
      content: newMessage,
      senderId: user.id,
      sender: user,
      createdAt: new Date().toISOString()
    };
    
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage('');
    socket.emit('stop_typing', chatId);
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (!socket || !chatId) return;

    if (e.target.value.length > 0) {
      socket.emit('typing', chatId);
    } else {
      socket.emit('stop_typing', chatId);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand-cyan animate-spin" />
      </div>
    );
  }

  const isOnline = otherUser && onlineUsers.includes(otherUser.id);

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col pt-20">
      {/* Chat Header */}
      <div className="bg-dark-card/50 backdrop-blur-xl border-b border-white/5 p-4 px-6 flex items-center justify-between sticky top-20 z-10">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/matches')}
            className="p-2 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={otherUser?.avatar || '/default-avatar.png'} 
                className="w-10 h-10 rounded-full object-cover border border-white/10" 
                alt="" 
              />
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-dark-card rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-white font-bold">{otherUser?.name}</h3>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.id;
          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] md:max-w-[60%] px-5 py-3 rounded-3xl text-sm font-medium ${
                isMe 
                  ? 'bg-brand-cyan text-dark-bg rounded-tr-none shadow-[0_0_20px_rgba(0,229,255,0.2)]' 
                  : 'bg-dark-card border border-white/5 text-white rounded-tl-none'
              }`}>
                {msg.content}
                <p className={`text-[10px] mt-1 opacity-50 ${isMe ? 'text-dark-bg' : 'text-slate-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </motion.div>
          );
        })}
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-dark-card border border-white/5 text-slate-400 px-5 py-2 rounded-3xl rounded-tl-none text-xs flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              {otherUser?.name} is typing...
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-6 bg-dark-bg">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto relative"
        >
          <input
            type="text"
            value={newMessage}
            onChange={handleTyping}
            placeholder="Type your message..."
            className="w-full bg-dark-card border border-white/5 focus:border-brand-cyan/50 rounded-2xl py-4 px-6 pr-16 text-white text-sm outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-cyan text-dark-bg rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-lg"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatPage;
