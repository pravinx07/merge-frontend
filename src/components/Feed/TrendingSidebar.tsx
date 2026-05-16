import React, { useEffect, useState } from 'react';
import { Flame, Code, Users } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

interface TrendingData {
  trendingDevelopers: Array<{
    id: string;
    name: string;
    avatar: string;
    skills: string[];
    bio: string;
  }>;
  trendingProjects: Array<{
    id: string;
    title: string;
    description: string;
    techStack: string[];
    owner: {
      id: string;
      name: string;
      avatar: string;
    }
  }>;
}

const TrendingSidebar: React.FC = () => {
  const [data, setData] = useState<TrendingData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await axios.get('/api/posts/trending', { withCredentials: true });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching trending data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 w-80 animate-pulse">
        <div className="h-6 bg-white/10 rounded w-1/2 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
                <div className="h-3 bg-white/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="w-80 space-y-6">
      {/* Trending Developers */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5 sticky top-24">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
          <Flame className="text-orange-500 w-5 h-5" />
          Trending Builders
        </h2>
        <div className="space-y-4">
          {data.trendingDevelopers.map((dev) => (
            <div key={dev.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <img 
                  src={dev.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(dev.name)}&background=random`} 
                  alt={dev.name} 
                  className="w-10 h-10 rounded-full border border-white/10 group-hover:border-purple-500 transition-colors"
                />
                <div>
                  <h3 className="font-medium text-sm text-gray-200 group-hover:text-purple-400 transition-colors">{dev.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-1">{dev.bio || dev.skills.join(', ')}</p>
                </div>
              </div>
              <button className="px-3 py-1 bg-white/5 hover:bg-white/10 text-xs font-medium text-white rounded-full transition-colors border border-white/10">
                Follow
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Trending Projects */}
      <div className="bg-[#111] border border-white/10 rounded-2xl p-5">
        <h2 className="flex items-center gap-2 text-lg font-bold text-white mb-4">
          <Code className="text-blue-500 w-5 h-5" />
          Trending Projects
        </h2>
        <div className="space-y-4">
          {data.trendingProjects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id} className="block group">
              <div className="bg-white/5 border border-white/5 rounded-xl p-3 group-hover:bg-white/10 group-hover:border-white/10 transition-all">
                <h3 className="font-semibold text-sm text-gray-200 mb-1 group-hover:text-blue-400 transition-colors">{project.title}</h3>
                <p className="text-xs text-gray-400 line-clamp-2 mb-2">{project.description}</p>
                <div className="flex gap-1 flex-wrap">
                  {project.techStack.slice(0, 3).map((tech, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingSidebar;
