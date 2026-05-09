export const RoleBadge = ({ icon, label }: { icon: any, label: string }) => (
  <div className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-dark-card/70 backdrop-blur-xl border border-dark-border hover:border-brand-cyan/30 transition-all cursor-pointer group">
    <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center text-slate-400 group-hover:text-brand-cyan group-hover:bg-brand-cyan/10 transition-all">
      {icon}
    </div>
    <span className="text-sm font-medium text-slate-300">{label}</span>
  </div>
);
