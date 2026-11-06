import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { KeyRound, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { saveGeminiKey } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

const STEPS = [
  <>Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>Google AI Studio <ExternalLink size={12} className="inline" /></a> and sign in with your Google account.</>,
  <>Click <b>"Create API key"</b>. If it asks for a project, choose <b>"Create API key in new project"</b>.</>,
  <>Copy the long key that appears (use the copy button).</>,
  <>Paste it in the box below and press <b>Save key</b>.</>,
];

// Mounted once for logged-in pages. Opens by itself when the user has no key.
export default function GeminiKeyModal() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const open = useAuthStore((s) => s.showKeyModal);
  const openKeyModal = useAuthStore((s) => s.openKeyModal);
  const closeKeyModal = useAuthStore((s) => s.closeKeyModal);

  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user && !user.hasGeminiKey) openKeyModal();
  }, [user?.id, user?.hasGeminiKey]);

  if (!open) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await saveGeminiKey(apiKey.trim());
      setUser(data.user);
      setApiKey('');
      closeKeyModal();
      toast.success('Gemini key saved. You are ready to learn!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save the key');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center p-4">
      <div className="sp-card p-6 w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ background: '#fff' }}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="sp-logo-icon"><KeyRound size={16} /></span>
            <h2 className="font-bold text-lg">Add your Gemini API key</h2>
          </div>
          <button onClick={closeKeyModal} aria-label="Close" style={{ color: 'var(--text-tertiary)' }}>
            <X size={18} />
          </button>
        </div>

        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          StudyPilot uses Google Gemini to create your lessons. Using your own free key gives you your own daily limit.
        </p>

        <ol className="flex flex-col gap-2.5 mb-5">
          {STEPS.map((s, i) => (
            <li key={i} className="flex gap-3 text-sm">
              <span className="sp-chip completed shrink-0" style={{ height: 22 }}>{i + 1}</span>
              <span>{s}</span>
            </li>
          ))}
        </ol>

        <form onSubmit={handleSave} className="flex flex-col gap-3">
          <input
            className="sp-input"
            placeholder="Paste your API key here"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            required
          />
          <button disabled={saving || apiKey.trim().length < 20} className="sp-btn sp-btn-primary w-full">
            {saving ? 'Checking key...' : 'Save key'}
          </button>
        </form>

        <p className="text-xs mt-4 flex gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
          <ShieldCheck size={14} className="shrink-0 mt-0.5" />
          Your key is stored encrypted, used only for your own requests, and you can remove it anytime in Settings.
          The free plan has daily limits that reset every day.
        </p>

        <button onClick={closeKeyModal} className="text-xs mt-3 underline" style={{ color: 'var(--text-tertiary)' }}>
          Skip for now (AI features won't work until you add a key)
        </button>
      </div>
    </div>
  );
}