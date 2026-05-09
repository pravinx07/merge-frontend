import { FeatureCard } from './FeatureCard';

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How Merge Works</h2>
        <p className="text-slate-400 mb-16 max-w-2xl mx-auto">Three simple steps to find your next great project or teammate.</p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard 
            number="1"
            title="Create Your Developer Identity"
            desc="Connect your GitHub, showcase your skills, projects and what you're passionate about."
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
          />
          <FeatureCard 
            number="2"
            title="Match With Builders"
            desc="Our smart matching connects you with developers based on skills, goals and interests."
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
          />
          <FeatureCard 
            number="3"
            title="Build Something Amazing"
            desc="Chat, collaborate and build the next big thing together. From idea to reality."
            icon={<svg className="w-7 h-7" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 011-1h1a2 2 0 100-4H7a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>}
          />
        </div>
      </div>
    </section>
  );
};
