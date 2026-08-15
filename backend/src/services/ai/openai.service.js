const OpenAI = require('openai');
const { buildWeeklyPlanPrompt } = require('./promptBuilder');
const { parseJsonArrayResponse } = require('./parseUtils');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const MODEL_NAME = process.env.OPENAI_MODEL || 'gpt-4o-mini';

async function generateWeeklyBreakdown({ title, outline, totalWeeks }) {
  const prompt = buildWeeklyPlanPrompt({ title, outline, totalWeeks });
  const completion = await client.chat.completions.create({
    model: MODEL_NAME,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  });
  return parseJsonArrayResponse(completion.choices[0].message.content);
}

module.exports = { generateWeeklyBreakdown };