import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getGroupDetails, addGroupMember, removeGroupMember, getCommunityUsers, joinGroup, createQuestion } from '../api/api';
import { useUser } from '../context/useUser';
import LoadingSpinner from '../components/LoadingSpinner';
import GroupChatMessage from '../components/GroupChatMessage';

export default function GroupDetailPage() {
  const { id } = useParams();
  const { currentUser } = useUser();
  const [group, setGroup] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingMember, setAddingMember] = useState(false);
  const [searchMemberTerm, setSearchMemberTerm] = useState('');
  const [foundUsers, setFoundUsers] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchDetails = useCallback(async () => {
    try {
      const { data } = await getGroupDetails(id);
      setGroup(data.group);
      // For chat, we usually want oldest at top, newest at bottom
      const sorted = (data.questions || []).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setQuestions(sorted);
    } catch (err) {
      console.error("Failed to fetch group details:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  useEffect(() => {
    scrollToBottom();
  }, [questions]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const title = newMessage.trim().slice(0, 30) + (newMessage.length > 30 ? '...' : '');
      const { data } = await createQuestion(title, newMessage.trim(), [], [], id);
      setQuestions(prev => [...prev, data]);
      setNewMessage('');
    } catch (err) {
      console.error("Failed to send message:", err);
    } finally {
      setSending(false);
    }
  };

  const handleSearchUsers = async (e) => {
    e.preventDefault();
    if (!searchMemberTerm) return;
    setSearchingUsers(true);
    try {
      const { data } = await getCommunityUsers(searchMemberTerm);
      // Filter out those who are already members
      const filtered = data.filter(u => !group.members.some(m => String(m._id || m) === String(u._id)));
      setFoundUsers(filtered);
    } catch (err) {
      console.error("Failed to search users:", err);
    } finally {
      setSearchingUsers(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await addGroupMember(id, userId);
      setFoundUsers(prev => prev.filter(u => u._id !== userId));
      fetchDetails(); // Refresh members list
    } catch (err) {
      console.error("Failed to add member:", err);
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Are you sure you want to remove this member?")) return;
    try {
      await removeGroupMember(id, userId);
      fetchDetails();
    } catch (err) {
      console.error("Failed to remove member:", err);
    }
  };

  if (loading) return <div className="py-20 flex justify-center"><LoadingSpinner /></div>;
  if (!group) return <div className="py-20 text-center font-bold text-slate-500">Group not found.</div>;

  const isOwner = group.owner?._id === currentUser?._id;
  const isMember = group.members?.some(m => String(m._id || m) === String(currentUser?._id));

  const handleJoinSelf = async () => {
    try {
      await joinGroup(id);
      fetchDetails();
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in flex flex-col h-[calc(100vh-120px)]">
      {/* Group Header - Compact for Chat */}
      <div className="flex-shrink-0 mb-6 group">
        <div className="h-32 rounded-3xl bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 overflow-hidden shadow-2xl relative">
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-slate-900/90 to-transparent flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-2xl">
                {group.profilePicture ? (
                  <img src={group.profilePicture} alt="" className="w-full h-full object-cover rounded-[14px]" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black bg-white/20 uppercase">
                    {group.name?.[0]}
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">
                  {group.name}
                </h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className={`px-2 py-0.5 backdrop-blur-md rounded-md text-[9px] font-black uppercase tracking-widest border ${group.isPrivate ? 'bg-amber-500/20 text-amber-300 border-amber-500/20' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/20'}`}>
                    {group.isPrivate ? 'Private Space' : 'Public Room'}
                  </span>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    {group.members?.length || 0} Members
                  </span>
                </div>
              </div>
            </div>
            {!isMember && !group.isPrivate && (
              <button 
                onClick={handleJoinSelf}
                className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
              >
                Join Room
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow overflow-hidden">
        {/* Chat Container */}
        <div className="lg:col-span-8 flex flex-col h-full glass-card-premium overflow-hidden border border-[var(--border-color)]">
          {/* Message List */}
          <div className="flex-grow overflow-y-auto px-6 py-8 custom-scrollbar scroll-smooth">
            {!isMember && (
              <div className="p-8 rounded-3xl bg-slate-50 border-2 border-dashed border-slate-200 text-center animate-slide-up mb-8">
                 <p className="text-slate-500 font-bold text-sm uppercase tracking-widest mb-2">Read Only Mode</p>
                 <p className="text-[var(--text-muted)] text-sm mb-4">Join the group to participate in this discussion.</p>
                 {!group.isPrivate && (
                   <button onClick={handleJoinSelf} className="btn-primary px-8">Join to Chat</button>
                 )}
              </div>
            )}

            {questions.length > 0 ? (
              <>
                <div className="flex items-center gap-4 mb-10 mt-2">
                  <div className="h-px flex-grow bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent"></div>
                  <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-50">Beginning of Conversation</span>
                  <div className="h-px flex-grow bg-gradient-to-r from-transparent via-[var(--border-color)] to-transparent"></div>
                </div>
                {questions.map(q => (
                  <GroupChatMessage 
                    key={q._id} 
                    message={q} 
                    isOwn={q.user?._id === currentUser?._id} 
                  />
                ))}
                <div ref={chatEndRef} />
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-40">
                <div className="w-16 h-16 bg-[var(--surface-overlay)] rounded-full flex items-center justify-center mb-4 transition-transform hover:scale-110 duration-500">
                  <svg className="w-8 h-8 text-[var(--text-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-[var(--text-main)]">Quiet space</h3>
                <p className="text-[var(--text-muted)] text-sm mt-1">Be the first to say something.</p>
              </div>
            )}
          </div>

          {/* Chat Input */}
          {isMember && (
            <div className="p-6 bg-[var(--surface-overlay)]/80 backdrop-blur-md border-t border-[var(--border-color)]">
              <form 
                onSubmit={handleSendMessage}
                className="relative flex items-center gap-3 bg-[var(--surface-card)] p-2 rounded-2xl border border-[var(--border-color)] focus-within:border-indigo-500/50 focus-within:ring-4 focus-within:ring-indigo-500/10 transition-all shadow-sm"
              >
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Message the group..."
                  className="flex-grow bg-transparent border-none focus:ring-0 text-sm py-2 px-4 resize-none max-h-32 min-h-[44px] text-[var(--text-main)] font-semibold placeholder:text-[var(--text-muted)] placeholder:opacity-50"
                  rows={1}
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`flex items-center justify-center w-11 h-11 rounded-xl transition-all ${
                    newMessage.trim() && !sending
                      ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:scale-105 active:scale-95'
                      : 'bg-[var(--border-color)] text-[var(--text-muted)] cursor-not-allowed opacity-50'
                  }`}
                >
                  {sending ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5 ml-0.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 2L11 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              </form>
              <div className="flex items-center gap-2 mt-3 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-[0.1em] opacity-50">
                  Members are active • Press Enter to send
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Info Sidebar - Compact */}
        <div className="lg:col-span-4 space-y-6 h-full overflow-y-auto custom-scrollbar pr-2">
          {/* About Group */}
          <div className="glass-card-premium p-6 animate-slide-up">
             <h3 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6">About this Group</h3>
             <p className="text-[var(--text-main)] font-medium leading-relaxed mb-6">
               {group.description || "A dedicated room for collaborators to share knowledge and discuss specific topics privately."}
             </p>
             <div className="pt-6 border-t border-[var(--border-color)] mt-6">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                      {group.owner?.profilePicture ? (
                        <img src={group.owner.profilePicture} alt="" className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        <span className="text-slate-400 font-bold uppercase text-xs">{group.owner?.username?.[0]}</span>
                      )}
                   </div>
                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Organized by</p>
                      <p className="text-sm font-bold text-[var(--text-main)]">{group.owner?.username}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Member Management */}
          <div className="glass-card-premium p-8 animate-slide-up" style={{ animationDelay: '100ms' }}>
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Members</h3>
                {isOwner && (
                  <button 
                    onClick={() => setAddingMember(!addingMember)}
                    className="text-indigo-600 text-[10px] font-black uppercase tracking-widest border-b-2 border-indigo-100 hover:border-indigo-600 transition-all"
                  >
                    {addingMember ? 'Close' : 'Add New'}
                  </button>
                )}
             </div>

             {addingMember && (
               <div className="mb-8 space-y-4 animate-slide-up">
                  <form onSubmit={handleSearchUsers} className="relative">
                    <input 
                      type="text" 
                      value={searchMemberTerm}
                      onChange={(e) => setSearchMemberTerm(e.target.value)}
                      placeholder="Search experts..."
                      className="input-glass !py-2.5 !text-xs !bg-slate-50/50"
                    />
                    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </form>
                  {foundUsers.length > 0 && (
                    <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                       {foundUsers.map(u => (
                         <div key={u._id} className="flex items-center justify-between p-2 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors border border-slate-100/50">
                            <div className="flex items-center gap-2">
                               <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-bold text-indigo-600">
                                  {u.username?.[0]}
                               </div>
                               <span className="text-[11px] font-bold text-slate-700">{u.username}</span>
                            </div>
                            <button 
                              onClick={() => handleAddMember(u._id)}
                              className="text-[10px] text-indigo-500 font-bold hover:underline"
                            >
                              Add
                            </button>
                         </div>
                       ))}
                    </div>
                  )}
                  {searchingUsers && <p className="text-center text-[10px] text-slate-400 animate-pulse uppercase tracking-widest">Searching...</p>}
                  <div className="h-px bg-slate-100"></div>
               </div>
             )}

             <div className="space-y-4">
                {group.members?.slice(0, 10).map(m => ( // Show first 10 members
                  <div key={m._id} className="flex items-center justify-between group/m">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden grayscale group-hover/m:grayscale-0 transition-all duration-300">
                           {m.profilePicture ? (
                             <img src={m.profilePicture} alt="" className="w-full h-full object-cover" />
                           ) : (
                             <span className="text-slate-400 font-bold text-[10px] uppercase">{m.username?.[0]}</span>
                           )}
                        </div>
                        <div>
                           <p className="text-sm font-bold text-[var(--text-main)] group-hover/m:text-indigo-600 transition-colors">{m.username}</p>
                           <p className="text-[10px] text-[var(--text-muted)] font-medium">Member</p>
                        </div>
                     </div>
                     {isOwner && m._id !== currentUser?._id && (
                       <button 
                        onClick={() => handleRemoveMember(m._id)}
                        className="opacity-0 group-hover/m:opacity-100 text-red-100 hover:text-red-500 transition-all p-1"
                       >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                       </button>
                     )}
                  </div>
                ))}
                {group.members?.length > 10 && (
                  <p className="text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest pt-2">
                    + {group.members.length - 10} more members
                  </p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
