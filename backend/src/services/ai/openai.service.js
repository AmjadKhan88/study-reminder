const OpenAI = require('openai');
const { buildWeeklyPlanPrompt } = require('./promptBuilder');
const { parseJsonArrayResponse } = require('./parseUtils');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function generateWeeklyBreakdown({ title, outline, totalWeeks }) {
  const prompt = buildWeeklyPlanPrompt({ title, outline, totalWeeks });
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
  });
  return parseJsonArrayResponse(completion.choices[0].message.content);
}

module.exports = { generateWeeklyBreakdown };