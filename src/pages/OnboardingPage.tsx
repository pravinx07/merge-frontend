import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Rocket, Code, Heart, ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';

const steps = [
  { id: 'identity', title: 'Identity', icon: User },
  { id: 'skills', title: 'Skills', icon: Code },
  { id: 'goal', title: 'Goal', icon: Rocket },
];

const SKILLS_LIST = ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Rust', 'Next.js', 'PostgreSQL', 'Docker', 'AWS', 'Solidity', 'AI/ML'];
const ROLES_LIST = [
  { id: 'teammate', label: 'Find Teammates', desc: 'Looking to join an existing project.' },
  { id: 'cofounder', label: 'Find a Co-founder', desc: 'Building something new and need a partner.' },
  { id: 'mentor', label: 'Mentor Others', desc: 'Want to share knowledge with builders.' },
  { id: 'friend', label: 'Make Friends', desc: 'Just want to connect with other developers.' },
];

const OnboardingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [bio, setBio] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await api.put('/users/profile', {
        bio,
        skills: selectedSkills,
        role: selectedRole,
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
              className="bg-dark-card/50 backdrop-blur-xl border border-dark-border rounded-[40px] p-8 md:p-12 shadow-2xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-2xl bg-brand-purple/10 flex items-center justify-center text-brand-purple">
                  {(() => {
                    const Icon = steps[currentStep].icon;
                    return <Icon className="w-6 h-6" />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-bold text-brand-purple uppercase tracking-widest">Step {currentStep + 1} of 3</p>
                  <h1 className="text-3xl font-bold">{steps[currentStep].title}</h1>
                </div>
              </div>

              {currentStep === 0 && (
                <div className="space-y-6">
                  <p className="text-slate-400">Tell us a bit about yourself. This will be shown on your profile.</p>
                  <div>
                    <label className="block text-sm font-medium text-slate-500 mb-3 ml-1">Your Bio</label>
                    <textarea 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-slate-900/50 border border-dark-border rounded-2xl p-4 text-white focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/20 transition-all min-h-[150px] resize-none"
                      placeholder="I build high-performance web apps and love exploring new technologies..."
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  <p className="text-slate-400">What are your core strengths? Choose as many as you like.</p>
                  <div className="flex flex-wrap gap-3">
                    {SKILLS_LIST.map(skill => (
                      <button
                        key={skill}
                        onClick={() => toggleSkill(skill)}
                        className={`px-6 py-3 rounded-xl border font-medium transition-all ${
                          selectedSkills.includes(skill)
                            ? 'bg-brand-cyan/10 border-brand-cyan text-brand-cyan'
                            : 'bg-white/5 border-dark-border text-slate-400 hover:border-slate-600 hover:text-white'
                        }`}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <p className="text-slate-400">Why are you joining Merge? We'll use this to find your best matches.</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {ROLES_LIST.map(role => (
                      <button
                        key={role.id}
                        onClick={() => setSelectedRole(role.id)}
                        className={`text-left p-6 rounded-2xl border transition-all ${
                          selectedRole === role.id
                            ? 'bg-brand-purple/10 border-brand-purple'
                            : 'bg-white/5 border-dark-border hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-white">{role.label}</h3>
                          {selectedRole === role.id && <div className="w-5 h-5 rounded-full bg-brand-purple flex items-center justify-center"><Check className="w-3 h-3 text-white" /></div>}
                        </div>
                        <p className="text-sm text-slate-400 leading-relaxed">{role.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between mt-12 pt-8 border-t border-dark-border">
                <button
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className={`flex items-center gap-2 text-slate-400 hover:text-white transition-colors disabled:opacity-0`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <button
                  onClick={handleNext}
                  disabled={isLoading || (currentStep === 2 && !selectedRole)}
                  className="px-8 py-4 bg-brand-cyan text-dark-bg rounded-2xl font-bold shadow-[0_0_20px_rgba(0,229,255,0.3)] hover:-translate-y-1 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:translate-y-0"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : currentStep === steps.length - 1 ? 'Finish Setup' : 'Continue'}
                  {!isLoading && <ArrowRight className="w-5 h-5" />}
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
