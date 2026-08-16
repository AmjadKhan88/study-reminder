function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '');
}

// AI models sometimes emit a raw backslash inside a JSON string (e.g. from
// markdown/LaTeX-style text like "\_" or "\(") that isn't a valid JSON escape
// sequence. Valid escapes are \" \\ \/ \b \f \n \r \t \uXXXX — anything else
// gets its backslash doubled so it parses as a literal backslash instead of
// breaking JSON.parse entirely.
function sanitizeInvalidEscapes(text) {
  return text.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
}

function parseJsonArrayResponse(text) {
  const cleaned = sanitizeInvalidEscapes(stripCodeFences(text));
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
  const cleaned = sanitizeInvalidEscapes(stripCodeFences(text));
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