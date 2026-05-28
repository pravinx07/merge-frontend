import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Shield, Trash2, Camera, 
  Save, ChevronRight, ChevronDown,
  Briefcase, Key, Ban,
  Loader2
} from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../components/LoadingSkeleton';
import { DashboardContainer } from '../components/DashboardComponents';

const GitHubIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);


const LinkedInIcon = (props: any) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" />
  </svg>
);

const CustomSelect = ({ value, onChange, options, label }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; label: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="space-y-2">
      <label className="text-xs font-semibold text-zinc-400 ml-1">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl py-3 px-4 text-sm text-white flex items-center justify-between focus:outline-none focus:border-brand-cyan/50 transition-all"
        >
          <span className={!value ? 'text-zinc-500' : ''}>{options.find(o => o.value === value)?.label || `Select ${label}`}</span>
          <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isOpen && (
            <>
              <div className="fixed inset-0 z-[80]" onClick={() => setIsOpen(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[90] overflow-hidden"
              >
                {options.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-3 text-sm text-left hover:bg-white/5 transition-colors ${
                      value === opt.value ? 'text-brand-cyan bg-brand-cyan/5' : 'text-zinc-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const SettingsPage = () => {
  const { user, setUser, isLoading: isAuthLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'professional' | 'security' | 'account'>('profile');
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isBlockedUsersModalOpen, setIsBlockedUsersModalOpen] = useState(false);
  const [blockedUsers, setBlockedUsers] = useState<any[]>([]);
  
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    const toastId = toast.loading('Deleting account...');
    try {
      await api.delete('/users');
      setUser(null);
      toast.success('Account deleted successfully!', { id: toastId });
      setIsDeleteModalOpen(false);
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account', { id: toastId });
    } finally {
      setIsDeletingAccount(false);
    }
  };
  
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
      setIsInitialLoading(false);
    }
  }, [user]);

  const [isConnectingGithub, setIsConnectingGithub] = useState(false);
  const [githubUsernameInput, setGithubUsernameInput] = useState('');
  const [showGithubModal, setShowGithubModal] = useState(false);

  const handleConnectGithub = async () => {
    if (!githubUsernameInput) return toast.error('Please enter a GitHub username');
    setIsConnectingGithub(true);
    const toastId = toast.loading('Connecting to GitHub...');
    try {
      const res = await api.post('/github/connect', { username: githubUsernameInput });
      setUser(res.data.user);
      toast.success('GitHub connected successfully!', { id: toastId });
      setShowGithubModal(false);
      setGithubUsernameInput('');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to connect GitHub', { id: toastId });
    } finally {
      setIsConnectingGithub(false);
    }
  };

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

  const fetchBlockedUsers = async () => {
    try {
      const res = await api.get('/users/blocked');
      setBlockedUsers(res.data);
      setIsBlockedUsersModalOpen(true);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load blocked users');
    }
  };

  const handleUnblock = async (userId: string) => {
    try {
      await api.post('/users/unblock', { userId });
      setBlockedUsers(blockedUsers.filter(u => u.id !== userId));
      toast.success('User unblocked successfully');
    } catch (err) {
      console.error(err);
      toast.error('Failed to unblock user');
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
        <div className="flex-1 bg-zinc-900/20 border border-zinc-800/50 rounded-[32px] p-6 lg:p-10 shadow-xl relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
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
                    <CustomSelect 
                      label="Personality"
                      value={formData.personality}
                      onChange={(v) => setFormData({...formData, personality: v})}
                      options={[
                        { value: 'AI Builder', label: 'AI Builder' },
                        { value: 'Startup Enthusiast', label: 'Startup Enthusiast' },
                        { value: 'Night Owl Coder', label: 'Night Owl Coder' },
                        { value: 'Open Source Warrior', label: 'Open Source Warrior' },
                      ]}
                    />
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
                <div className="space-y-8">
                  <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl p-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-16 bg-brand-cyan/5 rounded-bl-full -z-10 blur-3xl"></div>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                          <GitHubIcon className="w-5 h-5" />
                          Developer Identity
                          {user?.githubVerified && <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded-full flex items-center gap-1 border border-green-500/20">✓ Verified</span>}
                        </h3>
                        <p className="text-sm text-zinc-400 mt-1 max-w-md">
                          {user?.githubVerified 
                            ? `Connected as ${user?.githubData?.username}. Your GitHub stats are visible on your profile.` 
                            : 'Connect your GitHub to display your top repositories, languages, and contributions to build trust.'}
                        </p>
                      </div>
                      <button
                        onClick={() => user?.githubVerified ? null : setShowGithubModal(true)}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                          user?.githubVerified 
                            ? 'bg-zinc-800 text-zinc-400 cursor-default' 
                            : 'bg-brand-cyan text-dark-bg hover:scale-[1.02] shadow-lg shadow-brand-cyan/20'
                        }`}
                      >
                        {user?.githubVerified ? 'Connected' : 'Connect GitHub'}
                      </button>
                    </div>
                  </div>

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
                    <CustomSelect 
                      label="Experience Level"
                      value={formData.experienceLevel}
                      onChange={(v) => setFormData({...formData, experienceLevel: v})}
                      options={[
                        { value: 'Junior', label: 'Junior' },
                        { value: 'Intermediate', label: 'Intermediate' },
                        { value: 'Senior', label: 'Senior' },
                      ]}
                    />
                    <CustomSelect 
                      label="Looking For"
                      value={formData.intent}
                      onChange={(v) => setFormData({...formData, intent: v})}
                      options={[
                        { value: 'Cofounder', label: 'Cofounder' },
                        { value: 'Collaboration', label: 'Collaboration' },
                        { value: 'Networking', label: 'Networking' },
                      ]}
                    />
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
              </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8 max-w-xl">
                  <form onSubmit={handleChangePassword} className="space-y-6">
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
                  
                  <div className="pt-8 border-t border-zinc-800/50">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-semibold text-white">Blocked Users</h3>
                        <p className="text-sm text-zinc-500 mt-1">Manage developers you have blocked. They cannot interact with you.</p>
                      </div>
                      <button 
                        onClick={fetchBlockedUsers}
                        className="shrink-0 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-2"
                      >
                        <Ban className="w-4 h-4" /> Manage Blocks
                      </button>
                    </div>
                  </div>
                </div>
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
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="px-6 py-3 bg-red-500 hover:bg-red-650 text-white font-bold rounded-xl transition-all text-xs uppercase tracking-widest mt-4 cursor-pointer"
                    >
                      Permanently Delete Account
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* GitHub Connect Modal */}
      <AnimatePresence>
        {showGithubModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowGithubModal(false)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <h3 className="text-xl font-bold text-white mb-2">Connect GitHub</h3>
              <p className="text-sm text-zinc-400 mb-6">Enter your GitHub username to sync your developer profile.</p>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="GitHub Username (e.g. torvalds)"
                  value={githubUsernameInput}
                  onChange={(e) => setGithubUsernameInput(e.target.value)}
                  className="w-full bg-zinc-800/50 border border-zinc-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-brand-cyan transition-all"
                  autoFocus
                />
                
                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setShowGithubModal(false)}
                    className="flex-1 px-4 py-3 bg-zinc-800 text-white font-bold rounded-xl hover:bg-zinc-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConnectGithub}
                    disabled={isConnectingGithub || !githubUsernameInput}
                    className="flex-1 px-4 py-3 bg-brand-cyan text-dark-bg font-bold rounded-xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isConnectingGithub ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitHubIcon className="w-4 h-4" />}
                    {isConnectingGithub ? 'Connecting...' : 'Connect'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Blocked Users Modal */}
      <AnimatePresence>
        {isBlockedUsersModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsBlockedUsersModalOpen(false)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-900 border border-zinc-800 rounded-[32px] w-full max-w-md p-8 shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Ban className="w-5 h-5 text-red-500" /> Blocked Users
                </h3>
                <button onClick={() => setIsBlockedUsersModalOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>
              
              <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                {blockedUsers.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 text-sm font-medium">You haven't blocked anyone yet.</div>
                ) : (
                  blockedUsers.map(u => (
                    <div key={u.id} className="flex items-center justify-between p-3 rounded-2xl bg-zinc-800/50 border border-zinc-700/50">
                      <div className="flex items-center gap-3">
                        <img src={u.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`} alt={u.name} className="w-10 h-10 rounded-full bg-zinc-800" />
                        <div>
                          <div className="text-sm font-bold text-white">{u.name}</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleUnblock(u.id)}
                        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 transition-all border border-white/10"
                      >
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsDeleteModalOpen(false)}></div>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-zinc-950 border border-red-500/20 rounded-[32px] w-full max-w-md p-8 shadow-2xl z-10 flex flex-col"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                  <Trash2 className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">Delete Account?</h3>
                  <p className="text-xs text-red-400 font-bold mt-0.5">This action is irreversible</p>
                </div>
              </div>

              <p className="text-sm text-zinc-400 leading-relaxed mb-8">
                Are you absolutely sure you want to permanently delete your account? All of your profile data, projects, matches, and messages will be deleted immediately.
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 px-4 py-3.5 bg-zinc-900 border border-white/5 text-white font-bold rounded-xl hover:bg-zinc-800 transition-all cursor-pointer text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeletingAccount}
                  className="flex-1 px-4 py-3.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all cursor-pointer flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/20"
                >
                  {isDeletingAccount ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Account'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardContainer>
  );
};

export default SettingsPage;
