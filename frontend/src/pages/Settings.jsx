import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Trash2 } from 'lucide-react';
import { updateProfile, changePassword, deleteAccount } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';
import Navbar from '../components/Navbar';

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    reminderTime: user?.reminderTime || '18:00',
    notificationsEnabled: user?.notificationsEnabled ?? true,
    aiProviderPreference: user?.aiProviderPreference || 'gemini',
    weeklyGoalDays: user?.weeklyGoalDays || 5,
    weeklyGoalMinutes: user?.weeklyGoalMinutes || 300,
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [savingPw, setSavingPw] = useState(false);

  const [deletePassword, setDeletePassword] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleProfileChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile({ ...profile, [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value });
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const { data } = await updateProfile(profile);
      setUser(data.user);
      toast.success('Settings saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setSavingPw(true);
    try {
      await changePassword(pwForm);
      toast.success('Password changed. Please log in again.');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await deleteAccount(deletePassword);
      toast.success('Account deleted');
      logout();
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10 flex flex-col gap-6">
        <h1 className="sp-h2" style={{ fontSize: '1.7rem' }}>Settings</h1>

        <form onSubmit={handleProfileSave} className="sp-card p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Study preferences</h2>

          <div>
            <label className="sp-label">Daily reminder time</label>
            <input type="time" name="reminderTime" className="sp-input" value={profile.reminderTime} onChange={handleProfileChange} />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="notificationsEnabled" checked={profile.notificationsEnabled} onChange={handleProfileChange} />
            Enable notifications
          </label>

          <div>
            <label className="sp-label">Preferred AI provider</label>
            <div className="grid grid-cols-3 gap-2">
              {['gemini', 'openai', 'groq'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProfile({ ...profile, aiProviderPreference: p })}
                  className="text-sm font-semibold py-2.5 rounded-md border capitalize transition-all"
                  style={
                    profile.aiProviderPreference === p
                      ? { background: 'var(--green-tint)', borderColor: 'var(--green-border)', color: 'var(--green-dark)' }
                      : { background: '#fff', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sp-label">Weekly goal (days)</label>
              <input type="number" name="weeklyGoalDays" min={1} max={7} className="sp-input" value={profile.weeklyGoalDays} onChange={handleProfileChange} />
            </div>
            <div>
              <label className="sp-label">Weekly goal (minutes)</label>
              <input type="number" name="weeklyGoalMinutes" min={0} className="sp-input" value={profile.weeklyGoalMinutes} onChange={handleProfileChange} />
            </div>
          </div>

          <button disabled={savingProfile} className="sp-btn sp-btn-primary w-full mt-1">
            {savingProfile ? 'Saving...' : 'Save preferences'}
          </button>
        </form>

        <form onSubmit={handlePasswordChange} className="sp-card p-6 flex flex-col gap-4">
          <h2 className="font-semibold text-sm">Change password</h2>
          <input type="password" placeholder="Current password" className="sp-input" value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
          <input type="password" placeholder="New password (min 8 chars)" className="sp-input" value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} minLength={8} required />
          <button disabled={savingPw} className="sp-btn sp-btn-white w-full">
            {savingPw ? 'Updating...' : 'Change password'}
          </button>
        </form>

        <div className="sp-card p-6" style={{ borderColor: '#FECACA' }}>
          <h2 className="font-semibold text-sm mb-3" style={{ color: '#DC2626' }}>Danger zone</h2>
          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="sp-icon-btn danger">
              <Trash2 size={13} /> Delete account
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                This permanently deletes your account and all data. Enter your password to confirm.
              </p>
              <input type="password" placeholder="Password" className="sp-input" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
              <div className="flex gap-2">
                <button onClick={handleDeleteAccount} disabled={deleting || !deletePassword} className="sp-btn" style={{ background: '#DC2626', color: '#fff' }}>
                  {deleting ? 'Deleting...' : 'Confirm delete'}
                </button>
                <button onClick={() => setShowDeleteConfirm(false)} className="sp-btn sp-btn-white">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}