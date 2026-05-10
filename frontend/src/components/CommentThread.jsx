import { useState, useEffect } from 'react';
import { commentOnAnswer, replyToComment, getCommentsByParent, updateComment, deleteComment } from '../api/api';
import { useUser } from '../context/useUser';
import LikeButton from './LikeButton';
import { Link } from 'react-router-dom';

function SingleComment({ comment, depth = 0 }) {
  const { currentUser } = useUser();
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replies, setReplies] = useState(comment.replies || []);
  const [submitting, setSubmitting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [deleted, setDeleted] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const res = await replyToComment(comment._id, replyText.trim());
      setReplies((prev) => [...prev, { ...res.data, replies: [] }]);
      setReplyText('');
      setReplying(false);
    } catch {
      // keep form open on error
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async () => {
    if (!editText.trim()) return;
    setSubmitting(true);
    try {
      const res = await updateComment(comment._id, editText.trim());
      comment.text = res.data.text; // local update
      setEditing(false);
    } catch {
      // stay in edit
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this comment?')) return;
    try {
      await deleteComment(comment._id);
      setDeleted(true);
    } catch {
      alert('Failed to delete comment');
    }
  };

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

  const isOwner = currentUser && String(currentUser._id) === String(comment.user?._id || comment.user);
  const username = comment.user?.username || 'Anonymous';

  if (deleted) return null;

  return (
    <div className={`${depth > 0 ? 'ml-6 pl-4 border-l-2 border-indigo-100/60' : ''}`}>
      <div className="py-3">
        <div className="flex items-start gap-2.5">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 flex items-center justify-center text-white text-[10px] font-bold mt-0.5 shrink-0 overflow-hidden">
            {comment.user?.profilePicture ? (
              <img src={comment.user.profilePicture} alt="" className="w-full h-full object-cover" />
            ) : (
              username[0]?.toUpperCase() || 'C'
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Link
                  to={comment.user?._id ? `/profile/${comment.user._id}` : '#'}
                  className="text-xs font-medium text-slate-600 hover:text-indigo-600 transition-colors"
                >
                  {username}
                </Link>
                <span className="text-xs text-slate-400">{timeAgo(comment.createdAt)}</span>
              </div>
              
              {isOwner && !editing && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditing(true)} className="text-[10px] text-slate-400 hover:text-indigo-500">Edit</button>
                  <button onClick={handleDelete} className="text-[10px] text-slate-400 hover:text-red-500">Delete</button>
                </div>
              )}
            </div>
            {editing ? (
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="input-glass text-xs py-1 flex-1"
                  autoFocus
                />
                <button onClick={handleEdit} className="text-xs text-indigo-500">Save</button>
                <button onClick={() => setEditing(false)} className="text-xs text-slate-400">Cancel</button>
              </div>
            ) : (
              <p className="text-sm text-slate-700 leading-relaxed">{comment.text}</p>
            )}
            <div className="flex items-center gap-3 mt-2">
              <LikeButton targetId={comment._id} targetType="Comment" />
              {currentUser && (
                <button
                  onClick={() => setReplying(!replying)}
                  className="text-xs text-indigo-400 hover:text-indigo-600 font-medium transition-colors"
                >
                  Reply
                </button>
              )}
            </div>

            {/* Reply form */}
            {replying && (
              <div className="mt-3 flex gap-2 animate-slide-up">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className="input-glass text-sm py-1.5 flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleReply()}
                  autoFocus
                />
                <button
                  onClick={handleReply}
                  disabled={submitting}
                  className="btn-primary text-xs px-3 py-1.5"
                >
                  {submitting ? '...' : 'Reply'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="space-y-0">
          {replies.map((reply) => (
            <SingleComment
              key={reply._id}
              comment={reply}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CommentThread({ answerId }) {
  const { currentUser } = useUser();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch comments on mount
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const res = await getCommentsByParent(answerId);
        setComments(res.data || []);
      } catch {
        setComments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchComments();
  }, [answerId]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const res = await commentOnAnswer(answerId, newComment.trim());
      setComments((prev) => [...prev, { ...res.data, replies: [] }]);
      setNewComment('');
    } catch {
      // keep form
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-1">
      {/* Loading */}
      {loading ? (
        <p className="text-xs text-slate-400 py-2">Loading comments...</p>
      ) : (
        <>
          {/* Comment list */}
          {comments.map((comment) => (
            <SingleComment key={comment._id} comment={comment} />
          ))}

          {comments.length === 0 && (
            <p className="text-xs text-slate-400 py-2">No comments yet. Be the first!</p>
          )}
        </>
      )}

      {/* New comment input */}
      {currentUser && (
        <div className="flex gap-2 mt-3 pt-3 border-t border-slate-100">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="input-glass text-sm py-2 flex-1"
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
          />
          <button
            onClick={handleAddComment}
            disabled={submitting}
            className="btn-primary text-xs px-4 py-2"
          >
            {submitting ? '...' : 'Post'}
          </button>
        </div>
      )}
    </div>
  );
}
