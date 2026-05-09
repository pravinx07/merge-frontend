export const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "$0",
      desc: "For individual developers exploring connections.",
      features: ["5 Matches per month", "Basic Profile", "Community Access", "Public Projects"],
      cta: "Get Started",
      featured: false
    },
    {
      name: "Pro",
      price: "$19",
      desc: "For serious builders and career growth.",
      features: ["Unlimited Matches", "Verified Badge", "Priority in Search", "Private Project Collaboration", "Advanced Filters"],
      cta: "Go Pro",
      featured: true
    },
    {
      name: "Team",
      price: "$49",
      desc: "For startups and small hackathon teams.",
      features: ["Everything in Pro", "Team Dashboard", "Custom Branding", "Bulk Match Requests", "Dedicated Support"],
      cta: "Contact Sales",
      featured: false
    }
  ];

  return (
    <section id="pricing" className="py-24 bg-dark-card/10">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Pricing Plans</h2>
          <p className="text-slate-400">Choose the plan that fits your developer journey.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`p-8 rounded-[32px] glass border transition-all duration-300 relative ${
                plan.featured 
                ? 'border-brand-cyan/50 scale-105 z-10 shadow-[0_0_40px_rgba(0,229,255,0.15)] bg-brand-cyan/5' 
                : 'border-dark-border hover:border-white/20'
              }`}
            >
              {plan.featured && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-brand-cyan text-dark-bg text-[10px] font-bold rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-white mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-black text-white">{plan.price}</span>
                  <span className="text-slate-500 text-sm">/month</span>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{plan.desc}</p>
              </div>

              <ul className="space-y-4 mb-10">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-5 h-5 text-brand-cyan shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <button className={`w-full py-4 rounded-2xl font-bold transition-all ${
                plan.featured 
                ? 'bg-brand-cyan text-dark-bg shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-[1.02]' 
                : 'bg-white/5 text-white hover:bg-white/10'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
