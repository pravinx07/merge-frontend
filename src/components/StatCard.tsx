export const StatCard = ({ icon, val, label }: { icon: any, val: string, label: string }) => (
  <div className="flex items-center gap-4 p-6 rounded-2xl bg-dark-card/70 backdrop-blur-xl border border-dark-border hover:border-brand-purple/50 transition-colors">
    <div className="w-12 h-12 rounded-xl bg-slate-800/50 flex items-center justify-center text-brand-cyan">
      {icon}
    </div>
    <div>
      <div className="text-2xl font-bold text-white">{val}</div>
      <div className="text-xs text-slate-500 uppercase tracking-widest">{label}</div>
    </div>
  </div>
);
