import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { updateProfile, changePassword, deleteAccount, logoutUser } from '../api/auth.api';
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
    setProfile({
      ...profile,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    });
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
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto p-6 space-y-6">
        <h1 className="text-xl font-semibold">Settings</h1>

        {/* Profile / preferences */}
        <form onSubmit={handleProfileSave} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-medium">Study Preferences</h2>

          <div>
            <label className="text-sm font-medium">Daily reminder time</label>
            <input
              type="time"
              name="reminderTime"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={profile.reminderTime}
              onChange={handleProfileChange}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="notificationsEnabled"
              checked={profile.notificationsEnabled}
              onChange={handleProfileChange}
            />
            Enable notifications
          </label>

          <div>
            <label className="text-sm font-medium">Preferred AI provider</label>
            <select
              name="aiProviderPreference"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={profile.aiProviderPreference}
              onChange={handleProfileChange}
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="groq">Groq</option>
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Weekly goal (days)</label>
              <input
                type="number"
                name="weeklyGoalDays"
                min={1}
                max={7}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={profile.weeklyGoalDays}
                onChange={handleProfileChange}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Weekly goal (minutes)</label>
              <input
                type="number"
                name="weeklyGoalMinutes"
                min={0}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={profile.weeklyGoalMinutes}
                onChange={handleProfileChange}
              />
            </div>
          </div>

          <button
            disabled={savingProfile}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {savingProfile ? 'Saving...' : 'Save Preferences'}
          </button>
        </form>

        {/* Change password */}
        <form onSubmit={handlePasswordChange} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <h2 className="font-medium">Change Password</h2>
          <input
            type="password"
            placeholder="Current password"
            className="w-full border rounded-lg px-3 py-2"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="New password (min 8 chars)"
            className="w-full border rounded-lg px-3 py-2"
            value={pwForm.newPassword}
            onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            minLength={8}
            required
          />
          <button
            disabled={savingPw}
            className="w-full bg-gray-800 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {savingPw ? 'Updating...' : 'Change Password'}
          </button>
        </form>

        {/* Danger zone */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-red-200">
          <h2 className="font-medium text-red-600 mb-3">Danger Zone</h2>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-sm text-red-600 border border-red-300 rounded-lg px-4 py-2"
            >
              Delete Account
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                This permanently deletes your account and all data. Enter your password to confirm.
              </p>
              <input
                type="password"
                placeholder="Password"
                className="w-full border rounded-lg px-3 py-2"
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleting || !deletePassword}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="border px-4 py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}