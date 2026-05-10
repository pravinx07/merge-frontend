import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Search, Users, MessageSquare, 
  Layers, Globe, Calendar, Bell, ChevronDown,
  Zap, Map as MapIcon, LayoutGrid, Settings as SettingsIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Home', icon: Home, path: '/' },
    { name: 'Discover', icon: MapIcon, path: '/discover' },
    { name: 'Matches', icon: Users, path: '/matches' },
    { name: 'Messages', icon: MessageSquare, path: '/messages' },
    { name: 'Projects', icon: LayoutGrid, path: '/projects' },
    { name: 'Community', icon: Globe, path: '/community' },
    { name: 'Events', icon: Calendar, path: '/events' },
    { name: 'Settings', icon: SettingsIcon, path: '/settings' },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex font-sans selection:bg-brand-cyan/30">
      {/* More Compact Sidebar */}
      <aside className="w-64 border-r border-white/5 flex flex-col fixed inset-y-0 hidden lg:flex bg-[#0A0A0B] z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <span className="text-dark-bg font-black text-lg italic tracking-tighter">M</span>
          </div>
          <span className="text-xl font-black tracking-tight">Merge</span>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                  isActive 
                    ? 'bg-white/5 text-brand-cyan' 
                    : 'text-slate-500 hover:text-white hover:bg-white/[0.01]'
                }`}
              >
                <item.icon className={`w-4 h-4 transition-all ${isActive ? 'text-brand-cyan' : 'group-hover:text-white'}`} />
                <span className="font-bold text-[13px] tracking-tight">{item.name}</span>
                {isActive && <div className="ml-auto w-1 h-1 bg-brand-cyan rounded-full shadow-[0_0_8px_rgba(0,229,255,0.8)]"></div>}
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="p-5 rounded-[24px] bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border border-white/5 relative overflow-hidden group cursor-pointer">
            <h4 className="text-xs font-black mb-1.5 relative z-10 tracking-tight">Upgrade to Pro</h4>
            <p className="text-[10px] text-slate-500 mb-4 relative z-10 leading-tight">Advanced filters & more.</p>
            <button className="w-full py-2 bg-brand-purple text-dark-bg text-[9px] font-black rounded-lg transition-all relative z-10 uppercase tracking-widest shadow-lg active:scale-95">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      {/* More Compact Main Area */}
      <div className="flex-1 lg:ml-64 flex flex-col min-w-0">
        {/* Compact Top Nav */}
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0A0A0B]/80 backdrop-blur-xl z-40">
          <div className="flex-1 max-w-xl">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-brand-cyan transition-all" />
              <input 
                type="text" 
                placeholder="Search..."
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl py-2 pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-brand-cyan/50 transition-all"
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded-md bg-white/5 text-[8px] font-black text-slate-600 border border-white/5">⌘ K</div>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative p-2 text-slate-500 hover:text-white transition-all">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-brand-cyan rounded-full border-2 border-[#0A0A0B]"></span>
            </button>
            
            <Link to={`/profile/${user?.id}`} className="flex items-center gap-3 pl-6 border-l border-white/10 group cursor-pointer hover:bg-white/[0.02] p-2 rounded-xl transition-all">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[13px] font-black tracking-tight group-hover:text-brand-cyan transition-colors">{user?.name}</span>
                <span className="text-[9px] text-brand-purple font-black uppercase tracking-widest">Pro</span>
              </div>
              <div className="w-9 h-9 rounded-xl border border-white/10 p-0.5 bg-white/5 overflow-hidden group-hover:border-brand-cyan/50 transition-all">
                <img 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} 
                  className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform"
                  alt="Avatar"
                />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative bg-[#0A0A0B]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
