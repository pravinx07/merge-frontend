import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, Code2, Clock, CheckCircle,  Loader2, Play } from 'lucide-react';
import api from '../lib/axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Editor from '@monaco-editor/react';

interface Assessment {
  id: string;
  title: string;
  skill: string;
  description: string;
  timeLimitMinutes: number;
  language: string;
}

const AssessmentsPage = () => {
  const { user, checkAuth } = useAuth();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(null);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchAssessments();
  }, []);

  useEffect(() => {
    let timer: any;
    if (activeAssessment && timeLeft > 0 && !isSubmitting) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeAssessment, timeLeft, isSubmitting]);

  const fetchAssessments = async () => {
    try {
      const res = await api.get('/assessments');
      setAssessments(res.data);
    } catch (error) {
      toast.error('Failed to load assessments');
    } finally {
      setIsLoading(false);
    }
  };

  const startAssessment = (assessment: Assessment) => {
    if (user?.verifiedSkills?.includes(assessment.skill)) {
      toast.error('You are already verified for this skill!');
      return;
    }
    
    // In a real app, we'd check if they have attempts left or are Pro
    if (user?.plan !== 'pro') {
      // Free users get 1 per month logic could go here
      // Let's assume they have it for MVP
    }

    setActiveAssessment(assessment);
    setCode(`// Write your ${assessment.language} code here to solve the problem.\n\n`);
    setTimeLeft(assessment.timeLimitMinutes * 60);
  };

  const handleAutoSubmit = () => {
    if (activeAssessment) {
      toast.error("Time's up! Auto-submitting your code...");
      submitCode();
    }
  };

  const submitCode = async () => {
    if (!activeAssessment) return;
    setIsSubmitting(true);
    try {
      const res = await api.post(`/assessments/${activeAssessment.id}/submit`, { code });
      if (res.data.passed) {
        toast.success(`Congratulations! You passed the ${activeAssessment.skill} assessment!`);
        await checkAuth(); // Refresh user state to get new verifiedSkills
      } else {
        toast.error(`Assessment Failed: ${res.data.feedback}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit assessment');
    } finally {
      setIsSubmitting(false);
      setActiveAssessment(null);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#0A0A0B] p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
              </div>
              Verified Skill Assessments
            </h1>
            <p className="text-zinc-400 mt-2 text-sm">Pass coding challenges evaluated by MergeAI to earn Verified Expert badges.</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!activeAssessment ? (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {isLoading ? (
                <div className="col-span-full text-center text-zinc-500 py-10">Loading assessments...</div>
              ) : (
                assessments.map(assessment => {
                  const isVerified = user?.verifiedSkills?.includes(assessment.skill);
                  
                  return (
                    <div key={assessment.id} className={`bg-zinc-900/80 border ${isVerified ? 'border-amber-500/50' : 'border-zinc-800'} rounded-2xl p-6 flex flex-col relative overflow-hidden`}>
                      {isVerified && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black px-3 py-1 rounded-bl-xl flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" /> VERIFIED
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 mb-4">
                        <Code2 className={`w-6 h-6 ${isVerified ? 'text-amber-400' : 'text-zinc-400'}`} />
                        <h3 className="text-lg font-bold text-white">{assessment.title}</h3>
                      </div>
                      
                      <p className="text-sm text-zinc-400 mb-6 flex-1">{assessment.description}</p>
                      
                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500">
                          <Clock className="w-4 h-4" /> {assessment.timeLimitMinutes} mins
                        </div>
                        
                        <button 
                          onClick={() => startAssessment(assessment)}
                          disabled={isVerified}
                          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-transform ${isVerified ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-brand-cyan text-dark-bg hover:scale-105'}`}
                        >
                          {isVerified ? 'Completed' : <><Play className="w-3 h-3" /> Start Test</>}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-[700px] overflow-hidden"
            >
              <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-black text-white">{activeAssessment.title}</h2>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 font-mono font-bold px-3 py-1.5 rounded-lg border ${timeLeft < 180 ? 'text-red-400 border-red-400/30 bg-red-400/10 animate-pulse' : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'}`}>
                    <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                  </div>
                  <button onClick={() => setActiveAssessment(null)} className="text-xs text-zinc-500 hover:text-white transition-colors">Abort</button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 min-h-0">
                <div className="lg:col-span-1 border-r border-zinc-800 p-6 overflow-y-auto">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Task Description</h3>
                  <div className="prose prose-invert prose-p:text-sm prose-p:text-zinc-300">
                    <p>{activeAssessment.description}</p>
                    <p><strong>Language:</strong> {activeAssessment.language}</p>
                  </div>
                  
                  <div className="mt-8 bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-4">
                    <p className="text-xs text-brand-purple flex items-center gap-2 font-bold mb-2">
                      <Code2 className="w-4 h-4" /> MergeAI Evaluation
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      When you submit, MergeAI will analyze your code to determine if it meets the requirements. Make sure your logic is sound and there are no syntax errors.
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-2 flex flex-col bg-[#1e1e1e]">
                  <div className="flex-1 w-full relative pt-4">
                     <Editor
                        height="100%"
                        language={activeAssessment.language}
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          padding: { top: 16 },
                        }}
                      />
                  </div>
                  <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex justify-end">
                    <button
                      onClick={submitCode}
                      disabled={isSubmitting || !code.trim()}
                      className="bg-emerald-500 text-black px-8 py-3 rounded-xl font-black text-sm hover:brightness-110 disabled:opacity-50 flex items-center gap-2 transition-all"
                    >
                      {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</> : 'Submit Code for Verification'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default AssessmentsPage;
