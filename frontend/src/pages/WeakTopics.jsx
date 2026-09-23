import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, TrendingDown } from 'lucide-react';
import { getWeakTopics } from '../api/stats.api';
import Navbar from '../components/Navbar';

export default function WeakTopics() {
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getWeakTopics();
        setTopics(data.weakTopics);
      } catch {
        toast.error('Failed to load weak topics');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return <div className="sp-page-bg flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;
  }

  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <h1 className="sp-h2" style={{ fontSize: '1.7rem' }}>Weak topics</h1>
        <p className="text-sm mt-1 mb-8" style={{ color: 'var(--text-muted)' }}>
          Topics where your quiz accuracy is below 60%, based on questions you've answered more than once.
        </p>

        {topics.length === 0 ? (
          <div className="sp-card text-center py-14">
            <p style={{ color: 'var(--text-muted)' }}>
              No weak topics yet — keep taking quizzes and this will fill in as patterns emerge.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {topics.map((t) => (
              <Link
                key={`${t.courseId}-${t.dayNumber}`}
                to={`/courses/${t.courseId}/days/${t.dayNumber}`}
                className="sp-card p-4 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <TrendingDown size={18} style={{ color: '#DC2626' }} className="shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{t.topic}</p>
                    <p className="text-xs truncate" style={{ color: 'var(--text-tertiary)' }}>
                      {t.courseTitle} · Day {t.dayNumber}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-lg font-bold" style={{ color: '#DC2626' }}>{t.accuracy}%</p>
                  <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{t.correct}/{t.correct + t.wrong} correct</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}