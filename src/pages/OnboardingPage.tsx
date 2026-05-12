import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Rocket, Code, ArrowRight, ArrowLeft, Check, Loader2, Camera, MapPin, Briefcase } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const steps = [
  { id: 'identity', title: 'Identity', icon: User },
  { id: 'experience', title: 'Experience', icon: Briefcase },
  { id: 'skills', title: 'Skills & Interests', icon: Code },
  { id: 'intent', title: 'Intent', icon: Rocket },
];

const SKILLS_LIST = ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'Next.js', 'PostgreSQL', 'Docker', 'AWS', 'Solidity', 'AI/ML', 'Tailwind', 'Flutter', 'Swift'];
const INTERESTS_LIST = ['Open Source', 'Web3', 'SaaS', 'Fintech', 'Gaming', 'Mobile', 'Robotics', 'Cybersecurity', 'Design', 'Data Science'];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced', 'Senior', 'Tech Lead'];
const INTENTS_LIST = [
  { id: 'friendship', label: 'Friendship', desc: 'Looking to connect and hang out with other devs.' },
  { id: 'cofounder', label: 'Cofounder', desc: 'Looking for a serious partner for a startup.' },
  { id: 'collaboration', label: 'Collaboration', desc: 'Looking for project partners or open source contributors.' },
  { id: 'hackathon', label: 'Hackathon', desc: 'Finding teammates for upcoming competitions.' },
  { id: 'mentor', label: 'Mentor/Mentee', desc: 'Want to share knowledge or learn from others.' },
];

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [expLevel, setExpLevel] = useState('Intermediate');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedIntent, setSelectedIntent] = useState('');
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const toggleItem = (item: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter(i => i !== item) : [...list, item]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      formData.append('location', location);
      formData.append('experienceLevel', expLevel);
      formData.append('intent', selectedIntent);
      selectedSkills.forEach(s => formData.append('skills', s));
      selectedInterests.forEach(i => formData.append('interests', i));
      if (avatar) formData.append('avatar', avatar);

      await api.put('/users/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await checkAuth();
      navigate('/dashboard');
    } catch (err) {
      console.error('Onboarding error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-purple/20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-brand-cyan/10 blur-[120px] rounded-full"></div>

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5 z-50">
        <motion.div 
          initial={{ width: '0%' }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          className="h-full bg-linear-to-r from-brand-cyan to-brand-purple"
        />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 z-10">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-dark-card/50 backdrop-blur-xl border border-dark-border rounded-3xl p-6 md:p-8 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                  {(() => {
                    const Icon = steps[currentStep].icon;
                    return <Icon className="w-5 h-5" />;
                  })()}
                </div>
                <div>
                  <p className="text-[10px] font-bold text-brand-purple uppercase tracking-widest">Step {currentStep + 1} of {steps.length}</p>
                  <h1 className="text-2xl font-bold">{steps[currentStep].title}</h1>
                </div>
              </div>

              {currentStep === 0 && (
                <div className="space-y-6">
                  <div className="flex flex-col items-center">
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="group relative w-24 h-24 rounded-full bg-slate-900 border-2 border-dashed border-dark-border flex items-center justify-center cursor-pointer overflow-hidden hover:border-brand-cyan transition-all"
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-500 group-hover:text-brand-cyan transition-colors" />
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                        <span className="text-[10px] font-bold uppercase tracking-tighter">Change</span>
                      </div>
                    </div>
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
                    <p className="text-xs text-slate-500 mt-2 font-medium">Upload a profile picture</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-slate-500 flex items-center gap-2 mb-1.5 ml-1">
                        <MapPin className="w-3.5 h-3.5" /> Location
                      </label>
                      <input 
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-slate-900/50 border border-dark-border rounded-xl p-3 text-white text-sm focus:outline-none focus:border-brand-cyan/50 transition-all"
                        placeholder="City, Country"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-slate-500 mb-1.5 ml-1 block">Bio</label>
                      <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-slate-900/50 border border-dark-border rounded-xl p-3 text-white text-sm focus:outline-none focus:border-brand-cyan/50 transition-all min-h-[100px] resize-none"
                        placeholder="I build high-performance web apps..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400">Where are you in your developer journey?</p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {EXPERIENCE_LEVELS.map(level => (
                      <button
                        key={level}
                        onClick={() => setExpLevel(level)}
                        className={`px-4 py-3 rounded-xl border font-bold text-sm transition-all ${
                          expLevel === level
                            ? 'bg-brand-purple/10 border-brand-purple text-brand-purple'
                            : 'bg-white/5 border-dark-border text-slate-400 hover:border-slate-600'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {SKILLS_LIST.map(skill => (
                        <button
                          key={skill}
                          onClick={() => toggleItem(skill, selectedSkills, setSelectedSkills)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            selectedSkills.includes(skill)
                              ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan'
                              : 'bg-white/5 border-dark-border text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {skill}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Interests</h3>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS_LIST.map(interest => (
                        <button
                          key={interest}
                          onClick={() => toggleItem(interest, selectedInterests, setSelectedInterests)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                            selectedInterests.includes(interest)
                              ? 'bg-brand-purple/10 border-brand-purple text-brand-purple'
                              : 'bg-white/5 border-dark-border text-slate-400 hover:border-slate-600'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-3">
                  <p className="text-sm text-slate-400 mb-4">What are you looking for on Merge?</p>
                  <div className="grid gap-2">
                    {INTENTS_LIST.map(intent => (
                      <button
                        key={intent.id}
                        onClick={() => setSelectedIntent(intent.id)}
                        className={`text-left p-4 rounded-2xl border transition-all ${
                          selectedIntent === intent.id
                            ? 'bg-brand-cyan/10 border-brand-cyan'
                            : 'bg-white/5 border-dark-border hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-0.5">
                          <h3 className="font-bold text-base">{intent.label}</h3>
                          {selectedIntent === intent.id && <div className="w-5 h-5 rounded-full bg-brand-cyan flex items-center justify-center shadow-[0_0_15px_rgba(0,229,255,0.4)]"><Check className="w-3 h-3 text-dark-bg" /></div>}
                        </div>
                        <p className="text-xs text-slate-400">{intent.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-dark-border">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors disabled:opacity-0`}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={isLoading || (currentStep === 3 && !selectedIntent)}
                  className="px-8 py-3 bg-brand-cyan text-dark-bg rounded-xl font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:translate-y-0 text-sm"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : currentStep === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
                  {!isLoading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
