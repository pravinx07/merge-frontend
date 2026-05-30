import { Filter, X, ChevronRight, Lock, Star, BadgeCheck, Trophy, Users, Clock, Briefcase, FolderKanban, Code2 } from 'lucide-react';
import { ProBadge } from '../Premium';

const SKILLS = ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'Next.js', 'PostgreSQL', 'Docker', 'AWS', 'Solidity', 'AI/ML'];
const INTENTS = ['Friendship', 'Collaboration', 'Cofounder', 'Hackathon', 'Mentor/Mentee'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced', 'Senior', 'Tech Lead'];

// Pro filter definitions
const PRO_FILTERS = [
  { id: 'builderScore', label: 'Builder Score', icon: Star, desc: 'Filter by builder level' },
  { id: 'githubVerified', label: 'GitHub Verified', icon: BadgeCheck, desc: 'Only verified accounts' },
  { id: 'hackathonWinner', label: 'Hackathon Winner', icon: Trophy, desc: 'Past winners only' },
  { id: 'cofounderMode', label: 'Cofounder Mode', icon: Users, desc: 'Serious builders only' },
  { id: 'availability', label: 'Availability', icon: Clock, desc: 'Filter by hours/week' },
  { id: 'startupStage', label: 'Startup Stage', icon: Briefcase, desc: 'Idea to launched' },
  { id: 'projectCount', label: 'Project Count', icon: FolderKanban, desc: 'Min projects built' },
  { id: 'topLanguage', label: 'Top Language', icon: Code2, desc: 'Primary coding language' },
];

interface Props {
  filters: any;
  setFilters: (filters: any) => void;
  onClear: () => void;
  isPro?: boolean;
  onProFilterClick?: () => void;
}

const FilterSidebar = ({ filters, setFilters, onClear, isPro = false, onProFilterClick }: Props) => {
  const toggleSkill = (skill: string) => {
    const current = filters.skills || [];
    const updated = current.includes(skill) 
      ? current.filter((s: string) => s !== skill)
      : [...current, skill];
    setFilters({ ...filters, skills: updated });
  };

  const handleProFilterClick = () => {
    if (!isPro && onProFilterClick) {
      onProFilterClick();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
            <Filter className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400">Filters</h2>
        </div>
        <button 
          onClick={onClear}
          className="text-xs font-medium text-slate-500 hover:text-white transition-colors"
        >
          Clear All
        </button>
      </div>

      {/* Skills */}
      <section>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center justify-between">
          Skills
          <span className="text-[10px] text-slate-700 bg-slate-900 px-1.5 py-0.5 rounded-md">
            {filters.skills?.length || 0}
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {SKILLS.map(skill => (
            <button
              key={skill}
              onClick={() => toggleSkill(skill)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-medium transition-all ${
                filters.skills?.includes(skill)
                  ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan'
                  : 'bg-white/5 border-dark-border text-slate-500 hover:border-slate-700'
              }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </section>

      {/* Intent */}
      <section>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Intent</h3>
        <div className="space-y-2">
          {INTENTS.map(intent => (
            <button
              key={intent}
              onClick={() => setFilters({ ...filters, intent: filters.intent === intent ? '' : intent })}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                filters.intent === intent
                  ? 'bg-brand-purple/10 border-brand-purple text-brand-purple'
                  : 'bg-white/5 border-dark-border text-slate-500 hover:bg-white/10'
              }`}
            >
              {intent}
              {filters.intent === intent ? <X className="w-3 h-3" /> : <ChevronRight className="w-3 h-3 text-slate-700" />}
            </button>
          ))}
        </div>
      </section>

      {/* Experience */}
      <section>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Experience</h3>
        <div className="grid grid-cols-2 gap-2">
          {EXPERIENCE.map(level => (
            <button
              key={level}
              onClick={() => setFilters({ ...filters, experienceLevel: filters.experienceLevel === level ? '' : level })}
              className={`px-3 py-2 rounded-xl border text-[10px] font-bold text-center transition-all ${
                filters.experienceLevel === level
                  ? 'bg-white text-dark-bg border-white'
                  : 'bg-white/5 border-dark-border text-slate-500 hover:border-slate-700'
              }`}
            >
              {level}
            </button>
          ))}
        </div>
      </section>

      {/* Pro Filters Divider */}
      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800/60" />
        </div>
        <div className="relative flex justify-center">
          <div className="px-4 bg-[#111115] flex items-center gap-2">
            <ProBadge size="md" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Pro Filters</span>
          </div>
        </div>
      </div>

      {/* Pro Filters */}
      <section className="space-y-2">
        {PRO_FILTERS.map(({ id, label, icon: Icon, desc }) => (
          <button
            key={id}
            onClick={handleProFilterClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all group ${
              isPro 
                ? 'bg-white/5 border-dark-border text-slate-400 hover:bg-white/10 hover:border-violet-500/30'
                : 'bg-zinc-900/50 border-zinc-800/50 cursor-pointer hover:border-violet-500/30 hover:bg-violet-500/5'
            }`}
          >
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
              isPro ? 'bg-violet-500/10 border border-violet-500/20' : 'bg-zinc-800/80 border border-zinc-700/50'
            }`}>
              <Icon className={`w-4 h-4 ${isPro ? 'text-violet-400' : 'text-zinc-500'}`} />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-xs font-bold ${isPro ? 'text-white' : 'text-zinc-400'}`}>{label}</p>
              <p className="text-[10px] text-zinc-600">{desc}</p>
            </div>
            {!isPro && (
              <div className="w-6 h-6 rounded-lg bg-zinc-800/80 border border-zinc-700/50 flex items-center justify-center group-hover:bg-violet-500/20 group-hover:border-violet-500/30 transition-all">
                <Lock className="w-3 h-3 text-zinc-500 group-hover:text-violet-400 transition-colors" />
              </div>
            )}
          </button>
        ))}
      </section>
    </div>
  );
};

export default FilterSidebar;
