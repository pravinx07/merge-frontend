import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DollarSign, Code2, Clock, Plus, CheckCircle, Search, ShieldCheck, X } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

interface Bounty {
  id: string;
  title: string;
  description: string;
  amount: number;
  status: string;
  skills: string[];
  owner: { id: string; name: string; avatar: string; plan: string };
  assignee?: { id: string; name: string; avatar: string };
  solutionLink?: string;
  createdAt: string;
}

const BountiesPage = () => {
  const { user } = useAuth();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'explore' | 'my_gigs'>('explore');
  const [solutionLink, setSolutionLink] = useState('');
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [skillsStr, setSkillsStr] = useState('');

  useEffect(() => {
    fetchBounties();
  }, []);

  const fetchBounties = async () => {
    try {
      const res = await api.get('/bounties');
      setBounties(res.data);
    } catch (error) {
      toast.error('Failed to load bounties');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBounty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !amount) {
      toast.error('Please fill all required fields');
      return;
    }
    try {
      const res = await api.post('/bounties', {
        title,
        description,
        amount: parseFloat(amount),
        skills: skillsStr.split(',').map(s => s.trim()).filter(Boolean)
      });
      setBounties([res.data, ...bounties]);
      setIsCreating(false);
      setTitle('');
      setDescription('');
      setAmount('');
      setSkillsStr('');
      toast.success('Bounty created successfully!');
    } catch (error) {
      toast.error('Failed to create bounty');
    }
  };

  const handleApply = async (id: string) => {
    try {
      const res = await api.post(`/bounties/${id}/apply`);
      setBounties(bounties.map(b => b.id === id ? res.data : b));
      toast.success('Applied to bounty!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to apply');
    }
  };

  const handleSubmitSolution = async (id: string) => {
    if (!solutionLink.trim()) {
      toast.error('Please provide a solution link');
      return;
    }
    try {
      const res = await api.put(`/bounties/${id}/submit`, { solutionLink });
      setBounties(bounties.map(b => b.id === id ? res.data : b));
      toast.success('Solution submitted! Waiting for owner to review.');
      setCompletingId(null);
      setSolutionLink('');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit solution');
    }
  };

  const handleComplete = async (id: string) => {
    try {
      const res = await api.put(`/bounties/${id}/complete`);
      setBounties(bounties.map(b => b.id === id ? res.data : b));
      toast.success('Bounty marked as completed and paid!');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to complete bounty');
    }
  };

  const filteredBounties = bounties.filter(b => {
    if (activeTab === 'explore') return b.status === 'Open' || b.assignee?.id === user?.id;
    return b.owner.id === user?.id || b.assignee?.id === user?.id;
  });

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0A0A0B] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center border border-emerald-500/20">
                <DollarSign className="w-5 h-5 text-emerald-400" />
              </div>
              Bounty Board
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">Pick up gigs, build things, get paid.</p>
          </div>
          
          <button
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-brand-cyan text-dark-bg px-5 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
          >
            <Plus className="w-4 h-4" /> Post a Gig
          </button>
        </div>

        {/* Create Bounty Modal */}
        <AnimatePresence>
          {isCreating && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl"
              >
                <form onSubmit={handleCreateBounty} className="space-y-4">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black text-white">Post a new Gig</h3>
                    <button type="button" onClick={() => setIsCreating(false)} className="text-zinc-400 hover:text-white p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Title</label>
                      <input value={title} onChange={e => setTitle(e.target.value)} type="text" placeholder="e.g. Build a landing page" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-brand-cyan focus:outline-none text-sm" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-400 uppercase">Amount ($)</label>
                      <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="500" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-brand-cyan focus:outline-none text-sm" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Description</label>
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Describe the task..." className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-brand-cyan focus:outline-none text-sm resize-none"></textarea>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-400 uppercase">Skills Needed (comma separated)</label>
                    <input value={skillsStr} onChange={e => setSkillsStr(e.target.value)} type="text" placeholder="React, Node.js, Tailwind" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:border-brand-cyan focus:outline-none text-sm" />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-emerald-400">
                      <ShieldCheck className="w-4 h-4" /> Secure Escrow
                    </div>
                    <button type="submit" className="bg-white text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-200">
                      Post Bounty
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="flex items-center gap-6 border-b border-white/5">
          <button 
            onClick={() => setActiveTab('explore')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'explore' ? 'border-brand-cyan text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            Explore Gigs
          </button>
          <button 
            onClick={() => setActiveTab('my_gigs')}
            className={`pb-3 text-sm font-bold border-b-2 transition-colors ${activeTab === 'my_gigs' ? 'border-brand-cyan text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}
          >
            My Gigs
          </button>
        </div>

        {/* Bounties List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <div className="col-span-2 text-center text-zinc-500 py-10">Loading...</div>
          ) : filteredBounties.length === 0 ? (
            <div className="col-span-2 text-center text-zinc-500 py-10 bg-zinc-900/50 rounded-2xl border border-zinc-800">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-50" />
              <p>No gigs found.</p>
            </div>
          ) : (
            filteredBounties.map(bounty => (
              <div key={bounty.id} className="bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors rounded-2xl p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <img src={bounty.owner.avatar || `https://ui-avatars.com/api/?name=${bounty.owner.name}`} alt="" className="w-10 h-10 rounded-full border border-zinc-700" />
                    <div>
                      <p className="text-white font-bold text-sm">{bounty.owner.name}</p>
                      <p className="text-xs text-zinc-500">{new Date(bounty.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg font-black text-sm">
                    ${bounty.amount}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{bounty.title}</h3>
                <p className="text-sm text-zinc-400 mb-4 line-clamp-2 flex-1">{bounty.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  {bounty.skills.map((skill, i) => (
                    <span key={i} className="bg-zinc-800 text-zinc-300 text-[10px] font-bold px-2 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800">
                  <div className="flex items-center gap-2">
                    {bounty.status === 'Open' ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-brand-cyan">
                        <Clock className="w-3.5 h-3.5" /> Open
                      </span>
                    ) : bounty.status === 'Completed' ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-500">
                        <CheckCircle className="w-3.5 h-3.5" /> Completed
                      </span>
                    ) : bounty.status === 'In Review' ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-purple-400">
                        <Search className="w-3.5 h-3.5" /> In Review
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-amber-500">
                        <Code2 className="w-3.5 h-3.5" /> In Progress
                      </span>
                    )}
                  </div>

                  <div className="flex gap-2">
                    {bounty.status === 'Open' && bounty.owner.id !== user?.id && (
                      <button onClick={() => handleApply(bounty.id)} className="bg-white text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-200">
                        Take Gig
                      </button>
                    )}
                    {/* Assignee Submits Solution */}
                    {bounty.status === 'In Progress' && bounty.assignee?.id === user?.id && (
                      <div className="flex gap-2">
                        {completingId === bounty.id ? (
                          <>
                            <input 
                              type="url" 
                              placeholder="GitHub PR or Demo link..." 
                              value={solutionLink}
                              onChange={e => setSolutionLink(e.target.value)}
                              className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs text-white outline-none focus:border-brand-cyan"
                            />
                            <button onClick={() => handleSubmitSolution(bounty.id)} className="bg-brand-cyan text-dark-bg px-4 py-1.5 rounded-lg text-xs font-bold hover:brightness-110">
                              Submit
                            </button>
                            <button onClick={() => { setCompletingId(null); setSolutionLink(''); }} className="bg-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-zinc-700">
                              Cancel
                            </button>
                          </>
                        ) : (
                          <button onClick={() => setCompletingId(bounty.id)} className="bg-brand-cyan text-dark-bg px-4 py-1.5 rounded-lg text-xs font-bold hover:brightness-110">
                            Submit Solution
                          </button>
                        )}
                      </div>
                    )}

                    {/* Owner Approves Solution */}
                    {bounty.status === 'In Review' && bounty.owner.id === user?.id && (
                      <div className="flex items-center gap-3">
                        <a href={bounty.solutionLink} target="_blank" rel="noopener noreferrer" className="text-xs text-brand-cyan hover:underline">
                          View Solution
                        </a>
                        <button onClick={() => handleComplete(bounty.id)} className="bg-emerald-500 text-black px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-emerald-400">
                          Approve & Pay
                        </button>
                      </div>
                    )}

                    {bounty.status === 'In Review' && bounty.assignee?.id === user?.id && (
                       <span className="text-xs text-zinc-400 font-medium">Waiting for owner approval...</span>
                    )}
                    {bounty.assignee && (
                      <div className="flex items-center gap-2 ml-2">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Assignee:</span>
                        <img src={bounty.assignee.avatar || `https://ui-avatars.com/api/?name=${bounty.assignee.name}`} title={bounty.assignee.name} alt="" className="w-6 h-6 rounded-full border border-zinc-700" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
};

export default BountiesPage;
