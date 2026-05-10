import { useState } from 'react';
import { editAnswer, deleteAnswer } from '../api/api';
import { useUser } from '../context/useUser';
import LikeButton from './LikeButton';
import CommentThread from './CommentThread';
import { Link } from 'react-router-dom';

export default function AnswerCard({ answer, onUpdate, onDelete }) {
  const { currentUser } = useUser();
  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(answer.text);
  const [showComments, setShowComments] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUser && String(currentUser._id) === String(answer.user?._id || answer.user);

  const handleSave = async () => {
    if (!editText.trim()) return;
    setSaving(true);
    try {
      const res = await editAnswer(answer._id, editText.trim());
      if (onUpdate) onUpdate(res.data);
      setEditing(false);
    } catch {
      // keep editing on error
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this answer?')) return;
    setDeleting(true);
    try {
      await deleteAnswer(answer._id);
      if (onDelete) onDelete(answer._id);
    } catch {
      // silent
    } finally {
      setDeleting(false);
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

  const username = answer.user?.username || 'Anonymous';

  return (
    <div className="glass-card p-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Link
            to={answer.user?._id ? `/profile/${answer.user._id}` : '#'}
            className="flex items-center gap-2 group"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-[10px] font-bold overflow-hidden">
              {answer.user?.profilePicture ? (
                <img src={answer.user.profilePicture} alt="" className="w-full h-full object-cover" />
              ) : (
                username[0]?.toUpperCase() || 'A'
              )}
            </div>
            <span className="text-sm font-medium text-slate-600 group-hover:text-indigo-600 transition-colors">
              {username}
            </span>
          </Link>
          <span className="text-xs text-slate-400">· {timeAgo(answer.createdAt)}</span>
        </div>
        {isOwner && !editing && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEditing(true)}
              className="text-xs text-indigo-400 hover:text-indigo-600 font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors"
            >
              {deleting ? '...' : 'Delete'}
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      {editing ? (
        <div className="space-y-3">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="textarea-glass"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-primary text-xs px-4 py-2"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setEditText(answer.text);
              }}
              className="btn-secondary text-xs px-4 py-2"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
          {answer.text}
        </p>
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 mt-4 pt-3 border-t border-slate-100">
        <LikeButton targetId={answer._id} targetType="Answer" />
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-500 transition-colors duration-200"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <span>{showComments ? 'Hide' : 'Comments'}</span>
        </button>
      </div>

      {/* Comments */}
      {showComments && (
        <div className="mt-4 animate-slide-up">
          <CommentThread answerId={answer._id} />
        </div>
      )}
    </div>
  );
}
