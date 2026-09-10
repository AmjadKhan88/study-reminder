import { useState, useEffect, useRef } from 'react';
import { search } from '../api/search.api';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { logoutUser } from '../api/auth.api';
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
      }
    }, 350); // debounce
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const hasResults =
    results && (results.courses.length || results.notes.length || results.days.length);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
    }
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

 return (
  <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center gap-4">
    <Link to="/dashboard" className="font-bold text-indigo-600 text-lg whitespace-nowrap">
      StudyPilot
    </Link>

    <div ref={boxRef} className="relative flex-1 max-w-sm">
      <input
        type="text"
        placeholder="Search courses, notes, topics..."
        className="w-full border rounded-lg px-3 py-1.5 text-sm"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.length >= 2 && setOpen(true)}
      />

      {open && (
        <div className="absolute top-full mt-1 w-full bg-white rounded-lg shadow-lg border max-h-96 overflow-y-auto z-50">
          {!hasResults && (
            <p className="text-xs text-gray-400 p-3">
              {query.trim().length < 2 ? 'Type at least 2 characters...' : 'No results'}
            </p>
          )}

          {results?.courses.length > 0 && (
            <SearchGroup title="Courses">
              {results.courses.map((c) => (
                <SearchItem
                  key={c.id}
                  label={c.title}
                  sub={c.status}
                  onClick={() => {
                    navigate(`/courses/${c.id}`);
                    setOpen(false);
                  }}
                />
              ))}
            </SearchGroup>
          )}

          {results?.days.length > 0 && (
            <SearchGroup title="Days">
              {results.days.map((d, i) => (
                <SearchItem
                  key={i}
                  label={`Day ${d.dayNumber}: ${d.topic}`}
                  sub={d.courseTitle}
                  onClick={() => {
                    navigate(`/courses/${d.courseId}/days/${d.dayNumber}`);
                    setOpen(false);
                  }}
                />
              ))}
            </SearchGroup>
          )}

          {results?.notes.length > 0 && (
            <SearchGroup title="Notes">
              {results.notes.map((n) => (
                <SearchItem
                  key={n.id}
                  label={n.title}
                  sub={n.summarySnippet}
                  onClick={() => {
                    navigate(`/courses/${n.courseId}/notes`);
                    setOpen(false);
                  }}
                />
              ))}
            </SearchGroup>
          )}
        </div>
      )}
    </div>

    <div className="flex items-center gap-4 whitespace-nowrap">
      <Link to="/settings" className="text-sm text-gray-600 hover:text-indigo-600">Settings</Link>
      <span className="text-sm text-gray-500">{user?.name}</span>
      <button onClick={handleLogout} className="text-sm text-red-500 hover:text-red-700">
        Logout
      </button>
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