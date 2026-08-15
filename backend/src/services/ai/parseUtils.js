function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');
}

function parseJsonArrayResponse(text) {
  const cleaned = stripCodeFences(text);
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

function parseJsonObjectResponse(text) {
  const cleaned = stripCodeFences(text);
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error('AI returned invalid JSON: ' + err.message);
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    throw new Error('AI response was not a valid JSON object');
  }
  return parsed;
}

module.exports = { parseJsonArrayResponse, parseJsonObjectResponse };