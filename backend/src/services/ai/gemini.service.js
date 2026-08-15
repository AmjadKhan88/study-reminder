const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildWeeklyPlanPrompt } = require('./promptBuilder');
const { parseJsonArrayResponse } = require('./parseUtils');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

async function generateWeeklyBreakdown({ title, outline, totalWeeks }) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = buildWeeklyPlanPrompt({ title, outline, totalWeeks });
  const result = await model.generateContent(prompt);
  const text = result.response.text();
  return parseJsonArrayResponse(text);
}

module.exports = { generateWeeklyBreakdown };