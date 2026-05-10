import { Link } from 'react-router-dom';
import LikeButton from './LikeButton';

export default function QuestionCard({ question, index = 0 }) {
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  return (
    <div
      className="stream-item animate-fade-in group/item"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex gap-4">
        {/* User Avatar - Fixed Left */}
        <Link to={`/profile/${question.user?._id}`} className="flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-[var(--border-color)] p-[1.5px] shadow-sm overflow-hidden border border-[var(--border-subtle)]">
            {question.user?.profilePicture ? (
              <img src={question.user.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-indigo-500 font-bold text-sm bg-[var(--surface-card)] uppercase">
                {question.user?.username?.[0]}
              </div>
            )}
          </div>
        </Link>
        
        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <Link to={`/profile/${question.user?._id}`} className="text-sm font-bold text-[var(--text-main)] hover:text-indigo-600 transition-colors">
              {question.user?.username}
            </Link>
            <span className="text-xs text-[var(--text-muted)] font-medium">· {timeAgo(question.createdAt)}</span>
            {question.topics?.[0] && (
              <Link 
                to={`/?tag=${encodeURIComponent(typeof question.topics[0] === 'string' ? question.topics[0] : question.topics[0].name)}`}
                className="ml-auto px-2.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-500 text-[10px] font-extrabold uppercase tracking-widest border border-indigo-500/20"
              >
                {typeof question.topics[0] === 'string' ? question.topics[0] : question.topics[0].name}
              </Link>
            )}
          </div>

          <Link to={`/question/${question._id}`} className="block group/title">
            <h2 className="text-lg font-extrabold text-[var(--text-main)] group-hover/title:text-indigo-600 transition-colors leading-snug mb-2">
              {question.title}
            </h2>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-2 mb-3 font-medium opacity-90">
              {question.body}
            </p>
          </Link>

          {/* Media Preview */}
          {question.images && question.images.length > 0 && (
            <div className="mb-4 rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-sm max-h-80 group/img relative">
              <img 
                src={question.images[0]} 
                alt="" 
                className="w-full h-full object-cover group-hover/img:scale-[1.02] transition-transform duration-700"
              />
              {question.images.length > 1 && (
                <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white font-bold">
                  +{question.images.length - 1} photos
                </div>
              )}
            </div>
          )}

          {/* Interaction Bar */}
          <div className="flex items-center gap-8 pt-1">
            <div className="flex items-center group/like">
              <LikeButton targetId={question._id} targetType="Question" />
            </div>
            
            <Link 
              to={`/question/${question._id}`} 
              className="flex items-center gap-0 text-[var(--text-muted)] hover:text-indigo-500 transition-colors group/comment"
            >
              <div className="p-2 rounded-full group-hover/comment:bg-indigo-500/10 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-xs font-bold">{question.answerCount ?? 0}</span>
            </Link>

            <button className="p-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-color)] rounded-full transition-colors ml-auto">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
