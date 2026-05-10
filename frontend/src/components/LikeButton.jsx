import { useState, useEffect } from 'react';
import { toggleLike, getLikeInfo } from '../api/api';
import { useUser } from '../context/useUser';

export default function LikeButton({ targetId, targetType }) {
  const { currentUser } = useUser();
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [animating, setAnimating] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch initial like state
  useEffect(() => {
    const fetchLikeInfo = async () => {
      try {
        const res = await getLikeInfo(targetId, targetType);
        setLiked(res.data.liked || false);
        setCount(res.data.count || 0);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    if (targetId) fetchLikeInfo();
  }, [targetId, targetType]);

  const handleLike = async () => {
    if (!currentUser) return;
    setAnimating(true);

    // Optimistic update
    const wasLiked = liked;
    setLiked(!liked);
    setCount((c) => (liked ? c - 1 : c + 1));

    try {
      const res = await toggleLike(targetId, targetType);
      setLiked(res.data.liked);
      setCount(res.data.count);
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setCount((c) => (wasLiked ? c + 1 : c - 1));
    }

    setTimeout(() => setAnimating(false), 300);
  };

  if (loading) {
    return (
      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-white/50 text-slate-300 border border-slate-200" disabled>
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current" strokeWidth="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
        <span>—</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLike}
      className={`group flex items-center gap-1 px-2.5 py-1.5 rounded-full text-sm font-medium transition-all duration-300 ${
        liked
          ? 'bg-gradient-to-r from-pink-50 to-rose-50 text-rose-500 border border-rose-200'
          : 'bg-white/50 text-slate-400 border border-slate-200 hover:text-rose-400 hover:border-rose-200 hover:bg-rose-50/50'
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`w-4 h-4 transition-all duration-300 ${
          animating ? 'animate-pulse-heart' : ''
        } ${liked ? 'fill-rose-500 stroke-rose-500' : 'fill-none stroke-current'}`}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      <span>{count}</span>
    </button>
  );
}
