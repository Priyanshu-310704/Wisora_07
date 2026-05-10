import { useState, useEffect } from 'react';
import { getTopics, createTopic } from '../api/api';
import { useUser } from '../context/useUser';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';

export default function TopicsPage() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTopic, setNewTopic] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const res = await getTopics();
        setTopics(res.data || []);
      } catch {
        setTopics([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTopics();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTopic.trim()) return;
    setCreating(true);
    setError('');
    try {
      const res = await createTopic(newTopic.trim());
      setTopics((prev) => [...prev, res.data]);
      setNewTopic('');
      setShowCreate(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create topic');
    } finally {
      setCreating(false);
    }
  };

  const colors = [
    'from-indigo-500 to-blue-500',
    'from-purple-500 to-pink-500',
    'from-emerald-500 to-teal-500',
    'from-orange-400 to-rose-500',
    'from-cyan-500 to-blue-500',
    'from-violet-500 to-purple-500',
    'from-amber-400 to-orange-500',
    'from-rose-400 to-pink-500',
  ];

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
            Explore <span className="gradient-text">Topics</span>
          </h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            Browse topics that interest you
          </p>
        </div>
        {currentUser && (
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="btn-primary flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Topic
          </button>
        )}
      </div>

      {/* Create topic form */}
      {showCreate && (
        <div className="glass-card p-5 mb-6 animate-slide-up">
          <form onSubmit={handleCreate} className="flex gap-3">
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="Enter topic name..."
              className="input-glass flex-1"
              autoFocus
            />
            <button
              type="submit"
              disabled={creating}
              className="btn-primary px-6"
            >
              {creating ? 'Creating...' : 'Create'}
            </button>
          </form>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
      )}

      {/* Topics grid */}
      {loading ? (
        <LoadingSpinner text="Loading topics..." />
      ) : topics.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {topics.map((topic, i) => (
            <button
              key={topic._id}
              onClick={() => navigate(`/?tag=${encodeURIComponent(topic.name)}`)}
              className="glass-card p-5 text-left group animate-slide-up"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                    colors[i % colors.length]
                  } flex items-center justify-center text-white font-bold text-sm shadow-lg`}
                >
                  {topic.name[0]?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-[var(--text-main)] group-hover:text-indigo-600 transition-colors">
                    {topic.name}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">Browse questions →</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🏷️"
          title="No topics yet"
          description="Create the first topic to organize questions"
          action={currentUser ? () => setShowCreate(true) : null}
          actionLabel="Create Topic"
        />
      )}
    </div>
  );
}
