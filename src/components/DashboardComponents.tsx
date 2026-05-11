import React from 'react';

export const PageHeader = ({ title, description, children }: { title: string; description?: string; children?: React.ReactNode }) => (
  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
      {description && <p className="text-sm text-zinc-400 max-w-xl mt-1">{description}</p>}
    </div>
    {children && <div className="flex items-center gap-3">{children}</div>}
  </div>
);

export const DashboardContainer = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`max-w-7xl mx-auto px-6 py-6 ${className}`}>
    {children}
  </div>
);

export const SectionTitle = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold text-white mb-4 ${className}`}>{children}</h2>
);

export const EmptyState = ({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction 
}: { 
  icon: any; 
  title: string; 
  description: string; 
  actionLabel?: string; 
  onAction?: () => void 
}) => (
  <div className="flex flex-col items-center justify-center py-20 px-6 text-center bg-zinc-900/30 border border-zinc-800/50 rounded-3xl max-w-md mx-auto">
    <div className="w-16 h-16 bg-zinc-800/50 rounded-2xl flex items-center justify-center mb-6">
      <Icon className="w-8 h-8 text-zinc-500" />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-zinc-400 mb-8 leading-relaxed">
      {description}
    </p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="px-6 py-2.5 bg-brand-cyan text-dark-bg rounded-xl font-bold text-sm hover:scale-105 transition-all"
      >
        {actionLabel}
      </button>
    )}
  </div>
);
