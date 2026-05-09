export const FeatureCard = ({ number, title, desc, icon }: { number: string, title: string, desc: string, icon: any }) => (
  <div className="p-8 rounded-3xl bg-dark-card/70 backdrop-blur-xl border border-dark-border relative group overflow-hidden">
    <div className="absolute top-4 right-6 text-5xl font-black text-white/5">{number}</div>
    <div className="w-14 h-14 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
    <p className="text-slate-400 leading-relaxed text-sm">{desc}</p>
  </div>
);
