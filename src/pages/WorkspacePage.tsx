import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Target, Users, CheckSquare, Zap, Trophy, X, Plus, ChevronLeft, ChevronRight, Code2, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../lib/axios';
import { useSocket } from '../context/SocketContext';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DashboardContainer } from '../components/DashboardComponents';
import { UpgradeModal } from '../components/Premium/UpgradeModal';

const WorkspacePage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [otherUser, setOtherUser] = useState<any>(null);
  const [goal, setGoal] = useState("");
  const [myRole, setMyRole] = useState("Frontend");
  const [theirRole, setTheirRole] = useState("Backend");
  const [weeklyProgress, setWeeklyProgress] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskText, setNewTaskText] = useState("");
  
  const [tasks, setTasks] = useState<any[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'roadmap' | 'editor'>('roadmap');
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("typescript");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const { socket } = useSocket();

  useEffect(() => {
    if (chatId) {
      const fetchWorkspace = async () => {
        try {
          const [matchesRes, response] = await Promise.all([
            api.get('/matches'),
            api.get(`/workspace/${chatId}`)
          ]);
          
          const currentMatch = matchesRes.data.find((m: any) => m.chatId === chatId);
          if (currentMatch) {
            setOtherUser(currentMatch.user);
          }

          const ws = response.data;
          setGoal(ws.goal || "");
          setMyRole(ws.user1Role || "Frontend");
          setTheirRole(ws.user2Role || "Backend");
          setTasks(ws.tasks || []);
          setUpdates(ws.updates || []);
          setCode(ws.code || "");
          setLanguage(ws.language || "typescript");
        } catch (error) {
          console.error("Error fetching workspace:", error);
        }
      };
      fetchWorkspace();
    }
  }, [chatId]);

  useEffect(() => {
    if (!socket || !chatId) return;

    const handleCodeUpdate = (data: { code: string; language: string }) => {
      setCode(data.code);
      setLanguage(data.language);
    };

    socket.on('workspace_code_updated', handleCodeUpdate);
    return () => { socket.off('workspace_code_updated', handleCodeUpdate); };
  }, [socket, chatId, isOpen]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (chatId) api.put(`/workspace/${chatId}/code`, { code, language }).catch(console.error);
    }, 1500);
    return () => clearTimeout(handler);
  }, [code, language, chatId]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || "";
    setCode(newCode);
    if (socket) {
      socket.emit('workspace_code_update', { roomId: chatId, code: newCode, language });
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskText.trim()) return;
    try {
      const res = await api.post(`/workspace/${chatId}/tasks`, { text: newTaskText });
      setTasks([...tasks, res.data]);
      setNewTaskText("");
      setIsAddingTask(false);
    } catch (error) {
      toast.error("Failed to add task");
    }
  };

  const moveTask = async (taskId: number | string, direction: 'left' | 'right') => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    let newStatus = task.status;
    if (direction === 'right') {
      if (task.status === 'todo') newStatus = 'doing';
      else if (task.status === 'doing') newStatus = 'done';
    } else {
      if (task.status === 'done') newStatus = 'doing';
      else if (task.status === 'doing') newStatus = 'todo';
    }

    // Optimistic update
    setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    try {
      await api.put(`/workspace/tasks/${taskId}/status`, { status: newStatus });
    } catch (error) {
      toast.error("Failed to update task");
      // Revert optimistic update
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: task.status } : t));
    }
  };

  const handleUpdateGoal = async (newGoal: string) => {
    setGoal(newGoal);
    try {
      await api.put(`/workspace/${chatId}/goal`, { goal: newGoal });
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateRole = async (roleType: 'my' | 'their', newRole: string) => {
    if (roleType === 'my') setMyRole(newRole);
    else setTheirRole(newRole);
    
    try {
      await api.put(`/workspace/${chatId}/roles`, { 
        user1Role: roleType === 'my' ? newRole : myRole,
        user2Role: roleType === 'their' ? newRole : theirRole
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostUpdate = async () => {
    if (!weeklyProgress.trim()) return;
    try {
      const res = await api.post(`/workspace/${chatId}/updates`, { content: weeklyProgress });
      setUpdates([res.data, ...updates]);
      setWeeklyProgress("");
      toast.success("Weekly update posted!");
    } catch (error) {
      toast.error("Failed to post update");
    }
  };

  const handleAskAI = async () => {
    if (!aiPrompt.trim()) return;
    setIsAskingAI(true);
    setAiResponse("");
    try {
      const res = await api.post(`/workspace/${chatId}/ai`, {
        prompt: aiPrompt,
        codeContext: code,
        language
      });
      setAiResponse(res.data.text);
      setAiPrompt("");
      // Post update to project history as well
      const updateRes = await api.post(`/workspace/${chatId}/updates`, { 
        content: `MergeAI Action: ${aiPrompt}` 
      });
      setUpdates([updateRes.data, ...updates]);
      toast.success("MergeAI generated a response!");
    } catch (error: any) {
      if (error.response?.status === 403) {
        setIsUpgradeModalOpen(true);
      } else {
        toast.error("Failed to get AI response");
      }
    } finally {
      setIsAskingAI(false);
    }
  };

  if (!chatId) return null;

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'todo': return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      case 'doing': return 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30';
      case 'done': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return '';
    }
  };

  return (
    <DashboardContainer>
      <div className="space-y-6">
          {/* Header */}
          <div className="sticky top-0 z-10 bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800 px-4 sm:px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-linear-to-br from-brand-cyan to-brand-purple flex items-center justify-center text-white shadow-lg shadow-brand-purple/20 shrink-0">
                <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <h2 className="text-base sm:text-xl font-black text-white">Build Together Workspace</h2>
                <p className="text-[10px] sm:text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                  Collaborating with {otherUser?.name}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Chemistry Score */}
              <div className="hidden sm:flex items-center gap-3 bg-zinc-800/50 px-4 py-2 rounded-xl border border-zinc-700/50">
                <div className="relative w-8 h-8 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" className="text-zinc-700" />
                    <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="3" fill="transparent" strokeDasharray="87.9" strokeDashoffset="8.79" className="text-brand-cyan" />
                  </svg>
                  <span className="absolute text-[9px] font-black text-white">91%</span>
                </div>
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1">Team Compatibility <Zap className="w-3 h-3 text-brand-cyan" fill="currentColor"/></div>
                  <div className="text-[9px] text-zinc-400 uppercase">High Synergy</div>
                </div>
              </div>
              
              <button onClick={() => navigate(`/chat/${chatId}`)} className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-zinc-400 hover:text-white transition-colors flex items-center gap-2 text-sm font-bold">
                <ChevronLeft className="w-4 h-4" /> Back to Chat
              </button>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Goal & Roles */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Shared Goal */}
              <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-4 h-4 text-brand-purple" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shared Goal</h3>
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-zinc-500 font-medium">Let's build:</label>
                  <input 
                    type="text" 
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    onBlur={(e) => handleUpdateGoal(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white font-bold focus:outline-none focus:border-brand-cyan transition-colors"
                    placeholder="E.g. AI Resume Builder"
                  />
                </div>
              </div>

              {/* Roles */}
              <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-4 h-4 text-brand-cyan" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Project Roles</h3>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1 block">Your Role ({currentUser?.name})</label>
                    <select 
                      value={myRole}
                      onChange={(e) => handleUpdateRole('my', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan appearance-none"
                    >
                      <option>Frontend</option>
                      <option>Backend</option>
                      <option>AI</option>
                      <option>Design</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-zinc-500 font-medium mb-1 block">Their Role ({otherUser?.name})</label>
                    <select 
                      value={theirRole}
                      onChange={(e) => handleUpdateRole('their', e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-brand-cyan appearance-none"
                    >
                      <option>Frontend</option>
                      <option>Backend</option>
                      <option>AI</option>
                      <option>Design</option>
                      <option>Marketing</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Ship Together Badge */}
              {(() => {
                const doneTasks = tasks.filter(t => t.status === 'done').length;
                const totalTasks = tasks.length;
                const allDone = totalTasks > 0 && doneTasks === totalTasks;
                return (
                  <div className={`border rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-colors ${allDone ? 'bg-brand-cyan/10 border-brand-cyan/30' : 'bg-zinc-800/30 border-zinc-800'}`}>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-3 transition-colors ${allDone ? 'bg-brand-cyan/20 border-2 border-brand-cyan/60' : 'bg-zinc-800 border-2 border-dashed border-zinc-700'}`}>
                      <Trophy className={`w-6 h-6 transition-colors ${allDone ? 'text-brand-cyan' : 'text-zinc-600'}`} />
                    </div>
                    <h4 className={`text-sm font-bold transition-colors ${allDone ? 'text-brand-cyan' : 'text-zinc-400'}`}>Ship Together 🚀</h4>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {allDone
                        ? '🎉 Badge unlocked! Project shipped!'
                        : totalTasks === 0
                          ? 'Add tasks to start tracking progress'
                          : `${doneTasks}/${totalTasks} tasks done — keep going!`
                      }
                    </p>
                    {totalTasks > 0 && !allDone && (
                      <div className="w-full mt-3 bg-zinc-700 rounded-full h-1.5">
                        <div
                          className="bg-brand-cyan h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${(doneTasks / totalTasks) * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                );
              })()}

            </div>

            {/* Right Column: Content Area (Tabs) */}
            <div className="lg:col-span-2 space-y-6 flex flex-col">
              
              {/* Tabs */}
              <div className="flex items-center gap-4 border-b border-zinc-800 pb-2">
                <button 
                  onClick={() => setActiveTab('roadmap')}
                  className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'roadmap' ? 'border-brand-cyan text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                  <CheckSquare className="w-4 h-4" /> Roadmap & Tasks
                </button>
                <button 
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-2 text-sm font-bold pb-2 border-b-2 transition-all ${activeTab === 'editor' ? 'border-brand-cyan text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
                >
                  <Code2 className="w-4 h-4" /> Code Scratchpad
                </button>
              </div>

              {activeTab === 'roadmap' ? (
                /* Shared Roadmap */
                <div className="bg-zinc-800/30 border border-zinc-800 rounded-2xl p-5 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2">
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider">Shared Roadmap</h3>
                    </div>
                    {!isAddingTask && (
                      <button onClick={() => setIsAddingTask(true)} className="text-[10px] font-bold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                        <Plus className="w-3 h-3" /> Add Task
                      </button>
                    )}
                  </div>

                  {isAddingTask && (
                    <form onSubmit={handleAddTask} className="mb-4 flex gap-2">
                      <input 
                        autoFocus
                        type="text"
                        value={newTaskText}
                        onChange={(e) => setNewTaskText(e.target.value)}
                        placeholder="What needs to be done?"
                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan"
                      />
                      <button type="submit" disabled={!newTaskText.trim()} className="px-3 py-2 bg-brand-cyan text-dark-bg text-xs font-bold rounded-lg disabled:opacity-50">Add</button>
                      <button type="button" onClick={() => {setIsAddingTask(false); setNewTaskText("")}} className="px-3 py-2 bg-zinc-800 text-zinc-300 text-xs font-bold rounded-lg hover:bg-zinc-700">Cancel</button>
                    </form>
                  )}
                  
                  <div className="flex gap-4 overflow-x-auto pb-4 flex-1 min-h-[250px]">
                    {/* Kanban Columns */}
                    {['todo', 'doing', 'done'].map((columnStatus) => (
                      <div key={columnStatus} className="flex-1 min-w-[200px] bg-zinc-900/50 rounded-xl p-3 border border-zinc-800 flex flex-col">
                        <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                          {columnStatus}
                          <span className="bg-zinc-800 px-2 py-0.5 rounded-full text-[9px]">{tasks.filter(t => t.status === columnStatus).length}</span>
                        </div>
                        
                        <div className="space-y-2 flex-1">
                          {tasks.filter(t => t.status === columnStatus).map(task => (
                            <div key={task.id} className="bg-zinc-800 p-3 rounded-lg border border-zinc-700 shadow-sm hover:border-zinc-500 transition-colors">
                              <p className="text-xs font-medium text-white mb-2">{task.text}</p>
                              <div className="flex justify-between items-center">
                                <div className="w-5 h-5 rounded-full bg-zinc-700 flex items-center justify-center text-[8px] font-bold shrink-0">
                                  {task.id % 2 === 0 ? currentUser?.name?.[0] : otherUser?.name?.[0]}
                                </div>
                                <div className="flex items-center gap-1">
                                  {columnStatus !== 'todo' && (
                                    <button onClick={() => moveTask(task.id, 'left')} className="p-1 hover:bg-zinc-700 rounded text-zinc-400">
                                      <ChevronLeft className="w-3 h-3" />
                                    </button>
                                  )}
                                  <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded-md border ${getStatusColor(task.status)}`}>
                                    {task.status}
                                  </span>
                                  {columnStatus !== 'done' && (
                                    <button onClick={() => moveTask(task.id, 'right')} className="p-1 hover:bg-zinc-700 rounded text-zinc-400">
                                      <ChevronRight className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Updates Timeline */}
                  {updates.length > 0 && (
                    <div className="mt-4 space-y-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar border-t border-zinc-800 pt-4">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-3">Project History</h4>
                      {updates.map(update => (
                        <div key={update.id} className="bg-zinc-800/40 rounded-xl p-3 border border-zinc-700/50">
                          <div className="flex items-center gap-2 mb-2">
                            <img src={update.author?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(update.author?.name || 'User')}&background=random`} className="w-5 h-5 rounded-full object-cover" alt="Avatar"/>
                            <span className="text-[10px] font-bold text-zinc-300">{update.author?.name}</span>
                            <span className="text-[9px] text-zinc-500">{new Date(update.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-zinc-300">{update.content}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Weekly Progress Prompt */}
                  <div className="mt-4 bg-brand-cyan/5 border border-brand-cyan/20 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-brand-cyan uppercase tracking-wider mb-2">Weekly Check-in</h4>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input 
                        type="text" 
                        value={weeklyProgress}
                        onChange={(e) => setWeeklyProgress(e.target.value)}
                        placeholder="What did you build this week?"
                        className="flex-1 min-w-0 bg-zinc-900/80 border border-zinc-700 rounded-lg px-4 py-3 sm:py-2 text-sm text-white focus:outline-none focus:border-brand-cyan transition-colors"
                      />
                      <button onClick={handlePostUpdate} className="w-full sm:w-auto px-4 sm:px-6 py-3 sm:py-2 bg-brand-cyan text-dark-bg font-bold text-xs rounded-lg hover:bg-brand-cyan/90 transition-colors shrink-0">
                        Post Update
                      </button>
                    </div>
                  </div>

                </div>
              ) : (
                /* Code Editor Tab */
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl flex flex-col flex-1 h-[600px] overflow-hidden">
                  <div className="flex items-center justify-between p-3 border-b border-zinc-800 bg-zinc-950">
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Code2 className="w-4 h-4 text-[#00e5ff]" />
                      <span className="text-[11px] font-bold uppercase tracking-widest text-zinc-300">Live Code Sync</span>
                    </div>
                    <select 
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value);
                        if (socket) socket.emit('workspace_code_update', { roomId: chatId, code, language: e.target.value });
                      }}
                      className="bg-zinc-800 border border-zinc-700 text-white text-xs px-3 py-1.5 rounded-lg outline-none cursor-pointer hover:border-zinc-600"
                    >
                      <option value="typescript">TypeScript</option>
                      <option value="javascript">JavaScript</option>
                      <option value="python">Python</option>
                      <option value="html">HTML</option>
                      <option value="css">CSS</option>
                      <option value="json">JSON</option>
                    </select>
                  </div>
                  <div className="flex-1 w-full bg-[#1e1e1e]">
                    <Editor
                      height="100%"
                      language={language}
                      theme="vs-dark"
                      value={code}
                      onChange={handleEditorChange}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 13,
                        wordWrap: 'on',
                        padding: { top: 16 },
                        scrollBeyondLastLine: false,
                        smoothScrolling: true,
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on'
                      }}
                    />
                  </div>

                  {/* MergeAI Input */}
                  <div className="p-3 border-t border-zinc-800 bg-zinc-950 flex flex-col gap-2">
                     <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-brand-purple" />
                        <span className="text-[11px] font-bold uppercase tracking-widest text-brand-purple">Ask MergeAI</span>
                     </div>
                     <div className="flex gap-2">
                        <input
                           type="text"
                           value={aiPrompt}
                           onChange={e => setAiPrompt(e.target.value)}
                           onKeyDown={e => e.key === 'Enter' && handleAskAI()}
                           placeholder="Ask AI to review, debug, or write code..."
                           className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-purple transition-colors"
                           disabled={isAskingAI}
                        />
                        <button onClick={handleAskAI} disabled={isAskingAI || !aiPrompt.trim()} className="bg-brand-purple text-white px-4 py-2 rounded-lg text-xs font-bold disabled:opacity-50 flex items-center gap-2 hover:bg-brand-purple/90 transition-colors">
                           {isAskingAI ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Ask'}
                        </button>
                     </div>
                     {aiResponse && (
                       <div className="mt-2 p-3 bg-brand-purple/10 border border-brand-purple/20 rounded-lg max-h-[300px] overflow-y-auto text-[13px] text-zinc-300 relative group prose prose-invert prose-p:my-1 prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-zinc-700 prose-pre:p-2 prose-pre:rounded-md max-w-none custom-scrollbar">
                          <button onClick={() => setAiResponse('')} className="absolute top-2 right-2 p-1.5 bg-zinc-800/80 hover:bg-zinc-700 rounded-md text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                          <ReactMarkdown remarkPlugins={[remarkGfm]}>{aiResponse}</ReactMarkdown>
                       </div>
                     )}
                  </div>

                </div>
              )}

            </div>
      </div>
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </DashboardContainer>
  );
};

export default WorkspacePage;
