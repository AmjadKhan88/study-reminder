const FlashcardSet = require('../models/FlashcardSet.model');
const Course = require('../models/Course.model');
const { getOrGenerateFlashcards } = require('../services/flashcard.service');
const { computeNextReview } = require('../services/spacedRepetition.service');

exports.getFlashcards = async (req, res, next) => {
  try {
    const set = await getOrGenerateFlashcards(req.params.id, req.userId, req.params.dayNumber);
    res.json({ flashcardSet: set });
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ message: err.message });
    next(err);
  }
};

exports.reviewCard = async (req, res, next) => {
  try {
    const { id, dayNumber, cardId } = req.params;
    const { rating } = req.body; // 'again' | 'hard' | 'good' | 'easy'

    const set = await FlashcardSet.findOne({ course: id, dayNumber, user: req.userId });
    if (!set) return res.status(404).json({ message: 'Flashcard set not found' });

    const card = set.cards.id(cardId);
    if (!card) return res.status(404).json({ message: 'Card not found' });

    const updated = computeNextReview(card, rating);
    Object.assign(card, updated);
    await set.save();

    res.json({ card });
  } catch (err) {
    if (err.message?.includes('Invalid rating')) return res.status(400).json({ message: err.message });
    next(err);
  }
};

exports.getDueCards = async (req, res, next) => {
  try {
    const now = new Date();

    const sets = await FlashcardSet.find({
      user: req.userId,
      'cards.dueDate': { $lte: now },
    }).populate('course', 'title');

    const due = [];
    for (const set of sets) {
      for (const card of set.cards) {
        if (card.dueDate <= now) {
          due.push({
            cardId: card._id,
            front: card.front,
            back: card.back,
            courseId: set.course._id,
            courseTitle: set.course.title,
            dayNumber: set.dayNumber,
            dueDate: card.dueDate,
          });
        }
      }
    }

    // Most overdue first
    due.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));

    res.json({ cards: due.slice(0, 50), totalDue: due.length });
  } catch (err) {
    next(err);
  }
};