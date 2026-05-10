import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { searchQuestions, getQuestions, getTopics } from '../api/api';
import QuestionCard from '../components/QuestionCard';
import TopicFilter from '../components/TopicFilter';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import NavigationSidebar from '../components/NavigationSidebar';
import EngagementSidebar from '../components/EngagementSidebar';
import { useUser } from '../context/useUser';

export default function HomePage() {
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState(searchParams.get('search') || '');
  const activeTopic = searchParams.get('tag') || '';

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const searchVal = searchParams.get('search') || '';
        const tagVal = searchParams.get('tag') || '';

        const [qRes, tRes] = await Promise.allSettled([
          searchVal || tagVal
            ? searchQuestions(searchVal, tagVal)
            : getQuestions(1),
          getTopics(),
        ]);

        if (qRes.status === 'fulfilled') {
          const data = qRes.value?.data;
          setQuestions(Array.isArray(data) ? data : (data?.questions || []));
        } else {
          setQuestions([]);
        }

        setTopics(tRes.status === 'fulfilled' ? (tRes.value?.data || []) : []);
      } catch {
        setQuestions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [searchParams]);

  // Sync searchText when URL changes (e.g. from clear search or sidebar)
  useEffect(() => {
    setSearchText(searchParams.get('search') || '');
  }, [searchParams]);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('search', searchText.trim());
    if (activeTopic) params.set('tag', activeTopic);
    navigate(`/?${params.toString()}`);
  };

  const handleTopicSelect = (topicName) => {
    const params = new URLSearchParams();
    if (searchText.trim()) params.set('search', searchText.trim());
    if (topicName) params.set('tag', topicName);
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-6 lg:gap-8">
        
        {/* Left Sidebar - Navigation */}
        <div className="hidden md:block lg:col-span-2 xl:col-span-2 py-4">
          <NavigationSidebar />
        </div>

        {/* Middle Column - Fluid Stream */}
        <main className="md:col-span-3 lg:col-span-12 xl:col-span-7 bg-[var(--surface-card)] min-h-screen relative shadow-2xl shadow-indigo-500/5 rounded-3xl overflow-hidden mb-8">
          {/* Header Area - Ultra Clean */}
          <div className="px-6 py-5 border-b border-[var(--border-color)] sticky top-0 z-30 bg-[var(--surface-overlay)] backdrop-blur-md">
            <h1 className="text-xl font-extrabold text-[var(--text-main)] tracking-tight flex items-center gap-2">
              <span className="w-1.5 h-6 bg-indigo-500 rounded-full"></span>
              Home
            </h1>
          </div>

          {/* Hero Section - Premium Clarity */}
          <div className={`${activeTopic ? 'pt-8 pb-8' : 'pt-12 pb-16'} px-8 border-b border-[var(--border-color)] bg-gradient-to-b from-[var(--hero-gradient-from)] to-transparent relative overflow-hidden`}>
            {/* Decorative Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-32 bg-indigo-400/10 blur-[100px] pointer-events-none"></div>
            
            <div className="max-w-4xl relative z-10">
              {!activeTopic && (
                <>
                  <h1 className="text-5xl md:text-7xl font-black text-[var(--text-main)] tracking-[-0.04em] leading-[0.95] mb-8">
                    Where knowledge <br />
                    meets <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-x drop-shadow-sm">clarity.</span>
                  </h1>
                  <p className="text-lg md:text-xl text-[var(--text-muted)] font-bold max-w-2xl leading-relaxed mb-12">
                    Join a global community of experts sharing insights, solving problems, and building the future of Wisora together.
                  </p>

                  <form onSubmit={handleSearch} className="relative max-w-2xl group">
                    <div className="absolute -inset-1.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[22px] blur opacity-15 group-focus-within:opacity-30 transition duration-1000"></div>
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Search for wisdom..."
                      className="relative w-full py-6 px-7 rounded-[20px] bg-[var(--surface-card)] border border-[var(--border-color)] text-[var(--text-main)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all text-xl shadow-2xl font-medium"
                    />
                    <button 
                      type="submit"
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-700 transition-all active:scale-95 shadow-xl shadow-indigo-500/20 uppercase tracking-widest text-xs"
                    >
                      Search
                    </button>
                  </form>
                </>
              )}

              {/* In-Stream Topic Filter */}
              <div className={activeTopic ? 'mt-2' : 'mt-12'}>
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-[0.25em] mb-4 ml-1">Popular Insights</h3>
                <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                  <TopicFilter
                    topics={topics}
                    activeTopic={activeTopic}
                    onSelect={handleTopicSelect}
                  />
                </div>
              </div>
            </div>
          </div>

            {/* Stream Content */}
            {loading ? (
              <div className="py-24 flex justify-center">
                <LoadingSpinner />
              </div>
            ) : (
              <div className="divide-y divide-[var(--border-color)]">
                {questions.length > 0 ? (
                  questions.map((q, i) => (
                    <QuestionCard key={q._id} question={q} index={i} />
                  ))
                ) : (
                  <div className="py-20 px-10 text-center">
                    <EmptyState
                      icon="🌊"
                      title="The stream is quiet"
                      description={
                        searchText || activeTopic
                          ? 'Try different keywords or topics'
                          : 'Be the first to start a conversation'
                      }
                      action={currentUser ? () => navigate('/ask') : null}
                      actionLabel="Ask a Question"
                    />
                  </div>
                )}
              </div>
            )}
        </main>

        {/* Right Sidebar - Engagement */}
        <div className="hidden lg:block lg:col-span-3 xl:col-span-3 py-6 px-6">
          <EngagementSidebar topics={topics} />
        </div>

      </div>
    </div>
  );
}
