import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Users, Plus, X } from 'lucide-react';
import api from '../lib/axios';
import { DashboardContainer } from '../components/DashboardComponents';
import LoadingSkeleton from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';

const HackathonsPage = () => {
  const [hackathons, setHackathons] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState<'All' | 'Online' | 'Local' | 'College'>('All');
  const navigate = useNavigate();

  // Host Hackathon Modal State
  const [isHostModalOpen, setIsHostModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'Online' | 'Local' | 'College'>('Online');
  const [duration, setDuration] = useState('');
  const [location, setLocation] = useState('');
  const [isHosting, setIsHosting] = useState(false);

  const fetchHackathons = async () => {
    try {
      const response = await api.get('/hackathons');
      setHackathons(response.data);
    } catch (error) {
      console.error('Error fetching hackathons:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, []);

  const handleHostHackathon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !duration.trim()) {
      toast.error('Title, description, and duration are required.');
      return;
    }

    setIsHosting(true);
    try {
      await api.post('/hackathons', {
        title,
        description,
        type,
        duration,
        location: type === 'Online' ? 'Virtual' : location
      });
      toast.success('Hackathon hosted successfully!');
      setIsHostModalOpen(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setType('Online');
      setDuration('');
      setLocation('');
      
      // Refresh hackathons list
      await fetchHackathons();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to host hackathon');
    } finally {
      setIsHosting(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingSkeleton type="card" />
      </DashboardContainer>
    );
  }

  const filteredHackathons = filterType === 'All'
    ? hackathons
    : hackathons.filter(h => h.type.toLowerCase() === filterType.toLowerCase());

  return (
    <DashboardContainer>
      {/* Sleek, Compact Header Banner */}
      <div className="bg-gradient-to-r from-brand-purple/20 via-brand-cyan/15 to-transparent border border-white/5 rounded-2xl p-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-brand-cyan/5 rounded-full blur-3xl -z-10" />
        <div className="flex items-center gap-3.5 mb-2.5">
          <div className="p-2 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl text-brand-cyan shadow-[0_0_15px_rgba(0,229,255,0.1)]">
            <Trophy className="w-5 h-5" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-widest text-brand-purple bg-brand-purple/10 px-2 py-0.5 rounded border border-brand-purple/20">
            Developer Arena
          </span>
        </div>
        
        <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mb-1">
          Hackathons
        </h1>
        <p className="text-zinc-400 text-xs max-w-xl font-medium leading-relaxed">
          Build elite teams, match using skills, and win together.
        </p>
      </div>

      {/* Filter Tabs and Host Button */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 border-b border-white/5 pb-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['All', 'Online', 'Local', 'College'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilterType(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                filterType === tab
                  ? 'bg-white/10 text-white shadow-md border border-white/10'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {tab} Events
            </button>
          ))}
        </div>
        
        <button
          onClick={() => setIsHostModalOpen(true)}
          className="px-4 py-2 bg-brand-cyan text-dark-bg rounded-xl text-xs font-black hover:scale-102 active:scale-98 transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4" />
          Host Hackathon
        </button>
      </div>

      {/* Grid of Hackathons */}
      {filteredHackathons.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/10 border border-white/5 rounded-3xl">
          <Trophy className="w-12 h-12 text-zinc-800 mx-auto mb-4 animate-bounce" />
          <h3 className="text-md font-bold text-white mb-1">No Hackathons Found</h3>
          <p className="text-zinc-500 text-xs">Be the first to host an event for co-builders!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHackathons.map((hackathon) => {
            const isOnline = hackathon.type === 'Online';
            const isLocal = hackathon.type === 'Local';
            
            return (
              <div
                key={hackathon.id}
                className="bg-zinc-900/20 hover:bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group h-full hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                      isOnline 
                        ? 'bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan' 
                        : isLocal 
                          ? 'bg-brand-purple/10 border border-brand-purple/20 text-brand-purple'
                          : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                    }`}>
                      {hackathon.type}
                    </span>
                    <span className="text-xs text-zinc-500 font-bold flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {hackathon.duration}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-brand-cyan transition-colors mb-2">
                    {hackathon.title}
                  </h3>
                  <p className="text-zinc-400 text-xs line-clamp-3 leading-relaxed mb-6 font-medium">
                    {hackathon.description}
                  </p>
                </div>

                <div>
                  <div className="flex items-center gap-4 py-4 border-t border-white/5 mb-4">
                    {hackathon.location && (
                      <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-zinc-600" />
                        <span className="truncate max-w-[120px]">{hackathon.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-semibold ml-auto">
                      <Users className="w-3.5 h-3.5 text-zinc-600" />
                      <span>{hackathon.teams?.length || 0} Teams</span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigate(`/hackathons/${hackathon.id}`)}
                    className="w-full py-3 bg-white/5 hover:bg-brand-cyan group-hover:bg-brand-cyan hover:text-dark-bg group-hover:text-dark-bg border border-white/5 rounded-xl text-xs font-black transition-all shadow-md active:scale-98 cursor-pointer"
                  >
                    View Hackathon
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Host Hackathon Modal */}
      {isHostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsHostModalOpen(false)} />
          <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-6 overflow-hidden shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-white">Host a Hackathon</h2>
              <button onClick={() => setIsHostModalOpen(false)} className="text-zinc-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleHostHackathon} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Hackathon Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Generative AI Buildathon"
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Description</label>
                <textarea 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide an overview of the event theme, criteria, and awards..."
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50 min-h-[100px] resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                  >
                    <option value="Online">Online</option>
                    <option value="Local">Local</option>
                    <option value="College">College</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 3 Days, 48 Hours"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                    required
                  />
                </div>
              </div>

              {type !== 'Online' && (
                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Venue / Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Bangalore, India or MIT Campus"
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
                  />
                </div>
              )}

              <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setIsHostModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl text-sm font-bold text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isHosting}
                  className="px-6 py-2.5 rounded-xl text-sm font-black bg-brand-cyan text-dark-bg hover:scale-102 active:scale-98 disabled:opacity-50 transition-all cursor-pointer shadow-lg"
                >
                  {isHosting ? 'Creating...' : 'Host Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default HackathonsPage;
