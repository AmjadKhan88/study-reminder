const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildWeeklyPlanPrompt } = require('./promptBuilder');
const { parseJsonArrayResponse } = require('./parseUtils');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

async function generateWeeklyBreakdown({ title, outline, totalWeeks }) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = buildWeeklyPlanPrompt({ title, outline, totalWeeks });
  const result = await model.generateContent(prompt);
  return parseJsonArrayResponse(result.response.text());
}

// Generic: any prompt in, raw text out. Used by day-content, flashcards, quiz generators.
async function generateJSON(prompt) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = { generateWeeklyBreakdown, generateJSON };