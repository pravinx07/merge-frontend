import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  MapPin, 
  Heart, 
  Settings, MessageSquare,
  Layers, Clock, Trophy,
  CheckCircle2, MoreVertical, Ban, AlertTriangle, Eye, X, Lock, Star
} from 'lucide-react';
import { UpgradeModal } from '../components/Premium';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { DashboardContainer, SectionTitle } from '../components/DashboardComponents';

const GitHubIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TechIcon = ({ name, color }: { name: string, color: string }) => {
  const iconMap: Record<string, string> = {
    'React': 'react', 'Next.js': 'nextjs', 'TypeScript': 'typescript', 'Tailwind': 'tailwindcss',
    'Redux': 'redux', 'Node.js': 'nodejs', 'Express': 'express', 'Python': 'python',
    'GraphQL': 'graphql', 'Socket.io': 'socketio', 'PostgreSQL': 'postgresql', 'MongoDB': 'mongodb',
    'AWS': 'amazonwebservices', 'Docker': 'docker', 'Redis': 'redis'
  };
  const slug = iconMap[name] || name.toLowerCase();
  const iconUrl = `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${slug}/${slug}-original.svg`;
  return (
    <div className={`w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center group hover:bg-zinc-800 transition-all cursor-pointer relative`}>
      <img src={iconUrl} alt={name} className="w-5 h-5 object-contain filter grayscale group-hover:grayscale-0 transition-all" />
      <div className={`absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full ${color}`}></div>
    </div>
  );
};

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const isOwner = currentUser?.id === id;
  
  // Moderation state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Spam');
  const [reportDetails, setReportDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  // Boost State
  const [isBoostModalOpen, setIsBoostModalOpen] = useState(false);
  const [boostStatus, setBoostStatus] = useState<{ isBoosted: boolean; boostExpiresAt: string | null; boostCount: number } | null>(null);
  const [boostTimer, setBoostTimer] = useState<string | null>(null);

  // Insights State
  const [insights, setInsights] = useState<any>(null);
  const [isInsightsLoading, setIsInsightsLoading] = useState(false);
  const [showInsights, setShowInsights] = useState(false);

  const fetchInsights = async () => {
    setIsInsightsLoading(true);
    try {
      const res = await api.get(`/profile/insights/${id}`);
      setInsights(res.data.data);
      setShowInsights(true);
    } catch (e: any) {
      if (e.response?.status === 403) {
        setInsights(null);
        setShowInsights(true);
      } else {
        toast.error('Failed to load insights');
      }
    } finally {
      setIsInsightsLoading(false);
    }
  };

  const fetchBoostStatus = async () => {
    try {
      const res = await api.get('/boost/status');
      setBoostStatus(res.data);
    } catch (err) {
      console.error('Fetch boost status error:', err);
    }
  };

  useEffect(() => {
    if (isOwner) fetchBoostStatus();
  }, [isOwner]);

  useEffect(() => {
    if (!boostStatus?.isBoosted || !boostStatus?.boostExpiresAt) {
      setBoostTimer(null);
      return;
    }
    const interval = setInterval(() => {
      const remaining = new Date(boostStatus.boostExpiresAt!).getTime() - Date.now();
      if (remaining <= 0) {
        setBoostTimer(null);
        setBoostStatus(prev => prev ? { ...prev, isBoosted: false } : null);
        clearInterval(interval);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setBoostTimer(`${mins}m ${secs}s`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [boostStatus]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) return <DashboardContainer><LoadingSkeleton type="profile" /></DashboardContainer>;
  if (!profile) return (
    <DashboardContainer className="flex flex-col items-center justify-center py-20">
        <h1 className="text-2xl font-bold mb-4">404 - Profile Not Found</h1>
        <Link to="/" className="px-6 py-2 bg-brand-cyan text-dark-bg rounded-xl font-bold text-sm">Go Home</Link>
    </DashboardContainer>
  );

  const getNextLevelInfo = (score: number) => {
    if (score < 100) return { nextLevel: 'Intermediate Builder', nextScore: 100, progress: (score / 100) * 100 };
    if (score < 500) return { nextLevel: 'Advanced Builder', nextScore: 500, progress: ((score - 100) / 400) * 100 };
    if (score < 1000) return { nextLevel: 'Master Builder', nextScore: 1000, progress: ((score - 500) / 500) * 100 };
    return { nextLevel: 'Max Level', nextScore: score, progress: 100 };
  };

  const levelInfo = getNextLevelInfo(profile.builderScore || 0);

  const handleBlock = async () => {
    try {
      await api.post('/users/block', { userId: profile.id });
      toast.success('User blocked successfully.');
      setIsBlockModalOpen(false);
      navigate('/discover');
    } catch (err) {
      console.error(err);
      toast.error('Failed to block user.');
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users/report', { 
        userId: profile.id, 
        reason: reportReason, 
        details: reportDetails 
      });
      toast.success('Report submitted successfully.');
      setIsReportModalOpen(false);
      setReportDetails('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit report.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardContainer>
      {/* Hero Header Section */}
      <div className="relative rounded-[32px] overflow-hidden border border-zinc-800 bg-zinc-900/20 mb-8">
        <div className="absolute inset-0 h-48 overflow-hidden opacity-20">
          <img src="https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2050&auto=format&fit=crop" className="w-full h-full object-cover" alt="Banner" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-zinc-900"></div>
        </div>

        <div className="relative p-6 pt-32 md:p-8 md:pt-20">
          {isOwner ? (
            <div className="absolute top-4 right-4 md:top-6 md:right-8 flex flex-col sm:flex-row items-end sm:items-center gap-2 md:gap-3 z-10">
              <button 
                onClick={() => setIsBoostModalOpen(true)} 
                className="px-3 py-1.5 md:px-4 md:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-[10px] md:text-xs hover:opacity-90 transition-all flex items-center gap-1.5 md:gap-2 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                ⚡ {boostTimer ? `Active: ${boostTimer}` : <><span className="hidden sm:inline">Boost Profile</span><span className="sm:hidden">Boost</span></>}
              </button>
              <Link to="/settings" className="px-3 py-1.5 md:px-4 md:py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-bold text-[10px] md:text-xs hover:bg-white/10 transition-all flex items-center gap-1.5 md:gap-2">
                <Settings className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Edit Profile</span><span className="sm:hidden">Edit</span>
              </Link>
            </div>
          ) : (
            <div className="absolute top-6 right-8">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-all text-zinc-400 hover:text-white"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1 z-50 overflow-hidden">
                  <button 
                    onClick={() => { setIsMenuOpen(false); setIsReportModalOpen(true); }}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-zinc-300 hover:bg-white/5 flex items-center gap-2"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Report User
                  </button>
                  <button 
                    onClick={() => { setIsMenuOpen(false); setIsBlockModalOpen(true); }}
                    className="w-full text-left px-4 py-3 text-xs font-bold text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <Ban className="w-3.5 h-3.5" /> Block User
                  </button>
                </div>
                </>
              )}
            </div>
          )}

          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 text-center lg:text-left">
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl border-4 border-zinc-900 bg-zinc-800 overflow-hidden p-1 shadow-2xl">
                <img src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} className="w-full h-full object-cover rounded-2xl" alt="Profile" />
              </div>
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-zinc-900"></div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <h1 className="text-3xl font-bold tracking-tight">{profile.name}</h1>
                <CheckCircle2 className="w-5 h-5 text-brand-cyan" />
                {profile.githubVerified && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-500/20">✓ GitHub Verified</span>}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2">
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-bold flex items-center gap-1">
                  Builder Score: {profile.builderScore || 0}
                </div>
                <div className="px-3 py-1 bg-brand-purple/10 border border-brand-purple/20 text-brand-purple rounded-lg text-xs font-bold">
                  {profile.builderLevel || 'Beginner Builder'}
                </div>
              </div>

              <div className="mt-4 w-full max-w-xs mx-auto lg:mx-0">
                <div className="flex justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">
                  <span>Next: {levelInfo.nextLevel}</span>
                  <span>{profile.builderScore || 0} / {levelInfo.nextScore}</span>
                </div>
                <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${levelInfo.progress}%` }}
                  ></div>
                </div>
              </div>

              <h2 className="text-sm font-medium text-zinc-400 mt-4">{profile.bio?.slice(0, 50) || "Full Stack & AI Engineer"}...</h2>

              {profile.badges && profile.badges.length > 0 && (
                <div className="flex flex-wrap justify-center lg:justify-start gap-2 mt-3">
                  {profile.badges.map((badge: string) => (
                    <span key={badge} className="px-3 py-1 bg-zinc-800/80 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-300 shadow-sm hover:scale-105 transition-transform cursor-pointer">
                      {badge}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-4">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand-cyan" /> {profile.location || 'Remote'}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-purple" /> Active Now</div>
                {isOwner && (
                  <div className="flex items-center gap-1.5 text-amber-500/80" title={`${profile.profileViews || 0} people viewed your profile`}><Eye className="w-3.5 h-3.5" /> {profile.profileViews || 0} Visits</div>
                )}
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-6">
                {!isOwner && (
                  <>
                    <button className="px-6 py-2.5 bg-brand-purple text-dark-bg font-bold rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all text-xs"><Heart className="w-4 h-4" /> Match</button>
                    <button className="px-6 py-2.5 bg-white/5 border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-xs text-white"><MessageSquare className="w-4 h-4" /> Message</button>
                  </>
                )}
                {(profile.githubUrl || profile.githubVerified) && (
                  <a 
                    href={profile.githubUrl || `https://github.com/${profile.githubData?.username}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 font-bold rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2 text-xs text-zinc-300"
                  >
                    <GitHubIcon className="w-4 h-4" /> GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Compatibility', value: isOwner ? 'N/A' : `${profile.compatibilityScore || 0}%`, icon: Heart, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
          { label: 'Repositories', value: profile.githubVerified && profile.githubData?.publicRepos ? profile.githubData.publicRepos : '0', icon: GitHubIcon, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
          { label: 'Contributions', value: profile.githubVerified && profile.githubData?.contributionsLastYear ? profile.githubData.contributionsLastYear : '0', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Projects', value: profile.projects?.length || '0', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-5 flex items-center gap-4 group">
            <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color}`}><stat.icon className="w-5 h-5" /></div>
            <div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-[10px] uppercase font-black tracking-widest text-zinc-600">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">

          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-8 space-y-4">
            <SectionTitle>About Me</SectionTitle>
            <p className="text-sm text-zinc-400 leading-relaxed font-medium">
              {profile.bio || "Full-stack developer passionate about building AI-driven applications and scalable systems. Love to collaborate on open-source projects and startup ideas."}
            </p>
          </section>

          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-6">
              <SectionTitle className="mb-0">Featured Projects</SectionTitle>
              {profile.projects && profile.projects.length > 4 && (
                <button className="text-[10px] font-black text-zinc-600 uppercase hover:text-brand-cyan">View all</button>
              )}
            </div>
            {profile.projects && profile.projects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.projects.slice(0, 4).map((proj: any) => (
                  <div key={proj.id || proj.title} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group hover:border-zinc-700 transition-all flex flex-col">
                    <div className="h-32 rounded-xl overflow-hidden mb-4 border border-zinc-800 relative bg-zinc-900">
                      {proj.imageUrl ? (
                        <img src={proj.imageUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={proj.title} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-700">
                           <Layers className="w-10 h-10 opacity-20" />
                        </div>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{proj.title}</h3>
                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-4 flex-1">{proj.description}</p>
                    <div className="flex gap-2 mb-3 flex-wrap">
                      {proj.techStack?.slice(0, 3).map((t: string) => <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-800 text-[9px] font-bold text-zinc-400">{t}</span>)}
                    </div>
                    <div className="flex gap-2 mt-auto">
                      {proj.githubUrl && <a href={proj.githubUrl} target="_blank" rel="noreferrer" className="text-[10px] bg-white/5 border border-white/10 px-2 py-1 rounded text-zinc-300 hover:text-white transition">GitHub</a>}
                      {proj.liveUrl && <a href={proj.liveUrl} target="_blank" rel="noreferrer" className="text-[10px] bg-brand-cyan/10 border border-brand-cyan/20 px-2 py-1 rounded text-brand-cyan hover:bg-brand-cyan/20 transition">Live</a>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-zinc-500 text-sm">No projects added yet.</div>
            )}
          </section>

          {profile.githubVerified && profile.githubData?.topRepos && (
            <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-8">
              <div className="flex items-center justify-between mb-6">
                <SectionTitle className="mb-0 flex items-center gap-2"><GitHubIcon className="w-4 h-4" /> Top Repositories</SectionTitle>
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="text-[10px] font-black text-zinc-600 uppercase hover:text-brand-cyan">View GitHub</a>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {profile.githubData.topRepos.slice(0, 3).map((repo: any) => (
                  <div key={repo.id} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group hover:border-zinc-700 transition-all">
                    <a href={repo.url} target="_blank" rel="noreferrer" className="block">
                      <h3 className="text-sm font-bold text-white mb-1 group-hover:text-brand-cyan transition-colors">{repo.name}</h3>
                      <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-4">{repo.description || 'No description provided.'}</p>
                      <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400">
                        {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-brand-cyan"></span>{repo.language}</span>}
                        <span className="flex items-center gap-1">★ {repo.stars}</span>
                        <span className="flex items-center gap-1">⑂ {repo.forks}</span>
                      </div>
                    </a>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className="space-y-8">
          {/* Cofounder Insights Section */}
          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-amber-500 to-orange-500 text-transparent bg-clip-text">⭐ PRO</span>
            </div>
            <SectionTitle className="mb-6">💼 Cofounder Insights</SectionTitle>
            
            {!showInsights ? (
              <button 
                onClick={fetchInsights}
                disabled={isInsightsLoading}
                className="w-full py-4 rounded-xl border border-zinc-800 bg-zinc-900/50 text-sm font-bold text-zinc-300 hover:bg-zinc-800 transition-all flex items-center justify-center gap-2"
              >
                {isInsightsLoading ? 'Loading...' : 'View Collaboration Insights'}
              </button>
            ) : insights ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400">Reliability Score</span>
                  <span className="text-sm font-black text-[#00e5ff]">{insights.reliabilityScore}%</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400">Response Time</span>
                  <span className="text-sm font-black text-white">~{insights.responseTime}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400">Project Completion</span>
                  <span className="text-sm font-black text-emerald-400">{insights.projectCompletionRate}</span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400">Builder Rating</span>
                  <span className="text-sm font-black text-amber-500 flex items-center gap-1">{insights.builderRating} <Star className="w-3.5 h-3.5 fill-amber-500" /></span>
                </div>
                <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900 border border-zinc-800">
                  <span className="text-xs font-bold text-zinc-400">GitHub Consistency</span>
                  <span className="text-sm font-black text-violet-400">{insights.githubConsistency}</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900 p-6 overflow-hidden">
                <div className="space-y-4 blur-sm opacity-50 pointer-events-none select-none">
                  <div className="h-10 bg-zinc-800 rounded-xl w-full"></div>
                  <div className="h-10 bg-zinc-800 rounded-xl w-full"></div>
                  <div className="h-10 bg-zinc-800 rounded-xl w-full"></div>
                  <div className="h-10 bg-zinc-800 rounded-xl w-full"></div>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px]">
                  <Lock className="w-8 h-8 text-amber-500 mb-3" />
                  <p className="text-sm font-bold text-white mb-4">Unlock Cofounder Insights</p>
                  <button 
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="px-6 py-2.5 bg-white text-black font-black text-xs rounded-xl hover:opacity-90 transition-all shadow-lg"
                  >
                    Upgrade to Pro
                  </button>
                </div>
              </div>
            )}
          </section>

          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-8">
            <SectionTitle>Tech Stack</SectionTitle>
            <div className="mt-6 flex flex-wrap gap-4">
              {profile.skills && profile.skills.length > 0 ? (
                profile.skills.map((skill: string, idx: number) => {
                  const isVerified = profile.verifiedSkills?.includes(skill);
                  return (
                    <div key={skill} className="flex flex-col items-center gap-2 group relative">
                      <TechIcon name={skill} color={idx % 2 === 0 ? "bg-brand-cyan" : "bg-brand-purple"} />
                      {isVerified && (
                        <div className="absolute -top-2 -right-2 bg-amber-500 text-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-zinc-900 shadow-sm" title="Verified Skill">
                          <CheckCircle2 className="w-2.5 h-2.5" />
                        </div>
                      )}
                      <span className={`text-[10px] font-bold transition-colors ${isVerified ? 'text-amber-400 group-hover:text-amber-300' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                        {skill}
                      </span>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-zinc-500">No skills added yet.</div>
              )}
            </div>
          </section>

          {profile.githubVerified && profile.githubData?.topLanguages && (
            <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-8">
              <SectionTitle>Top Languages</SectionTitle>
              <div className="flex flex-wrap gap-2 mt-4">
                {profile.githubData.topLanguages.map((lang: any) => (
                  <span key={lang.name} className="px-3 py-1.5 bg-zinc-800/80 border border-zinc-700 rounded-lg text-xs font-bold text-zinc-300">
                    {lang.name} <span className="text-zinc-500 ml-1">({lang.count})</span>
                  </span>
                ))}
              </div>
            </section>
          )}

          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-8">
            <SectionTitle>{profile.githubVerified ? 'GitHub Activity' : 'Activity'}</SectionTitle>
            <div className="flex items-center gap-4 mt-6">
                <div className="text-2xl font-bold text-white">{profile.githubVerified && profile.githubData?.contributionsLastYear ? profile.githubData.contributionsLastYear : '240'}</div>
                <div className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Contributions</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
                {[...Array(60)].map((_, i) => (
                    <div key={i} className={`w-3 h-3 rounded-[2px] ${Math.random() > 0.6 ? 'bg-emerald-500/80' : Math.random() > 0.8 ? 'bg-emerald-400' : 'bg-zinc-800/80'}`} />
                ))}
            </div>
          </section>
        </div>
      </div>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] w-full max-w-md p-8 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" /> Report User
            </h3>
            <p className="text-xs text-zinc-400 mb-6">Your report is anonymous. We take all reports seriously to keep our community safe.</p>
            
            <form onSubmit={handleReport} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Reason</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan"
                >
                  <option className="bg-zinc-900 text-white" value="Spam">Spam</option>
                  <option className="bg-zinc-900 text-white" value="Fake Profile">Fake Profile</option>
                  <option className="bg-zinc-900 text-white" value="Inappropriate Behavior">Inappropriate Behavior</option>
                  <option className="bg-zinc-900 text-white" value="Harassment">Harassment</option>
                  <option className="bg-zinc-900 text-white" value="Scam">Scam</option>
                  <option className="bg-zinc-900 text-white" value="Other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-zinc-400 mb-2 uppercase tracking-wider">Additional Details (Optional)</label>
                <textarea 
                  value={reportDetails}
                  onChange={(e) => setReportDetails(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-cyan min-h-[100px]"
                  placeholder="Please provide any extra context..."
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <button 
                  type="button" 
                  onClick={() => setIsReportModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-amber-500 hover:bg-amber-600 text-dark-bg transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {isBlockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] w-full max-w-sm p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Ban className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Block User?</h3>
            <p className="text-xs text-zinc-400 mb-8 leading-relaxed">
              Are you sure you want to block <span className="text-white font-bold">{profile.name}</span>? They will be permanently removed from your feed and matches.
            </p>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsBlockModalOpen(false)}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-all"
              >
                Cancel
              </button>
              <button 
                onClick={handleBlock}
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-red-500 hover:bg-red-600 text-white transition-all"
              >
                Block User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Boost Modal */}
      {isBoostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] w-full max-w-sm p-8 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-violet-600/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#00e5ff]/20 rounded-full blur-3xl"></div>
            
            <button onClick={() => setIsBoostModalOpen(false)} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white rounded-full hover:bg-white/5 transition-colors z-10">
              <X className="w-5 h-5" />
            </button>

            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-[#00e5ff]/20 border border-white/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-3xl">🚀</span>
              </div>
              
              <h3 className="text-2xl font-black text-white mb-2">Boost Profile</h3>
              <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                Get discovered faster. Your profile will be prioritized in the swipe feed and search results.
              </p>

              <div className="bg-zinc-950 rounded-2xl p-4 mb-6 border border-zinc-800/50 text-left space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#00e5ff]" />
                  <span className="text-xs font-bold text-zinc-300">Higher discover ranking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-4 h-4 text-[#00e5ff]" />
                  <span className="text-xs font-bold text-zinc-300">More visibility & matches</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#00e5ff]" />
                  <span className="text-xs font-bold text-zinc-300">Duration: 30 mins</span>
                </div>
              </div>

              {currentUser?.plan !== 'pro' ? (
                <div className="space-y-4">
                   <div className="flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 py-2 rounded-lg text-xs font-bold border border-amber-500/20">
                     🔒 Merge Pro Feature
                   </div>
                   <button 
                     onClick={() => { setIsBoostModalOpen(false); setIsUpgradeModalOpen(true); }}
                     className="w-full py-3.5 rounded-xl font-black text-sm bg-white text-black hover:opacity-90 transition-all shadow-lg"
                   >
                     Upgrade to Pro
                   </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {boostStatus?.isBoosted ? (
                    <div className="py-3.5 rounded-xl font-black text-sm bg-zinc-800 text-zinc-400 border border-zinc-700">
                      🚀 Boost Active ({boostTimer})
                    </div>
                  ) : (
                    <button 
                      onClick={async () => {
                        try {
                          await api.post('/boost/activate');
                          toast.success('Boost activated!');
                          fetchBoostStatus();
                        } catch(e: any) {
                          toast.error(e.response?.data?.message || 'Failed to activate boost');
                        }
                      }}
                      className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-violet-600 to-[#00e5ff] text-white hover:opacity-90 transition-all shadow-lg shadow-violet-500/25"
                    >
                      Activate Boost ({boostStatus?.boostCount || 0} remaining)
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </DashboardContainer>
  );
};

export default ProfilePage;
