import React, { useState, useRef } from 'react';
import { X, Send, Image } from 'lucide-react';
import api from '../../lib/axios';
import toast from 'react-hot-toast';

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

  // Image Upload States
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Set local image preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setIsUploadingImage(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await api.post('/posts/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setImageUrl(response.data.url);
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed');
      setImagePreview(null);
      setImageUrl(null);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    setImageUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    if (isUploadingImage) {
      toast.error('Please wait for the image upload to complete');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await api.post('/posts', { 
        content, 
        postType, 
        imageUrl 
      });
      setContent('');
      setPostType('Update');
      setImageUrl(null);
      setImagePreview(null);
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
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

        {/* Image Preview Container */}
        {imagePreview && (
          <div className="relative mb-4 rounded-xl overflow-hidden border border-white/10 bg-white/5 max-h-[220px]">
            <img src={imagePreview} className="w-full h-full object-cover" alt="Upload preview" />
            {isUploadingImage ? (
              <div className="absolute inset-0 bg-black/75 flex items-center justify-center gap-2 text-xs font-bold text-white">
                <div className="w-4 h-4 border-2 border-brand-cyan border-t-transparent rounded-full animate-spin" />
                Uploading image...
              </div>
            ) : (
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5 overflow-x-auto pb-1 max-w-[280px] custom-scrollbar">
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

            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="p-2.5 bg-white/5 text-gray-400 border border-white/10 rounded-full hover:bg-white/10 hover:text-white transition disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
              title="Add Image"
            >
              <Image className="w-4.5 h-4.5" />
            </button>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting || isUploadingImage}
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
