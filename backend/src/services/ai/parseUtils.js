function stripCodeFences(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "");
}

// AI models sometimes emit a raw backslash inside a JSON string (e.g. from
// markdown/LaTeX-style text like "\_" or "\(") that isn't a valid JSON escape
// sequence. Valid escapes are \" \\ \/ \b \f \n \r \t \uXXXX — anything else
// gets its backslash doubled so it parses as a literal backslash instead of
// breaking JSON.parse entirely.
function sanitizeInvalidEscapes(text) {
  return text.replace(/\\(?!["\\/bfnrtu])/g, "\\\\");
}

function parseJsonArrayResponse(text) {
  const cleaned = sanitizeInvalidEscapes(stripCodeFences(text));
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI returned invalid JSON: " + err.message);
  }
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error("AI response was not a valid non-empty array");
  }
  return parsed;
}

function parseJsonObjectResponse(text) {
  const cleaned = sanitizeInvalidEscapes(stripCodeFences(text));
  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI returned invalid JSON: " + err.message);
  }
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("AI response was not a valid JSON object");
  }
  return parsed;
}

// Day content uses section markers instead of JSON so LaTeX backslashes
// (\frac, \theta, ...) are never corrupted by JSON escaping.
function parseDayContentResponse(text) {
  let t = text.trim();
  if (t.startsWith("```"))
    t = t.replace(/^```[^\n]*\n/, "").replace(/\n```\s*$/, "");

  const re = /^===(CONTENT|KEY_CONCEPTS|TIPS)===[ \t]*$/gm;
  const marks = [];
  let m;
  while ((m = re.exec(t)))
    marks.push({ name: m[1], bodyStart: re.lastIndex, start: m.index });

  const sections = {};
  marks.forEach((mk, i) => {
    sections[mk.name] = t
      .slice(mk.bodyStart, i + 1 < marks.length ? marks[i + 1].start : t.length)
      .trim();
  });

  if (!sections.CONTENT)
    throw new Error(
      "AI response was not in the expected format. Please try again.",
    );

  const toList = (s) =>
    (s || "")
      .split("\n")
      .map((l) => l.replace(/^\s*[-*•]\s*/, "").trim())
      .filter(Boolean);

  return {
    content: sections.CONTENT,
    keyConcepts: toList(sections.KEY_CONCEPTS),
    tips: toList(sections.TIPS),
  };
}

module.exports = {
  parseJsonArrayResponse,
  parseJsonObjectResponse,
  parseDayContentResponse,
};
