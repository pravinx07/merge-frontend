
const LoadingSkeleton = ({ type }: { type: 'card' | 'list' | 'profile' | 'settings' }) => {
  if (type === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 rounded-[48px] p-8 animate-pulse">
            <div className="w-32 h-32 bg-white/5 rounded-[40px] mx-auto mb-8" />
            <div className="h-6 bg-white/5 rounded-full w-3/4 mx-auto mb-4" />
            <div className="h-4 bg-white/5 rounded-full w-1/2 mx-auto mb-8" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-12 bg-white/5 rounded-2xl" />
              <div className="h-12 bg-white/5 rounded-2xl" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white/[0.03] border border-white/5 rounded-[32px] p-6 flex items-center gap-6 animate-pulse">
            <div className="w-20 h-20 bg-white/5 rounded-[24px] shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="flex justify-between">
                <div className="h-5 bg-white/5 rounded-full w-1/3" />
                <div className="h-3 bg-white/5 rounded-full w-16" />
              </div>
              <div className="h-4 bg-white/5 rounded-full w-1/2" />
            </div>
            <div className="w-12 h-12 bg-white/5 rounded-2xl shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'profile') {
    return (
        <div className="animate-pulse space-y-8">
            <div className="h-[400px] bg-white/[0.03] rounded-[48px] border border-white/5" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="h-64 bg-white/[0.03] rounded-[40px] border border-white/5" />
                    <div className="h-96 bg-white/[0.03] rounded-[40px] border border-white/5" />
                </div>
                <div className="space-y-8">
                    <div className="h-80 bg-white/[0.03] rounded-[40px] border border-white/5" />
                </div>
            </div>
        </div>
    );
  }

  if (type === 'settings') {
    return (
      <div className="flex flex-col lg:flex-row gap-6 animate-pulse">
        <div className="w-full lg:w-56 space-y-2">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-12 bg-white/5 rounded-xl" />
          ))}
        </div>
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[24px] p-8 space-y-8">
            <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-full bg-white/5" />
                <div className="space-y-2">
                    <div className="h-4 bg-white/5 rounded-full w-32" />
                    <div className="h-3 bg-white/5 rounded-full w-24" />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="space-y-2">
                        <div className="h-3 bg-white/5 rounded-full w-16" />
                        <div className="h-12 bg-white/5 rounded-xl w-full" />
                    </div>
                ))}
            </div>
            <div className="h-14 bg-white/5 rounded-xl w-full" />
        </div>
      </div>
    );
  }

  return null;
};

export default LoadingSkeleton;
