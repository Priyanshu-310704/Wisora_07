import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getQuestionById, getAnswersByQuestion, postAnswer, deleteQuestion } from '../api/api';
import { useUser } from '../context/useUser';
import LikeButton from '../components/LikeButton';
import AnswerCard from '../components/AnswerCard';
import LoadingSpinner from '../components/LoadingSpinner';

export default function QuestionDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useUser();
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [newAnswer, setNewAnswer] = useState('');
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [qRes, aRes] = await Promise.allSettled([
          getQuestionById(id),
          getAnswersByQuestion(id),
        ]);

        if (qRes.status === 'fulfilled') setQuestion(qRes.value.data);
        if (aRes.status === 'fulfilled') setAnswers(aRes.value.data || []);
      } catch {
        // handled by empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePostAnswer = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim() || !currentUser) return;
    setPosting(true);
    setError('');
    try {
      const res = await postAnswer(id, newAnswer.trim());
      setAnswers((prev) => [res.data, ...prev]);
      setNewAnswer('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to post answer');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!confirm('Are you sure you want to delete this question? This will remove all answers and comments as well.')) return;
    try {
      await deleteQuestion(id);
      navigate('/');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete question');
    }
  };

  if (loading) return <LoadingSpinner text="Loading question..." />;

  if (!question) {
    return (
      <div className="glass-card p-8 text-center animate-fade-in">
        <div className="text-5xl mb-4">🔍</div>
        <h2 className="text-xl font-semibold text-slate-700 mb-2">Question not found</h2>
        <p className="text-sm text-slate-400 mb-4">This question may have been removed</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Question */}
      <div className="glass-card p-6 sm:p-8">
        {/* Tags */}
        {question.topics && question.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {question.topics.map((tag) => (
              <Link
                key={tag._id}
                to={`/?tag=${encodeURIComponent(tag.name)}`}
                className="tag-chip"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        )}

        <h1 className="text-3xl sm:text-4xl font-black text-[var(--text-main)] tracking-tight mb-4">
          {question.title}
        </h1>

        <p className="text-lg text-[var(--text-main)] leading-relaxed mb-8 opacity-90 font-medium">
          {question.body}
        </p>

        {/* Images */}
        {question.images && question.images.length > 0 && (
          <div className="space-y-4 mb-8">
            {question.images.map((img, index) => (
              <div key={index} className="rounded-xl overflow-hidden border border-slate-100 shadow-sm transition-transform hover:scale-[1.01] duration-300">
                <img src={img} alt={`Question upload ${index}`} className="w-full h-auto object-contain max-h-[500px]" />
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4">
            <LikeButton targetId={question._id} targetType="Question" />
            
            {currentUser && String(currentUser._id) === String(question.user?._id) && (
              <button
                onClick={handleDeleteQuestion}
                className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
              >
                Delete Question
              </button>
            )}

            {question.user && (
              <Link
                to={`/profile/${question.user._id}`}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
                  {question.user.profilePicture ? (
                    <img src={question.user.profilePicture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    question.user.username?.[0]?.toUpperCase() || 'U'
                  )}
                </div>
                <span>{question.user.username}</span>
              </Link>
            )}
          </div>
          <span className="text-xs text-slate-400">
            {question.createdAt
              ? new Date(question.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : ''}
          </span>
        </div>
      </div>

      {/* Answers header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-700">
          {answers.length} {answers.length === 1 ? 'Answer' : 'Answers'}
        </h2>
      </div>

      {/* Answers list */}
      {answers.length > 0 ? (
        <div className="space-y-4">
          {answers.map((a) => (
            <AnswerCard
              key={a._id}
              answer={a}
              onUpdate={(updated) =>
                setAnswers((prev) =>
                  prev.map((ans) => (ans._id === updated._id ? updated : ans))
                )
              }
              onDelete={(deletedId) =>
                setAnswers((prev) => prev.filter((ans) => ans._id !== deletedId))
              }
            />
          ))}
        </div>
      ) : (
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-slate-400">No answers yet. Share your knowledge!</p>
        </div>
      )}

      {/* Post answer */}
      {currentUser ? (
        <div className="glass-card p-6">
          <h3 className="text-base font-semibold text-slate-700 mb-3">Your Answer</h3>
          <form onSubmit={handlePostAnswer} className="space-y-4">
            <textarea
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Write your answer here..."
              className="textarea-glass"
              rows={4}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
            <button
              type="submit"
              disabled={posting || !newAnswer.trim()}
              className="btn-primary px-6 py-2.5"
            >
              {posting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Posting...
                </span>
              ) : (
                'Post Answer'
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="glass-card p-6 text-center">
          <p className="text-sm text-slate-500">
            <Link to="/login" className="text-indigo-500 font-medium hover:underline">
              Sign in
            </Link>{' '}
            to answer this question
          </p>
        </div>
      )}
    </div>
  );
}
