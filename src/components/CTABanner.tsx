export const CTABanner = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="relative rounded-[40px] overflow-hidden p-12 md:p-20 text-center bg-brand-purple/10 border border-brand-purple/20">
          <div className="absolute top-0 left-0 w-full h-full bg-linear-to-r from-brand-purple/20 to-brand-cyan/20 -z-10 opacity-30"></div>
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
            Your next great connection is <br />
            just <span className="text-brand-cyan">one match</span> away.
          </h2>
          <p className="text-slate-400 mb-10 text-lg">Join thousands of developers building connections that matter.</p>
          <button className="px-10 py-4 bg-white text-dark-bg rounded-2xl font-bold hover:scale-105 transition-transform">
            Create Developer Profile
          </button>
          <p className="mt-4 text-xs text-slate-500">It's free • Takes less than 2 minutes</p>
        </div>
      </div>
    </section>
  );
};
