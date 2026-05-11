import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Search,
  Users,
  MessageSquare,
  Layers,
  Globe,
  Calendar,
  Bell,
  ChevronDown,
  Zap,
  Map as MapIcon,
  LayoutGrid,
  Settings as SettingsIcon,
  X,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);

  const navItems = [
    { name: "Home", icon: Home, path: "/" },
    { name: "Discover", icon: MapIcon, path: "/discover" },
    { name: "Matches", icon: Users, path: "/matches" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
    { name: "Projects", icon: LayoutGrid, path: "/projects" },
    { name: "Community", icon: Globe, path: "/community" },
    { name: "Events", icon: Calendar, path: "/events" },
    { name: "Settings", icon: SettingsIcon, path: "/settings" },
  ];

  const getPageTitle = (path: string) => {
    const item = navItems.find((item) => item.path === path);
    return item ? item.name : "";
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex font-sans selection:bg-brand-cyan/30">
      {/* Sidebar */}
      <aside className="w-[260px] border-r border-white/5 flex flex-col fixed inset-y-0 hidden lg:flex bg-[#0A0A0B] z-50">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-cyan rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]">
            <span className="text-dark-bg font-black text-lg italic tracking-tighter">
              M
            </span>
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
                    ? "bg-white/5 text-brand-cyan"
                    : "text-slate-500 hover:text-white hover:bg-white/[0.01]"
                }`}
              >
                <item.icon
                  className={`w-4 h-4 transition-all ${isActive ? "text-brand-cyan" : "group-hover:text-white"}`}
                />
                <span className="font-bold text-[13px] tracking-tight">
                  {item.name}
                </span>
                {isActive && (
                  <div className="ml-auto w-1 h-1 bg-brand-cyan rounded-full shadow-[0_0_8px_rgba(0,229,255,0.8)]"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-6">
          <div className="p-5 rounded-[24px] bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border border-white/5 relative overflow-hidden group cursor-pointer">
            <h4 className="text-xs font-black mb-1.5 relative z-10 tracking-tight">
              Upgrade to Pro
            </h4>
            <p className="text-[10px] text-slate-500 mb-4 relative z-10 leading-tight">
              Advanced filters & more.
            </p>
            <button className="w-full py-2 bg-brand-purple text-dark-bg text-[9px] font-black rounded-lg transition-all relative z-10 uppercase tracking-widest shadow-lg active:scale-95">
              Upgrade
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:ml-[260px] flex flex-col min-w-0">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 sticky top-0 bg-[#0A0A0B]/80 backdrop-blur-xl z-40">
          <div className="flex-1">
            <h1 className="text-lg font-bold text-white tracking-tight">{pageTitle}</h1>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-white transition-all"
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-cyan text-dark-bg text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#0A0A0B]">
                    {notifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowNotifications(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-dark-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">
                          Notifications
                        </h3>
                        <button
                          onClick={clearNotifications}
                          className="text-[10px] font-bold text-brand-cyan hover:underline"
                        >
                          Clear all
                        </button>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif, idx) => (
                            <Link
                              key={idx}
                              to={`/chat/${notif.chatId}`}
                              onClick={() => setShowNotifications(false)}
                              className="block p-4 border-b border-white/5 hover:bg-white/5 transition-all"
                            >
                              <div className="flex gap-3">
                                <img
                                  src={
                                    notif.sender.avatar || "/default-avatar.png"
                                  }
                                  className="w-8 h-8 rounded-full border border-white/10"
                                  alt=""
                                />
                                <div>
                                  <p className="text-xs font-bold text-white">
                                    {notif.sender.name} sent you a message
                                  </p>
                                  <p className="text-[10px] text-slate-500 truncate w-48 mt-0.5">
                                    {notif.content}
                                  </p>
                                </div>
                              </div>
                            </Link>
                          ))
                        ) : (
                          <div className="p-8 text-center">
                            <Bell className="w-8 h-8 text-slate-800 mx-auto mb-2" />
                            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">
                              No new notifications
                            </p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <Link
              to={`/profile/${user?.id}`}
              className="flex items-center gap-3 pl-6 border-l border-white/10 group cursor-pointer hover:bg-white/[0.02] p-2 rounded-xl transition-all"
            >
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-[13px] font-black tracking-tight group-hover:text-brand-cyan transition-colors">
                  {user?.name}
                </span>
                <span className="text-[9px] text-brand-purple font-black uppercase tracking-widest">
                  Pro
                </span>
              </div>
              <div className="w-9 h-9 rounded-xl border border-white/10 p-0.5 bg-white/5 overflow-hidden group-hover:border-brand-cyan/50 transition-all">
                <img
                  src={
                    user?.avatar ||
                    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
                  }
                  className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform"
                  alt="Avatar"
                />
              </div>
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative bg-[#0A0A0B]">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
