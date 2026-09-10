import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
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
    } catch (err) {
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto p-6">
        {summary && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard label="Current Streak" value={`${summary.currentStreak ?? 0} days`} />
            <StatCard label="Longest Streak" value={`${summary.longestStreak ?? 0} days`} />
            <StatCard label="Active Courses" value={courses.filter((c) => !c.archived).length} />
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Courses</h2>
          <Link to="/courses/new" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
            + New Course
          </Link>
        </div>

        {courses.length === 0 ? (
          <p className="text-gray-500 text-center py-12">No courses yet. Create your first one!</p>
        ) : (
          <div className="space-y-3">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow-sm p-4 flex justify-between items-center">
                <Link to={`/courses/${course._id}`} className="flex-1">
                  <h3 className="font-medium">{course.title}</h3>
                  <p className="text-sm text-gray-500">
                    {course.durationValue} {course.durationUnit} · {course.status}
                    {course.archived && ' · Archived'}
                  </p>
                </Link>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleArchiveToggle(course)}
                    className="text-xs text-gray-500 border rounded px-2 py-1"
                  >
                    {course.archived ? 'Unarchive' : 'Archive'}
                  </button>
                  <button
                    onClick={() => handleDelete(course._id)}
                    className="text-xs text-red-500 border border-red-200 rounded px-2 py-1"
                  >
                    Delete
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

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 text-center">
      <p className="text-2xl font-bold text-indigo-600">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}