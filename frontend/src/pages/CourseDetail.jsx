import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, FileText, Check, Clock, Lock, RotateCcw } from 'lucide-react';
import { getCourseById } from '../api/courses.api';
import { getPlan, generatePlan, getCourseProgress } from '../api/plan.api';
import Navbar from '../components/Navbar';
import StudyReminderSkeleton from '../components/StudyReminderSkeleton';
import { FileDown } from 'lucide-react';
import { exportCourseToPdf } from '../utils/exportPdf';
export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [plan, setPlan] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [courseRes, planRes] = await Promise.all([getCourseById(id), getPlan(id)]);
      setCourse(courseRes.data.course || courseRes.data);
      setPlan(planRes.data.plan || planRes.data);

      try {
        const progressRes = await getCourseProgress(id);
        setProgress(progressRes.data);
      } catch {
        // not ready yet
      }
    } catch {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    if (plan?.generationStatus !== 'pending') return;
    const interval = setInterval(loadData, 4000);
    return () => clearInterval(interval);
  }, [plan?.generationStatus, loadData]);

  const handleRetry = async () => {
    setRetrying(true);
    try {
      await generatePlan(id);
      toast.success('Regenerating plan...');
      loadData();
    } catch {
      toast.error('Failed to start generation');
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div className="sp-page-bg flex items-center justify-center">
        <StudyReminderSkeleton />
      </div>
    );
  }
  if (!course) {
    return (
      <div className="sp-page-bg flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Course not found</p>
      </div>
    );
  }

  const progressPct = progress
    ? ((progress.completedDays ?? 0) / (progress.totalDays ?? (plan?.totalDays || 1))) * 100
    : 0;

  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <div className="flex justify-between items-start flex-wrap gap-3 mb-6">
          <div>
            <h1 className="sp-h2" style={{ fontSize: '1.9rem' }}>{course.title}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              {course.durationValue} {course.durationUnit} · AI: {course.aiProvider} · {course.status}
            </p>
          </div>
          <div className="flex gap-2">
            <Link to={`/courses/${id}/notes`} className="sp-btn sp-btn-white">
              <FileText size={15} /> Lecture notes
            </Link>
            {plan?.generationStatus === 'completed' && (
              <button onClick={() => exportCourseToPdf(course, plan)} className="sp-btn sp-btn-white">
                <FileDown size={15} /> Export plan (PDF)
              </button>
            )}
          </div>
          <Link to={`/courses/${id}/notes`} className="sp-btn sp-btn-white">
            <FileText size={15} /> Lecture notes
          </Link>
        </div>

        {progress && (
          <div className="sp-card p-5 mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: 'var(--text-muted)' }}>Progress</span>
              <span className="font-semibold">
                {progress.completedDays ?? 0} / {progress.totalDays ?? plan?.totalDays} days
              </span>
            </div>
            <div className="sp-progress-track">
              <div className="sp-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        )}

        {plan?.generationStatus === 'pending' && (
          <div className="sp-card text-center py-14">
            <span className="sp-pulse-ring inline-block mb-4" />
            <p style={{ color: 'var(--text-muted)' }}>Generating your study plan with AI...</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
              This can take up to a minute. Refreshing automatically.
            </p>
          </div>
        )}

        {plan?.generationStatus === 'failed' && (
          <div className="sp-card text-center py-14">
            <p className="mb-4" style={{ color: '#DC2626' }}>
              {plan.generationError || 'Plan generation failed.'}
            </p>
            <button onClick={handleRetry} disabled={retrying} className="sp-btn sp-btn-primary">
              <RotateCcw size={15} /> {retrying ? 'Retrying...' : 'Retry generation'}
            </button>
          </div>
        )}

        {plan?.generationStatus === 'completed' && (
          <div className="flex flex-col gap-2.5">
            {plan.days.map((day) => (
              <Link key={day.dayNumber} to={`/courses/${id}/days/${day.dayNumber}`} className="sp-day-card">
                <span className="sp-day-badge">DAY {String(day.dayNumber).padStart(2, '0')}</span>
                <div className="sp-topic">
                  <h5>{day.topic}</h5>
                  <p>{day.estimatedMinutes} min</p>
                </div>
                <span className={`sp-chip ${day.status === 'completed' ? 'completed' : 'locked'}`}>
                  {day.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
                <span style={{ color: 'var(--text-tertiary)' }}>
                  {day.status === 'completed' ? <Check size={15} /> : <Clock size={15} />}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}