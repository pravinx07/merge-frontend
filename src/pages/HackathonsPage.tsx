import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Calendar, MapPin, Users, Plus, X, Trash2, Clock } from 'lucide-react';
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
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [isHosting, setIsHosting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Auto-calculate duration label from start/end dates
  const calcDuration = (start: string, end: string) => {
    if (!start || !end) return '';
    const diffMs = new Date(end).getTime() - new Date(start).getTime();
    if (diffMs <= 0) return '';
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    if (diffDays >= 1) return `${diffDays} Day${diffDays > 1 ? 's' : ''}`;
    return `${diffHours} Hour${diffHours > 1 ? 's' : ''}`;
  };

  // Today's date for min attribute
  const todayStr = new Date().toISOString().split('T')[0];

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
    const duration = calcDuration(startDate, endDate);
    if (!title.trim() || !description.trim() || !startDate || !endDate || !duration) {
      toast.error('Please fill all required fields including valid start and end dates.');
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      toast.error('End date must be after start date.');
      return;
    }

    setIsHosting(true);
    try {
      await api.post('/hackathons', {
        title,
        description,
        type,
        duration,
        location: type === 'Online' ? 'Virtual' : location,
        startDate,
        endDate
      });
      toast.success('Hackathon hosted successfully!');
      setIsHostModalOpen(false);
      
      // Reset form
      setTitle('');
      setDescription('');
      setType('Online');
      setStartDate('');
      setEndDate('');
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

  const isExpired = (endDate: string) => !!(endDate && new Date(endDate) < new Date());

  const handleDeleteHackathon = async (hackathonId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmDeleteId(hackathonId);
  };

  const confirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await api.delete(`/hackathons/${confirmDeleteId}`);
      toast.success('Hackathon deleted successfully.');
      setHackathons(prev => prev.filter(h => h.id !== confirmDeleteId));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete hackathon');
    } finally {
      setConfirmDeleteId(null);
    }
  };

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
            const expired = isExpired(hackathon.endDate);
            
            return (
              <div
                key={hackathon.id}
                className={`bg-zinc-900/20 hover:bg-zinc-900/40 border border-white/5 hover:border-white/10 rounded-2xl p-6 transition-all duration-300 flex flex-col justify-between group h-full hover:-translate-y-1 ${expired ? 'opacity-70' : ''}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${
                        isOnline 
                          ? 'bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan' 
                          : isLocal 
                            ? 'bg-brand-purple/10 border border-brand-purple/20 text-brand-purple'
                            : 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                      }`}>
                        {hackathon.type}
                      </span>
                      {expired ? (
                        <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-1">
                          <X className="w-2.5 h-2.5" /> Expired
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> Live
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-zinc-500 font-bold flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {hackathon.duration}
                      </span>
                      <button
                        onClick={(e) => handleDeleteHackathon(hackathon.id, e)}
                        title="Delete hackathon"
                        className="p-1.5 rounded-lg text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
                    disabled={expired}
                    className="w-full py-3 bg-white/5 hover:bg-brand-cyan group-hover:bg-brand-cyan hover:text-dark-bg group-hover:text-dark-bg border border-white/5 rounded-xl text-xs font-black transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:group-hover:bg-white/5 disabled:group-hover:text-white"
                  >
                    {expired ? 'Hackathon Ended' : 'View Hackathon'}
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
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    min={todayStr}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50 [color-scheme:dark]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-zinc-400 uppercase tracking-wider mb-2">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate || todayStr}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan/50 [color-scheme:dark]"
                    required
                  />
                </div>
                <div className="flex flex-col justify-end">
                  {startDate && endDate && calcDuration(startDate, endDate) ? (
                    <div className="flex items-center gap-2 px-4 py-3 bg-brand-cyan/10 border border-brand-cyan/20 rounded-xl">
                      <Clock className="w-4 h-4 text-brand-cyan shrink-0" />
                      <div>
                        <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-bold">Duration</p>
                        <p className="text-sm font-black text-brand-cyan">{calcDuration(startDate, endDate)}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-white/5 rounded-xl">
                      <Clock className="w-4 h-4 text-zinc-600" />
                      <p className="text-xs text-zinc-600 font-bold">Select both dates</p>
                    </div>
                  )}
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

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmDeleteId(null)}
          />
          <div className="relative bg-zinc-950 border border-red-500/20 rounded-2xl w-full max-w-sm p-6 shadow-2xl shadow-red-500/5">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white mb-1">Delete Hackathon?</h3>
                <p className="text-sm text-zinc-400">
                  This will permanently remove this hackathon and all its teams. This action cannot be undone.
                </p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  className="flex-1 py-2.5 rounded-xl text-sm font-bold text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl text-sm font-black text-white bg-red-500 hover:bg-red-600 active:scale-95 transition-all cursor-pointer shadow-lg shadow-red-500/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardContainer>
  );
};

export default HackathonsPage;
