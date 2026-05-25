import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

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
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsCount, setCommentsCount] = useState(post._count.comments);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      const response = await api.post(`/posts/${post.id}/like`, {});
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

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Post link copied to clipboard!');
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      toast.success('Post bookmarked!');
    } else {
      toast.success('Removed from bookmarks');
    }
  };

  const toggleComments = async () => {
    if (!showComments && comments.length === 0) {
      setIsLoadingComments(true);
      try {
        const response = await api.get(`/posts/${post.id}/comments`);
        setComments(response.data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      } finally {
        setIsLoadingComments(false);
      }
    }
    setShowComments(!showComments);
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const response = await api.post(`/posts/${post.id}/comments`, { content: newComment });
      setComments(prev => [...prev, response.data]);
      setNewComment('');
      setCommentsCount(prev => prev + 1);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
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
            className="w-10 h-10 rounded-full object-cover border border-white/10"
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
        
        <button 
          onClick={toggleComments}
          className={`flex items-center gap-1.5 text-sm transition-colors ${showComments ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'}`}
        >
          <MessageCircle className={`w-5 h-5 ${showComments ? 'fill-blue-400/20' : ''}`} />
          <span>{commentsCount}</span>
        </button>

        <button onClick={handleShare} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-green-400 transition-colors">
          <Share2 className="w-5 h-5" />
        </button>

        <button 
          onClick={handleBookmark}
          className={`flex items-center gap-1.5 text-sm transition-colors ml-auto ${isBookmarked ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-400'}`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      {showComments && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input 
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan/50"
            />
            <button 
              type="submit"
              disabled={!newComment.trim()}
              className="px-4 py-2 bg-brand-cyan text-dark-bg text-sm font-bold rounded-xl disabled:opacity-50 transition-colors"
            >
              Post
            </button>
          </form>

          <div className="space-y-3 mt-4">
            {isLoadingComments ? (
              <div className="text-center text-zinc-500 text-xs py-2 animate-pulse">Loading comments...</div>
            ) : comments.length > 0 ? (
              comments.map(comment => (
                <div key={comment.id} className="flex gap-3">
                  <img src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`} className="w-8 h-8 rounded-full border border-white/10" alt={comment.author.name} />
                  <div className="flex-1 bg-white/5 rounded-2xl px-4 py-2.5 text-sm">
                    <div className="font-semibold text-white text-xs mb-0.5">{comment.author.name}</div>
                    <div className="text-gray-300">{comment.content}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-zinc-500 text-xs py-2">No comments yet. Be the first to share your thoughts!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
