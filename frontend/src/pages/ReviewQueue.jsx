import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { getDueFlashcards, reviewFlashcard } from '../api/flashcards.api';
import Navbar from '../components/Navbar';
import StudyReminderSkeleton from '../components/StudyReminderSkeleton';

const RATINGS = [
  { key: 'again', label: 'Again', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { key: 'hard', label: 'Hard', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  { key: 'good', label: 'Good', color: '#047857', bg: '#F0FDF4', border: '#BBF7D0' },
  { key: 'easy', label: 'Easy', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
];

export default function ReviewQueue() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getDueFlashcards();
        setCards(data.cards);
      } catch {
        toast.error('Failed to load review queue');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleRate = async (rating) => {
    const card = cards[index];
    try {
      await reviewFlashcard(card.courseId, card.dayNumber, card.cardId, rating);
      setFlipped(false);
      setIndex((i) => i + 1);
    } catch {
      toast.error('Failed to save review');
    }
  };

  if (loading) {
    return <div className="sp-page-bg flex items-center justify-center"><StudyReminderSkeleton/></div>;
  }

  if (cards.length === 0 || index >= cards.length) {
    return (
      <div className="sp-page-bg">
        <Navbar />
        <div className="max-w-md mx-auto px-6 py-10">
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
            <ArrowLeft size={15} /> Back to dashboard
          </button>
          <div className="sp-card text-center py-14">
            <p className="text-lg font-semibold mb-1">Nothing due right now 🎉</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              You're all caught up across every course.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const card = cards[index];

  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to dashboard
        </button>

        <p className="text-center text-sm mb-1" style={{ color: 'var(--text-tertiary)' }}>
          {index + 1} / {cards.length} due
        </p>
        <p className="text-center text-xs mb-4" style={{ color: 'var(--green-primary)' }}>
          {card.courseTitle} · Day {card.dayNumber}
        </p>

        <div
          onClick={() => setFlipped(!flipped)}
          className="sp-card flex items-center justify-center text-center cursor-pointer select-none p-8"
          style={{ minHeight: 220 }}
        >
          <p className="text-lg font-medium">{flipped ? card.back : card.front}</p>
        </div>
        <p className="text-center text-xs mt-2 mb-6" style={{ color: 'var(--text-tertiary)' }}>
          {flipped ? 'How well did you know this?' : 'Tap card to reveal the answer'}
        </p>

        {flipped && (
          <div className="grid grid-cols-4 gap-2">
            {RATINGS.map((r) => (
              <button
                key={r.key}
                onClick={() => handleRate(r.key)}
                className="text-sm font-semibold py-2.5 rounded-md border transition-transform hover:-translate-y-0.5"
                style={{ color: r.color, background: r.bg, borderColor: r.border }}
              >
                {r.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}