import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { createQuestion, getTopics, getGroupDetails } from '../api/api';
import { useUser } from '../context/useUser';

export default function AskQuestionPage() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const groupId = location.state?.groupId;
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState([]);
  const [groupInfo, setGroupInfo] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    const fetchData = async () => {
      try {
        const [topicsRes, groupRes] = await Promise.all([
          getTopics(),
          groupId ? getGroupDetails(groupId) : Promise.resolve({ data: null })
        ]);
        setTopics(topicsRes.data || []);
        if (groupRes.data) setGroupInfo(groupRes.data.group);
      } catch {
        // ok
      }
    };
    fetchData();
  }, [currentUser, navigate, groupId]);

  const handleAddTag = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const t = tagInput.trim().replace(',', '');
      if (t && !tags.includes(t)) {
        setTags([...tags, t]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tag) => setTags(tags.filter((t) => t !== tag));

  const handlePaste = (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        const reader = new FileReader();
        reader.onload = (event) => {
          setImages((prev) => [...prev, event.target.result]);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImages((prev) => [...prev, event.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      setError('Title and body are required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await createQuestion(
        title.trim(),
        body.trim(),
        tags.length > 0 ? tags : undefined,
        images.length > 0 ? images : undefined,
        groupId
      );
      navigate(`/question/${res.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post question');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight mb-2">
          {groupInfo ? (
            <>Post to <span className="gradient-text">{groupInfo.name}</span></>
          ) : (
            <>Ask a <span className="gradient-text">Question</span></>
          )}
        </h1>
        <p className="text-[var(--text-muted)] font-medium text-lg">
          {groupInfo 
            ? "Your discussion will only be visible to group members."
            : "Share your curiosity with the Wisora community."}
        </p>
      </div>

      {/* Form */}
      <div className="glass-card p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What's your question?"
              className="input-glass text-lg font-medium"
              autoFocus
            />
            <p className="mt-1 text-xs text-slate-400">
              Be specific and imagine you're asking another person
            </p>
          </div>

          {/* Body */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Details
            </label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onPaste={handlePaste}
              placeholder="Include all the details someone would need to answer your question... (You can also paste images here!)"
              className="textarea-glass"
              rows={6}
            />
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Images
            </label>
            <div className="flex flex-wrap gap-4 mb-3">
              {images.map((img, index) => (
                <div key={index} className="relative group w-24 h-24 rounded-lg overflow-hidden border border-slate-200 shadow-sm">
                  <img src={img} alt="preview" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-400 transition-colors"
              >
                <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-xs font-medium">Add Image</span>
              </button>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              multiple
              className="hidden"
            />
            <p className="text-xs text-slate-400">
              Paste images into the text area or use the button above to upload.
            </p>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1.5">
              Topic Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {tags.map((tag) => (
                <span key={tag} className="tag-chip active group">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-white/70 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type a tag and press Enter"
              className="input-glass"
            />
            {/* Suggested tags from topics */}
            {topics.length > 0 && tags.length < 5 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {topics
                  .filter((t) => !tags.includes(t.name))
                  .slice(0, 6)
                  .map((topic) => (
                    <button
                      key={topic._id}
                      type="button"
                      onClick={() => setTags([...tags, topic.name])}
                      className="tag-chip text-xs"
                    >
                      + {topic.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm animate-slide-up">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </span>
              ) : (
                'Post Question'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary px-6 py-3"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
