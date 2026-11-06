import { useState } from 'react';
import toast from 'react-hot-toast';
import { Database, ExternalLink, ShieldCheck, X } from 'lucide-react';
import { savePineconeKey } from '../api/auth.api';
import { useAuthStore } from '../store/authStore';

const STEPS = [
  <>Open <a href="https://app.pinecone.io" target="_blank" rel="noreferrer" style={{ color: 'var(--green-primary)', fontWeight: 600 }}>Pinecone <ExternalLink size={12} className="inline" /></a> and sign up for the free <b>Starter</b> plan (no card needed).</>,
  <>In the left menu click <b>"API keys"</b>, then copy the default key (or click <b>"Create API key"</b>).</>,
  <>Paste it below and press <b>Save key</b>. We create the storage index for you automatically (this can take up to a minute).</>,
];

export default function PineconeKeyModal() {
  const setUser = useAuthStore((s) => s.setUser);
  const open = useAuthStore((s) => s.showPineconeModal);
  const close = useAuthStore((s) => s.closePineconeModal);
  const [apiKey, setApiKey] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await savePineconeKey(apiKey.trim());
      setUser(data.user);
      setApiKey('');
      close();
      toast.success('Pinecone connected. You can upload notes now!');
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
            <span className="sp-logo-icon"><Database size={16} /></span>
            <h2 className="font-bold text-lg">Connect your Pinecone</h2>
          </div>
          <button onClick={close} aria-label="Close" style={{ color: 'var(--text-tertiary)' }}><X size={18} /></button>
        </div>

        <p className="text-sm mb-4" style={{ color: 'var(--text-muted)' }}>
          Lecture notes are stored in your own free Pinecone account so the AI can answer questions from them.
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
            placeholder="Paste your Pinecone API key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            autoComplete="off"
            spellCheck={false}
            required
          />
          <button disabled={saving || apiKey.trim().length < 20} className="sp-btn sp-btn-primary w-full">
            {saving ? 'Connecting... (may take a minute)' : 'Save key'}
          </button>
        </form>

        <p className="text-xs mt-4 flex gap-1.5" style={{ color: 'var(--text-tertiary)' }}>
          <ShieldCheck size={14} className="shrink-0 mt-0.5" />
          Your key is stored encrypted and used only to save and search your own notes. Remove it anytime in Settings.
        </p>
      </div>
    </div>
  );
}