/**
 * SM-2 spaced repetition algorithm (SuperMemo 2).
 * quality: 0-5, where <3 means "forgot" and resets progress.
 * We expose 4 simplified ratings from the UI, mapped to quality below.
 */

const QUALITY_MAP = {
  again: 1,
  hard: 3,
  good: 4,
  easy: 5,
};

function computeNextReview(card, ratingKey) {
  const quality = QUALITY_MAP[ratingKey];
  if (quality === undefined) {
    throw new Error(`Invalid rating "${ratingKey}". Must be one of: again, hard, good, easy`);
  }

  let { repetitions = 0, easeFactor = 2.5, interval = 0 } = card;

  if (quality < 3) {
    repetitions = 0;
    interval = 1;
  } else {
    repetitions += 1;
    if (repetitions === 1) interval = 1;
    else if (repetitions === 2) interval = 6;
    else interval = Math.round(interval * easeFactor);

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    easeFactor = Math.max(easeFactor, 1.3);
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + interval);

  return { repetitions, easeFactor, interval, dueDate, lastReviewed: new Date() };
}

module.exports = { computeNextReview, QUALITY_MAP };