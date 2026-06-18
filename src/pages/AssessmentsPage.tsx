import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Code2,
  Clock,
  CheckCircle,
  Loader2,
  Play,
} from "lucide-react";
import api from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import Editor from "@monaco-editor/react";
import { DashboardContainer } from "../components/DashboardComponents";

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
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(
    null,
  );
  const [customSkill, setCustomSkill] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [evaluationResult, setEvaluationResult] = useState<{passed: boolean, feedback: string} | null>(null);

  useEffect(() => {
    let timer: any;
    if (activeAssessment && timeLeft > 0 && !isSubmitting && !evaluationResult?.passed) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [activeAssessment, timeLeft, isSubmitting, evaluationResult]);

  const generateNewAssessment = async () => {
    if (!customSkill.trim()) {
      toast.error("Please enter a skill");
      return;
    }
    if (user?.verifiedSkills?.includes(customSkill)) {
      toast.error("You are already verified for this skill!");
      return;
    }
    setIsGenerating(true);
    try {
      const res = await api.post("/assessments/generate", {
        skill: customSkill,
      });
      setActiveAssessment(res.data);
      setCode(
        `// Write your ${res.data.language} code here to solve the problem.\n\n`,
      );
      setTimeLeft(res.data.timeLimitMinutes * 60);
      setCustomSkill("");
      setEvaluationResult(null);
    } catch (error) {
      toast.error("Failed to generate assessment");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutoSubmit = () => {
    if (activeAssessment) {
      toast.error("Time's up! Auto-submitting your code...");
      submitCode();
    }
  };

  const submitCode = async () => {
    if (!activeAssessment) return;
    
    const defaultComment = `// Write your ${activeAssessment.language} code here to solve the problem.`;
    if (!code.trim() || code.trim() === defaultComment) {
      toast.error("Please write some code before submitting. Empty submissions are not allowed.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.post(`/assessments/submit`, {
        skill: activeAssessment.skill,
        description: activeAssessment.description,
        language: activeAssessment.language,
        code,
      });
      
      setEvaluationResult(res.data);
      
      if (res.data.passed) {
        toast.success(
          `Congratulations! You passed the ${activeAssessment.skill} assessment!`,
        );
        await checkAuth(); // Refresh user state to get new verifiedSkills
      } else {
        toast.error(`Assessment Failed`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <DashboardContainer>
      <div className={`mx-auto ${!activeAssessment ? 'max-w-5xl space-y-8' : ''}`}>
        {/* Header section (only for generated state) */}
        {!activeAssessment && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                </div>
                Verified Skill Assessments
              </h1>
              <p className="text-zinc-400 mt-2 text-sm">
                Pass coding challenges evaluated by MergeAI to earn Verified
                Expert badges.
              </p>
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {!activeAssessment ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 md:p-6 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-purple" />
                <div className="flex-1">
                  <h2 className="text-lg font-black text-white mb-1.5">
                    Generate Custom Assessment
                  </h2>
                  <p className="text-xs text-zinc-400 mb-4">
                    Type any skill, framework, or language. MergeAI will
                    generate a custom 15-minute challenge to verify your
                    expertise.
                  </p>

                  <div className="flex items-center gap-3 w-full max-w-lg">
                    <input
                      type="text"
                      placeholder="e.g. React, Python, PostgreSQL, AWS..."
                      value={customSkill}
                      onChange={(e) => setCustomSkill(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-brand-cyan rounded-xl px-4 py-2.5 text-sm text-white outline-none transition-colors"
                    />
                    <button
                      onClick={generateNewAssessment}
                      disabled={isGenerating || !customSkill.trim()}
                      className="bg-brand-cyan text-dark-bg px-6 py-2.5 rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-all"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Generating...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" /> Start
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="hidden md:flex w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 items-center justify-center">
                  <Code2 className="w-8 h-8 text-zinc-500" />
                </div>
              </div>

              {user?.verifiedSkills && user.verifiedSkills.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-emerald-400" /> Your
                    Verified Badges
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {user.verifiedSkills.map((skill: string) => (
                      <div
                        key={skill}
                        className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold text-sm flex items-center gap-2"
                      >
                        <ShieldCheck className="w-4 h-4" /> {skill}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[#0A0A0B] flex flex-col p-4 md:p-6"
            >
              {/* Top Navigation Bar */}
              <div className="flex items-center justify-between mb-4 px-2">
                <div className="flex items-center gap-2 text-sm font-bold">
                  <span className="text-zinc-500">Assessments</span>
                  <span className="text-zinc-600">&gt;</span>
                  <span className="text-white flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-brand-purple" />
                    {activeAssessment.title}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`flex items-center gap-2 font-mono font-bold px-4 py-2 rounded-full border ${timeLeft < 180 ? "text-red-400 border-red-400/30 bg-red-400/10 animate-pulse" : "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"}`}>
                    <Clock className="w-4 h-4" /> Time Left {formatTime(timeLeft)}
                  </div>
                  <button
                    onClick={() => {
                      setActiveAssessment(null);
                      setEvaluationResult(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-red-400 hover:text-red-300 border border-red-500/30 hover:bg-red-500/10 rounded-full transition-all"
                  >
                    Abort Assessment
                  </button>
                </div>
              </div>

              {/* 3-Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0 h-0">
                
                {/* Left Column - Description */}
                <div className="lg:col-span-3 flex flex-col gap-4 min-h-0 overflow-y-auto pr-2 custom-scrollbar">
                  <div className="bg-[#111114] border border-white/5 rounded-2xl p-5">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-12 h-12 rounded-xl bg-brand-purple/10 border border-brand-purple/20 flex items-center justify-center shrink-0">
                        <ShieldCheck className="w-6 h-6 text-brand-purple" />
                      </div>
                      <div>
                        <h2 className="text-base font-black text-white">{activeAssessment.title}</h2>
                        <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                          Solve the problem on the right to earn the Verified <strong className="text-brand-purple">{activeAssessment.skill}</strong> badge.
                        </p>
                      </div>
                    </div>
                    
                    {/* Steps Indicator */}
                    <div className="flex items-center justify-between px-2 relative mb-2">
                      <div className="absolute left-6 right-6 top-1/2 h-0.5 bg-white/5 -z-10 -translate-y-1/2" />
                      {[
                        { num: 1, label: 'Problem', active: true },
                        { num: 2, label: 'Code', active: true },
                        { num: 3, label: 'Review', active: evaluationResult !== null },
                        { num: 4, label: 'Result', active: evaluationResult !== null }
                      ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-2">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${step.active ? 'bg-brand-purple text-white shadow-[0_0_10px_rgba(168,85,247,0.4)]' : 'bg-zinc-800 text-zinc-500 border border-white/5'}`}>
                            {step.num}
                          </div>
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${step.active ? 'text-brand-purple' : 'text-zinc-600'}`}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#111114] border border-white/5 rounded-2xl p-5 flex-1">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-4 pb-4 border-b border-white/5">
                      <span className="w-4 h-5 border border-zinc-600 rounded-sm flex items-center justify-center text-[8px] text-zinc-400">📄</span>
                      Problem Description
                    </h3>
                    <div className="prose prose-invert prose-p:text-sm prose-p:text-zinc-300 prose-p:leading-relaxed prose-ol:text-sm prose-ol:text-zinc-300 prose-li:mb-2">
                      <p className="whitespace-pre-wrap">{activeAssessment.description}</p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-white/5">
                      <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Language</h4>
                      <div className="flex items-center gap-2 text-xs font-bold text-zinc-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2 w-fit">
                        <span className="text-yellow-400 font-black text-sm">{'{JS}'}</span> {activeAssessment.language}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Middle Column - Editor */}
                <div className="lg:col-span-6 flex flex-col gap-4 min-h-0">
                  <div className="flex-1 bg-[#111114] border border-white/5 rounded-2xl overflow-hidden flex flex-col shadow-2xl relative min-h-0">
                    {/* Editor Header */}
                    <div className="flex items-center justify-between bg-zinc-950/50 border-b border-white/5 px-4 h-12 shrink-0">
                      <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/5 border border-white/5 rounded-t-lg px-4 h-full pt-1">
                        <Code2 className="w-3.5 h-3.5 text-zinc-400" />
                        solution.{activeAssessment.language.toLowerCase() === 'javascript' ? 'js' : activeAssessment.language.toLowerCase() === 'python' ? 'py' : 'txt'}
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan ml-1" />
                      </div>
                    </div>
                    
                    {/* Editor Area */}
                    <div className="flex-1 relative bg-[#0d0d0f] pt-4 min-h-0">
                      <Editor
                        height="100%"
                        language={activeAssessment.language}
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val || "")}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          padding: { top: 0 },
                          scrollBeyondLastLine: false,
                          lineHeight: 24,
                        }}
                      />
                    </div>
                    
                    {/* Editor Footer / Info Box */}
                    <div className="p-4 border-t border-white/5 bg-zinc-950/50 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
                      <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center text-[10px]">i</span>
                        Write your code above to get started.
                      </div>
                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all flex items-center gap-2 border border-white/5">
                          <Play className="w-3.5 h-3.5" /> Run Code
                        </button>
                        <button
                          onClick={submitCode}
                          disabled={isSubmitting || !code.trim() || code.trim() === `// Write your ${activeAssessment?.language} code here to solve the problem.`}
                          className="bg-brand-purple text-white px-6 py-2 rounded-xl font-black text-xs hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]"
                        >
                          {isSubmitting ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Evaluating...</>
                          ) : (
                            <><Play className="w-3.5 h-3.5" /> Submit Code for Review</>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Guidelines Box */}
                  <div className="bg-[#111114] border border-white/5 rounded-2xl p-5 shrink-0">
                    <h4 className="text-xs font-black text-white mb-4">Submission Guidelines</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { type: 'Do', text: 'Write clean, efficient and working code.', icon: '✓', color: 'text-emerald-400' },
                        { type: 'Do', text: 'Use functional components and hooks if React.', icon: '✓', color: 'text-amber-400' },
                        { type: 'Don\'t', text: 'Use external libraries unless specified.', icon: '✕', color: 'text-red-400' },
                        { type: 'Don\'t', text: 'Modify the hardcoded initial data structures.', icon: '✕', color: 'text-red-400' }
                      ].map((g, i) => (
                        <div key={i} className="bg-zinc-950/50 border border-white/5 rounded-xl p-3">
                          <div className={`flex items-center gap-1.5 text-xs font-black mb-1.5 ${g.color}`}>
                            <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-[10px]">{g.icon}</span>
                            {g.type}
                          </div>
                          <p className="text-[10px] text-zinc-400 leading-snug">{g.text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column - Result */}
                <div className="lg:col-span-3 flex flex-col min-h-0">
                  <div className="flex-1 bg-[#111114] border border-white/5 rounded-2xl p-6 flex flex-col relative overflow-hidden">
                    <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2 mb-6 shrink-0">
                      <Code2 className="w-4 h-4 text-zinc-500" /> Result
                    </h3>
                    
                    <div className="flex-1 flex flex-col items-center justify-center text-center">
                      {!evaluationResult ? (
                        <>
                          <div className="w-24 h-24 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center mb-6 relative">
                            <div className="absolute inset-2 border-2 border-dashed border-zinc-600 rounded-xl" />
                            <span className="text-3xl">🔍</span>
                          </div>
                          <h4 className="text-sm font-black text-white mb-2">Your result will appear here</h4>
                          <p className="text-xs text-zinc-500 max-w-[200px] leading-relaxed">
                            Submit your code to see the evaluation and feedback from MergeAI.
                          </p>
                        </>
                      ) : (
                        <div className="w-full flex flex-col items-center">
                          {evaluationResult.passed ? (
                            <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/50 flex items-center justify-center mb-4">
                              <CheckCircle className="w-10 h-10 text-emerald-400" />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/50 flex items-center justify-center mb-4">
                              <X className="w-10 h-10 text-red-400" />
                            </div>
                          )}
                          <h4 className={`text-lg font-black mb-2 ${evaluationResult.passed ? 'text-emerald-400' : 'text-red-400'}`}>
                            {evaluationResult.passed ? 'Assessment Passed!' : 'Assessment Failed'}
                          </h4>
                          <div className="w-full text-left bg-zinc-950 border border-white/5 rounded-xl p-4 mt-4 overflow-y-auto max-h-[300px] custom-scrollbar">
                            <p className="text-xs text-zinc-300 leading-relaxed font-mono whitespace-pre-wrap">
                              {evaluationResult.feedback}
                            </p>
                          </div>
                          {evaluationResult.passed && (
                            <button
                              onClick={() => {
                                setActiveAssessment(null);
                                setEvaluationResult(null);
                              }}
                              className="mt-6 w-full bg-emerald-500 text-black px-6 py-2.5 rounded-xl font-black text-xs hover:brightness-110 transition-all"
                            >
                              Return to Dashboard
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardContainer>
  );
};

export default AssessmentsPage;
