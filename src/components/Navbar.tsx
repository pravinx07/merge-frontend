import { useState, useEffect } from 'react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-card/70 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-linear-to-br from-brand-cyan to-brand-purple rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Merge</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-brand-cyan transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-brand-cyan transition-colors">How it Works</a>
          <a href="#community" className="hover:text-brand-cyan transition-colors">Community</a>
          <a href="#pricing" className="hover:text-brand-cyan transition-colors">Pricing</a>
        </div>

        <div className="flex items-center gap-4">
          <button className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Log In</button>
          <button className="px-5 py-2.5 bg-brand-cyan text-dark-bg rounded-full text-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-105 transition-transform">
            Sign Up
          </button>
        </div>
      </div>
    </nav>
  );
};
