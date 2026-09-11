import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFlashcards } from '../api/flashcards.api';
import Navbar from '../components/Navbar';

export default function Flashcards() {
  const { id, dayNumber } = useParams();
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);

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

  const next = () => { setFlipped(false); setIndex((i) => Math.min(i + 1, cards.length - 1)); };
  const prev = () => { setFlipped(false); setIndex((i) => Math.max(i - 1, 0)); };

  if (loading) {
    return <div className="sp-page-bg flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>Loading...</p></div>;
  }
  if (cards.length === 0) {
    return <div className="sp-page-bg flex items-center justify-center"><p style={{ color: 'var(--text-muted)' }}>No flashcards for this day.</p></div>;
  }

  const card = cards[index];

  return (
    <div className="sp-page-bg">
      <Navbar />
      <div className="max-w-md mx-auto px-6 py-10">
        <button onClick={() => navigate(`/courses/${id}/days/${dayNumber}`)} className="flex items-center gap-1.5 text-sm mb-6" style={{ color: 'var(--text-muted)' }}>
          <ArrowLeft size={15} /> Back to day
        </button>

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
        <p className="text-center text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>Tap card to flip</p>

        <div className="flex justify-between mt-6">
          <button onClick={prev} disabled={index === 0} className="sp-btn sp-btn-white">
            <ChevronLeft size={16} /> Prev
          </button>
          <button onClick={next} disabled={index === cards.length - 1} className="sp-btn sp-btn-primary">
            Next <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}