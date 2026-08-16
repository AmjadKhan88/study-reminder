const { GoogleGenerativeAI } = require('@google/generative-ai');
const { buildWeeklyPlanPrompt } = require('./promptBuilder');
const { parseJsonArrayResponse } = require('./parseUtils');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

// Gemini's free tier occasionally returns 503 "high demand" errors that clear
// up within a few seconds — retrying once or twice avoids failing the whole
// generation over a transient blip, without masking real/persistent errors.
async function withRetry(fn, retries = 2, delayMs = 1500) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isOverloaded = err.message?.includes('503') || err.message?.includes('overloaded') || err.message?.includes('high demand');
      if (!isOverloaded || attempt === retries) throw err;
      console.warn(`Gemini overloaded, retrying (${attempt + 1}/${retries})...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
    }
  }
}

async function generateWeeklyBreakdown({ title, outline, totalWeeks }) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const prompt = buildWeeklyPlanPrompt({ title, outline, totalWeeks });
  const result = await withRetry(() => model.generateContent(prompt));
  return parseJsonArrayResponse(result.response.text());
}

async function generateJSON(prompt) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await withRetry(() => model.generateContent(prompt));
  return result.response.text();
}

module.exports = { generateWeeklyBreakdown, generateJSON };