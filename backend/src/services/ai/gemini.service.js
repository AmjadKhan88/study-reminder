const { GoogleGenerativeAI } = require("@google/generative-ai");
const { buildWeeklyPlanPrompt } = require("./promptBuilder");
const { parseJsonArrayResponse } = require("./parseUtils");

const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-2.5-flash";

function normalizeGeminiError(err) {
  const msg = err?.message || "";
  if (
    /API key not valid|API_KEY_INVALID|API key expired|PERMISSION_DENIED/i.test(
      msg,
    )
  ) {
    const e = new Error(
      "Your Gemini API key is invalid, expired, or has no access. Please update it in Settings.",
    );
    e.statusCode = 400;
    e.apiCode = "GEMINI_KEY_INVALID";
    return e;
  }
  if (/429|quota|RESOURCE_EXHAUSTED|rate limit/i.test(msg)) {
    const e = new Error(
      "Your Gemini API key reached its limit. Wait a little (limits reset daily) or add a different key in Settings.",
    );
    e.statusCode = 429;
    e.apiCode = "GEMINI_QUOTA_EXCEEDED";
    return e;
  }
  return err;
}

async function withRetry(fn, retries = 2, delayMs = 1500) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const overloaded = /503|overloaded|high demand/i.test(err?.message || "");
      if (!overloaded || attempt === retries) throw normalizeGeminiError(err);
      console.warn(
        `Gemini overloaded, retrying (${attempt + 1}/${retries})...`,
      );
      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }
}

// Builds a provider bound to ONE user's API key.
function createGeminiProvider(apiKey) {
  const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: MODEL_NAME,
  });

  async function generateJSON(prompt) {
    const result = await withRetry(() => model.generateContent(prompt));
    return result.response.text();
  }

  async function generateWeeklyBreakdown({
    title,
    outline,
    totalWeeks,
    difficulty,
  }) {
    const text = await generateJSON(
      buildWeeklyPlanPrompt({ title, outline, totalWeeks, difficulty }),
    );
    return parseJsonArrayResponse(text);
  }

  return { generateJSON, generateWeeklyBreakdown };
}

// Used when the user saves a key: confirms Google accepts it.
async function validateGeminiKey(apiKey) {
  try {
    const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
      model: MODEL_NAME,
    });
    await model.generateContent("Reply with the single word: OK");
    return { valid: true };
  } catch (err) {
    const e = normalizeGeminiError(err);
    if (e.apiCode === "GEMINI_KEY_INVALID") return { valid: false };
    if (e.apiCode === "GEMINI_QUOTA_EXCEEDED") return { valid: true }; // key is real, just out of quota
    throw e;
  }
}

module.exports = {
  createGeminiProvider,
  validateGeminiKey,
  normalizeGeminiError,
};
