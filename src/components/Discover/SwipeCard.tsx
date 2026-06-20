import { motion, useMotionValue, useTransform } from 'framer-motion';
import type { PanInfo } from 'framer-motion';
import { MapPin, Eye, Sparkles, Code } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MatchReason {
  icon: string;
  label: string;
  category: string;
}

interface SwipeCardProps {
  developer: any;
  onSwipe: (direction: 'left' | 'right') => void;
  isTop: boolean;
}

/* ─────────────────────────────────────────────────
   Score helpers
───────────────────────────────────────────────── */
const getScoreMeta = (s: number) => {
  if (s >= 80) return {
    color: '#00e5ff', textCls: 'text-[#00e5ff]',
    bgCls: 'bg-[#00e5ff]/10', borderCls: 'border-[#00e5ff]/25',
    glowCard: 'shadow-[0_0_40px_rgba(0,229,255,0.15)]',
    heroGrad: 'from-[#00e5ff]/30 via-[#00e5ff]/8',
    label: 'Elite Match', emoji: '🔥',
  };
  if (s >= 60) return {
    color: '#7c3aed', textCls: 'text-violet-400',
    bgCls: 'bg-violet-500/10', borderCls: 'border-violet-500/25',
    glowCard: 'shadow-[0_0_40px_rgba(124,58,237,0.18)]',
    heroGrad: 'from-violet-600/30 via-violet-600/8',
    label: 'Strong Match', emoji: '⚡',
  };
  if (s >= 35) return {
    color: '#f59e0b', textCls: 'text-amber-400',
    bgCls: 'bg-amber-400/10', borderCls: 'border-amber-400/25',
    glowCard: 'shadow-[0_0_40px_rgba(245,158,11,0.15)]',
    heroGrad: 'from-amber-500/25 via-amber-500/8',
    label: 'Good Match', emoji: '✨',
  };
  // score == 0 → subtle but visible
  return {
    color: '#3f3f46', textCls: 'text-zinc-500',
    bgCls: 'bg-zinc-800/50', borderCls: 'border-zinc-700/50',
    glowCard: '',
    heroGrad: 'from-zinc-700/40 via-zinc-800/10',
    label: '', emoji: '',
  };
};

/* ─────────────────────────────────────────────────
   Score pill (only shown when score > 0)
───────────────────────────────────────────────── */
const ScorePill = ({ score }: { score: number }) => {
  const m = getScoreMeta(score);
  const r = 16, c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;

  return (
    <div className={`flex items-center gap-2 px-2.5 py-1.5 rounded-2xl border ${m.bgCls} ${m.borderCls} backdrop-blur-md`}>
      {/* tiny ring */}
      <div className="relative w-7 h-7 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="3" />
          <motion.circle
            cx="18" cy="18" r={r} fill="none" stroke={m.color}
            strokeWidth="3" strokeLinecap="round"
            strokeDasharray={c}
            initial={{ strokeDashoffset: c }}
            animate={{ strokeDashoffset: off }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.2 }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-[8px] font-black ${m.textCls}`}>
          {score}
        </span>
      </div>
      <div className="leading-none">
        <p className={`text-[11px] font-black ${m.textCls}`}>{score}%</p>
        <p className={`text-[9px] font-bold ${m.textCls} opacity-70`}>{m.label}</p>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────
   Back card (ghost stack behind)
───────────────────────────────────────────────── */
const BackCard = () => (
  <div className="absolute inset-0 pointer-events-none">
    <div className="absolute inset-x-3 top-2 bottom-0 bg-zinc-900/50 border border-zinc-800/40 rounded-[28px]" />
    <div className="absolute inset-x-6 top-4 bottom-0 bg-zinc-900/25 border border-zinc-800/20 rounded-[28px]" />
  </div>
);

/* ─────────────────────────────────────────────────
   MAIN SWIPE CARD
───────────────────────────────────────────────── */
const SwipeCard = ({ developer, onSwipe, isTop }: SwipeCardProps) => {
  const x       = useMotionValue(0);
  const rotate  = useTransform(x, [-220, 220], [-12, 12]);
  const opacity = useTransform(x, [-200, -100, 0, 100, 200], [0, 1, 1, 1, 0]);
  const heartOp = useTransform(x, [30, 120], [0, 1]);
  const skipOp  = useTransform(x, [-30, -120], [0, 1]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if      (info.offset.x >  100) onSwipe('right');
    else if (info.offset.x < -100) onSwipe('left');
  };

  if (!isTop) return <BackCard />;

  const reasons: MatchReason[] = developer.matchReasons || [];
  const score: number          = developer.compatibilityScore ?? 0;
  const hasScore               = score > 0;
  const meta                   = getScoreMeta(score);

  // Prefer real avatar, then DiceBear with the user's name
  const avatarUrl = developer.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(developer.name || 'user')}&backgroundColor=transparent`;

  const skills: string[] = developer.skills || [];

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.08}
      onDragEnd={handleDragEnd}
      whileDrag={{ scale: 1.02 }}
      className={`absolute inset-0 z-20 cursor-grab active:cursor-grabbing bg-[#111115] border border-zinc-800/80 rounded-[28px] overflow-hidden flex flex-col ${meta.glowCard}`}
    >
      {/* ── Swipe stamps ── */}
      <motion.div style={{ opacity: heartOp }}
        className="absolute top-5 right-5 z-50 px-4 py-2 bg-emerald-500/15 border-2 border-emerald-400 rounded-2xl rotate-[13deg] pointer-events-none"
      >
        <span className="text-emerald-400 font-black text-xl tracking-wider">MATCH ❤️</span>
      </motion.div>
      <motion.div style={{ opacity: skipOp }}
        className="absolute top-5 left-5 z-50 px-4 py-2 bg-red-500/15 border-2 border-red-400 rounded-2xl -rotate-[13deg] pointer-events-none"
      >
        <span className="text-red-400 font-black text-xl tracking-wider">PASS 👋</span>
      </motion.div>

      {/* ═══════════════════════════════════════
          HERO — full-width gradient with avatar
      ═══════════════════════════════════════ */}
      <div className={`relative flex-shrink-0 h-[140px] bg-gradient-to-b ${meta.heroGrad} to-[#111115]`}>
        {/* decorative orb */}
        {hasScore && (
          <div
            className="absolute top-[-40px] left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ background: meta.color }}
          />
        )}

        {/* Score pill — top-right */}
        {hasScore && (
          <div className="absolute top-4 right-4 z-10">
            <ScorePill score={score} />
          </div>
        )}

        {/* "New" badge when no score */}
        {!hasScore && (
          <div className="absolute top-4 right-4 z-10">
            <div className="px-3 py-1.5 rounded-2xl bg-zinc-800 border border-zinc-700 text-[10px] font-black text-zinc-400 uppercase tracking-widest">
              Builder
            </div>
          </div>
        )}

        <div className="absolute bottom-[-44px] left-1/2 -translate-x-1/2">
          <div className="relative">
            {/* Avatar ring glow */}
            {hasScore && (
              <div
                className="absolute inset-0 rounded-[28px] blur-md opacity-40 scale-110"
                style={{ background: meta.color }}
              />
            )}
            <div
              className="relative w-[100px] h-[100px] rounded-[24px] overflow-hidden border-[3px] bg-zinc-800 shadow-2xl"
              style={{ borderColor: hasScore ? meta.color : 'rgba(255,255,255,0.12)' }}
            >
              <img
                src={avatarUrl}
                alt={developer.name}
                className="w-full h-full object-cover"
                onError={e => {
                  (e.target as HTMLImageElement).src =
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(developer.name || 'U')}&background=1a1a1f&color=fff&size=200&bold=true`;
                }}
              />
            </div>
            {/* Online dot */}
            <div className="absolute -bottom-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-500 border-[2.5px] border-[#111115] shadow-lg" />
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
          BODY
      ═══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col px-5 pt-12 pb-4">

        {/* Name + Role + Location */}
        <div className="text-center mb-4">
          <h2 className="text-[22px] font-black text-white tracking-tight leading-tight">
            {developer.name}
          </h2>
          <p className={`text-[11px] font-bold uppercase tracking-[0.14em] mt-1 ${hasScore ? meta.textCls : 'text-[#00e5ff]'}`}>
            {developer.experienceLevel || 'Developer'}
          </p>
          {developer.location && (
            <div className="flex items-center justify-center gap-1 mt-1.5 text-zinc-500 text-[10px] font-semibold">
              <MapPin className="w-3 h-3" />
              <span>{developer.location}</span>
            </div>
          )}
        </div>

        {/* Bio */}
        {developer.bio && (
          <p className="text-center text-[11px] text-zinc-500 leading-relaxed line-clamp-2 mb-4 px-2">
            {developer.bio}
          </p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap justify-center gap-1.5 mb-4">
            {skills.slice(0, 5).map((skill: string) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.05] border border-white/[0.08] text-[10px] font-bold text-zinc-300"
              >
                {skill}
              </span>
            ))}
          </div>
        )}

        {/* Why Matched (only if score > 0 and has reasons) */}
        {hasScore && reasons.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles className="w-3 h-3" style={{ color: meta.color }} />
              <span className="text-[9px] font-black uppercase tracking-[0.2em]" style={{ color: meta.color }}>
                Why you match
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {reasons.slice(0, 4).map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl ${meta.bgCls} border ${meta.borderCls}`}
                >
                  <span className="text-xs leading-none">{r.icon}</span>
                  <span className="text-[9px] font-semibold text-zinc-400 leading-tight truncate">{r.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Placeholder content when score = 0 (no match data yet) */}
        {!hasScore && (
          <div className="mb-4 p-3 rounded-2xl bg-zinc-800/40 border border-zinc-800/60">
            <div className="flex items-center gap-2 mb-2">
              <Code className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">About this builder</span>
            </div>
            <p className="text-[10px] text-zinc-500 leading-relaxed">
              {developer.intent
                ? `Looking to: ${developer.intent}`
                : 'Connect to start collaborating on projects and building together.'}
            </p>
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-0" />

        {/* Footer */}
        <div className="pt-3 border-t border-zinc-800/50 flex items-center justify-between">
          <Link
            to={`/profile/${developer.id}`}
            onClick={e => e.stopPropagation()}
            onPointerDown={e => e.stopPropagation()}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase tracking-widest"
          >
            <Eye className="w-3.5 h-3.5" />
            View Profile
          </Link>
          {developer.intent && (
            <div className="px-2.5 py-1 rounded-xl bg-violet-500/10 border border-violet-500/20">
              <span className="text-[9px] font-black text-violet-400 uppercase tracking-wider">
                {developer.intent}
              </span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default SwipeCard;
