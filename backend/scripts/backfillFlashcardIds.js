require('dotenv').config();
const mongoose = require('mongoose');
const FlashcardSet = require('../src/models/FlashcardSet.model');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const sets = await FlashcardSet.find({});
  let updated = 0;

  for (const set of sets) {
    // Re-assigning triggers Mongoose to generate _ids and apply schema defaults
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

  console.log(`Backfilled ${updated} flashcard set(s).`);
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});