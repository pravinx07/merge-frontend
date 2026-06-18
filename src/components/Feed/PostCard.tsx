import React, { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark, Trash2, X, Edit2 } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface PostCardProps {
  post: {
    id: string;
    content: string;
    imageUrl?: string;
    postType: string;
    createdAt: string;
    codeSnippet?: string;
    language?: string;
    pollOptions?: {
      id: string;
      text: string;
      votes: number;
      hasVoted: boolean;
    }[];
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
  onPostDeleted?: (postId: string) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, onPostDeleted }) => {
  const { user } = useAuth();
  const [hasLiked, setHasLiked] = useState(post.hasLiked);
  const [likesCount, setLikesCount] = useState(post._count.likes);
  const [isLiking, setIsLiking] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentsCount, setCommentsCount] = useState(post._count.comments);
  const [pollOptions, setPollOptions] = useState(post.pollOptions || []);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editCodeSnippet, setEditCodeSnippet] = useState(post.codeSnippet || '');
  const [editLanguage, setEditLanguage] = useState(post.language || '');
  const [isUpdating, setIsUpdating] = useState(false);

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

  const handleVote = async (optionId: string) => {
    try {
      await api.post(`/posts/${post.id}/poll/${optionId}`);
      
      // Optimistically update
      setPollOptions(prev => prev.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1, hasVoted: true };
        }
        if (opt.hasVoted) {
          return { ...opt, votes: Math.max(0, opt.votes - 1), hasVoted: false };
        }
        return opt;
      }));
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to register vote');
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/posts/${post.id}`);
      toast.success('Post deleted successfully');
      onPostDeleted?.(post.id);
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleUpdate = async () => {
    if (!editContent.trim()) return;
    setIsUpdating(true);
    try {
      await api.put(`/posts/${post.id}`, { 
        content: editContent,
        codeSnippet: post.postType === 'CODE_REVIEW' ? editCodeSnippet : undefined,
        language: post.postType === 'CODE_REVIEW' ? editLanguage : undefined
      });
      post.content = editContent; // Optimistic update
      if (post.postType === 'CODE_REVIEW') {
        post.codeSnippet = editCodeSnippet;
        post.language = editLanguage;
      }
      setIsEditing(false);
      toast.success('Post updated');
    } catch (error) {
      console.error('Error updating post:', error);
      toast.error('Failed to update post');
    } finally {
      setIsUpdating(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch(type) {
      case 'Achievement': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'Collaboration': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'GitHub': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'Auto': return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
      case 'CODE_REVIEW': return 'text-brand-cyan bg-brand-cyan/10 border-brand-cyan/20';
      case 'POLL': return 'text-pink-400 bg-pink-400/10 border-pink-400/20';
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
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.2)] hover:border-zinc-700 transition-shadow relative overflow-hidden group">
      {/* Subtle top gradient based on post type */}
      <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-${getTypeColor(post.postType).split(' ')[0].replace('text-', '')} to-transparent opacity-20`} />
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img 
              src={post.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author.name)}&background=random`} 
              alt={post.author.name} 
              className="w-10 h-10 rounded-xl object-cover border border-zinc-800 group-hover:border-brand-cyan/50 transition-colors"
            />
          </div>
          <div>
            <h3 className="font-black text-white text-sm hover:text-brand-cyan transition-colors cursor-pointer">{post.author.name}</h3>
            <p className="text-[11px] font-medium text-zinc-500">{post.author.bio?.slice(0, 40) || 'Developer'} • {getRelativeTime(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full border ${getTypeColor(post.postType)}`}>
            {post.postType}
          </span>
          {user?.id === post.author.id && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsEditing(!isEditing)}
                title="Edit post"
                className="p-1.5 rounded-lg text-gray-500 hover:text-brand-cyan hover:bg-brand-cyan/10 transition-all cursor-pointer"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleDelete}
                title="Delete post"
                className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="mt-3 mb-3 space-y-3">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-sm text-zinc-300 focus:outline-none focus:border-brand-cyan/50 resize-y min-h-[100px]"
          />
          {post.postType === 'CODE_REVIEW' && (
            <div className="space-y-2">
              <input
                type="text"
                value={editLanguage}
                onChange={(e) => setEditLanguage(e.target.value)}
                placeholder="Language (e.g. typescript, python)"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-brand-cyan/50 mb-2"
              />
              <textarea
                value={editCodeSnippet}
                onChange={(e) => setEditCodeSnippet(e.target.value)}
                placeholder="Paste your code snippet here..."
                className="w-full h-32 font-mono text-sm bg-[#0a0a0a] border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-brand-cyan/50 resize-y placeholder-zinc-600"
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button 
              onClick={() => { 
                setIsEditing(false); 
                setEditContent(post.content); 
                setEditCodeSnippet(post.codeSnippet || ''); 
                setEditLanguage(post.language || ''); 
              }}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-zinc-400 hover:text-white bg-zinc-800/50 hover:bg-zinc-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleUpdate}
              disabled={isUpdating || !editContent.trim()}
              className="px-4 py-1.5 rounded-lg text-xs font-bold text-dark-bg bg-brand-cyan disabled:opacity-50 hover:opacity-90 transition-opacity"
            >
              {isUpdating ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 mb-3 text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
          {post.content}
        </div>
      )}

      {post.codeSnippet && !isEditing && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-zinc-800 shadow-lg">
          <div className="flex items-center justify-between bg-zinc-950 px-4 py-2 border-b border-zinc-800">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/80"></div>
            </div>
            <span className="text-[10px] font-mono font-bold text-zinc-500 uppercase tracking-wider">{post.language || 'code'}</span>
          </div>
          <div className="bg-zinc-950 text-[12px] max-h-[300px] overflow-y-auto custom-scrollbar">
            <SyntaxHighlighter
              language={post.language || 'javascript'}
              style={vscDarkPlus as any}
              customStyle={{ margin: 0, padding: '1rem', background: 'transparent' }}
            >
              {post.codeSnippet}
            </SyntaxHighlighter>
          </div>
        </div>
      )}

      {pollOptions.length > 0 && (
        <div className="mb-4 space-y-2">
          {pollOptions.map((opt) => {
            const totalVotes = pollOptions.reduce((sum, o) => sum + o.votes, 0);
            const percentage = totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0;
            return (
              <button
                key={opt.id}
                onClick={() => handleVote(opt.id)}
                className={`relative w-full text-left overflow-hidden rounded-xl border transition-all ${
                  opt.hasVoted 
                    ? 'border-brand-cyan bg-brand-cyan/10' 
                    : 'border-white/10 bg-white/5 hover:bg-white/10'
                }`}
              >
                <div 
                  className={`absolute top-0 left-0 bottom-0 transition-all duration-1000 ${
                    opt.hasVoted ? 'bg-brand-cyan/20' : 'bg-white/10'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
                <div className="relative px-4 py-3 flex justify-between items-center z-10">
                  <span className={`text-sm ${opt.hasVoted ? 'text-brand-cyan font-bold' : 'text-gray-300'}`}>
                    {opt.text}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {percentage}%
                  </span>
                </div>
              </button>
            );
          })}
          <div className="text-[10px] text-gray-500 text-right mt-1">
            {pollOptions.reduce((sum, o) => sum + o.votes, 0)} total votes
          </div>
        </div>
      )}

      {post.imageUrl && (
        <div className="mb-4 rounded-2xl overflow-hidden border border-zinc-800 max-h-[300px] bg-zinc-950 shadow-inner">
          <img 
            src={post.imageUrl} 
            alt="Post attachment" 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      )}

      <div className="flex items-center gap-1.5 pt-3 border-t border-zinc-800">
        <button 
          onClick={handleLike}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${hasLiked ? 'text-red-400 bg-red-400/10' : 'text-zinc-400 hover:text-red-400 hover:bg-zinc-800'}`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-current' : ''}`} />
          <span>{likesCount}</span>
        </button>
        
        <button 
          onClick={toggleComments}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${showComments ? 'text-brand-cyan bg-brand-cyan/10' : 'text-zinc-400 hover:text-brand-cyan hover:bg-zinc-800'}`}
        >
          <MessageCircle className={`w-5 h-5 ${showComments ? 'fill-brand-cyan/20' : ''}`} />
          <span>{commentsCount}</span>
        </button>

        <button onClick={handleShare} className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 transition-all">
          <Share2 className="w-5 h-5" />
        </button>

        <button 
          onClick={handleBookmark}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ml-auto ${isBookmarked ? 'text-amber-400 bg-amber-400/10' : 'text-zinc-400 hover:text-amber-400 hover:bg-zinc-800'}`}
        >
          <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {showComments && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-zinc-800 space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Comments</span>
                <button 
                  onClick={() => setShowComments(false)}
                  className="p-1 rounded-full bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input 
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-brand-cyan/50 focus:ring-1 focus:ring-brand-cyan/20 transition-all shadow-inner"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="px-4 py-2 bg-brand-cyan text-dark-bg text-xs font-black rounded-xl disabled:opacity-50 hover:scale-105 active:scale-95 transition-all shadow-lg"
                >
                  Post
                </button>
              </form>

              <div className="space-y-3 mt-4 max-h-[250px] overflow-y-auto custom-scrollbar pr-2">
                {isLoadingComments ? (
                  <div className="text-center text-zinc-500 text-xs py-2 font-medium animate-pulse">Loading comments...</div>
                ) : comments.length > 0 ? (
                  comments.map(comment => (
                    <div key={comment.id} className="flex gap-3 group/comment">
                      <img src={comment.author.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.author.name)}&background=random`} className="w-8 h-8 rounded-lg object-cover border border-zinc-800" alt={comment.author.name} />
                      <div className="flex-1 bg-zinc-800/30 rounded-xl rounded-tl-sm px-4 py-2.5 text-[13px] border border-zinc-800/50">
                        <div className="font-black text-white text-[10px] mb-0.5 group-hover/comment:text-brand-cyan transition-colors">{comment.author.name}</div>
                        <div className="text-zinc-300 leading-relaxed">{comment.content}</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-zinc-500 text-xs py-2 font-medium">No comments yet.</div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
              onClick={() => setShowDeleteConfirm(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-zinc-950 border border-white/10 rounded-3xl w-full max-w-sm p-6 shadow-2xl overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-3xl -z-10" />
              <div className="flex flex-col items-center text-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white mb-1">Delete Post</h3>
                  <p className="text-xs text-zinc-400">
                    Are you sure you want to delete this post? This action cannot be undone.
                  </p>
                </div>
                <div className="flex gap-3 w-full mt-2">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 rounded-xl text-xs font-black text-white bg-red-500 hover:bg-red-650 active:scale-95 transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PostCard;
