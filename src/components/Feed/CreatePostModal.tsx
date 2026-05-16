import React, { useState } from 'react';
import { X, Send } from 'lucide-react';
import api from '../../lib/axios';

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const POST_TYPES = ['Update', 'Collaboration', 'Achievement', 'GitHub'];

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('Update');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/posts', { content, postType });
      setContent('');
      setPostType('Update');
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#111] border border-white/10 rounded-2xl p-6 shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create Post</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/5 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in your builder journey?"
          className="w-full h-32 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-purple-500/50 resize-none mb-4 placeholder-gray-500"
        />

        <div className="flex items-center justify-between">
          <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
            {POST_TYPES.map(type => (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`px-3 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition ${
                  postType === type 
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                    : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-full font-medium hover:opacity-90 transition disabled:opacity-50"
          >
            {isSubmitting ? 'Posting...' : (
              <>
                Post <Send className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePostModal;
