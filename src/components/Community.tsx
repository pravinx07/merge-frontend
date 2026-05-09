import avatars from '../assets/avatars.png';

export const Community = () => {
  return (
    <section id="community" className="py-24 bg-dark-card/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">A Live Community of Builders</h2>
          <p className="text-slate-400">See what others are building right now on Merge.</p>
        </div>
        
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
          {[0, 1, 2, 3].map(i => (
            <div key={i} className="bg-dark-card/70 backdrop-blur-xl p-5 rounded-2xl border border-dark-border hover:-translate-y-1 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-full bg-slate-800 bg-no-repeat"
                  style={{
                    backgroundImage: `url(${avatars})`,
                    backgroundSize: '300% 200%',
                    backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 100}%`
                  }}
                >
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Dev User {i + 1}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Working on AI SaaS</div>
                </div>
              </div>
              <div className="h-32 bg-slate-800/50 rounded-xl mb-4 overflow-hidden">
                <div className="w-full h-full bg-linear-to-br from-brand-purple/20 to-brand-cyan/20"></div>
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-2">Build the Future {i + 1}.0</h4>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400">React</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400">Tailwind</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
