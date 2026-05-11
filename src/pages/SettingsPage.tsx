import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Bell, Trash2, Camera, 
  Save, AlertCircle, CheckCircle2, ChevronRight,
  Globe, Briefcase, Rocket, Brain, Coffee, MapPin, Key,
  Loader2
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { PageHeader, DashboardContainer } from '../components/DashboardComponents';

const GitHubIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TwitterIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedInIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
  </svg>
);

const SettingsPage = () => {
  const { user, setUser, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'professional' | 'security' | 'account'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  
  const [formData, setFormData] = useState<any>({
    name: '', bio: '', location: '', personality: '', status: '',
    skills: '', experienceLevel: '', interests: '', intent: '',
    website: '', githubUrl: '', twitter: '', linkedin: '',
  });

  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        location: user.location || '',
        personality: user.personality || '',
        status: user.status || '',
        skills: user.skills?.join(', ') || '',
        experienceLevel: user.experienceLevel || '',
        interests: user.interests?.join(', ') || '',
        intent: user.intent || '',
        website: user.website || '',
        githubUrl: user.githubUrl || '',
        twitter: user.twitter || '',
        linkedin: user.linkedin || '',
      });
      setAvatarPreview(user.avatar || '');
      
      const timer = setTimeout(() => {
        setIsInitialLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (isAuthLoading || isInitialLoading) {
    return (
      <DashboardContainer>
        <div className="space-y-8 animate-pulse">
          <div className="space-y-2">
            <div className="h-8 bg-white/5 rounded-full w-48" />
            <div className="h-4 bg-white/5 rounded-full w-64" />
          </div>
          <LoadingSkeleton type="settings" />
        </div>
      </DashboardContainer>
    );
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const isFormDirty = () => {
    if (!user) return false;
    const currentData = {
      name: user.name || '',
      bio: user.bio || '',
      location: user.location || '',
      personality: user.personality || '',
      status: user.status || '',
      skills: user.skills?.join(', ') || '',
      experienceLevel: user.experienceLevel || '',
      interests: user.interests?.join(', ') || '',
      intent: user.intent || '',
      website: user.website || '',
      githubUrl: user.githubUrl || '',
      twitter: user.twitter || '',
      linkedin: user.linkedin || '',
    };
    
    return Object.keys(formData).some(key => formData[key] !== currentData[key as keyof typeof currentData]) || avatar !== null;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormDirty()) return;
    
    setIsLoading(true);
    const toastId = toast.loading('Updating profile...');

    try {
      const data = new FormData();
      
      Object.keys(formData).forEach(key => {
        const value = formData[key];
        if (key === 'skills' || key === 'interests') {
          const arr = typeof value === 'string' ? value.split(',').map((s: string) => s.trim()).filter(Boolean) : value;
          data.append(key, JSON.stringify(arr));
        } else if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      if (avatar) {
        data.append('avatar', avatar);
      }

      const response = await api.put('/users/profile', data);
      setUser(response.data.user);
      setAvatar(null);
      toast.success('Profile updated successfully!', { id: toastId });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error('Passwords do not match');
    }
    setIsLoading(true);
    const toastId = toast.loading('Updating password...');
    try {
      await api.post('/users/change-password', {
        currentPassword: passwords.current,
        newPassword: passwords.new
      });
      toast.success('Password changed successfully!', { id: toastId });
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Password change failed', { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'General', icon: User },
    { id: 'professional', label: 'Professional', icon: Briefcase },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'account', label: 'Account', icon: Trash2 },
  ];

  return (
    <DashboardContainer>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Navigation Sidebar */}
        <div className="w-full lg:w-[260px] flex flex-col gap-1 shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm ${
                activeTab === tab.id 
                ? 'bg-zinc-900/50 text-brand-cyan shadow-inner' 
                : 'text-zinc-500 hover:text-white hover:bg-white/[0.01]'
              }`}
            >
              <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-brand-cyan' : ''}`} />
              {tab.label}
              {activeTab === tab.id && <ChevronRight className="ml-auto w-3 h-3 text-brand-cyan" />}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-6 lg:p-10 shadow-xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -5 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && (
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="flex items-center gap-8 pb-8 border-b border-zinc-800/50">
                    <div className="relative group">
                      <div className="w-20 h-20 rounded-2xl border-2 border-zinc-800 bg-zinc-900 overflow-hidden p-0.5 shadow-xl">
                        <img 
                          src={avatarPreview || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name || 'user'}`} 
                          className="w-full h-full object-cover rounded-xl" 
                          alt="Avatar" 
                        />
                      </div>
                      <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-brand-cyan rounded-xl flex items-center justify-center text-dark-bg cursor-pointer shadow-lg hover:scale-110 transition-all border-4 border-[#0A0A0B]">
                        <Camera className="w-4 h-4" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                      </label>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Profile Picture</h3>
                      <p className="text-xs text-zinc-500 mt-1">Recommended: JPG or PNG, max 2MB.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Full Name</label>
                      <input 
                        type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Location</label>
                      <input 
                        type="text" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                      />
                    </div>
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Bio</label>
                      <textarea 
                        rows={3} value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all resize-none"
                        placeholder="Tell us about yourself..."
                      ></textarea>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Personality</label>
                      <select 
                        value={formData.personality} onChange={(e) => setFormData({...formData, personality: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all appearance-none"
                      >
                        <option value="">Select Type</option>
                        <option value="AI Builder">AI Builder</option>
                        <option value="Startup Enthusiast">Startup Enthusiast</option>
                        <option value="Night Owl Coder">Night Owl Coder</option>
                        <option value="Open Source Warrior">Open Source Warrior</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Status</label>
                      <input 
                        type="text" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}
                        placeholder="e.g. 🟢 Building AI Products"
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                      />
                    </div>
                  </div>

                  <button 
                    disabled={isLoading || !isFormDirty()}
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-cyan text-dark-bg font-bold rounded-xl hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed text-sm shadow-xl shadow-brand-cyan/10"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isLoading ? 'Saving Changes...' : 'Save Changes'}
                  </button>
                </form>
              )}

              {activeTab === 'professional' && (
                <form onSubmit={handleUpdateProfile} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Skills (comma separated)</label>
                      <input 
                        type="text" value={formData.skills} onChange={(e) => setFormData({...formData, skills: e.target.value})}
                        placeholder="React, Node.js, AI, Python"
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Experience Level</label>
                      <select 
                        value={formData.experienceLevel} onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all appearance-none"
                      >
                        <option value="Junior">Junior</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Senior">Senior</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Looking For</label>
                      <select 
                        value={formData.intent} onChange={(e) => setFormData({...formData, intent: e.target.value})}
                        className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-brand-cyan/50 transition-all appearance-none"
                      >
                        <option value="Cofounder">Cofounder</option>
                        <option value="Collaboration">Collaboration</option>
                        <option value="Networking">Networking</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1 flex items-center gap-2"><GitHubIcon className="w-3.5 h-3.5" /> GitHub URL</label>
                      <input type="text" value={formData.githubUrl} onChange={(e) => setFormData({...formData, githubUrl: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1 flex items-center gap-2"><LinkedInIcon className="w-3.5 h-3.5" /> LinkedIn URL</label>
                      <input type="text" value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                  <button 
                    disabled={isLoading || !isFormDirty()} 
                    className="flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-purple text-dark-bg font-bold rounded-xl text-sm hover:scale-[1.02] transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {isLoading ? 'Updating...' : 'Save Professional Info'}
                  </button>
                </form>
              )}

              {activeTab === 'security' && (
                <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Current Password</label>
                      <input type="password" value={passwords.current} onChange={(e) => setPasswords({...passwords, current: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">New Password</label>
                      <input type="password" value={passwords.new} onChange={(e) => setPasswords({...passwords, new: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 ml-1">Confirm New Password</label>
                      <input type="password" value={passwords.confirm} onChange={(e) => setPasswords({...passwords, confirm: e.target.value})} className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white focus:outline-none" />
                    </div>
                  </div>
                  <button disabled={isLoading} className="flex items-center justify-center gap-2 px-8 py-3.5 bg-brand-cyan text-dark-bg font-bold rounded-xl text-sm hover:scale-[1.02] transition-all">
                    <Key className="w-4 h-4" />
                    Update Password
                  </button>
                </form>
              )}

              {activeTab === 'account' && (
                <div className="space-y-6">
                  <div className="p-8 rounded-[24px] bg-red-500/5 border border-red-500/10 space-y-4 max-w-xl">
                    <div className="flex items-center gap-3">
                      <Trash2 className="w-5 h-5 text-red-500" />
                      <h3 className="text-base font-semibold text-red-500">Delete Account</h3>
                    </div>
                    <p className="text-sm text-zinc-500 leading-relaxed">
                      Once you delete your account, there is no going back. Please be certain. All your matches, messages, and profile data will be permanently removed.
                    </p>
                    <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-widest mt-4">
                      Permanently Delete Account
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </DashboardContainer>
  );
};

export default SettingsPage;
