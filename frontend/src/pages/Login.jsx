import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpenCheck, Sparkles } from 'lucide-react';
import { loginUser } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await loginUser(form);
      login(data.accessToken, data.user);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sp-root min-h-screen grid md:grid-cols-2">
      {/* Left: branding panel */}
      <div className="sp-auth-side hidden md:flex flex-col justify-between p-12">
        <a href="/" className="flex items-center gap-2 font-extrabold text-lg text-white">
          <span className="sp-logo-icon"><BookOpenCheck size={16} /></span>
          StudyPilot
        </a>

        <div>
          <span className="sp-badge mb-5">
            <Sparkles size={14} /> AI-generated, day by day
          </span>
          <h1 className="text-white font-bold text-4xl leading-tight" style={{ letterSpacing: '-0.03em' }}>
            Pick up right where<br />you left off.
          </h1>
          <p className="mt-4 text-sm" style={{ color: '#A8B5AE', maxWidth: 340 }}>
            Your plan, your streak, and your notes are waiting — log back in to
            keep the momentum going.
          </p>
        </div>

        <p className="text-xs" style={{ color: '#6B7A72' }}>
          © {new Date().getFullYear()} StudyPilot
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6" style={{ background: 'var(--bg-gradient)' }}>
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 font-extrabold text-lg mb-8">
            <span className="sp-logo-icon"><BookOpenCheck size={16} /></span>
            StudyPilot
          </div>

          <h2 className="sp-h2" style={{ fontSize: '1.8rem' }}>Welcome back</h2>
          <p className="text-sm mt-2 mb-8" style={{ color: 'var(--text-muted)' }}>
            Log in to continue your study plan.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="sp-label">Email</label>
              <input
                type="email"
                className="sp-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="sp-label">Password</label>
              <input
                type="password"
                className="sp-input"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="sp-btn sp-btn-primary sp-btn-lg w-full mt-2">
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            No account?{' '}
            <Link to="/register" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}