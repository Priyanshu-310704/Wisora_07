import { Link } from 'react-router-dom';

export default function GroupChatMessage({ message, isOwn }) {
  const timeAgo = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now - d) / 1000);
    if (diff < 60) return 'just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div className={`flex flex-col mb-4 ${isOwn ? 'items-end' : 'items-start'} animate-fade-in`}>
      <div className={`flex gap-2 max-w-[85%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {!isOwn && (
          <Link to={`/profile/${message.user?._id}`} className="flex-shrink-0 mt-auto">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden border border-[var(--border-color)]">
              {message.user?.profilePicture ? (
                <img src={message.user.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                message.user?.username?.[0]?.toUpperCase() || 'U'
              )}
            </div>
          </Link>
        )}

        <div className="flex flex-col">
          {/* Metadata */}
          {!isOwn && (
            <span className="text-[10px] font-bold text-[var(--text-muted)] mb-1 ml-1 uppercase tracking-widest">
              {message.user?.username}
            </span>
          )}

          {/* Bubble */}
          <div className={`px-4 py-3 rounded-2xl shadow-sm border ${
            isOwn 
              ? 'bg-gradient-to-br from-indigo-600 to-indigo-700 border-indigo-500 text-white rounded-tr-sm' 
              : 'bg-[var(--surface-card)] border-[var(--border-color)] text-[var(--text-main)] rounded-tl-sm backdrop-blur-sm'
          }`}>
            <p className="text-sm leading-relaxed whitespace-pre-wrap font-medium">
              {message.body}
            </p>
            
            {message.images && message.images.length > 0 && (
              <div className="mt-3 rounded-xl overflow-hidden border border-black/10">
                <img src={message.images[0]} alt="" className="w-full h-auto object-cover max-h-60" />
              </div>
            )}
          </div>

          <span className={`text-[9px] font-medium mt-1 uppercase tracking-tighter opacity-60 ${isOwn ? 'text-right mr-1' : 'ml-1'}`}>
            {timeAgo(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
}
