import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-dark-card/70 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'}`}>
      <div className="container mx-auto px-6 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer">
          <div className="w-8 h-8 bg-linear-to-br from-brand-cyan to-brand-purple rounded-lg flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M12 4v16m8-8H4" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">Merge</span>
        </Link>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
          <a href="#features" className="hover:text-brand-cyan transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-brand-cyan transition-colors">How it Works</a>
          <a href="#community" className="hover:text-brand-cyan transition-colors">Community</a>
          {isAuthenticated && <Link to="/dashboard" className="hover:text-brand-cyan transition-colors">Dashboard</Link>}
        </div>

        <div className="flex items-center gap-4">
          {!isAuthenticated ? (
            <>
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Log In</Link>
              <Link to="/signup" className="px-5 py-2.5 bg-brand-cyan text-dark-bg rounded-full text-sm font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:scale-105 transition-transform">
                Sign Up
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/10">
                <div className="w-6 h-6 rounded-full bg-brand-purple flex items-center justify-center text-[10px] font-bold text-white">
                  {user?.avatar ? <img src={user.avatar} className="rounded-full" /> : user?.name.charAt(0)}
                </div>
                <span className="text-xs font-bold text-white">{user?.name}</span>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
