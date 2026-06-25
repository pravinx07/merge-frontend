import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  MessageSquare,
  Bell,
  Map as MapIcon,
  LayoutGrid,
  Settings as SettingsIcon,
  X,
  Menu,
  Globe,
  Heart,
  User,
  LogOut,
  Trophy,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { UpgradeModal } from "./Premium/UpgradeModal";

const getRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;
  return date.toLocaleDateString();
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications, markAsRead } = useSocket();
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (location.pathname === "/messages") {
      clearNotifications("message");
    } else if (location.pathname === "/matches") {
      clearNotifications("match");
    } else if (location.pathname === "/projects") {
      clearNotifications("project_apply");
      clearNotifications("project_decision");
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const navItems = [
    { name: "Community", icon: Globe, path: "/community" },
    { name: "Discover", icon: MapIcon, path: "/discover" },
    { name: "Matches", icon: Heart, path: "/matches" },
    { name: "Messages", icon: MessageSquare, path: "/messages" },
    { name: "Projects", icon: LayoutGrid, path: "/projects" },
    { name: "Hackathons", icon: Trophy, path: "/hackathons" },
    { name: "Gigs", icon: DollarSign, path: "/bounties" },
    { name: "Assessments", icon: ShieldCheck, path: "/assessments" },
    { name: "Settings", icon: SettingsIcon, path: "/settings" },
  ];

  const getNavItemBadgeCount = (itemName: string) => {
    const unread = notifications.filter(n => !n.read);
    if (itemName === "Messages") {
      return unread.filter(n => n.type === "message").length;
    }
    if (itemName === "Matches") {
      return unread.filter(n => n.type === "match").length;
    }
    if (itemName === "Projects") {
      return unread.filter(n => n.type === "project").length;
    }
    return 0;
  };

  const getPageTitle = (path: string) => {
    const item = navItems.find((item) => item.path === path);
    return item ? item.name : "";
  };

  const pageTitle = getPageTitle(location.pathname);

  const SidebarContent = () => (
    <>
      <div className="p-6 flex items-center gap-3">
        <img src="/logo.png" alt="Merge Logo" className="w-8 h-8 rounded-lg shadow-[0_0_15px_rgba(0,229,255,0.4)] object-cover" />
        <span className="text-xl font-black tracking-tight">Merge</span>
        {isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(false)}
            className="ml-auto p-2 lg:hidden text-slate-500"
          >
            <X className="w-6 h-6" />
          </button>
        )}
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group ${
                isActive
                  ? "bg-white/5 text-brand-cyan"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              <item.icon
                className={`w-4 h-4 transition-all ${isActive ? "text-brand-cyan" : "group-hover:text-white"}`}
              />
              <span className="font-bold text-[13px] tracking-tight">
                {item.name}
              </span>
              {getNavItemBadgeCount(item.name) > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-[0_0_10px_rgba(239,68,68,0.4)] relative z-10">
                  {getNavItemBadgeCount(item.name)}
                </span>
              )}
              {isActive && getNavItemBadgeCount(item.name) === 0 && (
                <div className="ml-auto w-1 h-1 bg-brand-cyan rounded-full shadow-[0_0_8px_rgba(0,229,255,0.8)]"></div>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 flex flex-col gap-4">
        {user?.plan !== 'pro' && (
          <div 
            onClick={() => setIsUpgradeModalOpen(true)}
            className="p-5 rounded-[24px] bg-linear-to-br from-brand-purple/10 to-brand-cyan/10 border border-white/5 relative overflow-hidden group cursor-pointer"
          >
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
        )}
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0B] text-white flex font-sans selection:bg-brand-cyan/30">
      {/* Desktop Sidebar */}
      <aside className="w-[260px] border-r border-white/5 flex flex-col fixed inset-y-0 hidden lg:flex bg-[#0A0A0B] z-50">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-[280px] bg-[#0A0A0B] border-r border-white/10 z-[70] flex flex-col lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 lg:ml-[260px] flex flex-col min-w-0">
        <header className="h-20 border-b border-white/5 flex items-center justify-between px-4 md:px-8 sticky top-0 bg-[#0A0A0B]/80 backdrop-blur-xl z-40">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-slate-400 hover:text-white transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-tight truncate max-w-[150px] md:max-w-none">
              {pageTitle}
            </h1>
          </div>

          <div className="flex items-center gap-2 md:gap-6">
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 text-slate-500 hover:text-white transition-all"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-cyan text-dark-bg text-[8px] font-black flex items-center justify-center rounded-full border-2 border-[#0A0A0B]">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 bg-dark-card border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-4 border-b border-white/5 flex items-center justify-between">
                        <Link 
                          to="/notifications" 
                          onClick={() => setShowNotifications(false)}
                          className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                        >
                          Notifications
                        </Link>
                        <div className="flex items-center gap-4">
                          <Link
                            to="/notifications"
                            onClick={() => setShowNotifications(false)}
                            className="text-[10px] font-bold text-slate-400 hover:text-white transition-colors"
                          >
                            View all
                          </Link>
                          <button
                            onClick={async () => {
                              await clearNotifications();
                              toast.success('All notifications marked as read!');
                            }}
                            className="text-[10px] font-bold text-brand-cyan hover:underline"
                          >
                            Mark all read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length > 0 ? (
                          notifications.map((notif, idx) => {
                            let path = '#';
                            if (notif.type === 'message') path = `/chat/${notif.entityId}`;
                            else if (notif.type === 'match') path = '/matches';
                            else if (notif.type === 'project') path = `/projects/${notif.entityId || ''}`;
                            else if (notif.type === 'hackathon') path = `/hackathons/${notif.entityId || ''}`;
                            else if (notif.type === 'community' || notif.type === 'follow') path = '/community';
                            
                            // fallback for legacy schema during dev
                            if (notif.path) path = notif.path;
                            const title = notif.message || notif.title;

                            return (
                              <Link
                                key={notif.id || idx}
                                to={path}
                                onClick={() => {
                                  setShowNotifications(false);
                                  if (notif.id) markAsRead(notif.id);
                                }}
                                className={`block p-4 border-b border-white/5 hover:bg-white/5 transition-all ${!notif.read ? 'bg-white/[0.02]' : ''}`}
                              >
                                <div className="flex gap-3 items-center">
                                  {notif.sender?.avatar && (
                                    <img
                                      src={notif.sender.avatar}
                                      className="w-8 h-8 rounded-full border border-white/10"
                                      alt=""
                                    />
                                  )}
                                  <div>
                                    <p className={`text-xs ${!notif.read ? 'font-black' : 'font-bold'} text-white`}>
                                      {title}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                      {notif.createdAt ? getRelativeTime(notif.createdAt) : ''}
                                    </p>
                                  </div>
                                </div>
                              </Link>
                            );
                          })
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
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 md:gap-3 pl-2 md:pl-6 border-l border-white/10 group cursor-pointer hover:bg-white/[0.02] p-1 md:p-2 rounded-xl transition-all focus:outline-none"
              >
                <div className="flex flex-col items-end hidden sm:flex">
                  <span className="text-[13px] font-black tracking-tight group-hover:text-brand-cyan transition-colors">
                    {user?.name}
                  </span>
                  <span className={`text-[9px] font-black uppercase tracking-widest ${user?.plan === 'pro' ? 'text-brand-purple' : 'text-slate-500'}`}>
                    {user?.plan === 'pro' ? 'Pro' : 'Free'}
                  </span>
                </div>
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl border border-white/10 p-0.5 bg-white/5 overflow-hidden group-hover:border-brand-cyan/50 transition-all">
                  <img
                    src={
                      user?.avatar ||
                      `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`
                    }
                    className="w-full h-full object-cover rounded-lg group-hover:scale-110 transition-transform"
                    alt="Avatar"
                  />
                </div>
              </button>

              <AnimatePresence>
                {showDropdown && (
                  <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-[#111112] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      <div className="p-2 space-y-1">
                        <Link
                          to={`/profile/${user?.id}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                        >
                          <User className="w-4 h-4 text-slate-500" />
                          View Profile
                        </Link>
                        <Link
                          to="/settings"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all text-xs font-bold"
                        >
                          <SettingsIcon className="w-4 h-4 text-slate-500" />
                          Settings
                        </Link>
                        <button
                          onClick={() => {
                            setShowDropdown(false);
                            handleLogout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-xs font-bold text-left focus:outline-none"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 relative bg-[#0A0A0B]">{children}</main>
      </div>
      <UpgradeModal isOpen={isUpgradeModalOpen} onClose={() => setIsUpgradeModalOpen(false)} />
    </div>
  );
};

export default MainLayout;
