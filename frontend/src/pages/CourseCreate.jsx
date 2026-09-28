import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Upload, ArrowLeft } from 'lucide-react';
import { createCourse } from '../api/courses.api';
import { generatePlan } from '../api/plan.api';
import Navbar from '../components/Navbar';
import SmoothLoader from '../components/SmoothLoader';

const PROVIDERS = [
  { value: 'gemini', label: 'Gemini' },
  { value: 'openai', label: 'OpenAI' },
  { value: 'groq', label: 'Groq' },
];

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
    <div className="sp-page-bg">

      <Navbar />
      <div className="max-w-2xl mx-auto px-6 py-10">
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-sm mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <span className="sp-badge mb-4">New course</span>
        <h1 className="sp-h2" style={{ fontSize: '1.9rem' }}>
          What are you <span className="sp-serif-accent">learning</span> next?
        </h1>
        <p className="text-sm mt-2 mb-8" style={{ color: 'var(--text-muted)' }}>
          Describe your topics and a deadline — StudyPilot builds the daily plan.
        </p>

        <form onSubmit={handleSubmit} className="sp-card p-7 flex flex-col gap-5">
          <div>
            <label className="sp-label">Title</label>
            <input
              name="title"
              className="sp-input"
              placeholder="e.g. Organic Chemistry Finals"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="sp-label">Outline / topics to cover</label>
            <textarea
              name="outline"
              rows={6}
              className="sp-input"
              style={{ resize: 'vertical', minHeight: 130 }}
              placeholder="Paste your syllabus or describe what you want to learn in detail (min 20 characters)..."
              value={form.outline}
              onChange={handleChange}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="sp-label">Duration</label>
              <input
                type="number"
                name="durationValue"
                min={1}
                max={52}
                className="sp-input"
                value={form.durationValue}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="sp-label">Unit</label>
              <select
                name="durationUnit"
                className="sp-input"
                value={form.durationUnit}
                onChange={handleChange}
              >
                <option value="weeks">Weeks</option>
                <option value="months">Months</option>
              </select>
            </div>
          </div>

          <div>
            <label className="sp-label">AI provider</label>
            <div className="grid grid-cols-3 gap-2">
              {PROVIDERS.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setForm({ ...form, aiProvider: p.value })}
                  className="text-sm font-semibold py-2.5 rounded-md border transition-all"
                  style={
                    form.aiProvider === p.value
                      ? { background: 'var(--green-tint)', borderColor: 'var(--green-border)', color: 'var(--green-dark)' }
                      : { background: '#fff', borderColor: 'var(--border)', color: 'var(--text-muted)' }
                  }
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="sp-btn sp-btn-primary sp-btn-lg w-full mt-2">
            <Upload size={17} />
            {loading ? 'Creating...' : 'Create course & generate plan'}
          </button>
        </form>
      </div>
      {
        loading && <div className='fixed inset-0 bg-black/5 h-screen w-full flex justify-center items-center'>
          <SmoothLoader showLabel={true} label='Creating' />
        </div>
      }
    </div>
  );
}