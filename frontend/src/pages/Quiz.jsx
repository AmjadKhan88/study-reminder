import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
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
    if (result) return;
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
      toast.success(`Score: ${data.score}%`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="sp-page-bg flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;
  }
  if (!quiz) {
    return <div className="sp-page-bg flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>Quiz not found</p></div>;
  }

  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-xl mx-auto px-6 py-10">
        <button onClick={() => navigate(`/courses/${id}/days/${dayNumber}`)} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to day
        </button>

        {result && (
          <div className="sp-card text-center py-6 mb-6" style={{ background: 'var(--green-tint)', borderColor: 'var(--green-border)' }}>
            <p className="text-2xl font-bold" style={{ color: 'var(--green-dark)' }}>
              {result.score}% <span className="text-base font-normal">({result.correct}/{result.total})</span>
            </p>
            {result.bestScore != null && (
              <p className="text-xs mt-1" style={{ color: 'var(--green-dark)' }}>Best score: {result.bestScore}%</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-4">
          {quiz.questions.map((q, qi) => (
            <div key={qi} className="sp-card p-5">
              <p className="font-medium mb-3">{qi + 1}. {q.question}</p>
              <div className="flex flex-col gap-2">
                {q.options.map((opt, oi) => {
                  const isSelected = answers[qi] === oi;
                  const isCorrect = result && oi === q.correctIndex;
                  const isWrongPick = result && isSelected && oi !== q.correctIndex;

                  let style = { borderColor: 'var(--border)', background: '#fff' };
                  if (isSelected && !result) style = { borderColor: 'var(--green-primary)', background: 'var(--green-tint)' };
                  if (isCorrect) style = { borderColor: 'var(--green-primary)', background: 'var(--green-tint)' };
                  if (isWrongPick) style = { borderColor: '#FCA5A5', background: '#FEF2F2' };

                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => selectAnswer(qi, oi)}
                      className="w-full text-left rounded-lg px-3 py-2.5 text-sm border transition-colors"
                      style={style}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {result && q.explanation && (
                <p className="text-xs mt-3 italic" style={{ color: 'var(--text-tertiary)' }}>{q.explanation}</p>
              )}
            </div>
          ))}
        </div>

        {!result && (
          <button onClick={handleSubmit} disabled={submitting} className="sp-btn sp-btn-primary sp-btn-lg w-full mt-6">
            {submitting ? 'Submitting...' : 'Submit quiz'}
          </button>
        )}
      </div>
    </div>
  );
}