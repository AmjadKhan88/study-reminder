const { getOrGenerateQuiz, submitQuizAttempt } = require('../services/quiz.service');

exports.getQuiz = async (req, res, next) => {
  try {
    const quiz = await getOrGenerateQuiz(req.params.id, req.userId, req.params.dayNumber);
    res.json({ quiz });
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ message: err.message });
    next(err);
  }
};

exports.submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body; // array of selected option indices, same order as quiz.questions
    const result = await submitQuizAttempt(req.params.id, req.userId, req.params.dayNumber, answers);
    res.json(result);
  } catch (err) {
    if (err.message.includes('not found')) return res.status(404).json({ message: err.message });
    next(err);
  }
};