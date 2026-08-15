const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const MODEL_NAME = process.env.GEMINI_EMBEDDING_MODEL || 'text-embedding-004';

async function embedText(text) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// Embeds many chunks efficiently via Gemini's batch endpoint.
// Sub-batches of 50 keep each request well under API limits.
async function embedBatch(texts) {
  const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  const BATCH_SIZE = 50;
  const allEmbeddings = [];

  for (let i = 0; i < texts.length; i += BATCH_SIZE) {
    const slice = texts.slice(i, i + BATCH_SIZE);
    const requests = slice.map((text) => ({ content: { role: 'user', parts: [{ text }] } }));
    const result = await model.batchEmbedContents({ requests });
    allEmbeddings.push(...result.embeddings.map((e) => e.values));
  }

  return allEmbeddings;
}

module.exports = { embedText, embedBatch };