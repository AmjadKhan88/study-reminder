import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
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

    const next = () => {
        setFlipped(false);
        setIndex((i) => Math.min(i + 1, cards.length - 1));
    };

    const prev = () => {
        setFlipped(false);
        setIndex((i) => Math.max(i - 1, 0));
    };

    if (loading) return <div className="p-8 text-center">Loading...</div>;
    if (cards.length === 0) return <div className="p-8 text-center">No flashcards for this day.</div>;

    const card = cards[index];

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className="max-w-md mx-auto p-6">
                <button onClick={() => navigate(`/courses/${id}/days/${dayNumber}`)} className="text-sm text-indigo-600 mb-4">
                    ← Back to Day
                </button>

                <p className="text-center text-sm text-gray-500 mb-4">
                    {index + 1} / {cards.length}
                </p>

                <div
                    onClick={() => setFlipped(!flipped)}
                    className="bg-white rounded-xl shadow-md p-8 min-h-[220px] flex items-center justify-center text-center cursor-pointer select-none"
                >
                    <p className="text-lg">{flipped ? card.back : card.front}</p>
                </div>
                <p className="text-center text-xs text-gray-400 mt-2">Tap card to flip</p>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={prev}
                        disabled={index === 0}
                        className="bg-white border rounded-lg px-4 py-2 text-sm disabled:opacity-40"
                    >
                        ← Prev
                    </button>
                    <button
                        onClick={next}
                        disabled={index === cards.length - 1}
                        className="bg-indigo-600 text-white rounded-lg px-4 py-2 text-sm disabled:opacity-40"
                    >
                        Next →
                    </button>
                </div>
            </div>
        </div>
    );
}