import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import axios from 'axios';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    postType: string;
    createdAt: string;
    author: {
      id: string;
      name: string;
      avatar: string;
      bio: string;
    };
    hasLiked: boolean;
    _count: {
      likes: number;
      comments: number;
    }
  };
}

const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await axios.post(`/api/posts/${post.id}/like`, {}, { withCredentials: true });
      if (response.data.hasLiked) {
        setHasLiked(true);
        setLikesCount(prev => prev + 1);
      } else {
        setHasLiked(false);
        setLikesCount(prev => prev - 1);
      }
    } catch (error) {
      console.error('Error liking post:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Achievement': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Collaboration': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'GitHub': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Auto': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-2xl p-5 hover:border-white/20 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <img 
            src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`} 
            alt={post.author.name} 
            className="w-10 h-10 rounded-full border border-white/10"
          />
          <div>
            <h3 className="font-semibold text-white">{post.author.name}</h3>
            <p className="text-xs text-gray-500">{post.author.bio?.slice(0, 40) || 'Developer'} • {getRelativeTime(post.createdAt)}</p>
          </div>
        </div>
        <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getTypeColor(post.postType)}`}>
          {post.postType}
        </span>
      </div>

      <div className="mt-4 mb-5 text-gray-200 text-sm whitespace-pre-wrap">
        {post.content}
      </div>

      <div className="flex items-center gap-6 pt-4 border-t border-white/5">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-sm transition-colors ${hasLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>
        
        <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-blue-400 transition-colors">
          <MessageCircle className="w-5 h-5" />
          <span>{post._count.comments}</span>
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>

        <button className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-yellow-400 transition-colors ml-auto">
          <Bookmark className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default PostCard;
