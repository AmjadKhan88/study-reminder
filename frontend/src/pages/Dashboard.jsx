import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Flame, Trophy, BookOpen, Archive, ArchiveRestore, Trash2 } from 'lucide-react';
import { getMyCourses, archiveCourse, unarchiveCourse, deleteCourse } from '../api/courses.api';
import { getSummary } from '../api/stats.api';
import Navbar from '../components/Navbar';

export default function Dashboard() {
  const [courses, setCourses] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [coursesRes, summaryRes] = await Promise.all([getMyCourses(), getSummary()]);
      setCourses(coursesRes.data.courses || coursesRes.data);
      setSummary(summaryRes.data);
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

  if (loading) {
    return (
      <div className="sp-page-bg flex items-center justify-center">
        <p style={{ color: 'var(--text-muted)' }}>Loading...</p>
      </div>
    );
  }

  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 py-10">
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-10">
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
          </div>
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
    </div>
  );
}