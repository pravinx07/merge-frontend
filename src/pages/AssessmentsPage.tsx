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
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeAssessment, setActiveAssessment] = useState<Assessment | null>(
    null,
  );
  const [customSkill, setCustomSkill] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
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
  }, [activeAssessment, timeLeft, isSubmitting]);

  const fetchAssessments = async () => {
    try {
      const res = await api.get("/assessments");
      setAssessments(res.data);
    } catch (error) {
      toast.error("Failed to load assessments");
    } finally {
      setIsLoading(false);
    }
  };

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
    setIsSubmitting(true);
    try {
      const res = await api.post(`/assessments/submit`, {
        skill: activeAssessment.skill,
        description: activeAssessment.description,
        language: activeAssessment.language,
        code,
      });
      if (res.data.passed) {
        toast.success(
          `Congratulations! You passed the ${activeAssessment.skill} assessment!`,
        );
        await checkAuth(); // Refresh user state to get new verifiedSkills
      } else {
        toast.error(`Assessment Failed: ${res.data.feedback}`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to submit assessment");
    } finally {
      setIsSubmitting(false);
      setActiveAssessment(null);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <DashboardContainer>
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
            <p className="text-zinc-400 mt-2 text-sm">
              Pass coding challenges evaluated by MergeAI to earn Verified
              Expert badges.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!activeAssessment ? (
            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-cyan to-brand-purple" />
                <div className="flex-1">
                  <h2 className="text-xl font-black text-white mb-2">
                    Generate Custom Assessment
                  </h2>
                  <p className="text-sm text-zinc-400 mb-6">
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
                      className="flex-1 bg-zinc-950 border border-zinc-800 focus:border-brand-cyan rounded-xl px-4 py-3 text-sm text-white outline-none transition-colors"
                    />
                    <button
                      onClick={generateNewAssessment}
                      disabled={isGenerating || !customSkill.trim()}
                      className="bg-brand-cyan text-dark-bg px-6 py-3 rounded-xl font-bold text-sm hover:brightness-110 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap transition-all"
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
                <div className="hidden md:flex w-32 h-32 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 items-center justify-center">
                  <Code2 className="w-12 h-12 text-zinc-500" />
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-[700px] overflow-hidden"
            >
              <div className="p-5 border-b border-zinc-800 bg-zinc-950 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-black text-white">
                    {activeAssessment.title}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  <div
                    className={`flex items-center gap-2 font-mono font-bold px-3 py-1.5 rounded-lg border ${timeLeft < 180 ? "text-red-400 border-red-400/30 bg-red-400/10 animate-pulse" : "text-emerald-400 border-emerald-400/30 bg-emerald-400/10"}`}
                  >
                    <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
                  </div>
                  <button
                    onClick={() => setActiveAssessment(null)}
                    className="text-xs text-zinc-500 hover:text-white transition-colors"
                  >
                    Abort
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 flex-1 min-h-0">
                <div className="lg:col-span-1 border-r border-zinc-800 p-6 overflow-y-auto">
                  <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">
                    Task Description
                  </h3>
                  <div className="prose prose-invert prose-p:text-sm prose-p:text-zinc-300">
                    <p>{activeAssessment.description}</p>
                    <p>
                      <strong>Language:</strong> {activeAssessment.language}
                    </p>
                  </div>

                  <div className="mt-8 bg-brand-purple/10 border border-brand-purple/20 rounded-xl p-4">
                    <p className="text-xs text-brand-purple flex items-center gap-2 font-bold mb-2">
                      <Code2 className="w-4 h-4" /> MergeAI Evaluation
                    </p>
                    <p className="text-[10px] text-zinc-400">
                      When you submit, MergeAI will analyze your code to
                      determine if it meets the requirements. Make sure your
                      logic is sound and there are no syntax errors.
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
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />{" "}
                          Evaluating...
                        </>
                      ) : (
                        "Submit Code for Verification"
                      )}
                    </button>
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
