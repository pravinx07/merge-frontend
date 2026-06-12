import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Send, ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../lib/axios';
import { BuildWorkspaceModal } from '../components/BuildWorkspaceModal';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
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
    <div className="h-[calc(100vh-64px)] bg-dark-bg flex flex-col">
      {/* Chat Header */}
      <div className="bg-dark-card/50 backdrop-blur-xl border-b border-white/5 p-3 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/matches')}
            className="p-1.5 hover:bg-white/5 rounded-full text-slate-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={otherUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || 'User')}&background=random`} 
                className="w-8 h-8 rounded-full object-cover border border-white/10" 
                alt="" 
              />
              {isOnline && (
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-dark-card rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-sm text-white font-bold">{otherUser?.name}</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                {isOnline ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setIsWorkspaceOpen(true)}
          className="flex items-center gap-2 bg-zinc-800 border border-zinc-700 text-brand-cyan px-4 py-2 rounded-xl text-xs font-bold shadow-lg hover:bg-zinc-700 hover:scale-105 transition-all"
        >
          <span>Build Together</span>
        </button>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 flex flex-col">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?.id;
          return (
            <motion.div
              key={msg.id || index}
              initial={{ opacity: 0, x: isMe ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] md:max-w-[70%] px-3 py-2 rounded-2xl text-[13px] font-medium overflow-hidden ${
                isMe 
                  ? 'bg-brand-cyan text-dark-bg rounded-tr-sm shadow-[0_0_10px_rgba(0,229,255,0.1)]' 
                  : 'bg-dark-card border border-white/5 text-white rounded-tl-sm'
              }`}>
                <div className={`prose max-w-none text-[13px] leading-relaxed [&>p]:m-0 [&>pre]:my-2 [&>pre]:rounded-md [&>pre]:text-[11px] ${isMe ? 'text-dark-bg prose-p:text-dark-bg prose-headings:text-dark-bg prose-a:text-dark-bg' : 'prose-invert text-white'}`}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({node, className, children, ...props}) {
                        const match = /language-(\w+)/.exec(className || '');
                        // Check if it's inline code or block code
                        const isInline = !match && !String(children).includes('\n');
                        const { ref, ...rest } = props as any;
                        return !isInline && match ? (
                          <SyntaxHighlighter
                            style={vscDarkPlus as any}
                            language={match[1]}
                            PreTag="div"
                            className="rounded-md !bg-black/50 border border-white/10 !m-0"
                            {...rest}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className="bg-black/20 px-1 py-0.5 rounded text-[12px] font-mono text-pink-400" {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <p className={`text-[9px] mt-1 opacity-60 text-right ${isMe ? 'text-dark-bg' : 'text-slate-400'}`}>
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
            <div className="bg-dark-card border border-white/5 text-slate-400 px-3 py-1.5 rounded-2xl rounded-tl-sm text-[11px] flex items-center gap-1.5">
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce" />
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1 h-1 bg-slate-500 rounded-full animate-bounce [animation-delay:0.4s]" />
              {otherUser?.name} is typing...
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="px-3 py-2 bg-dark-bg border-t border-white/5 shrink-0">
        <form 
          onSubmit={handleSendMessage}
          className="max-w-4xl mx-auto relative"
        >
          <textarea
            value={newMessage}
            onChange={handleTyping as any}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e as any);
              }
            }}
            placeholder="Type a message or paste code... (Shift+Enter for new line)"
            className="w-full bg-dark-card border border-white/5 focus:border-brand-cyan/50 rounded-lg py-3 px-4 pr-12 text-white text-[13px] outline-none transition-all resize-none min-h-[48px] max-h-[200px]"
            rows={newMessage.split('\n').length > 1 ? Math.min(newMessage.split('\n').length, 8) : 1}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            className="absolute right-2 bottom-2 w-8 h-8 bg-brand-cyan text-dark-bg rounded-md flex items-center justify-center hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md"
          >
            <Send className="w-4 h-4 -ml-0.5" />
          </button>
        </form>
      </div>

      <BuildWorkspaceModal 
        isOpen={isWorkspaceOpen} 
        onClose={() => setIsWorkspaceOpen(false)} 
        otherUser={otherUser} 
        currentUser={user}
        chatId={chatId || ''}
      />
    </div>
  );
};

export default ChatPage;
