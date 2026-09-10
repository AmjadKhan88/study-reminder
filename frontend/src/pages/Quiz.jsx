import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getQuiz, submitQuiz } from '../api/quiz.api';
import Navbar from '../components/Navbar';

export default function Quiz() {
  const { id, dayNumber } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getQuiz(id, dayNumber);
        setQuiz(data.quiz);
        setAnswers(new Array(data.quiz.questions.length).fill(null));
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load quiz');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, dayNumber]);

  const selectAnswer = (qIndex, optionIndex) => {
    if (result) return; // lock after submit
    const next = [...answers];
    next[qIndex] = optionIndex;
    setAnswers(next);
  };

  const handleSubmit = async () => {
    if (answers.includes(null)) {
      toast.error('Answer all questions before submitting');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await submitQuiz(id, dayNumber, answers);
      setResult(data);
      toast.success(`Score: ${data.score ?? '—'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!quiz) return <div className="p-8 text-center">Quiz not found</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto p-6">
        <button onClick={() => navigate(`/courses/${id}/days/${dayNumber}`)} className="text-sm text-indigo-600 mb-4">
          ← Back to Day
        </button>

        {result && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 text-center">
            <p className="text-lg font-semibold">
              Score: {result.score}% ({result.correct}/{result.total})
            </p>
            {result.bestScore != null && (
              <p className="text-xs text-gray-500 mt-1">Best score: {result.bestScore}%</p>
            )}
          </div>
        )}

        <div className="space-y-5">
          {quiz.questions.map((q, qi) => (
            <div key={qi} className="bg-white rounded-xl shadow-sm p-4">
              <p className="font-medium mb-3">
                {qi + 1}. {q.question}
              </p>
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = result && oi === q.correctIndex;
                  const isWrongPick = result && isSelected && oi !== q.correctIndex;

                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => selectAnswer(qi, oi)}
                      className={`w-full text-left border rounded-lg px-3 py-2 text-sm transition
                        ${isSelected && !result ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}
                        ${isCorrect ? 'border-green-500 bg-green-50' : ''}
                        ${isWrongPick ? 'border-red-500 bg-red-50' : ''}
                      `}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {result && q.explanation && (
                <p className="text-xs text-gray-500 mt-3 italic">{q.explanation}</p>
              )}
            </div>
          ))}
        </div>

        {!result && (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-indigo-600 text-white py-2 rounded-lg mt-6 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        )}
      </div>
    </div>
  );
}