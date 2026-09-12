import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft } from 'lucide-react';
import { getFlashcards, reviewFlashcard } from '../api/flashcards.api';
import Navbar from '../components/Navbar';
import StudyReminderSkeleton from '../components/StudyReminderSkeleton';

const RATINGS = [
  { key: 'again', label: 'Again', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
  { key: 'hard', label: 'Hard', color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  { key: 'good', label: 'Good', color: '#047857', bg: '#F0FDF4', border: '#BBF7D0' },
  { key: 'easy', label: 'Easy', color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
];

export default function Flashcards() {
  const { id, dayNumber } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewedCount, setReviewedCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await getFlashcards(id, dayNumber);
        setCards(data.flashcardSet?.cards || []);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to load flashcards');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, dayNumber]);

  const handleRate = async (rating) => {
    const card = cards[index];
    try {
      await reviewFlashcard(id, dayNumber, card._id, rating);
      setReviewedCount((c) => c + 1);
      setFlipped(false);
      if (index < cards.length - 1) {
        setIndex((i) => i + 1);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save review');
    }
  };

  if (loading) {
    return <div className="sp-page-bg flex items-center justify-center"><StudyReminderSkeleton/></div>;
  }
  if (cards.length === 0) {
    return <div className="sp-page-bg flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>No flashcards for this day.</p></div>;
  }

  const allReviewed = reviewedCount >= cards.length;
  const card = cards[index];

  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-10">
        <button onClick={() => navigate(`/courses/${id}/days/${dayNumber}`)} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to day
        </button>

        {allReviewed ? (
          <div className="sp-card text-center py-14">
            <p className="text-lg font-semibold mb-1">All caught up! 🎉</p>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              You reviewed {cards.length} card{cards.length !== 1 ? 's' : ''}. They'll resurface when you're due to review them again.
            </p>
          </div>
        ) : (
          <>
            <p className="text-center text-sm mb-4" style={{ color: 'var(--text-tertiary)' }}>
              {index + 1} / {cards.length}
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
          </>
        )}
      </div>
    </div>
  );
}