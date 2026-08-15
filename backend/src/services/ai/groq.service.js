const Groq = require('groq-sdk');
const { buildWeeklyPlanPrompt } = require('./promptBuilder');
const { parseJsonArrayResponse } = require('./parseUtils');

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateWeeklyBreakdown({ title, outline, totalWeeks }) {
  const prompt = buildWeeklyPlanPrompt({ title, outline, totalWeeks });
  const completion = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  });
  return parseJsonArrayResponse(completion.choices[0].message.content);
}

module.exports = { generateWeeklyBreakdown };