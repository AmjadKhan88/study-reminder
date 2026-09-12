import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, Layers, HelpCircle, Check } from 'lucide-react';
import { getDayContent, markDayComplete } from '../api/plan.api';
import api from '../api/axios';
import AIContentRenderer from '../components/AIContentRenderer';
import Navbar from '../components/Navbar';
import StudyReminderSkeleton from '../components/StudyReminderSkeleton';
import { FileDown } from 'lucide-react';
import { exportDayToPdf } from '../utils/exportPdf';
import { getCourseById } from '../api/courses.api';
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

  useEffect(() => { loadDay(); }, [id, dayNumber]);

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

  const handleExportPdf = async () => {
    try {
      const { data } = await getCourseById(id);
      const course = data.course || data;
      exportDayToPdf(course, day);
    } catch {
      toast.error('Failed to export PDF');
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

  if (loading) {
    return <div className="sp-page-bg flex items-center justify-center"><StudyReminderSkeleton /></div>;
  }
  if (!day) {
    return <div className="sp-page-bg flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>Day not found</p></div>;
  }

  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={() => navigate(`/courses/${id}`)} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to course
        </button>

        <div className="flex justify-between items-start gap-4 mb-2">
          <div>
            <span className="sp-day-badge">DAY {String(day.dayNumber).padStart(2, '0')}</span>
            <h1 className="sp-h2 mt-1" style={{ fontSize: '1.7rem' }}>{day.topic}</h1>
            {day.subtopics?.length > 0 && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>{day.subtopics.join(' · ')}</p>
            )}
          </div>
          <span className={`sp-chip ${day.status === 'completed' ? 'completed' : 'locked'}`}>
            {day.status === 'completed' ? 'Completed' : 'Pending'}
          </span>
        </div>



        <div className="flex gap-2 mt-4">
          <Link to={`/courses/${id}/days/${dayNumber}/flashcards`} className="sp-btn sp-btn-white">
            <Layers size={15} /> Flashcards
          </Link>
          <Link to={`/courses/${id}/days/${dayNumber}/quiz`} className="sp-btn sp-btn-white">
            <HelpCircle size={15} /> Quiz
          </Link>
        </div>

        <div className="flex gap-2 mt-4">
          <Link to={`/courses/${id}/days/${dayNumber}/flashcards`} className="sp-btn sp-btn-white">
            <Layers size={15} /> Flashcards
          </Link>
          <Link to={`/courses/${id}/days/${dayNumber}/quiz`} className="sp-btn sp-btn-white">
            <HelpCircle size={15} /> Quiz
          </Link>
          <button onClick={handleExportPdf} className="sp-btn sp-btn-white">
            <FileDown size={15} /> Export PDF
          </button>
        </div>

        <div className="sp-card p-6 mt-6">
          {day.content ? (
            <AIContentRenderer content={day.content} className="text-sm" />
          ) : (
            <p className="text-sm" style={{ color: 'var(--text-tertiary)' }}>No content generated yet.</p>
          )}

          {day.keyConcepts?.length > 0 && (
            <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <h3 className="text-sm font-semibold mb-2">Key concepts</h3>
              <ul className="text-sm flex flex-col gap-1.5">
                {day.keyConcepts.map((k, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: 'var(--green-primary)' }}>•</span> {k}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {day.tips?.length > 0 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold mb-2">Tips</h3>
              <ul className="text-sm flex flex-col gap-1.5" style={{ color: 'var(--text-muted)' }}>
                {day.tips.map((t, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span style={{ color: 'var(--green-primary)' }}>•</span> {t}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="sp-card p-4 mt-4 flex items-center gap-3 flex-wrap">
          <label className="text-sm font-medium">Log study time:</label>
          <input
            type="number"
            min={1}
            value={sessionMinutes}
            onChange={(e) => setSessionMinutes(Number(e.target.value))}
            className="sp-input"
            style={{ width: 80 }}
          />
          <span className="text-sm" style={{ color: 'var(--text-muted)' }}>min</span>
          <button onClick={handleLogSession} disabled={logging} className="sp-btn sp-btn-white ml-auto">
            {logging ? 'Logging...' : 'Log session'}
          </button>
        </div>

        {day.status !== 'completed' && (
          <button onClick={handleComplete} disabled={completing} className="sp-btn sp-btn-primary sp-btn-lg w-full mt-4">
            <Check size={17} /> {completing ? 'Marking...' : 'Mark day complete'}
          </button>
        )}
      </div>
    </div>
  );
}