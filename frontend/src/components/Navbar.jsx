import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpenCheck, Search } from 'lucide-react';
import { logoutUser } from '../api/auth.api';
import { search } from '../api/search.api';
import { useAuthStore } from '../store/authStore';

export default function Navbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults(null);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const { data } = await search(query.trim());
        setResults(data);
        setOpen(true);
      } catch {
        // silent
      }
    }, 350);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults = results && (results.courses.length || results.notes.length || results.days.length);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // ignore
    }
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <nav className="sp-navbar">
      <div className="max-w-5xl mx-auto px-6 flex items-center justify-between gap-6">
        <Link to="/dashboard" className="flex items-center gap-2 font-extrabold text-lg whitespace-nowrap">
          <span className="sp-logo-icon"><BookOpenCheck size={16} /></span>
          StudyPilot
        </Link>

        <div ref={boxRef} className="relative flex-1 max-w-sm">
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder="Search courses, notes, topics..."
              className="sp-search-input"
              style={{ paddingLeft: 34 }}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => query.length >= 2 && setOpen(true)}
            />
          </div>

          {open && (
            <div className="sp-search-dropdown">
              {!hasResults && (
                <p className="text-xs p-3" style={{ color: 'var(--text-tertiary)' }}>
                  {query.trim().length < 2 ? 'Type at least 2 characters...' : 'No results'}
                </p>
              )}

              {results?.courses.length > 0 && (
                <div>
                  <p className="sp-search-group-label">Courses</p>
                  {results.courses.map((c) => (
                    <button
                      key={c.id}
                      className="sp-search-item"
                      onClick={() => { navigate(`/courses/${c.id}`); setOpen(false); }}
                    >
                      <p className="truncate">{c.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{c.status}</p>
                    </button>
                  ))}
                </div>
              )}

              {results?.days.length > 0 && (
                <div>
                  <p className="sp-search-group-label">Days</p>
                  {results.days.map((d, i) => (
                    <button
                      key={i}
                      className="sp-search-item"
                      onClick={() => { navigate(`/courses/${d.courseId}/days/${d.dayNumber}`); setOpen(false); }}
                    >
                      <p className="truncate">Day {d.dayNumber}: {d.topic}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{d.courseTitle}</p>
                    </button>
                  ))}
                </div>
              )}

              {results?.notes.length > 0 && (
                <div>
                  <p className="sp-search-group-label">Notes</p>
                  {results.notes.map((n) => (
                    <button
                      key={n.id}
                      className="sp-search-item"
                      onClick={() => { navigate(`/courses/${n.courseId}/notes`); setOpen(false); }}
                    >
                      <p className="truncate">{n.title}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>{n.summarySnippet}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4 whitespace-nowrap">
          <Link to="/settings" className="text-sm" style={{ color: 'var(--text-muted)' }}>Settings</Link>
          <span className="text-sm font-medium">{user?.name}</span>
          <button onClick={handleLogout} className="text-sm" style={{ color: '#DC2626' }}>Logout</button>
        </div>
      </div>
    </nav>
  );
}
function SearchGroup({ title, children }) {
  return (
    <div className="border-b last:border-b-0">
      <p className="text-[10px] uppercase text-gray-400 px-3 pt-2">{title}</p>
      {children}
    </div>
  );
}

function SearchItem({ label, sub, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 hover:bg-gray-50 text-sm"
    >
      <p className="truncate">{label}</p>
      {sub && <p className="text-xs text-gray-400 truncate">{sub}</p>}
    </button>
  );
}