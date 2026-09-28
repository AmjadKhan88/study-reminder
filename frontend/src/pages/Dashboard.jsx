import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Flame, Trophy, BookOpen, Layers, Archive, Snowflake, ArchiveRestore, Trash2, TrendingDown, ArrowRight, PlayCircle } from 'lucide-react';
import { getMyCourses, archiveCourse, unarchiveCourse, deleteCourse } from '../api/courses.api';
import { getSummary } from '../api/stats.api';
import Navbar from '../components/Navbar';
import { getDueFlashcards } from '../api/flashcards.api';
import SmoothLoader from '../components/SmoothLoader';
export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dueCount, setDueCount] = useState(0);
  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, summaryRes, dueRes] = await Promise.all([getMyCourses(), getSummary(), getDueFlashcards()]);
      setCourses(coursesRes.data.courses || coursesRes.data);
      setSummary(summaryRes.data);
      setDueCount(dueRes.data.totalDue);
    } catch {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleArchiveToggle = async (course) => {
    try {
      if (course.archived) await unarchiveCourse(course._id);
      else await archiveCourse(course._id);
      loadData();
    } catch {
      toast.error('Action failed');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this course permanently?')) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted');
      loadData();
    } catch {
      toast.error('Delete failed');
    }
  };



  return (
    <div className="sp-page-bg">
      <Navbar />
      {loading ?
        <div className="sp-page-bg flex items-center justify-center">
          <SmoothLoader showLabel={true} label='Dashboard...' />
        </div>
        :
        <div className="max-w-5xl mx-auto px-6 py-10">
          {dueCount > 0 && (
            <Link
              to="/review"
              className="sp-card p-4 mb-6 flex items-center justify-between"
              style={{ background: 'var(--green-tint)', borderColor: 'var(--green-border)' }}
            >
              <div className="flex items-center gap-3">
                <Layers size={18} style={{ color: 'var(--green-dark)' }} />
                <div>
                  <p className="font-semibold text-sm" style={{ color: 'var(--green-dark)' }}>
                    {dueCount} card{dueCount !== 1 ? 's' : ''} due for review
                  </p>
                  <p className="text-xs" style={{ color: 'var(--green-dark)' }}>Tap to start reviewing</p>
                </div>
              </div>
              <span className="sp-btn sp-btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>Review now</span>
            </Link>
          )}
          {summary && (
            <div className="grid grid-cols-5 gap-4 mb-10">
              <div className="sp-stat-card">
                <div className="flex justify-center mb-2"><Flame size={18} style={{ color: 'var(--green-primary)' }} /></div>
                <p className="sp-stat-value">{summary.currentStreak ?? 0}</p>
                <p className="sp-stat-label">Current streak (days)</p>
              </div>
              <div className="sp-stat-card">
                <div className="flex justify-center mb-2"><Trophy size={18} style={{ color: 'var(--green-primary)' }} /></div>
                <p className="sp-stat-value">{summary.longestStreak ?? 0}</p>
                <p className="sp-stat-label">Longest streak (days)</p>
              </div>
              <div className="sp-stat-card">
                <div className="flex justify-center mb-2"><BookOpen size={18} style={{ color: 'var(--green-primary)' }} /></div>
                <p className="sp-stat-value">{courses.filter((c) => !c.archived).length}</p>
                <p className="sp-stat-label">Active courses</p>
              </div>
              <Link to="/weak-topics" className="sp-stat-card" style={{ textDecoration: 'none' }}>
                <div className="flex justify-center mb-2"><TrendingDown size={18} style={{ color: '#DC2626' }} /></div>
                <p className="sp-stat-value" style={{ color: '#DC2626' }}>Review</p>
                <p className="sp-stat-label">Weak topics</p>
              </Link>
              <div className="sp-stat-card">
                <div className="flex justify-center mb-2">
                  <Snowflake size={18} style={{ color: summary.streakFreezesAvailable > 0 ? '#2563EB' : 'var(--text-tertiary)' }} />
                </div>
                <p className="sp-stat-value" style={{ color: summary.streakFreezesAvailable > 0 ? '#2563EB' : 'var(--text-tertiary)' }}>
                  {summary.streakFreezesAvailable ?? 0}
                </p>
                <p className="sp-stat-label">Streak freeze available</p>
              </div>
            </div>
          )}

          {summary?.todayTask && (
            <Link
              to={`/courses/${summary.todayTask.courseId}/days/${summary.todayTask.dayNumber}`}
              className="sp-card p-6 mb-8 flex items-center justify-between gap-4 transition-all"
              style={{ background: 'var(--text-main)', border: 'none' }}
            >
              <div className="flex items-center gap-4 min-w-0">
                <div
                  className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center"
                  style={{ background: 'var(--green-primary)' }}
                >
                  <PlayCircle size={22} color="#fff" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium mb-0.5" style={{ color: '#6EE7B7' }}>
                    Continue where you left off
                  </p>
                  <p className="font-semibold text-white truncate">
                    Day {summary.todayTask.dayNumber}: {summary.todayTask.topic}
                  </p>
                  <p className="text-sm truncate" style={{ color: '#A8B5AE' }}>
                    {summary.todayTask.courseTitle}
                  </p>
                </div>
              </div>
              <ArrowRight size={20} color="#fff" className="shrink-0" />
            </Link>
          )}

          <div className="flex justify-between items-center mb-5">
            <h2 className="sp-h2" style={{ fontSize: '1.5rem' }}>Your courses</h2>
            <Link to="/courses/new" className="sp-btn sp-btn-primary">
              <Plus size={16} /> New course
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="sp-card text-center py-16">
              <p style={{ color: 'var(--text-muted)' }}>No courses yet. Create your first one to get a daily plan.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {courses.map((course) => (
                <div key={course._id} className="sp-card p-5 flex justify-between items-center transition-all">
                  <Link to={`/courses/${course._id}`} className="flex-1">
                    <h3 className="font-semibold">{course.title}</h3>
                    <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {course.durationValue} {course.durationUnit} · {course.status}
                      {course.archived && ' · Archived'}
                    </p>
                  </Link>
                  <div className="flex gap-2">
                    <button onClick={() => handleArchiveToggle(course)} className="sp-icon-btn">
                      {course.archived ? <ArchiveRestore size={13} /> : <Archive size={13} />}
                      {course.archived ? 'Unarchive' : 'Archive'}
                    </button>
                    <button onClick={() => handleDelete(course._id)} className="sp-icon-btn danger">
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      }
    </div>
  );
}