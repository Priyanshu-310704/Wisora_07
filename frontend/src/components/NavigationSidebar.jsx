import { Link, useLocation } from 'react-router-dom';

export default function NavigationSidebar() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ), path: '/' },
    { label: 'Topics', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ), path: '/topics' },
    { label: 'Groups', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ), path: '/groups' },
    { label: 'Community', icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ), path: '/community' },
  ];

  return (
    <nav className="space-y-1 sticky top-6 hidden md:block">
      <div className="px-4 mb-6">
        <h3 className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
          Menu
        </h3>
      </div>
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-300 group ${
              isActive 
                ? 'bg-indigo-500/10 text-indigo-600 font-bold shadow-sm shadow-indigo-500/5 border border-indigo-500/20' 
                : 'text-[var(--text-muted)] hover:bg-[var(--border-color)] hover:text-[var(--text-main)] border border-transparent hover:border-[var(--border-subtle)]'
            }`}
          >
            <div className={`${isActive ? 'text-indigo-600 scale-110' : 'text-[var(--text-muted)] group-hover:text-indigo-500'} transition-all duration-300`}>
              {item.icon}
            </div>
            <span className="text-sm font-semibold tracking-tight">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
