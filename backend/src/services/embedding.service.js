const { GoogleGenerativeAI } = require("@google/generative-ai");
const { withTimeout } = require("../utils/withTimeout");
const { normalizeGeminiError } = require("./ai/gemini.service");

const MODEL_NAME = process.env.GEMINI_EMBEDDING_MODEL || "text-embedding-004";
const EMBED_TIMEOUT_MS = 20000;

function getModel(apiKey) {
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: MODEL_NAME,
  });
}

async function embedText(text, apiKey) {
  try {
    const result = await withTimeout(
      getModel(apiKey).embedContent(text),
      EMBED_TIMEOUT_MS,
      "Gemini embedding request",
    );
    return result.embedding.values;
  } catch (err) {
    throw normalizeGeminiError(err);
  }
}

async function embedBatch(texts, apiKey) {
  const model = getModel(apiKey);
  const BATCH_SIZE = 50;
  const allEmbeddings = [];

  try {
    for (let i = 0; i < texts.length; i += BATCH_SIZE) {
      const slice = texts.slice(i, i + BATCH_SIZE);
      const requests = slice.map((text) => ({
        content: { role: "user", parts: [{ text }] },
      }));
      console.log(
        `Embedding batch ${Math.floor(i / BATCH_SIZE) + 1}: ${slice.length} chunks...`,
      );
      const result = await withTimeout(
        model.batchEmbedContents({ requests }),
        EMBED_TIMEOUT_MS,
        "Gemini batch embedding request",
      );
      allEmbeddings.push(...result.embeddings.map((e) => e.values));
    }
  } catch (err) {
    throw normalizeGeminiError(err);
  }
  return allEmbeddings;
}

module.exports = { embedText, embedBatch };
