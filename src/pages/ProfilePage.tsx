import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Globe, MapPin, 
  ExternalLink, Calendar, Heart, Briefcase, 
  Settings, MessageSquare, Plus, ChevronRight,
  Monitor, Layers, Zap, Clock, Star, Trophy,
  Shield, Rocket, Brain, Coffee, CheckCircle2,
  Mail, User, Code, MoreHorizontal, Search, Bell,
  LayoutGrid, Map as MapIcon, Users
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { PageHeader, DashboardContainer, SectionTitle } from '../components/DashboardComponents';

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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get(`/users/${id}`);
        setProfile(response.data);
      } catch (err) {
        console.error('Fetch profile error:', err);
      } finally {
        setTimeout(() => {
            setIsLoading(false);
        }, 800);
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

  const isOwner = currentUser?.id === profile.id;

  return (
    <DashboardContainer>
      {/* Hero Header Section */}
      <div className="relative rounded-[32px] overflow-hidden border border-zinc-800 bg-zinc-900/20 mb-8">
        <div className="absolute inset-0 h-48 overflow-hidden opacity-20">
          <img src="https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2050&auto=format&fit=crop" className="w-full h-full object-cover" alt="Banner" />
          <div className="absolute inset-0 bg-linear-to-b from-transparent to-zinc-900"></div>
        </div>

        <div className="relative p-8 pt-20">
          {isOwner && (
            <Link to="/settings" className="absolute top-6 right-8 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-bold text-xs hover:bg-white/10 transition-all flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </Link>
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
              </div>
              <h2 className="text-sm font-medium text-zinc-400">Full Stack & AI Engineer</h2>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-[11px] font-bold text-zinc-500 uppercase tracking-wider mt-2">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand-cyan" /> {profile.location || 'Remote'}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-purple" /> Active Now</div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-6">
                {!isOwner && (
                  <>
                    <button className="px-6 py-2.5 bg-brand-purple text-dark-bg font-bold rounded-xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all text-xs"><Heart className="w-4 h-4" /> Match</button>
                    <button className="px-6 py-2.5 bg-white/5 border border-white/10 font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-xs text-white"><MessageSquare className="w-4 h-4" /> Message</button>
                  </>
                )}
                <button className="px-6 py-2.5 bg-zinc-800 border border-zinc-700 font-bold rounded-xl hover:bg-zinc-700 transition-all flex items-center gap-2 text-xs text-zinc-300"><GitHubIcon className="w-4 h-4" /> GitHub</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-8">
        {[
          { label: 'Compatibility', value: '92%', icon: Heart, color: 'text-brand-purple', bg: 'bg-brand-purple/10' },
          { label: 'Repositories', value: '54', icon: GitHubIcon, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
          { label: 'Contributions', value: '240', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Projects', value: '12', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
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
              <button className="text-[10px] font-black text-zinc-600 uppercase hover:text-brand-cyan">View all</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { title: 'AI SaaS Dashboard', desc: 'Analytics platform with predictive insights.', tags: ['Next.js', 'TS'], img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop' },
                { title: 'DevConnect', desc: 'Real-time developer networking tool.', tags: ['React', 'Socket'], img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop' },
              ].map((proj) => (
                <div key={proj.title} className="p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800/50 group hover:border-zinc-700 transition-all">
                  <div className="h-32 rounded-xl overflow-hidden mb-4 border border-zinc-800"><img src={proj.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="P" /></div>
                  <h3 className="text-sm font-bold text-white mb-1">{proj.title}</h3>
                  <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-4">{proj.desc}</p>
                  <div className="flex gap-2">
                    {proj.tags.map(t => <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-800 text-[9px] font-bold text-zinc-400">{t}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-8">
            <SectionTitle>Tech Stack</SectionTitle>
            <div className="space-y-6 mt-6">
              {['Frontend', 'Backend', 'Database'].map((cat, idx) => (
                <div key={cat}>
                  <h3 className="text-[10px] uppercase font-black text-zinc-600 tracking-widest mb-3">{cat}</h3>
                  <div className="flex flex-wrap gap-2">
                    {(idx === 0 ? ['React', 'Next.js', 'TypeScript', 'Tailwind'] : idx === 1 ? ['Node.js', 'Python', 'GraphQL'] : ['PostgreSQL', 'Redis', 'Docker']).map(s => <TechIcon key={s} name={s} color={idx === 0 ? "bg-brand-cyan" : idx === 1 ? "bg-brand-purple" : "bg-amber-500"} />)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-8">
            <SectionTitle>Activity</SectionTitle>
            <div className="flex items-center gap-4 mt-6">
                <div className="text-2xl font-bold text-white">240</div>
                <div className="text-[10px] uppercase font-black text-zinc-600 tracking-widest">Contributions</div>
            </div>
            <div className="mt-4 flex flex-wrap gap-1">
                {[...Array(40)].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-[1px] ${Math.random() > 0.4 ? 'bg-emerald-500/40' : 'bg-zinc-800'}`} />
                ))}
            </div>
          </section>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default ProfilePage;
