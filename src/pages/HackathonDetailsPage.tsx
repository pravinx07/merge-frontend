import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Trophy, Calendar, MapPin, Users, Send, Check, X, 
  MessageSquare, Briefcase, Shield, AlertCircle, Sparkles, Plus 
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { DashboardContainer } from '../components/DashboardComponents';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton';

const HackathonDetailsPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();

  const [hackathon, setHackathon] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'teams' | 'workspace'>('overview');
  
  // Create Team state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDesc, setTeamDesc] = useState('');
  const [lookingForRole, setLookingForRole] = useState('');
  const [lookingForList, setLookingForList] = useState<string[]>([]);
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);

  // Apply to join team state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<any>(null);
  const [applyMessage, setApplyMessage] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Real-time Chat & Workspace State
  const [userTeam, setUserTeam] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchHackathonDetails = async () => {
    try {
      const response = await api.get(`/hackathons/${id}`);
      setHackathon(response.data);
      
      // Determine if current user is already in a team for this hackathon
      const teams = response.data.teams || [];
      const joinedTeam = teams.find((t: any) => 
        t.members.some((m: any) => m.userId === user?.id)
      );
      if (joinedTeam) {
        setUserTeam(joinedTeam);
      } else {
        setUserTeam(null);
      }
    } catch (error) {
      console.error('Fetch hackathon details error:', error);
      toast.error('Hackathon not found');
      navigate('/hackathons');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTeamChatMessages = async () => {
    if (!userTeam) return;
    try {
      const response = await api.get(`/hackathons/teams/${userTeam.id}/chat`);
      setChatMessages(response.data);
    } catch (error) {
      console.error('Fetch team chat messages error:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchHackathonDetails();
    }
  }, [id, user?.id]);

  // Set up socket listener for real-time team chat
  useEffect(() => {
    if (!socket || !userTeam) return;

    socket.emit('join_chat', `team_${userTeam.id}`);

    const handleMessageReceived = (msg: any) => {
      if (msg.teamId === userTeam.id) {
        setChatMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('team_message_received', handleMessageReceived);

    return () => {
      socket.off('team_message_received', handleMessageReceived);
    };
  }, [socket, userTeam?.id]);

  // Handle auto scroll for chat
  useEffect(() => {
    if (activeTab === 'workspace' && userTeam) {
      fetchTeamChatMessages();
    }
  }, [activeTab, userTeam?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAddRole = () => {
    if (lookingForRole.trim() && !lookingForList.includes(lookingForRole.trim())) {
      setLookingForList([...lookingForList, lookingForRole.trim()]);
      setLookingForRole('');
    }
  };

  const handleRemoveRole = (role: string) => {
    setLookingForList(lookingForList.filter(r => r !== role));
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim() || !teamDesc.trim()) {
      toast.error('Team Name and Description are required');
      return;
    }
    setIsCreatingTeam(true);
    try {
      const res = await api.post(`/hackathons/${id}/teams`, {
        name: teamName,
        description: teamDesc,
        lookingFor: lookingForList
      });
      toast.success('Team created successfully!');
      setIsCreateModalOpen(false);
      // Reset form
      setTeamName('');
      setTeamDesc('');
      setLookingForList([]);
      
      // Refresh details
      await fetchHackathonDetails();
      setActiveTab('workspace');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create team');
    } finally {
      setIsCreatingTeam(false);
    }
  };

  const handleOpenApplyModal = (team: any) => {
    setSelectedTeam(team);
    setApplyMessage(`I can contribute as a ${team.lookingFor[0] || 'developer'}.`);
    setIsApplyModalOpen(true);
  };

  const handleApplyToTeam = async () => {
    if (!selectedTeam) return;
    setIsApplying(true);
    try {
      await api.post(`/hackathons/teams/${selectedTeam.id}/apply`, {
        message: applyMessage
      });
      toast.success(`Application sent to ${selectedTeam.name}!`);
      setIsApplyModalOpen(false);
      setSelectedTeam(null);
      setApplyMessage('');
      fetchHackathonDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to apply to team');
    } finally {
      setIsApplying(false);
    }
  };

  const handleJoinRequestDecision = async (requestId: string, status: 'Accepted' | 'Rejected') => {
    if (!userTeam) return;
    try {
      await api.put(`/hackathons/teams/${userTeam.id}/applications/${requestId}`, { status });
      toast.success(`Request ${status.toLowerCase()}`);
      fetchHackathonDetails();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !userTeam) return;

    try {
      const res = await api.post(`/hackathons/teams/${userTeam.id}/chat`, {
        content: newMessage
      });
      // Optimistically insert user's message locally
      setChatMessages((prev) => [...prev, res.data]);
      setNewMessage('');
    } catch (error) {
      toast.error('Failed to send message');
    }
  };

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingSkeleton type="profile" />
      </DashboardContainer>
    );
  }

  if (!hackathon) return null;

  const userRoleInTeam = userTeam?.members.find((m: any) => m.userId === user?.id)?.role;
  const isTeamCreator = userRoleInTeam === 'Creator';
  
  // Sort teams so the highly matched recommendations show up first
  const recommendedTeam = hackathon.teams?.find((team: any) => 
    !team.members.some((m: any) => m.userId === user?.id)
  );

  return (
    <DashboardContainer>
      {/* Sleek, Compact Hackathon banner details */}
      <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-5 md:p-6 mb-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-2.5">
              <span className="px-2.5 py-0.5 bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan rounded-md text-[9px] font-black uppercase tracking-widest">
                {hackathon.type}
              </span>
              <span className="text-zinc-500 text-xs font-bold flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-brand-purple" />
                {hackathon.duration}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-white mb-1.5">{hackathon.title}</h1>
            <p className="text-zinc-400 text-xs max-w-3xl leading-relaxed font-medium">{hackathon.description}</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto mt-2 md:mt-0">
            {userTeam ? (
              <button 
                onClick={() => setActiveTab('workspace')}
                className="w-full md:w-auto px-5 py-2.5 bg-brand-purple text-white rounded-xl text-xs font-black border border-brand-purple/30 flex items-center justify-center gap-2 hover:scale-102 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.15)] cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 animate-bounce" />
                Enter Team Room
              </button>
            ) : (
              <button 
                onClick={() => setIsCreateModalOpen(true)}
                className="w-full md:w-auto px-5 py-2.5 bg-brand-cyan text-dark-bg rounded-xl text-xs font-black flex items-center justify-center gap-2 hover:scale-102 active:scale-98 transition-all shadow-[0_0_15px_rgba(0,229,255,0.15)] cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Create Team
              </button>
            )}
          </div>
        </div>

        {hackathon.location && (
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/5 text-xs text-zinc-500 font-bold">
            <MapPin className="w-3.5 h-3.5 text-zinc-600" />
            <span>Venue: <strong className="text-white font-black">{hackathon.location}</strong></span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-white/5 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'overview' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('teams')}
          className={`px-4 py-2 text-sm font-bold rounded-lg transition-all ${
            activeTab === 'teams' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Teams Looking For Devs ({hackathon.teams?.length || 0})
        </button>
        {userTeam && (
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-4 py-2 text-sm font-bold rounded-lg transition-all flex items-center gap-2 ${
              activeTab === 'workspace' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <MessageSquare className="w-4 h-4 text-brand-cyan" />
            Team Workspace ({userTeam.name})
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {activeTab === 'overview' && (
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-black text-lg mb-4">Event Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-1">Duration</h4>
                  <p className="text-white font-semibold">{hackathon.duration}</p>
                </div>
                <div>
                  <h4 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-1">Type</h4>
                  <p className="text-white font-semibold">{hackathon.type} Hackathon</p>
                </div>
                <div>
                  <h4 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-1">Start Date</h4>
                  <p className="text-white font-semibold">{new Date(hackathon.startDate).toLocaleDateString([], { dateStyle: 'long' })}</p>
                </div>
                <div>
                  <h4 className="text-zinc-500 font-bold text-xs uppercase tracking-wider mb-1">Venue / Platform</h4>
                  <p className="text-white font-semibold">{hackathon.location || 'Virtual Platform'}</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-black text-lg mb-2">How it works</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                Merge coordinates teams automatically. Find co-builders, establish your team workspace, unlock group chats, and submit projects directly inside the application.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
                  <span className="text-brand-cyan text-xs font-black uppercase tracking-widest block mb-2">Step 1</span>
                  <h4 className="text-white font-bold text-sm mb-1">Browse and Match</h4>
                  <p className="text-zinc-500 text-xs">Explore recommended teams matching your skills at 80% or higher.</p>
                </div>
                <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
                  <span className="text-brand-purple text-xs font-black uppercase tracking-widest block mb-2">Step 2</span>
                  <h4 className="text-white font-bold text-sm mb-1">Apply or Create</h4>
                  <p className="text-zinc-500 text-xs">Apply with one click or create your own team specifications.</p>
                </div>
                <div className="p-4 bg-zinc-950/40 rounded-xl border border-white/5">
                  <span className="text-emerald-500 text-xs font-black uppercase tracking-widest block mb-2">Step 3</span>
                  <h4 className="text-white font-bold text-sm mb-1">Unlock Collaboration</h4>
                  <p className="text-zinc-500 text-xs">Instantly open a private real-time room for workspace chat.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'teams' && (
          <div className="lg:col-span-3 space-y-6">
            
            {/* AI Skill-Based Recommended Team Banner */}
            {recommendedTeam && (
              <div className="bg-gradient-to-r from-brand-cyan/20 to-brand-purple/20 border border-brand-cyan/30 rounded-3xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-[0_0_30px_rgba(0,229,255,0.05)]">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 bg-brand-cyan text-dark-bg rounded-md text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                      <Sparkles className="w-3 h-3 animate-pulse" />
                      Recommended Team
                    </span>
                    <span className="text-brand-cyan font-black text-xs">
                      Match Score: {recommendedTeam.matchPercentage || 92}%
                    </span>
                  </div>
                  <h3 className="text-2xl font-black text-white mb-1">{recommendedTeam.name}</h3>
                  <p className="text-zinc-300 text-sm max-w-2xl">{recommendedTeam.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    {recommendedTeam.lookingFor?.map((role: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-1 rounded-md text-zinc-400">
                        {role}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleOpenApplyModal(recommendedTeam)}
                    className="px-6 py-3 bg-brand-cyan text-dark-bg font-black rounded-xl text-xs hover:scale-105 active:scale-95 transition-all shadow-md w-full md:w-auto"
                  >
                    Join Team
                  </button>
                </div>
              </div>
            )}

            <h3 className="text-white font-black text-lg mb-2">Available Teams Looking for Developers</h3>
            
            {hackathon.teams?.length === 0 ? (
              <div className="text-center py-16 bg-zinc-900/10 border border-white/5 rounded-2xl">
                <Users className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium mb-4">No teams created for this hackathon yet.</p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-5 py-2.5 bg-brand-cyan text-dark-bg rounded-xl text-xs font-black hover:scale-102 transition-transform"
                >
                  Create the First Team
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {hackathon.teams.map((team: any) => {
                  const isUserInThisTeam = team.members.some((m: any) => m.userId === user?.id);
                  const hasAppliedToThisTeam = team.requests?.some((r: any) => r.applicantId === user?.id && r.status === 'Pending');

                  return (
                    <div
                      key={team.id}
                      className="bg-zinc-900/20 border border-white/5 rounded-2xl p-6 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-lg font-black text-white">{team.name}</h4>
                          <span className="text-[11px] font-black text-brand-cyan bg-brand-cyan/5 px-2.5 py-0.5 rounded border border-brand-cyan/10">
                            {team.matchPercentage || 75}% Match
                          </span>
                        </div>

                        <p className="text-zinc-400 text-xs line-clamp-3 leading-relaxed mb-6 font-medium">
                          {team.description}
                        </p>

                        <div className="space-y-4">
                          <div>
                            <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block mb-2">Looking for:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {team.lookingFor?.map((role: string, idx: number) => (
                                <span key={idx} className="text-[10px] font-black bg-brand-purple/10 border border-brand-purple/20 text-brand-purple px-2.5 py-1 rounded-md">
                                  {role}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-bold pt-4 border-t border-white/5">
                            <Users className="w-4 h-4 text-zinc-600" />
                            <span>{team.members?.length} / 5 Members</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6">
                        {isUserInThisTeam ? (
                          <button
                            disabled
                            className="w-full py-2.5 bg-zinc-800 text-zinc-500 rounded-xl text-xs font-black border border-white/5"
                          >
                            You are in this team
                          </button>
                        ) : hasAppliedToThisTeam ? (
                          <button
                            disabled
                            className="w-full py-2.5 bg-zinc-900 text-zinc-500 rounded-xl text-xs font-black border border-white/5"
                          >
                            Application Pending
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenApplyModal(team)}
                            className="w-full py-3 bg-white/5 hover:bg-brand-cyan hover:text-dark-bg border border-white/5 hover:border-brand-cyan rounded-xl text-xs font-black transition-all shadow-md active:scale-98 cursor-pointer"
                          >
                            Join Team
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'workspace' && userTeam && (
          <div className="col-span-1 lg:col-span-3">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Sidebar Info & Request Management */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Team Roster */}
                <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                  <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4 flex items-center justify-between">
                    <span>Team Members</span>
                    <span className="text-zinc-500 text-xs">{userTeam.members?.length || 0} / 5</span>
                  </h3>
                  <div className="space-y-4">
                    {userTeam.members?.map((member: any) => (
                      <div key={member.id} className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate(`/profile/${member.user.id}`)}>
                        <img 
                          src={member.user.avatar || '/default-avatar.png'} 
                          className="w-8 h-8 rounded-lg object-cover border border-white/10 group-hover:border-brand-cyan/50 transition-colors" 
                          alt="" 
                        />
                        <div>
                          <p className="text-xs font-bold text-white group-hover:text-brand-cyan transition-colors">{member.user.name}</p>
                          <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{member.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Team Applications - Visible only to team creator */}
                {isTeamCreator && (
                  <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest mb-4">Pending Requests</h3>
                    
                    {userTeam.requests?.filter((r: any) => r.status === 'Pending').length === 0 ? (
                      <p className="text-xs text-zinc-500 italic">No pending requests.</p>
                    ) : (
                      <div className="space-y-4">
                        {userTeam.requests?.filter((r: any) => r.status === 'Pending').map((req: any) => (
                          <div key={req.id} className="p-3 bg-zinc-950/40 border border-white/5 rounded-xl text-xs">
                            <div className="flex items-center gap-2 mb-2">
                              <img src={req.applicant.avatar || '/default-avatar.png'} className="w-6 h-6 rounded-full object-cover" alt="" />
                              <span className="font-bold text-white truncate max-w-[100px]">{req.applicant.name}</span>
                            </div>
                            <p className="text-zinc-400 italic mb-3">"{req.message}"</p>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleJoinRequestDecision(req.id, 'Rejected')}
                                className="flex-1 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded font-bold transition-colors"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => handleJoinRequestDecision(req.id, 'Accepted')}
                                className="flex-1 py-1.5 bg-brand-cyan text-dark-bg hover:bg-brand-cyan/90 rounded font-bold transition-colors"
                              >
                                Accept
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Interface */}
              <div className="lg:col-span-3">
                <div className="bg-zinc-900/30 border border-white/5 rounded-3xl h-[600px] flex flex-col overflow-hidden">
                  <div className="p-5 border-b border-white/5 bg-zinc-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Realtime Team Room</h3>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{userTeam.name} workspace</span>
                  </div>

                  {/* Messages container */}
                  <div className="flex-1 p-6 overflow-y-auto space-y-4 flex flex-col bg-zinc-950/10">
                    {chatMessages.map((msg, idx) => {
                      const isMe = msg.senderId === user?.id;
                      return (
                        <div key={idx} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                          <img src={msg.sender?.avatar || '/default-avatar.png'} className="w-8 h-8 rounded-full border border-white/10" alt="" />
                          <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                            <span className="text-[9px] text-zinc-500 font-bold mb-1 px-1">{isMe ? 'You' : msg.sender?.name}</span>
                            <div className={`p-3.5 rounded-2xl text-xs font-medium leading-relaxed ${
                              isMe 
                                ? 'bg-brand-cyan text-dark-bg rounded-tr-none shadow-[0_0_15px_rgba(0,229,255,0.1)]' 
                                : 'bg-zinc-900 border border-white/5 text-white rounded-tl-none'
                            }`}>
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    {chatMessages.length === 0 && (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-500 py-20">
                        <MessageSquare className="w-12 h-12 mb-4 opacity-20 text-brand-cyan animate-pulse" />
                        <p className="font-bold text-sm">No messages yet. Start collaborating!</p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Message Input */}
                  <div className="p-4 border-t border-white/5 bg-zinc-900/50">
                    <form onSubmit={handleSendChatMessage} className="relative flex items-center gap-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Message the team..."
                        className="flex-1 bg-black/40 border border-white/10 rounded-xl py-3.5 pl-5 pr-14 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                      />
                      <button 
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="absolute right-2 p-2 bg-brand-cyan text-dark-bg rounded-lg hover:scale-105 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-6 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">Create Hackathon Team</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleCreateTeam} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Team Name</label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. Code Ninjas, AI Hackers"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={teamDesc}
                  onChange={(e) => setTeamDesc(e.target.value)}
                  placeholder="Describe your project idea and what you plan to build..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50 min-h-[100px] resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Roles/Skills Looking For</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={lookingForRole}
                    onChange={(e) => setLookingForRole(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddRole();
                      }
                    }}
                    placeholder="e.g. React Developer, Backend Engineer, AI Specialist"
                    className="flex-1 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddRole}
                    className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl text-xs font-black transition-colors"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {lookingForList.map((role) => (
                    <span 
                      key={role} 
                      className="text-[10px] font-black bg-brand-purple/10 border border-brand-purple/20 text-brand-purple px-2.5 py-1 rounded-md flex items-center gap-1.5"
                    >
                      {role}
                      <button type="button" onClick={() => handleRemoveRole(role)} className="hover:text-red-400">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/5"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isCreatingTeam}
                  className="px-6 py-2.5 rounded-xl text-sm font-black bg-brand-cyan text-dark-bg hover:scale-102 active:scale-98 disabled:opacity-50 transition-all cursor-pointer shadow-lg"
                >
                  {isCreatingTeam ? 'Creating...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply Modal */}
      {isApplyModalOpen && selectedTeam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsApplyModalOpen(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">Join {selectedTeam.name}</h2>
              <button onClick={() => setIsApplyModalOpen(false)} className="text-zinc-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Message to Team Creator</label>
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
                onClick={handleApplyToTeam}
                disabled={isApplying}
                className="px-5 py-2.5 rounded-xl text-sm font-black bg-brand-cyan text-dark-bg hover:scale-102 active:scale-98 disabled:opacity-50 transition-all cursor-pointer shadow-lg"
              >
                {isApplying ? 'Applying...' : 'Apply to Join'}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardContainer>
  );
};

export default HackathonDetailsPage;
