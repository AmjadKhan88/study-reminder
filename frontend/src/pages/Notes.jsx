import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Upload, Trash2, FileText, Send } from 'lucide-react';
import { uploadNote, getNotes, deleteNote, askQuestion } from '../api/notes.api';
import AIContentRenderer from '../components/AIContentRenderer';
import Navbar from '../components/Navbar';
import SmoothLoader from '../components/SmoothLoader';

export default function Notes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [question, setQuestion] = useState('');
  const [asking, setAsking] = useState(false);
  const [answer, setAnswer] = useState(null);

  const loadNotes = useCallback(async () => {
    try {
      const { data } = await getNotes(id);
      setNotes(data.notes || []);
    } catch {
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  useEffect(() => {
    if (!notes.some((n) => n.status === 'processing')) return;
    const interval = setInterval(loadNotes, 3000);
    return () => clearInterval(interval);
  }, [notes, loadNotes]);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await uploadNote(id, file);
      toast.success('Note uploaded — processing...');
      loadNotes();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteNote(id, noteId);
      toast.success('Note deleted');
      loadNotes();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;
    setAsking(true);
    setAnswer(null);
    try {
      const { data } = await askQuestion(id, question.trim());
      setAnswer(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to get an answer');
    } finally {
      setAsking(false);
    }
  };

  const statusStyle = (status) => {
    if (status === 'ready') return { background: 'var(--green-mint)', color: 'var(--green-dark)', border: '1px solid var(--green-border)' };
    if (status === 'failed') return { background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA' };
    return { background: 'var(--bg-subtle)', color: 'var(--text-tertiary)', border: '1px solid var(--border)' };
  };



  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={() => navigate(`/courses/${id}`)} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to course
        </button>

        <h1 className="sp-h2 mb-6" style={{ fontSize: '1.7rem' }}>Lecture notes</h1>

        <label className="sp-uploader-box block cursor-pointer mb-6">
          <input type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={handleFileChange} disabled={uploading} />
          <div className="sp-uploader-icon"><Upload size={18} /></div>
          <p className="text-sm font-semibold">{uploading ? 'Uploading...' : 'Click to upload'}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>PDF, DOCX or TXT (max 20MB)</p>
        </label>

        {loading ?
          <SmoothLoader showLabel={true} label='Notes...' classes='mb-5' />
          :
          <div className="flex flex-col gap-2.5 mb-8">
            {notes.length === 0 && (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-tertiary)' }}>No notes uploaded yet.</p>
            )}
            {notes.map((note) => (
              <div key={note._id} className="sp-card p-4">
                <div className="flex justify-between items-center gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText size={16} className="mt-0.5 shrink-0" style={{ color: 'var(--green-primary)' }} />
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{note.title}</p>
                      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
                        {note.originalFilename} · {(note.fileSizeBytes / 1024).toFixed(0)} KB
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="sp-chip" style={statusStyle(note.status)}>{note.status}</span>
                    <button onClick={() => handleDelete(note._id)} className="sp-icon-btn danger">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                {note.status === 'failed' && note.errorMessage && (
                  <p className="text-xs mt-2" style={{ color: '#DC2626' }}>{note.errorMessage}</p>
                )}
                {note.status === 'ready' && note.summary && (
                  <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>{note.summary}</p>
                )}
              </div>
            ))}
          </div>
        }
        <div className="sp-card p-5">
          <h2 className="text-sm font-semibold mb-3">Ask AI about your notes</h2>
          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              className="sp-input"
              placeholder="Ask a question about your uploaded notes..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button disabled={asking} className="sp-btn sp-btn-primary" style={{ paddingInline: 16 }}>
              <Send size={15} />
            </button>
          </form>

          {answer && (
            <div className="mt-4 rounded-lg p-4" style={{ background: 'var(--green-tint)', border: '1px solid var(--green-border)' }}>
              <AIContentRenderer content={answer.answer} className="text-sm" />
              {answer.sources?.length > 0 && (
                <p className="text-xs mt-2" style={{ color: 'var(--green-dark)' }}>
                  Based on {answer.sources.length} note excerpt(s)
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}