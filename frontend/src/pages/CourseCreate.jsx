import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { createCourse } from '../api/courses.api';
import { generatePlan } from '../api/plan.api';
import Navbar from '../components/Navbar';

export default function CourseCreate() {
  const [form, setForm] = useState({
    title: '',
    outline: '',
    durationValue: 4,
    durationUnit: 'weeks',
    aiProvider: 'gemini',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'durationValue' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.outline.trim().length < 20) {
      toast.error('Outline must be at least 20 characters');
      return;
    }
    setLoading(true);
    try {
      const { data } = await createCourse(form);
      const courseId = data.course?._id || data._id;
      toast.success('Course created — generating your study plan...');

      // Kick off AI plan generation right away
      try {
        await generatePlan(courseId);
      } catch {
        toast.error('Course created, but plan generation failed. You can retry from the course page.');
      }

      navigate(`/courses/${courseId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto p-6">
        <h1 className="text-xl font-semibold mb-4">Create a New Course</h1>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-4">
          <div>
            <label className="text-sm font-medium">Title</label>
            <input
              name="title"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Outline / topics to cover</label>
            <textarea
              name="outline"
              rows={5}
              className="w-full border rounded-lg px-3 py-2 mt-1"
              placeholder="Describe what you want to learn in detail (min 20 characters)..."
              value={form.outline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium">Duration</label>
              <input
                type="number"
                name="durationValue"
                min={1}
                max={52}
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={form.durationValue}
                onChange={handleChange}
                required
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Unit</label>
              <select
                name="durationUnit"
                className="w-full border rounded-lg px-3 py-2 mt-1"
                value={form.durationUnit}
                onChange={handleChange}
              >
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">AI Provider</label>
            <select
              name="aiProvider"
              className="w-full border rounded-lg px-3 py-2 mt-1"
              value={form.aiProvider}
              onChange={handleChange}
            >
              <option value="gemini">Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="groq">Groq</option>
            </select>
          </div>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Course & Generate Plan'}
          </button>
        </form>
      </div>
    </div>
  );
}