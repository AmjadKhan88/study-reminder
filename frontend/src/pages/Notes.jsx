import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { uploadNote, getNotes, deleteNote, askQuestion } from '../api/notes.api';
import Navbar from '../components/Navbar';

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

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Poll while any note is still "processing"
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={() => navigate(`/courses/${id}`)} className="text-sm text-indigo-600 mb-4">
          ← Back to Course
        </button>

        <h1 className="text-xl font-semibold mb-4">Lecture Notes</h1>

        <label className="block bg-white rounded-xl shadow-sm p-4 text-center border-2 border-dashed cursor-pointer mb-6">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />
          <span className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload PDF, DOCX or TXT (max 20MB)'}
          </span>
        </label>

        <div className="space-y-2 mb-8">
          {notes.length === 0 && <p className="text-gray-400 text-sm text-center">No notes uploaded yet.</p>}
          {notes.map((note) => (
            <div key={note._id} className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium text-sm">{note.title}</p>
                  <p className="text-xs text-gray-400">
                    {note.originalFilename} · {(note.fileSizeBytes / 1024).toFixed(0)} KB
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${note.status === 'ready'
                        ? 'bg-green-100 text-green-700'
                        : note.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                  >
                    {note.status}
                  </span>
                  <button
                    onClick={() => handleDelete(note._id)}
                    className="text-xs text-red-500 border border-red-200 rounded px-2 py-1"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {note.status === 'failed' && note.errorMessage && (
                <p className="text-xs text-red-500 mt-2">{note.errorMessage}</p>
              )}
              {note.status === 'ready' && note.summary && (
                <p className="text-xs text-gray-500 mt-2">{note.summary}</p>
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4">
          <h2 className="font-semibold text-sm mb-3">Ask AI about your notes</h2>
          <form onSubmit={handleAsk} className="flex gap-2">
            <input
              className="flex-1 border rounded-lg px-3 py-2 text-sm"
              placeholder="Ask a question about your uploaded notes..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
            <button
              disabled={asking}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {asking ? '...' : 'Ask'}
            </button>
          </form>

          {answer && (
            <div className="mt-4 bg-gray-50 rounded-lg p-3 text-sm">
              <p>{answer.answer}</p>
              {answer.sources?.length > 0 && (
                <p className="text-xs text-gray-400 mt-2">Based on {answer.sources.length} note excerpt(s)</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}