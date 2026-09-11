import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookOpenCheck, Sparkles } from 'lucide-react';
import { registerUser } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const { data } = await registerUser({ ...form, timezone });
      login(data.accessToken, data.user);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
            <Sparkles size={14} /> Free to use
          </span>
          <h1 className="text-white font-bold text-4xl leading-tight" style={{ letterSpacing: '-0.03em' }}>
            Your outline becomes<br />a plan in minutes.
          </h1>
          <p className="mt-4 text-sm" style={{ color: '#A8B5AE', maxWidth: 340 }}>
            Set up your account, describe what you're learning, and get a
            day-by-day plan with flashcards and quizzes built in.
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

          <h2 className="sp-h2" style={{ fontSize: '1.8rem' }}>Create your account</h2>
          <p className="text-sm mt-2 mb-8" style={{ color: 'var(--text-muted)' }}>
            Start your first study plan today.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="sp-label">Full name</label>
              <input
                name="name"
                className="sp-input"
                placeholder="Jane Doe"
                value={form.name}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="sp-label">Email</label>
              <input
                name="email"
                type="email"
                className="sp-input"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="sp-label">Password</label>
              <input
                name="password"
                type="password"
                className="sp-input"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={handleChange}
                minLength={8}
                required
              />
            </div>

            <button type="submit" disabled={loading} className="sp-btn sp-btn-primary sp-btn-lg w-full mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-sm text-center mt-6" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}