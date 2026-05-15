import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutGrid, MapPin, Users, Send, Check, X, MessageSquare, Briefcase, Plus, Shield } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { DashboardContainer } from '../components/DashboardComponents';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton';

const ProjectDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState<'details' | 'applications' | 'chat'>('details');
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const fetchProjectDetails = async () => {
    try {
      const response = await api.get(`/projects/${id}`);
      setProject(response.data);
    } catch (error) {
      console.error('Fetch project details error:', error);
      toast.error('Project not found');
      navigate('/projects');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchChatMessages = async () => {
    try {
      const response = await api.get(`/projects/${id}/chat`);
      setChatMessages(response.data);
    } catch (error) {
      console.error('Fetch chat error:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProjectDetails();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab === 'chat' && isMember) {
      fetchChatMessages();
      // Polling for demo purposes, socket would be better
      const interval = setInterval(fetchChatMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [activeTab, id]);

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingSkeleton type="profile" />
      </DashboardContainer>
    );
  }

  if (!project) return null;

  const isOwner = project.ownerId === user?.id;
  const isMember = project.members.some((m: any) => m.userId === user?.id);
  const hasApplied = project.requests.some((r: any) => r.applicantId === user?.id);
  const pendingRequests = project.requests.filter((r: any) => r.status === 'Pending');

  const handleApply = async () => {
    setIsApplying(true);
    try {
      await api.post(`/projects/${id}/apply`, { message: applyMessage });
      toast.success('Application sent successfully!');
      setIsApplyModalOpen(false);
      setApplyMessage('');
      fetchProjectDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply');
    } finally {
      setIsApplying(false);
    }
  };

  const handleApplication = async (appId: string, status: 'Accepted' | 'Rejected') => {
    try {
      await api.put(`/projects/${id}/applications/${appId}`, { status });
      toast.success(`Application ${status.toLowerCase()}`);
      fetchProjectDetails();
    } catch (error) {
      toast.error('Failed to update application');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await api.post(`/projects/${id}/chat`, { content: newMessage });
      setNewMessage('');
      fetchChatMessages();
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  return (
    <DashboardContainer>
      {/* Header Banner */}
      <div className="bg-zinc-900/40 border border-white/10 rounded-2xl p-8 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black tracking-tight text-white">{project.title}</h1>
              <span className="px-3 py-1 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-md text-[10px] font-black uppercase tracking-widest">
                {project.status || 'Idea'}
              </span>
            </div>
            <p className="text-zinc-400 max-w-2xl text-sm leading-relaxed">{project.description}</p>
          </div>

          <div className="flex items-center gap-3">
            {isOwner ? (
              <span className="px-4 py-2 bg-brand-purple/20 text-brand-purple rounded-xl text-sm font-bold border border-brand-purple/30 flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Project Owner
              </span>
            ) : isMember ? (
              <span className="px-4 py-2 bg-green-500/20 text-green-500 rounded-xl text-sm font-bold border border-green-500/30 flex items-center gap-2">
                <Check className="w-4 h-4" />
                Member
              </span>
            ) : hasApplied ? (
              <span className="px-4 py-2 bg-zinc-800 text-zinc-400 rounded-xl text-sm font-bold border border-white/10 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Applied (Pending)
              </span>
            ) : (
              <button 
                onClick={() => setIsApplyModalOpen(true)}
                className="px-6 py-2 bg-brand-cyan text-dark-bg rounded-xl text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(0,229,255,0.2)]"
              >
                Apply to Join
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6 mt-8 pt-6 border-t border-white/5">
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <LayoutGrid className="w-4 h-4 text-zinc-500" />
            <span className="font-medium text-white">{project.projectType || 'Startup'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <MapPin className="w-4 h-4 text-zinc-500" />
            <span className="font-medium text-white">{project.location || 'Remote'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="font-medium text-white">{project.members.length} / {project.teamSize || '∞'} Members</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
        <button 
          onClick={() => setActiveTab('details')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'details' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          Overview
        </button>
        {isOwner && (
          <button 
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'applications' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Applications
            {pendingRequests.length > 0 && (
              <span className="bg-brand-cyan text-dark-bg px-1.5 py-0.5 rounded-md text-[10px]">{pendingRequests.length}</span>
            )}
          </button>
        )}
        {isMember && (
          <button 
            onClick={() => setActiveTab('chat')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${activeTab === 'chat' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Team Chat
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {activeTab === 'details' && (
          <>
            <div className="lg:col-span-2 space-y-6">
              {/* Looking For */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-brand-purple" />
                  Looking For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.lookingFor.map((role: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-lg text-xs font-bold">
                      {role}
                    </span>
                  ))}
                  {project.lookingFor.length === 0 && <span className="text-zinc-500 text-sm">No specific roles listed.</span>}
                </div>
              </div>

              {/* Tech Stack */}
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                  <LayoutGrid className="w-4 h-4 text-brand-cyan" />
                  Tech Stack
                </h3>
                <div className="flex flex-wrap gap-2">
                  {project.techStack.map((tech: string, idx: number) => (
                    <span key={idx} className="px-3 py-1.5 bg-white/5 border border-white/10 text-zinc-300 rounded-lg text-xs font-bold hover:bg-white/10 transition-colors cursor-default">
                      {tech}
                    </span>
                  ))}
                  {project.techStack.length === 0 && <span className="text-zinc-500 text-sm">Tech stack not specified.</span>}
                </div>
              </div>
            </div>

            {/* Sidebar (Members) */}
            <div className="space-y-6">
              <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 flex items-center justify-between">
                  <span>Team Members</span>
                  <span className="text-zinc-500 text-xs">{project.members.length} / {project.teamSize || '∞'}</span>
                </h3>
                <div className="space-y-4">
                  {project.members.map((member: any) => (
                    <div key={member.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate(`/profile/${member.user.id}`)}>
                      <img src={member.user.avatar || '/default-avatar.png'} className="w-10 h-10 rounded-xl object-cover border border-white/10 group-hover:border-brand-cyan/50 transition-colors" alt="" />
                      <div>
                        <p className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">{member.user.name}</p>
                        <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'applications' && isOwner && (
          <div className="col-span-1 lg:col-span-3">
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6">
              <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Pending Applications ({pendingRequests.length})</h3>
              
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                  <p className="text-zinc-500 font-medium">No pending applications at the moment.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.map((req: any) => (
                    <div key={req.id} className="bg-black/20 border border-white/5 rounded-xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                      <div className="flex gap-4 items-start">
                        <img src={req.applicant.avatar || '/default-avatar.png'} className="w-12 h-12 rounded-xl object-cover border border-white/10 cursor-pointer" onClick={() => navigate(`/profile/${req.applicant.id}`)} alt="" />
                        <div>
                          <p className="text-sm font-bold text-white cursor-pointer hover:text-brand-cyan transition-colors" onClick={() => navigate(`/profile/${req.applicant.id}`)}>{req.applicant.name}</p>
                          <div className="flex gap-2 mt-1 mb-2">
                            {req.applicant.skills?.slice(0, 3).map((skill: string) => (
                              <span key={skill} className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-zinc-400">{skill}</span>
                            ))}
                          </div>
                          <div className="bg-white/5 p-3 rounded-lg border border-white/5 text-xs text-zinc-300 italic mt-2">
                            "{req.message}"
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full md:w-auto">
                        <button 
                          onClick={() => handleApplication(req.id, 'Rejected')}
                          className="flex-1 md:flex-none px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg text-xs font-bold transition-colors"
                        >
                          Reject
                        </button>
                        <button 
                          onClick={() => handleApplication(req.id, 'Accepted')}
                          className="flex-1 md:flex-none px-4 py-2 bg-brand-cyan text-dark-bg hover:bg-brand-cyan/90 rounded-lg text-xs font-bold transition-colors"
                        >
                          Accept
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'chat' && isMember && (
          <div className="col-span-1 lg:col-span-3">
            <div className="bg-zinc-900/40 border border-white/5 rounded-2xl h-[600px] flex flex-col overflow-hidden">
              <div className="p-4 border-b border-white/5 bg-zinc-900/80">
                <h3 className="text-sm font-black text-white uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-brand-cyan" />
                  Team Chat
                </h3>
              </div>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-4">
                {chatMessages.map((msg, idx) => {
                  const isMe = msg.senderId === user?.id;
                  return (
                    <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                      <img src={msg.sender.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                      <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                        <span className="text-[10px] text-zinc-500 font-bold mb-1 ml-1">{isMe ? 'You' : msg.sender.name}</span>
                        <div className={`p-3 rounded-2xl text-sm ${isMe ? 'bg-brand-cyan text-dark-bg rounded-tr-sm' : 'bg-white/5 text-white rounded-tl-sm border border-white/5'}`}>
                          {msg.content}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {chatMessages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                    <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                    <p className="font-medium">No messages yet. Start the conversation!</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-white/5 bg-zinc-900/80">
                <form onSubmit={handleSendMessage} className="relative flex items-center gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Message the team..."
                    className="flex-1 bg-black/50 border border-white/10 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                  />
                  <button 
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="absolute right-2 p-2 bg-brand-cyan text-dark-bg rounded-lg hover:bg-brand-cyan/90 disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsApplyModalOpen(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Apply to Join</h2>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Message to Founder</label>
              <textarea 
                value={applyMessage}
                onChange={e => setApplyMessage(e.target.value)}
                placeholder="Hey, I'd love to contribute as a React developer..."
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50 min-h-[120px] resize-none"
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setIsApplyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button 
                onClick={handleApply}
                disabled={isApplying}
                className="px-5 py-2.5 rounded-xl text-sm font-bold bg-brand-cyan text-dark-bg hover:bg-brand-cyan/90 disabled:opacity-50"
              >
                {isApplying ? 'Sending...' : 'Send Application'}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardContainer>
  );
};

export default ProjectDetailsPage;
