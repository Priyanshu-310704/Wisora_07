import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getUserProfile, updateUserProfile, toggleFollow, getUserQuestions, getUserAnswers } from '../api/api';
import { useUser } from '../context/useUser';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProfilePage() {
  const { userId } = useParams();
  const { currentUser, updateUser } = useUser();
  const [profile, setProfile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({ username: '', bio: '', profilePicture: '', coverImage: '' });
  const [saving, setSaving] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('questions'); // 'questions', 'answers', 'followers'
  const [userAnswers, setUserAnswers] = useState([]);
  const [fetchingTab, setFetchingTab] = useState(false);

  const profileFileInput = useRef(null);
  const coverFileInput = useRef(null);

  const isOwnProfile = currentUser && String(currentUser._id) === String(userId);

  const isFollowing = currentUser && profile?.followers?.some(
    (f) => String(f._id || f) === String(currentUser._id)
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [profileRes, questionsRes] = await Promise.allSettled([
          getUserProfile(userId),
          getUserQuestions(userId),
        ]);

        if (profileRes.status === 'fulfilled') {
          setProfile(profileRes.value.data);
          setEditData({
            username: profileRes.value.data.username || '',
            bio: profileRes.value.data.bio || '',
            profilePicture: profileRes.value.data.profilePicture || '',
            coverImage: profileRes.value.data.coverImage || '',
          });
        }

        if (questionsRes.status === 'fulfilled') {
          setQuestions(questionsRes.value.data || []);
        }
      } catch {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId]);

  useEffect(() => {
    if (activeTab === 'answers' && userAnswers.length === 0) {
      const fetchAnswers = async () => {
        setFetchingTab(true);
        try {
          const res = await getUserAnswers(userId);
          setUserAnswers(res.data || []);
        } catch (err) {
          console.error("Failed to fetch user answers:", err);
        }
        setFetchingTab(false);
      };
      fetchAnswers();
    }
  }, [activeTab, userId, userAnswers.length]);

  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditData((prev) => ({ ...prev, [field]: event.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const res = await updateUserProfile(userId, editData);
      setProfile((prev) => ({ ...prev, ...res.data }));
      if (isOwnProfile) updateUser(res.data);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!currentUser) return;
    setFollowLoading(true);
    try {
      await toggleFollow(userId);
      // Refresh profile to get updated followers list
      const updated = await getUserProfile(userId);
      setProfile(updated.data);
    } catch {
      // silent
    } finally {
      setFollowLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading profile..." />;

  if (!profile) {
    return (
      <div className="glass-card p-8 text-center animate-fade-in">
        <div className="text-5xl mb-4">👤</div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">User not found</h2>
        <p className="text-sm text-slate-400">This profile doesn't exist</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto animate-slide-up space-y-4">
      {/* Profile card */}
      <div className="glass-card overflow-hidden">
        {/* Banner */}
        <div className="h-32 sm:h-40 relative group">
          {editData.coverImage || profile.coverImage ? (
            <img 
              src={editing ? editData.coverImage : profile.coverImage} 
              alt="Cover" 
              className="w-full h-full object-cover" 
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-400" />
          )}
          {editing && (
            <button 
              onClick={() => coverFileInput.current?.click()}
              className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-sm font-medium"
            >
              Change Cover
            </button>
          )}
          <input type="file" ref={coverFileInput} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'coverImage')} />
        </div>

        <div className="px-6 sm:px-8 pb-6">
          {/* Avatar */}
          <div className="relative flex items-end justify-between -mt-12 mb-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-3xl font-bold shadow-xl border-4 border-[var(--surface-card)] overflow-hidden">
                {editData.profilePicture || profile.profilePicture ? (
                  <img 
                    src={editing ? editData.profilePicture : profile.profilePicture} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  profile.username?.[0]?.toUpperCase() || 'U'
                )}
              </div>
              {editing && (
                <button 
                  onClick={() => profileFileInput.current?.click()}
                  className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white text-[10px] font-medium"
                >
                  Change
                </button>
              )}
              <input type="file" ref={profileFileInput} className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, 'profilePicture')} />
            </div>
            {isOwnProfile ? (
              <button
                onClick={() => setEditing(!editing)}
                className="btn-secondary mt-14"
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            ) : (
              currentUser && (
                <button
                  onClick={handleToggleFollow}
                  disabled={followLoading}
                  className={`mt-14 ${isFollowing ? 'btn-secondary' : 'btn-primary'}`}
                >
                  {followLoading ? '...' : isFollowing ? '✓ Following' : 'Follow'}
                </button>
              )
            )}
          </div>

          {editing ? (
            <div className="space-y-4 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Username</label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) => setEditData({ ...editData, username: e.target.value })}
                  className="input-glass"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 mb-1">Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                  className="textarea-glass"
                  rows={3}
                  placeholder="Tell us about yourself..."
                />
              </div>
              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}
              <button
                onClick={handleSave}
                disabled={saving}
                className="btn-primary px-6 py-2.5"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-black text-[var(--text-main)] tracking-tight">{profile.username}</h1>
              <p className="text-sm text-[var(--text-muted)] mt-0.5 font-medium">{profile.email}</p>
              {profile.bio && (
                <p className="text-sm text-[var(--text-main)] mt-3 leading-relaxed opacity-80 font-medium">{profile.bio}</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats / Tabs */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'questions', label: 'Questions', value: profile.questionsCount ?? 0, icon: '❓' },
          { id: 'answers', label: 'Answers', value: profile.answersCount ?? 0, icon: '💬' },
          { id: 'followers', label: 'Followers', value: profile.followers?.length ?? 0, icon: '👥' },
        ].map((stat) => (
          <button 
            key={stat.id} 
            onClick={() => setActiveTab(stat.id)}
            className={`glass-card p-4 text-center transition-all duration-200 border-2 ${
              activeTab === stat.id ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' : 'border-transparent'
            }`}
          >
            <div className="text-2xl mb-1">{stat.icon}</div>
            <div className="text-xl font-bold text-[var(--text-main)]">{stat.value}</div>
            <div className="text-xs text-[var(--text-muted)] font-black uppercase tracking-widest">{stat.label}</div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="glass-card p-5 min-h-[100px]">
        {activeTab === 'questions' && (
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Recent Questions</h2>
            {questions.length > 0 ? (
              <div className="space-y-2">
                {questions.map((q) => (
                  <Link
                    key={q._id}
                    to={`/question/${q._id}`}
                    className="block px-3 py-2.5 rounded-lg hover:bg-indigo-50/80 transition-colors group"
                  >
                    <h3 className="text-sm font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">
                      {q.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(q.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </p>
                  </Link>
                ))}
              </div>
            ) : (
                <p className="text-sm text-slate-400 text-center py-4">No questions posted yet.</p>
            )}
          </div>
        )}

        {activeTab === 'answers' && (
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Recent Answers</h2>
            {fetchingTab ? (
              <div className="text-center py-4 text-sm text-slate-400">Fetching answers...</div>
            ) : userAnswers.length > 0 ? (
              <div className="space-y-2">
                {userAnswers.map((a) => (
                  <Link
                    key={a._id}
                    to={`/question/${a.question?._id}`}
                    className="block px-3 py-2.5 rounded-lg hover:bg-indigo-50/80 transition-colors group border-l-2 border-indigo-200"
                  >
                    <p className="text-xs text-slate-400 mb-1">Answered on: <span className="font-medium text-slate-600">{a.question?.title}</span></p>
                    <p className="text-sm text-slate-700 line-clamp-1 italic">"{a.text}"</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No answers posted yet.</p>
            )}
          </div>
        )}

        {activeTab === 'followers' && (
          <div>
            <h2 className="text-base font-semibold text-slate-700 mb-3">Followers</h2>
            {profile.followers?.length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {profile.followers.map((f) => (
                  <Link
                    key={f._id}
                    to={`/profile/${f._id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 overflow-hidden">
                      {f.profilePicture ? (
                        <img src={f.profilePicture} alt="" className="w-full h-full object-cover" />
                      ) : (
                        f.username?.[0]?.toUpperCase() || '?'
                      )}
                    </div>
                    <span className="text-sm text-slate-700">{f.username}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-400 text-center py-4">No followers yet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
