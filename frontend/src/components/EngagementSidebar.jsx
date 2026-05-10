import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSuggestedUsers, toggleFollow } from '../api/api';
import { useUser } from '../context/useUser';

export default function EngagementSidebar({ topics = [] }) {
  const { currentUser } = useUser();
  const [suggested, setSuggested] = useState([]);

  useEffect(() => {
    const fetchSuggested = async () => {
      try {
        const res = await getSuggestedUsers();
        setSuggested(res?.data || []);
      } catch (err) {
        console.error("Failed to fetch suggested users:", err);
      }
    };
    if (currentUser) fetchSuggested();
  }, [currentUser]);

  const handleFollow = async (userId) => {
    try {
      await toggleFollow(userId);
      setSuggested(prev => prev.filter(u => u._id !== userId));
    } catch (err) {
      console.error("Follow failed:", err);
    }
  };

  return (
    <aside className="space-y-6 sticky top-24 hidden lg:block">
      {/* Suggestions Section */}
      {currentUser && suggested.length > 0 && (
        <div className="glass-sidebar p-5">
          <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em] mb-4">
            Who to follow
          </h3>
          <div className="space-y-4">
            {suggested.map(user => (
              <div key={user._id} className="flex items-center justify-between group">
                <Link to={`/profile/${user._id}`} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 overflow-hidden flex-shrink-0">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                        {user.username?.[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--text-main)] truncate group-hover:text-indigo-600 transition-colors">
                      {user.username}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] truncate max-w-[100px] font-medium">
                      {user.bio || "Wisora expert"}
                    </p>
                  </div>
                </Link>
                <button 
                  onClick={() => handleFollow(user._id)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-extrabold bg-indigo-600 text-white hover:bg-indigo-700 transition-all active:scale-95 shadow-md shadow-indigo-500/10"
                >
                  Follow
                </button>
              </div>
            ))}
          </div>
          <Link to="/community" className="block mt-5 text-[11px] font-bold text-indigo-500 hover:text-indigo-600 transition-colors uppercase tracking-widest text-center">
            Show more
          </Link>
        </div>
      )}

      {/* Trending Topics */}
      <div className="glass-sidebar p-5">
        <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.1em] mb-4">
          Trending Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {topics.length > 0 ? topics.slice(0, 8).map(topic => (
            <Link 
              key={topic._id} 
              to={`/?tag=${encodeURIComponent(topic.name)}`}
              className="px-3 py-1.5 rounded-xl bg-[var(--border-color)] hover:bg-indigo-500/10 text-[var(--text-muted)] hover:text-indigo-500 text-xs font-bold border border-transparent hover:border-indigo-500/20 transition-all duration-200"
            >
              #{topic.name}
            </Link>
          )) : (
            <p className="text-xs text-slate-400 italic">No trending topics yet</p>
          )}
        </div>
      </div>

      {/* App Footer/Stats */}
      <div className="px-4 text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
        <span className="hover:underline cursor-pointer">Terms of Service</span>
        <span className="hover:underline cursor-pointer">Privacy Policy</span>
        <span className="hover:underline cursor-pointer">Cookie Policy</span>
        <span className="hover:underline cursor-pointer">© 2024 Wisora Inc.</span>
      </div>
    </aside>
  );
}
