const router = require('express').Router();
const FlashcardSet = require('../models/FlashcardSet.model');

// Protect with a one-time secret so nobody else can trigger this
router.post('/backfill-flashcards', async (req, res) => {
  if (req.headers['x-admin-secret'] !== process.env.ADMIN_MIGRATION_SECRET) {
    return res.status(403).json({ message: 'Forbidden' });
  }

  const sets = await FlashcardSet.find({});
  let updated = 0;

  for (const set of sets) {
    set.cards = set.cards.map((c) => ({
      front: c.front,
      back: c.back,
      repetitions: c.repetitions ?? 0,
      easeFactor: c.easeFactor ?? 2.5,
      interval: c.interval ?? 0,
      dueDate: c.dueDate ?? new Date(),
      lastReviewed: c.lastReviewed ?? null,
    }));
    await set.save();
    updated += 1;
  }

  res.json({ message: `Backfilled ${updated} flashcard set(s).` });
});

module.exports = router;