import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getCourseById } from '../api/courses.api';
import { getPlan, generatePlan, getCourseProgress } from '../api/plan.api';
import Navbar from '../components/Navbar';

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
        // progress may not be ready yet, non-fatal
      }
    } catch (err) {
      toast.error('Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Poll every 4s while plan is still generating
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

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!course) return <div className="p-8 text-center">Course not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-3xl mx-auto p-6">
        <button onClick={() => navigate('/dashboard')} className="text-sm text-indigo-600 mb-4">
          ← Back to Dashboard
        </button>

        <h1 className="text-2xl font-bold">{course.title}</h1>
        <p className="text-gray-500 text-sm mt-1">
          {course.durationValue} {course.durationUnit} · AI: {course.aiProvider} · {course.status}
        </p>

        {progress && (
          <div className="bg-white rounded-lg shadow-sm p-4 mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress.completedDays ?? 0} / {progress.totalDays ?? plan?.totalDays} days</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-indigo-600 h-2 rounded-full"
                style={{
                  width: `${((progress.completedDays ?? 0) / (((progress.totalDays ?? plan?.totalDays) ?? 1) || 1)) * 100}%`,
                }}
              />
            </div>
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Link
            to={`/courses/${id}/notes`}
            className="text-sm bg-white border rounded-lg px-4 py-2 shadow-sm"
          >
            📄 Lecture Notes
          </Link>
        </div>

        {plan?.generationStatus === 'pending' && (
          <div className="bg-white rounded-xl shadow-sm p-8 mt-6 text-center">
            <p className="text-gray-600">Generating your study plan with AI...</p>
            <p className="text-xs text-gray-400 mt-1">This can take up to a minute. Refreshing automatically.</p>
          </div>
        )}

        {plan?.generationStatus === 'failed' && (
          <div className="bg-white rounded-xl shadow-sm p-8 mt-6 text-center">
            <p className="text-red-500 mb-3">{plan.generationError || 'Plan generation failed.'}</p>
            <button
              onClick={handleRetry}
              disabled={retrying}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {retrying ? 'Retrying...' : 'Retry Generation'}
            </button>
          </div>
        )}

        {plan?.generationStatus === 'completed' && (
          <div className="mt-6 space-y-2">
            {plan.days.map((day) => (
              <Link
                key={day.dayNumber}
                to={`/courses/${id}/days/${day.dayNumber}`}
                className="block bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">
                      Day {day.dayNumber}: {day.topic}
                    </p>
                    <p className="text-xs text-gray-500">{day.estimatedMinutes} min</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      day.status === 'completed'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {day.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}