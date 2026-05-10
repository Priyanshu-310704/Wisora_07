import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCommunityUsers, toggleFollow } from '../api/api';
import { useUser } from '../context/useUser';
import LoadingSpinner from '../components/LoadingSpinner';

export default function CommunityPage() {
  const { currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (search = '') => {
    setLoading(true);
    try {
      const { data } = await getCommunityUsers(search);
      setUsers(data || []);
    } catch (err) {
      console.error("Failed to fetch community:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUsers(searchTerm);
  };

  const handleToggleFollow = async (userId) => {
    if (!currentUser) return;
    try {
      await toggleFollow(userId);
      // Update local state to reflect follow/unfollow
      setUsers(prev => prev.map(u => {
        if (u._id === userId) {
          const isFollowing = u.followers.some(id => String(id) === String(currentUser._id));
          return {
            ...u,
            followers: isFollowing 
              ? u.followers.filter(id => String(id) !== String(currentUser._id))
              : [...u.followers, currentUser._id]
          };
        }
        return u;
      }));
    } catch (err) {
      console.error("Toggle follow failed:", err);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight mb-3">
          The <span className="gradient-text">Community</span>
        </h1>
        <p className="text-[var(--text-muted)] font-medium">Discover Wisora's brightest minds and expert contributors.</p>
        
        <form onSubmit={handleSearch} className="mt-8 max-w-xl mx-auto relative group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search experts by name..."
            className="input-glass !pl-12 py-4 shadow-xl shadow-indigo-100/20"
          />
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-indigo-600 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-2">
          {users.map((user) => {
            const isFollowing = currentUser && user.followers.some(id => String(id) === String(currentUser._id));
            return (
              <div key={user._id} className="glass-card-premium p-6 flex flex-col items-center text-center group hover:scale-[1.02] transition-all duration-300">
                <Link to={`/profile/${user._id}`} className="relative mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg group-hover:shadow-indigo-200 transition-all overflow-hidden rotate-3 group-hover:rotate-0 duration-500">
                    {user.profilePicture ? (
                      <img src={user.profilePicture} alt="" className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black bg-white/20">
                        {user.username?.[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>
                
                <Link to={`/profile/${user._id}`}>
                  <h3 className="text-lg font-bold text-[var(--text-main)] hover:text-indigo-600 transition-colors uppercase tracking-tight">{user.username}</h3>
                </Link>
                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] mt-1 mb-4">
                  {user.bio || "Knowledge Sharer"}
                </p>

                <div className="flex gap-6 mb-8 pt-6 border-t border-[var(--border-color)] w-full justify-center">
                  <div className="text-center">
                    <p className="text-base font-black text-[var(--text-main)]">{user.followers?.length || 0}</p>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Followers</p>
                  </div>
                  <div className="w-px h-8 bg-[var(--border-color)]" />
                  <div className="text-center">
                    <p className="text-base font-black text-[var(--text-main)]">{user.following?.length || 0}</p>
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Following</p>
                  </div>
                </div>

                <button 
                  onClick={() => handleToggleFollow(user._id)}
                  className={`w-full py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${
                    isFollowing 
                      ? 'bg-slate-100 text-slate-600 hover:bg-red-50 hover:text-red-500' 
                      : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg shadow-indigo-100 hover:shadow-indigo-200'
                  }`}
                >
                  {isFollowing ? 'Unfollow' : 'Follow'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!loading && users.length === 0 && (
        <div className="py-20 text-center text-slate-400 font-medium italic">
          No Wisora members found matching your search.
        </div>
      )}
    </div>
  );
}
