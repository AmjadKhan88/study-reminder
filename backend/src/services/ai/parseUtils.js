function parseJsonArrayResponse(text) {
  const cleaned = text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('AI returned invalid JSON: ' + err.message);
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('AI response was not a valid non-empty array');
  }

  return parsed;
}

module.exports = { parseJsonArrayResponse };