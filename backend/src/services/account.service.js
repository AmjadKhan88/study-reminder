const User = require('../models/User.model');
const Course = require('../models/Course.model');
const StudyPlan = require('../models/StudyPlan.model');
const FlashcardSet = require('../models/FlashcardSet.model');
const Quiz = require('../models/Quiz.model');
const LectureNote = require('../models/LectureNote.model');
const { deleteByUser } = require('./vectorStore.service');

// Deletes everything belonging to a user across every collection, plus their
// vectors in Qdrant. Order matters here: delete dependents (plans, notes,
// etc.) before the user itself, so nothing is left orphaned if a step fails
// partway through.
async function deleteAccountCompletely(userId) {
  await StudyPlan.deleteMany({ user: userId });
  await FlashcardSet.deleteMany({ user: userId });
  await Quiz.deleteMany({ user: userId });
  await LectureNote.deleteMany({ user: userId });
  await Course.deleteMany({ user: userId });

  try {
    await deleteByUser(userId);
  } catch (err) {
    console.error(`Failed to delete Qdrant vectors for user ${userId}:`, err.message);
    // Don't block account deletion on this — log it for manual cleanup if needed.
  }

  await User.findByIdAndDelete(userId);
}

module.exports = { deleteAccountCompletely };