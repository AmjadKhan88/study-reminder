import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getDayContent, markDayComplete } from '../api/plan.api';
import api from '../api/axios';
import Navbar from '../components/Navbar';

export default function DayContent() {
  const { id, dayNumber } = useParams();
  const navigate = useNavigate();
  const [day, setDay] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(30);
  const [logging, setLogging] = useState(false);

  const loadDay = async () => {
    setLoading(true);
    try {
      const { data } = await getDayContent(id, dayNumber);
      setDay(data.day || data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load day content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDay();
  }, [id, dayNumber]);

  const handleComplete = async () => {
    setCompleting(true);
    try {
      await markDayComplete(id, dayNumber);
      toast.success('Day marked as complete!');
      loadDay();
    } catch {
      toast.error('Failed to mark complete');
    } finally {
      setCompleting(false);
    }
  };

const handleLogSession = async () => {
  setLogging(true);
  try {
    const now = new Date();
    const startedAt = new Date(now.getTime() - sessionMinutes * 60000);
    await api.post(`/courses/${id}/days/${dayNumber}/sessions`, {
      targetMinutes: sessionMinutes,
      actualMinutes: sessionMinutes,
      completedFully: true,
      startedAt: startedAt.toISOString(),
      endedAt: now.toISOString(),
    });
    toast.success('Study session logged');
  } catch {
    toast.error('Failed to log session');
  } finally {
    setLogging(false);
  }
};

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!day) return <div className="p-8 text-center">Day not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto p-6">
        <button onClick={() => navigate(`/courses/${id}`)} className="text-sm text-indigo-600 mb-4">
          ← Back to Course
        </button>

        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">
              Day {day.dayNumber}: {day.topic}
            </h1>
            {day.subtopics?.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{day.subtopics.join(' · ')}</p>
            )}
          </div>
          <span
            className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
              day.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
            }`}
          >
            {day.status}
          </span>
        </div>

        <div className="flex gap-2 mt-4">
          <Link
            to={`/courses/${id}/days/${dayNumber}/flashcards`}
            className="text-sm bg-white border rounded-lg px-3 py-2 shadow-sm"
          >
            🗂️ Flashcards
          </Link>
          <Link
            to={`/courses/${id}/days/${dayNumber}/quiz`}
            className="text-sm bg-white border rounded-lg px-3 py-2 shadow-sm"
          >
            📝 Quiz
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
          {day.content ? (
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">{day.content}</div>
          ) : (
            <p className="text-gray-400 text-sm">No content generated yet.</p>
          )}

          {day.keyConcepts?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Key Concepts</h3>
              <ul className="list-disc list-inside text-sm space-y-1">
                {day.keyConcepts.map((k, i) => (
                  <li key={i}>{k}</li>
                ))}
              </ul>
            </div>
          )}

          {day.tips?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-2">Tips</h3>
              <ul className="list-disc list-inside text-sm space-y-1 text-gray-600">
                {day.tips.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Session logging */}
        <div className="bg-white rounded-xl shadow-sm p-4 mt-4 flex items-center gap-3">
          <label className="text-sm">Log study time:</label>
          <input
            type="number"
            min={1}
            value={sessionMinutes}
            onChange={(e) => setSessionMinutes(Number(e.target.value))}
            className="border rounded-lg px-2 py-1 w-20 text-sm"
          />
          <span className="text-sm text-gray-500">min</span>
          <button
            onClick={handleLogSession}
            disabled={logging}
            className="ml-auto text-sm bg-gray-100 px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            {logging ? 'Logging...' : 'Log Session'}
          </button>
        </div>

        {day.status !== 'completed' && (
          <button
            onClick={handleComplete}
            disabled={completing}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-4 disabled:opacity-50"
          >
            {completing ? 'Marking...' : 'Mark Day Complete'}
          </button>
        )}
      </div>
    </div>
  );
}