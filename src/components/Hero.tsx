import heroUi from '../assets/hero-ui.png';
import avatars from '../assets/avatars.png';

export const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Abstract background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/10 blur-[120px] rounded-full"></div>
      
      <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        <div className="z-10 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-purple/10 border border-brand-purple/20 text-brand-purple text-xs font-bold mb-6">
            <span>The social network for developers</span>
            <span className="w-1.5 h-1.5 rounded-full bg-brand-purple animate-pulse"></span>
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight mb-6">
            Find developers <br />
            <span className="bg-linear-to-r from-brand-cyan to-brand-purple bg-clip-text text-transparent">who match your vibe.</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-xl mb-10 mx-auto lg:mx-0">
            Connect, collaborate and build amazing things together. 
            Find teammates, cofounders, friends or something more.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-10">
            <button className="px-8 py-4 bg-brand-cyan text-dark-bg rounded-xl font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:-translate-y-1 transition-all flex items-center gap-2">
              Start Matching
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button className="px-8 py-4 border border-dark-border text-white rounded-xl font-bold hover:bg-white/5 transition-all">
              Explore Developers
            </button>
          </div>
          
          <div className="flex items-center justify-center lg:justify-start gap-4">
            <div className="flex -space-x-3">
              {[0, 1, 2, 3].map(i => (
                <div 
                  key={i} 
                  className="w-10 h-10 rounded-full border-2 border-dark-bg bg-slate-800 bg-no-repeat"
                  style={{
                    backgroundImage: `url(${avatars})`,
                    backgroundSize: '300% 200%',
                    backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 100}%`
                  }}
                >
                </div>
              ))}
            </div>
            <p className="text-sm text-slate-500">
              Join <span className="text-white font-bold">12,000+</span> developers already building <br />
              Connections on Merge
            </p>
          </div>
        </div>
        
        <div className="relative z-10 animate-float">
          <div className="absolute inset-0 bg-gradient-to-tr from-brand-cyan/20 to-brand-purple/20 blur-3xl -z-10 rounded-full scale-75"></div>
          <img 
            src={heroUi} 
            alt="Merge Platform UI" 
            className="rounded-3xl shadow-2xl border border-white/10"
          />
        </div>
      </div>
    </section>
  );
};
