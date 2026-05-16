import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../components/MainLayout';
import PostCard from '../components/Feed/PostCard';
import CreatePostModal from '../components/Feed/CreatePostModal';
import TrendingSidebar from '../components/Feed/TrendingSidebar';
import { PenSquare } from 'lucide-react';

const FeedPage: React.FC = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/posts/feed', { withCredentials: true });
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-8 justify-center">
          
          {/* Main Feed Column */}
          <div className="flex-1 max-w-2xl">
            {/* Create Post Banner */}
            <div className="bg-[#111] border border-white/10 rounded-2xl p-4 mb-6 flex items-center gap-4 cursor-pointer hover:border-white/20 transition-colors" onClick={() => setIsModalOpen(true)}>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center shrink-0">
                <PenSquare className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 bg-white/5 border border-white/5 rounded-full px-4 py-3 text-gray-400 text-sm hover:bg-white/10 transition-colors">
                What's happening in your builder journey?
              </div>
            </div>

            {/* Posts Feed */}
            {isLoading ? (
              <div className="space-y-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-[#111] border border-white/10 rounded-2xl p-5 animate-pulse">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-full bg-white/10"></div>
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-white/10 rounded w-1/4"></div>
                        <div className="h-3 bg-white/10 rounded w-1/3"></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-4 bg-white/10 rounded w-full"></div>
                      <div className="h-4 bg-white/10 rounded w-5/6"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : posts.length > 0 ? (
              <div className="space-y-6">
                {posts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-[#111] border border-white/10 rounded-2xl">
                <p className="text-gray-400">No posts yet. Be the first to share an update!</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Trending */}
          <div className="hidden lg:block">
            <TrendingSidebar />
          </div>

        </div>
      </div>

      <CreatePostModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onPostCreated={fetchPosts}
      />
    </MainLayout>
  );
};

export default FeedPage;
