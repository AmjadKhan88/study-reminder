const { getOrGenerateFlashcards } = require('../services/flashcard.service');

exports.getFlashcards = async (req, res, next) => {
  try {
    const set = await getOrGenerateFlashcards(req.params.id, req.userId, req.params.dayNumber);
    res.json({ flashcardSet: set });
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ message: err.message });
    next(err);
  }
};