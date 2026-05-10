import { Filter, X, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SKILLS = ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'Next.js', 'PostgreSQL', 'Docker', 'AWS', 'Solidity', 'AI/ML'];
const INTENTS = ['Friendship', 'Collaboration', 'Cofounder', 'Hackathon', 'Mentor/Mentee'];
const EXPERIENCE = ['Beginner', 'Intermediate', 'Advanced', 'Senior', 'Tech Lead'];

interface Props {
  filters: any;
  setFilters: (filters: any) => void;
  onClear: () => void;
}

const FilterSidebar = ({ filters, setFilters, onClear }: Props) => {
  const toggleSkill = (skill: string) => {
    const current = filters.skills || [];
    const updated = current.includes(skill) 
      ? current.filter((s: string) => s !== skill)
      : [...current, skill];
    setFilters({ ...filters, skills: updated });
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
    </div>
  );
};

export default FilterSidebar;
