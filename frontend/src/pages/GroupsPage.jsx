import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyGroups, getPublicGroups, createGroup, joinGroup } from '../api/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState('mine'); // 'mine' or 'discover'
  const [groups, setGroups] = useState([]);
  const [discoverGroups, setDiscoverGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '', description: '', isPrivate: true });
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (activeTab === 'mine') {
      fetchMyGroups();
    } else {
      fetchDiscoverGroups();
    }
  }, [activeTab]);

  const fetchMyGroups = async () => {
    setLoading(true);
    try {
      const { data } = await getMyGroups();
      setGroups(data || []);
    } catch (err) {
      console.error("Failed to fetch my groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDiscoverGroups = async () => {
    setLoading(true);
    try {
      const { data } = await getPublicGroups();
      setDiscoverGroups(data || []);
    } catch (err) {
      console.error("Failed to fetch discover groups:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      await createGroup(newGroup);
      setShowCreateModal(false);
      setNewGroup({ name: '', description: '', isPrivate: true });
      fetchMyGroups();
      setActiveTab('mine');
    } catch (err) {
      console.error("Failed to create group:", err);
    } finally {
      setCreating(false);
    }
  };

  const handleJoinGroup = async (id) => {
    try {
      await joinGroup(id);
      // Move from discover to mine
      fetchDiscoverGroups();
    } catch (err) {
      console.error("Failed to join group:", err);
    }
  };

  const currentGroups = activeTab === 'mine' ? groups : discoverGroups;

  return (
    <div className="max-w-[1400px] mx-auto animate-fade-in px-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-[var(--text-main)] tracking-tight mb-2">
            Collective <span className="gradient-text">Spaces</span>
          </h1>
          <p className="text-[var(--text-muted)] font-medium text-lg">Join specialized rooms for focused industry insights.</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-premium flex items-center gap-3 group px-10 py-4"
        >
          <div className="bg-white/20 p-2 rounded-xl group-hover:rotate-90 transition-transform duration-500">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-lg">Create New Group</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-[var(--border-color)] mb-10">
        <button 
          onClick={() => setActiveTab('mine')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'mine' ? 'text-indigo-600' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          My Memberships
          {activeTab === 'mine' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
        </button>
        <button 
          onClick={() => setActiveTab('discover')}
          className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'discover' ? 'text-indigo-600' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'}`}
        >
          Discover Groups
          {activeTab === 'discover' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full"></div>}
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentGroups.map((group) => (
            <div 
              key={group._id} 
              className="glass-card-premium p-8 group hover:scale-[1.02] transition-all duration-300 relative overflow-hidden h-full flex flex-col"
            >
              {/* Decorative background element */}
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-4 mb-6 relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-0.5 shadow-lg group-hover:rotate-3 transition-transform duration-500 overflow-hidden">
                  {group.profilePicture ? (
                    <img src={group.profilePicture} alt="" className="w-full h-full object-cover rounded-[14px]" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-2xl font-black bg-white/20 uppercase">
                      {group.name?.[0]}
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-main)] group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{group.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`w-2 h-2 rounded-full ${group.isPrivate ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    <p className="text-xs font-bold text-[var(--text-muted)] tracking-widest uppercase">
                      {group.members?.length || 0} Members
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-[var(--text-muted)] line-clamp-2 mb-8 flex-grow leading-relaxed font-medium">
                {group.description || "A specialized community for deep dives and professional collaboration."}
              </p>

              <div className="pt-6 border-t border-[var(--border-color)] flex items-center justify-between mt-auto">
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black p-1 px-2 rounded-md uppercase tracking-widest ${group.isPrivate ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                    {group.isPrivate ? 'PRIVATE' : 'PUBLIC'}
                  </span>
                </div>
                
                {activeTab === 'discover' ? (
                   <button 
                    onClick={() => handleJoinGroup(group._id)}
                    className="text-indigo-600 text-xs font-black uppercase tracking-widest hover:underline flex items-center gap-1"
                   >
                     Join Room
                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                     </svg>
                   </button>
                ) : (
                   <Link 
                    to={`/groups/${group._id}`}
                    className="text-slate-400 text-xs font-black uppercase tracking-widest group-hover:text-indigo-600 transition-all flex items-center gap-1"
                   >
                     Open Stream
                     <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                     </svg>
                   </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {currentGroups.length === 0 && !loading && (
        <div className="glass-card p-16 text-center animate-slide-up">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[var(--text-main)] mb-2">
            {activeTab === 'mine' ? 'No Joined Groups' : 'No Public Groups Suggested'}
          </h2>
          <p className="max-w-md mx-auto text-[var(--text-muted)] font-medium mb-8">
            {activeTab === 'mine' 
              ? "You haven't joined any groups yet. Explore the discover tab or create your own!"
              : "Looks like there are no public groups to discover right now. Try creating one!"}
          </p>
          {activeTab === 'mine' && (
            <div className="flex gap-4 justify-center">
               <button onClick={() => setActiveTab('discover')} className="btn-secondary py-3 px-8">Find Groups</button>
               <button onClick={() => setShowCreateModal(true)} className="btn-primary py-3 px-8">Create New</button>
            </div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowCreateModal(false)}></div>
          <div className="glass-card-premium !bg-[var(--surface-card)] w-full max-w-lg p-10 relative animate-modal-pop border-[var(--border-active)]">
            <h2 className="text-3xl font-black text-[var(--text-main)] mb-2">Create a <span className="gradient-text">Group</span></h2>
            <p className="text-[var(--text-muted)] font-medium mb-8">Set up your collective space in seconds.</p>
            
            <form onSubmit={handleCreateGroup} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Group Name</label>
                <input 
                  type="text" 
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="input-glass py-4 px-5"
                  placeholder="e.g. Data Science Elites"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                <textarea 
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({...newGroup, description: e.target.value})}
                  className="textarea-glass p-5 transition-all focus:h-32"
                  placeholder="What's this group about?"
                  rows={2}
                />
              </div>
              
              <div className="flex items-center gap-3 p-4 bg-[var(--bg-main)] rounded-2xl border border-[var(--border-color)] mb-4 cursor-pointer" onClick={() => setNewGroup({...newGroup, isPrivate: !newGroup.isPrivate})}>
                <div className={`w-12 h-6 rounded-full transition-colors relative ${newGroup.isPrivate ? 'bg-amber-600' : 'bg-emerald-600'}`}>
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${newGroup.isPrivate ? 'left-7' : 'left-1'}`}></div>
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--text-main)]">{newGroup.isPrivate ? 'Private Space' : 'Public Room'}</p>
                  <p className="text-[10px] font-medium text-[var(--text-muted)]">
                    {newGroup.isPrivate ? 'Only invited members can join.' : 'Anyone can discover and join this group.'}
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-widest">
                  Cancel
                </button>
                <button type="submit" disabled={creating} className="btn-primary flex-2 py-4 px-10 shadow-xl shadow-indigo-100">
                  {creating ? 'Creating...' : 'Launch Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
