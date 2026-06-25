import { useState, useEffect } from 'react';
import avatars from '../assets/avatars.png';
import api from '../lib/axios';

export const Community = () => {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    api.get('/users/public-community')
      .then(res => setUsers(res.data))
      .catch(console.error);
  }, []);

  const displayUsers = users.length > 0 ? users : [1, 2, 3, 4]; // Fallback if no users

  return (
    <section id="community" className="py-24 bg-dark-card/20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">A Live Community of Builders</h2>
          <p className="text-slate-400">See what others are building right now on Merge.</p>
        </div>
        
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-6">
          {displayUsers.map((user, i) => (
            <div key={user.id || i} className="bg-dark-card/70 backdrop-blur-xl p-5 rounded-2xl border border-dark-border hover:-translate-y-1 transition-all cursor-pointer">
              <div className="flex items-center gap-3 mb-4">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-zinc-800" />
                ) : (
                  <div 
                    className="w-10 h-10 rounded-full bg-slate-800 bg-no-repeat"
                    style={{
                      backgroundImage: `url(${avatars})`,
                      backgroundSize: '300% 200%',
                      backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i % 3) * 100}%`
                    }}
                  />
                )}
                <div className="overflow-hidden">
                  <div className="text-sm font-bold text-white truncate">{user.name || `Dev User ${i + 1}`}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider truncate">{user.bio || 'Building awesome things'}</div>
                </div>
              </div>
              <div className="h-32 bg-slate-800/50 rounded-xl mb-4 overflow-hidden relative group">
                <div className="w-full h-full bg-linear-to-br from-brand-purple/20 to-brand-cyan/20 group-hover:scale-110 transition-transform duration-500"></div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-sm">
                  <span className="text-xs font-bold text-white bg-white/20 px-3 py-1 rounded-full">View Profile</span>
                </div>
              </div>
              <h4 className="text-sm font-bold text-slate-200 mb-2 truncate">{user.intent ? `Open to ${user.intent}` : `Ready to collaborate`}</h4>
              <div className="flex flex-wrap gap-2 h-[24px] overflow-hidden">
                {(user.skills?.slice(0,3) || ['React', 'Tailwind']).map((skill: string, idx: number) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] text-slate-400 whitespace-nowrap">{skill}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
