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
    <div className={`w-10 h-10 rounded-xl bg-[#161617] border border-white/5 flex items-center justify-center group hover:bg-white/10 transition-all cursor-pointer relative shadow-lg`}>
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
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, [id]);

  if (isLoading) return <div className="min-h-[80vh] flex items-center justify-center"><div className="w-10 h-10 border-3 border-brand-cyan border-t-transparent rounded-full animate-spin"></div></div>;
  if (!profile) return <div className="min-h-[80vh] text-white flex flex-col items-center justify-center p-6 text-center"><h1 className="text-2xl font-bold mb-4">404 - Profile Not Found</h1><Link to="/" className="px-6 py-2 bg-brand-cyan text-dark-bg rounded-lg font-bold">Go Home</Link></div>;

  const isOwner = currentUser?.id === profile.id;

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 pb-12 font-sans selection:bg-brand-cyan/30">
      
      {/* Compact Hero Header Section */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative rounded-[32px] overflow-hidden border border-white/5 bg-[#0D0D0E] shadow-xl">
        <div className="absolute inset-0 h-64 overflow-hidden">
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-[#0D0D0E]/80 to-[#0D0D0E]"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-purple/10 blur-[100px] rounded-full"></div>
          <img src="https://images.unsplash.com/photo-1464802686167-b939a6910659?q=80&w=2050&auto=format&fit=crop" className="w-full h-full object-cover opacity-30 mix-blend-screen" alt="Nebula" />
        </div>

        <div className="relative pt-24 px-8 pb-10">
          {isOwner && (
            <Link to="/settings" className="absolute top-6 right-8 px-4 py-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl font-bold text-xs hover:bg-white/10 transition-all flex items-center gap-2">
              <Settings className="w-3.5 h-3.5" /> Edit Profile
            </Link>
          )}

          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-6 text-center lg:text-left">
            <div className="relative group">
              <div className="relative w-32 h-32 rounded-full border-4 border-[#0D0D0E] bg-[#161617] overflow-hidden p-1 shadow-xl">
                <img src={profile.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.name}`} className="w-full h-full object-cover rounded-full" alt="Profile" />
              </div>
              <div className="absolute bottom-2 right-2 w-5 h-5 bg-[#22C55E] rounded-full border-[3px] border-[#0D0D0E] shadow-lg"></div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <h1 className="text-3xl font-black tracking-tight">{profile.name}</h1>
                <CheckCircle2 className="w-5 h-5 text-brand-cyan fill-brand-cyan/10" />
              </div>
              <h2 className="text-lg font-bold text-slate-200">Full Stack & AI Engineer</h2>
              
              <div className="flex flex-wrap justify-center lg:justify-start gap-4 text-xs font-bold text-slate-500">
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-brand-cyan" /> {profile.location || 'Nagpur, India'}</div>
                <div className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-brand-purple" /> 10:24 PM (IST)</div>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-2 pt-1">
                {[{ label: 'AI Builder', icon: Brain, color: 'text-brand-cyan' }, { label: 'Startup Enthusiast', icon: Rocket, color: 'text-brand-purple' }, { label: 'Night Owl Coder', icon: Coffee, color: 'text-amber-500' }].map((tag) => (
                  <span key={tag.label} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-wider flex items-center gap-2 hover:bg-white/10 cursor-default">
                    <tag.icon className={`w-3 h-3 ${tag.color}`} /> {tag.label}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3 pt-4">
                <button className="px-6 py-3 bg-brand-purple text-dark-bg font-black rounded-xl flex items-center gap-2 shadow-lg hover:-translate-y-0.5 transition-all active:scale-95 text-xs"><Heart className="w-4 h-4 fill-dark-bg" /> Match</button>
                <button className="px-6 py-3 bg-white/5 border border-white/10 font-black rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-xs"><MessageSquare className="w-4 h-4" /> Message</button>
                <button className="px-6 py-3 bg-white/5 border border-white/10 font-black rounded-xl hover:bg-white/10 transition-all flex items-center gap-2 text-xs"><GitHubIcon className="w-4 h-4" /> Connect GitHub</button>
                <button className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all text-slate-400"><MoreHorizontal className="w-5 h-5" /></button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Compact Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Compatibility', value: '92%', icon: Heart, color: 'text-brand-purple', bg: 'bg-brand-purple/10', sub: 'Great match! ✨' },
          { label: 'Repositories', value: '54', icon: GitHubIcon, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
          { label: 'Contributions', value: '240', icon: Trophy, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
          { label: 'Projects', value: '12', icon: Layers, color: 'text-amber-500', bg: 'bg-amber-500/10' },
          { label: 'Collaborations', value: '8', icon: Users, color: 'text-brand-cyan', bg: 'bg-brand-cyan/10' },
        ].map((stat) => (
          <div key={stat.label} className="bg-[#111112] border border-white/5 rounded-2xl p-5 flex flex-col gap-3 group hover:border-white/10 transition-all">
            <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform`}><stat.icon className="w-5 h-5" /></div>
            <div>
              <div className="text-xl font-black tracking-tight">{stat.value}</div>
              <div className="text-[9px] uppercase font-black tracking-widest text-slate-500">{stat.label}</div>
              {stat.sub && <div className="text-[8px] font-bold text-brand-purple mt-1">{stat.sub}</div>}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-[#111112] border border-white/5 rounded-[32px] p-8 space-y-6 relative overflow-hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-brand-purple/10 flex items-center justify-center"><User className="w-4 h-4 text-brand-purple" /></div>
              <h2 className="text-lg font-black tracking-tight">About Me</h2>
            </div>
            <p className="text-slate-400 text-base leading-relaxed font-medium">{profile.bio || "I am Software Engineer At Google"}</p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              {[
                { label: 'Years Experience', val: '2+', icon: Briefcase, color: 'text-brand-cyan' },
                { label: 'Open To', val: 'Cofounder', icon: Rocket, color: 'text-brand-purple' },
                { label: 'Available', val: 'Full Time', icon: Clock, color: 'text-amber-500' }
              ].map(stat => (
                <div key={stat.label} className="flex flex-col gap-2 group">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 shadow-inner"><stat.icon className={`w-5 h-5 ${stat.color}`} /></div>
                  <div><div className="text-sm font-black">{stat.val}</div><div className="text-[9px] text-slate-500 uppercase font-black">{stat.label}</div></div>
                </div>
              ))}
            </div>
          </section>

          {/* Compact Featured Projects */}
          <section className="bg-[#111112] border border-white/5 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center"><LayoutGrid className="w-4 h-4 text-brand-cyan" /></div>
                <h2 className="text-lg font-black tracking-tight">Featured Projects</h2>
              </div>
              <button className="text-[10px] font-black text-slate-500 uppercase hover:text-brand-cyan">View all</button>
            </div>
            <div className="space-y-4">
              {[
                { title: 'AI SaaS Dashboard', desc: 'AI-powered analytics dashboard for SaaS businesses.', tags: ['Next.js', 'TS', 'PostgreSQL'], img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=2015&auto=format&fit=crop' },
                { title: 'DevConnect', desc: 'Developer networking platform to connect and build.', tags: ['React', 'Node.js', 'MongoDB'], img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop' },
              ].map((proj) => (
                <div key={proj.title} className="flex gap-6 p-5 rounded-[24px] bg-white/[0.01] border border-white/5 group hover:border-white/10 transition-all">
                  <div className="w-32 h-24 rounded-[16px] overflow-hidden flex-shrink-0 border border-white/5"><img src={proj.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="P" /></div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between"><h3 className="text-base font-black tracking-tight">{proj.title}</h3><span className="px-2 py-0.5 rounded-full bg-brand-purple/10 text-brand-purple text-[8px] font-black uppercase border border-brand-purple/20">Featured</span></div>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{proj.desc}</p>
                    <div className="flex gap-4 pt-1">
                      <a href="#" className="text-[10px] font-black uppercase text-slate-500 hover:text-brand-cyan flex items-center gap-1">Demo <ExternalLink className="w-3 h-3" /></a>
                      <a href="#" className="text-[10px] font-black uppercase text-slate-500 hover:text-white flex items-center gap-1">GitHub <GitHubIcon className="w-3 h-3" /></a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-[#111112] border border-white/5 rounded-[32px] p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-brand-cyan/10 flex items-center justify-center"><Code className="w-4 h-4 text-brand-cyan" /></div><h2 className="text-base font-black tracking-tight">Tech Stack</h2></div>
              <button className="text-[9px] uppercase font-black text-slate-600 hover:text-brand-cyan">View all</button>
            </div>
            <div className="space-y-8">
              {['Frontend', 'Backend', 'Database & Cloud'].map((cat, idx) => (
                <div key={cat}>
                  <h3 className="text-[9px] uppercase font-black text-slate-600 tracking-widest mb-4">{cat}</h3>
                  <div className="flex flex-wrap gap-3">
                    {(idx === 0 ? ['React', 'Next.js', 'TypeScript', 'Tailwind', 'Redux'] : idx === 1 ? ['Node.js', 'Express', 'Python', 'GraphQL', 'Socket.io'] : ['PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Redis']).map(s => <TechIcon key={s} name={s} color={idx === 0 ? "bg-brand-cyan" : idx === 1 ? "bg-brand-purple" : "bg-amber-500"} />)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#111112] border border-white/5 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><GitHubIcon className="w-4 h-4 text-slate-400" /></div><h2 className="text-base font-black tracking-tight">GitHub Activity</h2></div>
              <button className="text-[9px] uppercase font-black text-slate-600 hover:text-brand-cyan">View profile ↗</button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="space-y-1"><div className="text-xl font-black">240</div><div className="text-[8px] text-slate-600 font-black uppercase">Contributions</div></div>
              <div className="space-y-1"><div className="text-xl font-black">12</div><div className="text-[8px] text-slate-600 font-black uppercase">Streak</div></div>
            </div>
            <div className="space-y-1 mb-6">
              {[...Array(5)].map((_, i) => <div key={i} className="flex gap-1">{[...Array(20)].map((_, j) => <div key={j} className="w-[8px] h-[8px] rounded-[1.5px]" style={{ backgroundColor: Math.random() > 0.5 ? 'rgba(34, 197, 94, 0.4)' : 'rgba(255, 255, 255, 0.05)' }}></div>)}</div>)}
            </div>
            <div className="space-y-4">
              {[{ name: 'TypeScript', p: 45.3, c: 'bg-brand-cyan' }, { name: 'JavaScript', p: 28.6, c: 'bg-brand-purple' }].map(l => (
                <div key={l.name} className="space-y-1.5"><div className="flex justify-between text-[9px] font-black"><span className="text-slate-500">{l.name}</span><span className="text-white">{l.p}%</span></div><div className="h-1 bg-white/5 rounded-full overflow-hidden"><div className={`h-full ${l.c}`} style={{ width: `${l.p}%` }}></div></div></div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
